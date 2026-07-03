import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

export interface SkinAnalysisResult {
  error?: string;
  image?: string; // base64 image to be sent to AI
}

let model: any;

async function loadModel() {
  if (!model) {
    await tf.ready();
    model = await blazeface.load();
  }
  return model;
}

// Shrink the captured frame to a sensible max edge before sending. A full
// camera frame (1080p+) is needlessly large — it makes the upload AND the AI
// slower with no quality gain for skin analysis. ~800px is plenty.
function downscale(src: HTMLCanvasElement, maxEdge = 800): HTMLCanvasElement {
  const { width, height } = src;
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return src; // already small enough
  const scale = maxEdge / longest;
  const out = document.createElement("canvas");
  out.width = Math.round(width * scale);
  out.height = Math.round(height * scale);
  const ctx = out.getContext("2d");
  if (!ctx) return src;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, out.width, out.height);
  return out;
}

export async function analyzeSkin(
  canvas: HTMLCanvasElement,
  skipFaceDetection: boolean = false
): Promise<SkinAnalysisResult> {
  const small = downscale(canvas, 800);
  const imageBase64 = small.toDataURL("image/jpeg", 0.7);

  if (!skipFaceDetection) {
    try {
      const faceModel = await loadModel();
      const predictions = await faceModel.estimateFaces(canvas, false);
      if (predictions.length === 0) {
        return { error: "No face detected. Please position your face clearly in good lighting." };
      }
    } catch (e) {
      // If TensorFlow fails to load, skip face detection gracefully
      console.warn("Face detection model failed to load, proceeding anyway:", e);
    }
  }

  // Return just the image — all real scoring is done by Gemini AI
  return { image: imageBase64 };
}
