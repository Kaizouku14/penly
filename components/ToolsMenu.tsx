"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Wand2, Search } from "lucide-react";

interface ToolsMenuProps {
  onParaphrase: () => void;
  onAiDetect: () => void;
  hasText: boolean;
}

export const ToolsMenu = ({
  onParaphrase,
  onAiDetect,
  hasText,
}: ToolsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={!hasText}
          title="More tools"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onParaphrase} className="flex items-center gap-2">
          <Wand2 className="size-4" />
          <span>Paraphrase</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAiDetect} className="flex items-center gap-2">
          <Search className="size-4" />
          <span>Check AI Content</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
