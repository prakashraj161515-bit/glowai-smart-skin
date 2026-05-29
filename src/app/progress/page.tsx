"use client";
import { useState, useEffect } from "react";

export default function ProgressPage() {
  const [filter, setFilter] = useState("1M");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const h = localStorage.getItem("velmora_scan_history");
    if (h) { try { setHistory(JSON.parse(h)); } catch {} }
  }, []);

  const pts = history.length >= 2
    ? history.slice(-10).map((h:any) => h.score)
    : [58,61,60,64,68,66,70,72,71,74];

  const W = 320, H = 110, minV = 40, maxV = 100;
  const path = pts.map((v,i) => `${(i/(pts.length-1))*W},${H-((v-minV)/(maxV-minV))*H}`).join(" ");
  const fillPath = `0,${H} ${path} ${W},${H}`;
  const latest = pts[pts.length-1];
  const earliest = pts[0];
  const diff = latest - earliest;

  const MILESTONES = [
    { icon:"✦", label:"First Scan",     earned: history.length >= 1 },
    { icon:"🔥", label:"7-Day Streak",  earned: true },
    { icon:"✅", label:"Clear 2 Weeks", earned: history.length >= 3 },
    { icon:"⭐", label:"30-Day Streak", earned: false },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-32 px-5 pt-[96px]">

      {/* Title */}
      <h1 className="mb-4 text-[#2C1F1A]" style={{fontFamily:"'Instrument Serif',Georgia,serif", fontSize:30}}>Your Progress</h1>

      {/* Filter */}
      <div className="flex p-1 rounded-[12px] bg-[#F5F1EE] mb-4 w-fit gap-0">
        {["1W","1M","3M","All"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-[9px] text-[13px] font-bold border-none cursor-pointer transition-all"
            style={{
              background: filter===f?"#fff":"transparent",
              color:      filter===f?"#2C1F1A":"rgba(44,31,26,0.56)",
              boxShadow:  filter===f?"0 3px 10px rgba(60,30,20,0.08)":"none",
            }}>{f}</button>
        ))}
      </div>

      {/* Score chart card */}
      <div className="rounded-[22px] bg-white p-[18px] border mb-[18px]"
        style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 20px rgba(60,30,20,0.08)"}}>
        <p className="text-[13px] text-[rgba(44,31,26,0.56)] mb-1">Skin Score · last 30 days</p>
        <div className="flex items-end gap-2 mb-3.5">
          <span className="text-[34px] font-semibold text-[#2C1F1A] leading-none" style={{fontFamily:"'Space Grotesk',monospace"}}>{latest}</span>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-[8px] mb-1"
            style={{background: diff>0?"rgba(127,179,137,0.16)":"rgba(224,104,92,0.16)", color:diff>0?"#8FC299":"#E0685C"}}>
            {diff>0?"+":""}{diff} all-time
          </span>
        </div>
        <svg width="100%" viewBox={`0 0 ${W} ${H+4}`} style={{display:"block"}}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0886A" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#F0886A" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points={fillPath} fill="url(#chartFill)"/>
          <polyline points={path} fill="none" stroke="#F0886A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {pts.length > 0 && (
            <circle cx={(pts.length-1)/(pts.length-1)*W} cy={H-((pts[pts.length-1]-minV)/(maxV-minV))*H} r="4" fill="#F0886A"/>
          )}
        </svg>
      </div>

      {/* Milestones */}
      <h2 className="text-[18px] font-bold text-[#2C1F1A] mb-3">Milestones</h2>
      <div className="grid grid-cols-2 gap-3">
        {MILESTONES.map((m,i) => (
          <div key={i} className="rounded-[22px] bg-white p-4 text-center border"
            style={{
              borderColor:"rgba(60,30,20,0.08)",
              boxShadow:"0 4px 20px rgba(60,30,20,0.08)",
              opacity: m.earned ? 1 : 0.4,
            }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-2.5 flex items-center justify-center text-[22px]"
              style={{background: m.earned?"rgba(240,136,106,0.12)":"#F5F1EE"}}>{m.icon}</div>
            <p className="text-[13.5px] font-bold text-[#2C1F1A] text-center">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Scan history */}
      {history.length > 0 && (
        <>
          <h2 className="text-[18px] font-bold text-[#2C1F1A] mt-5 mb-3">Scan History</h2>
          <div className="flex flex-col gap-3">
            {history.slice(-5).reverse().map((h:any, i:number) => (
              <div key={i} className="flex items-center gap-3.5 p-3 rounded-[22px] bg-white border"
                style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 3px 12px rgba(60,30,20,0.06)"}}>
                <div className="w-[60px] h-[60px] rounded-[12px] flex-shrink-0 flex items-center justify-center text-2xl bg-[#F5F1EE]">🤳</div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#2C1F1A]">{new Date(h.date || Date.now()).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</p>
                  <p className="text-[13px] text-[rgba(44,31,26,0.56)] mt-0.5">Score: {h.score}</p>
                </div>
                {/* Mini ring */}
                <div className="relative w-[50px] h-[50px] flex-shrink-0">
                  <svg width="50" height="50" style={{transform:"rotate(-90deg)"}}>
                    <circle cx="25" cy="25" r="20" fill="none" stroke="#F5F1EE" strokeWidth="5"/>
                    <circle cx="25" cy="25" r="20" fill="none"
                      stroke={h.score>=80?"#D9B86A":h.score>=60?"#7FB389":h.score>=40?"#E8A24C":"#E0685C"}
                      strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*20*h.score/100} ${2*Math.PI*20}`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[12px] font-bold text-[#2C1F1A]" style={{fontFamily:"'Space Grotesk',monospace"}}>{h.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
