import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TodoClient } from "./_components/TodoClient";
import { getTodos, getCategories, getTags } from "@/action/todo";
import { TodoWithRelations, TodoCategory, TodoTag } from "@/lib/todo-types";

const TodoPage = async () => {
  let todos: TodoWithRelations[] = [];
  let categories: TodoCategory[] = [];
  let tags: TodoTag[] = [];

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      todos = await getTodos(session.user.id);
      categories = await getCategories(session.user.id);
      tags = await getTags(session.user.id);
    }
  } catch (error) {
    console.error("Error fetching todos:", error);
  }

  // Calculate statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const overdueTodos = todos.filter(
    (todo) =>
      !todo.completed &&
      todo.dueDate &&
      new Date(todo.dueDate) < new Date()
  ).length;

  return (
    <div className="todo-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 pt-5">
      {/* Heading Section */}
      <section className="pb-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
              Todo List
            </h1>
            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
              <span>Total: {totalTodos}</span>
              <span>Active: {activeTodos}</span>
              <span>Completed: {completedTodos}</span>
              {overdueTodos > 0 && (
                <span className="text-destructive font-semibold">
                  Overdue: {overdueTodos}
                </span>
              )}
            </div>
          </div>
          <Button>
            <Link href="/todo/add" className="flex items-center justify-around">
              <Plus size={16} /> Add Todo
            </Link>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href="/todo/recurring">Create Recurring Todo</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/todo/manage">Manage Categories & Tags</Link>
          </Button>
        </div>
      </section>

      {/* Todo List Section */}
      <section className="py-5">
        <TodoClient todos={todos} categories={categories} tags={tags} />
      </section>
    </div>
  );
};

export default TodoPage;

