from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.audit import log_audit_event
from app.db.models import User, Lease, Property, Tenant
from app.schemas.tenant_property_lease import LeaseCreate, LeaseUpdate, LeaseResponse
from app.api.deps import get_current_user, get_user_organization, require_roles

router = APIRouter(prefix="/leases", tags=["Leases"])


@router.post("", response_model=LeaseResponse)
def create_lease(
    req: LeaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LANDLORD"]))
):
    prop = db.query(Property).filter(Property.id == req.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    org = get_user_organization(db, current_user)
    if current_user.role != "ADMIN" and (not org or prop.organization_id != org.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot create lease for property belonging to another organization"
        )

    tenant = db.query(Tenant).filter(Tenant.id == req.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    lease = Lease(
        property_id=req.property_id,
        tenant_id=req.tenant_id,
        monthly_rent_minor_units=req.monthly_rent_minor_units,
        currency=req.currency,
        due_day=req.due_day,
        start_date=req.start_date,
        end_date=req.end_date,
        status="ACTIVE"
    )
    db.add(lease)
    db.commit()
    db.refresh(lease)

    log_audit_event(db, action="CREATE_LEASE", resource_type="Lease", resource_id=lease.id, actor_user_id=current_user.id)
    return lease


@router.get("/{lease_id}", response_model=LeaseResponse)
def get_lease(
    lease_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    # Access control: LANDLORD must own property; TENANT must be the lease tenant; LENDER must have verification access; ADMIN has full access
    if current_user.role == "LANDLORD":
        prop = db.query(Property).filter(Property.id == lease.property_id).first()
        org = get_user_organization(db, current_user)
        if not prop or not org or prop.organization_id != org.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this lease")
    elif current_user.role == "TENANT":
        tenant_profile = db.query(Tenant).filter(Tenant.user_id == current_user.id).first()
        if not tenant_profile or lease.tenant_id != tenant_profile.id:
            raise HTTPException(status_code=403, detail="Forbidden: You can only view your own lease")

    return lease


@router.patch("/{lease_id}", response_model=LeaseResponse)
def update_lease(
    lease_id: str,
    req: LeaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LANDLORD"]))
):
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    prop = db.query(Property).filter(Property.id == lease.property_id).first()
    org = get_user_organization(db, current_user)
    if current_user.role != "ADMIN" and (not prop or not org or prop.organization_id != org.id):
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this lease")

    if req.monthly_rent_minor_units is not None:
        lease.monthly_rent_minor_units = req.monthly_rent_minor_units
    if req.currency:
        lease.currency = req.currency
    if req.due_day is not None:
        lease.due_day = req.due_day
    if req.start_date:
        lease.start_date = req.start_date
    if req.end_date:
        lease.end_date = req.end_date
    if req.status:
        lease.status = req.status

    db.commit()
    db.refresh(lease)
    log_audit_event(db, action="UPDATE_LEASE", resource_type="Lease", resource_id=lease.id, actor_user_id=current_user.id)
    return lease
