@echo off
REM Al Ghadeer Events Management System - Windows Local Installation

echo =========================================================
echo  Al Ghadeer Events Management System - Local Install
echo =========================================================
echo This will install the system locally without Docker.
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed.
    echo Please download and install Python 3.9+ from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please download and install Node.js 18+ from:
    echo https://nodejs.org/
    pause
    exit /b 1
)

REM Check MongoDB
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB is not in PATH.
    echo Please ensure MongoDB is installed from:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo You can continue, but you'll need to start MongoDB manually.
    echo.
    pause
)

echo.
echo All prerequisites found. Starting installation...
echo.

REM Backend setup
echo Setting up backend...
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment and install dependencies
echo Installing Python packages...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org

REM Copy environment file
if not exist .env (
    copy .env.example .env >nul
    echo Created backend\.env - please configure it
)

cd ..

REM Frontend setup
echo.
echo Setting up frontend...
cd frontend

REM Configure npm for SSL issues
call npm config set strict-ssl false
call npm config set registry http://registry.npmjs.org/

REM Install dependencies
echo Installing npm packages...
call npm install --legacy-peer-deps

REM Copy environment file
if not exist .env.local (
    copy .env.example .env.local >nul
    echo Created frontend\.env.local - please configure it
)

cd ..

echo.
echo =========================================================
echo  Installation Complete!
echo =========================================================
echo.
echo To run the system, you need 3 terminal windows:
echo.
echo Terminal 1 - MongoDB:
echo   mongod --dbpath C:\data\db
echo   (Create C:\data\db folder first if it doesn't exist)
echo.
echo Terminal 2 - Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo Terminal 3 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then access:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo Default admin credentials:
echo   Email: admin@alghadeer.com
echo   Password: admin123
echo.
pause