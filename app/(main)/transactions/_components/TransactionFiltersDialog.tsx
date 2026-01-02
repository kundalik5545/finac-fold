"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Calendar, 
    ArrowUpDown, 
    Tag, 
    CreditCard, 
    CheckCircle2, 
    Building2,
    X,
    Filter
} from "lucide-react";
import { Category, BankAccount } from "@/lib/schema/bank-account-types";
import type { TransactionFiltersState } from "./TransactionFilters";
import { Badge } from "@/components/ui/badge";

interface TransactionFiltersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: TransactionFiltersState;
    categories: Category[];
    subCategories: { id: string; name: string; categoryId: string }[];
    bankAccounts: BankAccount[];
    onApplyFilters: (filters: TransactionFiltersState) => void;
}

export function TransactionFiltersDialog({
    open,
    onOpenChange,
    filters,
    categories,
    subCategories,
    bankAccounts,
    onApplyFilters,
}: TransactionFiltersDialogProps) {
    const [localFilters, setLocalFilters] = useState<TransactionFiltersState>(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, open]);

    const handleApply = () => {
        onApplyFilters(localFilters);
    };

    const handleClear = () => {
        const cleared: TransactionFiltersState = {};
        setLocalFilters(cleared);
        onApplyFilters(cleared);
    };

    const selectedCategory = categories.find(c => c.id === localFilters.categoryId);
    const availableSubCategories = selectedCategory
        ? subCategories.filter(sc => sc.categoryId === selectedCategory.id)
        : [];

    // Count active filters
    const activeFiltersCount = useMemo(() => {
        return Object.values(localFilters).filter(v => v !== null && v !== undefined && v !== "").length;
    }, [localFilters]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        <DialogTitle>Filter Transactions</DialogTitle>
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFiltersCount} active
                            </Badge>
                        )}
                    </div>
                    <DialogDescription>
                        Refine your transaction list by applying filters below
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Date Range Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date Range
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-sm font-medium">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={localFilters.startDate || ""}
                                        onChange={(e) =>
                                            setLocalFilters({ ...localFilters, startDate: e.target.value })
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="text-sm font-medium">
                                        End Date
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={localFilters.endDate || ""}
                                        onChange={(e) =>
                                            setLocalFilters({ ...localFilters, endDate: e.target.value })
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction Details Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4" />
                                Transaction Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Transaction Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="transactionType" className="text-sm font-medium">
                                        Transaction Type
                                    </Label>
                                    <Select
                                        value={localFilters.transactionType || "none"}
                                        onValueChange={(value) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                transactionType: value === "none" ? null : (value as "CREDIT" | "DEBIT"),
                                            })
                                        }
                                    >
                                        <SelectTrigger id="transactionType">
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All types</SelectItem>
                                            <SelectItem value="CREDIT">Credit (Income)</SelectItem>
                                            <SelectItem value="DEBIT">Debit (Expense)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Status
                                    </Label>
                                    <Select
                                        value={localFilters.status || "none"}
                                        onValueChange={(value) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                status: value === "none" ? null : (value as any),
                                            })
                                        }
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All statuses</SelectItem>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="FAILED">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                                        <Tag className="h-3.5 w-3.5" />
                                        Category
                                    </Label>
                                    <Select
                                        value={localFilters.categoryId || "none"}
                                        onValueChange={(value) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                categoryId: value === "none" ? null : value,
                                                subCategoryId: null, // Reset subcategory when category changes
                                            })
                                        }
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.icon && <span className="mr-2">{category.icon}</span>}
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* SubCategory */}
                                {availableSubCategories.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="subCategory" className="text-sm font-medium">
                                            Sub Category
                                        </Label>
                                        <Select
                                            value={localFilters.subCategoryId || "none"}
                                            onValueChange={(value) =>
                                                setLocalFilters({
                                                    ...localFilters,
                                                    subCategoryId: value === "none" ? null : value,
                                                })
                                            }
                                        >
                                            <SelectTrigger id="subCategory">
                                                <SelectValue placeholder="All subcategories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">All subcategories</SelectItem>
                                                {availableSubCategories.map((subCategory) => (
                                                    <SelectItem key={subCategory.id} value={subCategory.id}>
                                                        {subCategory.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod" className="text-sm font-medium flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        Payment Method
                                    </Label>
                                    <Select
                                        value={localFilters.paymentMethod || "none"}
                                        onValueChange={(value) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                paymentMethod: value === "none" ? null : (value as any),
                                            })
                                        }
                                    >
                                        <SelectTrigger id="paymentMethod">
                                            <SelectValue placeholder="All methods" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All methods</SelectItem>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="CARD">Card</SelectItem>
                                            <SelectItem value="ONLINE">Online</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Bank Account */}
                                <div className="space-y-2">
                                    <Label htmlFor="bankAccount" className="text-sm font-medium flex items-center gap-2">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Bank Account
                                    </Label>
                                    <Select
                                        value={localFilters.bankAccountId || "none"}
                                        onValueChange={(value) =>
                                            setLocalFilters({
                                                ...localFilters,
                                                bankAccountId: value === "none" ? null : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="bankAccount">
                                            <SelectValue placeholder="All accounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All accounts</SelectItem>
                                            {bankAccounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    {account.icon && <span className="mr-2">{account.icon}</span>}
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Separator />
                <DialogFooter className="flex items-center justify-between sm:justify-end gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleClear}
                        className="flex items-center gap-2"
                        disabled={activeFiltersCount === 0}
                    >
                        <X className="h-4 w-4" />
                        Clear All
                    </Button>
                    <Button 
                        onClick={handleApply}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

