"use client";

import { Button } from "@/components/ui/button";
import { TodoWithRelations, CalendarViewMode } from "@/lib/todo-types";
import { DailyView } from "./DailyView";
import { WeeklyView } from "./WeeklyView";
import { MonthlyView } from "./MonthlyView";

interface TodoCalendarViewProps {
  todos: TodoWithRelations[];
  calendarMode: CalendarViewMode;
  setCalendarMode: (mode: CalendarViewMode) => void;
}

export function TodoCalendarView({
  todos,
  calendarMode,
  setCalendarMode,
}: TodoCalendarViewProps) {
  return (
    <div className="space-y-4">
      {/* Calendar Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={calendarMode === "daily" ? "default" : "outline"}
          size="sm"
          onClick={() => setCalendarMode("daily")}
        >
          Daily
        </Button>
        <Button
          variant={calendarMode === "weekly" ? "default" : "outline"}
          size="sm"
          onClick={() => setCalendarMode("weekly")}
        >
          Weekly
        </Button>
        <Button
          variant={calendarMode === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() => setCalendarMode("monthly")}
        >
          Monthly
        </Button>
      </div>

      {/* Calendar View based on mode */}
      {calendarMode === "daily" && <DailyView todos={todos} />}
      {calendarMode === "weekly" && <WeeklyView todos={todos} />}
      {calendarMode === "monthly" && <MonthlyView todos={todos} />}
    </div>
  );
}

