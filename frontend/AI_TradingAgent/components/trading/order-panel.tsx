"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";

import { useOrder } from "@/hooks/use-order";
import { buildOrderRequest } from "@/lib/order-payload";
import { orderSchema } from "@/lib/validations";

import type {
  OrderRequest,
  OrderType,
  OrderSide,
  TimeInForce,
} from "@/types/trading";

interface OrderPanelProps {
  symbol?: string;
  contractSymbol?: string;
  defaultPrice?: number;
  defaultTimeInForce?: TimeInForce;
  onSubmitted?: (order: OrderRequest) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function OrderPanel({
  symbol = "AAPL",
  contractSymbol = "",
  defaultPrice = 4.85,
  defaultTimeInForce = "day",
  onSubmitted,
}: OrderPanelProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] =
    useState<OrderType>("limit");
  const [timeInForce, setTimeInForce] =
    useState<TimeInForce>(defaultTimeInForce);
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState(
    defaultPrice.toFixed(2),
  );
  const [validationMessage, setValidationMessage] =
    useState<string | null>(null);

  const {
    submitOrder,
    isSubmitting,
    isSuccess,
    isError,
    error,
    result,
    reset,
  } = useOrder();

  const normalizedSymbol = symbol
    .trim()
    .toUpperCase();

  const parsedQuantity = Number(quantity);
  const parsedPrice = Number(price);

  const estimatedValue = useMemo(() => {
    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return 0;
    }

    const effectivePrice =
      orderType === "limit"
        ? parsedPrice
        : defaultPrice;

    if (
      !Number.isFinite(effectivePrice) ||
      effectivePrice <= 0
    ) {
      return 0;
    }

    return parsedQuantity * effectivePrice * 100;
  }, [
    defaultPrice,
    orderType,
    parsedPrice,
    parsedQuantity,
  ]);

  function handleSideChange(
    nextSide: OrderSide,
  ): void {
    setSide(nextSide);
    setValidationMessage(null);
    reset();
  }

  function handleOrderTypeChange(
    nextOrderType: OrderType,
  ): void {
    setOrderType(nextOrderType);
    setValidationMessage(null);
    reset();
  }

  function handleQuantityChange(
    value: string,
  ): void {
    setQuantity(value);
    setValidationMessage(null);
    reset();
  }

  function handlePriceChange(
    value: string,
  ): void {
    setPrice(value);
    setValidationMessage(null);
    reset();
  }

  function handleTimeInForceChange(
    value: TimeInForce,
  ): void {
    setTimeInForce(value);
    setValidationMessage(null);
    reset();
  }

  async function handleSubmit(): Promise<void> {
    setValidationMessage(null);
    reset();

    const quantityValue = Number(quantity);
    const priceValue = Number(price);

    const parsed = orderSchema.safeParse({
      symbol: normalizedSymbol,
      side,
      quantity: quantityValue,
      orderType,
      timeInForce,
      price:
        orderType === "limit" ||
        orderType === "stop"
          ? priceValue
          : undefined,
    });

    if (!parsed.success) {
      const firstIssue =
        parsed.error.issues[0];

      setValidationMessage(
        firstIssue?.message ??
          "Please check the order details.",
      );

      return;
    }

    const request = buildOrderRequest(
      parsed.data,
    );

    try {
      const response =
        await submitOrder(request);

      onSubmitted?.(request);

      if (!response) {
        return;
      }
    } catch {
      return;
    }
  }

  const mutationMessage =
    error instanceof Error
      ? error.message
      : "Order submission failed.";

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/10">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Order Entry
        </h2>

        {contractSymbol ? (
          <p className="mt-1 break-all font-mono text-[10px] text-slate-600">
            {contractSymbol}
          </p>
        ) : (
          <p className="mt-1 font-mono text-[10px] text-slate-600">
            {normalizedSymbol}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSideChange("buy")}
          className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-semibold uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            side === "buy"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300"
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          Buy
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSideChange("sell")}
          className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-semibold uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            side === "sell"
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300"
          }`}
        >
          <ArrowDownRight className="h-4 w-4" />
          Sell
        </button>
      </div>

      <div className="mt-4">
        <label
          htmlFor="order-symbol"
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-600"
        >
          Symbol
        </label>

        <input
          id="order-symbol"
          value={normalizedSymbol}
          readOnly
          className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 font-mono text-xs font-semibold text-slate-200 outline-none"
        />
      </div>

      <div className="mt-3">
        <label
          htmlFor="order-quantity"
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-600"
        >
          Quantity
        </label>

        <input
          id="order-quantity"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={quantity}
          disabled={isSubmitting}
          onChange={(event) =>
            handleQuantityChange(
              event.target.value,
            )
          }
          className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 font-mono text-xs text-slate-200 outline-none transition-colors focus:border-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="mt-3">
        <label
          htmlFor="order-type"
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-600"
        >
          Order Type
        </label>

        <select
          id="order-type"
          value={orderType}
          disabled={isSubmitting}
          onChange={(event) =>
            handleOrderTypeChange(
              event.target.value as OrderType,
            )
          }
          className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 font-mono text-xs text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="limit">
            Limit
          </option>
          <option value="market">
            Market
          </option>
        </select>
      </div>

      <div className="mt-3">
        <label
          htmlFor="order-time-in-force"
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-600"
        >
          Time in Force
        </label>

        <select
          id="order-time-in-force"
          value={timeInForce}
          disabled={isSubmitting}
          onChange={(event) =>
            handleTimeInForceChange(
              event.target.value as TimeInForce,
            )
          }
          className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 font-mono text-xs text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="day">
            Day
          </option>
          <option value="gtc">
            GTC
          </option>
        </select>
      </div>

      {orderType === "limit" ? (
        <div className="mt-3">
          <label
            htmlFor="order-limit-price"
            className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-600"
          >
            Limit Price
          </label>

          <input
            id="order-limit-price"
            type="number"
            min={0.01}
            step={0.01}
            inputMode="decimal"
            value={price}
            disabled={isSubmitting}
            onChange={(event) =>
              handlePriceChange(
                event.target.value,
              )
            }
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 font-mono text-xs text-slate-200 outline-none transition-colors focus:border-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Estimated Notional
          </span>

          <span className="font-mono text-sm font-semibold text-slate-200">
            {formatCurrency(
              estimatedValue,
            )}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-600">
            Contract multiplier
          </span>

          <span className="font-mono text-[10px] text-slate-500">
            ×100
          </span>
        </div>
      </div>

      {validationMessage ? (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400"
        >
          {validationMessage}
        </div>
      ) : null}

      {isError ? (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400"
        >
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{mutationMessage}</span>
        </div>
      ) : null}

      {isSuccess && result ? (
        <div
          role="status"
          className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Order {result.status}
          </div>

          <div className="mt-2 space-y-1 font-mono text-[10px] text-slate-500">
            <div>
              Order ID: {result.orderId}
            </div>
            <div>
              {result.symbol} ·{" "}
              {result.quantity} ·{" "}
              {result.orderType.toUpperCase()}
            </div>
            <div>
              {result.message}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={isSubmitting}
        className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          side === "buy"
            ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            : "bg-red-500 text-white hover:bg-red-400"
        }`}
      >
        {isSubmitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}

        {isSubmitting
          ? "Submitting..."
          : `Submit ${side} Order`}
      </button>

      <p className="mt-3 text-center text-[9px] leading-relaxed text-slate-600">
        Orders are submitted through the configured
        execution API. Keep live trading disabled until
        backend risk controls are verified.
      </p>
    </section>
  );
}

export default OrderPanel;