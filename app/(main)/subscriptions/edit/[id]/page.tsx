import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSubscription } from "@/action/subscriptions";
import { EditSubscriptionForm } from "./_components/EditSubscriptionForm";
import BackButton from "@/components/custom-componetns/back-button";

type ParamsType = { params: Promise<{ id: string }> };

export default async function EditSubscriptionPage({
    params,
}: ParamsType) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { id } = await params;

    if (!session?.user) {
        notFound();
    }

    let subscription;
    try {
        subscription = await getSubscription(id, session.user.id);
    } catch (error) {
        console.error("Error fetching subscription:", error);
        notFound();
    }

    if (!subscription) {
        notFound();
    }

    return (
        <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
            <div className="mb-4">
                <BackButton />
            </div>
            <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold">Edit Subscription</h1>
                <EditSubscriptionForm subscription={subscription} />
            </div>
        </div>
    );
}

