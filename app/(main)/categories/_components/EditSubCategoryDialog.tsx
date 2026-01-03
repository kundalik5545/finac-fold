"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSubCategorySchema } from "@/lib/schema/bank-account-schema";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";
import { SubCategory } from "@/lib/schema/bank-account-types";
import { SUB_CATEGORY_ICONS, SUB_CATEGORY_COLOR_OPTIONS } from "@/data/AppData";

/**
 * EditSubCategoryDialog Component
 * Dialog form for editing an existing subcategory
 * Matches the AddSubCategoryDialog style with icon grid and color picker
 */
export function EditSubCategoryDialog({
  subCategory,
  categoryName,
  open,
  onOpenChange,
}: {
  subCategory: SubCategory;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<z.infer<typeof updateSubCategorySchema>>({
    resolver: zodResolver(updateSubCategorySchema),
    defaultValues: {
      categoryId: subCategory.categoryId,
      name: subCategory.name,
      icon: subCategory.icon || null,
      color: subCategory.color || null,
    },
  });

  const iconValue = watch("icon");
  const colorValue = watch("color");

  useEffect(() => {
    setValue("categoryId", subCategory.categoryId);
    setValue("name", subCategory.name);
    setValue("icon", subCategory.icon || null);
    setValue("color", subCategory.color || null);
  }, [subCategory, setValue]);

  const onSubmit = async (data: z.infer<typeof updateSubCategorySchema>) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/bank-account/subcategories/${subCategory.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update subcategory");
      }

      toast.success("Subcategory updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating subcategory:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update subcategory"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 max-w-lg overflow-hidden bg-card rounded-xl shadow-xl border border-border"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <h3 className="text-lg font-semibold">Edit Subcategory</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <input type="hidden" {...register("categoryId")} />

            {/* Subcategory Name */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subcategory Name</Label>
                <Input
                  {...register("name")}
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Fruits"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* Icon and Color Picker */}
            <div className="grid gap-4">
              {/* Icon Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {SUB_CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setValue("icon", icon)}
                      className={`h-10 w-10 flex items-center justify-center text-xl rounded-lg border transition-all hover:scale-105 ${iconValue === icon
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted"
                        }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                {errors.icon && (
                  <p className="text-sm text-destructive">{errors.icon.message}</p>
                )}
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Color Tag</Label>
                <div className="flex flex-wrap gap-2">
                  {SUB_CATEGORY_COLOR_OPTIONS.map((color) => {
                    const isSelected = colorValue === color.value;
                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setValue("color", isSelected ? null : color.value)
                        }
                        className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-105 ${isSelected
                            ? "border-primary ring-2 ring-offset-2 ring-primary/30"
                            : "border-transparent"
                          } ${color.bg}`}
                        title={color.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              {isLoading ? "Updating..." : "Update Subcategory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
