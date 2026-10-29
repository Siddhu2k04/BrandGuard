from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Tuple
import secrets
from app.models.user import User, RefreshToken
from app.models.company import Company
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.schemas.auth import CompanyRegisterRequest, EmployeeRegisterRequest, LoginRequest


class AuthService:
    @staticmethod
    def register_company(db: Session, data: CompanyRegisterRequest) -> User:
        """Register a new company and its administrator."""
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == data.admin_email.lower()).first()
        if existing_user:
            raise ValueError("Email already registered")
        
        # Create company
        company = Company(
            name=data.company_name,
            description=data.company_description
        )
        db.add(company)
        db.flush()  # Get the company ID
        
        # Create admin user
        admin = User(
            email=data.admin_email.lower(),
            password_hash=get_password_hash(data.password),
            full_name=data.admin_full_name,
            role="company_admin",
            company_id=company.id,
            is_active=True,
            is_verified=True  # Auto-verify for company admin in Phase 1
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        return admin
    
    @staticmethod
    def register_employee(db: Session, data: EmployeeRegisterRequest) -> User:
        """Register a new employee using an invitation code."""
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == data.email.lower()).first()
        if existing_user:
            raise ValueError("Email already registered")
        
        # Find company by invitation code (stored in company description for Phase 1)
        # In production, this would be a separate invitation_codes table
        company = db.query(Company).filter(
            Company.description.like(f"%INVITE:{data.invitation_code}%")
        ).first()
        
        if not company:
            raise ValueError("Invalid or expired invitation code")
        
        # Create employee
        employee = User(
            email=data.email.lower(),
            password_hash=get_password_hash(data.password),
            full_name=data.full_name,
            role="employee",
            company_id=company.id,
            is_active=True,
            is_verified=True  # Auto-verify for Phase 1
        )
        db.add(employee)
        db.commit()
        db.refresh(employee)
        
        return employee
    
    @staticmethod
    def login(db: Session, data: LoginRequest) -> Tuple[User, str, Optional[str]]:
        """Authenticate a user and return tokens."""
        user = db.query(User).filter(User.email == data.email.lower()).first()
        
        if not user or not verify_password(data.password, user.password_hash):
            raise ValueError("Invalid email or password")
        
        if not user.is_active:
            raise ValueError("Account is inactive")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
        
        # Create refresh token
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Store refresh token hash in database
        from app.core.security import get_password_hash
        token_hash = get_password_hash(refresh_token)
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Revoke old refresh tokens for this user
        db.query(RefreshToken).filter(
            RefreshToken.user_id == user.id,
            RefreshToken.revoked == False
        ).update({"revoked": True})
        
        new_refresh_token = RefreshToken(
            token_hash=token_hash,
            user_id=user.id,
            expires_at=expires_at,
            revoked=False
        )
        db.add(new_refresh_token)
        db.commit()
        
        return user, access_token, refresh_token
    
    @staticmethod
    def refresh_token(db: Session, refresh_token: str) -> Tuple[str, Optional[str]]:
        """Refresh an access token using a refresh token."""
        from app.core.security import decode_token, get_password_hash, create_access_token, create_refresh_token
        
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid refresh token")
        
        # Check if refresh token exists and is not revoked
        token_hash = get_password_hash(refresh_token)
        stored_token = db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked == False
        ).first()
        
        if not stored_token:
            raise ValueError("Invalid or revoked refresh token")
        
        if stored_token.expires_at < datetime.utcnow():
            raise ValueError("Refresh token expired")
        
        # Get user
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")
        
        # Create new access token
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
        
        # Rotate refresh token
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        new_token_hash = get_password_hash(new_refresh_token)
        new_expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Revoke old token
        stored_token.revoked = True
        
        # Add new token
        new_stored_token = RefreshToken(
            token_hash=new_token_hash,
            user_id=user.id,
            expires_at=new_expires_at,
            revoked=False
        )
        db.add(new_stored_token)
        db.commit()
        
        return access_token, new_refresh_token
    
    @staticmethod
    def logout(db: Session, user: User) -> None:
        """Revoke all refresh tokens for a user."""
        db.query(RefreshToken).filter(
            RefreshToken.user_id == user.id,
            RefreshToken.revoked == False
        ).update({"revoked": True})
        db.commit()
