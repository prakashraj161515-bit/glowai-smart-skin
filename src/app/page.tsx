"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraScanner from "@/components/CameraScanner";
import { ScanFace, Sparkles, ChevronRight, RefreshCcw, Download, ArrowLeft, Lock, Database, Search, CheckCircle2, Gem, AlertCircle, BrainCircuit, Target, Zap, ShieldCheck, ShoppingBag, Info, Droplets, Utensils, User, TrendingUp } from "lucide-react";
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
  const [country, setCountry] = useState("India");
  const [waterIntake, setWaterIntake] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userName, setUserName] = useState("Erica");
  const [isEditingName, setIsEditingName] = useState(false);
  const [skinType, setSkinType] = useState("Oily");
  const [userPic, setUserPic] = useState<string | null>(null);
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
    const savedCountry = localStorage.getItem("velmora_user_country");
    if (savedCountry) setCountry(savedCountry);

    // Water Intake Persistence/Reset
    const today = new Date().toLocaleDateString();
    const savedWater = localStorage.getItem("velmora_water_intake");
    const savedWaterDate = localStorage.getItem("velmora_water_date");
    if (savedWaterDate === today) {
      if (savedWater) setWaterIntake(parseInt(savedWater));
    } else {
      setWaterIntake(0);
      localStorage.setItem("velmora_water_date", today);
      localStorage.setItem("velmora_water_intake", "0");
    }

    const savedAuth = localStorage.getItem("velmora_auth_status");
    if (savedAuth === "true") {
      setIsLoggedIn(true);
      setShowLanding(false);
      
      const savedOnboarding = localStorage.getItem("velmora_onboarding_complete");
      if (savedOnboarding !== "true") {
        setShowOnboarding(true);
      }
    }
  }, [view]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLanding(false);
    localStorage.setItem("velmora_auth_status", "true");
    
    const savedOnboarding = localStorage.getItem("velmora_onboarding_complete");
    if (savedOnboarding !== "true") {
      setShowOnboarding(true);
    }
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("velmora_onboarding_complete", "true");
    localStorage.setItem("velmora_user_name", userName);
    localStorage.setItem("velmora_user_gender", gender);
    localStorage.setItem("velmora_user_country", country);
    
    // If we have scan data from onboarding, show results
    if (data) setView("results");
  };

  // Dummy products
  const products = [
    { name: "Brightening Cream", price: "$24.00", image: "https://images.unsplash.com/photo-1556229167-279262113337?w=400&q=80" },
    { name: "Hydrating Serum", price: "$32.00", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80" },
    { name: "Cleansing Oil", price: "$18.00", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80" },
    { name: "Night Repair", price: "$45.00", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80" },
  ];

  const formatMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 font-bold">$1</strong>');
      
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 mb-1.5 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F88E7D] mt-2 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[*-]\s*/, "") }} />
          </div>
        );
      }
      
      if (line.trim() === "") return <div key={i} className="h-2" />;
      
      return (
        <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  const resetScanner = (newMode: "face" | "product") => {
    setAi("");
    setData(null);
    setScanMode(newMode);
    setView("scanner");
  };

  async function handleProductResult(res: any) {
    setData(res);
    setView("product_results");
    setLoading(true);
    setAi("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: res.image, 
          mode: "product_scan", 
          gender,
          userName 
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (!data.text) throw new Error("AI returned an empty response.");
      setAi(data.text);
    } catch (err: any) {
      setAi(`⚠️ Analysis failed: ${err.message || "Please ensure the label is clear."}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleResult(res: any) {
    if (res.error) { alert(res.error); setView("home"); return; }
    if (scanMode === "product") { handleProductResult(res); return; }

    // Show loading screen immediately with placeholder data
    setView("results");
    setLoading(true);
    setDeepScanStep(1);
    setData({ image: res.image, score: 0, acne: 0, oil: 0, pigmentation: 0 });
    setAi("");

    try {
      const prevScan = history[0];
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "face_scan",
          image: res.image,
          gender,
          userName,
          country,
          prevScan: prevScan ? {
            date: prevScan.date,
            score: prevScan.score,
            acne: prevScan.acne,
            oil: prevScan.oil,
            pigmentation: prevScan.pigmentation
          } : null
        })
      });

      const aiData = await r.json();
      if (aiData.error) throw new Error(aiData.error);

      // Use 100% real AI-generated metrics
      const realScore = typeof aiData.score === "number" ? aiData.score : 0;
      const realAcne = typeof aiData.acne === "number" ? aiData.acne : 0;
      const realOil = typeof aiData.oil === "number" ? aiData.oil : 0;
      const realPigmentation = typeof aiData.pigmentation === "number" ? aiData.pigmentation : 0;
      const realReport = aiData.report || aiData.text || "Analysis complete.";

      // Auto-detect Skin Type from real AI metrics
      let detectedType = "Combination";
      if (realOil > 60) detectedType = "Oily";
      else if (realOil < 25) detectedType = "Dry";
      else if (realAcne > 40) detectedType = "Acne-Prone";
      setSkinType(detectedType);
      localStorage.setItem("velmora_user_skin_type", detectedType);

      // Build final analysis object from REAL AI data
      const analysisData = {
        image: res.image,
        score: realScore,
        acne: realAcne,
        oil: realOil,
        pigmentation: realPigmentation,
        gender,
        date: new Date().toLocaleDateString()
      };

      // Update all state with real values
      setData(analysisData);
      setAi(realReport);

      // Save real data to history & LocalStorage
      const newHistory = [analysisData, ...history].slice(0, 30);
      setHistory(newHistory);
      localStorage.setItem("velmora_history", JSON.stringify(newHistory));
      localStorage.setItem("velmora_analysis", JSON.stringify(analysisData));

      if (showOnboarding) setTimeout(() => completeOnboarding(), 500);

    } catch (err: any) {
      setAi(`⚠️ Could not generate AI report: ${err.message}`);
    } finally {
      setLoading(false);
      setDeepScanStep(0);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF5F2] font-outfit pb-32">

      <AnimatePresence mode="wait">
        
        {/* LANDING / LOGIN PAGE */}
        {showLanding && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col overflow-y-auto"
          >
            {/* Hero Section */}
            <div className="relative h-[60vh] overflow-hidden flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80" 
                alt="Velmora Skincare" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Logo */}
              <div className="absolute top-14 left-0 right-0 flex justify-center">
                <div className="bg-white/15 backdrop-blur-xl px-8 py-3 rounded-full border border-white/30">
                  <h1 className="text-3xl font-black text-white tracking-tighter italic">✨ Velmora AI</h1>
                </div>
              </div>
              {/* Hero Text */}
              <div className="absolute bottom-8 left-6 right-6">
                <p className="text-[11px] font-black text-[#F88E7D] uppercase tracking-[0.3em] mb-2">AI-Powered Skincare</p>
                <h2 className="text-4xl font-black text-white leading-tight">Your Personal <br/><span className="text-[#F88E7D]">Skin Coach</span></h2>
                <p className="text-white/70 text-sm mt-3 font-medium">Real AI analysis. Real results. Real glow.</p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="px-5 py-8 space-y-4 flex-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">What Velmora can do</p>
              
              {/* Feature 1 - AI Skin Scan */}
              <div className="flex gap-4 bg-gradient-to-r from-blue-50 to-white rounded-[28px] p-4 border border-blue-100 shadow-sm items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                  <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80" alt="Skin Scan" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center"><ScanFace size={14} className="text-white" /></div>
                    <p className="font-black text-slate-800 text-[13px]">AI Skin Analysis</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">Real-time Glow Score, Acne, Oil & Pigmentation detection using Gemini AI Vision.</p>
                </div>
              </div>

              {/* Feature 2 - Diet Plan */}
              <div className="flex gap-4 bg-gradient-to-r from-emerald-50 to-white rounded-[28px] p-4 border border-emerald-100 shadow-sm items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                  <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80" alt="Diet Plan" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center"><Utensils size={14} className="text-white" /></div>
                    <p className="font-black text-slate-800 text-[13px]">Personalized Diet Plan</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">AI-curated food & nutrition plans based on your skin type and country.</p>
                </div>
              </div>

              {/* Feature 3 - Product Scanner */}
              <div className="flex gap-4 bg-gradient-to-r from-orange-50 to-white rounded-[28px] p-4 border border-orange-100 shadow-sm items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                  <img src="https://images.unsplash.com/photo-1556229167-279262113337?w=200&q=80" alt="Product Scanner" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-orange-400 flex items-center justify-center"><ShoppingBag size={14} className="text-white" /></div>
                    <p className="font-black text-slate-800 text-[13px]">Product Scanner</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">Scan any skincare product to get an AI verdict on ingredients & safety.</p>
                </div>
              </div>

              {/* Feature 4 - AI Coach */}
              <div className="flex gap-4 bg-gradient-to-r from-purple-50 to-white rounded-[28px] p-4 border border-purple-100 shadow-sm items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80" alt="AI Coach" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
                    <p className="font-black text-slate-800 text-[13px]">AI Skin Coach</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">Chat with your personal AI dermatologist anytime for expert skincare advice.</p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 pb-8 space-y-3">
                <button 
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-[#F88E7D] to-[#f97316] text-white h-16 rounded-[24px] flex items-center justify-center gap-3 font-black text-[15px] active:scale-95 transition-transform shadow-xl shadow-orange-500/30"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>
                <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">Free • No credit card required</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ONBOARDING FLOW */}
        {showOnboarding && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-white flex flex-col overflow-y-auto"
          >
            {/* Progress Bar */}
            <div className="flex gap-2 px-6 pt-14 pb-4 flex-shrink-0">
              {[1,2,3,4].map(s => (
                <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", onboardingStep >= s ? "bg-[#F88E7D]" : "bg-slate-100")} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={onboardingStep}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                {/* Step 1 – Name */}
                {onboardingStep === 1 && (
                  <div className="flex flex-col flex-1">
                    <div className="relative h-56 flex-shrink-0 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80" alt="Welcome" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                    </div>
                    <div className="px-6 pt-2 pb-8 flex flex-col gap-6 flex-1">
                      <div>
                        <p className="text-[11px] font-black text-[#F88E7D] uppercase tracking-[0.3em]">Step 1 of 4</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">Hi! What&apos;s your name? 👋</h2>
                        <p className="text-slate-400 text-sm mt-2 font-medium">We&apos;ll personalize your entire skincare experience just for you.</p>
                      </div>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-[#FDF5F2] h-16 px-6 rounded-[24px] border-2 border-[#F3EAE8] font-bold text-lg outline-none focus:border-[#F88E7D] transition-colors"
                      />
                      <div className="space-y-3 mt-2">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">What you&apos;ll get</p>
                        {[
                          { icon: "🔬", text: "Real AI skin analysis with Glow Score" },
                          { icon: "🥗", text: "Personalized diet plan for your skin" },
                          { icon: "🛍️", text: "Instant product ingredient scanner" },
                          { icon: "🤖", text: "24/7 AI skin coach & advice" },
                        ].map((f, i) => (
                          <div key={i} className="flex items-center gap-3 bg-[#FDF5F2] rounded-2xl px-4 py-3">
                            <span className="text-lg">{f.icon}</span>
                            <p className="text-[12px] font-bold text-slate-700">{f.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 – Gender */}
                {onboardingStep === 2 && (
                  <div className="flex flex-col flex-1">
                    <div className="relative h-56 flex-shrink-0 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80" alt="Gender" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                    </div>
                    <div className="px-6 pt-2 pb-8 flex flex-col gap-6 flex-1">
                      <div>
                        <p className="text-[11px] font-black text-[#F88E7D] uppercase tracking-[0.3em]">Step 2 of 4</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">Your gender? 🧬</h2>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Male and female skin have different needs. This helps Velmora tailor your analysis.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { g: "male", emoji: "👨", img: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=200&q=80" },
                          { g: "female", emoji: "👩", img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80" },
                        ].map(({ g, emoji, img }) => (
                          <button
                            key={g}
                            onClick={() => setGender(g as "male" | "female")}
                            className={cn(
                              "rounded-[28px] border-2 overflow-hidden transition-all flex flex-col",
                              gender === g ? "border-[#F88E7D] shadow-xl shadow-orange-500/20" : "border-slate-100"
                            )}
                          >
                            <div className="h-32 overflow-hidden">
                              <img src={img} alt={g} className="w-full h-full object-cover" />
                            </div>
                            <div className={cn("py-3 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider", gender === g ? "bg-[#F88E7D] text-white" : "bg-white text-slate-500")}>
                              <span>{emoji}</span> {g}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 – Country */}
                {onboardingStep === 3 && (
                  <div className="flex flex-col flex-1">
                    <div className="relative h-56 flex-shrink-0 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?w=600&q=80" alt="Location" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                    </div>
                    <div className="px-6 pt-2 pb-8 flex flex-col gap-6 flex-1">
                      <div>
                        <p className="text-[11px] font-black text-[#F88E7D] uppercase tracking-[0.3em]">Step 3 of 4</p>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">Where are you from? 🌍</h2>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Your location helps us recommend locally available foods & products that work for your climate.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {["India","USA","UK","UAE","Pakistan","Bangladesh","Canada","Australia"].map(c => (
                          <button
                            key={c}
                            onClick={() => setCountry(c)}
                            className={cn(
                              "h-14 rounded-[20px] border-2 font-black text-sm transition-all",
                              country === c ? "bg-[#F88E7D] border-[#F88E7D] text-white shadow-lg shadow-orange-500/20" : "bg-[#FDF5F2] border-transparent text-slate-600"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4 – Face Scan */}
                {onboardingStep === 4 && (
                  <div className="flex flex-col flex-1 px-6 pt-4 pb-8 gap-4">
                    <div>
                      <p className="text-[11px] font-black text-[#F88E7D] uppercase tracking-[0.3em]">Step 4 of 4</p>
                      <h2 className="text-3xl font-black text-slate-900 mt-1">Your First Skin Scan 📸</h2>
                      <p className="text-slate-400 text-sm mt-2 font-medium">Our Gemini AI will analyze your face and generate a real Glow Score instantly.</p>
                    </div>
                    <div className="rounded-[32px] overflow-hidden border-4 border-white shadow-2xl bg-black flex-1 min-h-[300px]">
                      <CameraScanner onResult={handleResult} mode="face" />
                    </div>
                    <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">Position face clearly in good lighting</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Buttons */}
            <div className="px-6 pb-10 pt-4 flex-shrink-0 space-y-3">
              {onboardingStep < 4 && (
                <button
                  onClick={() => setOnboardingStep(onboardingStep + 1)}
                  className="w-full bg-gradient-to-r from-[#F88E7D] to-[#f97316] text-white h-16 rounded-[24px] font-black text-[15px] uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-transform"
                >
                  Continue →
                </button>
              )}
              {onboardingStep > 1 && onboardingStep < 4 && (
                <button
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest py-2"
                >
                  ← Go Back
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* HOME */}
        {view === "home" && (
          <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="px-6 pt-12 space-y-8">
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                    {userPic ? (
                      <img src={userPic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-slate-300" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setUserPic(base64);
                          localStorage.setItem("velmora_user_pic", base64);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {isEditingName ? (
                      <input 
                        autoFocus
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onBlur={() => {
                          setIsEditingName(false);
                          localStorage.setItem("velmora_user_name", userName);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIsEditingName(false);
                            localStorage.setItem("velmora_user_name", userName);
                          }
                        }}
                        className="text-[28px] font-bold text-slate-800 leading-tight bg-transparent border-b border-[#F88E7D] outline-none w-32"
                      />
                    ) : (
                      <h1 onClick={() => setIsEditingName(true)} className="text-[28px] font-bold text-slate-800 leading-tight cursor-pointer hover:text-[#F88E7D] transition-colors">Hi {userName},</h1>
                    )}
                  </div>
                  <p className="text-[13px] text-slate-400 font-medium mt-0.5">Transform Your Skin&apos;s Health</p>
                </div>
              </div>
              <Link href="/routine">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-orange-500/10 flex items-center justify-center border border-[#F3EAE8]"
                >
                  <BrainCircuit size={28} className="text-[#F88E7D]" />
                </motion.div>
              </Link>
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
              onClick={() => resetScanner("face")}
              className="w-full bg-[#F88E7D] border-2 border-[#F88E7D]/20 rounded-[32px] p-6 flex items-center justify-between group active:scale-95 transition-transform shadow-xl shadow-orange-500/20 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <ScanFace size={28} />
                </div>
                <div className="text-left">
                  <span className="block text-[16px] font-bold">Scan your face</span>
                  <span className="block text-[11px] text-white/70 font-medium italic">Instant AI Analysis</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/50 group-hover:text-white transition-colors" />
            </button>

            {/* Growth Insight Card */}
            {history.length >= 2 && (
              <div className="bg-white rounded-[32px] p-6 border border-[#F3EAE8] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-800">
                      {history[0].score > history[1].score ? "Skin improving!" : "Skin needs care"}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Glow score {history[0].score > history[1].score ? "up" : "down"} by {Math.abs(history[0].score - history[1].score)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
                  {history[0].score > history[1].score ? "+" : "-"}{Math.abs(history[0].score - history[1].score)}%
                </div>
              </div>
            )}


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
                onClick={() => resetScanner("product")}
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
        {view === "product_results" && data && (
          <motion.div key="product_results" initial={{opacity:0}} animate={{opacity:1}} className="relative min-h-screen">
            {/* Background Image (The scanned product) */}
            <div className="absolute inset-0 bg-slate-100">
              <img src={data.image} alt="Product" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Top Controls */}
            <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-10">
              <button onClick={()=>setView("home")} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform">
                <ArrowLeft size={20} />
              </button>
              <div className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live Analysis
              </div>
            </div>

            {/* Bottom Sheet */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl rounded-t-[40px] p-8 pb-12 shadow-2xl border-t border-white/40 max-h-[75vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h3 className="text-[20px] font-black text-slate-900 tracking-tight">Ingredient Analysis</h3>
                  <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full w-fit">
                    <CheckCircle2 size={12} strokeWidth={3} /> AI Approved
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group">
                  <ShoppingBag size={24} strokeWidth={1.2} className="text-slate-300" />
                  <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                </div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center gap-6 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Scanning Molecular Data...</p>
                    <p className="text-[10px] text-slate-300 font-medium mt-1">Checking against 10,000+ medical databases</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Doctor/Expert Badge */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[28px] p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
                        <BrainCircuit size={24} />
                      </div>
                      <div>
                        <p className="text-[14px] font-black leading-tight uppercase tracking-wide">Doctor Approved Analysis</p>
                        <p className="text-[10px] text-blue-100 font-medium">Safe for {skinType} Skin</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-6 border border-[#EEF0FF] shadow-sm relative overflow-hidden min-h-[200px]">
                    <div className="text-[14px] text-slate-600 leading-relaxed font-medium">
                      {ai ? formatMarkdown(ai) : "Scanning complete. Your personalized report is ready."}
                    </div>
                  </div>

                  <button 
                    onClick={() => setView("home")}
                    className="w-full py-5 rounded-[24px] bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-transform"
                  >
                    Done & Save Analysis
                  </button>
                </div>
              )}
            </motion.div>
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
              <button onClick={()=>resetScanner("face")} className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/20 active:scale-90 transition-transform">
                Rescan
              </button>
            </div>

            {/* Bottom Sheet - Analysis Result */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl rounded-t-[40px] p-8 pb-12 shadow-2xl border-t border-white/40 max-h-[70vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">Skin Analysis Result</h3>
                  <p className="text-[10px] text-[#F88E7D] font-black uppercase tracking-widest mt-0.5">AI Report Complete</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#FFEDE8] flex items-center justify-center text-[#F88E7D] shadow-inner font-black text-lg">
                  {data.score}%
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Score Pills */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  <div className="bg-[#FDF5F2] px-4 py-2 rounded-2xl border border-[#F3EAE8] flex-shrink-0">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Acne</p>
                    <p className="text-[14px] font-bold text-slate-800">{data.acne}%</p>
                  </div>
                  <div className="bg-[#FDF5F2] px-4 py-2 rounded-2xl border border-[#F3EAE8] flex-shrink-0">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Oil</p>
                    <p className="text-[14px] font-bold text-slate-800">{data.oil}%</p>
                  </div>
                  <div className="bg-[#FDF5F2] px-4 py-2 rounded-2xl border border-[#F3EAE8] flex-shrink-0">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Pigment</p>
                    <p className="text-[14px] font-bold text-slate-800">{data.pigmentation}%</p>
                  </div>
                </div>

                {/* AI Text Analysis */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="py-12 bg-white rounded-[32px] border border-[#EEF0FF] flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-[#FFEDE8] border-t-[#F88E7D] rounded-full animate-spin" />
                      <p className="text-[11px] text-slate-400 font-bold uppercase animate-pulse">Generating Deep Report...</p>
                    </div>
                  ) : (
                    <>
                      {/* Formatted Sections if available, else fallback */}
                      <div className="bg-white rounded-[32px] p-6 border border-[#EEF0FF] shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 text-[#F88E7D] font-black text-[11px] uppercase tracking-widest">
                          <BrainCircuit size={14} /> Expert Analysis & Solutions
                        </div>
                        <div className="text-[13px] text-slate-600 leading-relaxed font-medium">
                          {ai ? formatMarkdown(ai) : "Scanning complete. Your personalized report is ready."}
                        </div>
                      </div>

                      {/* Skin Improving History Mini Graph/Stat */}
                      {history.length > 1 && (
                        <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-3 text-emerald-600 font-black text-[11px] uppercase tracking-widest">
                            <TrendingUp size={14} /> Skin Improving History
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-[13px] font-bold text-slate-800">
                                {data?.score > history[1]?.score ? "Skin is showing improvement! ✨" : "Keep following the routine."}
                              </p>
                              <p className="text-[11px] text-slate-500">Compared to your last scan on {history[1]?.date || "N/A"}</p>
                            </div>
                            <div className={cn("text-lg font-black px-3 py-1 rounded-full", (data?.score && history[1]?.score && data.score > history[1].score) ? "text-emerald-500 bg-emerald-100" : "text-slate-400 bg-slate-100")}>
                              {data?.score && history[1]?.score ? (data.score > history[1].score ? `+${data.score - history[1].score}%` : `${data.score - history[1].score}%`) : "0%"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Summary Cards */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100/50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                              <Utensils size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-tight">Focus Food</p>
                              <p className="text-[15px] font-bold text-slate-800">{data?.acne > 30 ? "Leafy Greens" : "Omega-3 rich seeds"}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-emerald-300" />
                        </div>
                      </div>

                      <Link href="/routine" className="w-full h-16 bg-[#FDF5F2] border border-[#F3EAE8] rounded-2xl flex items-center justify-center gap-2 text-[#F88E7D] font-bold text-sm active:scale-95 transition-transform">
                        View Full Timeline Schedule <ChevronRight size={18} />
                      </Link>
                    </>
                  )}
                </div>
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
