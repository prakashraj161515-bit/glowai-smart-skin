"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Badge, PrimaryBtn } from "@/glow/ui";
import { pricing, Plan } from "@/glow/diet";

// each feature: [premium benefit, what free gets]
const FEATS: [string, string][] = [
  ["Unlimited daily face scans", "Free: 1 scan / day"],
  ["Unlimited chats", "Free: 3 chats / day"],
  ["Product Scanner", "Premium only"],
  ["Ingredient Checker", "Premium only"],
  ["Full progress history (all-time)", "Free: weekly only"],
  ["Unlimited Skin Diary", "Free: last 7 entries"],
];

export default function PremiumPage() {
  const router = useRouter();
  const [sel, setSel] = useState<"monthly" | "yearly">("yearly");
  const [done, setDone] = useState(false);
  const [already, setAlready] = useState(false);
  const [until, setUntil] = useState<number>(0);

  const price = pricing();

  useEffect(() => {
    setAlready(localStorage.getItem("velmora_is_premium") === "true");
    setUntil(parseInt(localStorage.getItem("velmora_premium_until") || "0") || 0);
  }, []);

  // Qonversion product IDs — create these EXACT ids in Qonversion (mapped to the
  // matching Google Play Console subscription products) for real payments.
  const PRODUCT_IDS = { monthly: "cream_premium_monthly", yearly: "cream_premium_yearly" } as const;

  const [busy, setBusy] = useState(false);

  const buy = async () => {
    if (busy) return;
    const n: any = (typeof window !== "undefined") ? (window as any).CreamNative : null;

    // Outside the app (plain browser) there is no Play Store to charge — never
    // hand out Premium for free here; tell the user to use the app.
    if (!n?.isNative) {
      alert("Please open the Cream app to subscribe to Premium.");
      return;
    }

    setBusy(true);
    let res: any = null;
    try {
      // Real Google Play Billing via Qonversion — opens the store payment sheet.
      res = await n.call("purchases.purchase", { productId: PRODUCT_IDS[sel] });
    } catch (e: any) {
      // User cancelled or the payment failed → DO NOT unlock Premium.
      setBusy(false);
      alert("Billing Error: " + (e?.message || String(e)));
      return;
    }
    setBusy(false);
    // Only a genuinely completed purchase unlocks Premium.
    if (!res || res.success !== true) return;

    // Prefer the real subscription expiry from the entitlement; fall back to plan length.
    let end = 0;
    try {
      const ents = res.entitlements || {};
      for (const k in ents) {
        const e = ents[k];
        if (e?.active && e?.expiresAt) { const t = Date.parse(e.expiresAt); if (t) end = Math.max(end, t); }
      }
    } catch {}
    if (!end) end = Date.now() + (sel === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000;

    localStorage.setItem("velmora_is_premium", "true");
    localStorage.setItem("velmora_premium_plan", sel);
    localStorage.setItem("velmora_premium_until", String(end));
    fetch("/api/user/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPremium: true, premiumPlan: sel, premiumUntil: end }) }).catch(() => {});
    setDone(true);
    setTimeout(() => router.push("/"), 1200);
  };

  // Restore a previous subscription (reinstall / new device). Google requires this.
  const restore = async () => {
    const n: any = (typeof window !== "undefined") ? (window as any).CreamNative : null;
    if (!n?.isNative) { alert("Please open the Cream app to restore purchases."); return; }
    try {
      const res = await n.call("purchases.restore", {});
      const ents = res?.entitlements || {};
      let end = 0, active = false;
      for (const k in ents) {
        const e = ents[k];
        if (e?.active) { active = true; if (e?.expiresAt) { const t = Date.parse(e.expiresAt); if (t) end = Math.max(end, t); } }
      }
      if (!active) { alert("No active subscription found to restore."); return; }
      if (!end) end = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("velmora_is_premium", "true");
      localStorage.setItem("velmora_premium_until", String(end));
      fetch("/api/user/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPremium: true, premiumUntil: end }) }).catch(() => {});
      alert("Premium restored ✅");
      router.push("/");
    } catch (e) {
      alert("Couldn't restore right now. Please try again.");
    }
  };

  const fmtDate = (ms: number) => ms ? new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

  const PlanList = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {price.plans.map((p: Plan) => {
        const on = sel === p.id;
        const original = price.fmt(p.amount);
        return (
          <button key={p.id} onClick={() => setSel(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, cursor: "pointer", textAlign: "left", background: on ? T.accentSoft : T.surface, border: `1.5px solid ${on ? T.accent : T.border}`, position: "relative" }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${on ? T.accent : T.borderHi}`, background: on ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on && <Icon name="check" size={13} color="#241712" sw={2.8} />}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text }}>{p.label}</span>{p.best && <Badge tone="accent">Best value</Badge>}{p.id === "yearly" && <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, color: "#fff", background: "#5FA572", padding: "2px 8px", borderRadius: 99, letterSpacing: 0.3 }}>🎁 3-DAY FREE TRIAL</span>}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: T.textMute }}>{p.id === "yearly" ? "Free for 3 days, then billed yearly" : p.sub}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: T.text }}>{original}<span style={{ fontSize: 11, color: T.textMute }}>{p.period}</span></div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", background: T.bg, padding: "88px 20px 40px", position: "relative" }}>
      <button onClick={() => router.back()} style={{ position: "fixed", top: 56, left: 14, zIndex: 5, width: 36, height: 36, borderRadius: 11, background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: T.shadow }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
      <button onClick={() => router.back()} style={{ position: "fixed", top: 56, right: 18, zIndex: 5, width: 34, height: 34, borderRadius: 99, background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="close" size={18} color={T.textMute} /></button>

      {/* header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #F5C76B, #E8A24C)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(232,162,76,0.45)" }}><Icon name="crown" size={32} color="#3a2a10" fill /></div>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, color: T.text, margin: "0 0 8px", lineHeight: 1.05, fontWeight: 400 }}>Go Premium</h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: T.textMute, margin: 0 }}>Choose a plan to unlock everything.</p>
      </div>

      {/* 1 — PAYMENT / PLANS (top) */}
      {PlanList}

      <div style={{ height: 16 }} />

      {/* 2 — PREMIUM FEATURES */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.accentText, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Free vs Premium</div>
        {FEATS.map(([benefit, free], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: i ? `1px solid ${T.border}` : "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: 99, background: "rgba(127,179,137,0.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="check" size={15} color="#5FA572" sw={2.6} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 650, color: T.text, lineHeight: 1.2 }}>{benefit}</div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.textFaint, marginTop: 1 }}>{free}</div>
            </div>
          </div>
        ))}
      </Card>

      {already ? (
        <Card style={{ textAlign: "center", padding: "18px 16px" }}>
          <div style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 800, color: "#5FA572", marginBottom: 4 }}>✓ You're on Premium</div>
          {until > 0 && <div style={{ fontFamily: SANS, fontSize: 14, color: T.text, marginBottom: 6 }}>Active until <b>{fmtDate(until)}</b></div>}
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute, lineHeight: 1.5 }}>Your plan stays active for the full term and can&apos;t be cancelled mid-term. To stop auto-renewal, manage your subscription in the Play Store before it ends.</div>
        </Card>
      ) : (
        <>
          <PrimaryBtn onClick={buy} style={done ? { background: "#7FB389" } : undefined}>
            {done ? "Welcome to Pro ✓" : sel === "yearly" ? "Start 3-Day Free Trial" : "Get Premium"}
          </PrimaryBtn>
          {!done && sel === "yearly" && (
            <div style={{ textAlign: "center", marginTop: 8, fontFamily: SANS, fontSize: 12.5, color: T.textMute }}>
              Free for 3 days · then {price.fmt((price.plans.find((x: Plan) => x.id === "yearly")?.amount) || 0)}/yr · cancel anytime
            </div>
          )}
        </>
      )}
      <div style={{ textAlign: "center", marginTop: 14, fontFamily: SANS, fontSize: 13, color: T.textFaint }}><span onClick={restore} style={{ cursor: "pointer", textDecoration: "underline" }}>Restore Purchases</span> · Terms · Privacy</div>
    </div>
  );
}
