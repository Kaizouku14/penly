export interface GrammarMatch {
  rule: { id: string };
  category?: { id: string; name: string };
  // Additional fields from LanguageTool
  [key: string]: unknown;
}

export interface GrammarCheckResponse {
  matches: GrammarMatch[];
  [key: string]: unknown;
}

const LANGUAGE_TOOL_API_URL = "https://api.languagetool.org/v2/check";

// Rule IDs to filter out (false positives, unknown words, etc.)
const RULES_TO_EXCLUDE = [
  "UNKNOWN_TOKEN",           // Unknown words/names
  "HUNSPELL_RULE",          // Dictionary-based spelling (too strict for names)
  "MORFOLOGIK_RULE_EN_US",  // Dictionary lookup errors
];

// Category IDs to filter out
const CATEGORIES_TO_EXCLUDE = [
  "TYPOS",  // Too aggressive with names and proper nouns
];

/**
 * Checks text for grammar and spelling errors
 * Enables comprehensive checking for punctuation, spacing, capitalization, and formatting
 * Intelligently filters out false positives like proper nouns and names
 */
export async function checkGrammar(
  text: string,
  language: string = "en-US",
): Promise<GrammarCheckResponse> {
  const params = new URLSearchParams();
  params.append("text", text);
  params.append("language", language);
  
  // Enable comprehensive error checking
  params.append("enabledOnly", "false"); // Don't restrict to enabled rules

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

  // Intelligently filter matches
  const filteredMatches = data.matches.filter((match) => {
    const ruleId = match.rule.id;
    const categoryId = match.category?.id;

    // Exclude specific rules (unknown tokens, proper nouns, etc.)
    if (RULES_TO_EXCLUDE.includes(ruleId)) {
      return false;
    }

    // Exclude specific categories
    if (categoryId && CATEGORIES_TO_EXCLUDE.includes(categoryId)) {
      return false;
    }

    // Keep all other errors (punctuation, spacing, grammar, etc.)
    return true;
  });

  return {
    ...data,
    matches: filteredMatches,
  };
}


