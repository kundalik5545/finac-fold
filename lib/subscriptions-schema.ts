import { z } from "zod";

export const subscriptionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.string().min(1, "Start date is required"),
  nextDueDate: z.string().min(1, "Next due date is required"),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type SubscriptionFormInput = z.infer<typeof subscriptionFormSchema>;

