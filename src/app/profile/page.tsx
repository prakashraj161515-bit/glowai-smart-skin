"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, Icon, Card } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState("Maya");
  const [userPic, setUserPic] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [scanCount, setScanCount] = useState(18);
  const [streak, setStreak] = useState(12);
  const [score, setScore] = useState(74);

  useEffect(() => {
    const n = localStorage.getItem("velmora_user_name"); if (n) setUserName(n);
    const p = localStorage.getItem("velmora_user_pic"); if (p) setUserPic(p);
    setIsPremium(localStorage.getItem("velmora_is_premium") === "true");
    const h = localStorage.getItem("velmora_history"); if (h) { try { setScanCount(JSON.parse(h).length); } catch {} }
    const a = localStorage.getItem("velmora_analysis"); if (a) { try { setScore(JSON.parse(a).score || 74); } catch {} }
    const s = localStorage.getItem("velmora_streak"); if (s) setStreak(parseInt(s) || 12);
    if (status === "authenticated" && session?.user) { setUserName(session.user.name || "Maya"); setUserPic(session.user.image || ""); }
  }, [status, session]);

  const rows: [any, string, () => void][] = [
    ["arrowUp", "My Progress", () => router.push("/progress")],
    ["routine", "My Routine", () => router.push("/routine")],
    ["edit", "Skin Diary", () => router.push("/diet")],
    ["bell", "Notifications", () => {}],
    ["lock", "Subscription & Billing", () => router.push("/premium")],
    ["info", "Help & FAQ", () => {}],
  ];
  const initial = (userName || "M")[0].toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", padding: "108px 20px 130px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 99, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {userPic ? <img src={userPic} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontFamily: SERIF, fontSize: 30, color: "#241712" }}>{initial}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SERIF, fontSize: 28, color: T.text, lineHeight: 1 }}>{userName}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, padding: "4px 10px", borderRadius: 8, background: T.accentSoft }}>
              <Icon name="spark" size={13} color={T.accentText} fill />
              <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: T.accentText }}>{isPremium ? "Pro Member" : "Free Plan"}</span>
            </div>
          </div>
          <button style={{ width: 38, height: 38, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="edit" size={19} color={T.text} /></button>
        </div>

        <Card style={{ display: "flex", justifyContent: "space-around", marginBottom: 18 }}>
          {[[String(streak), "Day streak"], [String(scanCount), "Total scans"], [String(score), "Skin score"]].map(([v, l], i) => (
            <div key={i} style={{ display: "flex", flex: 1, alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 40, background: T.border }} />}
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color: T.text }}>{v}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: T.textMute, marginTop: 2 }}>{l}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card pad={6}>
          {rows.map(([ic, label, fn], i) => (
            <div key={i} onClick={fn} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 12px", cursor: "pointer", borderTop: i ? `1px solid ${T.border}` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={18} color={T.textMute} /></div>
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 15.5, color: T.text }}>{label}</span>
              <Icon name="chev" size={16} color={T.textFaint} />
            </div>
          ))}
        </Card>

        <button onClick={() => { signOut({ callbackUrl: "/" }); localStorage.removeItem("velmora_onboarding_complete"); }} style={{ width: "100%", marginTop: 14, height: 52, borderRadius: 16, cursor: "pointer", background: "rgba(224,104,92,0.08)", border: "1.5px solid rgba(224,104,92,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Icon name="arrowR" size={18} color="#E0685C" sw={2} />
          <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: "#E0685C" }}>Sign Out</span>
        </button>
      </div>
      <AppTabBar active="profile" />
    </div>
  );
}
