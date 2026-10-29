from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.company import CompanyResponse, CompanyUpdateRequest
from app.schemas.user import EmployeeListResponse
from app.services.company_service import CompanyService
from app.services.user_service import UserService
from app.core.permissions import require_active_user, require_company_admin, get_current_company

router = APIRouter()


@router.get("/me", response_model=CompanyResponse)
def get_my_company(current_company = Depends(get_current_company)):
    """Get the current user's company information."""
    return current_company


@router.patch("/me", response_model=CompanyResponse)
def update_my_company(
    data: CompanyUpdateRequest,
    current_company = Depends(get_current_company),
    current_user = Depends(require_company_admin),
    db: Session = Depends(get_db)
):
    """Update the current company's information (admin only)."""
    company = CompanyService.update_company(db, current_company, data)
    return company


@router.get("/me/employees", response_model=List[EmployeeListResponse])
def list_company_employees(
    current_company = Depends(get_current_company),
    current_user = Depends(require_company_admin),
    db: Session = Depends(get_db)
):
    """List all employees in the current company (admin only)."""
    employees = UserService.get_company_employees(db, current_company.id)
    return employees


@router.get("/me/employees/{employee_id}", response_model=EmployeeListResponse)
def get_company_employee(
    employee_id: int,
    current_company = Depends(get_current_company),
    current_user = Depends(require_company_admin),
    db: Session = Depends(get_db)
):
    """Get a specific employee in the current company (admin only)."""
    employee = UserService.get_employee_by_id(db, current_company.id, employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return employee
