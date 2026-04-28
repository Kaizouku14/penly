import { NextRequest, NextResponse } from "next/server";

interface FeedbackRequest {
  message: string;
  ruleDescription: string;
  errorText: string;
}

interface FeedbackResponse {
  explanation: string;
}

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<FeedbackResponse>> => {
  const { message, ruleDescription, errorText } =
    (await req.json()) as FeedbackRequest;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { explanation: "API key not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful English writing assistant. Explain grammar errors in simple, friendly language in 2-3 sentences.",
            },
            {
              role: "user",
              content: `Explain this grammar error: "${message}" for the word/phrase "${errorText}". Rule: ${ruleDescription}`,
            },
          ],
          max_tokens: 150,
        }),
      },
    );

    if (!response.ok) {
      console.error("Groq API error:", response.statusText);
      return NextResponse.json(
        { explanation: "Failed to get explanation" },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const explanation =
      data.choices?.[0]?.message?.content || "Unable to generate explanation";

    return NextResponse.json({ explanation });
  } catch (error: unknown) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { explanation: "An error occurred" },
      { status: 500 },
    );
  }
};
