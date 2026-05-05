"use client";

import React from "react";
import { Match, Category } from "@/types/match";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeedback } from "@/hooks/useFeedback";
import { AlertCircle, ChevronRight, X } from "lucide-react";
import {
  getCategoryFromIssueType,
  getCategoryLabel,
  getCategoryBgClass,
} from "@/components/editor/helper";

interface FeedbackPanelProps {
  result: Match[] | null;
  selectedMatch: Match | null;
  text: string;
  onSelectMatch: (match: Match | null) => void;
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
  const [activeFilter, setActiveFilter] = React.useState<Category | "all">(
    "all",
  );
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
      (m) => getCategoryFromIssueType(m.rule.issueType) === activeFilter,
    );
  }, [result, activeFilter]);

  // Detail view - when error is selected
  if (selectedMatch) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-sm">
                {selectedMatch.rule?.description ?? "Grammar issue"}
              </CardTitle>
              {selectedCategory && (
                <Badge variant="secondary" className="w-fit text-xs">
                  {getCategoryLabel(selectedCategory)}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectMatch(null)}
              className="h-fit"
              aria-label="Close detail view"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Message */}
          <p className="text-sm text-muted-foreground">
            {selectedMatch.message}
          </p>

          {/* Suggestions */}
          {selectedMatch.replacements &&
            selectedMatch.replacements.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
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
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      {r.value}
                    </Button>
                  ))}
                </div>
              </div>
            )}

          {/* AI Explanation */}
          {(explanation || isLoading) && (
            <div className="rounded-lg bg-accent/50 border border-border/50 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI Explanation
              </p>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded-full w-full" />
                  <div className="h-3 bg-muted rounded-full w-5/6" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {explanation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Grammar Issues</CardTitle>
        <CardDescription>
          {errorCount > 0 && text.length > 0
            ? `${filteredErrors.length} issue${filteredErrors.length !== 1 ? "s" : ""} found`
            : "No issues detected"}
        </CardDescription>
      </CardHeader>

      {errorCount > 0 && text.length > 0 ? (
        <>
          {/* Category Filter Tabs */}
          <div className="border-t border-border">
            <Tabs
              value={activeFilter}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onValueChange={(v) => setActiveFilter(v as any)}
              className="w-full"
            >
              <TabsList className="w-full h-auto gap-0 bg-transparent p-0 rounded-none justify-start border-b border-border">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs px-4"
                >
                  All ({result?.length})
                </TabsTrigger>
                {(["spelling", "grammar", "punctuation", "style"] as const).map(
                  (category) => {
                    const count =
                      result?.filter(
                        (m) =>
                          getCategoryFromIssueType(m.rule.issueType) ===
                          category,
                      ).length ?? 0;
                    return (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs px-4"
                      >
                        {getCategoryLabel(category)} ({count})
                      </TabsTrigger>
                    );
                  },
                )}
              </TabsList>
            </Tabs>
          </div>

          {/* Error List */}
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredErrors.length > 0 ? (
                filteredErrors.map((m, i) => (
                  <Button
                    key={i}
                    onClick={() => onSelectMatch(m)}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto rounded-none border-0 px-4 py-2.5 text-left hover:bg-accent/50"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <code className="font-mono text-destructive font-semibold bg-destructive/10 px-1.5 py-0.5 rounded text-xs">
                          {text.slice(m.offset, m.offset + m.length)}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.shortMessage || m.message}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground flex-shrink-0" />
                  </Button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No errors in this category
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="size-8 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {text.trim().length < 3
                  ? "Ready to check"
                  : "No issues detected"}
              </p>
              <p className="text-xs text-muted-foreground">
                {text.trim().length < 3
                  ? "Type at least a few words to begin checking."
                  : "Great writing! No issues found."}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
