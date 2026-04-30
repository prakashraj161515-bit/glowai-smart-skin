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

  const handleScan = () => {
    setScanning(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setScanning(false);
        // Simulate navigation to report
        setTimeout(() => {
          router.push("/progress");
        }, 800);
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => router.back()} className="glass-button p-2 rounded-full">
          <RefreshCcw size={18} />
        </button>
        <h1 className="text-xl font-bold font-outfit">AI Skin Scan</h1>
      </header>

      {error ? (
        <div className="glass-card p-8 text-center space-y-4">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <p className="text-slate-300">{error}</p>
          <button onClick={startCamera} className="glass-button w-full">Try Again</button>
        </div>
      ) : (
        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-card">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          
          {/* Scan Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Face guide mask */}
            <div className="absolute inset-0 border-[40px] border-background/60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-dashed border-white/40 rounded-[100px] flex items-center justify-center">
               {!scanning && <span className="text-white/40 text-xs font-medium uppercase tracking-widest">Position Face Here</span>}
            </div>

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
          </div>

          {/* Progress Overlay */}
          {scanning && (
            <div className="absolute inset-x-0 bottom-12 px-8 z-30">
              <div className="glass-card p-4 bg-background/80">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-purple-400">Analyzing Skin Layers...</span>
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
        </div>
      )}

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
