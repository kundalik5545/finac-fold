"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X, ArrowDownRight, ArrowUpRight, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/schema/bank-account-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AddSubCategoryDialog } from "./AddSubCategoryDialog";
import { EditSubCategoryDialog } from "./EditSubCategoryDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { SubCategory } from "@/lib/schema/bank-account-types";
import { Input } from "@/components/ui/input";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * CategoriesTableView Component
 * Displays categories in a table format with subcategories shown as badges
 */
// Sortable Row Component
function SortableTableRow({
  category,
  isExpense,
  iconBgClass,
  loadingStates,
  newSubCategoryInputs,
  onDeleteCategory,
  onDeleteSubCategory,
  onAddSubCategoryInline,
  setNewSubCategoryInputs,
  setEditingCategory,
  getSubCategoryBgColor,
}: {
  category: Category;
  isExpense: boolean;
  iconBgClass: string;
  loadingStates: Record<string, boolean>;
  newSubCategoryInputs: Record<string, string>;
  onDeleteCategory: (id: string) => void;
  onDeleteSubCategory: (id: string) => void;
  onAddSubCategoryInline: (categoryId: string, name: string) => void;
  setNewSubCategoryInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditingCategory: (category: Category) => void;
  getSubCategoryBgColor: (color: string | null) => string;
}) {
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
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group hover:bg-muted/30 transition-colors ${isDragging ? "cursor-grabbing" : ""}`}
    >
      <TableCell className="p-4 align-top w-[50px]">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors inline-flex items-center justify-center"
          role="button"
          tabIndex={0}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="p-4 align-top">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-black/5 ${iconBgClass}`}
          >
            {category.icon || "📁"}
          </div>
          <span className="font-medium text-base">
            {category.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="p-4 align-top pt-6">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${isExpense
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
        >
          {isExpense ? (
            <ArrowDownRight className="h-3 w-3" />
          ) : (
            <ArrowUpRight className="h-3 w-3" />
          )}
          {category.type.toLowerCase()}
        </span>
      </TableCell>
      <TableCell className="p-4 align-middle">
        <div className="flex flex-wrap gap-2 mb-2">
          {category.subCategories &&
            category.subCategories.length > 0 &&
            category.subCategories.map((subCategory) => {
              const bgColorClass = getSubCategoryBgColor(subCategory.color);
              return (
                <span
                  key={subCategory.id}
                  className={`group/sub inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full ${bgColorClass} border border-border/50 text-xs transition-colors hover:opacity-80`}
                >
                  {subCategory.icon && (
                    <span className="text-xs">{subCategory.icon}</span>
                  )}
                  <span className="font-medium">{subCategory.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSubCategory(subCategory.id);
                    }}
                    disabled={loadingStates[`delete-sub-${subCategory.id}`]}
                    className="p-0.5 rounded-full hover:bg-black/10 text-muted-foreground hover:text-destructive opacity-0 group-hover/sub:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
        </div>
        <div className="flex items-center gap-2 max-w-[200px]">
          <Input
            type="text"
            placeholder="+ Add subcategory"
            value={newSubCategoryInputs[category.id] || ""}
            onChange={(e) =>
              setNewSubCategoryInputs((prev) => ({
                ...prev,
                [category.id]: e.target.value,
              }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const value = newSubCategoryInputs[category.id];
                if (value?.trim()) {
                  onAddSubCategoryInline(category.id, value);
                }
              }
            }}
            className="flex-1 bg-transparent text-xs border-b border-transparent focus:border-primary outline-none py-1 placeholder:text-muted-foreground/70"
          />
        </div>
      </TableCell>
      <TableCell className="p-4 align-top text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingCategory(category)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={loadingStates[`delete-${category.id}`]}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{category.name}"?
                  This will also delete all associated subcategories. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteCategory(category.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoriesTableView({
  categories: initialCategories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newSubCategoryInputs, setNewSubCategoryInputs] = useState<
    Record<string, string>
  >({});

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

  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    setLoadingStates((prev) => ({ ...prev, [`delete-${categoryId}`]: true }));

    try {
      const response = await fetch(`/api/bank-account/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-${categoryId}`]: false,
      }));
    }
  };

  // Handle delete subcategory
  const handleDeleteSubCategory = async (subCategoryId: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [`delete-sub-${subCategoryId}`]: true,
    }));

    try {
      const response = await fetch(
        `/api/bank-account/subcategories/${subCategoryId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete subcategory");
      }

      toast.success("Subcategory deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete subcategory"
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-sub-${subCategoryId}`]: false,
      }));
    }
  };

  // Handle inline subcategory addition
  const handleAddSubCategoryInline = async (
    categoryId: string,
    name: string
  ) => {
    if (!name.trim()) return;

    setLoadingStates((prev) => ({
      ...prev,
      [`add-sub-${categoryId}`]: true,
    }));

    try {
      const response = await fetch("/api/bank-account/subcategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId,
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create subcategory");
      }

      toast.success("Subcategory created successfully");
      setNewSubCategoryInputs((prev) => {
        const updated = { ...prev };
        delete updated[categoryId];
        return updated;
      });
      router.refresh();
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create subcategory"
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`add-sub-${categoryId}`]: false,
      }));
    }
  };

  // Get color class for category icon background
  const getIconBgColor = (color: string | null) => {
    if (!color) return "bg-orange-100 text-orange-600";
    // Map common colors to Tailwind classes
    const colorMap: Record<string, string> = {
      orange: "bg-orange-100 text-orange-600",
      blue: "bg-blue-100 text-blue-600",
      indigo: "bg-indigo-100 text-indigo-600",
      emerald: "bg-emerald-100 text-emerald-600",
      purple: "bg-purple-100 text-purple-600",
      red: "bg-red-100 text-red-600",
      green: "bg-green-100 text-green-600",
      slate: "bg-slate-100 text-slate-600",
      amber: "bg-amber-100 text-amber-600",
    };
    return colorMap[color.toLowerCase()] || "bg-orange-100 text-orange-600";
  };

  // Get color class for subcategory badge background
  const getSubCategoryBgColor = (color: string | null) => {
    if (!color) return "bg-slate-100";
    const colorMap: Record<string, string> = {
      slate: "bg-slate-100",
      red: "bg-red-100",
      orange: "bg-orange-100",
      amber: "bg-amber-100",
      emerald: "bg-emerald-100",
      blue: "bg-blue-100",
    };
    return colorMap[color.toLowerCase()] || "bg-slate-100";
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center">
        <p className="text-muted-foreground">
          No categories found. Add your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="h-11 px-4 font-medium w-[50px] text-muted-foreground"></TableHead>
                <TableHead className="h-11 px-6 font-medium w-[250px] text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="h-11 px-4 font-medium w-[120px] text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="h-11 px-4 font-medium text-muted-foreground">
                  Subcategories
                </TableHead>
                <TableHead className="h-11 px-4 font-medium w-[100px] text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((category) => {
                  const isExpense = category.type.toLowerCase() === "expense";
                  const iconBgClass = getIconBgColor(category.color);

                  return (
                    <SortableTableRow
                      key={category.id}
                      category={category}
                      isExpense={isExpense}
                      iconBgClass={iconBgClass}
                      loadingStates={loadingStates}
                      newSubCategoryInputs={newSubCategoryInputs}
                      onDeleteCategory={handleDeleteCategory}
                      onDeleteSubCategory={handleDeleteSubCategory}
                      onAddSubCategoryInline={handleAddSubCategoryInline}
                      setNewSubCategoryInputs={setNewSubCategoryInputs}
                      setEditingCategory={setEditingCategory}
                      getSubCategoryBgColor={getSubCategoryBgColor}
                    />
                  );
                })}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Add SubCategory Dialog */}
      {selectedCategoryId && (
        <AddSubCategoryDialog
          categoryId={selectedCategoryId}
          categoryName={
            categories.find((c) => c.id === selectedCategoryId)?.name || ""
          }
          open={!!selectedCategoryId}
          onOpenChange={(open) => {
            if (!open) setSelectedCategoryId(null);
          }}
        />
      )}

      {/* Edit SubCategory Dialog */}
      {editingSubCategory && (
        <EditSubCategoryDialog
          subCategory={editingSubCategory}
          categoryName={
            categories.find((c) => c.id === editingSubCategory.categoryId)
              ?.name || ""
          }
          open={!!editingSubCategory}
          onOpenChange={(open) => {
            if (!open) setEditingSubCategory(null);
          }}
        />
      )}

      {/* Edit Category Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => {
            if (!open) setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

