"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Editor } from "@/components/editor/editor";
import { WritingDNA } from "@/components/WritingDNA";
import { WritingDNABottomSheet } from "@/components/WritingDNABottomSheet";

export default function Home() {
  const [text, setText] = React.useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Section */}
      <Card className="border-b border-t-0 border-l-0 border-r-0 rounded-none">
        <CardHeader className="py-6 px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✦</span>
            <CardTitle className="text-2xl md:text-3xl font-heading">
              Penly
            </CardTitle>
          </div>
          <CardDescription className="text-sm">
            Grammar checker & writing analysis for professionals
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto py-6 px-4 md:px-6 lg:px-8 h-full flex-1 w-full">
        {/* Primary Column */}
        <div className="flex-1 lg:min-w-0">
          <Editor onTextChange={setText} />
        </div>

        {/* Secondary Column - Writing DNA Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-80 gap-4 flex-shrink-0">
          <WritingDNA text={text} />
        </aside>
      </main>

      {/* Mobile Analytics Bottom Sheet */}
      <WritingDNABottomSheet text={text} />
    </div>
  );
}
