@echo off
REM Set UTF-8 encoding so emojis display correctly in the Windows Terminal
chcp 65001 >nul

:: 1. Run docker compose in detached mode and build
docker compose up -d --build

:: 2. Automatically grab your active local network IP address
set LOCAL_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    if not defined LOCAL_IP set LOCAL_IP=%%a
)

:: Clean up the leading space left by ipconfig output
if defined LOCAL_IP set LOCAL_IP=%LOCAL_IP:~1%

:: Fallback if IP address couldn't be found
if "%LOCAL_IP%"=="" (
    set LOCAL_IP=localhost
)

:: 3. Print a clean, categorized summary of all connection methods
echo.
echo ==================================================
echo 🚀 Gigino Music ^& Jellyfin Stack is Live!
echo ==================================================
echo   💻 For Your PC (Localhost):
echo     - 🎵 Web App  : http://localhost:3000
echo     - 🍿 Jellyfin : http://localhost:8096
echo --------------------------------------------------
echo   📱 For Your Phone / External Devices:
echo     (Note: Whether you are using Home Wi-Fi, Phone Hotspot,
echo      or USB Tethering, the IP address is the same for all
echo      three, as it uses your PC's active local network IP):
echo.
echo     - 🎵 Web App  : http://%LOCAL_IP%:3000
echo     - 🍿 Jellyfin : http://%LOCAL_IP%:8096
echo ==================================================
echo.