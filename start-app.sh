#!/usr/bin/env bash
set -e

echo "🚀 Starting Smart RoomBook Application..."

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! pg_isready -q 2>/dev/null; then
  echo -e "${YELLOW}⚠️  PostgreSQL is not running. Please start it first.${NC}"
  exit 1
fi

echo -e "${BLUE}📊 Ensuring admin user...${NC}"
cd /home/cygnet/backend
PYTHONPATH=/home/cygnet/backend/backend /home/cygnet/backend/venv/bin/python /home/cygnet/backend/backend/scripts/ensure_admin_user.py

echo -e "${GREEN}✓ Admin user ready${NC}"

echo -e "${BLUE}🔧 Starting Backend API (port 8000)...${NC}"
cd /home/cygnet/backend/backend
PYTHONPATH=/home/cygnet/backend/backend /home/cygnet/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

sleep 3
if ! curl -s http://localhost:8000/health > /dev/null; then
  echo -e "${YELLOW}⚠️  Backend failed to start. Check /tmp/backend.log${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✓ Backend running at http://localhost:8000${NC}"

echo -e "${BLUE}🎨 Starting Frontend (port 3000)...${NC}"
cd /home/cygnet/backend/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Smart RoomBook is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "  🔧 Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "  📚 API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Login Credentials:${NC}"
echo -e "  📧 Email:     admin.user@cygnet.one"
echo -e "  🔑 Password:  user.one@cygnet.one"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Backend:  /tmp/backend.log"
echo -e "  Frontend: /tmp/frontend.log"
echo ""
echo -e "Press Ctrl+C to stop all services..."
echo ""

cleanup() {
  echo ""
  echo -e "${YELLOW}🛑 Stopping services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo -e "${GREEN}✓ Services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

wait
