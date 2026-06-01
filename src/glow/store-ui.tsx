"use client";
import { useEffect, useRef, useState } from "react";
import { T, SANS, MONO, Icon } from "./ui";

// ── format review counts: 12840 -> 12.8k ──────────────────────────
export function fmtCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}

// ── per-device user ratings (localStorage) ────────────────────────
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

// ── GLOBAL ratings (shared via /api/ratings + Vercel KV) ───────────
export type GAgg = Record<string, { sum: number; count: number }>;
export async function fetchGlobalRatings(): Promise<GAgg> {
  try {
    const r = await fetch("/api/ratings");
    const d = await r.json();
    return d.ratings || {};
  } catch { return {}; }
}
export async function submitRating(asin: string, rating: number, prev: number) {
  try {
    await fetch("/api/ratings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asin, rating, prev }),
    });
  } catch {}
}

// combine the seed (Amazon-like) rating with the app's community ratings
export function blendedRating(base: number, baseReviews: number, agg?: { sum: number; count: number }): { rating: number; reviews: number } {
  if (!agg || agg.count === 0) return { rating: base, reviews: baseReviews };
  const sum = base * baseReviews + agg.sum;
  const count = baseReviews + agg.count;
  return { rating: Math.round((sum / count) * 10) / 10, reviews: count };
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

// ── price cache (string + numeric for sorting) ────────────────────
const priceStr = new Map<string, string | null>();
export const priceNum = new Map<string, number | null>();

function parsePrice(s: string | null): number | null {
  if (!s) return null;
  const n = parseInt(s.replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? null : n;
}

// ── visitor's local Amazon marketplace (detected once, cached) ─────
let marketPromise: Promise<{ domain: string; symbol: string }> | null = null;
function getMarket(): Promise<{ domain: string; symbol: string }> {
  if (marketPromise) return marketPromise;
  marketPromise = (async () => {
    try {
      const cached = sessionStorage.getItem("velmora_market");
      if (cached) return JSON.parse(cached);
      const r = await fetch("/api/geo");
      const g = await r.json();
      const m = { domain: g.amazonDomain || "www.amazon.in", symbol: g.currencySymbol || "₹" };
      sessionStorage.setItem("velmora_market", JSON.stringify(m));
      return m;
    } catch { return { domain: "www.amazon.in", symbol: "₹" }; }
  })();
  return marketPromise;
}

export async function ensurePrice(asin: string): Promise<number | null> {
  if (priceNum.has(asin)) return priceNum.get(asin)!;
  try {
    const mkt = await getMarket();
    const r = await fetch(`/api/price?asin=${asin}&domain=${encodeURIComponent(mkt.domain)}&symbol=${encodeURIComponent(mkt.symbol)}`);
    const d = await r.json();
    priceStr.set(asin, d.price || null);
    const num = parsePrice(d.price || null);
    priceNum.set(asin, num);
    return num;
  } catch {
    priceStr.set(asin, null); priceNum.set(asin, null); return null;
  }
}

// ── Live price (lazy-fetched + cached, IntersectionObserver) ───────
export function LivePrice({ asin, big = false }: { asin: string; big?: boolean }) {
  const [price, setPrice] = useState<string | null | undefined>(priceStr.get(asin));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (priceStr.has(asin)) { setPrice(priceStr.get(asin)); return; }
    const el = ref.current; if (!el) return;
    let done = false;
    const obs = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !done) {
        done = true; obs.disconnect();
        await ensurePrice(asin);
        setPrice(priceStr.get(asin) ?? null);
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

// ── Interactive "rate this" — pick stars, then SUBMIT once ────────
export function RateStars({ asin, onRated }: { asin: string; onRated?: (v: number, prev: number) => void }) {
  const [submitted, setSubmitted] = useState(0); // confirmed rating
  const [pending, setPending] = useState(0);     // selected but not yet submitted
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => { setSubmitted(getUserRating(asin)); }, [asin]);

  const sel = hover || pending || submitted;
  const dirty = pending > 0 && pending !== submitted;

  const submit = async () => {
    if (!pending || busy) return;
    const prev = getUserRating(asin);
    setBusy(true);
    saveUserRating(asin, pending);
    await submitRating(asin, pending, prev);     // share with everyone
    setSubmitted(pending); setPending(0); setBusy(false);
    setJustSaved(true); setTimeout(() => setJustSaved(false), 1600);
    onRated?.(pending, prev);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 6 }}>
      {/* left: label OR submit button */}
      {dirty ? (
        <button onClick={e => { e.stopPropagation(); submit(); }} disabled={busy}
          style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 11px", borderRadius: 99, border: "none", cursor: "pointer", background: T.accent, color: "#241712", fontFamily: SANS, fontSize: 11, fontWeight: 800, boxShadow: `0 3px 9px ${T.accent}55` }}>
          {busy ? "Saving…" : "Submit"}
        </button>
      ) : (
        <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: submitted ? "#5FA572" : T.textMute, flexShrink: 0, whiteSpace: "nowrap" }}>
          {justSaved ? "Thanks ✓" : submitted ? "You rated ✓" : "Rate it"}
        </span>
      )}
      {/* right: the stars */}
      <div style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
        {[1, 2, 3, 4, 5].map(i => {
          const active = sel >= i;
          return (
            <button key={i}
              onClick={e => { e.stopPropagation(); setPending(i); }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
              title={`${i} star${i > 1 ? "s" : ""}`}
              style={{ background: "none", border: "none", padding: 1, cursor: "pointer", lineHeight: 0, transition: "transform .1s", transform: active ? "scale(1.08)" : "scale(1)" }}>
              <Icon name="star" size={16} color={active ? "#F0A52C" : "#D8CCC4"} fill={active} sw={1.4} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
