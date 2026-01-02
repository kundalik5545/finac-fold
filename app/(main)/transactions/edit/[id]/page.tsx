import React from "react";
import { EditTransactionDialog } from "../../_components/EditTransactionDialog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTransaction, getCategories, getBankAccounts } from "@/action/bank-account";
import { Category, BankAccount } from "@/lib/schema/bank-account-types";
import { notFound } from "next/navigation";
import { EditTransactionClient } from "./_components/EditTransactionClient";

type ParamsType = {
    params: Promise<{ id: string }>;
};

/**
 * Edit Transaction Page
 * Page for editing an existing transaction with dialog
 */
const EditTransactionPage = async ({ params }: ParamsType) => {
    const { id } = await params;
    let transaction = null;
    let categories: Category[] = [];
    let bankAccounts: BankAccount[] = [];

    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (session?.user) {
            transaction = await getTransaction(id, session.user.id);
            if (!transaction) {
                notFound();
            }

            categories = await getCategories(session.user.id);
            bankAccounts = await getBankAccounts(session.user.id);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        notFound();
    }

    if (!transaction) {
        notFound();
    }

    return (
        <EditTransactionClient
            transaction={transaction}
            categories={categories}
            bankAccounts={bankAccounts}
        />
    );
};

export default EditTransactionPage;
