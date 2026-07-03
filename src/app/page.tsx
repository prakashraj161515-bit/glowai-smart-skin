"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CameraScanner from "@/components/CameraScanner";
import {
  T, SERIF, MONO, SANS, rgba, scoreColor, scoreLabel, Icon, Placeholder, Card,
  PrimaryBtn, GhostBtn, Chip, Badge, ScoreDial, MetricBar, MiniRing, SectionTitle,
  TabBar, BuyBtn,
} from "@/glow/ui";
import { productImg, ALL_PRODUCTS } from "@/glow/affiliate";
import { LivePrice, fmtCount } from "@/glow/store-ui";
import { tickLoyalty } from "@/glow/loyalty";
import { canFaceScan, recordFaceScan, faceScansLeft } from "@/glow/premium";
import { PremiumGate } from "@/glow/PremiumLock";

type HistoryEntry = { date: string; score: number; acne: number; oil: number; pigmentation: number; image?: string };

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [view, setView] = useState<"home" | "scanner" | "results" | "product_results">("home");
  const [scanMode, setScanMode] = useState<"face" | "product">("face");
  const [data, setData] = useState<any>(null);
  const [ai, setAi] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [country, setCountry] = useState("India");
  const [waterIntake, setWaterIntake] = useState(0);
  // Local "did the user actually sign in on THIS install" marker. After a logout
  // or an app delete/reinstall, localStorage is cleared so this is gone → we force
  // the Google login screen again even if a stale session cookie still exists.
  const [localAuthed, setLocalAuthed] = useState<boolean | null>(null);
  useEffect(() => { setLocalAuthed(localStorage.getItem("velmora_authed") === "true"); }, []);

  // Pre-load the other pages in the background as soon as home opens, so tapping
  // a tab/button navigates near-instantly instead of loading the route fresh.
  useEffect(() => {
    ["/routine", "/store", "/coach", "/diet", "/progress", "/profile", "/premium"]
      .forEach((p) => { try { router.prefetch(p); } catch {} });
  }, [router]);
  const showLanding = status === "unauthenticated" || (status === "authenticated" && localAuthed === false);
  const [authView, setAuthView] = useState<"welcome" | "auth">("welcome");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [obSlide, setObSlide] = useState(0);
  const [userName, setUserName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [skinType, setSkinType] = useState("Oily");
  const [userPic, setUserPic] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [gate, setGate] = useState<{ title: string; sub: string } | null>(null);
  const onboardingScanRef = useRef(false);
  const [streak, setStreak] = useState(1);
  const [cat, setCat] = useState("All");
  const [liked, setLiked] = useState<number[]>([]);
  const [openReport, setOpenReport] = useState(true);
  const [openPlan, setOpenPlan] = useState(true);
  const [activeDot, setActiveDot] = useState<number | null>(null);

  const APP_VERSION = "3.0";

  useEffect(() => {
    // One-time global reset: revoke any previously-set premium (no real payments
    // existed yet, so everyone starts fresh on the Free plan). Bump the version
    // suffix to run this again in the future.
    if (localStorage.getItem("velmora_premium_reset_v1") !== "done") {
      localStorage.setItem("velmora_is_premium", "false");
      localStorage.setItem("velmora_premium_reset_v1", "done");
      fetch("/api/user/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPremium: false }) }).catch(() => {});
    }
    setIsPremium(localStorage.getItem("velmora_is_premium") === "true");
  }, []);

  // ── Android/browser BACK button: close an open in-app view or modal instead of
  //    exiting the whole app. Pushes one history entry when an overlay opens and
  //    pops it back on Back. ──
  const viewRef = useRef(view);
  const gateRef = useRef(gate);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { gateRef.current = gate; }, [gate]);
  const overlayOpen = view !== "home" || !!gate;
  const pushedRef = useRef(false);
  useEffect(() => {
    if (overlayOpen && !pushedRef.current) {
      pushedRef.current = true;
      window.history.pushState({ overlay: true }, "");
    } else if (!overlayOpen) {
      pushedRef.current = false;
    }
  }, [overlayOpen]);
  useEffect(() => {
    const onPop = () => {
      if (gateRef.current) { setGate(null); pushedRef.current = false; return; }
      if (viewRef.current !== "home") { setView("home"); pushedRef.current = false; return; }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
    if (typeof window === "undefined") return;
    const s = new URLSearchParams(window.location.search).get("scan");
    if (s === "1") { setScanMode("face"); setView("scanner"); window.history.replaceState({}, "", "/"); }
    else if (s === "product") { setScanMode("product"); setView("scanner"); window.history.replaceState({}, "", "/"); }
  }, []);

  const saveToCloud = async (payload: object) => {
    try { await fetch("/api/user/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); } catch {}
  };

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && session?.user) {
      // Only treat this as a real, kept session if the user actually signed in on
      // this install (login intent) or was already marked. A stale cookie on a
      // fresh install has neither → we leave the marker off so the login screen shows.
      if (sessionStorage.getItem("velmora_login_intent") === "1" || localStorage.getItem("velmora_authed") === "true") {
        localStorage.setItem("velmora_authed", "true");
        sessionStorage.removeItem("velmora_login_intent");
        setLocalAuthed(true);
      }
      setUserName(session.user.name || "User");
      setUserPic(session.user.image || null);
      // Link this account to Qonversion and sync the REAL subscription state, so
      // Premium reflects actual renewals / expiry / a purchase made on another
      // device. We only ever UPGRADE here (grant if an entitlement is active);
      // we never revoke based on this, to avoid false downgrades when the store
      // isn't configured. No-ops in a plain browser (CreamNative absent).
      (async () => {
        try {
          const n: any = (window as any).CreamNative;
          if (!n?.isNative) return;
          const email = session.user?.email;
          if (email) { try { await n.call("purchases.identify", { userId: email }); } catch {} }
          const res: any = await n.call("purchases.entitlements", {});
          const ents = res?.entitlements || {};
          let end = 0, active = false;
          for (const k in ents) {
            const e = ents[k];
            if (e?.active) { active = true; if (e?.expiresAt) { const t = Date.parse(e.expiresAt); if (t) end = Math.max(end, t); } }
          }
          if (active) {
            localStorage.setItem("velmora_is_premium", "true");
            if (end) localStorage.setItem("velmora_premium_until", String(end));
            setIsPremium(true);
            fetch("/api/user/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPremium: true, ...(end ? { premiumUntil: end } : {}) }) }).catch(() => {});
          }
        } catch {}
      })();
      // Onboarding is gated ONLY on the local flag. A fresh install (or
      // uninstall + reinstall) wipes it, so onboarding shows again — even for
      // returning users. A normal app reopen keeps the flag, so it won't show.
      const done = localStorage.getItem("velmora_onboarding_complete") === "true";
      setShowOnboarding(!done);
      const h = localStorage.getItem("velmora_history");
      if (h) { try { setHistory(JSON.parse(h)); } catch {} }
      const a = localStorage.getItem("velmora_analysis");
      if (a) { try { const ad = JSON.parse(a); setData(ad); if (ad.summary) setSummary(ad.summary); } catch {} }
      const savedAi = localStorage.getItem("velmora_ai_report");
      if (savedAi) setAi(savedAi);
      const ly = tickLoyalty();          // update daily login streak + bank discount at 30 days
      setStreak(ly.streak || 1);
      fetch("/api/user/load").then(r => r.json()).then(({ data }) => {
        if (data) {
          if (data.history?.length) { setHistory(data.history); localStorage.setItem("velmora_history", JSON.stringify(data.history)); }
          if (data.gender) setGender(data.gender);
          if (data.country) setCountry(data.country);
          if (data.skinType) setSkinType(data.skinType);
          if (data.isPremium) { setIsPremium(true); localStorage.setItem("velmora_is_premium", "true"); }
          // NOTE: we intentionally do NOT hide onboarding based on the cloud
          // record — a reinstall should always re-show onboarding. The user's
          // data (history/profile/premium) is still restored above.
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

  // Login: Google is the only sign-in method (real OAuth account-chooser)
  const handleLogin = async (_provider: "google") => {
    // mark that THIS login is an explicit user action, so the session is kept
    try { sessionStorage.setItem("velmora_login_intent", "1"); } catch {}
    // Inside the native shell, Google blocks OAuth in a WebView. Use the native
    // Google Sign-In bridge instead and verify the ID token server-side.
    const native: any = typeof window !== "undefined" ? (window as any).CreamNative : null;
    if (native?.isNative) {
      // Inside the app NEVER fall back to web OAuth (Google blocks it in WebView).
      try {
        const res = await native.call("auth.googleSignIn");
        if (!res || !res.idToken) {
          // null = user cancelled the chooser; otherwise no token came back
          if (res !== null && res !== undefined) {
            alert("Google sign-in didn't return a token. Please try again.");
          }
          return;
        }
        const out = await signIn("native-google", { idToken: res.idToken, redirect: false });
        if (out?.ok) {
          localStorage.setItem("velmora_authed", "true");
          window.location.href = "/";
          return;
        }
        alert("Sign-in failed on the server: " + (out?.error || "unknown") + ". Email: " + (res.email || "?"));
        return;
      } catch (e: any) {
        // surface the native error so we can see exactly what's wrong (e.g. DEVELOPER_ERROR)
        alert("Native Google sign-in error: " + (e?.message || String(e)));
        return;
      }
    }
    // Browser (not the app): normal web OAuth
    signIn("google", { callbackUrl: "/" });
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("velmora_onboarding_complete", "true");
    localStorage.setItem("velmora_user_name", userName);
    saveToCloud({ onboardingComplete: true, userName, gender, country, skinType });
  };

  const resetScanner = (m: "face" | "product") => {
    // Product scanner = Premium only
    if (m === "product" && !isPremium) {
      setGate({ title: "Product Scanner is Premium", sub: "Scan any skincare product to instantly check if it suits your skin. Upgrade to unlock unlimited product scans." });
      return;
    }
    // Free face scans are limited per day (onboarding scan not counted)
    if (m === "face" && !isPremium && !canFaceScan()) {
      setGate({ title: "Daily free scan used", sub: "Free members get 1 face scan per day. Come back tomorrow, or go Premium for unlimited scans." });
      return;
    }
    setAi(""); setData((d: any) => d); setScanMode(m); setView("scanner");
  };

  const formatMarkdown = (text: string) => text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    // full-line bold => section header chip
    const headerMatch = trimmed.match(/^\*\*(.+?)\*\*:?\.?$/);
    if (headerMatch) {
      return <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, margin: i ? "16px 0 10px" : "0 0 10px" }}>
        <span style={{ width: 5, height: 16, borderRadius: 99, background: T.accent }} />
        <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 800, color: T.accentText, textTransform: "uppercase", letterSpacing: 0.8 }}>{headerMatch[1]}</span>
      </div>;
    }
    const f = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#2C1F1A;font-weight:700">$1</strong>');
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      return <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: T.accent, flexShrink: 0, marginTop: 7 }} />
        <span style={{ fontFamily: SANS, fontSize: 14, color: T.text, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: f.replace(/^[*\-•]\s*/, "") }} /></div>;
    }
    if (trimmed === "") return <div key={i} style={{ height: 6 }} />;
    return <p key={i} style={{ fontFamily: SANS, fontSize: 13.5, color: T.textMute, lineHeight: 1.55, margin: "0 0 8px" }} dangerouslySetInnerHTML={{ __html: f }} />;
  });

  async function handleProductResult(res: any) {
    setData(res); setView("product_results"); setLoading(true); setAi(""); setProduct(null);
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: res.image, mode: "product_scan", gender, userName }) });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      if (d.product) setProduct(d.product);
      else setAi(d.text || "Scanning complete.");
    } catch (e: any) { setAi("⚠️ Server is busy, please try again."); } finally { setLoading(false); }
  }

  async function handleResult(res: any) {
    if (res.error) { alert(res.error); setView("home"); return; }
    if (scanMode === "product") { handleProductResult(res); return; }
    setView("results"); setLoading(true);
    setData({ image: res.image, score: 0, acne: 0, oil: 0, pigmentation: 0 }); setAi("");
    try {
      const prev = history[0];
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "face_scan", image: res.image, gender, userName, country, prevScan: prev || null }) });
      if (!r.ok) throw new Error("busy"); // server overloaded (429/500/503) → not a real result
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      // AI couldn't read the face (blurry / no clear face) → ask for a retry instead of a blank 0 result
      const unclear = (typeof d.score === "number" && d.score === 0) || /unclear|blurry|no face/i.test(d.topConcern || "");
      if (unclear) {
        setLoading(false);
        alert("Hmm, the photo wasn't clear enough to read your skin. Please hold steady in good light and scan again. 📸");
        resetScanner("face");
        return;
      }
      const num = (v: any, fb: number) => typeof v === "number" ? v : fb;
      const analysisData = {
        image: res.image,
        score: num(d.score, 0), acne: num(d.acne, 0), oil: num(d.oil, 0), pigmentation: num(d.pigmentation, 0),
        hydration: num(d.hydration, Math.max(0, 100 - num(d.oil, 50))),
        texture: num(d.texture, Math.min(100, num(d.score, 60) + 4)),
        redness: num(d.redness, num(d.acne, 0)),
        poreSize: num(d.poreSize, Math.round(num(d.oil, 0) * 0.9)),
        radiance: num(d.radiance, num(d.score, 60)),
        topConcern: d.topConcern || "",
        summary: d.summary || "", gender, date: new Date().toLocaleDateString(), ts: Date.now(),
      };
      setData(analysisData); setAi(d.report || d.text || "Analysis complete."); setSummary(d.summary || "");
      // ✅ Scan SUCCEEDED → only NOW count it against the free daily limit (a
      // server-busy / failed scan above throws and is never counted).
      recordFaceScan(onboardingScanRef.current); // onboarding scan not counted
      onboardingScanRef.current = false;
      const nh = [analysisData, ...history].slice(0, 30);
      setHistory(nh); localStorage.setItem("velmora_history", JSON.stringify(nh)); localStorage.setItem("velmora_analysis", JSON.stringify(analysisData));
      localStorage.setItem("velmora_ai_report", d.report || d.text || "");
      // Prefer the AI's own skin-type call (covers Normal & Sensitive too);
      // fall back to a simple oil/acne rule only if the AI didn't return one.
      const valid = ["Oily", "Dry", "Combination", "Normal", "Sensitive", "Acne-Prone"];
      let dt: string = valid.includes(d.skinType) ? d.skinType
        : analysisData.oil > 60 ? "Oily"
        : analysisData.oil < 25 ? "Dry"
        : analysisData.acne > 40 ? "Acne-Prone"
        : "Combination";
      setSkinType(dt);
      saveToCloud({ history: nh, gender, country, skinType: dt, onboardingComplete: true, isPremium });
      if (!isPremium) localStorage.setItem("velmora_last_scan_date", new Date().toLocaleDateString());
    } catch (e: any) {
      // Server busy / failed → DON'T show a fake (all-zero) result and DON'T burn
      // a free scan. Just tell the user and let them try again.
      setLoading(false);
      alert("⚠️ Server is busy, please try again.");
      resetScanner("face");
      return;
    } finally { setLoading(false); }
  }

  const handleTab = (id: string) => {
    if (id === "home") setView("home");
    else if (id === "scan") resetScanner("face");
    else if (id === "routine") router.push("/routine");
    else if (id === "products") router.push("/store");
    else if (id === "profile") router.push("/profile");
  };

  // ════════════════════════ SPLASH ════════════════════════
  if (status === "loading" || localAuthed === null) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: 22, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }} className="animate-spinpulse">
          <Icon name="spark" size={36} color={T.accent} fill />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: 2 }}>CREAM</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: T.textFaint, textTransform: "uppercase", letterSpacing: 3, marginTop: 4 }}>AI Skin Care &amp; Scanner</div>
        </div>
      </div>
    );
  }

  // ════════════════════════ AUTH (landing gate) ════════════════════════
  if (showLanding) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // ════════════════════════ ONBOARDING ════════════════════════
  if (status === "authenticated" && showOnboarding) {
    return <OnboardingScreen slide={obSlide} setSlide={setObSlide} onScan={() => { completeOnboarding(); onboardingScanRef.current = true; setAi(""); setScanMode("face"); setView("scanner"); }} onDone={completeOnboarding} />;
  }

  // ════════════════════════ MAIN APP ════════════════════════
  const firstName = (userName || "there").split(" ")[0];
  // Top bestsellers for the home grid (real products)
  const PRODUCTS = ALL_PRODUCTS.filter(p => p.bestseller).slice(0, 8);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, position: "relative" }}>

      {/* ─────────── HOME DASHBOARD ─────────── */}
      {view === "home" && (
        <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "64px 20px 130px" }}>
          {/* greeting */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.1 }}>Hi {firstName}, ✦</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: T.textMute, marginTop: 2 }}>Transform Your Skin&apos;s Health</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* premium / subscribe icon */}
              <button onClick={() => router.push("/premium")} title="Premium" style={{ height: 42, padding: "0 14px 0 12px", borderRadius: 13, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #F5C76B, #E8A24C)", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 6px 16px rgba(232,162,76,0.4)", flexShrink: 0 }}>
                <Icon name="crown" size={19} color="#3a2a10" fill />
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: "#3a2a10" }}>Premium</span>
              </button>
              <div onClick={() => router.push("/profile")} style={{ width: 46, height: 46, borderRadius: 99, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}>
                {userPic ? <img src={userPic} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontFamily: SERIF, fontSize: 20, color: "#fff" }}>{firstName[0]?.toUpperCase()}</span>}
              </div>
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
            {/* real product photo (unbranded) — blended into hero */}
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", zIndex: 1 }}>
              <img src="/hero-product.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #F2BFA8 0%, rgba(242,191,168,0.55) 22%, rgba(242,191,168,0) 50%)" }} />
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
            <div style={{ width: 42, height: 42, borderRadius: 13, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${rgba(T.accent, 0.4)}` }}><Icon name="chat" size={22} color="#fff" /></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: "#2C1F1A" }}>Chat with Aura</div><div style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(44,31,26,0.55)" }}>Your AI skin coach, anytime</div></div>
            <Icon name="arrowR" size={20} color="rgba(44,31,26,0.35)" sw={2} />
          </div>

          {/* category pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["All", "Skincare"].map(c => (
              <button key={c} onClick={() => setCat(c)} style={{ padding: "8px 18px", borderRadius: 99, cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 700, border: "none", background: cat === c ? T.accent : T.surface2, color: cat === c ? "#fff" : T.textMute, boxShadow: cat === c ? `0 4px 12px ${rgba(T.accent, 0.30)}` : "none" }}>{c}</button>
            ))}
          </div>

          {/* product grid — top bestsellers */}
          {(
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: 0.8 }}>🔥 Bestsellers</span>
                <button onClick={() => router.push("/store")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: T.accentText }}>See all {ALL_PRODUCTS.length} →</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {PRODUCTS.map((p, i) => {
                  const img = productImg(p.name);
                  return (
                  <div key={p.asin} onClick={() => router.push("/store")} style={{ borderRadius: 20, overflow: "hidden", background: T.surface, boxShadow: T.shadow, cursor: "pointer", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: 130, position: "relative", overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, boxSizing: "border-box" }}>
                      {img && <img src={img} alt={p.name} loading="lazy" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
                      <div style={{ position: "absolute", top: 9, left: 0, display: "flex", alignItems: "center", gap: 3, padding: "3px 9px 3px 7px", background: "linear-gradient(135deg,#F5A623,#E8821C)", color: "#fff", fontFamily: SANS, fontSize: 9.5, fontWeight: 800, borderRadius: "0 99px 99px 0", textTransform: "uppercase", letterSpacing: 0.3 }}>
                        <Icon name="flame" size={10} color="#fff" fill />Bestseller
                      </div>
                    </div>
                    <div style={{ padding: "9px 11px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: T.accentText, textTransform: "uppercase", letterSpacing: 0.3 }}>{p.brand}</div>
                      <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: T.text, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 30, marginTop: 1 }}>{p.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                        <Icon name="star" size={12} color="#F0A52C" fill />
                        <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: T.text }}>{p.rating}</span>
                        <span style={{ fontFamily: SANS, fontSize: 10.5, color: T.textFaint }}>({fmtCount(p.reviews)})</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <LivePrice asin={p.asin} />
                        <BuyBtn name={p.name} variant="pill" />
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─────────── SCANNER ─────────── */}
      {view === "scanner" && (
        <div style={{ position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto", background: scanMode === "face"
            ? "radial-gradient(120% 80% at 50% 28%, #5A352A 0%, #2A1A14 48%, #120B09 100%)"
            : "radial-gradient(120% 80% at 50% 28%, #284258 0%, #16222E 48%, #0A1014 100%)", zIndex: 60, display: "flex", flexDirection: "column" }}>
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
        <ResultsView data={data} ai={ai} summary={summary} history={history} formatMarkdown={formatMarkdown} openReport={openReport} setOpenReport={setOpenReport} openPlan={openPlan} setOpenPlan={setOpenPlan} activeDot={activeDot} setActiveDot={setActiveDot} onRoutine={() => router.push("/routine")} onProducts={() => router.push("/store")} onBack={() => setView("home")} />
      ))}

      {/* ─────────── PRODUCT RESULTS ─────────── */}
      {view === "product_results" && data && (
        <ProductResultView image={data.image} loading={loading} product={product} ai={ai} formatMarkdown={formatMarkdown} onBack={() => setView("home")} onScanAgain={() => resetScanner("product")} />
      )}

      {/* TAB BAR (only on home/results) */}
      {(view === "home" || view === "results" || view === "product_results") && (
        <TabBar active={view === "home" ? "home" : ""} onChange={handleTab} />
      )}

      {/* Premium gate modal */}
      {gate && (
        <div onClick={() => setGate(null)} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(20,12,8,0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "flex-end", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, animation: "fadeUp .3s ease" }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: T.borderHi, margin: "12px auto 0" }} />
            <PremiumGate title={gate.title} sub={gate.sub} onClose={() => setGate(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════ PRODUCT SCAN RESULT (wow card) ════════════════════════
function ProductResultView({ image, loading, product, ai, formatMarkdown, onBack, onScanAgain }: any) {
  const VCOL: any = { good: "#5FA572", caution: "#E8A24C", avoid: "#E0685C" };
  const VBG: any = { good: "linear-gradient(135deg,#D8F0E0,#BEE6CC)", caution: "linear-gradient(135deg,#FBEFD6,#F6E2B8)", avoid: "linear-gradient(135deg,#FBDDD8,#F6C7BF)" };
  const VICON: any = { good: "check", caution: "warn", avoid: "close" };
  const v = product?.verdict || "caution";
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", paddingBottom: 130 }}>
        {/* hero with scanned photo */}
        <div style={{ position: "relative", height: 230, overflow: "hidden", background: "#000" }}>
          {image && <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92 }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25), transparent 30%, rgba(250,248,246,0.0) 60%, #FAF8F6 100%)" }} />
          <button onClick={onBack} style={{ position: "absolute", top: 52, left: 16, width: 38, height: 38, borderRadius: 12, cursor: "pointer", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}><Icon name="chevL" size={18} color="#2C1F1A" sw={2.2} /></button>
          <div style={{ position: "absolute", top: 52, right: 16, padding: "7px 13px", borderRadius: 99, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="spark" size={13} color={T.accent} fill /><span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 800, color: T.accentText }}>AI Scan</span>
          </div>
        </div>

        <div style={{ padding: "0 20px", marginTop: -40, position: "relative", zIndex: 2 }}>
          {loading ? (
            <ProductLoader />
          ) : product ? (
            <>
              {/* verdict card */}
              <Card style={{ marginBottom: 14, boxShadow: "0 14px 34px rgba(60,30,20,0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, flexShrink: 0, background: VBG[v], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={VICON[v]} size={28} color={VCOL[v]} sw={2.6} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, color: VCOL[v], textTransform: "uppercase", letterSpacing: 0.6 }}>{product.verdictLabel || "Verdict"}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 22, color: T.text, lineHeight: 1.1, marginTop: 2 }}>{product.productName || "Skincare Product"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                      <span style={{ display: "inline-flex", gap: 1 }}>{[1,2,3,4,5].map(i => <Icon key={i} name="star" size={13} color={i <= (product.rating||0) ? "#F0A52C" : "#E2D6CE"} fill={i <= (product.rating||0)} />)}</span>
                      {product.productType && <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: T.accentText, background: T.accentSoft, padding: "2px 9px", borderRadius: 99 }}>{product.productType}</span>}
                    </div>
                  </div>
                </div>
                {product.summary && <p style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, lineHeight: 1.5, margin: "13px 0 0" }}>{product.summary}</p>}
              </Card>

              {/* key ingredients */}
              {product.keyIngredients?.length > 0 && (
                <Card style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 11, display: "flex", alignItems: "center", gap: 7 }}><Icon name="leaf" size={15} color="#5FA572" /> Key Ingredients</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {product.keyIngredients.map((ing: string, i: number) => (
                      <span key={i} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: T.text, background: T.surface2, padding: "7px 13px", borderRadius: 99, border: `1px solid ${T.border}` }}>{ing}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* good for / watch out */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                {product.goodFor?.length > 0 && (
                  <Card pad={14} style={{ flex: 1 }}>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 800, color: "#5FA572", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}><Icon name="check" size={14} color="#5FA572" sw={2.4} /> Good for</div>
                    {product.goodFor.map((g: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 7, marginBottom: 7, alignItems: "flex-start" }}><span style={{ width: 5, height: 5, borderRadius: 99, background: "#5FA572", flexShrink: 0, marginTop: 6 }} /><span style={{ fontFamily: SANS, fontSize: 12.5, color: T.text, lineHeight: 1.4 }}>{g}</span></div>
                    ))}
                  </Card>
                )}
                {product.watchOut?.length > 0 && (
                  <Card pad={14} style={{ flex: 1 }}>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 800, color: "#E8A24C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}><Icon name="warn" size={14} color="#E8A24C" /> Watch out</div>
                    {product.watchOut.map((w: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 7, marginBottom: 7, alignItems: "flex-start" }}><span style={{ width: 5, height: 5, borderRadius: 99, background: "#E8A24C", flexShrink: 0, marginTop: 6 }} /><span style={{ fontFamily: SANS, fontSize: 12.5, color: T.text, lineHeight: 1.4 }}>{w}</span></div>
                    ))}
                  </Card>
                )}
              </div>

              {/* how to use */}
              {product.howToUse && (
                <Card style={{ marginBottom: 14, background: "linear-gradient(135deg, rgba(240,136,106,0.08), rgba(240,136,106,0.02))", border: `1px solid ${T.accentDim}` }}>
                  <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="clock" size={19} color={T.accentText} /></div>
                    <div><div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: T.accentText, textTransform: "uppercase", letterSpacing: 0.5 }}>How to use</div><div style={{ fontFamily: SANS, fontSize: 13.5, color: T.text, lineHeight: 1.45, marginTop: 2 }}>{product.howToUse}</div></div>
                  </div>
                </Card>
              )}

              <button onClick={onScanAgain} style={{ width: "100%", height: 52, borderRadius: 16, border: `1.5px solid ${T.borderHi}`, background: T.surface, cursor: "pointer", fontFamily: SANS, fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="camera" size={19} color={T.accentText} /> Scan another product</button>
            </>
          ) : (
            // fallback: AI returned plain text
            <Card style={{ marginTop: 8 }}><h1 style={{ fontFamily: SERIF, fontSize: 24, color: T.text, margin: "0 0 12px" }}>Ingredient Analysis</h1>{formatMarkdown(ai)}</Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════ AUTH SCREEN ════════════════════════
function AuthScreen({ onLogin }: { onLogin: (p: "google") => Promise<void> }) {
  const [loading, setLoading] = useState<"" | "google">("");
  const go = async (p: "google") => { setLoading(p); try { await onLogin(p); } finally { setLoading(""); } };

  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden", position: "relative", background: "linear-gradient(175deg, #FCEEE8 0%, #F9D8C8 48%, #F5C0A8 100%)" }}>
      {/* ambient glow rings */}
      {[{ s: 300, t: -90, l: -90, o: 0.18, d: "0s" }, { s: 240, t: 220, r: -80, o: 0.14, d: "1.2s" }].map((b, i) => (
        <div key={i} className="animate-float" style={{ position: "absolute", width: b.s, height: b.s, borderRadius: 99, top: b.t, left: (b as any).l, right: (b as any).r, background: `radial-gradient(circle, rgba(240,120,80,${b.o}) 0%, transparent 70%)`, animationDelay: b.d, pointerEvents: "none" }} />
      ))}

      {/* ── top brand area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 28px 8px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <img className="animate-fadeup" src="/icon-192.png?v=19" alt="Cream" style={{ width: 78, height: 78, borderRadius: 22, objectFit: "cover", boxShadow: "0 14px 36px rgba(196,78,40,0.4)", marginBottom: 18 }} />
        <div className="animate-fadeup" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: "#C44E28", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Creame · AI Skin Care &amp; Scanner</div>
        <h1 className="animate-fadeup" style={{ fontFamily: SERIF, fontSize: 42, lineHeight: 1.02, color: "#2C1F1A", margin: "0 0 12px", fontWeight: 400, letterSpacing: -1 }}>
          Skin that <em>actually</em> improves.
        </h1>
        <p className="animate-fadeup" style={{ fontFamily: SANS, fontSize: 15, color: "rgba(44,31,26,0.58)", lineHeight: 1.5, margin: "0 auto", maxWidth: 300 }}>
          Scan your skin, get a routine built for you, and track real progress.
        </p>
        <div className="animate-fadeup" style={{ marginTop: 18, padding: "7px 16px", borderRadius: 99, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 20px rgba(200,90,50,0.12)" }}>
          <span className="animate-blink" style={{ width: 7, height: 7, borderRadius: 99, background: "#7FB389" }} />
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#2C1F1A" }}>AI skin analysis · live</span>
        </div>
      </div>

      {/* ── buttons ── */}
      <div style={{ padding: "0 28px 36px", position: "relative", zIndex: 1 }}>

        {/* Google — only sign-in method */}
        <button className="animate-fadeup" onClick={() => go("google")} disabled={!!loading} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 54, borderRadius: 16, cursor: "pointer", border: "none", background: "#fff", fontFamily: SANS, fontSize: 16, fontWeight: 700, color: "#2C1F1A", boxShadow: "0 6px 20px rgba(180,80,40,0.14)", opacity: loading && loading !== "google" ? 0.6 : 1 }}>
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.61 4.61 0 01-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.31z" fill="#4285F4"/><path d="M10 20c2.7 0 4.97-.9 6.63-2.43l-3.24-2.5c-.9.6-2.06.96-3.39.96-2.6 0-4.8-1.76-5.6-4.12H1.06v2.58A9.99 9.99 0 0010 20z" fill="#34A853"/><path d="M4.4 11.91A6 6 0 014.1 10c0-.66.11-1.3.3-1.91V5.51H1.06A9.99 9.99 0 000 10c0 1.61.38 3.14 1.06 4.49l3.34-2.58z" fill="#FBBC05"/><path d="M10 3.97c1.47 0 2.79.51 3.82 1.5L16.7 2.6C14.97.99 12.7 0 10 0A9.99 9.99 0 001.06 5.51l3.34 2.58C5.2 5.73 7.4 3.97 10 3.97z" fill="#EA4335"/></svg>
          {loading === "google" ? "Opening Google…" : "Continue with Google"}
        </button>

        <p className="animate-fadeup" style={{ textAlign: "center", marginTop: 16, fontFamily: SANS, fontSize: 12, color: "rgba(44,31,26,0.42)" }}>
          By continuing you agree to our Terms &amp; Privacy.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════ ONBOARDING ════════════════════════
const OB_SLIDES = [
  { icon: "scan" as const, emoji: "🤳", chips: ["✨", "🔬", "💯"], color: "#FEF0EB", accent: "#F0886A", title: "Know your skin", sub: "Just one selfie. Cream's AI reads your acne, oil, pigmentation, hydration and more — then scores your skin in seconds.", label: "AI Skin Analysis" },
  { icon: "routine" as const, emoji: "🧴", chips: ["🌅", "🌙", "✅"], color: "#EFF0FD", accent: "#8B85E0", title: "A routine made for you", sub: "The right products, in the right order, at the right time — built around your scan, not guesswork.", label: "Daily Routine" },
  { icon: "arrowUp" as const, emoji: "📈", chips: ["⭐", "🏆", "🔥"], color: "#EDF7EE", accent: "#5FAD72", title: "Watch your glow grow", sub: "Track your skin week by week. Compare scans, see real trends, and hit your glow-up milestones.", label: "Progress Tracking" },
  { icon: "products" as const, emoji: "🔍", chips: ["🧪", "🧴", "✅"], color: "#FEF7EB", accent: "#D9A040", title: "Scan before you buy", sub: "Point at any product and instantly know if it suits your skin — ingredients decoded, zero guesswork.", label: "Ingredient Checker" },
  { icon: "drop" as const, emoji: "💧", chips: ["🔔", "🌙", "🥤"], color: "#EAF6FB", accent: "#3FA9D6", title: "Stay hydrated, glow more", sub: "Gentle water reminders with your own ringtone and timing. Sleep Mode keeps your nights quiet.", label: "Water Reminders" },
  { icon: "camera" as const, emoji: "📸", chips: ["✨", "🔒", "⚡"], color: "#FDEDF0", accent: "#E06B8B", title: "Ready for your first scan?", sub: "It takes just 3 seconds. Find good light, look straight at the camera, and let Cream do the rest.", label: "Let's Begin", cta: "Scan My Skin →" },
];
function OnboardingScreen({ slide, setSlide, onScan, onDone }: { slide: number; setSlide: (n: number) => void; onScan: () => void; onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const s = OB_SLIDES[slide];
  const isLast = slide === OB_SLIDES.length - 1;
  const go = (n: number) => { setVisible(false); setTimeout(() => { setSlide(n); setVisible(true); }, 200); };
  const cta = () => { if (s.cta) onScan(); else if (isLast) onDone(); else go(slide + 1); };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: `radial-gradient(140% 80% at 50% -10%, ${rgba(s.accent, 0.18)} 0%, ${rgba(s.accent, 0.05)} 40%, ${T.bg} 72%)`, overflow: "hidden", transition: "background .5s ease" }}>
      {/* top: segmented progress + page count + skip */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "60px 24px 0" }}>
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          {OB_SLIDES.map((_, i) => (
            <div key={i} onClick={() => go(i)} style={{ flex: 1, height: 4, borderRadius: 99, cursor: "pointer", background: i <= slide ? s.accent : rgba(s.accent, 0.18), transition: "background .4s ease" }} />
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: s.accent, letterSpacing: 0.5 }}>{slide + 1}<span style={{ color: T.textFaint, fontWeight: 600 }}>/{OB_SLIDES.length}</span></span>
        <button onClick={onDone} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 600, color: T.textMute }}>Skip</button>
      </div>

      {/* hero — open, cardless, glowing icon */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 28px", opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.9)", transition: "opacity .3s ease, transform .3s ease" }}>
        <div style={{ position: "relative" }}>
          {/* soft brand glow */}
          <div style={{ position: "absolute", inset: -40, borderRadius: 44, background: rgba(s.accent, 0.26), filter: "blur(38px)" }} />
          {/* iOS-style app icon: squircle, vertical gloss gradient, hairline border */}
          <div className={isLast ? "animate-spinpulse" : ""} style={{ position: "relative", width: 130, height: 130, borderRadius: 30, overflow: "hidden", background: `linear-gradient(180deg, ${s.accent} 0%, ${rgba(s.accent, 0.72)} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 18px 40px ${rgba(s.accent, 0.42)}`, border: "1px solid rgba(255,255,255,0.18)" }}>
            {/* top sheen (iOS gloss) */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "52%", background: "linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.04))" }} />
            {/* inner top highlight line */}
            <div style={{ position: "absolute", top: 1, left: 10, right: 10, height: 1, background: "rgba(255,255,255,0.45)", borderRadius: 99 }} />
            <Icon name={s.icon} size={60} color="#fff" sw={1.9} />
          </div>
        </div>
      </div>

      {/* copy */}
      <div style={{ padding: "0 30px", textAlign: "center", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity .34s ease, transform .34s ease" }}>
        <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 800, color: s.accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 12 }}>{s.label}</div>
        <h2 style={{ fontFamily: SERIF, fontSize: 38, lineHeight: 1.05, color: T.text, margin: "0 0 12px", fontWeight: 400, letterSpacing: -0.5 }}>{s.title}</h2>
        <p style={{ fontFamily: SANS, fontSize: 15.5, color: T.textMute, lineHeight: 1.65, margin: "0 auto", maxWidth: 340 }}>{s.sub}</p>
      </div>

      {/* controls */}
      <div style={{ padding: "30px 28px 40px", display: "flex", alignItems: "center", gap: 12 }}>
        {slide > 0 && (
          <button onClick={() => go(slide - 1)} style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 18, cursor: "pointer", background: T.surface, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Back">
            <Icon name="chevL" size={20} color={T.text} sw={2.2} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <PrimaryBtn style={{ background: s.accent, boxShadow: `0 10px 28px ${rgba(s.accent, 0.40)}` }} onClick={cta}>{s.cta || (isLast ? "Get Started" : "Next")}</PrimaryBtn>
        </div>
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

// Staged loader for the product scan — cycles friendly steps so the wait feels
// fast and intentional instead of a bare spinner.
function ProductLoader() {
  const stages = ["Reading the label…", "Identifying the product…", "Checking ingredients…", "Preparing your verdict…"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => Math.min(x + 1, stages.length - 1)), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ padding: "70px 0", textAlign: "center" }}>
      <div className="animate-spinpulse" style={{ width: 64, height: 64, borderRadius: 99, background: T.accentSoft, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="spark" size={28} color={T.accent} fill /></div>
      <div style={{ fontFamily: SANS, fontSize: 15, color: T.textMute, height: 22, transition: "all .3s" }}>{stages[i]}</div>
      <div style={{ display: "flex", gap: 7, marginTop: 16, justifyContent: "center" }}>
        {stages.map((_, x) => <span key={x} style={{ width: x === i ? 22 : 7, height: 7, borderRadius: 99, background: x <= i ? T.accent : T.surface2, transition: "all .3s" }} />)}
      </div>
    </div>
  );
}

// Pick up to 3 products from OUR store that match the scan's concerns. Soft,
// helpful suggestions — never forced. Returns [] when nothing clearly matches.
function recommendForScan(data: any): any[] {
  const wants: string[] = [];
  if ((data.acne || 0) >= 35) wants.push("acne", "pimple", "oil control");
  if ((data.oil || 0) >= 55) wants.push("oil control", "pore", "blackhead");
  if ((data.pigmentation || 0) >= 35) wants.push("dark spot", "brightening", "vitamin c", "pigment");
  if ((data.redness || 0) >= 30 || data.skinType === "Sensitive") wants.push("sensitive", "gentle", "soothing", "aloe", "barrier");
  if ((typeof data.hydration === "number" && data.hydration < 45) || data.skinType === "Dry") wants.push("hydrating", "dry skin", "hyaluronic", "ceramide", "barrier");
  if (!wants.length) wants.push("daily", "gentle", "barrier", "all skin"); // healthy → maintenance
  const scored = ALL_PRODUCTS.map((p: any) => {
    let s = 0;
    for (const t of p.tags) for (const w of wants) { if (t.includes(w) || w.includes(t)) { s++; break; } }
    return { p, s: s + (p.bestseller ? 0.4 : 0) + (p.rating || 0) / 25 };
  }).filter((x: any) => x.s >= 1).sort((a: any, b: any) => b.s - a.s);
  const out: any[] = []; const cats = new Set<string>();
  for (const { p } of scored) { if (out.length >= 3) break; if (cats.has(p.cat)) continue; cats.add(p.cat); out.push(p); }
  for (const { p } of scored) { if (out.length >= 3) break; if (!out.includes(p)) out.push(p); }
  return out.slice(0, 3);
}

// ════════════════════════ RESULTS ════════════════════════
function ResultsView({ data, ai, summary, history, formatMarkdown, openReport, setOpenReport, openPlan, setOpenPlan, activeDot, setActiveDot, onRoutine, onProducts, onBack }: any) {
  const score = data.score || 0;
  const prev = history[1];
  const delta = prev ? score - prev.score : 0;
  // severity from REAL value
  const sevTone = (v: number) => v >= 60 ? "bad" : v >= 35 ? "warn" : "good";
  const sev = (v: number) => v >= 60 ? "Severe" : v >= 35 ? "Moderate" : "Mild";
  // trend from REAL previous scan (no fabrication)
  const trend = (cur: number, key: string): "up" | "down" | "none" => {
    if (!prev || typeof prev[key] !== "number") return "none";
    if (cur < prev[key] - 2) return "down"; // less concern = good
    if (cur > prev[key] + 2) return "up";
    return "none";
  };
  const concerns = [
    { name: "Acne & Breakouts", val: data.acne || 0, key: "acne", icon: "warn" as const },
    { name: "Oiliness", val: data.oil || 0, key: "oil", icon: "sun" as const },
    { name: "Pigmentation", val: data.pigmentation || 0, key: "pigmentation", icon: "drop" as const },
    { name: "Redness", val: data.redness ?? data.acne ?? 0, key: "redness", icon: "warn" as const },
  ];
  const metrics: [string, number, any, string][] = [
    ["Hydration", data.hydration ?? Math.max(0, 100 - (data.oil || 50)), "drop", "#5AA9D6"],
    ["Oiliness", data.oil || 0, "sun", "#E8A24C"],
    ["Texture", data.texture ?? Math.min(100, score + 4), "grid", "#7FB389"],
    ["Redness", data.redness ?? data.acne ?? 0, "warn", "#E0685C"],
    ["Pore Size", data.poreSize ?? Math.round((data.oil || 0) * 0.9), "scan", "#B58BD6"],
    ["Radiance", data.radiance ?? score, "spark", "#D9B86A"],
  ];
  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "56px 20px 130px" }}>
      <button onClick={onBack} style={{ position: "fixed", top: 56, left: 14, zIndex: 70, width: 36, height: 36, borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(10px)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
      {/* clean scanned photo (no dots) */}
      <div style={{ position: "relative", marginBottom: 18, marginTop: 8 }}>
        {data.image ? <div style={{ height: 240, borderRadius: 24, backgroundImage: `url(${data.image})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 10px 30px rgba(60,30,20,0.12)" }} /> : <Placeholder label="scanned selfie" h={240} r={24} />}
        <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "linear-gradient(to top, rgba(0,0,0,0.28), transparent 45%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "#8FC299", boxShadow: "0 0 8px #8FC299" }} />
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#fff" }}>AI analysis complete</span>
        </div>
      </div>
      {/* score */}
      <Card glow style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <ScoreDial score={score} size={120} delta={delta} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SERIF, fontSize: 28, color: T.text, lineHeight: 1.05 }}>Overall<br />Skin Score</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "5px 10px", borderRadius: 8, background: delta >= 0 ? "rgba(127,179,137,0.16)" : "rgba(224,104,92,0.16)" }}>
            <Icon name={delta >= 0 ? "arrowUp" : "arrowDown"} size={14} color={delta >= 0 ? "#8FC299" : "#E0685C"} sw={2.4} />
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: delta >= 0 ? "#8FC299" : "#E0685C" }}>{delta >= 0 ? "+" : ""}{delta} {prev ? "since last scan" : "first scan"}</span>
          </div>
        </div>
      </Card>

      {/* AI one-line summary — friendly + wow */}
      <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 18, marginBottom: 20, background: "linear-gradient(120deg, rgba(240,136,106,0.14), rgba(240,136,106,0.06))", border: `1px solid ${T.accentDim}` }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px ${rgba(T.accent, 0.4)}` }}>
          <Icon name="spark" size={20} color="#fff" fill />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 800, color: T.accentText, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>In short</div>
          <div style={{ fontFamily: SANS, fontSize: 15, color: T.text, lineHeight: 1.5, fontWeight: 500 }}>{summary || `Your skin scored ${score}/100 — ${scoreLabel(score).toLowerCase()}. Keep your routine consistent and you'll see steady improvement.`}</div>
        </div>
      </div>

      {/* concerns — from real values + real trend vs last scan */}
      <SectionTitle>Concern Breakdown</SectionTitle>
      <Card pad={6} style={{ marginBottom: 20 }}>
        {concerns.map((c, i) => {
          const tr = trend(c.val, c.key);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 12px", borderTop: i ? `1px solid ${T.border}` : "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={c.icon} size={19} color={T.textMute} /></div>
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: T.text }}>{c.name}</span>
              <Badge tone={sevTone(c.val) as any}>{sev(c.val)}</Badge>
              {tr === "down" && <Icon name="arrowDown" size={18} color="#8FC299" sw={2.2} />}
              {tr === "up" && <Icon name="arrowUp" size={18} color="#E0685C" sw={2.2} />}
              {tr === "none" && <span style={{ width: 18, textAlign: "center", fontFamily: SANS, fontSize: 11, fontWeight: 700, color: T.textFaint }}>{prev ? "–" : "new"}</span>}
            </div>
          );
        })}
      </Card>

      {/* metrics */}
      <SectionTitle>Skin Metrics</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 22px" }}>
          {metrics.map(([l, v, ic, col]) => <MetricBar key={l} label={l} value={v} icon={ic} color={col} />)}
        </div>
      </Card>

      {/* AI report — moved up, open by default */}
      {ai && (
        <div style={{ borderRadius: 18, background: T.surface, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 20, boxShadow: T.shadow }}>
          <button onClick={() => setOpenReport((o: boolean) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="spark" size={16} color={T.accentText} fill />
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.accentText, textTransform: "uppercase", letterSpacing: 1, textAlign: "left" }}>Complete AI Skin Report</span>
            <div style={{ transform: openReport ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }}><Icon name="chevDown" size={18} color={T.textFaint} /></div>
          </button>
          {openReport && <div style={{ padding: "4px 16px 16px" }}>{formatMarkdown(ai)}</div>}
        </div>
      )}

      {/* Soft, scan-based suggestions from our store — optional, not pushy */}
      {(() => {
        const recs = recommendForScan(data);
        if (!recs.length) return null;
        return (
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: 0.8 }}>Suggested for your skin</span>
            <div style={{ fontFamily: SANS, fontSize: 12, color: T.textMute, margin: "3px 0 12px" }}>Optional picks based on your scan — no pressure 🙂</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {recs.map((p: any) => {
                const img = productImg(p.name);
                return (
                  <a key={p.asin} href={p.link} target="_blank" rel="sponsored noopener noreferrer" style={{ textDecoration: "none", borderRadius: 16, overflow: "hidden", background: T.surface, boxShadow: T.shadow, display: "flex", flexDirection: "column" }}>
                    <div style={{ height: 86, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 7 }}>
                      {img && <img src={img} alt={p.name} loading="lazy" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
                    </div>
                    <div style={{ padding: "7px 8px 9px" }}>
                      <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: T.text, lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                        <Icon name="star" size={10} color="#F0A52C" fill /><span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: T.textMute }}>{p.rating}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* product recs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <GhostBtn onClick={onProducts}>Browse Store</GhostBtn>
        <GhostBtn onClick={onBack}>Done</GhostBtn>
      </div>

      {/* Update My Routine — final CTA at the very bottom */}
      <PrimaryBtn icon="routine" onClick={onRoutine}>Update My Routine</PrimaryBtn>
    </div>
  );
}
