@echo off
REM 检查 Node.js 和 npm 安装状态
chcp 65001 >nul 2>&1
color 0E
cls

echo ================================
echo   环境检查
echo ================================
echo.

echo 检查 Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装
    call :showNodeInstall
) else (
    echo ✓ Node.js 已找到
    for /f "tokens=*" %%i in ('node --version') do echo   版本: %%i
)

echo.
echo 检查 npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装
) else (
    echo ✓ npm 已找到
    for /f "tokens=*" %%i in ('npm --version') do echo   版本: %%i
)

echo.
echo ================================
echo.
pause
exit /b 0

:showNodeInstall
echo.
echo 请执行以下操作:
echo 1. 访问 https://nodejs.org
echo 2. 下载 LTS 版本
echo 3. 运行安装程序
echo 4. 勾选 "Add to PATH"
echo 5. 完成安装后重启电脑
echo.
goto :eof
