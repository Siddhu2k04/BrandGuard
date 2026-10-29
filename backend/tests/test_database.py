import pytest
from fastapi.testclient import TestClient


def test_company_user_relationship(client: TestClient):
    """Test that company and user relationships are correctly established."""
    # Register a company
    response = client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Test Company",
            "company_description": "INVITE:test_code",
            "admin_full_name": "Admin User",
            "admin_email": "admin@test.com",
            "password": "SecurePass123!"
        }
    )
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["company_id"] is not None
    assert user_data["role"] == "company_admin"


def test_employee_company_relationship(client: TestClient):
    """Test that employees are correctly associated with companies."""
    # Create company
    client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Test Company",
            "company_description": "INVITE:test_invite_123",
            "admin_full_name": "Admin User",
            "admin_email": "admin@test.com",
            "password": "SecurePass123!"
        }
    )
    
    # Register employee
    response = client.post(
        "/api/v1/auth/register/employee",
        json={
            "full_name": "Employee User",
            "email": "employee@test.com",
            "password": "SecurePass123!",
            "invitation_code": "test_invite_123"
        }
    )
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["company_id"] is not None
    assert user_data["role"] == "employee"


def test_unique_email_constraint(client: TestClient):
    """Test that email uniqueness constraint is enforced."""
    # Register first user
    client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Test Company",
            "company_description": "INVITE:test_code",
            "admin_full_name": "Admin User",
            "admin_email": "admin@test.com",
            "password": "SecurePass123!"
        }
    )
    
    # Try to register second user with same email
    response = client.post(
        "/api/v1/auth/register/employee",
        json={
            "full_name": "Employee User",
            "email": "admin@test.com",
            "password": "SecurePass123!",
            "invitation_code": "test_code"
        }
    )
    assert response.status_code == 400
