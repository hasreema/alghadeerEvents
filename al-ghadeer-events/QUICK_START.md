# 🚀 Quick Start Guide - Al Ghadeer Events Management System

This guide will help you get the system up and running in minutes.

## Prerequisites

- Docker Desktop installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Git installed (for cloning the repository)
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd al-ghadeer-events
```

## Step 2: Run the Startup Script

```bash
./start.sh
```

The script will:
1. Check for Docker installation
2. Create environment files (first run only)
3. Ask you to choose between Development or Production
4. Build and start all containers

## Step 3: Access the System

### Development Environment
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB Admin**: http://localhost:8081 (admin/admin123)
- **Redis Admin**: http://localhost:8082

### Default Admin Login
- **Email**: admin@alghadeer.com
- **Password**: admin123

## Alternative: Using Make Commands

If you prefer more control, use the Makefile directly:

### First Time Setup
```bash
# Copy environment files
make setup

# Edit configuration files
nano backend/.env
nano frontend/.env.local
```

### Start Development Environment
```bash
# Build and start all services
make dev

# View logs
make dev-logs

# Stop services
make dev-down
```

### Start Production Environment
```bash
# Build and start all services
make prod

# Stop services
make prod-down
```

## Common Commands

### View All Available Commands
```bash
make help
```

### Database Operations
```bash
# Access MongoDB shell
make db-shell

# Backup database
make db-backup

# View MongoDB in browser
make mongo-express
```

### Container Management
```bash
# View container status
make status

# Access backend shell
make backend-shell

# Access frontend shell
make frontend-shell

# View backend logs
make backend-logs

# View frontend logs
make frontend-logs
```

### Testing
```bash
# Run backend tests
make backend-test

# Run frontend tests
make frontend-test
```

### Cleanup
```bash
# Stop and clean containers
make clean

# Complete reset (WARNING: deletes all data)
make reset
```

## Troubleshooting

### Port Conflicts
If you get port already in use errors:
```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :27017 # MongoDB

# Kill the process or change ports in docker-compose.yml
```

### Permission Issues
```bash
# If you get permission denied
chmod +x start.sh
chmod +x Makefile
```

### Container Issues
```bash
# Rebuild containers
make dev-build

# View detailed logs
docker-compose -f docker-compose.dev.yml logs -f <service-name>
```

### Database Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Test MongoDB connection
docker exec -it alghadeer_mongodb_dev mongosh -u admin -p admin123
```

## Next Steps

1. **Configure Integrations**:
   - Set up Google Sheets API credentials
   - Configure email settings
   - Set up WhatsApp Business API

2. **Customize Settings**:
   - Update timezone in backend/.env
   - Configure file upload limits
   - Set up proper JWT secrets

3. **Production Deployment**:
   - Update CORS settings
   - Configure SSL certificates
   - Set up proper domain names
   - Enable monitoring (Sentry)

## Support

For detailed documentation, see README.md

For issues or questions:
- Check the logs: `make dev-logs`
- Access container shell: `make backend-shell` or `make frontend-shell`
- Review API docs: http://localhost:8000/docs

---

Happy coding! 🎉