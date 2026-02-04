#!/bin/bash

echo "=========================================="
echo "Testing Smart RoomBook API Endpoints"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8000"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1. Testing Auth - Login"
echo "----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cygnet.one", "password": "admin123"}')
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
else
  echo -e "${RED}✗ Login failed${NC}"
  exit 1
fi
echo ""

echo "2. Testing Auth - Get Current User"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ Get current user${NC}"
echo ""

echo "3. Testing Users - Get My Profile"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo -e "${GREEN}✓ Get my profile${NC}"
echo ""

echo "4. Testing Rooms - Create Room"
echo "----------------------------------------"
ROOM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conference Room A",
    "capacity": 10,
    "location": "Building 1, Floor 2",
    "features": ["projector", "whiteboard", "video_conference"]
  }')
echo "$ROOM_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ROOM_RESPONSE"

ROOM_ID=$(echo "$ROOM_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
if [ -n "$ROOM_ID" ]; then
  echo -e "${GREEN}✓ Room created with ID: $ROOM_ID${NC}"
else
  echo -e "${YELLOW}⚠ Room creation returned unexpected response${NC}"
fi
echo ""

echo "5. Testing Rooms - Get All Rooms"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/v1/rooms" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || echo "Error getting rooms"
echo ""

if [ -n "$ROOM_ID" ]; then
  echo "6. Testing Rooms - Get Room by ID"
  echo "----------------------------------------"
  curl -s -X GET "$BASE_URL/api/v1/rooms/$ROOM_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
  echo -e "${GREEN}✓ Get room by ID${NC}"
  echo ""

  echo "7. Testing Rooms - Update Room"
  echo "----------------------------------------"
  curl -s -X PUT "$BASE_URL/api/v1/rooms/$ROOM_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Conference Room A - Updated",
      "capacity": 12,
      "location": "Building 1, Floor 2",
      "features": ["projector", "whiteboard", "video_conference", "smart_board"]
    }' | python3 -m json.tool
  echo -e "${GREEN}✓ Room updated${NC}"
  echo ""
fi

echo "8. Testing Bookings - Create Booking"
echo "----------------------------------------"
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"room_id\": \"$ROOM_ID\",
    \"title\": \"Team Meeting\",
    \"description\": \"Weekly team sync\",
    \"start_time\": \"2026-02-05T10:00:00\",
    \"end_time\": \"2026-02-05T11:00:00\"
  }")
echo "$BOOKING_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$BOOKING_RESPONSE"

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
if [ -n "$BOOKING_ID" ]; then
  echo -e "${GREEN}✓ Booking created with ID: $BOOKING_ID${NC}"
else
  echo -e "${YELLOW}⚠ Booking creation returned unexpected response${NC}"
fi
echo ""

echo "9. Testing Bookings - Get All Bookings"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/v1/bookings" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || echo "Error getting bookings"
echo ""

if [ -n "$BOOKING_ID" ]; then
  echo "10. Testing Bookings - Get Booking by ID"
  echo "----------------------------------------"
  curl -s -X GET "$BASE_URL/api/v1/bookings/$BOOKING_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
  echo -e "${GREEN}✓ Get booking by ID${NC}"
  echo ""

  echo "11. Testing Bookings - Update Booking"
  echo "----------------------------------------"
  curl -s -X PUT "$BASE_URL/api/v1/bookings/$BOOKING_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"room_id\": \"$ROOM_ID\",
      \"title\": \"Team Meeting - Updated\",
      \"description\": \"Weekly team sync with agenda\",
      \"start_time\": \"2026-02-05T10:00:00\",
      \"end_time\": \"2026-02-05T11:30:00\"
    }" | python3 -m json.tool
  echo -e "${GREEN}✓ Booking updated${NC}"
  echo ""

  echo "12. Testing Bookings - Check Conflicts"
  echo "----------------------------------------"
  curl -s -X GET "$BASE_URL/api/v1/bookings/$BOOKING_ID/conflicts" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
  echo -e "${GREEN}✓ Check conflicts${NC}"
  echo ""

  echo "13. Testing Bookings - Approve Booking"
  echo "----------------------------------------"
  curl -s -X POST "$BASE_URL/api/v1/bookings/$BOOKING_ID/approve" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
  echo -e "${GREEN}✓ Booking approved${NC}"
  echo ""
fi

echo "=========================================="
echo "API Testing Complete!"
echo "=========================================="
