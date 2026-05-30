"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, MiniRing, PrimaryBtn, WaterTracker, ProductThumb, BuyBtn } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";
import { getWeekPlan, detectCountry, planAgeDays, foodImg, Meal } from "@/glow/diet";
import { productImg } from "@/glow/affiliate";

const DAY_LETTERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// ── Real products only — fake brands hataye ──
// Naye products jab aap link doge tab add honge
const ITEMS = [
  { time: "8:00", period: "AM", section: "Morning", name: "Garnier Bright Complete Vitamin C Face Wash", brand: "Garnier" },
  // aur products aane wale hain...
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

  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false));
  const [tab, setTab] = useState<"Skincare" | "Diet Plan">("Skincare");
  const [water, setWater] = useState(0);
  const [country, setCountry] = useState("India");
  const [scan, setScan] = useState<any>({ acne: 30, oil: 45, pigmentation: 25, hydration: 55, score: 74 });
  const [reminders, setReminders] = useState<number[]>([]);
  const [alarm, setAlarm] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audioRef = useRef<any>(null);

  // ── daily refresh: water + checks reset every new day ──
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDay = localStorage.getItem("velmora_routine_day");
    const c = localStorage.getItem("velmora_country") || detectCountry(); setCountry(c);
    const a = localStorage.getItem("velmora_analysis"); if (a) { try { setScan(JSON.parse(a)); } catch {} }
    try { const r = JSON.parse(localStorage.getItem("velmora_reminders") || "[]"); setReminders(r); } catch {}

    if (lastDay !== today) {
      // new day → reset water + all checks
      setWater(0); localStorage.setItem("velmora_water_intake", "0");
      setChecked(ITEMS.map(() => false));
      localStorage.setItem("velmora_routine_checks", JSON.stringify(ITEMS.map(() => false)));
      localStorage.setItem("velmora_routine_day", today);
      localStorage.removeItem("velmora_alarm_fired");
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

  // ── alarm clock: ring when a reminder time arrives ──
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const hhmm = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
      let fired: string[] = [];
      try { fired = JSON.parse(localStorage.getItem("velmora_alarm_fired") || "[]"); } catch {}
      reminders.forEach(idx => {
        const it = ITEMS[idx]; if (!it) return;
        let [h, m] = it.time.split(":").map(Number);
        if (it.period === "PM" && h !== 12) h += 12;
        if (it.period === "AM" && h === 12) h = 0;
        const key = `${idx}-${h}:${String(m).padStart(2, "0")}`;
        if (`${h}:${String(m).padStart(2, "0")}` === hhmm && !fired.includes(key)) {
          fired.push(key); localStorage.setItem("velmora_alarm_fired", JSON.stringify(fired));
          ringAlarm(idx);
        }
      });
    }, 15000);
    return () => clearInterval(id);
  }, [reminders]);

  // a single loud, piercing "ring" — siren sweep + harmonic, square wave, high gain
  const ringPulse = (ctx: AudioContext, t0: number) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.exponentialRampToValueAtTime(0.9, t0 + 0.02);   // loud attack
    master.gain.setValueAtTime(0.9, t0 + 0.34);
    master.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
    master.connect(ctx.destination);
    // siren tone that sweeps up — attention-grabbing
    const o1 = ctx.createOscillator();
    o1.type = "square"; o1.frequency.setValueAtTime(740, t0);
    o1.frequency.exponentialRampToValueAtTime(1180, t0 + 0.3);
    // bright harmonic on top
    const o2 = ctx.createOscillator();
    o2.type = "sawtooth"; o2.frequency.setValueAtTime(1480, t0);
    o2.frequency.exponentialRampToValueAtTime(2360, t0 + 0.3);
    const g2 = ctx.createGain(); g2.gain.value = 0.35; o2.connect(g2); g2.connect(master);
    o1.connect(master);
    o1.start(t0); o2.start(t0); o1.stop(t0 + 0.42); o2.stop(t0 + 0.42);
  };

  const ringAlarm = (idx: number) => {
    setAlarm(idx);
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx(); audioRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();
      const beep = () => ringPulse(ctx, ctx.currentTime);
      beep();
      const loop = setInterval(beep, 520);   // rapid, urgent cadence
      audioRef.current._loop = loop;
      audioRef.current._timeout = setTimeout(() => stopAlarm(), 60000);
    } catch {}
    if (navigator.vibrate) navigator.vibrate([400, 150, 400, 150, 400, 150, 400]);
  };
  const stopAlarm = () => {
    setAlarm(null);
    const ctx = audioRef.current;
    if (ctx) { clearInterval(ctx._loop); clearTimeout(ctx._timeout); try { ctx.close(); } catch {} audioRef.current = null; }
  };

  const previewBeep = () => {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      if (ctx.state === "suspended") ctx.resume();
      ringPulse(ctx, ctx.currentTime);   // one loud preview ring
      setTimeout(() => { try { ctx.close(); } catch {} }, 700);
    } catch {}
    if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
  };
  const toggleReminder = (idx: number) => {
    setReminders(r => {
      const has = r.includes(idx);
      const next = has ? r.filter(x => x !== idx) : [...r, idx];
      localStorage.setItem("velmora_reminders", JSON.stringify(next));
      if (!has) previewBeep(); // ring once when turning ON
      return next;
    });
  };

  const setW = (v: number) => { setWater(v); localStorage.setItem("velmora_water_intake", String(v)); };
  const setCheckedSaved = (fn: (c: boolean[]) => boolean[]) => setChecked(c => { const n = fn(c); localStorage.setItem("velmora_routine_checks", JSON.stringify(n)); return n; });

  const doneCount = checked.filter(Boolean).length;
  const pct = Math.round((doneCount / ITEMS.length) * 100);
  const sections = [...new Set(ITEMS.map(i => i.section))];
  const weekPlan = useMemo(() => getWeekPlan(country, scan), [country, scan]);
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
                        <button onClick={e => { e.stopPropagation(); toggleReminder(idx); }} title="Set reminder" style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, cursor: "pointer", border: "none", background: reminders.includes(idx) ? rgba("#E8A24C", 0.16) : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name={reminders.includes(idx) ? "bellRing" : "bell"} size={16} color={reminders.includes(idx) ? "#E8A24C" : T.textFaint} sw={1.8} fill={reminders.includes(idx)} />
                        </button>
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
          <DietPlan day={dayPlan} avoid={weekPlan.avoid} region={weekPlan.region} focus={weekPlan.focus} dayName={DAY_NAMES[selDate.getDay()]} onAsk={() => router.push("/coach?q=" + encodeURIComponent("What should I eat for my skin?"))} />
        )}
      </div>

      {/* ── ALARM overlay ── */}
      {alarm !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, maxWidth: 430, margin: "0 auto", background: "linear-gradient(160deg, #2C1F1A, #1a1310)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: 30 }}>
          <div className="animate-spinpulse" style={{ width: 110, height: 110, borderRadius: 99, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${T.accent}` }}>
            <Icon name="bellRing" size={52} color="#fff" sw={2} fill />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 38, fontWeight: 700, color: "#fff" }}>{ITEMS[alarm].time} {ITEMS[alarm].period}</div>
            <div style={{ fontFamily: SERIF, fontSize: 26, color: "#fff", marginTop: 6 }}>{ITEMS[alarm].name}</div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Time for your skincare step ✦</div>
          </div>
          <button onClick={() => { setCheckedSaved(c => c.map((v, x) => x === alarm ? true : v)); stopAlarm(); }} style={{ width: "100%", maxWidth: 300, height: 56, borderRadius: 16, border: "none", cursor: "pointer", background: T.accent, color: "#241712", fontFamily: SANS, fontSize: 17, fontWeight: 700 }}>Done · Stop alarm</button>
          <button onClick={stopAlarm} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontFamily: SANS, fontSize: 14, fontWeight: 600 }}>Snooze / dismiss</button>
        </div>
      )}

      <AppTabBar active="routine" />
    </div>
  );
}

function DietPlan({ day, avoid, region, focus, dayName, onAsk }: { day: any; avoid: string[]; region: string; focus: string; dayName: string; onAsk: () => void }) {
  return (
    <div>
      {/* healthy plan intro */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: 16, marginBottom: 18, background: "linear-gradient(135deg, rgba(127,179,137,0.16), rgba(127,179,137,0.06))", border: "1px solid rgba(127,179,137,0.3)" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: "rgba(127,179,137,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🥗</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: "#3F7A52" }}>Clean, skin-healthy meals</div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute, marginTop: 1 }}>Wholesome, balanced food to help {focus}.</div>
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
            { l: "Lean protein", e: "🍗" }, { l: "8+ glasses water", e: "💧" }, { l: "Curd / yogurt", e: "🥛" },
            { l: "Green tea", e: "🍵" }, { l: "Omega-3 (fish/flax)", e: "🐟" },
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
