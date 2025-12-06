import { notFound } from "next/navigation";
import { EditAssetForm } from "./_components/EditAssetForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAsset } from "@/action/assets-tracking";

type ParamsType = { params: { id: string } };

export default async function EditAssetPage({ params }: ParamsType) {
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
        <div className="container mx-auto md:max-w-3xl px-2 md:px-0 py-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Edit Asset</h1>
                    <p className="text-muted-foreground mt-2">
                        Update the details of your asset
                    </p>
                </div>
                <EditAssetForm asset={asset} />
            </div>
        </div>
    );
}

