"""
Unit tests for AuthService.
Tests authentication and password handling logic.
"""
import pytest
from app.services.auth_service import AuthService
from app.variables.security import verify_password, get_password_hash


class TestPasswordHashing:
    """Test password hashing and verification."""
    
    def test_hash_password(self):
        """Test password is properly hashed."""
        plain_password = "test@2026"
        hashed = get_password_hash(plain_password)
        
        assert hashed != plain_password
        assert len(hashed) > 20
        assert hashed.startswith("$2b$")  # bcrypt format
    
    def test_verify_correct_password(self):
        """Test correct password verification."""
        plain_password = "test@2026"
        hashed = get_password_hash(plain_password)
        
        assert verify_password(plain_password, hashed) is True
    
    def test_verify_incorrect_password(self):
        """Test incorrect password verification fails."""
        plain_password = "test@2026"
        wrong_password = "wrong@2026"
        hashed = get_password_hash(plain_password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_different_hashes_for_same_password(self):
        """Test same password generates different hashes (salt)."""
        plain_password = "test@2026"
        hash1 = get_password_hash(plain_password)
        hash2 = get_password_hash(plain_password)
        
        assert hash1 != hash2
        assert verify_password(plain_password, hash1)
        assert verify_password(plain_password, hash2)


class TestAuthServiceLogin:
    """Test login logic."""
    
    def test_login_with_valid_credentials(self, db, test_user):
        """Test successful login returns tokens."""
        result = AuthService.login(db, "john.doe@cygnet.one", "john@2026")
        
        assert result is not None
        assert "access_token" in result
        assert "token_type" in result
        assert result["token_type"] == "bearer"
        assert "user" in result
    
    def test_login_with_invalid_email(self, db):
        """Test login with non-existent email returns None."""
        result = AuthService.login(db, "nonexistent@cygnet.one", "any@2026")
        
        assert result is None
    
    def test_login_with_invalid_password(self, db, test_user):
        """Test login with wrong password returns None."""
        result = AuthService.login(db, "john.doe@cygnet.one", "wrongpassword")
        
        assert result is None
    
    def test_login_inactive_user(self, db, test_user):
        """Test login fails for inactive user."""
        test_user.is_active = False
        db.commit()
        
        result = AuthService.login(db, "john.doe@cygnet.one", "john@2026")
        
        assert result is None


class TestTokenGeneration:
    """Test JWT token generation and validation."""
    
    def test_token_contains_user_info(self, db, test_user):
        """Test generated token contains user information."""
        result = AuthService.login(db, "john.doe@cygnet.one", "john@2026")
        
        assert result is not None
        token = result["access_token"]
        assert len(token) > 20
        # Token should be a valid JWT format (3 parts separated by dots)
        parts = token.split(".")
        assert len(parts) == 3
    
    def test_admin_login_returns_admin_role(self, db, test_admin):
        """Test admin login returns correct role."""
        result = AuthService.login(db, "admin.user@cygnet.one", "admin@2026")
        
        assert result is not None
        assert result["user"]["role"] == "ADMIN"
