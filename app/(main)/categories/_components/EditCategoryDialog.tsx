"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCategorySchema } from "@/lib/schema/bank-account-schema";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { COMMON_ICONS, COLOR_OPTIONS } from "@/data/AppData";
import { Category } from "@/lib/schema/bank-account-types";

/**
 * EditCategoryDialog Component
 * Modal dialog for editing an existing category matching the reference design
 */
export function EditCategoryDialog({
    open,
    onOpenChange,
    category,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
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
    } = useForm<z.infer<typeof updateCategorySchema>>({
        resolver: zodResolver(updateCategorySchema),
        defaultValues: {
            name: category?.name || "",
            type: category?.type || "EXPENSE",
            icon: category?.icon || null,
            color: category?.color || null,
        },
    });

    const iconValue = watch("icon");
    const colorValue = watch("color");
    const typeValue = watch("type");

    // Update form when category changes
    useEffect(() => {
        if (category) {
            setValue("name", category.name);
            setValue("type", category.type);
            setValue("icon", category.icon || null);
            setValue("color", category.color || null);
        }
    }, [category, setValue]);

    const onSubmit = async (data: z.infer<typeof updateCategorySchema>) => {
        if (!category) return;

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
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to update category"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (category) {
            reset({
                name: category.name,
                type: category.type,
                icon: category.icon || null,
                color: category.color || null,
            });
        }
        onOpenChange(false);
    };

    if (!category) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose} >
            <DialogContent
                className="p-0 max-w-lg overflow-hidden bg-card rounded-xl shadow-xl border border-border"
                showCloseButton={false}
                id="edit-category-dialog"
            >
                {/* Header */}
                <div
                    className="p-6 border-b border-border flex justify-between items-center bg-muted/30"
                    id="edit-category-header"
                >
                    <h3 className="text-lg font-semibold" id="edit-category-title">
                        Edit Category
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                        id="close-edit-category-dialog"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} id="edit-category-form">
                    <div className="p-6 space-y-6" id="edit-category-form-content">
                        {/* Category Name */}
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium" htmlFor="edit-category-name-input">Category Name</Label>
                                <Input
                                    {...register("name")}
                                    id="edit-category-name-input"
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. Groceries"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive" id="edit-category-name-error">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Type Toggle */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium" id="edit-category-type-label">Type</Label>
                                <div className="flex gap-2 p-1 bg-muted rounded-lg" id="edit-category-type-toggle">
                                    <button
                                        id="edit-category-type-expense"
                                        type="button"
                                        onClick={() => setValue("type", "EXPENSE")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${typeValue === "EXPENSE"
                                            ? "bg-background shadow-sm text-red-500"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        aria-pressed={typeValue === "EXPENSE"}
                                    >
                                        <ArrowDownRight className="h-4 w-4" />
                                        Expense
                                    </button>
                                    <button
                                        id="edit-category-type-income"
                                        type="button"
                                        onClick={() => setValue("type", "INCOME")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${typeValue === "INCOME"
                                            ? "bg-background shadow-sm text-emerald-500"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        aria-pressed={typeValue === "INCOME"}
                                    >
                                        <ArrowUpRight className="h-4 w-4" />
                                        Income
                                    </button>
                                </div>
                                {errors.type && (
                                    <p className="text-sm text-destructive" id="edit-category-type-error">{errors.type.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Icon and Color Picker */}
                        <div className="grid gap-4">
                            {/* Icon Picker */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium" id="edit-category-icon-label">Icon</Label>
                                <div className="flex flex-wrap gap-2" id="edit-category-icon-list">
                                    {COMMON_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            id={`edit-category-icon-option-${icon}`}
                                            type="button"
                                            onClick={() => setValue("icon", icon)}
                                            className={`h-10 w-10 flex items-center justify-center text-xl rounded-lg border transition-all hover:scale-105 ${iconValue === icon
                                                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                                : "border-border hover:bg-muted"
                                                }`}
                                            aria-pressed={iconValue === icon}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                                {errors.icon && (
                                    <p className="text-sm text-destructive" id="edit-category-icon-error">{errors.icon.message}</p>
                                )}
                            </div>

                            {/* Color Picker */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium" id="edit-category-color-label">Color Tag</Label>
                                <div className="flex flex-wrap gap-2" id="edit-category-color-list">
                                    {COLOR_OPTIONS.map((color) => {
                                        const isSelected = colorValue === color.value;
                                        return (
                                            <button
                                                key={color.value}
                                                id={`edit-category-color-option-${color.value}`}
                                                type="button"
                                                onClick={() =>
                                                    setValue("color", isSelected ? null : color.value)
                                                }
                                                className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-105 ${isSelected
                                                    ? "border-primary ring-2 ring-offset-2 ring-primary/30"
                                                    : "border-transparent"
                                                    } ${color.bg}`}
                                                title={color.name}
                                                aria-pressed={isSelected}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3" id="edit-category-footer">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                            id="edit-category-cancel-btn"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                            id="edit-category-submit-btn"
                        >
                            {isLoading ? "Updating..." : "Update Category"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
