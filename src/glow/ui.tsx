"use client";
/* GlowAI design system — exact port of glow-components.jsx (light theme, accent #F0886A) */
import React from "react";
import { affiliateUrl } from "./affiliate";

// ── helpers ──────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const int = parseInt(n, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}
export function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
export function scoreColor(s: number) {
  if (s <= 40) return "#E0685C";
  if (s <= 60) return "#E8A24C";
  if (s <= 80) return "#7FB389";
  return "#D9B86A";
}
export function scoreLabel(s: number) {
  if (s <= 40) return "Needs care";
  if (s <= 60) return "Fair";
  if (s <= 80) return "Good";
  return "Radiant";
}

// ── theme (light, accent #F0886A) ────────────────────────────────────────
const acc = "#F0886A";
export const T = {
  dark: false,
  accent: acc,
  bg: "#FAF8F6",
  bgGrad: "linear-gradient(160deg, #ffffff 0%, #FAF8F6 50%, #F6EDE7 100%)",
  surface: "#FFFFFF",
  surface2: "#F5F1EE",
  surfaceHi: "#FDFBFA",
  border: "rgba(60,30,20,0.08)",
  borderHi: "rgba(60,30,20,0.13)",
  text: "#2C1F1A",
  textMute: "rgba(44,31,26,0.56)",
  textFaint: "rgba(44,31,26,0.33)",
  accentSoft: rgba(acc, 0.12),
  accentDim: rgba(acc, 0.26),
  accentText: "#C44E28",
  shadow: "0 4px 20px rgba(60,30,20,0.08), 0 1px 4px rgba(60,30,20,0.04)",
  tabBg: "rgba(255,255,255,0.92)",
  pastels: ["#FEF0EB", "#EFF0FD", "#EBF5FE", "#EDF7EE", "#FEF7EB"],
};

export const SERIF = '"Instrument Serif", Georgia, serif';
export const MONO  = '"Space Grotesk", system-ui, sans-serif';
export const SANS  = '"DM Sans", system-ui, sans-serif';

// ── Icon ─────────────────────────────────────────────────────────────────
type IconName =
  | "home" | "scan" | "routine" | "products" | "profile" | "chat" | "chev" | "chevL"
  | "chevDown" | "check" | "plus" | "close" | "spark" | "bell" | "bolt" | "drop"
  | "sun" | "moon" | "camera" | "flip" | "flame" | "arrowUp" | "arrowDown" | "arrowR"
  | "edit" | "lock" | "star" | "info" | "send" | "grid" | "clock" | "warn" | "leaf"
  | "crown" | "gem" | "bin" | "bellRing" | "cart";

export function Icon({ name, size = 24, color = "currentColor", sw = 1.7, fill = false }:
  { name: IconName; size?: number; color?: string; sw?: number; fill?: boolean }) {
  const p: any = { fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths: Record<string, React.ReactNode> = {
    home: <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" {...p} />,
    scan: <g {...p}><path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3" /><circle cx="12" cy="12" r="3.4" /></g>,
    routine: <g {...p}><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1.2" fill={color} /><circle cx="4" cy="12" r="1.2" fill={color} /><circle cx="4" cy="18" r="1.2" fill={color} /></g>,
    products: <g {...p}><path d="M9 3h6v3l1.5 2v11a2 2 0 01-2 2h-5a2 2 0 01-2-2V8L9 6z" /><path d="M8.5 12h7" /></g>,
    profile: <g {...p}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" /></g>,
    chat: <path d="M4 5h16v11H9l-4 3.5V16H4z" {...p} />,
    chev: <path d="M9 5l7 7-7 7" {...p} />,
    chevL: <path d="M15 5l-7 7 7 7" {...p} />,
    chevDown: <path d="M5 9l7 7 7-7" {...p} />,
    check: <path d="M5 12.5l4.5 4.5L19 7" {...p} />,
    plus: <path d="M12 5v14M5 12h14" {...p} />,
    close: <path d="M6 6l12 12M18 6L6 18" {...p} />,
    spark: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" {...p} />,
    bell: <g {...p}><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 004 0" /></g>,
    bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6z" {...p} />,
    drop: <path d="M12 3c3 4 6 7 6 10.5A6 6 0 016 13.5C6 10 9 7 12 3z" {...p} />,
    sun: <g {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></g>,
    moon: <path d="M20 13.5A8 8 0 119 3a6.5 6.5 0 0011 10.5z" {...p} />,
    camera: <g {...p}><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><circle cx="12" cy="12.5" r="3.6" /></g>,
    flip: <g {...p}><path d="M4 9a8 8 0 0113-3l3 3M20 15a8 8 0 01-13 3l-3-3" /><path d="M20 5v4h-4M4 19v-4h4" /></g>,
    flame: <path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-1.5.6-2.4 1.4-3.2C10 9 11 7.5 12 3z" {...p} />,
    arrowUp: <path d="M12 19V6M6 12l6-6 6 6" {...p} />,
    arrowDown: <path d="M12 5v13M6 12l6 6 6-6" {...p} />,
    arrowR: <path d="M5 12h13M13 6l6 6-6 6" {...p} />,
    edit: <path d="M14 4l6 6M4 20l1-4L16 5l3 3L8 19z" {...p} />,
    lock: <g {...p}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></g>,
    star: <path d="M12 3l2.5 6 6.5.5-5 4.3 1.6 6.4L12 17l-5.6 3.2L8 13.8 3 9.5 9.5 9z" {...p} fill={fill ? color : "none"} />,
    info: <g {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></g>,
    send: <path d="M4 12l16-8-6 16-2.5-6.5z" {...p} />,
    grid: <g {...p}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></g>,
    clock: <g {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g>,
    warn: <g {...p}><path d="M12 3l9 16H3z" /><path d="M12 9v5M12 17h.01" /></g>,
    leaf: <path d="M5 19C5 9 13 5 20 5c0 9-6 14-13 14a5 5 0 01-2-9" {...p} />,
    crown: <g {...p}><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" fill={fill ? color : "none"} /><path d="M5 19h14" /></g>,
    gem: <g {...p}><path d="M6 3h12l3 6-9 12L3 9z" fill={fill ? color : "none"} /><path d="M3 9h18M9 3l-3 6 6 12 6-12-3-6" /></g>,
    bin: <g {...p}><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" /></g>,
    bellRing: <g {...p}><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 004 0" /><path d="M2.5 6.5C3 5 4 4 4 4M21.5 6.5C21 5 20 4 20 4" /></g>,
    cart: <g {...p}><circle cx="9" cy="20" r="1.4" fill={color} /><circle cx="17" cy="20" r="1.4" fill={color} /><path d="M3 4h2l2.2 11.2a1 1 0 001 .8h8.6a1 1 0 001-.8L21 8H6" /></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>{paths[name]}</svg>;
}

// ── Placeholder ──────────────────────────────────────────────────────────
export function Placeholder({ label = "", h = 140, r = 18, style = {} }:
  { label?: string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      height: h, borderRadius: r, position: "relative", overflow: "hidden",
      background: `repeating-linear-gradient(135deg, ${rgba(T.accent, 0.10)} 0 10px, ${rgba(T.accent, 0.04)} 10px 20px)`,
      border: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "center", ...style,
    }}>
      {!!label && <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: T.textFaint }}>{label}</span>}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, pad = 18, onClick, glow = false }:
  { children: React.ReactNode; style?: React.CSSProperties; pad?: number; onClick?: () => void; glow?: boolean }) {
  return (
    <div onClick={onClick} style={{
      background: T.surface, borderRadius: 22, padding: pad,
      border: `1px solid ${T.border}`,
      boxShadow: glow ? `0 0 0 1px ${T.accentSoft}, 0 14px 34px ${rgba(T.accent, 0.10)}` : T.shadow,
      cursor: onClick ? "pointer" : "default", ...style,
    }}>{children}</div>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, style = {}, icon }:
  { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties; icon?: IconName }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", height: 54, borderRadius: 16, border: "none", cursor: "pointer",
      background: T.accent, color: "#241712", fontFamily: SANS, fontSize: 17, fontWeight: 650,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: `0 8px 22px ${rgba(T.accent, 0.35)}`, letterSpacing: -0.2, ...style,
    }}>{icon && <Icon name={icon} size={20} color="#241712" sw={2} />}{children}</button>
  );
}
export function GhostBtn({ children, onClick, style = {} }:
  { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", height: 54, borderRadius: 16, cursor: "pointer",
      background: "transparent", color: T.text, border: `1.5px solid ${T.borderHi}`,
      fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: -0.2, ...style,
    }}>{children}</button>
  );
}

// ── BuyBtn — affiliate buy link (opens in new tab, rel=sponsored) ──────────
export function BuyBtn({ name, variant = "pill", style = {} }:
  { name: string; variant?: "pill" | "icon" | "wide"; style?: React.CSSProperties }) {
  const href = affiliateUrl(name);
  const common: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    textDecoration: "none", cursor: "pointer", fontFamily: SANS, fontWeight: 700,
    background: T.accent, color: "#241712", border: "none", flexShrink: 0,
    boxShadow: `0 4px 12px ${rgba(T.accent, 0.32)}`,
  };
  const sizes: Record<string, React.CSSProperties> = {
    pill: { height: 32, padding: "0 13px", borderRadius: 99, fontSize: 12.5 },
    wide: { height: 44, width: "100%", borderRadius: 13, fontSize: 14.5 },
    icon: { width: 36, height: 36, borderRadius: 11, padding: 0, gap: 0 },
  };
  return (
    <a href={href} target="_blank" rel="noopener noreferrer sponsored"
      onClick={e => e.stopPropagation()}
      style={{ ...common, ...sizes[variant], ...style }}>
      <Icon name="cart" size={variant === "wide" ? 18 : 15} color="#241712" sw={1.9} />
      {variant !== "icon" && "Buy"}
    </a>
  );
}

// ── Chip ─────────────────────────────────────────────────────────────────
export function Chip({ children, active, onClick, style = {} }:
  { children: React.ReactNode; active?: boolean; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 15px", borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap",
      fontFamily: SANS, fontSize: 13.5, fontWeight: 550, letterSpacing: -0.1,
      border: `1.5px solid ${active ? T.accent : T.border}`,
      background: active ? T.accent : "transparent",
      color: active ? "#241712" : T.textMute, ...style,
    }}>{children}</button>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────
export function Badge({ children, tone = "mute", style = {} }:
  { children: React.ReactNode; tone?: "mute" | "accent" | "good" | "warn" | "bad"; style?: React.CSSProperties }) {
  const map: Record<string, [string, string]> = {
    mute: [T.surface2, T.textMute],
    accent: [T.accentSoft, T.accentText],
    good: ["rgba(127,179,137,0.16)", "#8FC299"],
    warn: ["rgba(232,162,76,0.16)", "#E8A24C"],
    bad: ["rgba(224,104,92,0.16)", "#E0685C"],
  };
  const [bg, col] = map[tone];
  return <span style={{ padding: "4px 10px", borderRadius: 8, fontFamily: SANS, fontSize: 12, fontWeight: 600, background: bg, color: col, letterSpacing: 0.1, ...style }}>{children}</span>;
}

// ── ScoreDial ────────────────────────────────────────────────────────────
export function ScoreDial({ score = 74, size = 168, label, delta }:
  { score?: number; size?: number; label?: string; delta?: number }) {
  const col = scoreColor(score);
  const stroke = size * 0.085;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  const cx = size / 2;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${rgba(col, 0.5)})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: size * 0.30, fontWeight: 600, color: T.text, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: SANS, fontSize: size * 0.085, fontWeight: 600, color: col, letterSpacing: 0.3, marginTop: 4 }}>{label || scoreLabel(score)}</span>
        {delta != null && (
          <span style={{ fontFamily: MONO, fontSize: size * 0.075, color: T.textMute, marginTop: 2 }}>
            {delta > 0 ? "+" : ""}{delta} this week
          </span>
        )}
      </div>
    </div>
  );
}

// ── MetricBar ────────────────────────────────────────────────────────────
export function MetricBar({ label, value, max = 100, color, icon }:
  { label: string; value: number; max?: number; color?: string; icon?: IconName }) {
  const col = color || T.accent;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <Icon name={icon} size={15} color={T.textMute} />}
        <span style={{ fontFamily: SANS, fontSize: 13, color: T.textMute, flex: 1 }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: T.text }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: T.surface2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: col, borderRadius: 99, transition: "width .8s ease" }} />
      </div>
    </div>
  );
}

// ── MiniRing ─────────────────────────────────────────────────────────────
export function MiniRing({ pct, size = 44, sw = 4, color, children }:
  { pct: number; size?: number; sw?: number; color?: string; children?: React.ReactNode }) {
  const col = color || T.accent;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surface2} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

// ── SectionTitle ─────────────────────────────────────────────────────────
export function SectionTitle({ children, action, onAction }:
  { children: React.ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "4px 2px 12px" }}>
      <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 680, color: T.text, letterSpacing: -0.3 }}>{children}</span>
      {action && <span onClick={onAction} style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: T.accentText, cursor: "pointer" }}>{action}</span>}
    </div>
  );
}

// ── Screen scroller ──────────────────────────────────────────────────────
export function Screen({ children, pad = 20, top = 56, bottom = 110, style = {} }:
  { children: React.ReactNode; pad?: number; top?: number; bottom?: number; style?: React.CSSProperties }) {
  return (
    <div className="glow-scroll" style={{ minHeight: "100%", overflowY: "auto", overflowX: "hidden", padding: `${top}px ${pad}px ${bottom}px`, boxSizing: "border-box", ...style }}>
      {children}
    </div>
  );
}

// ── ProductThumb — realistic product render by type ──────────────────────
export function productType(name: string): "cleanser" | "serum" | "niacinamide" | "moisturizer" | "spf" | "night" | "toner" {
  const n = name.toLowerCase();
  if (n.includes("cleanser") || n.includes("wash") || n.includes("foam")) return "cleanser";
  if (n.includes("niacinamide")) return "niacinamide";
  if (n.includes("vitamin c") || n.includes("serum") || n.includes("essence")) return "serum";
  if (n.includes("spf") || n.includes("shield") || n.includes("sun")) return "spf";
  if (n.includes("night") || n.includes("repair") || n.includes("barrier")) return "night";
  if (n.includes("toner")) return "toner";
  return "moisturizer";
}

// Real product photo by type — crops the brand-free flatlay (public/hero-product.jpg).
// overflow:hidden + borderRadius keep it perfectly inside the box (never overflows).
const THUMB_POS: Record<string, string> = {
  cleanser:    "30% 86%",
  serum:       "8% 30%",
  niacinamide: "2% 66%",
  moisturizer: "44% 48%",
  spf:         "22% 96%",
  night:       "0% 42%",
  toner:       "12% 64%",
};
export function ProductThumb({ name, size = 46, img, contain = true }: { name: string; size?: number; img?: string; contain?: boolean }) {
  if (img) {
    // show the FULL product (objectFit:contain) on a clean white tile so nothing is cut off
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.28, flexShrink: 0, overflow: "hidden", backgroundColor: "#FFFFFF", boxShadow: "inset 0 0 0 1px rgba(60,30,20,0.06)", display: "flex", alignItems: "center", justifyContent: "center", padding: size * 0.06, boxSizing: "border-box" }}>
        <img src={img} alt={name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: contain ? "contain" : "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, flexShrink: 0, overflow: "hidden", backgroundColor: "#F3E7E0", backgroundImage: "url(/hero-product.jpg)", backgroundSize: "240%", backgroundPosition: THUMB_POS[productType(name)] || "20% 60%", backgroundRepeat: "no-repeat", boxShadow: "inset 0 0 0 1px rgba(60,30,20,0.06)" }} />
  );
}

function ProductThumbSVG({ name, size = 46 }: { name: string; size?: number }) {
  const type = productType(name);
  // [bg tile, body color, cap color]
  const palette: Record<string, [string, string, string]> = {
    cleanser:    ["#FEF0EB", "#F2A98D", "#C9633F"],
    serum:       ["#FEF7EB", "#E8B45C", "#B5792C"],
    niacinamide: ["#EBF3FE", "#7FB0E0", "#4E78B0"],
    moisturizer: ["#EDF7EE", "#8FD0A0", "#4E9466"],
    spf:         ["#FEF7EB", "#F2C94C", "#C99A2C"],
    night:       ["#EFF0FD", "#9B92E0", "#6A60B0"],
    toner:       ["#FDEDF0", "#E89BB0", "#C05878"],
  };
  const [bg, body, cap] = palette[type];
  const s = size; const cx = s / 2;
  const dropper = (
    <g>
      <rect x={cx - 6} y={s * 0.34} width="12" height={s * 0.46} rx="4" fill={body} />
      <rect x={cx - 6} y={s * 0.34} width="6" height={s * 0.46} rx="4" fill="rgba(255,255,255,0.30)" />
      <rect x={cx - 5} y={s * 0.22} width="10" height={s * 0.14} rx="3" fill={cap} />
      <rect x={cx - 2.5} y={s * 0.10} width="5" height={s * 0.16} rx="2.5" fill={cap} opacity="0.85" />
    </g>
  );
  const tube = (
    <g>
      <rect x={cx - 7} y={s * 0.26} width="14" height={s * 0.54} rx="6" fill={body} />
      <rect x={cx - 7} y={s * 0.26} width="6" height={s * 0.54} rx="6" fill="rgba(255,255,255,0.28)" />
      <rect x={cx - 4} y={s * 0.80} width="8" height={s * 0.08} rx="2" fill={cap} />
      <rect x={cx - 5} y={s * 0.40} width="10" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
    </g>
  );
  const jar = (
    <g>
      <rect x={cx - 9} y={s * 0.44} width="18" height={s * 0.34} rx="5" fill={body} />
      <rect x={cx - 9} y={s * 0.44} width="7" height={s * 0.34} rx="5" fill="rgba(255,255,255,0.28)" />
      <rect x={cx - 10} y={s * 0.32} width="20" height={s * 0.14} rx="4" fill={cap} />
    </g>
  );
  const bottle = (
    <g>
      <rect x={cx - 7} y={s * 0.34} width="14" height={s * 0.46} rx="5" fill={body} />
      <rect x={cx - 7} y={s * 0.34} width="6" height={s * 0.46} rx="5" fill="rgba(255,255,255,0.28)" />
      <rect x={cx - 4} y={s * 0.18} width="8" height={s * 0.18} rx="3" fill={cap} />
      <rect x={cx - 5.5} y={s * 0.12} width="11" height={s * 0.08} rx="3" fill={cap} opacity="0.8" />
    </g>
  );
  const shape = type === "moisturizer" || type === "night" ? jar
    : type === "serum" || type === "niacinamide" ? dropper
    : type === "toner" ? bottle : tube;
  return (
    <div style={{ width: s, height: s, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ filter: "drop-shadow(0 3px 5px rgba(80,40,20,0.18))" }}>{shape}</svg>
    </div>
  );
}

// ── ProductChip (welcome floating chips) ─────────────────────────────────
export function ProductChip({ label, sub, color }: { label: string; sub: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 16, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(12px)", boxShadow: "0 6px 22px rgba(180,80,40,0.12)", border: "1px solid rgba(255,255,255,0.95)" }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: color, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#2C1F1A", lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontFamily: SANS, fontSize: 10.5, color: "rgba(44,31,26,0.48)", marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── WaterTracker ─────────────────────────────────────────────────────────
export function WaterTracker({ ml, setMl, target = 3000 }:
  { ml: number; setMl: (v: number) => void; target?: number }) {
  const pct = Math.min(100, Math.round((ml / target) * 100));
  const glasses = Math.round(ml / 250);
  const totalGlasses = Math.round(target / 250);
  const done = ml >= target;
  return (
    <div style={{ borderRadius: 22, marginBottom: 14, overflow: "hidden", position: "relative", background: "linear-gradient(145deg, #2A6FDB 0%, #4E8ED4 50%, #6BA8E8 100%)", padding: "15px 18px 13px", boxShadow: "0 12px 32px rgba(42,111,219,0.30)" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: 99, background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -20, left: 40, width: 90, height: 90, borderRadius: 99, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Icon name="drop" size={18} color="rgba(255,255,255,0.9)" fill sw={1.5} />
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1, marginTop: 2 }}>{pct}%</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>Water Intake</div>
          <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 4, lineHeight: 1 }}>
            {ml}<span style={{ fontSize: 13, fontWeight: 500, opacity: 0.75 }}>ml</span>
            <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.55 }}> / {target}ml</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 5 }}>
            {done ? "🎉 Daily goal reached!" : `${totalGlasses - glasses} glasses to go`}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, margin: "11px 0 11px", position: "relative" }}>
        {Array.from({ length: totalGlasses }).map((_, i) => (
          <div key={i} onClick={() => setMl((i + 1) * 250)} style={{ flex: 1, height: 8, borderRadius: 99, cursor: "pointer", transition: "background .25s, transform .15s", background: i < glasses ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)", transform: i === glasses - 1 ? "scaleY(1.3)" : "scaleY(1)" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, position: "relative" }}>
        <button onClick={() => setMl(Math.max(0, ml - 250))} style={{ flex: 1, height: 42, borderRadius: 13, border: "1.5px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.12)", cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fff", backdropFilter: "blur(8px)" }}>-250ml</button>
        <button onClick={() => setMl(Math.min(target, ml + 250))} style={{ flex: 1, height: 42, borderRadius: 13, border: "none", background: "rgba(255,255,255,0.92)", cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 800, color: "#2A6FDB", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>+ Add Glass</button>
      </div>
    </div>
  );
}

// ── TabBar (bottom nav) ──────────────────────────────────────────────────
export function TabBar({ active, onChange }:
  { active: string; onChange: (id: string) => void }) {
  const tabs: [string, string][] = [
    ["home", "Home"], ["scan", "Scan"], ["routine", "Ritual"], ["products", "Shelf"], ["profile", "You"],
  ];
  return (
    <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", bottom: 0, zIndex: 40, paddingBottom: 20, paddingTop: 8, background: `linear-gradient(to top, ${T.bg} 62%, transparent)` }}>
      <div style={{ margin: "0 12px", height: 62, borderRadius: 26, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px) saturate(200%)", WebkitBackdropFilter: "blur(20px) saturate(200%)", border: `1px solid ${T.border}`, boxShadow: "0 6px 24px rgba(60,30,20,0.12)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 4px" }}>
        {tabs.map(([id, lbl]) => {
          const on = active === id;
          if (id === "scan") {
            return (
              <button key={id} onClick={() => onChange(id)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 4px", flex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 17, background: "linear-gradient(140deg, #F5A98D 0%, #F0886A 55%, #E0685C 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -12, boxShadow: `0 0 0 4px #fff, 0 8px 20px ${rgba(T.accent, 0.5)}` }}>
                  <Icon name="scan" size={24} color="#fff" sw={2.2} />
                </div>
                <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: on ? T.accent : T.textFaint }}>{lbl}</span>
              </button>
            );
          }
          return (
            <button key={id} onClick={() => onChange(id)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "5px 10px", flex: 1 }}>
              <div style={{ width: 34, height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, background: on ? T.accentSoft : "transparent", transition: "background .2s" }}>
                <Icon name={id as IconName} size={22} color={on ? T.accent : T.textFaint} sw={on ? 2 : 1.7} />
              </div>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: on ? 700 : 500, color: on ? T.accent : T.textFaint }}>{lbl}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
