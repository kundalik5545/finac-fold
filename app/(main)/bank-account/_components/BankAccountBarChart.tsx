"use client";

import { useMemo, useEffect, useState } from "react";
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
import { BankAccount, BankTransaction } from "@/lib/bank-account-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BankAccountBarChart({ bankAccounts }: { bankAccounts: BankAccount[] }) {
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

  const { chartData, chartConfig } = useMemo(() => {
    const data = bankAccounts.map((account) => ({
      name: account.name.length > 10 ? account.name.substring(0, 10) + "..." : account.name,
      fullName: account.name,
      "Weekly": weeklySpending[account.id] || 0,
      "Monthly": monthlySpending[account.id] || 0,
    }));

    const config: ChartConfig = {
      "Weekly": {
        label: "Weekly Spending",
        color: "hsl(var(--chart-1))",
      },
      "Monthly": {
        label: "Monthly Spending",
        color: "hsl(var(--chart-2))",
      },
    };

    return { chartData: data, chartConfig: config };
  }, [bankAccounts, weeklySpending, monthlySpending]);

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
          <CardTitle>Weekly vs Monthly Spending</CardTitle>
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

  if (!bankAccounts || bankAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly vs Monthly Spending</CardTitle>
          <CardDescription>Comparison of spending periods</CardDescription>
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
        <CardTitle>Weekly vs Monthly Spending</CardTitle>
        <CardDescription>
          Comparison of spending across accounts (last 7 days vs last 30 days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold">{name}</div>
                        <div className="text-sm">{formatCurrency(Number(value))}</div>
                      </div>
                    )}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullName;
                      }
                      return label;
                    }}
                  />
                }
              />
              <Legend />
              <Bar
                dataKey="Weekly"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Monthly"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Comparing weekly and monthly spending
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Visual comparison across all bank accounts
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

