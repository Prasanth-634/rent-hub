# AI Specification

Library: Scikit-learn only.

Model 1: RandomForestClassifier
Task: classify RENT vs NON_RENT.
Features: amount, ratio to expected rent, day of month, days from due date, recurring pattern, payee match, TF-IDF description features.
Training: synthetic labelled CSV for MVP; train/test split; report accuracy, precision, recall, F1; persist model with joblib.

Model 2: IsolationForest
Task: flag unusual payment patterns.
Features: amount ratio, payment interval, monthly payment count, days late, amount deviation.
Output: anomaly flag and anomaly score.

Rules:
- No paid external AI API.
- AI is decision support.
- Do not call a tenant fraudulent solely from AI.
- Low-confidence cases require review.
- Store model version with predictions.
