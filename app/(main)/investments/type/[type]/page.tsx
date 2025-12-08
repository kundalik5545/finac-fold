import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getInvestments, getInvestmentStats } from "@/action/investments";
import { InvestmentType, InvestmentStats } from "@/lib/types/investments-types";
import { InvestmentTypeDetailClient } from "./_components/InvestmentTypeDetailClient";
import BackButton from "@/components/custom-componetns/back-button";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supportsPriceFetching } from "@/lib/utils/investment-utils";
import { FetchPricesButton } from "./_components/FetchPricesButton";

type ParamsType = { params: Promise<{ type: string }> };

export default async function InvestmentTypeDetailPage({
  params,
}: ParamsType) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { type } = await params;

  if (!session?.user) {
    notFound();
  }

  // Validate investment type
  const investmentType = type.toUpperCase() as InvestmentType;
  const validTypes = Object.values(InvestmentType);
  if (!validTypes.includes(investmentType)) {
    notFound();
  }

  let investments = [];
  let stats: InvestmentStats | null = null;

  try {
    investments = await getInvestments(session.user.id, investmentType);
    const statsResult = await getInvestmentStats(session.user.id, investmentType);
    // When type is provided, stats should be InvestmentStats
    stats = statsResult as InvestmentStats;
  } catch (error) {
    console.error("Error fetching investments:", error);
    notFound();
  }

  const canFetchPrices = supportsPriceFetching(investmentType);

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-4 flex items-center justify-between">
        <BackButton />
        <div className="flex gap-2">
          {canFetchPrices && <FetchPricesButton investments={investments} />}
          <Button asChild>
            <Link
              href={`/investments/add?type=${type}`}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Investment
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <InvestmentTypeDetailClient
          type={investmentType}
          investments={investments}
          stats={stats}
        />
      </div>
    </div>
  );
}

