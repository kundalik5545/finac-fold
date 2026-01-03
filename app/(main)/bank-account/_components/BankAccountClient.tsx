"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus } from "lucide-react";
import { BankAccountCard } from "./BankAccountCard";
import { BankAccountTable } from "./BankAccountTable";
import { BankAccount } from "@/lib/schema/bank-account-types";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BankAccountFormModal } from "./BankAccountFormModal";

interface BankAccountClientProps {
  bankAccounts: (BankAccount & { calculatedBalance?: number })[];
  userName?: string;
}

export function BankAccountClient({
  bankAccounts,
  userName = "Account Holder",
}: BankAccountClientProps) {
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
          All Bank Accounts
        </h2>
        <div className="flex items-center gap-1 bg-muted   rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Table view"
            onClick={() => setViewMode("table")}
            className={`rounded-md transition-all ${viewMode === "table"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Card view"
            onClick={() => setViewMode("card")}
            className={`rounded-md transition-all ${viewMode === "card"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankAccounts.map((account) => (
            <BankAccountCard
              key={account.id}
              bankAccount={account}
              userName={userName}
            />
          ))}
          {/* Add New Account Card */}
          <Card
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer h-full min-h-[280px] flex items-center justify-center"
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Add New Account</h3>
              <p className="text-sm text-muted-foreground">
                Connect another bank account
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <BankAccountTable bankAccounts={bankAccounts} userName={userName} />
      )}

      {/* Bank Account Form Modal */}
      <BankAccountFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

