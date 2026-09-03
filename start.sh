#!/bin/bash

# 1. Run docker compose in detached mode and build
docker compose up -d --build

# 2. Automatically grab your active local network IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

# Fallback if hostname -I is empty
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

# 3. Print a clean, categorized summary of all connection methods
echo ""
echo "=================================================="
echo "🚀 Gigino Music & Jellyfin Stack is Live!"
echo "=================================================="
echo "  💻 For Your PC (Localhost):"
echo "    - 🎵 Web App  : http://localhost:3000"
echo "    - 🍿 Jellyfin : http://localhost:8096"
echo "--------------------------------------------------"
echo "  📱 For Your Phone / External Devices:"
echo "    (Note: Whether you are using Home Wi-Fi, Phone Hotspot,"
echo "     or USB Tethering, the IP address is the same for all"
echo "     three, as it uses your PC's active local network IP):"
echo ""
echo "    - 🎵 Web App  : http://${LOCAL_IP}:3000"
echo "    - 🍿 Jellyfin : http://${LOCAL_IP}:8096"
echo "=================================================="
echo ""