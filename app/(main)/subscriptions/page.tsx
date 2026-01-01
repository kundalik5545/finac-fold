import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSubscriptions } from "@/action/subscriptions";
import { SubscriptionsClient } from "./_components/SubscriptionsClient";

export default async function SubscriptionsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return (
            <div className="p-6">
                <p>Please sign in to view your subscriptions.</p>
            </div>
        );
    }

    const subscriptions = await getSubscriptions(session.user.id);

    return <SubscriptionsClient subscriptions={subscriptions} />;
}

