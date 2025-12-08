"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Investment, InvestmentType } from "@/lib/types/investments-types";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

interface UpdatePriceButtonProps {
  investment: Investment;
}

/**
 * UpdatePriceButton Component
 * Fetches latest price for a single investment
 * Uses Alpha Vantage API for stocks/mutual funds, GOLD_PRICE_API_URI for gold
 */
export function UpdatePriceButton({ investment }: UpdatePriceButtonProps) {
  const router = useRouter();
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [isFetching, setIsFetching] = useState(false);

  const handleUpdatePrice = async () => {
    setIsFetching(true);

    try {
      let response;
      
      // Use different API endpoint for gold investments
      if (investment.type === InvestmentType.GOLD) {
        response = await fetch("/api/investments/fetch-gold-price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await fetch("/api/investments/fetch-prices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ investmentIds: [investment.id] }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        if (data.investments && data.investments.length > 0) {
          // For gold, find the updated investment in the array
          const updatedInvestment = investment.type === InvestmentType.GOLD
            ? data.investments.find((inv: Investment) => inv.id === investment.id) || data.investments[0]
            : data.investments[0];
          
          if (updatedInvestment) {
            const oldPrice = investment.currentPrice;
            const newPrice = updatedInvestment.currentPrice;
            
            toast.success(
              `Price updated successfully. ${formatCurrency(oldPrice)} → ${formatCurrency(newPrice)}`
            );
          } else {
            toast.warning("Price could not be fetched. Please try again.");
          }
        } else {
          const errorMsg = investment.type === InvestmentType.GOLD
            ? `Gold price could not be fetched. Please check if GOLD_PRICE_API_URI is configured correctly.`
            : investment.symbol
            ? `Price could not be fetched for ${investment.symbol}. Please check if the symbol is correct and API key is configured.`
            : `Price could not be fetched. Please ensure the investment has a valid symbol and API key is configured.`;
          toast.warning(errorMsg);
        }
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update price");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Failed to update price. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleUpdatePrice}
      disabled={isFetching}
    >
      <RefreshCw
        size={16}
        className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
      />
      {isFetching ? "Updating..." : "Update Price"}
    </Button>
  );
}

