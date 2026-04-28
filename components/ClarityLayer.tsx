"use client";
import {
  splitIntoSentences,
  getSentenceClarity,
  getClarityColor,
} from "@/lib/clarity";

interface ClarityLayerProps {
  text?: string;
}

const colorMap: Record<string, string> = {
  emerald: "border-l-4 border-emerald-400",
  amber: "border-l-4 border-amber-400",
  red: "border-l-4 border-red-400",
};

export const ClarityLayer = ({ text = "" }: ClarityLayerProps) => {
  if (!text.trim()) return null;

  const sentences = splitIntoSentences(text);

  return (
    <>
      {sentences.map((sentence, idx) => {
        const clarity = getSentenceClarity(sentence);
        const color = getClarityColor(clarity);

        return (
          <span
            key={idx}
            className={`${colorMap[color]} pl-2`}
            style={{ display: "inline-block" }}
          >
            {sentence}{" "}
          </span>
        );
      })}
    </>
  );
};
