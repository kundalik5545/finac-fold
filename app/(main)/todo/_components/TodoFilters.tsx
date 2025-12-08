"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  TodoFilters as TodoFiltersType,
  TodoCategory,
  TodoTag,
  TodoPriority,
} from "@/lib/types/todo-types";

interface TodoFiltersProps {
  filters: TodoFiltersType;
  categories: TodoCategory[];
  tags: TodoTag[];
  onApplyFilters: (filters: TodoFiltersType) => void;
  onClearFilters: () => void;
}

export function TodoFilters({
  filters,
  categories,
  tags,
  onApplyFilters,
  onClearFilters,
}: TodoFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TodoFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleCompletionChange = (value: string) => {
    setLocalFilters({
      ...localFilters,
      completed: value === "all" ? undefined : value === "completed",
    });
  };

  const handlePriorityToggle = (priority: TodoPriority) => {
    const currentPriorities = localFilters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority];
    setLocalFilters({ ...localFilters, priority: newPriorities });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = localFilters.categoryIds || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((c) => c !== categoryId)
      : [...currentCategories, categoryId];
    setLocalFilters({ ...localFilters, categoryIds: newCategories });
  };

  const handleTagToggle = (tagId: string) => {
    const currentTags = localFilters.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId];
    setLocalFilters({ ...localFilters, tagIds: newTags });
  };

  const handleSortChange = (value: string) => {
    setLocalFilters({
      ...localFilters,
      sortBy: value as TodoFiltersType["sortBy"],
    });
  };

  const handleSortOrderChange = (value: string) => {
    setLocalFilters({
      ...localFilters,
      sortOrder: value as "asc" | "desc",
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Completion Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={
                localFilters.completed === undefined
                  ? "all"
                  : localFilters.completed
                    ? "completed"
                    : "active"
              }
              onValueChange={handleCompletionChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="space-y-2">
              {(["URGENT", "HIGH", "MEDIUM", "LOW"] as TodoPriority[]).map(
                (priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={localFilters.priority?.includes(priority)}
                      onCheckedChange={() => handlePriorityToggle(priority)}
                    />
                    <label
                      htmlFor={`priority-${priority}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {priority}
                    </label>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={localFilters.categoryIds?.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No categories</p>
              )}
            </div>
          </div>

          {/* Tag Filter */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={localFilters.tagIds?.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {tag.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tags</p>
              )}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={localFilters.sortBy || "dueDate"}
              onValueChange={handleSortChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label>Order</Label>
            <Select
              value={localFilters.sortOrder || "asc"}
              onValueChange={handleSortOrderChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button onClick={handleApply}>Apply Filters</Button>
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

