import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { text } = await req.json();

  const params = new URLSearchParams();
  params.append("text", text);
  params.append("language", "en-US");

  const response = await fetch("https://api.languagetool.org/v2/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();

  // Filter out UNKNOWN_TOKEN errors (flags unknown words/names as mistakes)
  // while keeping actual grammar and spelling errors
  const filteredMatches = data.matches.filter(
    (match: any) => match.rule.id !== "UNKNOWN_TOKEN"
  );

  return NextResponse.json({
    ...data,
    matches: filteredMatches,
  });
};
