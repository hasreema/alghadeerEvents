#!/bin/bash

# Al Ghadeer Events Management System - Ubuntu-based Startup (SSL-friendly)

set -e

echo "🏋️ Al Ghadeer Events Management System (Ubuntu Edition)"
echo "=================================================="
echo "Using Ubuntu-based containers to avoid SSL issues"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
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

echo "🚀 Starting development environment (Ubuntu-based)..."
echo ""

# Build and start
echo "Building containers..."
docker-compose -f docker-compose.dev.ubuntu.yml build

echo ""
echo "Starting services..."
docker-compose -f docker-compose.dev.ubuntu.yml up -d

echo ""
echo "✅ Development environment is starting!"
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
echo "   View logs:        docker-compose -f docker-compose.dev.ubuntu.yml logs -f"
echo "   Stop system:      docker-compose -f docker-compose.dev.ubuntu.yml down"
echo "   Backend shell:    make backend-shell"
echo "   Frontend shell:   make frontend-shell"
echo ""
echo "Note: This version uses Ubuntu-based containers to avoid SSL certificate issues."
echo "It may take a bit longer to build initially but is more reliable."
echo ""