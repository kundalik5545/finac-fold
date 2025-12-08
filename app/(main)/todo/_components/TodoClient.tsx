"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table2, Calendar, Filter, LayoutGrid } from "lucide-react";
import { TodoTableView } from "./TodoTableView";
import { TodoCardView } from "./TodoCardView";
import { TodoCalendarView } from "./TodoCalendarView";
import { TodoFilters } from "./TodoFilters";
import {
  TodoWithRelations,
  TodoCategory,
  TodoTag,
  CalendarViewMode,
  TodoFilters as TodoFiltersType,
} from "@/lib/types/todo-types";

type ViewMode = "table" | "card" | "calendar";

interface TodoClientProps {
  todos: TodoWithRelations[];
  categories: TodoCategory[];
  tags: TodoTag[];
}

export function TodoClient({ todos, categories, tags }: TodoClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [calendarMode, setCalendarMode] = useState<CalendarViewMode>("monthly");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TodoFiltersType>({
    sortBy: "dueDate",
    sortOrder: "asc",
  });
  const [filteredTodos, setFilteredTodos] = useState(todos);

  // Apply filters to todos
  const applyFilters = (newFilters: TodoFiltersType) => {
    setFilters(newFilters);
    let filtered = [...todos];

    // Filter by completion status
    if (newFilters.completed !== undefined) {
      filtered = filtered.filter((todo) => todo.completed === newFilters.completed);
    }

    // Filter by priority
    if (newFilters.priority && newFilters.priority.length > 0) {
      filtered = filtered.filter((todo) =>
        newFilters.priority?.includes(todo.priority)
      );
    }

    // Filter by categories
    if (newFilters.categoryIds && newFilters.categoryIds.length > 0) {
      filtered = filtered.filter(
        (todo) => todo.categoryId && newFilters.categoryIds?.includes(todo.categoryId)
      );
    }

    // Filter by tags
    if (newFilters.tagIds && newFilters.tagIds.length > 0) {
      filtered = filtered.filter((todo) =>
        todo.tags?.some((tag) => newFilters.tagIds?.includes(tag.id))
      );
    }

    // Filter by date range
    if (newFilters.startDate || newFilters.endDate) {
      filtered = filtered.filter((todo) => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        if (newFilters.startDate && dueDate < new Date(newFilters.startDate)) {
          return false;
        }
        if (newFilters.endDate && dueDate > new Date(newFilters.endDate)) {
          return false;
        }
        return true;
      });
    }

    // Sort
    const sortBy = newFilters.sortBy || "dueDate";
    const sortOrder = newFilters.sortOrder || "asc";
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof TodoWithRelations];
      let bVal: any = b[sortBy as keyof TodoWithRelations];

      if (sortBy === "priority") {
        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        aVal = priorityOrder[a.priority];
        bVal = priorityOrder[b.priority];
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredTodos(filtered);
  };

  const clearFilters = () => {
    const defaultFilters: TodoFiltersType = {
      sortBy: "dueDate",
      sortOrder: "asc",
    };
    setFilters(defaultFilters);
    setFilteredTodos(todos);
  };

  return (
    <div className="space-y-4">
      {/* View Toggle and Filter Button */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table2 size={16} className="mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid size={16} className="mr-2" />
            Card
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar size={16} className="mr-2" />
            Calendar
          </Button>
        </div>

        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <TodoFilters
          filters={filters}
          categories={categories}
          tags={tags}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />
      )}

      {/* Content based on view mode */}
      {viewMode === "table" && (
        <TodoTableView todos={filteredTodos} categories={categories} tags={tags} />
      )}
      {viewMode === "card" && <TodoCardView todos={filteredTodos} />}
      {viewMode === "calendar" && (
        <TodoCalendarView
          todos={filteredTodos}
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
        />
      )}
    </div>
  );
}

