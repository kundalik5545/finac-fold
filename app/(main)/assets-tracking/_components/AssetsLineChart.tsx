"use client";

import { useMemo } from "react";
import {
    Line,
    LineChart,
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
import { Asset } from "@/lib/types/assets-tracking-types";

export function AssetsLineChart({ assets }: { assets: Asset[] }) {
    // Build chart data: x-axis is asset type/name, y-axes are currentValue and purchasePrice
    const { chartData, chartConfig } = useMemo(() => {
        // For each asset, pull current and purchase values
        const data = assets.map((asset) => ({
            type: asset.name,
            "Current Value": Number(asset.currentValue) || 0,
            "Purchase Price": Number(asset.purchaseValue) || 0,
        }));

        const config: ChartConfig = {
            "Current Value": {
                label: "Current Value",
                color: "hsl(var(--chart-1))",
            },
            "Purchase Price": {
                label: "Purchase Price",
                color: "hsl(var(--chart-2))",
            },
        };

        return { chartData: data, chartConfig: config };
    }, [assets]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (!assets || assets.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey="type"
                        className="text-xs"
                        interval={0}
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
                                labelFormatter={(label) => label}
                            />
                        }
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="Current Value"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Purchase Price"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
