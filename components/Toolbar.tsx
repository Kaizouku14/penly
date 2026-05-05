"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, RotateCcw, Briefcase, Check } from "lucide-react";
import { ToolsMenu } from "@/components/ToolsMenu";

interface ToolbarProps {
  text: string;
  onClear: () => void;
  onUndo?: () => void;
  onParaphrase?: () => void;
  onAiDetect?: () => void;
  onJobMode?: () => void;
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
  onJobMode,
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
    <div className="flex items-center justify-between w-full gap-4">
      {/* Left: Title */}
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        Grammar Checker
      </h2>

      {/* Right: Controls Group */}
      <div className="flex items-center gap-3">
        
        {/* Status Badge */}
        <div className="flex-shrink-0">
          {isJobMode ? (
            <Badge 
              variant="secondary" 
              className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-blue-400" />
              Interview Mode
            </Badge>
          ) : isChecking ? (
            <Badge variant="outline" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Checking...
            </Badge>
          ) : errorCount > 0 ? (
            <Badge variant="destructive" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-red-400" />
              {errorCount} {errorCount === 1 ? "issue" : "issues"}
            </Badge>
          ) : hasText ? (
            <Badge 
              variant="secondary" 
              className="gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
            >
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Good
            </Badge>
          ) : null}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-border" />

        {/* Action Buttons - Primary Actions */}
        <div className="flex items-center gap-1">
          {canUndo && onUndo && (
            <Button
              onClick={onUndo}
              variant="outline"
              size="sm"
              className="gap-2"
              title="Undo paraphrase"
              aria-label="Undo paraphrase"
            >
              <RotateCcw className="size-4" />
              <span className="hidden lg:inline">Undo</span>
            </Button>
          )}

          {onJobMode && (
            <Button
              onClick={onJobMode}
              variant={isJobMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
              title={isJobMode ? "Exit Interview Mode" : "Enter Interview Mode"}
              aria-label={isJobMode ? "Exit Interview Mode" : "Enter Interview Mode"}
            >
              <Briefcase className="size-4" />
              <span className="hidden lg:inline">
                {isJobMode ? "Exit" : "Interview"}
              </span>
            </Button>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-border" />

        {/* Action Buttons - Secondary Actions */}
        <div className="flex items-center gap-1">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-2"
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
            className="gap-2"
            disabled={!hasText}
            title="Clear editor"
            aria-label="Clear editor"
          >
            <Trash2 className="size-4" />
            <span className="hidden lg:inline">Clear</span>
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
