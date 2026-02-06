#!/bin/bash
# Run frontend tests

echo "========================================="
echo "Running ConferaX Frontend Tests"
echo "========================================="

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run tests
npm run test

echo ""
echo "========================================="
echo "Frontend Test Execution Complete!"
echo "========================================="
