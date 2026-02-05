"""
Users module CRUD endpoint tests.
Tests for /api/v1/users endpoints.
"""
import pytest
from fastapi import status


class TestUsersRegister:
    """Test cases for POST /api/v1/users/register endpoint."""
    
    def test_register_new_user(self, client):
        """Test creating a new user successfully."""
        response = client.post(
            "/api/v1/users/register",
            json={
                "email": "jane.smith@cygnet.one",
                "name": "Jane Smith",
                "password": "jane@2026",
                "role": "USER"
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "jane.smith@cygnet.one"
        assert data["name"] == "Jane Smith"
        assert data["role"] == "USER"
        assert "password" not in data
        assert "password_hash" not in data
    
    def test_register_admin_user(self, client):
        """Test creating an admin user."""
        response = client.post(
            "/api/v1/users/register",
            json={
                "email": "new.admin@cygnet.one",
                "name": "New Admin",
                "password": "admin@2026",
                "role": "ADMIN"
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["role"] == "ADMIN"
    
    def test_register_with_invalid_email_domain(self, client):
        """Test registration fails with non-cygnet email."""
        response = client.post(
            "/api/v1/users/register",
            json={
                "email": "user@gmail.com",
                "name": "Test User",
                "password": "test@2026"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "cygnet.one" in response.json()["detail"].lower()
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration fails with existing email."""
        response = client.post(
            "/api/v1/users/register",
            json={
                "email": "john.doe@cygnet.one",
                "name": "Another John",
                "password": "test@2026"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already registered" in response.json()["detail"].lower()


class TestUsersProfile:
    """Test cases for user profile endpoints."""
    
    def test_get_my_profile(self, client, auth_headers, test_user):
        """Test GET /api/v1/users/me - get own profile."""
        response = client.get(
            "/api/v1/users/me",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "john.doe@cygnet.one"
        assert data["name"] == "John Doe"
    
    def test_update_my_profile(self, client, auth_headers, test_user):
        """Test PUT /api/v1/users/me - update own profile."""
        response = client.put(
            "/api/v1/users/me",
            headers=auth_headers,
            json={
                "name": "John Updated Doe",
                "avatar": "https://example.com/new-avatar.jpg"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "John Updated Doe"
        assert data["avatar"] == "https://example.com/new-avatar.jpg"
    
    def test_get_profile_without_auth(self, client):
        """Test accessing profile without authentication fails."""
        response = client.get("/api/v1/users/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUsersAdmin:
    """Test cases for admin user management endpoints."""
    
    def test_get_user_by_id_as_admin(self, client, admin_headers, test_user):
        """Test GET /api/v1/users/{user_id} - admin can get any user."""
        response = client.get(
            f"/api/v1/users/{test_user.id}",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_user.id
        assert data["email"] == test_user.email
    
    def test_get_user_by_id_as_regular_user(self, client, auth_headers, test_admin):
        """Test regular user cannot get other users."""
        response = client.get(
            f"/api/v1/users/{test_admin.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_list_all_users_as_admin(self, client, admin_headers, test_user):
        """Test GET /api/v1/users - admin can list all users."""
        response = client.get(
            "/api/v1/users",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_list_all_users_as_regular_user(self, client, auth_headers):
        """Test regular user cannot list all users."""
        response = client.get(
            "/api/v1/users",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_update_user_as_admin(self, client, admin_headers, test_user):
        """Test PUT /api/v1/users/{user_id} - admin can update any user."""
        response = client.put(
            f"/api/v1/users/{test_user.id}",
            headers=admin_headers,
            json={"name": "Admin Updated Name"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Admin Updated Name"
    
    def test_delete_user_as_admin(self, client, admin_headers, db):
        """Test DELETE /api/v1/users/{user_id} - admin can delete users."""
        # Create a user to delete
        from app.models.user import User, RoleEnum
        from app.variables.security import get_password_hash
        
        user_to_delete = User(
            id="delete-me-123",
            email="deleteme@cygnet.one",
            name="Delete Me",
            password_hash=get_password_hash("test@2026"),
            role=RoleEnum.USER,
            is_active=True
        )
        db.add(user_to_delete)
        db.commit()
        
        response = client.delete(
            f"/api/v1/users/{user_to_delete.id}",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_delete_user_as_regular_user(self, client, auth_headers, test_admin):
        """Test regular user cannot delete users."""
        response = client.delete(
            f"/api/v1/users/{test_admin.id}",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
