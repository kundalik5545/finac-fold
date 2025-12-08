"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Building2, Wallet, TrendingDown } from "lucide-react";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAccounts}</div>
          <p className="text-xs text-muted-foreground">
            Active bank accounts
          </p>
        </CardContent>
      </Card>

      {/* Total Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-xs text-muted-foreground">
            Across all accounts
          </p>
        </CardContent>
      </Card>

      {/* Current Month Spending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month Spending</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentMonthSpending)}</div>
          <p className="text-xs text-muted-foreground">
            Total debits this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

