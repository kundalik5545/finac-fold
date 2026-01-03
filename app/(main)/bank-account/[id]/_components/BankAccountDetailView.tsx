"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, ArrowLeft, Copy, TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { BankAccount, BankTransaction } from "@/lib/schema/bank-account-types";
import { cn } from "@/lib/utils";
import { maskAccountNumber, copyToClipboard } from "@/lib/utils/bank-account-helpers";
import Link from "next/link";

interface BankAccountDetailViewProps {
  bankAccount: BankAccount;
  transactions: BankTransaction[];
  balance: number;
  userName?: string;
}

export function BankAccountDetailView({
  bankAccount,
  transactions,
  balance,
  userName = "Account Holder",
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

  const handleCopyAccountNumber = async () => {
    if (!bankAccount.accountNumber) return;
    const success = await copyToClipboard(bankAccount.accountNumber);
    if (success) {
      toast.success("Account number copied to clipboard");
    } else {
      toast.error("Failed to copy account number");
    }
  };

  const cardBgColor = bankAccount.color || "#f97316"; // Default orange color
  const maskedAccountNumber = maskAccountNumber(bankAccount.accountNumber);
  const accountTypeLabel = bankAccount.accountType
    ? bankAccount.accountType.charAt(0).toUpperCase() + bankAccount.accountType.slice(1).toLowerCase()
    : "";

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine text color based on background brightness
  const getTextColor = (bgColor: string) => {
    if (bgColor === "#f3f4f6" || !bgColor) return "text-gray-900";
    return "text-white";
  };

  const textColor = getTextColor(cardBgColor);

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <Link href="/bank-account" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Accounts</span>
        </Link>
        <div className="flex gap-2">
          <Button variant="default" onClick={handleEdit}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Large Account Summary Card */}
      <Card
        className={cn(
          "border-0 overflow-hidden",
          cardBgColor && cardBgColor !== "#f3f4f6" && "border-0"
        )}
        style={{ backgroundColor: cardBgColor }}
      >
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Bank info and balance */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {bankAccount.icon && (
                  <span className="text-4xl" role="img" aria-label="Bank account icon">
                    {bankAccount.icon}
                  </span>
                )}
                <div>
                  <h2 className={cn("text-2xl font-bold mb-1", textColor)}>
                    {bankAccount.bankName || bankAccount.name}
                  </h2>
                  {bankAccount.description && (
                    <p className={cn("text-sm opacity-80", textColor)}>
                      {bankAccount.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {accountTypeLabel && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs font-normal px-2 py-0.5",
                          textColor === "text-white"
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-gray-200 text-gray-700"
                        )}
                      >
                        {accountTypeLabel}
                      </Badge>
                    )}
                    <Badge
                      variant={bankAccount.isActive ? "default" : "secondary"}
                      className={cn(
                        "text-xs font-normal px-2 py-0.5",
                        bankAccount.isActive && textColor === "text-white"
                          ? "bg-white/20 text-white border-white/30"
                          : ""
                      )}
                    >
                      {bankAccount.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className={cn("text-xs font-medium mb-1 opacity-80", textColor)}>
                  CURRENT BALANCE
                </p>
                <p className={cn("text-4xl font-bold", textColor)}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>

            {/* Right side - Account details */}
            <div className="space-y-4">
              {bankAccount.accountNumber && (
                <div>
                  <p className={cn("text-xs font-medium mb-1 opacity-80", textColor)}>
                    ACCOUNT NUMBER
                  </p>
                  <div className="flex items-center gap-2">
                    <p className={cn("text-lg font-semibold font-mono", textColor)}>
                      {maskedAccountNumber}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        textColor === "text-white"
                          ? "text-white hover:bg-white/20"
                          : "text-gray-700"
                      )}
                      onClick={handleCopyAccountNumber}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {bankAccount.ifscCode && (
                <div>
                  <p className={cn("text-xs font-medium mb-1 opacity-80", textColor)}>
                    IFSC CODE
                  </p>
                  <p className={cn("text-lg font-semibold", textColor)}>
                    {bankAccount.ifscCode}
                  </p>
                </div>
              )}

              {bankAccount.accountOpeningDate && (
                <div>
                  <p className={cn("text-xs font-medium mb-1 opacity-80", textColor)}>
                    OPENED
                  </p>
                  <p className={cn("text-lg font-semibold", textColor)}>
                    {formatDate(bankAccount.accountOpeningDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income and Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Income Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  +{formatCurrency(totalIncome)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Expense Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Expense</p>
                <p className="text-2xl font-bold text-red-600">
                  -{formatCurrency(totalExpense)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

