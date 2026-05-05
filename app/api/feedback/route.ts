import { NextRequest, NextResponse } from "next/server";
import {
  generateGrammarFeedback,
} from "@/lib/services/writingServices";
import { validateRequestBody, ApiError } from "@/lib/api/apiUtils";

interface FeedbackRequest {
  message: string;
  ruleDescription: string;
  errorText: string;
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
    const { message, ruleDescription, errorText } = validateRequestBody<FeedbackRequest>(
      body,
      ["message", "ruleDescription", "errorText"],
    );

    const explanation = await generateGrammarFeedback(
      message,
      ruleDescription,
      errorText,
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
