import { OpenRouter } from "@openrouter/sdk";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in environment variables");
}

export const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Example usage of OpenRouter (non-streaming)
 * This is just for reference - actual streaming is handled in openai-client.ts
 */
export async function exampleCompletion() {
  const completion = await openRouter.chat.send({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: "What is the meaning of life?",
      },
    ],
    stream: false,
  });

  return completion.choices[0].message.content;
}
