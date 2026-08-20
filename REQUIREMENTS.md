# Requirements

Actors: Tenant, Landlord, Lender, Admin, API Customer.

Functional requirements:
1. Registration/login/logout
2. Role-based access
3. Subscription plans
4. Online payment
5. Server-side payment verification
6. Subscription activation/expiry
7. API key management
8. Email notifications
9. Tenant profile
10. Property management
11. Lease management
12. Verification requests
13. Tenant consent
14. CSV rental-data upload
15. Data validation
16. Rent transaction classification
17. Payment matching
18. Paid/late/partial/missed/overpaid/duplicate detection
19. AI anomaly detection
20. Verification engine
21. Verification report
22. REST API access
23. API usage/rate limiting
24. Webhooks
25. Audit logs
26. Admin dashboard
27. Health monitoring

Non-functional requirements:
1. Security
2. Privacy/data minimization
3. Data integrity
4. Performance
5. Scalability
6. Availability
7. Reliability
8. Maintainability
9. Usability
10. Testability
11. Auditability
12. Backup/recovery
13. Error isolation
14. API versioning
15. Configurability
16. Deployability

Business rules:
- Valid tenant consent is required before verification.
- API access activates only after verified payment.
- Payment webhooks must be idempotent.
- Sensitive tenant data is returned only to authorized callers.
- AI output is a signal, not an automatic fraud accusation.
- Low-confidence results become REQUIRES_REVIEW.
- Final reports cannot be silently overwritten.
