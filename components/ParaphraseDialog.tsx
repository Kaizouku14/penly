"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface ParaphraseDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  paraphrase: string | null;
  onClose: () => void;
  onApply: (paraphrase: string) => void;
}

export const ParaphraseDialog = ({
  isOpen,
  isLoading,
  paraphrase,
  onClose,
  onApply,
}: ParaphraseDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paraphrase</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-xs text-muted-foreground">
                Generating paraphrase...
              </span>
            </div>
          ) : paraphrase ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Paraphrased text:
              </p>
              <ScrollArea className="h-54">
                <p className="text-xs p-3 bg-muted rounded border border-border text-foreground leading-relaxed">
                  {paraphrase}
                </p>
              </ScrollArea>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No paraphrase available
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
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (paraphrase) {
                onApply(paraphrase);
                onClose();
              }
            }}
            disabled={!paraphrase || isLoading}
            size="sm"
            className="text-xs"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
