from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.variables.database import get_db
from app.schemas.booking import (
    BookingCreate,
    BookingUpdate,
    BookingStatusUpdate,
    BookingResponse,
    BookingStatusEnum
)
from app.services.booking_service import BookingService
from app.services.room_service import RoomService
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.models.booking import Booking
from app.utils.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException
)
from app.core.config import settings

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def _to_booking_response(booking: Booking) -> BookingResponse:
    """Convert Booking model to BookingResponse schema."""
    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        room_id=booking.room_id,
        date=booking.date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        title=booking.title,
        attendees=booking.attendees,
        description=booking.description,
        priority=booking.priority,
        equipment=booking.equipment,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
        user_name=booking.user.name if booking.user else "Unknown",
        room_name=booking.room.name if booking.room else "Unknown"
    )


@router.get("", response_model=List[BookingResponse], status_code=status.HTTP_200_OK)
def get_all_bookings(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE, description="Number of records to return"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    room_id: Optional[str] = Query(None, description="Filter by room ID"),
    status: Optional[BookingStatusEnum] = Query(None, description="Filter by status"),
    date_from: Optional[date] = Query(None, description="Filter by start date (inclusive)"),
    date_to: Optional[date] = Query(None, description="Filter by end date (inclusive)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all bookings with optional filters.
    
    - Regular users can see all approved bookings (for global schedule)
    - Regular users can see their own bookings regardless of status
    - Admins can see all bookings and apply filters
    
    Requires authentication.
    """
    # Regular users can see all approved bookings or their own bookings
    # This allows them to see the global schedule
    if current_user.role.value != "ADMIN":
        # If no specific user_id filter provided, only show approved bookings for schedule view
        if user_id is None:
            status = BookingStatusEnum.APPROVED
        else:
            # If filtering by user_id, verify it's their own ID
            if user_id != current_user.id:
                user_id = current_user.id
    
    bookings = BookingService.get_all(
        db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        room_id=room_id,
        status=status,
        date_from=date_from,
        date_to=date_to
    )
    
    # Enrich with user_name and room_name
    return [_to_booking_response(booking) for booking in bookings]


@router.get("/{booking_id}", response_model=BookingResponse, status_code=status.HTTP_200_OK)
def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get booking by ID.
    
    - Users can only view their own bookings
    - Admins can view any booking
    
    Requires authentication.
    """
    booking = BookingService.get_by_id(db, booking_id)
    
    if not booking:
        raise NotFoundException("Booking not found")
    
    # Check permissions
    if booking.user_id != current_user.id and current_user.role.value != "ADMIN":
        raise ForbiddenException("Access denied")
    
    return _to_booking_response(booking)


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new booking.
    
    - All bookings start with PENDING status
    - System checks for conflicts but doesn't auto-reject (admin decides)
    
    Requires authentication.
    """
    # Validate room exists
    room = RoomService.get_by_id(db, booking_data.room_id)
    if not room or not room.is_active:
        raise NotFoundException("Room not found or inactive")
    
    # Validate attendees don't exceed room capacity
    if booking_data.attendees > room.capacity:
        raise BadRequestException(
            f"Attendees ({booking_data.attendees}) exceed room capacity ({room.capacity})"
        )
    
    # Validate end_time is after start_time (Pydantic should handle this, but double check)
    if booking_data.end_time <= booking_data.start_time:
        raise BadRequestException("End time must be after start time")
    
    # Check for conflicts with approved bookings
    conflicts = BookingService.get_conflicting_bookings(
        db,
        booking_data.room_id,
        booking_data.date,
        booking_data.start_time,
        booking_data.end_time
    )
    
    if conflicts:
        conflict_details = [
            {
                "user": c.user.name,
                "time": f"{c.start_time} - {c.end_time}"
            }
            for c in conflicts
        ]
        raise ConflictException(
            f"This time slot conflicts with {len(conflicts)} already approved booking(s). "
            f"Please choose a different time or room. Conflicts: {conflict_details}"
        )
    
    # Create booking
    booking = BookingService.create(db, current_user.id, booking_data)
    
    return _to_booking_response(booking)


@router.put("/{booking_id}", response_model=BookingResponse, status_code=status.HTTP_200_OK)
def update_booking(
    booking_id: str,
    booking_data: BookingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update booking details.
    
    - Users can only update their own bookings
    - Can only update bookings in PENDING or APPROVED status
    - Cannot update CANCELLED or REJECTED bookings
    
    Requires authentication.
    """
    booking = BookingService.get_by_id(db, booking_id)
    
    if not booking:
        raise NotFoundException("Booking not found")
    
    # Check ownership
    if booking.user_id != current_user.id:
        raise ForbiddenException("You can only update your own bookings")
    
    # Check if booking can be updated
    if booking.status in [BookingStatusEnum.CANCELLED, BookingStatusEnum.REJECTED]:
        raise BadRequestException(f"Cannot update {booking.status.value} booking")
    
    # If room_id is being changed, validate new room
    if booking_data.room_id and booking_data.room_id != booking.room_id:
        room = RoomService.get_by_id(db, booking_data.room_id)
        if not room or not room.is_active:
            raise NotFoundException("Room not found or inactive")
    
    # Update booking
    updated_booking = BookingService.update(db, booking_id, booking_data)
    
    if not updated_booking:
        raise NotFoundException("Booking not found")
    
    return _to_booking_response(updated_booking)


@router.patch("/{booking_id}/cancel", response_model=BookingResponse, status_code=status.HTTP_200_OK)
def cancel_booking(
    booking_id: str,
    notes: Optional[str] = Query(None, description="Cancellation reason"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a booking.
    
    - Users can cancel their own bookings
    - Admins can cancel any booking
    - Can only cancel PENDING or APPROVED bookings
    
    Requires authentication.
    """
    booking = BookingService.get_by_id(db, booking_id)
    
    if not booking:
        raise NotFoundException("Booking not found")
    
    # Check permissions
    if booking.user_id != current_user.id and current_user.role.value != "ADMIN":
        raise ForbiddenException("You can only cancel your own bookings")
    
    # Check if booking can be cancelled
    if booking.status == BookingStatusEnum.CANCELLED:
        raise BadRequestException("Booking is already cancelled")
    
    if booking.status == BookingStatusEnum.REJECTED:
        raise BadRequestException("Cannot cancel a rejected booking")
    
    # Cancel booking
    cancelled_booking = BookingService.cancel(db, booking_id, notes)
    
    return _to_booking_response(cancelled_booking)


@router.patch("/{booking_id}/status", response_model=BookingResponse, status_code=status.HTTP_200_OK)
def update_booking_status(
    booking_id: str,
    status_data: BookingStatusUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update booking status (Admin only).
    
    - APPROVE: Change to APPROVED status
    - REJECT: Change to REJECTED status with optional reason
    
    Requires admin authentication.
    """
    booking = BookingService.get_by_id(db, booking_id)
    
    if not booking:
        raise NotFoundException("Booking not found")
    
    # Validate status transition
    if booking.status == status_data.status:
        raise BadRequestException(f"Booking is already {status_data.status.value}")
    
    # Update status
    updated_booking = BookingService.update_status(db, booking_id, status_data)
    
    return _to_booking_response(updated_booking)


@router.post("/{booking_id}/approve", response_model=BookingResponse, status_code=status.HTTP_200_OK)
def approve_booking(
    booking_id: str,
    cancel_conflicts: bool = Query(False, description="Automatically cancel conflicting bookings"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Approve a booking with optional conflict resolution (Admin only).
    
    - Checks for conflicting bookings in the same room and time slot
    - If cancel_conflicts=True, automatically cancels conflicting approved bookings
    - If cancel_conflicts=False and conflicts exist, returns 409 Conflict
    
    Requires admin authentication.
    """
    booking = BookingService.get_by_id(db, booking_id)
    
    if not booking:
        raise NotFoundException("Booking not found")
    
    if booking.status != BookingStatusEnum.PENDING:
        raise BadRequestException("Can only approve PENDING bookings")
    
    # Check for conflicts
    conflicts = BookingService.get_conflicting_bookings(
        db,
        booking.room_id,
        booking.date,
        booking.start_time,
        booking.end_time,
        exclude_booking_id=booking_id
    )
    
    if conflicts and not cancel_conflicts:
        conflict_details = [
            {
                "id": c.id,
                "user_name": c.user.name,
                "time": f"{c.start_time} - {c.end_time}"
            }
            for c in conflicts
        ]
        raise ConflictException(
            f"Booking conflicts with {len(conflicts)} existing approved booking(s). "
            f"Set cancel_conflicts=true to auto-cancel them. Conflicts: {conflict_details}"
        )
    
    # Approve with conflict resolution
    approved_booking, cancelled = BookingService.approve_with_conflict_resolution(
        db, booking_id, cancel_conflicts
    )
    
    return _to_booking_response(approved_booking)


@router.post("/{booking_id}/reject", response_model=BookingResponse, status_code=status.HTTP_200_OK)
def reject_booking(
    booking_id: str,
    status_update: BookingStatusUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Reject a booking (Admin only).
    
    Accepts rejection reason in request body as 'notes' field.
    
    Requires admin authentication.
    """
    booking = BookingService.get_by_id(db, booking_id)
    
    if not booking:
        raise NotFoundException("Booking not found")
    
    if booking.status != BookingStatusEnum.PENDING:
        raise BadRequestException("Can only reject PENDING bookings")
    
    # Reject booking with the provided notes
    reject_data = BookingStatusUpdate(status=BookingStatusEnum.REJECTED, notes=status_update.notes)
    rejected_booking = BookingService.update_status(db, booking_id, reject_data)
    
    return _to_booking_response(rejected_booking)


@router.get("/{booking_id}/conflicts", response_model=List[BookingResponse], status_code=status.HTTP_200_OK)
def get_booking_conflicts(
    booking_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get conflicting bookings for a specific booking (Admin only).
    
    Returns list of APPROVED bookings that conflict with the specified booking.
    
    Requires admin authentication.
    """
    booking = BookingService.get_by_id(db, booking_id)
    
    if not booking:
        raise NotFoundException("Booking not found")
    
    conflicts = BookingService.get_conflicting_bookings(
        db,
        booking.room_id,
        booking.date,
        booking.start_time,
        booking.end_time,
        exclude_booking_id=booking_id
    )
    
    return [_to_booking_response(conflict) for conflict in conflicts]


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete a booking (Admin only).
    
    Note: For regular users, use the cancel endpoint instead.
    
    Requires admin authentication.
    """
    success = BookingService.delete(db, booking_id)
    
    if not success:
        raise NotFoundException("Booking not found")
    
    return None