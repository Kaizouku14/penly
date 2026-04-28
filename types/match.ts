export type Replacement = {
  value: string;
};

export type Rule = {
  id: string;
  description: string;
  issueType: string;
};

export type Match = {
  offset: number;
  length: number;
  message: string;
  shortMessage?: string;
  replacements: Replacement[];
  rule: Rule;
};

export type Category =
  | "spelling"
  | "grammar"
  | "punctuation"
  | "style"
  | "other";

export type Tone =
  | "formal"
  | "casual"
  | "confident"
  | "uncertain"
  | "positive"
  | "negative"
  | "neutral";

export type ToneResult = {
  primary: Tone;
  secondary: Tone | null;
  summary: string;
};
