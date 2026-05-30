"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Badge, SectionTitle } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";

const RANGES: Record<string, number> = { "1W": 7, "1M": 10, "3M": 16, "All": 999 };
const LABELS: Record<string, string> = { "1W": "last 7 days", "1M": "last 30 days", "3M": "last 90 days", "All": "all time" };

export default function ProgressPage() {
  const router = useRouter();
  const [all, setAll] = useState<number[]>([58, 61, 60, 64, 68, 66, 70, 72, 71, 74]);
  const [range, setRange] = useState("1M");
  useEffect(() => {
    const h = localStorage.getItem("velmora_history");
    if (h) { try { const arr = JSON.parse(h).map((x: any) => x.score).reverse(); if (arr.length >= 2) setAll(arr); } catch {} }
  }, []);
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
            <polyline points={path} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={W} cy={H - ((pts[pts.length - 1] - min) / (max - min)) * H} r="4" fill={T.accent} />
          </svg>
        </Card>
        <SectionTitle>Milestones</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {([["spark", "First Scan", true], ["flame", "7-Day Streak", true], ["check", "Clear 2 Weeks", true], ["star", "30-Day Streak", false]] as [any, string, boolean][]).map(([ic, l, earned], i) => (
            <Card key={i} pad={16} style={{ textAlign: "center", opacity: earned ? 1 : 0.45 }}>
              <div style={{ width: 48, height: 48, borderRadius: 99, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", background: earned ? T.accentSoft : T.surface2 }}><Icon name={ic} size={24} color={earned ? T.accentText : T.textFaint} fill={ic === "star"} /></div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 650, color: T.text }}>{l}</div>
            </Card>
          ))}
        </div>
      </div>
      <AppTabBar active="profile" />
    </div>
  );
}
