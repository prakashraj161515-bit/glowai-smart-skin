/**
 * Skin Analysis MVP Logic
 * Uses randomized heuristics for fast feedback
 */

export interface SkinAnalysisResult {
  acne: number;
  oil: number;
  pigmentation: number;
  score: number;
}

export function analyzeSkin(imageData: ImageData): SkinAnalysisResult {
  // MVP fake + heuristic
  const acne = Math.floor(Math.random() * 100);
  const oil = Math.floor(Math.random() * 100);
  const pigmentation = Math.floor(Math.random() * 100);

  const score = 100 - Math.floor((acne + oil + pigmentation) / 3);

  return { acne, oil, pigmentation, score };
}
