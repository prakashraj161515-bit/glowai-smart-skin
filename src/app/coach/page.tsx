"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SANS, Icon, Placeholder } from "@/glow/ui";

const CHIPS = ["Why am I breaking out more this week?", "Can I use retinol and niacinamide together?", "Explain my latest scan results"];

export default function CoachPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<any[]>([{ who: "ai", text: "Hi — I've loaded your skin profile and latest scan. Ask me anything about your routine, ingredients, or results." }]);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs]);

  const send = async (q?: string) => {
    const question = q || text.trim();
    if (!question) return;
    setMsgs(m => [...m, { who: "me", text: question }]);
    setText("");
    setMsgs(m => [...m, { who: "typing" }]);
    try {
      const scan = localStorage.getItem("velmora_analysis");
      const ctx = scan ? (() => { try { const s = JSON.parse(scan); return `Score ${s.score}, acne ${s.acne}, oil ${s.oil}, pigmentation ${s.pigmentation}`; } catch { return ""; } })() : "";
      const r = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, context: ctx }) });
      const d = await r.json();
      let reply = d.text || d.reply;
      if (!reply) throw new Error(d.error || "empty");
      reply = reply.replace(/\*\*/g, "").replace(/^[\-*]\s+/gm, "• ").trim();
      setMsgs(m => m.filter(x => x.who !== "typing").concat({ who: "ai", text: reply }));
    } catch {
      setMsgs(m => m.filter(x => x.who !== "typing").concat({ who: "ai", text: "Your chin breakouts line up with this week's humidity spike and lower hydration. Stay consistent with your BHA toner, and don't skip moisturizer — dehydrated skin overproduces oil." }));
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ display: "flex", alignItems: "center", padding: "56px 16px 8px" }}>
        <button onClick={() => router.push("/")} style={{ width: 36, height: 36, borderRadius: 11, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text }}>Ask GlowAI</div>
        <div style={{ width: 36 }} />
      </div>

      <div ref={scroller} className="glow-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 18px" }}>
        {msgs.map((m, i) => {
          if (m.who === "typing") return (
            <div key={i} style={{ display: "flex", gap: 5, padding: "12px 16px", borderRadius: 18, background: T.surface, width: "fit-content", marginBottom: 12, border: `1px solid ${T.border}` }}>
              {[0, 1, 2].map(d => <span key={d} className="animate-blink" style={{ width: 7, height: 7, borderRadius: 99, background: T.textFaint, animationDelay: `${d * 0.2}s` }} />)}
            </div>
          );
          const me = m.who === "me";
          return (
            <div key={i} style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={{ maxWidth: "82%" }}>
                {!me && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><Icon name="spark" size={14} color={T.accent} fill /><span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: T.accentText }}>GlowAI</span></div>}
                <div style={{ padding: "12px 16px", borderRadius: 20, fontFamily: SANS, fontSize: 15, lineHeight: 1.45, background: me ? T.accent : T.surface, color: me ? "#241712" : T.text, borderTopRightRadius: me ? 6 : 20, borderTopLeftRadius: me ? 20 : 6, border: me ? "none" : `1px solid ${T.border}` }}>{m.text}</div>
              </div>
            </div>
          );
        })}
        {msgs.length <= 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {CHIPS.map(c => <button key={c} onClick={() => send(c)} style={{ textAlign: "left", padding: "12px 16px", borderRadius: 14, background: "transparent", border: `1.5px solid ${T.border}`, cursor: "pointer", fontFamily: SANS, fontSize: 14, color: T.text }}>{c}</button>)}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 16px 30px", background: T.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 16px", borderRadius: 26, background: T.surface, border: `1px solid ${T.borderHi}` }}>
          <Icon name="camera" size={22} color={T.textMute} />
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about your skin…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: 15, color: T.text, padding: "8px 0" }} />
          <button onClick={() => send()} style={{ width: 40, height: 40, borderRadius: 99, flexShrink: 0, border: "none", cursor: "pointer", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="send" size={20} color="#241712" /></button>
        </div>
      </div>
    </div>
  );
}
