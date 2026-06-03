"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, RefreshCcw, Upload } from "lucide-react";
import { analyzeSkin } from "../lib/analyze";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

// face-position guidance states
type FaceStatus = "loading" | "none" | "far" | "close" | "offcenter" | "blurry" | "ok";

// Measure how sharp the current video frame is (variance of a Laplacian on a
// small grayscale sample). Higher = sharper. Used to avoid auto-capturing a
// blurry frame. Reuses one canvas to stay cheap.
function frameSharpness(video: HTMLVideoElement, c: HTMLCanvasElement): number {
  const vw = video.videoWidth || 640, vh = video.videoHeight || 480;
  const W = 160, H = Math.max(1, Math.round((W * vh) / vw));
  c.width = W; c.height = H;
  const cx = c.getContext("2d", { willReadFrequently: true });
  if (!cx) return 999;
  cx.drawImage(video, 0, 0, W, H);
  const { data } = cx.getImageData(0, 0, W, H);
  const gray = (i: number) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  let sum = 0, sum2 = 0, n = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = (y * W + x) * 4;
      const lap = gray(i - 4) + gray(i + 4) + gray(i - W * 4) + gray(i + W * 4) - 4 * gray(i);
      sum += lap; sum2 += lap * lap; n++;
    }
  }
  const mean = sum / n;
  return sum2 / n - mean * mean;
}
const SHARP_MIN = 55;     // below this the frame is considered blurry
const HOLD_MS = 1500;     // must stay ok+steady+sharp this long before capture

export default function CameraScanner({ onResult, mode = "face" }: { onResult: (result: any) => void, mode?: "face" | "product" }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(mode === "face" ? "user" : "environment");

  // ── MediaPipe face detection state ──
  const detectorRef = useRef<FaceDetector | null>(null);
  const rafRef = useRef<number>(0);
  const okSinceRef = useRef(0);          // timestamp when face became ok+steady+sharp
  const badFramesRef = useRef(0);        // tolerance: how many recent non-ok frames
  const capturedRef = useRef(false);     // once a frame is captured, stop the timer for good
  const prevCenterRef = useRef<{ x: number; y: number } | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyzingRef = useRef(false);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>(mode === "face" ? "loading" : "ok");
  const [countdown, setCountdown] = useState<number | null>(null);

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
          width: { ideal: 1280 },
          height: { ideal: 720 }
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

  const scan = useCallback(async () => {
    if (!videoRef.current || analyzingRef.current) return;
    analyzingRef.current = true;
    capturedRef.current = true;   // lock — no more auto-capture / countdown after this
    setCountdown(null);

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
  }, [mode, onResult]);

  // ── MediaPipe: load model + run detection loop (face mode only) ──
  useEffect(() => {
    if (mode !== "face") return;
    let cancelled = false;

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        });
        if (cancelled) { detector.close(); return; }
        detectorRef.current = detector;
        setFaceStatus("none");
        loop();
      } catch (e) {
        // if MediaPipe fails to load, fall back to manual capture
        console.warn("MediaPipe face detector failed, manual capture only:", e);
        setFaceStatus("ok");
      }
    })();

    const loop = () => {
      // once we've captured (or are analyzing), stop all guidance & the countdown
      if (capturedRef.current || analyzingRef.current) {
        if (!cancelled) rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const video = videoRef.current;
      const det = detectorRef.current;
      if (!cancelled && video && det && video.readyState >= 2) {
        try {
          const res = det.detectForVideo(video, performance.now());
          const d = res.detections?.[0];
          if (!d) {
            setFaceStatus("none"); okSinceRef.current = 0; prevCenterRef.current = null; setCountdown(null);
          } else {
            const b = d.boundingBox!;
            const vw = video.videoWidth || 640, vh = video.videoHeight || 480;
            const w = b.width / vw;              // face width as % of frame
            const cx = (b.originX + b.width / 2) / vw;
            const cy = (b.originY + b.height / 2) / vh;
            const centered = Math.abs(cx - 0.5) < 0.18 && Math.abs(cy - 0.46) < 0.2;

            // how much the face moved since last frame (motion-blur guard)
            const prev = prevCenterRef.current;
            const moved = prev ? Math.hypot(cx - prev.x, cy - prev.y) : 1;
            prevCenterRef.current = { x: cx, y: cy };

            let status: FaceStatus;
            if (w < 0.30) status = "far";
            else if (w > 0.74) status = "close";
            else if (!centered) status = "offcenter";
            else {
              // well-placed — now require it to be STEADY and SHARP before capturing
              if (!sampleCanvasRef.current) sampleCanvasRef.current = document.createElement("canvas");
              const sharp = frameSharpness(video, sampleCanvasRef.current);
              const steady = moved < 0.022;            // a little forgiving so tiny motion is ok
              status = (steady && sharp >= SHARP_MIN) ? "ok" : "blurry";
            }

            // auto-capture: hold ok+steady+sharp for HOLD_MS, with tolerance so a
            // single shaky frame doesn't restart the 3-2-1 countdown.
            if (status === "ok") {
              badFramesRef.current = 0;
              const now = performance.now();
              if (!okSinceRef.current) okSinceRef.current = now;
              const held = now - okSinceRef.current;
              const cd = Math.max(1, Math.ceil((HOLD_MS - held) / 500));
              setCountdown(prev => (prev === cd ? prev : cd));     // only re-render when the number changes
              setFaceStatus("ok");
              if (held >= HOLD_MS && !analyzingRef.current) {
                okSinceRef.current = 0; badFramesRef.current = 0; setCountdown(null);
                scan();
              }
            } else {
              // forgive up to ~8 bad frames (~0.3s) before resetting the timer
              badFramesRef.current += 1;
              if (badFramesRef.current > 8) {
                okSinceRef.current = 0;
                setCountdown(null);
                setFaceStatus(status);
              } else if (okSinceRef.current) {
                // mid-countdown wobble — keep counting, just nudge the user
                setFaceStatus("blurry");
              } else {
                setFaceStatus(status);
              }
            }
          }
        } catch {}
      }
      if (!cancelled) rafRef.current = requestAnimationFrame(loop);
    };

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      detectorRef.current?.close();
      detectorRef.current = null;
    };
  }, [mode, scan]);

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

  // live guidance for the face overlay
  const GUIDE: Record<FaceStatus, { text: string; color: string }> = {
    loading:   { text: "Loading face detector…", color: "#F0886A" },
    none:      { text: "Position your face in the oval", color: "#F0886A" },
    far:       { text: "Move a little closer", color: "#E8A24C" },
    close:     { text: "Move back a little", color: "#E8A24C" },
    offcenter: { text: "Center your face", color: "#E8A24C" },
    blurry:    { text: "Hold steady — keep still", color: "#E8A24C" },
    ok:        { text: countdown ? `Hold still… ${countdown}` : "Hold still — capturing…", color: "#7FB389" },
  };
  const guide = GUIDE[faceStatus];
  const ovalColor = mode === "face" ? guide.color : accent;

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

      {/* Face oval guide — color + text driven by MediaPipe detection */}
      {mode === "face" && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div style={{ position: "relative", width: "66%", height: "74%", marginTop: "-4%", transition: "all .25s" }}>
            {/* glowing dashed oval (turns green when face is well-placed) */}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2.5px ${faceStatus === "ok" ? "solid" : "dashed"} ${ovalColor}`, boxShadow: `0 0 28px ${ovalColor}66, inset 0 0 40px ${ovalColor}22`, transition: "border-color .25s, box-shadow .25s" }} />
            {/* corner brackets around oval bounding box */}
            {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
              <div key={i} style={{ position:"absolute", [v]:-6, [h]:-2, width:20, height:20, transition:"border-color .25s",
                borderTop: v==="top"?`3px solid ${ovalColor}`:"none", borderBottom: v==="bottom"?`3px solid ${ovalColor}`:"none",
                borderLeft: h==="left"?`3px solid ${ovalColor}`:"none", borderRight: h==="right"?`3px solid ${ovalColor}`:"none",
                borderTopLeftRadius: v==="top"&&h==="left"?6:0, borderTopRightRadius: v==="top"&&h==="right"?6:0,
                borderBottomLeftRadius: v==="bottom"&&h==="left"?6:0, borderBottomRightRadius: v==="bottom"&&h==="right"?6:0 } as any} />
            ))}
            {/* scan line */}
            <div className="animate-scan" style={{ position: "absolute", left: "6%", right: "6%", height: 2.5, background: `linear-gradient(90deg, transparent, ${ovalColor}, transparent)`, boxShadow: `0 0 14px 1px ${ovalColor}` }} />
            {/* big hold-still countdown */}
            {faceStatus === "ok" && countdown && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span key={countdown} className="animate-ping-once" style={{ fontSize: 72, fontWeight: 800, color: "#fff", textShadow: `0 0 24px ${ovalColor}, 0 2px 12px rgba(0,0,0,0.5)`, fontFamily: "'DM Sans',sans-serif", lineHeight: 1 }}>{countdown}</span>
              </div>
            )}
          </div>

          {/* live guidance pill */}
          <div style={{ position: "absolute", top: "8%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 15px", borderRadius: 99, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: `1px solid ${ovalColor}55` }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: ovalColor, boxShadow: `0 0 8px ${ovalColor}` }} className={faceStatus === "ok" ? "" : "animate-blink"} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>{guide.text}</span>
            </div>
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
          {isAnalyzing ? "AI Analyzing…" : (mode === "face" ? "Auto-captures · or tap" : "Scan ingredients")}
        </div>
      </div>
    </div>
  );
}
