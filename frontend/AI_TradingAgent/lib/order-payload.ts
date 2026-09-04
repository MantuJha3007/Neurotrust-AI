import type { OrderRequest } from "@/types/trading";
import type { OrderFormValues } from "@/lib/validations";

export function buildOrderRequest(
  values: OrderFormValues,
): OrderRequest {
  const order: OrderRequest = {
    symbol: values.symbol.trim().toUpperCase(),
    side: values.side,
    quantity: values.quantity,
    orderType: values.orderType,
    timeInForce: values.timeInForce,
  };

  if (
    values.orderType === "limit" ||
    values.orderType === "stop"
  ) {
    if (values.price !== undefined) {
      order.price = values.price;
    }
  }

  return order;
}