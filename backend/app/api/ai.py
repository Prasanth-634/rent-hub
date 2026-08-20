import time
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.db.models import User, VerificationRequest, Transaction, AITransactionResult, Consent, OrganizationUser
from app.schemas.ai import (
    AnalyzeTransactionRequest, AnalyzeTransactionResponse,
    AnalyzeVerificationRequest, AnalyzeVerificationResponse,
    VerificationAIResultsResponse, AITransactionResultDetail
)
from app.services.ai.rent_classifier import rent_classifier_service
from app.services.ai.anomaly_detector import anomaly_detector_service
from app.services.ai.model_loader import MODEL_VERSION, ANOMALY_MODEL_VERSION
from app.ml.engine import ml_engine

router = APIRouter(prefix="/ai", tags=["AI / ML Engine"])


@router.post("/analyze-transaction", response_model=AnalyzeTransactionResponse)
def analyze_transaction(
    req: AnalyzeTransactionRequest,
    current_user: User = Depends(get_current_user)
):
    tx_payload = {
        "transaction_id": req.transaction_id,
        "description": req.description,
        "amount_minor_units": req.amount_minor_units,
        "expected_rent_minor_units": req.expected_rent_minor_units,
        "day_of_month": req.day_of_month,
        "due_day": req.due_day,
        "payer": req.payer,
        "payee": req.payee,
        "transaction_date": req.transaction_date
    }
    
    try:
        classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
        is_anomaly, anomaly_score, review_reason = anomaly_detector_service.detect_anomaly(tx_payload)
    except Exception as e:
        classification = "NON_RENT"
        confidence = 0.0
        is_anomaly = True
        anomaly_score = 1.0
        review_reason = "AI analysis could not be completed. The verification requires review."

    return AnalyzeTransactionResponse(
        transaction_id=req.transaction_id,
        classification=classification,
        confidence_score=confidence,
        is_anomaly=is_anomaly,
        anomaly_score=anomaly_score,
        review_reason=review_reason,
        model_version=MODEL_VERSION,
        anomaly_model_version=ANOMALY_MODEL_VERSION
    )


@router.post("/classify-transaction")
def classify_transaction_legacy(
    req: AnalyzeTransactionRequest,
    current_user: User = Depends(get_current_user)
):
    # Backward compatibility endpoint
    is_rent, proba = ml_engine.predict_rent_classification(
        amount_minor_units=req.amount_minor_units,
        expected_rent_minor_units=req.expected_rent_minor_units,
        day_of_month=req.day_of_month or 1,
        due_day=req.due_day or 1,
        description=req.description or "",
        payee=req.payee or ""
    )
    return {
        "is_rent": is_rent,
        "confidence": round(proba, 4),
        "classification": "RENT" if is_rent else "NON_RENT",
        "model_version": MODEL_VERSION
    }


@router.post("/detect-anomaly")
def detect_anomaly_legacy(
    req: AnalyzeTransactionRequest,
    current_user: User = Depends(get_current_user)
):
    # Backward compatibility endpoint
    is_anomaly, anomaly_score, review_reason = ml_engine.predict_anomaly(
        amount_ratio=req.amount_minor_units / max(req.expected_rent_minor_units, 1),
        payment_interval_days=30,
        monthly_payment_count=1,
        days_late=abs((req.day_of_month or 1) - (req.due_day or 1)),
        amount_deviation=abs((req.amount_minor_units / max(req.expected_rent_minor_units, 1)) - 1.0),
        amount_minor_units=req.amount_minor_units,
        expected_rent_minor_units=req.expected_rent_minor_units
    )
    return {
        "anomaly_flag": is_anomaly,
        "is_anomaly": is_anomaly,
        "anomaly_score": round(anomaly_score, 4),
        "review_reason": review_reason,
        "model_version": ANOMALY_MODEL_VERSION
    }


@router.post("/analyze-verification", response_model=AnalyzeVerificationResponse)
def analyze_verification(
    req: AnalyzeVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verification = db.query(VerificationRequest).filter(VerificationRequest.id == req.verification_id).first()
    if not verification:
        raise HTTPException(status_code=404, detail="Verification request not found")

    transactions = db.query(Transaction).filter(Transaction.verification_id == verification.id).all()
    
    results = []
    rent_count = 0
    non_rent_count = 0
    anomalies_count = 0
    confidence_sum = 0.0

    for tx in transactions:
        ai_res = db.query(AITransactionResult).filter(AITransactionResult.transaction_id == tx.id).first()
        if not ai_res:
            tx_payload = {
                "transaction_id": tx.external_transaction_id or tx.id,
                "description": tx.description or "",
                "amount_minor_units": tx.amount_minor_units,
                "expected_rent_minor_units": verification.lease.monthly_rent_minor_units if verification.lease else 2500000,
                "day_of_month": tx.transaction_date.day,
                "due_day": verification.lease.due_day if verification.lease else 1,
                "payer": tx.payer or "",
                "payee": tx.payee or "",
                "transaction_date": tx.transaction_date.isoformat()
            }
            try:
                classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
                is_anomaly, anomaly_score, review_reason = anomaly_detector_service.detect_anomaly(tx_payload)
            except Exception:
                classification = "NON_RENT"
                confidence = 0.0
                is_anomaly = True
                anomaly_score = 1.0
                review_reason = "AI analysis could not be completed. The verification requires review."
                
            ai_res = AITransactionResult(
                transaction_id=tx.id,
                verification_id=verification.id,
                classification=classification,
                classification_confidence=confidence,
                is_anomaly=is_anomaly,
                anomaly_score=anomaly_score,
                review_reason=review_reason,
                model_version=MODEL_VERSION,
                anomaly_model_version=ANOMALY_MODEL_VERSION
            )
            db.add(ai_res)
            db.commit()
            db.refresh(ai_res)

        if ai_res.classification == "RENT":
            rent_count += 1
        else:
            non_rent_count += 1
            
        if ai_res.is_anomaly:
            anomalies_count += 1
            
        confidence_sum += ai_res.classification_confidence

        results.append(AnalyzeTransactionResponse(
            transaction_id=tx.external_transaction_id or tx.id,
            classification=ai_res.classification,
            confidence_score=ai_res.classification_confidence,
            is_anomaly=ai_res.is_anomaly,
            anomaly_score=ai_res.anomaly_score,
            review_reason=ai_res.review_reason,
            model_version=ai_res.model_version,
            anomaly_model_version=ai_res.anomaly_model_version
        ))

    total = len(transactions)
    overall_confidence = float(round(confidence_sum / max(total, 1), 4)) if total > 0 else 0.0
    
    if total == 0:
        v_status = "PENDING"
        rec = "No transactions available to process."
    elif anomalies_count > 0 or rent_count == 0:
        v_status = "REVIEW"
        rec = "An unusual rental transaction was detected and requires review."
    else:
        v_status = "VERIFIED"
        rec = f"All {rent_count} rent transactions consistently match expected lease pattern."

    return AnalyzeVerificationResponse(
        verification_id=verification.id,
        total_transactions=total,
        rent_transactions_count=rent_count,
        non_rent_transactions_count=non_rent_count,
        anomalies_count=anomalies_count,
        overall_confidence=overall_confidence,
        verification_status=v_status,
        review_recommendation=rec,
        results=results
    )
