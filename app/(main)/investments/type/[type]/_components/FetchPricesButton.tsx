"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Investment } from "@/lib/types/investments-types";

interface FetchPricesButtonProps {
  investments: Investment[];
}

/**
 * FetchPricesButton Component
 * Fetches latest prices for investments from Alpha Vantage API
 */
export function FetchPricesButton({ investments }: FetchPricesButtonProps) {
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchPrices = async () => {
    if (investments.length === 0) {
      toast.error("No investments to fetch prices for");
      return;
    }

    setIsFetching(true);

    try {
      const investmentIds = investments.map((inv) => inv.id);

      const response = await fetch("/api/investments/fetch-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ investmentIds }),
      });
      console.log("response from fetch prices", response);

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Successfully updated prices for ${data.investments.length} investment(s)`
        );
        router.refresh();
      } else {
        toast.error(data.error || "Failed to fetch latest prices");
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
      toast.error("Failed to fetch latest prices. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleFetchPrices}
      disabled={isFetching || investments.length === 0}
    >
      <RefreshCw
        size={16}
        className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
      />
      {isFetching ? "Fetching..." : "Fetch Latest Prices"}
    </Button>
  );
}

