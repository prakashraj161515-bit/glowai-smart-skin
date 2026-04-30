"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Award, Zap, Sparkles, Bot } from "lucide-react";

const data = [
  { day: "Mon", score: 65 },
  { day: "Tue", score: 68 },
  { day: "Wed", score: 72 },
  { day: "Thu", score: 70 },
  { day: "Fri", score: 75 },
  { day: "Sat", score: 82 },
  { day: "Sun", score: 85 },
];

export default function ProgressPage() {
  const [scanData, setScanData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('latestScan');
    if (saved) {
      setScanData(JSON.parse(saved));
    }
  }, []);

  const metrics = scanData?.metrics || { score: 0, redness: 0, oiliness: 0, pores: 0 };
  const advice = scanData?.advice || {};

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-outfit">Your AI Report</h1>
        <p className="text-slate-400 text-sm">Real-time analysis results</p>
      </header>

      {/* Main Score Card */}
      <div className="glass-card p-6 bg-gradient-to-br from-purple-500/20 to-transparent border-purple-500/30">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-slate-400 font-medium">AI Skin Score</p>
            <h2 className="text-5xl font-bold text-white mt-1">
              {metrics.score}<span className="text-lg text-slate-500 font-normal">/100</span>
            </h2>
            <div className="text-purple-400 text-xs mt-3 font-bold uppercase tracking-wider">
              {advice.improvement_forecast || "Scanning for updates..."}
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Sparkles size={32} className="text-purple-400" />
          </div>
        </div>

        {/* Mini chart */}
        <div className="h-32 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="score" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detection Results */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Latest Detections</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: "Acne", level: `${metrics.redness}%`, status: metrics.redness > 20 ? "Active" : "Clear", color: metrics.redness > 20 ? "text-red-400" : "text-green-400" },
            { label: "Oiliness", level: `${metrics.oiliness}%`, status: metrics.oiliness > 50 ? "High" : "Balanced", color: metrics.oiliness > 50 ? "text-yellow-400" : "text-blue-400" },
            { label: "Pores", level: `${metrics.pores}%`, status: "Visible", color: "text-purple-400" },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.status}</p>
                </div>
              </div>
              <div className={`text-sm font-bold ${item.color}`}>
                {item.level}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Observations */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          <Bot size={20} /> AI Observation
        </h3>
        <div className="glass-card p-4 text-sm leading-relaxed text-slate-300">
          {advice.skin_analysis || "Our AI is analyzing your skin texture. Perform a scan to see your personalized report here."}
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="space-y-4 pb-20">
        <h3 className="text-lg font-bold">Personalized Routine</h3>
        
        {/* Morning Routine */}
        <div className="glass-card p-5 border-l-4 border-blue-500">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Morning Routine</p>
          <div className="space-y-3">
            {advice.morning_routine?.map((step: string, i: number) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">{i+1}</div>
                <p className="text-sm text-slate-300">{step}</p>
              </div>
            )) || <p className="text-sm text-slate-500 italic">No routine generated yet.</p>}
          </div>
        </div>

        {/* Night Routine */}
        <div className="glass-card p-5 border-l-4 border-purple-500">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Night Routine</p>
          <div className="space-y-3">
            {advice.night_routine?.map((step: string, i: number) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">{i+1}</div>
                <p className="text-sm text-slate-300">{step}</p>
              </div>
            )) || <p className="text-sm text-slate-500 italic">No routine generated yet.</p>}
          </div>
        </div>

        {/* AI Diet Plan */}
        <div className="glass-card p-5 border-l-4 border-green-500">
          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">AI Diet Plan (Indian)</p>
          <div className="space-y-3">
            {advice.diet?.map((item: string, i: number) => (
              <div key={i} className="flex gap-3 items-center">
                <Zap size={14} className="text-green-500" />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            )) || <p className="text-sm text-slate-500 italic">Perform a scan to get your diet plan.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
