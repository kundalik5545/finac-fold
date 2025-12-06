import { z } from "zod";

// Todo Form Schema for creating and editing todos
export const todoFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  dueDate: z.string().or(z.date()).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  completed: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  recurringId: z.string().optional().nullable(),
});

// Update schema allows partial updates (all fields optional)
export const updateTodoSchema = todoFormSchema.partial();

// Category Form Schema
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
  color: z.string().optional().nullable(),
});

// Tag Form Schema
export const tagFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(30, "Tag name must be less than 30 characters"),
});

// Recurring Todo Form Schema
export const recurringTodoFormSchema = z.object({
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  interval: z.number().min(1, "Interval must be at least 1").default(1),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

// Filter Schema
export const todoFilterSchema = z.object({
  completed: z.boolean().optional(),
  priority: z.array(z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])).optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  sortBy: z
    .enum(["dueDate", "priority", "createdAt", "title"])
    .default("dueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Type exports for use in components
export type TodoFormValues = z.infer<typeof todoFormSchema>;
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type TagFormValues = z.infer<typeof tagFormSchema>;
export type RecurringTodoFormValues = z.infer<typeof recurringTodoFormSchema>;
export type TodoFilterValues = z.infer<typeof todoFilterSchema>;

