import { NextRequest, NextResponse } from "next/server";
import { paraphraseText } from "@/lib/services/writingServices";
import { validateRequestBody, ApiError } from "@/lib/api/apiUtils";

interface ParaphraseRequest {
  text: string;
}

interface ParaphraseResponse {
  paraphrase: string;
}

const DEFAULT_PARAPHRASE_RESPONSE: ParaphraseResponse = {
  paraphrase: "",
};

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<ParaphraseResponse>> => {
  try {
    const body = (await req.json()) as unknown;
    const { text } = validateRequestBody<ParaphraseRequest>(body, ["text"]);

    const paraphraseResult = await paraphraseText(text);
    return NextResponse.json({ paraphrase: paraphraseResult });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(DEFAULT_PARAPHRASE_RESPONSE, {
        status: error.statusCode,
      });
    }
    console.error("Failed to paraphrase text", error);
    return NextResponse.json(DEFAULT_PARAPHRASE_RESPONSE, { status: 500 });
  }
};
