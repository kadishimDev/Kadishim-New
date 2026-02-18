@echo off
chcp 65001 >nul
cd ..
echo ===================================================
echo               PUSH TO GITHUB
echo ===================================================

echo [1/3] Adding files...
git add .

echo [2/3] Committing changes...
set /p commit_msg="Enter commit message: "
if "%commit_msg%"=="" set commit_msg="Auto update form script"
git commit -m "%commit_msg%"

echo [3/3] Pushing to origin...
git push origin main

if errorlevel 1 goto error
echo.
echo ===================================================
echo               PUSH SUCCESSFUL
echo ===================================================
pause
exit

:error
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo               PUSH FAILED
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
pause
