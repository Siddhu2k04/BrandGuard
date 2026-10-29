from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class CompanyRegisterRequest(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    company_description: Optional[str] = Field(None, max_length=1000)
    admin_full_name: str = Field(..., min_length=1, max_length=255)
    admin_email: EmailStr
    password: str = Field(..., min_length=8)


class EmployeeRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    invitation_code: str = Field(..., min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    company_id: Optional[int] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
