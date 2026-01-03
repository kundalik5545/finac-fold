import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BankAccountClient } from "./_components/BankAccountClient";
import { BankAccountStats } from "./_components/BankAccountStats";
import { AddBankAccountButton } from "./_components/AddBankAccountButton";
import { getBankAccounts, calculateBalance } from "@/action/bank-account";
import { BankAccount } from "@/lib/schema/bank-account-types";
import prisma from "@/lib/prisma";

const BankAccountPage = async () => {
  let bankAccounts: BankAccount[] = [];
  let session: any | null = null;
  let userName = "Account Holder";

  try {
    session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      bankAccounts = await getBankAccounts(session.user.id);

      // Fetch user name
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true },
        });
        if (user?.name) {
          userName = user.name;
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    }
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
  }

  // Calculate balance for each account
  const accountsWithBalance = await Promise.all(
    bankAccounts.map(async (account) => {
      let balance = 0;
      if (session?.user) {
        try {
          balance = await calculateBalance(account.id, session.user.id);
        } catch (error) {
          console.error(`Error calculating balance for account ${account.id}:`, error);
        }
      }
      return { ...account, calculatedBalance: balance };
    })
  );

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
    <div className="bank-account-page">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div className="mt-7">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Bank Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your bank accounts and track transactions
          </p>
        </div>
        <AddBankAccountButton />
      </section >

      {/* Stats Section */}
      <section className="py-2" >
        <BankAccountStats
          totalAccounts={bankAccounts.length}
          totalBalance={totalBalance}
          currentMonthSpending={currentMonthSpending}
        />
      </section >

      {/* Bank Accounts List and Charts Section */}
      <section className="py-5" >
        <BankAccountClient
          bankAccounts={accountsWithBalance}
          userName={userName}
        />
      </section >
    </div >
  );
};

export default BankAccountPage;

