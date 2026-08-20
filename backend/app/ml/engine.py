import os
from typing import Dict, Any, Tuple
from app.services.ai.rent_classifier import rent_classifier_service
from app.services.ai.anomaly_detector import anomaly_detector_service
from app.services.ai.model_loader import model_loader, MODEL_VERSION, ANOMALY_MODEL_VERSION

class MLEngine:
    def __init__(self):
        self.version = MODEL_VERSION
        self.anomaly_version = ANOMALY_MODEL_VERSION
        self.loader = model_loader

    def predict_rent_classification(
        self,
        amount_minor_units: int,
        expected_rent_minor_units: int,
        day_of_month: int,
        due_day: int,
        description: str,
        payee: str
    ) -> Tuple[bool, float]:
        tx_data = {
            "amount_minor_units": amount_minor_units,
            "expected_rent_minor_units": expected_rent_minor_units,
            "day_of_month": day_of_month,
            "due_day": due_day,
            "description": description,
            "payee": payee
        }
        classification, confidence = rent_classifier_service.classify_transaction(tx_data)
        is_rent = (classification == "RENT")
        return is_rent, confidence

    def predict_anomaly(
        self,
        amount_ratio: float,
        payment_interval_days: int,
        monthly_payment_count: int,
        days_late: int,
        amount_deviation: float,
        amount_minor_units: int = 2500000,
        expected_rent_minor_units: int = 2500000
    ) -> Tuple[bool, float, str]:
        tx_data = {
            "amount_minor_units": int(round(amount_ratio * expected_rent_minor_units)),
            "expected_rent_minor_units": expected_rent_minor_units,
            "days_from_due_date": days_late,
            "days_between_rent_payments": payment_interval_days,
            "payment_frequency": monthly_payment_count,
        }
        is_anomaly, anomaly_score, review_reason = anomaly_detector_service.detect_anomaly(tx_data)
        return is_anomaly, anomaly_score, review_reason

ml_engine = MLEngine()
