import os
import joblib
import pickle
from typing import Tuple, Any

MODEL_VERSION = "rent-classifier-v1"
ANOMALY_MODEL_VERSION = "anomaly-detector-v1"

class ModelLoader:
    _instance = None

    def __init__(self):
        self.rf_model = None
        self.tfidf_vectorizer = None
        self.if_model = None
        self.loaded = False
        self._load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelLoader()
        return cls._instance

    def _load_models(self):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        ml_dirs = [
            os.path.join(backend_dir, "ml_models"),
            os.path.join(os.path.dirname(backend_dir), "ml_models")
        ]
        
        target_dir = None
        for d in ml_dirs:
            if os.path.exists(d):
                target_dir = d
                break
                
        if not target_dir:
            target_dir = os.path.join(backend_dir, "ml_models")
            os.makedirs(target_dir, exist_ok=True)
            
        rf_path = os.path.join(target_dir, "rf_rent_classifier.joblib")
        tfidf_path = os.path.join(target_dir, "tfidf_vectorizer.joblib")
        if_path = os.path.join(target_dir, "if_anomaly_detector.joblib")
        
        # Fallbacks to .pkl if joblib missing
        if os.path.exists(rf_path):
            self.rf_model = joblib.load(rf_path)
        elif os.path.exists(os.path.join(target_dir, "rent_classifier.pkl")):
            with open(os.path.join(target_dir, "rent_classifier.pkl"), "rb") as f:
                self.rf_model = pickle.load(f)
                
        if os.path.exists(tfidf_path):
            self.tfidf_vectorizer = joblib.load(tfidf_path)
        elif os.path.exists(os.path.join(target_dir, "tfidf_vectorizer.pkl")):
            with open(os.path.join(target_dir, "tfidf_vectorizer.pkl"), "rb") as f:
                self.tfidf_vectorizer = pickle.load(f)
                
        if os.path.exists(if_path):
            self.if_model = joblib.load(if_path)
        elif os.path.exists(os.path.join(target_dir, "anomaly_detector.pkl")):
            with open(os.path.join(target_dir, "anomaly_detector.pkl"), "rb") as f:
                self.if_model = pickle.load(f)

        if self.rf_model is not None and self.tfidf_vectorizer is not None and self.if_model is not None:
            self.loaded = True

model_loader = ModelLoader.get_instance()
