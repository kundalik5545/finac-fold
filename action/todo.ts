"use server";

import prisma from "@/lib/prisma";
import {
  Todo,
  TodoWithRelations,
  TodoCategory,
  TodoTag,
  RecurringTodo,
  TodoFilters,
  TodoPriority,
  RecurringFrequency,
} from "@/lib/todo-types";
import { Prisma } from "@/app/generated/prisma/client";

// ============================================
// TODO FUNCTIONS
// ============================================

/**
 * Fetch all todos for a user with optional filtering and sorting
 */
export async function getTodos(
  userId: string,
  filters?: TodoFilters
): Promise<TodoWithRelations[]> {
  try {
    // Build where clause based on filters
    const where: Prisma.TodoWhereInput = {
      userId,
    };

    // Apply filters
    if (filters?.completed !== undefined) {
      where.completed = filters.completed;
    }

    if (filters?.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      where.categoryId = { in: filters.categoryIds };
    }

    if (filters?.tagIds && filters.tagIds.length > 0) {
      where.tags = {
        some: {
          id: { in: filters.tagIds },
        },
      };
    }

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) {
        where.dueDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.dueDate.lte = new Date(filters.endDate);
      }
    }

    // Build orderBy clause
    const orderBy: Prisma.TodoOrderByWithRelationInput = {};
    const sortBy = filters?.sortBy || "dueDate";
    const sortOrder = filters?.sortOrder || "asc";

    if (sortBy === "priority") {
      // Custom priority ordering: URGENT > HIGH > MEDIUM > LOW
      orderBy.priority = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const todos = await prisma.todo.findMany({
      where,
      include: {
        category: true,
        tags: true,
        recurring: true,
      },
      orderBy,
    });

    return todos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw new Error("Failed to fetch todos");
  }
}

/**
 * Fetch todos for a specific date range (for calendar views)
 */
export async function getTodosByDateRange(
  userId: string,
  startDate: Date | string,
  endDate: Date | string
): Promise<TodoWithRelations[]> {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        category: true,
        tags: true,
        recurring: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return todos;
  } catch (error) {
    console.error("Error fetching todos by date range:", error);
    throw new Error("Failed to fetch todos by date range");
  }
}

/**
 * Fetch a single todo by ID
 */
export async function getTodoById(
  id: string,
  userId: string
): Promise<TodoWithRelations> {
  try {
    const todo = await prisma.todo.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
        tags: true,
        recurring: true,
      },
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    return todo;
  } catch (error) {
    console.error("Error fetching todo:", error);
    throw new Error("Failed to fetch todo");
  }
}

/**
 * Create a new todo
 */
export async function createTodo(
  data: {
    title: string;
    description?: string | null;
    dueDate?: Date | string | null;
    priority?: TodoPriority;
    categoryId?: string | null;
    tagIds?: string[];
    recurringId?: string | null;
  },
  userId: string
): Promise<Todo> {
  try {
    const { tagIds, categoryId, recurringId, ...todoData } = data;

    const todo = await prisma.todo.create({
      data: {
        ...todoData,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        user: {
          connect: { id: userId },
        },
        ...(categoryId && {
          category: {
            connect: { id: categoryId },
          },
        }),
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              connect: tagIds.map((id) => ({ id })),
            },
          }),
        ...(recurringId && {
          recurring: {
            connect: { id: recurringId },
          },
        }),
      },
    });

    return todo;
  } catch (error) {
    console.error("Error creating todo:", error);
    throw new Error("Failed to create todo");
  }
}

/**
 * Update an existing todo
 */
export async function updateTodo(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    dueDate?: Date | string | null;
    priority?: TodoPriority;
    completed?: boolean;
    categoryId?: string | null;
    tagIds?: string[];
    recurringId?: string | null;
  },
  userId: string
): Promise<Todo> {
  try {
    const { tagIds, categoryId, recurringId, ...todoData } = data;

    // First verify the todo belongs to the user
    const existingTodo = await prisma.todo.findFirst({
      where: { id, userId },
      include: { tags: true },
    });

    if (!existingTodo) {
      throw new Error("Todo not found");
    }

    // Handle completion
    const updateData: any = {
      ...todoData,
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
    };

    // Set completedAt when marking as completed
    if (data.completed !== undefined) {
      updateData.completedAt = data.completed ? new Date() : null;
    }

    // Handle category update
    if (categoryId !== undefined) {
      if (categoryId === null) {
        updateData.category = { disconnect: true };
      } else {
        updateData.category = { connect: { id: categoryId } };
      }
      // Remove categoryId from spread data if it exists
      delete updateData.categoryId;
    }

    // Handle tags update
    if (tagIds !== undefined) {
      // Disconnect all existing tags and connect new ones
      updateData.tags = {
        set: [],
        connect: tagIds.map((id) => ({ id })),
      };
    }

    // Handle recurring update
    if (recurringId !== undefined) {
      if (recurringId === null) {
        updateData.recurring = { disconnect: true };
      } else {
        updateData.recurring = { connect: { id: recurringId } };
      }
      // Remove recurringId from spread data if it exists
      delete updateData.recurringId;
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
    });

    return todo;
  } catch (error) {
    console.error("Error updating todo:", error);
    throw new Error("Failed to update todo");
  }
}

/**
 * Delete a todo
 */
export async function deleteTodo(id: string, userId: string): Promise<void> {
  try {
    // Verify the todo belongs to the user before deleting
    const todo = await prisma.todo.findFirst({
      where: { id, userId },
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    await prisma.todo.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw new Error("Failed to delete todo");
  }
}

/**
 * Toggle todo completion status
 */
export async function toggleTodoComplete(
  id: string,
  userId: string
): Promise<Todo> {
  try {
    const todo = await prisma.todo.findFirst({
      where: { id, userId },
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date() : null,
      },
    });

    return updated;
  } catch (error) {
    console.error("Error toggling todo completion:", error);
    throw new Error("Failed to toggle todo completion");
  }
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

/**
 * Fetch all categories for a user
 */
export async function getCategories(userId: string): Promise<TodoCategory[]> {
  try {
    const categories = await prisma.todoCategory.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  data: { name: string; color?: string | null },
  userId: string
): Promise<TodoCategory> {
  try {
    const category = await prisma.todoCategory.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });

    return category;
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A category with this name already exists");
      }
    }
    throw new Error("Failed to create category");
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  data: { name?: string; color?: string | null },
  userId: string
): Promise<TodoCategory> {
  try {
    // Verify ownership
    const existing = await prisma.todoCategory.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Category not found");
    }

    const category = await prisma.todoCategory.update({
      where: { id },
      data,
    });

    return category;
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A category with this name already exists");
      }
    }
    throw new Error("Failed to update category");
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(
  id: string,
  userId: string
): Promise<void> {
  try {
    const category = await prisma.todoCategory.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    await prisma.todoCategory.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}

// ============================================
// TAG FUNCTIONS
// ============================================

/**
 * Fetch all tags for a user
 */
export async function getTags(userId: string): Promise<TodoTag[]> {
  try {
    const tags = await prisma.todoTag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw new Error("Failed to fetch tags");
  }
}

/**
 * Create a new tag
 */
export async function createTag(
  data: { name: string },
  userId: string
): Promise<TodoTag> {
  try {
    const tag = await prisma.todoTag.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });

    return tag;
  } catch (error) {
    console.error("Error creating tag:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("A tag with this name already exists");
      }
    }
    throw new Error("Failed to create tag");
  }
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string, userId: string): Promise<void> {
  try {
    const tag = await prisma.todoTag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    await prisma.todoTag.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw new Error("Failed to delete tag");
  }
}

// ============================================
// RECURRING TODO FUNCTIONS
// ============================================

/**
 * Create a recurring todo pattern
 */
export async function createRecurringTodo(
  data: {
    frequency: RecurringFrequency;
    interval?: number;
    startDate: Date | string;
    endDate?: Date | string | null;
    title: string;
    description?: string | null;
    priority?: TodoPriority;
    categoryId?: string | null;
    tagIds?: string[];
  },
  userId: string
): Promise<RecurringTodo> {
  try {
    const {
      title,
      description,
      priority,
      categoryId,
      tagIds,
      ...recurringData
    } = data;

    // Create the recurring pattern
    const recurring = await prisma.recurringTodo.create({
      data: {
        ...recurringData,
        startDate: new Date(recurringData.startDate),
        endDate: recurringData.endDate ? new Date(recurringData.endDate) : null,
      },
    });

    // Create the first todo instance
    await createTodo(
      {
        title,
        description,
        priority,
        categoryId,
        tagIds,
        dueDate: recurring.startDate,
        recurringId: recurring.id,
      },
      userId
    );

    return recurring;
  } catch (error) {
    console.error("Error creating recurring todo:", error);
    throw new Error("Failed to create recurring todo");
  }
}

/**
 * Generate next instances of recurring todos
 * This should be called periodically (e.g., daily via cron)
 */
export async function generateRecurringTodoInstances(
  userId: string
): Promise<void> {
  try {
    // Get all active recurring patterns for this user
    const recurringTodos = await prisma.recurringTodo.findMany({
      where: {
        todos: {
          some: {
            userId,
          },
        },
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      include: {
        todos: {
          where: { userId },
          orderBy: { dueDate: "desc" },
          take: 1,
        },
      },
    });

    for (const recurring of recurringTodos) {
      if (recurring.todos.length === 0) continue;

      const lastTodo = recurring.todos[0];
      if (!lastTodo.dueDate) continue;

      const lastDueDate = new Date(lastTodo.dueDate);
      const now = new Date();

      // Calculate next due date based on frequency
      let nextDueDate = new Date(lastDueDate);
      switch (recurring.frequency) {
        case "DAILY":
          nextDueDate.setDate(lastDueDate.getDate() + recurring.interval);
          break;
        case "WEEKLY":
          nextDueDate.setDate(lastDueDate.getDate() + 7 * recurring.interval);
          break;
        case "MONTHLY":
          nextDueDate.setMonth(lastDueDate.getMonth() + recurring.interval);
          break;
        case "YEARLY":
          nextDueDate.setFullYear(
            lastDueDate.getFullYear() + recurring.interval
          );
          break;
      }

      // Only create if the next due date is today or in the past and hasn't been created yet
      if (nextDueDate <= now) {
        // Check if end date has passed
        if (recurring.endDate && nextDueDate > recurring.endDate) {
          continue;
        }

        // Create the next instance
        await prisma.todo.create({
          data: {
            title: lastTodo.title,
            description: lastTodo.description,
            priority: lastTodo.priority,
            dueDate: nextDueDate,
            userId,
            categoryId: lastTodo.categoryId,
            recurringId: recurring.id,
            tags: {
              connect: await prisma.todoTag
                .findMany({
                  where: {
                    todos: {
                      some: { id: lastTodo.id },
                    },
                  },
                  select: { id: true },
                })
                .then((tags) => tags.map((tag) => ({ id: tag.id }))),
            },
          },
        });
      }
    }
  } catch (error) {
    console.error("Error generating recurring todo instances:", error);
    throw new Error("Failed to generate recurring todo instances");
  }
}

/**
 * Delete a recurring todo pattern and optionally all its instances
 */
export async function deleteRecurringTodo(
  id: string,
  userId: string,
  deleteAllInstances: boolean = false
): Promise<void> {
  try {
    // Verify at least one todo with this recurring pattern belongs to the user
    const todo = await prisma.todo.findFirst({
      where: {
        recurringId: id,
        userId,
      },
    });

    if (!todo) {
      throw new Error("Recurring todo not found");
    }

    if (deleteAllInstances) {
      // Delete all todo instances
      await prisma.todo.deleteMany({
        where: {
          recurringId: id,
          userId,
        },
      });
    } else {
      // Just disconnect the todos from the recurring pattern
      await prisma.todo.updateMany({
        where: {
          recurringId: id,
          userId,
        },
        data: {
          recurringId: null,
        },
      });
    }

    // Delete the recurring pattern
    await prisma.recurringTodo.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting recurring todo:", error);
    throw new Error("Failed to delete recurring todo");
  }
}
