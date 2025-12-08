"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCategorySchema } from "@/lib/bank-account-schema";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPicker } from "@/components/custom-componetns/icon-picker";
import { ColorPicker } from "@/components/custom-componetns/color-picker";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/lib/bank-account-types";

/**
 * EditCategoryForm Component
 * Form for editing an existing category
 */
export function EditCategoryForm({ category }: { category: Category }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof updateCategorySchema>>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: category.name,
      type: category.type,
      icon: category.icon || null,
      color: category.color || null,
    },
  });

  const iconValue = watch("icon");
  const colorValue = watch("color");
  const typeValue = watch("type");

  useEffect(() => {
    setValue("name", category.name);
    setValue("type", category.type);
    setValue("icon", category.icon || null);
    setValue("color", category.color || null);
  }, [category, setValue]);

  const onSubmit = async (data: z.infer<typeof updateCategorySchema>) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/bank-account/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update category");
      }

      toast.success("Category updated successfully");
      router.push("/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Category Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={typeValue}
              onValueChange={(value) =>
                setValue("type", value as z.infer<typeof updateCategorySchema>["type"])
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select category type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="INVESTMENT">Investment</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <IconPicker
            value={iconValue}
            onChange={(icon) => setValue("icon", icon)}
            label="Icon"
          />

          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPicker
              value={colorValue}
              onChange={(color) => setValue("color", color)}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

