"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Wand2, Search, LogOut, Briefcase } from "lucide-react";

interface ToolsMenuProps {
  onParaphrase: () => void;
  onAiDetect: () => void;
  onStopInterview?: () => void;
  onStartInterview?: () => void;
  isInterviewMode?: boolean;
}

export const ToolsMenu = ({
  onParaphrase,
  onAiDetect,
  onStopInterview,
  onStartInterview,
  isInterviewMode = false,
}: ToolsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          title="More tools"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={onParaphrase}
          className="flex items-center gap-2"
        >
          <Wand2 className="size-4" />
          <span>Paraphrase</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onAiDetect}
          className="flex items-center gap-2"
        >
          <Search className="size-4" />
          <span>Check AI Content</span>
        </DropdownMenuItem>

        {isInterviewMode && onStopInterview ? (
          <>
            {!isInterviewMode && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={onStopInterview}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Exit Interview</span>
            </DropdownMenuItem>
          </>
        ) : (
             <DropdownMenuItem
              onClick={onStartInterview}
              className="flex items-center gap-2"
            >
           <Briefcase className="size-4" />
              <span>Interview</span>
            </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
