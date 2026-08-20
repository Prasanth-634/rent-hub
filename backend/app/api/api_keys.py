from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import generate_api_key
from app.core.audit import log_audit_event
from app.db.models import User, APIKey
from app.schemas.billing_admin import APIKeyCreate, APIKeyResponse
from app.api.deps import get_current_user, get_user_organization

router = APIRouter(prefix="/api-keys", tags=["API Keys"])


@router.post("", response_model=APIKeyResponse)
def create_api_key(req: APIKeyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = get_user_organization(db, current_user)
    if not org:
        raise HTTPException(status_code=400, detail="User organization not found")

    prefix, full_key, secret_hash = generate_api_key()

    key_rec = APIKey(
        organization_id=org.id,
        key_prefix=prefix,
        secret_hash=secret_hash,
        status="ACTIVE",
        expires_at=datetime.utcnow() + timedelta(days=365)
    )
    db.add(key_rec)
    db.commit()
    db.refresh(key_rec)

    log_audit_event(db, action="CREATE_API_KEY", resource_type="APIKey", resource_id=key_rec.id, actor_user_id=current_user.id)

    res = APIKeyResponse.from_orm(key_rec)
    res.full_key = full_key  # Returned ONLY on initial creation
    return res


@router.get("", response_model=List[APIKeyResponse])
def list_api_keys(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = get_user_organization(db, current_user)
    if not org:
        return []
    return db.query(APIKey).filter(APIKey.organization_id == org.id).all()


@router.post("/{key_id}/rotate", response_model=APIKeyResponse)
def rotate_api_key(key_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    key_rec = db.query(APIKey).filter(APIKey.id == key_id).first()
    if not key_rec:
        raise HTTPException(status_code=404, detail="API key not found")

    prefix, full_key, secret_hash = generate_api_key()
    key_rec.key_prefix = prefix
    key_rec.secret_hash = secret_hash
    key_rec.created_at = datetime.utcnow()

    db.commit()
    db.refresh(key_rec)

    log_audit_event(db, action="ROTATE_API_KEY", resource_type="APIKey", resource_id=key_rec.id, actor_user_id=current_user.id)

    res = APIKeyResponse.from_orm(key_rec)
    res.full_key = full_key
    return res


@router.post("/{key_id}/revoke", response_model=APIKeyResponse)
def revoke_api_key(key_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    key_rec = db.query(APIKey).filter(APIKey.id == key_id).first()
    if not key_rec:
        raise HTTPException(status_code=404, detail="API key not found")

    key_rec.status = "REVOKED"
    db.commit()
    db.refresh(key_rec)

    log_audit_event(db, action="REVOKE_API_KEY", resource_type="APIKey", resource_id=key_rec.id, actor_user_id=current_user.id)
    return key_rec
