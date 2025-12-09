import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getChats } from "@/action/ai-chat";

export async function GET() {
  try {
    const headersList = await headers();
    console.log("🔍 GET /api/ai/chats - Headers check:", {
      hasCookie: !!headersList.get("cookie"),
    });
    
    const session = await auth.api.getSession({ headers: headersList });
    
    console.log("🔍 GET /api/ai/chats - Session:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await getChats(session.user.id);

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error: any) {
    console.error("🔍 GET /api/ai/chats - Error:", {
      error,
      message: error?.message,
      status: error?.status,
    });
    return NextResponse.json(
      { error: error?.message || "Failed to fetch chats" },
      { status: error?.status || 500 }
    );
  }
}
