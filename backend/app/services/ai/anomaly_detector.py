import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.services.ai.model_loader import model_loader, ANOMALY_MODEL_VERSION
from app.services.ai.preprocessing import validate_and_clean_transaction
from app.services.ai.feature_engineering import extract_anomaly_features

class AnomalyDetectorService:
    def __init__(self):
        self.loader = model_loader

    def generate_review_reason(self, ratio: float, days_late: float, is_anomaly: bool) -> str:
        if not is_anomaly:
            return "Transaction pattern aligns with normal rental payment benchmarks."
            
        reasons = []
        if ratio >= 1.8:
            reasons.append("Payment amount is significantly higher than the expected monthly rent.")
        elif ratio <= 0.4:
            reasons.append("Payment amount is significantly lower than the expected monthly rent.")
        elif ratio != 1.0 and abs(ratio - 1.0) > 0.3:
            reasons.append("Payment amount differs noticeably from expected lease rent.")
            
        if days_late > 7:
            reasons.append("Payment timing is unusually delayed compared to expected due date.")
            
        if not reasons:
            reasons.append("Payment pattern deviates from historical baseline. Review recommended.")
            
        return " ".join(reasons)

    def detect_anomaly(self, transaction_data: Dict[str, Any]) -> Tuple[bool, float, str]:
        cleaned = validate_and_clean_transaction(transaction_data)
        df = pd.DataFrame([cleaned])
        
        amt = cleaned["amount_minor_units"]
        exp = cleaned["expected_rent_minor_units"]
        ratio = amt / max(exp, 1)
        days_late = float(cleaned.get("days_from_due_date", 0))
        
        if not self.loader.loaded or self.loader.if_model is None:
            # Rule-based fallback if ML model fails
            is_anom = (ratio > 1.8 or ratio < 0.4 or days_late > 15)
            score = 0.85 if is_anom else 0.10
            reason = self.generate_review_reason(ratio, days_late, is_anom)
            return is_anom, score, reason
            
        X_df = extract_anomaly_features(df)
        pred = int(self.loader.if_model.predict(X_df)[0])
        decision_score = float(self.loader.if_model.decision_function(X_df)[0])
        
        is_anomaly = (pred == -1) or (ratio >= 2.0 or ratio <= 0.3)
        # Normalize score into range 0.0 (normal) to 1.0 (anomalous)
        normalized_score = float(np.clip((0.5 - decision_score), 0.0, 1.0))
        
        reason = self.generate_review_reason(ratio, days_late, is_anomaly)
        return is_anomaly, float(round(normalized_score, 4)), reason

anomaly_detector_service = AnomalyDetectorService()
