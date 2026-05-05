"use client";

import React from "react";
import { WritingDNA } from "@/components/WritingDNA";
import { useWritingDNA } from "@/hooks/useWritingDNA";
import { Button } from "./ui/button";
import { ArrowUp , Sparkle} from "lucide-react";

interface WritingDNABottomSheetProps {
  text: string;
}

export const WritingDNABottomSheet = ({ text }: WritingDNABottomSheetProps) => {
  const [open, setOpen] = React.useState(false);
  const dna = useWritingDNA(text);

  if (!dna.isReady) return null;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-2 px-4 py-2 rounded-full
          bg-background border border-border shadow-md
          text-sm font-medium whitespace-nowrap lg:hidden
          hover:shadow-lg transition-shadow"
      >
        <Sparkle />
        {dna.personality.label}
        <ArrowUp className="size-4 text-muted-foreground" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden
          bg-background rounded-t-2xl border-t border-border
          h-[60vh] overflow-y-auto
          transition-transform duration-300 ease-out
          ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="sticky top-0 bg-background rounded-t-2xl pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>
        <div className="px-4 pb-8">
          <WritingDNA text={text} />
        </div>
      </div>
    </>
  );
};
