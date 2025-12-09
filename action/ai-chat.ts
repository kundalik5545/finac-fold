"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  responseType: "TEXT" | "TABLE" | "CHART" | null;
  metadata: any;
  createdAt: Date;
}

/**
 * Create a new chat
 */
export async function createChat(
  userId: string,
  title?: string
): Promise<Chat> {
  try {
    const chat = await prisma.chat.create({
      data: {
        title: title || "New Chat",
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return {
      ...chat,
      messages: chat.messages.map((m) => ({
        ...m,
        role: m.role as "USER" | "ASSISTANT",
        responseType: m.responseType as "TEXT" | "TABLE" | "CHART" | null,
      })),
    };
  } catch (error) {
    console.error("Error creating chat:", error);
    throw new Error("Failed to create chat");
  }
}

/**
 * Get all chats for a user
 */
export async function getChats(userId: string): Promise<Chat[]> {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: 1, // Only get first message for preview
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chats.map((chat) => ({
      ...chat,
      messages: chat.messages.map((m) => ({
        ...m,
        role: m.role as "USER" | "ASSISTANT",
        responseType: m.responseType as "TEXT" | "TABLE" | "CHART" | null,
      })),
    }));
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw new Error("Failed to fetch chats");
  }
}

/**
 * Get a single chat with all messages
 */
export async function getChat(
  chatId: string,
  userId: string
): Promise<Chat | null> {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return null;
    }

    return {
      ...chat,
      messages: chat.messages.map((m) => ({
        ...m,
        role: m.role as "USER" | "ASSISTANT",
        responseType: m.responseType as "TEXT" | "TABLE" | "CHART" | null,
      })),
    };
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw new Error("Failed to fetch chat");
  }
}

/**
 * Delete a chat
 */
export async function deleteChat(
  chatId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new Error("Failed to delete chat");
  }
}

/**
 * Save a message to a chat
 */
export async function saveMessage(
  chatId: string,
  role: "USER" | "ASSISTANT",
  content: string,
  responseType?: "TEXT" | "TABLE" | "CHART",
  metadata?: any
): Promise<ChatMessage> {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        role,
        content,
        responseType: responseType || null,
        metadata: metadata || null,
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // Update chat title if it's the first user message
    if (role === "USER") {
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            where: { role: "USER" },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      });

      if (chat && chat.messages.length === 1 && chat.title === "New Chat") {
        // Generate title from first message (first 50 chars)
        const title =
          content.length > 50 ? content.substring(0, 50) + "..." : content;
        await prisma.chat.update({
          where: { id: chatId },
          data: { title },
        });
      }
    }

    return {
      ...message,
      role: message.role as "USER" | "ASSISTANT",
      responseType: message.responseType as "TEXT" | "TABLE" | "CHART" | null,
    };
  } catch (error) {
    console.error("Error saving message:", error);
    throw new Error("Failed to save message");
  }
}

/**
 * Update chat title
 */
export async function updateChatTitle(
  chatId: string,
  userId: string,
  title: string
): Promise<void> {
  try {
    // Verify ownership
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        title,
      },
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    throw new Error("Failed to update chat title");
  }
}
