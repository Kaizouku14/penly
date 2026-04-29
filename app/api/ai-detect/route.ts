import { NextRequest, NextResponse } from "next/server";

interface AIDetectRequest {
  text: string;
}

interface AIDetectResponse {
  isAiGenerated: boolean;
  confidence: number;
  analysis: string;
}

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<AIDetectResponse>> => {
  const { text } = (await req.json()) as AIDetectRequest;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        isAiGenerated: false,
        confidence: 0,
        analysis: "API key not found",
      },
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
              content: `You are an AI detection expert. Analyze the given text and determine if it appears to be AI-generated. Consider factors like:
- Overly formal or repetitive phrasing
- Lack of personal voice or natural conversational tone
- Perfect grammar and structure
- Generic or template-like language
- Absence of typos or informal expressions
- Unnatural transitions between ideas

Respond with ONLY a JSON object (no markdown, no extra text):
{
  "isAiGenerated": boolean,
  "confidence": number (0-100),
  "analysis": "brief explanation (max 1 sentence)"
}`,
            },
            {
              role: "user",
              content: `Analyze if this text is AI-generated:\n\n"${text}"`,
            },
          ],
          max_tokens: 150,
        }),
      },
    );

    if (!response.ok) {
      console.error("Groq API error:", response.statusText);
      return NextResponse.json(
        {
          isAiGenerated: false,
          confidence: 0,
          analysis: "Failed to analyze text",
        },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content || "";

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({
        isAiGenerated: parsed.isAiGenerated || false,
        confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
        analysis:
          parsed.analysis || "Unable to determine if text is AI-generated",
      });
    } catch {
      // If JSON parsing fails, return default
      return NextResponse.json({
        isAiGenerated: false,
        confidence: 0,
        analysis: "Unable to parse detection results",
      });
    }
  } catch (error: unknown) {
    console.error("AI detection error:", error);
    return NextResponse.json(
      {
        isAiGenerated: false,
        confidence: 0,
        analysis: "Error analyzing text",
      },
      { status: 500 },
    );
  }
};
