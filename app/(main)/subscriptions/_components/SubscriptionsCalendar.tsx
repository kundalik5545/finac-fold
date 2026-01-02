"use client";

import { useMemo } from "react";
import { Subscription } from "@/lib/subscriptions-types";
import { isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, format, startOfWeek, endOfWeek } from "date-fns";

export function SubscriptionsCalendar({
    subscriptions,
}: {
    subscriptions: Subscription[];
}) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Group subscriptions by their due date
    const subscriptionsByDate = useMemo(() => {
        const map = new Map<string, Subscription[]>();
        subscriptions.forEach((sub) => {
            const dateKey = format(new Date(sub.nextDueDate), "yyyy-MM-dd");
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(sub);
        });
        return map;
    }, [subscriptions]);

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const isToday = (date: Date) => {
        return isSameDay(date, today);
    };

    // Helper function to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Group days into weeks
    const weeks = useMemo(() => {
        const weeksArray: Date[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeksArray.push(days.slice(i, i + 7));
        }
        return weeksArray;
    }, [days]);

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Week day headers */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-center py-2 text-sm font-medium text-muted-foreground">
                {weekDays.map((day) => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="border-l border-border">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7">
                        {week.map((day) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const daySubscriptions = subscriptionsByDate.get(dateKey) || [];
                            const isCurrentMonthDay = isCurrentMonth(day);
                            const isTodayDay = isToday(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`relative h-24 sm:h-32 border-b border-r border-border p-2 transition-colors hover:bg-muted/20 ${!isCurrentMonthDay ? "bg-muted/30 text-muted-foreground" : ""
                                        } ${isTodayDay ? "bg-primary/5" : ""}`}
                                >
                                    <span
                                        className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${isTodayDay
                                                ? "bg-primary text-primary-foreground"
                                                : ""
                                            }`}
                                    >
                                        {format(day, "d")}
                                    </span>
                                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                                        {daySubscriptions.slice(0, 2).map((sub) => {
                                            const color = sub.color || "#6b7280";
                                            const icon = sub.icon || sub.name.charAt(0).toUpperCase();
                                            return (
                                                <div
                                                    key={sub.id}
                                                    className="text-xs px-1.5 py-0.5 rounded truncate"
                                                    style={{
                                                        backgroundColor: hexToRgba(color, 0.2),
                                                        color: color,
                                                    }}
                                                    title={sub.name}
                                                >
                                                    {icon} {sub.name}
                                                </div>
                                            );
                                        })}
                                        {daySubscriptions.length > 2 && (
                                            <div className="text-xs text-muted-foreground px-1.5">
                                                +{daySubscriptions.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

