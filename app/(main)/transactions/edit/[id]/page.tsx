import React from "react";
import BackButton from "@/components/custom-componetns/back-button";
import { EditTransactionForm } from "./_components/EditTransactionForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTransaction, getCategories, getBankAccounts } from "@/action/bank-account";
import { Category, BankAccount } from "@/lib/schema/bank-account-types";
import { notFound } from "next/navigation";

type ParamsType = {
    params: Promise<{ id: string }>;
};

/**
 * Edit Transaction Page
 * Page for editing an existing transaction
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
        <div className="edit-transaction-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                        Edit Transaction
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update transaction details
                    </p>
                </div>
            </div>

            <EditTransactionForm
                transaction={transaction}
                categories={categories}
                bankAccounts={bankAccounts}
            />
        </div>
    );
};

export default EditTransactionPage;

