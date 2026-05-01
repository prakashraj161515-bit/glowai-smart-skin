import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

export interface SkinAnalysisResult {
  acne?: number;
  oil?: number;
  pigmentation?: number;
  score?: number;
  error?: string;
}

let model: any;

async function loadModel() {
  if (!model) {
    await tf.ready();
    model = await blazeface.load();
  }
  return model;
}

export async function analyzeSkin(canvas: HTMLCanvasElement): Promise<SkinAnalysisResult> {
  try {
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    
    const response = await fetch("/api/ai/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) throw new Error("Vision analysis failed");
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Analysis Error:", err);
    return { error: "Failed to connect to Vision AI" };
  }
}
