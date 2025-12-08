import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getInvestment } from "@/action/investments";
import { InvestmentDetailView } from "./_components/InvestmentDetailView";
import { InvestmentTransactionHistory } from "./_components/InvestmentTransactionHistory";
import { UpdatePriceButton } from "./_components/UpdatePriceButton";
import BackButton from "@/components/custom-componetns/back-button";
import { supportsPriceFetching } from "@/lib/utils/investment-utils";
import { InvestmentType } from "@/lib/types/investments-types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type ParamsType = { params: Promise<{ id: string }> };

export default async function InvestmentDetailPage({
  params,
}: ParamsType) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  let investment;
  try {
    investment = await getInvestment(id, session.user.id);
  } catch (error) {
    console.error("Error fetching investment:", error);
    notFound();
  }

  if (!investment) {
    notFound();
  }

  const canFetchPrices = supportsPriceFetching(investment.type);
  const isGoldType = investment.type === InvestmentType.GOLD;
  const requiresManualTransactions =
    !canFetchPrices &&
    !isGoldType &&
    (investment.type === "FIXED_DEPOSIT" ||
      investment.type === "NPS" ||
      investment.type === "PF");

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-4 flex items-center justify-between">
        <BackButton />
        <div className="flex gap-2">
          {(canFetchPrices || isGoldType) && <UpdatePriceButton investment={investment} />}
          {requiresManualTransactions && (
            <Button asChild>
              <Link
                href={`/investments/${id}?action=add-transaction`}
                className="flex items-center gap-2"
              >
                <Plus size={16} /> Add Transaction
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Investment Detail View */}
        <InvestmentDetailView investment={investment} />

        {/* Transaction History */}
        <InvestmentTransactionHistory
          investmentId={investment.id}
          transactions={investment.investmentTransactions || []}
          priceHistory={investment.investmentPriceHistory || []}
          investmentType={investment.type}
        />
      </div>
    </div>
  );
}

