"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Wallet, 
  FileText, 
  Zap,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  amount: number;
  timestamp: string;
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

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  } else if (diffInHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  } else {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  }
}

const categoryColors: Record<string, string> = {
  Entertainment: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Income: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export function DashboardRecentTransactions({ 
  transactions, 
  totalCount 
}: { 
  transactions: Transaction[];
  totalCount: number;
}) {
  return (
    <Card className="bg-white dark:bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              You made {totalCount} transactions this month
            </CardDescription>
          </div>
          <Link 
            href="/transactions" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const Icon = transaction.icon;
            const isPositive = transaction.amount > 0;
            const categoryColor = categoryColors[transaction.category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{transaction.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${categoryColor} border-0`}>
                        {transaction.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 ml-4">
                  <p className={`font-semibold text-sm ${
                    isPositive 
                      ? "text-green-600 dark:text-green-500" 
                      : "text-gray-900 dark:text-gray-100"
                  }`}>
                    {isPositive ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(transaction.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

