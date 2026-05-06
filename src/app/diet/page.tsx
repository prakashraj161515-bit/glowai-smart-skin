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
          <div key={i} className="text-[14px] font-bold text-[#F88E7D] mt-6 mb-2 tracking-tight uppercase border-b border-[#FDF5F2] pb-1">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      return <div key={i} className="mb-1 text-slate-600 text-[13px] leading-relaxed font-medium">{line}</div>;
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF5F2] pb-32 font-outfit">
      {/* Header */}
      <header className="px-6 pt-12 flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 border border-[#F3EAE8]">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-[20px] font-bold text-slate-800">Diet Planner</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Smart Meal Plans</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSaved(!showSaved)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${showSaved ? 'bg-[#F88E7D] text-white shadow-lg shadow-orange-500/20' : 'bg-white shadow-sm text-slate-400 border border-[#F3EAE8]'}`}
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
              className="mb-8 space-y-4"
            >
              <h3 className="text-[11px] font-bold text-[#F88E7D] uppercase tracking-widest flex items-center gap-2">
                <Bookmark size={14} /> My Saved Plans
              </h3>
              {savedPlans.length === 0 ? (
                <div className="card p-6 text-center text-[11px] text-slate-300 font-bold uppercase tracking-widest">No saved plans yet</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {savedPlans.map(plan => (
                    <div key={plan.id} className="card p-5 flex justify-between items-center group bg-white/50">
                      <div>
                        <p className="text-[14px] font-bold text-slate-800 mb-0.5">{plan.concern}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{plan.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setDietPlan(plan.text); setShowSaved(false); }} 
                          className="bg-[#FFEDE8] text-[#F88E7D] px-4 py-2 rounded-2xl text-[11px] font-bold border border-[#F3EAE8]"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => deletePlan(plan.id)} 
                          className="w-10 h-10 flex items-center justify-center text-red-300 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
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
            className="card p-8 text-center bg-white/80 backdrop-blur-sm"
          >
            <div className="w-20 h-20 bg-[#FFEDE8] rounded-[32px] flex items-center justify-center mx-auto mb-6 text-[#F88E7D] shadow-inner animate-float">
              <Apple size={40} />
            </div>
            <h2 className="text-[22px] font-bold text-slate-800 mb-2">Ready to Glow?</h2>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-8 italic">
              Personalized for your skin type
            </p>
            
            <div className="mb-6">
              <textarea 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your skin issues (e.g. acne, oily, dry skin)..."
                className="w-full bg-[#FDF5F2] border-2 border-transparent rounded-[32px] p-6 text-[14px] font-medium text-slate-700 focus:outline-none focus:border-[#FFB5A7] transition-all h-40 resize-none placeholder:text-slate-300"
              />
            </div>

            <button 
              onClick={generateDietPlan}
              className="w-full h-16 bg-primary-gradient text-white font-bold rounded-[24px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 active:scale-95"
            >
              <Sparkles size={22} />
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
                className="absolute inset-0 border-[6px] border-[#FFEDE8] border-t-[#F88E7D] rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[#F88E7D]">
                <Apple size={40} className="animate-pulse" />
              </div>
            </div>
            <p className="mt-8 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">Crafting your meal plan...</p>
          </div>
        )}

        {error && (
          <div className="card p-8 text-center space-y-6">
            <div className="flex flex-col items-center gap-3 text-red-400">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle size={40} />
              </div>
              <p className="text-[14px] font-bold uppercase tracking-tight">Server is busy. Try again.</p>
            </div>
            <button 
              onClick={generateDietPlan} 
              className="w-full h-16 bg-[#F88E7D] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95"
            >
              <RefreshCcw size={20} /> Retry Now
            </button>
          </div>
        )}

        {dietPlan && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-[32px] shadow-sm border border-[#F3EAE8]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFEDE8] text-[#F88E7D] rounded-2xl flex items-center justify-center">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-800">7-Day Plan</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nutrition Expert</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCurrentPlan} className="bg-primary-gradient w-12 h-12 rounded-2xl text-white shadow-lg shadow-orange-500/20 flex items-center justify-center"><Bookmark size={20} /></button>
                <button onClick={generateDietPlan} className="bg-[#FDF5F2] w-12 h-12 rounded-2xl text-slate-300 border border-[#F3EAE8] flex items-center justify-center"><RefreshCcw size={20} /></button>
              </div>
            </div>

            <div className="card p-8 whitespace-pre-wrap relative overflow-hidden bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Sparkles size={64} className="text-[#F88E7D]" />
              </div>
              <div className="relative z-10">
                {formatText(dietPlan)}
              </div>
            </div>

            <div className="bg-primary-gradient p-8 rounded-[40px] text-white shadow-xl shadow-orange-500/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Droplets size={24} />
                </div>
                <h3 className="text-[16px] font-bold uppercase tracking-tight">Daily Glow Habits</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Drink 3L water daily (with lemon)",
                  "Sleep 8 hours for cell repair",
                  "Avoid sugar for 7 days straight"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-[13px] font-medium text-white/90">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
