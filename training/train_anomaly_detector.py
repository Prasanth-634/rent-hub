import os
import joblib
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

def generate_normal_payment_patterns(n_samples=2000, random_state=42):
    np.random.seed(random_state)
    
    # Normal rent transaction feature distributions
    expected_rent = 2500000  # minor units
    
    amounts = np.random.normal(expected_rent, expected_rent * 0.02, n_samples)
    diffs = abs(amounts - expected_rent)
    ratios = amounts / expected_rent
    intervals = np.random.normal(30, 1.5, n_samples)
    freqs = np.random.choice([1], size=n_samples)
    hist_avgs = np.random.normal(expected_rent, expected_rent * 0.01, n_samples)
    hist_stds = np.random.normal(expected_rent * 0.02, 500, n_samples)
    days_late = np.random.exponential(1.5, n_samples)
    unusual_flags = np.zeros(n_samples)
    duplicates = np.zeros(n_samples)
    
    df = pd.DataFrame({
        "transaction_amount": amounts,
        "difference_from_expected_rent": diffs,
        "amount_ratio": ratios,
        "days_between_rent_payments": intervals,
        "payment_frequency": freqs,
        "historical_average_payment": hist_avgs,
        "historical_std_dev": hist_stds,
        "late_payment_pattern": days_late,
        "unusually_large_small_flag": unusual_flags,
        "duplicate_transaction_indicator": duplicates
    })
    return df

def main():
    print("--- Training Payment Anomaly Detector (IsolationForest) ---")
    df = generate_normal_payment_patterns(n_samples=2500, random_state=42)
    
    contamination = 0.05
    random_state = 42
    model_version = "anomaly-detector-v1"
    
    iso = IsolationForest(
        n_estimators=100,
        contamination=contamination,
        random_state=random_state
    )
    iso.fit(df)
    
    preds = iso.predict(df)
    anomaly_count = int(np.sum(preds == -1))
    normal_count = int(np.sum(preds == 1))
    
    print(f"Model Version: {model_version}")
    print(f"Contamination: {contamination}")
    print(f"Trained on {len(df)} normal payment samples.")
    print(f"Inlier/Normal Count: {normal_count}")
    print(f"Outlier/Anomaly Count: {anomaly_count} ({anomaly_count/len(df)*100:.2f}%)")
    
    target_dirs = [
        os.path.join('c:\\Users\\kbpra\\.gemini\\antigravity-ide\\brain\\4e6a1952-976c-4c0f-9556-8cdada873742\\rent hub', "ml_models"),
        os.path.join('c:\\Users\\kbpra\\.gemini\\antigravity-ide\\brain\\4e6a1952-976c-4c0f-9556-8cdada873742\\rent hub\\backend', "ml_models")
    ]
    
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        joblib.dump(iso, os.path.join(d, "if_anomaly_detector.joblib"))
        with open(os.path.join(d, "anomaly_detector.pkl"), "wb") as f:
            pickle.dump(iso, f)
            
    print("Saved anomaly_detector artifacts successfully.")

if __name__ == "__main__":
    main()
