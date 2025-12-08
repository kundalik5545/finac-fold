import { z } from "zod";

// Asset validation schemas
export const addAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["PROPERTY", "VEHICLE", "JEWELRY", "ELECTRONICS", "OTHER"]),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  currentValue: z.number().min(0, "Current value must be non-negative"),
  purchaseValue: z.number().min(0, "Purchase value must be non-negative"),
  purchaseDate: z.string().or(z.date()),
  purchaseReason: z.string().optional().nullable(),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "ONLINE", "OTHER"]).optional().nullable(),
  sellDate: z.string().or(z.date()).optional().nullable(),
  sellPrice: z.number().min(0, "Sell price must be non-negative").optional().nullable(),
  profitLoss: z.number().optional().nullable(),
  sellReason: z.string().optional().nullable(),
  transactionStatus: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional().nullable(),
  description: z.string().optional().nullable(),
});

// Update schema allows partial updates (all fields optional)
export const updateAssetSchema = addAssetSchema.partial();
