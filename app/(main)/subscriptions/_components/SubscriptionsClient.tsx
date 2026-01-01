"use client";

import { useState, useMemo } from "react";
import { Subscription } from "@/lib/subscriptions-types";
import { SubscriptionsCalendar } from "./SubscriptionsCalendar";
import { ActiveSubscriptionsList } from "./ActiveSubscriptionsList";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SubscriptionsClient({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return subscriptions;
    }
    return subscriptions.filter((sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscriptions, searchQuery]);

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage recurring payments and never miss a due date.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Content: Calendar and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        {/* Left Panel - Calendar */}
        <div className="w-full">
          <SubscriptionsCalendar subscriptions={subscriptions} />
        </div>

        {/* Right Sidebar - Active Subscriptions */}
        <ActiveSubscriptionsList subscriptions={filteredSubscriptions} />
      </div>
    </div>
  );
}

