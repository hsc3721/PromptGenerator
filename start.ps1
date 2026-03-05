# AI 提示词生成器 - PowerShell 启动脚本

Write-Host "================================" -ForegroundColor Green
Write-Host "   AI 提示词生成器 - 启动脚本" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 错误: 未检测到 Node.js" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先下载安装 Node.js (v18+):" -ForegroundColor Yellow
    Write-Host "https://nodejs.org" -ForegroundColor Cyan
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host "✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green

# 检查 npm
Write-Host "检查 npm..." -ForegroundColor Cyan
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 错误: 未检测到 npm" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host "✓ npm 已安装: $npmVersion" -ForegroundColor Green
Write-Host ""

# 检查依赖
if (-not (Test-Path ".\node_modules")) {
    Write-Host "🔄 首次运行，正在安装依赖..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        Read-Host "按 Enter 退出"
        exit 1
    }
    Write-Host ""
}

Write-Host "✓ 依赖检查完成" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 正在启动开发服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor Cyan
Write-Host "   - 浏览器将自动打开应用"
Write-Host "   - 开发服务器运行在 http://localhost:5173"
Write-Host "   - 按 Ctrl+C 可停止服务器"
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# 启动开发服务器
npm run dev
Read-Host "按 Enter 退出"
