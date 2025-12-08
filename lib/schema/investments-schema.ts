import { z } from "zod";

// Investment Type Enum Schema
export const investmentTypeSchema = z.enum([
  "STOCKS",
  "MUTUAL_FUNDS",
  "GOLD",
  "FIXED_DEPOSIT",
  "NPS",
  "PF",
]);

// Investment Transaction Type Enum Schema
export const investmentTransactionTypeSchema = z.enum(["INVEST", "WITHDRAW"]);

// Investment Form Schema for creating and editing investments
export const investmentFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  type: investmentTypeSchema,
  symbol: z
    .string()
    .max(50, "Symbol must be less than 50 characters")
    .optional()
    .nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  currentPrice: z
    .number()
    .min(0, "Current price must be non-negative")
    .default(0)
    .optional(),
  investedAmount: z
    .number()
    .min(0.01, "Invested amount must be greater than 0"),
  quantity: z
    .number()
    .min(0, "Quantity must be non-negative")
    .default(0)
    .optional(),
  purchaseDate: z.string().or(z.date()),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
});

// Update schema allows partial updates (all fields optional)
export const updateInvestmentSchema = investmentFormSchema.partial();

// Investment Transaction Schema for recording transactions
export const investmentTransactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().or(z.date()),
  transactionType: investmentTransactionTypeSchema,
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .nullable(),
});

// Update transaction schema allows partial updates
export const updateInvestmentTransactionSchema =
  investmentTransactionSchema.partial();

// Fetch Prices Schema - for fetching latest prices
export const fetchPricesSchema = z.object({
  investmentIds: z
    .array(z.string().uuid())
    .min(1, "At least one investment ID is required"),
});

// Type exports for use in components
export type InvestmentFormValues = z.infer<typeof investmentFormSchema>;
export type InvestmentTransactionFormValues = z.infer<
  typeof investmentTransactionSchema
>;
export type FetchPricesFormValues = z.infer<typeof fetchPricesSchema>;
