"use client";

import React from "react";
import { Editor } from "@/components/editor/editor";
import { WritingDNA } from "@/components/WritingDNA";
import { WritingDNABottomSheet } from "@/components/WritingDNABottomSheet";

export default function Home() {
  const [text, setText] = React.useState("");

  return (
    <div className="min-h-screen flex flex-col py-6 px-4 md:px-6 lg:px-8 bg-background">
      <header className="flex items-center justify-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Penly</h1>
      </header>
      <main className="flex flex-1 justify-center items-start gap-6 max-w-6xl mx-auto w-full">
        <div className="flex-1 w-full lg:w-auto">
          <Editor onTextChange={setText} />
        </div>
        <div className="hidden lg:block sticky top-6 w-80">
          <WritingDNA text={text} />
        </div>
      </main>

      {/* Mobile-only components */}
      <WritingDNABottomSheet text={text} />
    </div>
  );
}
