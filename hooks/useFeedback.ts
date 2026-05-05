import React from "react";
import { Match } from "@/types/match";

interface UseFeedbackReturn {
  explanation: string | null;
  isLoading: boolean;
}

/**
 * Extracts the sentence containing the error
 */
function extractSentence(text: string, offset: number, length: number): string {
  // Find the start of the sentence (look backwards for . ! ? or start of text)
  let sentenceStart = offset;
  for (let i = offset - 1; i >= 0; i--) {
    if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
      sentenceStart = i + 1;
      break;
    }
    if (i === 0) {
      sentenceStart = 0;
    }
  }

  // Find the end of the sentence (look forwards for . ! ? or end of text)
  let sentenceEnd = offset + length;
  for (let i = offset + length; i < text.length; i++) {
    if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
      sentenceEnd = i + 1;
      break;
    }
    if (i === text.length - 1) {
      sentenceEnd = text.length;
    }
  }

  return text.substring(sentenceStart, sentenceEnd).trim();
}

export function useFeedback(
  match: Match | null,
  errorText: string,
  fullText: string = ""
): UseFeedbackReturn {
  const [explanation, setExplanation] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!match) {
      setTimeout(() => setExplanation(null), 0);
      return;
    }

    setTimeout(() => setIsLoading(true), 0);
    setTimeout(() => setExplanation(null), 0);

    const fetchFeedback = async () => {
      try {
        // Extract sentence context if full text is available
        const sentence = fullText && match.offset !== undefined && match.length !== undefined
          ? extractSentence(fullText, match.offset, match.length)
          : errorText;

        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: match.message,
            ruleDescription: match.rule.description,
            errorText,
            sentence,
          }),
        });

        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data = (await response.json()) as { explanation: string };
        setExplanation(data.explanation);
      } catch (error: unknown) {
        console.error("Feedback fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [match, errorText, fullText]);

  return { explanation, isLoading };
}
