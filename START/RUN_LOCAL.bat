@echo off
chcp 65001 >nul
cd ..
echo ===================================================
echo               START LOCAL DEV SERVER (FULL)
echo ===================================================
echo Starting Vite server + Persistence Server...
echo Access at: http://localhost:5173
echo.
npm run dev:all
pause
