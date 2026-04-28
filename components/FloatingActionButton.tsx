"use client";

import React from "react";
import { Copy, Trash2, X, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";

interface FloatingActionButtonProps {
  onCopy: () => void;
  onClear: () => void;
}

export const FloatingActionButton = ({
  onCopy,
  onClear,
}: FloatingActionButtonProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 lg:hidden">
      {/* Action menu */}
      <div
        className={`flex flex-col gap-2 transition-all duration-200
          ${
            open
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
      >
        <Button
          onClick={() => {
            onCopy();
            setOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg
            bg-background border border-border shadow text-sm whitespace-nowrap
            hover:bg-accent transition-colors text-foreground"
        >
          <Copy className="w-4 h-4" />
          Copy
        </Button>
        <Button
          onClick={() => {
            onClear();
            setOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg
            bg-background border border-border shadow text-sm whitespace-nowrap
            hover:bg-accent transition-colors text-foreground"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      {/* FAB button */}
      <Button
        onClick={() => setOpen((prev) => !prev)}
        className="w-12 h-12 rounded-full bg-foreground text-background
          shadow-lg flex items-center justify-center text-lg font-bold
          active:scale-95 transition-transform hover:shadow-xl"
      >
        {open ? <X className="size-4" /> : <MoreVertical className="size-4" />}
      </Button>
    </div>
  );
};
