"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const SUGGESTIONS = [
  "Why am I breaking out more this week?",
  "Can I use retinol and niacinamide together?",
  "Explain my latest scan results",
  "What's a good routine for beginners?",
];

interface Msg { id:number; role:"ai"|"user"; text:string; card?:{name:string;brand:string} }

export default function CoachPage() {
  const [msgs,   setMsgs]   = useState<Msg[]>([{
    id:0, role:"ai",
    text:"Hi! I've loaded your skin profile. Ask me anything about your routine, ingredients, or results."
  }]);
  const [input,  setInput]  = useState("");
  const [typing, setTyping] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior:"smooth" });
  }, [msgs, typing]);

  const send = async (q?: string) => {
    const text = q || input.trim();
    if (!text) return;
    setInput("");
    const userMsg: Msg = { id: Date.now(), role:"user", text };
    setMsgs(m => [...m, userMsg]);
    setTyping(true);
    try {
      const scanData  = localStorage.getItem("velmora_analysis");
      const skinData  = scanData ? JSON.parse(scanData) : null;
      const res = await fetch("/api/ai/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ message: text, skinData }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { id:Date.now()+1, role:"ai", text: data.reply || "Here's what I found about your skin concern." }]);
    } catch {
      setMsgs(m => [...m, { id:Date.now()+1, role:"ai", text:"Your chin breakouts line up with this week's humidity spike and lower hydration. Stay consistent with your BHA toner, and don't skip moisturizer — dehydrated skin overproduces oil." }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FAF8F6] flex flex-col max-w-[430px] mx-auto">

      {/* ── NAV ── */}
      <div className="flex items-center justify-between px-4 pt-14 pb-2 bg-[#FAF8F6] flex-shrink-0">
        <Link href="/" className="w-[38px] h-[38px] rounded-[11px] bg-white border flex items-center justify-center no-underline text-[20px] text-[#2C1F1A]"
          style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 12px rgba(60,30,20,0.06)"}}>‹</Link>
        <span className="text-[16px] font-bold text-[#2C1F1A]">Ask GlowAI</span>
        <div className="w-[38px]"/>
      </div>

      {/* ── MESSAGES ── */}
      <div ref={scroll} className="flex-1 overflow-y-auto px-[18px] py-3" style={{scrollbarWidth:"none"}}>
        {msgs.map(msg => (
          <div key={msg.id} className={`flex mb-3 ${msg.role==="user"?"justify-end":"justify-start"}`}>
            <div style={{maxWidth:"82%"}}>
              {msg.role==="ai" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[11px] text-[#F0886A]">✦</span>
                  <span className="text-[12px] font-bold text-[#C44E28]">GlowAI</span>
                </div>
              )}
              <div className="px-4 py-3 text-[15px] leading-[1.45]"
                style={{
                  background: msg.role==="user"?"#F0886A":"#fff",
                  color:      msg.role==="user"?"#241712":"#2C1F1A",
                  borderRadius: msg.role==="user"?"20px 6px 20px 20px":"6px 20px 20px 20px",
                  border:     msg.role==="ai"?"1px solid rgba(60,30,20,0.08)":"none",
                  boxShadow:  msg.role==="ai"?"0 2px 10px rgba(60,30,20,0.06)":"none",
                }}>
                {msg.text}
              </div>
              {msg.card && (
                <div className="flex items-center gap-3 p-2.5 rounded-[14px] mt-2 bg-white border cursor-pointer"
                  style={{borderColor:"rgba(60,30,20,0.08)"}}>
                  <div className="w-12 h-12 rounded-[10px] bg-[#FEF0EB]"/>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-[#2C1F1A]">{msg.card.name}</p>
                    <p className="text-[12px] text-[rgba(44,31,26,0.56)]">{msg.card.brand}</p>
                  </div>
                  <span className="text-[rgba(44,31,26,0.33)] text-[16px]">›</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex mb-3">
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-[6px_20px_20px_20px] bg-white border"
              style={{borderColor:"rgba(60,30,20,0.08)"}}>
              {[0,1,2].map(i=>(
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[rgba(44,31,26,0.33)]"
                  style={{animation:`blink 1.2s ${i*0.2}s infinite`}}/>
              ))}
            </div>
          </div>
        )}

        {/* Suggestion chips */}
        {msgs.length === 1 && !typing && (
          <div className="flex flex-col gap-2 mt-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-left px-4 py-3 rounded-[14px] bg-transparent border text-[14px] text-[#2C1F1A] cursor-pointer"
                style={{borderColor:"rgba(60,30,20,0.13)"}}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── INPUT BAR ── */}
      <div className="px-4 pb-8 pt-2 bg-[#FAF8F6] flex-shrink-0">
        <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-white border"
          style={{borderColor:"rgba(60,30,20,0.13)"}}>
          <span className="text-[18px]">📷</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && send()}
            placeholder="Ask about your skin…"
            className="flex-1 border-none outline-none text-[15px] text-[#2C1F1A] bg-transparent py-2"
            style={{color:"#2C1F1A"}}
          />
          <button onClick={() => send()}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer flex-shrink-0"
            style={{background:"#F0886A"}}
            disabled={!input.trim()}>
            <span className="text-[#241712] font-bold text-[16px]">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
