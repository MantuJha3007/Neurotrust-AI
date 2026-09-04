"use client";

import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/data-state";
import { useMarketData } from "@/hooks/use-market-data";

function formatCurrency(
  value: number,
): string {
  return `$${value.toFixed(2)}`;
}

export function MarketOverview(): React.ReactElement {
  const {
    quotes,
    isLoading,
    isError,
    refetch,
  } = useMarketData();

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Market Overview
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isError ? (
          <ErrorState
            message="Unable to load market data."
            onRetry={() => {
              void refetch();
            }}
          />
        ) : isLoading ? (
          <LoadingState rows={4} />
        ) : quotes.length === 0 ? (
          <EmptyState
            title="No market data"
            description="Market quotes are currently unavailable."
          />
        ) : (
          <div className="space-y-2">
            {quotes.map(
              (quote) => (
                <div
                  key={quote.symbol}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div>
                    <p className="font-semibold">
                      {quote.symbol}
                    </p>

                    <p className="text-xs capitalize text-muted-foreground">
                      {quote.marketStatus}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(
                        quote.price,
                      )}
                    </p>

                    <p
                      className={
                        quote.changePercent >= 0
                          ? "text-xs text-emerald-500"
                          : "text-xs text-red-500"
                      }
                    >
                      {quote.changePercent >= 0
                        ? "+"
                        : ""}
                      {quote.changePercent.toFixed(
                        2,
                      )}
                      %
                    </p>
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