import os
import joblib
import pickle
import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

def generate_synthetic_classification_dataset(n_samples=2500, random_state=42):
    np.random.seed(random_state)
    
    rent_descriptions = [
        "HOUSE RENT", "MONTHLY RENT PAYMENT", "UPI RENT TO LANDLORD", "APARTMENT RENT FOR MAY",
        "FLAT RENT TRANSFER", "HOUSING RENTAL FEE", "LEASE PAYMENT APARTMENT", "RENTAL ACCOMMODATION",
        "MONTHLY LEASE RENT", "LANDLORD PAYMENT FOR RENT", "PG RENT PAYMENT", "FLAT 402 RENT"
    ]
    
    non_rent_descriptions = [
        "GROCERY STORE", "ELECTRICITY BILL PAYMENT", "SWIGGY FOOD ORDER", "SUPERMARKET SHOPPING",
        "SALARY CREDIT", "MOBILE RECHARGE", "ZOMATO DINING", "PETROL PUMP FUEL",
        "AMAZON ONLINE SHOPPING", "MOVIE TICKETS BOOKING", "RESTAURANT BILL", "MEDICINE PHARMACY"
    ]
    
    payees_rent = ["Ramesh Kumar Landlord", "Apex Realty Holdings", "Sunrise Apartment Association", "Sharma Property Services", "Owner Rental Account"]
    payees_non_rent = ["Reliance Retail", "BESCOM Electricity", "Swiggy Pvt Ltd", "Airtel Telecommunications", "Indian Oil Station", "Amazon Pay"]
    
    payers = ["Alex Johnson", "Rahul Sharma", "Priya Patel", "Sneha Rao", "Vikram Singh"]
    
    data = []
    
    for i in range(n_samples):
        is_rent = np.random.choice([1, 0], p=[0.5, 0.5])
        expected_rent = np.random.choice([15000, 20000, 25000, 30000, 45000])
        
        if is_rent == 1:
            desc = np.random.choice(rent_descriptions)
            payee = np.random.choice(payees_rent)
            amount = expected_rent * np.random.normal(1.0, 0.02)
            day_of_month = np.random.choice([1, 2, 3, 4, 5, 28, 29, 30, 31])
            month = np.random.randint(1, 13)
            due_day = 1
            days_from_due = day_of_month - due_day if day_of_month <= 15 else day_of_month - 30 - due_day
            recurring_score = np.random.uniform(0.75, 1.0)
            payee_match_score = np.random.uniform(0.7, 1.0)
        else:
            desc = np.random.choice(non_rent_descriptions)
            payee = np.random.choice(payees_non_rent)
            amount = float(np.random.exponential(2500)) + np.random.uniform(100, 50000)
            day_of_month = np.random.randint(1, 31)
            month = np.random.randint(1, 13)
            due_day = 1
            days_from_due = np.random.randint(-15, 15)
            recurring_score = np.random.uniform(0.0, 0.4)
            payee_match_score = np.random.uniform(0.0, 0.3)
            
        payer = np.random.choice(payers)
        amount_minor_units = int(round(amount * 100))
        expected_rent_minor_units = int(round(expected_rent * 100))
        ratio = amount_minor_units / max(expected_rent_minor_units, 1)
        amount_diff = abs(amount_minor_units - expected_rent_minor_units)
        
        data.append({
            "transaction_id": f"TX_{i+1000:05d}",
            "description": desc,
            "payer": payer,
            "payee": payee,
            "amount_minor_units": amount_minor_units,
            "expected_rent_minor_units": expected_rent_minor_units,
            "ratio_to_expected_rent": ratio,
            "day_of_month": day_of_month,
            "month": month,
            "days_from_due_date": days_from_due,
            "recurring_pattern_score": recurring_score,
            "payee_match_score": payee_match_score,
            "amount_difference_from_expected": amount_diff,
            "is_rent": is_rent
        })
        
    return pd.DataFrame(data)

def extract_features(df, vectorizer=None, fit_vectorizer=False):
    descriptions = df["description"].fillna("").astype(str)
    
    if fit_vectorizer:
        vectorizer = TfidfVectorizer(max_features=20, stop_words="english", ngram_range=(1, 2))
        tfidf_features = vectorizer.fit_transform(descriptions)
    else:
        tfidf_features = vectorizer.transform(descriptions)
        
    num_cols = [
        "amount_minor_units",
        "ratio_to_expected_rent",
        "day_of_month",
        "month",
        "days_from_due_date",
        "recurring_pattern_score",
        "payee_match_score",
        "amount_difference_from_expected"
    ]
    num_features = df[num_cols].values
    
    X = hstack([csr_matrix(num_features), tfidf_features]).tocsr()
    return X, vectorizer

def main():
    print("--- Training Rent Transaction Classifier ---")
    df = generate_synthetic_classification_dataset(3000, random_state=42)
    
    y = df["is_rent"].values
    
    train_df, test_df, y_train, y_test = train_test_split(df, y, test_size=0.2, random_state=42, stratify=y)
    
    X_train, vectorizer = extract_features(train_df, fit_vectorizer=True)
    X_test, _ = extract_features(test_df, vectorizer=vectorizer, fit_vectorizer=False)
    
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        min_samples_split=4,
        class_weight="balanced"
    )
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("Confusion Matrix:\n", cm)
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # Save artifacts to both ml_models/ and backend/ml_models/
    target_dirs = [
        os.path.join('c:\\Users\\kbpra\\.gemini\\antigravity-ide\\brain\\4e6a1952-976c-4c0f-9556-8cdada873742\\rent hub', "ml_models"),
        os.path.join('c:\\Users\\kbpra\\.gemini\\antigravity-ide\\brain\\4e6a1952-976c-4c0f-9556-8cdada873742\\rent hub\\backend', "ml_models")
    ]
    
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        joblib.dump(clf, os.path.join(d, "rf_rent_classifier.joblib"))
        joblib.dump(vectorizer, os.path.join(d, "tfidf_vectorizer.joblib"))
        
        with open(os.path.join(d, "rent_classifier.pkl"), "wb") as f:
            pickle.dump(clf, f)
        with open(os.path.join(d, "tfidf_vectorizer.pkl"), "wb") as f:
            pickle.dump(vectorizer, f)
            
    print("Saved rent_classifier and tfidf_vectorizer artifacts successfully.")

if __name__ == "__main__":
    main()
