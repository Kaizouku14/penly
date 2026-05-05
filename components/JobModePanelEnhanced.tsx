"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Bookmark,
  AlertCircle,
} from "lucide-react";
import { InterviewQuestion, InterviewCritique } from "@/types/interview";
import { EnhancedFeedback } from "@/components/EnhancedFeedback";
import { AnswerInput } from "@/components/AnswerInput";
import { PerformanceTrends } from "@/components/PerformanceTrends";
import { PerformanceTrend } from "@/hooks/usePerformanceAnalytics";
import { QuestionHistory } from "@/hooks/useAnswerHistory";

interface JobModePanelProps {
  currentQuestion: InterviewQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  critique: InterviewCritique | null;
  isCritiquing: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onEvaluate: () => void;
  onClose: () => void;
  hasNextQuestion: boolean;
  hasPreviousQuestion: boolean;
  // Voice recording props
  isRecording?: boolean;
  isPlayingBack?: boolean;
  recordedAudio?: { duration: number; waveform: number[] } | null;
  waveformData?: number[];
  onStartRecording?: () => Promise<void>;
  onStopRecording?: () => Promise<void>;
  onPlayback?: () => Promise<void>;
  onClearRecording?: () => void;
  // Answer text
  answerText: string;
  // Performance props
  performanceTrend?: PerformanceTrend;
  improvementRate?: number;
  questionHistory?: QuestionHistory | null;
  // Bookmarking
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

export const JobModePanel = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  critique,
  isCritiquing,
  onNext,
  onPrevious,
  onEvaluate,
  onClose,
  hasNextQuestion,
  hasPreviousQuestion,
  isRecording = false,
  isPlayingBack = false,
  recordedAudio = null,
  waveformData = [],
  onStartRecording,
  onStopRecording,
  onPlayback,
  onClearRecording,
  answerText,
  performanceTrend,
  improvementRate = 0,
  questionHistory,
  isBookmarked = false,
  onBookmark,
}: JobModePanelProps) => {
  const [showPerformance, setShowPerformance] = React.useState(false);
  const wordCount = answerText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  if (!currentQuestion) return null;

  const previousAttempts = questionHistory?.attempts || [];
  const bestPreviousScore =
    previousAttempts.length > 1
      ? previousAttempts[previousAttempts.length - 2]?.critique?.rating
      : undefined;

  return (
    <div className="space-y-4">
      {/* Question Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">
              Question {currentIndex + 1}/{totalQuestions}
            </span>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md capitalize">
              {currentQuestion.category.replace("-", " ")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onBookmark && (
              <button
                onClick={onBookmark}
                className={`p-1.5 rounded-md transition-colors ${
                  isBookmarked
                    ? "bg-amber-100 dark:bg-amber-900"
                    : "hover:bg-blue-100 dark:hover:bg-blue-900"
                }`}
                title={isBookmarked ? "Bookmarked" : "Bookmark for later"}
              >
                <Bookmark
                  className={`size-4 ${isBookmarked ? "fill-current text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}
                />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition-colors"
              title="Exit Job Mode"
            >
              <X className="size-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-base leading-relaxed">
            {currentQuestion.text}
          </h3>
          {previousAttempts.length > 0 && (
            <p className="text-xs text-muted-foreground">
              You&apos;ve attempted this question {previousAttempts.length} time
              {previousAttempts.length !== 1 ? "s" : ""} · Best score:{" "}
              <span className="font-semibold text-foreground">
                {questionHistory?.bestScore}/10
              </span>
            </p>
          )}
        </div>
      </Card>

      {/* Answer Input Section */}
      {!critique && (
        <Card className="p-4 border-dashed">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Your Answer
          </h4>
          <AnswerInput
            isRecording={isRecording}
            isPlayingBack={isPlayingBack}
            recordedAudio={recordedAudio}
            waveformData={waveformData}
            onStartRecording={onStartRecording || (() => Promise.resolve())}
            onStopRecording={onStopRecording || (() => Promise.resolve())}
            onPlayback={onPlayback || (() => Promise.resolve())}
            onClearRecording={onClearRecording || (() => {})}
            wordCount={wordCount}
            disabled={isCritiquing || isRecording}
          />
        </Card>
      )}

      {/* Critique Results */}
      {critique && (
        <>
          <EnhancedFeedback
            critique={critique}
            previousRating={bestPreviousScore}
          />

          {/* Attempt Info */}
          <Card className="p-3 bg-gray-50 dark:bg-gray-900 border-dashed">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="size-3" />
              <span>
                Attempt {previousAttempts.length} of your practice session
              </span>
            </div>
          </Card>
        </>
      )}

      {/* Performance Trends Toggle */}
      {performanceTrend && performanceTrend.totalQuestions > 0 && (
        <button
          onClick={() => setShowPerformance(!showPerformance)}
          className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline text-left"
        >
          {showPerformance ? "Hide" : "View"} Performance Analytics
        </button>
      )}

      {/* Performance Trends */}
      {showPerformance && performanceTrend && improvementRate !== undefined && (
        <PerformanceTrends
          trend={performanceTrend}
          improvementRate={improvementRate}
        />
      )}

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onPrevious}
          disabled={!hasPreviousQuestion}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:block">Previous</span>
        </Button>

        {!critique ? (
          <Button
            onClick={onEvaluate}
            disabled={isCritiquing || wordCount === 0}
            variant="default"
            size="sm"
            className="flex-1"
          >
            {isCritiquing ? "Evaluating..." : "Evaluate Answer"}
          </Button>
        ) : (
          <Button
            onClick={() => {
              // Reset for re-attempt
              onNext();
            }}
            variant="default"
            size="sm"
            className="flex-1"
          >
            {hasNextQuestion ? "Next Question" : "See Summary"}
          </Button>
        )}

        <Button
          onClick={onNext}
          disabled={!hasNextQuestion}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <span className="hidden sm:block">Next</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Progress Indicators */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isCurrentQuestion = idx === currentIndex;
            const isCompleted = idx < currentIndex;

            return (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-all ${
                  isCurrentQuestion
                    ? "bg-blue-600 dark:bg-blue-400"
                    : isCompleted
                      ? "bg-green-500 dark:bg-green-400"
                      : "bg-muted"
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {currentIndex + 1} of {totalQuestions}
          </span>
          <span>
            {(((currentIndex + 1) / totalQuestions) * 100).toFixed(0)}% Complete
          </span>
        </div>
      </div>
    </div>
  );
};
