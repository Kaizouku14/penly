import React from "react";
import { Match } from "@/types/match";
import { useDebounce } from "@/components/editor/helper";

interface UseGrammarCheckReturn {
  result: Match[] | null;
  isChecking: boolean;
}

export function useGrammarCheck(text: string): UseGrammarCheckReturn {
  const [result, setResult] = React.useState<Match[] | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const debouncedQuery = useDebounce(text, 500);
  const controllerRef = React.useRef<AbortController | null>(null);

  const handleGrammarCheck = React.useCallback(
    async (text: string): Promise<{ matches?: Match[] } | undefined> => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch("/api/grammar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        return await response.json();
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        console.error("Grammar check failed:", err);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (debouncedQuery.trim().length < 3) {
      setTimeout(() => setResult(null), 0);
      return;
    }

    setTimeout(() => setIsChecking(true), 0);

    handleGrammarCheck(debouncedQuery).then((data) => {
      setIsChecking(false);
      if (!data?.matches) return;
      setResult(data.matches);
    });
  }, [debouncedQuery, handleGrammarCheck]);

  return { result, isChecking };
}
