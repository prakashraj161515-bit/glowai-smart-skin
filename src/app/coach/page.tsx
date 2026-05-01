"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Plus, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CoachPage() {
  const [messages, setMessages] = useState<{role: string, content: string, isError?: boolean}[]>([
    { role: "assistant", content: "Hi! I'm your GlowAI Coach. How can I help you with your skin today? ✨" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const executeSend = async (textToSend: string, isRetry = false) => {
    setIsLoading(true);

    let currentMessages = messages;
    if (!isRetry) {
      currentMessages = [...messages, { role: 'user', content: textToSend }];
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
        setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        const isBusy = data.error && (data.error.includes("503") || data.error.includes("429") || data.error.includes("high demand") || data.error.includes("quota"));
        const errorMsg = isBusy ? "Server is currently busy. Please try again." : `Error: ${data.error || "Invalid response"}`;
        setMessages((prev) => [...prev, { role: 'assistant', content: errorMsg, isError: true }]);
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
    const lastUserMsg = messages.slice().reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      executeSend(lastUserMsg.content, true);
    }
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
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'glass-card text-slate-200 rounded-tl-none'
            }`}>
              {formatMessage(msg.content)}
              {msg.isError && (
                <button 
                  onClick={handleRetry}
                  className="mt-2 flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <RefreshCcw size={12} /> Retry
                </button>
              )}
            </div>
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
      <div className="mt-4 relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about skincare..."
          disabled={isLoading}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 pr-12 text-sm focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 disabled:opacity-50"
        >
          {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
