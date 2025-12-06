"use client";

import { useMemo } from "react";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { Goal } from "@/lib/goals-types";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Get chart data showing aggregate progress over time
function getChartData(goals: Goal[]) {
  // Sort goals by creation date
  const sortedGoals = [...goals].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateA - dateB;
  });

  // Calculate cumulative current amount over time
  let cumulativeAmount = 0;
  const data = sortedGoals.map((goal, idx) => {
    cumulativeAmount += Number(goal.currentAmount);
    return {
      date: format(new Date(goal.createdAt), "yyyy-MM-dd"),
      value: cumulativeAmount,
      name: goal.name,
      idx,
    };
  });

  return data;
}

const defaultChartConfig: ChartConfig = {
  value: {
    label: "Total Progress",
    color: "hsl(var(--chart-1))",
  },
};

export function GoalsAreaChart({ goals }: { goals: Goal[] }) {
  const chartData = getChartData(goals);
  const chartContainerClass =
    "w-full min-h-[300px] md:min-h-[400px] h-[40vw] md:h-[400px]";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals Progress Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="w-full min-h-[300px] md:min-h-[400px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ChartContainer config={defaultChartConfig} className={chartContainerClass}>
            <div className={chartContainerClass}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ left: 12, right: 12, top: 24, bottom: 32 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                  />
                  <YAxis
                    dataKey="value"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCurrency}
                    width={80}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const p = payload[0].payload;
                      return (
                        <div className="rounded bg-background p-3 shadow border border-border min-w-[150px]">
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-sm">{formatCurrency(Number(p.value))}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(p.date), "MMM d, yyyy")}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    dataKey="value"
                    type="monotone"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.2}
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Cumulative progress across all goals{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {chartData.length > 0 &&
                (() => {
                  const dates = chartData.map((d) => d.date);
                  if (dates.length < 2) {
                    return dates[0] ? format(new Date(dates[0]), "MMM yyyy") : "";
                  }
                  const sortedDates = dates.sort();
                  return `${format(new Date(sortedDates[0]), "MMM yyyy")} - ${format(new Date(sortedDates[sortedDates.length - 1]), "MMM yyyy")}`;
                })()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

