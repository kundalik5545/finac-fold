"use client";

import { useState } from "react";
import { TodoWithRelations, TodoPriority } from "@/lib/todo-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

interface WeeklyViewProps {
  todos: TodoWithRelations[];
}

export function WeeklyView({ todos }: WeeklyViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the start of the week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToThisWeek = () => {
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
      URGENT: "bg-red-500",
      HIGH: "bg-orange-500",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-gray-400",
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

  const formatDateRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = start.toLocaleString("default", { month: "short" });
    const endMonth = end.toLocaleString("default", { month: "short" });
    const year = start.getFullYear();

    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
  };

  const handleTodoClick = (todoId: string) => {
    router.push(`/todo/edit/${todoId}`);
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{formatDateRange()}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={goToThisWeek}>
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {weekDays.map((date, idx) => {
            const dayTodos = getTodosForDate(date);
            const today = isToday(date);
            const dayName = dayNames[idx];
            const dayNumber = date.getDate();
            const monthName = date.toLocaleString("default", { month: "short" });

            return (
              <div
                key={idx}
                className={`min-h-[200px] p-3 border rounded-lg ${
                  today
                    ? "bg-primary/10 border-primary"
                    : "bg-background hover:bg-muted/20"
                }`}
              >
                <div className="mb-2">
                  <div
                    className={`font-semibold text-sm ${
                      today ? "text-primary" : ""
                    }`}
                  >
                    {dayName}
                  </div>
                  <div
                    className={`text-xs text-muted-foreground ${
                      today ? "text-primary/70" : ""
                    }`}
                  >
                    {monthName} {dayNumber}
                    {today && (
                      <Badge className="ml-1 text-[10px] h-4 px-1" variant="default">
                        Today
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {dayTodos.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No todos</p>
                  ) : (
                    dayTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`text-xs p-2 rounded bg-muted cursor-pointer hover:bg-muted/80 ${
                          todo.completed ? "opacity-60" : ""
                        }`}
                        onClick={() => handleTodoClick(todo.id)}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getPriorityColor(
                              todo.priority
                            )}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-medium ${
                                todo.completed ? "line-through" : ""
                              }`}
                            >
                              {todo.title}
                            </div>
                            {todo.description && (
                              <div className="text-muted-foreground mt-1 truncate">
                                {todo.description}
                              </div>
                            )}
                            {todo.category && (
                              <Badge
                                className="mt-1 text-[10px] h-4 px-1"
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
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {dayTodos.length > 0 && (
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    {dayTodos.filter((t) => t.completed).length} /{" "}
                    {dayTodos.length} completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

