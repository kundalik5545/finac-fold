"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardChatHistoryProps {
    chat: {
        id: string;
        title: string;
        updatedAt: Date | string;
    };
    isActive?: boolean;
    onClick?: (chatId: string) => void;
}

function truncateTitle(title: string, maxLength = 25) {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + "...";
}

function formatDate(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
        return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
    }
}

export const CardChatHistory: React.FC<CardChatHistoryProps> = ({
    chat,
    isActive = false,
    onClick,
}) => {
    const needsTruncation = chat.title.length > 25;

    return (
        <div
            className={cn(
                "p-2.5 pr-7 rounded-lg cursor-pointer group transition-all duration-150",
                "border border-transparent hover:border-border hover:bg-accent/50",
                isActive && "bg-accent border-border shadow-sm ring-1 ring-primary/20"
            )}
            role="button"
            tabIndex={0}
            title={chat.title}
            onClick={() => onClick?.(chat.id)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.(chat.id);
                }
            }}
        >
            <div className="flex items-center gap-2 min-w-0">
                <MessageSquare
                    className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                    )}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "text-sm font-medium truncate flex-1",
                                isActive && "text-foreground font-semibold"
                            )}
                            title={chat.title}
                        >
                            {needsTruncation ? truncateTitle(chat.title) : chat.title}
                        </div>
                        {isActive && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                    </div>
                    <div
                        className={cn(
                            "text-xs mt-0.5 transition-opacity duration-150",
                            "opacity-0 group-hover:opacity-100",
                            isActive && "opacity-100",
                            isActive ? "text-muted-foreground" : "text-muted-foreground/80"
                        )}
                    >
                        {formatDate(chat.updatedAt)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardChatHistory;
