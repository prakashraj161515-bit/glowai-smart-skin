"use client";
import { useEffect, useRef, useState } from "react";
import { T, SANS, MONO, Icon, rgba } from "./ui";

// ── format review counts: 12840 -> 12.8k ──────────────────────────
export function fmtCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}

// ── localStorage user ratings (per ASIN) ──────────────────────────
const RKEY = "velmora_user_ratings";
function readRatings(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(RKEY) || "{}"); } catch { return {}; }
}
export function getUserRating(asin: string): number {
  if (typeof window === "undefined") return 0;
  return readRatings()[asin] || 0;
}
export function saveUserRating(asin: string, val: number) {
  const r = readRatings(); r[asin] = val;
  localStorage.setItem(RKEY, JSON.stringify(r));
}

// blends the user's rating into the base average (so it "counts")
export function blendedRating(base: number, reviews: number, userRating: number): { rating: number; reviews: number } {
  if (!userRating) return { rating: base, reviews };
  const total = base * reviews + userRating;
  return { rating: Math.round((total / (reviews + 1)) * 10) / 10, reviews: reviews + 1 };
}

// ── Star display (read-only) ──────────────────────────────────────
export function Stars({ value, size = 12, color = "#F0A52C" }: { value: number; size?: number; color?: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, lineHeight: 0 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const full = value >= i - 0.25;
        return <Icon key={i} name="star" size={size} color={full ? color : "#E2D6CE"} fill={full} sw={1.4} />;
      })}
    </span>
  );
}

// ── Live price (lazy-fetched + cached, IntersectionObserver) ───────
const priceCache = new Map<string, string | null>();

export function LivePrice({ asin, big = false }: { asin: string; big?: boolean }) {
  const [price, setPrice] = useState<string | null | undefined>(priceCache.get(asin));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (priceCache.has(asin)) { setPrice(priceCache.get(asin)); return; }
    const el = ref.current; if (!el) return;
    let done = false;
    const obs = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !done) {
        done = true; obs.disconnect();
        try {
          const r = await fetch(`/api/price?asin=${asin}`);
          const d = await r.json();
          priceCache.set(asin, d.price || null);
          setPrice(d.price || null);
        } catch { priceCache.set(asin, null); setPrice(null); }
      }
    }, { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [asin]);

  const fs = big ? 17 : 14;
  if (price === undefined) {
    return <span ref={ref} style={{ display: "inline-block", width: 54, height: fs, borderRadius: 5, background: "linear-gradient(90deg,#efe6e0,#f7f0eb,#efe6e0)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite" }} />;
  }
  if (price === null) {
    return <span ref={ref} style={{ fontFamily: SANS, fontSize: fs - 2, fontWeight: 600, color: T.accentText }}>View price ›</span>;
  }
  return <span ref={ref} style={{ fontFamily: MONO, fontSize: fs, fontWeight: 700, color: T.text }}>{price}</span>;
}

// ── Interactive "rate this" stars ─────────────────────────────────
export function RateStars({ asin, onRated }: { asin: string; onRated?: (v: number) => void }) {
  const [val, setVal] = useState(0);
  const [hover, setHover] = useState(0);
  useEffect(() => { setVal(getUserRating(asin)); }, [asin]);

  const pick = (v: number) => { setVal(v); saveUserRating(asin, v); onRated?.(v); };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const active = (hover || val) >= i;
        return (
          <button key={i}
            onClick={e => { e.stopPropagation(); pick(i); }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
            title={`Rate ${i} star${i > 1 ? "s" : ""}`}
            style={{ background: "none", border: "none", padding: 1, cursor: "pointer", lineHeight: 0, transition: "transform .1s", transform: active ? "scale(1.08)" : "scale(1)" }}>
            <Icon name="star" size={15} color={active ? "#F0A52C" : "#D8CCC4"} fill={active} sw={1.4} />
          </button>
        );
      })}
    </div>
  );
}
