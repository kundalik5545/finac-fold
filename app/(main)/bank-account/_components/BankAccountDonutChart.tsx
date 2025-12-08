"use client";

import { useMemo, useEffect, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { BankAccount, BankTransaction } from "@/lib/bank-account-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define color palette for accounts
const PIE_COLORS = [
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
  "#8b5cf6", // violet-500
  "#22d3ee", // cyan-400
];

export function BankAccountDonutChart({ bankAccounts }: { bankAccounts: BankAccount[] }) {
  const [weeklySpending, setWeeklySpending] = useState<Record<string, number>>({});
  const [monthlySpending, setMonthlySpending] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpendingData() {
      if (bankAccounts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const weekly: Record<string, number> = {};
        const monthly: Record<string, number> = {};

        // Calculate date ranges
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);

        // Fetch transactions for each account
        for (const account of bankAccounts) {
          try {
            const response = await fetch(`/api/bank-account/${account.id}/transactions`);
            if (!response.ok) continue;
            
            let data: any = {};
            try {
              const text = await response.text();
              if (text) {
                data = JSON.parse(text);
              }
            } catch {
              continue; // Skip if parsing fails
            }
            const transactions: BankTransaction[] = data.transactions || [];

            // Calculate weekly spending (DEBIT only)
            const weeklyDebits = transactions.filter((t) => {
              const date = new Date(t.transactionDate);
              return date >= weekAgo && t.transactionType === "DEBIT";
            });
            weekly[account.id] = weeklyDebits.reduce(
              (sum, t) => sum + Number(t.amount || 0),
              0
            );

            // Calculate monthly spending (DEBIT only)
            const monthlyDebits = transactions.filter((t) => {
              const date = new Date(t.transactionDate);
              return date >= monthAgo && t.transactionType === "DEBIT";
            });
            monthly[account.id] = monthlyDebits.reduce(
              (sum, t) => sum + Number(t.amount || 0),
              0
            );
          } catch (err) {
            console.error(`Error fetching transactions for account ${account.id}:`, err);
          }
        }

        setWeeklySpending(weekly);
        setMonthlySpending(monthly);
      } catch (error) {
        console.error("Error fetching spending data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpendingData();
  }, [bankAccounts]);

  // Calculate data for donut chart - showing distribution by monthly spending
  const chartData = useMemo(() => {
    const totalMonthly = Object.values(monthlySpending).reduce((sum, val) => sum + val, 0);

    return bankAccounts
      .filter((account) => monthlySpending[account.id] > 0)
      .map((account, index) => {
        const value = monthlySpending[account.id] || 0;
        const percentage = totalMonthly > 0 ? (value / totalMonthly) * 100 : 0;

        return {
          name: account.name,
          value: value,
          percentage: percentage,
          fill: account.color || PIE_COLORS[index % PIE_COLORS.length],
        };
      });
  }, [bankAccounts, monthlySpending]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};

    bankAccounts.forEach((account, index) => {
      config[account.name] = {
        label: account.name,
        color: account.color || PIE_COLORS[index % PIE_COLORS.length],
      };
    });

    return config;
  }, [bankAccounts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Distribution</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bankAccounts || bankAccounts.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Distribution</CardTitle>
          <CardDescription>Distribution of spending by account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
            No spending data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending Distribution</CardTitle>
        <CardDescription>
          Distribution of spending by account (last 30 days)
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
              Showing monthly spending distribution
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Based on debit transactions from the last 30 days
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

