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
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{subscription.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFrequency(subscription.frequency)}
        </p>
      </div>
      <p className="font-semibold text-sm">
        {formatCurrency(subscription.amount)}
      </p>
    </div>
  );
}

