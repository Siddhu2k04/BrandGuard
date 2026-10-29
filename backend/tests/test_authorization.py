import pytest
from fastapi.testclient import TestClient


def test_employee_cannot_access_admin_endpoint(client: TestClient, employee_token: str):
    """Test that employees cannot access admin-only endpoints."""
    response = client.patch(
        "/api/v1/companies/me",
        json={"name": "Updated Name"},
        headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert response.status_code == 403
    assert "Administrator access required" in response.json()["detail"]


def test_employee_cannot_change_role(client: TestClient, employee_token: str):
    """Test that employees cannot change their role."""
    response = client.patch(
        "/api/v1/users/me",
        json={"role": "company_admin"},
        headers={"Authorization": f"Bearer {employee_token}"}
    )
    # Should fail due to extra fields being forbidden
    assert response.status_code == 422


def test_admin_can_update_company(client: TestClient, company_token: str):
    """Test that company admins can update their company."""
    response = client.patch(
        "/api/v1/companies/me",
        json={"name": "Updated Company Name"},
        headers={"Authorization": f"Bearer {company_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Company Name"


def test_unauthorized_profile_access(client: TestClient):
    """Test that unauthorized users cannot access profile endpoints."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 403


def test_authorized_profile_access(client: TestClient, company_token: str):
    """Test that authorized users can access their profile."""
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {company_token}"}
    )
    assert response.status_code == 200


def test_user_can_update_own_profile(client: TestClient, company_token: str):
    """Test that users can update their own profile (safe fields only)."""
    response = client.patch(
        "/api/v1/users/me",
        json={"full_name": "Updated Name"},
        headers={"Authorization": f"Bearer {company_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"


def test_admin_can_list_employees(client: TestClient, company_token: str):
    """Test that admins can list employees."""
    response = client.get(
        "/api/v1/companies/me/employees",
        headers={"Authorization": f"Bearer {company_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_employee_cannot_list_employees(client: TestClient, employee_token: str):
    """Test that employees cannot list all employees."""
    response = client.get(
        "/api/v1/companies/me/employees",
        headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert response.status_code == 403
