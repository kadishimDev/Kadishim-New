@echo off
echo Building latest version...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b %errorlevel%
)
echo Build successful! Starting server...
python run_site.py
pause
