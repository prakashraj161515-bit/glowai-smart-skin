"use client";

import { motion } from "framer-motion";
import { Sparkles, Calendar, Droplets, Sun, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-outfit">Hello, Gorgeous ✨</h1>
          <p className="text-slate-400 text-sm">Ready for your skin check?</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
          AK
        </div>
      </header>

      {/* Hero Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="glass-card p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative overflow-hidden"
      >
        <div className="relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-purple-400" /> AI Skin Scanner
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-[200px]">
            Scan your face now to get a personalized report in 30 seconds.
          </p>
          <Link 
            href="/scan" 
            className="mt-4 inline-flex items-center gap-2 bg-white text-purple-950 font-bold px-6 py-2 rounded-full text-sm hover:bg-purple-50 transition-colors"
          >
            Start Scanning <ChevronRight size={16} />
          </Link>
        </div>
        <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
            <Droplets size={20} />
          </div>
          <span className="text-xs text-slate-400">Water Streak</span>
          <span className="text-lg font-bold">4 Days</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-2">
            <Sun size={20} />
          </div>
          <span className="text-xs text-slate-400">UV Index</span>
          <span className="text-lg font-bold">High (7)</span>
        </div>
      </div>

      {/* Routine Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Morning Routine</h3>
          <span className="text-xs text-purple-400 font-medium">65% Done</span>
        </div>
        <div className="space-y-3">
          {[
            { name: "Gentle Cleanser", status: "completed" },
            { name: "Vitamin C Serum", status: "pending" },
            { name: "Light Moisturizer", status: "pending" },
            { name: "Sunscreen (SPF 50)", status: "pending" },
          ].map((item, i) => (
            <div key={i} className="glass-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border ${item.status === 'completed' ? 'bg-green-500 border-green-500 flex items-center justify-center' : 'border-slate-500'}`}>
                  {item.status === 'completed' && <span className="text-[10px] text-white">✓</span>}
                </div>
                <span className={item.status === 'completed' ? 'text-slate-500 line-through' : ''}>{item.name}</span>
              </div>
              <ChevronRight size={14} className="text-slate-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Tip of the Day */}
      <div className="glass-card p-4 bg-indigo-500/10 border-indigo-500/30">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Tip of the Day</p>
        <p className="text-sm text-slate-300 italic">
          "Don't forget to wash your face after working out to prevent sweat from clogging your pores!"
        </p>
      </div>
    </div>
  );
}
