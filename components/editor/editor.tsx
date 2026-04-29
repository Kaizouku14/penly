"use client";

import React from "react";
import { Textarea } from "../ui/textarea";
import { highlightText } from "./helper";
import { ToneBar } from "@/components/ToneBar";
import { Match } from "@/types/match";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import { useToneAnalysis } from "@/hooks/useToneAnalysis";
import { useParaphrase } from "@/hooks/useParaphrase";
import { useAiDetect } from "@/hooks/useAiDetect";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { Toolbar } from "@/components/Toolbar";
import { ParaphraseDialog } from "@/components/ParaphraseDialog";
import { AIDetectDialog } from "@/components/AIDetectDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface EditorProps {
  onTextChange?: (text: string) => void;
}

export const Editor = ({ onTextChange }: EditorProps) => {
  const [text, setText] = React.useState("");
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [paraphraseHistory, setParaphraseHistory] = React.useState<
    string | null
  >(null);
  const [isParaphraseDialogOpen, setIsParaphraseDialogOpen] =
    React.useState(false);
  const [isAiDetectDialogOpen, setIsAiDetectDialogOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const highlightLayerRef = React.useRef<HTMLDivElement>(null);

  const { result, isChecking } = useGrammarCheck(text);
  const { tone, isAnalyzing } = useToneAnalysis(text);
  const { paraphrase, isParaphrasing, fetchParaphrase } = useParaphrase(text);
  const { isAiGenerated, confidence, analysis, isDetecting, fetchAiDetect } =
    useAiDetect(text);
  const errorCount = result?.length ?? 0;

  // Sync scroll position between textarea and highlight layer
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = target.scrollTop;
      highlightLayerRef.current.scrollLeft = target.scrollLeft;
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    onTextChange?.(newText);
  };

  const handleClear = () => {
    setText("");
    setSelectedMatch(null);
    onTextChange?.("");
  };

  const handleApplySuggestion = (
    suggestion: string,
    offset: number,
    length: number,
  ) => {
    const before = text.slice(0, offset);
    const after = text.slice(offset + length);
    const newText = before + suggestion + after;
    setText(newText);
    onTextChange?.(newText);
    setSelectedMatch(null);
  };

  const handleParaphrase = async () => {
    setIsParaphraseDialogOpen(true);
    await fetchParaphrase();
  };

  const handleApplyParaphrase = (paraphrasedText: string) => {
    // Save current text for undo
    setParaphraseHistory(text);
    setText(paraphrasedText);
    onTextChange?.(paraphrasedText);
    setSelectedMatch(null);
  };

  const handleUndoParaphrase = () => {
    if (paraphraseHistory) {
      setText(paraphraseHistory);
      onTextChange?.(paraphraseHistory);
      setParaphraseHistory(null);
    }
  };

  const handleAiDetect = async () => {
    setIsAiDetectDialogOpen(true);
    await fetchAiDetect();
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Toolbar */}
      <Toolbar
        text={text}
        onClear={handleClear}
        onParaphrase={handleParaphrase}
        onAiDetect={handleAiDetect}
        onUndo={paraphraseHistory ? handleUndoParaphrase : undefined}
        canUndo={paraphraseHistory !== null}
        isChecking={isChecking}
        errorCount={errorCount}
      />

      {/* Editor container */}
      <div className="relative w-full h-56 lg:h-80 rounded-md border border-border bg-background shadow-sm overflow-hidden">
        {/* Grammar Highlight Layer */}
        <div
          ref={highlightLayerRef}
          aria-hidden="true"
          className="absolute inset-0 p-3 font-mono text-sm wrap-break-word overflow-hidden pointer-events-none select-none text-transparent leading-relaxed"
        >
          {highlightText(text, result ?? [], selectedMatch, setSelectedMatch)}
        </div>

        {/* Textarea - interactive input */}
        <Textarea
          ref={textareaRef}
          className="absolute inset-0 p-3 w-full h-full font-mono text-sm
            bg-transparent text-foreground caret-foreground
            border-none resize-none outline-none focus-visible:ring-0
            leading-relaxed wrap-break-word"
          value={text}
          placeholder={
            isMobile
              ? "Start typing..."
              : "Start typing or paste your text here..."
          }
          onChange={(e) => handleTextChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
        />
      </div>

      {/* Feedback Panel - always visible */}
      <FeedbackPanel
        result={result}
        selectedMatch={selectedMatch}
        text={text}
        onSelectMatch={setSelectedMatch}
        onApplySuggestion={handleApplySuggestion}
      />

      {/* Tone Bar */}
      {text.trim().length > 0 && (
        <ToneBar tone={tone} isAnalyzing={isAnalyzing} text={text} />
      )}

      {/* Word count */}
      {text.trim().length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {text.trim().split(/\s+/).length} words · {text.length} characters
        </p>
      )}

      {/* Paraphrase Dialog */}
      <ParaphraseDialog
        isOpen={isParaphraseDialogOpen}
        isLoading={isParaphrasing}
        paraphrase={paraphrase}
        onClose={() => setIsParaphraseDialogOpen(false)}
        onApply={handleApplyParaphrase}
      />

      {/* AI Detect Dialog */}
      <AIDetectDialog
        isOpen={isAiDetectDialogOpen}
        isLoading={isDetecting}
        isAiGenerated={isAiGenerated}
        confidence={confidence}
        analysis={analysis}
        onClose={() => setIsAiDetectDialogOpen(false)}
      />
    </div>
  );
};
