"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraScanner from "@/components/CameraScanner";
import { ScanFace, Sparkles, ChevronRight, RefreshCcw, Download, ArrowLeft, Lock, Database, Search, CheckCircle2, Gem, AlertCircle, BrainCircuit, Target, Zap, ShieldCheck, ShoppingBag, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type HistoryEntry = { date: string; score: number; acne: number; oil: number; pigmentation: number; };

import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [view, setView] = useState<"home"|"scanner"|"results"|"history"|"product_results">("home");
  const [scanMode, setScanMode] = useState<"face"|"product">("face");
  const [data, setData] = useState<any>(null);
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"male"|"female">("female");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [userName, setUserName] = useState("Erica");
  const [userPic, setUserPic] = useState("");
  const [deepScanStep, setDeepScanStep] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);
  const [scanLimitReached, setScanLimitReached] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const h = localStorage.getItem("velmora_history");
    if (h) setHistory(JSON.parse(h));
    const savedName = localStorage.getItem("velmora_user_name");
    if (savedName) setUserName(savedName);
    const savedPic = localStorage.getItem("velmora_user_pic");
    if (savedPic) setUserPic(savedPic);
    const premium = localStorage.getItem("velmora_is_premium") === "true";
    setIsPremium(premium);
    const count = parseInt(localStorage.getItem("velmora_scan_count") || "0");
    setScanCount(count);
    const savedGender = localStorage.getItem("velmora_user_gender") as "male" | "female";
    if (savedGender) setGender(savedGender);
  }, [view]);

  // Dummy products
  const products = [
    { name: "Brightening Cream", price: "$24.00", image: "https://images.unsplash.com/photo-1556229167-279262113337?w=400&q=80" },
    { name: "Hydrating Serum", price: "$32.00", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80" },
    { name: "Cleansing Oil", price: "$18.00", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80" },
    { name: "Night Repair", price: "$45.00", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80" },
  ];

  async function handleResult(res: any) {
    if (res.error) { alert(res.error); setView("home"); return; }
    if (scanMode === "product") { handleProductResult(res); return; }
    setView("results");
    setData(res);
    setLoading(true);
    setDeepScanStep(1);
    await new Promise(r => setTimeout(r, 1000));
    setDeepScanStep(4); 
    await new Promise(r => setTimeout(r, 500));
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...res, gender, userName, mode: "accurate_scan", isPremium, image: res.image })
      });
      const j = await r.json();
      setAi(j.text);
      // Save analysis for Diet/Coach
      localStorage.setItem("velmora_analysis", JSON.stringify({
        ...res,
        score: res.score,
        acne: res.acne,
        oil: res.oil,
        pigmentation: res.pigmentation,
        gender: gender
      }));
    } catch { setAi("⚠️ Could not generate AI report."); }
    finally { setLoading(false); setDeepScanStep(0); }
  }

  return (
    <div className="min-h-screen bg-[#FDF5F2] font-outfit pb-32">

      <AnimatePresence mode="wait">

        {/* HOME */}
        {view === "home" && (
          <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="px-6 pt-12 space-y-8">
            
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-[28px] font-bold text-slate-800 leading-tight">Hi {userName},</h1>
                <p className="text-[13px] text-slate-400 font-medium mt-0.5">Transform Your Skin&apos;s Health</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Promo Banner */}
            <div className="relative bg-[#FFEDE8] rounded-[32px] p-8 overflow-hidden flex items-center justify-between group">
              <div className="z-10 max-w-[140px]">
                <p className="text-[10px] font-black text-[#F88E7D] uppercase tracking-widest mb-1.5">Find the right</p>
                <h2 className="text-[22px] font-bold text-slate-800 leading-tight italic">Cream for your Skin</h2>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center p-4">
                <img src="https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80" alt="Product" className="w-full h-full object-contain rotate-12 transition-transform group-hover:scale-110" />
              </div>
            </div>

            {/* AI Scan Button */}
            <button 
              onClick={() => (setScanMode("face"), setView("scanner"))}
              className="w-full bg-white border border-[#F3EAE8] rounded-[32px] p-5 flex items-center justify-between group active:scale-95 transition-transform shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FDF5F2] flex items-center justify-center text-[#F88E7D]">
                  <ScanFace size={28} />
                </div>
                <div className="text-left">
                  <span className="block text-[16px] font-bold text-slate-800">Scan your face</span>
                  <span className="block text-[11px] text-slate-400 font-medium italic">Instant AI Analysis</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-[#F88E7D] transition-colors" />
            </button>

            {/* Main Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/diet" className="bg-white border border-[#F3EAE8] rounded-[32px] p-5 flex flex-col gap-3 group active:scale-95 transition-transform shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Info size={24} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-800">Diet Plan</p>
                  <p className="text-[10px] text-slate-400 font-medium">Nutrition for skin</p>
                </div>
              </Link>
              <Link href="/coach" className="bg-white border border-[#F3EAE8] rounded-[32px] p-5 flex flex-col gap-3 group active:scale-95 transition-transform shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-800">AI Coach</p>
                  <p className="text-[10px] text-slate-400 font-medium">Expert advice</p>
                </div>
              </Link>
              <button 
                onClick={() => (setScanMode("product"), setView("scanner"))}
                className="col-span-2 bg-white border border-[#F3EAE8] rounded-[32px] p-6 flex items-center justify-between group active:scale-95 transition-transform shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-slate-800">Product Scanner</p>
                    <p className="text-[10px] text-slate-400 font-medium">Analyze product ingredients</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
              </button>
            </div>
          </motion.div>
        )}

        {/* SCANNER */}
        {view === "scanner" && (
          <motion.div key="scanner" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="px-5 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-black text-slate-900">{scanMode === "face" ? "Position Your Face" : "Scan Product Label"}</h2>
              <button onClick={()=>setView("home")} className="text-slate-400 text-sm font-bold bg-white px-4 py-2 rounded-xl shadow border border-slate-100">Cancel</button>
            </div>
            
            <CameraScanner onResult={handleResult} mode={scanMode}/>

            {scanMode === "product" && (
              <div className="bg-white rounded-[28px] border border-[#EEF0FF] shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 text-purple-600 font-black text-xs uppercase tracking-tight">
                  <Info size={16} strokeWidth={1.2} /> How to scan properly?
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-purple-100 shadow-inner flex-shrink-0">
                    <img src="/product_example.png" alt="Example" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">• Focus on the <span className="text-purple-600 font-black uppercase">Ingredients</span> list.</p>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">• Ensure bright lighting for clear text.</p>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">• Keep the bottle steady while clicking.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* PRODUCT RESULTS */}
        {view === "product_results" && (
          <motion.div key="product_results" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="px-5 space-y-5 pb-32">
            <div className="flex items-center gap-3 pt-2">
              <button onClick={()=>setView("home")} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 border border-slate-100"><ArrowLeft size={18} strokeWidth={1.2} /></button>
              <h2 className="text-[17px] font-black text-slate-900">Product Analysis</h2>
            </div>
            {loading ? (
              <div className="bg-white rounded-[28px] border-2 border-blue-100 shadow-xl p-10 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 animate-pulse"><ShoppingBag size={40} strokeWidth={1.2} /></div>
                <div><h3 className="text-lg font-black text-slate-900 mb-2">Analyzing Ingredients...</h3><p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Checking for harmful chemicals</p></div>
              </div>
            ) : (
              <div className="bg-white rounded-[28px] border border-[#EEF0FF] shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3 text-green-500 font-black text-sm uppercase"><CheckCircle2 size={20} strokeWidth={1.2} /> Analysis Complete</div>
                <div className="text-[13px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{ai}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* RESULTS & DEEP ANALYSIS (FACE) */}
        {view === "results" && data && (
          <motion.div key="results" initial={{opacity:0}} animate={{opacity:1}} className="relative min-h-screen">
            {/* Background Image (The scanned face) */}
            <div className="absolute inset-0 bg-slate-200">
              <img src={data.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"} alt="Scan" className="w-full h-full object-cover" />
              
              {/* Scan Dots */}
              <div className="absolute inset-0">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.5}} className="absolute top-[30%] left-[40%] w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.7}} className="absolute top-[45%] left-[60%] w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.9}} className="absolute top-[60%] left-[35%] w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                
                {/* Highlight Circle (Under Eye example) */}
                <motion.div 
                  initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}
                  className="absolute top-[40%] left-[45%] w-24 h-12 border-2 border-dashed border-white/50 rounded-[50%] rotate-[-15deg]" 
                />
              </div>
            </div>

            {/* Top Controls */}
            <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-10">
              <button onClick={()=>setView("home")} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform">
                <ArrowLeft size={20} />
              </button>
              <button onClick={()=>setView("scanner")} className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/20 active:scale-90 transition-transform">
                Rescan
              </button>
            </div>

            {/* Bottom Sheet - Best Solutions */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl rounded-t-[40px] p-8 pb-12 shadow-2xl border-t border-white/40"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[18px] font-bold text-slate-800">Best Solutions</h3>
                <button className="text-[#F88E7D] text-[13px] font-bold">View All</button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-2 px-2 pb-2">
                {[
                  { image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80", active: false },
                  { image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80", active: true },
                  { image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80", active: false },
                  { image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80", active: false },
                ].map((item, idx) => (
                  <div key={idx} className={cn(
                    "relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0",
                    item.active ? "border-[#F88E7D] scale-110 shadow-lg" : "border-transparent opacity-60"
                  )}>
                    <img src={item.image} alt="Solution" className="w-full h-full object-cover" />
                    {item.active && (
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#F88E7D] rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* HISTORY PAGE */}
        {view === "history" && (
          <motion.div key="history" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="px-5 pb-32">
            <div className="flex items-center gap-3 mb-5 pt-2">
              <button onClick={()=>setView(data ? "results" : "home")} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-slate-400 border border-slate-100"><ArrowLeft size={18} strokeWidth={1.2} /></button>
              <h2 className="text-[18px] font-black text-slate-900 text-center flex-1 pr-10">Scan History</h2>
            </div>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4"><div className="text-6xl">📭</div><p className="text-[15px] font-bold text-slate-400">No scans yet</p><button onClick={()=>setView("scanner")} className="bg-primary-gradient text-white font-black px-6 py-3 rounded-2xl text-sm">Start First Scan ✨</button></div>
            ) : (
              <div className="space-y-3">{history.map((h,i)=>(<div key={i} className="bg-white rounded-[20px] border border-[#EEF0FF] shadow-sm p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">🧴</div><div className="flex-1"><p className="text-[12px] font-bold text-slate-800">{h.date}</p><div className="flex gap-3 mt-1"><p className="text-[9px] text-slate-400">Acne <span className="text-slate-600 font-bold">{h.acne}%</span></p><p className="text-[9px] text-slate-400">Oil <span className="text-slate-600 font-bold">{h.oil}%</span></p><p className="text-[9px] text-slate-400">Pigment <span className="text-slate-600 font-bold">{h.pigmentation}%</span></p></div></div><div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0"><p className="text-[10px] font-black text-white">{h.score}%</p></div></div>))}</div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
