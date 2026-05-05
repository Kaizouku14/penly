"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { highlightText } from "./helper";
import { ToneBar } from "@/components/ToneBar";
import { Match } from "@/types/match";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import { useToneAnalysis } from "@/hooks/useToneAnalysis";
import { useParaphrase } from "@/hooks/useParaphrase";
import { useAiDetect } from "@/hooks/useAiDetect";
import { useInterviewMode } from "@/hooks/useInterviewMode";
import { useInterviewCritique } from "@/hooks/useInterviewCritique";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useAnswerHistory } from "@/hooks/useAnswerHistory";
import { usePerformanceAnalytics } from "@/hooks/usePerformanceAnalytics";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { Toolbar } from "@/components/Toolbar";
import { ParaphraseDialog } from "@/components/ParaphraseDialog";
import { AIDetectDialog } from "@/components/AIDetectDialog";
import { InterviewUploadDialog } from "@/components/InterviewUploadDialog";
import { JobModePanel } from "@/components/JobModePanelEnhanced";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { parseInterviewQuestions } from "@/lib/utils/parseQuestions";
import { Upload } from "lucide-react";

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
  const [isInterviewUploadDialogOpen, setIsInterviewUploadDialogOpen] =
    React.useState(false);
  const [isUploadingResume, setIsUploadingResume] = React.useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = React.useState<
    Set<string>
  >(new Set());
  const [resumeFileName, setResumeFileName] = React.useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const highlightLayerRef = React.useRef<HTMLDivElement>(null);

  const { result, isChecking } = useGrammarCheck(text);
  const { tone, isAnalyzing } = useToneAnalysis(text);
  const { paraphrase, isParaphrasing, fetchParaphrase } = useParaphrase(text);
  const { isAiGenerated, confidence, analysis, isDetecting, fetchAiDetect } =
    useAiDetect(text);
  const {
    isInterviewMode,
    currentQuestion,
    currentQuestionIndex,
    questions: interviewQuestions,
    enableInterviewMode,
    disableInterviewMode,
    nextQuestion,
    previousQuestion,
    hasNextQuestion,
    hasPreviousQuestion,
  } = useInterviewMode();
  const { critique, isCritiquing, fetchCritique } = useInterviewCritique();
  const {
    isRecording,
    isPlayingBack,
    recordedAudio,
    waveformData,
    startRecording,
    stopRecording,
    playback,
    clearRecording,
  } = useVoiceRecording();
  const { saveAnswer, getQuestionHistory } = useAnswerHistory();
  const { trend, addMetric, getImprovementRate } = usePerformanceAnalytics();

  const errorCount = result?.length ?? 0;
  const improvementRate = getImprovementRate();
  const currentQuestionHistory =
    currentQuestion && isInterviewMode
      ? getQuestionHistory(currentQuestion.id)
      : null;
  const wordCount = text ? text.trim().split(/\s+/).length : 0;

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

  const handleFileChange = async (file: File) => {
    setIsUploadingResume(true);

    try {
      setResumeFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const parsedQuestions = parseInterviewQuestions(data.questions);
      enableInterviewMode(parsedQuestions);
      setText("");
      setIsInterviewUploadDialogOpen(false);
    } catch (error) {
      console.error("Error uploading resume:", error);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleStartInterview = () => {
    setIsInterviewUploadDialogOpen(true);
  };

  const handleStopInterview = () => {
    disableInterviewMode();
    setText("");
    setResumeFileName("");
  };

  const handleEvaluateAnswer = async () => {
    if (currentQuestion && text.trim()) {
      await fetchCritique(currentQuestion.text, text);

      // Save answer to history
      if (critique) {
        saveAnswer(currentQuestion.id, text, critique, recordedAudio?.duration);

        // Add to performance analytics
        addMetric({
          questionId: currentQuestion.id,
          rating: critique.rating,
          timestamp: Date.now(),
          category: currentQuestion.category,
          confidence: critique.confidence,
        });
      }
    }
  };

  const handleNextQuestion = () => {
    nextQuestion();
    setText("");
    clearRecording();
  };

  const handlePreviousQuestion = () => {
    previousQuestion();
    setText("");
    clearRecording();
  };

  const handleToggleBookmark = () => {
    if (currentQuestion) {
      setBookmarkedQuestions((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(currentQuestion.id)) {
          newSet.delete(currentQuestion.id);
        } else {
          newSet.add(currentQuestion.id);
        }
        return newSet;
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Editor Card */}
      <Card className="overflow-hidden">
        {/* Toolbar Header */}
        <div className="border-b border-border px-4 py-3">
          <Toolbar
            text={text}
            onClear={handleClear}
            onParaphrase={!isInterviewMode ? handleParaphrase : undefined}
            onAiDetect={!isInterviewMode ? handleAiDetect : undefined}
            onStartInterview={!isInterviewMode ? handleStartInterview : undefined}
            onStopInterview={isInterviewMode ? handleStopInterview : undefined}
            onUndo={paraphraseHistory ? handleUndoParaphrase : undefined}
            canUndo={paraphraseHistory !== null}
            isChecking={isChecking}
            errorCount={errorCount}
            isJobMode={isInterviewMode}
          />
        </div>

        {/* Editor Area */}
        <CardContent className="p-0 relative h-56 lg:h-80 overflow-hidden">
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
              isInterviewMode
                ? currentQuestion?.text || "Loading question..."
                : isMobile
                  ? "Start typing..."
                  : "Start typing or paste your text here..."
            }
            onChange={(e) => handleTextChange(e.target.value)}
            onScroll={handleScroll}
            spellCheck={false}
          />
        </CardContent>

        {/* Footer - Stats */}
        <CardFooter className="border-t border-border px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-4">
            <span>
              Words: <strong className="text-foreground">{wordCount}</strong>
            </span>
            <span>
              Characters:{" "}
              <strong className="text-foreground">{text.length}</strong>
            </span>
          </div>
          {text.length > 0 && (
            <span className="text-xs text-accent-foreground">
              Reading time: ~{Math.ceil(wordCount / 200)} min
            </span>
          )}
        </CardFooter>
      </Card>

      {/* Feedback & Analytics Section */}
      <div className="space-y-4">
        {/* Tone Analysis */}
        {text.length > 0 && (
          <ToneBar tone={tone} isAnalyzing={isAnalyzing} text={text} />
        )}

        {/* Grammar Feedback */}
        <FeedbackPanel
          result={result}
          selectedMatch={selectedMatch}
          text={text}
          onSelectMatch={setSelectedMatch}
          onApplySuggestion={handleApplySuggestion}
        />
      </div>

      {/* Job Mode Panel */}
      {isInterviewMode && currentQuestion && (
        <JobModePanel
          currentQuestion={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={interviewQuestions.length}
          critique={critique}
          isCritiquing={isCritiquing}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          onEvaluate={handleEvaluateAnswer}
          onClose={() => disableInterviewMode()}
          hasNextQuestion={hasNextQuestion}
          hasPreviousQuestion={hasPreviousQuestion}
          isRecording={isRecording}
          isPlayingBack={isPlayingBack}
          recordedAudio={recordedAudio}
          waveformData={waveformData}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onPlayback={playback}
          onClearRecording={clearRecording}
          answerText={text}
          performanceTrend={trend}
          improvementRate={improvementRate}
          questionHistory={currentQuestionHistory}
          isBookmarked={
            currentQuestion
              ? bookmarkedQuestions.has(currentQuestion.id)
              : false
          }
          onBookmark={handleToggleBookmark}
        />
      )}

      {/* Dialogs */}
      <ParaphraseDialog
        isOpen={isParaphraseDialogOpen}
        isLoading={isParaphrasing}
        paraphrase={paraphrase}
        onClose={() => setIsParaphraseDialogOpen(false)}
        onApply={handleApplyParaphrase}
      />

      <AIDetectDialog
        isOpen={isAiDetectDialogOpen}
        isLoading={isDetecting}
        isAiGenerated={isAiGenerated}
        confidence={confidence}
        analysis={analysis}
        onClose={() => setIsAiDetectDialogOpen(false)}
      />

      <InterviewUploadDialog
        isOpen={isInterviewUploadDialogOpen}
        onClose={() => setIsInterviewUploadDialogOpen(false)}
        onFileSelect={handleFileChange}
        isLoading={isUploadingResume}
      />
    </div>
  );
};
