@echo off
echo Starting Coding Platform...
echo.

REM Start backend server in a new window
echo Starting Backend Server...
start "Backend Server" cmd /k "cd Model\backend && npm start"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd Model && npm run dev"

echo.
echo ========================================
echo   Coding Platform Started!
echo ========================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
