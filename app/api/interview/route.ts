import { NextRequest, NextResponse } from "next/server";
import { evaluateInterviewAnswer } from "@/lib/services/interviewService";
import { validateRequestBody, ApiError } from "@/lib/api/apiUtils";
import { InterviewCritique } from "@/types/interview";

interface InterviewEvaluationRequest {
  question: string;
  answer: string;
}

interface InterviewEvaluationResponse {
  critique: InterviewCritique | null;
  error?: string;
}

const DEFAULT_RESPONSE: InterviewEvaluationResponse = {
  critique: null,
};

export const POST = async (
  req: NextRequest,
): Promise<NextResponse<InterviewEvaluationResponse>> => {
  try {
    const body = (await req.json()) as unknown;
    const { question, answer } = validateRequestBody<InterviewEvaluationRequest>(
      body,
      ["question", "answer"],
    );

    const critique = await evaluateInterviewAnswer(question, answer);
    return NextResponse.json({ critique });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          critique: null,
          error: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }
    console.error("Failed to evaluate interview answer", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        critique: null,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
};
