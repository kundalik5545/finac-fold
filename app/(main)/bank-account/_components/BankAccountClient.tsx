"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table2, LayoutGrid } from "lucide-react";
import { BankAccountCard } from "./BankAccountCard";
import { BankAccountDonutChart } from "./BankAccountDonutChart";
import { BankAccountBarChart } from "./BankAccountBarChart";
import { BankAccount } from "@/lib/schema/bank-account-types";

export function BankAccountClient({ bankAccounts }: { bankAccounts: BankAccount[] }) {
  const [viewMode, setViewMode] = useState<"table" | "card">("card");

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
          All Bank Accounts
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table2 size={16} className="mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid size={16} className="mr-2" />
            Card
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "card" ? (
        bankAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((account) => (
              <BankAccountCard key={account.id} bankAccount={account} />
            ))}
          </div>
        ) : (
          <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-muted-foreground">
              No bank accounts found. Add your first bank account to get started.
            </p>
          </div>
        )
      ) : (
        <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-muted-foreground">
            Table view coming soon. Please use card view for now.
          </p>
        </div>
      )}

      {/* Charts Section */}
      {bankAccounts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BankAccountDonutChart bankAccounts={bankAccounts} />
          <BankAccountBarChart bankAccounts={bankAccounts} />
        </div>
      )}
    </div>
  );
}

