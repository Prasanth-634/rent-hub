# Test Plan

Backend unit tests:
- authentication
- RBAC
- payment/webhook idempotency
- payment matching
- transaction normalization
- AI preprocessing and predictions
- report calculations

API integration tests:
- auth
- tenant/property/lease CRUD
- verification lifecycle
- consent lifecycle
- CSV upload
- AI endpoints
- report access
- API key auth
- payment webhook

Frontend:
- login
- dashboard
- verification request
- consent
- upload
- report

Critical scenarios:
successful payment, duplicated webhook, consent denied/revoked, full/late/partial/split/missed payments, duplicate transaction, anomaly, low confidence, unauthorized report access.
