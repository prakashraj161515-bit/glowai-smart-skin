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

export async function analyzeSkin(
  canvas: HTMLCanvasElement,
  skipFaceDetection: boolean = false
): Promise<SkinAnalysisResult> {
  const imageBase64 = canvas.toDataURL("image/jpeg", 0.7);

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
