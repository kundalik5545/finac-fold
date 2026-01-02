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
import { Pencil, Trash2, X, ArrowDownRight, ArrowUpRight } from "lucide-react";
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
import { useState } from "react";
import { toast } from "sonner";
import { AddSubCategoryDialog } from "./AddSubCategoryDialog";
import { EditSubCategoryDialog } from "./EditSubCategoryDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { SubCategory } from "@/lib/schema/bank-account-types";
import { Input } from "@/components/ui/input";

/**
 * CategoriesTableView Component
 * Displays categories in a table format with subcategories shown as badges
 */
export function CategoriesTableView({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
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
    };
    return colorMap[color.toLowerCase()] || "bg-orange-100 text-orange-600";
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
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border">
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
            {categories.map((category) => {
              const isExpense = category.type.toLowerCase() === "expense";
              const iconBgClass = getIconBgColor(category.color);

              return (
                <TableRow
                  key={category.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
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
                        category.subCategories.map((subCategory) => (
                          <span
                            key={subCategory.id}
                            className="group/sub inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-secondary/50 text-secondary-foreground border border-border text-xs transition-colors hover:bg-secondary hover:border-secondary-foreground/20"
                          >
                            {subCategory.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubCategory(subCategory.id);
                              }}
                              disabled={
                                loadingStates[`delete-sub-${subCategory.id}`]
                              }
                              className="p-0.5 rounded-full hover:bg-black/10 text-muted-foreground hover:text-destructive opacity-0 group-hover/sub:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
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
                              handleAddSubCategoryInline(category.id, value);
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
                              This will also delete all associated
                              subcategories. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
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
            })}
          </TableBody>
        </Table>
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

