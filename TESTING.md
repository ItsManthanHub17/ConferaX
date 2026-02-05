# Testing Documentation

## Overview

ConferaX includes comprehensive test coverage for both backend and frontend components to ensure reliability and maintainability.

## Test Structure

```
backend/
├── tests/
│   ├── conftest.py                    # Shared fixtures and configuration
│   ├── integration/                   # API endpoint tests
│   │   ├── test_auth.py              # Authentication tests
│   │   ├── test_users.py             # Users CRUD tests
│   │   ├── test_rooms.py             # Rooms CRUD tests
│   │   └── test_bookings.py          # Bookings CRUD tests
│   └── unit/                          # Service layer tests
│       ├── test_auth_service.py      # Auth logic tests
│       ├── test_user_service.py      # User management tests
│       └── test_booking_service.py   # Booking logic tests
│
frontend/
└── __tests__/
    ├── Login.test.tsx                 # Login component tests
    └── BookingForm.test.tsx           # Booking form tests
```

## Backend Testing

### Test Coverage

- ✅ **Authentication**: Login, token validation, user session
- ✅ **Users Module**: Create, read, update, delete (CRUD)
- ✅ **Rooms Module**: Complete CRUD operations with admin checks
- ✅ **Bookings Module**: CRUD + conflict detection logic
- ✅ **Service Layer**: Business logic unit tests
- ✅ **Target**: 60%+ code coverage

### Running Backend Tests

**Option 1: Run all tests with coverage (Recommended)**
```bash
cd /home/cygnet/backend
./run_tests.sh
```

**Option 2: Using pytest directly**
```bash
cd /home/cygnet/backend/backend
pytest tests/ --cov=app --cov-report=html --cov-report=term -v
```

**Option 3: Run specific test files**
```bash
pytest tests/integration/test_auth.py -v
pytest tests/unit/test_booking_service.py -v
```

**Option 4: Run in Docker**
```bash
/usr/local/bin/docker-compose exec backend pytest tests/ --cov=app --cov-report=term -v
```

### View Coverage Report

After running tests with coverage:
```bash
# Open HTML coverage report
cd backend
python3 -m http.server 8080
# Then visit: http://localhost:8080/htmlcov/
```

## Frontend Testing

### Test Coverage

- ✅ **Login Component**: Form validation, submission, error handling
- ✅ **BookingForm Component**: Form validation, room selection, date/time logic

### Running Frontend Tests

**Option 1: Using test script**
```bash
cd /home/cygnet/backend
./run_frontend_tests.sh
```

**Option 2: Using npm directly**
```bash
cd /home/cygnet/backend/frontend
npm install  # First time only
npm run test
```

**Option 3: Watch mode (for development)**
```bash
cd frontend
npm run test -- --watch
```

**Option 4: UI mode (interactive)**
```bash
npm run test:ui
```

**Option 5: With coverage**
```bash
npm run test:coverage
```

## Running All Tests

To run both backend and frontend tests:

```bash
# Backend tests
./run_tests.sh

# Frontend tests
./run_frontend_tests.sh
```

## Test Requirements Met

### Backend (pytest)
- ✅ Authentication endpoint tests
- ✅ 3+ CRUD APIs per module:
  - **Users**: Register, Get, Update, Delete + Profile management
  - **Rooms**: Create, List, Get, Update, Delete + Availability
  - **Bookings**: Create, List, Get, Update, Delete + Conflict detection
- ✅ Service layer unit tests
- ✅ 60%+ code coverage
- ✅ Runnable in Docker containers

### Frontend (Vitest + React Testing Library)
- ✅ Login component tests (authentication flow)
- ✅ BookingForm component tests (form validation)
- ✅ User interaction testing
- ✅ Error handling validation

## Test Database

Tests use an **in-memory SQLite database** that is:
- ✅ Isolated from production/development database
- ✅ Created fresh for each test
- ✅ Automatically cleaned up after tests
- ✅ Fast and reliable

**Your real data is safe!** Tests never touch the PostgreSQL database.

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Backend Tests
  run: |
    cd backend
    pytest tests/ --cov=app --cov-report=xml

- name: Run Frontend Tests
  run: |
    cd frontend
    npm install
    npm run test
```

## Test Fixtures

Common test data available in all tests:

- `test_user`: Regular user (john.doe@cygnet.one / john@2026)
- `test_admin`: Admin user (admin.user@cygnet.one / admin@2026)
- `test_room`: Sample conference room
- `test_booking`: Sample approved booking
- `auth_headers`: Authentication headers for regular user
- `admin_headers`: Authentication headers for admin user

## Writing New Tests

### Backend Example
```python
def test_my_feature(client, auth_headers):
    """Test description."""
    response = client.get("/api/v1/endpoint", headers=auth_headers)
    assert response.status_code == 200
```

### Frontend Example
```typescript
it('renders component correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
})
```

## Troubleshooting

**Backend tests failing?**
```bash
# Install/update dependencies
cd backend
pip install -r requirements.txt

# Run individual test to see details
pytest tests/integration/test_auth.py::TestAuthLogin::test_login_with_valid_credentials -v
```

**Frontend tests failing?**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install

# Check for TypeScript errors
npm run build
```

## Additional Resources

- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
