import { NextRequest, NextResponse } from "next/server";

interface RewriteRequest {
  text: string;
  errorOffset: number;
  errorLength: number;
  errorText: string;
  suggestion: string;
}

interface RewriteResponse {
  rewritten: string;
}

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<RewriteResponse>> => {
  const { text, errorOffset, errorLength, suggestion } =
    (await req.json()) as RewriteRequest;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ rewritten: text }, { status: 500 });
  }

  try {
    const before = text.slice(0, errorOffset);
    const after = text.slice(errorOffset + errorLength);
    const contextBefore = text
      .slice(Math.max(0, errorOffset - 100), errorOffset)
      .trim();
    const contextAfter = text
      .slice(
        errorOffset + errorLength,
        Math.min(text.length, errorOffset + errorLength + 100),
      )
      .trim();

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
                "You are a helpful writing assistant. Rewrite the sentence naturally and clearly, maintaining the original meaning and context. Respond only with the rewritten sentence.",
            },
            {
              role: "user",
              content: `Rewrite only the bracketed part naturally to fit the context. Replace [${suggestion}] in: "${before}[${suggestion}]${after}"\n\nContext: "${contextBefore}" ... "${contextAfter}"\n\nRespond with ONLY the replacement word/phrase, nothing else.`,
            },
          ],
          max_tokens: 200,
        }),
      },
    );

    if (!response.ok) {
      console.error("Groq API error:", response.statusText);
      return NextResponse.json(
        { rewritten: text },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const rewrittenText = data.choices?.[0]?.message?.content || text;

    return NextResponse.json({ rewritten: rewrittenText });
  } catch (error: unknown) {
    console.error("Rewrite error:", error);
    return NextResponse.json({ rewritten: text }, { status: 500 });
  }
};
