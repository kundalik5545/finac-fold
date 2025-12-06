"use client";

import { useMemo, useEffect, useState } from "react";
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
import { Asset, AssetsTransaction } from "@/lib/assets-tracking-types";

export function AssetsLineChart({ assets }: { assets: Asset[] }) {
    const [transactions, setTransactions] = useState<{
        [assetId: string]: AssetsTransaction[];
    }>({});
    const [loading, setLoading] = useState(true);

    // Fetch transactions for all assets
    useEffect(() => {
        const fetchAllTransactions = async () => {
            setLoading(true);
            const transactionData: { [assetId: string]: AssetsTransaction[] } = {};

            try {
                await Promise.all(
                    assets.map(async (asset) => {
                        const response = await fetch(
                            `/api/assets-tracking/${asset.id}/transactions`
                        );
                        if (response.ok) {
                            const data = await response.json();
                            transactionData[asset.id] = data.transactions || [];
                        }
                    })
                );
                setTransactions(transactionData);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (assets && assets.length > 0) {
            fetchAllTransactions();
        } else {
            setLoading(false);
        }
    }, [assets]);

    // Process data for line chart
    const { chartData, chartConfig } = useMemo(() => {
        if (loading || !assets || assets.length === 0) {
            return { chartData: [], chartConfig: {} };
        }

        // Collect all unique dates and create a map
        const dateMap = new Map<string, { date: Date;[key: string]: any }>();

        assets.forEach((asset, index) => {
            const assetTransactions = transactions[asset.id] || [];

            assetTransactions.forEach((transaction) => {
                const dateStr = new Date(transaction.date).toISOString().split("T")[0];
                if (!dateMap.has(dateStr)) {
                    dateMap.set(dateStr, {
                        date: new Date(transaction.date),
                        dateStr,
                    });
                }
                dateMap.get(dateStr)![asset.name] = Number(transaction.value);
            });
        });

        // Sort by date and fill in missing values
        const sortedDates = Array.from(dateMap.values()).sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        );

        // Fill in missing values with previous known values
        const filledData = sortedDates.map((item, index) => {
            const newItem = { ...item };
            assets.forEach((asset) => {
                if (newItem[asset.name] === undefined && index > 0) {
                    newItem[asset.name] = sortedDates[index - 1][asset.name];
                }
            });
            return newItem;
        });

        // Create chart config
        const config: ChartConfig = {};
        assets.forEach((asset, index) => {
            config[asset.name] = {
                label: asset.name,
                color: `hsl(var(--chart-${(index % 5) + 1}))`,
            };
        });

        return { chartData: filledData, chartConfig: config };
    }, [assets, transactions, loading]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                Loading transaction data...
            </div>
        );
    }

    if (!assets || assets.length === 0 || chartData.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                No transaction data available
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey="dateStr"
                        tickFormatter={formatDate}
                        className="text-xs"
                    />
                    <YAxis
                        tickFormatter={(value) => formatCurrency(value)}
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
                                labelFormatter={(label) => {
                                    const item = chartData.find((d) => d.dateStr === label);
                                    return item
                                        ? item.date.toLocaleDateString("en-IN", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : label;
                                }}
                            />
                        }
                    />
                    <Legend />
                    {assets.map((asset, index) => (
                        <Line
                            key={asset.id}
                            type="monotone"
                            dataKey={asset.name}
                            stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

