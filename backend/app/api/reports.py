import json
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import User, VerificationRequest, VerificationResult, Tenant, Lease, Property
from app.api.deps import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/{verification_id}")
def get_report_json(verification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verification = db.query(VerificationRequest).filter(VerificationRequest.id == verification_id).first()
    if not verification:
        raise HTTPException(status_code=404, detail="Verification request not found")

    result = db.query(VerificationResult).filter(VerificationResult.verification_id == verification.id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Verification report result has not been generated")

    tenant = db.query(Tenant).filter(Tenant.id == verification.tenant_id).first()
    lease = db.query(Lease).filter(Lease.id == verification.lease_id).first()
    prop = db.query(Property).filter(Property.id == lease.property_id).first() if lease else None

    return {
        "report_id": f"REP-{verification.external_id[:8].upper()}",
        "verification_id": verification.id,
        "status": result.status,
        "confidence_score": result.confidence_level,
        "tenant": {
            "name": tenant.full_name if tenant else "N/A",
            "email": tenant.email if tenant else "N/A"
        },
        "property": {
            "address": prop.address_line1 if prop else "N/A",
            "city": prop.city if prop else "N/A",
            "monthly_rent": lease.monthly_rent_minor_units / 100.0 if lease else 0.0,
            "currency": lease.currency if lease else "INR"
        },
        "verification_summary": {
            "months_expected": result.months_expected,
            "months_matched": result.months_matched,
            "on_time_count": result.on_time_count,
            "late_count": result.late_count,
            "partial_count": result.partial_count,
            "missed_count": result.missed_count,
            "duplicate_count": result.duplicate_count
        },
        "monthly_analysis": result.explanation_json,
        "finalized_at": result.finalized_at.isoformat()
    }


@router.get("/{verification_id}/download")
def download_report(verification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report_data = get_report_json(verification_id, db, current_user)
    formatted_json = json.dumps(report_data, indent=2)
    return Response(
        content=formatted_json,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=rent_verification_report_{verification_id[:8]}.json"}
    )
