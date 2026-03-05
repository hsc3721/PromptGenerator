@echo off
setlocal
cd /d "%~dp0"

echo [DEBUG] This window will stay open.
echo [DEBUG] Running open-app.bat ...
echo.

call "%~dp0open-app.bat"

echo.
echo [DEBUG] open-app.bat finished with exit code: %errorlevel%
pause
