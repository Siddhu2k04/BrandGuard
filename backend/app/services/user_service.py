from sqlalchemy.orm import Session
from typing import List
from app.models.user import User
from app.schemas.user import UserUpdateRequest


class UserService:
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get a user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def update_user_profile(db: Session, user: User, data: UserUpdateRequest) -> User:
        """Update a user's profile (safe fields only)."""
        if data.full_name is not None:
            user.full_name = data.full_name
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_company_employees(db: Session, company_id: int) -> List[User]:
        """Get all employees for a company."""
        return db.query(User).filter(
            User.company_id == company_id,
            User.role == "employee"
        ).all()
    
    @staticmethod
    def get_employee_by_id(db: Session, company_id: int, employee_id: int) -> User:
        """Get a specific employee for a company."""
        return db.query(User).filter(
            User.id == employee_id,
            User.company_id == company_id,
            User.role == "employee"
        ).first()
