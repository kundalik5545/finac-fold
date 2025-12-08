"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Edit, Trash, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TodoWithRelations,
  TodoCategory,
  TodoTag,
  TodoPriority,
} from "@/lib/types/todo-types";
import { toggleTodoComplete, deleteTodo } from "@/action/todo";

interface TodoTableViewProps {
  todos: TodoWithRelations[];
  categories: TodoCategory[];
  tags: TodoTag[];
}

type LoadingStates = {
  [key: string]: boolean;
};

export function TodoTableView({ todos, categories, tags }: TodoTableViewProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if overdue
    if (d < today && d.toDateString() !== today.toDateString()) {
      return (
        <span className="text-destructive font-semibold">
          {d.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    }

    // Check if today
    if (d.toDateString() === today.toDateString()) {
      return <span className="text-orange-600 font-semibold">Today</span>;
    }

    // Check if tomorrow
    if (d.toDateString() === tomorrow.toDateString()) {
      return <span className="text-blue-600">Tomorrow</span>;
    }

    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority: TodoPriority) => {
    const colors = {
      URGENT: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      HIGH: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      MEDIUM:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      LOW: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
    };
    return colors[priority];
  };

  const handleToggleComplete = async (
    e: React.MouseEvent,
    todoId: string,
    userId: string
  ) => {
    e.stopPropagation();
    setLoadingStates((prev) => ({ ...prev, [`toggle-${todoId}`]: true }));

    try {
      await toggleTodoComplete(todoId, userId);
      toast.success("Todo updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update todo");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`toggle-${todoId}`]: false }));
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    todoId: string,
    todoTitle: string,
    userId: string
  ) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${todoTitle}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${todoId}`]: true }));

    try {
      await deleteTodo(todoId, userId);
      toast.success("Todo deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete todo");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${todoId}`]: false }));
    }
  };

  const handleEdit = (e: React.MouseEvent, todoId: string) => {
    e.stopPropagation();
    router.push(`/todo/edit/${todoId}`);
  };

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
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
      <Table className={isMobile ? "w-full" : "min-w-[800px]"}>
        <TableCaption>
          Showing {todos.length} todo{todos.length !== 1 ? "s" : ""}
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-sm">Title</TableHead>
            {!isMobile && <TableHead className="text-sm">Description</TableHead>}
            <TableHead className="text-sm">Due Date</TableHead>
            <TableHead className="text-sm">Priority</TableHead>
            {!isMobile && <TableHead className="text-sm">Category</TableHead>}
            {!isMobile && <TableHead className="text-sm">Tags</TableHead>}
            <TableHead className="text-right text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {todos.map((todo) => {
            return (
              <TableRow
                key={todo.id}
                className={`hover:bg-muted/50 cursor-pointer ${todo.completed ? "opacity-60" : ""
                  }`}
                onClick={() => router.push(`/todo/edit/${todo.id}`)}
              >
                <TableCell>
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={(e) =>
                      handleToggleComplete(
                        e as any,
                        todo.id,
                        todo.userId
                      )
                    }
                    onClick={(e) => e.stopPropagation()}
                    disabled={!!loadingStates[`toggle-${todo.id}`]}
                  />
                </TableCell>
                <TableCell
                  className={`text-sm font-medium ${todo.completed ? "line-through" : ""
                    }`}
                >
                  {todo.title}
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {todo.description || "-"}
                  </TableCell>
                )}
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    {todo.dueDate && <CalendarIcon size={14} className="opacity-50" />}
                    {formatDate(todo.dueDate)}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <Badge className={getPriorityColor(todo.priority)}>
                    {todo.priority}
                  </Badge>
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-sm">
                    {todo.category ? (
                      <Badge
                        style={
                          todo.category.color
                            ? { backgroundColor: todo.category.color }
                            : {}
                        }
                      >
                        {todo.category.name}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-sm">
                    <div className="flex gap-1 flex-wrap">
                      {todo.tags && todo.tags.length > 0
                        ? todo.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline">
                            {tag.name}
                          </Badge>
                        ))
                        : "-"}
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(e, todo.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) =>
                        handleDelete(e, todo.id, todo.title, todo.userId)
                      }
                      disabled={!!loadingStates[`delete-${todo.id}`]}
                    >
                      <Trash size={16} className="text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

