import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from typing import Dict, Any, List

RENT_KEYWORDS = ["RENT", "LEASE", "APARTMENT", "HOUSING", "MONTHLY RENT", "FLAT", "LANDLORD", "TENANT", "PG", "ACCOMMODATION"]
PAYEE_KEYWORDS = ["LANDLORD", "REALTY", "HOUSING", "ESTATE", "PROPERTY", "OWNER", "ASSOCIATION"]

def compute_heuristic_scores(desc: str, payee: str) -> Dict[str, float]:
    desc_upper = (desc or "").upper()
    payee_upper = (payee or "").upper()
    
    kw_score = 1.0 if any(kw in desc_upper for kw in RENT_KEYWORDS) else 0.1
    payee_score = 0.9 if any(kw in payee_upper for kw in PAYEE_KEYWORDS) else 0.3
    return {"kw_score": kw_score, "payee_score": payee_score}

def extract_classifier_features(df: pd.DataFrame, vectorizer) -> csr_matrix:
    descriptions = df["description"].fillna("").astype(str)
    tfidf_mat = vectorizer.transform(descriptions)
    
    num_rows = []
    for idx, row in df.iterrows():
        amt = float(row.get("amount_minor_units", 0))
        exp = float(row.get("expected_rent_minor_units", 2500000))
        ratio = amt / max(exp, 1.0)
        day_m = float(row.get("day_of_month", 1))
        month = float(row.get("month", 1))
        days_from_due = float(row.get("days_from_due_date", 0))
        
        scores = compute_heuristic_scores(row.get("description", ""), row.get("payee", ""))
        rec_score = row.get("recurring_pattern_score", 0.9 if 0.8 <= ratio <= 1.2 else 0.2)
        payee_match = row.get("payee_match_score", scores["payee_score"])
        amount_diff = abs(amt - exp)
        
        num_rows.append([
            amt, ratio, day_m, month, days_from_due, rec_score, payee_match, amount_diff
        ])
        
    num_mat = np.array(num_rows, dtype=np.float64)
    X = hstack([csr_matrix(num_mat), tfidf_mat]).tocsr()
    return X

def extract_anomaly_features(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for idx, row in df.iterrows():
        amt = float(row.get("amount_minor_units", 2500000))
        exp = float(row.get("expected_rent_minor_units", 2500000))
        diff = abs(amt - exp)
        ratio = amt / max(exp, 1.0)
        interval = float(row.get("days_between_rent_payments", 30))
        freq = float(row.get("payment_frequency", 1))
        hist_avg = float(row.get("historical_average_payment", exp))
        hist_std = float(row.get("historical_std_dev", exp * 0.02))
        days_late = float(row.get("days_from_due_date", 0))
        unusual_flag = 1.0 if (ratio > 1.8 or ratio < 0.4) else 0.0
        duplicate_flag = float(row.get("duplicate_transaction_indicator", 0))
        
        rows.append({
            "transaction_amount": amt,
            "difference_from_expected_rent": diff,
            "amount_ratio": ratio,
            "days_between_rent_payments": interval,
            "payment_frequency": freq,
            "historical_average_payment": hist_avg,
            "historical_std_dev": hist_std,
            "late_payment_pattern": days_late,
            "unusually_large_small_flag": unusual_flag,
            "duplicate_transaction_indicator": duplicate_flag
        })
    return pd.DataFrame(rows)
