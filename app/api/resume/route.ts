import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);

  try {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    const { text } = result;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text extracted from PDF" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are an expert technical interviewer. Analyze the candidate's resume and generate up to 20 high-quality, non-repetitive interview questions. Cover:\n- Work experience and past roles\n- Technical skills and tools\n- Projects and achievements\n- Education and certifications\n- Soft skills and leadership\n\nReturn them as a numbered list",
            },
            { role: "user", content: `Here is my resume:\n\n${text}` },
          ],
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const questions = data.choices[0].message.content;

    return NextResponse.json({ questions });
  } catch (pdfError) {
    const errorMessage =
      pdfError instanceof Error ? pdfError.message : String(pdfError);
    return NextResponse.json(
      { error: "Failed to parse PDF: " + errorMessage },
      { status: 500 },
    );
  }
};
