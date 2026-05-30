"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Badge, PrimaryBtn } from "@/glow/ui";
import { pricing, detectCountry, Plan } from "@/glow/diet";
import { getLoyalty, consumeDiscount, DISCOUNT, Loyalty } from "@/glow/loyalty";

const FEATS = ["Unlimited AI skin scans", "Full AI routine builder", "Ask Aura — unlimited", "Trend analysis & diary insights", "PDF skin reports"];

export default function PremiumPage() {
  const router = useRouter();
  const [country, setCountry] = useState("Global");
  const [plan, setPlan] = useState<Plan["id"]>("yearly");
  const [loyal, setLoyal] = useState<Loyalty>({ streak: 0, progress: 0, banked: false, daysLeft: 30 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    setCountry(localStorage.getItem("velmora_country") || detectCountry());
    setLoyal(getLoyalty());
  }, []);

  const pr = pricing(country);
  const selected = pr.plans.find(p => p.id === plan) || pr.plans[0];
  const hasDiscount = loyal.banked;
  const finalAmount = hasDiscount ? selected.amount * (1 - DISCOUNT) : selected.amount;

  const upgrade = () => {
    consumeDiscount();
    setDone(true);
    setTimeout(() => router.push("/"), 1200);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 30, textAlign: "center" }}>
        <div className="animate-spinpulse" style={{ width: 80, height: 80, borderRadius: 99, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 40px ${rgba(T.accent, 0.45)}` }}><Icon name="check" size={38} color="#fff" sw={2.6} /></div>
        <h1 style={{ fontFamily: SERIF, fontSize: 32, color: T.text, margin: 0 }}>You&apos;re Pro! ✦</h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: T.textMute, margin: 0 }}>{hasDiscount ? "Your 10% streak reward was applied. " : ""}A fresh 30-day streak starts now.</p>
      </div>
    );
  }

  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", background: T.bg, padding: "92px 20px 40px", position: "relative" }}>
      <button onClick={() => router.back()} style={{ position: "fixed", top: 56, right: 18, zIndex: 5, width: 34, height: 34, borderRadius: 99, background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="close" size={18} color={T.textMute} /></button>

      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: T.accent, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 30px ${rgba(T.accent, 0.4)}` }}><Icon name="spark" size={32} color="#241712" fill /></div>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, color: T.text, margin: "0 0 8px", lineHeight: 1.05, fontWeight: 400 }}>Unlock your full<br />skin potential</h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: T.textMute, margin: 0 }}>Everything you need to actually see results.</p>
      </div>

      {/* streak / discount banner */}
      {hasDiscount ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, marginBottom: 16, background: "linear-gradient(120deg, rgba(127,179,137,0.18), rgba(127,179,137,0.06))", border: "1px solid rgba(127,179,137,0.35)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(127,179,137,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎉</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 800, color: "#5FAD72" }}>30-day streak reward unlocked!</div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.textMute }}>10% OFF applied to your plan below</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, marginBottom: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(232,162,76,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="flame" size={20} color="#E8A24C" fill /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: T.text }}>Login {loyal.daysLeft} more days for 10% OFF</div>
            <div style={{ height: 6, borderRadius: 99, background: T.surface2, marginTop: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${(loyal.progress / 30) * 100}%`, background: "#E8A24C", borderRadius: 99 }} /></div>
          </div>
        </div>
      )}

      <Card style={{ marginBottom: 18 }}>
        {FEATS.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
            <Icon name="check" size={20} color={T.accentText} sw={2.4} />
            <span style={{ fontFamily: SANS, fontSize: 15, color: T.text }}>{f}</span>
          </div>
        ))}
      </Card>

      {/* 3 plans */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {pr.plans.map(p => {
          const sel = plan === p.id;
          const off = hasDiscount ? p.amount * (1 - DISCOUNT) : p.amount;
          return (
            <button key={p.id} onClick={() => setPlan(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, cursor: "pointer", textAlign: "left", background: sel ? T.accentSoft : T.surface, border: `1.5px solid ${sel ? T.accent : T.border}` }}>
              <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${sel ? T.accent : T.borderHi}`, background: sel ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <Icon name="check" size={13} color="#241712" sw={2.8} />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text }}>{p.label}</span>{p.best && <Badge tone="accent">Best</Badge>}</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: T.textMute }}>{p.sub}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {hasDiscount && <div style={{ fontFamily: MONO, fontSize: 12, color: T.textFaint, textDecoration: "line-through" }}>{pr.fmt(Math.round(p.amount))}{p.period}</div>}
                <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: hasDiscount ? "#5FAD72" : T.text }}>{pr.fmt(Math.round(off))}{p.period}</div>
              </div>
            </button>
          );
        })}
      </div>

      <PrimaryBtn onClick={upgrade}>
        {hasDiscount ? `Get Pro — ${pr.fmt(Math.round(finalAmount))} (10% off)` : `Start Pro — ${pr.fmt(Math.round(finalAmount))}`}
      </PrimaryBtn>
      <div style={{ textAlign: "center", marginTop: 14, fontFamily: SANS, fontSize: 13, color: T.textFaint }}>7-day free trial · cancel anytime</div>
    </div>
  );
}
