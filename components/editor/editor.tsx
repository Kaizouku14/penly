"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { Toolbar } from "@/components/Toolbar";
import { ParaphraseDialog } from "@/components/ParaphraseDialog";
import { AIDetectDialog } from "@/components/AIDetectDialog";
import { InterviewUploadDialog } from "@/components/InterviewUploadDialog";
import { CompactInterviewPanel } from "@/components/CompactInterviewPanel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { parseInterviewQuestions } from "@/lib/utils/parseQuestions";
import { useInterviewSessionStorage } from "@/hooks/useInterviewSessionStorage";

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
  const { critique, isCritiquing, error: critiqueError, fetchCritique, clearCritique } = useInterviewCritique();
  const {
    isRecording,
    recordedAudio,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecording();
  const { saveAnswer, getQuestionHistory } = useAnswerHistory();
  const {
    sessionData,
    isLoaded: isSessionLoaded,
    error: sessionError,
    initializeSession,
    setCurrentQuestionIndex,
    updateAnswer,
    getAnswer,
    clearSession,
  } = useInterviewSessionStorage();

  const errorCount = result?.length ?? 0;
  const currentQuestionHistory =
    currentQuestion && isInterviewMode
      ? getQuestionHistory(currentQuestion.id)
      : null;
  const wordCount = text ? text.trim().split(/\s+/).length : 0;

  // Restore session on mount
  React.useEffect(() => {
    if (isSessionLoaded && sessionData && !isInterviewMode) {
      // Restore interview session
      enableInterviewMode(sessionData.resumeQuestions);
      setCurrentQuestionIndex(sessionData.currentQuestionIndex);

      // Restore current question's answer
      if (currentQuestion && sessionData.resumeQuestions.length > 0) {
        const currentQ = sessionData.resumeQuestions[sessionData.currentQuestionIndex];
        const storedAnswer = getAnswer(currentQ.id);
        if (storedAnswer) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setText(storedAnswer.text);
        }
      }
    }
  }, [currentQuestion, enableInterviewMode, getAnswer, isInterviewMode, isSessionLoaded, sessionData, setCurrentQuestionIndex]);

  // Save answer to session storage whenever text or recording changes
  React.useEffect(() => {
    if (!isInterviewMode || !currentQuestion || !isSessionLoaded) return;

    const timer = setTimeout(() => {
      updateAnswer({
        questionId: currentQuestion.id,
        text,
        timestamp: Date.now(),
        wordCount: text.trim().split(/\s+/).filter((w) => w.length > 0).length,
      });
    }, 1000); // Debounce saves

    return () => clearTimeout(timer);
  }, [text, isInterviewMode, currentQuestion, isSessionLoaded, updateAnswer]);
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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const parsedQuestions = parseInterviewQuestions(data.questions);

      // Initialize session with new questions
      initializeSession(parsedQuestions);
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
    clearSession();
    setText("");
  };

  const handleEvaluateAnswer = async () => {
    console.log("🔍 Evaluate button clicked");
    console.log("Current question:", currentQuestion);
    console.log("Text answer:", text);
    console.log("Recorded audio:", recordedAudio);

    if (currentQuestion && text.trim()) {
      console.log("📝 Evaluating text answer...");
      const result = await fetchCritique(currentQuestion.text, text);
      console.log("✅ Critique result:", result);

      // Save answer to history
      if (result) {
        console.log("💾 Saving to history...");
        saveAnswer(currentQuestion.id, text, result, recordedAudio?.duration);

        // Update session storage with critique
        updateAnswer({
          questionId: currentQuestion.id,
          text,
          critique: result,
          timestamp: Date.now(),
          wordCount: text.trim().split(/\s+/).filter((w) => w.length > 0).length,
        });
      } else {
        console.error("❌ No critique result returned");
      }
    } else if (currentQuestion && recordedAudio) {
      console.log("🎤 Evaluating voice-only answer...");
      const result = await fetchCritique(currentQuestion.text, `[Voice Recording: ${recordedAudio.duration}s]`);
      console.log("✅ Critique result:", result);

      if (result) {
        console.log("💾 Saving to history...");
        saveAnswer(currentQuestion.id, `[Voice Response]`, result, recordedAudio.duration);

        // Update session storage with critique and audio
        updateAnswer({
          questionId: currentQuestion.id,
          text: `[Voice Response]`,
          critique: result,
          timestamp: Date.now(),
          wordCount: 0,
        });
      } else {
        console.error("❌ No critique result returned");
      }
    } else {
      console.error("❌ No text or audio to evaluate");
      console.error("Text trimmed:", text.trim());
      console.error("Has recorded audio:", !!recordedAudio);
    }
  };

  const handleNextQuestion = () => {
    nextQuestion();
    setText("");
    clearRecording();
    clearCritique();

    // Update session index and restore previous answer if available
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < interviewQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = interviewQuestions[nextIndex];
      const storedAnswer = getAnswer(nextQuestion.id);
      if (storedAnswer) {
        setText(storedAnswer.text);
      }
    }
  };

  const handlePreviousQuestion = () => {
    previousQuestion();
    setText("");
    clearRecording();
    clearCritique();

    // Update session index and restore previous answer if available
    const prevIndex = currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      setCurrentQuestionIndex(prevIndex);
      const prevQuestion = interviewQuestions[prevIndex];
      const storedAnswer = getAnswer(prevQuestion.id);
      if (storedAnswer) {
        setText(storedAnswer.text);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {sessionError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
          Session restore error: {sessionError.message}
        </div>
      )}

      {!isSessionLoaded && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-600 dark:text-blue-400">
          Restoring session...
        </div>
      )}

      <div className="border-b border-border px-4 py-3">
        <Toolbar
          text={text}
          onClear={handleClear}
          onParaphrase={handleParaphrase}
          onAiDetect={handleAiDetect}
          onStartInterview={!isInterviewMode ? handleStartInterview : undefined}
          onStopInterview={isInterviewMode ? handleStopInterview : undefined}
          onUndo={paraphraseHistory ? handleUndoParaphrase : undefined}
          canUndo={paraphraseHistory !== null}
          isChecking={isChecking}
          errorCount={errorCount}
          isJobMode={isInterviewMode}
        />
      </div>

      {isInterviewMode && currentQuestion ? (
        <Card className="p-4">
          <CompactInterviewPanel
            currentQuestion={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={interviewQuestions.length}
            answerText={text}
            critique={critique}
            isCritiquing={isCritiquing}
            onAnswerChange={handleTextChange}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
            onEvaluate={handleEvaluateAnswer}
            hasNextQuestion={hasNextQuestion}
            hasPreviousQuestion={hasPreviousQuestion}
            isRecording={isRecording}
            recordedAudio={recordedAudio}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onClearRecording={clearRecording}
            questionHistory={currentQuestionHistory}
            evaluationError={critiqueError?.message || null}
          />

          <FeedbackPanel
            result={result}
            selectedMatch={selectedMatch}
            text={text}
            onSelectMatch={setSelectedMatch}
            onApplySuggestion={handleApplySuggestion}
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">

            <CardContent className="p-0 relative h-56 lg:h-80 overflow-hidden">
              <div
                ref={highlightLayerRef}
                aria-hidden="true"
                className="absolute inset-0 p-3 font-mono text-sm wrap-break-word overflow-hidden pointer-events-none select-none text-transparent leading-relaxed"
              >
                {highlightText(
                  text,
                  result ?? [],
                  selectedMatch,
                  setSelectedMatch,
                )}
              </div>

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

            <CardFooter className="border-t border-border px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex gap-4">
                <span>
                  Words:{" "}
                  <strong className="text-foreground">{wordCount}</strong>
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

          <div className="space-y-4">
            {text.length > 0 && !isInterviewMode && (
              <ToneBar tone={tone} isAnalyzing={isAnalyzing} text={text} />
            )}

            <FeedbackPanel
              result={result}
              selectedMatch={selectedMatch}
              text={text}
              onSelectMatch={setSelectedMatch}
              onApplySuggestion={handleApplySuggestion}
            />
          </div>
        </>
      )}

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
