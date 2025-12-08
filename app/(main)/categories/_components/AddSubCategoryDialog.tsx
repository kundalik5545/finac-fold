"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subCategoryFormSchema } from "@/lib/bank-account-schema";
import type { SubCategoryFormValues } from "@/lib/bank-account-schema";
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

/**
 * AddSubCategoryDialog Component
 * Dialog form for adding a new subcategory to a category
 */
export function AddSubCategoryDialog({
  categoryId,
  categoryName,
  open,
  onOpenChange,
}: {
  categoryId: string;
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
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategoryFormSchema),
    defaultValues: {
      categoryId,
      name: "",
      icon: null,
      color: null,
    },
  });

  const iconValue = watch("icon");
  const colorValue = watch("color");

  const onSubmit = async (data: SubCategoryFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/bank-account/subcategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create subcategory");
      }

      toast.success("Subcategory created successfully");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create subcategory"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subcategory to {categoryName}</DialogTitle>
          <DialogDescription>
            Create a new subcategory for this category.
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
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Subcategory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

