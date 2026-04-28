import React from "react";
import { ToneResult } from "@/types/match";
import { useDebounce } from "@/components/editor/helper";

interface UseToneAnalysisReturn {
  tone: ToneResult | null;
  isAnalyzing: boolean;
}

export function useToneAnalysis(text: string): UseToneAnalysisReturn {
  const debouncedText = useDebounce(text, 1500);
  const [tone, setTone] = React.useState<ToneResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    // Count words
    const words = debouncedText.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
    if (words.length < 30) {
      setTimeout(() => setTone(null), 0);
      return;
    }

    setTimeout(() => setIsAnalyzing(true), 0);

    const fetchTone = async () => {
      try {
        const response = await fetch("/api/tone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: debouncedText }),
        });

        if (!response.ok) {
          setIsAnalyzing(false);
          return;
        }

        const data = (await response.json()) as ToneResult;
        setTone(data);
      } catch (error: unknown) {
        console.error("Tone analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchTone();
  }, [debouncedText]);

  return { tone, isAnalyzing };
}
