"use client";

import { useState } from "react";
import { TodoWithRelations, TodoPriority } from "@/lib/todo-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

interface DailyViewProps {
  todos: TodoWithRelations[];
}

export function DailyView({ todos }: DailyViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      const todoDate = new Date(todo.dueDate);
      return (
        todoDate.getFullYear() === date.getFullYear() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getDate() === date.getDate()
      );
    });
  };

  const getPriorityColor = (priority: TodoPriority) => {
    const colors = {
      URGENT: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300",
      HIGH: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300",
      MEDIUM: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300",
      LOW: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-300",
    };
    return colors[priority];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const handleTodoClick = (todoId: string) => {
    router.push(`/todo/edit/${todoId}`);
  };

  const dayTodos = getTodosForDate(currentDate);
  const today = isToday(currentDate);

  // Group todos by priority
  const todosByPriority = {
    URGENT: dayTodos.filter((t) => t.priority === "URGENT"),
    HIGH: dayTodos.filter((t) => t.priority === "HIGH"),
    MEDIUM: dayTodos.filter((t) => t.priority === "MEDIUM"),
    LOW: dayTodos.filter((t) => t.priority === "LOW"),
  };

  const completedCount = dayTodos.filter((t) => t.completed).length;
  const totalCount = dayTodos.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {formatDate()}
              {today && (
                <Badge variant="default" className="text-xs">
                  Today
                </Badge>
              )}
            </CardTitle>
            {totalCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {completedCount} of {totalCount} completed
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No todos scheduled for this day
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push("/todo/add")}
            >
              Add a Todo
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Urgent Priority */}
            {todosByPriority.URGENT.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Urgent ({todosByPriority.URGENT.length})
                </h3>
                <div className="space-y-2">
                  {todosByPriority.URGENT.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(
                        todo.priority
                      )} ${todo.completed ? "opacity-60" : ""}`}
                      onClick={() => handleTodoClick(todo.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium ${
                              todo.completed ? "line-through" : ""
                            }`}
                          >
                            {todo.title}
                          </h4>
                          {todo.description && (
                            <p className="text-sm mt-1 text-muted-foreground">
                              {todo.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
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
                            {todo.tags?.map((tag) => (
                              <Badge key={tag.id} variant="secondary">
                                {tag.name}
                              </Badge>
                            ))}
                            {todo.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(todo.dueDate).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High Priority */}
            {todosByPriority.HIGH.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  High ({todosByPriority.HIGH.length})
                </h3>
                <div className="space-y-2">
                  {todosByPriority.HIGH.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(
                        todo.priority
                      )} ${todo.completed ? "opacity-60" : ""}`}
                      onClick={() => handleTodoClick(todo.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium ${
                              todo.completed ? "line-through" : ""
                            }`}
                          >
                            {todo.title}
                          </h4>
                          {todo.description && (
                            <p className="text-sm mt-1 text-muted-foreground">
                              {todo.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
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
                            {todo.tags?.map((tag) => (
                              <Badge key={tag.id} variant="secondary">
                                {tag.name}
                              </Badge>
                            ))}
                            {todo.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(todo.dueDate).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority */}
            {todosByPriority.MEDIUM.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  Medium ({todosByPriority.MEDIUM.length})
                </h3>
                <div className="space-y-2">
                  {todosByPriority.MEDIUM.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(
                        todo.priority
                      )} ${todo.completed ? "opacity-60" : ""}`}
                      onClick={() => handleTodoClick(todo.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium ${
                              todo.completed ? "line-through" : ""
                            }`}
                          >
                            {todo.title}
                          </h4>
                          {todo.description && (
                            <p className="text-sm mt-1 text-muted-foreground">
                              {todo.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
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
                            {todo.tags?.map((tag) => (
                              <Badge key={tag.id} variant="secondary">
                                {tag.name}
                              </Badge>
                            ))}
                            {todo.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(todo.dueDate).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority */}
            {todosByPriority.LOW.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  Low ({todosByPriority.LOW.length})
                </h3>
                <div className="space-y-2">
                  {todosByPriority.LOW.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(
                        todo.priority
                      )} ${todo.completed ? "opacity-60" : ""}`}
                      onClick={() => handleTodoClick(todo.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium ${
                              todo.completed ? "line-through" : ""
                            }`}
                          >
                            {todo.title}
                          </h4>
                          {todo.description && (
                            <p className="text-sm mt-1 text-muted-foreground">
                              {todo.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
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
                            {todo.tags?.map((tag) => (
                              <Badge key={tag.id} variant="secondary">
                                {tag.name}
                              </Badge>
                            ))}
                            {todo.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(todo.dueDate).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

