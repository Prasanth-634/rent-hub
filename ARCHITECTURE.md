# Architecture

React/Vite
  -> FastAPI REST API
     -> Auth / Users
     -> Billing / Razorpay
     -> Verification
        -> Consent
        -> CSV ingestion
        -> Payment matching
        -> Scikit-learn AI
           -> Random Forest
           -> Isolation Forest
        -> Report
     -> PostgreSQL
     -> Redis -> Celery workers
     -> SMTP
     -> local storage / S3

Production adds AWS load balancing, RDS PostgreSQL, ElastiCache Redis, S3, CloudWatch.
