@echo off
echo ============================================
echo   GovEase AI Backend - MongoDB ATLAS Mode
echo ============================================
echo.

cd /d "%~dp0Backend_Node.js"

set "MONGO_URI=mongodb+srv://goandstudyadmin:goandstudyadmin@goandstudycluster.4jz25t7.mongodb.net/?appName=goandstudycluster"
set "MONGO_DB_NAME=GovEase"

echo [INFO] Using MongoDB Atlas
echo [INFO] Database: %MONGO_DB_NAME%
echo.

node src/app.js

pause
