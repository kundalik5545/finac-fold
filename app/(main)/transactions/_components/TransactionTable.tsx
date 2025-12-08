"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Transaction } from "@/lib/schema/bank-account-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface TransactionTableProps {
    transactions: Transaction[];
    total: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => Promise<void>;
}

/**
 * TransactionTable Component
 * Displays transactions in a table format with pagination
 */
export function TransactionTable({
    transactions,
    total,
    currentPage,
    pageSize,
    onPageChange,
    onDelete,
}: TransactionTableProps) {
    const { formatCurrency } = useFormatCurrency("en-IN", "INR");
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleDelete = async (transactionId: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) {
            return;
        }

        setDeletingId(transactionId);
        try {
            await onDelete(transactionId);
            toast.success("Transaction deleted successfully");
        } catch (error) {
            toast.error("Failed to delete transaction");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (transactionId: string) => {
        router.push(`/transactions/edit/${transactionId}`);
    };

    const totalPages = Math.ceil(total / pageSize);

    if (transactions.length === 0) {
        return (
            <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-muted-foreground">
                    No transactions found. Add your first transaction to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Bank Account</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => {
                            const isCredit = transaction.transactionType === "CREDIT";
                            return (
                                <TableRow key={transaction.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDate(transaction.date)}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {transaction.description || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {transaction.category?.icon && (
                                                <span>{transaction.category.icon}</span>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {transaction.category?.name || "—"}
                                                </span>
                                                {transaction.subCategory?.name && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {transaction.subCategory.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={isCredit ? "default" : "destructive"}>
                                            {transaction.transactionType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        className={`text-right font-semibold whitespace-nowrap ${isCredit ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {isCredit ? "+" : "-"}
                                        {formatCurrency(transaction.amount)}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.paymentMethod ? (
                                            <Badge variant="outline">{transaction.paymentMethod}</Badge>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                transaction.status === "COMPLETED"
                                                    ? "default"
                                                    : transaction.status === "FAILED"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {transaction.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {transaction.bankAccount?.name || "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(transaction.id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleDelete(transaction.id)}
                                                disabled={deletingId === transaction.id}
                                            >
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, total)} of {total} transactions
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                                    className={
                                        currentPage === 1
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Show first page, last page, current page, and pages around current
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => onPageChange(page)}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return (
                                        <PaginationItem key={page}>
                                            <span className="px-2">...</span>
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        currentPage < totalPages && onPageChange(currentPage + 1)
                                    }
                                    className={
                                        currentPage === totalPages
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}

