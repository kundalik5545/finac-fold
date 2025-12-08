import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BankAccountClient } from "./_components/BankAccountClient";
import { BankAccountStats } from "./_components/BankAccountStats";
import { getBankAccounts, calculateBalance } from "@/action/bank-account";
import { BankAccount } from "@/lib/schema/bank-account-types";

const BankAccountPage = async () => {
  let bankAccounts: BankAccount[] = [];
  let session;

  try {
    session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      bankAccounts = await getBankAccounts(session.user.id);
    }
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
  }

  // Calculate total balance for all accounts
  let totalBalance = 0;
  if (session?.user) {
    try {
      const balances = await Promise.all(
        bankAccounts.map((account) => calculateBalance(account.id, session.user.id))
      );
      totalBalance = balances.reduce((sum, balance) => sum + balance, 0);
    } catch (error) {
      console.error("Error calculating total balance:", error);
    }
  }

  // Calculate current month spending (sum of all DEBIT transactions this month)
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  let currentMonthSpending = 0;
  try {
    if (session?.user) {
      const { getBankTransactions } = await import("@/action/bank-account");
      for (const account of bankAccounts) {
        try {
          const transactions = await getBankTransactions(account.id, session.user.id);
          const monthTransactions = transactions.filter((t) => {
            const transactionDate = new Date(t.transactionDate);
            return (
              transactionDate >= currentMonth &&
              t.transactionType === "DEBIT"
            );
          });

          currentMonthSpending += monthTransactions.reduce(
            (sum, t) => sum + Number(t.amount || 0),
            0
          );
        } catch (err) {
          console.error(`Error fetching transactions for account ${account.id}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("Error calculating current month spending:", error);
  }

  return (
    <div className="bank-account-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Bank Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your bank accounts and track transactions
          </p>
        </div>
        <Button>
          <Link
            href="/bank-account/add"
            className="flex items-center justify-around"
          >
            <Plus size={16} /> Add Bank Account
          </Link>
        </Button>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <BankAccountStats
          totalAccounts={bankAccounts.length}
          totalBalance={totalBalance}
          currentMonthSpending={currentMonthSpending}
        />
      </section>

      {/* Bank Accounts List and Charts Section */}
      <section className="py-5">
        <BankAccountClient bankAccounts={bankAccounts} />
      </section>
    </div>
  );
};

export default BankAccountPage;

