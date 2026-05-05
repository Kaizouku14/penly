import { NextRequest, NextResponse } from "next/server";
import {
  detectAiGenerated,
  AiDetectionResult,
} from "@/lib/services/writingServices";
import { validateRequestBody, ApiError } from "@/lib/api/apiUtils";

interface AIDetectRequest {
  text: string;
}

const DEFAULT_AI_RESPONSE: AiDetectionResult = {
  isAiGenerated: false,
  confidence: 0,
  analysis: "Analysis unavailable",
};

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<AiDetectionResult>> => {
  try {
    const body = (await req.json()) as unknown;
    const { text } = validateRequestBody<AIDetectRequest>(body, ["text"]);

    const result = await detectAiGenerated(text);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(DEFAULT_AI_RESPONSE, { status: error.statusCode });
    }
    console.error("Failed to detect AI-generated text", error);
    return NextResponse.json(DEFAULT_AI_RESPONSE, { status: 500 });
  }
};
