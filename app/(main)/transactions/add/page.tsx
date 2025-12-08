import React from "react";
import BackButton from "@/components/custom-componetns/back-button";
import { TransactionForm } from "./_components/TransactionForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCategories, getBankAccounts } from "@/action/bank-account";
import { Category, BankAccount } from "@/lib/schema/bank-account-types";

/**
 * Add Transaction Page
 * Page for adding a new transaction
 */
const AddTransactionPage = async () => {
    let categories: Category[] = [];
    let bankAccounts: BankAccount[] = [];

    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (session?.user) {
            categories = await getCategories(session.user.id);
            bankAccounts = await getBankAccounts(session.user.id);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }

    return (
        <div className="add-transaction-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                        Add Transaction
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create a new transaction
                    </p>
                </div>
            </div>

            <TransactionForm categories={categories} bankAccounts={bankAccounts} />
        </div>
    );
};

export default AddTransactionPage;

