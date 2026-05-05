"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, RotateCcw, Check } from "lucide-react";
import { ToolsMenu } from "@/components/ToolsMenu";

interface ToolbarProps {
  text: string;
  onClear: () => void;
  onUndo?: () => void;
  onParaphrase: () => void;
  onAiDetect: () => void;
  onStartInterview?: () => void;
  onStopInterview?: () => void;
  canUndo?: boolean;
  isChecking?: boolean;
  errorCount?: number;
  isJobMode?: boolean;
}

export const Toolbar = ({
  text,
  onClear,
  onUndo,
  onParaphrase,
  onAiDetect,
  onStartInterview,
  onStopInterview,
  canUndo = false,
  isChecking = false,
  errorCount = 0,
  isJobMode = false,
}: ToolbarProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-between">
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        {isJobMode ? "Job Interview Mode" : "Grammar Checker"}
      </h2>

      <div className="flex gap-3 w-full md:w-auto flex-row md:items-center md:gap-3">
        <div className="shrink-0 md:mb-2">
          {isJobMode ? (
            <Badge
              variant="secondary"
              className="gap-1.5 text-blue-400 w-full md:w-auto justify-center"
            >
              <span className="size-1.5 rounded-full bg-blue-400" />
              Interview Mode
            </Badge>
          ) : isChecking ? (
            <Badge
              variant="outline"
              className="gap-1.5 text-amber-400 w-full md:w-auto justify-center"
            >
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Checking...
            </Badge>
          ) : errorCount > 0 ? (
            <Badge
              variant="destructive"
              className="gap-1.5 text-red-400 w-full md:w-auto justify-center"
            >
              <span className="size-1.5 rounded-full bg-red-400" />
              {errorCount} {errorCount === 1 ? "issue" : "issues"}
            </Badge>
          ) : hasText ? (
            <Badge
              variant="secondary"
              className="gap-1.5 text-emerald-400 w-full md:w-auto justify-center"
            >
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Good
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-1 w-full md:w-auto">
          {canUndo && onUndo && (
            <Button
              onClick={onUndo}
              variant="outline"
              size="sm"
              className="gap-2 flex-1 md:flex-none"
              title="Undo paraphrase"
              aria-label="Undo paraphrase"
            >
              <RotateCcw className="size-4" />
              <span className="hidden lg:inline">Undo</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 w-full md:w-auto">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-2 flex-1 md:flex-none"
            disabled={!hasText}
            title={copied ? "Copied!" : "Copy to clipboard"}
            aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
          >
            {copied ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
            )}
            <span className="hidden lg:inline">
              {copied ? "Copied" : "Copy"}
            </span>
          </Button>

          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="gap-2 flex-1 md:flex-none"
            disabled={!hasText}
            title="Clear editor"
            aria-label="Clear editor"
          >
            <Trash2 className="size-4" />
            <span className="hidden lg:inline">Clear</span>
          </Button>

          <ToolsMenu
            onParaphrase={onParaphrase}
            onAiDetect={onAiDetect}
            onStopInterview={onStopInterview}
            onStartInterview={onStartInterview}
            isInterviewMode={isJobMode}
          />
        </div>
      </div>
    </div>
  );
};
