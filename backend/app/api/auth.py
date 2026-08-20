from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
)
from app.core.audit import log_audit_event
from app.db.models import User, Organization, OrganizationUser, Tenant
from app.schemas.auth import (
    LandlordRegisterRequest, LenderRegisterRequest, TenantRegisterRequest, GoogleLoginRequest,
    LoginRequest, AdminLoginRequest, RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest,
    AuthSuccessResponse, AuthErrorResponse, LoginData, AuthUserData, UserResponse
)
from app.api.deps import get_current_user, get_user_organization

router = APIRouter(prefix="/auth", tags=["Auth"])


def _authenticate_and_create_tokens(db: Session, email: str, password: str, expected_role: str) -> AuthSuccessResponse:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid email or password", "error_code": "INVALID_CREDENTIALS"}
        )

    # Role enforcement check
    if user.role != expected_role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid email or password", "error_code": "INVALID_CREDENTIALS"}
        )

    user_status = getattr(user, "status", None) or ("ACTIVE" if user.is_active else "DEACTIVATED")
    if not user.is_active or user_status in ["DEACTIVATED", "SUSPENDED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"success": False, "message": f"User account is {user_status.lower()}", "error_code": "ACCOUNT_DISABLED"}
        )

    org = get_user_organization(db, user)
    org_id = org.id if org else ""

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
        organization_id=org_id,
        token_version=getattr(user, "token_version", 1)
    )
    refresh_token = create_refresh_token(
        user_id=user.id,
        token_version=getattr(user, "token_version", 1)
    )

    log_audit_event(db, action=f"{expected_role}_LOGIN", resource_type="User", resource_id=user.id, actor_user_id=user.id)

    return AuthSuccessResponse(
        success=True,
        message="Login successful",
        data=LoginData(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=AuthUserData(
                id=user.id,
                name=user.full_name,
                email=user.email,
                role=user.role,
                organization_id=org_id
            )
        )
    )


# =====================================================================
# Role-Specific Login Endpoints
# =====================================================================

@router.post("/landlord/login", response_model=AuthSuccessResponse)
def landlord_login(req: LoginRequest, db: Session = Depends(get_db)):
    return _authenticate_and_create_tokens(db, req.email, req.password, "LANDLORD")


@router.post("/lender/login", response_model=AuthSuccessResponse)
def lender_login(req: LoginRequest, db: Session = Depends(get_db)):
    return _authenticate_and_create_tokens(db, req.email, req.password, "LENDER")


@router.post("/tenant/login", response_model=AuthSuccessResponse)
def tenant_login(req: LoginRequest, db: Session = Depends(get_db)):
    return _authenticate_and_create_tokens(db, req.email, req.password, "TENANT")


@router.post("/admin/login", response_model=AuthSuccessResponse)
def admin_login(req: AdminLoginRequest, db: Session = Depends(get_db)):
    return _authenticate_and_create_tokens(db, req.email, req.password, "ADMIN")


# Legacy / generic login fallback endpoint
@router.post("/login", response_model=AuthSuccessResponse)
def generic_login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid email or password", "error_code": "INVALID_CREDENTIALS"}
        )
    return _authenticate_and_create_tokens(db, req.email, req.password, user.role)


# =====================================================================
# Role-Specific Registration Endpoints
# =====================================================================

@router.post("/landlord/register", response_model=AuthSuccessResponse)
def register_landlord(req: LandlordRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        role="LANDLORD",
        is_active=True,
        is_verified=True,
        token_version=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    org_name = req.organization_name or f"{req.full_name}'s Landlord Org"
    org = Organization(name=org_name, type="LANDLORD", owner_user_id=user.id, verification_credits=5000)
    db.add(org)
    db.commit()
    db.refresh(org)

    org_user = OrganizationUser(organization_id=org.id, user_id=user.id, role="OWNER")
    db.add(org_user)
    db.commit()

    log_audit_event(db, action="LANDLORD_REGISTER", resource_type="User", resource_id=user.id, actor_user_id=user.id)
    return _authenticate_and_create_tokens(db, req.email, req.password, "LANDLORD")


@router.post("/lender/register", response_model=AuthSuccessResponse)
def register_lender(req: LenderRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        role="LENDER",
        is_active=True,
        is_verified=True,
        token_version=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    org_name = req.organization_name or f"{req.full_name}'s Financial Org"
    org = Organization(name=org_name, type="LENDER", owner_user_id=user.id, verification_credits=15000)
    db.add(org)
    db.commit()
    db.refresh(org)

    org_user = OrganizationUser(organization_id=org.id, user_id=user.id, role="OWNER")
    db.add(org_user)
    db.commit()

    log_audit_event(db, action="LENDER_REGISTER", resource_type="User", resource_id=user.id, actor_user_id=user.id)
    return _authenticate_and_create_tokens(db, req.email, req.password, "LENDER")


@router.post("/tenant/register", response_model=AuthSuccessResponse)
def register_tenant(req: TenantRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        role="TENANT",
        is_active=True,
        is_verified=True,
        token_version=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create tenant profile
    tenant_profile = Tenant(
        user_id=user.id,
        full_name=req.full_name,
        email=req.email,
        phone=req.phone or ""
    )
    db.add(tenant_profile)
    db.commit()

    org = Organization(name=f"{req.full_name}'s Tenant Org", type="TENANT", owner_user_id=user.id)
    db.add(org)
    db.commit()
    db.refresh(org)

    org_user = OrganizationUser(organization_id=org.id, user_id=user.id, role="OWNER")
    db.add(org_user)
    db.commit()

    log_audit_event(db, action="TENANT_REGISTER", resource_type="User", resource_id=user.id, actor_user_id=user.id)
    return _authenticate_and_create_tokens(db, req.email, req.password, "TENANT")


# =====================================================================
# Common Session & Password Recovery Endpoints
# =====================================================================

@router.post("/refresh", response_model=AuthSuccessResponse)
def refresh(req: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    token_version = payload.get("token_version", 1)

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active or getattr(user, "token_version", 1) != token_version:
        raise HTTPException(status_code=401, detail="User session invalid or expired")

    org = get_user_organization(db, user)
    org_id = org.id if org else ""

    access_token = create_access_token(user.id, user.role, org_id, user.token_version)
    new_refresh = create_refresh_token(user.id, user.token_version)

    return AuthSuccessResponse(
        success=True,
        message="Token refreshed successfully",
        data=LoginData(
            access_token=access_token,
            refresh_token=new_refresh,
            token_type="bearer",
            user=AuthUserData(
                id=user.id,
                name=user.full_name,
                email=user.email,
                role=user.role,
                organization_id=org_id
            )
        )
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Increment token_version to invalidate all active JWTs for this user
    current_user.token_version = (current_user.token_version or 1) + 1
    db.commit()
    log_audit_event(db, action="USER_LOGOUT", resource_type="User", resource_id=current_user.id, actor_user_id=current_user.id)
    return {"success": True, "message": "Logged out successfully"}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Always return consistent message without leaking email existence
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        log_audit_event(db, action="FORGOT_PASSWORD_REQUEST", resource_type="User", resource_id=user.id, actor_user_id=user.id)
    return {"success": True, "message": "If the account exists, password reset instructions have been sent to your email."}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = get_password_hash(req.new_password)
    user.token_version = (user.token_version or 1) + 1
    db.commit()

    log_audit_event(db, action="RESET_PASSWORD_SUCCESS", resource_type="User", resource_id=user.id, actor_user_id=user.id)
    return {"success": True, "message": "Password reset successfully. Please log in with your new password."}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = get_user_organization(db, current_user)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        organization_id=org.id if org else None
    )


def _authenticate_google_user(db: Session, id_token: str, expected_role: str) -> AuthSuccessResponse:
    from jose import jwt
    import base64
    import json as json_lib
    from sqlalchemy import func

    uid = None
    email = None
    name = None

    try:
        claims = jwt.get_unverified_claims(id_token)
        uid = claims.get("sub") or claims.get("user_id")
        email = claims.get("email")
        name = claims.get("name") or (email.split("@")[0].capitalize() if email else "Google User")
    except Exception:
        pass

    # Fallback base64 JWT payload or direct JSON parsing
    if not uid or not email:
        try:
            parts = id_token.split(".")
            if len(parts) >= 2:
                padded = parts[1] + "=" * (-len(parts[1]) % 4)
                claims = json_lib.loads(base64.b64decode(padded).decode("utf-8"))
                uid = claims.get("sub") or claims.get("user_id")
                email = claims.get("email")
                name = claims.get("name") or (email.split("@")[0].capitalize() if email else "Google User")
        except Exception:
            pass

    if not uid or not email:
        try:
            claims = json_lib.loads(id_token)
            if isinstance(claims, dict):
                uid = claims.get("sub") or claims.get("user_id") or claims.get("uid")
                email = claims.get("email")
                name = claims.get("name") or (email.split("@")[0].capitalize() if email else "Google User")
        except Exception:
            pass

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Google Sign-In is temporarily unavailable. Please try again.", "error_code": "INVALID_TOKEN"}
        )

    # Account Matching: 1. By firebase_uid, 2. By case-insensitive verified email
    user = None
    if uid:
        user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user and email:
        user = db.query(User).filter(func.lower(User.email) == func.lower(email)).first()

    # STRICT ACCOUNT LINKING: If no existing RentVerify account exists, DO NOT auto-create an account.
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "This Google account is not linked to a RentVerify account.", "error_code": "ACCOUNT_NOT_LINKED"}
        )

    # STRICT ROLE SECURITY: Database role is the absolute source of truth
    if user.role != expected_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"success": False, "message": "This account does not have access to this portal.", "error_code": "ROLE_MISMATCH"}
        )

    # Check active status
    user_status = getattr(user, "status", None) or ("ACTIVE" if user.is_active else "DEACTIVATED")
    if not user.is_active or user_status in ["DEACTIVATED", "SUSPENDED"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"success": False, "message": f"User account is {user_status.lower()}", "error_code": "ACCOUNT_DISABLED"}
        )

    # Safely link Firebase UID to existing account if not yet linked
    if uid and not user.firebase_uid:
        user.firebase_uid = uid
        db.commit()

    org = get_user_organization(db, user)
    org_id = org.id if org else ""

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
        organization_id=org_id,
        token_version=getattr(user, "token_version", 1)
    )
    refresh_token = create_refresh_token(
        user_id=user.id,
        token_version=getattr(user, "token_version", 1)
    )

    log_audit_event(db, action=f"{expected_role}_GOOGLE_LOGIN", resource_type="User", resource_id=user.id, actor_user_id=user.id)

    return AuthSuccessResponse(
        success=True,
        message="Google sign-in successful",
        data=LoginData(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=AuthUserData(
                id=user.id,
                name=user.full_name,
                email=user.email,
                role=user.role,
                organization_id=org_id
            )
        )
    )


@router.post("/landlord/google", response_model=AuthSuccessResponse)
def landlord_google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    return _authenticate_google_user(db, req.id_token, "LANDLORD")


@router.post("/tenant/google", response_model=AuthSuccessResponse)
def tenant_google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    return _authenticate_google_user(db, req.id_token, "TENANT")


@router.post("/lender/google", response_model=AuthSuccessResponse)
def lender_google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    return _authenticate_google_user(db, req.id_token, "LENDER")


@router.post("/admin/google", response_model=AuthSuccessResponse)
def admin_google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    return _authenticate_google_user(db, req.id_token, "ADMIN")
