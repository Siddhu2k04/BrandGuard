from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserUpdateRequest, UserResponse
from app.services.user_service import UserService
from app.core.permissions import require_active_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user = Depends(require_active_user)):
    """Get the current user's profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdateRequest,
    current_user = Depends(require_active_user),
    db: Session = Depends(get_db)
):
    """Update the current user's profile (safe fields only)."""
    user = UserService.update_user_profile(db, current_user, data)
    return user
