@echo off
REM Al Ghadeer Events Management System - Windows Startup Script

echo =========================================================
echo  Al Ghadeer Events Management System - Windows Edition
echo =========================================================
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed.
    echo.
    echo Please ensure Docker Desktop is installed and running.
    echo Download from: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Check if this is first run
if not exist "backend\.env" (
    echo First time setup detected. Creating environment files...
    copy backend\.env.example backend\.env >nul
    copy frontend\.env.example frontend\.env.local >nul
    echo.
    echo Environment files created. Please edit them:
    echo   1. backend\.env
    echo   2. frontend\.env.local
    echo.
    echo Then run this script again.
    pause
    exit /b 0
)

echo Select environment to start:
echo 1) Development with Ubuntu containers (Recommended for SSL issues)
echo 2) Development with Alpine containers
echo 3) Local installation (No Docker)
echo.
set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" goto ubuntu
if "%choice%"=="2" goto alpine
if "%choice%"=="3" goto local
goto invalid

:ubuntu
echo.
echo Starting development environment with Ubuntu containers...
docker-compose -f docker-compose.dev.ubuntu.yml build
docker-compose -f docker-compose.dev.ubuntu.yml up -d
goto success

:alpine
echo.
echo Starting development environment with Alpine containers...
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
goto success

:local
echo.
echo Starting local installation script...
call install-windows.bat
goto end

:invalid
echo Invalid choice. Please run the script again.
pause
exit /b 1

:success
echo.
echo =========================================================
echo  Development environment is starting!
echo =========================================================
echo.
echo Access points:
echo   Frontend:        http://localhost:3000
echo   Backend API:     http://localhost:8000
echo   API Docs:        http://localhost:8000/docs
echo   MongoDB Express: http://localhost:8081 (admin/admin123)
echo   Redis Commander: http://localhost:8082
echo.
echo Default admin credentials:
echo   Email:    admin@alghadeer.com
echo   Password: admin123
echo.
echo Useful commands:
echo   View logs:    docker-compose -f docker-compose.dev.ubuntu.yml logs -f
echo   Stop system:  docker-compose -f docker-compose.dev.ubuntu.yml down
echo.

:end
pause