import re
from datetime import datetime
from typing import Dict, Any, Tuple

def validate_and_clean_transaction(data: Dict[str, Any]) -> Dict[str, Any]:
    cleaned = dict(data)
    
    # Clean description
    desc = str(cleaned.get("description") or "").strip()
    cleaned["description"] = desc
    
    # Parse amount
    amt_raw = cleaned.get("amount_minor_units")
    if amt_raw is None:
        amt_float = float(cleaned.get("amount") or 0.0)
        cleaned["amount_minor_units"] = int(round(amt_float * 100))
    else:
        cleaned["amount_minor_units"] = int(amt_raw)
        
    # Expected rent
    exp_raw = cleaned.get("expected_rent_minor_units")
    if exp_raw is None:
        exp_float = float(cleaned.get("expected_rent") or 25000)
        cleaned["expected_rent_minor_units"] = int(round(exp_float * 100))
    else:
        cleaned["expected_rent_minor_units"] = int(exp_raw)
        
    # Process dates
    tx_date = cleaned.get("transaction_date")
    if isinstance(tx_date, str) and tx_date:
        try:
            dt = datetime.fromisoformat(tx_date.replace("Z", "+00:00"))
        except Exception:
            dt = datetime.utcnow()
    elif isinstance(tx_date, datetime):
        dt = tx_date
    else:
        dt = datetime.utcnow()
        
    cleaned["transaction_datetime"] = dt
    cleaned["day_of_month"] = dt.day
    cleaned["month"] = dt.month
    
    due_day = int(cleaned.get("due_day") or 1)
    days_late = dt.day - due_day if dt.day >= due_day else dt.day + 30 - due_day
    cleaned["days_from_due_date"] = days_late
    
    return cleaned
