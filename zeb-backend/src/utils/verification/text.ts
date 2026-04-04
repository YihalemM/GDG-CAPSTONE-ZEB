import stringSimilarity from "string-similarity";

/**
 * Normalizes text content for comparison.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ")     // Normalize whitespace
    .trim();
}

/**
 * Calculates similarity between two strings (0 to 1).
 */
export function calculateTextSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  return stringSimilarity.compareTwoStrings(s1, s2);
}
