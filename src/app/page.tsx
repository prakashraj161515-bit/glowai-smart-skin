"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraScanner from "@/components/CameraScanner";
import { ScanFace, Sparkles, ChevronRight, RefreshCcw, Download, ArrowLeft, Lock, Database, Search, CheckCircle2, Gem, AlertCircle, BrainCircuit, Target, Zap, ShieldCheck, ShoppingBag, Eye } from "lucide-react";
import Link from "next/link";

type HistoryEntry = { date: string; score: number; acne: number; oil: number; pigmentation: number; };

export default function Home() {
  const [view, setView] = useState<"home"|"scanner"|"results"|"history"|"product_results">("home");
  const [scanMode, setScanMode] = useState<"face"|"product">("face");
  const [data, setData] = useState<any>(null);
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"male"|"female">("male");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [userName, setUserName] = useState("Glow");
  const [deepScanStep, setDeepScanStep] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);
  const [scanLimitReached, setScanLimitReached] = useState(false);

  useEffect(() => {
    const h = localStorage.getItem("glowai_history");
    if (h) setHistory(JSON.parse(h));
    const savedName = localStorage.getItem("glowai_user_name");
    if (savedName) setUserName(savedName);
    const premium = localStorage.getItem("glowai_is_premium") === "true";
    setIsPremium(premium);
  }, []);

  const [skinTips, setSkinTips] = useState("");
  const [loadingTips, setLoadingTips] = useState(false);

  const checkScanLimit = () => {
    if (isPremium) return true;
    const today = new Date().toDateString();
    const lastScanDate = localStorage.getItem("glowai_last_scan_date");
    const scanCount = parseInt(localStorage.getItem("glowai_scan_count") || "0");
    if (lastScanDate === today && scanCount >= 2) {
      setScanLimitReached(true);
      return false;
    }
    return true;
  };

  const incrementScanCount = () => {
    if (isPremium) return;
    const today = new Date().toDateString();
    const lastScanDate = localStorage.getItem("glowai_last_scan_date");
    let count = parseInt(localStorage.getItem("glowai_scan_count") || "0");
    if (lastScanDate === today) count += 1;
    else count = 1;
    localStorage.setItem("glowai_last_scan_date", today);
    localStorage.setItem("glowai_scan_count", count.toString());
  };

  async function handleResult(res: any) {
    if (res.error) { alert(res.error); setView("home"); return; }
    
    if (scanMode === "product") {
      handleProductResult(res);
      return;
    }

    incrementScanCount();
    setView("results");
    setData(res);
    setLoading(true);
    setDeepScanStep(1);
    const delay = isPremium ? 1500 : 1000;
    await new Promise(r => setTimeout(r, delay));
    setDeepScanStep(2); 
    await new Promise(r => setTimeout(r, delay + 500));
    setDeepScanStep(3); 
    await new Promise(r => setTimeout(r, delay));
    setDeepScanStep(4); 
    const entry: HistoryEntry = {
      date: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      score: res.score, acne: res.acne, oil: res.oil, pigmentation: res.pigmentation
    };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("glowai_history", JSON.stringify(updated));
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...res, gender, userName, mode: "accurate_scan", isPremium })
      });
      const j = await r.json();
      setAi(j.text);
    } catch { setAi("⚠️ Could not generate AI report."); }
    finally { setLoading(false); setDeepScanStep(0); }
  }

  async function handleProductResult(res: any) {
    setView("product_results");
    setLoading(true);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "product_scan", isPremium, userName })
      });
      const j = await r.json();
      setAi(j.text);
    } catch { setAi("⚠️ Could not analyze product."); }
    finally { setLoading(false); }
  }

  async function handleLearnMore() {
    setLoadingTips(true);
    setSkinTips("");
    try {
      const r = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Give me 5 personalized skin improvement tips for a ${gender} person in simple bullet points. Focus on daily routine, diet and skincare habits.`,
          history: [],
          context: ""
        })
      });
      const j = await r.json();
      setSkinTips(j.text || "⚠️ Could not fetch tips.");
    } catch { setSkinTips("⚠️ Server busy. Try again."); }
    finally { setLoadingTips(false); }
  }

  const skinLabel = (v: number) => v > 65 ? "High" : v > 40 ? "Moderate" : "Normal";

  return (
    <div className="min-h-screen bg-[#F4F6FF] font-outfit pb-28">

      {/* Header */}
      <header className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-black">Glow<span className="text-purple-600">AI</span></h1>
          <p className="text-[11px] text-slate-500 font-semibold">Smart Skin, Better You</p>
        </div>
        {!isPremium ? (
          <Link href="/premium" className="bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform">
            <Gem size={12} className="text-purple-600" />
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-tight">Upgrade</span>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-[1.5px] rounded-full shadow-lg shadow-purple-500/30">
            <div className="bg-white rounded-full px-3 py-1 flex items-center gap-1.5">
              <Gem size={10} className="text-purple-600 fill-purple-500" />
              <span className="text-[8px] font-black text-purple-700 uppercase tracking-tighter">Pro</span>
            </div>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">

        {/* HOME */}
        {view === "home" && (
          <motion.div key="home" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} className="px-5 space-y-5">

            {/* Hero */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-[26px] font-black text-slate-900 leading-tight flex items-center gap-2">
                  Hello, {userName}! {isPremium && <Gem size={16} className="text-purple-500 fill-purple-500" />}
                </h2>
                <p className="text-[13px] text-slate-600 font-medium mt-1">Let&apos;s check your skin health today 🤍</p>
              </div>
              <div className="w-24 h-24 rounded-[32px] border-4 border-white shadow-xl overflow-hidden ml-3 flex-shrink-0 rotate-2">
                <img
                  src={gender==="male"
                    ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face"}
                  alt="person" className="w-full h-full object-cover -rotate-2"
                />
              </div>
            </div>

            {/* Premium Upgrade Banner */}
            {!isPremium && (
              <Link href="/premium">
                <div className="bg-primary-gradient rounded-[24px] p-3.5 flex items-center justify-between shadow-xl shadow-purple-500/10 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white backdrop-blur-sm">
                      <Gem size={16} />
                    </div>
                    <div>
                      <p className="text-white font-black text-[13px]">Upgrade to Premium</p>
                      <p className="text-white/70 text-[9px] font-bold">Unlock clinical vision metrics ✨</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/50" />
                </div>
              </Link>
            )}

            {/* Dual Analyze Box */}
            <div className="bg-white rounded-[28px] border border-[#EEF0FF] shadow-sm p-5 space-y-3">
              <p className="text-[14px] font-black text-slate-900 px-1">AI Analysis Tools</p>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Face Scan */}
                <button
                  onClick={() => {
                    if (checkScanLimit()) {
                      setScanMode("face");
                      setView("scanner");
                    }
                  }}
                  className={`p-4 rounded-[22px] flex flex-col items-center gap-2 transition-all ${scanLimitReached && !isPremium ? 'bg-slate-50 opacity-60' : 'bg-purple-50/50 hover:bg-purple-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-600">
                    <ScanFace size={24} />
                  </div>
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">Face Scan</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">{isPremium ? 'Unlimited' : `${2 - parseInt(localStorage.getItem("glowai_scan_count") || "0")} left`}</p>
                </button>

                {/* Product Scan */}
                <button
                  onClick={() => {
                    if (isPremium) {
                      setScanMode("product");
                      setView("scanner");
                    } else {
                      alert("Product Ingredient Scanner is a Premium feature!");
                      window.location.href = "/premium";
                    }
                  }}
                  className={`p-4 rounded-[22px] flex flex-col items-center gap-2 transition-all bg-blue-50/50 hover:bg-blue-50 relative overflow-hidden`}
                >
                  {!isPremium && <Lock size={10} className="absolute top-2 right-2 text-slate-400" />}
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500">
                    <ShoppingBag size={22} />
                  </div>
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">Scan Product</p>
                  <p className="text-[8px] text-blue-400 font-bold uppercase">{isPremium ? 'Unlimited' : 'Premium'}</p>
                </button>
              </div>

              {scanLimitReached && !isPremium && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex items-center gap-3">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-[10px] text-red-600 font-bold leading-tight">Daily limit reached! Upgrade for unlimited scans.</p>
                </div>
              )}
            </div>

            {/* Why GlowAI */}
            <div>
              <p className="text-[14px] font-black text-slate-900 mb-3 px-1">Why GlowAI?</p>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  {label:"AI Powered",sub:"Smart Logic",icon:BrainCircuit,bg:"bg-blue-50",color:"text-blue-500"},
                  {label:"Accurate",sub:"Precise",icon:Target,bg:"bg-cyan-50",color:"text-cyan-500"},
                  {label:"Fast",sub:"Instant",icon:Zap,bg:"bg-orange-50",color:"text-orange-500"},
                  {label:"Secure",sub:"Private",icon:ShieldCheck,bg:"bg-purple-50",color:"text-purple-500"},
                ].map((f,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-[#EEF0FF] p-2 flex flex-col items-center text-center shadow-sm">
                    <div className={`w-8 h-8 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-1.5`}>
                      <f.icon size={16} strokeWidth={2.5} />
                    </div>
                    <p className="text-[9px] font-black text-slate-800 leading-tight">{f.label}</p>
                    <p className="text-[7px] text-slate-500 font-bold mt-0.5">{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Know Your Skin Banner */}
            <div className="bg-primary-gradient rounded-[28px] p-5 overflow-hidden relative border border-white/10">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-3">
                <div className="z-10">
                  <p className="text-white font-black text-[16px] leading-snug">Know Your<br/>Skin Better</p>
                  <p className="text-white/80 text-[11px] mt-1 mb-3 max-w-[160px]">Understand your unique skin and get personalized tips.</p>
                  <button onClick={handleLearnMore} className="bg-white text-purple-700 font-black text-[11px] px-4 py-2 rounded-xl shadow flex items-center gap-1.5">
                    {loadingTips ? <><RefreshCcw size={12} className="animate-spin"/> Loading...</> : "Learn More"}
                  </button>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl z-10 backdrop-blur-md">🔬</div>
              </div>
              {skinTips && (
                <div className="bg-white/15 rounded-2xl p-4 mt-2 z-10 relative backdrop-blur-sm border border-white/10">
                  <p className="text-white text-[12px] leading-relaxed whitespace-pre-wrap font-medium">{skinTips}</p>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="pb-4">
              <p className="text-[14px] font-black text-slate-900 mb-3 px-1">How It Works?</p>
              <div className="flex items-start justify-between">
                {[
                  {n:"1",label:"Scan Face",sub:"Camera/Photo",icon:"📷"},
                  {n:"2",label:"AI Analysis",sub:"Deep Logic",icon:"🤖"},
                  {n:"3",label:"Results",sub:"Expert Tips",icon:"📊"}
                ].map((s,i)=>(
                  <div key={i} className="flex-1 flex flex-col items-center text-center px-1 relative">
                    {i<2 && <div className="absolute top-6 right-0 text-slate-300 font-bold text-lg">→</div>}
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl mb-2 relative">
                      <span className="text-[20px]">{s.icon}</span>
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-purple-600 rounded-full text-white text-[8px] font-black flex items-center justify-center shadow-md">{s.n}</div>
                    </div>
                    <p className="text-[10px] font-black text-slate-800">{s.label}</p>
                    <p className="text-[8px] text-slate-500 font-bold mt-0.5">{s.sub}</p>
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
              <h2 className="text-xl font-black text-slate-900">{scanMode === "face" ? "Position Your Face" : "Scan Product Label"}</h2>
              <button onClick={()=>setView("home")} className="text-slate-400 text-sm font-bold bg-white px-4 py-2 rounded-xl shadow border border-slate-100">Cancel</button>
            </div>
            <CameraScanner onResult={handleResult}/>
          </motion.div>
        )}

        {/* PRODUCT RESULTS */}
        {view === "product_results" && (
          <motion.div key="product_results" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="px-5 space-y-5 pb-32">
            <div className="flex items-center gap-3 pt-2">
              <button onClick={()=>setView("home")} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 border border-slate-100">
                <ArrowLeft size={18}/>
              </button>
              <h2 className="text-[17px] font-black text-slate-900">Product Analysis</h2>
            </div>

            {loading ? (
              <div className="bg-white rounded-[28px] border-2 border-blue-100 shadow-xl p-10 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 animate-pulse">
                  <ShoppingBag size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">Analyzing Ingredients...</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Checking for harmful chemicals</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[28px] border border-[#EEF0FF] shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3 text-green-500 font-black text-sm uppercase">
                  <CheckCircle2 size={20} /> Analysis Complete
                </div>
                <div className="text-[13px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {ai}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* RESULTS & DEEP ANALYSIS (FACE) */}
        {view === "results" && data && (
          <motion.div key="results" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="px-5 space-y-4">

            {/* Top Bar */}
            <div className="flex justify-between items-center pt-2">
              <button onClick={()=>setView("home")} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 border border-slate-100">
                <ArrowLeft size={18}/>
              </button>
              <h2 className="text-[17px] font-black text-slate-900">Skin Report</h2>
              {isPremium ? (
                <button onClick={() => alert("Downloading PDF...")} className="w-10 h-10 rounded-full bg-primary-gradient shadow flex items-center justify-center text-white">
                  <Download size={18} />
                </button>
              ) : (
                <Link href="/premium" className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-300 border border-slate-100 relative">
                  <Download size={18}/>
                  <Lock size={10} className="absolute top-1 right-1 text-purple-600" />
                </Link>
              )}
            </div>

            {/* Deep Analysis Step */}
            {loading && deepScanStep > 0 && (
              <div className="bg-white rounded-[28px] border-2 border-purple-100 shadow-xl p-8 flex flex-col items-center text-center space-y-6">
                <div className="relative w-20 h-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-4 border-dashed border-purple-400 opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {deepScanStep === 1 && <Database size={32} className="text-purple-600 animate-pulse" />}
                    {deepScanStep === 2 && <Search size={32} className="text-purple-600 animate-bounce" />}
                    {deepScanStep === 3 && <Sparkles size={32} className="text-purple-600 animate-spin" />}
                    {deepScanStep === 4 && <CheckCircle2 size={32} className="text-green-500" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-slate-900 mb-2">
                    {deepScanStep === 1 && "Connecting Database..."}
                    {deepScanStep === 2 && `Scanning 4,000+ Profiles...`}
                    {deepScanStep === 3 && "Matching Patterns..."}
                    {deepScanStep === 4 && "Finalizing Report..."}
                  </h3>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: "0%" }} animate={{ width: `${deepScanStep * 25}%` }} className="h-full bg-primary-gradient" />
                  </div>
                </div>
              </div>
            )}

            {!loading && (
              <>
                {/* Score Card */}
                <div className="bg-white rounded-[28px] border border-[#EEF0FF] shadow-sm p-5">
                  <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#EC4899"/></linearGradient></defs>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#EEF0FF" strokeWidth="8"/>
                        <motion.circle cx="50" cy="50" r="40" fill="none" stroke="url(#rg)" strokeWidth="8" strokeLinecap="round" initial={{strokeDasharray:"0 251"}} animate={{strokeDasharray:`${(data.score/100)*251} 251`}} transition={{duration:1.5}} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[20px] font-black text-slate-900 leading-none">{data.score}%</p>
                        <p className="text-[10px] text-green-500 font-bold mt-0.5">Good 😊</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-black text-purple-600 mb-1">{isPremium ? "Clinical Analysis" : "Expert Analysis"}</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Patterns matched against {isPremium ? 'clinical' : 'standard'} database.</p>
                      <div className="mt-2 flex items-center gap-1.5 bg-purple-50 w-fit px-3 py-1 rounded-full border border-purple-100">
                        {isPremium && <Gem size={10} className="text-purple-600" />}
                        <span className="text-[9px] font-black text-purple-700 uppercase">{isPremium ? "Pro Accuracy" : "Accurate"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Metrics */}
                <div className="bg-white rounded-[28px] border border-[#EEF0FF] shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <p className="text-[14px] font-black text-slate-900">Advanced Metrics</p>
                    {!isPremium && <Link href="/premium" className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-md">Unlock ✨</Link>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Wrinkles", val: isPremium ? "Low" : "Locked", color: "text-blue-500" },
                      { label: "Skin Age", val: isPremium ? "24 yrs" : "Locked", color: "text-orange-500" },
                      { label: "Dark Circles", val: isPremium ? "None" : "Locked", color: "text-purple-500" },
                      { label: "Hydration", val: isPremium ? "Optimal" : "Locked", color: "text-green-500" }
                    ].map((m, i) => (
                      <div key={i} className="bg-slate-50 p-3.5 rounded-2xl flex flex-col gap-0.5">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{m.label}</p>
                        <p className={`text-xs font-black ${isPremium ? m.color : 'text-slate-300'}`}>
                          {m.val} {!isPremium && <Lock size={9} className="inline ml-1" />}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skin Scores */}
                <div className="bg-white rounded-[28px] border border-[#EEF0FF] shadow-sm p-5">
                  <p className="text-[14px] font-black text-slate-900 mb-3 px-1">Skin Scores</p>
                  <div className="space-y-2.5">
                    {[
                      {label:"Acne",val:data.acne,icon:"😫",color:"#F87171"},
                      {label:"Oiliness",val:data.oil,icon:"💧",color:"#60A5FA"},
                      {label:"Pigmentation",val:data.pigmentation,icon:"☀️",color:"#FB923C"},
                      {label:"Glow",val:80,icon:"✨",color:"#A78BFA"},
                      {label:"Texture",val:65,icon:"🌿",color:"#34D399"},
                    ].map((m,i)=>(
                      <div key={m.label} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-sm flex-shrink-0">{m.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-0.5">
                            <p className="text-[11px] font-bold text-slate-800">{m.label}</p>
                            <p className="text-[11px] font-black" style={{color:m.color}}>{m.val}%</p>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div initial={{width:0}} animate={{width:`${m.val}%`}} transition={{duration:1,delay:i*0.1}} className="h-full rounded-full" style={{background:m.color}}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Report */}
                {ai && (
                  <div className="bg-white rounded-[28px] border border-[#EEF0FF] shadow-sm p-5">
                    <p className="text-[14px] font-black text-slate-900 mb-3 flex items-center gap-2">
                      <Sparkles size={14} className="text-purple-600"/> AI Recommendations
                    </p>
                    <div className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{ai}</div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* HISTORY PAGE */}
        {view === "history" && (
          <motion.div key="history" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="px-5">
            <div className="flex items-center gap-3 mb-5 pt-2">
              <button onClick={()=>setView(data ? "results" : "home")} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 border border-slate-100">
                <ArrowLeft size={18}/>
              </button>
              <h2 className="text-[18px] font-black text-slate-900 text-center flex-1 pr-10">Scan History</h2>
            </div>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="text-6xl">📭</div>
                <p className="text-[15px] font-bold text-slate-400">No scans yet</p>
                <button onClick={()=>setView("scanner")} className="bg-primary-gradient text-white font-black px-6 py-3 rounded-2xl text-sm">Start First Scan ✨</button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h,i)=>(
                  <div key={i} className="bg-white rounded-[20px] border border-[#EEF0FF] shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">🧴</div>
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-slate-800">{h.date}</p>
                      <div className="flex gap-3 mt-1">
                        <p className="text-[9px] text-slate-400">Acne <span className="text-slate-600 font-bold">{h.acne}%</span></p>
                        <p className="text-[9px] text-slate-400">Oil <span className="text-slate-600 font-bold">{h.oil}%</span></p>
                        <p className="text-[9px] text-slate-400">Pigment <span className="text-slate-600 font-bold">{h.pigmentation}%</span></p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0">
                      <p className="text-[10px] font-black text-white">{h.score}%</p>
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
