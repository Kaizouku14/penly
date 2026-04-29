"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface AIDetectDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  isAiGenerated: boolean | null;
  confidence: number | null;
  analysis: string | null;
  onClose: () => void;
}

export const AIDetectDialog = ({
  isOpen,
  isLoading,
  isAiGenerated,
  confidence,
  analysis,
  onClose,
}: AIDetectDialogProps) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 70) return "text-red-500";
    if (conf >= 50) return "text-amber-500";
    return "text-green-500";
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 70) return "High";
    if (conf >= 50) return "Medium";
    return "Low";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Content Detector</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-xs text-muted-foreground">
                Analyzing text...
              </span>
            </div>
          ) : isAiGenerated !== null ? (
            <div className="space-y-3">
              {/* Result Badge */}
              <div className="flex items-center gap-2">
                {isAiGenerated ? (
                  <>
                    <AlertCircle className="size-5 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-500">
                      Possibly AI-Generated
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-5 text-green-500" />
                    <span className="text-xs font-semibold text-green-500">
                      Human-Written
                    </span>
                  </>
                )}
              </div>

              {/* Confidence Score */}
              {confidence !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p
                      className={`text-xs font-semibold ${getConfidenceColor(
                        confidence,
                      )}`}
                    >
                      {getConfidenceLabel(confidence)} ({confidence}%)
                    </p>
                  </div>
                  <Progress
                    value={confidence}
                    className="h-2"
                  />
                </div>
              )}

              {/* Analysis */}
              {analysis && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Analysis:
                  </p>
                  <p className="text-xs bg-muted p-2 rounded border border-border text-foreground leading-relaxed">
                    {analysis}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No analysis available
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
