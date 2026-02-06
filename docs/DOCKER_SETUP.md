# Docker Setup Guide - Cygnet Conference Room Booking System

## 🚀 Quick Start

### Prerequisites
- Docker installed: https://docs.docker.com/get-docker/
- Docker Compose installed: https://docs.docker.com/compose/install/

### Build & Start All Services

```bash
# Navigate to backend root
cd /home/cygnet/backend

# Build all images (first time only)
docker-compose build

# Start all 3 containers
docker-compose up -d

# Verify all services are running
docker-compose ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE                     STATUS                PORTS
xxx            cygnet_backend            Up (healthy)          0.0.0.0:8000->8000/tcp
xxx            cygnet_frontend           Up (healthy)          0.0.0.0:3000->80/tcp
xxx            postgres:15-alpine        Up (healthy)          0.0.0.0:5432->5432/tcp
```

---

## 📍 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Database:** localhost:5432 (postgres)

---

## 🔧 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop Services
```bash
# Stop all
docker-compose stop

# Stop specific
docker-compose stop backend
```

### Restart Services
```bash
docker-compose restart

# Restart specific
docker-compose restart backend
```

### Remove Everything (Clean Slate)
```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (deletes database!)
docker-compose down -v
```

### Rebuild After Code Changes
```bash
# Stop everything
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

---

## 💾 Database Credentials

Located in `/home/cygnet/backend/.env.docker`:
```
DB_USER=cygnet_user
DB_PASSWORD=cygnet_password
DB_NAME=conference_db
```

### Connect Directly to Database
```bash
# From your machine
psql -h localhost -p 5432 -U cygnet_user -d conference_db

# Or use docker exec
docker-compose exec db psql -U cygnet_user -d conference_db
```

---

## 🧪 Verify Services

### Check Backend Health
```bash
curl http://localhost:8000/health
# Expected: {"status": "ok"}
```

### Check Admin Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin.user@cygnet.one",
    "password":"Admin@2026"
  }'
# Expected: {"access_token": "...", "token_type": "bearer"}
```

### Check Frontend
```bash
curl -s http://localhost:3000 | head -5
# Expected: HTML output with React app
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 5432
lsof -ti:5432 | xargs kill -9
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Backend Can't Connect to Database
```bash
# Verify db is healthy
docker-compose ps db

# Check if db is initialized
docker-compose logs db

# Restart db
docker-compose restart db
```

### Frontend Can't Connect to Backend
```bash
# Verify backend is running
docker-compose logs backend

# Check if nginx is properly configured
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

---

## 📦 Environment Variables

### Backend (.env.docker)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret for JWT tokens (change in production!)
- `CORS_ORIGINS`: Allowed frontend origins
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiry time

### Frontend
- Automatically uses `/api` proxy through nginx in Docker
- Falls back to `http://localhost:8000/api/v1` in local dev

---

## 🚢 Production Notes

Before deploying to production:

1. Change `JWT_SECRET` in `.env.docker` to a strong random value
2. Update `CORS_ORIGINS` to your domain
3. Use environment-specific `.env` files
4. Consider using Docker secrets for sensitive data
5. Add HTTPS/SSL configuration to nginx
6. Set up logging and monitoring

---

## Architecture

```
┌─────────────────────────────────────────────┐
│          Docker Network (bridge)             │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐                            │
│  │   Frontend   │                            │
│  │  (Nginx)     │────┐                       │
│  │  Port 80     │    │                       │
│  └──────────────┘    │                       │
│       (3000)         │ Proxy                 │
│                      │                       │
│  ┌──────────────┐    │                       │
│  │   Backend    │◄───┘                       │
│  │ (FastAPI)    │                            │
│  │  Port 8000   │                            │
│  └──────────────┘                            │
│         │                                    │
│         │ TCP 5432                           │
│         ▼                                    │
│  ┌──────────────┐                            │
│  │  Database    │                            │
│  │ (PostgreSQL) │                            │
│  │  Port 5432   │                            │
│  └──────────────┘                            │
│                                              │
└─────────────────────────────────────────────┘

  ↕ (exposed to host)
  
  localhost:3000 (Frontend)
  localhost:8000 (Backend API)
  localhost:5432 (Database)
```

---

## 📝 File Structure

```
/home/cygnet/backend/
├── Dockerfile                 # Backend build
├── docker-compose.yml         # Service orchestration
├── .dockerignore              # Backend Docker ignore
├── .env.docker               # Environment variables
├── backend/
│   ├── app/                  # FastAPI app
│   ├── requirements.txt       # Python deps
│   └── alembic/              # Database migrations
├── frontend/
│   ├── Dockerfile            # Frontend build
│   ├── nginx.conf            # Nginx config
│   ├── .dockerignore         # Frontend Docker ignore
│   ├── package.json          # Node deps
│   ├── src/                  # React app
│   └── dist/                 # Built app (after npm run build)
```

---

## ✅ First Run Checklist

- [ ] Docker & Docker Compose installed
- [ ] `cd /home/cygnet/backend`
- [ ] `docker-compose build`
- [ ] `docker-compose up -d`
- [ ] `docker-compose ps` shows 3 healthy containers
- [ ] `curl http://localhost:8000/health` returns ok
- [ ] `curl http://localhost:3000` returns HTML
- [ ] Frontend loads at http://localhost:3000
- [ ] Login works with admin.user@cygnet.one / Admin@2026
