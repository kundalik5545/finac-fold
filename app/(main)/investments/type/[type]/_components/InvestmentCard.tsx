"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useRouter } from "next/navigation";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Investment } from "@/lib/types/investments-types";
import { cn } from "@/lib/utils";
import {
  calculateProfitLoss,
  calculateProfitLossPercent,
} from "@/lib/utils/investment-utils";

interface InvestmentCardProps {
  investment: Investment;
}

/**
 * InvestmentCard Component
 * Displays individual investment details
 */
export function InvestmentCard({ investment }: InvestmentCardProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const profitLoss = calculateProfitLoss(
    investment.investedAmount,
    investment.currentValue
  );
  const profitLossPercent = calculateProfitLossPercent(
    investment.investedAmount,
    investment.currentValue
  );
  const isProfit = profitLoss >= 0;

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    investmentId: string,
    investmentName: string
  ) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${investmentName}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({
      ...prev,
      [`delete-${investmentId}`]: true,
    }));

    try {
      const response = await fetch(`/api/investments/${investmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Investment deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete investment");
      }
    } catch (error) {
      toast.error("Failed to delete investment");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-${investmentId}`]: false,
      }));
    }
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, investmentId: string) => {
    e.stopPropagation();
    router.push(`/investments/edit/${investmentId}`);
  };

  const handleCardClick = () => {
    router.push(`/investments/${investment.id}`);
  };

  const cardBgColor = investment.color || undefined;

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-shadow",
        cardBgColor && "border-0"
      )}
      style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {investment.icon && (
              <span className="text-3xl" role="img" aria-label="Investment icon">
                {investment.icon}
              </span>
            )}
            <div>
              <h3 className="font-semibold text-lg">{investment.name}</h3>
              {investment.symbol && (
                <p className="text-sm text-muted-foreground">{investment.symbol}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleEdit(e, investment.id)}
              disabled={!!loadingStates[`edit-${investment.id}`]}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleDelete(e, investment.id, investment.name)}
              disabled={!!loadingStates[`delete-${investment.id}`]}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amounts */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invested</span>
            <span className="font-semibold">
              {formatCurrency(investment.investedAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Value</span>
            <span className="font-semibold">
              {formatCurrency(investment.currentValue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price</span>
            <span className="font-semibold">
              {formatCurrency(investment.currentPrice)}
            </span>
          </div>
          {investment.quantity > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-semibold">
                {investment.quantity.toLocaleString("en-IN", {
                  maximumFractionDigits: 4,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Profit/Loss Badge */}
        <div className="flex items-center justify-between pt-2">
          <Badge
            variant={isProfit ? "default" : "destructive"}
            className={cn(
              isProfit ? "bg-green-600" : "bg-red-600"
            )}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(profitLoss)} ({isProfit ? "+" : ""}
            {profitLossPercent.toFixed(2)}%)
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

