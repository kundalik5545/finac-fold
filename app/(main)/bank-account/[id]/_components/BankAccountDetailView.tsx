"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { BankAccount, BankTransaction } from "@/lib/bank-account-types";
import { cn } from "@/lib/utils";

interface BankAccountDetailViewProps {
  bankAccount: BankAccount;
  transactions: BankTransaction[];
  balance: number;
}

export function BankAccountDetailView({
  bankAccount,
  transactions,
  balance,
}: BankAccountDetailViewProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate total income and expense
  const totalIncome = transactions
    .filter((t) => t.transactionType === "CREDIT")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.transactionType === "DEBIT")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const handleEdit = () => {
    router.push(`/bank-account/edit/${bankAccount.id}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${bankAccount.name}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/bank-account/${bankAccount.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Bank account deleted successfully");
        router.push("/bank-account");
        router.refresh();
      } else {
        let errorData: any = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch {
          // If parsing fails, use default error message
        }
        toast.error(errorData.error || "Failed to delete bank account");
      }
    } catch (error) {
      toast.error("Failed to delete bank account");
    } finally {
      setIsDeleting(false);
    }
  };

  const cardBgColor = bankAccount.color || undefined;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {bankAccount.icon && (
            <span className="text-4xl" role="img" aria-label="Bank account icon">
              {bankAccount.icon}
            </span>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{bankAccount.name}</h1>
            {bankAccount.bankName && (
              <p className="text-sm text-muted-foreground mt-1">{bankAccount.bankName}</p>
            )}
            <Badge
              variant={bankAccount.isActive ? "default" : "secondary"}
              className="mt-2"
            >
              {bankAccount.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash size={16} className="mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card
        className={cn(cardBgColor && "border-0")}
        style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
      >
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
        </CardContent>
      </Card>

      {/* Income and Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Income Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total credits
            </p>
          </CardContent>
        </Card>

        {/* Total Expense Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total debits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankAccount.accountNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Account Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{bankAccount.accountNumber}</p>
            </CardContent>
          </Card>
        )}

        {bankAccount.accountType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Account Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {bankAccount.accountType}
              </Badge>
            </CardContent>
          </Card>
        )}

        {bankAccount.startingBalance !== undefined && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Starting Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {formatCurrency(bankAccount.startingBalance)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      {bankAccount.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{bankAccount.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

