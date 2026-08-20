from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.audit import log_audit_event
from app.db.models import User, Property
from app.schemas.tenant_property_lease import PropertyCreate, PropertyUpdate, PropertyResponse
from app.api.deps import get_current_user, get_user_organization, require_roles

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.post("", response_model=PropertyResponse)
def create_property(
    req: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LANDLORD"]))
):
    org = get_user_organization(db, current_user)
    if not org:
        raise HTTPException(status_code=400, detail="User has no associated organization")

    prop = Property(
        organization_id=org.id,
        address_line1=req.address_line1,
        city=req.city,
        state=req.state,
        postal_code=req.postal_code,
        country=req.country,
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)

    log_audit_event(db, action="CREATE_PROPERTY", resource_type="Property", resource_id=prop.id, actor_user_id=current_user.id)
    return prop


@router.get("", response_model=List[PropertyResponse])
def list_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LANDLORD"]))
):
    org = get_user_organization(db, current_user)
    if current_user.role == "ADMIN":
        return db.query(Property).all()
    if not org:
        return []
    return db.query(Property).filter(Property.organization_id == org.id).all()


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LANDLORD"]))
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    org = get_user_organization(db, current_user)
    if current_user.role != "ADMIN" and (not org or prop.organization_id != org.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own or have access to this property"
        )
    return prop


@router.patch("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    req: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LANDLORD"]))
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    org = get_user_organization(db, current_user)
    if current_user.role != "ADMIN" and (not org or prop.organization_id != org.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this property"
        )

    if req.address_line1:
        prop.address_line1 = req.address_line1
    if req.city:
        prop.city = req.city
    if req.state:
        prop.state = req.state
    if req.postal_code:
        prop.postal_code = req.postal_code
    if req.country:
        prop.country = req.country

    db.commit()
    db.refresh(prop)
    log_audit_event(db, action="UPDATE_PROPERTY", resource_type="Property", resource_id=prop.id, actor_user_id=current_user.id)
    return prop
