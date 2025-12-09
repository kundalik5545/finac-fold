import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createChat, getChat, saveMessage } from "@/action/ai-chat";
import {
  streamChatCompletion,
  getSystemPrompt,
} from "@/lib/utils/openai-client";
import { executeQuery, QueryParams } from "@/lib/utils/ai-query-builder";
import { formatResponse } from "@/lib/utils/ai-response-formatter";

export async function POST(request: NextRequest) {
  try {
    // Check OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 500 }
      );
    }

    // Authenticate user
    let session;
    try {
      const headersList = await headers();
      session = await auth.api.getSession({ headers: headersList });
    } catch (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication failed. Please sign in again." },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to Finac Fold to continue." },
        { status: 401 }
      );
    }

    const { chatId, message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get or create chat
    let chat;
    if (chatId) {
      chat = await getChat(chatId, session.user.id);
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
    } else {
      // Create new chat with title from first message (truncated)
      const title =
        message.length > 50 ? message.substring(0, 50) + "..." : message;
      chat = await createChat(session.user.id, title);
    }

    // Save user message
    await saveMessage(chat.id, "USER", message);

    // Get chat history for context
    const chatHistory = await getChat(chat.id, session.user.id);
    const messages = chatHistory?.messages || [];

    // Build messages for OpenAI
    const openaiMessages = [
      { role: "system" as const, content: getSystemPrompt() },
      ...messages.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        let queryJson: any = null;

        try {
          // Stream OpenAI response
          for await (const chunk of streamChatCompletion(openaiMessages)) {
            if (chunk.done) {
              break;
            }

            if (chunk.content) {
              fullResponse += chunk.content;

              // Try to extract JSON query from response
              if (!queryJson) {
                // Look for JSON block in the response
                const jsonMatch = fullResponse.match(
                  /```json\s*([\s\S]*?)\s*```/
                );
                if (jsonMatch) {
                  try {
                    queryJson = JSON.parse(jsonMatch[1]);
                  } catch (e) {
                    // Try to find JSON without code block
                    const jsonMatch2 = fullResponse.match(
                      /\{[\s\S]*"queryType"[\s\S]*\}/
                    );
                    if (jsonMatch2) {
                      try {
                        queryJson = JSON.parse(jsonMatch2[0]);
                      } catch (e2) {
                        // Ignore parsing errors
                      }
                    }
                  }
                }
              }

              // Stream content to client
              const data = JSON.stringify({
                content: chunk.content,
                done: false,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // If we found a query, execute it
          if (queryJson && queryJson.entity) {
            try {
              const queryParams: QueryParams = {
                entity: queryJson.entity,
                filters: queryJson.filters,
                aggregation: queryJson.aggregation || null,
                groupBy: queryJson.groupBy || null,
              };

              const queryResult = await executeQuery(
                session.user.id,
                queryParams
              );

              // Format response
              const formatted = formatResponse(
                queryJson.queryType || "TEXT",
                queryResult,
                queryJson.chartType,
                queryJson.explanation || fullResponse
              );

              // Save assistant message with formatted response
              await saveMessage(
                chat.id,
                "ASSISTANT",
                formatted.content || fullResponse,
                formatted.type,
                formatted.table || formatted.chart
                  ? { table: formatted.table, chart: formatted.chart }
                  : null
              );

              // Send formatted response
              const responseData = JSON.stringify({
                done: true,
                chatId: chat.id,
                responseType: formatted.type,
                content: formatted.content,
                table: formatted.table,
                chart: formatted.chart,
              });
              controller.enqueue(encoder.encode(`data: ${responseData}\n\n`));
            } catch (queryError) {
              console.error("Error executing query:", queryError);
              // Save error message
              const errorMessage = `I encountered an error while querying the database: ${
                queryError instanceof Error
                  ? queryError.message
                  : "Unknown error"
              }. ${fullResponse}`;
              await saveMessage(chat.id, "ASSISTANT", errorMessage, "TEXT");

              const errorData = JSON.stringify({
                done: true,
                chatId: chat.id,
                responseType: "TEXT",
                content: errorMessage,
              });
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            }
          } else {
            // No query found, just save text response
            // Only save if we have content
            if (fullResponse.trim()) {
              await saveMessage(chat.id, "ASSISTANT", fullResponse, "TEXT");
            }

            const finalData = JSON.stringify({
              done: true,
              chatId: chat.id,
              responseType: "TEXT",
              content:
                fullResponse ||
                "I'm here to help! Ask me anything about your finances.",
            });

            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          }
        } catch (error) {
          console.error("Error in stream:", error);

          let errorMessage = "I encountered an error. Please try again.";

          if (error instanceof Error) {
            if (
              error.message.includes("privacy") ||
              error.message.includes("data policy")
            ) {
              errorMessage = `OpenRouter Configuration Required: ${error.message}. Please configure your privacy settings at https://openrouter.ai/settings/privacy to allow free model access.`;
            } else {
              errorMessage = `Error: ${error.message}`;
            }
          }

          // Try to save error message
          try {
            await saveMessage(chat.id, "ASSISTANT", errorMessage, "TEXT");
          } catch (saveError) {
            console.error("Error saving error message:", saveError);
          }

          const errorData = JSON.stringify({
            done: true,
            chatId: chat.id,
            error: errorMessage,
            responseType: "TEXT",
            content: errorMessage,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    console.log("🚀🚀🚀 stream:", stream);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
