export type OptionType =
  | "call"
  | "put";

export type OptionAction =
  | "buy"
  | "sell";

export type StrategySide =
  | "long"
  | "short";

export type StrategyRiskProfile =
  | "defined"
  | "undefined";

export type StrategyStatus =
  | "draft"
  | "validated"
  | "ready"
  | "submitted";

export interface OptionContract {
  symbol: string;
  contractSymbol: string;
  strike: number;
  expiry: string;
  type: OptionType;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface OptionQuote {
  contract: OptionContract;
  timestamp: string;
}

export interface OptionChain {
  symbol: string;
  underlyingPrice: number;
  expiry: string;
  calls: OptionContract[];
  puts: OptionContract[];
  timestamp: string;
}

export interface OptionLeg {
  id: string;
  contractSymbol: string;
  symbol: string;
  type: OptionType;
  action: OptionAction;
  quantity: number;
  strike: number;
  expiry: string;
  premium: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  impliedVolatility: number;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  description: string;
  legs: OptionLeg[];
  status: StrategyStatus;
  riskProfile: StrategyRiskProfile;
  netPremium: number;
  maxProfit: number | null;
  maxLoss: number | null;
  breakevens: number[];
}

export interface StrategyRiskSummary {
  netDelta: number;
  netGamma: number;
  netTheta: number;
  netVega: number;
  maxProfit: number | null;
  maxLoss: number | null;
  breakevens: number[];
  capitalRequired: number;
  riskProfile: StrategyRiskProfile;
}

export interface PayoffPoint {
  underlyingPrice: number;
  pnl: number;
}

export interface StrategyOrderRequest {
  strategyId: string;
  symbol: string;
  legs: OptionLeg[];
  limitPrice?: number;
  timeInForce: "day" | "gtc";
}

export interface OptionPosition {
  id: string;
  strategyId?: string;
  symbol: string;
  contractSymbol: string;
  type: OptionType;
  side: OptionAction;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  impliedVolatility: number;
  expiry: string;
  strike: number;
}