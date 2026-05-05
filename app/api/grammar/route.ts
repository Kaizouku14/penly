import { NextRequest, NextResponse } from "next/server";
import { checkGrammar } from "@/lib/services/grammarService";
import { validateRequestBody, errorResponse } from "@/lib/api/apiUtils";

interface GrammarRequest {
  text: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as unknown;
    const { text } = validateRequestBody<GrammarRequest>(body, ["text"]);

    const result = await checkGrammar(text);
    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, body } = errorResponse(
      error,
      "Failed to check grammar",
    );
    return NextResponse.json(body, { status: statusCode });
  }
};
