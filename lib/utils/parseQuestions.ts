/**
 * Utility to parse interview questions from API response
 */

import { InterviewQuestion } from "@/types/interview";

/**
 * Parses raw interview questions text from API into structured format
 * Expected format:
 * 1. Experience:
 *    1. Question text?
 *    2. Another question?
 * 2. Skills:
 *    1. Skill question?
 */
export function parseInterviewQuestions(
  rawText: string,
): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  let questionId = 1;

  const categoryMap: Record<string, InterviewQuestion["category"]> = {
    experience: "experience",
    skill: "skills",
    skills: "skills",
    project: "projects",
    projects: "projects",
    education: "education",
    soft: "soft-skills",
    "soft-skill": "soft-skills",
    "soft-skills": "soft-skills",
    leadership: "soft-skills",
  };

  // Split by main sections (numbered headings like "1. Experience:")
  const sections = rawText.split(/^\d+\.\s+/m).slice(1);

  for (const section of sections) {
    const lines = section.split("\n");
    const headerLine = lines[0];

    // Extract category from header
    const categoryMatch = headerLine.match(/^([^:]+):/);
    if (!categoryMatch) continue;

    const categoryName = categoryMatch[1].toLowerCase().trim();
    const category: InterviewQuestion["category"] =
      (categoryMap[categoryName] as InterviewQuestion["category"]) ||
      "experience";

    // Extract questions from this section (look for numbered items)
    const questionLines = lines.slice(1);
    for (const line of questionLines) {
      const questionMatch = line.match(/^\s*\d+\.\s+(.+)$/);
      if (questionMatch) {
        const questionText = questionMatch[1].trim();
        if (questionText.length > 10) {
          // Minimum length to filter noise
          questions.push({
            id: `q${questionId}`,
            text: questionText,
            category,
          });
          questionId++;
        }
      }
    }
  }

  // Fallback: if parsing didn't work, try to extract any lines that look like questions
  if (questions.length === 0) {
    const lines = rawText.split("\n");
    for (const line of lines) {
      if (line.match(/^\s*\d+\.\s+/) && line.includes("?")) {
        const match = line.match(/^\s*\d+\.\s+(.+)$/);
        if (match) {
          questions.push({
            id: `q${questionId}`,
            text: match[1].trim(),
            category: "experience",
          });
          questionId++;
        }
      }
    }
  }

  return questions;
}
