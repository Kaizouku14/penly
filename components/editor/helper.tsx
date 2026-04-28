import React from "react";
import { Match, Category } from "@/types/match";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Map LanguageTool's issueType to our Category type.
 */
export function getCategoryFromIssueType(issueType: string): Category {
  const lower = issueType.toLowerCase();
  if (lower === "misspelling") return "spelling";
  if (lower === "grammar") return "grammar";
  if (lower === "typographical") return "punctuation";
  if (lower === "style" || lower === "register") return "style";
  return "other";
}

/**
 * Get the Tailwind decoration color class for a category.
 */
export function getDecorationColorClass(category: Category): string {
  switch (category) {
    case "spelling":
      return "decoration-red-500";
    case "grammar":
      return "decoration-blue-500";
    case "punctuation":
      return "decoration-amber-500";
    case "style":
      return "decoration-purple-500";
    case "other":
    default:
      return "decoration-gray-400";
  }
}

/**
 * Get the background color class for a category (for badges/buttons).
 */
export function getCategoryBgClass(category: Category): string {
  switch (category) {
    case "spelling":
      return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    case "grammar":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    case "punctuation":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
    case "style":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
    case "other":
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
  }
}

/**
 * Get the readable label for a category.
 */
export function getCategoryLabel(category: Category): string {
  switch (category) {
    case "spelling":
      return "Spelling";
    case "grammar":
      return "Grammar";
    case "punctuation":
      return "Punctuation";
    case "style":
      return "Style";
    case "other":
    default:
      return "Other";
  }
}

/**
 * Extract the sentence containing the given offset.
 * Returns the sentence text and its start/end positions in the full text.
 */
export function getSentenceAtOffset(
  text: string,
  offset: number
): { sentence: string; start: number; end: number } {
  // Find sentence start (look backward for . ! ? or beginning)
  let start = 0;
  for (let i = offset - 1; i >= 0; i--) {
    if (text[i] === "." || text[i] === "!" || text[i] === "?" || text[i] === "\n") {
      start = i + 1;
      break;
    }
  }

  // Skip leading whitespace
  while (start < text.length && /\s/.test(text[start])) {
    start++;
  }

  // Find sentence end (look forward for . ! ? or end)
  let end = text.length;
  for (let i = offset; i < text.length; i++) {
    if (text[i] === "." || text[i] === "!" || text[i] === "?" || text[i] === "\n") {
      end = i + 1;
      break;
    }
  }

  const sentence = text.slice(start, end).trim();
  return { sentence, start, end };
}

export function highlightText(
  text: string,
  matches: Match[],
  selectedMatch: Match | null,
  onSelect: (match: Match) => void,
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  const sorted = [...matches].sort((a, b) => a.offset - b.offset);

  sorted.forEach((m, i) => {
    const start = m.offset;
    const end = m.offset + m.length;
    const category = getCategoryFromIssueType(m.rule.issueType);
    const decorationColor = getDecorationColorClass(category);

    // Push plain text before this match
    if (lastIndex < start) {
      result.push(
        <span key={`text-${i}`} className="text-foreground">
          {text.slice(lastIndex, start)}
        </span>,
      );
    }

    const isSelected = selectedMatch?.offset === m.offset;

    result.push(
      <mark
        key={`match-${start}-${i}`}
        onClick={() => onSelect(m)}
        style={{ pointerEvents: "auto" }}
        className={`
          cursor-pointer rounded-sm transition-colors
          underline decoration-wavy underline-offset-2 ${decorationColor}
          ${
            isSelected
              ? "bg-red-200/60 text-foreground dark:bg-red-900/40"
              : "bg-red-100/40 text-foreground hover:bg-red-200/50 dark:bg-red-900/20 dark:hover:bg-red-900/40"
          }
        `}
      >
        {text.slice(start, end)}
      </mark>,
    );

    lastIndex = end;
  });

  // Push remaining text
  if (lastIndex < text.length) {
    result.push(
      <span key="text-tail" className="text-foreground">
        {text.slice(lastIndex)}
      </span>,
    );
  }

  return result;
}
