"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, MiniRing, PrimaryBtn, WaterTracker } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";

const DAYS = [
  { d: "SUN", n: 26 }, { d: "MON", n: 27 }, { d: "TUE", n: 28 },
  { d: "WED", n: 29 }, { d: "THU", n: 30 }, { d: "FRI", n: 31 }, { d: "SAT", n: 1 },
];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PASTELS = ["#FEF0EB", "#EFF0FD", "#EBF5FE", "#EDF7EE", "#FEF7EB", "#FEF0EB", "#EBF5FE"];
const ITEMS = [
  { time: "8:00", period: "AM", section: "Morning", name: "Gentle Gel Cleanser", brand: "Beam Labs", pi: 0 },
  { time: "8:15", period: "AM", section: "Morning", name: "Vitamin C Serum", brand: "Beam Labs", pi: 1 },
  { time: "9:00", period: "AM", section: "Morning", name: "Niacinamide 10%", brand: "Lumen", pi: 2 },
  { time: "9:30", period: "AM", section: "Morning", name: "Cloud Cream Moisturizer", brand: "Lumen", pi: 3 },
  { time: "12:00", period: "PM", section: "Afternoon", name: "Daily Shield SPF 50", brand: "Solé", pi: 4 },
  { time: "3:00", period: "PM", section: "Afternoon", name: "SPF Reapplication", brand: "Solé", pi: 4 },
  { time: "9:00", period: "PM", section: "Evening", name: "Gentle Cleanser (PM)", brand: "Beam Labs", pi: 0 },
  { time: "9:30", period: "PM", section: "Evening", name: "Barrier Repair Night Cream", brand: "Lumen", pi: 3 },
];
const SEC_COL: any = { Morning: "#E8A24C", Afternoon: "#5FAD72", Evening: "#8B85E0" };
const SEC_ICON: any = { Morning: "sun", Afternoon: "bolt", Evening: "moon" };

export default function RoutinePage() {
  const router = useRouter();
  const [selDay, setSelDay] = useState(3);
  const [checked, setChecked] = useState<boolean[]>([true, true, false, false, false, false, false, false]);
  const [tab, setTab] = useState<"Skincare" | "Diet Plan">("Skincare");
  const [water, setWater] = useState(500);

  useEffect(() => { const w = localStorage.getItem("velmora_water_intake"); if (w) setWater(parseInt(w)); }, []);
  const setW = (v: number) => { setWater(v); localStorage.setItem("velmora_water_intake", String(v)); };

  const day = DAYS[selDay];
  const doneCount = checked.filter(Boolean).length;
  const pct = Math.round((doneCount / ITEMS.length) * 100);
  const sections = [...new Set(ITEMS.map(i => i.section))];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(160deg, #F9DDD0 0%, #F5C9B5 55%, #FAF8F6 100%)", padding: "70px 20px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 800, color: "#2C1F1A", lineHeight: 1 }}>Daily Routine</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
              <Icon name="flame" size={15} color="#E8A24C" fill />
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#E8A24C" }}>12-day streak</span>
              <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(44,31,26,0.45)" }}>· keep it up!</span>
            </div>
          </div>
          <MiniRing pct={pct} size={56} sw={5} color="#C44E28"><span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: "#2C1F1A" }}>{pct}%</span></MiniRing>
        </div>
        <div className="glow-hscroll" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {DAYS.map(({ d, n }, i) => {
            const active = i === selDay;
            return (
              <button key={i} onClick={() => setSelDay(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 10px", borderRadius: 16, flexShrink: 0, border: "none", cursor: "pointer", minWidth: 46, position: "relative", background: active ? "#C44E28" : "rgba(255,255,255,0.6)", boxShadow: active ? "0 6px 18px rgba(196,78,40,0.38)" : "0 2px 8px rgba(60,30,20,0.08)" }}>
                <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: active ? "rgba(255,255,255,0.75)" : "rgba(44,31,26,0.45)" }}>{d}</span>
                <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: active ? "#fff" : "#2C1F1A" }}>{n}</span>
                {i === 3 && !active && <div style={{ width: 4, height: 4, borderRadius: 99, background: "#C44E28", position: "absolute", bottom: 4 }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", padding: "12px 20px 0", flexShrink: 0 }}>
        {(["Skincare", "Diet Plan"] as const).map(x => (
          <button key={x} onClick={() => setTab(x)} style={{ flex: 1, padding: "10px 0", border: "none", cursor: "pointer", background: "transparent", fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: tab === x ? T.accentText : T.textFaint, borderBottom: "2.5px solid " + (tab === x ? T.accent : T.border) }}>{x}</button>
        ))}
      </div>

      <div className="glow-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 20px 130px" }}>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 14 }}>{DAY_NAMES[selDay]}, {String(day.n).padStart(2, "0")}</div>
        <WaterTracker ml={water} setMl={setW} />
        {tab === "Skincare" ? (
          sections.map(section => {
            const items = ITEMS.map((item, idx) => ({ ...item, idx })).filter(i => i.section === section);
            return (
              <div key={section} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: rgba(SEC_COL[section], 0.15) }}><Icon name={SEC_ICON[section]} size={15} color={SEC_COL[section]} sw={2} /></div>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: SEC_COL[section], textTransform: "uppercase", letterSpacing: 1 }}>{section}</span>
                  <div style={{ flex: 1, height: 1, background: rgba(SEC_COL[section], 0.20) }} />
                </div>
                {items.map(({ idx, time, period, name, brand, pi }) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 52, flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: checked[idx] ? T.textFaint : T.accentText, lineHeight: 1 }}>{time}</div>
                      <div style={{ fontFamily: SANS, fontSize: 9, color: T.textFaint, letterSpacing: 0.3 }}>{period}</div>
                    </div>
                    <div style={{ width: 10, height: 10, borderRadius: 99, flexShrink: 0, transition: "all .25s", background: checked[idx] ? T.accent : rgba(SEC_COL[section], 0.4), boxShadow: checked[idx] ? "0 0 0 3px " + rgba(T.accent, 0.2) : "none" }} />
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 18, cursor: "pointer", background: checked[idx] ? T.surface2 : T.surface, border: "1px solid " + (checked[idx] ? T.border : rgba(SEC_COL[section], 0.18)), boxShadow: checked[idx] ? "none" : "0 3px 14px rgba(60,30,20,0.07)", opacity: checked[idx] ? 0.6 : 1, transition: "all .25s" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: PASTELS[pi % PASTELS.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="28" viewBox="0 0 18 28" fill="none"><rect x="4" y="7" width="10" height="18" rx="4" fill="rgba(100,60,40,0.20)" /><rect x="5" y="3" width="8" height="6" rx="3" fill="rgba(100,60,40,0.15)" /><rect x="5" y="0" width="8" height="4" rx="2" fill="rgba(100,60,40,0.25)" /><rect x="11" y="9" width="1.5" height="8" rx="1" fill="rgba(255,255,255,0.5)" /></svg>
                      </div>
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
          })
        ) : (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 99, background: T.surface2, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="leaf" size={28} color={T.textFaint} /></div>
            <div style={{ fontFamily: SERIF, fontSize: 22, color: T.text, marginBottom: 8 }}>Diet Plan</div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, maxWidth: 220, margin: "0 auto" }}>Personalised nutrition tips coming after your next scan.</div>
          </div>
        )}
        <PrimaryBtn icon="spark" onClick={() => router.push("/coach")}>Regenerate with AI</PrimaryBtn>
      </div>

      <AppTabBar active="routine" />
    </div>
  );
}
