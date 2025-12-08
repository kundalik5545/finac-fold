"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash, Calendar as CalendarIcon, Tag } from "lucide-react";
import { TodoWithRelations, TodoPriority } from "@/lib/types/todo-types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { toggleTodoComplete, deleteTodo } from "@/action/todo";

interface TodoCardProps {
  todo: TodoWithRelations;
}

export function TodoCard({ todo }: TodoCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if overdue
    if (d < today && d.toDateString() !== today.toDateString()) {
      return (
        <span className="text-destructive font-semibold">
          {d.toLocaleDateString("en-IN", {
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
      month: "short",
      day: "numeric",
    });
  };

  const handleToggleComplete = async () => {
    setIsLoading(true);

    try {
      await toggleTodoComplete(todo.id, todo.userId);
      toast.success("Todo updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update todo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteTodo(todo.id, todo.userId);
      toast.success("Todo deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete todo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/todo/edit/${todo.id}`);
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${todo.completed ? "opacity-60" : ""
        }`}
      onClick={() => router.push(`/todo/edit/${todo.id}`)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with checkbox and priority */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={handleToggleComplete}
                onClick={(e) => e.stopPropagation()}
                disabled={isLoading}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold ${todo.completed ? "line-through" : ""
                    }`}
                >
                  {todo.title}
                </h3>
              </div>
            </div>
            <Badge className={getPriorityColor(todo.priority)}>
              {todo.priority}
            </Badge>
          </div>

          {/* Description */}
          {todo.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {todo.description}
            </p>
          )}

          {/* Due Date */}
          {todo.dueDate && (
            <div className="flex items-center gap-1 text-sm">
              <CalendarIcon size={14} className="text-muted-foreground" />
              {formatDate(todo.dueDate)}
            </div>
          )}

          {/* Category */}
          {todo.category && (
            <Badge
              variant="outline"
              style={
                todo.category.color
                  ? { borderColor: todo.category.color }
                  : {}
              }
            >
              {todo.category.name}
            </Badge>
          )}

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag size={14} className="text-muted-foreground" />
              {todo.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isLoading}
              className="flex-1"
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

