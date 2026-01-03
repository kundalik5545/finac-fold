"use client";

import { CategoryCard } from "./CategoryCard";
import { Category } from "@/lib/schema/bank-account-types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

// Sortable Card Component
function SortableCategoryCard({ category }: { category: Category }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "cursor-grabbing" : ""}`}
    >
      <div className="absolute -top-2 -left-2 z-10 cursor-grab active:cursor-grabbing p-1.5 bg-background border border-border rounded-md shadow-sm hover:bg-muted transition-colors opacity-0 group-hover:opacity-100" id="sortable-category-card-grip">
        <GripVertical className="h-4 w-4 text-muted-foreground" {...attributes} {...listeners} />
      </div>
      <div className="group">
        <CategoryCard category={category} />
      </div>
    </div>
  );
}

/**
 * CategoriesCardView Component
 * Displays categories in a card grid format with drag and drop
 */
export function CategoriesCardView({
  categories: initialCategories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local state when props change
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(newCategories);

    // Update order in database
    try {
      const categoryOrders = newCategories.map((category, index) => ({
        id: category.id,
        order: index,
      }));

      const response = await fetch("/api/bank-account/categories/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryOrders }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder categories");
      }

      toast.success("Categories reordered successfully");
      router.refresh();
    } catch (error) {
      console.error("Error reordering categories:", error);
      toast.error("Failed to reorder categories");
      // Revert to original order
      setCategories(initialCategories);
    }
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">
          No categories found. Add your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      id="categories-card-view"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categories.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="categories-card-view-cards">
          {categories.map((category) => (
            <SortableCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
