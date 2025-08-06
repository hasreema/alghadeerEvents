# 🪟 Windows Setup Guide - Al Ghadeer Events Management System

This guide is specifically for Windows users to set up and run the Al Ghadeer Events Management System.

## 📋 Prerequisites

### Required Software
1. **Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop
   - Requires Windows 10/11 Pro, Enterprise, or Education (64-bit)
   - For Windows Home, use WSL 2 backend

2. **Git for Windows** (to clone the repository)
   - Download: https://git-scm.com/download/win

### Optional (for local installation without Docker)
- **Python 3.9+**: https://www.python.org/downloads/
- **Node.js 18+**: https://nodejs.org/
- **MongoDB Community**: https://www.mongodb.com/try/download/community

## 🚀 Quick Start

### Option 1: Using PowerShell (Recommended)

1. **Open PowerShell as Administrator**
   - Right-click on Start button
   - Select "Windows PowerShell (Admin)"

2. **Navigate to project directory**
   ```powershell
   cd path\to\al-ghadeer-events
   ```

3. **Allow PowerShell scripts** (first time only)
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Run the setup script**
   ```powershell
   .\Start-AlGhadeer.ps1
   ```

### Option 2: Using Command Prompt

1. **Open Command Prompt**
   - Press `Win + R`, type `cmd`, press Enter

2. **Navigate to project directory**
   ```cmd
   cd path\to\al-ghadeer-events
   ```

3. **Run the batch file**
   ```cmd
   start-windows.bat
   ```

## 🔧 Fixing SSL Certificate Issues

If you encounter SSL certificate errors (common in corporate environments):

### Method 1: Run the SSL Fix Script
```cmd
fix-docker-ssl-windows.bat
```
Then restart Docker Desktop and try again.

### Method 2: Manual Docker Configuration

1. **Open Docker Desktop Settings**
   - Right-click Docker icon in system tray
   - Select "Settings"

2. **Go to Docker Engine tab**

3. **Add this configuration:**
   ```json
   {
     "insecure-registries": ["registry.npmjs.org"],
     "dns": ["8.8.8.8", "8.8.4.4"]
   }
   ```

4. **Apply & Restart**

### Method 3: Use Ubuntu Containers
Ubuntu-based containers handle SSL better than Alpine:
```cmd
docker-compose -f docker-compose.dev.ubuntu.yml up -d
```

## 🏠 Local Installation (Without Docker)

If Docker continues to have issues, install locally:

1. **Run the local installation script**
   ```cmd
   install-windows.bat
   ```

2. **Start MongoDB** (new terminal)
   ```cmd
   mkdir C:\data\db
   mongod --dbpath C:\data\db
   ```

3. **Start Backend** (new terminal)
   ```cmd
   cd backend
   venv\Scripts\activate
   python -m uvicorn app.main:app --reload
   ```

4. **Start Frontend** (new terminal)
   ```cmd
   cd frontend
   npm run dev
   ```

## 🌐 Corporate Proxy Setup

If you're behind a corporate proxy:

1. **Set environment variables**
   ```cmd
   set HTTP_PROXY=http://your-proxy:port
   set HTTPS_PROXY=http://your-proxy:port
   set NO_PROXY=localhost,127.0.0.1
   ```

2. **Configure npm**
   ```cmd
   npm config set proxy http://your-proxy:port
   npm config set https-proxy http://your-proxy:port
   ```

3. **Configure Docker** (in Docker Desktop settings)
   - Settings → Resources → Proxies
   - Enable manual proxy configuration
   - Enter your proxy details

## 📁 Windows-Specific File Paths

- **Docker Desktop config**: `%USERPROFILE%\.docker\daemon.json`
- **Environment files**:
  - Backend: `backend\.env`
  - Frontend: `frontend\.env.local`
- **MongoDB data**: `C:\data\db` (create manually)
- **Python virtual env**: `backend\venv\Scripts\`

## 🛠️ Useful Windows Commands

### Docker Commands
```powershell
# View running containers
docker ps

# View logs
docker-compose -f docker-compose.dev.ubuntu.yml logs -f

# Stop all containers
docker-compose -f docker-compose.dev.ubuntu.yml down

# Clean up Docker
docker system prune -a
```

### Python Commands
```cmd
# Activate virtual environment
backend\venv\Scripts\activate

# Deactivate virtual environment
deactivate

# Install packages
pip install -r requirements.txt
```

### Node.js Commands
```cmd
# Install dependencies
npm install

# Run development server
npm run dev

# Clear npm cache
npm cache clean --force
```

## ❗ Common Windows Issues

### Issue: "Docker daemon is not running"
**Solution**: Start Docker Desktop from Start Menu

### Issue: "npm ERR! code UNABLE_TO_GET_ISSUER_CERT_LOCALLY"
**Solution**: 
```cmd
npm config set strict-ssl false
npm config set registry http://registry.npmjs.org/
```

### Issue: "Python was not found"
**Solution**: 
- Install Python with "Add to PATH" option checked
- Or use full path: `C:\Python39\python.exe`

### Issue: Port already in use
**Solution**: Find and kill the process
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue: MongoDB won't start
**Solution**: 
1. Create data directory: `mkdir C:\data\db`
2. Run as Administrator
3. Check Windows Defender/Antivirus exceptions

## 🔍 Checking Service Status

### Using PowerShell
```powershell
# Check if services are running
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test backend
Invoke-WebRequest -Uri http://localhost:8000/health

# Test frontend
Invoke-WebRequest -Uri http://localhost:3000
```

### Using Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MongoDB UI: http://localhost:8081
- Redis UI: http://localhost:8082

## 📞 Getting Help

1. **Check logs**: `docker-compose logs -f`
2. **Restart Docker Desktop**
3. **Try Ubuntu containers instead of Alpine**
4. **Use local installation as fallback**
5. **Check Windows Firewall settings**

## 🎉 Success Checklist

- [ ] Docker Desktop is running
- [ ] All containers started successfully
- [ ] Can access http://localhost:3000
- [ ] Can login with admin@alghadeer.com / admin123
- [ ] No SSL certificate errors

---

If you continue to have issues, please check the firewall settings and ensure Docker Desktop has necessary permissions. Corporate environments may require additional proxy or certificate configurations.