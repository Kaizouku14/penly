import { NextRequest, NextResponse } from "next/server";
import { ToneResult } from "@/types/match";

interface ToneRequest {
  text: string;
}

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<ToneResult>> => {
  const { text } = (await req.json()) as ToneRequest;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        primary: "neutral",
        secondary: null,
        summary: "API key not configured",
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
              content:
                "You are a writing tone analyzer. Analyze the tone of the given text. Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation.",
            },
            {
              role: "user",
              content: `Analyze the tone of this text and return ONLY a JSON object in this exact shape:
{
  "primary": "one of: formal, casual, confident, uncertain, positive, negative, neutral",
  "secondary": "one of the remaining tones or null",
  "summary": "one sentence describing the overall tone in plain English"
}

Text: "${text}"`,
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
          primary: "neutral",
          secondary: null,
          summary: "Failed to analyze tone",
        },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json(
        {
          primary: "neutral",
          secondary: null,
          summary: "No response from API",
        },
        { status: 500 },
      );
    }

    // Parse the JSON response safely
    let toneResult: ToneResult;
    try {
      toneResult = JSON.parse(responseText) as ToneResult;

      // Validate the response has the required fields
      if (!toneResult.primary || typeof toneResult.summary !== "string") {
        throw new Error("Invalid tone response structure");
      }

      return NextResponse.json(toneResult);
    } catch (parseError: unknown) {
      console.error("Failed to parse tone response:", parseError, responseText);
      return NextResponse.json(
        {
          primary: "neutral",
          secondary: null,
          summary: "Could not parse tone analysis",
        },
        { status: 400 },
      );
    }
  } catch (error: unknown) {
    console.error("Tone analysis error:", error);
    return NextResponse.json(
      { primary: "neutral", secondary: null, summary: "An error occurred" },
      { status: 500 },
    );
  }
};
