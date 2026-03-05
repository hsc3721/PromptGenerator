@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title AI Prompt Generator - Force Browser
color 0B

echo [STEP] Starting dev server in a new window...
start "Vite Dev Server" cmd /k "cd /d "%~dp0" && open-app.bat"

echo [STEP] Waiting 2 seconds...
ping 127.0.0.1 -n 3 >nul

echo [STEP] Opening browser...
start "" "http://localhost:5175"

echo [DONE] If page not available, try:
echo        http://localhost:5176
echo        http://localhost:5177
echo.
pause
