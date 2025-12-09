import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getChat, deleteChat, updateChatTitle } from "@/action/ai-chat";

type ParamsType = { params: Promise<{ chatId: string }> };

export async function GET(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const chat = await getChat(chatId, session.user.id);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    await deleteChat(chatId, session.user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: ParamsType) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const { title } = await request.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await updateChatTitle(chatId, session.user.id, title);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}
