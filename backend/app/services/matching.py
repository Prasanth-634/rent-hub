from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.db.models import Transaction, Lease, VerificationResult


def process_payment_matching(
    lease: Lease,
    period_start: datetime,
    period_end: datetime,
    transactions: List[Transaction]
) -> Dict[str, Any]:
    expected_rent = lease.monthly_rent_minor_units
    due_day = lease.due_day
    grace_days = 5

    # 1. Determine target expected months
    current_dt = datetime(period_start.year, period_start.month, 1)
    end_dt = datetime(period_end.year, period_end.month, 1)
    
    expected_months = []
    while current_dt <= end_dt:
        expected_months.append((current_dt.year, current_dt.month))
        # Add 1 month
        if current_dt.month == 12:
            current_dt = datetime(current_dt.year + 1, 1, 1)
        else:
            current_dt = datetime(current_dt.year, current_dt.month + 1, 1)

    months_expected = len(expected_months)
    
    # 2. Filter transactions predicted or marked as RENT
    rent_txs = [t for t in transactions if t.is_rent_predicted]

    # Map transactions to target months
    monthly_txs: Dict[tuple, List[Transaction]] = {m: [] for m in expected_months}
    
    for tx in rent_txs:
        t_date = tx.transaction_date
        key = (t_date.year, t_date.month)
        if key in monthly_txs:
            monthly_txs[key].append(tx)

    on_time_count = 0
    late_count = 0
    partial_count = 0
    missed_count = 0
    duplicate_count = 0
    months_matched = 0

    monthly_analysis = []
    anomaly_detected_count = 0

    for (year, month) in expected_months:
        tx_list = monthly_txs[(year, month)]
        due_date = datetime(year, month, min(due_day, 28))
        
        if not tx_list:
            missed_count += 1
            monthly_analysis.append({
                "period": f"{year}-{month:02d}",
                "status": "MISSED",
                "paid_amount_minor_units": 0,
                "expected_amount_minor_units": expected_rent,
                "notes": "No rent payment detected in period"
            })
            continue

        months_matched += 1
        total_paid = sum(t.amount_minor_units for t in tx_list)
        
        if len(tx_list) > 1:
            duplicate_count += (len(tx_list) - 1)

        # Check anomalies
        for t in tx_list:
            if t.anomaly_flag:
                anomaly_detected_count += 1

        # Evaluate timing
        earliest_tx_date = min(t.transaction_date for t in tx_list)
        days_late = (earliest_tx_date - due_date).days

        if total_paid < expected_rent:
            partial_count += 1
            month_status = "PARTIAL"
        elif days_late > grace_days:
            late_count += 1
            month_status = "LATE"
        else:
            on_time_count += 1
            month_status = "PAID"

        monthly_analysis.append({
            "period": f"{year}-{month:02d}",
            "status": month_status,
            "paid_amount_minor_units": total_paid,
            "expected_amount_minor_units": expected_rent,
            "days_late": max(0, days_late),
            "transactions_count": len(tx_list)
        })

    # Confidence calculation algorithm
    if months_expected == 0:
        confidence = 0.0
    else:
        success_ratio = (on_time_count + (late_count * 0.8) + (partial_count * 0.5)) / float(months_expected)
        confidence = round(min(1.0, max(0.0, success_ratio)), 2)

    # Determine status
    if confidence < 0.70 or anomaly_detected_count > 0 or missed_count > (months_expected / 2):
        final_status = "REQUIRES_REVIEW"
    elif confidence >= 0.85 and missed_count == 0:
        final_status = "VERIFIED"
    else:
        final_status = "REQUIRES_REVIEW"

    return {
        "months_expected": months_expected,
        "months_matched": months_matched,
        "on_time_count": on_time_count,
        "late_count": late_count,
        "partial_count": partial_count,
        "missed_count": missed_count,
        "duplicate_count": duplicate_count,
        "confidence_level": confidence,
        "status": final_status,
        "explanation": {
            "monthly_analysis": monthly_analysis,
            "anomalies_flagged": anomaly_detected_count,
            "algorithm_version": "v1.0.0-rules-engine"
        }
    }
