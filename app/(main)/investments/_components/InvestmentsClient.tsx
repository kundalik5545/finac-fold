"use client";

import { Investment, AllInvestmentStats } from "@/lib/types/investments-types";
import { InvestmentTypeCard } from "./InvestmentTypeCard";
import { InvestmentType } from "@/lib/types/investments-types";

interface InvestmentsClientProps {
  investments: Investment[];
  stats: AllInvestmentStats | null;
}

/**
 * InvestmentsClient Component
 * Displays investment type cards with aggregated stats
 */
export function InvestmentsClient({
  investments,
  stats,
}: InvestmentsClientProps) {
  // Investment types in order
  const investmentTypes: InvestmentType[] = [
    InvestmentType.STOCKS,
    InvestmentType.MUTUAL_FUNDS,
    InvestmentType.GOLD,
    InvestmentType.FIXED_DEPOSIT,
    InvestmentType.NPS,
    InvestmentType.PF,
  ];

  if (!stats || !("statsByType" in stats)) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
        No investments found. Add your first investment to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {investmentTypes.map((type) => {
        const typeStats = stats.statsByType.find((s) => s.type === type);
        if (!typeStats) {
          return null;
        }
        return (
          <InvestmentTypeCard
            key={type}
            type={type}
            stats={typeStats}
            investments={investments.filter((inv) => inv.type === type)}
          />
        );
      })}
    </div>
  );
}

