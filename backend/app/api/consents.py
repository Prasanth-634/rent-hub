from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.audit import log_audit_event
from app.db.models import User, Consent, VerificationRequest
from app.schemas.verification import ConsentAction, ConsentResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/consents", tags=["Consents"])


@router.post("/{consent_id}/approve", response_model=ConsentResponse)
def approve_consent(consent_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    consent = db.query(Consent).filter(Consent.id == consent_id).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent request not found")

    consent.status = "APPROVED"
    consent.granted_at = datetime.utcnow()

    verification = db.query(VerificationRequest).filter(VerificationRequest.id == consent.verification_id).first()
    if verification:
        verification.status = "UPLOAD_PENDING"

    db.commit()
    db.refresh(consent)

    log_audit_event(db, action="APPROVE_CONSENT", resource_type="Consent", resource_id=consent.id, actor_user_id=current_user.id)
    return consent


@router.post("/{consent_id}/reject", response_model=ConsentResponse)
def reject_consent(consent_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    consent = db.query(Consent).filter(Consent.id == consent_id).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent request not found")

    consent.status = "REJECTED"

    verification = db.query(VerificationRequest).filter(VerificationRequest.id == consent.verification_id).first()
    if verification:
        verification.status = "REJECTED"

    db.commit()
    db.refresh(consent)

    log_audit_event(db, action="REJECT_CONSENT", resource_type="Consent", resource_id=consent.id, actor_user_id=current_user.id)
    return consent


@router.post("/{consent_id}/revoke", response_model=ConsentResponse)
def revoke_consent(consent_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    consent = db.query(Consent).filter(Consent.id == consent_id).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent request not found")

    consent.status = "REVOKED"
    consent.revoked_at = datetime.utcnow()

    verification = db.query(VerificationRequest).filter(VerificationRequest.id == consent.verification_id).first()
    if verification:
        verification.status = "REJECTED"

    db.commit()
    db.refresh(consent)

    log_audit_event(db, action="REVOKE_CONSENT", resource_type="Consent", resource_id=consent.id, actor_user_id=current_user.id)
    return consent
