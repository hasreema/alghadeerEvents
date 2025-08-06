#!/bin/bash

# Al Ghadeer Events Management System - Local Installation (No Docker)

echo "🏋️ Al Ghadeer Events Management System - Local Installation"
echo "========================================================"
echo "This script installs the system locally without Docker."
echo "Useful when Docker has SSL/certificate issues."
echo ""

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        return 1
    else
        echo "✅ $1 is installed"
        return 0
    fi
}

echo "Checking prerequisites..."
all_good=true

check_command python3 || all_good=false
check_command pip3 || all_good=false
check_command node || all_good=false
check_command npm || all_good=false
check_command mongod || all_good=false

if [ "$all_good" = false ]; then
    echo ""
    echo "Please install missing prerequisites:"
    echo "- Python 3.9+: https://www.python.org/downloads/"
    echo "- Node.js 18+: https://nodejs.org/"
    echo "- MongoDB: https://www.mongodb.com/try/download/community"
    exit 1
fi

echo ""
echo "All prerequisites are installed!"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate || . venv/Scripts/activate

# Install Python dependencies
echo "Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created backend/.env - please configure it"
fi

cd ..

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd frontend

# Configure npm for SSL issues
npm config set strict-ssl false
npm config set registry http://registry.npmjs.org/

# Install dependencies
echo "Installing npm packages..."
npm install --legacy-peer-deps || npm install --force

# Copy environment file
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "Created frontend/.env.local - please configure it"
fi

cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To run the system:"
echo ""
echo "1. Start MongoDB (in a new terminal):"
echo "   mongod --dbpath /path/to/your/data"
echo ""
echo "2. Start the backend (in a new terminal):"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "3. Start the frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Default admin credentials:"
echo "   Email: admin@alghadeer.com"
echo "   Password: admin123"
echo ""