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
import { Investment } from "@/lib/types/investments-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

interface InvestmentBarChartProps {
  investments: Investment[];
}

/**
 * InvestmentBarChart Component
 * Shows invested amount vs current value comparison
 */
export function InvestmentBarChart({
  investments,
}: InvestmentBarChartProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  const chartData = useMemo(() => {
    if (!investments || investments.length === 0) {
      return [];
    }

    return investments.map((investment) => ({
      name: investment.name.length > 15
        ? investment.name.substring(0, 15) + "..."
        : investment.name,
      "Invested": investment.investedAmount,
      "Current Value": investment.currentValue,
    }));
  }, [investments]);

  const chartConfig: ChartConfig = useMemo(
    () => ({
      Invested: {
        label: "Invested",
        color: "#3b82f6", // blue
      },
      "Current Value": {
        label: "Current Value",
        color: "#10b981", // green
      },
    }),
    []
  );

  if (!investments || investments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Comparison</CardTitle>
          <CardDescription>
            Comparison of invested amount vs current value
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
        <CardTitle>Investment Comparison</CardTitle>
        <CardDescription>
          Comparison of invested amount vs current value
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  formatCurrency(value).replace(/[₹,]/g, "").slice(0, -3) + "K"
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Legend />
              <Bar dataKey="Invested" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="Current Value"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

