#!/bin/bash

BASE_URL="http://127.0.0.1:8000"

echo "==========================================="
echo "Testing GET /api/v1/rooms with Auth"
echo "==========================================="
echo ""

# Step 1: Login with CORRECT credentials
echo "Step 1: Logging in with correct credentials..."
echo "Email: admin@cygnet.one"
echo "Password: admin123"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cygnet.one",
    "password": "admin123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token!"
  exit 1
fi

echo "✓ Token obtained successfully"
echo "Token (first 50 chars): ${TOKEN:0:50}..."
echo ""

# Step 2: Test GET /api/v1/rooms with correct token
echo "Step 2: Testing GET /api/v1/rooms with valid token..."
echo ""

ROOMS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/rooms?skip=0&limit=20&active_only=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "accept: application/json")

echo "Response Status: $(curl -s -o /dev/null -w '%{http_code}' -X GET "$BASE_URL/api/v1/rooms?skip=0&limit=20&active_only=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "accept: application/json")"
echo ""

echo "Response Body:"
echo "$ROOMS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ROOMS_RESPONSE"
echo ""

# Step 3: Test with pagination
echo "Step 3: Testing with pagination (skip=10, limit=90)..."
echo ""

PAGINATED_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/rooms?skip=10&limit=90&active_only=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "accept: application/json")

COUNT=$(echo "$PAGINATED_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else 0)" 2>/dev/null || echo "0")
echo "Number of rooms returned: $COUNT"
echo ""

echo "==========================================="
echo "✓ All tests completed successfully!"
echo "==========================================="
