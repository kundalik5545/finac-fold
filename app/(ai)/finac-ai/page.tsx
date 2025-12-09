import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getChats, Chat } from "@/action/ai-chat";
import { ChatInterface } from "./_components/ChatInterface";

export default async function FinacAIPage() {
    let chats: Chat[] = [];

    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (session?.user) {
            chats = await getChats(session.user.id);
        }
    } catch (error) {
        console.error("Error fetching chats:", error);
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex-shrink-0 bg-background">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                    Finac AI Assistant
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Ask questions about your finances and get insights
                </p>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
                <ChatInterface initialChats={chats} />
            </div>
        </div>
    );
}
