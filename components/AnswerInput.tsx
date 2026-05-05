"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
} from "lucide-react";

interface AnswerInputProps {
  isRecording: boolean;
  isPlayingBack: boolean;
  recordedAudio: { duration: number; waveform: number[] } | null;
  waveformData: number[];
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
  onPlayback: () => Promise<void>;
  onClearRecording: () => void;
  wordCount: number;
  maxWords?: number;
  disabled?: boolean;
}

export const AnswerInput = ({
  isRecording,
  isPlayingBack,
  recordedAudio,
  waveformData,
  onStartRecording,
  onStopRecording,
  onPlayback,
  onClearRecording,
  wordCount,
  maxWords,
  disabled = false,
}: AnswerInputProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const wordCountColor = maxWords
    ? wordCount > maxWords
      ? "text-red-600 dark:text-red-400"
      : wordCount > maxWords * 0.8
        ? "text-amber-600 dark:text-amber-400"
        : "text-green-600 dark:text-green-400"
    : "text-muted-foreground";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Words typed in your answer
        </span>
        <span className={`font-semibold ${wordCountColor}`}>
          {wordCount} {maxWords ? `/ ${maxWords}` : "words"}
        </span>
      </div>

      {recordedAudio ? (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-foreground">
                  Recording: {formatDuration(recordedAudio.duration)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Audio attached
              </span>
            </div>

            <div className="flex items-center gap-1 h-12 bg-background rounded-md p-2 overflow-hidden">
              {waveformData.length > 0 ? (
                waveformData.map((value, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-600 dark:bg-blue-400 rounded-sm transition-all"
                    style={{
                      height: `${Math.max(20, (value / Math.max(...waveformData)) * 100)}%`,
                    }}
                  />
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No waveform data
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={onPlayback}
                variant="outline"
                size="sm"
                disabled={disabled || isPlayingBack}
                className="flex items-center gap-2"
              >
                {isPlayingBack ? (
                  <>
                    <Pause className="size-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Play
                  </>
                )}
              </Button>

              <Button
                onClick={onClearRecording}
                variant="outline"
                size="sm"
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <RotateCcw className="size-4" />
                Re-record
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-gray-50 dark:bg-gray-900 border-dashed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Optional: Record your answer
              </span>
            </div>
            <Button
              onClick={isRecording ? onStopRecording : onStartRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              disabled={disabled}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <Square className="size-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="size-4" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
