"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Investment } from "@/lib/types/investments-types";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";

interface UpdatePriceButtonProps {
  investment: Investment;
}

/**
 * UpdatePriceButton Component
 * Fetches latest price for a single investment from Alpha Vantage API
 */
export function UpdatePriceButton({ investment }: UpdatePriceButtonProps) {
  const router = useRouter();
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [isFetching, setIsFetching] = useState(false);

  const handleUpdatePrice = async () => {
    setIsFetching(true);

    try {
      const response = await fetch("/api/investments/fetch-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ investmentIds: [investment.id] }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.investments && data.investments.length > 0) {
          const updatedInvestment = data.investments[0];
          toast.success(
            `Price updated successfully. New price: ${formatCurrency(updatedInvestment.currentPrice)}`
          );
        } else {
          toast.warning("Price could not be fetched. Please check if the symbol is correct and API key is configured.");
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

