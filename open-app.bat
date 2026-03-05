@echo off
setlocal EnableExtensions

title AI Prompt Generator Launcher
color 0A
cd /d "%~dp0"

echo ======================================
echo   AI Prompt Generator - Launcher
echo ======================================
echo Working Dir: %cd%
echo.

set "NODE_EXE="
set "NPM_CMD="

for /f "delims=" %%I in ('where node 2^>nul') do (
  set "NODE_EXE=%%I"
  goto :NODE_FOUND
)

:NODE_FOUND
if not defined NODE_EXE (
  echo [ERROR] Node.js not found in PATH.
  echo Install Node.js LTS: https://nodejs.org
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%I in ('where npm.cmd 2^>nul') do (
  set "NPM_CMD=%%I"
  goto :NPM_FOUND
)

:NPM_FOUND
if not defined NPM_CMD (
  echo [ERROR] npm.cmd not found in PATH.
  echo Reinstall Node.js with npm component.
  echo.
  pause
  exit /b 1
)

echo [OK] Node path: %NODE_EXE%
"%NODE_EXE%" --version
echo [OK] npm path : %NPM_CMD%
call "%NPM_CMD%" --version
echo.

if not exist "node_modules" (
  echo [INFO] node_modules not found, installing dependencies...
  call "%NPM_CMD%" install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed. ExitCode=%errorlevel%
    pause
    exit /b 1
  )
)

echo [INFO] Starting dev server...
echo [INFO] Opening browser automatically...
echo [INFO] Press Ctrl+C to stop service.
echo.

call "%NPM_CMD%" run dev -- --open
set "RC=%errorlevel%"

echo.
echo [INFO] Dev server exited. ExitCode=%RC%
if not "%RC%"=="0" (
  color 0C
  echo [ERROR] Launcher ended abnormally.
)

echo.
pause
exit /b %RC%
