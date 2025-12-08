import { z } from "zod";

// Asset Form Schema for creating and editing assets
export const assetFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  type: z.enum(["PROPERTY", "VEHICLE", "JEWELRY", "ELECTRONICS", "OTHER"]),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  currentValue: z.number().min(0, "Current value must be non-negative"),
  purchaseValue: z.number().min(0, "Purchase value must be non-negative"),
  purchaseDate: z.string().or(z.date()),
  purchaseReason: z
    .string()
    .max(500, "Purchase reason must be less than 500 characters")
    .optional()
    .nullable(),
  paymentMethod: z
    .enum(["CASH", "UPI", "CARD", "ONLINE", "OTHER"])
    .optional()
    .nullable(),
  sellDate: z.string().or(z.date()).optional().nullable(),
  sellPrice: z
    .number()
    .min(0, "Sell price must be non-negative")
    .optional()
    .nullable(),
  profitLoss: z.number().optional().nullable(),
  sellReason: z
    .string()
    .max(500, "Sell reason must be less than 500 characters")
    .optional()
    .nullable(),
  transactionStatus: z
    .enum(["PENDING", "COMPLETED", "FAILED"])
    .optional()
    .nullable(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
});

// Update schema allows partial updates (all fields optional)
export const updateAssetSchema = assetFormSchema.partial();

// Assets Transaction Schema for recording price changes
export const assetTransactionSchema = z.object({
  value: z.number().min(0, "Value must be non-negative"),
  date: z.string().or(z.date()),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .nullable(),
});

// Update transaction schema allows partial updates
export const updateTransactionSchema = assetTransactionSchema.partial();

// Type exports for use in components
export type AssetFormValues = z.infer<typeof assetFormSchema>;
export type AssetTransactionFormValues = z.infer<typeof assetTransactionSchema>;
