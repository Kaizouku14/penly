import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/services/writingServices";
import { validateFileUpload, errorResponse } from "@/lib/api/apiUtils";
import { extractTextFromPdf } from "@/lib/services/pdfService";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    validateFileUpload(file, ["application/pdf"]);

    const buffer = await file!.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const resumeText = await extractTextFromPdf(fileBuffer);
    const questions = await generateInterviewQuestions(resumeText);

    return NextResponse.json({ questions });
  } catch (error) {
    const { statusCode, body } = errorResponse(
      error,
      "Failed to process resume",
    );
    return NextResponse.json(body, { status: statusCode });
  }
};
