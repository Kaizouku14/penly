export interface GrammarMatch {
  rule: { id: string };
  // Additional fields from LanguageTool
  [key: string]: unknown;
}

export interface GrammarCheckResponse {
  matches: GrammarMatch[];
  [key: string]: unknown;
}

const LANGUAGE_TOOL_API_URL = "https://api.languagetool.org/v2/check";
const UNKNOWN_TOKEN_RULE = "UNKNOWN_TOKEN";

/**
 * Checks text for grammar and spelling errors
 * Filters out unknown token errors (flags unknown words/names as mistakes)
 */
export async function checkGrammar(
  text: string,
  language: string = "en-US",
): Promise<GrammarCheckResponse> {
  const params = new URLSearchParams();
  params.append("text", text);
  params.append("language", language);

  const response = await fetch(LANGUAGE_TOOL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(
      `LanguageTool API returned ${response.status}: ${response.statusText}`,
    );
  }

  const data = (await response.json()) as GrammarCheckResponse;

  // Filter out UNKNOWN_TOKEN errors to keep actual grammar/spelling errors
  const filteredMatches = data.matches.filter(
    (match) => match.rule.id !== UNKNOWN_TOKEN_RULE,
  );

  return {
    ...data,
    matches: filteredMatches,
  };
}
