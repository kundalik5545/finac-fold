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
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { BankTransaction } from "@/lib/schema/bank-account-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface BankAccountTransactionTableProps {
  transactions: BankTransaction[];
  categories: any[];
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by transaction type
    if (filterType !== "ALL") {
      filtered = filtered.filter((t) => t.transactionType === filterType);
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.transactionDate);
        return transactionDate >= dateRange.from!;
      });
    }

    if (dateRange.to) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.transactionDate);
        return transactionDate <= dateRange.to!;
      });
    }

    return filtered;
  }, [transactions, searchQuery, filterType, dateRange]);

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

  // Get category icon (placeholder - you may need to map this based on your data)
  const getCategoryIcon = (description: string | null) => {
    if (!description) return "💰";
    const desc = description.toLowerCase();
    if (desc.includes("grocery") || desc.includes("food")) return "🛒";
    if (desc.includes("salary") || desc.includes("income")) return "👤";
    if (desc.includes("netflix") || desc.includes("entertainment")) return "📺";
    if (desc.includes("uber") || desc.includes("transport")) return "🚗";
    if (desc.includes("amazon") || desc.includes("shopping")) return "🛍️";
    if (desc.includes("freelance") || desc.includes("payment")) return "💼";
    return "💰";
  };

  // Determine status (BankTransaction doesn't have status, so we'll default to COMPLETED)
  const getStatus = () => "COMPLETED";

  if (transactions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("ALL")}
            >
              All
            </Button>
            <Button
              variant={filterType === "CREDIT" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("CREDIT")}
            >
              Credit
            </Button>
            <Button
              variant={filterType === "DEBIT" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("DEBIT")}
            >
              Debit
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
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
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("ALL")}
          >
            All
          </Button>
          <Button
            variant={filterType === "CREDIT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("CREDIT")}
          >
            Credit
          </Button>
          <Button
            variant={filterType === "DEBIT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("DEBIT")}
          >
            Debit
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => {
              const isCredit = transaction.transactionType === "CREDIT";
              const status = getStatus();

              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                  <TableCell>
                    {transaction.description || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getCategoryIcon(transaction.description)}
                      </span>
                      <span className="text-sm">
                        {transaction.description
                          ? transaction.description.split(" ")[0]
                          : "Other"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${isCredit ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {isCredit ? "+" : "-"} {formatCurrency(Number(transaction.amount))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={status === "COMPLETED" ? "default" : "secondary"}
                      className={
                        status === "COMPLETED"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }
                    >
                      {status}
                    </Badge>
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

