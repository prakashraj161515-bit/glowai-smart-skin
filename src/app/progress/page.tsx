"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Award, Zap, Sparkles, Bot } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const [scanData, setScanData] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    try {
      if (status !== "authenticated") return;
      const saved = localStorage.getItem('latestScan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setScanData(parsed);
        }
      }
      setIsPremium(localStorage.getItem("velmora_is_premium") === "true");
    } catch (e) {
      console.error("Failed to parse scan data", e);
    }
  }, [status]);

  const metrics = scanData?.metrics || { score: 0, redness: 0, oiliness: 0, pores: 0 };
  const advice = scanData?.advice || {
    skin_analysis: "",
    diet: [],
    morning_routine: [],
    night_routine: [],
    lifestyle_tips: [],
    improvement_forecast: ""
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDF5F2] px-6 pt-12 pb-32 font-outfit print:bg-white print:p-0 print:pb-0">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: #0f172a !important;
          }
          header, .no-print, button {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto !important;
            padding: 0 !important;
          }
          .bg-white {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-bottom: 2rem !important;
          }
          .rounded-\[40px\], .rounded-\[32px\] {
            border-radius: 0 !important;
          }
          .border-l-\[6px\] {
            border-left-width: 4px !important;
          }
        }
      `}</style>

      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Your AI Report</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Real-time analysis results</p>
          </div>
        </div>

        {isPremium && (
          <button 
            onClick={handleDownloadPDF}
            className="h-10 px-5 bg-primary-gradient text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
          >
            Download PDF Report
          </button>
        )}
      </header>

      {/* Main Score Card */}
      <div className="bg-white rounded-[40px] p-8 border border-[#F3EAE8] shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 no-print" />
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Skin Score</p>
            <h2 className="text-5xl font-black text-slate-900 mt-2">
              {metrics.score}<span className="text-lg text-slate-300 font-bold">/100</span>
            </h2>
            <div className="text-purple-500 text-[10px] mt-4 font-black uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full inline-block">
              {advice.improvement_forecast || "Scanning for updates..."}
            </div>
          </div>
          <div className="w-16 h-16 rounded-[24px] bg-primary-gradient flex items-center justify-center shadow-lg shadow-orange-500/20 no-print">
            <Sparkles size={32} className="text-white fill-white" />
          </div>
        </div>

        {/* Mini chart */}
        <div className="h-32 w-full mt-4 no-print">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F88E7D" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F88E7D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="score" stroke="#F88E7D" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detection Results */}
      <section className="space-y-4 mb-8">
        <h3 className="text-[15px] font-black text-slate-900 px-1">Latest Detections</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: "Acne", level: `${metrics.redness}%`, status: metrics.redness > 20 ? "Active" : "Clear", color: metrics.redness > 20 ? "text-red-500" : "text-emerald-500", bg: metrics.redness > 20 ? "bg-red-500" : "bg-emerald-500" },
            { label: "Oiliness", level: `${metrics.oiliness}%`, status: metrics.oiliness > 50 ? "High" : "Balanced", color: metrics.oiliness > 50 ? "text-orange-500" : "text-blue-500", bg: metrics.oiliness > 50 ? "bg-orange-500" : "bg-blue-500" },
            { label: "Pores", level: `${metrics.pores}%`, status: "Visible", color: "text-purple-500", bg: "bg-purple-500" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-[32px] p-5 flex items-center justify-between border border-[#F3EAE8] shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
                <div>
                  <p className="font-bold text-[14px] text-slate-800">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.status}</p>
                </div>
              </div>
              <div className={`text-lg font-black ${item.color}`}>
                {item.level}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Observations */}
      <section className="space-y-4 mb-8">
        <h3 className="text-[15px] font-black text-[#F88E7D] flex items-center gap-2 px-1">
          <Bot size={20} /> AI Observation
        </h3>
        <div className="bg-white rounded-[32px] p-6 text-[14px] leading-relaxed text-slate-600 border border-[#F3EAE8] shadow-sm italic">
          {advice.skin_analysis || "Our AI is analyzing your skin texture. Perform a scan to see your personalized report here."}
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="space-y-6">
        <h3 className="text-[15px] font-black text-slate-900 px-1">Personalized Routine</h3>
        
        {/* Morning Routine */}
        <div className="bg-white rounded-[40px] p-8 border-l-[6px] border-blue-400 shadow-sm">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6">Morning Routine</p>
          <div className="space-y-4">
            {advice.morning_routine?.map((step: string, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">{i+1}</div>
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{step}</p>
              </div>
            )) || <p className="text-sm text-slate-500 italic">No routine generated yet.</p>}
          </div>
        </div>

        {/* Night Routine */}
        <div className="bg-white rounded-[40px] p-8 border-l-[6px] border-[#F88E7D] shadow-sm">
          <p className="text-[10px] font-black text-[#F88E7D] uppercase tracking-[0.2em] mb-6">Night Routine</p>
          <div className="space-y-4">
            {advice.night_routine?.map((step: string, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-lg bg-[#FFEDE8] text-[#F88E7D] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-[#FFEDE8]">{i+1}</div>
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{step}</p>
              </div>
            )) || <p className="text-sm text-slate-500 italic">No routine generated yet.</p>}
          </div>
        </div>

        {/* AI Diet Plan */}
        <div className="bg-white rounded-[40px] p-8 border-l-[6px] border-emerald-400 shadow-sm">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6">AI Diet Plan</p>
          <div className="space-y-4">
            {advice.diet?.map((item: string, i: number) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0"><Zap size={14} className="fill-emerald-500" /></div>
                <p className="text-[13px] text-slate-600 font-medium">{item}</p>
              </div>
            )) || <p className="text-sm text-slate-500 italic">Perform a scan to get your diet plan.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function ChevronLeft({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}
