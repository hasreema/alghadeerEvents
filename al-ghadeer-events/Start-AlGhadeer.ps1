# Al Ghadeer Events Management System - PowerShell Startup Script

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Al Ghadeer Events Management System - Windows Edition" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "Note: Running without Administrator privileges." -ForegroundColor Yellow
    Write-Host "Some features may require admin access." -ForegroundColor Yellow
    Write-Host ""
}

# Check Docker
try {
    docker version | Out-Null
    Write-Host "✓ Docker is installed and running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running or not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure Docker Desktop is installed and running." -ForegroundColor Yellow
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for environment files
$backendEnvExists = Test-Path "backend\.env"
$frontendEnvExists = Test-Path "frontend\.env.local"

if (-not $backendEnvExists -or -not $frontendEnvExists) {
    Write-Host "First time setup detected. Creating environment files..." -ForegroundColor Yellow
    
    if (-not $backendEnvExists) {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "Created backend\.env" -ForegroundColor Green
    }
    
    if (-not $frontendEnvExists) {
        Copy-Item "frontend\.env.example" "frontend\.env.local"
        Write-Host "Created frontend\.env.local" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Please configure the environment files before continuing:" -ForegroundColor Yellow
    Write-Host "  1. backend\.env" -ForegroundColor Yellow
    Write-Host "  2. frontend\.env.local" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 0
}

# Menu
Write-Host "Select environment to start:" -ForegroundColor Cyan
Write-Host "1) Development with Ubuntu containers (Recommended for SSL issues)" -ForegroundColor White
Write-Host "2) Development with Alpine containers" -ForegroundColor White
Write-Host "3) Fix Docker SSL issues" -ForegroundColor White
Write-Host "4) Local installation (No Docker)" -ForegroundColor White
Write-Host "5) Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting development environment with Ubuntu containers..." -ForegroundColor Green
        docker-compose -f docker-compose.dev.ubuntu.yml build
        docker-compose -f docker-compose.dev.ubuntu.yml up -d
        $success = $true
    }
    "2" {
        Write-Host ""
        Write-Host "Starting development environment with Alpine containers..." -ForegroundColor Green
        docker-compose -f docker-compose.dev.yml build
        docker-compose -f docker-compose.dev.yml up -d
        $success = $true
    }
    "3" {
        Write-Host ""
        Write-Host "Applying Docker SSL fixes..." -ForegroundColor Yellow
        
        # Set environment variables
        [System.Environment]::SetEnvironmentVariable("NODE_TLS_REJECT_UNAUTHORIZED", "0", "User")
        [System.Environment]::SetEnvironmentVariable("NPM_CONFIG_STRICT_SSL", "false", "User")
        [System.Environment]::SetEnvironmentVariable("PYTHONHTTPSVERIFY", "0", "User")
        
        # Create Docker daemon config
        $dockerConfig = @{
            "insecure-registries" = @("registry.npmjs.org", "registry-1.docker.io")
            "dns" = @("8.8.8.8", "8.8.4.4")
        }
        
        $configPath = "$env:USERPROFILE\.docker\daemon.json"
        $dockerConfig | ConvertTo-Json | Set-Content $configPath
        
        Write-Host "Docker configuration updated." -ForegroundColor Green
        Write-Host "Please restart Docker Desktop and run this script again." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 0
    }
    "4" {
        Write-Host ""
        Write-Host "Starting local installation..." -ForegroundColor Green
        & ".\install-windows.bat"
        exit 0
    }
    "5" {
        exit 0
    }
    default {
        Write-Host "Invalid choice." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

if ($success) {
    Write-Host ""
    Write-Host "=========================================================" -ForegroundColor Green
    Write-Host " Development environment is starting!" -ForegroundColor Green
    Write-Host "=========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access points:" -ForegroundColor Cyan
    Write-Host "  Frontend:        " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  Backend API:     " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor Yellow
    Write-Host "  API Docs:        " -NoNewline; Write-Host "http://localhost:8000/docs" -ForegroundColor Yellow
    Write-Host "  MongoDB Express: " -NoNewline; Write-Host "http://localhost:8081" -ForegroundColor Yellow -NoNewline; Write-Host " (admin/admin123)" -ForegroundColor Gray
    Write-Host "  Redis Commander: " -NoNewline; Write-Host "http://localhost:8082" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Default admin credentials:" -ForegroundColor Cyan
    Write-Host "  Email:    admin@alghadeer.com" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "  View logs:    docker-compose -f docker-compose.dev.ubuntu.yml logs -f" -ForegroundColor Gray
    Write-Host "  Stop system:  docker-compose -f docker-compose.dev.ubuntu.yml down" -ForegroundColor Gray
    Write-Host ""
    
    # Wait for services to be ready
    Write-Host "Waiting for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Open browser
    $openBrowser = Read-Host "Open frontend in browser? (Y/N)"
    if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Start-Process "http://localhost:3000"
    }
}

Write-Host ""
Read-Host "Press Enter to exit"