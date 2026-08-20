from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import AuditLog


def log_audit_event(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    actor_user_id: Optional[str] = None,
    metadata_json: Optional[Dict[str, Any]] = None,
):
    log = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata_json=metadata_json or {},
    )
    db.add(log)
    db.commit()
    return log
