import os
import joblib
import json
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

def main():
    print("--- Evaluating Trained AI Models ---")
    ml_dir = os.path.join('c:\\Users\\kbpra\\.gemini\\antigravity-ide\\brain\\4e6a1952-976c-4c0f-9556-8cdada873742\\rent hub\\backend', "ml_models")
    
    rf_path = os.path.join(ml_dir, "rf_rent_classifier.joblib")
    tfidf_path = os.path.join(ml_dir, "tfidf_vectorizer.joblib")
    if_path = os.path.join(ml_dir, "if_anomaly_detector.joblib")
    
    if not (os.path.exists(rf_path) and os.path.exists(tfidf_path) and os.path.exists(if_path)):
        print("Model files missing. Please run training scripts first.")
        return
        
    rf_model = joblib.load(rf_path)
    tfidf = joblib.load(tfidf_path)
    if_model = joblib.load(if_path)
    
    print("1. Models loaded successfully.")
    
    # Test classifier evaluation
    from train_rent_classifier import generate_synthetic_classification_dataset, extract_features
    test_df = generate_synthetic_classification_dataset(500, random_state=99)
    y_test = test_df["is_rent"].values
    X_test, _ = extract_features(test_df, vectorizer=tfidf, fit_vectorizer=False)
    
    y_pred = rf_model.predict(X_test)
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    eval_results = {
        "rent_classifier": {
            "model_version": "rent-classifier-v1",
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm
        }
    }
    
    print("Classifier Evaluation Results:")
    print(json.dumps(eval_results["rent_classifier"], indent=2))
    
    # Test anomaly detector evaluation
    from train_anomaly_detector import generate_normal_payment_patterns
    norm_df = generate_normal_payment_patterns(200, random_state=99)
    preds = if_model.predict(norm_df)
    anomalies = int(np.sum(preds == -1))
    normals = int(np.sum(preds == 1))
    
    eval_results["anomaly_detector"] = {
        "model_version": "anomaly-detector-v1",
        "samples_evaluated": len(norm_df),
        "normal_count": normals,
        "anomaly_count": anomalies,
        "false_positive_review_rate": round(anomalies / len(norm_df), 4)
    }
    
    print("\nAnomaly Detector Evaluation Results:")
    print(json.dumps(eval_results["anomaly_detector"], indent=2))
    
    out_path = os.path.join('c:\\Users\\kbpra\\.gemini\\antigravity-ide\\brain\\4e6a1952-976c-4c0f-9556-8cdada873742\\rent hub', "training", "evaluation_results.json")
    with open(out_path, "w") as f:
        json.dump(eval_results, f, indent=2)
    print(f"\nEvaluation report saved to {out_path}")

if __name__ == "__main__":
    main()
