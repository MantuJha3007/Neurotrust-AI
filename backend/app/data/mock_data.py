from typing import Dict
from app.schemas.trading import AgentSignal, AgentStateResponse, AgentDecisionDTO

TICKER_NAMES: Dict[str, str] = {
    "NVDA": "NVIDIA Corporation",
    "AAPL": "Apple Inc.",
    "SPY": "SPDR S&P 500 ETF Trust",
    "QQQ": "Invesco QQQ Trust",
    "TSLA": "Tesla, Inc."
}

DEFAULT_AGENT_SIGNAL = AgentSignal(
    symbol="NVDA",
    action="BUY",
    confidence=87.0,
    expectedReturn=3.2,
    risk="LOW",
    reason=[
        "Momentum remains positive",
        "Market sentiment is bullish",
        "Volatility is within acceptable range",
        "Risk threshold passed"
    ]
)

DEFAULT_DECISIONS = [
    AgentDecisionDTO(
        id="1",
        title="Market Data Ingested",
        description="Real-time market features collected.",
        timestamp="10:43:02",
        status="completed"
    ),
    AgentDecisionDTO(
        id="2",
        title="Technical Analysis",
        description="Momentum and trend indicators evaluated.",
        timestamp="10:43:03",
        status="completed"
    ),
    AgentDecisionDTO(
        id="3",
        title="AI Prediction",
        description="Model generated a bullish prediction.",
        timestamp="10:43:04",
        status="completed"
    )
]

DEFAULT_AGENT_STATE = AgentStateResponse(
    status="ACTIVE",
    currentSymbol="NVDA",
    confidence=87.0,
    riskScore=21.0,
    signal=DEFAULT_AGENT_SIGNAL,
    decisions=DEFAULT_DECISIONS
)
