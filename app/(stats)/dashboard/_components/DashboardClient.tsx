"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DashboardSummaryCards, SummaryCardData } from "./DashboardSummaryCards";
import { DashboardFinancialChart, FinancialDataPoint } from "./DashboardFinancialChart";
import { DashboardRecentTransactions, Transaction } from "./DashboardRecentTransactions";

export type DashboardData = {
  summaries: SummaryCardData[];
  financialData: FinancialDataPoint[];
  recentTransactions: Transaction[];
  totalTransactionCount: number;
};

export function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, here's your financial overview
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <DashboardSummaryCards summaries={data.summaries} />

      {/* Bottom Section: Chart and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardFinancialChart data={data.financialData} />
        <DashboardRecentTransactions 
          transactions={data.recentTransactions} 
          totalCount={data.totalTransactionCount}
        />
      </div>
    </div>
  );
}

