"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category, BankAccount } from "@/lib/schema/bank-account-types";
import {
    getDateRangeByPreset,
    type DatePreset,
} from "@/lib/utils/transaction-utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface TransactionFiltersState {
    datePreset?: DatePreset;
    startDate?: string;
    endDate?: string;
    transactionType?: "CREDIT" | "DEBIT" | null;
    categoryId?: string | null;
    subCategoryId?: string | null;
    paymentMethod?: "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER" | null;
    status?: "PENDING" | "COMPLETED" | "FAILED" | null;
    bankAccountId?: string | null;
}

interface TransactionFiltersProps {
    filters: TransactionFiltersState;
    categories: Category[];
    subCategories: { id: string; name: string; categoryId: string }[];
    bankAccounts: BankAccount[];
    onApplyFilters: (filters: TransactionFiltersState) => void;
    onClearFilters: () => void;
}

/**
 * TransactionFilters Component
 * Comprehensive filter UI for transactions with all filter options
 */
export function TransactionFilters({
    filters,
    categories,
    subCategories,
    bankAccounts,
    onApplyFilters,
    onClearFilters,
}: TransactionFiltersProps) {
    const [localFilters, setLocalFilters] = useState<TransactionFiltersState>(filters);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleApply = () => {
        // Apply date preset if selected
        if (localFilters.datePreset && localFilters.datePreset !== "custom") {
            const dateRange = getDateRangeByPreset(localFilters.datePreset);
            if (dateRange) {
                const updatedFilters = {
                    ...localFilters,
                    startDate: dateRange.startDate.toISOString().split("T")[0],
                    endDate: dateRange.endDate.toISOString().split("T")[0],
                };
                onApplyFilters(updatedFilters);
                return;
            }
        }
        onApplyFilters(localFilters);
    };

    const handleClear = () => {
        const clearedFilters: TransactionFiltersState = {
            datePreset: undefined,
            startDate: undefined,
            endDate: undefined,
            transactionType: null,
            categoryId: null,
            subCategoryId: null,
            paymentMethod: null,
            status: null,
            bankAccountId: null,
        };
        setLocalFilters(clearedFilters);
        onClearFilters();
    };

    const handleDatePresetChange = (preset: DatePreset) => {
        if (preset === "custom") {
            setLocalFilters({
                ...localFilters,
                datePreset: "custom",
                startDate: localFilters.startDate,
                endDate: localFilters.endDate,
            });
        } else {
            const dateRange = getDateRangeByPreset(preset);
            if (dateRange) {
                setLocalFilters({
                    ...localFilters,
                    datePreset: preset,
                    startDate: dateRange.startDate.toISOString().split("T")[0],
                    endDate: dateRange.endDate.toISOString().split("T")[0],
                });
            }
        }
    };

    // Filter subcategories based on selected category
    const filteredSubCategories = localFilters.categoryId
        ? subCategories.filter((sc) => sc.categoryId === localFilters.categoryId)
        : [];

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Filters</CardTitle>
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Date Preset */}
                            <div className="space-y-2">
                                <Label>Date Range</Label>
                                <Select
                                    value={localFilters.datePreset || "custom"}
                                    onValueChange={(value) =>
                                        handleDatePresetChange(value as DatePreset)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Today</SelectItem>
                                        <SelectItem value="weekly">This Week</SelectItem>
                                        <SelectItem value="monthly">This Month</SelectItem>
                                        <SelectItem value="custom">Custom Range</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Start Date (shown when custom or preset selected) */}
                            {(localFilters.datePreset === "custom" ||
                                !localFilters.datePreset) && (
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={localFilters.startDate || ""}
                                            onChange={(e) =>
                                                setLocalFilters({
                                                    ...localFilters,
                                                    startDate: e.target.value || undefined,
                                                    datePreset: "custom",
                                                })
                                            }
                                        />
                                    </div>
                                )}

                            {/* End Date (shown when custom or preset selected) */}
                            {(localFilters.datePreset === "custom" ||
                                !localFilters.datePreset) && (
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={localFilters.endDate || ""}
                                            onChange={(e) =>
                                                setLocalFilters({
                                                    ...localFilters,
                                                    endDate: e.target.value || undefined,
                                                    datePreset: "custom",
                                                })
                                            }
                                        />
                                    </div>
                                )}

                            {/* Transaction Type */}
                            <div className="space-y-2">
                                <Label>Transaction Type</Label>
                                <Select
                                    value={localFilters.transactionType || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            transactionType:
                                                value === "all" ? null : (value as "CREDIT" | "DEBIT"),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="CREDIT">Credit</SelectItem>
                                        <SelectItem value="DEBIT">Debit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select
                                    value={localFilters.paymentMethod || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            paymentMethod:
                                                value === "all"
                                                    ? null
                                                    : (value as "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER"),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="CARD">Card</SelectItem>
                                        <SelectItem value="ONLINE">Online</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Transaction Status */}
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={localFilters.status || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            status:
                                                value === "all"
                                                    ? null
                                                    : (value as "PENDING" | "COMPLETED" | "FAILED"),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="FAILED">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bank Account */}
                            <div className="space-y-2">
                                <Label>Bank Account</Label>
                                <Select
                                    value={localFilters.bankAccountId || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            bankAccountId: value === "all" ? null : value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accounts</SelectItem>
                                        {bankAccounts.map((account) => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={localFilters.categoryId || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            categoryId: value === "all" ? null : value,
                                            subCategoryId: null, // Reset subcategory when category changes
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
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
                            <div className="space-y-2">
                                <Label>Subcategory</Label>
                                <Select
                                    value={localFilters.subCategoryId || "all"}
                                    onValueChange={(value) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            subCategoryId: value === "all" ? null : value,
                                        })
                                    }
                                    disabled={!localFilters.categoryId || filteredSubCategories.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subcategories</SelectItem>
                                        {filteredSubCategories.map((subCategory) => (
                                            <SelectItem key={subCategory.id} value={subCategory.id}>
                                                {subCategory.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-6">
                            <Button onClick={handleApply}>Apply Filters</Button>
                            <Button variant="outline" onClick={handleClear}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

