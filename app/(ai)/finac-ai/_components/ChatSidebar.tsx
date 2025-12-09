"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
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

    const handleDelete = async () => {
        if (deleteChatId) {
            await onDeleteChat(deleteChatId);
            setDeleteChatId(null);
        }
    };

    return (
        <div className="w-64 border-r flex flex-col h-full">
            <div className="p-4 border-b">
                <Button onClick={onNewChat} className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted ${activeChatId === chat.id ? "bg-muted" : ""
                                }`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{chat.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(chat.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteChatId(chat.id);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
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

