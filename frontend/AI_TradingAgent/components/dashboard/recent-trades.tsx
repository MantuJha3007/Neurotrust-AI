"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTrades } from "@/hooks/use-trades";

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(value);
}

export function RecentTrades(): React.ReactElement {
  const {
    trades,
    isLoading,
    isError,
  } = useTrades();

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          Recent Trades
        </CardTitle>

        <Link
          href="/trades"
          aria-label="Open trading terminal"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent>
        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
            <p className="text-sm text-destructive">
              Unable to load recent trades.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-md bg-muted"
                />
              ),
            )}
          </div>
        ) : trades.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">
              No trades yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Your trading activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map(
              (trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div>
                    <p className="font-medium">
                      {trade.symbol}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {trade.side.toUpperCase()} ·{" "}
                      {trade.quantity} units
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(
                        trade.price,
                      )}
                    </p>

                    {typeof trade.pnl ===
                      "number" && (
                      <p
                        className={
                          trade.pnl >= 0
                            ? "text-xs text-emerald-500"
                            : "text-xs text-red-500"
                        }
                      >
                        {trade.pnl >= 0
                          ? "+"
                          : ""}
                        {formatCurrency(
                          trade.pnl,
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}