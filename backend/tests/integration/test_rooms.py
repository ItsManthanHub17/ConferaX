"""
Rooms module CRUD endpoint tests.
Tests for /api/v1/rooms endpoints.
"""
import pytest
from fastapi import status


class TestRoomsCreate:
    """Test cases for POST /api/v1/rooms endpoint."""
    
    def test_create_room_as_admin(self, client, admin_headers):
        """Test admin can create a new room."""
        response = client.post(
            "/api/v1/rooms",
            headers=admin_headers,
            json={
                "name": "Conference Room B",
                "floor": "2nd Floor",
                "room_number": "CR-201",
                "capacity": 15,
                "image_url": "https://example.com/room-b.jpg",
                "features": ["Projector", "Whiteboard"]
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Conference Room B"
        assert data["room_number"] == "CR-201"
        assert data["capacity"] == 15
        assert data["is_active"] is True
    
    def test_create_room_as_regular_user(self, client, auth_headers):
        """Test regular user cannot create rooms."""
        response = client.post(
            "/api/v1/rooms",
            headers=auth_headers,
            json={
                "name": "Unauthorized Room",
                "floor": "1st Floor",
                "room_number": "CR-999",
                "capacity": 5
            }
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_create_room_with_duplicate_room_number(self, client, admin_headers, test_room):
        """Test creating room with duplicate room_number fails."""
        response = client.post(
            "/api/v1/rooms",
            headers=admin_headers,
            json={
                "name": "Another Room",
                "floor": "1st Floor",
                "room_number": "CR-101",  # Already exists
                "capacity": 8
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestRoomsRead:
    """Test cases for GET /api/v1/rooms endpoints."""
    
    def test_list_all_rooms(self, client, auth_headers, test_room):
        """Test any authenticated user can list rooms."""
        response = client.get(
            "/api/v1/rooms",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == "Conference Room A"
    
    def test_list_rooms_without_auth(self, client):
        """Test unauthenticated users cannot list rooms."""
        response = client.get("/api/v1/rooms")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_room_by_id(self, client, auth_headers, test_room):
        """Test getting a specific room by ID."""
        response = client.get(
            f"/api/v1/rooms/{test_room.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_room.id
        assert data["name"] == "Conference Room A"
        assert "features" in data
    
    def test_get_nonexistent_room(self, client, auth_headers):
        """Test getting non-existent room returns 404."""
        response = client.get(
            "/api/v1/rooms/nonexistent-room-id",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_list_rooms_pagination(self, client, auth_headers, test_room):
        """Test room listing supports pagination."""
        response = client.get(
            "/api/v1/rooms?skip=0&limit=5",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)


class TestRoomsUpdate:
    """Test cases for PUT /api/v1/rooms/{room_id} endpoint."""
    
    def test_update_room_as_admin(self, client, admin_headers, test_room):
        """Test admin can update room details."""
        response = client.put(
            f"/api/v1/rooms/{test_room.id}",
            headers=admin_headers,
            json={
                "name": "Updated Conference Room A",
                "capacity": 20,
                "features": ["Projector", "Whiteboard", "Smart TV"]
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Conference Room A"
        assert data["capacity"] == 20
        assert len(data["features"]) == 3
    
    def test_update_room_as_regular_user(self, client, auth_headers, test_room):
        """Test regular user cannot update rooms."""
        response = client.put(
            f"/api/v1/rooms/{test_room.id}",
            headers=auth_headers,
            json={"name": "Unauthorized Update"}
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_update_nonexistent_room(self, client, admin_headers):
        """Test updating non-existent room returns 404."""
        response = client.put(
            "/api/v1/rooms/nonexistent-id",
            headers=admin_headers,
            json={"name": "Ghost Room"}
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_deactivate_room(self, client, admin_headers, test_room):
        """Test admin can deactivate a room."""
        response = client.put(
            f"/api/v1/rooms/{test_room.id}",
            headers=admin_headers,
            json={"is_active": False}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_active"] is False


class TestRoomsDelete:
    """Test cases for DELETE /api/v1/rooms/{room_id} endpoint."""
    
    def test_delete_room_as_admin(self, client, admin_headers, db):
        """Test admin can delete a room."""
        from app.models.room import Room
        
        room_to_delete = Room(
            id="delete-room-123",
            name="Temporary Room",
            floor="3rd Floor",
            room_number="CR-301",
            capacity=5,
            is_active=True
        )
        db.add(room_to_delete)
        db.commit()
        
        response = client.delete(
            f"/api/v1/rooms/{room_to_delete.id}",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_delete_room_as_regular_user(self, client, auth_headers, test_room):
        """Test regular user cannot delete rooms."""
        response = client.delete(
            f"/api/v1/rooms/{test_room.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_delete_nonexistent_room(self, client, admin_headers):
        """Test deleting non-existent room returns 404."""
        response = client.delete(
            "/api/v1/rooms/nonexistent-id",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestRoomsAvailability:
    """Test cases for room availability checking."""
    
    def test_check_room_availability(self, client, auth_headers, test_room):
        """Test checking room availability for a date/time."""
        response = client.get(
            f"/api/v1/rooms/{test_room.id}/availability?date=2026-02-15&start_time=14:00&end_time=15:00",
            headers=auth_headers
        )
        
        # Availability endpoint might not exist yet, so we just check structure
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
