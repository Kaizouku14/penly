"use client";

import React from "react";
import { ToneResult, Tone } from "@/types/match";

interface ToneBarProps {
  tone: ToneResult | null;
  isAnalyzing: boolean;
  text: string;
}

const getToneBgClass = (tone: Tone): string => {
  switch (tone) {
    case "formal":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "casual":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "confident":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "uncertain":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "positive":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "negative":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "neutral":
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

const getToneLabel = (tone: Tone): string => {
  return tone.charAt(0).toUpperCase() + tone.slice(1);
};

export const ToneBar = ({ tone, isAnalyzing, text }: ToneBarProps) => {
  const wordCount = text.toLowerCase().match(/\b[a-z]+\b/g)?.length ?? 0;
  const shouldShow = wordCount >= 30;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 px-0 py-3">
      {isAnalyzing && !tone && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Analyzing tone...
        </p>
      )}

      {tone && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Tone:
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getToneBgClass(tone.primary)}`}>
              {getToneLabel(tone.primary)}
            </span>
            {tone.secondary && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium opacity-70 ${getToneBgClass(tone.secondary)}`}>
                {getToneLabel(tone.secondary)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tone.summary}
          </p>
        </div>
      )}
    </div>
  );
};
