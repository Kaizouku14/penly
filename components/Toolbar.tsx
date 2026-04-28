"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";

interface ToolbarProps {
  text: string;
  onClear: () => void;
  isChecking?: boolean;
  errorCount?: number;
}

export const Toolbar = ({
  text,
  onClear,
  isChecking = false,
  errorCount = 0,
}: ToolbarProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-sm font-semibold tracking-wide text-foreground">
        Grammar Checker
      </h1>
      <div className="flex items-center gap-2">
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isChecking ? (
            <>
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Checking...
            </>
          ) : errorCount > 0 ? (
            <>
              <span className="size-1.5 rounded-full bg-red-400" />
              {errorCount} {errorCount === 1 ? "issue" : "issues"}
            </>
          ) : hasText ? (
            <>
              <span className="size-1.5 rounded-full bg-green-400" />
              Good
            </>
          ) : null}
        </div>

        {/* Action buttons - desktop only */}
        <div className="hidden lg:flex items-center gap-1">
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={!hasText}
          >
            <Trash2 className="size-4" />
            Clear
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={!hasText}
          >
            <Copy className="size-4" />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
};
