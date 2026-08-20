# Master Build Instructions

Act as a senior full-stack architect, backend engineer, frontend engineer, ML engineer, QA engineer and DevOps engineer.

Build the complete Rent Verification API for Landlords and Lenders using the fixed stack in README.md.

Rules:
- React + TypeScript + Vite frontend.
- Python + FastAPI backend.
- PostgreSQL database.
- Scikit-learn only for AI.
- RandomForestClassifier for rent/non-rent classification.
- IsolationForest for payment anomaly detection.
- Redis + Celery for background jobs.
- JWT + RBAC.
- Razorpay with server-side webhook verification.
- SMTP for email.
- REST/JSON/OpenAPI.
- No hard-coded secrets.
- No paid AI API.
- No live banking integration in MVP.
- CSV is the first transaction input.
- Use UTC timestamps.
- Add health/readiness endpoints.
- Add structured errors and audit logs.
- Every module must have tests.
- Do not move to the next phase until the current phase passes tests.

Build order:
1 scaffolding
2 backend/database
3 auth/RBAC
4 tenant/property/lease
5 subscription/payment/API keys
6 verification/consent
7 CSV ingestion/payment matching
8 ML training/inference
9 verification/reporting
10 email/admin
11 tests
12 Docker/deployment
