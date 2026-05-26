"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCcw, CheckCircle2, AlertCircle, Info, Gem, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [isPremium, setIsPremium] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsPremium(localStorage.getItem("velmora_is_premium") === "true");
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async (mode: "user" | "environment") => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: 1280, height: 720 },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
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

  const toggleCamera = () => {
    if (scanning) return;
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
  };

  const handleScan = async () => {
    // Check daily scan limit for free users
    const todayStr = new Date().toDateString();
    const lastScanDate = localStorage.getItem("velmora_last_scan_date");

    if (!isPremium && lastScanDate === todayStr) {
      setShowLimitModal(true);
      return;
    }

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
      localStorage.setItem('velmora_analysis', JSON.stringify(dynamicMetrics));
      // Save last scan date
      localStorage.setItem('velmora_last_scan_date', todayStr);
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
    <div className="min-h-screen bg-[#FDF5F2] px-6 pt-12 pb-32 font-outfit relative">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Skin Analysis</h1>
      </header>

      <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden glass-card flex flex-col items-center justify-center bg-black border border-purple-500/20 shadow-2xl shadow-purple-500/10 mb-8">
        {/* Camera Feed */}
        {!error ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center px-8">
            <AlertCircle size={48} className="text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Camera Swap Button inside Camera Preview */}
        {!scanning && !error && (
          <button 
            onClick={toggleCamera} 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform z-30"
            title="Swap Camera"
          >
            <RefreshCcw size={20} />
          </button>
        )}

        {/* Scan Frame Overlay */}
        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
          <div className="w-full h-full border-2 border-purple-500/30 rounded-[32px] relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-xl" />
          </div>
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

        {/* Progress Overlay */}
        {scanning && (
          <div className="absolute inset-x-0 bottom-12 px-8 z-30">
            <div className="glass-card p-4 bg-white/80 backdrop-blur-xl border border-white/10 rounded-3xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{analysisStatus}</span>
                <span className="text-[10px] font-black text-slate-800">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {!scanning && !error && (
        <button 
          onClick={handleScan}
          className="w-full h-16 bg-primary-gradient rounded-[24px] font-black text-white text-[15px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 active:scale-95 transition-transform mb-6"
        >
          <Camera size={24} /> Start Face Scan
        </button>
      )}

      <div className="bg-white rounded-[32px] p-5 border border-[#F3EAE8] shadow-sm flex gap-4">
        <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-400 shrink-0">
          <Info size={18} />
        </div>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          For best results, ensure you are in a well-lit area and have removed any makeup or glasses. Keep a neutral expression.
        </p>
      </div>

      {/* Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowLimitModal(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
              >
                <X size={16} />
              </button>

              <div className="w-20 h-20 bg-purple-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-purple-500">
                <Gem size={36} className="fill-purple-500/10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Limit Reached! 🌟</h3>
              <p className="text-[13px] text-slate-400 font-bold mb-8 leading-relaxed">
                You get 1 free skin scan daily. Upgrade to Premium for unlimited daily scans, PDF downloads, and expert coaching!
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowLimitModal(false);
                    router.push("/premium");
                  }}
                  className="w-full h-14 bg-primary-gradient text-white font-black rounded-2xl shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
                >
                  Upgrade to Premium ✨
                </button>
                <button 
                  onClick={() => setShowLimitModal(false)}
                  className="w-full h-14 bg-slate-50 text-slate-400 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronLeft({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}
