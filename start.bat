@echo off
echo ==========================================
echo       Starting JanSetu AI Locally
echo ==========================================
echo.
echo [1/2] Starting Backend Server (Port 3001)...
start "JanSetu Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo [2/2] Starting Frontend App (Port 5173)...
start "JanSetu Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo JanSetu is launching!
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:3001
echo.
pause
