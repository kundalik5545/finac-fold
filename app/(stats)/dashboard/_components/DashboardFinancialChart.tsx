"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type FinancialDataPoint = {
  month: string;
  income: number;
  expenses: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const chartConfig: ChartConfig = {
  income: {
    label: "Income",
    color: "hsl(217, 91%, 60%)", // Blue
  },
  expenses: {
    label: "Expenses",
    color: "hsl(0, 84%, 60%)", // Red
  },
};

export function DashboardFinancialChart({ data }: { data: FinancialDataPoint[] }) {
  return (
    <Card className="bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Income vs Expenses over the last 7 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ left: 12, right: 12, top: 24, bottom: 32 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                width={80}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  
                  return (
                    <div className="rounded-lg bg-background p-3 shadow-lg border border-border min-w-[150px]">
                      <div className="font-semibold mb-2">{payload[0].payload.month}</div>
                      <div className="space-y-1">
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {entry.name === "income" ? "Income" : "Expenses"}
                              </span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(Number(entry.value))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                dataKey="income"
                type="monotone"
                fill="hsl(217, 91%, 60%)"
                fillOpacity={0.2}
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
              />
              <Area
                dataKey="expenses"
                type="monotone"
                fill="hsl(0, 84%, 60%)"
                fillOpacity={0.2}
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

