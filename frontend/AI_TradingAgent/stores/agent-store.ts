"use client";

import { create } from "zustand";
import type {
  AgentSignal,
  AgentStatus,
  MarketRegime,
  RiskLevel,
} from "@/types/trading";

interface AgentStore {
  status: AgentStatus;
  regime: MarketRegime;
  confidence: number;
  riskLevel: RiskLevel;
  latestSignal: AgentSignal | null;
  lastDecision: string;

  setStatus: (
    status: AgentStatus,
  ) => void;

  setRegime: (
    regime: MarketRegime,
  ) => void;

  setConfidence: (
    confidence: number,
  ) => void;

  setRiskLevel: (
    riskLevel: RiskLevel,
  ) => void;

  setSignal: (
    signal: AgentSignal | null,
  ) => void;

  setLastDecision: (
    decision: string,
  ) => void;
}

export const useAgentStore =
  create<AgentStore>((set) => ({
    status: "active",
    regime: "bullish",
    confidence: 87,
    riskLevel: "moderate",
    latestSignal: null,
    lastDecision:
      "Waiting for next evaluation",

    setStatus: (status) =>
      set({ status }),

    setRegime: (regime) =>
      set({ regime }),

    setConfidence: (confidence) =>
      set({ confidence }),

    setRiskLevel: (riskLevel) =>
      set({ riskLevel }),

    setSignal: (latestSignal) =>
      set({ latestSignal }),

    setLastDecision: (lastDecision) =>
      set({ lastDecision }),
  }));