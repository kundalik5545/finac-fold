"use client";

import { useState, useEffect, useCallback } from "react";
import { TransactionFilters, type TransactionFiltersState } from "./TransactionFilters";
import { TransactionTable } from "./TransactionTable";
import { TransactionDonutChart } from "./TransactionDonutChart";
import { TransactionBarChart } from "./TransactionBarChart";
import { TransactionStats } from "./TransactionStats";
import { Transaction, Category, BankAccount } from "@/lib/schema/bank-account-types";
import { toast } from "sonner";

interface TransactionClientProps {
    initialTransactions: Transaction[];
    initialTotal: number;
    categories: Category[];
    subCategories: { id: string; name: string; categoryId: string }[];
    bankAccounts: BankAccount[];
}

const PAGE_SIZE = 5;

/**
 * TransactionClient Component
 * Manages view state, filters, pagination, and renders all transaction components
 */
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
    const [filters, setFilters] = useState<TransactionFiltersState>({
        datePreset: "monthly",
    });

    // Fetch transactions with current filters and pagination
    const fetchTransactions = useCallback(
        async (page: number = 1, filterState: TransactionFiltersState = filters) => {
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

    // Handle filter changes
    const handleApplyFilters = useCallback(
        (newFilters: TransactionFiltersState) => {
            setFilters(newFilters);
            setCurrentPage(1);
            fetchTransactions(1, newFilters);
        },
        [fetchTransactions]
    );

    // Handle clear filters
    const handleClearFilters = useCallback(() => {
        const clearedFilters: TransactionFiltersState = {
            datePreset: "monthly",
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        fetchTransactions(1, clearedFilters);
    }, [fetchTransactions]);

    // Handle page change
    const handlePageChange = useCallback(
        (page: number) => {
            fetchTransactions(page, filters);
        },
        [fetchTransactions, filters]
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
            await fetchTransactions(currentPage, filters);
        } catch (error) {
            console.error("Error deleting transaction:", error);
            throw error;
        }
    }, [fetchTransactions, currentPage, filters]);

    // Initial load with monthly preset - handled by parent component

    return (
        <div className="space-y-6">
            {/* Filters */}
            <TransactionFilters
                filters={filters}
                categories={categories}
                subCategories={subCategories}
                bankAccounts={bankAccounts}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />

            {/* Stats */}
            <TransactionStats transactions={transactions} />

            {/* Charts */}
            {transactions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TransactionDonutChart transactions={transactions} />
                    <TransactionBarChart
                        transactions={transactions}
                        datePreset={filters.datePreset}
                    />
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <p className="text-muted-foreground">Loading transactions...</p>
                </div>
            ) : (
                <TransactionTable
                    transactions={transactions}
                    total={total}
                    currentPage={currentPage}
                    pageSize={PAGE_SIZE}
                    onPageChange={handlePageChange}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}

