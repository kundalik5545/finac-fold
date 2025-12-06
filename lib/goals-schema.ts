import { z } from "zod";

// Goal Form Schema for creating and editing goals
export const goalFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  targetAmount: z.number().min(0.01, "Target amount must be greater than 0"),
  currentAmount: z.number().min(0, "Current amount must be non-negative").default(0),
  targetDate: z.string().or(z.date()),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

// Update schema allows partial updates (all fields optional)
export const updateGoalSchema = goalFormSchema.partial();

// Goal Transaction Schema for recording progress updates
export const goalTransactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().or(z.date()),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .nullable(),
});

// Update transaction schema allows partial updates
export const updateGoalTransactionSchema = goalTransactionSchema.partial();

// Type exports for use in components
export type GoalFormValues = z.infer<typeof goalFormSchema>;
export type GoalTransactionFormValues = z.infer<typeof goalTransactionSchema>;

