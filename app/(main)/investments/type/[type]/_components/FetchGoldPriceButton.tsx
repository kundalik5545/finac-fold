"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Investment } from "@/lib/types/investments-types";

interface FetchGoldPriceButtonProps {
    investments: Investment[];
}

/**
 * FetchGoldPriceButton Component
 * Fetches latest gold price from GOLD_PRICE_API_URI and updates all gold investments
 */
export function FetchGoldPriceButton({ investments }: FetchGoldPriceButtonProps) {
    const router = useRouter();
    const [isFetching, setIsFetching] = useState(false);

    const handleFetchGoldPrice = async () => {
        if (investments.length === 0) {
            toast.error("No gold investments to fetch price for");
            return;
        }

        setIsFetching(true);

        try {
            const response = await fetch("/api/investments/fetch-gold-price", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                const successCount = data.successCount || data.investments?.length || 0;
                const totalRequested = data.totalRequested || investments.length;

                if (successCount === totalRequested) {
                    toast.success(
                        `Successfully updated gold price for all ${successCount} investment(s)`
                    );
                } else if (successCount > 0) {
                    toast.warning(
                        `Updated gold price for ${successCount} out of ${totalRequested} investment(s). Some investments may have failed.`
                    );
                } else {
                    toast.error(
                        "Failed to update gold price. Please check if GOLD_PRICE_API_URI is configured correctly."
                    );
                }
                router.refresh();
            } else {
                toast.error(data.error || "Failed to fetch latest gold price");
            }
        } catch (error) {
            console.error("Error fetching gold price:", error);
            toast.error("Failed to fetch latest gold price. Please try again.");
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleFetchGoldPrice}
            disabled={isFetching || investments.length === 0}
        >
            <RefreshCw
                size={16}
                className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Fetching..." : "Fetch Latest Gold Price"}
        </Button>
    );
}

