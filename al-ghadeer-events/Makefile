# Makefile for Al Ghadeer Events Management System

.PHONY: help
help:
	@echo "Al Ghadeer Events Management System - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev           - Start development environment with hot-reload"
	@echo "  make dev-build     - Build development containers"
	@echo "  make dev-down      - Stop development environment"
	@echo "  make dev-logs      - Show development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod          - Start production environment"
	@echo "  make prod-build    - Build production containers"
	@echo "  make prod-down     - Stop production environment"
	@echo ""
	@echo "Database:"
	@echo "  make db-shell      - Access MongoDB shell"
	@echo "  make db-backup     - Backup database"
	@echo "  make db-restore    - Restore database from backup"
	@echo "  make mongo-express - Open MongoDB web UI (dev only)"
	@echo ""
	@echo "Backend:"
	@echo "  make backend-shell - Access backend container shell"
	@echo "  make backend-logs  - Show backend logs"
	@echo "  make backend-test  - Run backend tests"
	@echo "  make migrate       - Run database migrations"
	@echo ""
	@echo "Frontend:"
	@echo "  make frontend-shell - Access frontend container shell"
	@echo "  make frontend-logs  - Show frontend logs"
	@echo "  make frontend-test  - Run frontend tests"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean         - Clean up containers and volumes"
	@echo "  make reset         - Reset everything (WARNING: deletes all data)"
	@echo "  make setup         - Initial setup (copy env files)"
	@echo "  make status        - Show container status"

# Development commands
.PHONY: dev
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "MongoDB Express: http://localhost:8081 (admin/admin123)"
	@echo "Redis Commander: http://localhost:8082"

.PHONY: dev-build
dev-build:
	docker-compose -f docker-compose.dev.yml build

.PHONY: dev-down
dev-down:
	docker-compose -f docker-compose.dev.yml down

.PHONY: dev-logs
dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
.PHONY: prod
prod:
	docker-compose up -d
	@echo "Production environment started!"
	@echo "Application: http://localhost"

.PHONY: prod-build
prod-build:
	docker-compose build

.PHONY: prod-down
prod-down:
	docker-compose down

# Database commands
.PHONY: db-shell
db-shell:
	docker exec -it alghadeer_mongodb_dev mongosh -u admin -p admin123

.PHONY: db-backup
db-backup:
	@mkdir -p backups
	docker exec alghadeer_mongodb_dev mongodump -u admin -p admin123 --authenticationDatabase admin --db al_ghadeer_events --out /tmp/backup
	docker cp alghadeer_mongodb_dev:/tmp/backup ./backups/backup_$(shell date +%Y%m%d_%H%M%S)
	docker exec alghadeer_mongodb_dev rm -rf /tmp/backup
	@echo "Database backed up to ./backups/"

.PHONY: db-restore
db-restore:
	@echo "Available backups:"
	@ls -la ./backups/
	@echo ""
	@echo "To restore, run: docker cp ./backups/backup_TIMESTAMP alghadeer_mongodb_dev:/tmp/restore"
	@echo "Then: docker exec alghadeer_mongodb_dev mongorestore -u admin -p admin123 --authenticationDatabase admin --db al_ghadeer_events /tmp/restore/al_ghadeer_events"

.PHONY: mongo-express
mongo-express:
	@echo "Opening MongoDB Express..."
	@echo "URL: http://localhost:8081"
	@echo "Username: admin"
	@echo "Password: admin123"

# Backend commands
.PHONY: backend-shell
backend-shell:
	docker exec -it alghadeer_backend_dev /bin/bash

.PHONY: backend-logs
backend-logs:
	docker logs -f alghadeer_backend_dev

.PHONY: backend-test
backend-test:
	docker exec alghadeer_backend_dev pytest -v

.PHONY: migrate
migrate:
	docker exec alghadeer_backend_dev python -m app.migrate

# Frontend commands
.PHONY: frontend-shell
frontend-shell:
	docker exec -it alghadeer_frontend_dev /bin/sh

.PHONY: frontend-logs
frontend-logs:
	docker logs -f alghadeer_frontend_dev

.PHONY: frontend-test
frontend-test:
	docker exec alghadeer_frontend_dev npm test

# Utility commands
.PHONY: clean
clean:
	docker-compose -f docker-compose.dev.yml down
	docker-compose down
	docker system prune -f

.PHONY: reset
reset:
	@echo "WARNING: This will delete all containers, volumes, and data!"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	docker system prune -af
	rm -rf backend/uploads/* backend/logs/*

.PHONY: setup
setup:
	@echo "Setting up environment files..."
	@cp -n backend/.env.example backend/.env || true
	@cp -n frontend/.env.example frontend/.env.local || true
	@echo "Environment files created. Please edit them with your configuration."
	@echo ""
	@echo "Next steps:"
	@echo "1. Edit backend/.env"
	@echo "2. Edit frontend/.env.local"
	@echo "3. Run 'make dev' to start development environment"

.PHONY: status
status:
	@echo "Container Status:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"