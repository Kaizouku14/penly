/**
 * Hook for managing interview mode state
 */

import { useState, useCallback } from "react";
import { InterviewQuestion } from "@/types/interview";

interface UseInterviewModeReturn {
  isInterviewMode: boolean;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  currentQuestion: InterviewQuestion | null;
  enableInterviewMode: (questions: InterviewQuestion[]) => void;
  disableInterviewMode: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  hasNextQuestion: boolean;
  hasPreviousQuestion: boolean;
}

export const useInterviewMode = (): UseInterviewModeReturn => {
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  const enableInterviewMode = useCallback(
    (interviewQuestions: InterviewQuestion[]) => {
      if (interviewQuestions.length === 0) return;
      setQuestions(interviewQuestions);
      setCurrentQuestionIndex(0);
      setIsInterviewMode(true);
    },
    [],
  );

  const disableInterviewMode = useCallback(() => {
    setIsInterviewMode(false);
    setCurrentQuestionIndex(0);
    setQuestions([]);
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      const next = prev + 1;
      return next < questions.length ? next : prev;
    });
  }, [questions.length]);

  const previousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentQuestionIndex(index);
      }
    },
    [questions.length],
  );

  const currentQuestion =
    questions[currentQuestionIndex] || null;
  const hasNextQuestion = currentQuestionIndex < questions.length - 1;
  const hasPreviousQuestion = currentQuestionIndex > 0;

  return {
    isInterviewMode,
    currentQuestionIndex,
    questions,
    currentQuestion,
    enableInterviewMode,
    disableInterviewMode,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    hasNextQuestion,
    hasPreviousQuestion,
  };
};
