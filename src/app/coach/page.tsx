"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, SANS, rgba, Icon } from "@/glow/ui";

// quick-action chips — always available for follow-ups
const ACTIONS = [
  { label: "What's wrong with my face?", q: "Based on my latest face scan, what are my main skin problems right now and why?" },
  { label: "How do I fix it?", q: "Give me a simple step-by-step plan to fix my main skin concern from my scan." },
  { label: "Which cream should I use?", q: "Which type of cream or product should I use for my skin concern, and when to apply it?" },
  { label: "Best diet for me?", q: "What foods should I eat and avoid to improve my skin, based on my scan?" },
];

type Msg = { who: "ai" | "me" | "typing"; text?: string; actions?: boolean };

export default function CoachPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([{ who: "ai", text: "Hi, I'm Aura ✦ your personal skin coach. I've loaded your latest scan. Ask me anything — about your skin, a product, a diet, or a condition — and I'll keep it short and clear.", actions: true }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs]);

  // auto-send if arrived with ?q=
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) { window.history.replaceState({}, "", "/coach"); setTimeout(() => send(q), 300); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scanContext = () => {
    try {
      const s = JSON.parse(localStorage.getItem("velmora_analysis") || "{}");
      if (!s || typeof s.score !== "number") return "";
      const parts = [
        `overall score ${s.score}/100`,
        `acne ${s.acne}`, `oiliness ${s.oil}`, `pigmentation ${s.pigmentation}`,
        s.hydration != null ? `hydration ${s.hydration}` : "",
        s.redness != null ? `redness ${s.redness}` : "",
        s.topConcern ? `biggest concern: ${s.topConcern}` : "",
      ].filter(Boolean);
      return "User's latest AI face scan — " + parts.join(", ") + ". When they ask about their face/skin, answer using THIS data. If they ask about a condition, explain it, its causes, and a clear cure/fix.";
    } catch { return ""; }
  };

  const send = async (q?: string) => {
    const question = (q ?? text).trim();
    if (!question || busy) return;
    setBusy(true);
    setText("");
    setMsgs(m => [...m, { who: "me", text: question }, { who: "typing" }]);
    try {
      const r = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, context: scanContext() }) });
      const d = await r.json();
      let reply = d.text || d.reply;
      if (!reply) throw new Error(d.error || "empty");
      reply = reply.replace(/\*\*/g, "").replace(/^[\-*]\s+/gm, "• ").trim();
      setMsgs(m => m.filter(x => x.who !== "typing").concat({ who: "ai", text: reply, actions: true }));
    } catch {
      // graceful, still-helpful fallback that uses scan data locally
      let s: any = {}; try { s = JSON.parse(localStorage.getItem("velmora_analysis") || "{}"); } catch {}
      const top = s.topConcern || (s.oil > 50 ? "excess oil" : s.acne > 35 ? "breakouts" : s.pigmentation > 35 ? "dark spots" : "mild dehydration");
      setMsgs(m => m.filter(x => x.who !== "typing").concat({ who: "ai", text: `Based on your scan, your main concern looks like ${top}. Keep a simple routine — gentle cleanser, a targeted serum, moisturizer and daily SPF — stay hydrated, and avoid fried/sugary foods. Want a product or diet tip for it?`, actions: true }));
    } finally { setBusy(false); }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg, position: "relative", overflow: "hidden" }}>
      {/* soft ambient glows for wow (kept behind, very subtle) */}
      <div style={{ position: "absolute", top: -140, left: -60, width: 280, height: 280, borderRadius: 99, background: "radial-gradient(circle, rgba(240,136,106,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 120, right: -80, width: 240, height: 240, borderRadius: 99, background: "radial-gradient(circle, rgba(139,133,224,0.10) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", padding: "54px 16px 10px", position: "relative", zIndex: 2 }}>
        <button onClick={() => router.push("/")} style={{ width: 36, height: 36, borderRadius: 11, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {/* glowing avatar */}
          <div style={{ width: 38, height: 38, borderRadius: 13, background: `linear-gradient(135deg, #F5A98D, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${rgba(T.accent, 0.45)}` }}>
            <Icon name="spark" size={20} color="#fff" fill />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: SERIF, fontSize: 20, color: T.text, lineHeight: 1 }}>Aura</span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, color: "#8FC299", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><span className="animate-blink" style={{ width: 6, height: 6, borderRadius: 99, background: "#8FC299" }} />online · knows your scan</span>
          </div>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* messages */}
      <div ref={scroller} className="glow-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 18px", position: "relative", zIndex: 2 }}>
        {msgs.map((m, i) => {
          if (m.who === "typing") return (
            <div key={i} style={{ display: "flex", gap: 5, padding: "12px 16px", borderRadius: 18, background: T.surface, width: "fit-content", marginBottom: 12, border: `1px solid ${T.border}` }}>
              {[0, 1, 2].map(d => <span key={d} className="animate-blink" style={{ width: 7, height: 7, borderRadius: 99, background: T.textFaint, animationDelay: `${d * 0.2}s` }} />)}
            </div>
          );
          const me = m.who === "me";
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", marginBottom: m.actions ? 8 : 12 }}>
                <div style={{ maxWidth: "84%" }}>
                  {!me && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><Icon name="spark" size={14} color={T.accent} fill /><span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: T.accentText }}>Aura</span></div>}
                  <div style={{ padding: "12px 16px", borderRadius: 20, fontFamily: SANS, fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", background: me ? T.accent : T.surface, color: me ? "#241712" : T.text, borderTopRightRadius: me ? 6 : 20, borderTopLeftRadius: me ? 20 : 6, border: me ? "none" : `1px solid ${T.border}`, boxShadow: me ? `0 4px 14px ${rgba(T.accent, 0.3)}` : "0 2px 10px rgba(60,30,20,0.05)" }}>{m.text}</div>
                </div>
              </div>
              {/* quick-action chips under the latest AI message */}
              {m.actions && i === msgs.length - 1 && !busy && (
                <div className="glow-hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 10 }}>
                  {ACTIONS.map(a => (
                    <button key={a.label} onClick={() => send(a.q)} style={{ flexShrink: 0, whiteSpace: "nowrap", padding: "9px 14px", borderRadius: 99, cursor: "pointer", fontFamily: SANS, fontSize: 13, fontWeight: 600, color: T.accentText, background: T.accentSoft, border: `1px solid ${T.accentDim}` }}>{a.label}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* input */}
      <div style={{ padding: "8px 16px 30px", background: T.bg, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 16px", borderRadius: 26, background: T.surface, border: `1px solid ${T.borderHi}`, boxShadow: "0 4px 16px rgba(60,30,20,0.06)" }}>
          <Icon name="camera" size={22} color={T.textMute} />
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about your skin, a cream, a diet…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text, padding: "8px 0" }} />
          <button onClick={() => send()} disabled={busy} style={{ width: 40, height: 40, borderRadius: 99, flexShrink: 0, border: "none", cursor: "pointer", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", opacity: busy ? 0.6 : 1 }}><Icon name="send" size={20} color="#241712" /></button>
        </div>
      </div>
    </div>
  );
}
