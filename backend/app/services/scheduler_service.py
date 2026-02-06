from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import logging
from typing import Optional

from app.variables.database import SessionLocal
from app.services.cleanup_service import CleanupService
from app.core.config import settings

logger = logging.getLogger(__name__)


class SchedulerService:
    """Service for managing scheduled tasks."""
    
    _scheduler: Optional[AsyncIOScheduler] = None
    
    @classmethod
    def get_scheduler(cls) -> AsyncIOScheduler:
        """Get or create the scheduler instance."""
        if cls._scheduler is None:
            cls._scheduler = AsyncIOScheduler()
        return cls._scheduler
    
    @classmethod
    def start_scheduler(cls):
        """Start the scheduler and add cleanup job."""
        scheduler = cls.get_scheduler()
        
        if not scheduler.running:
            # Add audit log cleanup job
            scheduler.add_job(
                cls._run_cleanup,
                CronTrigger(hour=settings.CLEANUP_HOUR, minute=0),
                id="audit_log_cleanup",
                name="Daily Audit Log Cleanup",
                replace_existing=True
            )
            
            scheduler.start()
            logger.info(f"Scheduler started. Cleanup scheduled daily at {settings.CLEANUP_HOUR}:00")
            logger.info(f"Audit log retention: {settings.AUDIT_LOG_RETENTION_DAYS} days")
            logger.info(f"Auto-cleanup enabled: {settings.ENABLE_AUTO_CLEANUP}")
    
    @classmethod
    def shutdown_scheduler(cls):
        """Shutdown the scheduler."""
        if cls._scheduler and cls._scheduler.running:
            cls._scheduler.shutdown()
            logger.info("Scheduler shutdown")
    
    @staticmethod
    def _run_cleanup():
        """Execute the cleanup job."""
        db = SessionLocal()
        try:
            if not settings.ENABLE_AUTO_CLEANUP:
                logger.info("Cleanup skipped: ENABLE_AUTO_CLEANUP is False")
                return
            
            logger.info("Starting scheduled audit log cleanup...")
            result = CleanupService.cleanup_old_audit_logs(
                db, 
                retention_days=settings.AUDIT_LOG_RETENTION_DAYS
            )
            
            if result.get("skipped"):
                logger.info("Cleanup skipped by admin")
            else:
                logger.info(f"Cleanup completed: {result}")
        except Exception as e:
            logger.error(f"Cleanup failed: {str(e)}")
        finally:
            db.close()
    
    @classmethod
    def trigger_cleanup_now(cls):
        """Manually trigger cleanup job immediately."""
        logger.info("Manual cleanup triggered")
        cls._run_cleanup()
