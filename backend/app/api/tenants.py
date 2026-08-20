from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.audit import log_audit_event
from app.db.models import User, Tenant
from app.schemas.tenant_property_lease import TenantCreate, TenantUpdate, TenantResponse
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/tenants", tags=["Tenants"])


@router.post("", response_model=TenantResponse)
def create_tenant(
    req: TenantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LANDLORD", "LENDER"]))
):
    existing_user = db.query(User).filter(User.email == req.email).first()
    tenant = Tenant(
        user_id=existing_user.id if existing_user else None,
        full_name=req.full_name,
        email=req.email,
        phone=req.phone,
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    log_audit_event(db, action="CREATE_TENANT", resource_type="Tenant", resource_id=tenant.id, actor_user_id=current_user.id)
    return tenant


@router.get("", response_model=List[TenantResponse])
def list_tenants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "TENANT":
        tenant_profile = db.query(Tenant).filter(Tenant.user_id == current_user.id).all()
        return tenant_profile
    return db.query(Tenant).all()


@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    if current_user.role == "TENANT" and tenant.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only view your own tenant profile"
        )
    return tenant


@router.patch("/{tenant_id}", response_model=TenantResponse)
def update_tenant(
    tenant_id: str,
    req: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    if current_user.role == "TENANT" and tenant.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only update your own tenant profile"
        )

    if req.full_name:
        tenant.full_name = req.full_name
    if req.email:
        tenant.email = req.email
    if req.phone is not None:
        tenant.phone = req.phone

    db.commit()
    db.refresh(tenant)
    log_audit_event(db, action="UPDATE_TENANT", resource_type="Tenant", resource_id=tenant.id, actor_user_id=current_user.id)
    return tenant
