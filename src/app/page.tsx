"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraScanner from "@/components/CameraScanner";
import { Activity, Sparkles, RefreshCcw, Send } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [ai, setAi] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputText, setInputText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Called after skin scan is complete
  async function handleResult(res: any) {
    setData(res);
    setShowScanner(false);
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

  // AI Chat
  async function handleAskAI() {
    if (!inputText.trim()) return;
    setIsChatLoading(true);
    setAiResponse("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputText
        })
      });

      const data = await res.json();
      setAiResponse(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  }

  const formatText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return (
          <div key={i} className="text-[16px] font-black text-purple-400 mt-6 mb-2 tracking-tight uppercase border-b border-purple-500/20 pb-1">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      return <div key={i} className="mb-1 text-slate-300 text-sm leading-relaxed">{line}</div>;
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-outfit max-w-lg mx-auto">
      <header className="text-center mb-8 pt-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter"
        >
          GlowAI
        </motion.h1>
        <p className="text-slate-500 text-[10px] mt-1 font-bold tracking-widest uppercase">Smart Skin Analysis</p>
      </header>

      <AnimatePresence mode="wait">
        {!data && !showScanner ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-32 h-32 rounded-full bg-purple-500/10 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl animate-pulse rounded-full" />
              <Activity size={64} className="text-purple-400 relative z-10" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Check Your Glow</h2>
            <p className="text-slate-500 text-center text-sm mb-8 px-8">
              Analyze your skin health in seconds using our advanced AI technology.
            </p>
            <button
              onClick={() => setShowScanner(true)}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-black text-lg shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              Start Face Scan
            </button>
          </motion.div>
        ) : showScanner ? (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Position Your Face</h2>
              <button 
                onClick={() => setShowScanner(false)}
                className="text-slate-500 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
            <CameraScanner onResult={handleResult} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-20"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analysis Report</h2>
              <button
                onClick={() => { setData(null); setAi(""); setAiResponse(""); setInputText(""); setShowScanner(true); }}
                className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20"
              >
                <RefreshCcw size={14} /> New Scan
              </button>
            </div>

            {/* Glow Score Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 bg-gradient-to-br from-purple-600/20 to-transparent border-purple-500/30 shadow-2xl relative overflow-hidden"
            >
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
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </motion.div>

            {/* Metric Rows with Stagger */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Acne Detection", value: data.acne, color: "bg-red-400" },
                { label: "Oiliness Level", value: data.oil, color: "bg-yellow-400" },
                { label: "Pigmentation", value: data.pigmentation, color: "bg-blue-400" }
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <MetricRow label={m.label} value={m.value} color={m.color} />
                </motion.div>
              ))}
            </div>

            {/* Scan AI Advice */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <h3 className="text-lg font-bold flex items-center gap-2 text-purple-400">
                <Sparkles size={20} /> AI Scan Report
              </h3>
              <div className="glass-card p-6 border-t-2 border-purple-500/30 min-h-[120px] relative">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <RefreshCcw size={22} className="text-purple-400 animate-spin mb-2" />
                    <p className="text-xs text-slate-400 animate-pulse">Generating Report...</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-pre-wrap"
                  >
                    {formatText(ai) || "Waiting for AI analysis..."}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: number; color: string }) {
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
