const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqRequestConfig {
  model?: string;
  max_tokens?: number;
}

export interface GroqResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

/**
 * Validates that the required API key is configured
 */
export function validateApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured");
  }
  return apiKey;
}

/**
 * Makes a request to the Groq API
 * @param messages - Array of messages for the LLM
 * @param config - Optional configuration (model, max_tokens)
 * @returns The response content string
 */
export async function callGroqApi(
  messages: GroqMessage[],
  config?: GroqRequestConfig,
): Promise<string> {
  const apiKey = validateApiKey();

  const payload = {
    model: config?.model || DEFAULT_MODEL,
    messages,
    max_tokens: config?.max_tokens || 300,
  };

  console.log("📡 Calling Groq API with payload:", {
    model: payload.model,
    max_tokens: payload.max_tokens,
    messageCount: messages.length,
  });

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("🔴 Groq API error:", {
      status: response.status,
      statusText: response.statusText,
      errorBody: errorText,
    });
    throw new Error(`Groq API returned ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as GroqResponse;
  const content = data.choices?.[0]?.message?.content;

  console.log("✅ Groq API response received, content length:", content?.length);

  if (!content) {
    throw new Error("No content in Groq API response");
  }

  return content;
}

/**
 * Safely parses JSON content from Groq API response
 * @param content - The content string to parse
 * @returns Parsed JSON object
 */
export function parseJsonResponse<T>(content: string): T {
  try {
    console.log("📋 Parsing JSON response, content preview:", content.substring(0, 200));
    const parsed = JSON.parse(content) as T;
    console.log("✅ JSON parsed successfully");
    return parsed;
  } catch (error) {
    console.error("🔴 Failed to parse JSON response:", {
      error,
      contentPreview: content.substring(0, 500),
      contentLength: content.length,
    });
    throw new Error(`Invalid JSON in API response: ${content.substring(0, 100)}`);
  }
}
