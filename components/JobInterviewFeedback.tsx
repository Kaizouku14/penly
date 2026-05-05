"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { InterviewCritique } from "@/types/interview";

interface EnhancedFeedbackProps {
  critique: InterviewCritique;
  previousRating?: number;
}

export const EnhancedFeedback = ({
  critique,
  previousRating,
}: EnhancedFeedbackProps) => {
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({
    strengths: true,
    improvements: true,
    feedback: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 dark:text-green-400";
    if (rating >= 6) return "text-blue-600 dark:text-blue-400";
    if (rating >= 4) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 8)
      return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    if (rating >= 6)
      return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    if (rating >= 4)
      return "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800";
    return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
  };

  const ratingImprovement = previousRating
    ? critique.rating - previousRating
    : null;

  return (
    <div className="space-y-3">
      {/* Rating Header */}
      <Card
        className={`p-4 border ${getRatingBgColor(critique.rating)} flex items-center justify-between`}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span
              className={`text-3xl font-bold ${getRatingColor(critique.rating)}`}
            >
              {critique.rating}
            </span>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              {critique.rating >= 8
                ? "Excellent Response"
                : critique.rating >= 6
                  ? "Good Response"
                  : critique.rating >= 4
                    ? "Average Response"
                    : "Needs Improvement"}
            </p>
            <p className="text-xs text-muted-foreground">
              {critique.confidence}% confidence in evaluation
            </p>
          </div>
        </div>

        {ratingImprovement !== null && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              ratingImprovement > 0
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : ratingImprovement < 0
                  ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            }`}
          >
            <TrendingUp className="size-3" />
            <span className="text-xs font-semibold">
              {ratingImprovement > 0 ? "+" : ""}
              {ratingImprovement}
            </span>
          </div>
        )}
      </Card>

      {/* Strengths Section */}
      <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <button
          onClick={() => toggleSection("strengths")}
          className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 uppercase tracking-wide">
              Strengths
            </h4>
            <span className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded-full">
              {critique.strengths.length}
            </span>
          </div>
          {expandedSections.strengths ? (
            <ChevronUp className="size-4 text-green-600 dark:text-green-400" />
          ) : (
            <ChevronDown className="size-4 text-green-600 dark:text-green-400" />
          )}
        </button>

        {expandedSections.strengths && (
          <ul className="space-y-2 pl-7">
            {critique.strengths.map((strength, idx) => (
              <li
                key={idx}
                className="text-sm text-green-900 dark:text-green-100 flex items-start gap-2"
              >
                <span className="text-green-600 dark:text-green-400 font-bold mt-0.5 shrink-0">
                  ✓
                </span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Areas for Improvement Section */}
      <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <button
          onClick={() => toggleSection("improvements")}
          className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wide">
              Areas for Improvement
            </h4>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded-full">
              {critique.areasForImprovement.length}
            </span>
          </div>
          {expandedSections.improvements ? (
            <ChevronUp className="size-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <ChevronDown className="size-4 text-amber-600 dark:text-amber-400" />
          )}
        </button>

        {expandedSections.improvements && (
          <ul className="space-y-2 pl-7">
            {critique.areasForImprovement.map((area, idx) => (
              <li
                key={idx}
                className="text-sm text-amber-900 dark:text-amber-100 flex items-start gap-2"
              >
                <span className="text-amber-600 dark:text-amber-400 font-bold mt-0.5 shrink-0">
                  •
                </span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Overall Feedback Section */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <button
          onClick={() => toggleSection("feedback")}
          className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wide">
              Detailed Feedback
            </h4>
          </div>
          {expandedSections.feedback ? (
            <ChevronUp className="size-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="size-4 text-blue-600 dark:text-blue-400" />
          )}
        </button>

        {expandedSections.feedback && (
          <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed pl-7">
            {critique.overallFeedback}
          </p>
        )}
      </Card>
    </div>
  );
};
