"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BankAccountLineChartProps {
  transactions: BankTransaction[];
}

type TimePeriod = "daily" | "weekly" | "monthly" | "all";

export function BankAccountLineChart({ transactions }: BankAccountLineChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("monthly");

  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    // Group transactions by period
    const grouped: Record<string, { credit: number; debit: number; balance: number }> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      let key: string;

      switch (period) {
        case "daily":
          key = date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          break;
        case "weekly":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Week of ${weekStart.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          })}`;
          break;
        case "monthly":
          key = date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
          });
          break;
        default:
          key = "All";
      }

      if (!grouped[key]) {
        grouped[key] = { credit: 0, debit: 0, balance: 0 };
      }

      if (transaction.transactionType === "CREDIT") {
        grouped[key].credit += Number(transaction.amount);
      } else {
        grouped[key].debit += Number(transaction.amount);
      }

      // Use the current balance from the transaction
      grouped[key].balance = Number(transaction.currentBalance);
    });

    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([name, data]) => ({
        name,
        Credit: data.credit,
        Debit: data.debit,
        Balance: data.balance,
      }))
      .sort((a, b) => {
        // Simple sorting - for production, you'd want proper date parsing
        return a.name.localeCompare(b.name);
      });
  }, [transactions, period]);

  const chartConfig: ChartConfig = {
    Credit: {
      label: "Credit",
      color: "hsl(142, 76%, 36%)", // green-600
    },
    Debit: {
      label: "Debit",
      color: "hsl(0, 84%, 60%)", // red-500
    },
    Balance: {
      label: "Balance",
      color: "hsl(221, 83%, 53%)", // blue-600
    },
  };

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
          <CardTitle>Transaction Trends</CardTitle>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction Trends</CardTitle>
            <CardDescription>
              Track your transaction patterns over time
            </CardDescription>
          </div>
          <Select value={period} onValueChange={(value) => setPeriod(value as TimePeriod)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
                  />
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Credit"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Debit"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Balance"
                stroke="hsl(221, 83%, 53%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Showing transaction trends by {period} period
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Credit, Debit, and Balance over time
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

