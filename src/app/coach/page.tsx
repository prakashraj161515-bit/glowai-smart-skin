"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Plus, RefreshCcw, Trash2, Edit2, X, CheckCircle2, ChevronLeft, Gem, Lock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CoachPage() {
  const [messages, setMessages] = useState<{id: string, role: string, content: string, isError?: boolean, timestamp: number}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [messageLimitReached, setMessageLimitReached] = useState(false);
  const [messagesLeft, setMessagesLeft] = useState(5);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load status and messages
  useEffect(() => {
    const premium = localStorage.getItem("velmora_is_premium") === "true";
    setIsPremium(premium);

    const saved = localStorage.getItem("velmora_chat_history");
    const initialMsg = { id: '1', role: "assistant", content: "Hi! I'm your Velmora Coach. How can I help you today? ✨", timestamp: Date.now() };
    
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

    checkMessageLimit(premium);
  }, []);

  const checkMessageLimit = (premiumStatus: boolean) => {
    if (premiumStatus) {
      setMessageLimitReached(false);
      return true;
    }

    const today = new Date().toDateString();
    const lastChatDate = localStorage.getItem("velmora_last_chat_date");
    const chatCount = parseInt(localStorage.getItem("velmora_chat_count") || "0");

    if (lastChatDate === today) {
      setMessagesLeft(Math.max(0, 5 - chatCount));
      if (chatCount >= 5) {
        setMessageLimitReached(true);
        return false;
      }
    } else {
      setMessagesLeft(5);
      setMessageLimitReached(false);
    }
    return true;
  };

  const incrementChatCount = () => {
    if (isPremium) return;
    const today = new Date().toDateString();
    const lastChatDate = localStorage.getItem("velmora_last_chat_date");
    let count = parseInt(localStorage.getItem("velmora_chat_count") || "0");

    if (lastChatDate === today) {
      count += 1;
    } else {
      count = 1;
    }
    localStorage.setItem("velmora_last_chat_date", today);
    localStorage.setItem("velmora_chat_count", count.toString());
    setMessagesLeft(Math.max(0, 5 - count));
    if (count >= 5) setMessageLimitReached(true);
  };

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("velmora_chat_history", JSON.stringify(messages));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const executeSend = async (textToSend: string, isRetry = false) => {
    if (!checkMessageLimit(isPremium)) return;
    
    setIsLoading(true);
    let currentMessages = messages;

    if (!isRetry) {
      if (editingId) {
        const newMsgs = messages.map(m => m.id === editingId ? { ...m, content: textToSend } : m);
        setMessages(newMsgs);
        setEditingId(null);
        setInput("");
        setIsLoading(false);
        return; 
      }
      incrementChatCount();
      const newMsg = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: Date.now() };
      currentMessages = [...messages, newMsg];
      setMessages(currentMessages);
      setInput("");
    } else {
      currentMessages = messages.filter(m => !m.isError);
      setMessages(currentMessages);
    }

    try {
      let history = currentMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      if (history.length > 0 && history[0].role === 'model') history = history.slice(1);
      history.pop();

      let scanContext = "";
      try {
        const scanData = localStorage.getItem("velmora_analysis");
        if (scanData) {
          const parsed = JSON.parse(scanData);
          scanContext = `My current skin scan metrics: Glow Score ${parsed.score}/100, Acne ${parsed.acne}%, Oiliness ${parsed.oil}%, Pigmentation ${parsed.pigmentation}%.`;
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
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: "⚠️ Server is busy. Please try again.", isError: true, timestamp: Date.now() }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: "⚠️ Server is busy. Please try again.", isError: true, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading || (messageLimitReached && !isPremium)) return;
    executeSend(input, false);
  };

  const handleRetry = () => {
    if (isLoading) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) executeSend(lastUserMsg.content, true);
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
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return (
          <div key={i} className="text-[14px] font-black text-purple-600 mt-4 mb-1 tracking-tight uppercase border-b border-purple-100 pb-1">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      return <div key={i} className="mb-0.5">{line}</div>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#F4F6FF]">
      {/* Header */}
      <header className="px-6 pt-8 flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 border border-slate-100">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900">Expert Coach</h1>
              {isPremium && (
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-[1px] rounded-full">
                  <div className="bg-white rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Gem size={8} className="text-purple-600 fill-purple-500" />
                    <span className="text-[7px] font-black text-purple-700 uppercase">Pro</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Always Online
            </p>
          </div>
        </div>
        <button onClick={() => {
          if (confirm("Clear all messages?")) {
            setMessages([{ id: '1', role: "assistant", content: "Hi! I'm your Velmora Coach. How can I help you today? ✨", timestamp: Date.now() }]);
            localStorage.removeItem("velmora_chat_history");
          }
        }} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 border border-slate-100">
          <Trash2 size={18} />
        </button>
      </header>
      
      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar pb-40 pt-4"
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
            <div className={`max-w-[85%] p-4 rounded-3xl text-[13px] whitespace-pre-wrap transition-all shadow-sm ${
              longPressId === msg.id ? 'ring-2 ring-purple-600 scale-[0.98]' : ''
            } ${
              msg.role === 'user' 
                ? 'bg-primary-gradient text-white rounded-tr-none shadow-purple-500/10' 
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
            }`}>
              {formatMessage(msg.content)}
              {msg.isError && (
                <button onClick={handleRetry} className="mt-3 flex items-center gap-1 text-[10px] font-black bg-red-50 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
                  <RefreshCcw size={12} /> Retry
                </button>
              )}
            </div>

            {/* Menu */}
            <AnimatePresence>
              {longPressId === msg.id && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute z-50 bg-white border border-slate-100 p-1.5 rounded-2xl shadow-2xl flex gap-1 -top-12 left-1/2 -translate-x-1/2"
                >
                  {msg.role === 'user' && (
                    <button onClick={() => handleEditInit(msg.id, msg.content)} className="p-2 hover:bg-slate-50 rounded-xl text-purple-600">
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(msg.id)} className="p-2 hover:bg-red-50 rounded-xl text-red-500">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setLongPressId(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-4 bg-white rounded-3xl rounded-tl-none flex gap-1.5 shadow-sm border border-slate-100">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input & Limit Area */}
      <div className="fixed bottom-[90px] left-6 right-6 z-40 space-y-2">
        {/* Limit Warning */}
        {!isPremium && (
          <div className="flex items-center justify-between px-4 py-2 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 text-[10px] font-black text-slate-500 uppercase tracking-tight">
            <span>{messagesLeft} Messages Left Today</span>
            <Link href="/premium" className="text-purple-600 flex items-center gap-1">Upgrade <Plus size={10} /></Link>
          </div>
        )}

        {messageLimitReached && !isPremium ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-3xl border border-red-100 shadow-xl flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={18} />
              <p className="text-xs font-black uppercase tracking-tight">Daily Chat Limit Reached!</p>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-bold">Free users get 5 messages per day. Upgrade for unlimited coaching.</p>
            <Link href="/premium" className="w-full h-11 bg-primary-gradient rounded-2xl text-white font-black text-xs flex items-center justify-center shadow-lg shadow-purple-500/20">
              Unlock Unlimited Chat 🔓
            </Link>
          </motion.div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl p-2.5 rounded-3xl border border-white shadow-2xl shadow-purple-500/10">
            {editingId && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-1 text-[9px] text-purple-600 font-black uppercase">
                <span>Editing Message</span>
                <button onClick={() => { setEditingId(null); setInput(""); }} className="text-red-500">Cancel</button>
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
                className="flex-1 bg-transparent px-4 py-3 text-[13px] font-medium text-slate-700 focus:outline-none disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="w-11 h-11 bg-primary-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              >
                {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : (editingId ? <CheckCircle2 size={18} /> : <Send size={18} />)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
