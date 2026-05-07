"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, RefreshCcw, Upload } from "lucide-react";
import { analyzeSkin } from "../lib/analyze";

export default function CameraScanner({ onResult, mode = "face" }: { onResult: (result: any) => void, mode?: "face" | "product" }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let streamRef: MediaStream | null = null;
    
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: mode === "face" ? "user" : "environment", width: 640, height: 480 } 
        });
        streamRef = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    }

    startCamera();

    return () => {
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  async function scan() {
    if (!videoRef.current || isAnalyzing) return;
    
    setIsAnalyzing(true);
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const result = await analyzeSkin(canvas, mode === "product");
    onResult(result);
    setIsAnalyzing(false);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isAnalyzing) return;

    setIsAnalyzing(true);
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const result = await analyzeSkin(canvas, mode === "product");
      onResult(result);
      setIsAnalyzing(false);
    };
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-[40px] overflow-hidden bg-slate-100 border-8 border-white shadow-2xl">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover" 
      />
      
      {/* Face Guide Overlay */}
      {mode === "face" && (
        <div className="absolute inset-0 border-[40px] border-white/50 pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-purple-500/30 rounded-[30%] flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent absolute scan-line" />
          </div>
        </div>
      )}

      {/* Product Guide Overlay */}
      {mode === "product" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-48 border-2 border-dashed border-blue-400/50 rounded-2xl relative">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500" />
          </div>
        </div>
      )}

      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-4 px-6">
        <div className="flex items-center gap-6">
          {/* Upload Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
          >
            <Upload size={20} />
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload} 
          />

          {/* Capture Button */}
          <button 
            onClick={scan}
            disabled={!isReady || isAnalyzing}
            className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-xl border-4 border-white flex items-center justify-center shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCcw className="text-purple-600 animate-spin" size={32} />
            ) : (
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/20 ${mode === 'face' ? 'bg-primary-gradient' : 'bg-blue-500'}`}>
                <Camera size={28} />
              </div>
            )}
          </button>

          <div className="w-12 h-12" /> {/* Spacer */}
        </div>
        
        <button 
          onClick={scan}
          disabled={!isReady || isAnalyzing}
          className="text-[10px] text-white font-black uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-10 py-3 rounded-full border border-white/20 active:scale-95 transition-all hover:bg-black/60 disabled:opacity-50"
        >
          {isAnalyzing ? "AI Analyzing..." : mode === 'face' ? "Scan My Face" : "Scan Ingredients"}
        </button>
      </div>
    </div>
  );
}
