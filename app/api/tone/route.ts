import { NextRequest, NextResponse } from "next/server";
import { analyzeTone, ToneAnalysisResult } from "@/lib/services/writingServices";
import { validateRequestBody, ApiError } from "@/lib/api/apiUtils";

interface ToneRequest {
  text: string;
}

const DEFAULT_TONE_RESPONSE: ToneAnalysisResult = {
  primary: "neutral",
  secondary: null,
  summary: "Analysis unavailable",
};

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<ToneAnalysisResult>> => {
  try {
    const body = (await req.json()) as unknown;
    const { text } = validateRequestBody<ToneRequest>(body, ["text"]);

    const toneResult = await analyzeTone(text);
    return NextResponse.json(toneResult);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(DEFAULT_TONE_RESPONSE, {
        status: error.statusCode,
      });
    }
    console.error("Failed to analyze tone", error);
    return NextResponse.json(DEFAULT_TONE_RESPONSE, { status: 500 });
  }
};
