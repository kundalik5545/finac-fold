"use client";

import { TrendingUp } from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    ReferenceDot,
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
import { Asset } from "@/lib/types/assets-tracking-types";
import { format } from "date-fns";
import React from "react";

export const description = "Area chart showing asset current value over time by date and name";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// Enrich chart data with index for dot placement
function getChartData(assets: Asset[]) {
    // Sort assets by their date of purchase in ascending order
    const data = [...assets]
        .sort((a, b) => {
            const dateA = new Date(a.purchaseDate || a.createdAt || 0).getTime();
            const dateB = new Date(b.purchaseDate || b.createdAt || 0).getTime();
            return dateA - dateB;
        })
        .map((asset, idx) => ({
            date: asset.purchaseDate
                ? format(new Date(asset.purchaseDate), "yyyy-MM-dd")
                : asset.name,
            value: Number(asset.currentValue),
            name: asset.name,
            // Use index if needed
            idx,
        }));
    return data;
}

const defaultChartConfig: ChartConfig = {
    value: {
        label: "Asset Value",
        color: "hsl(var(--chart-1))",
    },
};

function CustomXAxisTick(props: any) {
    const { x, y, payload, index, chartData } = props;
    const entry = chartData[index];
    if (!entry) return null;

    // Display Date in top line, asset name in bottom line
    let dateLabel;
    if (/\d{4}-\d{2}-\d{2}/.test(payload.value)) {
        dateLabel = format(new Date(payload.value), "MMM d");
    } else {
        dateLabel = payload.value;
    }
    const assetLabel = entry.name;

    return (
        <g>
            <text x={x} y={y - 4} textAnchor="middle" fill="#6b7280" fontSize="12">
                {dateLabel}
            </text>
            <text x={x} y={y + 12} textAnchor="middle" fill="#7c3aed" fontSize="11" fontWeight="500">
                {assetLabel}
            </text>
        </g>
    );
}

function NameLabelsInsideChart({ chartData, yScale, height }: { chartData: any[], yScale: (val: number) => number, height: number }) {
    // Render asset name below/near each dot
    // yScale maps value to svg Y position
    return (
        <>
            {chartData.map((d, idx) => {
                // Calculated positions
                const xPerc = (idx + 0.5) / chartData.length; // fudge to center if many
                // Recharts gives dot X coordinates via scales, which aren't exposed, but X is ordinal here
                // Instead, assume uniform width; ResponsiveContainer does so.
                return (
                    <g key={d.name + d.date}>
                        <text
                            x={`calc(${((idx + 0.5) / chartData.length) * 100}% )`}
                            y={yScale ? yScale(d.value) + 28 : height - 10}
                            // fallback if yScale is not available
                            textAnchor="middle"
                            fill="#7c3aed"
                            fontSize="11"
                            style={{
                                pointerEvents: "none",
                            }}
                        >
                            {d.name}
                        </text>
                    </g>
                );
            })}
        </>
    );
}

export function AssestsAreacChart({ assets }: { assets: Asset[] }) {
    const chartData = getChartData(assets);
    const chartContainerClass =
        "w-full min-h-[300px] md:min-h-[400px] h-[40vw] md:h-[400px]";

    // For NameLabelsInsideChart, we need access to yAxis scale and height. We'll use a render prop workaround.
    return (
        <Card>
            <CardHeader>
                <CardTitle>Asset Value Over Time</CardTitle>
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
                                {/* Custom wrapper to inject labels */}
                                <AreaChart
                                    data={chartData}
                                    margin={{ left: 12, right: 12, top: 24, bottom: 32 }}
                                >
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={22}
                                        // Custom tick to show asset name AND date always
                                        tick={(props) => (
                                            <CustomXAxisTick {...props} chartData={chartData} />
                                        )}
                                    />
                                    <YAxis
                                        dataKey="value"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatCurrency}
                                        width={80}
                                    />
                                    {/* Custom Tooltip for showing asset value and name */}
                                    <RechartsTooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload || !payload.length) return null;
                                            const p = payload[0].payload;
                                            return (
                                                <div className="rounded bg-background p-3 shadow border border-border min-w-[150px]">
                                                    <div className="font-semibold">{p.name ?? p.date}</div>
                                                    <div className="text-sm">{formatCurrency(Number(p.value))}</div>
                                                    <div className="text-xs text-muted-foreground">{p.date}</div>
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
                            {/* Placeholder trending info; if you want to show actual growth, you must calculate it */}
                            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            {/* Optionally, could use actual range from chartData */}
                            {chartData.length > 0 &&
                                (() => {
                                    const dates = chartData
                                        .filter(d => !!d.date && /\d{4}-\d{2}-\d{2}/.test(d.date))
                                        .map(d => d.date);
                                    if (dates.length < 2) {
                                        return dates[0] ?? "";
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
