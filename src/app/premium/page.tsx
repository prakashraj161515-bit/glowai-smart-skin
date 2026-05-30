"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Badge, PrimaryBtn } from "@/glow/ui";
import { pricing, detectCountry, Plan } from "@/glow/diet";
import { tickLoyalty, consumeDiscount, getLoyalty } from "@/glow/loyalty";

const FEATS = ["Unlimited AI skin scans", "Full AI routine builder", "Ask Aura — unlimited", "Trend analysis & diary insights", "PDF skin reports"];

export default function PremiumPage() {
  const router = useRouter();
  const [country, setCountry] = useState("Global");
  const [sel, setSel] = useState<"monthly" | "sixmo" | "yearly">("yearly");
  const [loy, setLoy] = useState({ streak: 0, progress: 0, banked: false, daysLeft: 30, pct: 0 });
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setCountry(localStorage.getItem("velmora_country") || detectCountry());
    setLoy(tickLoyalty());
    setMounted(true);
  }, []);

  const price = pricing(country);
  const unlocked = loy.banked && loy.pct > 0;
  const disc = unlocked ? loy.pct : 0;
  const finalAmt = (amt: number) => Math.round(amt * (1 - disc / 100));

  const buy = () => {
    consumeDiscount();
    localStorage.setItem("velmora_is_premium", "true");
    setLoy(getLoyalty());
    setDone(true);
    setTimeout(() => router.push("/"), 1200);
  };

  const PlanList = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {price.plans.map((p: Plan) => {
        const on = sel === p.id;
        const original = price.fmt(p.amount);
        const discounted = price.fmt(finalAmt(p.amount));
        return (
          <button key={p.id} onClick={() => setSel(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, cursor: "pointer", textAlign: "left", background: on ? T.accentSoft : T.surface, border: `1.5px solid ${on ? T.accent : T.border}`, position: "relative" }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${on ? T.accent : T.borderHi}`, background: on ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on && <Icon name="check" size={13} color="#241712" sw={2.8} />}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text }}>{p.label}</span>{p.best && <Badge tone="accent">Best value</Badge>}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: T.textMute }}>{p.sub}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {disc > 0 ? (
                <>
                  <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: "#4E9466" }}>{discounted}<span style={{ fontSize: 11, color: T.textMute }}>{p.period}</span></div>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: T.textFaint, textDecoration: "line-through" }}>{original}</div>
                </>
              ) : (
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: T.text }}>{original}<span style={{ fontSize: 11, color: T.textMute }}>{p.period}</span></div>
              )}
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

      {/* 2 — LOYALTY OFFER (with explainer so users understand it) */}
      {unlocked ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, marginBottom: 14, background: "linear-gradient(120deg, rgba(127,179,137,0.18), rgba(127,179,137,0.06))", border: "1.5px solid rgba(127,179,137,0.4)" }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "#7FB389", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 16px rgba(127,179,137,0.45)" }}><Icon name="flame" size={22} color="#fff" fill /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: "#4E9466" }}>🎉 {loy.pct}% loyalty reward applied!</div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute }}>{loy.streak}-day login streak · already in the prices above</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 16, borderRadius: 18, marginBottom: 14, background: T.surface, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="flame" size={16} color={T.accentText} fill />
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: T.text, flex: 1 }}>Loyalty reward</span>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: T.accentText }}>{loy.progress}/30 days</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: T.surface2, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${(loy.progress / 30) * 100}%`, background: T.accent, borderRadius: 99, transition: "width .5s" }} />
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute, lineHeight: 1.5 }}>
            🔥 Log in daily! A <b>30-day streak</b> unlocks <b>10% off</b> any plan — and the longer your streak, the bigger the discount (≈13% at 200 days). It stays saved until you use it.
          </div>
        </div>
      )}

      {/* 3 — PREMIUM FEATURES */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: T.accentText, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>What you get</div>
        {FEATS.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
            <Icon name="check" size={20} color={T.accentText} sw={2.4} />
            <span style={{ fontFamily: SANS, fontSize: 15, color: T.text }}>{f}</span>
          </div>
        ))}
      </Card>

      <PrimaryBtn onClick={buy} style={done ? { background: "#7FB389" } : undefined}>
        {done ? "Welcome to Pro ✓" : disc > 0 ? `Subscribe — ${disc}% off` : "Start 7-Day Free Trial"}
      </PrimaryBtn>
      <div style={{ textAlign: "center", marginTop: 14, fontFamily: SANS, fontSize: 13, color: T.textFaint }}>Restore Purchases · Terms · Privacy</div>

      {!unlocked && (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button onClick={() => { import("@/glow/loyalty").then(m => { m.simulateStreak(30); setLoy(getLoyalty()); }); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, color: T.textFaint, textDecoration: "underline" }}>
            (demo: preview a 30-day-streak reward)
          </button>
        </div>
      )}
    </div>
  );
}
