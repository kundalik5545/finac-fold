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
      setLoadingStates((prev) => ({
        ...prev,
        [`delete-${accountId}`]: false,
      }));
    }
  };

  const handleEdit = (
    e: React.MouseEvent<HTMLButtonElement>,
    accountId: string
  ) => {
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
        "relative cursor-pointer hover:shadow-xl hover:scale-[1.018] transition-all ring-1 ring-muted/20",
        cardBgColor && "border-0"
      )}
      style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between gap-x-3 gap-y-0">
          <div className="flex items-center gap-2">
            {bankAccount.icon && (
              <span
                className={cn(
                  "text-4xl drop-shadow",
                  !bankAccount.isActive && "opacity-60"
                )}
                role="img"
                aria-label="Bank account icon"
              >
                {bankAccount.icon}
              </span>
            )}
            <span className="flex flex-col">
              <span className="font-semibold text-lg leading-snug truncate max-w-[160px]">
                {bankAccount.name}
              </span>
              <div className="flex gap-1 mt-0.5">
                {bankAccount.accountType && (
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal px-2 py-0"
                  >
                    {bankAccount.accountType.charAt(0).toUpperCase() + bankAccount.accountType.slice(1).toLowerCase()}
                  </Badge>
                )}
                <Badge
                  variant={bankAccount.isActive ? "default" : "secondary"}
                  className="text-xs font-normal px-2 py-0"
                >
                  {bankAccount.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </span>
          </div>
          <div className="flex gap-0.5 ml-2">
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
              onClick={(e) =>
                handleDelete(e, bankAccount.id, bankAccount.name)
              }
              disabled={!!loadingStates[`delete-${bankAccount.id}`]}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-5 px-5">
        <div className="flex items-center justify-between gap-x-6 flex-wrap">
          {bankAccount.bankName && (
            <div className="flex items-center gap-2 text-sm mt-1 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="truncate">{bankAccount.bankName}</span>
            </div>
          )}
          {bankAccount.accountNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <CreditCard className="h-4 w-4" />
              <span className="truncate">{bankAccount.accountNumber}</span>
            </div>
          )}
        </div>

        <hr className="my-3 border-muted/20" />

        <div className="flex items-center justify-between mt-1">
          <span className="text-muted-foreground text-sm">
            Starting Balance
          </span>
          <span className="font-semibold text-lg">
            {formatCurrency(bankAccount.startingBalance)}
          </span>
        </div>
        {bankAccount.accountOpeningDate && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-muted-foreground text-xs">
              Opened
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              {formatDate(bankAccount.accountOpeningDate)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

