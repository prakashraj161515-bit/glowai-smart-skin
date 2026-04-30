"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraScanner from "@/components/CameraScanner";
import { Activity, Sparkles, ShieldCheck, Heart, RefreshCcw } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [ai, setAi] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleResult(res: any) {
    setData(res);
    setIsGenerating(true);

    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(res)
      });

      const j = await r.json();
      setAi(j.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 font-outfit max-w-lg mx-auto">
      <header className="text-center mb-10 pt-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter"
        >
          GlowAI
        </motion.h1>
        <p className="text-slate-500 text-sm mt-1 font-medium tracking-widest uppercase">Smart Skin Analysis</p>
      </header>

      <AnimatePresence mode="wait">
        {!data ? (
          <motion.div 
            key="scanner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <CameraScanner onResult={handleResult} />
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-20"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analysis Report</h2>
              <button 
                onClick={() => { setData(null); setAi(""); }}
                className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-2 rounded-full border border-purple-500/20"
              >
                <RefreshCcw size={14} /> New Scan
              </button>
            </div>

            {/* Main Score Card */}
            <div className="glass-card p-6 bg-gradient-to-br from-purple-600/20 to-transparent border-purple-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Glow Score</p>
                  <p className="text-6xl font-black">{data.score}<span className="text-xl font-normal text-slate-600">/100</span></p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                  <Activity size={32} />
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-3">
              <MetricRow label="Acne Detection" value={data.acne} color="bg-red-400" />
              <MetricRow label="Oiliness Level" value={data.oil} color="bg-yellow-400" />
              <MetricRow label="Pigmentation" value={data.pigmentation} color="bg-blue-400" />
            </div>

            {/* AI Advice Section */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-purple-400">
                <Sparkles size={20} /> AI Recommendations
              </h3>
              
              <div className="glass-card p-6 border-t-2 border-purple-500/30 shadow-xl min-h-[200px] relative">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
                    <RefreshCcw size={24} className="text-purple-400 animate-spin mb-2" />
                    <p className="text-xs font-bold text-slate-400 animate-pulse">Generating Report...</p>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300 font-medium">
                    {ai || "Waiting for AI analysis..."}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function MetricRow({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="glass-card p-4 flex items-center justify-between border border-white/5">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</span>
      <div className="flex items-center gap-4">
        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            className={`h-full ${color}`}
          />
        </div>
        <span className="text-sm font-bold w-8 text-right">{value}%</span>
      </div>
    </div>
  );
}
