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
import { Goal } from "@/lib/goals-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GoalsBarChart({ goals }: { goals: Goal[] }) {
  const { chartData, chartConfig } = useMemo(() => {
    const data = goals.map((goal) => ({
      name: goal.name.length > 10 ? goal.name.substring(0, 10) + "..." : goal.name,
      fullName: goal.name,
      "Current Amount": Number(goal.currentAmount) || 0,
      "Target Amount": Number(goal.targetAmount) || 0,
    }));

    const config: ChartConfig = {
      "Current Amount": {
        label: "Current Amount",
        color: "hsl(var(--chart-1))",
      },
      "Target Amount": {
        label: "Target Amount",
        color: "hsl(var(--chart-2))",
      },
    };

    return { chartData: data, chartConfig: config };
  }, [goals]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!goals || goals.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals Progress Comparison</CardTitle>
        <CardDescription>
          Current vs Target amounts for each goal
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
                dataKey="Current Amount"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Target Amount"
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
              Comparing current and target amounts
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Visual progress comparison across all goals
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

