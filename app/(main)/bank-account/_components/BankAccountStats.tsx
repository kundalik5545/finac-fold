"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Building2, Wallet, TrendingDown, ArrowUpCircle, TrendingUp } from "lucide-react";
import BankStatsCard from "./BankStatsCard";

interface BankAccountStatsProps {
  totalAccounts: number;
  totalBalance: number;
  currentMonthSpending: number;
}

export function BankAccountStats({
  totalAccounts,
  totalBalance,
  currentMonthSpending,
}: BankAccountStatsProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");

  const totalIncome = 0;
  const currentMonthIncome = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:p-4">
      {/* Total Accounts */}
      <BankStatsCard cardTitle="Total Accounts" number={totalAccounts} description="Active bank accounts" icon={Building2} />

      {/* Total Balance */}
      <BankStatsCard cardTitle="Total Balance" number={formatCurrency(totalBalance)} description="Across all accounts" icon={Wallet} />

      {/* Current Month Spending */}
      <BankStatsCard cardTitle="Total Spending" number={formatCurrency(currentMonthSpending)} description="Total spending in this month" icon={TrendingDown} />

      {/* Current Month Income */}
      <BankStatsCard cardTitle="Total Income" number={formatCurrency(currentMonthIncome)} description="Total income in this month" icon={TrendingUp} />
    </div>
  );
}

