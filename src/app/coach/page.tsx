"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, SANS, rgba, Icon } from "@/glow/ui";
import { canChat, recordChat, chatsLeft } from "@/glow/premium";
import { PremiumGate } from "@/glow/PremiumLock";

// quick-action chips — always available for follow-ups
const ACTIONS = [
  { label: "What's wrong with my face?", q: "Based on my latest face scan, what are my main skin problems right now and why?" },
  { label: "How do I fix it?", q: "Give me a simple step-by-step plan to fix my main skin concern from my scan." },
  { label: "Which cream should I use?", q: "Which type of cream or product should I use for my skin concern, and when to apply it?" },
  { label: "Best diet for me?", q: "What foods should I eat and avoid to improve my skin, based on my scan?" },
];

type Msg = { who: "ai" | "me" | "typing"; text?: string; actions?: boolean };

// Render Aura's reply with **bold** parts shown as soft highlighted text,
// so key words / product names / actions pop out (the "highlight" feel).
function renderRich(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <span key={i} style={{ fontWeight: 800, color: T.accentText, background: T.accentSoft, padding: "1px 5px", borderRadius: 6, margin: "0 1px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
          {p.slice(2, -2)}
        </span>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export default function CoachPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([{ who: "ai", text: "Hi, I'm Aura ✦ your personal skin coach. I've loaded your latest scan. Ask me anything — about your skin, a product, a diet, or a condition — and I'll keep it short and clear.", actions: true }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [gate, setGate] = useState(false);
  const [left, setChatsLeft] = useState<number>(Infinity);
  const scroller = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setChatsLeft(chatsLeft()); }, []);

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
    // Free members get 3 chats/day
    if (!canChat()) { setGate(true); return; }
    setBusy(true);
    setText("");
    recordChat();
    setChatsLeft(chatsLeft());
    setMsgs(m => [...m, { who: "me", text: question }, { who: "typing" }]);
    try {
      const r = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, context: scanContext() }) });
      const d = await r.json();
      let reply = d.text || d.reply;
      if (!reply) throw new Error(d.error || "empty");
      reply = reply.replace(/^[\-*]\s+/gm, "• ").trim(); // keep **bold** markers for highlighting
      setMsgs(m => m.filter(x => x.who !== "typing").concat({ who: "ai", text: reply, actions: true }));
    } catch {
      setMsgs(m => m.filter(x => x.who !== "typing").concat({ who: "ai", text: "⚠️ Server is busy, please try again." }));
    } finally { setBusy(false); }
  };

  // ── scan a product photo right inside the chat (Premium only) ──
  const scanProduct = async (file: File) => {
    if (busy) return;
    if (localStorage.getItem("velmora_is_premium") !== "true") { setGate(true); return; }
    setBusy(true);
    setMsgs(m => [...m, { who: "me", text: "📷 Scanned a product label" }, { who: "typing" }]);
    try {
      const b64: string = await new Promise((res, rej) => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: b64, mode: "product_scan", context: scanContext() }) });
      const d = await r.json();
      let reply = d.text || d.report;
      if (!reply) throw new Error(d.error || "empty");
      reply = reply.replace(/^[\-*]\s+/gm, "• ").trim();
      setMsgs(m => m.filter(x => x.who !== "typing").concat({ who: "ai", text: reply, actions: true }));
    } catch {
      setMsgs(m => m.filter(x => x.who !== "typing").concat({ who: "ai", text: "⚠️ Server is busy, please try again." }));
    } finally { setBusy(false); }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg, position: "relative", overflow: "hidden" }}>
      {/* soft ambient glows for wow (kept behind, very subtle) */}
      <div style={{ position: "absolute", top: -140, left: -60, width: 280, height: 280, borderRadius: 99, background: "radial-gradient(circle, rgba(240,136,106,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 120, right: -80, width: 240, height: 240, borderRadius: 99, background: "radial-gradient(circle, rgba(139,133,224,0.10) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "56px 16px 12px", position: "relative", zIndex: 2 }}>
        <button onClick={() => router.push("/")} style={{ width: 38, height: 38, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: T.shadow }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg, #F5A98D, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${rgba(T.accent, 0.45)}`, flexShrink: 0 }}>
          <Icon name="spark" size={22} color="#fff" fill />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: T.text, lineHeight: 1.05 }}>Aura</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: "#8FC299", fontWeight: 600, display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}><span className="animate-blink" style={{ width: 6, height: 6, borderRadius: 99, background: "#8FC299" }} />online · knows your scan</div>
        </div>
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
                  <div style={{ padding: "12px 16px", borderRadius: 20, fontFamily: SANS, fontSize: 15, lineHeight: 1.55, whiteSpace: "pre-wrap", background: me ? T.accent : T.surface, color: me ? "#241712" : T.text, borderTopRightRadius: me ? 6 : 20, borderTopLeftRadius: me ? 20 : 6, border: me ? "none" : `1px solid ${T.border}`, boxShadow: me ? `0 4px 14px ${rgba(T.accent, 0.3)}` : "0 2px 10px rgba(60,30,20,0.05)" }}>{me ? m.text : renderRich(m.text || "")}</div>
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

      {/* free chats remaining hint */}
      {left !== Infinity && (
        <div style={{ textAlign: "center", padding: "0 16px", position: "relative", zIndex: 2 }}>
          <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: left > 0 ? T.textMute : "#E0685C" }}>
            {left > 0 ? `${left} free chat${left === 1 ? "" : "s"} left today` : "Daily free chats used — go Premium for unlimited"}
          </span>
        </div>
      )}

      {/* input */}
      <div style={{ padding: "8px 16px 30px", background: T.bg, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 16px", borderRadius: 26, background: T.surface, border: `1px solid ${T.borderHi}`, boxShadow: "0 4px 16px rgba(60,30,20,0.06)" }}>
          <button onClick={() => camRef.current?.click()} title="Scan a product / read a label" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}><Icon name="camera" size={22} color={T.accentText} /></button>
          <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) scanProduct(f); e.currentTarget.value = ""; }} />
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask, or 📷 scan a product…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text, padding: "8px 0" }} />
          <button onClick={() => send()} disabled={busy} style={{ width: 40, height: 40, borderRadius: 99, flexShrink: 0, border: "none", cursor: "pointer", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", opacity: busy ? 0.6 : 1 }}><Icon name="send" size={20} color="#241712" /></button>
        </div>
      </div>

      {/* Premium gate */}
      {gate && (
        <div onClick={() => setGate(false)} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(20,12,8,0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "flex-end", justifyContent: "center", maxWidth: 430, margin: "0 auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, animation: "fadeUp .3s ease" }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: T.borderHi, margin: "12px auto 0" }} />
            <PremiumGate title="You've used today's free chats" sub="Free members get 3 Aura chats a day. Go Premium for unlimited chats with your AI skin coach + product scanning in chat." onClose={() => setGate(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
