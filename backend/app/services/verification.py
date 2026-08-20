import io
import logging
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.db.models import Organization, CreditTransaction, VerificationRequest, Transaction, VerificationResult, Lease, AITransactionResult
from app.services.ai.rent_classifier import rent_classifier_service
from app.services.ai.anomaly_detector import anomaly_detector_service
from app.services.ai.model_loader import MODEL_VERSION, ANOMALY_MODEL_VERSION
from app.services.matching import process_payment_matching

logger = logging.getLogger("rentverify.ai")
MAX_CSV_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit


def parse_and_process_csv_transactions(
    db: Session,
    verification: VerificationRequest,
    csv_content: bytes
) -> Tuple[List[Transaction], Dict[str, Any]]:
    # Section 13 Credit Consumption Rule Check
    org = verification.requester_organization if hasattr(verification, 'requester_organization') and verification.requester_organization else db.query(Organization).filter(Organization.id == verification.requester_organization_id).first()
    if org and (org.verification_credits or 0) <= 0:
        raise HTTPException(
            status_code=402,
            detail="Insufficient verification credits. Please purchase verification credits to process requests."
        )

    if len(csv_content) > MAX_CSV_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="CSV file exceeds maximum allowed size of 10 MB")

    try:
        df = pd.read_csv(io.BytesIO(csv_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file format: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file contains no data rows")

    id_col = next((c for c in df.columns if "TRANSACTION_ID" in c.upper() or "TX_ID" in c.upper() or "EXTERNAL_ID" in c.upper() or c.upper() == "ID"), None)
    date_col = next((c for c in df.columns if "DATE" in c.upper()), None)
    amount_col = next((c for c in df.columns if "AMOUNT" in c.upper() or "VALUE" in c.upper() or "DEBIT" in c.upper() or "CREDIT" in c.upper()), None)
    desc_col = next((c for c in df.columns if "DESC" in c.upper() or "NARRATIVE" in c.upper() or "REMARKS" in c.upper() or "DETAILS" in c.upper()), None)
    payer_col = next((c for c in df.columns if "PAYER" in c.upper() or "FROM" in c.upper()), None)
    payee_col = next((c for c in df.columns if "PAYEE" in c.upper() or "TO" in c.upper()), None)

    if not date_col or not amount_col:
        raise HTTPException(
            status_code=400,
            detail="CSV contains invalid columns. Required columns: transaction_id, date, amount, description, payer, payee."
        )

    lease: Lease = db.query(Lease).filter(Lease.id == verification.lease_id).first()
    expected_rent = lease.monthly_rent_minor_units if lease else 2500000

    existing_tx_ids = set(
        t.external_transaction_id for t in db.query(Transaction).filter(Transaction.verification_id == verification.id).all()
        if t.external_transaction_id
    )

    transactions = []
    seen_ids_in_csv = set()

    total_rows = len(df)
    valid_rows = 0
    invalid_rows = 0
    duplicate_rows = 0
    errors = []

    for idx, row in df.iterrows():
        row_num = idx + 2

        raw_id = str(row[id_col]).strip() if id_col and pd.notna(row[id_col]) else None
        if raw_id and (raw_id in seen_ids_in_csv or raw_id in existing_tx_ids):
            duplicate_rows += 1
            errors.append({"row": row_num, "reason": f"Duplicate transaction ID: {raw_id}"})
            continue

        date_val = str(row[date_col]).strip() if date_col and pd.notna(row[date_col]) else ""
        if not date_val:
            invalid_rows += 1
            errors.append({"row": row_num, "reason": "Missing required date value"})
            continue

        try:
            tx_date = pd.to_datetime(date_val).to_pydatetime()
        except Exception:
            invalid_rows += 1
            errors.append({"row": row_num, "reason": f"Invalid date format: '{date_val}'"})
            continue

        amt_raw = str(row[amount_col]).replace(",", "").strip() if amount_col and pd.notna(row[amount_col]) else ""
        try:
            amt_float = float(amt_raw)
            amount_minor_units = int(abs(amt_float) * 100)
            if amount_minor_units <= 0:
                invalid_rows += 1
                errors.append({"row": row_num, "reason": "Amount must be greater than zero"})
                continue
        except Exception:
            invalid_rows += 1
            errors.append({"row": row_num, "reason": f"Invalid amount format: '{amt_raw}'"})
            continue

        desc = str(row[desc_col]).strip() if desc_col and pd.notna(row[desc_col]) else ""
        payer = str(row[payer_col]).strip() if payer_col and pd.notna(row[payer_col]) else ""
        payee = str(row[payee_col]).strip() if payee_col and pd.notna(row[payee_col]) else ""

        tx_external_id = raw_id or f"tx_{int(tx_date.timestamp())}_{idx}"
        seen_ids_in_csv.add(tx_external_id)

        # AI Workflow: Processing with Scikit-Learn RandomForest Classifier & IsolationForest Anomaly Detector
        tx_payload = {
            "transaction_id": tx_external_id,
            "description": desc,
            "payer": payer,
            "payee": payee,
            "amount_minor_units": amount_minor_units,
            "expected_rent_minor_units": expected_rent,
            "transaction_date": tx_date,
            "due_day": lease.due_day if lease else 1
        }

        try:
            classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
            is_anomaly, anomaly_score, review_reason = anomaly_detector_service.detect_anomaly(tx_payload)
        except Exception as e:
            logger.error(f"AI Processing Failed for transaction {tx_external_id}: {str(e)}")
            classification = "NON_RENT"
            confidence = 0.0
            is_anomaly = True
            anomaly_score = 1.0
            review_reason = "AI analysis could not be completed. The verification requires review."

        is_rent = (classification == "RENT")

        tx = Transaction(
            verification_id=verification.id,
            external_transaction_id=tx_external_id,
            transaction_date=tx_date,
            amount_minor_units=amount_minor_units,
            currency="INR",
            description=desc,
            payer=payer,
            payee=payee,
            is_rent_predicted=is_rent,
            rent_probability=confidence,
            anomaly_score=anomaly_score,
            anomaly_flag=is_anomaly,
        )
        db.add(tx)
        db.flush()

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
        transactions.append(tx)
        valid_rows += 1

    db.commit()
    for tx in transactions:
        db.refresh(tx)

    report_stats = {
        "total_rows": total_rows,
        "valid_rows": valid_rows,
        "invalid_rows": invalid_rows,
        "duplicate_rows": duplicate_rows,
        "errors": errors
    }

    return transactions, report_stats


def execute_verification_pipeline(db: Session, verification_id: str):
    verification: VerificationRequest = db.query(VerificationRequest).filter(VerificationRequest.id == verification_id).first()
    if not verification:
        return None

    lease: Lease = db.query(Lease).filter(Lease.id == verification.lease_id).first()
    transactions = db.query(Transaction).filter(Transaction.verification_id == verification.id).all()

    analysis = process_payment_matching(
        lease=lease,
        period_start=verification.period_start,
        period_end=verification.period_end,
        transactions=transactions
    )

    existing_result = db.query(VerificationResult).filter(VerificationResult.verification_id == verification.id).first()
    if existing_result:
        result = existing_result
        result.months_expected = analysis["months_expected"]
        result.months_matched = analysis["months_matched"]
        result.on_time_count = analysis["on_time_count"]
        result.late_count = analysis["late_count"]
        result.partial_count = analysis["partial_count"]
        result.missed_count = analysis["missed_count"]
        result.duplicate_count = analysis["duplicate_count"]
        result.confidence_level = analysis["confidence_level"]
        result.status = analysis["status"]
        result.explanation_json = analysis["explanation"]
        result.finalized_at = datetime.utcnow()
    else:
        result = VerificationResult(
            verification_id=verification.id,
            months_expected=analysis["months_expected"],
            months_matched=analysis["months_matched"],
            on_time_count=analysis["on_time_count"],
            late_count=analysis["late_count"],
            partial_count=analysis["partial_count"],
            missed_count=analysis["missed_count"],
            duplicate_count=analysis["duplicate_count"],
            confidence_level=analysis["confidence_level"],
            status=analysis["status"],
            explanation_json=analysis["explanation"],
            finalized_at=datetime.utcnow()
        )
        db.add(result)

    verification.status = analysis["status"]
    verification.completed_at = datetime.utcnow()

    # Deduct 1 verification credit upon successful processing
    org = verification.requester_organization if hasattr(verification, 'requester_organization') and verification.requester_organization else db.query(Organization).filter(Organization.id == verification.requester_organization_id).first()
    if org and (org.verification_credits or 0) > 0:
        org.verification_credits = org.verification_credits - 1
        credit_tx = CreditTransaction(
            organization_id=org.id,
            type="USAGE",
            amount=-1,
            balance_after=org.verification_credits,
            reference_id=verification.id,
            description=f"Rental verification - RV-{verification.external_id}",
            created_at=datetime.utcnow()
        )
        db.add(credit_tx)

    db.commit()
    db.refresh(result)
    db.refresh(verification)
    return result
