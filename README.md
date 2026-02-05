# ConferaX - Conference Room Booking System

A full-stack conference room booking application built with FastAPI, React, and PostgreSQL. This project includes user authentication, role-based access control, and a complete booking management system.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [Setup & Installation](#setup--installation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Sample Credentials](#sample-credentials)

## Overview

ConferaX is a conference room booking system that allows users to browse available rooms and create bookings. Admins can manage users, rooms, and view all bookings in the system. The application uses JWT authentication for security and includes comprehensive test coverage.

### Main Features

- User authentication with JWT tokens
- Role-based access (Admin and User roles)
- Room management and availability checking
- Booking creation with time conflict validation
- User profile management
- Admin dashboard for system overview

## Features

### User Management
- JWT-based authentication
- Admin-only user creation (no self-registration)
- User and Admin roles
- Profile management

### Room Management
- Create and manage conference rooms
- Room capacity and description
- Active/inactive room status
- Room search functionality

### Booking System
- Time-based booking with date/time selection
- Automatic conflict detection to prevent double bookings
- View and manage your bookings
- Update or cancel bookings
- Different booking statuses (PENDING, CONFIRMED, CANCELLED)

### Admin Features
- View all system bookings
- Manage users (create, update, delete)
- Manage rooms
- System-wide overview

## Technology Stack

### Frontend
- React 19.2.4
- TypeScript 5.8.2
- Vite 6.2.0 (build tool)
- Tailwind CSS 3.4.1
- Axios for API calls

### Backend
- FastAPI 0.104.1
- Python 3.10+
- SQLAlchemy 2.0.23 (ORM)
- Alembic 1.12.1 (migrations)
- Pydantic 2.5.0 (validation)
- PyJWT 2.8.0 (authentication)
- Bcrypt 4.1.1 (password hashing)

### Database & Deployment
- PostgreSQL 15
- Docker & Docker Compose
- Nginx (frontend server)

### Testing
- Backend: pytest, pytest-cov (69% coverage)
- Frontend: vitest, React Testing Library

## Database Design

The application uses three main tables with UUID primary keys:

### ER Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     USERS       │         │     ROOMS       │         │    BOOKINGS     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK, UUID)   │         │ id (PK, UUID)   │         │ id (PK, UUID)   │
│ email (UNIQUE)  │         │ name (UNIQUE)   │         │ user_id (FK)    │───┐
│ name            │         │ capacity        │         │ room_id (FK)    │───┤
│ hashed_password │         │ description     │         │ start_time      │   │
│ role            │         │ is_active       │         │ end_time        │   │
│ avatar          │         │ created_at      │         │ status          │   │
│ is_active       │         │ updated_at      │         │ created_at      │   │
│ created_at      │         └─────────────────┘         │ updated_at      │   │
│ updated_at      │                 │                    └─────────────────┘   │
└─────────────────┘                 │                            │              │
        │                            │                            │              │
        │                            └────────────────────────────┘              │
        │                                                                         │
        └─────────────────────────────────────────────────────────────────────────┘

Relationships:
- users (1) ──────< (N) bookings    [One user can have many bookings]
- rooms (1) ──────< (N) bookings    [One room can have many bookings]
```

### Schema Details

**Users Table**
- **Primary Key**: UUID (auto-generated)
- **Unique Constraints**: email
- **Indexes**: email
- **Roles**: USER, ADMIN
- **Password**: Bcrypt hashed with salt

**Rooms Table**
- **Primary Key**: UUID (auto-generated)
- **Unique Constraints**: name
- **Indexes**: name, is_active
- **Soft Delete**: is_active flag

**Bookings Table**
- **Primary Key**: UUID (auto-generated)
- **Foreign Keys**: user_id → users.id, room_id → rooms.id
- **Indexes**: user_id, room_id, start_time, end_time
- **Status**: PENDING, CONFIRMED, CANCELLED
- **Constraints**: start_time < end_time, no overlapping bookings

## Setup & Installation

### Prerequisites

- Docker and Docker Compose (v2.24.5 or higher)
- Python 3.10+ (for local development)
- Node.js 18+ (for local development)

### Docker Setup (Recommended)

1. Clone the repository
```bash
git clone https://github.com/ItsManthanHub17/ConferaX.git
cd ConferaX
```

2. Start all services
```bash
docker-compose up -d
```

3. Check if containers are running
```bash
docker ps
```

4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- pgAdmin: http://localhost:5050

5. Initialize database (first time only)
```bash
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/ensure_admin_user.py
```

### Local Development Setup

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` file in backend directory:
```
DATABASE_URL=postgresql://user:password@localhost:5432/conference_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## API Documentation

Base URL: `http://localhost:8000/api/v1`

Interactive documentation available at: http://localhost:8000/docs

### Authentication

**POST /auth/login** - User login
```json
{
  "email": "admin.user@cygnet.one",
  "password": "Admin@2026"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "admin.user@cygnet.one",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### User Endpoints

- **GET /users/me** - Get current user profile (requires auth)
- **GET /users/** - List all users (admin only)
- **POST /users/** - Create new user (admin only)
- **POST /users/** - Create new user (admin only)
- **PUT /users/{user_id}** - Update user (admin only)
- **DELETE /users/{user_id}** - Delete user (admin only)

### Room Endpoints

- **GET /rooms/** - List all rooms (requires auth)
- **GET /rooms/{room_id}** - Get room details (requires auth)
- **POST /rooms/** - Create room (admin only)
- **PUT /rooms/{room_id}** - Update room (admin only)
- **DELETE /rooms/{room_id}** - Delete room (admin only)

### Booking Endpoints

- **GET /bookings/** - Get user's bookings (requires auth)
- **GET /bookings/all** - Get all bookings (admin only)
- **POST /bookings/** - Create booking (requires auth)
- **PUT /bookings/{booking_id}** - Update booking (owner or admin)
- **DELETE /bookings/{booking_id}** - Cancel booking (owner or admin)

Example booking creation:
```json
{
  "room_id": "uuid",
  "start_time": "2026-02-10T09:00:00",
  "end_time": "2026-02-10T11:00:00"
}
```

## Testing

The project includes comprehensive testing with 69% backend code coverage.

### Test Coverage

- **Total Tests**: 85 tests
- **Backend Coverage**: 69%
- Authentication: 10 tests
- Users API: 14 tests
- Rooms API: 15 tests
- Bookings API: 21 tests
- Service Layer: 25 tests

### Running Tests

Backend:
```bash
./run_tests.sh
```

Frontend:
```bash
./run_frontend_tests.sh
```

With coverage report:
```bash
cd backend
pytest --cov=app --cov-report=html
```

See [TESTING.md](TESTING.md) for detailed testing documentation.

## Sample Credentials

### Admin Account
```
Email: admin.user@cygnet.one
Password: Admin@2026
```

Admin users can:
- Create and manage users
- Manage all rooms
- View and manage all bookings
- Access admin dashboard

### Regular User Accounts
```
Email: user.one@cygnet.one
Password: UserOne@2026
```

```
Email: user.two@cygnet.one
Password: UserTwo@2026
```

Regular users can:
- View available rooms
- Create their own bookings
- View and cancel their own bookings
- Update their profile

---

## Project Documentation

- [TESTING.md](TESTING.md) - Complete testing documentation
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Docker setup guide
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md) - Git workflow and branching strategy

## Author

Manthan - [@ItsManthanHub17](https://github.com/ItsManthanHub17)
