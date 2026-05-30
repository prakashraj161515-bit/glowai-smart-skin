"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Badge, PrimaryBtn } from "@/glow/ui";
import { pricing, detectCountry } from "@/glow/diet";

const FEATS = ["Unlimited AI skin scans", "Full AI routine builder", "Ask Aura — unlimited", "Trend analysis & diary insights", "PDF skin reports"];

export default function PremiumPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [country, setCountry] = useState("Global");
  useEffect(() => { setCountry(localStorage.getItem("velmora_country") || detectCountry()); }, []);
  const price = pricing(country);
  const upgrade = () => { localStorage.setItem("velmora_is_premium", "true"); router.push("/"); };

  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", background: T.bg, padding: "92px 20px 40px", position: "relative" }}>
      <button onClick={() => router.back()} style={{ position: "fixed", top: 56, right: 18, zIndex: 5, width: 34, height: 34, borderRadius: 99, background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="close" size={18} color={T.textMute} /></button>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: T.accent, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 30px ${rgba(T.accent, 0.4)}` }}><Icon name="spark" size={32} color="#241712" fill /></div>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, color: T.text, margin: "0 0 8px", lineHeight: 1.05, fontWeight: 400 }}>Unlock your full<br />skin potential</h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: T.textMute, margin: 0 }}>Everything you need to actually see results.</p>
      </div>
      <Card style={{ marginBottom: 18 }}>
        {FEATS.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
            <Icon name="check" size={20} color={T.accentText} sw={2.4} />
            <span style={{ fontFamily: SANS, fontSize: 15, color: T.text }}>{f}</span>
          </div>
        ))}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {([["annual", "Annual", price.annual, price.save, true], ["monthly", "Monthly", price.monthly, "Billed monthly", false]] as const).map(([id, ti, pr, sub, best]) => (
          <button key={id} onClick={() => setPlan(id as any)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, cursor: "pointer", textAlign: "left", background: plan === id ? T.accentSoft : T.surface, border: `1.5px solid ${plan === id ? T.accent : T.border}`, position: "relative" }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${plan === id ? T.accent : T.borderHi}`, background: plan === id ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{plan === id && <Icon name="check" size={13} color="#241712" sw={2.8} />}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text }}>{ti}</span>{best && <Badge tone="accent">Best</Badge>}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: T.textMute }}>{sub}</div>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, color: T.text }}>{pr}</span>
          </button>
        ))}
      </div>
      <PrimaryBtn onClick={upgrade}>Start 7-Day Free Trial</PrimaryBtn>
      <div style={{ textAlign: "center", marginTop: 14, fontFamily: SANS, fontSize: 13, color: T.textFaint }}>Restore Purchases · Terms · Privacy</div>
    </div>
  );
}
