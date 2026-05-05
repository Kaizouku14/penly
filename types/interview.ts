/**
 * Interview mode related types
 */

export interface InterviewQuestion {
  id: string;
  text: string;
  category: "experience" | "skills" | "projects" | "education" | "soft-skills";
}

export interface InterviewCritique {
  strengths: string[];
  areasForImprovement: string[];
  overallFeedback: string;
  rating: number; // 1-10
  confidence: number; // 0-100
}
