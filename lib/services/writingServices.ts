import { callGroqApi, parseJsonResponse } from "../api/groqClient";

// System prompts
const PARAPHRASE_SYSTEM_PROMPT =
  "You are a helpful writing assistant. Paraphrase the given text in a clear and natural way, maintaining the original meaning. Provide alternative wording that improves clarity or flow. Respond only with the paraphrased text, nothing else.";

const TONE_SYSTEM_PROMPT =
  "You are a writing tone analyzer. Analyze the tone of the given text. Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation.";

const AI_DETECTION_SYSTEM_PROMPT = `You are an AI detection expert. Analyze the given text and determine if it appears to be AI-generated. Consider factors like:
- Overly formal or repetitive phrasing
- Lack of personal voice or natural conversational tone
- Perfect grammar and structure
- Generic or template-like language
- Absence of typos or informal expressions
- Unnatural transitions between ideas

Respond with ONLY a JSON object (no markdown, no extra text):
{
  "isAiGenerated": boolean,
  "confidence": number (0-100),
  "analysis": "brief explanation (max 1 sentence)"
}`;

const FEEDBACK_SYSTEM_PROMPT =
  "You are a helpful English writing assistant. Explain grammar errors in simple, friendly language in 2-3 sentences.";

const INTERVIEW_QUESTIONS_SYSTEM_PROMPT = `You are an expert technical interviewer. Your task is to generate high-quality interview questions based only on the information explicitly present in the candidate's resume.

RULES:
- Do NOT assume, invent, or infer details not clearly stated in the resume
- Do NOT generate generic or filler questions
- Every question must reference a specific skill, role, project, or detail found in the resume
- If a section is missing or unclear, do NOT create questions about it
- Avoid repetition or rephrasing the same question in different ways
- Focus on depth over quantity

COVERAGE AREAS (only if present in the resume):
- Work experience and job responsibilities
- Technical skills, tools, and technologies explicitly mentioned
- Projects and measurable achievements
- Education and certifications
- Leadership, collaboration, or soft skills (only if evidenced)

OUTPUT FORMAT:
- Return a numbered list of concise, high-quality interview questions
- Group questions by section (Experience, Skills, Projects, etc.)
- Each question must be directly traceable to the resume content`;

/**
 * Paraphrases the given text
 */
export async function paraphraseText(text: string): Promise<string> {
  const content = await callGroqApi(
    [
      { role: "system", content: PARAPHRASE_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Paraphrase this text:\n\n"${text}"\n\nProvide only the paraphrased text.`,
      },
    ],
    { max_tokens: 300 },
  );

  return content;
}

/**
 * Analyzes the tone of the given text
 */
export interface ToneAnalysisResult {
  primary: string;
  secondary: string | null;
  summary: string;
}

export async function analyzeTone(text: string): Promise<ToneAnalysisResult> {
  const content = await callGroqApi(
    [
      { role: "system", content: TONE_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze the tone of this text and return ONLY a JSON object in this exact shape:
          {
            "primary": "one of: formal, casual, confident, uncertain, positive, negative, neutral",
            "secondary": "one of the remaining tones or null",
            "summary": "one sentence describing the overall tone in plain English"
          }

          Text: "${text}"`,
      },
    ],
    { max_tokens: 150 },
  );

  return parseJsonResponse<ToneAnalysisResult>(content);
}

/**
 * Detects if text is AI-generated
 */
export interface AiDetectionResult {
  isAiGenerated: boolean;
  confidence: number;
  analysis: string;
}

export async function detectAiGenerated(
  text: string,
): Promise<AiDetectionResult> {
  const content = await callGroqApi(
    [
      { role: "system", content: AI_DETECTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze if this text is AI-generated:\n\n"${text}"`,
      },
    ],
    { max_tokens: 150 },
  );

  const parsed = parseJsonResponse<AiDetectionResult>(content);

  // Validate and normalize confidence to 0-100 range
  return {
    isAiGenerated: parsed.isAiGenerated || false,
    confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
    analysis: parsed.analysis || "Unable to determine if text is AI-generated",
  };
}

/**
 * Generates feedback/explanation for a grammar error
 */
export async function generateGrammarFeedback(
  message: string,
  ruleDescription: string,
  errorText: string,
  context: string = errorText,
): Promise<string> {
  const content = await callGroqApi(
    [
      { role: "system", content: FEEDBACK_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Grammar error: "${message}"
            Error/word: "${errorText}"
            Rule: ${ruleDescription}
            Context (full sentence): "${context}"

        Please explain this error and how to fix it.`,
      },
    ],
    { max_tokens: 150 },
  );

  return content;
}

/**
 * Generates interview questions from resume text
 */
export async function generateInterviewQuestions(
  resumeText: string,
): Promise<string> {
  const content = await callGroqApi(
    [
      { role: "system", content: INTERVIEW_QUESTIONS_SYSTEM_PROMPT },
      { role: "user", content: `Here is my resume:\n\n${resumeText}` },
    ],
    { max_tokens: 1024 },
  );

  return content;
}
