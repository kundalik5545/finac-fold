"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import { Transaction } from "@/lib/schema/bank-account-types";

interface TransactionStatsProps {
    transactions: Transaction[];
}

/**
 * TransactionStats Component
 * Displays total income, total expense, and net balance cards
 */
export function TransactionStats({ transactions }: TransactionStatsProps) {
    const { formatCurrency } = useFormatCurrency("en-IN", "INR");

    // Calculate stats from transactions
    const stats = useMemo(() => {
        const income = transactions
            .filter((t) => t.transactionType === "CREDIT")
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter((t) => t.transactionType === "DEBIT")
            .reduce((sum, t) => sum + t.amount, 0);

        const netBalance = income - expense;

        return {
            income,
            expense,
            netBalance,
        };
    }, [transactions]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Income */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.income)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Total credit transactions
                    </p>
                </CardContent>
            </Card>

            {/* Total Expense */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(stats.expense)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Total debit transactions
                    </p>
                </CardContent>
            </Card>

            {/* Net Balance */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                    <TrendingUp
                        className={`h-4 w-4 ${stats.netBalance >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                    />
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-2xl font-bold ${stats.netBalance >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {formatCurrency(stats.netBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Income minus expense
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

