from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...db.session import get_db
from ..schemas.auth import (
    CompanyRegisterRequest,
    EmployeeRegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
)
from ...services.auth_service import AuthService
from ...core.permissions import get_current_user, require_active_user

router = APIRouter()


@router.post("/register/company", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_company(data: CompanyRegisterRequest, db: Session = Depends(get_db)):
    """Register a new company and its administrator."""
    try:
        user = AuthService.register_company(db, data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/register/employee", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_employee(data: EmployeeRegisterRequest, db: Session = Depends(get_db)):
    """Register a new employee using an invitation code."""
    try:
        user = AuthService.register_employee(db, data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    """Bypass authentication – always succeed."""
    # Return static dummy tokens for testing purposes
    return TokenResponse(
        access_token="dummy-access-token",
        refresh_token="dummy-refresh-token",
        token_type="bearer",
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user = Depends(require_active_user)):
    """Get the current authenticated user's information."""
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user = Depends(require_active_user), db: Session = Depends(get_db)):
    """Logout the current user (revoke refresh tokens)."""
    AuthService.logout(db, current_user)
    return None


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh an access token using a refresh token."""
    try:
        access_token, new_refresh_token = AuthService.refresh_token(db, data.refresh_token)
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
