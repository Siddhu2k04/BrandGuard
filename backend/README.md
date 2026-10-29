# BrandGuard Backend - Phase 1

AI-Powered Brand Guidelines Compliance System - Backend Foundation

## Overview

This is Phase 1 of the BrandGuard backend implementation. It provides a solid foundation for user authentication, company management, and role-based authorization. The system is designed to be extensible for future phases that will include brand guideline uploads, content submissions, and AI-powered compliance analysis.

## Phase 1 Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Role-Based Authorization**: Company administrators and employees with distinct permissions
- **Company Management**: Company registration and profile management
- **Employee Management**: Employee registration via invitation codes
- **Secure Password Handling**: Argon2 password hashing
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **API Documentation**: Automatic Swagger/OpenAPI documentation

## Technology Stack

- Python 3.12+
- FastAPI
- MySQL
- SQLAlchemy 2.0
- Alembic
- Pydantic v2
- JWT authentication (python-jose)
- Argon2 password hashing (passlib)
- pytest for testing

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── core/
│   │   ├── config.py          # Application configuration
│   │   ├── security.py        # Password hashing and JWT utilities
│   │   └── permissions.py     # Authorization dependencies
│   ├── db/
│   │   ├── session.py         # Database session management
│   │   └── base.py            # SQLAlchemy base class
│   ├── models/
│   │   ├── user.py            # User and RefreshToken models
│   │   └── company.py         # Company model
│   ├── schemas/
│   │   ├── auth.py            # Authentication request/response schemas
│   │   ├── user.py            # User-related schemas
│   │   └── company.py         # Company-related schemas
│   ├── api/
│   │   └── v1/
│   │       ├── router.py      # API router aggregation
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── users.py       # User profile endpoints
│   │       └── companies.py   # Company management endpoints
│   ├── services/
│   │   ├── auth_service.py    # Authentication business logic
│   │   ├── user_service.py    # User business logic
│   │   └── company_service.py # Company business logic
│   └── utils/
├── alembic/
│   ├── versions/              # Database migration files
│   ├── env.py                 # Alembic environment configuration
│   └── script.py.mako         # Migration script template
├── tests/
│   ├── conftest.py            # Pytest fixtures
│   ├── test_auth.py           # Authentication tests
│   ├── test_authorization.py  # Authorization tests
│   └── test_database.py       # Database tests
├── .env.example               # Environment variables template
├── .gitignore
├── alembic.ini                # Alembic configuration
├── requirements.txt           # Python dependencies
└── README.md
```

## Windows Setup Instructions

### Prerequisites

1. **Python 3.12+**: Download and install from [python.org](https://www.python.org/downloads/)
2. **MySQL**: Download and install from [mysql.com](https://dev.mysql.com/downloads/mysql/)
   - During installation, set a password for the root user
   - Note the port (default: 3306)

### Step 1: Navigate to the Backend Directory

Open PowerShell and navigate to the backend folder:

```powershell
cd "C:\Users\gajan\OneDrive\Documents\Hackathon's\BrandGuard_React_Frontend_Organized\backend"
```

### Step 2: Create a Python Virtual Environment

```powershell
python -m venv venv
```

### Step 3: Activate the Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

If you see an error about execution policies, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again.

### Step 4: Install Dependencies

```powershell
pip install -r requirements.txt
```

### Step 5: Create MySQL Database

Open MySQL Command Line Client or use MySQL Workbench:

**Using MySQL Command Line:**
```powershell
mysql -u root -p
```

Enter your MySQL root password when prompted, then run:

```sql
CREATE DATABASE brand_compliance;
CREATE DATABASE brand_compliance_test;
EXIT;
```

**Using MySQL Workbench:**
1. Open MySQL Workbench
2. Click on "Create a new schema" (database icon)
3. Name it `brand_compliance`
4. Click Apply
5. Repeat for `brand_compliance_test`

### Step 6: Configure Environment Variables

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit the `.env` file with your preferred text editor (Notepad, VS Code, etc.):

```env
APP_NAME=Brand Compliance System
APP_ENV=development
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/brand_compliance
JWT_SECRET_KEY=YOUR_SECURE_SECRET_KEY
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important**: Replace `YOUR_PASSWORD` with your MySQL root password and `YOUR_SECURE_SECRET_KEY` with a strong random string.

### Step 7: Generate a Secure JWT Secret Key

On Windows, you can generate a secure random secret using Python:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and use it as your `JWT_SECRET_KEY` in the `.env` file.

### Step 8: Initialize Alembic

Alembic is already configured, but if you need to reinitialize:

```powershell
alembic upgrade head
```

This will create all database tables using the migration in `alembic/versions/`.

### Step 9: Start the Development Server

```powershell
uvicorn app.main:app --reload
```

The server will start at `http://127.0.0.1:8000`

### Step 10: Access API Documentation

Open your browser and navigate to:

**Swagger UI (Interactive API Documentation):**
```
http://127.0.0.1:8000/docs
```

**ReDoc (Alternative Documentation):**
```
http://127.0.0.1:8000/redoc
```

### Step 11: Run Automated Tests

In a new PowerShell window (with the virtual environment activated):

```powershell
cd "C:\Users\gajan\OneDrive\Documents\Hackathon's\BrandGuard_React_Frontend_Organized\backend"
.\venv\Scripts\Activate.ps1
pytest -v
```

## API Endpoints

### Authentication

#### Register Company
```http
POST /api/v1/auth/register/company
Content-Type: application/json

{
  "company_name": "Acme Corp",
  "company_description": "INVITE:invite_code_123",
  "admin_full_name": "John Doe",
  "admin_email": "john@acme.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "john@acme.com",
  "full_name": "John Doe",
  "role": "company_admin",
  "company_id": 1,
  "is_active": true,
  "is_verified": true,
  "created_at": "2026-10-28T00:00:00Z"
}
```

#### Register Employee
```http
POST /api/v1/auth/register/employee
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "email": "jane@acme.com",
  "password": "SecurePass123!",
  "invitation_code": "invite_code_123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@acme.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "<refresh_token>"
}
```

### User Profile

#### Get My Profile
```http
GET /api/v1/users/me
Authorization: Bearer <access_token>
```

#### Update My Profile
```http
PATCH /api/v1/users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "John Updated"
}
```

### Company Management

#### Get My Company
```http
GET /api/v1/companies/me
Authorization: Bearer <access_token>
```

#### Update My Company (Admin Only)
```http
PATCH /api/v1/companies/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Acme Corp Updated",
  "description": "New description"
}
```

#### List Company Employees (Admin Only)
```http
GET /api/v1/companies/me/employees
Authorization: Bearer <access_token>
```

#### Get Specific Employee (Admin Only)
```http
GET /api/v1/companies/me/employees/{employee_id}
Authorization: Bearer <access_token>
```

## Registration Workflow

### Company Registration

1. Company admin provides company details and their own credentials
2. System creates the company and admin user in a single transaction
3. Admin is assigned the `company_admin` role
4. System returns the created user (without password hash)

### Employee Registration

1. Employee provides their details and an invitation code
2. System validates the invitation code against company records
3. If valid, employee is created with `employee` role
4. Employee is automatically associated with the company
5. System returns the created user

**Note**: In Phase 1, invitation codes are stored in the company description field for simplicity. In production, this should be a separate `invitation_codes` table with expiration and revocation support.

## Security Features

- **Password Hashing**: All passwords are hashed using Argon2 before storage
- **JWT Authentication**: Short-lived access tokens (15 minutes) with refresh token rotation
- **Role-Based Access Control**: Strict enforcement of role permissions
- **Input Validation**: All inputs validated using Pydantic schemas
- **SQL Injection Prevention**: SQLAlchemy ORM prevents SQL injection
- **CORS Protection**: Configurable CORS origins
- **Email Normalization**: Emails are normalized to lowercase before storage

## Database Schema

### Companies Table
- `id`: Primary key
- `name`: Company name (required)
- `description`: Optional description
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Users Table
- `id`: Primary key
- `email`: Unique, normalized email
- `password_hash`: Argon2 hashed password
- `full_name`: User's full name
- `role`: 'company_admin' or 'employee'
- `company_id`: Foreign key to companies
- `is_active`: Account status
- `is_verified`: Email verification status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Refresh Tokens Table
- `id`: Primary key
- `token_hash`: Hashed refresh token
- `user_id`: Foreign key to users
- `expires_at`: Expiration timestamp
- `revoked`: Revocation status
- `created_at`: Creation timestamp

## Testing

The project includes comprehensive tests for:

- Registration (company and employee)
- Authentication (login, logout, refresh tokens)
- Authorization (role-based access control)
- Database constraints and relationships

Run tests with:

```powershell
pytest -v
```

For detailed test output:

```powershell
pytest -v -s
```

To run specific test files:

```powershell
pytest tests/test_auth.py -v
pytest tests/test_authorization.py -v
pytest tests/test_database.py -v
```

## Development Notes

### Adding New Migrations

```powershell
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

### Code Style

The codebase follows Python best practices:
- Type hints where appropriate
- Clear function and variable names
- Separation of concerns (models, schemas, services, routes)
- Comprehensive error handling

### Environment Variables

All sensitive configuration is managed through environment variables:
- Never commit `.env` to version control
- Use different values for development and production
- Generate secure random secrets for production

## Phase 2 and Phase 3 Preparation

The architecture is designed to be easily extended for future phases:

- **Guidelines table**: Can be added to models with foreign key to companies
- **Submissions table**: Can be added with foreign key to users and companies
- **Analysis results table**: Can be added with foreign key to submissions
- **File storage**: Can be integrated using cloud storage services
- **AI services**: Can be added as new service modules
- **Background jobs**: Can be integrated using Celery or similar
- **Email notifications**: Can be added to the auth service

## Troubleshooting

### Database Connection Issues

If you see "could not connect to server":
1. Verify PostgreSQL is running
2. Check the DATABASE_URL in `.env`
3. Ensure the database exists
4. Verify the username and password

### Import Errors

If you see import errors:
1. Ensure the virtual environment is activated
2. Verify you're in the backend directory
3. Run `pip install -r requirements.txt` again

### Alembic Issues

If migrations fail:
1. Check the DATABASE_URL in `.env`
2. Ensure the database exists
3. Try `alembic upgrade head` again
4. Check the alembic/versions folder for migration files

## License

This project is part of the BrandGuard system.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
