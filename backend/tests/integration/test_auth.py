"""
Authentication endpoint tests.
Tests for /api/v1/auth endpoints.
"""
import pytest
from fastapi import status


class TestAuthLogin:
    """Test cases for POST /api/v1/auth/login endpoint."""
    
    def test_login_with_valid_credentials(self, client, test_user):
        """Test successful login with valid credentials."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "john.doe@cygnet.one",
                "password": "john@2026"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == "john.doe@cygnet.one"
        assert data["user"]["role"] == "USER"
    
    def test_login_with_invalid_email(self, client, test_user):
        """Test login fails with non-existent email."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@cygnet.one",
                "password": "john@2026"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid email or password" in response.json()["detail"]
    
    def test_login_with_invalid_password(self, client, test_user):
        """Test login fails with incorrect password."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "john.doe@cygnet.one",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid email or password" in response.json()["detail"]
    
    def test_login_with_missing_email(self, client):
        """Test login fails with missing email field."""
        response = client.post(
            "/api/v1/auth/login",
            json={"password": "john@2026"}
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_login_with_missing_password(self, client):
        """Test login fails with missing password field."""
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "john.doe@cygnet.one"}
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_admin_login(self, client, test_admin):
        """Test admin user can login successfully."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin.user@cygnet.one",
                "password": "admin@2026"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["user"]["role"] == "ADMIN"


class TestAuthMe:
    """Test cases for GET /api/v1/auth/me endpoint."""
    
    def test_get_current_user_with_valid_token(self, client, auth_headers, test_user):
        """Test getting current user info with valid token."""
        response = client.get(
            "/api/v1/auth/me",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "john.doe@cygnet.one"
        assert data["name"] == "John Doe"
        assert data["role"] == "USER"
        assert data["is_active"] is True
    
    def test_get_current_user_without_token(self, client):
        """Test accessing protected endpoint without token fails."""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_current_user_with_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token fails."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_current_admin_user(self, client, admin_headers, test_admin):
        """Test getting current admin user info."""
        response = client.get(
            "/api/v1/auth/me",
            headers=admin_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["role"] == "ADMIN"
