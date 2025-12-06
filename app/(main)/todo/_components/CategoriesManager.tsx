"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Edit, Check, X } from "lucide-react";
import { TodoCategory } from "@/lib/todo-types";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/action/todo";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CategoriesManagerProps {
  initialCategories: TodoCategory[];
  userId: string;
}

export function CategoriesManager({
  initialCategories,
  userId,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#3b82f6" });
  const [editCategory, setEditCategory] = useState({ name: "", color: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createCategory(
        {
          name: newCategory.name,
          color: newCategory.color,
        },
        userId
      );
      setCategories([...categories, created]);
      setNewCategory({ name: "", color: "#3b82f6" });
      setIsAdding(false);
      toast.success("Category created successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateCategory(
        id,
        {
          name: editCategory.name,
          color: editCategory.color,
        },
        userId
      );
      setCategories(
        categories.map((cat) => (cat.id === id ? updated : cat))
      );
      setEditingId(null);
      toast.success("Category updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteCategory(id, userId);
      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success("Category deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (category: TodoCategory) => {
    setEditingId(category.id);
    setEditCategory({
      name: category.name,
      color: category.color || "#3b82f6",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCategory({ name: "", color: "" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding || isSubmitting}
          >
            <Plus size={16} className="mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add New Category Form */}
          {isAdding && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-category-name">Name</Label>
                <Input
                  id="new-category-name"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-category-color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-category-color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Badge
                    style={{ backgroundColor: newCategory.color }}
                    className="text-white px-4 self-center"
                  >
                    Preview
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddCategory}
                  disabled={isSubmitting}
                >
                  <Check size={16} className="mr-2" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategory({ name: "", color: "#3b82f6" });
                  }}
                  disabled={isSubmitting}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No categories yet. Add your first category to organize your todos.
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  {editingId === category.id ? (
                    <div className="flex-1 space-y-3">
                      <Input
                        value={editCategory.name}
                        onChange={(e) =>
                          setEditCategory({
                            ...editCategory,
                            name: e.target.value,
                          })
                        }
                        placeholder="Category name"
                      />
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={editCategory.color}
                          onChange={(e) =>
                            setEditCategory({
                              ...editCategory,
                              color: e.target.value,
                            })
                          }
                          className="w-20 h-10"
                        />
                        <Badge
                          style={{ backgroundColor: editCategory.color }}
                          className="text-white px-4"
                        >
                          Preview
                        </Badge>
                        <div className="flex gap-2 ml-auto">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCategory(category.id)}
                            disabled={isSubmitting}
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={isSubmitting}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Badge
                        style={
                          category.color
                            ? { backgroundColor: category.color }
                            : {}
                        }
                        className="text-white"
                      >
                        {category.name}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(category)}
                          disabled={isSubmitting}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteCategory(category.id, category.name)
                          }
                          disabled={isSubmitting}
                        >
                          <Trash size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

