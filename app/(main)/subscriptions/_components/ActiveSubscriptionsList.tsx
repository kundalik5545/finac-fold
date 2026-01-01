"use client";

import { Subscription } from "@/lib/subscriptions-types";
import { SubscriptionCard } from "./SubscriptionCard";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function ActiveSubscriptionsList({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const router = useRouter();

  return (
    <div className="w-full lg:w-80 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Active Subscriptions</h2>
      </div>

      <div className="space-y-2">
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

      <Button
        variant="outline"
        className="w-full border-dashed mt-6"
        onClick={() => router.push("/subscriptions/add")}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Subscription
      </Button>
    </div>
  );
}

