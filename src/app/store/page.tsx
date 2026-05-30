"use client";
import { useState, useMemo } from "react";
import { T, SERIF, SANS, MONO, rgba, Icon, Card, Chip, Badge, SectionTitle, ProductThumb, BuyBtn } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";

type Prod = { name: string; brand: string; cat: string; tags: string[]; rating: number; mine: boolean };

const CATALOG: Prod[] = [
  // ── my shelf ──
  { name: "Gentle Gel Cleanser", brand: "Beam Labs", cat: "Cleanser", tags: ["acne", "oil", "daily"], rating: 4.5, mine: true },
  { name: "15% Vitamin C", brand: "Beam Labs", cat: "Serum", tags: ["pigmentation", "dark spots", "brightening", "vitamin c", "glow"], rating: 4.8, mine: true },
  { name: "Quiet Hero 10%", brand: "Lumen", cat: "Serum", tags: ["niacinamide", "oil", "pores", "redness"], rating: 4.7, mine: true },
  { name: "Cloud Cream", brand: "Lumen", cat: "Moisturizer", tags: ["dry", "hydration", "barrier"], rating: 4.6, mine: true },
  { name: "Daily Shield SPF 50", brand: "Solé", cat: "SPF", tags: ["spf", "sun", "pigmentation", "daily"], rating: 4.9, mine: true },
  { name: "Spot Gel", brand: "Beam Labs", cat: "Treatment", tags: ["acne", "spot", "breakout"], rating: 4.3, mine: true },
  // ── discover (not owned) ──
  { name: "Clarifying BHA Toner", brand: "Beam Labs", cat: "Toner", tags: ["acne", "oil", "pores", "bha", "exfoliate"], rating: 4.6, mine: false },
  { name: "Barrier Repair Cream", brand: "Lumen", cat: "Moisturizer", tags: ["dry", "sensitive", "barrier", "redness"], rating: 4.8, mine: false },
  { name: "Brightening Essence", brand: "Solé", cat: "Essence", tags: ["pigmentation", "dark spots", "glow", "brightening"], rating: 4.4, mine: false },
  { name: "Retinol 0.3 Night", brand: "Lumen", cat: "Serum", tags: ["retinol", "ageing", "texture", "fine lines", "night"], rating: 4.7, mine: false },
  { name: "Hydra Plump HA", brand: "Solé", cat: "Serum", tags: ["hyaluronic", "hydration", "dry", "plump"], rating: 4.5, mine: false },
];

const CATS = ["All", "Cleanser", "Serum", "Moisturizer", "SPF", "Treatment"];

// small ingredient knowledge base
const INGREDIENTS: { key: string; name: string; verdict: "good" | "caution" | "avoid"; note: string }[] = [
  { key: "niacinamide", name: "Niacinamide", verdict: "good", note: "Calms redness, controls oil, fades marks. Suits almost everyone." },
  { key: "vitamin c", name: "Vitamin C", verdict: "good", note: "Brightens & fades dark spots. Use in the morning under SPF." },
  { key: "hyaluronic", name: "Hyaluronic Acid", verdict: "good", note: "Deep hydration for plump skin. Apply on damp skin." },
  { key: "salicylic", name: "Salicylic Acid (BHA)", verdict: "caution", note: "Great for oily/acne skin, but can dry you out. Start 2–3×/week." },
  { key: "retinol", name: "Retinol", verdict: "caution", note: "Smooths texture & fine lines. Night only, build up slowly, always SPF next day." },
  { key: "glycolic", name: "Glycolic Acid (AHA)", verdict: "caution", note: "Exfoliates & brightens. Don't pair with retinol the same night." },
  { key: "fragrance", name: "Fragrance / Parfum", verdict: "avoid", note: "A common irritant — best avoided for sensitive or acne-prone skin." },
  { key: "alcohol", name: "Denatured Alcohol", verdict: "avoid", note: "Can strip and dry the skin barrier. Avoid high up in the list." },
  { key: "ceramide", name: "Ceramides", verdict: "good", note: "Rebuild the skin barrier — ideal for dry or sensitive skin." },
  { key: "spf", name: "Zinc / SPF", verdict: "good", note: "Daily SPF is the #1 anti-ageing and anti-pigmentation step." },
];

export default function StorePage() {
  const [tab, setTab] = useState<"My Shelf" | "Discover" | "Scan">("My Shelf");
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [conflict, setConflict] = useState(false);
  const [checker, setChecker] = useState(false);
  const [ingQ, setIngQ] = useState("");

  const shelf = CATALOG.filter(p => p.mine);
  const shown = cat === "All" ? shelf : shelf.filter(s => s.cat === cat);

  // search: match name / brand / category / concern tag
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return { mine: [] as Prod[], rec: [] as Prod[] };
    const match = (p: Prod) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t) || p.cat.toLowerCase().includes(t) || p.tags.some(tag => tag.includes(t) || t.includes(tag));
    const all = CATALOG.filter(match);
    return { mine: all.filter(p => p.mine), rec: all.filter(p => !p.mine) };
  }, [q]);

  const ingResult = useMemo(() => {
    const t = ingQ.trim().toLowerCase();
    if (!t) return null;
    // 1 — exact ingredient match
    const ing = INGREDIENTS.find(i => i.key.includes(t) || t.includes(i.key) || i.name.toLowerCase().includes(t));
    if (ing) return { name: ing.name, verdict: ing.verdict, note: ing.note };
    // 2 — a product / cream in our catalog
    const prod = CATALOG.find(p => p.name.toLowerCase().includes(t) || t.includes(p.name.toLowerCase()) || t.includes(p.brand.toLowerCase()));
    if (prod) {
      const hit = INGREDIENTS.find(i => prod.tags.some(tag => i.key.includes(tag) || tag.includes(i.key)));
      return { name: prod.name, verdict: (hit?.verdict ?? "good") as "good" | "caution" | "avoid", note: `${prod.cat} by ${prod.brand} — formulated for ${prod.tags.slice(0, 3).join(", ")}. ${prod.mine ? "It's already on your shelf, so you're set." : "A good match for those concerns."}` };
    }
    // 3 — an unknown / random cream name that contains a known active
    const kw = INGREDIENTS.find(i => t.includes(i.key) || t.includes(i.name.toLowerCase().split(" ")[0]));
    if (kw) return { name: ingQ, verdict: kw.verdict, note: `We don't stock this exact product, but it lists ${kw.name.toLowerCase()} — ${kw.note}` };
    // 4 — truly unrecognised cream → honest verdict
    return { name: ingQ, verdict: "caution" as const, note: "We couldn't verify this product. Check its label for the main active, patch-test on your jaw for 2 days, and add it slowly. Avoid if it lists fragrance or alcohol high up." };
  }, [ingQ]);

  const vCol: any = { good: "#7FB389", caution: "#E8A24C", avoid: "#E0685C" };
  const vLbl: any = { good: "Good for you", caution: "Use with care", avoid: "Best avoided" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "64px 20px 130px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, color: T.text, margin: "0 0 14px" }}>Shelf</h1>
        <div style={{ display: "flex", gap: 6, background: T.surface2, padding: 4, borderRadius: 14, marginBottom: 16 }}>
          {(["My Shelf", "Discover", "Scan"] as const).map(x => (
            <button key={x} onClick={() => setTab(x)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 650, background: tab === x ? T.surface : "transparent", color: tab === x ? T.text : T.textMute, boxShadow: tab === x ? T.shadow : "none" }}>{x}</button>
          ))}
        </div>

        {tab === "My Shelf" && (
          <>
            {/* conflict + ingredient checker — side by side in a row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button onClick={() => setConflict(true)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, padding: 14, borderRadius: 16, background: "rgba(224,104,92,0.12)", border: "1px solid rgba(224,104,92,0.3)", cursor: "pointer", textAlign: "left" }}>
                <Icon name="warn" size={22} color="#E0685C" />
                <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: "#E0685C", lineHeight: 1.2 }}>1 conflict detected</div>
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.textMute, lineHeight: 1.25 }}>Vitamin C + BHA · tap for info & fix</div>
              </button>
              <button onClick={() => setChecker(true)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, padding: 14, borderRadius: 16, background: T.accentSoft, border: `1px solid ${T.accentDim}`, cursor: "pointer", textAlign: "left" }}>
                <Icon name="info" size={22} color={T.accentText} />
                <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: T.accentText, lineHeight: 1.2 }}>Ingredient checker</div>
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.textMute, lineHeight: 1.25 }}>Ingredient or cream · right for you?</div>
              </button>
            </div>
            <div className="glow-hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -20px 16px", padding: "0 20px 4px" }}>
              {CATS.map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {shown.map((p, i) => (
                <Card key={i} pad={12}>
                  <div style={{ height: 120, borderRadius: 14, marginBottom: 10, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}><ProductThumb name={p.name} size={84} /></div>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: T.textMute, marginTop: 3, marginBottom: 10 }}>{p.brand}</div>
                  <BuyBtn name={p.name} variant="wide" />
                </Card>
              ))}
            </div>
          </>
        )}

        {tab === "Discover" && (
          <>
            <SectionTitle>Recommended for you</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CATALOG.filter(p => !p.mine).map((p, i) => <RecRow key={i} p={p} />)}
            </div>
          </>
        )}

        {tab === "Scan" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 14, background: T.surface, border: `1.5px solid ${q ? T.accent : T.border}`, marginBottom: 16 }}>
              <Icon name="scan" size={20} color={T.textMute} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a product, brand or concern…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text }} />
              {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="close" size={16} color={T.textFaint} /></button>}
            </div>

            {!q && (
              <div style={{ textAlign: "center", padding: "30px 10px", color: T.textMute }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>🔍</div>
                <div style={{ fontFamily: SANS, fontSize: 14 }}>Type a product (e.g. &quot;vitamin c&quot;, &quot;retinol&quot;) or a concern (&quot;acne&quot;, &quot;dry&quot;).</div>
              </div>
            )}

            {q && results.mine.length > 0 && (
              <>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: "#7FB389", textTransform: "uppercase", letterSpacing: 0.6, margin: "4px 0 10px" }}>✓ In your shelf</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>{results.mine.map((p, i) => <RecRow key={i} p={p} owned />)}</div>
              </>
            )}
            {q && (
              <>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.accentText, textTransform: "uppercase", letterSpacing: 0.6, margin: "4px 0 10px" }}>
                  {results.mine.length ? "You might also like" : "Recommended for you"}
                </div>
                {results.rec.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{results.rec.map((p, i) => <RecRow key={i} p={p} />)}</div>
                ) : results.mine.length === 0 ? (
                  <div style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, textAlign: "center", padding: 20 }}>No exact match — try a concern like &quot;acne&quot; or &quot;hydration&quot;.</div>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── CONFLICT sheet ── */}
      {conflict && (
        <Sheet onClose={() => setConflict(false)} title="Conflict check">
          <p style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, lineHeight: 1.55, margin: "0 0 14px" }}>
            A <b style={{ color: T.text }}>conflict</b> means two products in your shelf can cancel each other out or irritate your skin if used together.
          </p>
          <div style={{ padding: 14, borderRadius: 14, background: "rgba(224,104,92,0.1)", border: "1px solid rgba(224,104,92,0.3)", marginBottom: 14 }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: "#E0685C", marginBottom: 4 }}>Vitamin C + BHA toner</div>
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: T.text, lineHeight: 1.5 }}>Using both together can reduce Vitamin C&apos;s effect and sting. </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, background: "rgba(127,179,137,0.12)", border: "1px solid rgba(127,179,137,0.35)" }}>
            <Icon name="check" size={20} color="#7FB389" sw={2.4} />
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: T.text }}><b>Fix:</b> Use Vitamin C in the <b>morning</b>, BHA toner at <b>night</b>.</div>
          </div>
        </Sheet>
      )}

      {/* ── INGREDIENT CHECKER sheet ── */}
      {checker && (
        <Sheet onClose={() => setChecker(false)} title="Ingredient checker">
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: T.textMute, lineHeight: 1.5, margin: "0 0 14px" }}>
            Type any ingredient <b>or a cream name</b> — even one you&apos;re unsure about — and I&apos;ll tell you if it&apos;s right or wrong for your skin.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 14, background: T.surface, border: `1.5px solid ${ingQ ? T.accent : T.border}`, marginBottom: 16 }}>
            <Icon name="info" size={18} color={T.textMute} />
            <input autoFocus value={ingQ} onChange={e => setIngQ(e.target.value)} placeholder="e.g. niacinamide, retinol, or a cream name" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text }} />
          </div>
          {ingResult && (
            <div style={{ padding: 16, borderRadius: 16, background: `${vCol[ingResult.verdict]}1a`, border: `1.5px solid ${vCol[ingResult.verdict]}66` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: vCol[ingResult.verdict] }} />
                <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text, flex: 1 }}>{ingResult.name}</span>
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

function RecRow({ p, owned }: { p: Prod; owned?: boolean }) {
  return (
    <Card pad={12} style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}><ProductThumb name={p.name} size={56} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 650, color: T.text }}>{p.name}</div>
        <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute, marginTop: 2 }}>{p.brand} · {p.cat}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}><Icon name="star" size={14} color="#D9B86A" fill /><span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: T.text }}>{p.rating}</span></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        {owned && <Badge tone="good">Owned</Badge>}
        <BuyBtn name={p.name} variant="pill" />
      </div>
    </Card>
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
