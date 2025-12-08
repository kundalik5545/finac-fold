"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema } from "@/lib/schema/bank-account-schema";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Category, BankAccount } from "@/lib/schema/bank-account-types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TransactionFormProps {
    categories: Category[];
    bankAccounts: BankAccount[];
}

/**
 * TransactionForm Component
 * Form for creating a new transaction
 */
export function TransactionForm({
    categories,
    bankAccounts,
}: TransactionFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<z.infer<typeof transactionFormSchema>>({
        resolver: zodResolver(transactionFormSchema),
        defaultValues: {
            amount: 0,
            transactionType: "DEBIT",
            status: "PENDING",
            date: new Date().toISOString().split("T")[0],
            description: null,
            currency: "INR",
            isActive: true,
            bankAccountId: null,
            categoryId: null,
            subCategoryId: null,
            paymentMethod: null,
        },
        mode: "onChange",
    });

    const transactionTypeValue = watch("transactionType");
    const categoryIdValue = watch("categoryId");
    const selectedCategory = categories.find((c) => c.id === categoryIdValue);
    const subCategories = selectedCategory?.subCategories || [];

    // Set default date to today
    useEffect(() => {
        setValue("date", new Date().toISOString().split("T")[0]);
    }, [setValue]);

    const onSubmit = async (data: z.infer<typeof transactionFormSchema>) => {
        setIsSubmitting(true);
        try {
            // Clean up the data before sending
            const cleanedData = {
                ...data,
                amount: data.amount || 0,
                description:
                    data.description && data.description.trim() !== ""
                        ? data.description.trim()
                        : null,
                bankAccountId: data.bankAccountId || null,
                categoryId: data.categoryId || null,
                subCategoryId: data.subCategoryId || null,
                paymentMethod: data.paymentMethod || null,
                status: data.status || "PENDING",
                currency: data.currency || "INR",
                isActive: data.isActive ?? true,
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            };

            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cleanedData),
            });

            let responseData: any = {};
            const contentType = response.headers.get("content-type");

            try {
                const text = await response.text();
                if (text && contentType && contentType.includes("application/json")) {
                    responseData = JSON.parse(text);
                } else if (text) {
                    responseData = { error: text };
                }
            } catch (parseError) {
                console.error("Error parsing response:", parseError);
                responseData = { error: "Failed to parse server response" };
            }

            if (response.ok) {
                toast.success("Transaction created successfully");
                router.push("/transactions");
                router.refresh();
            } else {
                const errorMessage =
                    responseData?.error ||
                    `Failed to create transaction (${response.status} ${response.statusText})`;
                toast.error(errorMessage);

                if (responseData?.details) {
                    console.error("Validation details:", responseData.details);
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to create transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Amount */}
                                <div>
                                    <Label htmlFor="amount">
                                        Amount <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        {...register("amount", { valueAsNumber: true })}
                                        className={errors.amount ? "border-red-500" : ""}
                                    />
                                    {errors.amount && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.amount.message}
                                        </p>
                                    )}
                                </div>

                                {/* Date */}
                                <div>
                                    <Label htmlFor="date">
                                        Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        {...register("date")}
                                        className={errors.date ? "border-red-500" : ""}
                                    />
                                    {errors.date && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.date.message}
                                        </p>
                                    )}
                                </div>

                                {/* Transaction Type */}
                                <div>
                                    <Label>
                                        Transaction Type <span className="text-red-500">*</span>
                                    </Label>
                                    <RadioGroup
                                        value={transactionTypeValue}
                                        onValueChange={(value) =>
                                            setValue("transactionType", value as "CREDIT" | "DEBIT")
                                        }
                                        className="flex gap-6 mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="CREDIT" id="credit" />
                                            <Label htmlFor="credit" className="cursor-pointer">
                                                Credit (Income)
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="DEBIT" id="debit" />
                                            <Label htmlFor="debit" className="cursor-pointer">
                                                Debit (Expense)
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.transactionType && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.transactionType.message}
                                        </p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={watch("status") || "PENDING"}
                                        onValueChange={(value) =>
                                            setValue("status", value as "PENDING" | "COMPLETED" | "FAILED")
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="FAILED">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category */}
                                <div>
                                    <Label htmlFor="categoryId">Category</Label>
                                    <Select
                                        value={categoryIdValue || "none"}
                                        onValueChange={(value) => {
                                            setValue("categoryId", value === "none" ? null : value);
                                            setValue("subCategoryId", null); // Reset subcategory when category changes
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.icon && <span className="mr-2">{category.icon}</span>}
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Subcategory */}
                                <div>
                                    <Label htmlFor="subCategoryId">Subcategory</Label>
                                    <Select
                                        value={watch("subCategoryId") || "none"}
                                        onValueChange={(value) =>
                                            setValue("subCategoryId", value === "none" ? null : value)
                                        }
                                        disabled={!categoryIdValue || subCategories.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subcategory" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {subCategories.map((subCategory) => (
                                                <SelectItem key={subCategory.id} value={subCategory.id}>
                                                    {subCategory.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select
                                        value={watch("paymentMethod") || "none"}
                                        onValueChange={(value) =>
                                            setValue(
                                                "paymentMethod",
                                                value === "none"
                                                    ? null
                                                    : (value as "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER")
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="CARD">Card</SelectItem>
                                            <SelectItem value="ONLINE">Online</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Bank Account */}
                                <div>
                                    <Label htmlFor="bankAccountId">Bank Account</Label>
                                    <Select
                                        value={watch("bankAccountId") || "none"}
                                        onValueChange={(value) =>
                                            setValue("bankAccountId", value === "none" ? null : value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select bank account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {bankAccounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Currency */}
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select
                                        value={watch("currency") || "INR"}
                                        onValueChange={(value) =>
                                            setValue("currency", value as "INR" | "USD" | "EUR" | "GBP" | "OTHER")
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INR">INR</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-4">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    placeholder="Enter transaction description (optional)"
                                    className={errors.description ? "border-red-500" : ""}
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Transaction"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

