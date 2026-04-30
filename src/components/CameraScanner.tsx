"use client";

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCcw, Sparkles } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (canvas: HTMLCanvasElement) => void;
}

export default function CameraScanner({ onCapture }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load MediaPipe scripts dynamically
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
    ];

    const loadScripts = async () => {
      for (const src of scripts) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      initFaceMesh();
    };

    loadScripts();
    return () => stopCamera();
  }, []);

  const initFaceMesh = () => {
    // @ts-ignore
    const faceMesh = new window.FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: any) => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          // @ts-ignore
          window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
        }
      }
      canvasCtx.restore();
    });

    startCamera(faceMesh);
  };

  const startCamera = async (faceMesh: any) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // @ts-ignore
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.send({image: videoRef.current!});
          },
          width: 640,
          height: 480,
        });
        camera.start();
        setIsReady(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    onCapture(canvasRef.current);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden glass-card border-2 border-purple-500/30">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover grayscale-[0.3]"
      />
      
      {/* Face Overlay Guide */}
      <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
        <div className="w-full h-full border-2 border-dashed border-purple-400/50 rounded-[20%] animate-pulse" />
      </div>

      <div className="absolute bottom-8 inset-x-0 flex justify-center px-6">
        <button 
          onClick={capture}
          disabled={!isReady}
          className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border-4 border-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform disabled:opacity-50"
        >
          <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <Camera size={32} />
          </div>
        </button>
      </div>

      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover z-10" 
      />
    </div>
  );
}
