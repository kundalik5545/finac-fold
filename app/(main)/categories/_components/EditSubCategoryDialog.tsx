"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSubCategorySchema } from "@/lib/bank-account-schema";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/custom-componetns/icon-picker";
import { ColorPicker } from "@/components/custom-componetns/color-picker";
import { toast } from "sonner";
import { SubCategory } from "@/lib/bank-account-types";

/**
 * EditSubCategoryDialog Component
 * Dialog form for editing an existing subcategory
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subcategory in {categoryName}</DialogTitle>
          <DialogDescription>
            Update the subcategory details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("categoryId")} />

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter subcategory name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <IconPicker
            value={iconValue}
            onChange={(icon) => setValue("icon", icon)}
            label="Icon"
          />

          <ColorPicker
            value={colorValue}
            onChange={(color) => setValue("color", color)}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Subcategory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

