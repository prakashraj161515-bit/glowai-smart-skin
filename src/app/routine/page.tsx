"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, MiniRing, PrimaryBtn, WaterTracker, ProductThumb } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";
import { getWeekPlan, detectCountry, planAgeDays, foodImg, skinImg, Meal } from "@/glow/diet";

const DAY_LETTERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ITEMS = [
  { time: "8:00", period: "AM", section: "Morning", name: "Gentle Gel Cleanser", brand: "Beam Labs" },
  { time: "8:15", period: "AM", section: "Morning", name: "Vitamin C Serum", brand: "Beam Labs" },
  { time: "9:00", period: "AM", section: "Morning", name: "Niacinamide 10%", brand: "Lumen" },
  { time: "9:30", period: "AM", section: "Morning", name: "Cloud Cream Moisturizer", brand: "Lumen" },
  { time: "12:00", period: "PM", section: "Afternoon", name: "Daily Shield SPF 50", brand: "Solé" },
  { time: "3:00", period: "PM", section: "Afternoon", name: "SPF Reapplication", brand: "Solé" },
  { time: "9:00", period: "PM", section: "Evening", name: "Gentle Cleanser (PM)", brand: "Beam Labs" },
  { time: "9:30", period: "PM", section: "Evening", name: "Barrier Repair Night Cream", brand: "Lumen" },
];
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

  const [checked, setChecked] = useState<boolean[]>([true, true, false, false, false, false, false, false]);
  const [tab, setTab] = useState<"Skincare" | "Diet Plan">("Skincare");
  const [water, setWater] = useState(500);
  const [country, setCountry] = useState("India");
  const [scan, setScan] = useState<any>({ acne: 30, oil: 45, pigmentation: 25, hydration: 55, score: 74 });
  const stripRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const w = localStorage.getItem("velmora_water_intake"); if (w) setWater(parseInt(w));
    const c = localStorage.getItem("velmora_country") || detectCountry(); setCountry(c);
    const a = localStorage.getItem("velmora_analysis"); if (a) { try { setScan(JSON.parse(a)); } catch {} }
  }, []);
  // auto-center selected day in the strip
  useEffect(() => {
    const el = dayRefs.current[selIdx];
    if (el) el.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selIdx]);

  const setW = (v: number) => { setWater(v); localStorage.setItem("velmora_water_intake", String(v)); };

  const doneCount = checked.filter(Boolean).length;
  const pct = Math.round((doneCount / ITEMS.length) * 100);
  const sections = [...new Set(ITEMS.map(i => i.section))];
  const weekPlan = useMemo(() => getWeekPlan(country, scan), [country, scan]);
  const dayPlan = weekPlan.days[selIdx % 7];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* hero header */}
      <div style={{ background: "linear-gradient(160deg, #F9DDD0 0%, #F5C9B5 55%, #FAF8F6 100%)", padding: "70px 20px 20px", flexShrink: 0 }}>
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
      <div style={{ padding: "14px 20px 0", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: T.text }}>
          {DAY_NAMES[selDate.getDay()]}, {selDate.getDate()} {MONTHS[selDate.getMonth()]} {selDate.getFullYear()}
        </span>
        {selDate.toDateString() === today.toDateString() && <span style={{ fontSize: 11, fontWeight: 700, color: T.accentText, background: T.accentSoft, padding: "2px 8px", borderRadius: 99 }}>TODAY</span>}
      </div>

      {/* WATER INTAKE — above the tabs (shared by both) */}
      <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
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
                  {items.map(({ idx, time, period, name, brand }) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 52, flexShrink: 0, textAlign: "right" }}>
                        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: checked[idx] ? T.textFaint : T.accentText, lineHeight: 1 }}>{time}</div>
                        <div style={{ fontFamily: SANS, fontSize: 9, color: T.textFaint, letterSpacing: 0.3 }}>{period}</div>
                      </div>
                      <div style={{ width: 10, height: 10, borderRadius: 99, flexShrink: 0, transition: "all .25s", background: checked[idx] ? T.accent : rgba(SEC_COL[section], 0.4), boxShadow: checked[idx] ? "0 0 0 3px " + rgba(T.accent, 0.2) : "none" }} />
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 18, cursor: "pointer", background: checked[idx] ? T.surface2 : T.surface, border: "1px solid " + (checked[idx] ? T.border : rgba(SEC_COL[section], 0.18)), boxShadow: checked[idx] ? "none" : "0 3px 14px rgba(60,30,20,0.07)", opacity: checked[idx] ? 0.6 : 1, transition: "all .25s" }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, overflow: "hidden", backgroundImage: `url(${skinImg(name).src})`, backgroundSize: "300%", backgroundPosition: skinImg(name).pos }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: T.text, textDecoration: checked[idx] ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{name}</div>
                          <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.textMute, marginTop: 2 }}>{brand}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setChecked(c => c.map((v, x) => x === idx ? !v : v)); }} style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, cursor: "pointer", border: "1.5px solid " + (checked[idx] ? T.accent : T.borderHi), background: checked[idx] ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                          {checked[idx] && <Icon name="check" size={15} color="#fff" sw={2.8} />}
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
          <DietPlan day={dayPlan} avoid={weekPlan.avoid} region={weekPlan.region} focus={weekPlan.focus} dayName={DAY_NAMES[selDate.getDay()]} onAsk={() => router.push("/coach?q=" + encodeURIComponent("What should I eat for my skin?"))} />
        )}
      </div>

      <AppTabBar active="routine" />
    </div>
  );
}

function DietPlan({ day, avoid, region, focus, dayName, onAsk }: { day: any; avoid: string[]; region: string; focus: string; dayName: string; onAsk: () => void }) {
  return (
    <div>
      {/* focus banner — personalised to scan */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, marginBottom: 18, background: "linear-gradient(120deg, rgba(95,173,114,0.14), rgba(95,173,114,0.05))", border: "1px solid rgba(95,173,114,0.25)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EDF7EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📍</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: T.text }}>{region} plan · focus: {focus}</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: T.textMute }}>{dayName}&apos;s meals · built from your last scan</div>
        </div>
      </div>

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
