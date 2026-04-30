"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraScanner from '@/components/CameraScanner';
import { analyzeSkin, SkinAnalysisResult } from '@/lib/analyze';
import { Sparkles, Activity, PieChart, Info, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState<'camera' | 'analyzing' | 'results'>('camera');
  const [results, setResults] = useState<SkinAnalysisResult | null>(null);
  const [aiAdvice, setAiAdvice] = useState<any>(null);

  const handleCapture = async (canvas: HTMLCanvasElement) => {
    setStep('analyzing');
    
    try {
      const analysis = await analyzeSkin(canvas);
      setResults(analysis);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysis)
      });
      const advice = await res.json();
      setAiAdvice(advice);
      
      setStep('results');
    } catch (err) {
      console.error(err);
      setStep('camera');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 font-outfit">
      <AnimatePresence mode="wait">
        {step === 'camera' && (
          <motion.div 
            key="camera"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="space-y-8 pt-10"
          >
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">GlowAI Scan</h1>
              <p className="text-slate-400">Position your face in the guide for AI analysis</p>
            </div>
            <CameraScanner onCapture={handleCapture} />
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[70vh] space-y-6"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto text-purple-400 animate-pulse" size={32} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Analyzing Skin Layers...</h2>
              <p className="text-slate-400 text-sm animate-pulse">Consulting Gemini AI Coach</p>
            </div>
          </motion.div>
        )}

        {step === 'results' && results && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-6 pt-6 pb-24"
          >
            <header className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Analysis Report</h1>
              <button 
                onClick={() => setStep('camera')}
                className="text-sm text-purple-400 font-bold"
              >
                Scan Again
              </button>
            </header>

            {/* Score Card */}
            <div className="glass-card p-6 bg-gradient-to-br from-purple-600/20 to-transparent border-purple-500/30">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-slate-400">Glow Score</p>
                  <p className="text-5xl font-bold">{results.score}<span className="text-xl text-slate-500">/100</span></p>
                </div>
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/40">
                  <Activity size={32} />
                </div>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${results.score}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Acne', val: results.acne, color: 'text-red-400' },
                { label: 'Oiliness', val: results.oil, color: 'text-yellow-400' },
                { label: 'Pigmentation', val: results.pigmentation, color: 'text-blue-400' },
              ].map((m) => (
                <div key={m.label} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-current ${m.color}`} />
                    <span className="font-bold text-sm">{m.label}</span>
                  </div>
                  <span className={`font-bold ${m.color}`}>{m.val}%</span>
                </div>
              ))}
            </div>

            {/* AI Advice */}
            {aiAdvice && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-400" />
                  AI Coach Suggestions
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="glass-card p-5 border-l-4 border-green-500">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">Indian Diet</p>
                    <ul className="space-y-2">
                      {aiAdvice.diet?.map((d: string) => (
                        <li key={d} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-green-500 mt-1 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-card p-5 border-l-4 border-blue-500">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Daily Routine</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Morning</p>
                        <p className="text-sm text-slate-300">{aiAdvice.morning?.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Night</p>
                        <p className="text-sm text-slate-300">{aiAdvice.night?.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-5 bg-purple-500/10 border-purple-500/20">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Expert Tips</p>
                    <ul className="space-y-2">
                      {aiAdvice.tips?.map((t: string) => (
                        <li key={t} className="text-sm text-slate-300">• {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
