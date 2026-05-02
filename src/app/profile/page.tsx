"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, Bell, LogOut, ChevronRight, Settings, 
  Heart, Phone, Mail, Lock, BellRing, Clock, Save, 
  CheckCircle2, XCircle, AlertCircle, Camera, Sparkles,
  Smartphone, Eye, EyeOff, ChevronLeft, Edit2
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "otp">("login");
  
  const [userName, setUserName] = useState("Anrudh Kumar");
  const [profilePic, setProfilePic] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop");
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("glowai_is_logged_in");
    const savedName = localStorage.getItem("glowai_user_name");
    const savedPic = localStorage.getItem("glowai_user_pic");
    
    if (saved === "true") setIsLoggedIn(true);
    if (savedName) setUserName(savedName);
    if (savedPic) setProfilePic(savedPic);
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("glowai_is_logged_in", isLoggedIn ? "true" : "false");
      localStorage.setItem("glowai_user_name", userName);
      localStorage.setItem("glowai_user_pic", profilePic);
    }
  }, [isLoggedIn, isLoaded, userName, profilePic]);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [skinType, setSkinType] = useState("Combination");
  const [reminders, setReminders] = useState([
    { id: '1', title: "Morning Skincare", time: "08:00", active: true },
    { id: '2', title: "Healthy Breakfast", time: "09:00", active: true },
    { id: '3', title: "Healthy Lunch", time: "13:30", active: true },
    { id: '4', title: "Healthy Dinner", time: "20:00", active: true },
    { id: '5', title: "Night Routine", time: "22:00", active: true },
  ]);
  const [alarmActive, setAlarmActive] = useState(false);
  const [activeAlarmTitle, setActiveAlarmTitle] = useState("");
  
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
    
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.loop = true;
    audio.play().catch(e => console.log("Audio play blocked"));

    alarmTimeout.current = setTimeout(() => {
      stopAlarm(audio);
    }, 60000);

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

  const handleProfilePicChange = () => {
    const newPic = prompt("Enter Image URL for Profile Picture:", profilePic);
    if (newPic) setProfilePic(newPic);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F4F6FF] flex flex-col items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm premium-card p-8 space-y-8"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-purple-600 shadow-inner shadow-purple-100 animate-float">
              <User size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {authMode === "login" ? "Welcome Back" : authMode === "signup" ? "Create Account" : "Verify OTP"}
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
              {authMode === "otp" ? "Enter the code sent to your phone" : "Access your personalized skin journey"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authMode !== "otp" ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-purple-200 transition-all text-slate-700"
                  />
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="tel" 
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-purple-200 transition-all text-slate-700"
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
                    className="w-14 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-xl font-black outline-none focus:border-purple-300 transition-all text-slate-800"
                  />
                ))}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-primary-gradient h-14 rounded-2xl font-black text-white shadow-xl shadow-purple-500/20 transition-all active:scale-95 mt-4"
            >
              {authMode === "otp" ? "Verify & Login" : "Continue"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-[10px] text-purple-600 font-black uppercase tracking-widest hover:underline"
            >
              {authMode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FF] pb-32">
      {/* Alarm Overlay */}
      <AnimatePresence>
        {alarmActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary-gradient flex flex-col items-center justify-center text-white p-6"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-md"
            >
              <BellRing size={64} />
            </motion.div>
            <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-center">Alarm Active!</h1>
            <p className="text-lg font-bold mb-12 text-white/80">{activeAlarmTitle}</p>
            <button 
              onClick={() => stopAlarm()}
              className="w-full max-w-xs h-16 bg-white text-purple-600 rounded-[32px] font-black text-xl shadow-2xl active:scale-95 transition-transform"
            >
              STOP ALARM
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-12 flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-[40px] bg-primary-gradient p-1.5 rotate-3 group">
            <div className="w-full h-full rounded-[35px] bg-white flex items-center justify-center overflow-hidden border-4 border-white -rotate-3 transition-transform group-hover:rotate-0">
              <img 
                src={profilePic} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <button 
            onClick={handleProfilePicChange}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border-4 border-[#F4F6FF] flex items-center justify-center text-purple-600 shadow-xl active:scale-90 transition-transform"
          >
            <Camera size={18} />
          </button>
        </div>
        <div className="flex flex-col items-center">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                ref={nameInputRef}
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-2xl font-black text-slate-900 tracking-tight bg-white border-b-2 border-purple-500 outline-none text-center px-2"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{userName}</h1>
              <Edit2 size={16} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
            </div>
          )}
          <p className="text-[10px] text-purple-600 font-black uppercase tracking-[0.2em] mt-1 bg-purple-50 px-3 py-1 rounded-full inline-block">Premium Member</p>
        </div>
      </header>

      <div className="px-6 mt-10 space-y-8">
        {/* Settings Groups */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">My Skin Profile</h3>
          <div className="premium-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Skin Type</p>
                <select 
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer"
                >
                  <option value="Oily">Oily Skin</option>
                  <option value="Dry">Dry Skin</option>
                  <option value="Combination">Combination Skin</option>
                  <option value="Sensitive">Sensitive Skin</option>
                </select>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Reminders & Alarms</h3>
          <div className="space-y-3">
            {reminders.map((rem) => (
              <div key={rem.id} className="premium-card p-5 flex items-center justify-between group transition-all hover:bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${rem.active ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{rem.title}</p>
                    <input 
                      type="time" 
                      value={rem.time}
                      onChange={(e) => setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, time: e.target.value } : r))}
                      className="bg-transparent text-[11px] font-bold text-slate-500 outline-none"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, active: !r.active } : r))}
                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${rem.active ? 'bg-purple-600 shadow-lg shadow-purple-500/20' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    animate={{ x: rem.active ? 30 : 4 }}
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">System</h3>
          <div className="space-y-3">
            {[
              { label: "Account Settings", icon: Settings, color: "text-slate-500", bg: "bg-slate-50" },
              { label: "Notifications", icon: Bell, color: "text-orange-500", bg: "bg-orange-50" }
            ].map((item, i) => (
              <div key={i} className="premium-card p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}>
                    <item.icon size={24} />
                  </div>
                  <p className="text-sm font-black text-slate-900">{item.label}</p>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={() => setIsLoggedIn(false)}
          className="w-full h-16 premium-card flex items-center justify-center gap-3 text-red-500 font-black text-sm hover:bg-red-50 border-red-100 transition-colors mt-8 shadow-lg shadow-red-500/5"
        >
          <LogOut size={20} /> Log Out Account
        </button>

        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest pb-10">
          GlowAI Premium • Build v1.2.5
        </p>
      </div>
    </div>
  );
}
