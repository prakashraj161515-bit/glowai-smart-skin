"use client";

import { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import { Camera, Sparkles } from "lucide-react";

export default function CameraScanner({ onAnalyze }: { onAnalyze: (canvas: HTMLCanvasElement) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    async function loadModel() {
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
      startCamera();
    }
    loadModel();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
    }
  }

  const runDetection = async () => {
    if (model && videoRef.current && canvasRef.current) {
      const predictions = await model.estimateFaces(videoRef.current, false);
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (predictions.length > 0) {
          predictions.forEach((prediction: any) => {
            const start = prediction.topLeft;
            const end = prediction.bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
            ctx.strokeStyle = "#8B5CF6";
            ctx.lineWidth = 2;
            ctx.strokeRect(start[0], start[1], size[0], size[1]);
          });
        }
      }
    }
    if (isScanning) requestAnimationFrame(runDetection);
  };

  useEffect(() => {
    if (model && !isScanning) {
      setIsScanning(true);
      runDetection();
    }
  }, [model]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(videoRef.current, 0, 0);
      onAnalyze(canvas);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden glass-card border-2 border-purple-500/30">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      <div className="absolute bottom-8 inset-x-0 flex justify-center">
        <button 
          onClick={handleCapture}
          className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border-4 border-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <Camera size={32} />
          </div>
        </button>
      </div>
    </div>
  );
}
