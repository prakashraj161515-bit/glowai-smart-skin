"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraScanner from "@/components/CameraScanner";
import { Bell, Upload, Camera, Sparkles, ChevronRight, RefreshCcw, Download, ArrowLeft, Lock } from "lucide-react";

type HistoryEntry = { date: string; score: number; acne: number; oil: number; pigmentation: number; };

export default function Home() {
  const [view, setView] = useState<"home"|"scanner"|"results"|"history">("home");
  const [data, setData] = useState<any>(null);
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"male"|"female">("male");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const h = localStorage.getItem("glowai_history");
    if (h) setHistory(JSON.parse(h));
  }, []);

  async function handleResult(res: any) {
    if (res.error) { alert(res.error); setView("home"); return; }
    setData(res);
    setView("results");
    setLoading(true);
    const entry: HistoryEntry = {
      date: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      score: res.score, acne: res.acne, oil: res.oil, pigmentation: res.pigmentation
    };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("glowai_history", JSON.stringify(updated));
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(res) });
      const j = await r.json();
      setAi(j.text);
    } catch { setAi("⚠️ Could not generate AI report."); }
    finally { setLoading(false); }
  }

  const skinLabel = (v: number) => v > 65 ? "High" : v > 40 ? "Moderate" : "Normal";

  return (
    <div className="min-h-screen bg-[#F4F6FF] font-outfit pb-28">

      {/* Header */}
      <header className="px-5 pt-10 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-[22px] font-black">Glow<span className="text-purple-600">AI</span></h1>
          <p className="text-[10px] text-slate-400 font-semibold">Smart Skin, Better You</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 relative border border-slate-100">
          <Bell size={18}/>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"/>
        </button>
      </header>

      <AnimatePresence mode="wait">

        {/* HOME */}
        {view === "home" && (
          <motion.div key="home" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} className="px-5 space-y-5">

            {/* Hero */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-[26px] font-black text-slate-900 leading-tight">Hello, Glow! 👋</h2>
                <p className="text-sm text-slate-400 mt-1">Let&apos;s check your skin health today 🤍</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={()=>setGender("male")} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 border transition-all ${gender==="male"?"bg-white text-slate-800 border-slate-200 shadow":"bg-transparent text-slate-400 border-transparent"}`}>
                    <span className="text-blue-500">♂</span> Male
                  </button>
                  <button onClick={()=>setGender("female")} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 border transition-all ${gender==="female"?"bg-white text-slate-800 border-slate-200 shadow":"bg-transparent text-slate-400 border-transparent"}`}>
                    <span className="text-pink-500">♀</span> Female
                  </button>
                </div>
              </div>
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden ml-3 flex-shrink-0">
                <img
                  src={gender==="male" ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" : "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop"}
                  alt="person" className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Upload Box */}
            <div className="bg-white rounded-[24px] border border-[#EEF0FF] shadow-sm p-5">
              <p className="text-[14px] font-black text-slate-900 text-center">Upload Your Photo</p>
              <p className="text-[11px] text-slate-400 text-center mb-4">Get AI-powered skin analysis in seconds</p>
              <div className="border-2 border-dashed border-purple-200 rounded-[18px] bg-gradient-to-br from-[#FAF7FF] to-[#FFF0F9] p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-purple-400 transition-all" onClick={()=>setView("scanner")}>
                <div className="w-16 h-16 rounded-[18px] bg-purple-100 flex items-center justify-center animate-float">
                  <Upload size={28} className="text-purple-600"/>
                </div>
                <p className="text-xs text-slate-400">Drag &amp; drop your image here</p>
                <p className="text-xs text-slate-300">or</p>
                <button className="flex items-center gap-2 text-purple-600 font-bold text-sm border border-purple-200 bg-white px-4 py-2 rounded-xl shadow-sm">
                  <Camera size={16}/> Choose Image
                </button>
              </div>
              <button onClick={()=>setView("scanner")} className="mt-4 w-full h-14 bg-primary-gradient rounded-2xl text-white font-black text-[16px] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                Analyze My Skin ✨
              </button>
            </div>

            {/* Why GlowAI */}
            <div>
              <p className="text-[15px] font-black text-slate-900 mb-3">Why GlowAI?</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {label:"AI Powered",sub:"Advanced AI",icon:"🧠",bg:"bg-blue-50"},
                  {label:"Accurate",sub:"Precise Results",icon:"🎯",bg:"bg-cyan-50"},
                  {label:"Fast",sub:"In Seconds",icon:"⚡",bg:"bg-orange-50"},
                  {label:"Private",sub:"Data Secure",icon:"🔒",bg:"bg-purple-50"},
                ].map((f,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-[#EEF0FF] p-2.5 flex flex-col items-center text-center shadow-sm">
                    <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center text-lg mb-1.5`}>{f.icon}</div>
                    <p className="text-[9px] font-black leading-tight">{f.label}</p>
                    <p className="text-[7px] text-slate-400 font-semibold mt-0.5">{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Know Your Skin Banner */}
            <div className="bg-primary-gradient rounded-[24px] p-5 flex items-center justify-between overflow-hidden relative">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl"/>
              <div className="z-10">
                <p className="text-white font-black text-[16px] leading-snug">Know Your<br/>Skin Better</p>
                <p className="text-white/70 text-[10px] mt-1 mb-3 max-w-[150px]">Understand your unique skin and get personalized recommendations.</p>
                <button className="bg-white text-purple-600 font-black text-[10px] px-4 py-2 rounded-xl shadow">Learn More</button>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl z-10">🔬</div>
            </div>

            {/* How It Works */}
            <div className="pb-4">
              <p className="text-[15px] font-black text-slate-900 mb-3">How It Works?</p>
              <div className="flex items-start justify-between">
                {[
                  {n:"1",label:"Upload Photo",sub:"Take clear face photo",icon:"📷"},
                  {n:"2",label:"AI Analyzes",sub:"Our AI analyzes deeply",icon:"🤖"},
                  {n:"3",label:"Get Results",sub:"See scores & tips",icon:"📊"}
                ].map((s,i)=>(
                  <div key={i} className="flex-1 flex flex-col items-center text-center px-1 relative">
                    {i<2 && <div className="absolute top-7 right-0 text-slate-200 font-bold text-lg">→</div>}
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl mb-2 relative">
                      {s.icon}
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-purple-600 rounded-full text-white text-[9px] font-black flex items-center justify-center">{s.n}</div>
                    </div>
                    <p className="text-[10px] font-black text-slate-800">{s.label}</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SCANNER */}
        {view === "scanner" && (
          <motion.div key="scanner" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="px-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black">Position Your Face</h2>
              <button onClick={()=>setView("home")} className="text-slate-400 text-sm font-bold bg-white px-4 py-2 rounded-xl shadow border border-slate-100">Cancel</button>
            </div>
            <CameraScanner onResult={handleResult}/>
          </motion.div>
        )}

        {/* RESULTS */}
        {view === "results" && data && (
          <motion.div key="results" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="px-5 space-y-4">

            {/* Top Bar */}
            <div className="flex justify-between items-center pt-2">
              <button onClick={()=>setView("home")} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 border border-slate-100">
                <ArrowLeft size={18}/>
              </button>
              <h2 className="text-[17px] font-black text-slate-900">Your Skin Analysis</h2>
              <button className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 border border-slate-100">
                <Download size={18}/>
              </button>
            </div>

            {/* Score Card */}
            <div className="bg-white rounded-[24px] border border-[#EEF0FF] shadow-sm p-5">
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <defs>
                      <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7C3AED"/>
                        <stop offset="100%" stopColor="#EC4899"/>
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#EEF0FF" strokeWidth="8"/>
                    <motion.circle cx="50" cy="50" r="40" fill="none" stroke="url(#rg)" strokeWidth="8" strokeLinecap="round"
                      initial={{strokeDasharray:"0 251"}}
                      animate={{strokeDasharray:`${(data.score/100)*251} 251`}}
                      transition={{duration:1.5,ease:"easeOut"}}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[9px] text-slate-400 font-semibold">Overall</p>
                    <p className="text-[24px] font-black text-slate-900 leading-none">{data.score}%</p>
                    <p className="text-[11px] text-green-500 font-bold">Good 😊</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-black text-purple-600 mb-1">Great job!</p>
                  <p className="text-[12px] text-slate-500 leading-relaxed">Your skin is in good condition. Keep following a good skincare routine.</p>
                  <button className="mt-3 flex items-center gap-1 text-[11px] font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                    💜 Keep it up!
                  </button>
                </div>
              </div>
            </div>

            {/* Skin Scores */}
            <div className="bg-white rounded-[24px] border border-[#EEF0FF] shadow-sm p-5">
              <p className="text-[15px] font-black text-slate-900 mb-3">Skin Scores</p>
              <div className="space-y-3">
                {[
                  {label:"Acne",val:data.acne,icon:"😫",color:"#F87171"},
                  {label:"Oiliness",val:data.oil,icon:"💧",color:"#60A5FA"},
                  {label:"Pigmentation",val:data.pigmentation,icon:"☀️",color:"#FB923C"},
                  {label:"Glow",val:80,icon:"✨",color:"#A78BFA"},
                  {label:"Texture",val:65,icon:"🌿",color:"#34D399"},
                ].map((m,i)=>(
                  <motion.div key={m.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-base flex-shrink-0">{m.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <p className="text-[12px] font-bold text-slate-800">{m.label}</p>
                        <p className="text-[12px] font-black" style={{color:m.color}}>{m.val}%</p>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${m.val}%`}} transition={{duration:1,delay:i*0.1}} className="h-full rounded-full" style={{background:m.color}}/>
                      </div>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 w-14 text-right">{skinLabel(m.val)}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-[24px] border border-[#EEF0FF] shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[15px] font-black text-slate-900">Recommendations</p>
                <button className="text-[11px] font-bold text-purple-600">View All</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[{icon:"💧",label:"Stay Hydrated"},{icon:"🧴",label:"Mild Cleanser"},{icon:"☀️",label:"Wear Sunscreen"},{icon:"🌙",label:"Enough Sleep"}].map((r,i)=>(
                  <div key={i} className="bg-[#F8F6FF] rounded-2xl flex flex-col items-center justify-center p-3 gap-1 text-center">
                    <span className="text-xl">{r.icon}</span>
                    <p className="text-[9px] font-bold text-slate-700 leading-tight">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skin Type */}
            <div className="bg-white rounded-[24px] border border-[#EEF0FF] shadow-sm p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl flex-shrink-0">👤</div>
              <div>
                <p className="text-[13px] font-black text-slate-900">🔬 Combination Skin</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Your skin is slightly oily in T-zone and normal in cheeks.</p>
                <button className="text-[11px] font-bold text-purple-600 mt-1">Learn More</button>
              </div>
            </div>

            {/* AI Report */}
            {(loading || ai) && (
              <div className="bg-white rounded-[24px] border border-[#EEF0FF] shadow-sm p-5">
                <p className="text-[15px] font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600"/> AI Recommendations
                </p>
                {loading ? (
                  <div className="flex items-center gap-3 py-6 justify-center">
                    <RefreshCcw size={18} className="text-purple-600 animate-spin"/>
                    <p className="text-[12px] text-slate-400 animate-pulse">Generating expert insights...</p>
                  </div>
                ) : (
                  <div className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{ai}</div>
                )}
              </div>
            )}

            {/* History Section */}
            <div className="bg-white rounded-[24px] border border-[#EEF0FF] shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[15px] font-black text-slate-900">🕐 History</p>
                <button onClick={()=>setView("history")} className="text-[11px] font-bold text-purple-600">View All</button>
              </div>
              {history.length === 0 ? (
                <p className="text-[12px] text-slate-400 text-center py-3">No history yet</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0,3).map((h,i)=>(
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#F8F6FF] rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-base flex-shrink-0">🧴</div>
                      <div className="flex-1">
                        <p className="text-[12px] font-bold text-slate-800">{h.date}</p>
                        <p className="text-[10px] text-slate-400">Skin Score</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center">
                          <p className="text-[11px] font-black text-white">{h.score}%</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300"/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upgrade Banner */}
            <div className="bg-primary-gradient rounded-[24px] p-5 flex items-center justify-between relative overflow-hidden mb-4">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"/>
              <div className="z-10 flex-1">
                <p className="text-white font-black text-[15px]">Unlock Advanced Insights</p>
                <p className="text-white/70 text-[10px] mt-1 mb-3">Get detailed reports, product recommendations and more.</p>
                <button className="bg-white text-purple-600 font-black text-[11px] px-4 py-2 rounded-xl">Upgrade Now</button>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center z-10 ml-3">
                <Lock size={28} className="text-white"/>
              </div>
            </div>
          </motion.div>
        )}

        {/* HISTORY PAGE */}
        {view === "history" && (
          <motion.div key="history" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="px-5">
            <div className="flex items-center gap-3 mb-5 pt-2">
              <button onClick={()=>setView(data ? "results" : "home")} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 border border-slate-100">
                <ArrowLeft size={18}/>
              </button>
              <h2 className="text-[18px] font-black text-slate-900">Scan History</h2>
            </div>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="text-6xl">📭</div>
                <p className="text-[15px] font-bold text-slate-400">No scans yet</p>
                <button onClick={()=>setView("scanner")} className="bg-primary-gradient text-white font-black px-6 py-3 rounded-2xl text-sm">
                  Start Your First Scan ✨
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h,i)=>(
                  <div key={i} className="bg-white rounded-[20px] border border-[#EEF0FF] shadow-sm p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-xl flex-shrink-0">🧴</div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-slate-800">{h.date}</p>
                      <div className="flex gap-3 mt-1">
                        <p className="text-[10px] text-slate-400">Acne <span className="text-slate-600 font-bold">{h.acne}%</span></p>
                        <p className="text-[10px] text-slate-400">Oil <span className="text-slate-600 font-bold">{h.oil}%</span></p>
                        <p className="text-[10px] text-slate-400">Pigment <span className="text-slate-600 font-bold">{h.pigmentation}%</span></p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0">
                      <p className="text-[12px] font-black text-white">{h.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
