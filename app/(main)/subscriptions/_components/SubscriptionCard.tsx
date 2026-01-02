"use client";

import { Subscription } from "@/lib/subscriptions-types";
import { formatCurrency, formatFrequency } from "@/lib/subscriptions-types";
import { useRouter } from "next/navigation";

export function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const router = useRouter();
  const icon = subscription.icon || subscription.name.charAt(0).toUpperCase();
  const color = subscription.color || "#6b7280"; // Default gray

  return (
    <div
      onClick={() => router.push(`/subscriptions/edit/${subscription.id}`)}
      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium">{subscription.name}</div>
          <div className="text-xs text-muted-foreground">
            {formatFrequency(subscription.frequency)}
          </div>
        </div>
      </div>
      <div className="font-semibold text-sm">
        {formatCurrency(subscription.amount)}
      </div>
    </div>
  );
}

