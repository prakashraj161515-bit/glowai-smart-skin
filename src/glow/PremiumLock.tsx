"use client";
import { useRouter } from "next/navigation";
import { T, SERIF, SANS, Icon } from "./ui";

// Full-screen / card lock shown when a Free user hits a Premium-only feature.
export function PremiumGate({ title, sub, onClose }: { title: string; sub: string; onClose?: () => void }) {
  const router = useRouter();
  return (
    <div style={{ padding: "40px 22px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 18px", background: "linear-gradient(135deg, #F5C76B, #E8A24C)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(232,162,76,0.4)" }}>
        <Icon name="crown" size={34} color="#3a2a10" fill />
      </div>
      <h2 style={{ fontFamily: SERIF, fontSize: 26, color: T.text, margin: "0 0 8px" }}>{title}</h2>
      <p style={{ fontFamily: SANS, fontSize: 14.5, color: T.textMute, lineHeight: 1.55, margin: "0 auto 22px", maxWidth: 300 }}>{sub}</p>
      <button onClick={() => router.push("/premium")} style={{ width: "100%", maxWidth: 320, height: 54, borderRadius: 16, border: "none", cursor: "pointer", background: T.accent, color: "#241712", fontFamily: SANS, fontSize: 16, fontWeight: 700, boxShadow: `0 8px 22px ${T.accent}55`, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="crown" size={19} color="#241712" fill /> Unlock with Premium
      </button>
      {onClose && (
        <button onClick={onClose} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: T.textMute }}>Maybe later</button>
      )}
    </div>
  );
}

// Small inline "Premium" pill badge to mark gated features in lists.
export function PremiumBadge({ small }: { small?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: small ? "2px 7px" : "3px 9px", borderRadius: 99, background: "linear-gradient(135deg,#F5C76B,#E8A24C)", color: "#fff", fontFamily: SANS, fontSize: small ? 9 : 10, fontWeight: 800, letterSpacing: 0.3, textTransform: "uppercase" }}>
      <Icon name="crown" size={small ? 9 : 11} color="#fff" fill />Premium
    </span>
  );
}
