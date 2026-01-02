import {
    getBankAccounts,
    getCategories,
    getTransactions,
} from "@/action/bank-account";
import { auth } from "@/lib/auth";
import { BankAccount, Category, Transaction } from "@/lib/schema/bank-account-types";
import { getMonthlyDateRange } from "@/lib/utils/transaction-utils";
import { headers } from "next/headers";
import { TransactionClient } from "./_components/TransactionClient";

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
        <div className="flex-1 overflow-auto p-4 lg:p-8">
            <TransactionClient
                initialTransactions={transactions}
                initialTotal={total}
                categories={categories}
                subCategories={subCategories}
                bankAccounts={bankAccounts}
            />
        </div>
    );
};

export default TransactionsPage;

