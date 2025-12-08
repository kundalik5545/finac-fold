"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Edit, Trash, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BankAccount } from "@/lib/bank-account-types";
import { cn } from "@/lib/utils";

export function BankAccountCard({ bankAccount }: { bankAccount: BankAccount }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    accountId: string,
    accountName: string
  ) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${accountName}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${accountId}`]: true }));

    try {
      const response = await fetch(`/api/bank-account/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Bank account deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete bank account");
      }
    } catch (error) {
      toast.error("Failed to delete bank account");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${accountId}`]: false }));
    }
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, accountId: string) => {
    e.stopPropagation();
    router.push(`/bank-account/edit/${accountId}`);
  };

  const handleCardClick = () => {
    router.push(`/bank-account/${bankAccount.id}`);
  };

  const cardBgColor = bankAccount.color || undefined;

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-shadow",
        cardBgColor && "border-0"
      )}
      style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {bankAccount.icon && (
              <span className="text-3xl" role="img" aria-label="Bank account icon">
                {bankAccount.icon}
              </span>
            )}
            <h3 className="font-semibold text-lg">{bankAccount.name}</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleEdit(e, bankAccount.id)}
              disabled={!!loadingStates[`edit-${bankAccount.id}`]}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleDelete(e, bankAccount.id, bankAccount.name)}
              disabled={!!loadingStates[`delete-${bankAccount.id}`]}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank Name */}
        {bankAccount.bankName && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{bankAccount.bankName}</span>
          </div>
        )}

        {/* Account Type */}
        {bankAccount.accountType && (
          <Badge variant="outline" className="w-fit">
            {bankAccount.accountType}
          </Badge>
        )}

        {/* Account Number */}
        {bankAccount.accountNumber && (
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {bankAccount.accountNumber}
            </span>
          </div>
        )}

        {/* Starting Balance */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Starting Balance</span>
            <span className="font-semibold">
              {formatCurrency(bankAccount.startingBalance)}
            </span>
          </div>
        </div>

        {/* Account Opening Date */}
        {bankAccount.accountOpeningDate && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Opened: {formatDate(bankAccount.accountOpeningDate)}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2">
          <Badge variant={bankAccount.isActive ? "default" : "secondary"}>
            {bankAccount.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

