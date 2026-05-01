"use client";

import { useState, useEffect } from "react";
import { Apple, Utensils, Droplets, Sparkles, RefreshCcw, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DietPage() {
  const [dietPlan, setDietPlan] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateDietPlan = async () => {
    setIsLoading(true);
    setError("");
    
    let scanContext = "";
    try {
      const scanData = localStorage.getItem("glowai_analysis");
      if (scanData) {
        const parsed = JSON.parse(scanData);
        scanContext = `My current skin scan metrics: Glow Score ${parsed.score}/100, Acne ${parsed.redness}%, Oiliness ${parsed.oiliness}%, Pores ${parsed.pores}%.`;
      }
    } catch (e) {}

    const fullContext = `${scanContext}${userInput ? `\nUser's specific concerns/disease: ${userInput}` : ""}`;

    try {
      const res = await fetch("/api/ai/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: fullContext }),
      });
      const data = await res.json();
      if (data.text) {
        setDietPlan(data.text);
      } else {
        setError(data.error || "Failed to generate diet plan");
      }
    } catch (e) {
      setError("Server busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Check for headlines wrapped in **
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
    <div className="pb-24 px-4 pt-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <Apple size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Diet Planner</h1>
            <p className="text-xs text-slate-400">Personalized for your skin type</p>
          </div>
        </div>
      </header>

      {!dietPlan && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
            <Utensils size={32} />
          </div>
          <h2 className="text-lg font-bold mb-2">Ready to Glow?</h2>
          <p className="text-sm text-slate-400 mb-6">
            Tell us about your skin conditions or disease, and we'll generate a personalized 7-day plan.
          </p>
          
          <div className="mb-6">
            <textarea 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="E.g. I have severe acne, eczema, or dark spots..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors h-32 resize-none"
            />
          </div>
          <button 
            onClick={generateDietPlan}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
          >
            <Sparkles size={20} />
            Generate My Plan
          </button>
        </motion.div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-20 h-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-purple-400">
              <Apple size={32} />
            </div>
          </div>
          <p className="mt-4 text-purple-400 font-medium animate-pulse">Creating your plan...</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-6 border-red-500/30 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={generateDietPlan}
            className="flex items-center gap-2 mx-auto text-purple-400 font-bold hover:text-purple-300 transition-colors"
          >
            <RefreshCcw size={18} /> Try Again
          </button>
        </div>
      )}

      {dietPlan && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Calendar size={20} />
              <span>7-Day Plan</span>
            </div>
            <button 
              onClick={generateDietPlan}
              className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors"
            >
              Regenerate
            </button>
          </div>

          <div className="glass-card p-6 whitespace-pre-wrap">
            {formatText(dietPlan)}
          </div>

          <div className="bg-purple-600/20 p-6 rounded-3xl border border-purple-500/30 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="text-purple-400" size={24} />
              <h3 className="font-bold">Daily Glow Routine</h3>
            </div>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>• Drink 2.5 - 3L water daily</li>
              <li>• Get at least 7-8 hours of sleep</li>
              <li>• Limit processed sugars and caffeine</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
