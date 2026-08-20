from typing import Optional, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token, verify_api_key_hash
from app.db.models import User, OrganizationUser, APIKey, Organization

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/landlord/login", auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> User:
    # 1. API Key Auth
    if x_api_key:
        parts = x_api_key.split(".")
        if len(parts) == 2:
            prefix = parts[0]
            api_key_rec = db.query(APIKey).filter(APIKey.key_prefix == prefix, APIKey.status == "ACTIVE").first()
            if api_key_rec and verify_api_key_hash(x_api_key, api_key_rec.secret_hash):
                org_user = db.query(OrganizationUser).filter(OrganizationUser.organization_id == api_key_rec.organization_id).first()
                if org_user:
                    user = db.query(User).filter(User.id == org_user.user_id).first()
                    if user:
                        return user

    # 2. JWT Auth
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    user_id = payload.get("sub")
    token_version = payload.get("token_version", 1)

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Validate token_version for session revocation/logout
    if getattr(user, "token_version", 1) != token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
        )

    return user


def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role == "ADMIN":
            return current_user  # ADMIN has FULL SYSTEM ACCESS
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role {current_user.role} is not permitted to access this resource",
            )
        return current_user
    return role_checker


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required. Action not permitted.",
        )
    return current_user


def get_user_organization(db: Session, user: User) -> Optional[Organization]:
    membership = db.query(OrganizationUser).filter(OrganizationUser.user_id == user.id).first()
    if membership:
        return db.query(Organization).filter(Organization.id == membership.organization_id).first()
    # Check if organization owned directly
    org = db.query(Organization).filter(Organization.owner_user_id == user.id).first()
    return org
