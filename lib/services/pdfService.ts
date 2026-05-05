import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const { text } = result;

  if (!text || text.trim().length === 0) {
    throw new Error("No text extracted from PDF");
  }

  return text;
}
