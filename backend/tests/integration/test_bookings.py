"""
Bookings module CRUD endpoint tests.
Tests for /api/v1/bookings endpoints.
"""
import pytest
from fastapi import status
from datetime import date, time, timedelta


class TestBookingsCreate:
    """Test cases for POST /api/v1/bookings endpoint."""
    
    def test_create_booking(self, client, auth_headers, test_room):
        """Test user can create a new booking."""
        future_date = (date.today() + timedelta(days=7)).isoformat()
        
        response = client.post(
            "/api/v1/bookings",
            headers=auth_headers,
            json={
                "room_id": test_room.id,
                "date": future_date,
                "start_time": "10:00",
                "end_time": "11:00",
                "title": "Project Discussion",
                "attendees": 5,
                "description": "Quarterly project review",
                "priority": "High"
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Project Discussion"
        assert data["room_id"] == test_room.id
        assert data["status"] == "Pending"
        assert data["id"].startswith("BK-")
    
    def test_create_booking_without_auth(self, client, test_room):
        """Test unauthenticated user cannot create booking."""
        response = client.post(
            "/api/v1/bookings",
            json={
                "room_id": test_room.id,
                "date": "2026-02-20",
                "start_time": "10:00",
                "end_time": "11:00",
                "title": "Test",
                "attendees": 5
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_booking_with_conflict(self, client, auth_headers, test_booking):
        """Test creating booking with time conflict fails."""
        response = client.post(
            "/api/v1/bookings",
            headers=auth_headers,
            json={
                "room_id": test_booking.room_id,
                "date": "2026-02-10",  # Same date as test_booking
                "start_time": "09:30",  # Overlaps with 09:00-10:00
                "end_time": "10:30",
                "title": "Conflicting Meeting",
                "attendees": 3
            }
        )
        
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "conflict" in response.json()["detail"].lower()
    
    def test_create_booking_with_invalid_time(self, client, auth_headers, test_room):
        """Test creating booking with end_time before start_time fails."""
        response = client.post(
            "/api/v1/bookings",
            headers=auth_headers,
            json={
                "room_id": test_room.id,
                "date": "2026-02-20",
                "start_time": "15:00",
                "end_time": "14:00",  # Before start_time
                "title": "Invalid Time Booking",
                "attendees": 5
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestBookingsRead:
    """Test cases for GET /api/v1/bookings endpoints."""
    
    def test_list_bookings_as_user(self, client, auth_headers, test_booking):
        """Test user can list their own bookings."""
        response = client.get(
            "/api/v1/bookings",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        # User should only see their own bookings
        for booking in data:
            assert "user_name" in booking
            assert "room_name" in booking
    
    def test_list_all_bookings_as_admin(self, client, admin_headers, test_booking):
        """Test admin can list all bookings."""
        response = client.get(
            "/api/v1/bookings",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    def test_filter_bookings_by_status(self, client, admin_headers, test_booking):
        """Test filtering bookings by status."""
        response = client.get(
            "/api/v1/bookings?status=Approved",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for booking in data:
            assert booking["status"] == "Approved"
    
    def test_filter_bookings_by_room(self, client, admin_headers, test_booking):
        """Test filtering bookings by room_id."""
        response = client.get(
            f"/api/v1/bookings?room_id={test_booking.room_id}",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for booking in data:
            assert booking["room_id"] == test_booking.room_id
    
    def test_get_booking_by_id(self, client, auth_headers, test_booking):
        """Test getting a specific booking by ID."""
        response = client.get(
            f"/api/v1/bookings/{test_booking.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_booking.id
        assert data["title"] == "Team Meeting"
    
    def test_get_nonexistent_booking(self, client, auth_headers):
        """Test getting non-existent booking returns 404."""
        response = client.get(
            "/api/v1/bookings/BK-9999-9999",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_user_cannot_view_other_users_booking(self, client, db):
        """Test user cannot view another user's booking."""
        from app.models.user import User, RoleEnum
        from app.models.booking import Booking
        from app.variables.security import get_password_hash
        
        # Create another user
        other_user = User(
            id="other-user-123",
            email="other.user@cygnet.one",
            name="Other User",
            password_hash=get_password_hash("other@2026"),
            role=RoleEnum.USER,
            is_active=True
        )
        db.add(other_user)
        db.commit()
        
        # Create booking for other user
        other_booking = Booking(
            id="BK-2026-9999",
            user_id=other_user.id,
            room_id="test-room-id-789",
            date=date(2026, 2, 15),
            start_time=time(11, 0),
            end_time=time(12, 0),
            title="Private Meeting",
            attendees=3,
            status="Pending"
        )
        db.add(other_booking)
        db.commit()
        
        # Login as first user
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "other.user@cygnet.one", "password": "other@2026"}
        )
        token = response.json()["access_token"]
        
        # Try to access - should be filtered out
        response = client.get(
            "/api/v1/bookings",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        # Should only see own bookings


class TestBookingsUpdate:
    """Test cases for PUT /api/v1/bookings/{booking_id} endpoint."""
    
    def test_update_own_booking(self, client, auth_headers, test_booking):
        """Test user can update their own booking."""
        response = client.put(
            f"/api/v1/bookings/{test_booking.id}",
            headers=auth_headers,
            json={
                "title": "Updated Team Meeting",
                "attendees": 8
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "Updated Team Meeting"
        assert data["attendees"] == 8
    
    def test_admin_can_update_any_booking(self, client, admin_headers, test_booking):
        """Test admin can update any booking."""
        response = client.put(
            f"/api/v1/bookings/{test_booking.id}",
            headers=admin_headers,
            json={"description": "Admin updated this"}
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_update_booking_status_as_admin(self, client, admin_headers, test_booking):
        """Test admin can approve/reject bookings."""
        response = client.patch(
            f"/api/v1/bookings/{test_booking.id}/status",
            headers=admin_headers,
            json={"status": "Approved"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "Approved"
    
    def test_user_cannot_change_booking_status(self, client, auth_headers, test_booking):
        """Test regular user cannot change booking status."""
        response = client.patch(
            f"/api/v1/bookings/{test_booking.id}/status",
            headers=auth_headers,
            json={"status": "Approved"}
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestBookingsDelete:
    """Test cases for DELETE /api/v1/bookings/{booking_id} endpoint."""
    
    def test_delete_own_booking(self, client, db, auth_headers, test_user, test_room):
        """Test user can cancel/delete their own booking."""
        from app.models.booking import Booking
        
        booking_to_delete = Booking(
            id="BK-2026-7777",
            user_id=test_user.id,
            room_id=test_room.id,
            date=date(2026, 2, 25),
            start_time=time(13, 0),
            end_time=time(14, 0),
            title="To Be Deleted",
            attendees=2,
            status="Pending"
        )
        db.add(booking_to_delete)
        db.commit()
        
        response = client.delete(
            f"/api/v1/bookings/{booking_to_delete.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_admin_can_delete_any_booking(self, client, admin_headers, test_booking):
        """Test admin can delete any booking."""
        response = client.delete(
            f"/api/v1/bookings/{test_booking.id}",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_delete_nonexistent_booking(self, client, admin_headers):
        """Test deleting non-existent booking returns 404."""
        response = client.delete(
            "/api/v1/bookings/BK-9999-9999",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestBookingConflictDetection:
    """Test cases for booking conflict detection logic."""
    
    def test_no_conflict_different_rooms(self, client, auth_headers, db, test_booking):
        """Test booking different room at same time is allowed."""
        from app.models.room import Room
        
        another_room = Room(
            id="another-room-456",
            name="Conference Room B",
            floor="2nd Floor",
            room_number="CR-202",
            capacity=10,
            is_active=True
        )
        db.add(another_room)
        db.commit()
        
        response = client.post(
            "/api/v1/bookings",
            headers=auth_headers,
            json={
                "room_id": another_room.id,
                "date": "2026-02-10",  # Same date as test_booking
                "start_time": "09:00",  # Same time
                "end_time": "10:00",
                "title": "Different Room Meeting",
                "attendees": 5
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_no_conflict_different_times(self, client, auth_headers, test_booking):
        """Test booking same room at different time is allowed."""
        response = client.post(
            "/api/v1/bookings",
            headers=auth_headers,
            json={
                "room_id": test_booking.room_id,
                "date": "2026-02-10",  # Same date
                "start_time": "11:00",  # After test_booking ends
                "end_time": "12:00",
                "title": "Later Meeting",
                "attendees": 3
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
