from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict
import logging

from app.models.booking import Booking, BookingStatusEnum

logger = logging.getLogger(__name__)


class CleanupService:
    """Service for automated audit log cleanup."""
    
    # Global flag to control cleanup (can be toggled by admin)
    _cleanup_enabled = True
    
    @classmethod
    def set_cleanup_enabled(cls, enabled: bool):
        """Enable or disable automatic cleanup."""
        cls._cleanup_enabled = enabled
        logger.info(f"Audit log cleanup {'enabled' if enabled else 'disabled'}")
    
    @classmethod
    def is_cleanup_enabled(cls) -> bool:
        """Check if cleanup is enabled."""
        return cls._cleanup_enabled
    
    @staticmethod
    def cleanup_old_audit_logs(db: Session, retention_days: int = 10) -> Dict[str, int]:
        """
        Delete old audit logs (processed bookings).
        
        Args:
            db: Database session
            retention_days: Number of days to keep logs (default 10)
            
        Returns:
            Dictionary with deletion counts per status
        """
        if not CleanupService._cleanup_enabled:
            logger.info("Cleanup skipped: disabled by admin")
            return {"skipped": True, "approved": 0, "rejected": 0, "cancelled": 0}
        
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        
        # Count and delete APPROVED bookings older than retention period
        approved_count = db.query(Booking).filter(
            Booking.status == BookingStatusEnum.APPROVED,
            Booking.created_at < cutoff_date
        ).count()
        
        db.query(Booking).filter(
            Booking.status == BookingStatusEnum.APPROVED,
            Booking.created_at < cutoff_date
        ).delete(synchronize_session=False)
        
        # Count and delete REJECTED bookings
        rejected_count = db.query(Booking).filter(
            Booking.status == BookingStatusEnum.REJECTED,
            Booking.created_at < cutoff_date
        ).count()
        
        db.query(Booking).filter(
            Booking.status == BookingStatusEnum.REJECTED,
            Booking.created_at < cutoff_date
        ).delete(synchronize_session=False)
        
        # Count and delete CANCELLED bookings
        cancelled_count = db.query(Booking).filter(
            Booking.status == BookingStatusEnum.CANCELLED,
            Booking.created_at < cutoff_date
        ).count()
        
        db.query(Booking).filter(
            Booking.status == BookingStatusEnum.CANCELLED,
            Booking.created_at < cutoff_date
        ).delete(synchronize_session=False)
        
        db.commit()
        
        total = approved_count + rejected_count + cancelled_count
        logger.info(
            f"Cleanup completed: Deleted {total} audit logs "
            f"(Approved: {approved_count}, Rejected: {rejected_count}, Cancelled: {cancelled_count})"
        )
        
        return {
            "approved": approved_count,
            "rejected": rejected_count,
            "cancelled": cancelled_count,
            "total": total,
            "cutoff_date": cutoff_date.isoformat()
        }
