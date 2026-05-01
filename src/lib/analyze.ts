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
    // Resize for AI: Create a small temporary canvas
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d")!;
    
    // Target size for fast processing
    const width = 300;
    const height = (canvas.height / canvas.width) * width;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    ctx.drawImage(canvas, 0, 0, width, height);
    const imageData = tempCanvas.toDataURL("image/jpeg", 0.4);
    
    console.log("📤 Sending optimized image...");
    
    const response = await fetch("/api/ai/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Vision analysis failed");
    }
    
    return data;
  } catch (err: any) {
    console.error("Analysis Error:", err);
    return { error: err.message || "Failed to connect to Vision AI" };
  }
}
