"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatSidebar } from "./ChatSidebar";
import { Chat, ChatMessage as ChatMessageType } from "@/action/ai-chat";
import { Spinner } from "@/components/ui/spinner";
import { Bot } from "lucide-react";

interface ChatInterfaceProps {
    initialChats: Chat[];
    initialChatId?: string | null;
}

export function ChatInterface({ initialChats, initialChatId }: ChatInterfaceProps) {
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load chat messages when active chat changes
    useEffect(() => {
        if (activeChatId) {
            loadChat(activeChatId);
        } else {
            setMessages([]);
        }
    }, [activeChatId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    const loadChat = async (chatId: string) => {
        try {
            const response = await fetch(`/api/ai/chat/${chatId}`, {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.chat.messages || []);
            }
        } catch (error) {
            console.error("Error loading chat:", error);
        }
    };

    const handleNewChat = async () => {
        // Simply reset to no active chat - new chat will be created when first message is sent
        setActiveChatId(null);
        setMessages([]);
        setStreamingContent("");
    };

    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);
        setStreamingContent("");
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            const response = await fetch(`/api/ai/chat/${chatId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                setChats(chats.filter((c) => c.id !== chatId));
                if (activeChatId === chatId) {
                    setActiveChatId(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const handleSend = async (message: string) => {
        if (!message.trim()) return;

        setLoading(true);
        setStreamingContent("");

        // Chat will be created by the API if chatId is null
        let currentChatId = activeChatId;

        // Add user message optimistically (will be replaced when we reload from DB)
        const tempUserMessage: ChatMessageType = {
            id: `temp-user-${Date.now()}`,
            chatId: currentChatId || "",
            role: "USER",
            content: message,
            responseType: null,
            metadata: null,
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, tempUserMessage]);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ chatId: currentChatId, message }),
            });

            if (!response.ok) {
                let errorMessage = "Failed to send message";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let receivedChatId = currentChatId;

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.slice(6));

                                // Update chatId if provided (for new chats)
                                if (data.chatId && !receivedChatId) {
                                    receivedChatId = data.chatId;
                                    setActiveChatId(data.chatId);
                                    currentChatId = data.chatId;
                                }

                                if (data.done) {
                                    // Final message received - reload chat from database to get saved messages
                                    setStreamingContent("");

                                    if (receivedChatId) {
                                        // Update active chat ID if it was a new chat
                                        if (!currentChatId) {
                                            setActiveChatId(receivedChatId);
                                        }

                                        // Reload the chat to get all saved messages (this will replace temp messages)
                                        await loadChat(receivedChatId);
                                    } else if (currentChatId) {
                                        // Reload existing chat
                                        await loadChat(currentChatId);
                                    }

                                    // Reload chats list to update titles
                                    const chatsResponse = await fetch("/api/ai/chats", {
                                        credentials: "include",
                                    });
                                    if (chatsResponse.ok) {
                                        const chatsData = await chatsResponse.json();
                                        setChats(chatsData.chats);
                                    }
                                } else if (data.content) {
                                    setStreamingContent((prev) => prev + data.content);
                                }
                            } catch (e) {
                                console.error("Error parsing stream data:", e);
                                // Continue processing other lines
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessageType = {
                id: `error-${Date.now()}`,
                chatId: currentChatId || "",
                role: "ASSISTANT",
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
                responseType: "TEXT",
                metadata: null,
                createdAt: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            setStreamingContent("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full overflow-hidden relative">
            <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div 
                    className="flex-1 overflow-y-auto overflow-x-auto" 
                    ref={scrollAreaRef}
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="space-y-4 p-4 min-h-full" style={{ minWidth: 'max-content' }}>
                        {messages.length === 0 && !streamingContent && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ask me anything about your finances
                                </p>
                            </div>
                        )}
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        {streamingContent && (
                            <div className="flex gap-4 p-4 w-full min-w-0">
                                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium">AI Assistant</div>
                                    <div className="text-sm whitespace-pre-wrap break-words">{streamingContent}</div>
                                    {loading && <Spinner className="inline-block ml-2" />}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="border-t bg-background shrink-0">
                    <ChatInput onSend={handleSend} disabled={loading} />
                </div>
            </div>
        </div>
    );
}

