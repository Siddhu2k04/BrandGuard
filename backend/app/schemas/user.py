from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    
    class Config:
        extra = "forbid"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    company_id: Optional[int] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
