#!/bin/bash

# Al Ghadeer Events Management System - Startup Script

set -e

echo "🏋️ Al Ghadeer Events Management System"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if this is the first run
if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env.local" ]; then
    echo "🔧 First time setup detected. Creating environment files..."
    make setup
    echo ""
    echo "⚠️  Please configure your environment files:"
    echo "   1. Edit backend/.env"
    echo "   2. Edit frontend/.env.local"
    echo ""
    echo "Then run this script again."
    exit 0
fi

# Ask user for environment
echo "Select environment to start:"
echo "1) Development (with hot-reload and debug tools)"
echo "2) Production"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting development environment..."
        make dev-build
        make dev
        echo ""
        echo "✅ Development environment is ready!"
        echo ""
        echo "📍 Access points:"
        echo "   Frontend:        http://localhost:3000"
        echo "   Backend API:     http://localhost:8000"
        echo "   API Docs:        http://localhost:8000/docs"
        echo "   MongoDB Express: http://localhost:8081 (admin/admin123)"
        echo "   Redis Commander: http://localhost:8082"
        echo ""
        echo "📝 Default admin credentials:"
        echo "   Email:    admin@alghadeer.com"
        echo "   Password: admin123"
        echo ""
        echo "🛠️  Useful commands:"
        echo "   View logs:        make dev-logs"
        echo "   Stop system:      make dev-down"
        echo "   Backend shell:    make backend-shell"
        echo "   Frontend shell:   make frontend-shell"
        echo "   Database backup:  make db-backup"
        ;;
    2)
        echo ""
        echo "🚀 Starting production environment..."
        make prod-build
        make prod
        echo ""
        echo "✅ Production environment is ready!"
        echo ""
        echo "📍 Access the application at: http://localhost"
        echo ""
        echo "🛠️  Useful commands:"
        echo "   Stop system:     make prod-down"
        echo "   View status:     make status"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "For more commands, run: make help"
echo ""