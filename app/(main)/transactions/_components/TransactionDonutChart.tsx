"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig,
} from "@/components/ui/chart";
import { Transaction } from "@/lib/schema/bank-account-types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Define colors for income and expense
const INCOME_COLOR = "#10b981"; // green-500
const EXPENSE_COLOR = "#ef4444"; // red-500

interface TransactionDonutChartProps {
    transactions: Transaction[];
}

/**
 * TransactionDonutChart Component
 * Shows Income vs Expense percentage distribution
 */
export function TransactionDonutChart({
    transactions,
}: TransactionDonutChartProps) {
    const chartData = useMemo(() => {
        const income = transactions
            .filter((t) => t.transactionType === "CREDIT")
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter((t) => t.transactionType === "DEBIT")
            .reduce((sum, t) => sum + t.amount, 0);

        const total = income + expense;
        const incomePercentage = total > 0 ? (income / total) * 100 : 0;
        const expensePercentage = total > 0 ? (expense / total) * 100 : 0;

        return [
            {
                name: "Income",
                value: income,
                percentage: incomePercentage,
                fill: INCOME_COLOR,
            },
            {
                name: "Expense",
                value: expense,
                percentage: expensePercentage,
                fill: EXPENSE_COLOR,
            },
        ];
    }, [transactions]);

    const chartConfig: ChartConfig = useMemo(
        () => ({
            Income: {
                label: "Income",
                color: INCOME_COLOR,
            },
            Expense: {
                label: "Expense",
                color: EXPENSE_COLOR,
            },
        }),
        []
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    if (!transactions || transactions.length === 0 || total === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Income vs Expense</CardTitle>
                    <CardDescription>Distribution of income and expense</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Income vs Expense</CardTitle>
                <CardDescription>Distribution of income and expense</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => (
                                            <div className="flex flex-col gap-1">
                                                <div className="font-semibold">{name}</div>
                                                <div className="text-sm">
                                                    {formatCurrency(Number(value))}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {chartData.find((d) => d.name === name)?.percentage.toFixed(2)}% of total
                                                </div>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                innerRadius={54}
                                label={({ name, percentage }) =>
                                    `${name}: ${percentage.toFixed(1)}%`
                                }
                                isAnimationActive={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                    <span className="text-sm">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

