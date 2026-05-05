"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Check,
} from "lucide-react";
import { InterviewCritique } from "@/types/interview";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface EnhancedFeedbackProps {
  critique: InterviewCritique;
  previousRating?: number;
}

export const EnhancedFeedback = ({
  critique,
  previousRating,
}: EnhancedFeedbackProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 dark:text-green-400";
    if (rating >= 6) return "text-blue-600 dark:text-blue-400";
    if (rating >= 4) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getRatingBorder = (rating: number) => {
    if (rating >= 8) return "border-green-200 dark:border-green-800";
    if (rating >= 6) return "border-blue-200 dark:border-blue-800";
    if (rating >= 4) return "border-amber-200 dark:border-amber-800";
    return "border-red-200 dark:border-red-800";
  };

  const ratingImprovement = previousRating
    ? critique.rating - previousRating
    : null;

  return (
    <div className="space-y-3">
      {/* Rating Header */}
      <Card
        className={`p-4 border ${getRatingBorder(critique.rating)}`}
      >
        <div className="flex items-center justify-between">
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
                  ? "text-green-600 dark:text-green-400"
                  : ratingImprovement < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              <TrendingUp className="size-3" />
              <span className="text-xs font-semibold">
                {ratingImprovement > 0 ? "+" : ""}
                {ratingImprovement}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Accordion type="multiple" defaultValue={["strengths", "improvements", "feedback"]}>
        <AccordionItem value="strengths" className="border-0">
          <Card className="p-0 ">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-400 shrink-0" />
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Strengths
                </h4>
                <span className="text-xs font-medium text-muted-foreground">
                  {critique.strengths.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 pt-0">
              <ul className="space-y-2 pl-7">
                {critique.strengths.map((strength, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-foreground flex items-start gap-2"
                  >
                    <Check className="text-green-400 size-4 mt-0.5 shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="improvements" className="border-0">
          <Card className="p-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-400 shrink-0" />
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Areas for Improvement
                </h4>
                <span className="text-xs font-medium text-muted-foreground">
                  {critique.areasForImprovement.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 pt-0">
              <ul className="space-y-2 pl-7">
                {critique.areasForImprovement.map((area, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-foreground flex items-start gap-2"
                  >
                    <span className="text-amber-600 dark:text-amber-400 font-bold mt-0.5 shrink-0">
                      •
                    </span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="feedback" className="border-0">
          <Card className="p-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Detailed Feedback
                </h4>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 pt-0">
              <p className="text-sm text-foreground leading-relaxed pl-7">
                {critique.overallFeedback}
              </p>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
