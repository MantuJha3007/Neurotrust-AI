@echo off
echo ========================================================
echo Starting NeuroTrust AI Trading Platform
echo ========================================================

echo [1/3] Starting LLM Trading Service (Port 8001)...
start "NeuroTrust - LLM Service (8001)" cmd /k "cd /d "%~dp0ai-trading-llm-\llm_service" && .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API Gateway (Port 8000)...
start "NeuroTrust - Backend Gateway (8000)" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Frontend Dashboard (Port 3000)...
start "NeuroTrust - Next.js Frontend (3000)" cmd /k "cd /d "%~dp0frontend\AI_TradingAgent" && npm run dev"

echo.
echo All services launched!
echo - Frontend:    http://localhost:3000
echo - Backend API: http://localhost:8000/docs
echo - LLM Engine:  http://localhost:8001/docs
echo ========================================================
