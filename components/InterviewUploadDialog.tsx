"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, Info } from "lucide-react";

interface InterviewUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const InterviewUploadDialog = ({
  isOpen,
  onClose,
  onFileSelect,
  isLoading = false,
}: InterviewUploadDialogProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return false;
    }

    setError("");
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
      setError("");
      // Don't close dialog - let parent handle it
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Start Interview Practice
          </DialogTitle>
          <DialogDescription>
            Upload your resume (PDF) to generate targeted interview questions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary hover:bg-muted/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
              aria-label="Upload resume"
            />

            <div className="flex flex-col items-center gap-2">
              <Upload
                className={`size-8 ${dragActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <div>
                <p className="font-medium text-sm">
                  Drop your resume here or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF file • Max 5MB
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 flex gap-2">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-3 flex gap-2">
            <Info className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Questions will be generated based on your resume content for
              targeted practice.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleClick}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Loading...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Choose File
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
