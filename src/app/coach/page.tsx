"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Plus, RefreshCcw, Trash2, Edit2, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CoachPage() {
  const [messages, setMessages] = useState<{id: string, role: string, content: string, isError?: boolean, timestamp: number}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load and clean up old messages
  useEffect(() => {
    const saved = localStorage.getItem("glowai_chat_history");
    const initialMsg = { id: '1', role: "assistant", content: "Hi! I'm your GlowAI Coach. How can I help you today? ✨", timestamp: Date.now() };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((m: any) => m.timestamp > oneWeekAgo);
        setMessages(filtered.length > 0 ? filtered : [initialMsg]);
      } catch (e) {
        setMessages([initialMsg]);
      }
    } else {
      setMessages([initialMsg]);
    }
  }, []);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("glowai_chat_history", JSON.stringify(messages));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const executeSend = async (textToSend: string, isRetry = false) => {
    setIsLoading(true);

    let currentMessages = messages;
    if (!isRetry) {
      if (editingId) {
        // Handle Edit
        const newMsgs = messages.map(m => m.id === editingId ? { ...m, content: textToSend } : m);
        setMessages(newMsgs);
        setEditingId(null);
        setInput("");
        setIsLoading(false);
        return; 
      }
      const newMsg = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: Date.now() };
      currentMessages = [...messages, newMsg];
      setMessages(currentMessages);
      setInput("");
    } else {
      currentMessages = messages.filter(m => !m.isError);
      setMessages(currentMessages);
    }

    try {
      // Prepare history for API
      let history = currentMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Gemini requires history to start with a 'user' role
      if (history.length > 0 && history[0].role === 'model') {
        history = history.slice(1);
      }
      
      // Remove the last user message from history because we are sending it as the new prompt
      history.pop();

      let scanContext = "";
      try {
        const scanData = localStorage.getItem("glowai_analysis");
        if (scanData) {
          const parsed = JSON.parse(scanData);
          scanContext = `My current skin scan metrics: Glow Score ${parsed.score}/100, Acne ${parsed.redness}%, Oiliness ${parsed.oiliness}%, Pores ${parsed.pores}%.`;
        }
      } catch (e) {}

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history, context: scanContext })
      });
      
      const data = await res.json();
      if (data.text) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.text, timestamp: Date.now() }]);
      } else {
        const isBusy = data.error && (data.error.includes("503") || data.error.includes("429"));
        const errorMsg = isBusy ? "Server is currently busy. Please try again." : `Error: ${data.error || "Invalid response"}`;
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMsg, isError: true, timestamp: Date.now() }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Server is currently busy. Please try again.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    executeSend(input, false);
  };

  const handleRetry = () => {
    if (isLoading) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      executeSend(lastUserMsg.content, true);
    }
  };

  const handleDelete = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    setLongPressId(null);
  };

  const handleEditInit = (id: string, content: string) => {
    setEditingId(id);
    setInput(content);
    setLongPressId(null);
  };

  const startPress = (id: string) => {
    timerRef.current = setTimeout(() => {
      setLongPressId(id);
    }, 600);
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const formatMessage = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Check if the line is a **HEADER**
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return (
          <div key={i} className="text-[15px] font-black text-purple-400 mt-4 mb-1 tracking-tight uppercase">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      return <div key={i} className="mb-0.5">{line}</div>;
    });
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
      
      <div className="mb-4 p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
        <p className="text-[11px] text-purple-300 font-medium italic">Sometimes Server is busy, Please Try Again</p>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-20"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative group`}
            onPointerDown={() => startPress(msg.id)}
            onPointerUp={endPress}
            onPointerLeave={endPress}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap transition-all ${
              longPressId === msg.id ? 'ring-2 ring-purple-500 scale-[0.98]' : ''
            } ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-600/20' 
                : 'glass-card text-slate-200 rounded-tl-none'
            }`}>
              {formatMessage(msg.content)}
              {msg.isError && (
                <button onClick={handleRetry} className="mt-2 flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors">
                  <RefreshCcw size={12} /> Retry
                </button>
              )}
            </div>

            {/* Long Press Menu Overlay */}
            <AnimatePresence>
              {longPressId === msg.id && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute z-50 bg-slate-900 border border-white/10 p-1 rounded-xl shadow-2xl flex gap-1 -top-12 left-1/2 -translate-x-1/2"
                >
                  {msg.role === 'user' && (
                    <button onClick={() => handleEditInit(msg.id, msg.content)} className="p-2 hover:bg-white/5 rounded-lg text-purple-400">
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(msg.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setLongPressId(null)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 glass-card text-sm rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-4 relative bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
        {editingId && (
          <div className="flex items-center justify-between px-2 py-1 mb-1 text-[10px] text-purple-400 font-bold uppercase">
            <span>Editing Message</span>
            <button onClick={() => { setEditingId(null); setInput(""); }} className="text-red-400">Cancel</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={editingId ? "Update your message..." : "Ask anything about skincare..."}
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-3 text-sm focus:outline-none disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : (editingId ? <CheckCircle2 size={18} /> : <Send size={18} />)}
          </button>
        </div>
      </div>
    </div>
  );
}
