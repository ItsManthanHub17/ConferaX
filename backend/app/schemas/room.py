from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime


class RoomBase(BaseModel):
    """Base room schema."""
    name: str = Field(..., min_length=1, max_length=255)
    floor: str = Field(..., min_length=1, max_length=100)
    room_number: str = Field(..., min_length=1, max_length=50)
    capacity: int = Field(..., gt=0)
    image_url: Optional[str] = None
    features: List[str] = Field(default_factory=list)

    @field_validator("features", mode="before")
    @classmethod
    def normalize_features(cls, value: Any) -> List[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, dict):
            return [key for key, enabled in value.items() if bool(enabled)]
        return []


class RoomCreate(RoomBase):
    """Schema for creating a room."""
    pass


class RoomUpdate(BaseModel):
    """Schema for updating a room."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    floor: Optional[str] = Field(None, min_length=1, max_length=100)
    capacity: Optional[int] = Field(None, gt=0)
    image_url: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None


class RoomResponse(RoomBase):
    """Schema for room response."""
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}