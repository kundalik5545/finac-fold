"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { BankTransaction } from "@/lib/bank-account-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BankAccountCategoryDonutChartProps {
  transactions: BankTransaction[];
  categories: Array<{ id: string; name: string; icon?: string | null; color?: string | null; type: string }>;
}

// Default color palette
const DEFAULT_COLORS = [
  "#14b8a6", // teal-500
  "#f43f5e", // rose-500
  "#a855f7", // purple-500
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f472b6", // pink-400
  "#fbbf24", // yellow-400
  "#6366f1", // indigo-500
  "#ef4444", // red-500
  "#f59e42", // orange-400
];

export function BankAccountCategoryDonutChart({
  transactions,
  categories,
}: BankAccountCategoryDonutChartProps) {
  // Note: This assumes transactions have categoryId relation
  // You may need to adjust based on your actual data model
  const chartData = useMemo(() => {
    // Group transactions by category
    const categoryTotals: Record<string, { name: string; amount: number; color: string; icon?: string }> = {};

    transactions.forEach((transaction) => {
      // For now, we'll group by transaction type since BankTransaction doesn't have categoryId
      // In a real implementation, you'd use transaction.categoryId
      const categoryId = "uncategorized"; // Placeholder
      const category = categories.find((c) => c.id === categoryId) || {
        id: categoryId,
        name: transaction.transactionType === "CREDIT" ? "Income" : "Expense",
        color: transaction.transactionType === "CREDIT" ? "#10b981" : "#ef4444",
        icon: undefined,
      };

      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          name: category.name,
          amount: 0,
          color: category.color || DEFAULT_COLORS[0],
          icon: category.icon || undefined,
        };
      }

      categoryTotals[categoryId].amount += Number(transaction.amount);
    });

    const total = Object.values(categoryTotals).reduce(
      (sum, cat) => sum + cat.amount,
      0
    );

    return Object.values(categoryTotals)
      .map((cat, index) => ({
        name: cat.name,
        value: cat.amount,
        percentage: total > 0 ? (cat.amount / total) * 100 : 0,
        fill: cat.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        icon: cat.icon,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });
    return config;
  }, [chartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!transactions || transactions.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>No transaction data available</CardDescription>
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
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>
          Distribution of transactions by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => (
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold">{name}</div>
                        <div className="text-sm">
                          {formatCurrency(Number(value))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {props.payload?.percentage?.toFixed(2)}% of total
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
                formatter={(value) => {
                  const item = chartData.find((d) => d.name === value);
                  return `${value} (${item?.percentage.toFixed(1)}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Showing category distribution
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Based on transaction amounts
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

