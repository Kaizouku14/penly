import { useState, useCallback } from "react";
import { InterviewCritique } from "@/types/interview";
import { evaluateInterviewAnswer } from "@/lib/services/interviewService";

interface UseInterviewCritiqueReturn {
  critique: InterviewCritique | null;
  isCritiquing: boolean;
  error: Error | null;
  fetchCritique: (question: string, answer: string) => Promise<void>;
  clearCritique: () => void;
}

export const useInterviewCritique = (): UseInterviewCritiqueReturn => {
  const [critique, setCritique] = useState<InterviewCritique | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCritique = useCallback(
    async (question: string, answer: string) => {
      if (!question.trim() || !answer.trim()) {
        setError(new Error("Question and answer cannot be empty"));
        return;
      }

      setIsCritiquing(true);
      setError(null);

      try {
        const result = await evaluateInterviewAnswer(question, answer);
        setCritique(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to critique answer";
        setError(new Error(errorMessage));
        setCritique(null);
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
