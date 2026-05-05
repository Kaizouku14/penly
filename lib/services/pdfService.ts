/**
 * PDF parsing utility
 */

import { PDFParse } from "pdf-parse";

/**
 * Extracts text from a PDF file buffer
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const { text } = result;

  if (!text || text.trim().length === 0) {
    throw new Error("No text extracted from PDF");
  }

  return text;
}
