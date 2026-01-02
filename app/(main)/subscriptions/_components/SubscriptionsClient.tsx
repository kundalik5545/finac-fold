"use client";

import { Subscription } from "@/lib/subscriptions-types";
import { SubscriptionsCalendar } from "./SubscriptionsCalendar";
import { ActiveSubscriptionsList } from "./ActiveSubscriptionsList";
import { calculateMonthlyTotal, formatCurrency } from "@/lib/subscriptions-types";

export function SubscriptionsClient({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const monthlyTotal = calculateMonthlyTotal(subscriptions);

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage recurring payments and never miss a due date.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-lg border border-border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">
              Monthly Total:
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(monthlyTotal)}
            </div>
          </div>
        </div>

        {/* Main Content: Calendar and Sidebar */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel - Calendar */}
          <div className="lg:col-span-3">
            <SubscriptionsCalendar subscriptions={subscriptions} />
          </div>

          {/* Right Sidebar - Active Subscriptions */}
          <div className="lg:col-span-1">
            <ActiveSubscriptionsList subscriptions={subscriptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

