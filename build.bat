@echo off
echo ============================================
echo  Microfrontend Demo - Build Script
echo ============================================
echo.

echo [1/6] Switching to Node 16 for Angular 14...
call nvm use 16.20.2
if errorlevel 1 (
    echo ERROR: Failed to switch to Node 16. Run this script as Administrator.
    exit /b 1
)

echo.
echo [2/6] Building Angular 14 MFE A...
cd /d "%~dp0mfe-angular14"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 14 MFE A build failed.
    exit /b 1
)

echo.
echo [3/6] Building Angular 14 MFE B...
cd /d "%~dp0mfe-angular14-b"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 14 MFE B build failed.
    exit /b 1
)

echo.
echo [4/6] Switching to Node 25 for Angular 20...
call nvm use 25.6.0
if errorlevel 1 (
    echo ERROR: Failed to switch to Node 25. Run this script as Administrator.
    exit /b 1
)

echo.
echo [5/6] Building Angular 20 MFE A...
cd /d "%~dp0mfe-angular20"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 20 MFE A build failed.
    exit /b 1
)

echo.
echo [6/6] Building Angular 20 MFE B...
cd /d "%~dp0mfe-angular20-b"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 20 MFE B build failed.
    exit /b 1
)

cd /d "%~dp0"
echo.
echo ============================================
echo  Build complete! Run: node server.js
echo ============================================
