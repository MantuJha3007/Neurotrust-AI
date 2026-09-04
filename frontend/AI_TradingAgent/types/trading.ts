export type AssetType = "stock" | "etf" | "option" | "crypto";

export type OrderSide = "buy" | "sell";

export type OrderType = "market" | "limit" | "stop";

export type TimeInForce = "day" | "gtc";

export type MarketStatus =
  | "open"
  | "closed"
  | "pre-market"
  | "after-hours"
  | "unknown";

export type AgentStatus = "active" | "paused" | "evaluating";

export type MarketRegime =
  | "bullish"
  | "bearish"
  | "neutral"
  | "high-volatility"
  | "low-volatility";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type ChartTimeframe =
  | "1D"
  | "5D"
  | "1M"
  | "3M"
  | "6M"
  | "1Y";

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketStatus: MarketStatus;
  timestamp: string;
}

export interface ChartPoint {
  timestamp: string;
  price: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Position {
  id: string;
  symbol: string;
  assetType: AssetType;
  side: OrderSide;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  impliedVolatility?: number;
  status: "open" | "closing";
}

export interface Portfolio {
  totalValue: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  buyingPower: number;
  invested: number;
  openPositions: number;
  cash: number;
}

export interface Trade {
  id: string;
  symbol: string;
  assetType: AssetType;
  side: OrderSide;
  quantity: number;
  price: number;
  pnl?: number;
  status: "filled" | "pending" | "cancelled";
  timestamp: string;
}

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  quantity: number;
  orderType: OrderType;
  timeInForce: TimeInForce;
  price?: number;
}

export interface OrderResponse {
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  orderType: OrderType;
  timeInForce: TimeInForce;
  price: number;
  status: "filled" | "pending" | "rejected";
  timestamp: string;
  message: string;
}

export interface AgentSignal {
  symbol: string;
  action: OrderSide;
  contract: string;
  strike: number;
  expiry: string;
  impliedVolatility: number;
  expectedRealizedVolatility: number;
  edge: number;
  confidence: number;
  suggestedSize: number;
  factors: string[];
}

export interface AgentRisk {
  portfolioExposure: number;
  dailyLoss: number;
  dailyLossLimit: number;
  maxPositionRisk: number;
  portfolioDelta: number;
  portfolioVega: number;
  concentration: "low" | "moderate" | "high";
  status: "safe" | "warning" | "blocked";
}

export interface DecisionEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  status: "completed" | "running" | "warning";
}

export interface AgentState {
  status: AgentStatus;
  regime: MarketRegime;
  confidence: number;
  riskLevel: RiskLevel;
  latestSignal: AgentSignal | null;
  risk: AgentRisk;
  timeline: DecisionEvent[];
  lastDecision: string;
}