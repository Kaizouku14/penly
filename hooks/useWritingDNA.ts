import React from "react";
import { useDebounce } from "@/components/editor/helper";
import {
  syllableCount,
  splitIntoSentences,
  getWritingPersonality,
  getGradeLabel,
} from "@/lib/clarity";

interface UseWritingDNAReturn {
  vocabularyRichness: number;
  avgSentenceLength: number;
  passivePercent: number;
  gradeLevel: number;
  gradLabel: string;
  personality: { label: string; description: string };
  isReady: boolean;
}

export function useWritingDNA(text: string): UseWritingDNAReturn {
  const debouncedText = useDebounce(text, 300);
  const [state, setState] = React.useState<UseWritingDNAReturn>({
    vocabularyRichness: 0,
    avgSentenceLength: 0,
    passivePercent: 0,
    gradeLevel: 0,
    gradLabel: "",
    personality: {
      label: "Balanced Writer",
      description: "Well-rounded style.",
    },
    isReady: false,
  });

  React.useEffect(() => {
    if (debouncedText.trim().length === 0) {
      setTimeout(() => {
        setState({
          vocabularyRichness: 0,
          avgSentenceLength: 0,
          passivePercent: 0,
          gradeLevel: 0,
          gradLabel: "",
          personality: {
            label: "Balanced Writer",
            description: "Well-rounded style.",
          },
          isReady: false,
        });
      }, 0);
      return;
    }

    // Extract words (lowercase, only letters)
    const words = debouncedText.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
    const wordCount = words.length;

    // Only compute if at least 30 words
    if (wordCount < 30) {
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isReady: false,
        }));
      }, 0);
      return;
    }

    // 1. Vocabulary Richness (Type-Token Ratio)
    const uniqueWords = new Set(words);
    const vocabularyRichness = Math.round(
      (uniqueWords.size / words.length) * 100,
    );

    // 2. Average Sentence Length
    const sentences = splitIntoSentences(debouncedText);
    const avgSentenceLength = Math.round(words.length / sentences.length);

    // 3. Passive Voice Percentage
    const passivePattern = /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/gi;
    const passiveMatches = debouncedText.match(passivePattern) ?? [];
    const passivePercent = Math.round(
      (passiveMatches.length / sentences.length) * 100,
    );

    // 4. Flesch-Kincaid Grade Level
    const totalSyllables = words.reduce((sum, w) => sum + syllableCount(w), 0);
    const fkGrade = Math.round(
      0.39 * (words.length / sentences.length) +
        11.8 * (totalSyllables / words.length) -
        15.59,
    );
    const gradeLevel = Math.max(1, Math.min(fkGrade, 16));
    const gradLabel = getGradeLabel(gradeLevel);

    // 5. Writing Personality
    const personality = getWritingPersonality(
      vocabularyRichness,
      avgSentenceLength,
      passivePercent,
      gradeLevel,
    );

    setTimeout(() => {
      setState({
        vocabularyRichness,
        avgSentenceLength,
        passivePercent,
        gradeLevel,
        gradLabel,
        personality,
        isReady: true,
      });
    }, 0);
  }, [debouncedText]);

  return state;
}
