@echo off
chcp 65001 >nul
cd ..
echo ===================================================
echo        DEPLOY SAFE (BACKUP -> SYNC -> UPLOAD)
echo ===================================================

echo [STEP 1/4] Backing up remote files (config, uploads)...
python scripts/backup_remote.py
if errorlevel 1 goto error

echo [STEP 2/4] Syncing content from Production DB...
python scripts/sync_db_to_local.py
if errorlevel 1 goto error

echo [STEP 3/4] Building project...
call npm run build
if errorlevel 1 goto error

echo [STEP 4/4] Uploading to FTP (Skipping protected files)...
python scripts/deploy_ftp.py
if errorlevel 1 goto error

echo.
echo ===================================================
echo           DEPLOYMENT COMPLETED SUCCESSFULLY
echo ===================================================
pause
exit

:error
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo           DEPLOYMENT FAILED - CHECK ERRORS
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
pause
exit /b 1
