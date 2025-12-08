import { z } from "zod";

// Bank Account Form Schema
export const bankAccountFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  accountNumber: z
    .string()
    .max(50, "Account number must be less than 50 characters")
    .optional()
    .nullable(),
  bankName: z
    .string()
    .max(100, "Bank name must be less than 100 characters")
    .optional()
    .nullable(),
  accountType: z
    .enum(["SAVINGS", "CHECKING", "CURRENT", "OTHER"])
    .optional()
    .nullable(),
  ifscCode: z
    .string()
    .max(11, "IFSC code must be less than 11 characters")
    .optional()
    .nullable(),
  branch: z
    .string()
    .max(30, "Branch must be less than 30 characters")
    .optional()
    .nullable(),
  startingBalance: z
    .number()
    .min(0, "Starting balance must be non-negative")
    .default(0)
    .optional(),
  icon: z.string().max(2, "Icon must be a single emoji").optional().nullable(),
  color: z.string().optional().nullable(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true).optional(),
  accountOpeningDate: z.string().or(z.date()).optional().nullable(),
  isInsuranceActive: z.boolean().default(false).optional().nullable(),
  insuranceAmount: z
    .number()
    .min(0, "Insurance amount must be non-negative")
    .optional()
    .nullable(),
});

// Update schema allows partial updates
export const updateBankAccountSchema = bankAccountFormSchema.partial();

// Bank Transaction Form Schema
export const bankTransactionFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  transactionDate: z.string().or(z.date()),
  transactionType: z.enum(["CREDIT", "DEBIT"]),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
});

// Update transaction schema allows partial updates
export const updateBankTransactionSchema = bankTransactionFormSchema.partial();

// Bank Card Form Schema
export const bankCardFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  cardNumber: z
    .string()
    .max(20, "Card number must be less than 20 characters")
    .optional()
    .nullable(),
  cardType: z.enum(["DEBIT", "CREDIT", "PREPAID", "OTHER"]),
  cardIssuer: z
    .string()
    .max(50, "Card issuer must be less than 50 characters")
    .optional()
    .nullable(),
  cvv: z
    .string()
    .max(4, "CVV must be less than 4 characters")
    .optional()
    .nullable(),
  expiryDate: z.string().or(z.date()).optional().nullable(),
  limit: z
    .number()
    .min(0, "Limit must be non-negative")
    .default(0)
    .optional()
    .nullable(),
  lastBillAmount: z
    .number()
    .min(0, "Last bill amount must be non-negative")
    .default(0)
    .optional()
    .nullable(),
  paymentDueDay: z
    .number()
    .min(1, "Payment due day must be between 1 and 31")
    .max(31, "Payment due day must be between 1 and 31")
    .optional()
    .nullable(),
  paymentMethod: z.string().optional().nullable(),
  cardPin: z
    .string()
    .max(10, "Card PIN must be less than 10 characters")
    .optional()
    .nullable(),
  paymentStatus: z
    .enum(["PENDING", "COMPLETED", "FAILED"])
    .optional()
    .nullable(),
  paymentAmount: z
    .number()
    .min(0, "Payment amount must be non-negative")
    .default(0)
    .optional()
    .nullable(),
  paymentDate: z.string().or(z.date()).optional().nullable(),
  color: z.string().optional().nullable(),
  icon: z.string().max(2, "Icon must be a single emoji").optional().nullable(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true).optional(),
});

// Update card schema allows partial updates
export const updateBankCardSchema = bankCardFormSchema.partial();

// Category Form Schema
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"]),
  color: z.string().optional().nullable(),
  icon: z.string().max(2, "Icon must be a single emoji").optional().nullable(),
});

// Update category schema allows partial updates
export const updateCategorySchema = categoryFormSchema.partial();

// SubCategory Form Schema
export const subCategoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  categoryId: z.string().min(1, "Category ID is required"),
  color: z.string().optional().nullable(),
  icon: z.string().max(2, "Icon must be a single emoji").optional().nullable(),
});

// Update subcategory schema allows partial updates
export const updateSubCategorySchema = subCategoryFormSchema.partial();

// Transaction Form Schema (separate from BankTransaction)
export const transactionFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  transactionType: z.enum(["CREDIT", "DEBIT"]),
  status: z
    .enum(["PENDING", "COMPLETED", "FAILED"])
    .default("PENDING")
    .optional(),
  date: z.string().or(z.date()),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  currency: z
    .enum(["INR", "USD", "EUR", "GBP", "OTHER"])
    .default("INR")
    .optional(),
  isActive: z.boolean().default(true).optional(),
  bankAccountId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  paymentMethod: z
    .enum(["CASH", "UPI", "CARD", "ONLINE", "OTHER"])
    .optional()
    .nullable(),
});

// Update transaction schema allows partial updates
export const updateTransactionSchema = transactionFormSchema.partial();

// Type exports for use in components
export type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>;
export type BankTransactionFormValues = z.infer<
  typeof bankTransactionFormSchema
>;
export type BankCardFormValues = z.infer<typeof bankCardFormSchema>;
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type SubCategoryFormValues = z.infer<typeof subCategoryFormSchema>;
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
