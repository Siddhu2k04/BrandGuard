import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.config import settings

# Use a separate test database
TEST_DATABASE_URL = "mysql+pymysql://root:Gaju155%40@localhost:3306/brand_compliance_test"

engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session):
    """Create a test client with a test database."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def company_token(client: TestClient):
    """Create a company and return its admin token."""
    response = client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Test Company",
            "company_description": "INVITE:test_invite_code_12345",
            "admin_full_name": "Admin User",
            "admin_email": "admin@test.com",
            "password": "SecurePass123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    
    # Login to get token
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@test.com",
            "password": "SecurePass123!"
        }
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture
def company_with_employees(client: TestClient):
    """Create a company with employees and return company data."""
    # Create company
    client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Test Company",
            "company_description": "INVITE:test_invite_code_12345",
            "admin_full_name": "Admin User",
            "admin_email": "admin@test.com",
            "password": "SecurePass123!"
        }
    )
    
    # Create employee
    client.post(
        "/api/v1/auth/register/employee",
        json={
            "full_name": "Employee User",
            "email": "employee@test.com",
            "password": "SecurePass123!",
            "invitation_code": "test_invite_code_12345"
        }
    )
    
    return {"company_name": "Test Company", "admin_email": "admin@test.com"}


@pytest.fixture
def employee_token(client: TestClient, company_with_employees):
    """Create an employee and return its token."""
    # Login to get token
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "employee@test.com",
            "password": "SecurePass123!"
        }
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]
