@echo off
echo ============================================
echo  Microfrontend Demo - Build Script
echo ============================================
echo.

echo [1/9] Switching to Node 16 for Angular 14...
call nvm use 16.20.2
if errorlevel 1 (
    echo ERROR: Failed to switch to Node 16. Run this script as Administrator.
    exit /b 1
)

echo.
echo [2/9] Building Angular 14 MFE A...
cd /d "%~dp0mfe-angular14"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 14 MFE A build failed.
    exit /b 1
)

echo.
echo [3/9] Building Angular 14 MFE B...
cd /d "%~dp0mfe-angular14-b"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 14 MFE B build failed.
    exit /b 1
)

echo.
echo [4/9] Building Angular 14 MFE C...
cd /d "%~dp0mfe-angular14-c"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 14 MFE C build failed.
    exit /b 1
)

echo.
echo [5/9] Switching to Node 25 for Angular 20...
call nvm use 25.6.0
if errorlevel 1 (
    echo ERROR: Failed to switch to Node 25. Run this script as Administrator.
    exit /b 1
)

echo.
echo [6/9] Building Angular 20 MFE A...
cd /d "%~dp0mfe-angular20"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 20 MFE A build failed.
    exit /b 1
)

echo.
echo [7/9] Building Angular 20 MFE B...
cd /d "%~dp0mfe-angular20-b"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 20 MFE B build failed.
    exit /b 1
)

echo.
echo [8/9] Building Angular 20 MFE C...
cd /d "%~dp0mfe-angular20-c"
call npx ng build --configuration production
if errorlevel 1 (
    echo ERROR: Angular 20 MFE C build failed.
    exit /b 1
)

echo.
echo [9/9] Building React MFE...
cd /d "%~dp0mfe-react"
call npx webpack --config webpack.config.js
if errorlevel 1 (
    echo ERROR: React MFE build failed.
    exit /b 1
)

cd /d "%~dp0"
echo.
echo ============================================
echo  Build complete! Run: node server.js
echo ============================================
