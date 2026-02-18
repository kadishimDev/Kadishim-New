@echo off
chcp 65001 >nul
echo ==========================================
echo       Dushing to Git...
echo ==========================================

:: 1. Add all changes
echo [1/3] Adding files...
git add .

:: 2. Commit with timestamp
echo [2/3] Committing changes...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~6,2%/%datetime:~4,2%/%datetime:~0,4% %datetime:~8,2%:%datetime:~10,2%
git commit -m "Auto Update: %timestamp%"

:: 3. Push to main
echo [3/3] Pushing to remote...
git push origin main

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo       SUCCESS! Changes pushed.
) else (
    echo       ERROR! Something went wrong.
)
echo ==========================================
pause
