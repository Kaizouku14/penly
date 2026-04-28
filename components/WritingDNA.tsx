"use client";

import React from "react";
import { useWritingDNA } from "@/hooks/useWritingDNA";
import { gradeToCEFR } from "@/lib/utils";

interface WritingDNAProps {
  text: string;
}

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
}

const AnimatedNumber = ({ value, suffix = "" }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let frameId: number;
    const startTime = performance.now();
    const duration = 600; // ms

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setDisplayValue(Math.floor(value * progress));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
};

const MetricBar = ({
  value,
  max = 100,
  label,
  color,
}: {
  value: number;
  max?: number;
  label: string;
  color: "emerald" | "amber" | "red";
}) => {
  const colorMap = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    red: "bg-red-400",
  };

  const percentage = (value / max) * 100;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const WritingDNA = ({ text }: WritingDNAProps) => {
  const dna = useWritingDNA(text);

  if (!dna.isReady) {
    return (
      <div className="w-full md:w-72 flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 h-fit">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            ✦ Writing DNA
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Write at least 30 words to unlock your writing analysis.
          </p>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-muted/50 w-full" />
            <div className="h-2 rounded-full bg-muted/50 w-3/4" />
            <div className="h-2 rounded-full bg-muted/50 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  const getVocabularyColor = (
    richness: number,
  ): "emerald" | "amber" | "red" => {
    if (richness >= 70) return "emerald";
    if (richness >= 50) return "amber";
    return "red";
  };

  const getVocabularyLabel = (richness: number): string => {
    if (richness >= 70) return "Varied";
    if (richness >= 50) return "Average";
    return "Repetitive";
  };

  const getSentenceLengthLabel = (avgLen: number): string => {
    if (avgLen < 15) return "Short & punchy";
    if (avgLen <= 25) return "Well-balanced";
    return "Long & complex";
  };

  const getPassiveVoiceColor = (
    passive: number,
  ): "emerald" | "amber" | "red" => {
    if (passive < 10) return "emerald";
    if (passive <= 25) return "amber";
    return "red";
  };

  const getPassiveVoiceLabel = (passive: number): string => {
    if (passive < 10) return "Active voice";
    if (passive <= 25) return "Moderate";
    return "Heavy passive";
  };

  const personalityColor =
    dna.personality.label === "Sharp Communicator"
      ? "border-emerald-400"
      : dna.personality.label === "Conversational"
        ? "border-amber-400"
        : "border-amber-400";

  return (
    <div className="w-full md:w-72 flex flex-col gap-4 rounded-lg border border-border bg-background p-4 h-fit">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">
          ✦ Writing DNA
        </span>
      </div>

      {/* Personality Badge */}
      <div
        className={`border-l-4 ${personalityColor} pl-3 py-2 transition-all`}
      >
        <p className="text-lg font-semibold text-foreground">
          {dna.personality.label}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {dna.personality.description}
        </p>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        {/* Vocabulary Richness */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Vocabulary richness
            </span>
            <span className="text-sm font-semibold text-foreground">
              <AnimatedNumber value={dna.vocabularyRichness} suffix="%" /> —{" "}
              <span className="text-xs">
                {getVocabularyLabel(dna.vocabularyRichness)}
              </span>
            </span>
          </div>
          <MetricBar
            value={dna.vocabularyRichness}
            label=""
            color={getVocabularyColor(dna.vocabularyRichness)}
          />
        </div>

        {/* Average Sentence Length */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Avg sentence length
            </span>
            <span className="text-sm font-semibold text-foreground">
              <AnimatedNumber value={dna.avgSentenceLength} /> words —{" "}
              <span className="text-xs">
                {getSentenceLengthLabel(dna.avgSentenceLength)}
              </span>
            </span>
          </div>
        </div>

        {/* Passive Voice */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Passive voice
            </span>
            <span className="text-sm font-semibold text-foreground">
              <AnimatedNumber value={dna.passivePercent} suffix="%" /> —{" "}
              <span className="text-xs">
                {getPassiveVoiceLabel(dna.passivePercent)}
              </span>
            </span>
          </div>
          <MetricBar
            value={dna.passivePercent}
            max={50}
            label=""
            color={getPassiveVoiceColor(dna.passivePercent)}
          />
        </div>

        {/* Reading Grade Level */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Reading level
            </span>
            <span className="text-sm font-semibold text-foreground">
              {gradeToCEFR(dna.gradeLevel).level} —{" "}
              <span className="text-xs">
                {gradeToCEFR(dna.gradeLevel).label}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
