import { useState, useCallback, useEffect } from "react";
import { InterviewQuestion, InterviewCritique } from "@/types/interview";

export interface StoredAnswer {
  questionId: string;
  text: string;
  audioData?: {
    waveform: number[];
    duration: number;
    base64: string; // Base64 encoded audio blob
  };
  critique?: InterviewCritique;
  timestamp: number;
  wordCount: number;
}

export interface InterviewSessionData {
  resumeQuestions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: StoredAnswer[];
  sessionStartTime: number;
  lastUpdated: number;
}

const SESSION_STORAGE_KEY = "interview_session";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Validates and sanitizes interview session data
 */
function validateSessionData(data: unknown): data is InterviewSessionData {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.resumeQuestions)) return false;
  if (typeof obj.currentQuestionIndex !== "number") return false;
  if (!Array.isArray(obj.answers)) return false;
  if (typeof obj.sessionStartTime !== "number") return false;
  if (typeof obj.lastUpdated !== "number") return false;

  // Validate answers structure
  return obj.answers.every((answer: unknown) => {
    const ans = answer as Record<string, unknown>;
    if (!ans.questionId || typeof ans.text !== "string") return false;
    if (typeof ans.timestamp !== "number") return false;
    if (typeof ans.wordCount !== "number") return false;
    if (
      ans.audioData &&
      (!Array.isArray((ans.audioData as Record<string, unknown>).waveform) ||
        typeof (ans.audioData as Record<string, unknown>).duration !== "number" ||
        typeof (ans.audioData as Record<string, unknown>).base64 !== "string")
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Checks if session has expired
 */
function isSessionExpired(lastUpdated: number): boolean {
  return Date.now() - lastUpdated > SESSION_EXPIRY_MS;
}

/**
 * Hook for managing interview session persistence
 */
export const useInterviewSessionStorage = () => {
  const [sessionData, setSessionData] = useState<InterviewSessionData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as unknown;
          
          // Validate data structure
          if (!validateSessionData(parsed)) {
            console.warn("Invalid session data structure, clearing storage");
            localStorage.removeItem(SESSION_STORAGE_KEY);
            setIsLoaded(true);
            return;
          }

          // Check expiration
          if (isSessionExpired(parsed.lastUpdated)) {
            console.warn("Session expired, clearing storage");
            localStorage.removeItem(SESSION_STORAGE_KEY);
            setIsLoaded(true);
            return;
          }

          setSessionData(parsed);
        }
        setIsLoaded(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load session";
        console.error("Session loading error:", errorMessage);
        setError(new Error(errorMessage));
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setIsLoaded(true);
      }
    };

    loadSession();
  }, []);

  /**
   * Save complete session to localStorage
   */
  const saveSession = useCallback(
    (data: InterviewSessionData) => {
      try {
        if (!validateSessionData(data)) {
          throw new Error("Invalid session data structure");
        }

        const toStore: InterviewSessionData = {
          ...data,
          lastUpdated: Date.now(),
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toStore));
        setSessionData(toStore);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save session";
        console.error("Session save error:", errorMessage);
        setError(new Error(errorMessage));
      }
    },
    []
  );

  /**
   * Update or add an answer to the session
   */
  const updateAnswer = useCallback(
    (answer: StoredAnswer) => {
      try {
        if (!sessionData) {
          throw new Error("No active session");
        }

        const existingIndex = sessionData.answers.findIndex(
          (a) =>
            a.questionId === answer.questionId &&
            a.timestamp === answer.timestamp
        );

        const updatedAnswers = [...sessionData.answers];
        if (existingIndex >= 0) {
          updatedAnswers[existingIndex] = answer;
        } else {
          updatedAnswers.push(answer);
        }

        const updatedSession: InterviewSessionData = {
          ...sessionData,
          answers: updatedAnswers,
        };

        saveSession(updatedSession);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update answer";
        console.error("Answer update error:", errorMessage);
        setError(new Error(errorMessage));
      }
    },
    [sessionData, saveSession]
  );

  /**
   * Get answer for a specific question
   */
  const getAnswer = useCallback(
    (questionId: string): StoredAnswer | undefined => {
      if (!sessionData) return undefined;
      // Return the most recent answer for this question
      return sessionData.answers
        .filter((a) => a.questionId === questionId)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
    },
    [sessionData]
  );

  /**
   * Initialize a new session
   */
  const initializeSession = useCallback(
    (questions: InterviewQuestion[]) => {
      try {
        const newSession: InterviewSessionData = {
          resumeQuestions: questions,
          currentQuestionIndex: 0,
          answers: [],
          sessionStartTime: Date.now(),
          lastUpdated: Date.now(),
        };

        saveSession(newSession);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize session";
        console.error("Session initialization error:", errorMessage);
        setError(new Error(errorMessage));
      }
    },
    [saveSession]
  );

  /**
   * Update current question index
   */
  const setCurrentQuestionIndex = useCallback(
    (index: number) => {
      try {
        if (!sessionData) throw new Error("No active session");
        saveSession({
          ...sessionData,
          currentQuestionIndex: index,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update question index";
        console.error("Question index update error:", errorMessage);
        setError(new Error(errorMessage));
      }
    },
    [sessionData, saveSession]
  );

  /**
   * Toggle bookmark status for a question
   */
  const toggleBookmark = useCallback(
    () => {
      // Bookmark functionality removed
      console.warn("Bookmark functionality has been removed");
    },
    []
  );

  /**
   * Clear entire session
   */
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSessionData(null);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to clear session";
      console.error("Session clear error:", errorMessage);
      setError(new Error(errorMessage));
    }
  }, []);

  /**
   * Export session data (for backup or debugging)
   */
  const exportSession = useCallback((): InterviewSessionData | null => {
    return sessionData;
  }, [sessionData]);

  return {
    sessionData,
    isLoaded,
    error,
    saveSession,
    updateAnswer,
    getAnswer,
    initializeSession,
    setCurrentQuestionIndex,
    toggleBookmark,
    clearSession,
    exportSession,
  };
};
