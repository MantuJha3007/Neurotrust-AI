from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import market, portfolio, trades, orders, agent, options, execution, auth, system

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API Gateway connecting Next.js Frontend to LLM Trading Service and Alpaca",
    version=settings.VERSION
)

# Configure CORS for Next.js frontend (:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(system.router)
app.include_router(market.router)
app.include_router(portfolio.router)
app.include_router(options.router)
app.include_router(trades.router)
app.include_router(orders.router)
app.include_router(agent.router)
app.include_router(execution.router)

@app.get("/", tags=["Health"])
def root_health_check():
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": settings.VERSION,
        "llm_service_url": settings.LLM_SERVICE_URL
    }
