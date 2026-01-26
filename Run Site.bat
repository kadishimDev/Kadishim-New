@echo off
echo Starting Kadishim Website Preview...
echo.
echo Make sure you have installed Node.js!
echo.
cd /d "%~dp0"
call npm run preview
pause
