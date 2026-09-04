import {
  apiClient,
} from "@/lib/api-client";

import type {
  AgentState,
  ChartPoint,
  ChartTimeframe,
  OrderRequest,
  OrderResponse,
  Portfolio,
  Position,
  Quote,
  Trade,
} from "@/types/trading";

import type {
  OptionContract,
  OptionChain,
  OptionQuote,
} from "@/types/options";

const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !==
    "false";

function delay(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      milliseconds,
    );
  });
}

const mockQuotes: Quote[] = [
  {
    symbol: "SPY",
    price: 650.24,
    change: 5.42,
    changePercent: 0.84,
    volume: 32_400_000,
    marketStatus: "open",
    timestamp: new Date().toISOString(),
  },
  {
    symbol: "AAPL",
    price: 247.18,
    change: 3.14,
    changePercent: 1.29,
    volume: 28_100_000,
    marketStatus: "open",
    timestamp: new Date().toISOString(),
  },
  {
    symbol: "NVDA",
    price: 178.42,
    change: -1.83,
    changePercent: -1.02,
    volume: 45_200_000,
    marketStatus: "open",
    timestamp: new Date().toISOString(),
  },
  {
    symbol: "QQQ",
    price: 575.62,
    change: 4.18,
    changePercent: 0.73,
    volume: 19_800_000,
    marketStatus: "open",
    timestamp: new Date().toISOString(),
  },
];

const mockPortfolio: Portfolio = {
  totalValue: 104_820,
  dailyPnl: 1_240,
  dailyPnlPercent: 1.2,
  totalReturn: 4_820,
  totalReturnPercent: 4.82,
  buyingPower: 48_200,
  invested: 56_620,
  openPositions: 5,
  cash: 48_200,
};

const mockPositions: Position[] = [
  {
    id: "pos-1",
    symbol: "SPY",
    assetType: "etf",
    side: "buy",
    quantity: 40,
    averagePrice: 642.1,
    currentPrice: 650.24,
    marketValue: 26_009.6,
    pnl: 325.6,
    pnlPercent: 1.27,
    status: "open",
  },
  {
    id: "pos-2",
    symbol: "AAPL",
    assetType: "stock",
    side: "buy",
    quantity: 50,
    averagePrice: 241.2,
    currentPrice: 247.18,
    marketValue: 12_359,
    pnl: 299,
    pnlPercent: 2.48,
    status: "open",
  },
  {
    id: "pos-3",
    symbol: "NVDA",
    assetType: "stock",
    side: "buy",
    quantity: 30,
    averagePrice: 174.2,
    currentPrice: 178.42,
    marketValue: 5_352.6,
    pnl: 126.6,
    pnlPercent: 2.42,
    status: "open",
  },
  {
    id: "pos-4",
    symbol: "AAPL 250C",
    assetType: "option",
    side: "buy",
    quantity: 2,
    averagePrice: 4.82,
    currentPrice: 5.44,
    marketValue: 1_088,
    pnl: 124,
    pnlPercent: 12.86,
    delta: 0.48,
    gamma: 0.031,
    theta: -0.08,
    vega: 0.12,
    impliedVolatility: 31.4,
    status: "open",
  },
  {
    id: "pos-5",
    symbol: "QQQ",
    assetType: "etf",
    side: "buy",
    quantity: 20,
    averagePrice: 569.2,
    currentPrice: 575.62,
    marketValue: 11_512.4,
    pnl: 128.4,
    pnlPercent: 1.13,
    status: "open",
  },
];

let mockTrades: Trade[] = [
  {
    id: "trade-1",
    symbol: "AAPL 250C",
    assetType: "option",
    side: "buy",
    quantity: 2,
    price: 4.82,
    pnl: 124,
    status: "filled",
    timestamp: new Date(
      Date.now() - 120_000,
    ).toISOString(),
  },
  {
    id: "trade-2",
    symbol: "SPY",
    assetType: "etf",
    side: "buy",
    quantity: 40,
    price: 642.1,
    pnl: 325.6,
    status: "filled",
    timestamp: new Date(
      Date.now() - 3_600_000,
    ).toISOString(),
  },
  {
    id: "trade-3",
    symbol: "NVDA",
    assetType: "stock",
    side: "buy",
    quantity: 30,
    price: 174.2,
    pnl: 126.6,
    status: "filled",
    timestamp: new Date(
      Date.now() - 7_200_000,
    ).toISOString(),
  },
];

const mockChart: ChartPoint[] = Array.from(
  { length: 40 },
  (_, index) => {
    const base =
      638 + index * 0.32;
    const noise =
      Math.sin(index * 0.8) * 2.8;
    const price =
      base + noise;

    return {
      timestamp: `${10 + Math.floor(index / 6)}:${String(
        (index * 5) % 60,
      ).padStart(2, "0")}`,
      price: Number(
        price.toFixed(2),
      ),
      volume:
        500_000 +
        Math.abs(
          Math.sin(index),
        ) *
          900_000,
      open: Number(
        (price - 0.7).toFixed(2),
      ),
      high: Number(
        (price + 2).toFixed(2),
      ),
      low: Number(
        (price - 1.8).toFixed(2),
      ),
      close: Number(
        (price + 0.8).toFixed(2),
      ),
    };
  },
);

const mockAgent: AgentState = {
  status: "active",
  regime: "bullish",
  confidence: 87,
  riskLevel: "moderate",
  latestSignal: {
    symbol: "AAPL",
    action: "buy",
    contract: "AAPL 250C",
    strike: 250,
    expiry: "2026-09-18",
    impliedVolatility: 31.4,
    expectedRealizedVolatility: 24.8,
    edge: 6.6,
    confidence: 89,
    suggestedSize: 1_240,
    factors: [
      "Bullish momentum",
      "IV above expected RV",
      "Defined risk",
      "Liquidity acceptable",
    ],
  },
  risk: {
    portfolioExposure: 72,
    dailyLoss: 420,
    dailyLossLimit: 2_000,
    maxPositionRisk: 850,
    portfolioDelta: 0.31,
    portfolioVega: 0.18,
    concentration: "low",
    status: "safe",
  },
  timeline: [
    {
      id: "event-1",
      timestamp: "10:31:42",
      title: "Market data received",
      description:
        "Latest market snapshot processed.",
      status: "completed",
    },
    {
      id: "event-2",
      timestamp: "10:31:43",
      title: "Regime detected",
      description:
        "Market regime classified as bullish.",
      status: "completed",
    },
    {
      id: "event-3",
      timestamp: "10:31:44",
      title: "Volatility evaluated",
      description:
        "Expected realized volatility calculated.",
      status: "completed",
    },
    {
      id: "event-4",
      timestamp: "10:31:45",
      title: "IV/RV edge detected",
      description:
        "Positive volatility edge identified.",
      status: "completed",
    },
    {
      id: "event-5",
      timestamp: "10:31:46",
      title: "Strategy selected",
      description:
        "Defined-risk call structure selected.",
      status: "completed",
    },
    {
      id: "event-6",
      timestamp: "10:31:47",
      title: "Risk validation",
      description:
        "Position passed portfolio risk checks.",
      status: "completed",
    },
    {
      id: "event-7",
      timestamp: "10:31:48",
      title: "Order submitted",
      description:
        "Trade request submitted for execution.",
      status: "running",
    },
  ],
  lastDecision: "AAPL 250C — BUY",
};

let mockAgentStatus =
  mockAgent.status;

function buildMockOption(
  symbol: string,
  strike: number,
  expiry: string,
  type: "call" | "put",
  index: number,
): OptionContract {
  const underlying =
    mockQuotes.find(
      (quote) =>
        quote.symbol === symbol,
    )?.price ?? 247.18;

  const intrinsic =
    type === "call"
      ? Math.max(
          underlying - strike,
          0,
        )
      : Math.max(
          strike - underlying,
          0,
        );

  const distance =
    Math.abs(
      underlying - strike,
    );

  const timeValue =
    Math.max(
      0.75,
      7 -
        distance * 0.08 -
        index * 0.03,
    );

  const mid =
    intrinsic + timeValue;

  const delta =
    type === "call"
      ? Math.max(
          0.08,
          Math.min(
            0.92,
            0.5 +
              (underlying -
                strike) /
                25,
          ),
        )
      : Math.min(
          -0.08,
          Math.max(
            -0.92,
            -0.5 +
              (strike -
                underlying) /
                25,
          ),
        );

  return {
    symbol,
    contractSymbol: `${symbol}-${expiry}-${strike}-${type.toUpperCase()}`,
    strike,
    expiry,
    type,
    bid: Number(
      Math.max(
        0.05,
        mid - 0.12,
      ).toFixed(2),
    ),
    ask: Number(
      (mid + 0.12).toFixed(2),
    ),
    last: Number(
      mid.toFixed(2),
    ),
    volume:
      250 +
      (10 - index) *
        125,
    openInterest:
      1_500 +
      (10 - index) *
        450,
    impliedVolatility:
      Number(
        (
          0.25 +
          Math.abs(
            strike -
              underlying,
          ) *
            0.0018 +
          (type === "put"
            ? 0.012
            : 0)
        ).toFixed(4),
      ),
    delta: Number(
      delta.toFixed(4),
    ),
    gamma: Number(
      Math.max(
        0.008,
        0.035 -
          index * 0.0015,
      ).toFixed(4),
    ),
    theta: Number(
      -Math.max(
        0.03,
        0.12 -
          index * 0.006,
      ).toFixed(4),
    ),
    vega: Number(
      Math.max(
        0.06,
        0.19 -
          index * 0.008,
      ).toFixed(4),
    ),
  };
}

function buildMockChain(
  symbol: string,
): OptionChain {
  const quote =
    mockQuotes.find(
      (item) =>
        item.symbol === symbol,
    );

  const underlyingPrice =
    quote?.price ?? 247.18;

  const expiry =
    "2026-09-18";

  const center =
    Math.round(
      underlyingPrice / 5,
    ) * 5;

  const strikes = Array.from(
    { length: 11 },
    (_, index) =>
      center +
      (index - 5) * 5,
  );

  return {
    symbol,
    underlyingPrice,
    expiry,
    calls: strikes.map(
      (strike, index) =>
        buildMockOption(
          symbol,
          strike,
          expiry,
          "call",
          index,
        ),
    ),
    puts: strikes.map(
      (strike, index) =>
        buildMockOption(
          symbol,
          strike,
          expiry,
          "put",
          index,
        ),
    ),
    timestamp:
      new Date().toISOString(),
  };
}

export async function getMarketQuotes(): Promise<
  Quote[]
> {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockQuotes;
  }

  return apiClient.get<Quote[]>(
    "/market/quotes",
  );
}

export async function getMarketChart(
  symbol: string,
  timeframe: ChartTimeframe = "1D",
): Promise<ChartPoint[]> {
  if (USE_MOCK_DATA) {
    await delay(200);

    const multiplier =
      timeframe === "1D"
        ? 1
        : timeframe === "5D"
          ? 1.05
          : timeframe === "1M"
            ? 1.1
            : timeframe === "3M"
              ? 1.15
              : timeframe === "6M"
                ? 1.2
                : 1.25;

    return mockChart.map(
      (point) => ({
        ...point,
        price: Number(
          (
            point.price *
              multiplier +
            (symbol.length - 3) *
              1.7
          ).toFixed(2),
        ),
      }),
    );
  }

  return apiClient.get<
    ChartPoint[]
  >(
    `/market/chart/${encodeURIComponent(
      symbol,
    )}?timeframe=${encodeURIComponent(
      timeframe,
    )}`,
  );
}

export async function getPortfolio(): Promise<Portfolio> {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockPortfolio;
  }

  return apiClient.get<Portfolio>(
    "/portfolio",
  );
}

export async function getPositions(): Promise<
  Position[]
> {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockPositions;
  }

  return apiClient.get<Position[]>(
    "/portfolio/positions",
  );
}

export async function getTrades(): Promise<
  Trade[]
> {
  if (USE_MOCK_DATA) {
    await delay(200);
    return mockTrades;
  }

  return apiClient.get<Trade[]>(
    "/trades",
  );
}

export async function createOrder(
  order: OrderRequest,
): Promise<OrderResponse> {
  if (USE_MOCK_DATA) {
    await delay(500);

    const matchingQuote =
      mockQuotes.find(
        (quote) =>
          quote.symbol.toUpperCase() ===
          order.symbol.toUpperCase(),
      );

    const marketPrice =
      matchingQuote?.price ?? 100;

    const executionPrice =
      order.price ??
      marketPrice;

    const orderId =
      `order-${Date.now()}`;

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      symbol:
        order.symbol.toUpperCase(),
      assetType: "stock",
      side: order.side,
      quantity: order.quantity,
      price: executionPrice,
      status: "filled",
      timestamp:
        new Date().toISOString(),
    };

    mockTrades = [
      newTrade,
      ...mockTrades,
    ].slice(0, 20);

    return {
      orderId,
      symbol:
        order.symbol.toUpperCase(),
      side: order.side,
      quantity: order.quantity,
      orderType: order.orderType,
      timeInForce:
        order.timeInForce,
      price: executionPrice,
      status: "filled",
      timestamp:
        new Date().toISOString(),
      message:
        "Mock order executed successfully.",
    };
  }

  return apiClient.post<
    OrderResponse
  >(
    "/orders",
    order,
  );
}

export async function getAgent(): Promise<AgentState> {
  if (USE_MOCK_DATA) {
    await delay(200);

    return {
      ...mockAgent,
      status: mockAgentStatus,
    };
  }

  return apiClient.get<AgentState>(
    "/agent/status",
  );
}

export async function pauseAgent(): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(150);
    mockAgentStatus =
      "paused";
    return;
  }

  await apiClient.post(
    "/agent/pause",
  );
}

export async function resumeAgent(): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(150);
    mockAgentStatus =
      "active";
    return;
  }

  await apiClient.post(
    "/agent/resume",
  );
}

export async function getOptionChain(
  symbol: string,
  expiry?: string,
): Promise<OptionChain> {
  if (USE_MOCK_DATA) {
    await delay(250);

    const chain =
      buildMockChain(
        symbol.toUpperCase(),
      );

    if (
      expiry &&
      expiry !== chain.expiry
    ) {
      return {
        ...chain,
        expiry,
        calls: chain.calls.map(
          (contract) => ({
            ...contract,
            expiry,
            contractSymbol:
              `${symbol}-${expiry}-${contract.strike}-CALL`,
          }),
        ),
        puts: chain.puts.map(
          (contract) => ({
            ...contract,
            expiry,
            contractSymbol:
              `${symbol}-${expiry}-${contract.strike}-PUT`,
          }),
        ),
      };
    }

    return chain;
  }

  const query =
    expiry
      ? `?expiry=${encodeURIComponent(
          expiry,
        )}`
      : "";

  return apiClient.get<OptionChain>(
    `/options/chain/${encodeURIComponent(
      symbol,
    )}${query}`,
  );
}

export async function getOptionContract(
  contractSymbol: string,
): Promise<OptionQuote> {
  if (USE_MOCK_DATA) {
    await delay(200);

    const chain =
      buildMockChain("AAPL");

    const contract =
      [
        ...chain.calls,
        ...chain.puts,
      ].find(
        (item) =>
          item.contractSymbol ===
          contractSymbol,
      );

    if (!contract) {
      const fallback =
        chain.calls[5];

      return {
        contract:
          fallback,
        timestamp:
          new Date().toISOString(),
      };
    }

    return {
      contract,
      timestamp:
        new Date().toISOString(),
    };
  }

  return apiClient.get<OptionQuote>(
    `/options/contract/${encodeURIComponent(
      contractSymbol,
    )}`,
  );
}

export interface SystemStatus {
  status: string;
  system: string;
  version: string;
  environment: string;
  trading_mode: string;
  broker_connected: boolean;
  ai_engine_connected: boolean;
  agent_status: string;
  active_model: string;
  data_feed: string;
}

export async function getSystemStatus(): Promise<SystemStatus> {
  if (USE_MOCK_DATA) {
    await delay(150);
    return {
      status: "ONLINE",
      system: "NeuroTrust Autonomous AI Options Trading Gateway",
      version: "1.0.0",
      environment: "development",
      trading_mode: "paper",
      broker_connected: true,
      ai_engine_connected: true,
      agent_status: "active",
      active_model: "openai/gpt-oss-120b",
      data_feed: "iex",
    };
  }

  return apiClient.get<SystemStatus>("/system/status");
}