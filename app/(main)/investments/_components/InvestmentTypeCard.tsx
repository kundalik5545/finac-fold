"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Investment,
  InvestmentType,
  InvestmentStats,
} from "@/lib/types/investments-types";
import {
  formatInvestmentType,
  getInvestmentIcon,
} from "@/lib/utils/investment-utils";
import { cn } from "@/lib/utils";

interface InvestmentTypeCardProps {
  type: InvestmentType;
  stats: InvestmentStats;
  investments: Investment[];
}

/**
 * InvestmentTypeCard Component
 * Displays aggregated stats for an investment type
 */
export function InvestmentTypeCard({
  type,
  stats,
  investments,
}: InvestmentTypeCardProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/investments/type/${type}`);
  };

  const icon = getInvestmentIcon(type);
  const typeName = formatInvestmentType(type);
  const profitLoss = stats.totalProfitLoss;
  const profitLossPercent = stats.totalProfitLossPercent;
  const isProfit = profitLoss >= 0;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-label={`${typeName} icon`}>
              {icon}
            </span>
            <h3 className="font-semibold text-lg">{typeName}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invested</span>
            <span className="font-semibold">
              {formatCurrency(stats.totalInvested)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Value</span>
            <span className="font-semibold">
              {formatCurrency(stats.totalCurrentValue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Profit/Loss</span>
            <span
              className={cn(
                "font-semibold",
                isProfit ? "text-green-600" : "text-red-600"
              )}
            >
              {isProfit ? "+" : ""}
              {formatCurrency(profitLoss)} ({isProfit ? "+" : ""}
              {profitLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">
            {stats.investmentCount} Investment{stats.investmentCount !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline">
            {stats.transactionsCount} Transaction{stats.transactionsCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

