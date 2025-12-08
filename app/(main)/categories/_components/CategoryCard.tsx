"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
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
import { SubCategory } from "@/lib/schema/bank-account-types";

/**
 * CategoryCard Component
 * Individual card component showing category name, icon, and subcategories as badges
 * Note: Category color is NOT shown in the background as per requirements
 */
export function CategoryCard({ category }: { category: Category }) {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
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

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {category.icon && (
                <span className="text-2xl">{category.icon}</span>
              )}
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <Badge variant="outline" className="mt-1">
                  {category.type}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
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
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{category.name}"? This
                      will also delete all associated subcategories. This
                      action cannot be undone.
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Subcategories
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowAddSubCategory(true)}
                >
                  <Plus size={12} className="mr-1" />
                  Add
                </Button>
              </div>
              {category.subCategories &&
                category.subCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {category.subCategories.map((subCategory) => (
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
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No subcategories yet
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add SubCategory Dialog */}
      {showAddSubCategory && (
        <AddSubCategoryDialog
          categoryId={category.id}
          categoryName={category.name}
          open={showAddSubCategory}
          onOpenChange={setShowAddSubCategory}
        />
      )}

      {/* Edit SubCategory Dialog */}
      {editingSubCategory && (
        <EditSubCategoryDialog
          subCategory={editingSubCategory}
          categoryName={category.name}
          open={!!editingSubCategory}
          onOpenChange={(open) => {
            if (!open) setEditingSubCategory(null);
          }}
        />
      )}
    </>
  );
}

