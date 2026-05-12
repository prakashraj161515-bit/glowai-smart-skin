"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, RefreshCcw, Upload } from "lucide-react";
import { analyzeSkin } from "../lib/analyze";

export default function CameraScanner({ onResult, mode = "face" }: { onResult: (result: any) => void, mode?: "face" | "product" }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let streamRef: MediaStream | null = null;
    
    async function startCamera() {
      setError(null);
      setIsReady(false);
      
      const tryStream = async (constraints: MediaStreamConstraints) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsReady(true);
            return true;
          }
        } catch (e) {
          return false;
        }
        return false;
      };

      // Try specific mode first
      const success = await tryStream({ 
        video: { 
          facingMode: mode === "face" ? "user" : "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });

      if (!success) {
        // Fallback to any camera
        const fallbackSuccess = await tryStream({ video: true });
        if (!fallbackSuccess) {
          setError(mode === "face" ? "Could not access camera. Please check permissions." : "Could not access camera. Please check permissions or upload a photo instead.");
        }
      }
    }

    startCamera();

    return () => {
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [mode]);

  const [showFlash, setShowFlash] = useState(false);

  async function scan() {
    if (!videoRef.current || isAnalyzing) return;
    
    // Feedback: Flash & Vibrate
    setShowFlash(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setTimeout(() => setShowFlash(false), 150);

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

      {/* Error Message Overlay */}
      {error && (
        <div className="absolute inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400 mb-4 animate-pulse">
            <Camera size={32} />
          </div>
          <p className="text-sm font-bold mb-6 text-red-200">{error}</p>
          <button 
            onClick={() => mode === "face" ? window.location.reload() : fileInputRef.current?.click()}
            className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
          >
            {mode === "face" ? "Refresh App" : "Upload Photo Instead"}
          </button>
        </div>
      )}

      {/* Flash Effect Overlay */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash" />
      )}
      
      {/* Face Guide Overlay */}
      {mode === "face" && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-[75%] h-[75%]">
            {/* The actual face oval outline */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#F88E7D]/40 drop-shadow-lg">
              <path 
                d="M50 10 C 30 10, 18 30, 18 55 C 18 80, 30 90, 50 90 C 70 90, 82 80, 82 55 C 82 30, 70 10, 50 10 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-[45%] border-2 border-[#F88E7D]/10 blur-[1px]" />
            
            {/* Scanning Line Animation */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F88E7D] to-transparent animate-scan" />
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
          {mode === "product" ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
            >
              <Upload size={20} />
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}

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
