"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToneResult, Tone } from "@/types/match";
import {
  MessageCircle, Zap, CheckCircle2, HelpCircle, Smile, AlertCircle
} from "lucide-react";

interface ToneBarProps {
  tone: ToneResult | null;
  isAnalyzing: boolean;
  text: string;
}

const TONE_ICONS: Record<Tone, React.ReactNode> = {
  formal: <MessageCircle className="size-3" />,
  casual: <Zap className="size-3" />,
  confident: <CheckCircle2 className="size-3" />,
  uncertain: <HelpCircle className="size-3" />,
  positive: <Smile className="size-3" />,
  negative: <AlertCircle className="size-3" />,
  neutral: <MessageCircle className="size-3" />,
};

const TONE_VARIANTS: Record<Tone, "default" | "secondary" | "destructive" | "outline"> = {
  formal: "secondary",
  casual: "default",
  confident: "default",
  uncertain: "outline",
  positive: "default",
  negative: "destructive",
  neutral: "outline",
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
    <Card>
      <CardContent className="pt-4 space-y-3">
        {isAnalyzing && !tone && (
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-muted-foreground">Analyzing tone...</p>
          </div>
        )}

        {tone && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={TONE_VARIANTS[tone.primary]} className="gap-1.5">
                {TONE_ICONS[tone.primary]}
                {getToneLabel(tone.primary)}
              </Badge>
              {tone.secondary && (
                <Badge
                  variant={TONE_VARIANTS[tone.secondary]}
                  className="gap-1.5 opacity-70"
                >
                  {TONE_ICONS[tone.secondary]}
                  {getToneLabel(tone.secondary)}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {tone.summary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
