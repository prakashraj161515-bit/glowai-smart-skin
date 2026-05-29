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
  const [expandedSection, setExpandedSection] = useState<string | null>("insights");
  const [premiumModal, setPremiumModal] = useState<string | null>(null);

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
      <div className="fixed inset-0 bg-[#FAF8F6] flex flex-col items-center justify-center z-[200]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-24 h-24 bg-white rounded-[22px] overflow-hidden flex items-center justify-center shadow-2xl shadow-[#F0886A]/10 border-2 border-white">
            <img src="/logo.png" className="w-full h-full object-cover" alt="GlowAI Logo" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#2C1F1A] tracking-[-0.3px]">GLOWAI</h1>
            <p className="text-[rgba(44,31,26,0.38)] text-xs font-bold uppercase tracking-[0.3em] mt-1">Smart Skin AI</p>
          </div>
          <div className="mt-8 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-[#F0886A] rounded-full"
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
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#2C1F1A] font-bold">$1</strong>');
      
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 mb-1.5 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F0886A] mt-2 flex-shrink-0" />
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
    <div className="min-h-screen bg-[#FAF8F6] font-sans pb-32">

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
              className="bg-white rounded-[22px] p-8 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">✨</div>
                <h2 className="text-2xl font-bold text-[#2C1F1A]">Welcome to GlowAI</h2>
                <p className="text-[rgba(44,31,26,0.38)] text-sm mt-2 font-medium">Enter your name to get started</p>
              </div>
              <input
                type="text"
                value={demoName}
                onChange={e => setDemoName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleDemoLogin()}
                placeholder="Your name"
                autoFocus
                className="w-full bg-[#FAF8F6] h-14 px-5 rounded-[20px] border-2 border-[rgba(60,30,20,0.08)] font-bold text-base outline-none focus:border-[#F0886A] transition-colors mb-4"
              />
              <button
                onClick={handleDemoLogin}
                disabled={!demoName.trim()}
                className="w-full bg-gradient-to-r from-[#F0886A] to-[#f97316] text-white h-14 rounded-[20px] font-bold text-[15px] active:scale-95 transition-transform shadow-lg shadow-[#F0886A]/25 disabled:opacity-40"
              >
                Continue →
              </button>
              <p className="text-center text-[10px] text-[rgba(44,31,26,0.30)] font-bold uppercase tracking-widest mt-4">
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
            className="fixed inset-0 z-[100] bg-[#FAF8F6] flex flex-col items-center justify-between py-20 px-8"
          >
            {/* Branding */}
            <div className="text-center mt-12">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-24 h-24 bg-white rounded-[22px] overflow-hidden flex items-center justify-center shadow-2xl shadow-[#F0886A]/10 mx-auto mb-6 border-2 border-white"
              >
                <img src="/logo.png" className="w-full h-full object-cover" alt="GlowAI Logo" />
              </motion.div>
              <h1 className="text-4xl font-bold text-[#2C1F1A] tracking-[-0.3px] mb-2 uppercase italic">GlowAI</h1>
              <p className="text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-[0.3em] text-[10px]">Smart Skin AI</p>
            </div>

            {/* Content */}
            <div className="text-center px-4">
              <h2 className="text-[32px] font-bold text-[#2C1F1A] leading-tight tracking-[-0.3px]">
                Analyze your skin<br />in seconds.
              </h2>
              <p className="text-[rgba(44,31,26,0.38)] mt-4 text-[16px] font-medium max-w-[240px] mx-auto leading-relaxed">
                Personalized AI coaching for your best glow yet.
              </p>
            </div>

            {/* Actions */}
            <div className="w-full space-y-4">
              <button 
                onClick={handleLogin}
                className="w-full bg-white text-[#2C1F1A] h-16 rounded-2xl flex items-center justify-center gap-4 font-bold text-[17px] shadow-xl shadow-slate-200/50 active:scale-95 transition-transform border border-[rgba(60,30,20,0.08)]"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
              


              <p className="text-[10px] text-[rgba(44,31,26,0.30)] text-center px-8 leading-relaxed mt-6">
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
            className="fixed inset-0 z-[110] bg-[#FAF8F6] flex flex-col md:left-1/2 md:-translate-x-1/2 md:max-w-[430px] md:shadow-2xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="flex gap-2 px-6 pt-14 pb-4 flex-shrink-0">
              {[1,2,3,4,5].map(s => (
                <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", onboardingStep >= s ? "bg-[#F0886A]" : "bg-slate-100")} />
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
                        className="w-24 h-24 bg-white rounded-[22px] overflow-hidden flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(248,142,125,0.15)] border-2 border-white"
                      >
                        <img src="/logo.png" className="w-full h-full object-cover" alt="GlowAI Logo" />
                      </motion.div>
                      <h2 className="text-[34px] text-[#2C1F1A] leading-[1.1]" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}>Your Journey to <span className="text-[#F0886A]">Perfect Glow</span></h2>
                      <p className="text-[rgba(44,31,26,0.38)] mt-5 text-[17px] font-medium leading-relaxed">Join 50,000+ users transforming their skin health with AI.</p>
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
                          <div className="w-14 h-14 rounded-[18px] bg-[#FAF8F6] flex items-center justify-center text-2xl flex-shrink-0">
                            {benefit.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#2C1F1A] text-[17px]">{benefit.title}</h3>
                            <p className="text-[rgba(44,31,26,0.38)] text-[13px] mt-0.5 font-medium leading-snug">{benefit.desc}</p>
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
                      <div className="w-16 h-16 bg-[#FAF8F6] rounded-2xl flex items-center justify-center border-2 border-[rgba(60,30,20,0.08)] mb-4">
                        <User size={32} className="text-[#F0886A]" />
                      </div>
                    </div>
                    <div className="px-6 pt-2 pb-8 flex flex-col gap-6 flex-1">
                      <div>
                        <p className="text-[11px] font-bold text-[#F0886A] uppercase tracking-[0.3em]">Step 2 of 5</p>
                        <h2 className="text-2xl font-bold text-[#2C1F1A] mt-1">Hi! What&apos;s your name? 👋</h2>
                        <p className="text-[rgba(44,31,26,0.38)] text-sm mt-2 font-medium">We&apos;ll personalize your entire skincare experience just for you.</p>
                      </div>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-[#FAF8F6] h-16 px-6 rounded-[24px] border-2 border-[rgba(60,30,20,0.08)] font-bold text-lg outline-none focus:border-[#F0886A] transition-colors"
                      />

                    </div>
                  </div>
                )}

                {/* Step 3 – Gender */}
                {onboardingStep === 3 && (
                  <div className="flex flex-col flex-1">
                    <div className="pt-14 px-6 pb-4">
                      <div className="w-16 h-16 bg-[#FAF8F6] rounded-2xl flex items-center justify-center border-2 border-[rgba(60,30,20,0.08)] mb-4">
                        <ScanFace size={32} className="text-[#F0886A]" />
                      </div>
                    </div>
                    <div className="px-6 pt-2 pb-8 flex flex-col gap-6 flex-1">
                      <div>
                        <p className="text-[11px] font-bold text-[#F0886A] uppercase tracking-[0.3em]">Step 3 of 5</p>
                        <h2 className="text-2xl font-bold text-[#2C1F1A] mt-1">Your gender? 🧬</h2>
                        <p className="text-[rgba(44,31,26,0.38)] text-sm mt-2 font-medium">This helps GlowAI understand your hormone balance and skin needs.</p>
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
                              "rounded-[22px] border-2 overflow-hidden transition-all flex flex-col",
                              gender === g ? "border-[#F0886A] shadow-xl shadow-[#F0886A]/20" : "border-[rgba(60,30,20,0.08)]"
                            )}
                          >
                            <div className={cn("h-32 flex items-center justify-center text-5xl transition-transform active:scale-90", color)}>
                              {emoji}
                            </div>
                            <div className={cn("py-3 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider", gender === g ? "bg-[#F0886A] text-white" : "bg-white text-slate-500")}>
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
                      <p className="text-[11px] font-bold text-[#F0886A] uppercase tracking-[0.3em]">Step 4 of 5</p>
                      <h2 className="text-2xl font-bold text-[#2C1F1A] mt-1">
                        {loading ? "Analyzing Skin... 🤖" : "AI Skin Scan 📸"}
                      </h2>
                      <p className="text-[rgba(44,31,26,0.38)] text-sm mt-2 font-medium">
                        {loading 
                          ? "Our AI is detecting your skin patterns. Almost there..." 
                          : "Position your face in the guide. Our AI will analyze Acne, Oil, and Glow."}
                      </p>
                    </div>
                    <div className="flex-1 min-h-[400px] flex items-center justify-center bg-[#F5F1EE] rounded-[22px] overflow-hidden relative border-2 border-white shadow-inner">
                      {loading ? (
                        <div className="flex flex-col items-center gap-6 p-8 text-center">
                           <div className="relative w-20 h-20">
                             <div className="absolute inset-0 border-4 border-orange-100 rounded-full" />
                             <div className="absolute inset-0 border-4 border-t-[#F0886A] rounded-full animate-spin" />
                           </div>
                           <div>
                             <p className="text-[13px] text-[#F0886A] font-bold uppercase tracking-[0.2em] animate-pulse">Deep Scan in Progress</p>
                             <p className="text-[11px] text-[rgba(44,31,26,0.38)] mt-2 font-medium">Analyzing pores, texture, and hydration...</p>
                           </div>
                        </div>
                      ) : ai.startsWith("⚠️") ? (
                        <div className="flex flex-col items-center gap-4 p-8 text-center">
                          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                            <AlertCircle size={32} />
                          </div>
                          <p className="text-sm font-bold text-[#2C1F1A]">{ai}</p>
                          <button 
                            onClick={() => { setAi(""); setLoading(false); }}
                            className="bg-[#F0886A] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
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
                    <h2 className="text-3xl font-bold text-[#2C1F1A] mb-2">You&apos;re all set! ✨</h2>
                    <p className="text-[rgba(44,31,26,0.38)] font-medium mb-8">Your skin has been analyzed. We&apos;ve prepared a personalized routine just for you.</p>
                    
                    <div className="w-full bg-[#FAF8F6] rounded-[22px] p-6 mb-8 border-2 border-[rgba(60,30,20,0.08)]">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-[rgba(44,31,26,0.38)] uppercase tracking-widest">Initial Glow Score</span>
                          <span className="text-2xl font-bold text-[#F0886A]">{data?.score || 0}%</span>
                       </div>
                       <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${data?.score || 0}%` }}
                            className="h-full bg-[#F0886A]"
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
                  className="w-full bg-gradient-to-r from-[#F0886A] to-[#f97316] text-white h-16 rounded-[24px] font-bold text-[15px] uppercase tracking-widest shadow-xl shadow-[#F0886A]/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Continue →
                </button>
              ) : onboardingStep === 4 ? (
                <p className="text-center text-[10px] text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-widest py-2">
                  Use the camera button to scan
                </p>
              ) : (
                <button
                  onClick={completeOnboarding}
                  className="w-full bg-[#10b981] text-white h-16 rounded-[24px] font-bold text-[15px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Start My Glow Journey ✨
                </button>
              )}
              {onboardingStep > 1 && onboardingStep < 5 && (
                <button
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="w-full text-[rgba(44,31,26,0.38)] font-bold text-xs uppercase tracking-widest py-2"
                >
                  ← Go Back
                </button>
              )}
            </div>
          </motion.div>
        )}


        {/* HOME — NEW DESIGN */}
        {view === "home" && (
          <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="pb-36 overflow-y-auto">

            {/* ── GREETING ROW ── */}
            <div className="flex items-center justify-between px-5 pt-14 pb-5">
              <div>
                <div className="flex items-center gap-1">
                  {isEditingName ? (
                    <input autoFocus value={userName}
                      onChange={e => setUserName(e.target.value)}
                      onBlur={() => { setIsEditingName(false); localStorage.setItem("velmora_user_name", userName); }}
                      onKeyDown={e => { if(e.key==="Enter"){ setIsEditingName(false); localStorage.setItem("velmora_user_name", userName); }}}
                      className="text-[22px] font-bold text-[#2C1F1A] bg-transparent border-b border-[#F0886A] outline-none" />
                  ) : (
                    <h1 onClick={() => setIsEditingName(true)}
                      className="text-[22px] font-bold text-[#2C1F1A] cursor-pointer leading-tight">
                      Hi {userName}, ✦
                    </h1>
                  )}
                </div>
                <p className="text-[13px] text-[rgba(44,31,26,0.56)] mt-1">Transform Your Skin&apos;s Health</p>
              </div>
              <div className="relative w-[46px] h-[46px] rounded-full overflow-hidden flex-shrink-0"
                style={{ backgroundColor: "#F0886A" }}>
                {userPic
                  ? <img src={userPic} className="w-full h-full object-cover" alt="User" />
                  : <span className="w-full h-full flex items-center justify-center text-[#241712] font-serif text-xl">{userName?.[0]?.toUpperCase() || "U"}</span>
                }
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if(file){ const r=new FileReader(); r.onloadend=()=>{ const b=r.result as string; setUserPic(b); localStorage.setItem("velmora_user_pic",b); }; r.readAsDataURL(file); }
                  }} />
              </div>
            </div>

            {/* ── HERO BANNER ── */}
            <div className="mx-5 mb-4">
              <button onClick={() => resetScanner("face")} className="w-full active:scale-[0.98] transition-transform">
                <div className="relative rounded-[22px] overflow-hidden min-h-[148px] text-left"
                  style={{ background: "linear-gradient(125deg, #F9DDD0 0%, #F5C9B5 55%, #F0B8A2 100%)" }}>
                  <div className="p-5 relative z-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.8px] mb-1.5" style={{ color:"rgba(60,30,20,0.50)" }}>Find the right</p>
                    <h2 className="text-[28px] leading-[1.05] mb-3" style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontStyle:"italic", color:"#2C1F1A" }}>
                      Routine<br/>for your<br/>Skin
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold" style={{ color:"#C44E28" }}>View My Score</span>
                      <ChevronRight size={14} color="#C44E28" strokeWidth={2.5} />
                    </div>
                  </div>
                  {/* Bottle SVG illustration */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ filter:"drop-shadow(0 8px 20px rgba(180,80,40,0.20))" }}>
                    <div className="w-8 h-3 rounded-md mb-0" style={{ backgroundColor:"rgba(200,100,60,0.55)" }} />
                    <div className="w-7 h-5 rounded-lg" style={{ backgroundColor:"rgba(255,255,255,0.65)" }} />
                    <div className="w-12 h-20 rounded-[18px] relative overflow-hidden" style={{ background:"linear-gradient(135deg,rgba(255,220,200,0.7),rgba(240,160,120,0.4))" }}>
                      <div className="absolute inset-x-2 top-3 bottom-3 rounded-[10px]" style={{ backgroundColor:"rgba(255,255,255,0.45)" }}>
                        <div className="h-0.5 w-full mb-1.5 mt-2 mx-auto" style={{ backgroundColor:"rgba(180,80,40,0.4)", width:"70%" }} />
                        <div className="h-px w-full mb-1 mx-auto" style={{ backgroundColor:"rgba(180,80,40,0.25)", width:"55%" }} />
                        <div className="h-px w-full mx-auto" style={{ backgroundColor:"rgba(180,80,40,0.20)", width:"70%" }} />
                      </div>
                      <div className="absolute right-1.5 top-2 bottom-2 w-1.5 rounded-full" style={{ backgroundColor:"rgba(255,255,255,0.5)" }} />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="px-5 grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => resetScanner("face")} className="flex items-center gap-3 p-3.5 rounded-[18px] bg-white border active:scale-95 transition-transform text-left" style={{ borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 16px rgba(60,30,20,0.07)" }}>
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor:"rgba(240,136,106,0.12)" }}>
                  <ScanFace size={20} color="#C44E28" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#2C1F1A] leading-tight">Scan Skin</p>
                  <p className="text-[11px]" style={{ color:"rgba(44,31,26,0.56)" }}>AI analysis</p>
                </div>
              </button>
              <button onClick={() => resetScanner("product")} className="flex items-center gap-3 p-3.5 rounded-[18px] border active:scale-95 transition-transform text-left" style={{ backgroundColor:"#EBF3FE", borderColor:"rgba(78,142,212,0.20)", boxShadow:"0 4px 16px rgba(60,30,20,0.07)" }}>
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor:"rgba(78,142,212,0.16)" }}>
                  <Target size={20} color="#4E8ED4" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#2C1F1A] leading-tight">Scan Product</p>
                  <p className="text-[11px]" style={{ color:"rgba(44,31,26,0.56)" }}>Ingredients</p>
                </div>
              </button>
            </div>

            {/* ── AI CHAT BANNER ── */}
            <div className="px-5 mb-5">
              <Link href="/coach" className="flex items-center gap-3.5 px-4 py-3.5 rounded-[18px] active:scale-[0.98] transition-transform" style={{ background:"linear-gradient(120deg,#F9DDD0,#F5C9B5)", border:"1px solid rgba(196,78,40,0.15)", boxShadow:"0 4px 16px rgba(196,78,40,0.10)" }}>
                <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor:"#F0886A", boxShadow:"0 4px 14px rgba(240,136,106,0.40)" }}>
                  <Sparkles size={20} color="white" fill="white" />
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-bold text-[#2C1F1A]">Ask GlowAI</p>
                  <p className="text-[12px]" style={{ color:"rgba(44,31,26,0.55)" }}>Expert skin advice, anytime</p>
                </div>
                <ChevronRight size={18} color="rgba(44,31,26,0.35)" />
              </Link>
            </div>

            {/* ── SCORE CARD (if scan exists) ── */}
            {data && (
              <div className="px-5 mb-5">
                <div className="bg-white rounded-[22px] p-4 border flex items-center gap-4" style={{ borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 20px rgba(60,30,20,0.08)" }}>
                  {/* SVG Score Ring */}
                  <div className="relative w-[90px] h-[90px] flex-shrink-0">
                    <svg width="90" height="90" className="absolute inset-0" style={{ transform:"rotate(-90deg)" }}>
                      <circle cx="45" cy="45" r="36" fill="none" stroke="#F5F1EE" strokeWidth="8" />
                      <circle cx="45" cy="45" r="36" fill="none"
                        stroke={data.score >= 80 ? "#D9B86A" : data.score >= 60 ? "#7FB389" : data.score >= 40 ? "#E8A24C" : "#E0685C"}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2*Math.PI*36 * data.score/100} ${2*Math.PI*36}`}
                        style={{ filter:`drop-shadow(0 0 6px ${data.score>=80?"#D9B86A":data.score>=60?"#7FB389":data.score>=40?"#E8A24C":"#E0685C"})` }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[24px] font-bold leading-none" style={{ fontFamily:"'Space Grotesk',monospace", color:"#2C1F1A" }}>{data.score}</span>
                      <span className="text-[9px] font-semibold" style={{ color: data.score>=80?"#D9B86A":data.score>=60?"#7FB389":data.score>=40?"#E8A24C":"#E0685C" }}>
                        {data.score>=80?"Radiant":data.score>=60?"Good":data.score>=40?"Fair":"Needs care"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[18px] text-[#2C1F1A] leading-tight mb-2" style={{ fontFamily:"'Instrument Serif',Georgia,serif" }}>Your Skin<br/>Score</p>
                    <button onClick={() => setView("results")} className="flex items-center gap-1.5 text-[13px] font-bold text-[#C44E28]">
                      View full report <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── CATEGORY PILLS ── */}
            <div className="px-5 mb-4">
              <div className="flex gap-2 overflow-x-auto">
                {["All","Skincare","Routine","Diet","Progress"].map(c => (
                  <Link key={c} href={c==="Routine"?"/routine":c==="Diet"?"/diet":c==="Progress"?"/progress":"#"}
                    className="px-4 py-2 rounded-full text-[14px] font-bold flex-shrink-0 transition-colors"
                    style={{ backgroundColor: c==="All"?"#F0886A":"#F5F1EE", color: c==="All"?"#241712":"rgba(44,31,26,0.56)" }}>
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── FEATURE GRID ── */}
            <div className="px-5 grid grid-cols-2 gap-3">
              {[
                { href:"/routine", bg:"#FEF0EB", icon:"📋", title:"Daily Routine",  sub:"Step-by-step plan" },
                { href:"/store",   bg:"#EFF0FD", icon:"🧴", title:"Products",       sub:"Curated for you" },
                { href:"/diet",    bg:"#EDF7EE", icon:"🥗", title:"Diet Plan",       sub:"Skin nutrition" },
                { href:"/coach",   bg:"#EBF3FE", icon:"✦",  title:"AI Coach",        sub:"Expert advice" },
                { href:"/progress",bg:"#FEF7EB", icon:"📈", title:"Progress",        sub:"Track results" },
                { href:"/premium", bg:"#FDEDF0", icon:"💎", title:"Premium",         sub:"Unlock all features" },
              ].map(item => (
                <Link key={item.title} href={item.href}
                  className="rounded-[20px] overflow-hidden bg-white border active:scale-95 transition-transform"
                  style={{ borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 3px 14px rgba(60,30,20,0.07)" }}>
                  <div className="h-[100px] flex items-center justify-center text-4xl" style={{ backgroundColor: item.bg }}>{item.icon}</div>
                  <div className="p-3">
                    <p className="text-[13.5px] font-bold text-[#2C1F1A] leading-tight">{item.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color:"rgba(44,31,26,0.56)" }}>{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── INSIGHT STRIP (if history) ── */}
            {history.length >= 2 && (
              <div className="px-5 mt-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-[18px] border" style={{ borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 3px 12px rgba(60,30,20,0.06)" }}>
                  <div className="w-11 h-11 rounded-[13px] flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ backgroundColor: history[0].score > history[1].score ? "#EDF7EE" : "rgba(240,136,106,0.10)" }}>
                    {history[0].score > history[1].score ? "📈" : "📉"}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-[#2C1F1A]">
                      {history[0].score > history[1].score ? "Skin improving!" : "Skin needs attention"}
                    </p>
                    <p className="text-[11px]" style={{ color:"rgba(44,31,26,0.56)" }}>
                      Score {history[0].score > history[1].score ? "up" : "down"} {Math.abs(history[0].score - history[1].score)}% since last scan
                    </p>
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: history[0].score > history[1].score ? "#7FB389" : "#E0685C" }}>
                    {history[0].score > history[1].score ? "+" : "-"}{Math.abs(history[0].score - history[1].score)}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SCANNER — PROTOTYPE DESIGN */}
        {view === "scanner" && (
          <motion.div key="scanner" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-[#0c0908] z-50 flex flex-col" style={{maxWidth:430,margin:"0 auto"}}>

            {/* Back */}
            <button onClick={()=>setView("home")}
              className="absolute top-14 left-3.5 z-10 w-9 h-9 rounded-[11px] flex items-center justify-center cursor-pointer border"
              style={{background:"rgba(255,255,255,0.18)", backdropFilter:"blur(10px)", borderColor:"rgba(255,255,255,0.25)"}}>
              <span className="text-white text-[20px]">‹</span>
            </button>

            {/* Camera bg */}
            <div className="absolute inset-0" style={{background:"repeating-linear-gradient(135deg,rgba(240,136,106,0.07) 0 14px,rgba(255,255,255,0.015) 14px 28px)"}}/>

            {/* Instructions */}
            <div className="absolute top-24 left-6 right-6 text-center z-10">
              <h2 className="text-[26px] text-white mb-2.5 leading-tight" style={{fontFamily:"'Instrument Serif',Georgia,serif"}}>
                {scanMode==="face" ? "Position your face in the oval" : "Point at product label"}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full" style={{background:"rgba(127,179,137,0.20)", border:"1px solid rgba(127,179,137,0.40)"}}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8FC299]"/>
                <span className="text-[13px] font-semibold text-[#8FC299]">Lighting: Great</span>
              </div>
            </div>

            {/* Face oval */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] flex items-end justify-center" style={{width:236, height:312, borderRadius:"50%", border:"2.5px dashed rgba(240,136,106,0.80)", boxShadow:"0 0 0 2000px rgba(0,0,0,0.45)"}}>
              <span className="text-[10px] uppercase tracking-[1px] mb-1" style={{color:"rgba(244,238,233,0.38)"}}>your face here</span>
            </div>

            {/* Tips */}
            <div className="absolute left-6 right-6 text-center z-10" style={{bottom:168}}>
              <p className="text-[13px]" style={{color:"rgba(255,255,255,0.60)"}}>Remove glasses · tie back hair · use natural light</p>
            </div>

            {/* Controls */}
            <div className="absolute left-0 right-0 flex items-center justify-center gap-11 z-10" style={{bottom:96}}>
              <div className="w-[50px] h-[50px] rounded-[13px] bg-white/15 flex items-center justify-center text-[20px]">🕐</div>
              <button
                className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer bg-transparent" style={{border:"4px solid rgba(255,255,255,0.90)"}}>
                <div className="w-[68px] h-[68px] rounded-full" style={{background:"#F0886A", boxShadow:"0 0 24px rgba(240,136,106,0.70)"}}/>
              </button>
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-[20px] cursor-pointer" style={{background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.20)"}}>🔄</div>
            </div>

            {/* Actual camera (visible + functional) */}
            <div className="flex-1 flex items-center justify-center" style={{paddingTop:96}}>
              <CameraScanner onResult={handleResult} mode={scanMode}/>
            </div>
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
              <div className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2">
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
                  <h3 className="text-[20px] font-bold text-[#2C1F1A] tracking-[-0.3px]">Ingredient Analysis</h3>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full w-fit">
                    <CheckCircle2 size={12} strokeWidth={3} /> AI Approved
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#F5F1EE] border border-[rgba(60,30,20,0.08)] flex flex-col items-center justify-center text-[rgba(44,31,26,0.38)] relative overflow-hidden group">
                  <ShoppingBag size={24} strokeWidth={1.2} className="text-[rgba(44,31,26,0.30)]" />
                  <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                </div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center gap-6 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[rgba(60,30,20,0.08)] border-t-blue-500 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
                  </div>
                  <div>
                    <p className="text-[12px] text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-widest animate-pulse">Scanning Molecular Data...</p>
                    <p className="text-[10px] text-[rgba(44,31,26,0.30)] font-medium mt-1">Checking against 10,000+ medical databases</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Doctor/Expert Badge */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[22px] p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
                        <BrainCircuit size={24} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold leading-tight uppercase tracking-wide">Doctor Approved Analysis</p>
                        <p className="text-[10px] text-blue-100 font-medium">Safe for {skinType} Skin</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[22px] p-6 border border-[#EEF0FF] shadow-sm relative overflow-hidden min-h-[200px]">
                    <div className="text-[14px] text-slate-600 leading-relaxed font-medium">
                      {ai ? formatMarkdown(ai) : "Scanning complete. Your personalized report is ready."}
                    </div>
                  </div>

                  {/* PDF Product Report Download Option */}
                  {isPremium && (
                    <button 
                      onClick={() => window.print()}
                      className="w-full py-5 rounded-[24px] bg-primary-gradient text-white font-bold text-sm uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-transform"
                    >
                      Download Ingredients Report PDF
                    </button>
                  )}

                  <button 
                    onClick={() => setView("home")}
                    className="w-full py-5 rounded-[24px] bg-slate-900 text-white font-bold text-sm uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-transform"
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
          loading ? (
            <motion.div key="results-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#FAF8F6] z-[150] flex flex-col items-center justify-center p-6 text-center">
              <div className="relative w-48 h-48 mb-8 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl">
                {data.image ? (
                  <img src={data.image} alt="Scanning" className="w-full h-full object-cover scale-110" />
                ) : (
                  <div className="w-full h-full bg-[rgba(240,136,106,0.10)] flex items-center justify-center text-[#F0886A]">
                    <ScanFace size={64} />
                  </div>
                )}
                <motion.div 
                  animate={{ y: ["-100%", "100%", "-100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-x-0 h-1 bg-[#F0886A] shadow-[0_0_15px_#F0886A] z-10"
                />
                <div className="absolute inset-0 bg-slate-900/30" />
              </div>

              <div className="space-y-3 max-w-xs">
                <div className="flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                      className="w-2.5 h-2.5 bg-[#F0886A] rounded-full"
                    />
                  ))}
                </div>
                <h3 className="text-xl font-bold text-[#2C1F1A] tracking-[-0.3px]">Analyzing Skin...</h3>
                <p className="text-xs text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-wider animate-pulse">Deep scanning dermal layers</p>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[rgba(60,30,20,0.08)]/50 mt-4 text-[11px] text-slate-500 font-medium leading-relaxed shadow-sm">
                  Our AI model is evaluating skin hydration, sebum levels, and hyperpigmentation hotspots to build your custom report.
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{opacity:0}} animate={{opacity:1}} className="relative min-h-screen pb-36 bg-[#FAF8F6] overflow-x-hidden">


            {/* ═══════════ FACE SCAN IMAGE AREA ═══════════ */}
            <div className="relative w-full h-[320px] bg-slate-950 overflow-hidden">
              {/* Face Image - zoomed & centered */}
              <img
                src={data.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"}
                alt="Scan"
                className="w-full h-full object-cover scale-125 object-[center_60%] opacity-75"
              />

              {/* Cinematic vignette — darkens edges, focuses center */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.72)_100%)] pointer-events-none" />
              {/* Extra bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />

              {/* ── Dermal Mesh SVG (face-aligned landmark lines) ── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Forehead horizontal */}
                <path d="M30,18 Q50,14 70,18" fill="none" stroke="#F0886A" strokeWidth="0.2" strokeDasharray="1.5,2" />
                {/* Cheekbone arcs */}
                <path d="M22,42 Q30,38 40,40" fill="none" stroke="#F0886A" strokeWidth="0.18" strokeDasharray="1,2" />
                <path d="M60,40 Q70,38 78,42" fill="none" stroke="#F0886A" strokeWidth="0.18" strokeDasharray="1,2" />
                {/* Nose bridge */}
                <path d="M47,30 L47,52 M53,30 L53,52" fill="none" stroke="#F0886A" strokeWidth="0.15" />
                {/* Jaw line */}
                <path d="M28,72 Q50,80 72,72" fill="none" stroke="#F0886A" strokeWidth="0.18" strokeDasharray="2,2" />
                {/* Face oval */}
                <ellipse cx="50" cy="50" rx="28" ry="36" fill="none" stroke="#F0886A" strokeWidth="0.15" strokeDasharray="1,3" />
                {/* Landmark dots */}
                <circle cx="35" cy="40" r="0.6" fill="#F0886A" opacity="0.7"/>
                <circle cx="65" cy="40" r="0.6" fill="#F0886A" opacity="0.7"/>
                <circle cx="50" cy="30" r="0.6" fill="#F0886A" opacity="0.7"/>
                <circle cx="50" cy="55" r="0.6" fill="#F0886A" opacity="0.6"/>
                <circle cx="38" cy="65" r="0.5" fill="#F0886A" opacity="0.5"/>
                <circle cx="62" cy="65" r="0.5" fill="#F0886A" opacity="0.5"/>
              </svg>

              {/* ── Animated Scan Line + corner brackets ── */}
              <motion.div
                animate={{ y: ["0px", "320px", "0px"] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                className="absolute left-0 right-0 z-10 pointer-events-none"
              >
                <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#F0886A] to-transparent shadow-[0_0_14px_#F0886A] opacity-90" />
                <div className="absolute -top-0.5 left-4 right-4 h-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </motion.div>
              {/* Corner scan brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-[#F0886A]/60 rounded-tl-sm pointer-events-none z-10" />
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-[#F0886A]/60 rounded-tr-sm pointer-events-none z-10" />
              <div className="absolute bottom-16 left-4 w-6 h-6 border-l-2 border-b-2 border-[#F0886A]/60 rounded-bl-sm pointer-events-none z-10" />
              <div className="absolute bottom-16 right-4 w-6 h-6 border-r-2 border-b-2 border-[#F0886A]/60 rounded-br-sm pointer-events-none z-10" />

              {/* ═══ SMART OVERLAYS — keyed to real facial regions ═══ */}
              {/* All hidden while loading */}
              {!loading && (
                <div className="absolute inset-0 pointer-events-none">

                  {/* FOREHEAD — Oiliness (T-zone top) */}
                  {(data.oil || 0) >= 5 && (
                    <div className="absolute top-[10%] left-[30%] w-[40%] h-[12%] rounded-full blur-[10px] mix-blend-screen" style={{
                      background: `radial-gradient(ellipse at center, rgba(251,191,36,${Math.min(0.55, (data.oil||0)/130)}) 0%, transparent 75%)`
                    }} />
                  )}

                  {/* NOSE BRIDGE — Pores / Oiliness T-zone center */}
                  {(data.oil || 0) >= 15 && (
                    <div className="absolute top-[30%] left-[43%] w-[14%] h-[22%] rounded-full blur-[6px] mix-blend-screen" style={{
                      background: `radial-gradient(ellipse at center, rgba(245,158,11,${Math.min(0.5, (data.oil||0)/140)}) 0%, transparent 75%)`
                    }} />
                  )}

                  {/* LEFT CHEEK — Pigmentation */}
                  {(data.pigmentation || 0) >= 5 && (
                    <div className="absolute top-[42%] left-[12%] w-[24%] h-[18%] rounded-full blur-[8px] mix-blend-screen" style={{
                      background: `radial-gradient(circle, rgba(168,85,247,${Math.min(0.45, (data.pigmentation||0)/170)}) 0%, transparent 75%)`
                    }} />
                  )}

                  {/* RIGHT CHEEK — Pigmentation */}
                  {(data.pigmentation || 0) >= 5 && (
                    <div className="absolute top-[42%] left-[64%] w-[24%] h-[18%] rounded-full blur-[8px] mix-blend-screen" style={{
                      background: `radial-gradient(circle, rgba(147,51,234,${Math.min(0.45, (data.pigmentation||0)/170)}) 0%, transparent 75%)`
                    }} />
                  )}

                  {/* UNDER EYES — Dark Circles */}
                  {(data.acne || 0) >= 5 && (
                    <>
                      <div className="absolute top-[37%] left-[26%] w-[18%] h-[6%] rounded-full blur-[5px]" style={{
                        background: `rgba(30,58,138,${Math.min(0.38, (data.acne||0)/180)})`,
                        mixBlendMode: 'multiply'
                      }} />
                      <div className="absolute top-[37%] left-[56%] w-[18%] h-[6%] rounded-full blur-[5px]" style={{
                        background: `rgba(30,58,138,${Math.min(0.38, (data.acne||0)/180)})`,
                        mixBlendMode: 'multiply'
                      }} />
                    </>
                  )}

                  {/* JAWLINE — Dryness */}
                  {(data.acne || 0) >= 5 && (
                    <>
                      <div className="absolute top-[68%] left-[16%] w-[16%] h-[8%] rounded-full blur-[8px] mix-blend-screen" style={{
                        background: `rgba(165,243,252,${Math.min(0.3, (data.acne||0)/250)})`
                      }} />
                      <div className="absolute top-[68%] left-[68%] w-[16%] h-[8%] rounded-full blur-[8px] mix-blend-screen" style={{
                        background: `rgba(165,243,252,${Math.min(0.3, (data.acne||0)/250)})`
                      }} />
                    </>
                  )}

                  {/* CHEEK REDNESS — Inner cheeks */}
                  {(data.acne || 0) >= 10 && (
                    <>
                      <div className="absolute top-[46%] left-[34%] w-[13%] h-[9%] rounded-full blur-[6px] mix-blend-screen" style={{
                        background: `rgba(244,63,94,${Math.min(0.35, (data.acne||0)/230)})`
                      }} />
                      <div className="absolute top-[46%] left-[53%] w-[13%] h-[9%] rounded-full blur-[6px] mix-blend-screen" style={{
                        background: `rgba(244,63,94,${Math.min(0.35, (data.acne||0)/230)})`
                      }} />
                    </>
                  )}

                  {/* ACNE PULSE DOTS — cheeks (only if detected) */}
                  {(data.acne || 0) >= 8 && (
                    <>
                      <div className="absolute top-[48%] left-[20%]">
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.45, 1, 0.45] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="rounded-full border border-red-400 flex items-center justify-center"
                          style={{
                            width: `${Math.max(10, Math.min(20, (data.acne||0)/5))}px`,
                            height: `${Math.max(10, Math.min(20, (data.acne||0)/5))}px`,
                            background: `rgba(239,68,68,${Math.min(0.45,(data.acne||0)/160)})`,
                            boxShadow: `0 0 ${Math.max(4,(data.acne||0)/10)}px rgba(239,68,68,0.7)`
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        </motion.div>
                      </div>
                      <div className="absolute top-[54%] left-[74%]">
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.45, 1, 0.45] }}
                          transition={{ repeat: Infinity, duration: 2.3, ease: "easeInOut" }}
                          className="rounded-full border border-red-400 flex items-center justify-center"
                          style={{
                            width: `${Math.max(10, Math.min(18, (data.acne||0)/5.5))}px`,
                            height: `${Math.max(10, Math.min(18, (data.acne||0)/5.5))}px`,
                            background: `rgba(239,68,68,${Math.min(0.4,(data.acne||0)/170)})`,
                            boxShadow: `0 0 ${Math.max(3,(data.acne||0)/12)}px rgba(239,68,68,0.6)`
                          }}
                        >
                          <span className="w-1 h-1 rounded-full bg-red-500" />
                        </motion.div>
                      </div>
                      {/* Forehead/chin dot for higher acne */}
                      {(data.acne || 0) >= 28 && (
                        <div className="absolute top-[18%] left-[48%]">
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.9, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.8 }}
                            className="w-2.5 h-2.5 rounded-full border border-red-400 flex items-center justify-center"
                            style={{ background: `rgba(239,68,68,0.3)`, boxShadow: "0 0 5px rgba(239,68,68,0.5)" }}
                          >
                            <span className="w-1 h-1 rounded-full bg-red-400" />
                          </motion.div>
                        </div>
                      )}
                    </>
                  )}

                  {/* PORE DOTS — nose bridge */}
                  {(data.oil || 0) >= 20 && (
                    <>
                      {[{t:"34%",l:"46%"},{t:"38%",l:"44%"},{t:"37%",l:"52%"},{t:"41%",l:"48%"}].map((pos, i) => (
                        <div key={i} className="absolute rounded-full" style={{
                          top: pos.t, left: pos.l,
                          width: `${Math.max(4, Math.min(8, (data.oil||0)/14))}px`,
                          height: `${Math.max(4, Math.min(8, (data.oil||0)/14))}px`,
                          background: `rgba(249,115,22,${Math.min(0.85,(data.oil||0)/100)})`,
                          boxShadow: `0 0 4px rgba(249,115,22,0.6)`
                        }} />
                      ))}
                    </>
                  )}

                  {/* HEALTHY GLOW — when score is high */}
                  {(data.score || 0) >= 65 && (
                    <div className="absolute top-[25%] left-[60%] w-[20%] h-[10%] rounded-full blur-[6px] mix-blend-screen" style={{
                      background: `rgba(255,255,255,${Math.min(0.35,(data.score||0)/250)})`
                    }} />
                  )}

                </div>
              )}

              {/* ── HUD Overlay — top controls ── */}
              <div className="absolute top-8 left-5 right-5 flex justify-between items-center z-20">
                <button
                  onClick={() => setView("home")}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform shadow-lg"
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  onClick={() => resetScanner("face")}
                  className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white font-bold text-[10px] border border-white/10 active:scale-90 transition-transform tracking-widest uppercase shadow-lg"
                >
                  Rescan Skin
                </button>
              </div>

              {/* ── Bottom HUD ── */}
              <div className="absolute bottom-3 left-4 right-4 flex flex-col gap-1.5 z-10">
                <div className="flex justify-between items-center">
                  <div className="bg-black/50 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">AI Scan Active</span>
                  </div>
                  <div className="text-[8px] font-bold text-white/60 uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                    92% Confidence
                  </div>
                </div>
                {/* Legend */}
                <div className="bg-black/55 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex flex-wrap justify-center gap-x-3 gap-y-1">
                  {[
                    {color:"#ef4444",label:"Acne",glow:"#ef4444"},
                    {color:"#fbbf24",label:"Oil",glow:"#fbbf24"},
                    {color:"#a855f7",label:"Pigment",glow:"#a855f7"},
                    {color:"#60a5fa",label:"Circles",glow:"#60a5fa"},
                    {color:"#ffffff",label:"Glow",glow:"#ffffff"},
                  ].map(({color,label,glow}) => (
                    <span key={label} className="flex items-center gap-1 text-[7.5px] font-bold text-white/70 uppercase tracking-[-0.3px]er">
                      <span className="w-1.5 h-1.5 rounded-full" style={{background:color, boxShadow:`0 0 4px ${glow}`}} /> {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══════════ CONTENT AREA ═══════════ */}
            <div className="px-5 -mt-6 relative z-20 space-y-4 pb-2">

              {/* ── Score Overview Card (overlaps image) ── */}
              <div className="bg-white/95 backdrop-blur-xl rounded-[22px] p-5 shadow-xl shadow-[#F0886A]/10 border border-white relative overflow-hidden" style={{boxShadow: '0 8px 32px rgba(248,142,125,0.12), 0 1px 0 rgba(255,255,255,0.8) inset'}}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[rgba(240,136,106,0.10)]/80 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#FFF5F2]/60 to-transparent rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9.5px] text-[#F0886A] font-bold uppercase tracking-[0.18em]">Dermal Diagnostic</p>
                    <h2 className="text-[21px] font-bold text-[#2C1F1A] tracking-[-0.3px] leading-tight mt-0.5">Overall Skin Health</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-[32px] font-bold leading-none tabular-nums" style={{color: data.score >= 80 ? '#059669' : data.score >= 65 ? '#d97706' : '#ef4444'}}>
                      {data.score}<span className="text-[13px] text-[rgba(44,31,26,0.30)] font-bold">/100</span>
                    </div>
                    <div className="mt-1.5">
                      {data.score >= 80 ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm shadow-emerald-100">Excellent ✨</span>
                      ) : data.score >= 65 ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm shadow-amber-100">Moderate</span>
                      ) : (
                        <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm shadow-red-100">Needs Care</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Animated score bar — gradient */}
                <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.score}%` }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{
                      background: data.score >= 80
                        ? 'linear-gradient(90deg,#34d399,#10b981)'
                        : data.score >= 65
                        ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                        : 'linear-gradient(90deg,#f87171,#ef4444)',
                      boxShadow: data.score >= 80 ? '0 0 8px rgba(16,185,129,0.4)' : data.score >= 65 ? '0 0 8px rgba(245,158,11,0.4)' : '0 0 8px rgba(239,68,68,0.4)'
                    }}
                  />
                </div>
              </div>

              {/* ── 3-Column Metric Cards with Severity Dots ── */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {
                    label: "Acne", value: data.acne, icon: <Target size={14}/>,
                    color: "text-red-500", bg: "bg-red-50",
                    desc: data.acne < 15 ? "Clear" : data.acne < 35 ? "Mild" : data.acne < 60 ? "Moderate" : "Severe",
                    dotColor: "#ef4444"
                  },
                  {
                    label: "Oil", value: data.oil, icon: <Droplets size={14}/>,
                    color: "text-amber-500", bg: "bg-amber-50",
                    desc: data.oil < 25 ? "Balanced" : data.oil < 50 ? "Moderate" : "Excess",
                    dotColor: "#f59e0b"
                  },
                  {
                    label: "Pigment", value: data.pigmentation, icon: <Sparkles size={14}/>,
                    color: "text-purple-500", bg: "bg-purple-50",
                    desc: data.pigmentation < 20 ? "Even" : data.pigmentation < 40 ? "Minor" : "Uneven",
                    dotColor: "#a855f7"
                  }
                ].map(({ label, value, icon, color, bg, desc, dotColor }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: label === 'Acne' ? 0.1 : label === 'Oil' ? 0.2 : 0.3 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white rounded-[20px] p-3.5 border border-[rgba(60,30,20,0.08)]/80 flex flex-col gap-1.5 relative overflow-hidden"
                    style={{ boxShadow: `0 4px 16px ${dotColor}18, 0 1px 0 rgba(255,255,255,0.9) inset` }}
                  >
                    <div className="absolute top-0 right-0 w-10 h-10 rounded-full blur-xl opacity-30 pointer-events-none" style={{ background: dotColor }} />
                    <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center", bg, color)}>
                      {icon}
                    </div>
                    <p className="text-[9px] text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-[-0.3px]">{label}</p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-[19px] font-bold leading-none"
                      style={{ color: value < 20 ? '#374151' : value < 50 ? dotColor : dotColor }}
                    >{value}%</motion.p>
                    {/* Severity dots */}
                    <div className="flex gap-0.5 items-center">
                      {[...Array(5)].map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.07 }}
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: i < Math.ceil((value||0)/20) ? dotColor : '#e2e8f0',
                            opacity: i < Math.ceil((value||0)/20) ? 1 : 0.35,
                            boxShadow: i < Math.ceil((value||0)/20) ? `0 0 4px ${dotColor}80` : 'none'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[8.5px] font-bold" style={{ color: dotColor }}>{desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* ── Accordion Sections ── */}

              {/* SECTION: AI Insights */}
              {[
                {
                  key: "insights",
                  icon: <BrainCircuit size={13}/>,
                  title: "AI Analysis Insights",
                  content: (
                    <div className="space-y-3.5">
                      {/* AI verdict quote */}
                      <p className="text-[12.5px] font-semibold text-[rgba(44,31,26,0.75)] leading-relaxed italic border-l-[3px] border-[#F0886A] pl-3.5 bg-white/60 py-2 rounded-r-xl">
                        {`"${data.acne > 25 ? "Mild acne activity detected around cheek and chin regions." : "No significant acne flares — skin surface appears relatively clear."} ${data.oil > 45 ? "T-zone shows elevated sebum indicating compensatory oiliness." : "Sebum secretion appears balanced and well-controlled."} ${data.pigmentation > 25 ? "Pigmentation irregularities are visible but manageable with targeted care." : "Melanin distribution looks mostly uniform with good clarity."}"`}
                      </p>
                      {/* Color-coded condition tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[8.5px] font-bold uppercase tracking-wide" style={{ background: data.acne < 20 ? '#f0fdf4' : '#fff1f2', color: data.acne < 20 ? '#16a34a' : '#ef4444', border: `1px solid ${data.acne < 20 ? '#bbf7d0' : '#fecaca'}` }}>Acne: {data.acne < 20 ? 'Clear ✓' : data.acne < 40 ? 'Mild ⚠' : 'Active !'}</span>
                        <span className="px-2.5 py-1 rounded-full text-[8.5px] font-bold uppercase tracking-wide" style={{ background: data.oil < 35 ? '#fffbeb' : '#fff7ed', color: data.oil < 35 ? '#d97706' : '#ea580c', border: '1px solid #fed7aa' }}>Oil: {data.oil < 25 ? 'Balanced ✓' : data.oil < 50 ? 'Moderate ⚠' : 'High !'}</span>
                        <span className="px-2.5 py-1 rounded-full text-[8.5px] font-bold uppercase tracking-wide" style={{ background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff' }}>Pigment: {data.pigmentation < 20 ? 'Even ✓' : 'Minor spots ⚠'}</span>
                      </div>
                      {/* Quick tip */}
                      <div className="bg-[#F0886A]/8 border border-[#F0886A]/15 rounded-[14px] p-3">
                        <p className="text-[10px] font-bold text-[#F0886A] uppercase tracking-wider mb-1">💡 Top Priority</p>
                        <p className="text-[11px] text-slate-600 leading-snug font-medium">
                          {data.acne > 30 ? "Focus on a gentle salicylic acid cleanser morning & night to reduce active breakouts first." : data.oil > 50 ? "Use a niacinamide serum to regulate sebum production without stripping skin." : data.pigmentation > 30 ? "Add a vitamin C serum every morning + SPF 50 to reduce dark spot formation." : "Your skin is in decent health — maintain hydration and consistent SPF use."}
                        </p>
                      </div>
                      <p className="text-[8px] text-[rgba(44,31,26,0.30)] font-bold uppercase tracking-wider">⚠️ AI-generated insights. Not a medical diagnosis.</p>
                    </div>
                  )
                },
                {
                  key: "report",
                  icon: <Sparkles size={13}/>,
                  title: "Complete AI Skin Report",
                  locked: !isPremium && history.length > 1,
                  content: (
                    <div className="text-[12.5px] text-slate-600 leading-relaxed font-medium relative">
                      {!isPremium && history.length > 1 && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4 rounded-[16px]">
                          <Lock className="text-[#F0886A] mb-2" size={20}/>
                          <p className="text-[13px] font-bold text-[#2C1F1A] mb-1">Report Locked</p>
                          <p className="text-[9.5px] text-slate-500 font-bold mb-3 px-4">Upgrade to read full dermatological recommendations</p>
                          <Link href="/premium" className="bg-primary-gradient text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md shadow-[#F0886A]/20 active:scale-95 transition-transform">
                            Unlock Now ✨
                          </Link>
                        </div>
                      )}
                      <div className={cn((isPremium || history.length <= 1) ? "" : "blur-sm select-none")}>
                        {loading ? (
                          <div className="py-8 flex flex-col items-center gap-4">
                            {/* Multi-ring loader */}
                            <div className="relative w-14 h-14">
                              <div className="absolute inset-0 rounded-full border-4 border-[rgba(240,136,106,0.10)]" />
                              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F0886A] animate-spin" />
                              <div className="absolute inset-[4px] rounded-full border-2 border-transparent border-t-[#F0886A]/40 animate-spin" style={{animationDirection:'reverse',animationDuration:'1.2s'}} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <BrainCircuit size={16} className="text-[#F0886A]" />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest animate-pulse">AI Analyzing Skin…</p>
                              <p className="text-[9px] text-[rgba(44,31,26,0.38)] mt-1">Mapping dermal texture & pigmentation</p>
                            </div>
                            {/* Progress steps */}
                            <div className="w-full space-y-1.5 px-2">
                              {['Scanning face geometry', 'Detecting skin conditions', 'Generating report'].map((step, i) => (
                                <div key={step} className="flex items-center gap-2">
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.4 }}
                                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: '#F0886A' }}
                                  >
                                    <CheckCircle2 size={10} className="text-white" />
                                  </motion.div>
                                  <p className="text-[9.5px] text-slate-500 font-bold">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            {history.length <= 1 && !isPremium && (
                              <div className="flex items-center gap-2 mb-3 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full w-fit">
                                <Sparkles size={11}/>
                                <span className="text-[8.5px] font-bold uppercase tracking-widest text-emerald-600/70">Welcome Gift: Free Analysis</span>
                              </div>
                            )}
                            {ai ? formatMarkdown(ai) : "Scanning complete. Your personalized report is ready."}
                          </>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: "plan",
                  icon: <ShieldCheck size={13}/>,
                  title: "Skin Improvement Plan",
                  content: (
                    <div className="space-y-2.5">
                      {[
                        { title: "Hydration Focus", desc: "Drink 2.5L of water daily to flush dermal toxins and maintain barrier hydration.", num: "01" },
                        { title: "UV Protection", desc: "Apply SPF 50+ mineral sunscreen every morning to prevent hyperpigmentation worsening.", num: "02" },
                        { title: "Restorative Sleep", desc: "7–8 hours of sleep allows natural skin barrier repair and collagen synthesis.", num: "03" },
                        { title: "Diet Adjustment", desc: data.acne > 30 ? "Reduce high-glycemic foods and dairy triggers that worsen inflammatory acne." : "Incorporate antioxidant-rich fruits and Omega-3 seeds for radiance.", num: "04" },
                        { title: "Barrier Support", desc: "Avoid harsh scrubs — use ceramide-rich moisturizers nightly to lock in moisture.", num: "05" },
                      ].map((item) => (
                        <div key={item.num} className="flex gap-3 items-start p-3 bg-white/65 rounded-[16px] border border-[rgba(60,30,20,0.08)]/40">
                          <div className="w-6 h-6 rounded-full bg-[#F0886A]/15 flex items-center justify-center text-[#F0886A] text-[9px] font-bold flex-shrink-0 mt-0.5">{item.num}</div>
                          <div>
                            <p className="text-[11.5px] font-bold text-[rgba(44,31,26,0.75)]">{item.title}</p>
                            <p className="text-[9.5px] text-[rgba(44,31,26,0.38)] mt-0.5 leading-snug">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              ].map(({ key, icon, title, content }) => (
                <div key={key} className="bg-white rounded-[24px] shadow-sm border border-[rgba(60,30,20,0.08)] overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                    className="w-full flex items-center justify-between px-5 py-4 active:bg-[#F5F1EE] transition-colors"
                  >
                    <div className="flex items-center gap-2 text-[#F0886A] font-bold text-[10.5px] uppercase tracking-widest">
                      {icon} {title}
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSection === key ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronRight size={14} className="text-[rgba(44,31,26,0.30)] rotate-90" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedSection === key && (
                      <motion.div
                        key={key + "_body"}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 border-t border-slate-50">
                          {content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* ── Premium Locked Features ── */}
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[rgba(60,30,20,0.08)]">
                <div className="flex items-center gap-2 text-[#F0886A] font-bold text-[10.5px] uppercase tracking-widest mb-4">
                  <Gem size={13}/> Premium Analytics
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { icon: "🔬", title: "Deep Pore Scan", desc: "Detect micro-clogs before breakouts." },
                    { icon: "🧬", title: "Skin Age Score", desc: "Biological elasticity & collagen map." },
                    { icon: "📊", title: "Weekly Reports", desc: "Pro charts tracking your progress." },
                    { icon: "🌙", title: "Custom Routine", desc: "AI morning + night schedule." },
                    { icon: "📈", title: "Progress Insights", desc: "Long-term improvement curves." },
                    { icon: "💊", title: "Ingredient Match", desc: "Products matched to your skin DNA." },
                  ].map(({ icon, title, desc }) => (
                    <motion.div
                      key={title}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setPremiumModal(title)}
                      className="bg-white/70 p-3.5 rounded-[18px] border border-[rgba(60,30,20,0.08)]/40 relative overflow-hidden cursor-pointer active:bg-[rgba(240,136,106,0.10)]/60 transition-colors"
                    >
                      <div className="absolute top-2.5 right-2.5 text-[#F0886A]/70">
                        {isPremium ? <Sparkles size={10}/> : <Lock size={10}/>}
                      </div>
                      <div className="text-lg mb-1.5">{icon}</div>
                      <p className="text-[10.5px] font-bold text-[rgba(44,31,26,0.75)] leading-tight">{title}</p>
                      <p className="text-[8.5px] text-[rgba(44,31,26,0.38)] mt-0.5 leading-snug">{desc}</p>
                      <div className="mt-2 flex items-center gap-1 text-[#F0886A]">
                        <span className="text-[8px] font-bold uppercase tracking-wider">{isPremium ? 'View' : 'Preview'}</span>
                        <ChevronRight size={9}/>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {!isPremium && (
                  <Link href="/premium" className="mt-4 w-full h-11 bg-primary-gradient text-white rounded-[16px] flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest shadow-md shadow-[#F0886A]/20 active:scale-95 transition-transform">
                    <Gem size={13}/> Unlock All Premium Features
                  </Link>
                )}
              </div>

              {/* ── Progress Tracking ── */}
              <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[rgba(60,30,20,0.08)]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-[#F0886A] font-bold text-[10.5px] uppercase tracking-widest">
                    <TrendingUp size={13}/> Skin Progress
                  </div>
                  {history.length > 1 && (
                    <button onClick={() => setView("history")} className="text-[9.5px] font-bold text-[#F0886A]">View All →</button>
                  )}
                </div>

                {history.length <= 1 ? (
                  <div className="text-center py-6 bg-white/60 rounded-[18px] border border-[rgba(60,30,20,0.08)]/30">
                    <div className="text-3xl mb-2">📈</div>
                    <p className="text-[12px] font-bold text-[rgba(44,31,26,0.75)]">No previous scans yet</p>
                    <p className="text-[9.5px] text-[rgba(44,31,26,0.38)] mt-1 leading-snug px-4">
                      Scan weekly to build your skin improvement timeline and see real progress.
                    </p>
                    <button
                      onClick={() => resetScanner("face")}
                      className="mt-4 bg-[rgba(240,136,106,0.10)] text-[#F0886A] px-5 py-2 rounded-full text-[9.5px] font-bold uppercase tracking-wider border border-[rgba(60,30,20,0.08)] active:scale-95 transition-transform"
                    >
                      Start Tracking Progress
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Mini timeline bars */}
                    {history.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <p className="text-[9px] text-[rgba(44,31,26,0.38)] font-bold w-16 shrink-0">{h.date.slice(0,5)}</p>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${h.score}%` }}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                            className={cn("h-full rounded-full", i === 0 ? "bg-[#F0886A]" : "bg-slate-300")}
                          />
                        </div>
                        <p className="text-[9px] font-bold text-slate-600 w-7 text-right">{h.score}</p>
                      </div>
                    ))}
                    <div className={cn("rounded-[16px] p-3 flex items-center justify-between mt-1", data.score > (history[1]?.score || 0) ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100")}>
                      <p className="text-[11px] font-bold text-[rgba(44,31,26,0.75)]">
                        {data.score > (history[1]?.score || 0) ? "📈 Great progress this week!" : "📉 Stick to your routine closely"}
                      </p>
                      <div className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full", data.score > (history[1]?.score || 0) ? "text-emerald-600 bg-emerald-100" : "text-amber-600 bg-amber-100")}>
                        {data.score > (history[1]?.score || 0) ? `+${data.score - history[1].score}` : `${data.score - history[1].score}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PDF Download (premium only) */}
              {isPremium && (
                <button
                  onClick={() => window.print()}
                  className="w-full h-12 bg-[rgba(240,136,106,0.10)] text-[#F0886A] rounded-[18px] border border-[rgba(60,30,20,0.08)] flex items-center justify-center gap-2 font-bold text-[10.5px] uppercase tracking-widest active:scale-95 transition-transform"
                >
                  <Download size={13}/> Download Skin Report PDF
                </button>
              )}

            </div>

            {/* ═══ STICKY BOTTOM CTA BAR ═══ */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/75 backdrop-blur-xl border-t border-[rgba(60,30,20,0.08)] flex items-center gap-2.5 z-50 md:left-1/2 md:-translate-x-1/2 md:max-w-[430px]">
              <button
                onClick={() => resetScanner("face")}
                className="w-12 h-12 bg-slate-100 text-[rgba(44,31,26,0.38)] rounded-[16px] flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform border border-[rgba(60,30,20,0.10)]"
              >
                <RefreshCcw size={15}/>
              </button>
              <button
                onClick={() => setView("history")}
                className="flex-1 h-12 bg-[#F5F1EE] border border-[rgba(60,30,20,0.08)] text-slate-500 rounded-[16px] flex items-center justify-center gap-1.5 font-bold text-[10.5px] uppercase tracking-wide active:scale-95 transition-transform"
              >
                <TrendingUp size={13}/> Track Progress
              </button>
              <Link
                href="/routine"
                className="flex-[1.6] h-12 bg-primary-gradient text-white rounded-[16px] flex items-center justify-center gap-1.5 font-bold text-[10.5px] uppercase tracking-wide active:scale-95 transition-transform shadow-lg shadow-[#F0886A]/20"
              >
                <Sparkles size={13}/> Get Routine
              </Link>
            </div>

          </motion.div>
          )
        )}




        {/* HISTORY PAGE */}
        {view === "history" && (
          <motion.div key="history" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="px-5 pb-32">
            <div className="flex items-center gap-3 mb-5 pt-2">
              <button onClick={()=>setView(data ? "results" : "home")} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-[rgba(44,31,26,0.38)] border border-[rgba(60,30,20,0.08)]"><ArrowLeft size={18} strokeWidth={1.2} /></button>
              <h2 className="text-[18px] font-bold text-[#2C1F1A] text-center flex-1 pr-10">Scan History</h2>
            </div>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4"><div className="text-6xl">📭</div><p className="text-[15px] font-bold text-[rgba(44,31,26,0.38)]">No scans yet</p><button onClick={()=>setView("scanner")} className="bg-primary-gradient text-white font-bold px-6 py-3 rounded-2xl text-sm">Start First Scan ✨</button></div>
            ) : (
              <div className="space-y-3">{history.map((h,i)=>(<div key={i} className="bg-white rounded-[20px] border border-[#EEF0FF] shadow-sm p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">🧴</div><div className="flex-1"><p className="text-[12px] font-bold text-[#2C1F1A]">{h.date}</p><div className="flex gap-3 mt-1"><p className="text-[9px] text-[rgba(44,31,26,0.38)]">Acne <span className="text-slate-600 font-bold">{h.acne}%</span></p><p className="text-[9px] text-[rgba(44,31,26,0.38)]">Oil <span className="text-slate-600 font-bold">{h.oil}%</span></p><p className="text-[9px] text-[rgba(44,31,26,0.38)]">Pigment <span className="text-slate-600 font-bold">{h.pigmentation}%</span></p></div></div><div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0"><p className="text-[10px] font-bold text-white">{h.score}%</p></div></div>))}</div>
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
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#F5F1EE] flex items-center justify-center text-[rgba(44,31,26,0.38)]"
              >
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-[rgba(240,136,106,0.10)] rounded-[22px] flex items-center justify-center mx-auto mb-6 text-[#F0886A] shadow-inner">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-[#2C1F1A] leading-tight mb-2">
                {limitReason === "premium" ? "Premium Feature!" : "Scan Limit Reached!"}
              </h2>
              <p className="text-[11px] text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-widest mb-8 italic px-4">
                {limitReason === "premium" 
                  ? "Product scanning is exclusive to GlowAI Premium members."
                  : "Free users get 1 scan per day. Upgrade for unlimited analysis."
                }
              </p>
              <Link href="/premium" onClick={() => setScanLimitReached(false)} className="w-full h-16 bg-primary-gradient text-white font-bold rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-[#F0886A]/20 active:scale-95 transition-transform mb-4">
                Unlock Unlimited Scans 🔓
              </Link>
              <button onClick={() => setScanLimitReached(false)} className="text-[11px] font-bold text-[rgba(44,31,26,0.30)] uppercase tracking-widest">Maybe Later</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ PREMIUM FEATURE BOTTOM SHEET MODAL ═══ */}
      <AnimatePresence>
        {premiumModal && data && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPremiumModal(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[190] md:left-1/2 md:-translate-x-1/2 md:max-w-[430px] md:right-auto md:w-[430px]"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[200] bg-white rounded-t-[32px] shadow-2xl md:left-1/2 md:-translate-x-1/2 md:max-w-[430px] overflow-hidden"
              style={{ maxHeight: '88vh' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
                <div>
                  <p className="text-[9px] text-[#F0886A] font-bold uppercase tracking-widest">
                    {["Deep Pore Scan","Skin Age Score","Weekly Reports","Custom Routine","Progress Insights","Ingredient Match"].find(t=>t===premiumModal) && "Premium Analytics"}
                  </p>
                  <h3 className="text-[17px] font-bold text-[#2C1F1A]">{premiumModal}</h3>
                </div>
                <button onClick={() => setPremiumModal(null)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[rgba(44,31,26,0.38)] active:scale-90 transition-transform">
                  <X size={16}/>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto px-5 pb-6 pt-4 space-y-4" style={{ maxHeight: 'calc(88vh - 90px)' }}>

                {/* ── DEEP PORE SCAN ── */}
                {premiumModal === "Deep Pore Scan" && (
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-[20px] p-4 border border-[rgba(60,30,20,0.08)]/50">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Pore Congestion Map</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[{zone:'T-Zone',level:data.oil>50?'High':data.oil>25?'Mod':'Low',color:data.oil>50?'#ef4444':data.oil>25?'#f59e0b':'#10b981'},{zone:'Left Cheek',level:data.acne>30?'Active':data.acne>15?'Mild':'Clear',color:data.acne>30?'#ef4444':data.acne>15?'#f59e0b':'#10b981'},{zone:'Right Cheek',level:data.acne>25?'Active':data.acne>10?'Mild':'Clear',color:data.acne>25?'#ef4444':data.acne>10?'#f59e0b':'#10b981'},{zone:'Nose',level:data.oil>40?'Clogged':data.oil>20?'Mild':'Clear',color:data.oil>40?'#ef4444':data.oil>20?'#f59e0b':'#10b981'},{zone:'Chin',level:data.acne>20?'Active':'Clear',color:data.acne>20?'#f59e0b':'#10b981'},{zone:'Forehead',level:data.oil>45?'Oily':data.oil>20?'Mild':'Clear',color:data.oil>45?'#ef4444':data.oil>20?'#f59e0b':'#10b981'}].map(z=>(
                          <div key={z.zone} className="bg-white rounded-[14px] p-2.5 text-center border border-[rgba(60,30,20,0.08)]">
                            <p className="text-[8px] text-[rgba(44,31,26,0.38)] font-bold">{z.zone}</p>
                            <p className="text-[10px] font-bold mt-0.5" style={{color:z.color}}>{z.level}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pore Care Tips</p>
                      {["Use a salicylic acid toner 2× weekly to decongest pores.","Double cleanse with an oil-based cleanser to dissolve sebum plugs.","Clay mask on T-zone twice a week to absorb excess oil.",`Your pore congestion score: ${Math.round((data.oil+data.acne)/2)}% — ${data.oil+data.acne>80?'High priority':'Manageable'} care needed.`].map((tip,i)=>(
                        <div key={i} className="flex gap-2.5 items-start bg-white p-3 rounded-[14px] border border-[rgba(60,30,20,0.08)]">
                          <span className="w-5 h-5 rounded-full bg-[#F0886A]/15 flex items-center justify-center text-[#F0886A] text-[8px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                          <p className="text-[10.5px] text-slate-600 leading-snug">{tip}</p>
                        </div>
                      ))}
                    </div>
                    {!isPremium && <div className="bg-gradient-to-br from-[rgba(240,136,106,0.10)] to-[#FFF5F2] rounded-[20px] p-4 text-center border border-[rgba(60,30,20,0.08)]">
                      <Lock className="text-[#F0886A] mx-auto mb-2" size={18}/>
                      <p className="text-[12px] font-bold text-[#2C1F1A] mb-1">Full Pore Analysis Locked</p>
                      <p className="text-[9.5px] text-slate-500 mb-3">Get UV-light pore mapping, blackhead density scores & more.</p>
                      <Link href="/premium" onClick={()=>setPremiumModal(null)} className="inline-flex items-center gap-1.5 bg-primary-gradient text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md shadow-[#F0886A]/20"><Gem size={11}/> Upgrade to Premium</Link>
                    </div>}
                  </div>
                )}

                {/* ── SKIN AGE SCORE ── */}
                {premiumModal === "Skin Age Score" && (() => {
                  const chrono = new Date().getFullYear() - 1998;
                  const ageDelta = Math.round((data.acne * 0.15) + (data.oil * 0.1) + (data.pigmentation * 0.12) - (data.score * 0.08));
                  const bioAge = Math.max(18, chrono + ageDelta);
                  const ageColor = ageDelta <= 0 ? '#10b981' : ageDelta <= 3 ? '#f59e0b' : '#ef4444';
                  return (
                    <div className="space-y-4">
                      <div className="bg-white/70 rounded-[20px] p-5 border border-[rgba(60,30,20,0.08)]/50 text-center">
                        <p className="text-[10px] text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-wider mb-2">Estimated Biological Skin Age</p>
                        <div className="text-[52px] font-bold leading-none" style={{color: ageColor}}>{bioAge}</div>
                        <p className="text-[11px] font-bold text-slate-500 mt-1">years old (skin biological age)</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9.5px] font-bold" style={{background: ageDelta<=0?'#f0fdf4':'#fff7ed', color: ageColor}}>
                          {ageDelta <= 0 ? '✨ Younger than chronological age!' : `⚠ +${ageDelta} years above chronological age`}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[{label:'Elasticity Score',val:`${Math.max(40,100-data.acne-data.oil/2)}%`,icon:'💪'},{label:'Collagen Index',val:`${Math.max(35,100-data.pigmentation-data.acne/3)}%`,icon:'🧬'},{label:'Hydration Level',val:`${Math.max(30,100-data.oil/2-data.acne/3)}%`,icon:'💧'},{label:'Skin Clarity',val:`${Math.max(40,100-data.acne-data.pigmentation/2)}%`,icon:'✨'}].map(m=>(
                          <div key={m.label} className="bg-white rounded-[16px] p-3 border border-[rgba(60,30,20,0.08)] text-center">
                            <div className="text-xl mb-1">{m.icon}</div>
                            <p className="text-[16px] font-bold text-[#2C1F1A]">{m.val}</p>
                            <p className="text-[8.5px] text-[rgba(44,31,26,0.38)] font-bold">{m.label}</p>
                          </div>
                        ))}
                      </div>
                      {!isPremium && <div className="bg-gradient-to-br from-[rgba(240,136,106,0.10)] to-[#FFF5F2] rounded-[20px] p-4 text-center border border-[rgba(60,30,20,0.08)]">
                        <p className="text-[12px] font-bold text-[#2C1F1A] mb-1">Full Age Report Locked</p>
                        <p className="text-[9.5px] text-slate-500 mb-3">Monthly aging rate, wrinkle prediction & anti-aging plan.</p>
                        <Link href="/premium" onClick={()=>setPremiumModal(null)} className="inline-flex items-center gap-1.5 bg-primary-gradient text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md shadow-[#F0886A]/20"><Gem size={11}/> Upgrade</Link>
                      </div>}
                    </div>
                  );
                })()}

                {/* ── WEEKLY REPORTS ── */}
                {premiumModal === "Weekly Reports" && (
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-[20px] p-4 border border-[rgba(60,30,20,0.08)]/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Scan History Overview</p>
                      {history.length <= 1 ? (
                        <div className="text-center py-6">
                          <div className="text-3xl mb-2">📊</div>
                          <p className="text-[12px] font-bold text-slate-600">Not enough data yet</p>
                          <p className="text-[9.5px] text-[rgba(44,31,26,0.38)] mt-1">Scan weekly to generate progress charts.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {history.slice(0,5).map((h,i)=>(
                            <div key={i} className="flex items-center gap-3">
                              <p className="text-[8.5px] text-[rgba(44,31,26,0.38)] font-bold w-12 shrink-0">{h.date.slice(0,5)}</p>
                              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div initial={{width:0}} animate={{width:`${h.score}%`}} transition={{delay:i*0.1,duration:0.6}} className="h-full rounded-full" style={{background:i===0?'linear-gradient(90deg,#F0886A,#f97316)':'#e2e8f0'}}/>
                              </div>
                              <p className="text-[9px] font-bold text-[rgba(44,31,26,0.75)] w-6 text-right">{h.score}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[{label:'Best Score',val:history.length?Math.max(...history.map(h=>h.score)):data.score,icon:'🏆'},{label:'Avg Score',val:history.length?Math.round(history.reduce((a,h)=>a+h.score,0)/history.length):data.score,icon:'📊'},{label:'Total Scans',val:history.length||1,icon:'🔬'}].map(m=>(
                        <div key={m.label} className="bg-white rounded-[16px] p-3 border border-[rgba(60,30,20,0.08)]">
                          <div className="text-xl mb-1">{m.icon}</div>
                          <p className="text-[15px] font-bold text-[#2C1F1A]">{m.val}</p>
                          <p className="text-[7.5px] text-[rgba(44,31,26,0.38)] font-bold">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {!isPremium && <div className="bg-gradient-to-br from-[rgba(240,136,106,0.10)] to-[#FFF5F2] rounded-[20px] p-4 text-center border border-[rgba(60,30,20,0.08)]">
                      <p className="text-[12px] font-bold text-[#2C1F1A] mb-1">Full Weekly Reports Locked</p>
                      <p className="text-[9.5px] text-slate-500 mb-3">PDF exports, trend analysis & dermatologist summaries.</p>
                      <Link href="/premium" onClick={()=>setPremiumModal(null)} className="inline-flex items-center gap-1.5 bg-primary-gradient text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md shadow-[#F0886A]/20"><Gem size={11}/> Upgrade</Link>
                    </div>}
                  </div>
                )}

                {/* ── CUSTOM ROUTINE ── */}
                {premiumModal === "Custom Routine" && (
                  <div className="space-y-4">
                    {[{time:'🌅 Morning Routine',steps:[`Gentle ${data.oil>40?'foaming':'cream'} cleanser (30s)`,`Niacinamide serum${data.oil>40?' (10%) for oil control':'(5%) for glow'}`,data.pigmentation>25?'Vitamin C serum (5–15 min)':'Hyaluronic acid serum',`SPF ${data.acne>30?'50+ mineral':'30+ lightweight'} — non-comedogenic`]},{time:'🌙 Night Routine',steps:['Micellar water makeup removal',`${data.acne>30?'Salicylic acid cleanser (2%)':'Hydrating cream cleanser'}`,data.acne>20?'Adapalene gel (0.1%) — alternate nights':'Retinol 0.25% — 2× weekly',`${data.oil>40?'Oil-free':'Rich ceramide'} moisturizer + eye cream`]}].map(routine=>(
                      <div key={routine.time} className="bg-white/70 rounded-[20px] p-4 border border-[rgba(60,30,20,0.08)]/50">
                        <p className="text-[11px] font-bold text-[rgba(44,31,26,0.75)] mb-3">{routine.time}</p>
                        <div className="space-y-2">
                          {routine.steps.map((step,i)=>(
                            <div key={i} className="flex gap-2.5 items-start">
                              <span className="w-5 h-5 rounded-full bg-[#F0886A]/15 flex items-center justify-center text-[#F0886A] text-[8px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                              <p className="text-[10.5px] text-slate-600 leading-snug">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!isPremium && <div className="bg-gradient-to-br from-[rgba(240,136,106,0.10)] to-[#FFF5F2] rounded-[20px] p-4 text-center border border-[rgba(60,30,20,0.08)]">
                      <p className="text-[12px] font-bold text-[#2C1F1A] mb-1">Full Routine Plan Locked</p>
                      <p className="text-[9.5px] text-slate-500 mb-3">Weekly routine adjustments, product recommendations & reminders.</p>
                      <Link href="/premium" onClick={()=>setPremiumModal(null)} className="inline-flex items-center gap-1.5 bg-primary-gradient text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md shadow-[#F0886A]/20"><Gem size={11}/> Upgrade</Link>
                    </div>}
                  </div>
                )}

                {/* ── PROGRESS INSIGHTS ── */}
                {premiumModal === "Progress Insights" && (
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-[20px] p-4 border border-[rgba(60,30,20,0.08)]/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Current Status</p>
                      {[
                        {label:'Acne Trend', val:data.acne, icon:'🔴', tip:data.acne<20?'✓ Clear — maintain routine':'⚠ Reduce sugar & dairy intake'},
                        {label:'Oil Control', val:data.oil, icon:'🟡', tip:data.oil<30?'✓ Balanced sebum':'⚠ Add niacinamide to routine'},
                        {label:'Pigmentation', val:data.pigmentation, icon:'🟣', tip:data.pigmentation<20?'✓ Even tone':'⚠ Start Vit C + SPF daily'},
                      ].map(m=>(
                        <div key={m.label} className="mb-3 last:mb-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-600">{m.icon} {m.label}</span>
                            <span className="text-[10px] font-bold text-[rgba(44,31,26,0.75)]">{m.val}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div initial={{width:0}} animate={{width:`${m.val}%`}} transition={{duration:0.8}} className="h-full rounded-full" style={{background:`linear-gradient(90deg,#F0886A,#f97316)`}}/>
                          </div>
                          <p className="text-[8.5px] text-[rgba(44,31,26,0.38)] mt-1">{m.tip}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-[20px] p-4 border border-[rgba(60,30,20,0.08)]">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">AI Prediction</p>
                      <p className="text-[11.5px] text-[rgba(44,31,26,0.75)] leading-relaxed">
                        {data.score>=75?'Your skin is on a positive trajectory. With consistent care, expect a 5–10 point improvement in 4 weeks.':data.score>=55?'Moderate improvements expected in 3–4 weeks with consistent routine adherence. Focus on oil control and SPF.':'Significant improvement possible in 6–8 weeks. Prioritize a consistent cleansing and barrier repair routine.'}
                      </p>
                    </div>
                    {!isPremium && <div className="bg-gradient-to-br from-[rgba(240,136,106,0.10)] to-[#FFF5F2] rounded-[20px] p-4 text-center border border-[rgba(60,30,20,0.08)]">
                      <p className="text-[12px] font-bold text-[#2C1F1A] mb-1">Long-term Insights Locked</p>
                      <p className="text-[9.5px] text-slate-500 mb-3">90-day projection charts, milestone tracking & alerts.</p>
                      <Link href="/premium" onClick={()=>setPremiumModal(null)} className="inline-flex items-center gap-1.5 bg-primary-gradient text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md shadow-[#F0886A]/20"><Gem size={11}/> Upgrade</Link>
                    </div>}
                  </div>
                )}

                {/* ── INGREDIENT MATCH ── */}
                {premiumModal === "Ingredient Match" && (
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-[20px] p-4 border border-[rgba(60,30,20,0.08)]/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">✅ Recommended Ingredients</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ...(data.acne>20?['Salicylic Acid','Niacinamide','Tea Tree Oil','Benzoyl Peroxide']:['Lactic Acid','Ceramides']),
                          ...(data.oil>35?['Zinc','Clay','Witch Hazel']:['Squalane','Glycerin']),
                          ...(data.pigmentation>20?['Vitamin C','Alpha Arbutin','Kojic Acid']:['Resveratrol']),
                          'Hyaluronic Acid','SPF 50+'
                        ].slice(0,8).map(ing=>(
                          <span key={ing} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-bold">✓ {ing}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-[20px] p-4 border border-[rgba(60,30,20,0.08)]">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">❌ Avoid These</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ...(data.acne>20?['Coconut Oil','Lanolin','Mineral Oil']:['Alcohol-heavy toners']),
                          ...(data.oil>40?['Heavy Petrolatum','Thick butters']:['Drying Alcohols']),
                          ...(data.pigmentation>25?['Photosensitizers without SPF']:['Harsh Sulfates']),
                        ].slice(0,6).map(ing=>(
                          <span key={ing} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[9px] font-bold">✗ {ing}</span>
                        ))}
                      </div>
                    </div>
                    {!isPremium && <div className="bg-gradient-to-br from-[rgba(240,136,106,0.10)] to-[#FFF5F2] rounded-[20px] p-4 text-center border border-[rgba(60,30,20,0.08)]">
                      <p className="text-[12px] font-bold text-[#2C1F1A] mb-1">Full Ingredient Database Locked</p>
                      <p className="text-[9.5px] text-slate-500 mb-3">Product scanner, ingredient safety ratings & personalized picks.</p>
                      <Link href="/premium" onClick={()=>setPremiumModal(null)} className="inline-flex items-center gap-1.5 bg-primary-gradient text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md shadow-[#F0886A]/20"><Gem size={11}/> Upgrade</Link>
                    </div>}
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
