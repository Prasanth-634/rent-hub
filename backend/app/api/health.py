from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "ready" if db_status == "ok" else "not_ready",
        "components": {
            "database": db_status,
            "ml_engine": "ok"
        }
    }
