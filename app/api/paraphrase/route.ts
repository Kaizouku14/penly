import { NextRequest, NextResponse } from "next/server";

interface ParaphraseRequest {
  text: string;
}

interface ParaphraseResponse {
  paraphrase: string;
}

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<ParaphraseResponse>> => {
  const { text } = (await req.json()) as ParaphraseRequest;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { paraphrase: text },
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
                "You are a helpful writing assistant. Paraphrase the given text in a clear and natural way, maintaining the original meaning. Provide alternative wording that improves clarity or flow. Respond only with the paraphrased text, nothing else.",
            },
            {
              role: "user",
              content: `Paraphrase this text:\n\n"${text}"\n\nProvide only the paraphrased text.`,
            },
          ],
          max_tokens: 300,
        }),
      },
    );

    if (!response.ok) {
      console.error("Groq API error:", response.statusText);
      return NextResponse.json(
        { paraphrase: text },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const paraphraseText = data.choices?.[0]?.message?.content || text;

    return NextResponse.json({ paraphrase: paraphraseText });
  } catch (error: unknown) {
    console.error("Paraphrase error:", error);
    return NextResponse.json(
      { paraphrase: text },
      { status: 500 },
    );
  }
};
