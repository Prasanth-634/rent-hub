import pandas as pd
from typing import Dict, Any, Tuple
from app.services.ai.model_loader import model_loader, MODEL_VERSION
from app.services.ai.preprocessing import validate_and_clean_transaction
from app.services.ai.feature_engineering import extract_classifier_features

class RentClassifierService:
    def __init__(self):
        self.loader = model_loader

    def classify_transaction(self, transaction_data: Dict[str, Any]) -> Tuple[str, float]:
        cleaned = validate_and_clean_transaction(transaction_data)
        df = pd.DataFrame([cleaned])
        
        if not self.loader.loaded or self.loader.rf_model is None:
            # Safe rule-based fallback if ML model loading fails
            ratio = cleaned["amount_minor_units"] / max(cleaned["expected_rent_minor_units"], 1)
            desc_upper = (cleaned.get("description") or "").upper()
            is_rent_desc = any(w in desc_upper for w in ["RENT", "LEASE", "FLAT", "HOUSING"])
            if is_rent_desc and 0.5 <= ratio <= 1.5:
                return "RENT", 0.85
            return "NON_RENT", 0.85
            
        X = extract_classifier_features(df, self.loader.tfidf_vectorizer)
        probs = self.loader.rf_model.predict_proba(X)[0]
        
        # Class 1 is RENT
        rent_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        classification = "RENT" if rent_prob >= 0.5 else "NON_RENT"
        confidence = rent_prob if classification == "RENT" else (1.0 - rent_prob)
        return classification, float(round(confidence, 4))

rent_classifier_service = RentClassifierService()
