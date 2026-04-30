"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraScanner from "@/components/CameraScanner";
import { analyzeSkin, SkinAnalysisResult } from "@/lib/analyze";
import { Sparkles, Activity, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<"camera" | "analyzing" | "results">("camera");
  const [analysis, setAnalysis] = useState<SkinAnalysisResult | null>(null);
  const [aiReport, setAiReport] = useState<any>(null);

  const handleScanResult = async (result: SkinAnalysisResult) => {
    if (result.error) {
      alert(result.error);
      return;
    }

    setStep("analyzing");
    setAnalysis(result);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const report = await res.json();
      setAiReport(report);
      setStep("results");
    } catch (err) {
      console.error(err);
      setStep("camera");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 font-outfit">
      <AnimatePresence mode="wait">
        {step === "camera" && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-10">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-2 tracking-tighter">GlowAI</h1>
              <p className="text-slate-400 text-sm font-medium">AI Skin Scanner & Coach</p>
            </div>
            <CameraScanner onResult={handleScanResult} />
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-bold">AI is Analyzing...</h2>
            <p className="text-slate-400">Deep scanning skin layers</p>
          </motion.div>
        )}

        {step === "results" && analysis && aiReport && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-24">
            <header className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Skin Report</h2>
              <button onClick={() => setStep("camera")} className="text-purple-400 text-sm font-bold">New Scan</button>
            </header>

            <div className="glass-card p-6 mb-6 bg-gradient-to-br from-purple-500/20 to-transparent border-purple-500/30">
              <p className="text-sm text-slate-400 mb-1">Overall Health Score</p>
              <h3 className="text-6xl font-bold">{analysis.score}<span className="text-xl font-normal text-slate-600">/100</span></h3>
              <div className="h-1.5 w-full bg-white/10 rounded-full mt-4">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysis.score}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <MetricBar label="Acne" value={analysis.acne} color="bg-red-500" />
              <MetricBar label="Oiliness" value={analysis.oil} color="bg-yellow-500" />
              <MetricBar label="Pigmentation" value={analysis.pigmentation} color="bg-blue-500" />
            </div>

            {/* AI Report */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-purple-400">
                <Sparkles size={20} /> AI Coach Analysis
              </h3>
              <div className="glass-card p-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-300 border-t-2 border-purple-500/30">
                {aiReport.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function MetricBar({ label, value, color }: any) {
  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <span className="text-sm font-bold">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-32 h-1 bg-white/10 rounded-full">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs font-bold w-8 text-right">{value}%</span>
      </div>
    </div>
  );
}

function ReportSection({ title, icon, items }: any) {
  return (
    <div className="glass-card p-5">
      <h4 className="flex items-center gap-2 font-bold mb-4 text-purple-400">
        {icon} {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="text-sm text-slate-300 leading-relaxed">• {item}</li>
        ))}
      </ul>
    </div>
  );
}
