/**
 * GlowAI Skin Analysis (TensorFlow/BlazeFace compatible)
 */

export interface SkinAnalysisResult {
  acne: number;
  oil: number;
  pigmentation: number;
  score: number;
}

export function analyzeSkin(imageData: ImageData): SkinAnalysisResult {
  // Pixel-based heuristics for MVP
  const data = imageData.data;
  let redness = 0;
  let brightness = 0;
  let darkSpots = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Redness (Acne)
    if (r > g * 1.5 && r > b * 1.5) redness++;
    // Brightness (Oil/Shine)
    if (r > 200 && g > 200 && b > 200) brightness++;
    // Dark spots (Pigmentation)
    if (r < 60 && g < 60 && b < 60) darkSpots++;
  }

  const pixelCount = data.length / 4;
  
  const acne = Math.min(100, Math.round((redness / pixelCount) * 1000));
  const oil = Math.min(100, Math.round((brightness / pixelCount) * 500));
  const pigmentation = Math.min(100, Math.round((darkSpots / pixelCount) * 800));
  
  const score = Math.max(0, 100 - Math.round((acne + oil + pigmentation) / 3));

  return { acne, oil, pigmentation, score };
}
