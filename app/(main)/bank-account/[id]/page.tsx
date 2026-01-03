import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBankAccount, calculateBalance, getCategories, getSubCategories } from "@/action/bank-account";
import { BankAccountDetailView } from "./_components/BankAccountDetailView";
import { BankAccountTransactionTable } from "./_components/BankAccountTransactionTable";
import { BankAccountLineChart } from "./_components/BankAccountLineChart";
import { BankAccountCategoryDonutChart } from "./_components/BankAccountCategoryDonutChart";
import prisma from "@/lib/prisma";

type ParamsType = { params: Promise<{ id: string }> };

export default async function BankAccountDetailPage({ params }: ParamsType) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  let bankAccount;
  let balance = 0;
  let categories: any[] = [];
  let subCategories: any[] = [];
  let userName = "Account Holder";

  try {
    bankAccount = await getBankAccount(id, session.user.id);
    balance = await calculateBalance(id, session.user.id);
    categories = await getCategories(session.user.id);

    // Get subcategories for all categories
    const allSubCategories = await Promise.all(
      categories.map((cat) => getSubCategories(cat.id, session.user.id))
    );
    subCategories = allSubCategories.flat();

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
  } catch (error) {
    console.error("Error fetching bank account:", error);
    notFound();
  }

  if (!bankAccount) {
    notFound();
  }

  const transactions = bankAccount.bankTransactions || [];

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="space-y-8">
        {/* Bank Account Detail View */}
        <BankAccountDetailView
          bankAccount={bankAccount}
          transactions={transactions}
          balance={balance}
          userName={userName}
        />

        {/* Charts Section */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BankAccountLineChart transactions={transactions} />
            <BankAccountCategoryDonutChart
              transactions={transactions}
              categories={categories}
            />
          </div>
        )}

        {/* Transaction Table */}
        <div>
          <h2 className="text-xl font-bold mb-4">Transactions</h2>
          <BankAccountTransactionTable
            transactions={transactions}
            categories={categories}
            subCategories={subCategories}
            bankAccountId={bankAccount.id}
          />
        </div>
      </div>
    </div>
  );
}

