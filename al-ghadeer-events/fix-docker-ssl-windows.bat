@echo off
REM Fix Docker SSL Certificate Issues on Windows

echo =========================================================
echo  Fixing Docker SSL Certificate Issues
echo =========================================================
echo.

REM Create docker daemon config directory if it doesn't exist
if not exist "%USERPROFILE%\.docker" (
    mkdir "%USERPROFILE%\.docker"
)

REM Create or update daemon.json
echo Creating Docker daemon configuration...
echo {> "%USERPROFILE%\.docker\daemon.json"
echo   "insecure-registries": ["registry.npmjs.org", "registry-1.docker.io"],>> "%USERPROFILE%\.docker\daemon.json"
echo   "dns": ["8.8.8.8", "8.8.4.4"],>> "%USERPROFILE%\.docker\daemon.json"
echo   "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]>> "%USERPROFILE%\.docker\daemon.json"
echo }>> "%USERPROFILE%\.docker\daemon.json"

echo.
echo Docker configuration updated.
echo.

REM Create docker-compose override
echo Creating docker-compose.override.yml...
(
echo version: '3.8'
echo.
echo services:
echo   frontend:
echo     environment:
echo       NODE_TLS_REJECT_UNAUTHORIZED: "0"
echo       NPM_CONFIG_STRICT_SSL: "false"
echo       NPM_CONFIG_REGISTRY: "http://registry.npmjs.org/"
echo.
echo   backend:
echo     environment:
echo       PYTHONHTTPSVERIFY: "0"
echo       REQUESTS_CA_BUNDLE: ""
echo       SSL_CERT_FILE: ""
) > docker-compose.override.yml

echo.
echo Docker Compose override created.
echo.

REM Set Windows environment variables for current session
set NODE_TLS_REJECT_UNAUTHORIZED=0
set NPM_CONFIG_STRICT_SSL=false
set PYTHONHTTPSVERIFY=0

echo =========================================================
echo  SSL fixes applied!
echo =========================================================
echo.
echo Next steps:
echo.
echo 1. Restart Docker Desktop:
echo    - Right-click Docker icon in system tray
echo    - Click "Quit Docker Desktop"
echo    - Start Docker Desktop again
echo.
echo 2. Try running the system again:
echo    start-windows.bat
echo.
echo If you're behind a corporate proxy, set these environment variables:
echo   set HTTP_PROXY=http://your-proxy:port
echo   set HTTPS_PROXY=http://your-proxy:port
echo   set NO_PROXY=localhost,127.0.0.1
echo.
pause