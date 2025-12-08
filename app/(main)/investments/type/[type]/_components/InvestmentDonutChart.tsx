"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Investment } from "@/lib/types/investments-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

interface InvestmentDonutChartProps {
  investments: Investment[];
}

/**
 * InvestmentDonutChart Component
 * Shows distribution of investments by current value
 */
export function InvestmentDonutChart({
  investments,
}: InvestmentDonutChartProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  const chartData = useMemo(() => {
    if (!investments || investments.length === 0) {
      return [];
    }

    return investments.map((investment) => {
      const totalValue = investments.reduce(
        (sum, inv) => sum + inv.currentValue,
        0
      );
      const percentage =
        totalValue > 0 ? (investment.currentValue / totalValue) * 100 : 0;

      // Generate color based on investment index
      const colors = [
        "#10b981", // green
        "#3b82f6", // blue
        "#8b5cf6", // purple
        "#f59e0b", // amber
        "#ef4444", // red
        "#06b6d4", // cyan
        "#f97316", // orange
        "#ec4899", // pink
      ];
      const color = colors[investments.indexOf(investment) % colors.length];

      return {
        name: investment.name,
        value: investment.currentValue,
        percentage,
        fill: color,
      };
    });
  }, [investments]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    investments.forEach((investment, index) => {
      const colors = [
        "#10b981",
        "#3b82f6",
        "#8b5cf6",
        "#f59e0b",
        "#ef4444",
        "#06b6d4",
        "#f97316",
        "#ec4899",
      ];
      config[investment.name] = {
        label: investment.name,
        color: colors[index % colors.length],
      };
    });
    return config;
  }, [investments]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (!investments || investments.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Distribution</CardTitle>
          <CardDescription>
            Distribution of investments by current value
          </CardDescription>
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
        <CardTitle>Investment Distribution</CardTitle>
        <CardDescription>
          Distribution of investments by current value
        </CardDescription>
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
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

