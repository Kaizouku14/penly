"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, AlertCircle, CheckCircle } from "lucide-react";
import { InterviewQuestion, InterviewCritique } from "@/types/interview";

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
}: JobModePanelProps) => {
  if (!currentQuestion) return null;

  const isGoodRating = critique && critique.rating >= 7;

  return (
    <div className="space-y-4">
      {/* Question Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                  Question {currentIndex + 1} of {totalQuestions}
                </Badge>
              </div>
              <CardTitle className="text-base">
                {currentQuestion.text}
              </CardTitle>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-fit"
              title="Exit Interview Mode"
              aria-label="Exit Interview Mode"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground capitalize">
            Category: <strong className="text-foreground">{currentQuestion.category.replace("-", " ")}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Progress</p>
        <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="h-2" />
      </div>

      {/* Critique Results */}
      {critique && (
        <Card className={`border-l-4 ${isGoodRating ? "border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20" : "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm">Interview Response Rating</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${isGoodRating ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {critique.rating}/10
                </div>
                <div className="flex items-center gap-1">
                  {isGoodRating ? (
                    <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {critique.confidence}% confident
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Feedback Sections */}
            {critique.strengths && critique.strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Strengths
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {critique.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle className="size-3 mt-0.5 flex-shrink-0 text-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {critique.areasForImprovement && critique.areasForImprovement.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Areas to Improve
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {critique.areasForImprovement.map((imp, i) => (
                    <li key={i} className="flex gap-2">
                      <AlertCircle className="size-3 mt-0.5 flex-shrink-0 text-amber-500" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Feedback */}
            {critique.overallFeedback && (
              <div className="rounded-lg bg-background/50 border border-border p-3">
                <p className="text-xs text-muted-foreground">
                  {critique.overallFeedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isCritiquing && (
        <Card className="bg-accent/20 border-accent/30">
          <CardContent className="pt-4 flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent animate-pulse" />
            <p className="text-xs text-accent">Evaluating your response...</p>
          </CardContent>
        </Card>
      )}

      {/* Evaluate Button */}
      {!critique && !isCritiquing && (
        <Button onClick={onEvaluate} className="w-full gap-2">
          <CheckCircle className="size-4" />
          Evaluate Response
        </Button>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onPrevious}
          disabled={!hasPreviousQuestion}
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasNextQuestion}
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
