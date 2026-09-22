import uuid
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import SessionLocal
from app.db.init_db import init_db
from app.api.auth import router as auth_router
from app.api.landlord_portal import router as landlord_portal_router
from app.api.lender_portal import router as lender_portal_router
from app.api.tenant_portal import router as tenant_portal_router
from app.api.tenants import router as tenants_router
from app.api.properties import router as properties_router
from app.api.leases import router as leases_router
from app.api.verifications import router as verifications_router
from app.api.consents import router as consents_router
from app.api.ai import router as ai_router
from app.api.reports import router as reports_router
from app.api.billing import router as billing_router
from app.api.api_keys import router as api_keys_router
from app.api.admin import router as admin_router
from app.api.health import router as health_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


# Custom Error Handler according to API_SPEC.md: {"error":{"code":"CODE","message":"Human readable","request_id":"uuid"}}
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = str(uuid.uuid4())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc),
                "request_id": req_id
            }
        }
    )

api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(landlord_portal_router, prefix=api_prefix)
app.include_router(lender_portal_router, prefix=api_prefix)
app.include_router(tenant_portal_router, prefix=api_prefix)
app.include_router(tenants_router, prefix=api_prefix)
app.include_router(properties_router, prefix=api_prefix)
app.include_router(leases_router, prefix=api_prefix)
app.include_router(verifications_router, prefix=api_prefix)
app.include_router(consents_router, prefix=api_prefix)
app.include_router(ai_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)
app.include_router(billing_router, prefix=api_prefix)
app.include_router(api_keys_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)
app.include_router(health_router, prefix=api_prefix)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
