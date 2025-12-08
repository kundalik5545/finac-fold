"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Investment } from "@/lib/types/investments-types";
import { cn } from "@/lib/utils";
import {
  calculateProfitLoss,
  calculateProfitLossPercent,
  formatInvestmentType,
} from "@/lib/utils/investment-utils";

interface InvestmentDetailViewProps {
  investment: Investment & {
    investmentTransactions?: any[];
    investmentPriceHistory?: any[];
  };
}

export function InvestmentDetailView({
  investment,
}: InvestmentDetailViewProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const profitLoss = calculateProfitLoss(
    investment.investedAmount,
    investment.currentValue
  );
  const profitLossPercent = calculateProfitLossPercent(
    investment.investedAmount,
    investment.currentValue
  );
  const isProfit = profitLoss >= 0;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEdit = () => {
    router.push(`/investments/edit/${investment.id}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${investment.name}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/investments/${investment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Investment deleted successfully");
        router.push("/investments");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete investment");
      }
    } catch (error) {
      toast.error("Failed to delete investment");
    } finally {
      setIsDeleting(false);
    }
  };

  const cardBgColor = investment.color || undefined;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {investment.icon && (
            <span className="text-4xl" role="img" aria-label="Investment icon">
              {investment.icon}
            </span>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{investment.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {formatInvestmentType(investment.type)}
              </Badge>
              {investment.symbol && (
                <Badge variant="secondary">{investment.symbol}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash size={16} className="mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={cn(cardBgColor && "border-0")}
          style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
        >
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Invested Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(investment.investedAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Current Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(investment.currentValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Current Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(investment.currentPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Profit/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold",
                isProfit ? "text-green-600" : "text-red-600"
              )}
            >
              {isProfit ? "+" : ""}
              {formatCurrency(profitLoss)} ({isProfit ? "+" : ""}
              {profitLossPercent.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investment.quantity > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Quantity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {investment.quantity.toLocaleString("en-IN", {
                  maximumFractionDigits: 4,
                })}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Purchase Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatDate(investment.purchaseDate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {investment.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{investment.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

