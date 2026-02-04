# Conference Room Booking System

Full-stack application with **FastAPI**, **React/Vite**, and **PostgreSQL**. Includes Dockerized deployment with three containers (frontend, backend, database).

## Quick Start (Docker)

```bash
# Build images
sudo docker-compose build

# Start containers
sudo docker-compose up -d

# Check status
sudo docker-compose ps
```

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:5432

## Local Development (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

- Copy .env.example → .env
- Copy .env.docker.example → .env.docker (for Docker)
- Copy frontend/.env.local.example → frontend/.env.local

## Documentation
- Docker guide: DOCKER_SETUP.md

## Default Accounts (if seeded)
- Admin: admin.user@cygnet.one / Admin@2026
- User: user.one@cygnet.one / UserOne@2026
- User: user.two@cygnet.one / UserTwo@2026
