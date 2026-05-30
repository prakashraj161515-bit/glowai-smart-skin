"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Badge, SectionTitle } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";

const RANGES: Record<string, number> = { "1W": 7, "1M": 10, "3M": 16, "All": 999 };
const LABELS: Record<string, string> = { "1W": "last 7 days", "1M": "last 30 days", "3M": "last 90 days", "All": "all time" };

type Milestone = { ic: any; label: string; earned: boolean; desc: string };

export default function ProgressPage() {
  const router = useRouter();
  const [all, setAll] = useState<number[]>([58, 61, 60, 64, 68, 66, 70, 72, 71, 74]);
  const [range, setRange] = useState("1M");
  const [scans, setScans] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selM, setSelM] = useState<Milestone | null>(null);
  useEffect(() => {
    const h = localStorage.getItem("velmora_history");
    if (h) { try { const arr = JSON.parse(h); setScans(arr.length); const s = arr.map((x: any) => x.score).reverse(); if (s.length >= 2) setAll(s); } catch {} }
    setStreak(parseInt(localStorage.getItem("velmora_streak") || "0") || 0);
  }, []);

  const MILESTONES: Milestone[] = [
    { ic: "flame", label: "7-Day Streak", earned: streak >= 7, desc: "Open GlowAI 7 days in a row." },
    { ic: "crown", label: "30-Day Streak", earned: streak >= 30, desc: "Log in 30 days straight to unlock a 10% loyalty discount!" },
    { ic: "gem", label: "100-Day Streak", earned: streak >= 100, desc: "100 days of glow — your loyalty discount grows to ~11-12%." },
    { ic: "star", label: "200-Day Streak", earned: streak >= 200, desc: "A 200-day streak earns the top 13% loyalty discount." },
  ];
  const n = Math.min(all.length, RANGES[range]);
  const pts = all.slice(-Math.max(2, n));
  const W = 320, H = 120;
  const max = Math.max(...pts) + 4, min = Math.min(...pts) - 4;
  const span = Math.max(1, max - min);
  const path = pts.map((p, i) => `${(i / (pts.length - 1)) * W},${H - ((p - min) / span) * H}`).join(" ");
  const latest = pts[pts.length - 1];
  const diff = latest - pts[0];

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <button onClick={() => router.back()} style={{ position: "fixed", top: 56, left: 14, zIndex: 70, width: 36, height: 36, borderRadius: 11, cursor: "pointer", background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: T.shadow }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
      <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "100px 20px 130px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 30, color: T.text, margin: "0 0 16px" }}>Your Progress</h1>
        <div style={{ display: "flex", gap: 6, background: T.surface2, padding: 4, borderRadius: 12, marginBottom: 16, width: "fit-content" }}>
          {["1W", "1M", "3M", "All"].map((x) => (
            <button key={x} onClick={() => setRange(x)} style={{ padding: "6px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 13, fontWeight: 650, background: range === x ? T.surface : "transparent", color: range === x ? T.text : T.textMute, boxShadow: range === x ? "0 2px 8px rgba(60,30,20,0.08)" : "none" }}>{x}</button>
          ))}
        </div>
        <Card style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: SANS, fontSize: 13, color: T.textMute, marginBottom: 4 }}>Skin Score · {LABELS[range]}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 600, color: T.text }}>{latest}</span>
            <Badge tone="good">{diff >= 0 ? "+" : ""}{diff} all-time</Badge>
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H + 4}`} style={{ display: "block" }}>
            <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity="0.35" /><stop offset="100%" stopColor={T.accent} stopOpacity="0" /></linearGradient></defs>
            <polygon points={`0,${H} ${path} ${W},${H}`} fill="url(#fill)" />
            <polyline className="draw-line" pathLength={1} points={path} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={W} cy={H - ((pts[pts.length - 1] - min) / (max - min)) * H} r="4" fill={T.accent} className="animate-spinpulse" />
          </svg>
        </Card>
        <SectionTitle>Milestones</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {MILESTONES.map((m, i) => (
            <Card key={i} pad={16} onClick={() => setSelM(m)} style={{ textAlign: "center", opacity: m.earned ? 1 : 0.5, cursor: "pointer" }}>
              <div style={{ width: 48, height: 48, borderRadius: 99, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", background: m.earned ? T.accentSoft : T.surface2 }}><Icon name={m.ic} size={24} color={m.earned ? T.accentText : T.textFaint} fill={m.ic === "star"} /></div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 650, color: T.text }}>{m.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: m.earned ? "#7FB389" : T.textFaint, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.earned ? "Earned" : "Locked"}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* milestone detail */}
      {selM && (
        <div onClick={() => setSelM(null)} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(20,12,8,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28, maxWidth: 430, margin: "0 auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: T.bg, borderRadius: 24, padding: 24, textAlign: "center", animation: "fadeUp .25s ease" }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", background: selM.earned ? T.accentSoft : T.surface2 }}><Icon name={selM.ic} size={30} color={selM.earned ? T.accentText : T.textFaint} fill={selM.ic === "star"} /></div>
            <h3 style={{ fontFamily: SERIF, fontSize: 24, color: T.text, margin: "0 0 6px" }}>{selM.label}</h3>
            <p style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, margin: "0 0 18px", lineHeight: 1.5 }}>{selM.desc} {selM.earned ? "✓ Earned!" : "Keep going to unlock it."}</p>
            <button onClick={() => setSelM(null)} style={{ width: "100%", height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: T.accent, color: "#241712", fontFamily: SANS, fontSize: 15, fontWeight: 700 }}>Got it</button>
          </div>
        </div>
      )}

      <AppTabBar active="profile" />
    </div>
  );
}
