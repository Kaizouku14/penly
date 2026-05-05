import { useState, useCallback } from "react";
import { InterviewCritique } from "@/types/interview";

interface UseInterviewCritiqueReturn {
  critique: InterviewCritique | null;
  isCritiquing: boolean;
  error: Error | null;
  fetchCritique: (question: string, answer: string) => Promise<InterviewCritique | null>;
  clearCritique: () => void;
}

export const useInterviewCritique = (): UseInterviewCritiqueReturn => {
  const [critique, setCritique] = useState<InterviewCritique | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCritique = useCallback(
    async (question: string, answer: string): Promise<InterviewCritique | null> => {
      if (!question.trim() || !answer.trim()) {
        const err = new Error("Question and answer cannot be empty");
        setError(err);
        return null;
      }

      setIsCritiquing(true);
      setError(null);

      try {
        const response = await fetch("/api/interview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question, answer }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || `API error: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const result = data.critique;

        if (!result) {
          const errorMessage = data.error || "No critique returned from API";
          throw new Error(errorMessage);
        }

        setCritique(result);
        console.log("✅ Critique received from API");
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to critique answer";
        const error = new Error(errorMessage);
        console.error("🔴 Critique Error Details:", {
          message: errorMessage,
          fullError: err,
        });
        setError(error);
        setCritique(null);
        return null;
      } finally {
        setIsCritiquing(false);
      }
    },
    [],
  );

  const clearCritique = useCallback(() => {
    setCritique(null);
    setError(null);
  }, []);

  return {
    critique,
    isCritiquing,
    error,
    fetchCritique,
    clearCritique,
  };
};
