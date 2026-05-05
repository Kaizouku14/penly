"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWritingDNA } from "@/hooks/useWritingDNA";
import { gradeToCEFR } from "@/lib/utils";
import { Zap, MessageCircle, TrendingUp, BookOpen, Brain } from "lucide-react";

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

const MetricCard = ({
  icon,
  label,
  value,
  suffix,
  description,
  color,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  description: string;
  color: "emerald" | "amber" | "red" | "accent";
  tooltip?: string;
}) => {
  const colorClasses = {
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    red: "text-red-500",
    accent: "text-accent-foreground",
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-accent/5 transition-colors"
      title={tooltip}
    >
      <div className="flex items-center gap-2">
        <span className={`${colorClasses[color]}`}>{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">
          <AnimatedNumber value={value} suffix={suffix} />
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
};

export const WritingDNA = ({ text }: WritingDNAProps) => {
  const dna = useWritingDNA(text);

  if (!dna.isReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="size-4" />
            Writing DNA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Write at least 30 words to unlock your writing analysis.
          </p>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </CardContent>
      </Card>
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

  return (
    <Card className="space-y-0">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="size-4" />
          Writing DNA
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Card className="border-l-4 border-l-accent/50 bg-accent/30 border-border">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {dna.personality.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dna.personality.description}
                </p>
              </div>
              <Brain className="size-4 text-accent-foreground shrink-0 mt-0.5" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <MetricCard
            icon={<MessageCircle className="size-4" />}
            label="Vocabulary Richness"
            value={dna.vocabularyRichness}
            suffix="%"
            description={getVocabularyLabel(dna.vocabularyRichness)}
            color={getVocabularyColor(dna.vocabularyRichness)}
            tooltip="Measure of diverse word usage. Higher is better."
          />

          <MetricCard
            icon={<TrendingUp className="size-4 " />}
            label="Avg Sentence Length"
            value={dna.avgSentenceLength}
            suffix=" words"
            description={getSentenceLengthLabel(dna.avgSentenceLength)}
            color="accent"
            tooltip="Well-balanced length is 15-25 words per sentence."
          />

          <MetricCard
            icon={<BookOpen className="size-4" />}
            label="Passive Voice Usage"
            value={dna.passivePercent}
            suffix="%"
            description={getPassiveVoiceLabel(dna.passivePercent)}
            color={getPassiveVoiceColor(dna.passivePercent)}
            tooltip="Lower is better for active, engaging writing."
          />

          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Reading Level
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {gradeToCEFR(dna.gradeLevel).level} —{" "}
              {gradeToCEFR(dna.gradeLevel).label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
