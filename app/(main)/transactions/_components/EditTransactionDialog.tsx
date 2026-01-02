"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTransactionSchema } from "@/lib/schema/bank-account-schema";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogClose,
} from "@/components/ui/dialog";
import { Category, BankAccount, Transaction } from "@/lib/schema/bank-account-types";
import {
    Calendar,
    CheckCircle2,
    Tag,
    CreditCard,
    Wallet,
    FileText,
    ArrowDownRight,
    ArrowUpRight,
    X,
    Save
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EditTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction;
    categories: Category[];
    bankAccounts: BankAccount[];
    onSuccess?: () => void;
}

/**
 * Get currency symbol for display
 */
const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        OTHER: "¤",
    };
    return symbols[currency] || "₹";
};

/**
 * EditTransactionDialog Component
 * Dialog for editing an existing transaction with modern UI
 */
export function EditTransactionDialog({
    open,
    onOpenChange,
    transaction,
    categories,
    bankAccounts,
    onSuccess,
}: EditTransactionDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<z.infer<typeof updateTransactionSchema>>({
        resolver: zodResolver(updateTransactionSchema),
        mode: "onChange",
    });

    const transactionTypeValue = watch("transactionType") ?? transaction.transactionType;
    const categoryIdValue = watch("categoryId") ?? transaction.categoryId ?? null;
    const currencyValue = watch("currency") || transaction.currency || "INR";

    // Filter categories based on transaction type
    const filteredCategories = useMemo(() => {
        if (transactionTypeValue === "CREDIT") {
            return categories.filter((cat) => cat.type === "INCOME");
        } else if (transactionTypeValue === "DEBIT") {
            return categories.filter((cat) => cat.type === "EXPENSE");
        }
        return categories;
    }, [categories, transactionTypeValue]);

    const selectedCategory = filteredCategories.find((c) => c.id === categoryIdValue) || 
                             categories.find((c) => c.id === transaction.categoryId);
    const subCategories = selectedCategory?.subCategories || [];

    // Initialize form with transaction data
    useEffect(() => {
        if (open && transaction) {
            const transactionDate = transaction.date instanceof Date 
                ? transaction.date.toISOString().split("T")[0]
                : new Date(transaction.date).toISOString().split("T")[0];

            reset({
                amount: transaction.amount,
                transactionType: transaction.transactionType,
                status: transaction.status,
                date: transactionDate,
                description: transaction.description || null,
                currency: transaction.currency || "INR",
                isActive: transaction.isActive,
                bankAccountId: transaction.bankAccountId || null,
                categoryId: transaction.categoryId || null,
                subCategoryId: transaction.subCategoryId || null,
                paymentMethod: transaction.paymentMethod || null,
            });
        }
    }, [open, transaction, reset]);

    // Reset category when transaction type changes
    useEffect(() => {
        if (categoryIdValue) {
            const currentCategory = categories.find((c) => c.id === categoryIdValue);
            if (currentCategory) {
                const isIncomeCategory = currentCategory.type === "INCOME";
                const isExpenseCategory = currentCategory.type === "EXPENSE";

                if (transactionTypeValue === "CREDIT" && !isIncomeCategory) {
                    setValue("categoryId", null);
                    setValue("subCategoryId", null);
                } else if (transactionTypeValue === "DEBIT" && !isExpenseCategory) {
                    setValue("categoryId", null);
                    setValue("subCategoryId", null);
                }
            }
        }
    }, [transactionTypeValue, categoryIdValue, categories, setValue]);

    const handleClose = (open: boolean) => {
        if (!open) {
            router.push("/transactions");
        }
        onOpenChange(open);
    };

    const onSubmit = async (data: z.infer<typeof updateTransactionSchema>) => {
        setIsSubmitting(true);
        try {
            // Clean up the data before sending
            const cleanedData = {
                ...data,
                amount: data.amount || transaction.amount,
                description:
                    data.description && data.description.trim() !== ""
                        ? data.description.trim()
                        : null,
                bankAccountId: data.bankAccountId || null,
                categoryId: data.categoryId || null,
                subCategoryId: data.subCategoryId || null,
                paymentMethod: data.paymentMethod || null,
                status: data.status || transaction.status,
                currency: data.currency || transaction.currency || "INR",
                isActive: data.isActive ?? transaction.isActive,
                date: data.date ? new Date(data.date).toISOString() : new Date(transaction.date).toISOString(),
            };

            const response = await fetch(`/api/transactions/${transaction.id}`, {
                method: "PUT",
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
                toast.success("Transaction updated successfully");
                handleClose(false);
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                const errorMessage =
                    responseData?.error ||
                    `Failed to update transaction (${response.status} ${response.statusText})`;
                toast.error(errorMessage);

                if (responseData?.details) {
                    console.error("Validation details:", responseData.details);
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to update transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl md:min-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl shadow-2xl" showCloseButton={false}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold tracking-tight">Edit Transaction</span>
                        <span className="text-sm text-muted-foreground mt-1">
                            Update transaction details.
                        </span>
                    </div>
                    <DialogClose asChild>
                        <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center ml-4">
                            <X className="h-5 w-5" />
                        </button>
                    </DialogClose>
                </div>

                {/* Form Content */}
                <div className="overflow-y-auto p-6 flex-1">
                    <form id="edit-transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Amount Input with Currency */}
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <Label className="block text-sm font-medium text-muted-foreground mb-2">
                                Transaction Amount
                            </Label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground font-light">
                                        {getCurrencySymbol(currencyValue)}
                                    </span>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        placeholder="0.00"
                                        {...register("amount", { valueAsNumber: true })}
                                        className={`w-full bg-transparent text-5xl font-bold placeholder:text-muted/50 focus:outline-none pl-10 py-4 border-0 focus-visible:ring-0 ${errors.amount ? "text-red-500" : ""}`}
                                    />
                                </div>
                                <Select
                                    value={currencyValue}
                                    onValueChange={(value) =>
                                        setValue("currency", value as "INR" | "USD" | "EUR" | "GBP" | "OTHER")
                                    }
                                >
                                    <SelectTrigger className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.amount && (
                                <p className="text-sm text-red-500 mt-2">
                                    {errors.amount.message}
                                </p>
                            )}
                        </div>

                        {/* Transaction Type Buttons */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                            <button
                                type="button"
                                onClick={() => setValue("transactionType", "DEBIT")}
                                className={`py-2 rounded-md text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 ${transactionTypeValue === "DEBIT"
                                    ? "bg-background text-rose-500 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <ArrowDownRight className="h-4 w-4" />
                                Expense (Debit)
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue("transactionType", "CREDIT")}
                                className={`py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${transactionTypeValue === "CREDIT"
                                    ? "bg-background text-emerald-500 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <ArrowUpRight className="h-4 w-4" />
                                Income (Credit)
                            </button>
                        </div>
                        {errors.transactionType && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.transactionType.message}
                            </p>
                        )}

                        {/* Date and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Date
                                </Label>
                                <Input
                                    type="date"
                                    {...register("date")}
                                    className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                                {errors.date && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.date.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                    Status
                                </Label>
                                <Select
                                    value={watch("status") || transaction.status}
                                    onValueChange={(value) =>
                                        setValue("status", value as "PENDING" | "COMPLETED" | "FAILED")
                                    }
                                >
                                    <SelectTrigger className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="FAILED">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Category and Subcategory - Always show both */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    Category
                                </Label>
                                <Select
                                    value={categoryIdValue || "none"}
                                    onValueChange={(value) => {
                                        setValue("categoryId", value === "none" ? null : value);
                                        setValue("subCategoryId", null);
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {filteredCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.icon && <span className="mr-2">{category.icon}</span>}
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <Tag className="h-4 w-4 text-muted-foreground opacity-50" />
                                    Sub Category
                                </Label>
                                {subCategories.length > 0 ? (
                                    <Select
                                        value={watch("subCategoryId") || transaction.subCategoryId || "none"}
                                        onValueChange={(value) =>
                                            setValue("subCategoryId", value === "none" ? null : value)
                                        }
                                    >
                                        <SelectTrigger className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
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
                                ) : (
                                    <Input
                                        type="text"
                                        placeholder="e.g. Streaming, Groceries"
                                        value={""}
                                        onChange={(e) => {
                                            // For text input, we can't save it as subCategoryId since it's a foreign key
                                            // This is just for display/UX purposes
                                        }}
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Payment Method and Bank Account */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    Payment Method
                                </Label>
                                <Select
                                    value={watch("paymentMethod") || transaction.paymentMethod || "none"}
                                    onValueChange={(value) =>
                                        setValue(
                                            "paymentMethod",
                                            value === "none"
                                                ? null
                                                : (value as "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER")
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="CARD">Card</SelectItem>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="ONLINE">Online</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm font-medium">
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                    Bank Account
                                </Label>
                                <Select
                                    value={watch("bankAccountId") || transaction.bankAccountId || "none"}
                                    onValueChange={(value) =>
                                        setValue("bankAccountId", value === "none" ? null : value)
                                    }
                                >
                                    <SelectTrigger className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <SelectValue placeholder="Select bank account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {bankAccounts.map((account) => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.icon && <span className="mr-2">{account.icon}</span>}
                                                {account.name}
                                                {account.accountNumber && (
                                                    <span className="text-muted-foreground ml-2">
                                                        (**** {account.accountNumber.slice(-4)})
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm font-medium">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Additional Information
                            </Label>
                            <Textarea
                                {...register("description")}
                                placeholder="Add notes, descriptions, or tags..."
                                rows={3}
                                className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleClose(false)}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="edit-transaction-form"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm transition-all flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Update Transaction"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

