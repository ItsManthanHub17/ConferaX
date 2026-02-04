from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime, date, time
from enum import Enum

# Import related schemas at module level, not inside class
from app.schemas.user import UserResponse
from app.schemas.room import RoomResponse


class PriorityEnum(str, Enum):
    """Booking priority enumeration."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class BookingStatusEnum(str, Enum):
    """Booking status enumeration."""
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    CANCELLED = "Cancelled"


class BookingBase(BaseModel):
    """Base booking schema."""
    room_id: str
    date: date
    start_time: time
    end_time: time
    title: str = Field(..., min_length=1, max_length=255)
    attendees: int = Field(..., gt=0)
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    equipment: List[str] = Field(default_factory=list)

    @field_validator("equipment", mode="before")
    @classmethod
    def normalize_equipment(cls, value: Any) -> List[str]:
        """Normalize equipment to list."""
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, dict):
            return [key for key, enabled in value.items() if bool(enabled)]
        return []

    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        """Validate that end_time is after start_time."""
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class BookingCreate(BookingBase):
    """Schema for creating a booking."""
    pass


class BookingUpdate(BaseModel):
    """Schema for updating a booking."""
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    attendees: Optional[int] = Field(None, gt=0)
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    equipment: Optional[List[str]] = None


class BookingStatusUpdate(BaseModel):
    """Schema for updating booking status (admin only)."""
    status: BookingStatusEnum
    notes: Optional[str] = None


class BookingResponse(BookingBase):
    """Schema for booking response."""
    id: str
    user_id: str
    user_name: str  # Computed field
    room_name: str  # Computed field
    status: BookingStatusEnum
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class BookingWithDetails(BookingResponse):
    """Booking response with full user and room details."""
    user: UserResponse
    room: RoomResponse
