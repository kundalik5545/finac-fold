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
import { Button } from "@/components/ui/button";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal, Edit, Trash, ArrowDownUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Transaction } from "@/lib/schema/bank-account-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionTableProps {
    transactions: Transaction[];
    total: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => Promise<void>;
    loading?: boolean;
    sortOption?: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
    onSortChange?: (sort: "date-desc" | "date-asc" | "amount-desc" | "amount-asc") => void;
}

export function TransactionTable({
    transactions,
    total,
    currentPage,
    pageSize,
    onPageChange,
    onDelete,
    loading = false,
    sortOption = "date-desc",
    onSortChange,
}: TransactionTableProps) {
    const { formatCurrency } = useFormatCurrency("en-US", "USD");
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return {
            date: d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
        };
    };

    const formatPaymentMethod = (method: string | null | undefined) => {
        if (!method) return "—";
        const methodMap: Record<string, string> = {
            CASH: "Cash",
            UPI: "UPI",
            CARD: "Credit Card",
            ONLINE: "Bank Transfer",
            OTHER: "Other",
        };
        return methodMap[method] || method;
    };

    const getPaymentMethodColor = (method: string | null | undefined) => {
        if (!method) return "bg-primary";
        const colorMap: Record<string, string> = {
            CASH: "bg-amber-500",
            UPI: "bg-blue-500",
            CARD: "bg-primary",
            ONLINE: "bg-amber-500",
            OTHER: "bg-gray-500",
        };
        return colorMap[method] || "bg-primary";
    };

    const handleDelete = async (transactionId: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) {
            return;
        }

        setDeletingId(transactionId);
        try {
            await onDelete(transactionId);
        } catch (error) {
            toast.error("Failed to delete transaction");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (transactionId: string) => {
        router.push(`/transactions/edit/${transactionId}`);
    };

    const handleSort = (field: "date" | "amount") => {
        if (!onSortChange) return;

        if (field === "date") {
            if (sortOption === "date-desc") {
                onSortChange("date-asc");
            } else {
                onSortChange("date-desc");
            }
        } else if (field === "amount") {
            if (sortOption === "amount-desc") {
                onSortChange("amount-asc");
            } else {
                onSortChange("amount-desc");
            }
        }
    };

    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, total);

    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-8 text-center">
                    <p className="text-muted-foreground">Loading transactions...</p>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-8 text-center">
                    <p className="text-muted-foreground">
                        No transactions found. Add your first transaction to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border bg-muted/50 text-left">
                            <TableHead className="h-12 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors group">
                                <div className="flex items-center gap-1" onClick={() => handleSort("date")}>
                                    Date
                                    {onSortChange && (
                                        <ArrowDownUp className="h-3 w-3 transition-opacity opacity-0 group-hover:opacity-50" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="h-12 px-4 font-medium text-muted-foreground">Description</TableHead>
                            <TableHead className="h-12 px-4 font-medium text-muted-foreground">Category</TableHead>
                            <TableHead className="h-12 px-4 font-medium text-muted-foreground hidden md:table-cell">Method</TableHead>
                            <TableHead className="h-12 px-4 font-medium text-muted-foreground">Status</TableHead>
                            <TableHead className="h-12 px-4 font-medium text-muted-foreground text-right cursor-pointer hover:text-foreground transition-colors group">
                                <div className="flex items-center justify-end gap-1" onClick={() => handleSort("amount")}>
                                    Amount
                                    {onSortChange && (
                                        <ArrowDownUp className="h-3 w-3 transition-opacity opacity-0 group-hover:opacity-50" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="h-12 px-4 font-medium text-muted-foreground w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => {
                            const isCredit = transaction.transactionType === "CREDIT";
                            const dateInfo = formatDate(transaction.date);
                            const paymentMethod = formatPaymentMethod(transaction.paymentMethod);
                            const paymentColor = getPaymentMethodColor(transaction.paymentMethod);

                            return (
                                <TableRow
                                    key={transaction.id}
                                    className="border-b border-border hover:bg-muted/50 transition-colors group"
                                >
                                    <TableCell className="p-4 align-middle font-medium text-muted-foreground whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-foreground">{dateInfo.date}</span>
                                            <span className="text-xs font-normal opacity-70">{dateInfo.day}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle font-medium">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-10 w-10 rounded-full flex items-center justify-center border shrink-0 transition-colors ${isCredit
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/20"
                                                    : "bg-red-500/10 border-red-500/20 text-red-500 group-hover:bg-red-500/20"
                                                    }`}
                                            >
                                                {isCredit ? (
                                                    <ArrowUpRight className="h-5 w-5" />
                                                ) : (
                                                    <ArrowDownRight className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[200px] sm:max-w-xs">
                                                    {transaction.description || "-"}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-normal md:hidden">
                                                    {paymentMethod}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle">
                                        {transaction.category ? (
                                            <span className="inline-flex items-center rounded-md border border-border px-2.5 py-1 text-xs font-medium bg-background text-muted-foreground">
                                                {transaction.category.icon && <span className="mr-1">{transaction.category.icon}</span>}
                                                {transaction.category.name}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="p-4 align-middle text-muted-foreground hidden md:table-cell">
                                        <span className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full ${paymentColor}`}></div>
                                            {paymentMethod}
                                        </span>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle">
                                        {transaction.status === "COMPLETED" ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Completed
                                            </span>
                                        ) : transaction.status === "PENDING" ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-amber-500/5 text-amber-600 border-amber-500/20">
                                                <Clock className="h-3 w-3" />
                                                Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-red-500/5 text-red-600 border-red-500/20">
                                                <XCircle className="h-3 w-3" />
                                                Failed
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell
                                        className={`p-4 align-middle text-right font-semibold whitespace-nowrap ${isCredit ? "text-emerald-600" : "text-foreground"
                                            }`}
                                    >
                                        {isCredit ? "+" : "-"}
                                        {formatCurrency(Math.abs(transaction.amount))}
                                    </TableCell>
                                    <TableCell className="p-4 align-middle text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-background hover:shadow-sm border border-transparent hover:border-border transition-all text-muted-foreground hover:text-foreground"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(transaction.id)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(transaction.id)}
                                                    disabled={deletingId === transaction.id}
                                                    className="text-red-600"
                                                >
                                                    <Trash className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-muted/10">
                <div className="text-sm text-muted-foreground">
                    Showing <strong>{startIndex}-{endIndex}</strong> of <strong>{total}</strong> transactions
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-3 py-1.5 border border-border rounded-md bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-3 py-1.5 border border-border rounded-md bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
