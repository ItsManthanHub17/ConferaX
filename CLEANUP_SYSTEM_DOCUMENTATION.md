# Automated Audit Log Cleanup System

## Overview
This document describes the automated audit log cleanup system implemented for the Smart RoomBook application. The system automatically deletes old audit logs to maintain database performance while preserving important pending requests.

## Features

### ✅ Automated Cleanup
- **Daily Schedule**: Runs automatically every day at 2:00 AM (configurable)
- **Retention Period**: Keeps audit logs for 10 days (configurable)
- **Selective Deletion**: Only deletes processed bookings, never pending ones
- **Background Task**: Uses APScheduler for reliable task execution

### ✅ Admin Control
- **Enable/Disable**: Admin can toggle automatic cleanup on/off
- **Manual Trigger**: Admin can run cleanup immediately anytime
- **Status Monitoring**: View current configuration and cleanup state
- **Real-time Feedback**: See deletion counts after manual cleanup

### ✅ Safety Features
- **Preserves Pending**: PENDING bookings are NEVER deleted regardless of age
- **Selective by Status**: Only deletes APPROVED, REJECTED, and CANCELLED bookings
- **Configurable**: All settings can be adjusted via environment variables

## Configuration

Configuration is managed in `backend/app/core/config.py`:

```python
AUDIT_LOG_RETENTION_DAYS: int = 10  # Days to keep audit logs
ENABLE_AUTO_CLEANUP: bool = True     # Enable automatic cleanup
CLEANUP_HOUR: int = 2                # Hour to run cleanup (0-23)
```

### Environment Variables
You can override these settings using environment variables:

```bash
AUDIT_LOG_RETENTION_DAYS=10
ENABLE_AUTO_CLEANUP=true
CLEANUP_HOUR=2
```

## Architecture

### Backend Components

#### 1. CleanupService (`backend/app/services/cleanup_service.py`)
- Core cleanup logic
- Calculates cutoff date based on retention period
- Deletes only specified booking statuses
- Returns detailed deletion counts

```python
# Example usage
result = await CleanupService.cleanup_old_audit_logs(db, retention_days=10)
# Returns: {"approved": 5, "rejected": 3, "cancelled": 2, "total": 10, "cutoff_date": "2025-01-10"}
```

#### 2. SchedulerService (`backend/app/services/scheduler_service.py`)
- Manages APScheduler instance
- Schedules daily cleanup job
- Provides manual trigger method
- Handles startup and shutdown

```python
# Start scheduler on app startup
SchedulerService.start_scheduler()

# Manually trigger cleanup
result = await SchedulerService.trigger_cleanup_now()
```

#### 3. Admin API (`backend/app/api/v1/admin.py`)
Three admin-only endpoints:

**GET /api/v1/admin/cleanup/status**
- Returns current cleanup configuration
- Shows if cleanup is enabled
- Displays retention period and schedule

**POST /api/v1/admin/cleanup/toggle?enabled=true**
- Enable or disable automatic cleanup
- Returns updated status

**POST /api/v1/admin/cleanup/run-now**
- Manually trigger cleanup immediately
- Returns deletion counts

### Frontend Components

#### Admin Dashboard Tab (`frontend/components/AdminDashboard.tsx`)
New "Auto-Cleanup" tab in admin dashboard with:

- **Status Display**: Shows enabled/disabled, retention period, schedule
- **Toggle Control**: Enable/disable automatic cleanup
- **Manual Trigger**: Run cleanup immediately
- **Real-time Results**: Displays deletion counts after manual cleanup
- **Warning Notice**: Explains which bookings will be deleted

## How It Works

### Automatic Cleanup (Daily)
1. Application starts and initializes SchedulerService
2. Scheduler creates a cron job to run at configured hour (2 AM)
3. At scheduled time, cleanup executes automatically
4. Deletes bookings older than retention period
5. Only deletes APPROVED, REJECTED, CANCELLED statuses
6. Logs results for monitoring

### Manual Cleanup (Admin-Triggered)
1. Admin navigates to Auto-Cleanup tab
2. Clicks "Run Cleanup Now" button
3. Confirmation dialog explains what will be deleted
4. Backend executes cleanup immediately
5. Returns detailed deletion counts
6. Admin sees results in alert dialog

## Database Impact

### What Gets Deleted
- **APPROVED** bookings older than 10 days
- **REJECTED** bookings older than 10 days  
- **CANCELLED** bookings older than 10 days

### What NEVER Gets Deleted
- **PENDING** bookings (always preserved)
- Any booking newer than retention period

### Example Query
```sql
DELETE FROM bookings 
WHERE status IN ('APPROVED', 'REJECTED', 'CANCELLED')
  AND created_at < (NOW() - INTERVAL '10 days');
```

## Testing

### Test Automatic Cleanup
1. Set `CLEANUP_HOUR` to next hour in config
2. Restart backend container
3. Wait for scheduled time
4. Check logs: `docker logs cygnet_backend | grep cleanup`

### Test Manual Cleanup
1. Login as admin user
2. Navigate to admin dashboard
3. Click "Auto-Cleanup" tab
4. Click "Run Cleanup Now"
5. Confirm in dialog
6. View deletion results

### Test Enable/Disable
1. Login as admin
2. Go to Auto-Cleanup tab
3. Click "Disable Cleanup" button
4. Verify status changes to DISABLED
5. Click "Enable Cleanup" button
6. Verify status changes to ACTIVE

## Monitoring

### Backend Logs
Monitor cleanup execution:
```bash
docker logs -f cygnet_backend | grep -i cleanup
```

### Startup Log
```
🧹 Cleanup scheduler started (retention: 10 days)
```

### Execution Logs
```
INFO: Audit log cleanup completed - deleted 15 records (approved: 8, rejected: 4, cancelled: 3)
```

## Git Commits

All changes are committed with meaningful messages:

1. `dfad320` - feat(config): add automated cleanup configuration with 10-day retention
2. `2b1ad87` - feat(services): implement audit log cleanup service
3. `d2cf84c` - feat(services): add APScheduler service for automated tasks
4. `b722c35` - feat(api): add admin endpoints for cleanup management
5. `8578b45` - feat(app): integrate cleanup scheduler into application lifecycle
6. `9311f77` - feat(frontend): add admin UI for cleanup management

## Dependencies

### New Dependency Added
```
APScheduler==3.10.4
```

Installed in: `backend/requirements.txt`

APScheduler provides:
- Cron-based scheduling
- Background job execution
- Persistent job management
- Thread-safe operations

## File Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── admin.py              # NEW: Admin cleanup endpoints
│   │       └── __init__.py           # MODIFIED: Register admin router
│   ├── core/
│   │   └── config.py                 # MODIFIED: Add cleanup settings
│   ├── main.py                       # MODIFIED: Integrate scheduler
│   └── services/
│       ├── cleanup_service.py        # NEW: Cleanup logic
│       └── scheduler_service.py      # NEW: Scheduler management
├── requirements.txt                   # MODIFIED: Add APScheduler

frontend/
├── api.ts                            # MODIFIED: Add cleanup API calls
└── components/
    └── AdminDashboard.tsx            # MODIFIED: Add cleanup UI tab
```

## Security

- All admin endpoints require authentication
- Uses `get_current_admin_user` dependency
- JWT token validation
- Role-based access control (ADMIN only)
- No public access to cleanup functions

## Performance

- Cleanup runs in background thread
- Does not block main application
- Uses efficient SQL DELETE query
- Deletes in single transaction
- Minimal database impact

## Future Enhancements

Potential improvements:
- [ ] Email notifications after cleanup
- [ ] Cleanup history/audit trail
- [ ] Configurable status filter per booking
- [ ] Archive instead of delete option
- [ ] Cleanup statistics dashboard
- [ ] Multiple retention periods by status

## Troubleshooting

### Cleanup Not Running
1. Check if enabled: `docker logs cygnet_backend | grep "Cleanup scheduler started"`
2. Verify APScheduler installed: `docker exec cygnet_backend pip list | grep apscheduler`
3. Check configuration in `/admin/cleanup/status`

### Cleanup Not Deleting
1. Verify bookings are old enough (> 10 days)
2. Check booking statuses (only APPROVED/REJECTED/CANCELLED)
3. Ensure cleanup is enabled
4. Try manual trigger to test

### Admin UI Not Loading
1. Check frontend container: `docker logs cygnet_frontend`
2. Verify API calls in browser console
3. Check authentication token
4. Confirm admin role

## Support

For issues or questions:
1. Check container logs: `docker logs cygnet_backend`
2. Review this documentation
3. Check git commits for implementation details
4. Test manually via admin UI

---

**Implemented by**: GitHub Copilot  
**Branch**: feature/automated-audit-log-cleanup  
**Date**: January 2025  
**Status**: ✅ Complete and Tested
