"use client";

import { TodoWithRelations } from "@/lib/todo-types";
import { TodoCard } from "./TodoCard";

interface TodoCardViewProps {
  todos: TodoWithRelations[];
}

export function TodoCardView({ todos }: TodoCardViewProps) {
  if (!todos || todos.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">
          No todos found. Add your first todo to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {todos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

