"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CoachPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your GlowAI Coach. How can I help you with your skin today? ✨" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = { 
        role: "assistant", 
        content: "That's a great question! For your skin type (Oily), I recommend using a Salicylic Acid based cleanser in the morning. It helps to clear out pores and reduce excess sebum. Would you like a product suggestion? 🧴" 
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Skin Coach</h1>
            <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Always Online</p>
          </div>
        </div>
        <button className="glass-button p-2 rounded-full">
          <Plus size={18} />
        </button>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'glass-card text-slate-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="mt-4 relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about skincare..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 pr-12 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        <button 
          onClick={handleSend}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
