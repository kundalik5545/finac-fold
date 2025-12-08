import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TransactionClient } from "./_components/TransactionClient";
import {
    getTransactions,
    getCategories,
    getBankAccounts,
} from "@/action/bank-account";
import { Transaction, Category, BankAccount } from "@/lib/schema/bank-account-types";
import { getMonthlyDateRange } from "@/lib/utils/transaction-utils";

/**
 * Transactions Page
 * Main page for viewing and managing all transactions
 */
const TransactionsPage = async () => {
    let transactions: Transaction[] = [];
    let total = 0;
    let categories: Category[] = [];
    let subCategories: { id: string; name: string; categoryId: string }[] = [];
    let bankAccounts: BankAccount[] = [];
    let session;

    try {
        session = await auth.api.getSession({ headers: await headers() });

        if (session?.user) {
            // Get initial date range for monthly preset
            const dateRange = getMonthlyDateRange();

            // Fetch initial transactions (monthly preset)
            const result = await getTransactions(session.user.id, {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                take: 20,
            });
            transactions = result.transactions;
            total = result.total;

            // Fetch categories (includes subcategories)
            categories = await getCategories(session.user.id);
            // Extract subcategories from categories
            subCategories = categories.flatMap((category) =>
                (category.subCategories || []).map((sc) => ({
                    id: sc.id,
                    name: sc.name,
                    categoryId: category.id,
                }))
            );

            // Fetch bank accounts
            bankAccounts = await getBankAccounts(session.user.id);
        }
    } catch (error) {
        console.error("Error fetching transactions data:", error);
    }

    return (
        <div className="transactions-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
            {/* Heading Section */}
            <section className="flex justify-between items-center pb-5">
                <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                        Transactions
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View and manage all your transactions
                    </p>
                </div>
                <Button>
                    <Link
                        href="/transactions/add"
                        className="flex items-center justify-around"
                    >
                        <Plus size={16} /> Add Transaction
                    </Link>
                </Button>
            </section>

            {/* Transactions List and Charts Section */}
            <section className="py-5">
                <TransactionClient
                    initialTransactions={transactions}
                    initialTotal={total}
                    categories={categories}
                    subCategories={subCategories}
                    bankAccounts={bankAccounts}
                />
            </section>
        </div>
    );
};

export default TransactionsPage;

