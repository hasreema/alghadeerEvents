#!/bin/bash

# Fix SSL Certificate Issues for Al Ghadeer Events Management System

echo "🔧 Fixing SSL Certificate Issues..."
echo "================================"
echo ""

# Create docker-compose override if it doesn't exist
if [ ! -f "docker-compose.override.yml" ]; then
    echo "Creating docker-compose.override.yml..."
    cat > docker-compose.override.yml << 'EOF'
version: '3.8'

services:
  frontend:
    environment:
      NODE_TLS_REJECT_UNAUTHORIZED: "0"
      NPM_CONFIG_STRICT_SSL: "false"
  
  backend:
    environment:
      PYTHONHTTPSVERIFY: "0"
      REQUESTS_CA_BUNDLE: ""
EOF
fi

# Clean npm cache
echo "Cleaning npm cache..."
docker run --rm -v $(pwd)/frontend:/app -w /app node:18-alpine npm cache clean --force

# Remove node_modules and package-lock.json
echo "Removing old dependencies..."
rm -rf frontend/node_modules frontend/package-lock.json

# Try to detect if behind a proxy
if [ ! -z "$HTTP_PROXY" ] || [ ! -z "$http_proxy" ]; then
    echo ""
    echo "📡 Proxy detected: ${HTTP_PROXY:-$http_proxy}"
    echo ""
    echo "Adding proxy settings to docker-compose.override.yml..."
    
    # Update override file with proxy settings
    cat >> docker-compose.override.yml << EOF

  frontend:
    build:
      args:
        HTTP_PROXY: ${HTTP_PROXY:-$http_proxy}
        HTTPS_PROXY: ${HTTPS_PROXY:-$https_proxy}
        NO_PROXY: localhost,127.0.0.1,mongodb,backend,redis
    environment:
      HTTP_PROXY: ${HTTP_PROXY:-$http_proxy}
      HTTPS_PROXY: ${HTTPS_PROXY:-$https_proxy}
      NO_PROXY: localhost,127.0.0.1,mongodb,backend,redis

  backend:
    environment:
      HTTP_PROXY: ${HTTP_PROXY:-$http_proxy}
      HTTPS_PROXY: ${HTTPS_PROXY:-$https_proxy}
      NO_PROXY: localhost,127.0.0.1,mongodb,backend,redis
EOF
fi

echo ""
echo "✅ SSL fixes applied!"
echo ""
echo "Now try running the system again:"
echo "  ./start.sh"
echo ""
echo "If you still have issues:"
echo "1. Check your internet connection"
echo "2. Try using a different network (non-corporate)"
echo "3. Manually edit docker-compose.override.yml with your proxy settings"
echo ""