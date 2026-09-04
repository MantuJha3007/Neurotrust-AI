export type AgentAction =
  | "analyze"
  | "buy"
  | "sell"
  | "hold"
  | "hedge"
  | "reject"
  | "execute"
  | "monitor";

export type DecisionEventStatus =
  | "pending"
  | "running"
  | "completed"
  | "warning"
  | "failed";

export type DecisionEventCategory =
  | "market"
  | "signal"
  | "strategy"
  | "risk"
  | "execution"
  | "system";

export interface AgentDecisionEvent {
  id: string;
  timestamp: string;
  category: DecisionEventCategory;
  title: string;
  description: string;
  action?: AgentAction;
  status: DecisionEventStatus;
  confidence?: number;
  symbol?: string;
  contract?: string;
  metadata?: Record<
    string,
    string | number | boolean
  >;
}

export interface AgentDecision {
  id: string;
  timestamp: string;
  symbol: string;
  action: AgentAction;
  contract?: string;
  strategy?: string;
  confidence: number;
  rationale: string;
  expectedEdge?: number;
  riskScore?: number;
  suggestedSize?: number;
}

export interface AgentStreamState {
  connected: boolean;
  streaming: boolean;
  lastUpdated: string | null;
  events: AgentDecisionEvent[];
  latestDecision: AgentDecision | null;
}

export interface ExecutionEvent {
  id: string;
  timestamp: string;
  orderId: string;
  symbol: string;
  action: "buy" | "sell";
  quantity: number;
  price?: number;
  status:
    | "submitted"
    | "accepted"
    | "partial"
    | "filled"
    | "cancelled"
    | "rejected";
  message: string;
}

export interface ExecutionStreamState {
  connected: boolean;
  events: ExecutionEvent[];
}