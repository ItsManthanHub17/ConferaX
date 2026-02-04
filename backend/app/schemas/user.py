from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    """User role enumeration."""
    USER = "USER"
    ADMIN = "ADMIN"


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str = Field(..., min_length=6)
    role: RoleEnum = RoleEnum.USER


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response."""
    id: str
    role: RoleEnum
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UserInDB(UserResponse):
    """Schema for user in database (includes password hash)."""
    password_hash: str