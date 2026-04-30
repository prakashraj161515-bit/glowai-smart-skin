"use client";

import { motion } from "framer-motion";
import { User, Shield, Bell, Globe, LogOut, ChevronRight, Settings, Heart } from "lucide-react";

export default function ProfilePage() {
  const sections = [
    { 
      title: "My Skin Profile", 
      items: [
        { label: "Skin Type", value: "Oily / Combination", icon: Shield, color: "text-blue-400" },
        { label: "Concerns", value: "Acne, Pores", icon: Heart, color: "text-pink-400" },
      ]
    },
    { 
      title: "App Settings", 
      items: [
        { label: "Notifications", value: "On", icon: Bell, color: "text-yellow-400" },
        { label: "Language", value: "English / Hindi", icon: Globe, color: "text-green-400" },
        { label: "Account Settings", value: "", icon: Settings, color: "text-slate-400" },
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
              <User size={48} className="text-slate-500" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-500 border-4 border-background flex items-center justify-center text-white font-bold text-xs">
            Pro
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold font-outfit">Anrudh Kumar</h1>
          <p className="text-slate-400 text-sm">Glow Level: 4 (Enthusiast)</p>
        </div>
      </header>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <section key={i} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{section.title}</h3>
            <div className="space-y-3">
              {section.items.map((item, j) => (
                <div key={j} className="glass-card p-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      {item.value && <p className="text-xs text-slate-400">{item.value}</p>}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <button className="w-full h-14 glass-card flex items-center justify-center gap-3 text-red-400 font-bold hover:bg-red-500/10 border-red-500/20 transition-colors">
        <LogOut size={20} /> Log Out
      </button>

      <p className="text-center text-[10px] text-slate-600 font-medium">
        GlowAI v1.0.4 • Build with ❤️ for your skin
      </p>
    </div>
  );
}
