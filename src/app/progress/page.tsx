"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Award, Zap } from "lucide-react";

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
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-outfit">Your Progress</h1>
        <p className="text-slate-400 text-sm">Last 7 days analysis</p>
      </header>

      {/* Main Score Card */}
      <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-transparent">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-slate-400 font-medium">Current Skin Score</p>
            <h2 className="text-5xl font-bold text-white mt-1">85<span className="text-lg text-slate-500 font-normal">/100</span></h2>
            <div className="flex items-center gap-1 text-green-400 text-sm mt-2 font-bold">
              <TrendingUp size={16} /> +12% since last week
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Award size={32} className="text-purple-400" />
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
            { label: "Acne", level: "Low", status: "improved", color: "text-green-400" },
            { label: "Dark Spots", level: "Medium", status: "stable", color: "text-yellow-400" },
            { label: "Hydration", level: "Good", status: "improved", color: "text-blue-400" },
            { label: "Oiliness", level: "High", status: "needs attention", color: "text-red-400" },
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

      {/* Recommended for You */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Recommended for You</h3>
        <div className="glass-card p-4 bg-purple-600/10 border-purple-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <p className="font-bold">Personalized Diet Plan</p>
              <p className="text-xs text-slate-400 mt-1">Based on your oiliness score, try adding more hydrating foods like cucumbers and oranges to your diet.</p>
              <button className="text-xs text-purple-400 font-bold mt-2 flex items-center gap-1">View Full Diet <ChevronRight size={12} /></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
