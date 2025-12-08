"use client";

import { useMemo } from "react";
import {
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from "recharts";
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
import {
    groupTransactionsByDate,
    formatDateForChart,
    type DatePreset,
} from "@/lib/utils/transaction-utils";

interface TransactionBarChartProps {
    transactions: Transaction[];
    datePreset?: DatePreset;
}

/**
 * TransactionBarChart Component
 * Shows transaction amounts over time with separate bars for Income and Expense
 */
export function TransactionBarChart({
    transactions,
    datePreset = "monthly",
}: TransactionBarChartProps) {
    // Determine grouping based on date preset
    const groupBy = useMemo(() => {
        switch (datePreset) {
            case "daily":
                return "day" as const;
            case "weekly":
                return "week" as const;
            case "monthly":
                return "month" as const;
            case "custom":
                // For custom ranges, determine based on date span
                if (transactions.length > 0) {
                    const dates = transactions.map((t) => new Date(t.date));
                    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
                    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
                    const daysDiff = Math.ceil(
                        (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (daysDiff <= 30) {
                        return "day" as const;
                    } else if (daysDiff <= 90) {
                        return "week" as const;
                    } else {
                        return "month" as const;
                    }
                }
                return "month" as const;
            default:
                return "month" as const;
        }
    }, [datePreset, transactions]);

    const chartData = useMemo(() => {
        const grouped = groupTransactionsByDate(transactions, groupBy);

        return grouped.map((item) => ({
            date: formatDateForChart(item.date, groupBy),
            Income: item.income,
            Expense: item.expense,
        }));
    }, [transactions, groupBy]);

    const chartConfig: ChartConfig = useMemo(
        () => ({
            Income: {
                label: "Income",
                color: "hsl(var(--chart-1))",
            },
            Expense: {
                label: "Expense",
                color: "hsl(var(--chart-2))",
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

    if (!transactions || transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Transactions Over Time</CardTitle>
                    <CardDescription>Income and expense trends</CardDescription>
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
                <CardTitle>Transactions Over Time</CardTitle>
                <CardDescription>Income and expense trends</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) {
                                        return `₹${(value / 1000000).toFixed(1)}M`;
                                    } else if (value >= 1000) {
                                        return `₹${(value / 1000).toFixed(1)}K`;
                                    }
                                    return `₹${value}`;
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => [
                                            formatCurrency(Number(value)),
                                            name,
                                        ]}
                                    />
                                }
                            />
                            <Legend />
                            <Bar dataKey="Income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Expense" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

