"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { BankAccount } from "@/lib/schema/bank-account-types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { maskAccountNumber } from "@/lib/utils/bank-account-helpers";

interface BankAccountTableProps {
    bankAccounts: (BankAccount & { calculatedBalance?: number })[];
    userName?: string;
}

export function BankAccountTable({ bankAccounts, userName = "Account Holder" }: BankAccountTableProps) {
    const { formatCurrency } = useFormatCurrency("en-IN", "INR");
    const router = useRouter();
    const [loadingStates, setLoadingStates] = useState<{
        [key: string]: boolean;
    }>({});

    const handleDelete = async (
        e: React.MouseEvent<HTMLDivElement>,
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
        e: React.MouseEvent<HTMLDivElement>,
        accountId: string
    ) => {
        e.stopPropagation();
        router.push(`/bank-account/edit/${accountId}`);
    };

    const handleRowClick = (accountId: string) => {
        router.push(`/bank-account/${accountId}`);
    };

    const getAccountTypeLabel = (accountType: string | null) => {
        if (!accountType) return "N/A";
        return accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase();
    };

    if (bankAccounts.length === 0) {
        return (
            <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-muted-foreground">
                    No bank accounts found. Add your first bank account to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Bank Name</TableHead>
                        <TableHead>Account No.</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bankAccounts.map((account) => {
                        const balance = account.calculatedBalance ?? account.startingBalance;
                        const maskedAccountNumber = maskAccountNumber(account.accountNumber);

                        return (
                            <TableRow
                                key={account.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleRowClick(account.id)}
                            >
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{account.bankName || account.name}</div>
                                        {account.description && (
                                            <div className="text-sm text-muted-foreground">
                                                {account.description}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm">{maskedAccountNumber}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                        {getAccountTypeLabel(account.accountType)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    {formatCurrency(balance)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-2 w-2 rounded-full ${account.isActive ? "bg-green-500" : "bg-gray-400"
                                                }`}
                                        />
                                        <span className="text-sm">
                                            {account.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuItem
                                                onClick={(e) => handleEdit(e as any, account.id)}
                                                disabled={!!loadingStates[`edit-${account.id}`]}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => handleDelete(e as any, account.id, account.name)}
                                                disabled={!!loadingStates[`delete-${account.id}`]}
                                                className="text-red-600"
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

