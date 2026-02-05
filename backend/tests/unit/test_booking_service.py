"""
Unit tests for BookingService.
Tests business logic without hitting API endpoints.
"""
import pytest
from datetime import date, time, timedelta
from app.services.booking_service import BookingService
from app.models.booking import Booking, BookingStatusEnum
from app.schemas.booking import BookingCreate, BookingUpdate


class TestBookingServiceCreate:
    """Test booking creation logic."""
    
    def test_generate_booking_id_format(self):
        """Test booking ID generation format."""
        booking_id = Booking.generate_booking_id()
        
        assert booking_id.startswith("BK-")
        assert len(booking_id.split("-")) == 3
        year_part = booking_id.split("-")[1]
        assert len(year_part) == 4
        number_part = booking_id.split("-")[2]
        assert len(number_part) == 4
        assert number_part.isdigit()
    
    def test_create_booking_success(self, db, test_user, test_room):
        """Test successful booking creation."""
        future_date = date.today() + timedelta(days=5)
        booking_data = BookingCreate(
            room_id=test_room.id,
            date=future_date,
            start_time=time(14, 0),
            end_time=time(15, 0),
            title="Test Meeting",
            attendees=5,
            priority="Medium"
        )
        
        booking = BookingService.create(db, test_user.id, booking_data)
        
        assert booking is not None
        assert booking.user_id == test_user.id
        assert booking.room_id == test_room.id
        assert booking.status == BookingStatusEnum.PENDING
        assert booking.id.startswith("BK-")


class TestBookingServiceConflict:
    """Test booking conflict detection."""
    
    def test_check_conflict_overlapping_time(self, db, test_booking):
        """Test detecting time conflict in same room."""
        from app.schemas.booking import BookingCreate
        
        conflicting_booking = BookingCreate(
            room_id=test_booking.room_id,
            date=test_booking.date,
            start_time=time(9, 30),  # Overlaps with 9:00-10:00
            end_time=time(10, 30),
            title="Conflicting",
            attendees=3
        )
        
        has_conflict = BookingService.check_time_conflict(
            db,
            conflicting_booking.room_id,
            conflicting_booking.date,
            conflicting_booking.start_time,
            conflicting_booking.end_time
        )
        
        assert has_conflict is True
    
    def test_no_conflict_different_date(self, db, test_booking):
        """Test no conflict on different date."""
        different_date = test_booking.date + timedelta(days=1)
        
        has_conflict = BookingService.check_time_conflict(
            db,
            test_booking.room_id,
            different_date,
            test_booking.start_time,
            test_booking.end_time
        )
        
        assert has_conflict is False
    
    def test_no_conflict_before_existing_booking(self, db, test_booking):
        """Test no conflict when booking is before existing one."""
        has_conflict = BookingService.check_time_conflict(
            db,
            test_booking.room_id,
            test_booking.date,
            time(7, 0),
            time(8, 0),  # Before 9:00
        )
        
        assert has_conflict is False
    
    def test_no_conflict_after_existing_booking(self, db, test_booking):
        """Test no conflict when booking is after existing one."""
        has_conflict = BookingService.check_time_conflict(
            db,
            test_booking.room_id,
            test_booking.date,
            time(11, 0),  # After 10:00
            time(12, 0)
        )
        
        assert has_conflict is False


class TestBookingServiceUpdate:
    """Test booking update logic."""
    
    def test_update_booking_details(self, db, test_booking):
        """Test updating booking details."""
        update_data = BookingUpdate(
            title="Updated Title",
            attendees=10,
            description="Updated description"
        )
        
        updated = BookingService.update(db, test_booking.id, update_data)
        
        assert updated is not None
        assert updated.title == "Updated Title"
        assert updated.attendees == 10
        assert updated.description == "Updated description"
    
    def test_update_nonexistent_booking(self, db):
        """Test updating non-existent booking returns None."""
        update_data = BookingUpdate(title="Ghost")
        
        result = BookingService.update(db, "BK-9999-9999", update_data)
        
        assert result is None


class TestBookingServiceFilters:
    """Test booking filtering and querying."""
    
    def test_get_bookings_by_user(self, db, test_booking, test_user):
        """Test filtering bookings by user_id."""
        bookings = BookingService.get_all(
            db,
            user_id=test_user.id
        )
        
        assert len(bookings) >= 1
        for booking in bookings:
            assert booking.user_id == test_user.id
    
    def test_get_bookings_by_status(self, db, test_booking):
        """Test filtering bookings by status."""
        bookings = BookingService.get_all(
            db,
            status=BookingStatusEnum.APPROVED
        )
        
        for booking in bookings:
            assert booking.status == BookingStatusEnum.APPROVED
    
    def test_get_bookings_by_date_range(self, db, test_booking):
        """Test filtering bookings by date range."""
        date_from = date(2026, 2, 1)
        date_to = date(2026, 2, 28)
        
        bookings = BookingService.get_all(
            db,
            date_from=date_from,
            date_to=date_to
        )
        
        for booking in bookings:
            assert date_from <= booking.date <= date_to
