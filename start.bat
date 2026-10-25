@echo off
title KhemaraMorodok Platform Launcher
echo ========================================================
echo   Starting KhemaraMorodok Platform (5 Services)
echo   Phase 1 (Travel) + Phase 2 (Business Directory)
echo ========================================================
echo.

REM 1. Database Connection Check
findstr /i "^DB_CONNECTION=pgsql" "%~dp0backend\.env" >nul 2>&1
if not errorlevel 1 (
    echo [1/6] Database: Connected to Supabase PostgreSQL (Cloud Database)
) else (
    tasklist /fi "imagename eq mysqld.exe" | find /i "mysqld.exe" >nul
    if errorlevel 1 (
        echo [1/6] Starting MySQL Database Server on port 3306...
        start /b "" "C:\Setup_Software\Unit_Project\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqld.exe" --defaults-file="C:\Setup_Software\Unit_Project\laragon\bin\mysql\mysql-8.0.30-winx64\my.ini"
        timeout /t 2 /nobreak >nul
    ) else (
        echo [1/6] MySQL Database is already active on port 3306.
    )
)

REM 2. Start Laravel Backend API (Shared backend on 8000)
echo [2/6] Launching Laravel Backend API on http://localhost:8000 ...
start "KhemaraMorodok Backend API" cmd /k "cd /d %~dp0backend && php artisan serve --port=8000"

REM 3. Start Vite React Frontend Travel (5173)
echo [3/6] Launching React Travel Frontend on http://localhost:5173 ...
if exist "%~dp0frontend-travel" (
    start "KhemaraMorodok Frontend Travel" cmd /k "cd /d %~dp0frontend-travel && npm run dev"
)

REM 4. Start Vite React Admin Travel (5174)
echo [4/6] Launching React Admin Travel on http://localhost:5174 ...
if exist "%~dp0admin" (
    start "KhemaraMorodok Admin Travel" cmd /k "cd /d %~dp0admin && npm run dev"
) else if exist "%~dp0A-Khemra-supper-admin" (
    start "KhemaraMorodok Admin Travel" cmd /k "cd /d %~dp0A-Khemra-supper-admin && npm run dev"
)

REM 5. Start Vite React Frontend Business (5175)
echo [5/6] Launching React Business Directory Frontend on http://localhost:5175 ...
if exist "%~dp0frontend-business" (
    start "KhemaraMorodok Frontend Business" cmd /k "cd /d %~dp0frontend-business && npm run dev"
)

REM 6. Start Vite React Admin Business (5176)
echo [6/6] Launching React Business Admin Panel on http://localhost:5176 ...
if exist "%~dp0admin-business" (
    start "KhemaraMorodok Admin Business" cmd /k "cd /d %~dp0admin-business && npm run dev"
)

echo.
echo ========================================================
echo   All Services are up and running!
echo   - 1. Backend API:        http://localhost:8000 (API and Docs)
echo   - 2. Frontend Travel:    http://localhost:5173
echo   - 3. Admin Travel:       http://localhost:5174
echo   - 4. Frontend Business:  http://localhost:5175 (Public Directory)
echo   - 5. Admin Business:     http://localhost:5176 (Staff Management)
echo   - 6. Business Owner Portal:     http://localhost:5175/login 
echo ========================================================
echo Press any key to exit this launcher window (servers keep running)...
pause >nul
