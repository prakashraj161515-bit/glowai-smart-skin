"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CameraScanner from "@/components/CameraScanner";
import {
  T, SERIF, MONO, SANS, rgba, scoreColor, scoreLabel, Icon, Placeholder, Card,
  PrimaryBtn, GhostBtn, Chip, Badge, ScoreDial, MetricBar, MiniRing, SectionTitle,
  ProductChip, TabBar,
} from "@/glow/ui";

type HistoryEntry = { date: string; score: number; acne: number; oil: number; pigmentation: number; image?: string };

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [view, setView] = useState<"home" | "scanner" | "results" | "product_results">("home");
  const [scanMode, setScanMode] = useState<"face" | "product">("face");
  const [data, setData] = useState<any>(null);
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [country, setCountry] = useState("India");
  const [waterIntake, setWaterIntake] = useState(0);
  const showLanding = status === "unauthenticated";
  const [authView, setAuthView] = useState<"welcome" | "auth">("welcome");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [obSlide, setObSlide] = useState(0);
  const [userName, setUserName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [skinType, setSkinType] = useState("Oily");
  const [userPic, setUserPic] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [streak, setStreak] = useState(1);
  const [cat, setCat] = useState("All");
  const [liked, setLiked] = useState<number[]>([]);
  const [openReport, setOpenReport] = useState(false);
  const [openPlan, setOpenPlan] = useState(true);
  const [activeDot, setActiveDot] = useState<number | null>(null);

  const APP_VERSION = "3.0";

  useEffect(() => { setIsPremium(localStorage.getItem("velmora_is_premium") === "true"); }, []);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, string> = {
      "Asia/Kolkata": "India", "America/New_York": "USA", "Europe/London": "UK",
      "Asia/Dubai": "UAE", "Asia/Karachi": "Pakistan", "Asia/Dhaka": "Bangladesh",
    };
    if (map[tz]) setCountry(map[tz]);
  }, []);

  useEffect(() => {
    const v = localStorage.getItem("velmora_app_version");
    if (v !== APP_VERSION) { localStorage.clear(); localStorage.setItem("velmora_app_version", APP_VERSION); signOut({ redirect: false }); setShowOnboarding(false); }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("scan") === "1") {
      setScanMode("face"); setView("scanner"); window.history.replaceState({}, "", "/");
    }
  }, []);

  const saveToCloud = async (payload: object) => {
    try { await fetch("/api/user/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); } catch {}
  };

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && session?.user) {
      setUserName(session.user.name || "User");
      setUserPic(session.user.image || null);
      const done = localStorage.getItem("velmora_onboarding_complete") === "true";
      setShowOnboarding(!done);
      const h = localStorage.getItem("velmora_history");
      if (h) { try { setHistory(JSON.parse(h)); } catch {} }
      const a = localStorage.getItem("velmora_analysis");
      if (a) { try { setData(JSON.parse(a)); } catch {} }
      const st = parseInt(localStorage.getItem("velmora_streak") || "1");
      setStreak(st || 1);
      fetch("/api/user/load").then(r => r.json()).then(({ data }) => {
        if (data) {
          if (data.history?.length) { setHistory(data.history); localStorage.setItem("velmora_history", JSON.stringify(data.history)); }
          if (data.gender) setGender(data.gender);
          if (data.country) setCountry(data.country);
          if (data.skinType) setSkinType(data.skinType);
          if (data.isPremium) { setIsPremium(true); localStorage.setItem("velmora_is_premium", "true"); }
          if (data.onboardingComplete) { localStorage.setItem("velmora_onboarding_complete", "true"); setShowOnboarding(false); }
        }
      }).catch(() => {});
    }
  }, [status, session]);

  const canScan = isPremium || (() => {
    if (typeof window !== "undefined") {
      const t = new Date().toLocaleDateString();
      const l = localStorage.getItem("velmora_last_scan_date");
      return !l || l !== t;
    }
    return true;
  })();

  // Smart login: try Google first, fall back to credentials demo login
  const handleLogin = async (nameInput?: string) => {
    if (status === "authenticated") return;
    const googleConfigured = !!(process.env.NEXT_PUBLIC_GOOGLE_CONFIGURED);
    if (googleConfigured) {
      signIn("google");
    } else {
      // Demo mode — use credentials provider with provided name or default
      const name = nameInput || userName || "Maya";
      const result = await signIn("credentials", { redirect: false, name });
      if (result?.ok) {
        localStorage.removeItem("velmora_onboarding_complete");
        setUserName(name);
        setShowOnboarding(true);
      }
    }
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("velmora_onboarding_complete", "true");
    localStorage.setItem("velmora_user_name", userName);
    saveToCloud({ onboardingComplete: true, userName, gender, country, skinType });
  };

  const resetScanner = (m: "face" | "product") => { setAi(""); setData((d: any) => d); setScanMode(m); setView("scanner"); };

  const formatMarkdown = (text: string) => text.split("\n").map((line, i) => {
    const f = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#2C1F1A;font-weight:700">$1</strong>');
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      return <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: T.accent, flexShrink: 0, marginTop: 7 }} />
        <span style={{ fontFamily: SANS, fontSize: 13.5, color: T.textMute, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: f.replace(/^[*-]\s*/, "") }} /></div>;
    }
    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
    return <p key={i} style={{ fontFamily: SANS, fontSize: 13.5, color: T.textMute, lineHeight: 1.55, margin: "0 0 8px" }} dangerouslySetInnerHTML={{ __html: f }} />;
  });

  async function handleProductResult(res: any) {
    setData(res); setView("product_results"); setLoading(true); setAi("");
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: res.image, mode: "product_scan", gender, userName }) });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setAi(d.text || "Scanning complete.");
    } catch (e: any) { setAi(`⚠️ Analysis failed: ${e.message}`); } finally { setLoading(false); }
  }

  async function handleResult(res: any) {
    if (res.error) { alert(res.error); setView("home"); return; }
    if (scanMode === "product") { handleProductResult(res); return; }
    setView("results"); setLoading(true);
    if (!isPremium) { const c = scanCount + 1; setScanCount(c); localStorage.setItem("velmora_scan_count", c.toString()); }
    setData({ image: res.image, score: 0, acne: 0, oil: 0, pigmentation: 0 }); setAi("");
    try {
      const prev = history[0];
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "face_scan", image: res.image, gender, userName, country, prevScan: prev || null }) });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      const analysisData = { image: res.image, score: d.score || 0, acne: d.acne || 0, oil: d.oil || 0, pigmentation: d.pigmentation || 0, gender, date: new Date().toLocaleDateString() };
      setData(analysisData); setAi(d.report || d.text || "Analysis complete.");
      const nh = [analysisData, ...history].slice(0, 30);
      setHistory(nh); localStorage.setItem("velmora_history", JSON.stringify(nh)); localStorage.setItem("velmora_analysis", JSON.stringify(analysisData));
      let dt = "Combination"; if (analysisData.oil > 60) dt = "Oily"; else if (analysisData.oil < 25) dt = "Dry"; else if (analysisData.acne > 40) dt = "Acne-Prone";
      setSkinType(dt);
      saveToCloud({ history: nh, gender, country, skinType: dt, onboardingComplete: true, isPremium });
      if (!isPremium) localStorage.setItem("velmora_last_scan_date", new Date().toLocaleDateString());
    } catch (e: any) { setAi(`⚠️ Could not generate AI report: ${e.message}`); } finally { setLoading(false); }
  }

  const handleTab = (id: string) => {
    if (id === "home") setView("home");
    else if (id === "scan") resetScanner("face");
    else if (id === "routine") router.push("/routine");
    else if (id === "products") router.push("/store");
    else if (id === "profile") router.push("/profile");
  };

  // ════════════════════════ SPLASH ════════════════════════
  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: 22, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }} className="animate-spinpulse">
          <Icon name="spark" size={36} color={T.accent} fill />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: 2 }}>GLOWAI</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: T.textFaint, textTransform: "uppercase", letterSpacing: 3, marginTop: 4 }}>Smart Skin AI</div>
        </div>
      </div>
    );
  }

  // ════════════════════════ WELCOME ════════════════════════
  if (showLanding && authView === "welcome") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "linear-gradient(175deg, #FCEEE8 0%, #F9D8C8 45%, #F5C0A8 100%)" }}>
        {[{ size: 300, top: -80, left: -80, opacity: 0.22, delay: "0s" }, { size: 240, top: 300, right: -70, opacity: 0.18, delay: "1.2s" }, { size: 180, top: 160, left: 100, opacity: 0.10, delay: "2.4s" }].map((b, i) => (
          <div key={i} className="animate-float" style={{ position: "absolute", width: b.size, height: b.size, borderRadius: 99, top: b.top, left: b.left, right: (b as any).right, background: `radial-gradient(circle, rgba(240,120,80,${b.opacity}) 0%, transparent 70%)`, animationDelay: b.delay, pointerEvents: "none" }} />
        ))}
        <div className="animate-fadeup" style={{ position: "absolute", top: 140, right: 22 }}><ProductChip label="Vitamin C Serum" sub="Morning step" color="#FEF0EB" /></div>
        <div className="animate-fadeup" style={{ position: "absolute", top: 218, left: 18 }}><ProductChip label="Daily Shield SPF 50" sub="Don't skip" color="#EFF0FD" /></div>
        <div className="animate-fadeup" style={{ position: "absolute", top: 300, right: 30 }}><ProductChip label="Niacinamide 10%" sub="PM routine" color="#EDF7EE" /></div>

        <div style={{ position: "absolute", top: 68, left: "50%", transform: "translateX(-50%)", padding: "7px 16px", borderRadius: 99, background: "rgba(255,255,255,0.70)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(200,90,50,0.14)" }}>
          <span className="animate-blink" style={{ width: 7, height: 7, borderRadius: 99, background: "#7FB389", boxShadow: "0 0 8px #7FB389" }} />
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#2C1F1A", letterSpacing: 0.3 }}>AI skin analysis · live</span>
        </div>
        <div style={{ position: "absolute", top: 108, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", opacity: 0.22 }}><ScoreDial score={74} size={240} /></div>

        <div style={{ marginTop: "auto", padding: "0 28px" }}>
          <div className="animate-fadeup" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Icon name="spark" size={20} color="#C44E28" fill />
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: "#C44E28", letterSpacing: 2, textTransform: "uppercase" }}>GlowAI</span>
          </div>
          <h1 className="animate-fadeup" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 0.94, color: "#2C1F1A", margin: "0 0 14px", fontWeight: 400, letterSpacing: -1 }}>
            Skin that<br /><em>actually</em><br />improves.
          </h1>
          <p className="animate-fadeup" style={{ fontFamily: SANS, fontSize: 15, color: "rgba(44,31,26,0.56)", lineHeight: 1.55, margin: "0 0 26px", maxWidth: 280 }}>
            AI scans your skin, builds a routine for you, and tracks real progress week by week.
          </p>
          <div className="animate-fadeup" style={{ marginBottom: 14 }}>
            <PrimaryBtn onClick={() => setAuthView("auth")}>Get Started</PrimaryBtn>
          </div>
          <div className="animate-fadeup" style={{ textAlign: "center", paddingBottom: 32 }}>
            <button onClick={() => setAuthView("auth")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 14, color: "rgba(44,31,26,0.48)", fontWeight: 500 }}>
              Have an account? <span style={{ color: "#C44E28", fontWeight: 700 }}>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════ AUTH ════════════════════════
  if (showLanding && authView === "auth") {
    return <AuthScreen onContinue={handleLogin} />;
  }

  // ════════════════════════ ONBOARDING ════════════════════════
  if (status === "authenticated" && showOnboarding) {
    return <OnboardingScreen slide={obSlide} setSlide={setObSlide} onScan={() => { completeOnboarding(); resetScanner("face"); }} onDone={completeOnboarding} />;
  }

  // ════════════════════════ MAIN APP ════════════════════════
  const firstName = (userName || "there").split(" ")[0];
  const PRODUCTS: [string, string, number][] = [
    ["Gentle Gel Cleanser", "Beam Labs", 0], ["Quiet Hero 10%", "Lumen", 1],
    ["Cloud Cream", "Lumen", 2], ["Daily Shield SPF 50", "Solé", 3],
    ["Brightening Essence", "Solé", 4], ["Spot Gel", "Beam Labs", 0],
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, position: "relative" }}>

      {/* ─────────── HOME DASHBOARD ─────────── */}
      {view === "home" && (
        <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "108px 20px 130px" }}>
          {/* greeting */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.1 }}>Hi {firstName}, ✦</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: T.textMute, marginTop: 2 }}>Transform Your Skin&apos;s Health</div>
            </div>
            <div onClick={() => router.push("/profile")} style={{ width: 46, height: 46, borderRadius: 99, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}>
              {userPic ? <img src={userPic} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontFamily: SERIF, fontSize: 20, color: "#fff" }}>{firstName[0]?.toUpperCase()}</span>}
            </div>
          </div>

          {/* hero banner */}
          <div onClick={() => data ? setView("results") : resetScanner("face")} style={{ borderRadius: 22, overflow: "hidden", marginBottom: 14, cursor: "pointer", position: "relative", minHeight: 148, background: "linear-gradient(125deg, #F9DDD0 0%, #F5C9B5 55%, #F0B8A2 100%)" }}>
            <div style={{ padding: "22px 20px", position: "relative", zIndex: 2 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "rgba(60,30,20,0.50)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Find the right</div>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: "#2C1F1A", lineHeight: 1.05, fontStyle: "italic", fontWeight: 400 }}>Routine<br />for your Skin</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#C44E28" }}>
                {data ? "View My Score" : "Start Scan"} <Icon name="arrowR" size={15} color="#C44E28" sw={2.2} />
              </div>
            </div>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 148, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="90" height="130" viewBox="0 0 90 130" fill="none" style={{ filter: "drop-shadow(0 8px 20px rgba(180,80,40,0.18))" }}>
                <rect x="18" y="38" width="54" height="80" rx="18" fill="rgba(255,255,255,0.75)" />
                <rect x="30" y="18" width="30" height="24" rx="8" fill="rgba(255,255,255,0.65)" />
                <rect x="28" y="8" width="34" height="14" rx="7" fill="rgba(200,100,60,0.55)" />
                <rect x="24" y="58" width="42" height="40" rx="8" fill="rgba(255,255,255,0.45)" />
                <rect x="30" y="66" width="30" height="3" rx="2" fill="rgba(180,80,40,0.4)" />
                <rect x="33" y="74" width="24" height="2" rx="1" fill="rgba(180,80,40,0.25)" />
                <rect x="56" y="44" width="6" height="28" rx="3" fill="rgba(255,255,255,0.5)" />
              </svg>
            </div>
          </div>

          {/* quick actions */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div onClick={() => resetScanner("face")} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, background: T.surface, border: `1.5px solid ${T.border}`, cursor: "pointer", boxShadow: T.shadow }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="scan" size={20} color={T.accentText} sw={1.8} /></div>
              <div><div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>Scan Skin</div><div style={{ fontFamily: SANS, fontSize: 11.5, color: T.textMute }}>AI analysis</div></div>
            </div>
            <div onClick={() => resetScanner("product")} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, background: "#EBF3FE", border: "1.5px solid rgba(78,142,212,0.2)", cursor: "pointer", boxShadow: T.shadow }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(78,142,212,0.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="products" size={20} color="#4E8ED4" sw={1.8} /></div>
              <div><div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>Scan Product</div><div style={{ fontFamily: SANS, fontSize: 11.5, color: T.textMute }}>Check ingredients</div></div>
            </div>
          </div>

          {/* AI chat banner */}
          <div onClick={() => router.push("/coach")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 18, marginBottom: 20, cursor: "pointer", background: "linear-gradient(120deg, #F9DDD0 0%, #F5C9B5 100%)", border: "1px solid rgba(196,78,40,0.15)", boxShadow: "0 4px 16px rgba(196,78,40,0.10)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${rgba(T.accent, 0.4)}` }}><Icon name="spark" size={22} color="#fff" fill /></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: "#2C1F1A" }}>Ask GlowAI</div><div style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(44,31,26,0.55)" }}>Expert skin advice, anytime</div></div>
            <Icon name="arrowR" size={20} color="rgba(44,31,26,0.35)" sw={2} />
          </div>

          {/* category pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["All", "Skincare", "Makeup"].map(c => (
              <button key={c} onClick={() => setCat(c)} style={{ padding: "8px 18px", borderRadius: 99, cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 700, border: "none", background: cat === c ? T.accent : T.surface2, color: cat === c ? "#fff" : T.textMute, boxShadow: cat === c ? `0 4px 12px ${rgba(T.accent, 0.30)}` : "none" }}>{c}</button>
            ))}
          </div>

          {/* product grid */}
          {cat === "Makeup" ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: T.textFaint, fontFamily: SANS, fontSize: 14 }}>No makeup products yet</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {PRODUCTS.map(([name, brand, pi], i) => (
                <div key={i} onClick={() => router.push("/store")} style={{ borderRadius: 20, overflow: "hidden", background: T.surface, boxShadow: T.shadow, cursor: "pointer" }}>
                  <div style={{ height: 130, background: T.pastels[pi % 5], position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="drop" size={30} color={rgba(T.accent, 0.4)} />
                    <button onClick={e => { e.stopPropagation(); setLiked(l => l.includes(i) ? l.filter(x => x !== i) : [...l, i]); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 99, background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="star" size={16} color={liked.includes(i) ? "#F0886A" : "#ccc"} sw={1.5} fill={liked.includes(i)} />
                    </button>
                  </div>
                  <div style={{ padding: "10px 12px 14px" }}>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.textMute, marginTop: 3 }}>{brand}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────── SCANNER ─────────── */}
      {view === "scanner" && (
        <div style={{ position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto", background: "#0c0908", zIndex: 60, display: "flex", flexDirection: "column" }}>
          <button onClick={() => setView("home")} style={{ position: "absolute", top: 56, left: 14, zIndex: 70, width: 36, height: 36, borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="chevL" size={18} color="#fff" sw={2.2} />
          </button>
          <div style={{ position: "absolute", top: 96, left: 24, right: 24, textAlign: "center", zIndex: 65 }}>
            <div style={{ fontFamily: SERIF, fontSize: 26, color: "#fff", lineHeight: 1.1, marginBottom: 6 }}>{scanMode === "face" ? "Position your face in the oval" : "Point at product label"}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 99, background: "rgba(127,179,137,0.2)", border: "1px solid rgba(127,179,137,0.4)" }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: "#8FC299", boxShadow: "0 0 8px #8FC299" }} />
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#8FC299" }}>Lighting: Great</span>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "150px 20px 60px" }}>
            <CameraScanner onResult={handleResult} mode={scanMode} />
          </div>
          <div style={{ position: "absolute", bottom: 40, left: 24, right: 24, textAlign: "center", fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.6)", zIndex: 65 }}>Remove glasses · tie back hair · use natural light</div>
        </div>
      )}

      {/* ─────────── RESULTS ─────────── */}
      {view === "results" && data && (loading ? (
        <ProcessingScreen image={data.image} />
      ) : (
        <ResultsView data={data} ai={ai} history={history} formatMarkdown={formatMarkdown} openReport={openReport} setOpenReport={setOpenReport} openPlan={openPlan} setOpenPlan={setOpenPlan} activeDot={activeDot} setActiveDot={setActiveDot} onRoutine={() => router.push("/routine")} onProducts={() => router.push("/store")} onBack={() => setView("home")} />
      ))}

      {/* ─────────── PRODUCT RESULTS ─────────── */}
      {view === "product_results" && data && (
        <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "100px 20px 130px" }}>
          <button onClick={() => setView("home")} style={{ position: "fixed", top: 56, left: 14, zIndex: 70, width: 36, height: 36, borderRadius: 11, cursor: "pointer", background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
          {data.image && <Placeholder label="" h={200} r={22} style={{ marginBottom: 16, backgroundImage: `url(${data.image})`, backgroundSize: "cover", backgroundPosition: "center" } as any} />}
          <h1 style={{ fontFamily: SERIF, fontSize: 28, color: T.text, margin: "0 0 16px" }}>Ingredient Analysis</h1>
          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div className="animate-spinpulse" style={{ width: 64, height: 64, borderRadius: 99, background: T.accentSoft, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="spark" size={28} color={T.accent} fill /></div>
              <div style={{ fontFamily: MONO, fontSize: 12, color: T.textFaint, textTransform: "uppercase", letterSpacing: 1 }}>Scanning ingredients…</div>
            </div>
          ) : (
            <Card>{formatMarkdown(ai)}</Card>
          )}
        </div>
      )}

      {/* TAB BAR (only on home/results) */}
      {(view === "home" || view === "results" || view === "product_results") && (
        <TabBar active={view === "home" ? "home" : ""} onChange={handleTab} />
      )}
    </div>
  );
}

// ════════════════════════ AUTH SCREEN ════════════════════════
function AuthScreen({ onContinue }: { onContinue: (name?: string) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName]   = useState("Maya Chen");
  const [email, setEmail] = useState("hello@example.com");
  const [pass, setPass]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const doLogin = async () => {
    setLoading(true);
    try { await onContinue(name || "Maya"); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden", position: "relative" }}>
      {/* top glow blob */}
      <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 340, height: 340, borderRadius: 99, background: "radial-gradient(circle, rgba(240,136,106,0.22) 0%, transparent 68%)", pointerEvents: "none" }} />

      <div className="glow-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 26px 32px" }}>
        {/* logo */}
        <div className="animate-fadeup" style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 72, marginBottom: 32 }}>
          <Icon name="spark" size={22} color={T.accentText} fill />
          <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: T.accentText, letterSpacing: 2, textTransform: "uppercase" }}>GlowAI</span>
        </div>

        {/* headline */}
        <div className="animate-fadeup" style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 38, lineHeight: 1.02, color: T.text, margin: "0 0 8px", fontWeight: 400, letterSpacing: -0.4 }}>
            {mode === "signin" ? <>Welcome<br /><em>back.</em></> : <>Create your<br /><em>account.</em></>}
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, margin: 0 }}>
            {mode === "signin" ? "Sign in to your GlowAI account." : "Start your skin journey today."}
          </p>
        </div>

        {/* social buttons */}
        <div className="animate-fadeup" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          <button onClick={doLogin} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 52, borderRadius: 16, cursor: "pointer", border: `1.5px solid ${T.border}`, background: T.surface, fontFamily: SANS, fontSize: 15, fontWeight: 700, color: T.text, boxShadow: T.shadow, opacity: loading ? 0.7 : 1 }}>
            <svg width="20" height="20" viewBox="0 0 20 20"><path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.61 4.61 0 01-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.31z" fill="#4285F4"/><path d="M10 20c2.7 0 4.97-.9 6.63-2.43l-3.24-2.5c-.9.6-2.06.96-3.39.96-2.6 0-4.8-1.76-5.6-4.12H1.06v2.58A9.99 9.99 0 0010 20z" fill="#34A853"/><path d="M4.4 11.91A6 6 0 014.1 10c0-.66.11-1.3.3-1.91V5.51H1.06A9.99 9.99 0 000 10c0 1.61.38 3.14 1.06 4.49l3.34-2.58z" fill="#FBBC05"/><path d="M10 3.97c1.47 0 2.79.51 3.82 1.5L16.7 2.6C14.97.99 12.7 0 10 0A9.99 9.99 0 001.06 5.51l3.34 2.58C5.2 5.73 7.4 3.97 10 3.97z" fill="#EA4335"/></svg>
            {loading ? "Signing in…" : "Continue with Google"}
          </button>
          <button onClick={doLogin} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, borderRadius: 16, cursor: "pointer", border: "none", background: "#1A1A1A", fontFamily: SANS, fontSize: 15, fontWeight: 700, color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", opacity: loading ? 0.7 : 1 }}>
            <svg width="18" height="22" viewBox="0 0 18 22" fill="#fff"><path d="M14.96 11.6c-.02-2.37 1.94-3.52 2.03-3.58-1.11-1.62-2.83-1.84-3.44-1.86-1.46-.15-2.86.87-3.6.87-.75 0-1.9-.85-3.12-.83-1.6.02-3.08.93-3.9 2.36-1.67 2.89-.43 7.17 1.2 9.52.8 1.15 1.75 2.44 3 2.39 1.2-.05 1.66-.78 3.11-.78 1.46 0 1.88.78 3.15.75 1.3-.02 2.12-1.17 2.91-2.33.93-1.33 1.3-2.63 1.32-2.7-.03-.01-2.63-1.01-2.66-4.01zM12.41 4.02C13.07 3.22 13.5 2.1 13.38 1c-.95.04-2.12.64-2.8 1.43-.61.7-1.15 1.85-1.01 2.94 1.06.08 2.14-.54 2.84-1.35z"/></svg>
            Continue with Apple
          </button>
        </div>

        {/* divider */}
        <div className="animate-fadeup" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} /><span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: T.textFaint }}>or</span><div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* fields */}
        <div className="animate-fadeup" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
          {/* name field — always shown for personalization */}
          <div style={{ padding: "14px 16px", borderRadius: 14, background: T.surface, border: `1.5px solid ${name ? T.accent : T.border}` }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: T.textFaint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Your name</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Maya Chen" style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text }} />
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: T.surface, border: `1.5px solid ${email ? T.accent : T.border}` }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: T.textFaint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@example.com" style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text }} />
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: T.surface, border: `1.5px solid ${pass ? T.accent : T.border}`, position: "relative" }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: T.textFaint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Password</div>
            <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={{ width: "calc(100% - 32px)", border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text }} />
            <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textFaint, fontFamily: SANS, fontSize: 12, fontWeight: 600 }}>{showPass ? "Hide" : "Show"}</button>
          </div>
        </div>

        {mode === "signin" && (
          <div className="animate-fadeup" style={{ textAlign: "right", marginBottom: 20 }}>
            <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: T.accentText, cursor: "pointer" }}>Forgot password?</span>
          </div>
        )}

        <div className="animate-fadeup">
          <PrimaryBtn onClick={doLogin}>{loading ? "Signing in…" : (mode === "signin" ? "Sign In" : "Create Account")}</PrimaryBtn>
        </div>

        <div className="animate-fadeup" style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontFamily: SANS, fontSize: 14, color: T.textMute }}>{mode === "signin" ? "Don't have an account? " : "Already have an account? "}</span>
          <span onClick={() => setMode(m => m === "signin" ? "signup" : "signin")} style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: T.accentText, cursor: "pointer" }}>{mode === "signin" ? "Sign Up" : "Sign In"}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════ ONBOARDING ════════════════════════
const OB_SLIDES = [
  { icon: "scan" as const, color: "#FEF0EB", accent: "#F0886A", title: "AI Skin Analysis", sub: "Scan your face in seconds. GlowAI detects 6 key metrics and gives you a personalised skin score.", label: "Smart · Accurate · Instant" },
  { icon: "routine" as const, color: "#EFF0FD", accent: "#8B85E0", title: "Your Daily Routine", sub: "A step-by-step routine built exactly for your skin — right ingredients, right order, right timing.", label: "Personalised · Simple · Effective" },
  { icon: "arrowUp" as const, color: "#EDF7EE", accent: "#5FAD72", title: "Track Real Progress", sub: "Watch your skin improve week by week. Compare scans, spot trends, and earn milestones.", label: "Visual · Motivating · Honest" },
  { icon: "products" as const, color: "#FEF7EB", accent: "#D9A040", title: "Smart Ingredient Checker", sub: "Scan any product and instantly know if it's right for your skin — with zero guesswork.", label: "Safe · Curated · For You" },
  { icon: "camera" as const, color: "#FDEDF0", accent: "#E06B8B", title: "Let's scan your skin", sub: "Your first AI skin scan takes just 3 seconds. Make sure you're in good lighting.", label: "Quick · Private · Accurate", cta: "Scan My Skin →" },
];
function OnboardingScreen({ slide, setSlide, onScan, onDone }: { slide: number; setSlide: (n: number) => void; onScan: () => void; onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const s = OB_SLIDES[slide];
  const isLast = slide === OB_SLIDES.length - 1;
  const go = (n: number) => { setVisible(false); setTimeout(() => { setSlide(n); setVisible(true); }, 200); };
  const cta = () => { if (s.cta) onScan(); else if (isLast) onDone(); else go(slide + 1); };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "62px 22px 0" }}>
        <button onClick={onDone} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 600, color: T.textMute }}>Skip</button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 28px 0", opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.93)", transition: "opacity .22s ease, transform .22s ease" }}>
        <div style={{ width: "100%", borderRadius: 32, background: s.color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px 28px", boxShadow: `0 20px 60px ${rgba(s.accent, 0.16)}` }}>
          <div className={isLast ? "animate-spinpulse" : ""} style={{ width: 96, height: 96, borderRadius: 99, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: `0 12px 36px ${rgba(s.accent, 0.22)}` }}><Icon name={s.icon} size={44} color={s.accent} sw={1.6} /></div>
          <div style={{ padding: "6px 14px", borderRadius: 99, background: rgba(s.accent, 0.14), fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: s.accent, letterSpacing: 0.3 }}>{s.label}</div>
        </div>
      </div>
      <div style={{ padding: "26px 28px 0", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "opacity .26s ease, transform .26s ease" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.05, color: T.text, margin: "0 0 10px", fontWeight: 400, letterSpacing: -0.3 }}>{s.title}</h2>
        <p style={{ fontFamily: SANS, fontSize: 15, color: T.textMute, lineHeight: 1.6, margin: 0 }}>{s.sub}</p>
      </div>
      <div style={{ padding: "22px 28px 36px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 20 }}>
          {OB_SLIDES.map((_, i) => <div key={i} onClick={() => go(i)} style={{ cursor: "pointer", width: i === slide ? 22 : 7, height: 7, borderRadius: 99, background: i === slide ? s.accent : T.border, transition: "all .3s ease" }} />)}
        </div>
        <PrimaryBtn style={{ background: s.accent, boxShadow: `0 8px 22px ${rgba(s.accent, 0.35)}` }} onClick={cta}>{s.cta || (isLast ? "Get Started" : "Next")}</PrimaryBtn>
      </div>
    </div>
  );
}

// ════════════════════════ PROCESSING ════════════════════════
function ProcessingScreen({ image }: { image?: string }) {
  const stages = ["Analyzing skin texture…", "Detecting concerns…", "Measuring hydration…", "Calculating your score…"];
  const [i, setI] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setI(x => Math.min(x + 1, stages.length - 1)), 1500);
    const b = setInterval(() => setPct(x => Math.min(x + 2, 98)), 110);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, background: T.bg }}>
      <div style={{ width: 230, height: 300, borderRadius: "50%", position: "relative", overflow: "hidden", border: `1px solid ${T.border}`, background: T.surface2 }}>
        {image && <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <div className="animate-scanline" style={{ position: "absolute", left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`, boxShadow: `0 0 16px 2px ${T.accent}` }} />
        <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(0deg, ${rgba(T.accent, 0.05)} 0 18px, transparent 18px 19px)` }} />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 600, color: T.text, marginTop: 30 }}>{pct}%</div>
      <div style={{ fontFamily: SANS, fontSize: 16, color: T.textMute, marginTop: 4, height: 22 }}>{stages[i]}</div>
      <div style={{ display: "flex", gap: 7, marginTop: 18 }}>
        {stages.map((_, x) => <span key={x} style={{ width: x === i ? 22 : 7, height: 7, borderRadius: 99, background: x <= i ? T.accent : T.surface2, transition: "all .3s" }} />)}
      </div>
    </div>
  );
}

// ════════════════════════ RESULTS ════════════════════════
function ResultsView({ data, ai, history, formatMarkdown, openReport, setOpenReport, openPlan, setOpenPlan, activeDot, setActiveDot, onRoutine, onProducts, onBack }: any) {
  const score = data.score || 0;
  const prev = history[1];
  const delta = prev ? score - prev.score : 0;
  const concerns = [
    { name: "Acne & Breakouts", val: data.acne || 0, dir: "down", tone: "good", pos: { x: 38, y: 44 }, icon: "warn" as const },
    { name: "Oiliness", val: data.oil || 0, dir: "flat", tone: "warn", pos: { x: 64, y: 52 }, icon: "sun" as const },
    { name: "Pigmentation", val: data.pigmentation || 0, dir: "flat", tone: "mute", pos: { x: 30, y: 64 }, icon: "drop" as const },
    { name: "Hydration", val: Math.max(0, 100 - (data.oil || 50)), dir: "up", tone: "good", pos: { x: 70, y: 38 }, icon: "drop" as const },
  ];
  const sev = (v: number) => v >= 60 ? "Severe" : v >= 35 ? "Moderate" : "Mild";
  const metrics: [string, number, any, string][] = [
    ["Hydration", Math.max(0, 100 - (data.oil || 50)), "drop", "#5AA9D6"],
    ["Oiliness", data.oil || 0, "sun", "#E8A24C"],
    ["Texture", Math.min(100, score + 4), "grid", "#7FB389"],
    ["Redness", data.acne || 0, "warn", "#E0685C"],
    ["Pore Size", Math.round((data.oil || 0) * 0.9), "scan", "#B58BD6"],
    ["Radiance", score, "spark", "#D9B86A"],
  ];
  const arrow: Record<string, [any, string]> = { down: ["arrowDown", "#8FC299"], up: ["arrowUp", "#E0685C"], flat: ["arrowR", "#9a8a80"] };
  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "56px 20px 130px" }}>
      <button onClick={onBack} style={{ position: "fixed", top: 56, left: 14, zIndex: 70, width: 36, height: 36, borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(10px)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
      {/* photo + dots */}
      <div style={{ position: "relative", marginBottom: 18, marginTop: 8 }}>
        {data.image ? <div style={{ height: 240, borderRadius: 24, backgroundImage: `url(${data.image})`, backgroundSize: "cover", backgroundPosition: "center" }} /> : <Placeholder label="scanned selfie" h={240} r={24} />}
        {concerns.map((c, i) => (
          <button key={i} onClick={() => setActiveDot(activeDot === i ? null : i)} style={{ position: "absolute", left: `${c.pos.x}%`, top: `${c.pos.y}%`, transform: "translate(-50%,-50%)", cursor: "pointer", width: 22, height: 22, borderRadius: 99, border: "2px solid #fff", background: rgba(c.tone === "good" ? "#8FC299" : c.tone === "warn" ? "#E8A24C" : c.tone === "bad" ? "#E0685C" : "#9a8a80", 0.9), padding: 0 }}>
            {activeDot === i && <span style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", background: "#1a1310", color: "#fff", padding: "5px 10px", borderRadius: 8, fontFamily: SANS, fontSize: 12, fontWeight: 600 }}>{c.name} · {sev(c.val)}</span>}
          </button>
        ))}
        <div style={{ position: "absolute", top: 12, left: 12 }}><Badge tone="mute" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>Tap dots to inspect</Badge></div>
      </div>
      {/* score */}
      <Card glow style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <ScoreDial score={score} size={120} delta={delta} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SERIF, fontSize: 28, color: T.text, lineHeight: 1.05 }}>Overall<br />Skin Score</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "5px 10px", borderRadius: 8, background: delta >= 0 ? "rgba(127,179,137,0.16)" : "rgba(224,104,92,0.16)" }}>
            <Icon name={delta >= 0 ? "arrowUp" : "arrowDown"} size={14} color={delta >= 0 ? "#8FC299" : "#E0685C"} sw={2.4} />
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: delta >= 0 ? "#8FC299" : "#E0685C" }}>{delta >= 0 ? "+" : ""}{delta} {prev ? "since last scan" : "first scan"}</span>
          </div>
        </div>
      </Card>
      {/* concerns */}
      <SectionTitle>Concern Breakdown</SectionTitle>
      <Card pad={6} style={{ marginBottom: 20 }}>
        {concerns.map((c, i) => { const [ai2, ac] = arrow[c.dir]; return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 12px", borderTop: i ? `1px solid ${T.border}` : "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={c.icon} size={19} color={T.textMute} /></div>
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: T.text }}>{c.name}</span>
            <Badge tone={c.tone as any}>{sev(c.val)}</Badge>
            <Icon name={ai2} size={18} color={ac} sw={2.2} />
          </div>
        ); })}
      </Card>
      {/* metrics */}
      <SectionTitle>Skin Metrics</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 22px" }}>
          {metrics.map(([l, v, ic, col]) => <MetricBar key={l} label={l} value={v} icon={ic} color={col} />)}
        </div>
      </Card>
      {/* actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <PrimaryBtn icon="routine" onClick={onRoutine}>Update My Routine</PrimaryBtn>
        <div style={{ display: "flex", gap: 10 }}><GhostBtn onClick={onProducts}>Product Recs</GhostBtn><GhostBtn onClick={onBack}>Done</GhostBtn></div>
      </div>
      {/* AI report */}
      {ai && (
        <div style={{ borderRadius: 18, background: T.surface, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 12, boxShadow: T.shadow }}>
          <button onClick={() => setOpenReport((o: boolean) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="spark" size={16} color={T.accentText} fill />
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.accentText, textTransform: "uppercase", letterSpacing: 1, textAlign: "left" }}>Complete AI Skin Report</span>
            <div style={{ transform: openReport ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }}><Icon name="chevDown" size={18} color={T.textFaint} /></div>
          </button>
          {openReport && <div style={{ padding: "0 16px 16px" }}>{formatMarkdown(ai)}</div>}
        </div>
      )}
    </div>
  );
}
