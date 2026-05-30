"use client";
import { useState } from "react";
import { T, SERIF, SANS, rgba, Icon, Card, Chip, Badge, Placeholder, SectionTitle, ProductThumb } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";

const SHELF: [string, string, string][] = [
  ["Gentle Gel Cleanser", "Beam Labs", "Cleanser"], ["15% Vitamin C", "Beam Labs", "Serum"],
  ["Quiet Hero 10%", "Lumen", "Serum"], ["Cloud Cream", "Lumen", "Moisturizer"],
  ["Daily Shield SPF 50", "Solé", "SPF"], ["Spot Gel", "Beam Labs", "Treatment"],
];
const CATS = ["All", "Cleanser", "Serum", "Moisturizer", "SPF", "Treatment"];
const DISCOVER: [string, string, number, string][] = [
  ["Clarifying BHA Toner", "Beam Labs", 4.6, "$$"], ["Barrier Repair Cream", "Lumen", 4.8, "$$$"], ["Brightening Essence", "Solé", 4.4, "$$"],
];

export default function StorePage() {
  const [tab, setTab] = useState<"My Shelf" | "Discover" | "Scan">("My Shelf");
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? SHELF : SHELF.filter(s => s[2] === cat);

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "108px 20px 130px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, color: T.text, margin: "0 0 14px" }}>Shelf</h1>
        <div style={{ display: "flex", gap: 6, background: T.surface2, padding: 4, borderRadius: 14, marginBottom: 16 }}>
          {(["My Shelf", "Discover", "Scan"] as const).map(x => (
            <button key={x} onClick={() => setTab(x)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 650, background: tab === x ? T.surface : "transparent", color: tab === x ? T.text : T.textMute, boxShadow: tab === x ? T.shadow : "none" }}>{x}</button>
          ))}
        </div>

        {tab === "My Shelf" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, marginBottom: 14, background: "rgba(224,104,92,0.12)", border: "1px solid rgba(224,104,92,0.3)" }}>
              <Icon name="warn" size={22} color="#E0685C" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#E0685C" }}>1 conflict detected</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute }}>Vitamin C + BHA — tap to review</div>
              </div>
              <Icon name="chev" size={16} color="#E0685C" />
            </div>
            <div className="glow-hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -20px 16px", padding: "0 20px 4px" }}>
              {CATS.map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {shown.map(([n, b], i) => (
                <Card key={i} pad={12}>
                  <div style={{ height: 120, borderRadius: 14, marginBottom: 10, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}><ProductThumb name={n} size={84} /></div>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, lineHeight: 1.2 }}>{n}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: T.textMute, marginTop: 3 }}>{b}</div>
                </Card>
              ))}
            </div>
            <button style={{ marginTop: 18, width: "100%", height: 50, borderRadius: 14, border: `1.5px solid ${T.borderHi}`, background: T.surface, cursor: "pointer", fontFamily: SANS, fontSize: 15, fontWeight: 650, color: T.text, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Icon name="info" size={19} color={T.accentText} /> Ingredient Checker
            </button>
          </>
        )}

        {tab === "Discover" && (
          <>
            <SectionTitle>Recommended for you</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DISCOVER.map(([n, b, r, p], i) => (
                <Card key={i} pad={12} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <Placeholder label="" h={76} r={14} style={{ width: 76, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 650, color: T.text }}>{n}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute, marginTop: 2 }}>{b} · {p}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}><Icon name="star" size={14} color="#D9B86A" fill /><span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: T.text }}>{r}</span></div>
                  </div>
                  <button style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: T.accentSoft, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={20} color={T.accentText} sw={2.2} /></button>
                </Card>
              ))}
            </div>
          </>
        )}

        {tab === "Scan" && (
          <div>
            <div style={{ height: 220, borderRadius: 20, position: "relative", overflow: "hidden", marginBottom: 16, background: "#0c0908" }}>
              <Placeholder label="point at a barcode" h={220} r={20} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 200, height: 110, borderRadius: 16, border: `2px solid ${T.accent}`, boxShadow: "0 0 0 2000px rgba(0,0,0,0.4)" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 14, background: T.surface, border: `1px solid ${T.border}` }}>
              <Icon name="scan" size={20} color={T.textMute} />
              <span style={{ fontFamily: SANS, fontSize: 15, color: T.textMute }}>Search product name or brand</span>
            </div>
          </div>
        )}
      </div>
      <AppTabBar active="products" />
    </div>
  );
}
