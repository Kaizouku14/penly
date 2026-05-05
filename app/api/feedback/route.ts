import { NextRequest, NextResponse } from "next/server";
import {
  generateGrammarFeedback,
} from "@/lib/services/writingServices";
import { validateRequestBody, ApiError } from "@/lib/api/apiUtils";

interface FeedbackRequest {
  message: string;
  ruleDescription: string;
  errorText: string;
  sentence?: string;
}

interface FeedbackResponse {
  explanation: string;
}

const DEFAULT_FEEDBACK_RESPONSE: FeedbackResponse = {
  explanation: "Unable to generate explanation",
};

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<FeedbackResponse>> => {
  try {
    const body = (await req.json()) as unknown;
    const { message, ruleDescription, errorText, sentence } = validateRequestBody<FeedbackRequest>(
      body,
      ["message", "ruleDescription", "errorText"],
    );

    // Use sentence context if provided, otherwise fall back to error text
    const context = sentence || errorText;

    const explanation = await generateGrammarFeedback(
      message,
      ruleDescription,
      errorText,
      context,
    );

    return NextResponse.json({ explanation });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(DEFAULT_FEEDBACK_RESPONSE, {
        status: error.statusCode,
      });
    }
    console.error("Failed to generate feedback", error);
    return NextResponse.json(DEFAULT_FEEDBACK_RESPONSE, { status: 500 });
  }
};
