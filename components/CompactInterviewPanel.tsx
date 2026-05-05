"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Bookmark, Mic, Square } from "lucide-react";
import { InterviewQuestion, InterviewCritique } from "@/types/interview";
import { EnhancedFeedback } from "@/components/JobInterviewFeedback";
import { PerformanceTrends } from "@/components/PerformanceTrends";
import { PerformanceTrend } from "@/hooks/usePerformanceAnalytics";
import { QuestionHistory } from "@/hooks/useAnswerHistory";

interface CompactInterviewPanelProps {
  currentQuestion: InterviewQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  answerText: string;
  critique: InterviewCritique | null;
  isCritiquing: boolean;
  onAnswerChange: (text: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onEvaluate: () => void;
  hasNextQuestion: boolean;
  hasPreviousQuestion: boolean;
  // Voice recording
  isRecording?: boolean;
  recordedAudio?: { duration: number; waveform: number[] } | null;
  onStartRecording?: () => Promise<void>;
  onStopRecording?: () => Promise<void>;
  onClearRecording?: () => void;
  // Performance
  performanceTrend?: PerformanceTrend;
  improvementRate?: number;
  questionHistory?: QuestionHistory | null;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

export const CompactInterviewPanel = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  answerText,
  critique,
  isCritiquing,
  onAnswerChange,
  onNext,
  onPrevious,
  onEvaluate,
  hasNextQuestion,
  hasPreviousQuestion,
  isRecording = false,
  recordedAudio = null,
  onStartRecording,
  onStopRecording,
  onClearRecording,
  performanceTrend,
  improvementRate = 0,
  questionHistory,
  isBookmarked = false,
  onBookmark,
}: CompactInterviewPanelProps) => {
  if (!currentQuestion) return null;

  const wordCount = answerText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const previousAttempts = questionHistory?.attempts || [];
  const bestPreviousScore =
    previousAttempts.length > 1
      ? previousAttempts[previousAttempts.length - 2]?.critique?.rating
      : undefined;

  return (
    <div className="w-full space-y-3">
      {/* Question Card - Compact */}
      <Card className="p-3 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">
              Q{currentIndex + 1}/{totalQuestions}
            </span>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md capitalize">
              {currentQuestion.category.replace("-", " ")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onBookmark && (
              <button
                onClick={onBookmark}
                className={`p-1 rounded transition-colors ${
                  isBookmarked
                    ? "bg-amber-100 dark:bg-amber-900"
                    : "hover:bg-blue-100 dark:hover:bg-blue-900"
                }`}
                title={isBookmarked ? "Bookmarked" : "Bookmark"}
              >
                <Bookmark
                  className={`size-4 ${isBookmarked ? "fill-current text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Question Text */}
        <h3 className="font-medium text-sm leading-relaxed text-foreground">
          {currentQuestion.text}
        </h3>
      </Card>

      {/* Answer Section - Only show if no critique */}
      {!critique && (
        <div className="space-y-2">
          {/* Textarea */}
          <Textarea
            value={answerText}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isCritiquing || isRecording}
            className="min-h-24 text-sm resize-none"
          />

          {/* Word count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Words typed in your answer</span>
            <span className="font-medium text-foreground">
              {wordCount} words
            </span>
          </div>

          {/* Recording button */}
          {recordedAudio ? (
            <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded-md">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                🎤 Recording attached ({Math.floor(recordedAudio.duration)}s)
              </span>
              {onClearRecording && (
                <Button
                  onClick={onClearRecording}
                  variant="outline"
                  size="xs"
                  className="ml-auto text-xs h-6 px-2"
                  disabled={isCritiquing}
                >
                  Re-record
                </Button>
              )}
            </div>
          ) : (
            <Button
              onClick={isRecording ? onStopRecording : onStartRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              disabled={isCritiquing}
              className="w-full justify-center gap-2 text-xs"
            >
              {isRecording ? (
                <>
                  <Square className="size-3" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="size-3" />
                  Record Answer
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Feedback Section */}
      {critique && (
        <EnhancedFeedback
          critique={critique}
          previousRating={bestPreviousScore}
        />
      )}

      {/* Navigation & Action Buttons - Compact */}
      <div className="flex gap-2">
        <Button
          onClick={onPrevious}
          disabled={!hasPreviousQuestion}
          variant="outline"
          size="sm"
          className="px-2"
          title="Previous question"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {!critique ? (
          <Button
            onClick={onEvaluate}
            disabled={isCritiquing || wordCount === 0}
            variant="default"
            size="sm"
            className="flex-1 text-sm"
          >
            {isCritiquing ? "Evaluating..." : "Evaluate Answer"}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            variant="default"
            size="sm"
            className="flex-1 text-sm"
          >
            {hasNextQuestion ? "Next" : "Summary"}
          </Button>
        )}

        <Button
          onClick={onNext}
          disabled={!hasNextQuestion}
          variant="outline"
          size="sm"
          className="px-2"
          title="Next question"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Progress Bar - Minimal */}
      <div className="space-y-1">
        <div className="flex gap-1 h-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-full ${
                idx === currentIndex
                  ? "bg-blue-600 dark:bg-blue-400"
                  : idx < currentIndex
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {currentIndex + 1} of {totalQuestions}
          </span>
          <span>
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
