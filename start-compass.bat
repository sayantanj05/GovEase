@echo off
echo ============================================
echo   GovEase AI Backend - MongoDB COMPASS Mode
echo ============================================
echo.

cd /d "%~dp0Backend_Node.js"

set "MONGO_URI=mongodb://localhost:27017/GovEase_AI"
set "MONGO_DB_NAME=GovEase_AI"

echo [INFO] Using MongoDB Compass (Local)
echo [INFO] Database: %MONGO_DB_NAME%
echo.

node src/app.js

pause
