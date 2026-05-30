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
  const [facingMode, setFacingMode] = useState<"user" | "environment">(mode === "face" ? "user" : "environment");

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
          facingMode: facingMode === "environment" ? { exact: "environment" } : "user",
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
  }, [facingMode, mode]);

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

  const accent = mode === "face" ? "#F0886A" : "#4E8ED4";
  return (
    <div
      className="relative w-full mx-auto overflow-hidden"
      style={{
        maxWidth: 332,
        aspectRatio: "3 / 4",
        borderRadius: 36,
        background: "#0a0706",
        boxShadow: `0 24px 70px ${mode === "face" ? "rgba(240,136,106,0.40)" : "rgba(78,142,212,0.40)"}, 0 0 0 1px rgba(255,255,255,0.10)`,
      }}
    >
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center p-8 text-center text-white" style={{ background: "rgba(10,7,6,0.92)", backdropFilter: "blur(8px)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-pulse" style={{ background: "rgba(224,104,92,0.2)", color: "#E0685C" }}>
            <Camera size={32} />
          </div>
          <p className="text-sm font-bold mb-6" style={{ color: "#F5C0B5" }}>{error}</p>
          <button onClick={() => mode === "face" ? window.location.reload() : fileInputRef.current?.click()}
            className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
            style={{ background: "#fff", color: "#2C1F1A", boxShadow: "0 8px 22px rgba(0,0,0,0.3)" }}>
            {mode === "face" ? "Refresh App" : "Upload Photo Instead"}
          </button>
        </div>
      )}

      {/* Flash */}
      {showFlash && <div className="absolute inset-0 z-50 animate-flash" style={{ background: "#fff" }} />}

      {/* Vignette — darkens edges, focuses center */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse 62% 64% at 50% 44%, transparent 56%, rgba(0,0,0,0.62) 100%)" }} />

      {/* Face oval guide */}
      {mode === "face" && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div style={{ position: "relative", width: "66%", height: "74%", marginTop: "-4%" }}>
            {/* glowing dashed oval */}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2.5px dashed ${accent}`, boxShadow: `0 0 28px ${accent}66, inset 0 0 40px ${accent}22` }} />
            {/* corner brackets around oval bounding box */}
            {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
              <div key={i} style={{ position:"absolute", [v]:-6, [h]:-2, width:20, height:20,
                borderTop: v==="top"?`3px solid ${accent}`:"none", borderBottom: v==="bottom"?`3px solid ${accent}`:"none",
                borderLeft: h==="left"?`3px solid ${accent}`:"none", borderRight: h==="right"?`3px solid ${accent}`:"none",
                borderTopLeftRadius: v==="top"&&h==="left"?6:0, borderTopRightRadius: v==="top"&&h==="right"?6:0,
                borderBottomLeftRadius: v==="bottom"&&h==="left"?6:0, borderBottomRightRadius: v==="bottom"&&h==="right"?6:0 } as any} />
            ))}
            {/* scan line */}
            <div className="animate-scan" style={{ position: "absolute", left: "6%", right: "6%", height: 2.5, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, boxShadow: `0 0 14px 1px ${accent}` }} />
            <div style={{ position:"absolute", bottom:-2, left:0, right:0, textAlign:"center", fontSize:10, letterSpacing:1, textTransform:"uppercase", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Sans',sans-serif" }}>align your face</div>
          </div>
        </div>
      )}

      {/* Product guide */}
      {mode === "product" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div style={{ position: "relative", width: 256, height: 180, borderRadius: 16, border: `2px dashed ${accent}88` }}>
            {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
              <div key={i} style={{ position:"absolute", [v]:-2, [h]:-2, width:18, height:18,
                borderTop: v==="top"?`3px solid ${accent}`:"none", borderBottom: v==="bottom"?`3px solid ${accent}`:"none",
                borderLeft: h==="left"?`3px solid ${accent}`:"none", borderRight: h==="right"?`3px solid ${accent}`:"none" } as any} />
            ))}
            <div className="animate-scan" style={{ position: "absolute", left: 8, right: 8, height: 2.5, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, boxShadow: `0 0 14px 1px ${accent}` }} />
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      {/* Controls */}
      <div className="absolute inset-x-0 z-30 flex flex-col items-center gap-3" style={{ bottom: 22 }}>
        <div className="flex items-center justify-center gap-9">
          {/* upload (product) / spacer */}
          {mode === "product" ? (
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center active:scale-95 transition-all"
              style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff" }}>
              <Upload size={19} />
            </button>
          ) : <div style={{ width: 46 }} />}

          {/* capture */}
          <button onClick={scan} disabled={!isReady || isAnalyzing} className="flex items-center justify-center active:scale-95 transition-all"
            style={{ width: 78, height: 78, borderRadius: 999, background: "transparent", border: "4px solid rgba(255,255,255,0.92)", opacity: (!isReady || isAnalyzing) ? 0.55 : 1 }}>
            {isAnalyzing ? (
              <RefreshCcw className="animate-spin" size={30} style={{ color: accent }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: 999, background: mode === "face" ? "linear-gradient(135deg,#F5A98D 0%,#F0886A 100%)" : "linear-gradient(135deg,#6BA8E8,#4E8ED4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 22px ${accent}aa` }}>
                <Camera size={26} color="#fff" />
              </div>
            )}
          </button>

          {/* flip */}
          <button onClick={(e) => { e.stopPropagation(); if (isAnalyzing) return; setFacingMode(prev => prev === "user" ? "environment" : "user"); }}
            title="Swap Camera" className="flex items-center justify-center active:scale-95 transition-all"
            style={{ width: 46, height: 46, borderRadius: 999, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff" }}>
            <RefreshCcw size={19} />
          </button>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans',sans-serif" }}>
          {isAnalyzing ? "AI Analyzing…" : (mode === "face" ? "Tap to scan" : "Scan ingredients")}
        </div>
      </div>
    </div>
  );
}
