import { z } from "zod";

export const orderSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(1, "Symbol is required")
      .max(20, "Symbol is too long")
      .regex(
        /^[A-Za-z0-9.\s]+$/,
        "Invalid symbol",
      ),

    side: z.enum(["buy", "sell"], {
      message: "Select BUY or SELL",
    }),

    quantity: z
      .number({
        message: "Quantity is required",
      })
      .int("Quantity must be a whole number")
      .positive("Quantity must be greater than zero"),

    orderType: z.enum(["market", "limit", "stop"], {
      message: "Select an order type",
    }),

    timeInForce: z.enum(["day", "gtc"], {
      message: "Select a time in force",
    }),

    price: z
      .number()
      .positive("Price must be greater than zero")
      .optional(),
  })
  .superRefine((values, context) => {
    if (
      (values.orderType === "limit" ||
        values.orderType === "stop") &&
      values.price === undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: `${values.orderType === "limit" ? "Limit" : "Stop"} price is required`,
      });
    }
  });

export type OrderFormValues = z.infer<typeof orderSchema>;