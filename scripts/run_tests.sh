#!/bin/bash
# Run all backend tests with coverage

echo "========================================="
echo "Running ConferaX Backend Tests"
echo "========================================="

cd backend

# Run tests with coverage
pytest tests/ \
  --cov=app \
  --cov-report=html \
  --cov-report=term \
  --cov-report=xml \
  --verbose \
  --tb=short

echo ""
echo "========================================="
echo "Test Execution Complete!"
echo "========================================="
echo ""
echo "Coverage reports generated:"
echo "  - HTML: backend/htmlcov/index.html"
echo "  - XML: backend/coverage.xml"
echo ""
