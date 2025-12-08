"use client";

import { useState, useMemo } from "react";
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
import { BankTransaction } from "@/lib/bank-account-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TransactionFilters } from "./TransactionFilters";
import { Category } from "@/lib/bank-account-types";

interface BankAccountTransactionTableProps {
  transactions: BankTransaction[];
  categories: Category[];
  subCategories: { id: string; name: string; categoryId: string }[];
  bankAccountId: string;
}

export function BankAccountTransactionTable({
  transactions,
  categories,
  subCategories,
  bankAccountId,
}: BankAccountTransactionTableProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    transactionType?: "CREDIT" | "DEBIT" | null;
    categoryId?: string | null;
    subCategoryId?: string | null;
  }>({});

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter transactions based on filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.transactionDate);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.transactionDate);
        return transactionDate <= endDate;
      });
    }

    // Filter by transaction type
    if (filters.transactionType) {
      filtered = filtered.filter((t) => t.transactionType === filters.transactionType);
    }

    // Note: Category and subcategory filtering would require transactions to have category/subcategory relations
    // This is a simplified version - you may need to adjust based on your data model

    return filtered;
  }, [transactions, filters]);

  const handleDelete = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/bank-account/${bankAccountId}/transactions/${transactionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Transaction deleted successfully");
        router.refresh();
      } else {
        let errorData: any = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch {
          // If parsing fails, use default error message
        }
        toast.error(errorData.error || "Failed to delete transaction");
      }
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="space-y-4">
        <TransactionFilters
          filters={filters}
          categories={categories}
          subCategories={subCategories}
          onApplyFilters={setFilters}
          onClearFilters={() => setFilters({})}
        />
        <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-muted-foreground">
            No transactions found. Add your first transaction to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TransactionFilters
        filters={filters}
        categories={categories}
        subCategories={subCategories}
        onApplyFilters={setFilters}
        onClearFilters={() => setFilters({})}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => {
              const isCredit = transaction.transactionType === "CREDIT";
              return (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                  <TableCell>
                    <Badge variant={isCredit ? "default" : "destructive"}>
                      {transaction.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.description || "—"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${isCredit ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(Number(transaction.amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(transaction.currentBalance))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info("Edit functionality coming soon");
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(transaction.id)}
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

      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-muted-foreground">
            No transactions match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}

