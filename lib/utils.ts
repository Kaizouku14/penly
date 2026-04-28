import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CEFRLevel {
  level: string;
  label: string;
}

export function gradeToCEFR(grade: number): CEFRLevel {
  if (grade <= 3)  return { level: "A1", label: "Beginner" };
  if (grade <= 5)  return { level: "A2", label: "Elementary" };
  if (grade <= 7)  return { level: "B1", label: "Intermediate" };
  if (grade <= 10) return { level: "B2", label: "Upper Intermediate" };
  if (grade <= 13) return { level: "C1", label: "Advanced" };
  return           { level: "C2", label: "Mastery" };
}
