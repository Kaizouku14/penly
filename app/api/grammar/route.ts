import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { text } = await req.json();

  const params = new URLSearchParams();
  params.append("text", text);
  params.append("language", "en-US");

  const response = await fetch("https://api.languagetool.org/v2/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();

  // Filter out false positives for names and proper nouns
  if (data.matches) {
    data.matches = data.matches.filter(
      (match: {
        ruleId?: string;
        message?: string;
        offset?: number;
        length?: number;
      }) => {
        // Rule IDs that commonly flag proper names incorrectly
        const excludedRuleIds = [
          "UPPERCASE_SENTENCE_START", // Flags capitalized names at sentence start
          "HUNSPELL_RULE", // Spell checker flagging unknown proper nouns
          "MORPHOLOGIK_RULE_EN_US", // Morphology rule flagging names
          "WORD_CONTAINS_UNDERSCORE",
          "EN_A_VS_AN", // False positives with proper nouns
        ];

        if (excludedRuleIds.includes(match.ruleId || "")) {
          return false;
        }

        // Filter by message content - skip misspelling suggestions for capitalized words
        if (match.message?.toLowerCase().includes("misspell")) {
          const offset = match.offset || 0;
          const length = match.length || 0;
          const word = text.slice(offset, offset + length);

          // If the word is capitalized and only has one suggestion (likely a proper noun),
          // skip it
          if (word[0] === word[0]?.toUpperCase() && word[0] !== word[0]?.toLowerCase()) {
            return false;
          }
        }

        return true;
      },
    );
  }

  return NextResponse.json(data);
};
