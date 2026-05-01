"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, Bell, LogOut, ChevronRight, Settings, 
  Heart, Phone, Mail, Lock, BellRing, Clock, Save, 
  CheckCircle2, XCircle, AlertCircle, Camera, Sparkles,
  Smartphone, Eye, EyeOff
} from "lucide-react";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "otp">("login");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [skinType, setSkinType] = useState("Oily");
  const [reminders, setReminders] = useState([
    { id: '1', title: "Morning Skincare", time: "08:00", active: true },
    { id: '2', title: "Healthy Lunch", time: "13:30", active: true },
    { id: '3', title: "Night Routine", time: "22:00", active: true },
  ]);
  const [alarmActive, setAlarmActive] = useState(false);
  const [activeAlarmTitle, setActiveAlarmTitle] = useState("");
  
  const alarmInterval = useRef<NodeJS.Timeout | null>(null);
  const alarmTimeout = useRef<NodeJS.Timeout | null>(null);

  // Alarm Check Logic
  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      reminders.forEach(rem => {
        if (rem.active && rem.time === currentTime && !alarmActive) {
          triggerAlarm(rem.title);
        }
      });
    }, 1000);

    return () => clearInterval(checkAlarms);
  }, [reminders, alarmActive]);

  const triggerAlarm = (title: string) => {
    setAlarmActive(true);
    setActiveAlarmTitle(title);
    
    // Play sound (simulated with console for now, or real audio if file exists)
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.loop = true;
    audio.play().catch(e => console.log("Audio play blocked"));

    // Auto stop after 1 minute
    alarmTimeout.current = setTimeout(() => {
      stopAlarm(audio);
    }, 60000);

    // Store audio in ref to stop it later
    (window as any).currentAlarmAudio = audio;
  };

  const stopAlarm = (audio?: HTMLAudioElement) => {
    setAlarmActive(false);
    const activeAudio = audio || (window as any).currentAlarmAudio;
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    if (alarmTimeout.current) clearTimeout(alarmTimeout.current);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "login" || authMode === "signup") {
      setAuthMode("otp");
    } else {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm glass-card p-8 space-y-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
              <User size={32} />
            </div>
            <h2 className="text-2xl font-bold">{authMode === "login" ? "Welcome Back" : authMode === "signup" ? "Create Account" : "Verify OTP"}</h2>
            <p className="text-slate-500 text-sm mt-1">
              {authMode === "otp" ? "Enter the code sent to your phone" : "Access your personalized skin journey"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authMode !== "otp" ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="tel" 
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-purple-500/50"
                  />
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4].map(i => (
                  <input 
                    key={i}
                    type="text" 
                    maxLength={1}
                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold outline-none focus:border-purple-500"
                  />
                ))}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95"
            >
              {authMode === "otp" ? "Verify & Login" : "Continue"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-xs text-purple-400 font-bold hover:underline"
            >
              {authMode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Alarm Overlay */}
      <AnimatePresence>
        {alarmActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-purple-600 flex flex-col items-center justify-center text-white p-6"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8"
            >
              <BellRing size={64} />
            </motion.div>
            <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Alarm Active!</h1>
            <p className="text-xl font-bold mb-12 text-purple-100">{activeAlarmTitle}</p>
            <button 
              onClick={() => stopAlarm()}
              className="w-full max-w-xs h-16 bg-white text-purple-600 rounded-3xl font-black text-xl shadow-2xl active:scale-95 transition-transform"
            >
              STOP ALARM
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
              <User size={48} className="text-slate-500" />
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-500 border-4 border-background flex items-center justify-center text-white">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold font-outfit">Anrudh Kumar</h1>
          <p className="text-slate-400 text-xs">Premium Member</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Skin Type Selection */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">My Skin Type</h3>
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Shield size={20} />
              </div>
              <select 
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              >
                <option value="Oily">Oily Skin</option>
                <option value="Dry">Dry Skin</option>
                <option value="Combination">Combination Skin</option>
                <option value="Sensitive">Sensitive Skin</option>
              </select>
            </div>
            <ChevronRight size={18} className="text-slate-600" />
          </div>
        </section>

        {/* Reminders & Alarms */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Reminders & Alarms</h3>
          <div className="space-y-3">
            {reminders.map((rem) => (
              <div key={rem.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rem.active ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-600'}`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{rem.title}</p>
                    <input 
                      type="time" 
                      value={rem.time}
                      onChange={(e) => setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, time: e.target.value } : r))}
                      className="bg-transparent text-xs text-slate-400 outline-none"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, active: !r.active } : r))}
                  className={`w-12 h-6 rounded-full relative transition-colors ${rem.active ? 'bg-purple-600' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: rem.active ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* App Settings */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Settings</h3>
          <div className="space-y-2">
            <div className="glass-card p-4 flex items-center justify-between cursor-pointer hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                  <Bell size={20} />
                </div>
                <p className="text-sm font-bold">Notifications</p>
              </div>
              <ChevronRight size={18} className="text-slate-600" />
            </div>
            <div className="glass-card p-4 flex items-center justify-between cursor-pointer hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400">
                  <Settings size={20} />
                </div>
                <p className="text-sm font-bold">Account Settings</p>
              </div>
              <ChevronRight size={18} className="text-slate-600" />
            </div>
          </div>
        </section>
      </div>

      <button 
        onClick={() => setIsLoggedIn(false)}
        className="w-full h-14 glass-card flex items-center justify-center gap-3 text-red-400 font-bold hover:bg-red-500/10 border-red-500/20 transition-colors"
      >
        <LogOut size={20} /> Log Out
      </button>

      <p className="text-center text-[10px] text-slate-600 font-medium">
        GlowAI v1.1.0 • Build with ❤️ for your skin
      </p>
    </div>
  );
}
