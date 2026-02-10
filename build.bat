@echo off
echo ============================================
echo  Microfrontend Demo - Build Script
echo ============================================
echo.

echo [1/4] Switching to Node 16 for Angular 14...
call nvm use 16.20.2
if errorlevel 1 (
    echo ERROR: Failed to switch to Node 16. Run this script as Administrator.
    exit /b 1
)

echo.
echo [2/4] Building Angular 14 MFE...
cd /d "%~dp0mfe-angular14"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 14 build failed.
    exit /b 1
)

echo.
echo [3/4] Switching to Node 25 for Angular 20...
call nvm use 25.6.0
if errorlevel 1 (
    echo ERROR: Failed to switch to Node 25. Run this script as Administrator.
    exit /b 1
)

echo.
echo [4/4] Building Angular 20 MFE...
cd /d "%~dp0mfe-angular20"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 20 build failed.
    exit /b 1
)

cd /d "%~dp0"
echo.
echo ============================================
echo  Build complete! Run: node server.js
echo ============================================
