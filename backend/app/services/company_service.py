from sqlalchemy.orm import Session
from app.models.company import Company
from app.schemas.company import CompanyUpdateRequest
import secrets


class CompanyService:
    @staticmethod
    def get_company_by_id(db: Session, company_id: int) -> Company:
        """Get a company by ID."""
        return db.query(Company).filter(Company.id == company_id).first()
    
    @staticmethod
    def update_company(db: Session, company: Company, data: CompanyUpdateRequest) -> Company:
        """Update company information."""
        if data.name is not None:
            company.name = data.name
        if data.description is not None:
            company.description = data.description
        
        db.commit()
        db.refresh(company)
        return company
    
    @staticmethod
    def generate_invitation_code(db: Session, company: Company) -> str:
        """Generate and store an invitation code for a company."""
        # Generate a secure random code
        code = secrets.token_urlsafe(16)
        
        # Store it in the company description (for Phase 1 simplicity)
        # In production, this would be a separate invitation_codes table
        if company.description:
            company.description = f"{company.description}\nINVITE:{code}"
        else:
            company.description = f"INVITE:{code}"
        
        db.commit()
        db.refresh(company)
        return code
