"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAgent,
} from "@/hooks/use-agent";

import type {
  AgentDecision,
  AgentDecisionEvent,
  AgentStreamState,
} from "@/types/agent";

function convertAgentEvent(
  eventId: string,
  title: string,
  description: string,
  category: AgentDecisionEvent["category"],
  status: AgentDecisionEvent["status"],
  action?: AgentDecisionEvent["action"],
  symbol?: string,
  confidence?: number,
): AgentDecisionEvent {
  return {
    id: eventId,
    timestamp:
      new Date().toISOString(),
    category,
    title,
    description,
    action,
    status,
    symbol,
    confidence,
  };
}

function buildDecision(
  agent: NonNullable<
    ReturnType<
      typeof useAgent
    >["agent"]
  >,
): AgentDecision | null {
  const signal =
    agent.latestSignal;

  if (!signal) {
    return null;
  }

  return {
    id: "latest-agent-decision",
    timestamp:
      new Date().toISOString(),
    symbol: signal.symbol,
    action: signal.action,
    contract:
      signal.contract,
    strategy:
      "Defined-risk directional option",
    confidence:
      signal.confidence,
    rationale:
      signal.factors.join(
        " • ",
      ),
    expectedEdge:
      signal.edge,
    riskScore:
      agent.riskLevel ===
      "critical"
        ? 90
        : agent.riskLevel ===
            "high"
          ? 70
          : agent.riskLevel ===
              "moderate"
            ? 45
            : 20,
    suggestedSize:
      signal.suggestedSize,
  };
}

export function useAgentStream(): AgentStreamState {
  const {
    agent,
    isLoading,
    isError,
  } = useAgent();

  const [events, setEvents] =
    useState<
      AgentDecisionEvent[]
    >([]);

  const [streaming, setStreaming] =
    useState(false);

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isError || !agent) {
      setConnected(false);
      setStreaming(false);
      return;
    }

    setConnected(true);
    setStreaming(true);

    const signal =
      agent.latestSignal;

    const nextEvents: AgentDecisionEvent[] =
      [
        convertAgentEvent(
          "stream-market",
          "Market snapshot processed",
          "Latest market data has been received by the decision engine.",
          "market",
          "completed",
          "analyze",
          signal?.symbol,
        ),

        convertAgentEvent(
          "stream-regime",
          "Market regime evaluated",
          `Current regime: ${agent.regime}.`,
          "market",
          "completed",
          "analyze",
          signal?.symbol,
          agent.confidence,
        ),

        convertAgentEvent(
          "stream-signal",
          "Trading opportunity detected",
          signal
            ? `${signal.contract} shows an estimated ${signal.edge.toFixed(
                2,
              )}% edge.`
            : "No active trading signal.",
          "signal",
          signal
            ? "completed"
            : "pending",
          signal?.action,
          signal?.symbol,
          signal?.confidence,
        ),

        convertAgentEvent(
          "stream-risk",
          "Portfolio risk validated",
          `Risk status: ${agent.risk.status}. Portfolio exposure: ${agent.risk.portfolioExposure.toFixed(
            1,
          )}%.`,
          "risk",
          agent.risk.status ===
            "blocked"
            ? "warning"
            : "completed",
          "monitor",
          signal?.symbol,
        ),

        convertAgentEvent(
          "stream-action",
          "Agent decision",
          agent.lastDecision,
          "strategy",
          "running",
          signal?.action,
          signal?.symbol,
          signal?.confidence,
        ),
      ];

    setEvents(
      nextEvents,
    );

    return () => {
      setStreaming(false);
    };
  }, [
    agent,
    isError,
    isLoading,
  ]);

  const latestDecision =
    useMemo(
      () =>
        agent
          ? buildDecision(agent)
          : null,
      [agent],
    );

  return {
    connected,
    streaming,
    lastUpdated:
      agent
        ? new Date().toISOString()
        : null,
    events,
    latestDecision,
  };
}