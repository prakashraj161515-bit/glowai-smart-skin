"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const DAYS = [
  { d:"SUN",n:26 },{ d:"MON",n:27 },{ d:"TUE",n:28 },
  { d:"WED",n:29 },{ d:"THU",n:30 },{ d:"FRI",n:31 },{ d:"SAT",n:1 },
];
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const PASTELS   = ["#FEF0EB","#EFF0FD","#EBF5FE","#EDF7EE","#FEF7EB","#FEF0EB","#EBF5FE"];
const SEC_COL   = { Morning:"#E8A24C", Afternoon:"#5FAD72", Evening:"#8B85E0" } as any;
const SEC_ICO   = { Morning:"☀️", Afternoon:"⚡", Evening:"🌙" } as any;

const ITEMS = [
  { time:"8:00",  p:"AM", section:"Morning",   name:"Gentle Gel Cleanser",      brand:"Beam Labs", pi:0 },
  { time:"8:15",  p:"AM", section:"Morning",   name:"Vitamin C Serum",           brand:"Beam Labs", pi:1 },
  { time:"9:00",  p:"AM", section:"Morning",   name:"Niacinamide 10%",           brand:"Lumen",     pi:2 },
  { time:"9:30",  p:"AM", section:"Morning",   name:"Cloud Cream Moisturizer",   brand:"Lumen",     pi:3 },
  { time:"12:00", p:"PM", section:"Afternoon", name:"Daily Shield SPF 50",       brand:"Solé",      pi:4 },
  { time:"3:00",  p:"PM", section:"Afternoon", name:"SPF Reapplication",         brand:"Solé",      pi:4 },
  { time:"9:00",  p:"PM", section:"Evening",   name:"Gentle Cleanser (PM)",      brand:"Beam Labs", pi:0 },
  { time:"9:30",  p:"PM", section:"Evening",   name:"Barrier Repair Night Cream",brand:"Lumen",     pi:3 },
];

const TARGET = 3000;

export default function RoutinePage() {
  const [selDay,  setSelDay]  = useState(new Date().getDay());
  const [checked, setChecked] = useState<Set<number>>(new Set([0,1]));
  const [tab,     setTab]     = useState<"Skincare"|"Diet Plan">("Skincare");
  const [water,   setWater]   = useState(500);
  const [routine, setRoutine] = useState(ITEMS);

  useEffect(() => {
    const saved = localStorage.getItem("velmora_completed_routine");
    if (saved) {
      try { const arr = JSON.parse(saved); setChecked(new Set(arr)); } catch {}
    }
    const w = localStorage.getItem("velmora_water_intake");
    if (w) setWater(parseInt(w));
    // Load AI routine if available
    const scanData = localStorage.getItem("velmora_analysis");
    if (scanData) {
      try {
        const d = JSON.parse(scanData);
        if (d.routine && Array.isArray(d.routine)) {
          const mapped = d.routine.slice(0,8).map((r:any, i:number) => ({
            time: ["8:00","8:15","9:00","9:30","12:00","3:00","9:00","9:30"][i],
            p:    ["AM","AM","AM","AM","PM","PM","PM","PM"][i],
            section: i<4?"Morning":i<6?"Afternoon":"Evening",
            name: r.product || ITEMS[i].name,
            brand: r.brand || ITEMS[i].brand,
            pi: i % 5,
          }));
          setRoutine(mapped);
        }
      } catch {}
    }
  }, []);

  const toggle = (i: number) => {
    const next = new Set(checked);
    next.has(i) ? next.delete(i) : next.add(i);
    setChecked(next);
    localStorage.setItem("velmora_completed_routine", JSON.stringify([...next]));
  };

  const doneCount = checked.size;
  const pct       = Math.round((doneCount / routine.length) * 100);
  const sections  = [...new Set(routine.map(r => r.section))];
  const wPct      = Math.min(100, Math.round(water / TARGET * 100));
  const glasses   = Math.round(water / 250);
  const totalG    = Math.round(TARGET / 250);

  const day = DAYS[selDay];

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-32 flex flex-col">

      {/* ── HERO HEADER ── */}
      <div style={{ background:"linear-gradient(160deg,#F9DDD0 0%,#F5C9B5 55%,#FAF8F6 100%)", padding:"70px 20px 20px", flexShrink:0 }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-[26px] font-extrabold text-[#2C1F1A] leading-none">Daily Routine</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span>🔥</span>
              <span className="text-[13px] font-bold text-[#E8A24C]">12-day streak</span>
              <span className="text-[12px] text-[rgba(44,31,26,0.45)]">· keep it up!</span>
            </div>
          </div>
          {/* Mini progress ring */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg width="56" height="56" className="absolute inset-0" style={{transform:"rotate(-90deg)"}}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5"/>
              <circle cx="28" cy="28" r="22" fill="none" stroke="#C44E28" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*22*pct/100} ${2*Math.PI*22}`}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[13px] font-extrabold text-[#2C1F1A]">{pct}%</span>
            </div>
          </div>
        </div>

        {/* Calendar strip */}
        <div className="flex gap-1.5 overflow-x-auto" style={{scrollbarWidth:"none"}}>
          {DAYS.map(({d,n},i) => {
            const active = i === selDay;
            return (
              <button key={i} onClick={() => setSelDay(i)}
                className="flex flex-col items-center gap-0.5 py-2 px-2.5 rounded-2xl flex-shrink-0 min-w-[46px] border-none cursor-pointer relative transition-all"
                style={{
                  background: active ? "#C44E28" : "rgba(255,255,255,0.6)",
                  boxShadow: active ? "0 6px 18px rgba(196,78,40,0.38)" : "0 2px 8px rgba(60,30,20,0.08)",
                }}>
                <span className="text-[9px] font-bold tracking-[0.5px]"
                  style={{color: active?"rgba(255,255,255,0.75)":"rgba(44,31,26,0.45)"}}>{d}</span>
                <span className="text-[17px] font-bold" style={{fontFamily:"'Space Grotesk',monospace", color: active?"#fff":"#2C1F1A"}}>{n}</span>
                {i === 3 && !active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C44E28]"/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex px-5 border-b border-[rgba(60,30,20,0.08)] bg-[#FAF8F6]">
        {(["Skincare","Diet Plan"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 border-none bg-transparent cursor-pointer text-[13px] font-bold uppercase tracking-[0.4px] transition-colors"
            style={{
              color: tab===t ? "#C44E28" : "rgba(44,31,26,0.33)",
              borderBottom: `2.5px solid ${tab===t ? "#F0886A" : "transparent"}`,
            }}>{t}</button>
        ))}
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{scrollbarWidth:"none"}}>

        {/* Day label */}
        <p className="text-[15px] font-bold text-[#2C1F1A] mb-4">{DAY_NAMES[selDay]}, {String(day.n).padStart(2,"0")}</p>

        {/* ── WATER TRACKER ── */}
        <div className="rounded-3xl mb-4 overflow-hidden relative p-5"
          style={{background:"linear-gradient(145deg,#2A6FDB 0%,#4E8ED4 50%,#6BA8E8 100%)", boxShadow:"0 12px 32px rgba(42,111,219,0.30)"}}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/2"/>
          <div className="flex items-center gap-4 mb-3.5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg width="80" height="80" style={{transform:"rotate(-90deg)"}}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7"/>
                <circle cx="40" cy="40" r="32" fill="none" stroke="#fff" strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*32*wPct/100} ${2*Math.PI*32}`}
                  style={{transition:"stroke-dasharray .5s ease"}}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base">💧</span>
                <span className="text-[13px] font-extrabold text-white leading-none mt-0.5">{wPct}%</span>
              </div>
            </div>
            <div>
              <p className="text-[18px] font-extrabold text-white">Water Intake</p>
              <p className="text-[20px] font-bold text-white mt-0.5" style={{fontFamily:"'Space Grotesk',monospace"}}>
                {water}<span className="text-[13px] font-normal opacity-75">ml</span>
                <span className="text-[13px] font-normal opacity-55"> / {TARGET}ml</span>
              </p>
              <p className="text-[12px] text-white/65 mt-1">{water>=TARGET?"🎉 Daily goal reached!":`${totalG-glasses} glasses to go`}</p>
            </div>
          </div>
          <div className="flex gap-1.5 mb-3.5">
            {Array.from({length:totalG}).map((_,i) => (
              <button key={i} onClick={() => { const v=(i+1)*250; setWater(v); localStorage.setItem("velmora_water_intake",String(v)); }}
                className="flex-1 h-2 rounded-full border-none cursor-pointer transition-all"
                style={{background: i<glasses?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.22)"}}/>
            ))}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => { const v=Math.max(0,water-250); setWater(v); localStorage.setItem("velmora_water_intake",String(v)); }}
              className="flex-1 h-[42px] rounded-[13px] text-[14px] font-bold text-white cursor-pointer border"
              style={{background:"rgba(255,255,255,0.12)", borderColor:"rgba(255,255,255,0.35)"}}>-250ml</button>
            <button onClick={() => { const v=Math.min(TARGET,water+250); setWater(v); localStorage.setItem("velmora_water_intake",String(v)); }}
              className="flex-1 h-[42px] rounded-[13px] text-[14px] font-extrabold cursor-pointer border-none"
              style={{background:"rgba(255,255,255,0.92)", color:"#2A6FDB", boxShadow:"0 4px 14px rgba(0,0,0,0.15)"}}>+ Add Glass</button>
          </div>
        </div>

        {tab === "Skincare" ? (
          <>
            {sections.map(sec => {
              const items = routine.map((r,idx)=>({...r,idx})).filter(r=>r.section===sec);
              return (
                <div key={sec} className="mb-5">
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-[9px] flex items-center justify-center text-[13px]"
                      style={{background:`${SEC_COL[sec]}25`}}>{SEC_ICO[sec]}</div>
                    <span className="text-[12px] font-extrabold uppercase tracking-[1px]" style={{color:SEC_COL[sec]}}>{sec}</span>
                    <div className="flex-1 h-px" style={{background:`${SEC_COL[sec]}33`}}/>
                  </div>
                  {items.map(({idx,time,p,name,brand,pi}) => {
                    const done = checked.has(idx);
                    return (
                      <div key={idx} className="flex items-center gap-2.5 mb-2.5">
                        {/* Time */}
                        <div className="w-[52px] flex-shrink-0 text-right">
                          <div className="text-[13px] font-bold leading-none" style={{fontFamily:"'Space Grotesk',monospace", color:done?"rgba(44,31,26,0.33)":"#C44E28"}}>{time}</div>
                          <div className="text-[9px] tracking-[0.3px] text-[rgba(44,31,26,0.33)]">{p}</div>
                        </div>
                        {/* Timeline dot */}
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
                          style={{background:done?"#F0886A":`${SEC_COL[sec]}66`, boxShadow:done?"0 0 0 3px rgba(240,136,106,0.2)":"none"}}/>
                        {/* Card */}
                        <div className="flex-1 flex items-center gap-3 py-2.5 px-3 rounded-[18px] transition-all cursor-pointer"
                          style={{
                            background: done?"#F5F1EE":"#fff",
                            border:`1px solid ${done?"rgba(60,30,20,0.08)":`${SEC_COL[sec]}30`}`,
                            boxShadow: done?"none":"0 3px 14px rgba(60,30,20,0.07)",
                            opacity: done?0.6:1,
                          }}>
                          {/* Product thumb */}
                          <div className="w-11 h-11 rounded-[13px] flex-shrink-0 flex items-center justify-center" style={{background:PASTELS[pi%PASTELS.length]}}>
                            <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
                              <rect x="4" y="7" width="10" height="18" rx="4" fill="rgba(100,60,40,0.20)"/>
                              <rect x="5" y="3" width="8" height="6" rx="3" fill="rgba(100,60,40,0.15)"/>
                              <rect x="5" y="0" width="8" height="4" rx="2" fill="rgba(100,60,40,0.25)"/>
                              <rect x="11" y="9" width="1.5" height="8" rx="1" fill="rgba(255,255,255,0.5)"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] font-bold text-[#2C1F1A] truncate leading-tight" style={{textDecoration:done?"line-through":"none"}}>{name}</p>
                            <p className="text-[11.5px] text-[rgba(44,31,26,0.56)] mt-0.5">{brand}</p>
                          </div>
                          <button onClick={() => toggle(idx)}
                            className="w-7 h-7 rounded-[9px] flex-shrink-0 cursor-pointer flex items-center justify-center border transition-all"
                            style={{background:done?"#F0886A":"transparent", borderColor:done?"#F0886A":"rgba(60,30,20,0.13)", borderWidth:"1.5px"}}>
                            {done && <span className="text-white text-[13px] font-extrabold">✓</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-[#F5F1EE] mx-auto mb-3.5 flex items-center justify-center text-2xl">🥗</div>
            <p className="text-[22px] text-[#2C1F1A] mb-2" style={{fontFamily:"'Instrument Serif',Georgia,serif"}}>Diet Plan</p>
            <p className="text-[14px] text-[rgba(44,31,26,0.56)] max-w-[220px] mx-auto">Personalised nutrition tips coming after your next scan.</p>
            <Link href="/diet" className="mt-4 inline-block px-5 py-2.5 rounded-2xl text-[14px] font-bold text-white bg-[#F0886A]">View Diet Tips →</Link>
          </div>
        )}

        {/* Regenerate button */}
        <button className="w-full h-[54px] rounded-2xl text-[17px] font-bold text-[#241712] border-none cursor-pointer flex items-center justify-center gap-2 mt-2"
          style={{background:"#F0886A", boxShadow:"0 8px 22px rgba(240,136,106,0.35)"}}>
          ✦&nbsp;&nbsp;Regenerate with AI
        </button>
      </div>
    </div>
  );
}
