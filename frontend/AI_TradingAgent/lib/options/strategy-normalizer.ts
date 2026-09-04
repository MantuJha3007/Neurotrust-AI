import type {
  OptionLeg,
  StrategyDefinition,
  StrategyRiskProfile,
} from "@/types/options";

function round(
  value: number,
  decimals = 2,
): number {
  const factor =
    10 ** decimals;

  return (
    Math.round(
      value * factor,
    ) / factor
  );
}

function calculateNetPremium(
  legs: OptionLeg[],
): number {
  return round(
    legs.reduce(
      (total, leg) => {
        const signedPremium =
          leg.action === "buy"
            ? -leg.premium
            : leg.premium;

        return (
          total +
          signedPremium *
            leg.quantity *
            100
        );
      },
      0,
    ),
  );
}

function calculateCapitalRequired(
  legs: OptionLeg[],
): number {
  return round(
    legs.reduce(
      (total, leg) => {
        if (leg.action === "buy") {
          return (
            total +
            leg.premium *
              leg.quantity *
              100
          );
        }

        return total;
      },
      0,
    ),
  );
}

function calculateRiskProfile(
  legs: OptionLeg[],
): StrategyRiskProfile {
  if (legs.length === 0) {
    return "defined";
  }

  const hasShortNakedCall =
    legs.some(
      (leg) =>
        leg.type === "call" &&
        leg.action === "sell",
    );

  return hasShortNakedCall
    ? "undefined"
    : "defined";
}

function calculateGreeks(
  legs: OptionLeg[],
) {
  return legs.reduce(
    (totals, leg) => {
      const multiplier =
        leg.action === "buy"
          ? 1
          : -1;

      const quantity =
        leg.quantity *
        multiplier;

      return {
        delta:
          totals.delta +
          leg.delta * quantity,
        gamma:
          totals.gamma +
          leg.gamma * quantity,
        theta:
          totals.theta +
          leg.theta * quantity,
        vega:
          totals.vega +
          leg.vega * quantity,
      };
    },
    {
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
    },
  );
}

export function normalizeStrategy(
  id: string,
  name: string,
  description: string,
  legs: OptionLeg[],
): StrategyDefinition {
  const netPremium =
    calculateNetPremium(
      legs,
    );

  const riskProfile =
    calculateRiskProfile(
      legs,
    );

  return {
    id,
    name,
    description,
    legs,
    status:
      legs.length > 0
        ? "validated"
        : "draft",
    riskProfile,
    netPremium,
    maxProfit:
      null,
    maxLoss:
      riskProfile ===
      "undefined"
        ? null
        : Math.abs(
            netPremium,
          ),
    breakevens: [],
  };
}

export function calculateStrategyRisk(
  legs: OptionLeg[],
) {
  const greeks =
    calculateGreeks(legs);

  const netPremium =
    calculateNetPremium(
      legs,
    );

  const riskProfile =
    calculateRiskProfile(
      legs,
    );

  return {
    netDelta: round(
      greeks.delta,
      4,
    ),
    netGamma: round(
      greeks.gamma,
      4,
    ),
    netTheta: round(
      greeks.theta,
      4,
    ),
    netVega: round(
      greeks.vega,
      4,
    ),
    maxProfit:
      riskProfile ===
      "undefined"
        ? null
        : Math.max(
            0,
            Math.abs(
              netPremium,
            ),
          ),
    maxLoss:
      riskProfile ===
      "undefined"
        ? null
        : Math.max(
            0,
            Math.abs(
              netPremium,
            ),
          ),
    breakevens: [],
    capitalRequired:
      calculateCapitalRequired(
        legs,
      ),
    riskProfile,
  };
}

export function calculatePayoff(
  legs: OptionLeg[],
  underlyingPrice: number,
): number {
  if (legs.length === 0) {
    return 0;
  }

  return round(
    legs.reduce(
      (total, leg) => {
        const intrinsic =
          leg.type === "call"
            ? Math.max(
                underlyingPrice -
                  leg.strike,
                0,
              )
            : Math.max(
                leg.strike -
                  underlyingPrice,
                0,
              );

        const contractPnl =
          leg.action === "buy"
            ? intrinsic -
              leg.premium
            : leg.premium -
              intrinsic;

        return (
          total +
          contractPnl *
            leg.quantity *
            100
        );
      },
      0,
    ),
  );
}