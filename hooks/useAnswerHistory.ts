/**
 * Hook for managing answer history and retakes
 */

import { useState, useCallback } from "react";
import { InterviewCritique } from "@/types/interview";

export interface AnswerAttempt {
  id: string;
  text: string;
  timestamp: number;
  critique: InterviewCritique | null;
  wordCount: number;
  recordingDuration?: number;
}

export interface QuestionHistory {
  questionId: string;
  attempts: AnswerAttempt[];
  bestScore: number;
  totalAttempts: number;
}

interface UseAnswerHistoryReturn {
  questionHistories: Map<string, QuestionHistory>;
  currentAttempts: AnswerAttempt[];
  saveAnswer: (
    questionId: string,
    text: string,
    critique: InterviewCritique | null,
    recordingDuration?: number,
  ) => void;
  getQuestionHistory: (questionId: string) => QuestionHistory | null;
  getBestAttempt: (questionId: string) => AnswerAttempt | null;
  clearHistory: () => void;
}

export const useAnswerHistory = (): UseAnswerHistoryReturn => {
  const [questionHistories, setQuestionHistories] = useState<
    Map<string, QuestionHistory>
  >(new Map());

  const saveAnswer = useCallback(
    (
      questionId: string,
      text: string,
      critique: InterviewCritique | null,
      recordingDuration?: number,
    ) => {
      const attempt: AnswerAttempt = {
        id: `${questionId}-${Date.now()}`,
        text,
        timestamp: Date.now(),
        critique,
        wordCount: text.trim().split(/\s+/).length,
        recordingDuration,
      };

      setQuestionHistories((prev) => {
        const history = prev.get(questionId) || {
          questionId,
          attempts: [],
          bestScore: 0,
          totalAttempts: 0,
        };

        const updatedAttempts = [...history.attempts, attempt];
        const bestScore = Math.max(
          ...updatedAttempts.map((a) => a.critique?.rating || 0),
        );

        return new Map(prev).set(questionId, {
          questionId,
          attempts: updatedAttempts,
          bestScore,
          totalAttempts: updatedAttempts.length,
        });
      });
    },
    [],
  );

  const getQuestionHistory = useCallback(
    (questionId: string) => {
      return questionHistories.get(questionId) || null;
    },
    [questionHistories],
  );

  const getBestAttempt = useCallback(
    (questionId: string) => {
      const history = questionHistories.get(questionId);
      if (!history || history.attempts.length === 0) return null;

      return history.attempts.reduce((best, current) => {
        const currentRating = current.critique?.rating || 0;
        const bestRating = best.critique?.rating || 0;
        return currentRating > bestRating ? current : best;
      });
    },
    [questionHistories],
  );

  const clearHistory = useCallback(() => {
    setQuestionHistories(new Map());
  }, []);

  const currentAttempts = Array.from(questionHistories.values()).flatMap(
    (h) => h.attempts,
  );

  return {
    questionHistories,
    currentAttempts,
    saveAnswer,
    getQuestionHistory,
    getBestAttempt,
    clearHistory,
  };
};
