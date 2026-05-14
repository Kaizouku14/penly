import pdfParse from "pdf-parse";

/**
 * Extracts text from a PDF buffer
 * Using pdf-parse (pure Node.js library)
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    const fullText = data.text;

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("No text extracted from PDF");
    }

    return fullText.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    throw new Error("PDF extraction failed: Unknown error");
  }
}
