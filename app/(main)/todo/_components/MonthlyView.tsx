"use client";

import { useState } from "react";
import { TodoWithRelations, TodoPriority } from "@/lib/todo-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface MonthlyViewProps {
  todos: TodoWithRelations[];
}

export function MonthlyView({ todos }: MonthlyViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Get previous month's last days to fill the grid
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthLastDay - startingDayOfWeek + i + 1
  );

  // Get next month's first days to fill the grid
  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
  const nextMonthDays = Array.from(
    { length: totalCells - daysInMonth - startingDayOfWeek },
    (_, i) => i + 1
  );

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTodosForDate = (day: number, monthOffset: number = 0) => {
    const date = new Date(year, month + monthOffset, day);
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

  const isToday = (day: number, monthOffset: number = 0) => {
    const today = new Date();
    const date = new Date(year, month + monthOffset, day);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const handleTodoClick = (todoId: string) => {
    router.push(`/todo/edit/${todoId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {monthNames[month]} {year}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Day names header */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm py-2 text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Previous month days */}
          {prevMonthDays.map((day, idx) => {
            const dayTodos = getTodosForDate(day, -1);
            return (
              <div
                key={`prev-${idx}`}
                className="min-h-[100px] p-2 border rounded-lg bg-muted/20 text-muted-foreground"
              >
                <div className="text-xs mb-1">{day}</div>
                <div className="space-y-1">
                  {dayTodos.slice(0, 2).map((todo) => (
                    <div
                      key={todo.id}
                      className="text-xs p-1 rounded bg-background/50 cursor-pointer hover:bg-background truncate opacity-50"
                      onClick={() => handleTodoClick(todo.id)}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            todo.priority
                          )}`}
                        />
                        <span className="truncate">{todo.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayTodos.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTodos.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current month days */}
          {currentMonthDays.map((day) => {
            const dayTodos = getTodosForDate(day);
            const today = isToday(day);
            return (
              <div
                key={`current-${day}`}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  today
                    ? "bg-primary/10 border-primary"
                    : "bg-background hover:bg-muted/20"
                }`}
              >
                <div
                  className={`text-xs mb-1 font-semibold ${
                    today ? "text-primary" : ""
                  }`}
                >
                  {day}
                  {today && (
                    <Badge className="ml-1 text-[10px] h-4 px-1" variant="default">
                      Today
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {dayTodos.slice(0, 3).map((todo) => (
                    <div
                      key={todo.id}
                      className={`text-xs p-1 rounded bg-muted cursor-pointer hover:bg-muted/80 truncate ${
                        todo.completed ? "opacity-60 line-through" : ""
                      }`}
                      onClick={() => handleTodoClick(todo.id)}
                      title={todo.title}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(
                            todo.priority
                          )}`}
                        />
                        <span className="truncate">{todo.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayTodos.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTodos.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Next month days */}
          {nextMonthDays.map((day, idx) => {
            const dayTodos = getTodosForDate(day, 1);
            return (
              <div
                key={`next-${idx}`}
                className="min-h-[100px] p-2 border rounded-lg bg-muted/20 text-muted-foreground"
              >
                <div className="text-xs mb-1">{day}</div>
                <div className="space-y-1">
                  {dayTodos.slice(0, 2).map((todo) => (
                    <div
                      key={todo.id}
                      className="text-xs p-1 rounded bg-background/50 cursor-pointer hover:bg-background truncate opacity-50"
                      onClick={() => handleTodoClick(todo.id)}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            todo.priority
                          )}`}
                        />
                        <span className="truncate">{todo.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayTodos.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTodos.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

