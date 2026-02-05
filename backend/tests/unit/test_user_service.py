"""
Unit tests for UserService.
Tests user management logic.
"""
import pytest
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import RoleEnum


class TestUserServiceCreate:
    """Test user creation logic."""
    
    def test_create_user_success(self, db):
        """Test successful user creation."""
        user_data = UserCreate(
            email="new.user@cygnet.one",
            name="New User",
            password="new@2026",
            role=RoleEnum.USER
        )
        
        user = UserService.create(db, user_data)
        
        assert user is not None
        assert user.email == "new.user@cygnet.one"
        assert user.name == "New User"
        assert user.role == RoleEnum.USER
        assert user.is_active is True
        assert user.password_hash != "new@2026"  # Should be hashed
    
    def test_create_admin_user(self, db):
        """Test creating admin user."""
        user_data = UserCreate(
            email="new.admin@cygnet.one",
            name="New Admin",
            password="admin@2026",
            role=RoleEnum.ADMIN
        )
        
        user = UserService.create(db, user_data)
        
        assert user.role == RoleEnum.ADMIN
    
    def test_password_is_hashed(self, db):
        """Test password is properly hashed on creation."""
        user_data = UserCreate(
            email="secure.user@cygnet.one",
            name="Secure User",
            password="plaintext@2026"
        )
        
        user = UserService.create(db, user_data)
        
        assert user.password_hash != "plaintext@2026"
        assert len(user.password_hash) > 20


class TestUserServiceRead:
    """Test user retrieval logic."""
    
    def test_get_user_by_id(self, db, test_user):
        """Test retrieving user by ID."""
        user = UserService.get_by_id(db, test_user.id)
        
        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email
    
    def test_get_user_by_email(self, db, test_user):
        """Test retrieving user by email."""
        user = UserService.get_by_email(db, "john.doe@cygnet.one")
        
        assert user is not None
        assert user.email == "john.doe@cygnet.one"
    
    def test_get_nonexistent_user(self, db):
        """Test getting non-existent user returns None."""
        user = UserService.get_by_id(db, "nonexistent-id")
        
        assert user is None
    
    def test_get_all_users(self, db, test_user, test_admin):
        """Test listing all users."""
        users = UserService.get_all(db)
        
        assert len(users) >= 2
        emails = [u.email for u in users]
        assert "john.doe@cygnet.one" in emails
        assert "admin.user@cygnet.one" in emails


class TestUserServiceUpdate:
    """Test user update logic."""
    
    def test_update_user_name(self, db, test_user):
        """Test updating user name."""
        update_data = UserUpdate(name="John Updated Doe")
        
        updated_user = UserService.update(db, test_user.id, update_data)
        
        assert updated_user is not None
        assert updated_user.name == "John Updated Doe"
        assert updated_user.email == test_user.email  # Unchanged
    
    def test_update_user_avatar(self, db, test_user):
        """Test updating user avatar."""
        update_data = UserUpdate(avatar="https://example.com/avatar.jpg")
        
        updated_user = UserService.update(db, test_user.id, update_data)
        
        assert updated_user.avatar == "https://example.com/avatar.jpg"
    
    def test_update_multiple_fields(self, db, test_user):
        """Test updating multiple fields at once."""
        update_data = UserUpdate(
            name="Completely New Name",
            avatar="https://example.com/new.jpg"
        )
        
        updated_user = UserService.update(db, test_user.id, update_data)
        
        assert updated_user.name == "Completely New Name"
        assert updated_user.avatar == "https://example.com/new.jpg"
    
    def test_update_nonexistent_user(self, db):
        """Test updating non-existent user returns None."""
        update_data = UserUpdate(name="Ghost User")
        
        result = UserService.update(db, "nonexistent-id", update_data)
        
        assert result is None


class TestUserServiceDelete:
    """Test user deletion logic."""
    
    def test_delete_user(self, db):
        """Test deleting a user."""
        from app.models.user import User, RoleEnum
        from app.variables.security import get_password_hash
        
        user_to_delete = User(
            id="delete-me-456",
            email="delete.me@cygnet.one",
            name="Delete Me",
            password_hash=get_password_hash("test@2026"),
            role=RoleEnum.USER,
            is_active=True
        )
        db.add(user_to_delete)
        db.commit()
        
        result = UserService.delete(db, user_to_delete.id)
        
        assert result is True
        
        # Verify user is deleted
        deleted_user = UserService.get_by_id(db, user_to_delete.id)
        assert deleted_user is None
    
    def test_delete_nonexistent_user(self, db):
        """Test deleting non-existent user returns False."""
        result = UserService.delete(db, "nonexistent-id")
        
        assert result is False


class TestUserValidation:
    """Test user data validation."""
    
    def test_user_repr(self, test_user):
        """Test user string representation."""
        repr_str = repr(test_user)
        
        assert "User" in repr_str
        assert test_user.id in repr_str
        assert test_user.email in repr_str
