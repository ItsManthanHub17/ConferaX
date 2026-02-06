from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Dict

from app.variables.database import get_db
from app.api.deps import get_current_admin_user
from app.models.user import User
from app.services.cleanup_service import CleanupService
from app.services.scheduler_service import SchedulerService
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/cleanup/status", status_code=status.HTTP_200_OK)
def get_cleanup_status(
    current_user: User = Depends(get_current_admin_user)
) -> Dict:
    """
    Get current cleanup configuration and status (Admin only).
    """
    return {
        "enabled": CleanupService.is_cleanup_enabled(),
        "retention_days": settings.AUDIT_LOG_RETENTION_DAYS,
        "cleanup_hour": settings.CLEANUP_HOUR,
        "auto_cleanup_enabled": settings.ENABLE_AUTO_CLEANUP
    }


@router.post("/cleanup/toggle", status_code=status.HTTP_200_OK)
def toggle_cleanup(
    enabled: bool,
    current_user: User = Depends(get_current_admin_user)
) -> Dict:
    """
    Enable or disable automatic cleanup (Admin only).
    
    Args:
        enabled: True to enable, False to disable
    """
    CleanupService.set_cleanup_enabled(enabled)
    
    return {
        "message": f"Cleanup {'enabled' if enabled else 'disabled'}",
        "enabled": enabled
    }


@router.post("/cleanup/run-now", status_code=status.HTTP_200_OK)
def run_cleanup_now(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
) -> Dict:
    """
    Manually trigger cleanup immediately (Admin only).
    """
    result = CleanupService.cleanup_old_audit_logs(
        db, 
        retention_days=settings.AUDIT_LOG_RETENTION_DAYS
    )
    
    return {
        "message": "Cleanup executed",
        "result": result
    }
