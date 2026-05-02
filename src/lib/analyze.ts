import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

export interface SkinAnalysisResult {
  acne?: number;
  oil?: number;
  pigmentation?: number;
  score?: number;
  error?: string;
  image?: string; // Optional base64
}

let model: any;

async function loadModel() {
  if (!model) {
    await tf.ready();
    model = await blazeface.load();
  }
  return model;
}

export async function analyzeSkin(canvas: HTMLCanvasElement, skipFaceDetection: boolean = false): Promise<SkinAnalysisResult> {
  const imageBase64 = canvas.toDataURL("image/jpeg", 0.7);

  if (!skipFaceDetection) {
    const faceModel = await loadModel();
    const predictions = await faceModel.estimateFaces(canvas, false);

    if (predictions.length === 0) {
      return { error: "No face detected. Please position your face clearly." };
    }
  }

  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = img.data;

  let redness = 0, brightness = 0, dark = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];

    // Redness (Acne)
    if (r > g + 20 && r > b + 20) redness++;
    // Brightness (Oil/Shine)
    brightness += (r + g + b) / 3;
    // Dark spots (Pigmentation)
    if (r < 60 && g < 60 && b < 60) dark++;
  }

  const total = data.length / 4;

  const acne = Math.min(100, Math.floor((redness / total) * 500));
  const oil = Math.min(100, Math.floor((brightness / total) / 2));
  const pigmentation = Math.min(100, Math.floor((dark / total) * 400));

  const score = Math.max(0, 100 - Math.floor((acne + oil + pigmentation) / 3));

  return { acne, oil, pigmentation, score, image: imageBase64 };
}
