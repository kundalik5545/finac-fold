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
import { Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/bank-account-types";
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
import { SubCategory } from "@/lib/bank-account-types";

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
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-xl">{category.icon}</span>
                    )}
                    <span className="font-medium">{category.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{category.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2 items-center">
                    {category.subCategories &&
                    category.subCategories.length > 0 ? (
                      category.subCategories.map((subCategory) => (
                        <Badge
                          key={subCategory.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {subCategory.icon && (
                            <span className="text-xs">{subCategory.icon}</span>
                          )}
                          {subCategory.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSubCategory(subCategory);
                            }}
                            className="ml-1 hover:text-primary"
                            title="Edit subcategory"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubCategory(subCategory.id);
                            }}
                            disabled={
                              loadingStates[`delete-sub-${subCategory.id}`]
                            }
                            className="ml-1 hover:text-destructive"
                            title="Delete subcategory"
                          >
                            <Trash2 size={12} />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No subcategories
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      <Plus size={12} className="mr-1" />
                      Add
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/categories/edit/${category.id}`)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loadingStates[`delete-${category.id}`]}
                        >
                          <Trash2
                            size={16}
                            className="text-destructive"
                          />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{category.name}"?
                            This will also delete all associated subcategories.
                            This action cannot be undone.
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
            ))}
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
    </div>
  );
}

