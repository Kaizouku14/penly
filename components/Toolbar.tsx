"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, RotateCcw } from "lucide-react";
import { ToolsMenu } from "@/components/ToolsMenu";

interface ToolbarProps {
  text: string;
  onClear: () => void;
  onUndo?: () => void;
  onParaphrase?: () => void;
  onAiDetect?: () => void;
  canUndo?: boolean;
  isChecking?: boolean;
  errorCount?: number;
}

export const Toolbar = ({
  text,
  onClear,
  onUndo,
  onParaphrase,
  onAiDetect,
  canUndo = false,
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
          {canUndo && onUndo && (
            <Button
              onClick={onUndo}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              title="Undo paraphrase"
            >
              <RotateCcw className="size-4" />
              Undo
            </Button>
          )}

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
          {onParaphrase && onAiDetect && (
            <ToolsMenu
              onParaphrase={onParaphrase}
              onAiDetect={onAiDetect}
              hasText={hasText}
            />
          )}
        </div>
      </div>
    </div>
  );
};
