import React from "react";
import { Match } from "@/types/match";

interface UseRewriteReturn {
  rewritten: string | null;
  isRewriting: boolean;
}

export function useRewrite(match: Match | null, text: string): UseRewriteReturn {
  const [rewritten, setRewritten] = React.useState<string | null>(null);
  const [isRewriting, setIsRewriting] = React.useState(false);

  React.useEffect(() => {
    if (!match) {
      setTimeout(() => setRewritten(null), 0);
      return;
    }

    setTimeout(() => setIsRewriting(true), 0);

    const fetchRewrite = async () => {
      try {
        const errorText = text.slice(match.offset, match.offset + match.length);

        const response = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            errorOffset: match.offset,
            errorLength: match.length,
            errorText,
            suggestion: match.replacements?.[0]?.value || errorText,
          }),
        });

        if (!response.ok) {
          setIsRewriting(false);
          return;
        }

        const data = (await response.json()) as { rewritten: string };
        setRewritten(data.rewritten);
      } catch (error: unknown) {
        console.error("Rewrite failed:", error);
      } finally {
        setIsRewriting(false);
      }
    };

    fetchRewrite();
  }, [match, text]);

  return { rewritten, isRewriting };
}
