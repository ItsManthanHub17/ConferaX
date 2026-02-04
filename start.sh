#!/bin/bash

# Smart RoomBook Backend - Quick Start Script
# This script helps set up and run the backend quickly

set -e  # Exit on error

echo "=================================="
echo "Smart RoomBook Backend Quick Start"
echo "=================================="
echo ""

# Check Python version
echo "🔍 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "   Found Python $python_version"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "   ✅ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "   ✅ Dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "   ⚠️  Please edit .env file with your database credentials!"
    echo "   Required: DATABASE_URL and SECRET_KEY"
    echo ""
    read -p "Press Enter to continue once .env is configured..."
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check database connection
echo ""
echo "🗄️  Checking database connection..."
python3 -c "
from app.core.database import engine
try:
    with engine.connect() as conn:
        print('   ✅ Database connection successful')
except Exception as e:
    print(f'   ❌ Database connection failed: {e}')
    print('   Please check your DATABASE_URL in .env')
    exit(1)
"

# Run migrations
echo ""
echo "🔄 Running database migrations..."
alembic upgrade head
echo "   ✅ Migrations completed"

# Ask about seeding
echo ""
read -p "📊 Do you want to seed initial data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python3 seed_data.py
fi

# Start server
echo ""
echo "=================================="
echo "🚀 Starting Smart RoomBook API..."
echo "=================================="
echo ""
echo "API will be available at:"
echo "   • Main API: http://localhost:8000"
echo "   • Swagger UI: http://localhost:8000/docs"
echo "   • ReDoc: http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000