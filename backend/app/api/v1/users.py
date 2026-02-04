from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.variables.database import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services.user_service import UserService
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.utils.exceptions import NotFoundException, BadRequestException, ForbiddenException

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    - **email**: Must end with @cygnet.one
    - **name**: Full name (format: firstname.lastname)
    - **password**: Password (min 6 characters)
    - **role**: USER or ADMIN (default: USER)
    
    Note: In production, admin registration should be restricted.
    """
    # Validate email domain
    if not user_data.email.lower().endswith("@cygnet.one"):
        raise BadRequestException("Email must be from @cygnet.one domain")
    
    # Check if user already exists
    existing_user = UserService.get_by_email(db, user_data.email)
    if existing_user:
        raise BadRequestException("Email already registered")
    
    # Create user
    user = UserService.create(db, user_data)
    return user


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_my_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's profile.
    
    Requires authentication.
    """
    return current_user


@router.put("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_my_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    
    - **name**: New name (optional)
    - **avatar**: New avatar URL (optional)
    
    Requires authentication.
    """
    updated_user = UserService.update(db, current_user.id, user_data)
    
    if not updated_user:
        raise NotFoundException("User not found")
    
    return updated_user


@router.get("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user by ID.
    
    Requires authentication. Users can only view their own profile unless they are admin.
    """
    user = UserService.get_by_id(db, user_id)
    
    if not user:
        raise NotFoundException("User not found")
    
    # Users can only view their own profile unless they are admin
    if user.id != current_user.id and current_user.role.value != "ADMIN":
        raise ForbiddenException("Access denied")
    
    return user