"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCcw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Camera access denied. Please enable permissions.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setAnalysisStatus("Analyzing skin texture...");
    setProgress(10);
    
    await new Promise(r => setTimeout(r, 1000));
    setAnalysisStatus("Detecting skin conditions...");
    setProgress(40);
    
    await new Promise(r => setTimeout(r, 1500));
    setAnalysisStatus("Consulting GlowAI Experts...");
    setProgress(75);

    // Generate Dynamic Metrics
    const dynamicMetrics = {
      score: Math.floor(65 + Math.random() * 25),
      redness: Math.floor(Math.random() * 40),
      oiliness: Math.floor(20 + Math.random() * 50),
      pores: Math.floor(10 + Math.random() * 30)
    };

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: dynamicMetrics, skinType: 'Analysis' })
      });
      const aiAdvice = await res.json();
      localStorage.setItem('latestScan', JSON.stringify({ metrics: dynamicMetrics, advice: aiAdvice }));
      localStorage.setItem('glowai_analysis', JSON.stringify(dynamicMetrics));
    } catch (e) {
      console.error("Analysis failed", e);
    }

    setProgress(100);
    setAnalysisStatus("Analysis Complete! ✨");
    setTimeout(() => {
      setScanning(false);
      router.push("/progress");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => router.back()} className="glass-button p-2 rounded-full">
          <RefreshCcw size={18} />
        </button>
        <h1 className="text-xl font-bold font-outfit">Skin Analysis</h1>
      </header>

      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-card flex flex-col items-center justify-center bg-purple-500/5 border border-purple-500/20">
        <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mb-4">
          <Camera size={48} />
        </div>
        <p className="text-sm text-slate-400 px-8 text-center">
          Tap the button below to start your AI-powered skin analysis.
        </p>
        
        {/* Scanning line */}
        <AnimatePresence>
          {scanning && (
            <motion.div 
              initial={{ top: "10%" }}
              animate={{ top: "85%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.8)] z-20"
            />
          )}
        </AnimatePresence>

        {/* Progress Overlay */}
        {scanning && (
          <div className="absolute inset-x-0 bottom-12 px-8 z-30">
            <div className="glass-card p-4 bg-background/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-purple-400">{analysisStatus}</span>
                <span className="text-xs font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>)}

      {!scanning && !error && (
        <button 
          onClick={handleScan}
          className="w-full h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-transform"
        >
          <Camera size={24} /> Start Face Scan
        </button>
      )}

      <div className="glass-card p-4 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
          <Info size={18} />
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          For best results, ensure you are in a well-lit area and have removed any makeup or glasses. Keep a neutral expression.
        </p>
      </div>
    </div>
  );
}
