import OpenAI from "openai";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in environment variables");
}

if (!process.env.OPENROUTER_BASE_URL) {
  throw new Error("OPENROUTER_BASE_URL is not set in environment variables");
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set in environment variables");
}

// Use OpenAI SDK but point to OpenRouter endpoint
export const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL,
    "X-Title": "Finac AI Assistant",
  },
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * Stream chat completion from OpenRouter (using OpenAI-compatible API)
 */
export async function* streamChatCompletion(
  messages: ChatMessage[]
): AsyncGenerator<StreamChunk, void, unknown> {
  // Get model from environment variable or use default fallback list
  const preferredModel = process.env.OPENROUTER_MODEL;

  // Try multiple free models in order of preference
  const freeModels = preferredModel
    ? [preferredModel]
    : [
        "openai/gpt-oss-120b:free",
        "openai/gpt-4o-mini",
        "meta-llama/llama-3.2-3b-instruct:free",
        "google/gemini-flash-1.5:free",
        "mistralai/mistral-7b-instruct:free",
      ];

  let lastError: any = null;
  let triedModels: string[] = [];

  for (const model of freeModels) {
    triedModels.push(model);
    try {
      console.log(`🧠Attempting to use model: ${model}`);
      const stream = await openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: true,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          yield { content, done: false };
        }
      }

      yield { content: "", done: true };
      return; // Success, exit the function
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);
      const statusCode =
        error?.status || error?.response?.status || error?.code;

      // Check if it's an OpenAI API error with status
      const apiError = error as any;
      const actualStatusCode =
        statusCode || apiError?.response?.status || apiError?.status;

      console.error(`Model ${model} failed:`, {
        message: errorMessage,
        status: actualStatusCode,
        error: error,
      });

      // If it's a privacy/data policy error, 404, or 401 User not found from OpenRouter, try next model
      if (
        actualStatusCode === 404 ||
        actualStatusCode === 401 ||
        errorMessage.includes("404") ||
        errorMessage.includes("401") ||
        errorMessage.includes("User not found") ||
        errorMessage.includes("data policy") ||
        errorMessage.includes("privacy") ||
        errorMessage.includes("No endpoints found") ||
        errorMessage.includes("Free model publication")
      ) {
        console.warn(
          `Model ${model} failed (status: ${actualStatusCode}) - ${errorMessage}. Trying next model...`
        );
        continue; // Try next model
      }

      // For other errors (rate limit, etc), throw immediately
      throw error;
    }
  }

  // If all models failed, throw a helpful error
  if (lastError) {
    const errorMessage = lastError?.message || String(lastError);
    const lastStatusCode = lastError?.status || lastError?.code;

    if (
      errorMessage.includes("data policy") ||
      errorMessage.includes("privacy") ||
      errorMessage.includes("No endpoints found")
    ) {
      throw new Error(
        `OpenRouter Configuration Required: No free models are available with your current privacy settings. Please:\n1. Go to https://openrouter.ai/settings/privacy\n2. Enable "Allow Free Model Access" or configure your data policy\n3. Or set OPENROUTER_MODEL environment variable to use a paid model\n\nTried models: ${triedModels.join(
          ", "
        )}`
      );
    }

    if (lastStatusCode === 401 || errorMessage.includes("User not found")) {
      throw new Error(
        `OpenRouter Authentication Error: Your API key may be invalid or doesn't have access to these models. Please:\n1. Verify your OPENROUTER_API_KEY is correct\n2. Check your OpenRouter account at https://openrouter.ai/keys\n3. Ensure your API key has credits or access to free models\n4. Try setting OPENROUTER_MODEL to a specific model you have access to\n\nTried models: ${triedModels.join(
          ", "
        )}\nLast error: ${errorMessage}`
      );
    }

    throw new Error(
      `All models failed. Tried: ${triedModels.join(
        ", "
      )}. Last error: ${errorMessage}`
    );
  }
}

/**
 * Get system prompt for financial database assistant
 */
export function getSystemPrompt(): string {
  const prompt = `You are a helpful financial assistant that can query a user's financial database. You have access to the following data models:

1. **Transaction** - Financial transactions with:
   - amount, transactionType (CREDIT/DEBIT), status, date, description
   - category, subCategory, bankAccount, investment
   - paymentMethod (CASH, UPI, CARD, ONLINE, OTHER)

2. **Investment** - Investment records with:
   - name, type (STOCKS, MUTUAL_FUNDS, GOLD, FIXED_DEPOSIT, NPS, PF)
   - currentPrice, investedAmount, currentValue, quantity
   - purchaseDate, symbol

3. **Goal** - Financial goals with:
   - name, targetAmount, currentAmount, targetDate
   - isActive status

4. **Asset** - Physical assets with:
   - name, type (PROPERTY, VEHICLE, JEWELRY, ELECTRONICS, OTHER)
   - currentValue, purchaseValue, purchaseDate
   - sellDate, sellPrice, profitLoss

5. **BankAccount** - Bank accounts with:
   - name, accountNumber, bankName, accountType
   - startingBalance, isActive

6. **BankTransaction** - Bank account transactions with:
   - amount, transactionType (CREDIT/DEBIT), transactionDate
   - currentBalance, description

When a user asks a question:
1. Understand what data they want to see
2. Determine if the response should be:
   - TEXT: For summaries, insights, or simple answers
   - TABLE: For structured data that should be displayed in rows/columns
   - CHART: For data that should be visualized (time series, comparisons, distributions)

3. For CHART type, choose the appropriate chartType:
   - "line": For time series data (use with groupBy: "date")
   - "bar": For comparing categories or groups side-by-side
   - "pie" or "donut": For showing proportions/percentages of categories (e.g., "show expenses by category as pie chart", "breakdown by type", "distribution of investments")
   - IMPORTANT: If user explicitly asks for "pie chart", "pie", "donut", "circular chart", or wants to see "proportions", "percentages", "breakdown", or "distribution", use chartType: "pie" or "donut"

4. For database queries, respond in this JSON format:
{
  "queryType": "TEXT" | "TABLE" | "CHART",
  "entity": "transaction" | "investment" | "goal" | "asset" | "bankAccount" | "bankTransaction",
  "filters": {
    "dateFrom": "YYYY-MM-DD" (optional),
    "dateTo": "YYYY-MM-DD" (optional),
    "type": "value" (optional),
    "category": "value" (optional), 
    "status": "value" (optional)
  },
  "aggregation": "sum" | "count" | "average" | null,
  "groupBy": "date" | "category" | "type" | "transactionType" | null,
  Note: For investments, use groupBy: "type" to group by investment type (STOCKS, MUTUAL_FUNDS, etc.)
  "chartType": "line" | "bar" | "pie" | "donut" | null (REQUIRED if queryType is CHART - choose based on user's request),
  "explanation": "Natural language explanation of what the data shows"
}

5. After the JSON, provide a natural language response explaining the data.

Always ensure queries are scoped to the user's own data. Be helpful and provide insights when appropriate.`;

  return prompt;
}
