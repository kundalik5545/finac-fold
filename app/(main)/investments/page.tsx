import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { InvestmentsClient } from "./_components/InvestmentsClient";
import { getInvestments, getInvestmentStats } from "@/action/investments";
import { Investment, AllInvestmentStats } from "@/lib/types/investments-types";

const InvestmentsPage = async () => {
  let investments: Investment[] = [];
  let stats: AllInvestmentStats | null = null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      investments = await getInvestments(session.user.id);
      const statsResult = await getInvestmentStats(session.user.id);
      // When no type is provided, stats should be AllInvestmentStats
      stats = statsResult as AllInvestmentStats;
    }
  } catch (error) {
    console.error("Error fetching investments:", error);
  }

  return (
    <div className="investments-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Investments
          </h1>
          {stats && "totalInvested" in stats && (
            <p className="text-sm text-muted-foreground mt-1">
              Total Invested: ₹
              {stats.totalInvested.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              | Current Value: ₹
              {stats.totalCurrentValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              | P&L: ₹
              {stats.totalProfitLoss.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ({stats.totalProfitLossPercent >= 0 ? "+" : ""}
              {stats.totalProfitLossPercent.toFixed(2)}%)
            </p>
          )}
        </div>
        <Button>
          <Link
            href="/investments/add"
            className="flex items-center justify-around"
          >
            <Plus size={16} /> Add Investment
          </Link>
        </Button>
      </section>

      {/* Investments List and Stats Section */}
      <section className="py-5">
        <InvestmentsClient investments={investments} stats={stats} />
      </section>
    </div>
  );
};

export default InvestmentsPage;

