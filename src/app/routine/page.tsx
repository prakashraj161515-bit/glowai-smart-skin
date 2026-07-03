"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, MiniRing, PrimaryBtn, WaterTracker, ProductThumb, BuyBtn } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";
import { getWeekPlan, buildWeekFromBank, detectCountry, planAgeDays, foodImg, Meal } from "@/glow/diet";
import { productImg } from "@/glow/affiliate";

const DAY_LETTERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Default routine from real products (image + buy auto from affiliate.ts)
const ITEMS = [
  { time: "8:00", period: "AM", section: "Morning", name: "Garnier Bright Complete Vitamin C Face Wash", brand: "Garnier" },
  { time: "8:10", period: "AM", section: "Morning", name: "Garnier Vitamin C+ Face Serum for Skin Brightening", brand: "Garnier" },
  { time: "8:20", period: "AM", section: "Morning", name: "Minimalist Vitamin B5 10% Oil-Free Moisturizer", brand: "Minimalist" },
  { time: "12:00", period: "PM", section: "Afternoon", name: "Minimalist Sunscreen SPF 50 PA+++ with Niacinamide", brand: "Minimalist" },
  { time: "9:00", period: "PM", section: "Evening", name: "Cetaphil Gentle Skin Hydrating Face Wash", brand: "Cetaphil" },
  { time: "9:10", period: "PM", section: "Evening", name: "The Derma Co 2% Salicylic Acid Face Serum", brand: "The Derma Co" },
  { time: "9:30", period: "PM", section: "Evening", name: "Dot & Key Night Reset Retinol + Ceramide Night Cream", brand: "Dot & Key" },
];
// Indian state codes (ISO 3166-2:IN) → name, so the diet can localise dishes
const STATE_NAMES: Record<string, string> = {
  "IN-MH": "Maharashtra", "IN-GJ": "Gujarat", "IN-PB": "Punjab", "IN-DL": "Delhi",
  "IN-UP": "Uttar Pradesh", "IN-TN": "Tamil Nadu", "IN-KA": "Karnataka",
  "IN-WB": "West Bengal", "IN-KL": "Kerala", "IN-RJ": "Rajasthan", "IN-HR": "Haryana",
  "IN-MP": "Madhya Pradesh", "IN-BR": "Bihar", "IN-TG": "Telangana", "IN-AP": "Andhra Pradesh",
};
const SEC_COL: any = { Morning: "#E8A24C", Afternoon: "#5FAD72", Evening: "#8B85E0" };
const SEC_ICON: any = { Morning: "sun", Afternoon: "bolt", Evening: "moon" };
const MEAL_BG: any = { Breakfast: "#FEF7EB", Lunch: "#EDF7EE", Dinner: "#EFF0FD", Snacks: "#FEF0EB" };

export default function RoutinePage() {
  const router = useRouter();
  const today = new Date();
  // rolling range: 10 days before → 17 days after today (crosses months), today centred
  const TODAY_OFFSET = 10;
  const week = useMemo(() => {
    const start = new Date(today); start.setDate(today.getDate() - TODAY_OFFSET);
    return Array.from({ length: 28 }).map((_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, []);
  const [selIdx, setSelIdx] = useState(TODAY_OFFSET);
  const selDate = week[selIdx];

  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false));
  const [tab, setTab] = useState<"Skincare" | "Diet Plan">("Skincare");
  const [water, setWater] = useState(0);
  const [country, setCountry] = useState("India");
  const [area, setArea] = useState("");
  const [scan, setScan] = useState<any>({ acne: 30, oil: 45, pigmentation: 25, hydration: 55, score: 74 });
  const [aiBank, setAiBank] = useState<any>(null); // city-specific food from AI
  const stripRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ── daily refresh: water + checks reset every new day ──
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDay = localStorage.getItem("velmora_routine_day");
    const c = localStorage.getItem("velmora_country") || detectCountry(); setCountry(c);
    // ?area=City,Country overrides the detected location (handy for testing/demo).
    const override = new URLSearchParams(window.location.search).get("area");
    if (override) {
      setArea(override); // temporary (not saved) — normal location returns next open
      setTab("Diet Plan"); // land directly on the diet for the demo
    } else {
      setArea(localStorage.getItem("velmora_area") || "");
      // detect real area (city, country) from IP via our edge geo endpoint
      fetch("/api/geo").then(r => r.json()).then((g) => {
        // build a rich area string incl. state so the diet can localise dishes
        const full = [g.city, STATE_NAMES[`${g.countryCode}-${g.region}`] || "", g.country].filter(Boolean).join(", ");
        const areaStr = full || g.area || "";
        if (areaStr) { setArea(areaStr); localStorage.setItem("velmora_area", areaStr); }
        if (g.country) { setCountry(g.country); localStorage.setItem("velmora_country", g.country); }
      }).catch(() => {});
    }
    const a = localStorage.getItem("velmora_analysis"); if (a) { try { setScan(JSON.parse(a)); } catch {} }

    if (lastDay !== today) {
      // new day → reset water + all checks
      setWater(0); localStorage.setItem("velmora_water_intake", "0");
      setChecked(ITEMS.map(() => false));
      localStorage.setItem("velmora_routine_checks", JSON.stringify(ITEMS.map(() => false)));
      localStorage.setItem("velmora_routine_day", today);
    } else {
      const w = localStorage.getItem("velmora_water_intake"); if (w) setWater(parseInt(w));
      try { const ch = JSON.parse(localStorage.getItem("velmora_routine_checks") || "null"); if (ch) setChecked(ch); } catch {}
    }
  }, []);

  // auto-center selected day
  useEffect(() => {
    const el = dayRefs.current[selIdx];
    if (el) el.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selIdx]);

  // Fetch CITY/DISTRICT-specific simple healthy food from AI (cached per area
  // for a week). Falls back to the built-in region plan if it fails.
  useEffect(() => {
    if (!area) return;
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    try {
      const raw = localStorage.getItem("velmora_localfoods_v2_veg");
      if (raw) {
        const c = JSON.parse(raw);
        if (c.area === area && Date.now() - (c.at || 0) < WEEK && c.bank) { setAiBank(c.bank); return; }
      }
    } catch {}
    let cancelled = false;
    fetch("/api/ai/localfoods", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area, focus: scan ? "" : "" }),
    }).then(r => r.json()).then(({ bank }) => {
      if (cancelled || !bank) return;
      setAiBank(bank);
      try { localStorage.setItem("velmora_localfoods_v2_veg", JSON.stringify({ area, bank, at: Date.now() })); } catch {}
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [area]);

  const setW = (v: number) => { setWater(v); localStorage.setItem("velmora_water_intake", String(v)); };
  const setCheckedSaved = (fn: (c: boolean[]) => boolean[]) => setChecked(c => { const n = fn(c); localStorage.setItem("velmora_routine_checks", JSON.stringify(n)); return n; });

  const doneCount = checked.filter(Boolean).length;
  const pct = Math.round((doneCount / ITEMS.length) * 100);
  const sections = [...new Set(ITEMS.map(i => i.section))];
  const weekPlan = useMemo(
    () => (aiBank ? buildWeekFromBank(aiBank, scan, area || country, aiBank.avoid) : getWeekPlan(country, scan, area)),
    [aiBank, country, scan, area]
  );
  const dayPlan = weekPlan.days[selIdx % 7];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* hero header */}
      <div style={{ background: "linear-gradient(160deg, #F9DDD0 0%, #F5C9B5 55%, #FAF8F6 100%)", padding: "56px 20px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 800, color: "#2C1F1A", lineHeight: 1 }}>Daily Ritual</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
              <Icon name="flame" size={15} color="#E8A24C" fill />
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#E8A24C" }}>12-day streak</span>
              <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(44,31,26,0.45)" }}>· keep it up!</span>
            </div>
          </div>
          <MiniRing pct={pct} size={56} sw={5} color="#C44E28"><span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: "#2C1F1A" }}>{pct}%</span></MiniRing>
        </div>
        {/* live calendar strip — selected auto-centers */}
        <div ref={stripRef} className="glow-hscroll" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {week.map((d, i) => {
            const active = i === selIdx;
            const isToday = d.toDateString() === today.toDateString();
            return (
              <button key={i} ref={el => { dayRefs.current[i] = el; }} onClick={() => setSelIdx(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 10px", borderRadius: 16, flexShrink: 0, border: "none", cursor: "pointer", minWidth: 46, position: "relative", background: active ? "#C44E28" : "rgba(255,255,255,0.6)", boxShadow: active ? "0 6px 18px rgba(196,78,40,0.38)" : "0 2px 8px rgba(60,30,20,0.08)" }}>
                <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: active ? "rgba(255,255,255,0.75)" : "rgba(44,31,26,0.45)" }}>{d.getDate() === 1 ? MONTHS[d.getMonth()].toUpperCase() : DAY_LETTERS[d.getDay()]}</span>
                <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: active ? "#fff" : "#2C1F1A" }}>{d.getDate()}</span>
                {isToday && !active && <div style={{ width: 4, height: 4, borderRadius: 99, background: "#C44E28", position: "absolute", bottom: 4 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* live date label */}
      <div style={{ padding: "12px 20px 0", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: T.text }}>
          {DAY_NAMES[selDate.getDay()]}, {selDate.getDate()} {MONTHS[selDate.getMonth()]} {selDate.getFullYear()}
        </span>
        {selDate.toDateString() === today.toDateString() && <span style={{ fontSize: 11, fontWeight: 700, color: T.accentText, background: T.accentSoft, padding: "2px 8px", borderRadius: 99 }}>TODAY</span>}
      </div>

      {/* WATER INTAKE — above the tabs (shared by both) */}
      <div style={{ padding: "10px 20px 0", flexShrink: 0 }}>
        <WaterTracker ml={water} setMl={setW} />
      </div>

      {/* tabs */}
      <div style={{ display: "flex", padding: "0 20px", flexShrink: 0 }}>
        {(["Skincare", "Diet Plan"] as const).map(x => (
          <button key={x} onClick={() => setTab(x)} style={{ flex: 1, padding: "10px 0", border: "none", cursor: "pointer", background: "transparent", fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: tab === x ? T.accentText : T.textFaint, borderBottom: "2.5px solid " + (tab === x ? T.accent : T.border) }}>{x}</button>
        ))}
      </div>

      {/* content */}
      <div className="glow-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 20px 130px" }}>
        {tab === "Skincare" ? (
          <>
            {sections.map(section => {
              const items = ITEMS.map((item, idx) => ({ ...item, idx })).filter(i => i.section === section);
              return (
                <div key={section} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: rgba(SEC_COL[section], 0.15) }}><Icon name={SEC_ICON[section]} size={15} color={SEC_COL[section]} sw={2} /></div>
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: SEC_COL[section], textTransform: "uppercase", letterSpacing: 1 }}>{section}</span>
                    <div style={{ flex: 1, height: 1, background: rgba(SEC_COL[section], 0.20) }} />
                  </div>
                  {items.map(({ idx, time, period, name, brand }: any) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 44, flexShrink: 0, textAlign: "right" }}>
                        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: checked[idx] ? T.textFaint : T.accentText, lineHeight: 1 }}>{time}</div>
                        <div style={{ fontFamily: SANS, fontSize: 9, color: T.textFaint, letterSpacing: 0.3 }}>{period}</div>
                      </div>
                      <div style={{ width: 8, height: 8, borderRadius: 99, flexShrink: 0, transition: "all .25s", background: checked[idx] ? T.accent : rgba(SEC_COL[section], 0.4), boxShadow: checked[idx] ? "0 0 0 3px " + rgba(T.accent, 0.2) : "none" }} />
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 7, padding: "10px 9px", borderRadius: 18, cursor: "pointer", background: checked[idx] ? T.surface2 : T.surface, border: "1px solid " + (checked[idx] ? T.border : rgba(SEC_COL[section], 0.18)), boxShadow: checked[idx] ? "none" : "0 3px 14px rgba(60,30,20,0.07)", opacity: checked[idx] ? 0.6 : 1, transition: "all .25s" }}>
                        <ProductThumb name={name} size={42} img={productImg(name)} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: T.text, textDecoration: checked[idx] ? "line-through" : "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", overflowWrap: "anywhere", lineHeight: 1.2 }}>{name}</div>
                          <div style={{ fontFamily: SANS, fontSize: 11, color: T.textMute, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brand}</div>
                        </div>
                        <BuyBtn name={name} variant="icon" style={{ width: 28, height: 28, borderRadius: 9 }} />
                        <button onClick={e => { e.stopPropagation(); setCheckedSaved(c => c.map((v, x) => x === idx ? !v : v)); }} style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, cursor: "pointer", border: "1.5px solid " + (checked[idx] ? T.accent : T.borderHi), background: checked[idx] ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                          {checked[idx] && <Icon name="check" size={14} color="#fff" sw={2.8} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            <PrimaryBtn icon="spark" onClick={() => router.push("/coach")}>Regenerate with AI</PrimaryBtn>
          </>
        ) : (
          <DietPlan day={dayPlan} avoid={weekPlan.avoid} region={weekPlan.region} focus={weekPlan.focus} area={area || country} dayName={DAY_NAMES[selDate.getDay()]} onAsk={() => router.push("/coach?q=" + encodeURIComponent("What should I eat for my skin?"))} />
        )}
      </div>


      <AppTabBar active="routine" />
    </div>
  );
}

function DietPlan({ day, avoid, region, focus, area, dayName, onAsk }: { day: any; avoid: string[]; region: string; focus: string; area: string; dayName: string; onAsk: () => void }) {
  return (
    <div>
      {day?.meals.map((meal: Meal) => (
        <div key={meal.meal} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: MEAL_BG[meal.meal], fontSize: 15 }}>{meal.icon}</div>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: 1 }}>{meal.meal}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.textFaint }}>{meal.time}</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {meal.items.map((f, k) => (
              <div key={f.name + k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 3px 12px rgba(60,30,20,0.06)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0, background: MEAL_BG[meal.meal], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, overflow: "hidden", position: "relative" }}>
                  <span style={{ position: "absolute" }}>{f.emoji}</span>
                  <img src={foodImg(f.name)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: T.text }}>{f.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute, marginTop: 2 }}>{f.why}</div>
                </div>
                <Icon name="check" size={16} color="#7FB389" sw={2.4} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Fruits — skin-friendly fruits to add daily */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(240,136,106,0.16)", fontSize: 15 }}>🍓</div>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: 1 }}>Fruits</span>
          <span style={{ fontFamily: SANS, fontSize: 11, color: T.textFaint }}>add 1–2 daily</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { name: "Papaya", emoji: "🥭", why: "Vitamin A — brightens & clears skin" },
            { name: "Orange", emoji: "🍊", why: "Vitamin C for collagen & glow" },
            { name: "Pomegranate", emoji: "🍎", why: "Antioxidants, even skin tone" },
            { name: "Banana", emoji: "🍌", why: "Potassium, keeps skin soft" },
            { name: "Watermelon", emoji: "🍉", why: "Hydrating, light & cooling" },
          ].map((f, k) => (
            <div key={f.name + k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 3px 12px rgba(60,30,20,0.06)" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0, background: "rgba(240,136,106,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{f.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: T.text }}>{f.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute, marginTop: 2 }}>{f.why}</div>
              </div>
              <Icon name="check" size={16} color="#7FB389" sw={2.4} />
            </div>
          ))}
        </div>
      </div>

      {/* Dry fruits & nuts — great for skin */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(180,130,80,0.18)", fontSize: 15 }}>🌰</div>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.text, textTransform: "uppercase", letterSpacing: 1 }}>Dry Fruits &amp; Nuts</span>
          <span style={{ fontFamily: SANS, fontSize: 11, color: T.textFaint }}>a small handful daily</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { name: "Almonds", emoji: "🌰", why: "Vitamin E — repairs & softens skin" },
            { name: "Walnuts", emoji: "🌰", why: "Omega-3 — natural glow" },
            { name: "Cashews", emoji: "🥜", why: "Zinc & copper — clearer skin" },
            { name: "Pistachios", emoji: "🥜", why: "Antioxidants — fights dullness" },
            { name: "Dates", emoji: "🌴", why: "Iron — bright, healthy skin" },
          ].map((f, k) => (
            <div key={f.name + k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 3px 12px rgba(60,30,20,0.06)" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0, background: "rgba(180,130,80,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{f.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: T.text }}>{f.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute, marginTop: 2 }}>{f.why}</div>
              </div>
              <Icon name="check" size={16} color="#7FB389" sw={2.4} />
            </div>
          ))}
        </div>
      </div>

      {/* Eat more — healthy skin-friendly staples */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(127,179,137,0.18)", fontSize: 15 }}>✅</div>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: "#5FA572", textTransform: "uppercase", letterSpacing: 1 }}>Eat more of these</span>
          <div style={{ flex: 1, height: 1, background: "rgba(127,179,137,0.25)" }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { l: "Leafy greens", e: "🥬" }, { l: "Fresh fruit", e: "🍓" }, { l: "Nuts & seeds", e: "🌰" },
            { l: "Dal & beans", e: "🫘" }, { l: "8+ glasses water", e: "💧" }, { l: "Curd / yogurt", e: "🥛" },
            { l: "Green tea", e: "🍵" }, { l: "Flax & walnuts", e: "🌰" },
          ].map((h) => (
            <span key={h.l} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#3F7A52", background: "rgba(127,179,137,0.12)", padding: "7px 12px", borderRadius: 99, border: "1px solid rgba(127,179,137,0.28)" }}>{h.e} {h.l}</span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(224,104,92,0.14)", fontSize: 15 }}>🚫</div>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: "#E0685C", textTransform: "uppercase", letterSpacing: 1 }}>Foods to limit</span>
          <div style={{ flex: 1, height: 1, background: "rgba(224,104,92,0.2)" }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {avoid.map((a) => (
            <span key={a} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: "#C0524A", background: "rgba(224,104,92,0.10)", padding: "7px 12px", borderRadius: 99, border: "1px solid rgba(224,104,92,0.2)" }}>{a}</span>
          ))}
        </div>
      </div>

      <div style={{ fontFamily: SANS, fontSize: 12, color: T.textFaint, textAlign: "center", marginBottom: 14 }}>
        🔒 This plan stays for the week · re-scan your face to refresh it
      </div>
      <PrimaryBtn icon="chat" onClick={onAsk}>Ask Aura about my diet</PrimaryBtn>
    </div>
  );
}
