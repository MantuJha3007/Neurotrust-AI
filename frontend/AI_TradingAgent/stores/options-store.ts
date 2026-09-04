"use client";

import { create } from "zustand";

import type {
  OptionContract,
  OptionLeg,
  OptionType,
} from "@/types/options";

interface OptionsState {
  selectedSymbol: string;
  selectedExpiry: string;
  selectedType: OptionType;
  selectedContract: OptionContract | null;
  strategyLegs: OptionLeg[];

  setSelectedSymbol: (symbol: string) => void;
  setSelectedExpiry: (expiry: string) => void;
  setSelectedType: (type: OptionType) => void;
  setSelectedContract: (
    contract: OptionContract | null,
  ) => void;

  addLeg: (leg: OptionLeg) => void;
  removeLeg: (legId: string) => void;
  updateLeg: (
    legId: string,
    updates: Partial<OptionLeg>,
  ) => void;
  clearLegs: () => void;
}

export const useOptionsStore =
  create<OptionsState>((set) => ({
    selectedSymbol: "AAPL",
    selectedExpiry: "2026-09-18",
    selectedType: "call",
    selectedContract: null,
    strategyLegs: [],

    setSelectedSymbol: (symbol) =>
      set({
        selectedSymbol:
          symbol.toUpperCase(),
        selectedContract: null,
        strategyLegs: [],
      }),

    setSelectedExpiry: (expiry) =>
      set({
        selectedExpiry: expiry,
        selectedContract: null,
      }),

    setSelectedType: (type) =>
      set({
        selectedType: type,
        selectedContract: null,
      }),

    setSelectedContract: (
      contract,
    ) =>
      set({
        selectedContract:
          contract,
      }),

    addLeg: (leg) =>
      set((state) => ({
        strategyLegs: [
          ...state.strategyLegs,
          leg,
        ],
      })),

    removeLeg: (legId) =>
      set((state) => ({
        strategyLegs:
          state.strategyLegs.filter(
            (leg) =>
              leg.id !== legId,
          ),
      })),

    updateLeg: (
      legId,
      updates,
    ) =>
      set((state) => ({
        strategyLegs:
          state.strategyLegs.map(
            (leg) =>
              leg.id === legId
                ? {
                    ...leg,
                    ...updates,
                  }
                : leg,
          ),
      })),

    clearLegs: () =>
      set({
        strategyLegs: [],
      }),
  }));