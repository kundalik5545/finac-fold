"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TransactionTable } from "./TransactionTable";
import { Transaction, Category, BankAccount } from "@/lib/schema/bank-account-types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Plus, SlidersHorizontal, ChevronDown, Building2, ArrowUpDown, Tag, Calendar } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AddTransactionDialog } from "./AddTransactionDialog";
import type { TransactionFiltersState } from "./TransactionFilters";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionClientProps {
    initialTransactions: Transaction[];
    initialTotal: number;
    categories: Category[];
    subCategories: { id: string; name: string; categoryId: string }[];
    bankAccounts: BankAccount[];
}

const PAGE_SIZE = 10;

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
type DateRangePreset = "all" | "7d" | "30d" | "month";

export function TransactionClient({
    initialTransactions,
    initialTotal,
    categories,
    subCategories,
    bankAccounts,
}: TransactionClientProps) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [total, setTotal] = useState(initialTotal);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<TransactionFiltersState>({});
    const [sortOption, setSortOption] = useState<SortOption>("date-desc");
    const [showFilters, setShowFilters] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [localFilters, setLocalFilters] = useState<TransactionFiltersState>({});
    const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // Fetch transactions with current filters, search, sort, and pagination
    const fetchTransactions = useCallback(
        async (page: number = 1, filterState: TransactionFiltersState = filters, search: string = searchQuery, sort: SortOption = sortOption) => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                if (filterState.startDate) {
                    params.append("startDate", filterState.startDate);
                }
                if (filterState.endDate) {
                    params.append("endDate", filterState.endDate);
                }
                if (filterState.transactionType) {
                    params.append("transactionType", filterState.transactionType);
                }
                if (filterState.categoryId) {
                    params.append("categoryId", filterState.categoryId);
                }
                if (filterState.subCategoryId) {
                    params.append("subCategoryId", filterState.subCategoryId);
                }
                if (filterState.paymentMethod) {
                    params.append("paymentMethod", filterState.paymentMethod);
                }
                if (filterState.status) {
                    params.append("status", filterState.status);
                }
                if (filterState.bankAccountId) {
                    params.append("bankAccountId", filterState.bankAccountId);
                }
                if (search) {
                    params.append("search", search);
                }

                // Add sort
                if (sort === "date-desc") {
                    params.append("sortBy", "date");
                    params.append("sortOrder", "desc");
                } else if (sort === "date-asc") {
                    params.append("sortBy", "date");
                    params.append("sortOrder", "asc");
                } else if (sort === "amount-desc") {
                    params.append("sortBy", "amount");
                    params.append("sortOrder", "desc");
                } else if (sort === "amount-asc") {
                    params.append("sortBy", "amount");
                    params.append("sortOrder", "asc");
                }

                params.append("skip", String((page - 1) * PAGE_SIZE));
                params.append("take", String(PAGE_SIZE));

                const response = await fetch(`/api/transactions?${params.toString()}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch transactions");
                }

                const data = await response.json();
                setTransactions(data.transactions || []);
                setTotal(data.total || 0);
                setCurrentPage(page);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                toast.error("Failed to load transactions");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Handle date range preset change
    const handleDateRangeChange = useCallback((preset: DateRangePreset) => {
        setDateRangePreset(preset);
        const newFilters = { ...filters };

        if (preset === "all") {
            delete newFilters.startDate;
            delete newFilters.endDate;
        } else if (preset === "7d") {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            newFilters.startDate = startDate.toISOString().split("T")[0];
            newFilters.endDate = endDate.toISOString().split("T")[0];
        } else if (preset === "30d") {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
            newFilters.startDate = startDate.toISOString().split("T")[0];
            newFilters.endDate = endDate.toISOString().split("T")[0];
        } else if (preset === "month") {
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            newFilters.startDate = startDate.toISOString().split("T")[0];
            newFilters.endDate = endDate.toISOString().split("T")[0];
        }

        setFilters(newFilters);
        setCurrentPage(1);
        fetchTransactions(1, newFilters, searchQuery, sortOption);
    }, [filters, searchQuery, sortOption, fetchTransactions]);

    // Handle status change
    const handleStatusChange = useCallback((status: string) => {
        setSelectedStatus(status);
        const newFilters = { ...filters };
        if (status === "all") {
            delete newFilters.status;
        } else {
            newFilters.status = status as "PENDING" | "COMPLETED" | "FAILED";
        }
        setFilters(newFilters);
        setCurrentPage(1);
        fetchTransactions(1, newFilters, searchQuery, sortOption);
    }, [filters, searchQuery, sortOption, fetchTransactions]);

    // Handle payment method change
    const handlePaymentMethodChange = useCallback((method: string) => {
        setSelectedPaymentMethod(method);
        const newFilters = { ...filters };
        if (method === "all") {
            delete newFilters.paymentMethod;
        } else {
            newFilters.paymentMethod = method as "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER";
        }
        setFilters(newFilters);
        setCurrentPage(1);
        fetchTransactions(1, newFilters, searchQuery, sortOption);
    }, [filters, searchQuery, sortOption, fetchTransactions]);

    // Handle category selection
    const handleCategorySelect = useCallback((categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
        const newFilters = { ...filters };
        if (categoryId) {
            newFilters.categoryId = categoryId;
        } else {
            delete newFilters.categoryId;
            delete newFilters.subCategoryId;
        }
        setFilters(newFilters);
        setCurrentPage(1);
        fetchTransactions(1, newFilters, searchQuery, sortOption);
    }, [filters, searchQuery, sortOption, fetchTransactions]);

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchTransactions(1, filters, searchQuery, sortOption);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Handle clear all filters
    const handleClearAll = useCallback(() => {
        const cleared: TransactionFiltersState = {};
        setFilters(cleared);
        setLocalFilters(cleared);
        setDateRangePreset("all");
        setSelectedStatus("all");
        setSelectedPaymentMethod("all");
        setSelectedCategoryId(null);
        setSearchQuery("");
        setCurrentPage(1);
        fetchTransactions(1, cleared, "", sortOption);
    }, [fetchTransactions, sortOption]);

    // Handle apply filters from inline form
    const handleApplyFilters = useCallback(() => {
        setFilters(localFilters);
        setCurrentPage(1);
        fetchTransactions(1, localFilters, searchQuery, sortOption);
        setShowFilters(false);
    }, [localFilters, searchQuery, sortOption, fetchTransactions]);

    // Sync local filters with main filters
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Handle page change
    const handlePageChange = useCallback(
        (page: number) => {
            fetchTransactions(page, filters, searchQuery, sortOption);
        },
        [fetchTransactions, filters, searchQuery, sortOption]
    );

    // Handle delete transaction
    const handleDelete = useCallback(async (transactionId: string) => {
        try {
            const response = await fetch(`/api/transactions/${transactionId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete transaction");
            }

            // Refresh transactions
            await fetchTransactions(currentPage, filters, searchQuery, sortOption);
            toast.success("Transaction deleted successfully");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            toast.error("Failed to delete transaction");
        }
    }, [fetchTransactions, currentPage, filters, searchQuery, sortOption]);

    // Export CSV - includes all active filters
    const handleExportCSV = useCallback(async () => {
        const toastId = "export-toast";
        try {
            toast.loading("Preparing export...", { id: toastId });

            const params = new URLSearchParams();

            // Build complete filter state from all sources
            const exportFilters: TransactionFiltersState = { ...filters };

            // Add date range from preset if not "all"
            if (dateRangePreset !== "all") {
                if (dateRangePreset === "7d") {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 7);
                    exportFilters.startDate = startDate.toISOString().split("T")[0];
                    exportFilters.endDate = endDate.toISOString().split("T")[0];
                } else if (dateRangePreset === "30d") {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 30);
                    exportFilters.startDate = startDate.toISOString().split("T")[0];
                    exportFilters.endDate = endDate.toISOString().split("T")[0];
                } else if (dateRangePreset === "month") {
                    const today = new Date();
                    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    exportFilters.startDate = startDate.toISOString().split("T")[0];
                    exportFilters.endDate = endDate.toISOString().split("T")[0];
                }
            }

            // Add status filter if not "all"
            if (selectedStatus !== "all") {
                exportFilters.status = selectedStatus as "PENDING" | "COMPLETED" | "FAILED";
            }

            // Add payment method filter if not "all"
            if (selectedPaymentMethod !== "all") {
                exportFilters.paymentMethod = selectedPaymentMethod as "CASH" | "UPI" | "CARD" | "ONLINE" | "OTHER";
            }

            // Add category filter if selected
            if (selectedCategoryId) {
                exportFilters.categoryId = selectedCategoryId;
            }

            // Add all filters to params
            Object.entries(exportFilters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    params.append(key, String(value));
                }
            });

            // Add search query
            if (searchQuery) {
                params.append("search", searchQuery);
            }

            // Add sort parameters
            if (sortOption === "date-desc") {
                params.append("sortBy", "date");
                params.append("sortOrder", "desc");
            } else if (sortOption === "date-asc") {
                params.append("sortBy", "date");
                params.append("sortOrder", "asc");
            } else if (sortOption === "amount-desc") {
                params.append("sortBy", "amount");
                params.append("sortOrder", "desc");
            } else if (sortOption === "amount-asc") {
                params.append("sortBy", "amount");
                params.append("sortOrder", "asc");
            }

            toast.loading("Exporting transactions...", { id: toastId });

            const response = await fetch(`/api/transactions/export?${params.toString()}`);

            if (!response.ok) {
                let errorMessage = "Failed to export transactions";
                try {
                    const contentType = response.headers.get("content-type") || "";
                    if (contentType.includes("application/json")) {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } else {
                        const text = await response.text();
                        errorMessage = text || errorMessage;
                    }
                } catch (parseError) {
                    console.error("Error parsing error response:", parseError);
                    errorMessage = `Failed to export (${response.status} ${response.statusText})`;
                }
                toast.dismiss(toastId);
                toast.error(errorMessage);
                return;
            }

            // Get the CSV content as blob
            const blob = await response.blob();

            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            toast.dismiss(toastId);
            toast.success("Transactions exported successfully");
        } catch (error) {
            console.error("Error exporting transactions:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to export transactions";
            toast.dismiss(toastId);
            toast.error(errorMessage);
        }
    }, [filters, searchQuery, sortOption, dateRangePreset, selectedStatus, selectedPaymentMethod, selectedCategoryId]);

    // Count active filters
    const activeFiltersCount = useMemo(() => {
        let count = Object.values(filters).filter(v => v !== null && v !== undefined && v !== "").length;
        // Also count search query and dropdown selections
        if (searchQuery) count += 1;
        if (dateRangePreset !== "all") count += 1;
        if (selectedStatus !== "all") count += 1;
        if (selectedPaymentMethod !== "all") count += 1;
        if (selectedCategoryId) count += 1;
        return count;
    }, [filters, searchQuery, dateRangePreset, selectedStatus, selectedPaymentMethod, selectedCategoryId]);

    const hasActiveFilters = activeFiltersCount > 0;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor your financial activity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleExportCSV}
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => setShowAddDialog(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add New
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col gap-4 bg-card p-1 rounded-xl border border-border shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 p-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search transactions..."
                            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Date Range Dropdown */}
                        <div className="relative group">
                            <Select value={dateRangePreset} onValueChange={(value) => handleDateRangeChange(value as DateRangePreset)}>
                                <SelectTrigger className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="7d">Last 7 Days</SelectItem>
                                    <SelectItem value="30d">Last 30 Days</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                </SelectContent>
                            </Select>
                            <Calendar className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Status Dropdown */}
                        <div className="relative">
                            <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Payment Method Dropdown */}
                        <div className="relative">
                            <Select value={selectedPaymentMethod} onValueChange={handlePaymentMethodChange}>
                                <SelectTrigger className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="ONLINE">Online</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

                        <Button
                            variant="outline"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border bg-primary/10 text-primary border-primary/20"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            More Filters
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>

                        {hasActiveFilters && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Inline Filters Section */}
                {showFilters && (
                    <div className="border-t border-border p-4 bg-muted/30 rounded-b-lg animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-6">
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
                                                    setLocalFilters({ ...localFilters, startDate: e.target.value || undefined })
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
                                                    setLocalFilters({ ...localFilters, endDate: e.target.value || undefined })
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
                                                        subCategoryId: null,
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
                                        {localFilters.categoryId && (() => {
                                            const selectedCategory = categories.find(c => c.id === localFilters.categoryId);
                                            const availableSubCategories = selectedCategory
                                                ? subCategories.filter(sc => sc.categoryId === selectedCategory.id)
                                                : [];

                                            if (availableSubCategories.length === 0) return null;

                                            return (
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
                                            );
                                        })()}

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

                            {/* Apply Filters Button */}
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setLocalFilters(filters);
                                        setShowFilters(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleApplyFilters}>
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Filter Chips - Always visible for now, can be made toggleable */}
                {categories.length > 0 && (
                    <div className="border-t border-border p-3 bg-muted/30 rounded-b-lg animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleCategorySelect(null)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedCategoryId === null
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                                        }`}
                                >
                                    All
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategorySelect(category.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedCategoryId === category.id
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                                            }`}
                                    >
                                        {category.icon && <span className="mr-1">{category.icon}</span>}
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <TransactionTable
                transactions={transactions}
                total={total}
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
                onDelete={handleDelete}
                loading={loading}
                sortOption={sortOption}
                onSortChange={(sort) => {
                    setSortOption(sort);
                    setCurrentPage(1);
                    fetchTransactions(1, filters, searchQuery, sort);
                }}
            />

            {/* Add Transaction Dialog */}
            <AddTransactionDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                categories={categories}
                bankAccounts={bankAccounts}
                onSuccess={() => {
                    // Refresh transactions after successful creation
                    fetchTransactions(currentPage, filters, searchQuery, sortOption);
                }}
            />
        </div>
    );
}
