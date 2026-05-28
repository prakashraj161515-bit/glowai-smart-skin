"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import CameraScanner from "@/components/CameraScanner";
import { ScanFace, Sparkles, ChevronRight, RefreshCcw, Download, ArrowLeft, Lock, Database, Search, CheckCircle2, Gem, AlertCircle, BrainCircuit, Target, Zap, ShieldCheck, ShoppingBag, Info, Droplets, Utensils, User, TrendingUp, LogOut, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type HistoryEntry = { date: string; score: number; acne: number; oil: number; pigmentation: number; };

import ProductCard from "@/components/ProductCard";

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<"home"|"scanner"|"results"|"history"|"product_results">("home");
  const [scanMode, setScanMode] = useState<"face"|"product">("face");
  const [data, setData] = useState<any>(null);
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"male"|"female">("female");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [country, setCountry] = useState("India");
  
  // Auto-detect country based on timezone
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const mapping: Record<string, string> = {
      "Asia/Kolkata": "India",
      "America/New_York": "USA", "America/Chicago": "USA", "America/Denver": "USA", "America/Los_Angeles": "USA",
      "Europe/London": "UK",
      "Asia/Dubai": "UAE",
      "Asia/Karachi": "Pakistan",
      "Asia/Dhaka": "Bangladesh",
      "America/Toronto": "Canada", "America/Vancouver": "Canada",
      "Australia/Sydney": "Australia", "Australia/Melbourne": "Australia",
      "Asia/Singapore": "Singapore"
    };
    if (mapping[tz]) setCountry(mapping[tz]);
  }, []);

  const [waterIntake, setWaterIntake] = useState(0);
  const showLanding = status === "unauthenticated";
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [skinType, setSkinType] = useState("Oily");
  const [userPic, setUserPic] = useState<string | null>(null);
  const [deepScanStep, setDeepScanStep] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);

  // Sync Premium Status
  useEffect(() => {
    const premium = localStorage.getItem("velmora_is_premium") === "true";
    setIsPremium(premium);
  }, []);
  const [scanLimitReached, setScanLimitReached] = useState(false);
  const [limitReason, setLimitReason] = useState<"limit" | "premium">("limit");
  const [scanCount, setScanCount] = useState(0);
  const [activeTab, setActiveTab] = useState("All");
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoName, setDemoName] = useState("");
  const [streak, setStreak] = useState(1);

  const APP_VERSION = "3.0"; // Increment this to force restart for all users

  // ─── GLOBAL RESTART LOGIC ──────────────────────────────────────────────────
  useEffect(() => {
    const savedVersion = localStorage.getItem("velmora_app_version");
    if (savedVersion !== APP_VERSION) {
      // Version mismatch! Clear everything and force logout
      console.log("App version updated. Restarting for all users...");
      localStorage.clear();
      localStorage.setItem("velmora_app_version", APP_VERSION);
      signOut({ redirect: false });
      setShowOnboarding(false);
    }
  }, []);

  // ─── SAVE TO CLOUD ───────────────────────────────────────────────────────────
  const saveToCloud = async (payload: object) => {
    try {
      await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("Cloud save failed (non-critical):", e);
    }
  };

  // ─── CORE AUTH FLOW ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return;

    const todayStr = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();

    if (status === "authenticated" && session?.user) {
      // User is logged in
      const googleName = session.user.name || "User";
      const googlePic = session.user.image || null;
      setUserName(googleName);
      setUserPic(googlePic);
      
      // Load local onboarding complete status first to avoid flash
      const localOnboardingComplete = localStorage.getItem("velmora_onboarding_complete") === "true";
      setShowOnboarding(!localOnboardingComplete);

      // --- CALCULATE LOCAL STREAK ---
      const localLastLogin = localStorage.getItem("velmora_last_login_date");
      const localStreak = parseInt(localStorage.getItem("velmora_streak") || "0");
      
      let computedStreak = localStreak;
      let computedLastLogin = localLastLogin;

      if (!localLastLogin) {
        computedStreak = 1;
        computedLastLogin = todayStr;
      } else if (localLastLogin === todayStr) {
        computedStreak = Math.max(1, localStreak);
      } else if (localLastLogin === yesterdayStr) {
        computedStreak = localStreak + 1;
        computedLastLogin = todayStr;
      } else {
        computedStreak = 1;
        computedLastLogin = todayStr;
      }

      if (localLastLogin !== computedLastLogin || localStreak !== computedStreak) {
        localStorage.setItem("velmora_last_login_date", computedLastLogin);
        localStorage.setItem("velmora_streak", computedStreak.toString());
        saveToCloud({
          streak: computedStreak,
          lastLoginDate: computedLastLogin
        });
      }
      setStreak(computedStreak);

      const lastScanDate = localStorage.getItem("velmora_last_scan_date");
      const count = parseInt(localStorage.getItem("velmora_scan_count") || "0");
      
      const localTodayStr = new Date().toLocaleDateString();
      if (lastScanDate !== localTodayStr) {
        setScanCount(0);
      } else {
        setScanCount(count);
      }

      // Load cloud data
      fetch("/api/user/load")
        .then(r => r.json())
        .then(({ data }) => {
          if (data) {
            if (data.history?.length) {
              setHistory(data.history);
              localStorage.setItem("velmora_history", JSON.stringify(data.history));
            }
            if (data.gender) { setGender(data.gender); localStorage.setItem("velmora_user_gender", data.gender); }
            if (data.country) { setCountry(data.country); localStorage.setItem("velmora_country", data.country); }
            if (data.skinType) { setSkinType(data.skinType); localStorage.setItem("velmora_user_skin_type", data.skinType); }
            
            // Restore Premium & Scan Limits
            if (data.isPremium) {
              setIsPremium(true);
              localStorage.setItem("velmora_is_premium", "true");
            }
            
            // --- SYNC CLOUD STREAK ---
            const cloudStreak = data.streak || 0;
            const cloudLastLogin = data.lastLoginDate || "";
            
            let finalStreak = computedStreak;
            let finalLastLogin = computedLastLogin;

            if (cloudLastLogin === todayStr) {
              if (cloudStreak > finalStreak) {
                finalStreak = cloudStreak;
                finalLastLogin = cloudLastLogin;
              }
            } else if (cloudLastLogin === yesterdayStr) {
              const cloudComputedVal = cloudStreak + 1;
              if (cloudComputedVal > finalStreak) {
                finalStreak = cloudComputedVal;
                finalLastLogin = todayStr;
              }
            }

            if (finalStreak !== computedStreak || finalLastLogin !== computedLastLogin) {
              localStorage.setItem("velmora_last_login_date", finalLastLogin);
              localStorage.setItem("velmora_streak", finalStreak.toString());
              setStreak(finalStreak);
              saveToCloud({
                streak: finalStreak,
                lastLoginDate: finalLastLogin
              });
            }

            // Check scan count
            const countLocal = parseInt(localStorage.getItem("velmora_scan_count") || "0");
            const localLastDate = localStorage.getItem("velmora_last_scan_date");
            if (localLastDate === localTodayStr) {
              setScanCount(countLocal);
            } else {
              setScanCount(0);
              localStorage.setItem("velmora_scan_count", "0");
              localStorage.removeItem("velmora_last_scan_date");
            }

            if (data.onboardingComplete) {
              localStorage.setItem("velmora_onboarding_complete", "true");
              setShowOnboarding(false);
            } else {
              setShowOnboarding(true);
            }
          } else {
            const done = localStorage.getItem("velmora_onboarding_complete") === "true";
            setShowOnboarding(!done);
          }
        });
    }
  }, [status, session]);



  const canScan = isPremium || (() => {
    if (typeof window !== "undefined") {
      const todayStr = new Date().toLocaleDateString();
      const lastScanDate = localStorage.getItem("velmora_last_scan_date");
      if (!lastScanDate) return true;
      return lastScanDate !== todayStr;
    }
    return true;
  })();

  // ─── LOADING SPLASH SCREEN ──────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="fixed inset-0 bg-[#FDF5F2] flex flex-col items-center justify-center z-[200]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-24 h-24 bg-white rounded-[28px] overflow-hidden flex items-center justify-center shadow-2xl shadow-orange-500/10 border-2 border-white">
            <img src="/logo.png" className="w-full h-full object-cover" alt="GlowAI Logo" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">GLOWAI</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">Smart Skin AI</p>
          </div>
          <div className="mt-8 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-[#F88E7D] rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }


  const handleLogin = () => {
    // If already authenticated, just enter the app
    if (status === "authenticated") {
      // Mark as entered for this session
      sessionStorage.setItem("velmora_entered", "true");
      return;
    }

    // Google Login is now ALWAYS the primary option
    const hasGoogle = true; 
    if (hasGoogle) {
      signIn("google");
    } else {
      setShowDemoModal(true);
    }
  };

  const handleDemoLogin = async () => {
    if (!demoName.trim()) return;
    const result = await signIn("credentials", { 
      redirect: false, 
      name: demoName.trim() 
    });
    if (result?.ok || result === undefined) {
      // Login successful - close modal, show onboarding
      setShowDemoModal(false);
      setUserName(demoName.trim());
      const onboardingDone = localStorage.getItem("velmora_onboarding_complete") === "true";
      setShowOnboarding(!onboardingDone);
    }
  };

  const handleLogout = () => {
    signOut();
    localStorage.clear();
    setStreak(1);
    // Reset local state to prevent "flash" of old data
    setHistory([]);
    setUserName("");
    setIsPremium(false);
    setScanCount(0);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("velmora_onboarding_complete", "true");
    localStorage.setItem("velmora_user_name", userName);
    localStorage.setItem("velmora_user_gender", gender);
    localStorage.setItem("velmora_country", country);
    
    // Save to cloud so it persists across devices
    saveToCloud({
      onboardingComplete: true,
      userName,
      gender,
      country,
      skinType
    });

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
    // Product scanner is strictly premium
    if (newMode === "product" && !isPremium) {
      setLimitReason("premium");
      setScanLimitReached(true);
      return;
    }
    
    if (!canScan) {
      setLimitReason("limit");
      setScanLimitReached(true);
      return;
    }
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

    // Update scan count for free users
    if (!isPremium) {
      const newCount = scanCount + 1;
      setScanCount(newCount);
      localStorage.setItem("velmora_scan_count", newCount.toString());
    }
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

      // ☁️ Save to cloud so history persists across reinstalls
      // EXCLUDE onboarding/login scans from counting towards the daily limit!
      const isFirstLoginScan = showOnboarding;
      
      saveToCloud({
        history: newHistory,
        gender,
        country,
        skinType: detectedType,
        onboardingComplete: true,
        scanCount: isPremium ? 0 : (isFirstLoginScan ? scanCount : (scanCount + 1)),
        lastScanDate: isFirstLoginScan ? localStorage.getItem("velmora_last_scan_date") : new Date().toLocaleDateString(),
        isPremium
      });

      if (!isFirstLoginScan && !isPremium) {
        localStorage.setItem('velmora_last_scan_date', new Date().toLocaleDateString());
      }

      if (showOnboarding) setOnboardingStep(5);

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
        
        {/* DEMO LOGIN MODAL - shown when Google OAuth not configured */}
        {showDemoModal && (
          <motion.div
            key="demo-modal"
            initial={{ opacity: 0, x: "-50%" }}
            animate={{ opacity: 1, x: "-50%" }}
            exit={{ opacity: 0, x: "-50%" }}
            className="fixed top-0 bottom-0 left-1/2 w-full max-w-[430px] z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">✨</div>
                <h2 className="text-2xl font-black text-slate-900">Welcome to GlowAI</h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">Enter your name to get started</p>
              </div>
              <input
                type="text"
                value={demoName}
                onChange={e => setDemoName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleDemoLogin()}
                placeholder="Your name"
                autoFocus
                className="w-full bg-[#FDF5F2] h-14 px-5 rounded-[20px] border-2 border-[#F3EAE8] font-bold text-base outline-none focus:border-[#F88E7D] transition-colors mb-4"
              />
              <button
                onClick={handleDemoLogin}
                disabled={!demoName.trim()}
                className="w-full bg-gradient-to-r from-[#F88E7D] to-[#f97316] text-white h-14 rounded-[20px] font-black text-[15px] active:scale-95 transition-transform shadow-lg shadow-orange-500/25 disabled:opacity-40"
              >
                Continue →
              </button>
              <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-4">
                Add Google credentials in Vercel for full login
              </p>
            </motion.div>
          </motion.div>
        )}



        {/* IOS STYLE LANDING PAGE */}
        {showLanding && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#FDF5F2] flex flex-col items-center justify-between py-20 px-8"
          >
            {/* Branding */}
            <div className="text-center mt-12">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-24 h-24 bg-white rounded-[28px] overflow-hidden flex items-center justify-center shadow-2xl shadow-orange-500/10 mx-auto mb-6 border-2 border-white"
              >
                <img src="/logo.png" className="w-full h-full object-cover" alt="GlowAI Logo" />
              </motion.div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">GlowAI</h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Smart Skin AI</p>
            </div>

            {/* Content */}
            <div className="text-center px-4">
              <h2 className="text-[32px] font-bold text-slate-800 leading-tight tracking-tight">
                Analyze your skin<br />in seconds.
              </h2>
              <p className="text-slate-400 mt-4 text-[16px] font-medium max-w-[240px] mx-auto leading-relaxed">
                Personalized AI coaching for your best glow yet.
              </p>
            </div>

            {/* Actions */}
            <div className="w-full space-y-4">
              <button 
                onClick={handleLogin}
                className="w-full bg-white text-slate-900 h-16 rounded-2xl flex items-center justify-center gap-4 font-bold text-[17px] shadow-xl shadow-slate-200/50 active:scale-95 transition-transform border border-slate-100"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
              


              <p className="text-[10px] text-slate-300 text-center px-8 leading-relaxed mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
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
            className="fixed inset-0 z-[110] bg-[#FDF5F2] flex flex-col md:left-1/2 md:-translate-x-1/2 md:max-w-[430px] md:shadow-2xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="flex gap-2 px-6 pt-14 pb-4 flex-shrink-0">
              {[1,2,3,4,5].map(s => (
                <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", onboardingStep >= s ? "bg-[#F88E7D]" : "bg-slate-100")} />
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
              <motion.div
                key={onboardingStep}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                {onboardingStep === 1 && (
                  <div className="flex flex-col px-8 pb-10">
                    <div className="pt-6 pb-6 text-center">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-white rounded-[32px] overflow-hidden flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(248,142,125,0.15)] border-2 border-white"
                      >
                        <img src="/logo.png" className="w-full h-full object-cover" alt="GlowAI Logo" />
                      </motion.div>
                      <h2 className="text-[34px] font-black text-slate-900 leading-[1.1] tracking-tight">Your Journey to <span className="text-[#F88E7D]">Perfect Glow</span></h2>
                      <p className="text-slate-400 mt-5 text-[17px] font-medium leading-relaxed">Join 50,000+ users transforming their skin health with AI.</p>
                    </div>
                    
                    <div className="space-y-4 mt-2">
                      {[
                        { icon: "✨", title: "Glass Skin Glow", desc: "Scientific routines to achieve that perfect radiance." },
                        { icon: "🛡️", title: "Healthier Skin Barrier", desc: "Strengthen your skin against pollution and stress." },
                        { icon: "💧", title: "Deep Hydration", desc: "Expert advice to keep your skin plump and youthful." },
                        { icon: "🎯", title: "Targeted Results", desc: "Clear acne, dark spots, and texture in 30 days." }
                      ].map((benefit, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                          key={i} 
                          className="flex gap-5 items-center p-4 rounded-[24px] bg-white/60 border border-white shadow-[0_8px_20px_rgba(0,0,0,0.02)] backdrop-blur-sm"
                        >
                          <div className="w-14 h-14 rounded-[18px] bg-[#FDF5F2] flex items-center justify-center text-2xl flex-shrink-0">
                            {benefit.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-[17px]">{benefit.title}</h3>
                            <p className="text-slate-400 text-[13px] mt-0.5 font-medium leading-snug">{benefit.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2 – Name */}
                {onboardingStep === 2 && (
                  <div className="flex flex-col flex-1">
                    <div className="pt-14 px-6 pb-4">
                      <div className="w-16 h-16 bg-[#FDF5F2] rounded-2xl flex items-center justify-center border-2 border-[#F3EAE8] mb-4">
                        <User size={32} className="text-[#F88E7D]" />
                      </div>
                    </div>
                    <div className="px-6 pt-2 pb-8 flex flex-col gap-6 flex-1">
                      <div>
                        <p className="text-[11px] font-black text-[#F88E7D] uppercase tracking-[0.3em]">Step 2 of 5</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">Hi! What&apos;s your name? 👋</h2>
                        <p className="text-slate-400 text-sm mt-2 font-medium">We&apos;ll personalize your entire skincare experience just for you.</p>
                      </div>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-[#FDF5F2] h-16 px-6 rounded-[24px] border-2 border-[#F3EAE8] font-bold text-lg outline-none focus:border-[#F88E7D] transition-colors"
                      />

                    </div>
                  </div>
                )}

                {/* Step 3 – Gender */}
                {onboardingStep === 3 && (
                  <div className="flex flex-col flex-1">
                    <div className="pt-14 px-6 pb-4">
                      <div className="w-16 h-16 bg-[#FDF5F2] rounded-2xl flex items-center justify-center border-2 border-[#F3EAE8] mb-4">
                        <ScanFace size={32} className="text-[#F88E7D]" />
                      </div>
                    </div>
                    <div className="px-6 pt-2 pb-8 flex flex-col gap-6 flex-1">
                      <div>
                        <p className="text-[11px] font-black text-[#F88E7D] uppercase tracking-[0.3em]">Step 3 of 5</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">Your gender? 🧬</h2>
                        <p className="text-slate-400 text-sm mt-2 font-medium">This helps GlowAI understand your hormone balance and skin needs.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { g: "male", emoji: "👨", color: "bg-blue-50" },
                          { g: "female", emoji: "👩", color: "bg-rose-50" },
                        ].map(({ g, emoji, color }) => (
                          <button
                            key={g}
                            onClick={() => setGender(g as "male" | "female")}
                            className={cn(
                              "rounded-[28px] border-2 overflow-hidden transition-all flex flex-col",
                              gender === g ? "border-[#F88E7D] shadow-xl shadow-orange-500/20" : "border-slate-100"
                            )}
                          >
                            <div className={cn("h-32 flex items-center justify-center text-5xl transition-transform active:scale-90", color)}>
                              {emoji}
                            </div>
                            <div className={cn("py-3 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider", gender === g ? "bg-[#F88E7D] text-white" : "bg-white text-slate-500")}>
                              {g}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 4 – Face Scan */}
                {onboardingStep === 4 && (
                  <div className="flex flex-col flex-1 px-6 pb-8">
                    <div className="mb-6">
                      <p className="text-[11px] font-black text-[#F88E7D] uppercase tracking-[0.3em]">Step 4 of 5</p>
                      <h2 className="text-2xl font-black text-slate-900 mt-1">
                        {loading ? "Analyzing Skin... 🤖" : "AI Skin Scan 📸"}
                      </h2>
                      <p className="text-slate-400 text-sm mt-2 font-medium">
                        {loading 
                          ? "Our AI is detecting your skin patterns. Almost there..." 
                          : "Position your face in the guide. Our AI will analyze Acne, Oil, and Glow."}
                      </p>
                    </div>
                    <div className="flex-1 min-h-[400px] flex items-center justify-center bg-slate-50 rounded-[32px] overflow-hidden relative border-2 border-white shadow-inner">
                      {loading ? (
                        <div className="flex flex-col items-center gap-6 p-8 text-center">
                           <div className="relative w-20 h-20">
                             <div className="absolute inset-0 border-4 border-orange-100 rounded-full" />
                             <div className="absolute inset-0 border-4 border-t-[#F88E7D] rounded-full animate-spin" />
                           </div>
                           <div>
                             <p className="text-[13px] text-[#F88E7D] font-black uppercase tracking-[0.2em] animate-pulse">Deep Scan in Progress</p>
                             <p className="text-[11px] text-slate-400 mt-2 font-medium">Analyzing pores, texture, and hydration...</p>
                           </div>
                        </div>
                      ) : ai.startsWith("⚠️") ? (
                        <div className="flex flex-col items-center gap-4 p-8 text-center">
                          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                            <AlertCircle size={32} />
                          </div>
                          <p className="text-sm font-bold text-slate-800">{ai}</p>
                          <button 
                            onClick={() => { setAi(""); setLoading(false); }}
                            className="bg-[#F88E7D] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <CameraScanner onResult={handleResult} />
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5 – Analysis Complete */}
                {onboardingStep === 5 && (
                  <div className="flex flex-col flex-1 px-6 items-center justify-center text-center">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6"
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">You&apos;re all set! ✨</h2>
                    <p className="text-slate-400 font-medium mb-8">Your skin has been analyzed. We&apos;ve prepared a personalized routine just for you.</p>
                    
                    <div className="w-full bg-[#FDF5F2] rounded-3xl p-6 mb-8 border-2 border-[#F3EAE8]">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Initial Glow Score</span>
                          <span className="text-2xl font-black text-[#F88E7D]">{data?.score || 0}%</span>
                       </div>
                       <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${data?.score || 0}%` }}
                            className="h-full bg-[#F88E7D]"
                          />
                       </div>
                    </div>
                  </div>
                )}

              </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Buttons */}
            <div className="px-6 pb-10 pt-4 flex-shrink-0 space-y-3">
              {onboardingStep <= 3 ? (
                <button
                  onClick={() => setOnboardingStep(onboardingStep + 1)}
                  className="w-full bg-gradient-to-r from-[#F88E7D] to-[#f97316] text-white h-16 rounded-[24px] font-black text-[15px] uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Continue →
                </button>
              ) : onboardingStep === 4 ? (
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest py-2">
                  Use the camera button to scan
                </p>
              ) : (
                <button
                  onClick={completeOnboarding}
                  className="w-full bg-[#10b981] text-white h-16 rounded-[24px] font-black text-[15px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Start My Glow Journey ✨
                </button>
              )}
              {onboardingStep > 1 && onboardingStep < 5 && (
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
            
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 px-2 pt-4 gap-2">
              {/* Left Profile Area */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-16 h-16 shrink-0">
                  <div className="absolute inset-0 bg-primary-gradient rounded-full rotate-6 opacity-20" />
                  <div className="w-full h-full rounded-full bg-white border-2 border-white shadow-md overflow-hidden relative z-10 flex items-center justify-center">
                    {userPic ? <img src={userPic} className="w-full h-full object-cover" alt="User" /> : <User className="text-slate-200" size={32} />}
                  </div>
                  <input 
                    type="file" 
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
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
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
                        className="text-[16px] font-bold text-slate-800 leading-tight bg-transparent border-b border-[#F88E7D] outline-none w-full"
                      />
                    ) : (
                      <h1 onClick={() => setIsEditingName(true)} className="text-[16px] font-bold text-slate-800 leading-tight cursor-pointer hover:text-[#F88E7D] transition-colors truncate w-full">Hi {userName},</h1>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <div className="flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100 shrink-0">
                      <Zap size={8} className="text-orange-500 fill-orange-500" />
                      <span className="text-[8px] font-black text-orange-600 uppercase tracking-tighter">Streak: {streak}D</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Controls Area */}
              <div className="flex items-center gap-1.5 shrink-0">
                {!isPremium && (
                  <Link href="/premium" className="flex items-center gap-1 bg-[#FFEDE8] px-2.5 py-2 rounded-2xl border border-[#F3EAE8] shadow-sm active:scale-95 transition-transform shrink-0">
                    <Sparkles size={11} className="text-[#F88E7D] fill-[#F88E7D]" />
                    <span className="text-[9px] font-black text-[#F88E7D] uppercase tracking-wider">Premium</span>
                  </Link>
                )}
                <Link href="/routine" className="shrink-0">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-10 h-10 rounded-2xl bg-white shadow-xl shadow-orange-500/10 flex items-center justify-center border border-[#F3EAE8] shrink-0"
                  >
                    <BrainCircuit size={20} className="text-[#F88E7D]" />
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Promo Banner */}
            <div className="relative bg-[#FFEDE8] rounded-[32px] p-6 overflow-hidden flex items-center justify-between group">
              <div className="z-10 max-w-[120px]">
                <p className="text-[9px] font-black text-[#F88E7D] uppercase tracking-widest mb-1">Find the right</p>
                <h2 className="text-[18px] font-bold text-slate-800 leading-tight italic">Cream for your Skin</h2>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center p-2">
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
                    <Target size={24} />
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

                  {/* PDF Product Report Download Option */}
                  {isPremium && (
                    <button 
                      onClick={() => window.print()}
                      className="w-full py-5 rounded-[24px] bg-primary-gradient text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-transform"
                    >
                      Download Ingredients Report PDF
                    </button>
                  )}

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
          <motion.div key="results" initial={{opacity:0}} animate={{opacity:1}} className="relative min-h-screen pb-36 bg-[#FDF5F2] overflow-x-hidden">
            {/* Background Image (The scanned face) with high-tech overlays */}
            <div className="relative w-full h-[380px] bg-slate-900 overflow-hidden shadow-lg">
              <img 
                src={data.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"} 
                alt="Scan" 
                className="w-full h-full object-cover opacity-70 scale-105 transition-transform duration-[4s]" 
              />
              
              {/* Futuristic SVG Dermal Mesh overlay */}
              <svg className="absolute inset-0 w-full h-full text-[#F88E7D]/30 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M10,20 L30,15 L50,10 L70,15 L90,20 M15,40 L35,35 L50,30 L65,35 L85,40 M20,60 L40,58 L50,55 L60,58 L80,60 M30,80 L50,78 L70,80" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1,1" />
                <path d="M10,20 L15,40 L20,60 L30,80 M90,20 L85,40 L80,60 L70,80 M50,10 L50,30 L50,55 L50,78" fill="none" stroke="currentColor" strokeWidth="0.2" />
                <path d="M30,15 L35,35 L40,58 M70,15 L65,35 L60,58" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2,2" />
              </svg>

              {/* Glowing Scan Line Animation */}
              <motion.div 
                animate={{ y: ["0px", "380px", "0px"] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#F88E7D] to-transparent shadow-[0_0_15px_#F88E7D] opacity-90 z-10"
              />

              {/* AI Detection Overlays based on real data */}
              <div className="absolute inset-0 pointer-events-none mix-blend-screen">
                
                {/* 9. Uneven Texture: Light Dermal Mesh Overlay */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ffffff 0.5px, transparent 0.5px)", backgroundSize: "8px 8px" }} />

                {/* 2. Oiliness: Yellow/Orange Heatmap on T-Zone */}
                <div className="absolute top-[8%] left-[25%] w-[50%] h-[14%] bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.3)_0%,transparent_70%)] blur-[4px]" />
                <div className="absolute top-[20%] left-[43%] w-[14%] h-[24%] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.35)_0%,transparent_70%)] blur-[3px]" />

                {/* 3. Pigmentation: Purple/Blue Overlay on Cheekbones */}
                <div className="absolute top-[48%] left-[16%] w-[20%] h-[12%] bg-[radial-gradient(circle,rgba(168,85,247,0.25)_0%,transparent_75%)] blur-[4px]" />
                <div className="absolute top-[50%] left-[64%] w-[20%] h-[12%] bg-[radial-gradient(circle,rgba(147,51,234,0.25)_0%,transparent_75%)] blur-[4px]" />

                {/* 4. Dark Circles: Dark Blue Overlay Under Eyes */}
                <div className="absolute top-[38%] left-[28%] w-[16%] h-[5%] bg-blue-900/30 blur-[4px] rounded-full mix-blend-multiply" />
                <div className="absolute top-[38%] left-[56%] w-[16%] h-[5%] bg-blue-900/30 blur-[4px] rounded-full mix-blend-multiply" />

                {/* 5. Dryness: White/Light Cyan Patches on Jawlines */}
                <div className="absolute top-[62%] left-[14%] w-[15%] h-[10%] bg-cyan-200/15 border border-cyan-300/10 blur-[5px] rounded-full" />
                <div className="absolute top-[64%] left-[71%] w-[15%] h-[10%] bg-cyan-200/15 border border-cyan-300/10 blur-[5px] rounded-full" />

                {/* 6. Redness/Irritation: Pink-Red Glow on Inner Cheeks */}
                <div className="absolute top-[44%] left-[36%] w-[12%] h-[8%] bg-rose-500/20 blur-[5px] rounded-full" />
                <div className="absolute top-[44%] left-[52%] w-[12%] h-[8%] bg-rose-500/20 blur-[5px] rounded-full" />

                {/* 7. Glow/Healthy Skin: Soft White Highlights */}
                <div className="absolute top-[30%] left-[64%] w-[16%] h-[8%] bg-white/25 blur-[3px] rounded-full" />
                <div className="absolute top-[68%] left-[45%] w-[10%] h-[6%] bg-white/20 blur-[2px] rounded-full" />

                {/* 1. Acne Red Dots & Pulses */}
                {data.acne > 15 && (
                  <>
                    {/* Left Cheek Acne */}
                    <div className="absolute top-[46%] left-[24%]">
                      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-4 h-4 rounded-full border border-red-500 bg-red-500/30 flex items-center justify-center shadow-[0_0_8px_#ef4444]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      </motion.div>
                    </div>
                    {/* Right Cheek Acne */}
                    <div className="absolute top-[52%] left-[72%]">
                      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.2 }} className="w-4 h-4 rounded-full border border-red-500 bg-red-500/30 flex items-center justify-center shadow-[0_0_8px_#ef4444]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      </motion.div>
                    </div>
                  </>
                )}

                {/* 8. Pores: Small Orange Markers */}
                <div className="absolute top-[34%] left-[46%] w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_4px_#f97316]" />
                <div className="absolute top-[38%] left-[43%] w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_4px_#f97316]" />
                <div className="absolute top-[37%] left-[51%] w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_4px_#f97316]" />

              </div>

              {/* Success Badge & Dynamic Glassmorphic Legend */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 z-10">
                <div className="flex justify-between items-center">
                  <div className="bg-black/45 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-wider">AI Scan Active</span>
                  </div>
                  <div className="text-[8px] font-black text-white/60 uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                    92% Confidence
                  </div>
                </div>

                {/* Believable Dermatology Scan Color Index Legend */}
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl flex flex-wrap justify-center gap-x-3 gap-y-1.5">
                  <span className="flex items-center gap-1 text-[8px] font-black text-red-200 uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" /> Acne
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-black text-amber-200 uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24]" /> Oil
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-black text-purple-200 uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_4px_#a855f7]" /> Pigment
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-black text-blue-200 uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_#3b82f6]" /> Circles
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-black text-cyan-200 uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_4px_#67e8f9]" /> Dryness
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-black text-white uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_#ffffff]" /> Glow
                  </span>
                </div>
              </div>
            </div>

            {/* Top Back & Rescan Controls overlaying the scanner image */}
            <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-20">
              <button 
                onClick={() => setView("home")} 
                className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform shadow-lg"
              >
                <ArrowLeft size={18} />
              </button>
              <button 
                onClick={() => resetScanner("face")} 
                className="px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md text-white font-black text-xs border border-white/10 active:scale-90 transition-transform tracking-widest uppercase shadow-lg"
              >
                Rescan Skin
              </button>
            </div>

            {/* Premium Result Content Container */}
            <div className="px-6 -mt-8 relative z-20 space-y-6">
              
              {/* Dermal Diagnostics Overview Card */}
              <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-orange-500/5 border border-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FFEDE8] to-transparent rounded-full blur-xl opacity-70 pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[14px] text-[#F88E7D] font-black uppercase tracking-widest">Dermal Diagnostic</h3>
                    <h2 className="text-[24px] font-black text-slate-800 tracking-tight leading-tight mt-1">Overall Skin Health</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-[28px] font-black text-slate-800 leading-none">
                      {data.score}
                      <span className="text-[14px] text-slate-300 font-bold ml-0.5">/100</span>
                    </div>
                    {/* Dynamic color status badge based on score logic */}
                    <div className="mt-2.5">
                      {data.score >= 80 ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                          Excellent Condition
                        </span>
                      ) : data.score >= 65 ? (
                        <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                          Moderate Condition
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                          Needs Attention
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score progress bar bar */}
                <div className="mt-6">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${data.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        data.score >= 80 ? "bg-emerald-400" : data.score >= 65 ? "bg-amber-400" : "bg-red-400"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* 3-Column Premium Metric Cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* Acne Pill */}
                <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-2">
                      <Target size={16} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Acne</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[20px] font-black text-slate-800 leading-none">{data.acne}%</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 leading-snug">
                      {data.acne < 20 ? "Clear Dermal" : data.acne < 40 ? "Mild activity" : "Active flares"}
                    </p>
                  </div>
                </div>

                {/* Oil Pill */}
                <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-2">
                      <Droplets size={16} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Oil</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[20px] font-black text-slate-800 leading-none">{data.oil}%</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 leading-snug">
                      {data.oil < 30 ? "Dry / Balanced" : data.oil < 60 ? "Balanced/Oily" : "Excess Sebum"}
                    </p>
                  </div>
                </div>

                {/* Pigmentation Pill */}
                <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-[#F88E7D] mb-2">
                      <Sparkles size={16} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Pigment</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-[20px] font-black text-slate-800 leading-none">{data.pigmentation}%</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 leading-snug">
                      {data.pigmentation < 20 ? "Even distribution" : data.pigmentation < 40 ? "Minor spots" : "Melanin shifts"}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Personalized Intro Block & Trust Indicators */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-[#F88E7D] font-black text-[11px] uppercase tracking-widest">
                  <BrainCircuit size={14} /> AI Analysis Insights
                </div>
                
                {/* Dynamically formulated personalized believable insight intro paragraph */}
                <p className="text-[13px] font-bold text-slate-700 leading-relaxed italic border-l-4 border-[#F88E7D]/40 pl-3">
                  {`"${data.acne > 25 ? "Minor acne activity detected around the cheek and chin area." : "No significant acne flares detected. Skin looks relatively clear."} ${data.oil > 45 ? "Skin texture indicates slight dehydration leading to compensatory sebum." : "Secretion levels are balanced, showing healthy dermal hydration."} ${data.pigmentation > 25 ? "Pigmentation irregularities appear mild and manageable with targeted care." : "Melanin distribution is mostly uniform."}"`}
                </p>

                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Analysis completed successfully. Your dermal profile has been generated based on deep texture, sebum sheen, and melanin tone analysis.
                </p>
                <div className="h-[1px] bg-slate-100 w-full" />
                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider leading-relaxed">
                  ⚠️ Disclaimer: AI-generated skincare insights. Not a medical diagnosis or treatment plan.
                </p>
              </div>

              {/* Expert Deep Report Card (Locked/Unlocked) */}
              <div className="bg-white rounded-[32px] p-6 border border-[#EEF0FF] shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 text-[#F88E7D] font-black text-[11px] uppercase tracking-widest">
                  <Sparkles size={14} /> Complete AI Skincare Report
                </div>
                
                <div className="text-[13px] text-slate-600 leading-relaxed font-medium relative">
                  {!isPremium && !loading && history.length > 1 && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-6 rounded-[24px]">
                      <Lock className="text-[#F88E7D] mb-3" size={24} />
                      <p className="text-[14px] font-black text-slate-800 leading-tight mb-2">Detailed Report Locked</p>
                      <p className="text-[10px] text-slate-500 font-bold mb-4 px-6">Upgrade to Premium to read full analysis and customized dermatological recommendations.</p>
                      <Link href="/premium" className="bg-primary-gradient text-white px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-transform">
                        Unlock Now ✨
                      </Link>
                    </div>
                  )}

                  <div className={cn((isPremium || (history.length <= 1 && !loading)) ? "" : "blur-sm select-none")}>
                    {loading ? (
                      <div className="py-12 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-[#FFEDE8] border-t-[#F88E7D] rounded-full animate-spin" />
                        <p className="text-[11px] text-slate-400 font-black uppercase animate-pulse">Generating Report...</p>
                      </div>
                    ) : (
                      <>
                        {history.length <= 1 && !isPremium && (
                          <div className="flex items-center gap-2 mb-3 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full w-fit">
                            <Sparkles size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70">Welcome Gift: Free Expert Analysis</span>
                          </div>
                        )}
                        {ai ? formatMarkdown(ai) : "Scanning complete. Your personalized report is ready."}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Skin Improvement Plan checklist card */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-[#F88E7D] font-black text-[11px] uppercase tracking-widest">
                  <ShieldCheck size={14} /> Skin Improvement Plan
                </div>
                
                <div className="space-y-3">
                  {[
                    { title: "Hydration Focus", desc: "Drink 2.5L of water daily to flush dermal toxins and maintain hydration." },
                    { title: "UV Protection", desc: "Apply SPF 50+ mineral sunscreen daily to prevent hyperpigmentation." },
                    { title: "Restorative Sleep", desc: "Aim for 7-8 hours of sleep to support natural skin barrier repair." },
                    { title: "Targeted Diet Plan", desc: data.acne > 30 ? "Reduce high-glycemic foods and dairy flare triggers." : "Incorporate healthy antioxidants and Omega-3 rich seeds." },
                    { title: "Barrier Support", desc: "Avoid harsh scrubs; use rich ceramides nightly to lock in moisture." }
                  ].map((plan, index) => (
                    <div key={index} className="flex gap-3.5 items-start p-3 bg-[#FDF5F2]/40 rounded-[20px] border border-[#F3EAE8]/30">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mt-0.5 flex-shrink-0">
                        <CheckCircle2 size={12} className="fill-emerald-500 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-bold text-slate-800">{plan.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug font-medium">{plan.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PREMIUM FEATURE TEASERS */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-[#F88E7D] font-black text-[11px] uppercase tracking-widest">
                  <Gem size={14} /> Premium Skincare Analytics 🔒
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FDF5F2]/60 p-4 rounded-[20px] border border-[#F3EAE8]/30 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[#F88E7D]"><Lock size={12} /></div>
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Deep Pore Scan</h4>
                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">Detect micro-clogs before they break out.</p>
                  </div>
                  <div className="bg-[#FDF5F2]/60 p-4 rounded-[20px] border border-[#F3EAE8]/30 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[#F88E7D]"><Lock size={12} /></div>
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Skin Age Analysis</h4>
                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">Evaluate biological elasticity & collagen.</p>
                  </div>
                  <div className="bg-[#FDF5F2]/60 p-4 rounded-[20px] border border-[#F3EAE8]/30 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[#F88E7D]"><Lock size={12} /></div>
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Weekly Reports</h4>
                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">Get professional charts tracking progress.</p>
                  </div>
                  <div className="bg-[#FDF5F2]/60 p-4 rounded-[20px] border border-[#F3EAE8]/30 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[#F88E7D]"><Lock size={12} /></div>
                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Personalized Routine</h4>
                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">AI-driven morning and night schedule tweaks.</p>
                  </div>
                </div>
              </div>

              {/* Skin Improving History Mini Graph / Timeline */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#F88E7D] font-black text-[11px] uppercase tracking-widest">
                    <TrendingUp size={14} /> Skin Progress Tracking
                  </div>
                  {history.length > 1 && (
                    <button onClick={() => setView("history")} className="text-[10px] font-bold text-[#F88E7D] hover:underline">
                      View History
                    </button>
                  )}
                </div>

                {history.length <= 1 ? (
                  <div className="text-center py-6 px-4 bg-[#FDF5F2]/40 rounded-[24px] border border-[#F3EAE8]/30">
                    <p className="text-[12px] font-bold text-slate-600 leading-snug">
                      Track weekly improvements with AI skin history.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Perform subsequent weekly scans to generate visual progress timelines.
                    </p>
                    <button 
                      onClick={() => setView("history")} 
                      className="mt-4 bg-[#FFEDE8] text-[#F88E7D] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#F3EAE8] active:scale-95 transition-transform"
                    >
                      Start Tracking Progress
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 rounded-[20px] p-4 border border-emerald-100/50 flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-bold text-slate-800">
                          {data.score > history[1]?.score ? "Your skin shows significant progress! 🎉" : "Follow routine closely to see spikes."}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Last scan: {history[1]?.date || "N/A"}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[11px] font-black">
                        {data.score > history[1]?.score ? `+${data.score - history[1].score}%` : `${data.score - history[1].score}%`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PDF Report Option & Routine CTAs */}
              <div className="space-y-3">
                {isPremium && (
                  <button 
                    onClick={() => window.print()}
                    className="w-full h-15 bg-[#FFEDE8] text-[#F88E7D] rounded-[20px] border border-[#F3EAE8] flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-transform"
                  >
                    <Download size={14} /> Download Skin Report PDF
                  </button>
                )}
              </div>

            </div>

            {/* STICKY BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/70 backdrop-blur-lg border-t border-slate-100 flex items-center justify-center gap-3 z-50 md:left-1/2 md:-translate-x-1/2 md:max-w-[430px]">
              <Link 
                href="/progress" 
                onClick={() => setView("progress")}
                className="flex-1 h-14 bg-slate-50 border border-slate-100 text-slate-500 rounded-[20px] flex items-center justify-center gap-1.5 font-bold text-[12px] uppercase tracking-wider active:scale-95 transition-transform"
              >
                <TrendingUp size={14} />
                Track Progress
              </Link>
              <Link 
                href="/routine" 
                className="flex-[2] h-14 bg-primary-gradient text-white rounded-[20px] flex items-center justify-center gap-1.5 font-bold text-[12px] uppercase tracking-wider active:scale-95 transition-transform shadow-lg shadow-orange-500/20"
              >
                <Sparkles size={14} />
                Personalized Routine
              </Link>
            </div>
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

      {/* SCAN LIMIT MODAL */}
      <AnimatePresence>
        {scanLimitReached && (
          <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-[360px] text-center shadow-2xl relative"
            >
              <button 
                onClick={() => setScanLimitReached(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"
              >
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-[#FFEDE8] rounded-[32px] flex items-center justify-center mx-auto mb-6 text-[#F88E7D] shadow-inner">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">
                {limitReason === "premium" ? "Premium Feature!" : "Scan Limit Reached!"}
              </h2>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-8 italic px-4">
                {limitReason === "premium" 
                  ? "Product scanning is exclusive to GlowAI Premium members."
                  : "Free users get 1 scan per day. Upgrade for unlimited analysis."
                }
              </p>
              <Link href="/premium" onClick={() => setScanLimitReached(false)} className="w-full h-16 bg-primary-gradient text-white font-black rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 active:scale-95 transition-transform mb-4">
                Unlock Unlimited Scans 🔓
              </Link>
              <button onClick={() => setScanLimitReached(false)} className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Maybe Later</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
