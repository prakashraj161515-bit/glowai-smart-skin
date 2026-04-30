/**
 * Skin Analysis Heuristics
 * Analyzes image data to detect Acne, Oiliness, and Pigmentation
 */

export interface SkinAnalysisResult {
  acne: number;
  oil: number;
  pigmentation: number;
  score: number;
}

export async function analyzeSkin(imageData: ImageData): Promise<SkinAnalysisResult> {
  const data = imageData.data;

  let rSum = 0, gSum = 0, bSum = 0;
  let rednessCount = 0;
  let shineCount = 0;
  let darkPatchCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Acne Detection (High Redness relative to other channels)
    if (r > g * 1.4 && r > b * 1.4 && r > 100) {
      rednessCount++;
    }

    // Oiliness Detection (High overall brightness/specular highlights)
    if (r > 200 && g > 200 && b > 200) {
      shineCount++;
    }

    // Pigmentation Detection (Dark patches relative to average)
    if (r < 80 && g < 80 && b < 80) {
      darkPatchCount++;
    }

    rSum += r;
    gSum += g;
    bSum += b;
  }

  const pixelCount = data.length / 4;
  
  // Convert to 0-100 scales
  const acne = Math.min(100, Math.round((rednessCount / pixelCount) * 1000));
  const oil = Math.min(100, Math.round((shineCount / pixelCount) * 500));
  const pigmentation = Math.min(100, Math.round((darkPatchCount / pixelCount) * 800));
  
  // Calculate aggregate score (Inverse of issues)
  const score = Math.max(0, 100 - Math.round((acne + oil + pigmentation) / 3));

  return { acne, oil, pigmentation, score };
}
