# Deployment

Local:
- Node.js LTS
- Python 3.12+
- Docker Desktop
- Git

docker compose up --build

Frontend: http://localhost:5173
Backend: http://localhost:8000
Swagger: http://localhost:8000/docs
PostgreSQL: localhost:5432
Redis: localhost:6379

Production:
- React build hosted via CDN/static hosting or container
- FastAPI on AWS ECS/Fargate or EC2
- RDS PostgreSQL
- ElastiCache Redis
- S3 for files
- CloudWatch for logs/metrics
- Secrets Manager for credentials
- HTTPS and health checks
