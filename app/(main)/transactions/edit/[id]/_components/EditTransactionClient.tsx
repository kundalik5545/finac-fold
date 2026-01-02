"use client";

import { useEffect, useState } from "react";
import { EditTransactionDialog } from "../../../_components/EditTransactionDialog";
import { Transaction, Category, BankAccount } from "@/lib/schema/bank-account-types";

interface EditTransactionClientProps {
    transaction: Transaction;
    categories: Category[];
    bankAccounts: BankAccount[];
}

/**
 * EditTransactionClient Component
 * Client component that manages the dialog state and opens it automatically
 */
export function EditTransactionClient({
    transaction,
    categories,
    bankAccounts,
}: EditTransactionClientProps) {
    const [open, setOpen] = useState(false);

    // Open dialog automatically when component mounts
    useEffect(() => {
        setOpen(true);
    }, []);

    return (
        <EditTransactionDialog
            open={open}
            onOpenChange={setOpen}
            transaction={transaction}
            categories={categories}
            bankAccounts={bankAccounts}
        />
    );
}

