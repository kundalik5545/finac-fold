"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig,
} from "@/components/ui/chart";
import { Asset } from "@/lib/assets-tracking-types";

// Define a larger color palette for variety
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

export function AssetsPieChart({ assets }: { assets: Asset[] }) {
    // Calculate data for donut chart
    const chartData = useMemo(() => {
        const totalValue = assets.reduce(
            (sum, asset) => sum + Number(asset.currentValue),
            0
        );

        return assets.map((asset, index) => {
            const value = Number(asset.currentValue);
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

            return {
                name: asset.name,
                value: value,
                percentage: percentage,
                fill: PIE_COLORS[index % PIE_COLORS.length], // use palette
            };
        });
    }, [assets]);

    const chartConfig: ChartConfig = useMemo(() => {
        const config: ChartConfig = {};

        assets.forEach((asset, index) => {
            config[asset.name] = {
                label: asset.name,
                color: PIE_COLORS[index % PIE_COLORS.length],
            };
        });

        return config;
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
                        innerRadius={54} // make donut hole
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
    );
}
