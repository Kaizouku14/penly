/**
 * Client-side text analysis utilities for the Writing DNA feature.
 * No API calls - all calculations are performed in the browser.
 */

/**
 * Calculate the number of syllables in a word (simplified but effective).
 */
export function syllableCount(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  // Remove silent e
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  // Count vowel groups
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Split text into sentences using a lookahead regex.
 */
export function splitIntoSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

/**
 * Calculate clarity score (0-100) for a single sentence.
 * Considers: length, word length, passive voice, filler words.
 */
export function getSentenceClarity(sentence: string): number {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount === 0) return 100;

  // Factor 1: sentence length (ideal = 15–20 words)
  const lengthPenalty = wordCount > 30 ? 30 : wordCount > 20 ? 15 : 0;

  // Factor 2: average word length (longer words = harder to read)
  const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / wordCount;
  const wordLenPenalty = avgWordLen > 7 ? 20 : avgWordLen > 5 ? 10 : 0;

  // Factor 3: passive voice detection (simple heuristic)
  const passivePattern = /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/i;
  const passivePenalty = passivePattern.test(sentence) ? 15 : 0;

  // Factor 4: filler words
  const fillerWords = [
    "very",
    "really",
    "quite",
    "basically",
    "literally",
    "actually",
    "just",
    "that",
  ];
  const fillerCount = words.filter((w) =>
    fillerWords.includes(w.toLowerCase()),
  ).length;
  const fillerPenalty = Math.min(fillerCount * 5, 15);

  return Math.max(
    0,
    100 - lengthPenalty - wordLenPenalty - passivePenalty - fillerPenalty,
  );
}

/**
 * Get the Tailwind color class for a clarity score.
 */
export function getClarityColor(score: number): "emerald" | "amber" | "red" {
  if (score >= 80) return "emerald";
  if (score >= 60) return "amber";
  return "red";
}

/**
 * Get the readable label for a clarity score.
 */
export function getClarityLabel(score: number): string {
  if (score >= 80) return "Clear";
  if (score >= 60) return "Moderate";
  return "Complex";
}

/**
 * Calculate writing personality based on style metrics.
 */
export function getWritingPersonality(
  richness: number,
  avgLen: number,
  passive: number,
  grade: number,
): { label: string; description: string } {
  if (richness > 70 && avgLen < 18 && passive < 10) {
    return {
      label: "Sharp Communicator",
      description: "Clear, varied, and direct.",
    };
  }
  if (grade >= 13 && avgLen > 22) {
    return {
      label: "Academic Writer",
      description: "Formal and thorough.",
    };
  }
  if (richness < 50 && avgLen < 15) {
    return {
      label: "Conversational",
      description: "Casual and easy to follow.",
    };
  }
  if (passive > 25) {
    return {
      label: "Formal Reporter",
      description: "Structured but passive-heavy.",
    };
  }
  if (avgLen > 25) {
    return {
      label: "Deep Thinker",
      description: "Complex ideas, long sentences.",
    };
  }
  return {
    label: "Balanced Writer",
    description: "Well-rounded style.",
  };
}

/**
 * Get the grade level label for a Flesch-Kincaid score.
 */
export function getGradeLabel(grade: number): string {
  if (grade <= 6) return "Elementary";
  if (grade <= 9) return "Middle school";
  if (grade <= 12) return "High school";
  if (grade <= 15) return "College";
  return "Graduate";
}
