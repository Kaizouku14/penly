import React from "react";
import { Match } from "@/types/match";

interface UseFeedbackReturn {
  explanation: string | null;
  isLoading: boolean;
}

export function useFeedback(
  match: Match | null,
  errorText: string
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
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: match.message,
            ruleDescription: match.rule.description,
            errorText,
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
  }, [match, errorText]);

  return { explanation, isLoading };
}
