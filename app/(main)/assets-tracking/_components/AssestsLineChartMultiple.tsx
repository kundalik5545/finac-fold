"use client"

import { TrendingUp } from "lucide-react"
import {
    CartesianGrid,
    Bar,
    BarChart,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Legend,
    Tooltip as RechartsTooltip,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart"
import { Asset } from "@/lib/types/assets-tracking-types"

export const description = "A bar chart showing asset value vs purchase price"

// Color variables for easy management
const CURRENT_VALUE_COLOR = "#14b8a6" // teal
const PURCHASE_PRICE_COLOR = "#3b82f6" // light blue
const TOOLTIP_CURSOR_COLOR = "hsl(var(--muted)/0.13)"

export function AssestsLineChartMultiple({ assets }: { assets: Asset[] }) {
    // Chart data: asset name on x-axis, bars for purchase and current value
    const chartData =
        assets
            ?.map((asset) => ({
                name: asset.name || "Unknown",
                "Current Value": Number(asset.currentValue) || 0,
                "Purchase Price": Number(asset.purchaseValue) || 0,
            }))
            .sort((a, b) => a.name.localeCompare(b.name)) ?? []

    // Use color variables here
    const chartConfig: ChartConfig = {
        "Current Value": {
            label: "Current Value",
            color: CURRENT_VALUE_COLOR,
        },
        "Purchase Price": {
            label: "Purchase Price",
            color: PURCHASE_PRICE_COLOR,
        },
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    if (!assets || assets.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Asset Value and Purchase Price (Bar Chart)</CardTitle>
                <CardDescription>
                    Asset value vs. purchase price by asset name
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                                top: 12,
                                bottom: 12,
                            }}
                            barCategoryGap={16}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="name"
                                className="text-xs"
                                interval={0}
                                tick={{ fontSize: 12 }}
                                minTickGap={12}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                className="text-xs"
                            />
                            <RechartsTooltip
                                formatter={formatCurrency}
                                cursor={{ fill: TOOLTIP_CURSOR_COLOR }}
                            />
                            <Legend />
                            <Bar
                                dataKey="Current Value"
                                name="Current Value"
                                fill={CURRENT_VALUE_COLOR}
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                            <Bar
                                dataKey="Purchase Price"
                                name="Purchase Price"
                                fill={PURCHASE_PRICE_COLOR}
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            Showing value and purchase price of all assets
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
