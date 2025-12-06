import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAsset } from "@/action/assets-tracking";
import { AssetDetailView } from "./_components/AssetDetailView";
import { TransactionHistory } from "./_components/TransactionHistory";

type ParamsType = { params: { id: string } };

export default async function AssetDetailPage({ params }: ParamsType) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { id } = await params;

    if (!session?.user) {
        notFound();
    }

    let asset;
    try {
        asset = await getAsset(id, session.user.id);
    } catch (error) {
        console.error("Error fetching asset:", error);
        notFound();
    }

    if (!asset) {
        notFound();
    }

    return (
        <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
            <div className="space-y-8">
                {/* Asset Detail View */}
                <AssetDetailView asset={asset} />

                {/* Transaction History */}
                <TransactionHistory
                    assetId={asset.id}
                    transactions={asset.assetsTransactions || []}
                />
            </div>
        </div>
    );
}

