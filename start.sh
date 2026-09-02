#!/bin/bash

# 1. Run docker compose in detached mode
docker compose up -d

# 2. Automatically grab your active local/tethering IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

# Fallback if hostname -I is empty
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

# 3. Print a clean summary with your clickable links
echo ""
echo "=================================================="
echo "🚀 Gigino Music & Jellyfin Stack is Live!"
echo "=================================================="
echo "  🎵 Web App (Local)     : http://localhost:3000"
echo "  🍿 Jellyfin (Local)    : http://localhost:8096"
echo "--------------------------------------------------"
echo "  📱 Access via Phone (USB Tethering):"
echo "     Jellyfin URL        : http://${LOCAL_IP}:8096"
echo "=================================================="
echo ""