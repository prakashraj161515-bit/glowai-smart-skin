"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card } from "@/glow/ui";
import AppTabBar from "@/glow/AppTabBar";

// anime-style avatars (DiceBear) — male & female, switchable
const AV = (style: string, seed: string) => `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=ffd9c0,ffe4d6,e8f0fe,edf7ee`;
const AVATARS = [
  AV("adventurer", "Kai"), AV("adventurer", "Leo"), AV("adventurer", "Max"), AV("micah", "Aron"),
  AV("lorelei", "Maya"), AV("lorelei", "Aria"), AV("lorelei", "Luna"), AV("adventurer", "Zoe"),
];

const FAQS = [
  ["How does the AI scan work?", "Cream analyses your selfie with on-device + cloud AI to score acne, oil, pigmentation, hydration and more — then builds advice from it."],
  ["Is my photo stored?", "Your scan stays on your device. We only sync your scores so your progress follows you across devices."],
  ["How often should I scan?", "Once a week is ideal — your diet and routine refresh after each new scan."],
  ["What is Aura?", "Aura is your in-app AI skin coach. Ask it anything about your skin, products, or diet."],
  ["How do I cancel Premium?", "Manage or cancel anytime from Subscription & Billing — no questions asked."],
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState("Maya");
  const [userPic, setUserPic] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [scanCount, setScanCount] = useState(18);
  const [streak, setStreak] = useState(12);
  const [score, setScore] = useState(74);
  const [editing, setEditing] = useState(false);
  const [notif, setNotif] = useState(true);
  const [help, setHelp] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [showAv, setShowAv] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const n = localStorage.getItem("velmora_user_name"); if (n) setUserName(n);
    const p = localStorage.getItem("velmora_user_pic"); if (p) setUserPic(p);
    setIsPremium(localStorage.getItem("velmora_is_premium") === "true");
    setNotif(localStorage.getItem("velmora_notif") !== "off");
    const h = localStorage.getItem("velmora_history"); if (h) { try { setScanCount(JSON.parse(h).length); } catch {} }
    const a = localStorage.getItem("velmora_analysis"); if (a) { try { setScore(JSON.parse(a).score || 74); } catch {} }
    const s = localStorage.getItem("velmora_streak"); if (s) setStreak(parseInt(s) || 12);
    if (status === "authenticated" && session?.user) { setUserName(session.user.name || "Maya"); if (session.user.image) setUserPic(session.user.image); }
    // guest with no picture → give a default anime avatar
    if (!localStorage.getItem("velmora_user_pic") && !session?.user?.image) {
      setUserPic(AVATARS[0]); localStorage.setItem("velmora_user_pic", AVATARS[0]);
    }
  }, [status, session]);

  const pickAvatar = (url: string) => { setUserPic(url); localStorage.setItem("velmora_user_pic", url); setShowAv(false); };

  const saveName = () => { setEditing(false); localStorage.setItem("velmora_user_name", userName.trim() || "Maya"); };
  const toggleNotif = () => { const v = !notif; setNotif(v); localStorage.setItem("velmora_notif", v ? "on" : "off"); };
  const onPic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onloadend = () => { const b = r.result as string; setUserPic(b); localStorage.setItem("velmora_user_pic", b); }; r.readAsDataURL(f);
  };

  const initial = (userName || "M")[0].toUpperCase();
  const rows: [any, string, () => void][] = [
    ["arrowUp", "My Progress", () => router.push("/progress")],
    ["routine", "My Ritual", () => router.push("/routine")],
    ["edit", "Skin Diary", () => router.push("/diet")],
    ["lock", "Subscription & Billing", () => router.push("/premium")],
    ["info", "Help & FAQ", () => setHelp(true)],
  ];

  // colored icon tiles per menu row [bg, color]
  const ICONC: Record<string, [string, string]> = {
    "My Progress": ["#EDF7EE", "#5FAD72"],
    "My Ritual": ["#FEF0EB", "#F0886A"],
    "Skin Diary": ["#EFF0FD", "#8B85E0"],
    "Subscription & Billing": ["#FEF7EB", "#D9A040"],
    "Help & FAQ": ["#EAF3FB", "#5B8DEF"],
  };
  const statData: [any, string, string, string][] = [
    ["flame", String(streak), "Day streak", "#F0886A"],
    ["scan", String(scanCount), "Total scans", "#5B8DEF"],
    ["spark", String(score), "Skin score", "#5FAD72"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", paddingBottom: 130 }}>
        {/* gradient hero */}
        <div style={{ background: "linear-gradient(165deg, #F9DDD0 0%, #F5C7B4 55%, #FAF8F6 100%)", padding: "60px 20px 64px", position: "relative" }}>
          <button onClick={() => setEditing(true)} style={{ position: "absolute", top: 56, right: 20, width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.65)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.8)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="edit" size={18} color="#2C1F1A" /></button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div onClick={() => setShowAv(true)} style={{ width: 78, height: 78, borderRadius: 99, background: "#fff", padding: 3, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, cursor: "pointer", position: "relative", boxShadow: "0 8px 22px rgba(196,78,40,0.25)" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 99, overflow: "hidden", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {userPic ? <img src={userPic} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontFamily: SERIF, fontSize: 30, color: "#241712" }}>{initial}</span>}
              </div>
              <div style={{ position: "absolute", bottom: 3, left: 3, right: 3, background: "rgba(0,0,0,0.4)", textAlign: "center", fontSize: 9, color: "#fff", padding: "2px 0", fontFamily: SANS, fontWeight: 600, borderRadius: "0 0 99px 99px" }}>edit</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPic} style={{ display: "none" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <input autoFocus value={userName} onChange={e => setUserName(e.target.value)} onBlur={saveName} onKeyDown={e => e.key === "Enter" && saveName()} style={{ fontFamily: SERIF, fontSize: 28, color: "#2C1F1A", background: "transparent", border: "none", borderBottom: "2px solid #C44E28", outline: "none", width: "100%" }} />
              ) : (
                <div onClick={() => setEditing(true)} style={{ fontFamily: SERIF, fontSize: 30, color: "#2C1F1A", lineHeight: 1.05, cursor: "pointer" }}>{userName}</div>
              )}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "5px 12px", borderRadius: 99, background: isPremium ? "linear-gradient(135deg,#F5C76B,#E8A24C)" : "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", boxShadow: "0 3px 10px rgba(200,90,50,0.15)" }}>
                <Icon name={isPremium ? "crown" : "spark"} size={13} color={isPremium ? "#fff" : "#C44E28"} fill />
                <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 800, color: isPremium ? "#fff" : "#C44E28" }}>{isPremium ? "Pro Member" : "Free Plan"}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 20px", marginTop: -34, position: "relative", zIndex: 2 }}>
          {/* stats — colorful with icons */}
          <Card style={{ display: "flex", justifyContent: "space-around", marginBottom: 18, boxShadow: "0 12px 32px rgba(60,30,20,0.12)" }}>
            {statData.map(([ic, v, l, col], i) => (
              <div key={i} style={{ display: "flex", flex: 1, alignItems: "center" }}>
                {i > 0 && <div style={{ width: 1, height: 48, background: T.border }} />}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: rgba(col, 0.14), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}><Icon name={ic} size={16} color={col} fill={ic === "flame" || ic === "spark"} /></div>
                  <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: T.text, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.textMute, marginTop: 3 }}>{l}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* menu — colored icon tiles */}
          <Card pad={6}>
            {rows.slice(0, 3).map(([ic, label, fn], i) => {
              const [bg, col] = ICONC[label] || [T.surface2, T.textMute];
              return (
                <div key={i} onClick={fn} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", cursor: "pointer", borderTop: i ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={18} color={col} /></div>
                  <span style={{ flex: 1, fontFamily: SANS, fontSize: 15.5, fontWeight: 550, color: T.text }}>{label}</span>
                  <Icon name="chev" size={16} color={T.textFaint} />
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", borderTop: `1px solid ${T.border}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: "#FEF7EB", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="bell" size={18} color="#E8A24C" /></div>
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 15.5, fontWeight: 550, color: T.text }}>Notifications</span>
              <button onClick={toggleNotif} style={{ width: 46, height: 27, borderRadius: 99, border: "none", cursor: "pointer", background: notif ? T.accent : T.borderHi, position: "relative", transition: "background .2s" }}>
                <span style={{ position: "absolute", top: 3, left: notif ? 22 : 3, width: 21, height: 21, borderRadius: 99, background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
            {rows.slice(3).map(([ic, label, fn], i) => {
              const [bg, col] = ICONC[label] || [T.surface2, T.textMute];
              return (
                <div key={i} onClick={fn} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", cursor: "pointer", borderTop: `1px solid ${T.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={18} color={col} /></div>
                  <span style={{ flex: 1, fontFamily: SANS, fontSize: 15.5, fontWeight: 550, color: T.text }}>{label}</span>
                  <Icon name="chev" size={16} color={T.textFaint} />
                </div>
              );
            })}
          </Card>

        <button onClick={() => setConfirmOut(true)} style={{ width: "100%", marginTop: 14, height: 52, borderRadius: 16, cursor: "pointer", background: "rgba(224,104,92,0.08)", border: "1.5px solid rgba(224,104,92,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Icon name="arrowR" size={18} color="#E0685C" sw={2} />
          <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: "#E0685C" }}>Sign Out</span>
        </button>
        </div>
      </div>

      {/* sign-out confirmation */}
      {confirmOut && (
        <div onClick={() => setConfirmOut(false)} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(20,12,8,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28, maxWidth: 430, margin: "0 auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: T.bg, borderRadius: 24, padding: 24, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "fadeUp .25s ease" }}>
            <div style={{ width: 56, height: 56, borderRadius: 99, background: "rgba(224,104,92,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Icon name="arrowR" size={26} color="#E0685C" sw={2} /></div>
            <h3 style={{ fontFamily: SERIF, fontSize: 24, color: T.text, margin: "0 0 6px" }}>Sign out?</h3>
            <p style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, margin: "0 0 20px" }}>You&apos;ll need to sign in again to use Cream.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmOut(false)} style={{ flex: 1, height: 50, borderRadius: 14, cursor: "pointer", background: T.surface, border: `1.5px solid ${T.borderHi}`, fontFamily: SANS, fontSize: 15, fontWeight: 700, color: T.text }}>Cancel</button>
              <button onClick={() => { localStorage.removeItem("velmora_onboarding_complete"); signOut({ callbackUrl: "/" }); }} style={{ flex: 1, height: 50, borderRadius: 14, cursor: "pointer", background: "#E0685C", border: "none", fontFamily: SANS, fontSize: 15, fontWeight: 700, color: "#fff" }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Help & FAQ sheet */}
      {/* avatar picker */}
      {showAv && (
        <div onClick={() => setShowAv(false)} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(20,12,8,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: T.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: "20px 20px 36px", animation: "fadeUp .3s ease" }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: T.borderHi, margin: "0 auto 16px" }} />
            <h2 style={{ fontFamily: SERIF, fontSize: 24, color: T.text, margin: "0 0 4px" }}>Choose your avatar</h2>
            <p style={{ fontFamily: SANS, fontSize: 13, color: T.textMute, margin: "0 0 16px" }}>Pick a character — or upload your own photo.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              {AVATARS.map((a, i) => (
                <button key={i} onClick={() => pickAvatar(a)} style={{ aspectRatio: "1", borderRadius: 16, overflow: "hidden", cursor: "pointer", padding: 0, background: T.surface2, border: `2px solid ${userPic === a ? T.accent : "transparent"}` }}>
                  <img src={a} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
            <button onClick={() => { setShowAv(false); fileRef.current?.click(); }} style={{ width: "100%", height: 50, borderRadius: 14, cursor: "pointer", background: T.surface, border: `1.5px solid ${T.borderHi}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: SANS, fontSize: 15, fontWeight: 650, color: T.text }}>
              <Icon name="camera" size={18} color={T.text} /> Upload my photo
            </button>
          </div>
        </div>
      )}

      {help && (
        <div onClick={() => setHelp(false)} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(20,12,8,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
          <div onClick={e => e.stopPropagation()} className="glow-scroll" style={{ width: "100%", maxHeight: "78vh", overflowY: "auto", background: T.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: "20px 20px 36px", animation: "fadeUp .3s ease" }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: T.borderHi, margin: "0 auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 26, color: T.text, margin: 0 }}>Help &amp; FAQ</h2>
              <button onClick={() => setHelp(false)} style={{ width: 32, height: 32, borderRadius: 99, background: T.surface2, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="close" size={16} color={T.textMute} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {FAQS.map(([q, a], i) => (
                <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14 }}>
                  <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: T.text, marginBottom: 4 }}>{q}</div>
                  <div style={{ fontFamily: SANS, fontSize: 13.5, color: T.textMute, lineHeight: 1.5 }}>{a}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, borderRadius: 16, background: T.accentSoft, border: `1px solid ${T.accentDim}` }}>
              <Icon name="spark" size={18} color={T.accentText} fill />
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: T.text }}>Still stuck? Ask Aura, your AI coach.</span>
              <button onClick={() => router.push("/coach")} style={{ padding: "8px 14px", borderRadius: 99, border: "none", cursor: "pointer", background: T.accent, color: "#241712", fontFamily: SANS, fontSize: 13, fontWeight: 700 }}>Ask Aura</button>
            </div>
          </div>
        </div>
      )}

      <AppTabBar active="profile" />
    </div>
  );
}
