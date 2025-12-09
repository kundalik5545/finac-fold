"use client";

import { Investment, InvestmentStats, InvestmentType } from "@/lib/types/investments-types";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentDonutChart } from "./InvestmentDonutChart";
import { InvestmentBarChart } from "./InvestmentBarChart";
import { formatInvestmentType } from "@/lib/utils/investment-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { cn } from "@/lib/utils";

interface InvestmentTypeDetailClientProps {
    type: InvestmentType;
    investments: Investment[];
    stats: InvestmentStats | null;
}

/**
 * InvestmentTypeDetailClient Component
 * Displays investments of a specific type with charts and stats
 */
export function InvestmentTypeDetailClient({
    type,
    investments,
    stats,
}: InvestmentTypeDetailClientProps) {
    const { formatCurrency } = useFormatCurrency("en-IN", "INR");

    if (!stats) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
                No investments found for this type.
            </div>
        );
    }

    const typeName = formatInvestmentType(type);
    const profitLoss = stats.totalProfitLoss;
    const profitLossPercent = stats.totalProfitLossPercent;
    const isProfit = profitLoss >= 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Invested
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.totalInvested)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Current Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.totalCurrentValue)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Profit/Loss
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={cn(
                                "text-2xl font-bold",
                                isProfit ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {isProfit ? "+" : ""}
                            {formatCurrency(profitLoss)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Profit/Loss %
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={cn(
                                "text-2xl font-bold",
                                isProfit ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {isProfit ? "+" : ""}
                            {profitLossPercent.toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InvestmentDonutChart investments={investments} />
                <InvestmentBarChart investments={investments} />
            </div>

            {/* Investment List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">{typeName} Investments</h2>
                {investments.length === 0 ? (
                    <div className="w-full h-[200px] flex items-center justify-center text-muted-foreground border rounded-lg">
                        No investments found. Add your first {typeName.toLowerCase()} investment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {investments.map((investment) => (
                            <InvestmentCard key={investment.id} investment={investment} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

