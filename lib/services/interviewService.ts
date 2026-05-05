import { callGroqApi, parseJsonResponse } from "../api/groqClient";
import { InterviewCritique } from "@/types/interview";

const INTERVIEW_CRITIQUE_SYSTEM_PROMPT = `You are an expert job interview evaluator. Your task is to critically evaluate a candidate's answer to an interview question.

Evaluate based on:
- Content relevance and completeness
- Clarity and communication quality
- Technical accuracy (if applicable)
- Confidence and professionalism
- Specific examples and evidence
- Problem-solving approach
- Self-awareness

Respond with ONLY a valid JSON object (no markdown, no backticks):
{
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "areasForImprovement": ["area 1", "area 2", "area 3"],
  "overallFeedback": "2-3 sentence summary of the answer quality and how it compares to strong interview responses",
  "rating": 7,
  "confidence": 85
}

IMPORTANT:
- rating: 1-10 (1=poor, 10=excellent)
- confidence: 0-100 (how confident you are in this evaluation)
- Be honest and constructive, not overly harsh or flattering
- Focus on areas that would impact job hiring decisions`;

/**
 * Evaluates a candidate's answer to an interview question
 */
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
): Promise<InterviewCritique> {
  const content = await callGroqApi(
    [
      { role: "system", content: INTERVIEW_CRITIQUE_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Interview Question: "${question}"

Candidate's Answer: "${answer}"

Please evaluate this answer.`,
      },
    ],
    { max_tokens: 500 },
  );

  const critique = parseJsonResponse<InterviewCritique>(content);

  // Validate and normalize the response
  return {
    strengths: critique.strengths || [],
    areasForImprovement: critique.areasForImprovement || [],
    overallFeedback:
      critique.overallFeedback || "Unable to evaluate answer",
    rating: Math.min(10, Math.max(1, critique.rating || 5)),
    confidence: Math.min(100, Math.max(0, critique.confidence || 0)),
  };
}
