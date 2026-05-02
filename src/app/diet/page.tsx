"use client";

import { useState, useEffect } from "react";
import { Apple, Utensils, Droplets, Sparkles, RefreshCcw, Calendar, Bookmark, Trash2, ChevronDown, ChevronUp, AlertCircle, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function DietPage() {
  const [dietPlan, setDietPlan] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedPlans, setSavedPlans] = useState<{id: string, text: string, date: string, concern: string}[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("velmora_saved_diets");
    if (saved) setSavedPlans(JSON.parse(saved));
  }, []);

  const generateDietPlan = async () => {
    setIsLoading(true);
    setError("");
    
    let scanContext = "";
    try {
      const scanData = localStorage.getItem("velmora_analysis");
      if (scanData) {
        const parsed = JSON.parse(scanData);
        scanContext = `My current skin scan metrics: Glow Score ${parsed.score}/100, Acne ${parsed.acne}%, Oiliness ${parsed.oil}%, Pigmentation ${parsed.pigmentation}%.`;
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

  const saveCurrentPlan = () => {
    if (!dietPlan) return;
    const newPlan = {
      id: Date.now().toString(),
      text: dietPlan,
      date: new Date().toLocaleDateString(),
      concern: userInput || "General Skin Health"
    };
    const updated = [newPlan, ...savedPlans];
    setSavedPlans(updated);
    localStorage.setItem("velmora_saved_diets", JSON.stringify(updated));
    alert("Diet Plan Saved! 💾");
  };

  const deletePlan = (id: string) => {
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem("velmora_saved_diets", JSON.stringify(updated));
  };

  const formatText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return (
          <div key={i} className="text-[14px] font-black text-purple-600 mt-6 mb-2 tracking-tight uppercase border-b border-purple-100 pb-1">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      return <div key={i} className="mb-1 text-slate-600 text-[12px] leading-relaxed">{line}</div>;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-32">
      {/* Header */}
      <header className="px-6 pt-8 flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 border border-slate-100">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">Diet Planner</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Smart Meal Plans</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSaved(!showSaved)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showSaved ? 'bg-primary-gradient text-white' : 'bg-white shadow-md text-slate-400 border border-slate-100'}`}
        >
          <Bookmark size={20} />
        </button>
      </header>

      <div className="px-6">
        <AnimatePresence>
          {showSaved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 space-y-3"
            >
              <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                <Bookmark size={12} /> My Saved Plans
              </h3>
              {savedPlans.length === 0 ? (
                <div className="premium-card p-6 text-center text-[10px] text-slate-400 font-bold uppercase">No saved plans yet</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {savedPlans.map(plan => (
                    <div key={plan.id} className="premium-card p-4 flex justify-between items-center group">
                      <div>
                        <p className="text-xs font-black text-slate-800 mb-0.5">{plan.concern}</p>
                        <p className="text-[9px] text-slate-400 font-bold">{plan.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setDietPlan(plan.text); setShowSaved(false); }} 
                          className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-100"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => deletePlan(plan.id)} 
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!dietPlan && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card p-8 text-center"
          >
            <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-purple-600 shadow-inner shadow-purple-100 animate-float">
              <Apple size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Ready to Glow?</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-8">
              Personalized meal plans for your skin type
            </p>
            
            <div className="mb-6">
              <textarea 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your skin issues (e.g. acne, dry skin, eczema)..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-purple-200 transition-all h-32 resize-none placeholder:text-slate-300"
              />
            </div>

            <button 
              onClick={generateDietPlan}
              className="w-full h-14 bg-primary-gradient text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 active:scale-95"
            >
              <Sparkles size={20} />
              Generate Diet Plan
            </button>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-24 h-24">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[6px] border-purple-100 border-t-purple-600 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-purple-600">
                <Apple size={40} className="animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Crafting your meal plan...</p>
          </div>
        )}

        {error && (
          <div className="premium-card p-8 text-center space-y-6">
            <div className="flex flex-col items-center gap-3 text-red-500">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <p className="text-sm font-black uppercase tracking-tight">Server is busy Please try again</p>
            </div>
            <button 
              onClick={generateDietPlan} 
              className="w-full h-14 bg-purple-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95"
            >
              <RefreshCcw size={20} /> Retry Now
            </button>
          </div>
        )}

        {dietPlan && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-800">7-Day Plan</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Expert Nutrition</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCurrentPlan} className="bg-primary-gradient p-2.5 rounded-xl text-white shadow-lg shadow-purple-500/20"><Bookmark size={18} /></button>
                <button onClick={generateDietPlan} className="bg-slate-50 p-2.5 rounded-xl text-slate-400 border border-slate-100"><RefreshCcw size={18} /></button>
              </div>
            </div>

            <div className="premium-card p-8 whitespace-pre-wrap relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles size={48} className="text-purple-600" />
              </div>
              <div className="relative z-10">
                {formatText(dietPlan)}
              </div>
            </div>

            <div className="bg-primary-gradient p-6 rounded-[32px] text-white shadow-xl shadow-purple-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                  <Droplets size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight">Daily Glow Routine</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Drink 2.5 - 3L water daily",
                  "Get at least 7-8 hours of sleep",
                  "Limit processed sugars and caffeine"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-medium text-white/90">
                    <div className="w-1 h-1 bg-white rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
