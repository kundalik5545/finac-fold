"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
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

// Define color palette for goals
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

export function GoalsDonutChart({ goals }: { goals: Goal[] }) {
  // Calculate data for donut chart - showing distribution by target amount
  const chartData = useMemo(() => {
    const totalTarget = goals.reduce(
      (sum, goal) => sum + Number(goal.targetAmount),
      0
    );

    return goals.map((goal, index) => {
      const value = Number(goal.targetAmount);
      const percentage = totalTarget > 0 ? (value / totalTarget) * 100 : 0;

      return {
        name: goal.name,
        value: value,
        percentage: percentage,
        fill: goal.color || PIE_COLORS[index % PIE_COLORS.length],
      };
    });
  }, [goals]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};

    goals.forEach((goal, index) => {
      config[goal.name] = {
        label: goal.name,
        color: goal.color || PIE_COLORS[index % PIE_COLORS.length],
      };
    });

    return config;
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
        <CardTitle>Goals Distribution</CardTitle>
        <CardDescription>
          Distribution of goals by target amount
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
              Showing target amounts of all goals
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Distribution by target amount percentage
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

