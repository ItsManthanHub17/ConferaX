from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime, date, time

from app.models.booking import Booking, BookingStatusEnum
from app.schemas.booking import BookingCreate, BookingUpdate, BookingStatusUpdate


class BookingService:
    """Service for booking-related operations."""
    
    @staticmethod
    def get_by_id(db: Session, booking_id: str) -> Optional[Booking]:
        """Get booking by ID."""
        return db.query(Booking).filter(Booking.id == booking_id).first()
    
    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[str] = None,
        room_id: Optional[str] = None,
        status: Optional[BookingStatusEnum] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> List[Booking]:
        """Get all bookings with optional filters."""
        query = db.query(Booking)
        
        if user_id:
            query = query.filter(Booking.user_id == user_id)
        
        if room_id:
            query = query.filter(Booking.room_id == room_id)
        
        if status:
            query = query.filter(Booking.status == status)
        
        if date_from:
            query = query.filter(Booking.date >= date_from)
        
        if date_to:
            query = query.filter(Booking.date <= date_to)
        
        return query.order_by(Booking.date.desc(), Booking.start_time.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def create(db: Session, user_id: str, booking_data: BookingCreate) -> Booking:
        """Create a new booking."""
        booking = Booking(
            id=Booking.generate_booking_id(),
            user_id=user_id,
            room_id=booking_data.room_id,
            date=booking_data.date,
            start_time=booking_data.start_time,
            end_time=booking_data.end_time,
            title=booking_data.title,
            attendees=booking_data.attendees,
            description=booking_data.description,
            priority=booking_data.priority,
            status=BookingStatusEnum.PENDING,
            equipment=booking_data.equipment
        )
        
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def update(db: Session, booking_id: str, booking_data: BookingUpdate) -> Optional[Booking]:
        """Update booking information."""
        booking = BookingService.get_by_id(db, booking_id)
        if not booking:
            return None
        
        update_dict = booking_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(booking, field, value)
        
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def update_status(db: Session, booking_id: str, status_data: BookingStatusUpdate) -> Optional[Booking]:
        """Update booking status (admin only)."""
        booking = BookingService.get_by_id(db, booking_id)
        if not booking:
            return None
        
        booking.status = status_data.status
        if status_data.notes:
            booking.notes = status_data.notes
        
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def cancel(db: Session, booking_id: str, notes: Optional[str] = None) -> Optional[Booking]:
        """Cancel a booking."""
        booking = BookingService.get_by_id(db, booking_id)
        if not booking:
            return None
        
        booking.status = BookingStatusEnum.CANCELLED
        if notes:
            booking.notes = notes
        
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    def delete(db: Session, booking_id: str) -> bool:
        """Delete a booking."""
        booking = BookingService.get_by_id(db, booking_id)
        if not booking:
            return False
        
        db.delete(booking)
        db.commit()
        return True
    
    @staticmethod
    def get_conflicting_bookings(
        db: Session,
        room_id: str,
        date: date,
        start_time: time,
        end_time: time,
        exclude_booking_id: Optional[str] = None
    ) -> List[Booking]:
        """
        Get bookings that conflict with the given time slot.
        Only considers APPROVED bookings.
        """
        query = db.query(Booking).filter(
            and_(
                Booking.room_id == room_id,
                Booking.date == date,
                Booking.status == BookingStatusEnum.APPROVED,
                or_(
                    # New booking starts during existing booking
                    and_(
                        Booking.start_time <= start_time,
                        Booking.end_time > start_time
                    ),
                    # New booking ends during existing booking
                    and_(
                        Booking.start_time < end_time,
                        Booking.end_time >= end_time
                    ),
                    # New booking completely contains existing booking
                    and_(
                        Booking.start_time >= start_time,
                        Booking.end_time <= end_time
                    )
                )
            )
        )
        
        if exclude_booking_id:
            query = query.filter(Booking.id != exclude_booking_id)
        
        return query.all()
    
    @staticmethod
    def approve_with_conflict_resolution(
        db: Session,
        booking_id: str,
        cancel_conflicts: bool = False
    ) -> tuple[Optional[Booking], List[Booking]]:
        """
        Approve a booking and optionally cancel conflicting bookings.
        
        Returns:
            tuple: (approved_booking, list_of_cancelled_bookings)
        """
        booking = BookingService.get_by_id(db, booking_id)
        if not booking:
            return None, []
        
        # Find conflicting bookings
        conflicts = BookingService.get_conflicting_bookings(
            db,
            booking.room_id,
            booking.date,
            booking.start_time,
            booking.end_time,
            exclude_booking_id=booking_id
        )
        
        cancelled_bookings = []
        
        if cancel_conflicts and conflicts:
            # Cancel all conflicting bookings
            for conflict in conflicts:
                conflict.status = BookingStatusEnum.CANCELLED
                conflict.notes = f"Revoked by Admin for Priority Override by {booking.user.name}"
                cancelled_bookings.append(conflict)
        
        # Approve the booking
        booking.status = BookingStatusEnum.APPROVED
        
        db.commit()
        db.refresh(booking)
        
        return booking, cancelled_bookings