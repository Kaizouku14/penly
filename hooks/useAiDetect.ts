import React from "react";

interface UseAiDetectReturn {
  isAiGenerated: boolean | null;
  confidence: number | null;
  analysis: string | null;
  isDetecting: boolean;
  fetchAiDetect: () => Promise<void>;
}

export function useAiDetect(text: string): UseAiDetectReturn {
  const [isAiGenerated, setIsAiGenerated] = React.useState<boolean | null>(null);
  const [confidence, setConfidence] = React.useState<number | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isDetecting, setIsDetecting] = React.useState(false);

  const fetchAiDetect = React.useCallback(async () => {
    if (!text || text.trim().length < 10) {
      setIsAiGenerated(null);
      setConfidence(null);
      setAnalysis(null);
      return;
    }

    setIsDetecting(true);

    try {
      const response = await fetch("/api/ai-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        setIsDetecting(false);
        return;
      }

      const data = (await response.json()) as {
        isAiGenerated: boolean;
        confidence: number;
        analysis: string;
      };
      setIsAiGenerated(data.isAiGenerated);
      setConfidence(data.confidence);
      setAnalysis(data.analysis);
    } catch (error: unknown) {
      console.error("AI detection failed:", error);
    } finally {
      setIsDetecting(false);
    }
  }, [text]);

  return {
    isAiGenerated,
    confidence,
    analysis,
    isDetecting,
    fetchAiDetect,
  };
}
