"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, DollarSign, FileText, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

export type SummaryCardData = {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardSummaryCards({ summaries }: { summaries: SummaryCardData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaries.map((summary, index) => {
        const Icon = summary.icon;
        const isPositive = summary.change >= 0;
        
        return (
          <Card key={index} className="bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {summary.title}
                  </p>
                  <p className="text-2xl font-bold mb-2">
                    {formatCurrency(summary.value)}
                  </p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                  }`}>
                    {isPositive ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(summary.change).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

