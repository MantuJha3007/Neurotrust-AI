# NeuroTrust AI Trading Platform - All Services Starter
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting NeuroTrust AI Trading Platform" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. LLM Service
Write-Host "[1/3] Starting LLM Trading Service on port 8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ai-trading-llm-\llm_service'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

Start-Sleep -Seconds 3

# 2. Backend Gateway
Write-Host "[2/3] Starting Backend Gateway on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

# 3. Frontend
Write-Host "[3/3] Starting Next.js Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend\AI_TradingAgent'; npm run dev"

Write-Host "`nAll 3 services have been launched in separate terminal windows:" -ForegroundColor Green
Write-Host " - Frontend:    http://localhost:3000" -ForegroundColor Green
Write-Host " - Backend API: http://localhost:8000/docs" -ForegroundColor Green
Write-Host " - LLM Engine:  http://localhost:8001/docs" -ForegroundColor Green
