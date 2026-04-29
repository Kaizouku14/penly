import React from "react";

interface UseParaphraseReturn {
  paraphrase: string | null;
  isParaphrasing: boolean;
  fetchParaphrase: () => Promise<void>;
}

export function useParaphrase(text: string): UseParaphraseReturn {
  const [paraphrase, setParaphrase] = React.useState<string | null>(null);
  const [isParaphrasing, setIsParaphrasing] = React.useState(false);

  const fetchParaphrase = React.useCallback(async () => {
    if (!text || text.trim().length < 10) {
      setParaphrase(null);
      return;
    }

    setIsParaphrasing(true);

    try {
      const response = await fetch("/api/paraphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        setIsParaphrasing(false);
        return;
      }

      const data = (await response.json()) as {
        paraphrase: string;
      };
      setParaphrase(data.paraphrase);
    } catch (error: unknown) {
      console.error("Paraphrase failed:", error);
    } finally {
      setIsParaphrasing(false);
    }
  }, [text]);

  return {
    paraphrase,
    isParaphrasing,
    fetchParaphrase,
  };
}
