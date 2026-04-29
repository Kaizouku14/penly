"use client";

import React from "react";
import { Match, Category } from "@/types/match";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/hooks/useFeedback";
import {
  getCategoryFromIssueType,
  getCategoryLabel,
  getCategoryBgClass,
} from "@/components/editor/helper";

interface FeedbackPanelProps {
  result: Match[] | null;
  selectedMatch: Match | null;
  text: string;
  onSelectMatch: (match: Match) => void;
  onApplySuggestion: (
    suggestion: string,
    offset: number,
    length: number,
  ) => void;
}

export const FeedbackPanel = ({
  result,
  selectedMatch,
  text,
  onSelectMatch,
  onApplySuggestion,
}: FeedbackPanelProps) => {
  const [activeFilter, setActiveFilter] = React.useState<Category | "all">("all");
  const errorCount = result?.length ?? 0;

  const errorText = selectedMatch
    ? text.slice(
        selectedMatch.offset,
        selectedMatch.offset + selectedMatch.length,
      )
    : "";

  const selectedCategory = selectedMatch
    ? getCategoryFromIssueType(selectedMatch.rule.issueType)
    : null;

  const { explanation, isLoading } = useFeedback(selectedMatch, errorText);

  // Filter errors by category
  const filteredErrors = React.useMemo(() => {
    if (!result) return [];
    if (activeFilter === "all") return result;
    return result.filter(
      (m) => getCategoryFromIssueType(m.rule.issueType) === activeFilter
    );
  }, [result, activeFilter]);

  const handleSelectMatch = (match: Match) => {
    onSelectMatch(match);
  };

  if (selectedMatch) {
    return (
      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold text-foreground">
              {selectedMatch.rule?.description ?? "Grammar issue"}
            </p>
            {selectedCategory && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryBgClass(selectedCategory)}`}
              >
                {getCategoryLabel(selectedCategory)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {selectedMatch.message}
          </p>
        </div>

        {selectedMatch.replacements &&
          selectedMatch.replacements.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-1">
                {selectedMatch.replacements.slice(0, 5).map((r, i) => (
                  <Button
                    key={i}
                    onClick={() =>
                      onApplySuggestion(
                        r.value,
                        selectedMatch.offset,
                        selectedMatch.length,
                      )
                    }
                    className="px-2 py-0.5 text-xs rounded border border-border
                    bg-background hover:bg-accent transition-colors text-foreground"
                  >
                    {r.value}
                  </Button>
                ))}
              </div>
            </div>
          )}

        {explanation && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              {explanation}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground animate-pulse">
              Getting explanation...
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
      {errorCount > 0 ? (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap gap-1 pb-2 border-b border-border">
            <Button
              onClick={() => setActiveFilter("all")}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                activeFilter === "all"
                  ? "bg-accent text-foreground"
                  : "bg-background hover:bg-accent text-muted-foreground"
              }`}
            >
              All
            </Button>
            {(["spelling", "grammar", "punctuation", "style"] as const).map(
              (category) => (
                <Button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    activeFilter === category
                      ? "bg-accent text-foreground"
                      : "bg-background hover:bg-accent text-muted-foreground"
                  }`}
                >
                  {getCategoryLabel(category)}
                </Button>
              ),
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-1">
            {filteredErrors.length > 0
              ? "Click an underlined word to see details."
              : "No errors in this category."}
          </p>

          {filteredErrors.map((m, i) => (
            <Button
              key={i}
              onClick={() => handleSelectMatch(m)}
              className="text-left text-xs px-2 py-1.5 rounded border border-border
                bg-background hover:bg-accent transition-colors justify-start"
            >
              <span className="font-medium text-red-500">
                {text.slice(m.offset, m.offset + m.length)}
              </span>
              <span className="text-muted-foreground ml-2 truncate">
                — {m.shortMessage || m.message}
              </span>
            </Button>
          ))}
        </>
      ) : (
        <p className="text-xs text-muted-foreground m-auto text-center">
          {text.trim().length < 3
            ? "Type at least a few words to begin."
            : "No issues detected."}
        </p>
      )}
    </div>
  );
};
