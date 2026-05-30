"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { T, SERIF, SANS, MONO, rgba, Icon, Badge, ProductThumb, BuyBtn } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";
import { ALL_PRODUCTS, AffProduct, productImg } from "@/glow/affiliate";
import { Stars, LivePrice, RateStars, fmtCount, blendedRating, getUserRating, fetchGlobalRatings, ensurePrice, priceNum, GAgg } from "@/glow/store-ui";
import { searchProducts } from "@/glow/search";

// internal category value -> friendly label
const CAT_LABEL: Record<string, string> = { Cleanser: "Facewash" };
const catLabel = (c: string) => CAT_LABEL[c] || c;

const CATS = ["All", "Cleanser", "Serum", "Moisturizer", "SPF", "Toner", "Night Cream", "Treatment"] as const;
const CAT_EMOJI: Record<string, string> = {
  All: "✨", Cleanser: "🧼", Serum: "💧", Moisturizer: "🧴", SPF: "☀️", Toner: "🌸", "Night Cream": "🌙", Treatment: "💊",
};
type Sort = "popular" | "rated" | "priceLow" | "priceHigh";
const SORTS: { id: Sort; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "rated", label: "Top Rated" },
  { id: "priceLow", label: "Price ↑" },
  { id: "priceHigh", label: "Price ↓" },
];

const INGREDIENTS: { key: string; name: string; verdict: "good" | "caution" | "avoid"; note: string }[] = [
  { key: "niacinamide", name: "Niacinamide", verdict: "good", note: "Calms redness, controls oil, fades marks. Suits almost everyone." },
  { key: "vitamin c", name: "Vitamin C", verdict: "good", note: "Brightens & fades dark spots. Use in the morning under SPF." },
  { key: "hyaluronic", name: "Hyaluronic Acid", verdict: "good", note: "Deep hydration for plump skin. Apply on damp skin." },
  { key: "ceramide", name: "Ceramides", verdict: "good", note: "Rebuild the skin barrier — ideal for dry or sensitive skin." },
  { key: "salicylic", name: "Salicylic Acid (BHA)", verdict: "caution", note: "Great for oily/acne skin, but can dry you out. Start 2–3×/week." },
  { key: "glycolic", name: "Glycolic Acid (AHA)", verdict: "caution", note: "Exfoliates & brightens. Don't pair with retinol the same night." },
  { key: "retinol", name: "Retinol", verdict: "caution", note: "Smooths texture & fine lines. Night only, build up slowly, always SPF next day." },
  { key: "fragrance", name: "Fragrance / Parfum", verdict: "avoid", note: "A common irritant — best avoided for sensitive or acne-prone skin." },
  { key: "alcohol", name: "Denatured Alcohol", verdict: "avoid", note: "Can strip and dry the skin barrier. Avoid high up in the list." },
];

export default function StorePage() {
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [conflict, setConflict] = useState(false);
  const [checker, setChecker] = useState(false);
  const [ingQ, setIngQ] = useState("");
  const [global, setGlobal] = useState<GAgg>({});
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick(x => x + 1), []);

  // load global community ratings
  useEffect(() => { fetchGlobalRatings().then(setGlobal); }, []);

  // base filter (category + fuzzy search)
  const filtered = useMemo(() => {
    let list = cat === "All" ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.cat === cat);
    if (q.trim()) {
      const scored = searchProducts(list, q);
      return scored.map(x => x.p); // already relevance-sorted
    }
    return list;
  }, [cat, q]);

  // when sorting by price, make sure prices are fetched
  useEffect(() => {
    if (sort === "priceLow" || sort === "priceHigh") {
      let cancelled = false;
      Promise.all(filtered.slice(0, 60).map(p => ensurePrice(p.asin))).then(() => { if (!cancelled) bump(); });
      return () => { cancelled = true; };
    }
  }, [sort, filtered, bump]);

  const shown = useMemo(() => {
    const list = [...filtered];
    const searching = q.trim().length > 0;
    if (sort === "rated") {
      list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    } else if (sort === "priceLow" || sort === "priceHigh") {
      const pn = (a: AffProduct) => { const v = priceNum.get(a.asin); return v == null ? (sort === "priceLow" ? Infinity : -Infinity) : v; };
      list.sort((a, b) => sort === "priceLow" ? pn(a) - pn(b) : pn(b) - pn(a));
    } else if (!searching) {
      // popular: bestsellers first, then rating
      list.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0) || b.rating - a.rating);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, q, tick]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: ALL_PRODUCTS.length };
    for (const p of ALL_PRODUCTS) c[p.cat] = (c[p.cat] || 0) + 1;
    return c;
  }, []);

  const ingResult = useMemo(() => {
    const t = ingQ.trim().toLowerCase();
    if (!t) return null;
    const ing = INGREDIENTS.find(i => i.key.includes(t) || t.includes(i.key) || i.name.toLowerCase().includes(t));
    if (ing) return { name: ing.name, verdict: ing.verdict, note: ing.note };
    const prod = ALL_PRODUCTS.find(p => p.name.toLowerCase().includes(t) || t.includes(p.brand.toLowerCase()));
    if (prod) {
      const hit = INGREDIENTS.find(i => prod.tags.some(tag => i.key.includes(tag) || tag.includes(i.key)));
      return { name: prod.name, verdict: (hit?.verdict ?? "good") as "good" | "caution" | "avoid", note: `${catLabel(prod.cat)} by ${prod.brand} — for ${prod.tags.slice(0, 3).join(", ")}. A good match for those concerns.` };
    }
    const kw = INGREDIENTS.find(i => t.includes(i.key) || t.includes(i.name.toLowerCase().split(" ")[0]));
    if (kw) return { name: ingQ, verdict: kw.verdict, note: `We don't stock this exact product, but it lists ${kw.name.toLowerCase()} — ${kw.note}` };
    return { name: ingQ, verdict: "caution" as const, note: "We couldn't verify this product. Check its label for the main active, patch-test for 2 days, and add it slowly." };
  }, [ingQ]);

  const vCol: any = { good: "#7FB389", caution: "#E8A24C", avoid: "#E0685C" };
  const vLbl: any = { good: "Good for you", caution: "Use with care", avoid: "Best avoided" };

  // on rate: optimistic update of the shared aggregate
  const onRated = useCallback((asin: string, val: number, prev: number) => {
    setGlobal(g => {
      const cur = g[asin] || { sum: 0, count: 0 };
      const next = prev ? { sum: cur.sum + val - prev, count: cur.count } : { sum: cur.sum + val, count: cur.count + 1 };
      return { ...g, [asin]: next };
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "60px 0 130px" }}>
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4 }}>
            <h1 style={{ fontFamily: SERIF, fontSize: 34, color: T.text, margin: 0 }}>Shop Skincare</h1>
            <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: T.accentText, paddingBottom: 6 }}>{ALL_PRODUCTS.length} products</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: T.textMute, margin: "0 0 14px" }}>Real products · live prices · rated by users</p>

          {/* search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 15, background: T.surface, border: `1.5px solid ${q ? T.accent : T.border}`, marginBottom: 14, boxShadow: T.shadow }}>
            <Icon name="scan" size={19} color={T.textMute} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search — facewash, vitamin c, oily…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text }} />
            {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="close" size={16} color={T.textFaint} /></button>}
          </div>

          {/* conflict + ingredient checker */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={() => setConflict(true)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, padding: "11px 12px", borderRadius: 14, background: "rgba(224,104,92,0.1)", border: "1px solid rgba(224,104,92,0.28)", cursor: "pointer", textAlign: "left" }}>
              <Icon name="warn" size={19} color="#E0685C" />
              <div><div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: "#E0685C", lineHeight: 1.1 }}>Conflict check</div><div style={{ fontFamily: SANS, fontSize: 10.5, color: T.textMute }}>What not to mix</div></div>
            </button>
            <button onClick={() => setChecker(true)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, padding: "11px 12px", borderRadius: 14, background: T.accentSoft, border: `1px solid ${T.accentDim}`, cursor: "pointer", textAlign: "left" }}>
              <Icon name="info" size={19} color={T.accentText} />
              <div><div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: T.accentText, lineHeight: 1.1 }}>Ingredient check</div><div style={{ fontFamily: SANS, fontSize: 10.5, color: T.textMute }}>Right for you?</div></div>
            </button>
          </div>
        </div>

        {/* category pills */}
        <div className="glow-hscroll" style={{ display: "flex", gap: 9, overflowX: "auto", padding: "0 20px 4px", marginBottom: 12 }}>
          {CATS.map(c => {
            const active = cat === c;
            return (
              <button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 15px", borderRadius: 99, cursor: "pointer", border: `1.5px solid ${active ? T.accent : T.border}`, background: active ? T.accent : T.surface, color: active ? "#241712" : T.textMute, fontFamily: SANS, fontSize: 13.5, fontWeight: 650, whiteSpace: "nowrap", boxShadow: active ? `0 4px 12px ${rgba(T.accent, 0.3)}` : "none", transition: "all .2s" }}>
                <span>{CAT_EMOJI[c]}</span>{catLabel(c)}
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, opacity: 0.7 }}>{counts[c] || 0}</span>
              </button>
            );
          })}
        </div>

        {/* sort pills */}
        <div className="glow-hscroll" style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", padding: "0 20px 4px", marginBottom: 14 }}>
          <Icon name="grid" size={15} color={T.textFaint} />
          {SORTS.map(s => {
            const active = sort === s.id;
            return (
              <button key={s.id} onClick={() => setSort(s.id)} style={{ flexShrink: 0, padding: "6px 13px", borderRadius: 99, cursor: "pointer", border: "none", background: active ? T.text : T.surface2, color: active ? "#fff" : T.textMute, fontFamily: SANS, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", transition: "all .2s" }}>{s.label}</button>
            );
          })}
        </div>

        {/* product grid */}
        <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
          {shown.map((p, i) => <ProductCard key={p.asin} p={p} idx={i} agg={global[p.asin]} onRated={onRated} />)}
        </div>
        {shown.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 20px", color: T.textMute }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🔍</div>
            <div style={{ fontFamily: SANS, fontSize: 14 }}>No products found. Try another search or category.</div>
          </div>
        )}
      </div>

      {/* CONFLICT sheet */}
      {conflict && (
        <Sheet onClose={() => setConflict(false)} title="Conflict check">
          <p style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, lineHeight: 1.55, margin: "0 0 14px" }}>
            A <b style={{ color: T.text }}>conflict</b> is when two actives cancel each other out or irritate skin if used together. Common ones to avoid mixing:
          </p>
          {[
            ["Vitamin C + AHA/BHA", "Lowers Vitamin C's effect & can sting. → Vitamin C in AM, exfoliant at night."],
            ["Retinol + AHA/BHA", "Too much exfoliation = irritation. → Use on alternate nights."],
            ["Retinol + Vitamin C", "Work at different pH. → Vitamin C morning, retinol night."],
            ["Niacinamide + anything", "Plays well with all — no conflict ✓"],
          ].map(([t, d], i) => (
            <div key={i} style={{ padding: 13, borderRadius: 13, background: i === 3 ? "rgba(127,179,137,0.1)" : "rgba(224,104,92,0.08)", border: `1px solid ${i === 3 ? "rgba(127,179,137,0.3)" : "rgba(224,104,92,0.25)"}`, marginBottom: 10 }}>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: i === 3 ? "#5FA572" : "#E0685C", marginBottom: 3 }}>{t}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: T.text, lineHeight: 1.45 }}>{d}</div>
            </div>
          ))}
        </Sheet>
      )}

      {/* INGREDIENT CHECKER sheet */}
      {checker && (
        <Sheet onClose={() => setChecker(false)} title="Ingredient checker">
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: T.textMute, lineHeight: 1.5, margin: "0 0 14px" }}>
            Type any ingredient <b>or a cream name</b> and I&apos;ll tell you if it&apos;s right or wrong for your skin.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 14, background: T.surface, border: `1.5px solid ${ingQ ? T.accent : T.border}`, marginBottom: 16 }}>
            <Icon name="info" size={18} color={T.textMute} />
            <input autoFocus value={ingQ} onChange={e => setIngQ(e.target.value)} placeholder="e.g. niacinamide, retinol, or a cream name" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text }} />
          </div>
          {ingResult && (
            <div style={{ padding: 16, borderRadius: 16, background: `${vCol[ingResult.verdict]}1a`, border: `1.5px solid ${vCol[ingResult.verdict]}66` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: vCol[ingResult.verdict] }} />
                <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: T.text, flex: 1 }}>{ingResult.name}</span>
                <Badge tone={ingResult.verdict === "good" ? "good" : ingResult.verdict === "caution" ? "warn" : "bad"}>{vLbl[ingResult.verdict]}</Badge>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, color: T.textMute, lineHeight: 1.5 }}>{ingResult.note}</div>
            </div>
          )}
          {!ingQ && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["niacinamide", "retinol", "vitamin c", "salicylic", "fragrance"].map(s => (
                <button key={s} onClick={() => setIngQ(s)} style={{ padding: "8px 13px", borderRadius: 99, border: `1.5px solid ${T.border}`, background: "transparent", cursor: "pointer", fontFamily: SANS, fontSize: 13, color: T.textMute }}>{s}</button>
              ))}
            </div>
          )}
        </Sheet>
      )}

      <AppTabBar active="products" />
    </div>
  );
}

// ── Product card with gradient outline ────────────────────────────
function ProductCard({ p, idx, agg, onRated }: { p: AffProduct; idx: number; agg?: { sum: number; count: number }; onRated: (asin: string, v: number, prev: number) => void }) {
  const [ur, setUr] = useState(0);
  useEffect(() => { setUr(getUserRating(p.asin)); }, [p.asin]);
  const { rating, reviews } = blendedRating(p.rating, p.reviews, agg);
  // gradient outline — gold for bestsellers, warm accent otherwise
  const ring = p.bestseller
    ? "linear-gradient(160deg, #F5C76B, rgba(245,166,35,0.25) 45%, rgba(60,30,20,0.06))"
    : "linear-gradient(160deg, rgba(240,136,106,0.4), rgba(240,136,106,0.06) 45%, rgba(60,30,20,0.05))";
  return (
    <div className="card-in" style={{ animationDelay: `${Math.min(idx, 12) * 30}ms`, borderRadius: 21, padding: 1.5, background: ring, boxShadow: "0 5px 18px rgba(60,30,20,0.07)" }}>
      <div style={{ borderRadius: 19.5, overflow: "hidden", background: T.surface, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* full product photo (not cropped) */}
        <div style={{ position: "relative", height: 152, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxSizing: "border-box" }}>
          <img src={productImg(p.name)} alt={p.name} loading="lazy" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          {p.bestseller && (
            <div style={{ position: "absolute", top: 9, left: 0, display: "flex", alignItems: "center", gap: 4, padding: "4px 10px 4px 8px", background: "linear-gradient(135deg,#F5A623,#E8821C)", color: "#fff", fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: 0.4, borderRadius: "0 99px 99px 0", boxShadow: "0 3px 8px rgba(232,130,28,0.4)", textTransform: "uppercase" }}>
              <Icon name="flame" size={11} color="#fff" fill />Bestseller
            </div>
          )}
        </div>
        {/* body */}
        <div style={{ padding: "10px 11px 12px", display: "flex", flexDirection: "column", flex: 1, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: T.accentText, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>{p.brand}</div>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 32 }}>{p.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
            <Stars value={rating} size={12} />
            <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: T.text }}>{rating}</span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, color: T.textFaint }}>({fmtCount(reviews)})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9, marginBottom: 9 }}>
            <LivePrice asin={p.asin} />
            <BuyBtn name={p.name} variant="pill" />
          </div>
          <div style={{ marginTop: "auto", paddingTop: 8, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: SANS, fontSize: 10.5, color: ur ? "#5FA572" : T.textMute, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>{ur ? "You rated ✓" : "Rate it"}</span>
            <RateStars asin={p.asin} onRated={(v, prev) => { setUr(v); onRated(p.asin, v, prev); }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(20,12,8,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
      <div onClick={e => e.stopPropagation()} className="glow-scroll" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto", background: T.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: "20px 20px 36px", animation: "fadeUp .3s ease" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: T.borderHi, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, color: T.text, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 99, background: T.surface2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="close" size={16} color={T.textMute} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
