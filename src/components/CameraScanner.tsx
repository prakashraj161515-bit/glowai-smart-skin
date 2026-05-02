"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, RefreshCcw } from "lucide-react";
import { analyzeSkin } from "../lib/analyze";

export default function CameraScanner({ onResult }: { onResult: (result: any) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let streamRef: MediaStream | null = null;
    
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: 640, height: 480 } 
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
  }, []);

  async function scan() {
    if (!videoRef.current || isAnalyzing) return;
    
    setIsAnalyzing(true);
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const result = await analyzeSkin(canvas);
    onResult(result);
    setIsAnalyzing(false);
  }

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
      <div className="absolute inset-0 border-[40px] border-white/50 pointer-events-none">
        <div className="w-full h-full border-2 border-dashed border-purple-500/30 rounded-[30%] flex items-center justify-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent absolute scan-line" />
        </div>
      </div>

      <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-4 px-6">
        <button 
          onClick={scan}
          disabled={!isReady || isAnalyzing}
          className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-xl border-4 border-white flex items-center justify-center shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <RefreshCcw className="text-purple-600 animate-spin" size={32} />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-gradient flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Camera size={28} />
            </div>
          )}
        </button>
        <p className="text-[9px] text-purple-600 font-black uppercase tracking-[0.2em] bg-white/90 px-4 py-1.5 rounded-full shadow-lg border border-purple-50">
          {isAnalyzing ? "AI Analyzing..." : "Scan My Skin"}
        </p>
      </div>
    </div>
  );
}
