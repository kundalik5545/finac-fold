import {
  TodoPriority,
  RecurringFrequency,
} from "@/app/generated/prisma/client";

// Todo Type
export type Todo = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TodoPriority;
  completed: boolean;
  completedAt: Date | null;
  categoryId: string | null;
  category?: TodoCategory | null;
  tags?: TodoTag[];
  recurringId: string | null;
  recurring?: RecurringTodo | null;
  userId: string;
};

// TodoCategory Type
export type TodoCategory = {
  id: string;
  name: string;
  color: string | null;
  userId: string;
};

// TodoTag Type
export type TodoTag = {
  id: string;
  name: string;
  userId: string;
};

// RecurringTodo Type
export type RecurringTodo = {
  id: string;
  frequency: RecurringFrequency;
  interval: number;
  startDate: Date;
  endDate: Date | null;
};

// Todo with all relations included
export type TodoWithRelations = Todo & {
  category: TodoCategory | null;
  tags: TodoTag[];
  recurring: RecurringTodo | null;
};

// Form input type for creating/editing todos
export type TodoFormInput = {
  title: string;
  description?: string | null;
  dueDate?: Date | string | null;
  priority?: TodoPriority;
  completed?: boolean;
  categoryId?: string | null;
  tagIds?: string[];
  recurringId?: string | null;
};

// Form input type for creating/editing categories
export type CategoryFormInput = {
  name: string;
  color?: string | null;
};

// Form input type for creating/editing tags
export type TagFormInput = {
  name: string;
};

// Form input type for creating recurring todos
export type RecurringTodoFormInput = {
  frequency: RecurringFrequency;
  interval?: number;
  startDate: Date | string;
  endDate?: Date | string | null;
  title: string;
  description?: string | null;
  priority?: TodoPriority;
  categoryId?: string | null;
  tagIds?: string[];
};

// Filter options for fetching todos
export type TodoFilters = {
  completed?: boolean;
  priority?: TodoPriority[];
  categoryIds?: string[];
  tagIds?: string[];
  startDate?: Date | string;
  endDate?: Date | string;
  sortBy?: "dueDate" | "priority" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
};

// Calendar view modes
export type CalendarViewMode = "daily" | "weekly" | "monthly";

// View mode for todo display
export type TodoViewMode = "table" | "calendar";

// Export enums for convenience
export { TodoPriority, RecurringFrequency };

