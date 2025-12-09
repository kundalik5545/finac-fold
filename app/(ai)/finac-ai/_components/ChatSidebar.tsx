"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Chat } from "@/action/ai-chat";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import CardChatHistory from "./CardChatHistory";

interface ChatSidebarProps {
    chats: Chat[];
    activeChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({
    chats,
    activeChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
}: ChatSidebarProps) {
    const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("chat-sidebar-collapsed");
            return saved === "true";
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("chat-sidebar-collapsed", String(isCollapsed));
        }
    }, [isCollapsed]);

    const handleDelete = async () => {
        if (deleteChatId) {
            await onDeleteChat(deleteChatId);
            setDeleteChatId(null);
        }
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
            return "Today";
        } else if (d.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
    };

    if (isCollapsed) {
        return (
            <div className="w-12 border-r flex flex-col h-full bg-muted/30 shrink-0 items-center py-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mb-2"
                    onClick={() => setIsCollapsed(false)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onNewChat}
                    title="New Chat"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="w-64 border-r flex flex-col h-full bg-background shrink-0 transition-all duration-200">
            <div className="p-2.5 border-b bg-background sticky top-0 z-10 flex items-center gap-2">
                <Button onClick={onNewChat} className="flex-1" size="sm" variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setIsCollapsed(true)}
                    title="Hide chat history"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-1.5 pr-0 space-y-0.5">
                    {chats.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                No chats yet. Start a new conversation!
                            </p>
                        </div>
                    ) : (
                        chats.map((chat) => {
                            // Truncate title to fit in one line (approximately 30-35 characters)
                            const truncateTitle = (title: string, maxLength: number = 35) => {
                                if (title.length <= maxLength) return title;
                                return title.substring(0, maxLength).trim() + "...";
                            };

                            const isActive = activeChatId === chat.id;
                            const needsTruncation = chat.title.length > 25;
                            console.log("🚀🚀🚀 chat.title:", chat.title.length);

                            return (
                                <div
                                    key={chat.id}
                                    className={cn(
                                        "group relative rounded-lg cursor-pointer transition-all duration-150 mr-2",
                                        "hover:bg-accent/50 border border-transparent hover:border-border",
                                        isActive
                                            ? "bg-accent border-border shadow-sm ring-1 ring-primary/20"
                                            : "bg-card"
                                    )}
                                    onClick={() => onSelectChat(chat.id)}
                                >
                                    {/* <div className="p-2.5 pr-7">
                                        <div className="flex items-center gap-2 max-w-[50px]">
                                            <MessageSquare className={cn(
                                                "h-3.5 w-3.5 shrink-0",
                                                isActive ? "text-primary" : "text-muted-foreground"
                                            )} />
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
                                                <div className={cn(
                                                    "text-xs mt-0.5 transition-opacity duration-150",
                                                    "opacity-0 group-hover:opacity-100",
                                                    isActive && "opacity-100",
                                                    isActive ? "text-muted-foreground" : "text-muted-foreground/80"
                                                )}>
                                                    {formatDate(chat.updatedAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}

                                    <CardChatHistory chat={chat} isActive={isActive} onClick={() => onSelectChat(chat.id)} />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                                            "hover:bg-destructive/10 hover:text-destructive"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteChatId(chat.id);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
            <AlertDialog open={deleteChatId !== null} onOpenChange={(open) => !open && setDeleteChatId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this chat? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

