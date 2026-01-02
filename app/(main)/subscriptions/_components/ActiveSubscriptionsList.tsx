"use client";

import { Subscription } from "@/lib/subscriptions-types";
import { SubscriptionCard } from "./SubscriptionCard";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export function ActiveSubscriptionsList({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm h-full">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" />
        Active Subscriptions
      </h3>
      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No active subscriptions
          </div>
        ) : (
          subscriptions.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))
        )}
      </div>
      <button
        className="w-full mt-4 py-2 text-sm font-medium text-primary border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
        onClick={() => router.push("/subscriptions/add")}
      >
        + Add Subscription
      </button>
    </div>
  );
}

