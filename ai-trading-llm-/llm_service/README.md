# AI Trading Agent — LLM Service

Production-oriented FastAPI service that connects the frontend contract to Groq structured reasoning, Alpaca market/trading APIs, a deterministic risk/strategy layer, SQLite decision history, and an MCP tool server.

## Architecture

`Frontend → FastAPI → Alpaca / Risk Engine / Strategy Engine / Groq → SQLite + SSE`

The LLM is the reasoning layer. Alpaca remains the source of market/account/execution truth, while the deterministic risk engine is the final trade gate.

## Current model selection

Groq's current structured-output documentation lists `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, and `qwen/qwen3.8-27b` as supported models. The service therefore defaults to GPT-OSS 120B and falls back to Qwen 3.8 27B and GPT-OSS 20B. Models can be changed through environment variables.

## Setup

### Windows PowerShell

```powershell
cd llm_service
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and provide `GROQ_API_KEY`, `ALPACA_API_KEY`, and `ALPACA_SECRET_KEY`. Keep `ALPACA_PAPER=true` during development.

### Linux/macOS

```bash
cd llm_service
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

## Run API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

API docs: `http://localhost:8001/docs`

Health: `http://localhost:8001/api/health`

## Frontend-compatible endpoints

- `GET /api/market/quotes`
- `GET /api/market/chart/{symbol}?timeframe=1D`
- `GET /api/portfolio`
- `GET /api/portfolio/positions`
- `GET /api/trades`
- `GET /api/options/chain/{symbol}`
- `GET /api/options/contract/{contractSymbol}`
- `GET /api/agent/status`
- `POST /api/agent/analyze`
- `POST /api/agent/pause`
- `POST /api/agent/resume`
- `GET /api/agent/events`
- `GET /api/agent/events/stream` (SSE)
- `GET /api/execution/events`
- `POST /api/orders`

### Analyze example

```json
{
  "symbol": "AAPL",
  "include_options": true,
  "execute": false
}
```

`execute=false` is the safe default. Autonomous execution is only attempted by an explicit request and is still blocked by deterministic risk controls.

## MCP server

The MCP server exposes read-oriented context tools for recent decisions, decision events, and risk policy.

```bash
python run_mcp.py
```

For the official MCP Inspector workflow, use the MCP CLI/dev tooling available with the pinned SDK installation.

## Safety model

1. Alpaca supplies factual financial/account/order data.
2. Quant/strategy code calculates deterministic features and candidates.
3. Groq produces structured reasoning only.
4. RiskEngine independently approves or blocks trades.
5. Only an approved order reaches Alpaca.
6. Paper mode is enabled by default.

Never put live Alpaca keys in source control. Do not enable live trading until the backend, risk rules, account permissions, and operational monitoring have been independently validated.
