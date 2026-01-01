"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Subscription } from "@/lib/subscriptions-types";
import { formatCurrency, calculateMonthlyTotal } from "@/lib/subscriptions-types";
import { isSameDay } from "date-fns";

export function SubscriptionsCalendar({
    subscriptions,
}: {
    subscriptions: Subscription[];
}) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const monthlyTotal = calculateMonthlyTotal(subscriptions);

    // Get dates that have subscription due dates
    const subscriptionDates = subscriptions.map((sub) => sub.nextDueDate);

    // Check if a date has a subscription due
    const isSubscriptionDate = (date: Date) => {
        return subscriptionDates.some((dueDate) => isSameDay(new Date(dueDate), date));
    };

    return (
        <div className="space-y-4">
            {/* Monthly Total */}
            <div className="flex justify-end">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Monthly Total:</p>
                    <p className="text-xl font-bold">{formatCurrency(monthlyTotal)}</p>
                </div>
            </div>

            {/* Calendar */}
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                    hasSubscription: (date) => isSubscriptionDate(date),
                }}
                modifiersClassNames={{
                    hasSubscription: "bg-blue-100 dark:bg-blue-900/30 rounded-full",
                }}
                classNames={{
                    day_selected:
                        "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                }}
            />
        </div>
    );
}

