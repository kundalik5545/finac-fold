"use client";

import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Edit, Trash, Copy, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { BankAccount } from "@/lib/schema/bank-account-types";
import { cn } from "@/lib/utils";
import { maskAccountNumber, copyToClipboard } from "@/lib/utils/bank-account-helpers";
import getContrastTextColor from "@/lib/utils/text-color-finder";

interface BankAccountCardProps {
  bankAccount: BankAccount & { calculatedBalance?: number };
  userName?: string;
}

export function BankAccountCard({ bankAccount, userName = "Account Holder" }: BankAccountCardProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);

  // Use background color from database, default to light gray if not provided
  const cardBgColor = bankAccount.color || "#f3f4f6";

  // Get text color class using utility function
  const textColorClass = useMemo(
    () => getContrastTextColor(cardBgColor),
    [cardBgColor]
  );

  // Determine if we should use white text styling (for dark backgrounds)
  const isWhiteText = textColorClass === "text-white";

  const handleDelete = useCallback(
    async (
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
          let errorMsg = "Failed to delete bank account";
          try {
            const text = await response.text();
            if (text) {
              const errorData = JSON.parse(text);
              errorMsg = errorData.error || errorMsg;
            }
          } catch { /* ignore */ }
          toast.error(errorMsg);
        }
      } catch {
        toast.error("Failed to delete bank account");
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          [`delete-${accountId}`]: false,
        }));
      }
    },
    [router]
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, accountId: string) => {
      e.stopPropagation();
      router.push(`/bank-account/edit/${accountId}`);
    },
    [router]
  );

  const handleCardClick = useCallback(() => {
    router.push(`/bank-account/${bankAccount.id}`);
  }, [router, bankAccount.id]);

  const handleCopyAccountNumber = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, accountNumber: string) => {
      e.stopPropagation();
      const success = await copyToClipboard(accountNumber);
      if (success) {
        toast.success("Account number copied to clipboard");
      } else {
        toast.error("Failed to copy account number");
      }
    },
    []
  );

  // Computed values
  const balance = bankAccount.calculatedBalance ?? bankAccount.startingBalance;
  const maskedAccountNumber = useMemo(
    () => maskAccountNumber(bankAccount.accountNumber),
    [bankAccount.accountNumber]
  );
  const accountTypeLabel = useMemo(() => {
    if (!bankAccount.accountType) return "";
    return (
      bankAccount.accountType.charAt(0).toUpperCase() +
      bankAccount.accountType.slice(1).toLowerCase()
    );
  }, [bankAccount.accountType]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 cursor-pointer shadow-lg transition-shadow hover:shadow-xl",
        textColorClass
      )}
      style={{ backgroundColor: cardBgColor }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative blur circles */}
      <div
        className={cn(
          "absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl",
          isWhiteText ? "bg-white/10" : "bg-black/5"
        )}
      />
      <div
        className={cn(
          "absolute -left-10 -bottom-10 h-40 w-40 rounded-full blur-3xl",
          isWhiteText ? "bg-black/5" : "bg-black/5"
        )}
      />

      {/* Header Section */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          {/* Icon Container */}
          <div
            className={cn(
              "h-10 w-10 rounded-lg backdrop-blur-md flex items-center justify-center border",
              isWhiteText
                ? "bg-white/20 border-white/10"
                : "bg-black/10 border-black/10"
            )}
          >
            {bankAccount.icon ? (
              <span className="text-xl" role="img" aria-label="Bank account icon">
                {bankAccount.icon}
              </span>
            ) : (
              <Landmark className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">
              {bankAccount.bankName || bankAccount.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {accountTypeLabel && (
                <span
                  className={cn(
                    "text-xs font-medium backdrop-blur-sm px-2 py-0.5 rounded-full border",
                    isWhiteText
                      ? "bg-white/20 border-white/10"
                      : "bg-black/10 border-black/10"
                  )}
                >
                  {accountTypeLabel}
                </span>
              )}
              <span
                className={cn(
                  "text-xs font-medium backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm",
                  bankAccount.isActive
                    ? "bg-emerald-500/80"
                    : isWhiteText
                      ? "bg-white/20 border border-white/10"
                      : "bg-black/10 border border-black/10"
                )}
              >
                {bankAccount.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons - appear on hover */}
        <div
          className={cn(
            "flex gap-2 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            className={cn(
              "p-1.5 rounded-full transition-colors",
              isWhiteText ? "hover:bg-white/20" : "hover:bg-black/10"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(e, bankAccount.id);
            }}
            disabled={!!loadingStates[`edit-${bankAccount.id}`]}
            aria-label="Edit account"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            className={cn(
              "p-1.5 rounded-full transition-colors",
              isWhiteText ? "hover:bg-white/20" : "hover:bg-black/10"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(e, bankAccount.id, bankAccount.name);
            }}
            disabled={!!loadingStates[`delete-${bankAccount.id}`]}
            aria-label="Delete account"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Available Balance Section */}
      <div className="relative z-10 mt-4 space-y-1">
        <p
          className={cn(
            "text-sm font-medium tracking-wide",
            isWhiteText ? "text-white/70" : "text-black/70"
          )}
        >
          Available Balance
        </p>
        <h2 className="text-3xl font-bold tracking-tight">
          {formatCurrency(balance)}
        </h2>
      </div>

      {/* Footer Section - Account Holder and Account Number */}
      <div className="relative z-10 mt-8 flex justify-between items-end">
        <div>
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider mb-1",
              isWhiteText ? "text-white/60" : "text-black/60"
            )}
          >
            Account Holder
          </p>
          <p className="font-medium">{userName}</p>
        </div>
        {bankAccount.accountNumber && (
          <div className="text-right">
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wider mb-1",
                isWhiteText ? "text-white/60" : "text-black/60"
              )}
            >
              Account Number
            </p>
            <p className="font-mono font-medium tracking-wider flex items-center gap-2">
              {maskedAccountNumber}
              <button
                className="opacity-50 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyAccountNumber(e, bankAccount.accountNumber!);
                }}
                aria-label="Copy account number"
              >
                <Copy className="h-3 w-3" />
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
