"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, Bell, LogOut, ChevronRight, Settings, 
  Smartphone, Mail, Clock, Camera, Sparkles,
  Edit2, Gem, BellRing, Target
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [country, setCountry] = useState("India");
  const [authMode, setAuthMode] = useState<"login" | "signup" | "otp">("login");
  
  const [userName, setUserName] = useState("Anrudh Kumar");
  const [profilePic, setProfilePic] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop");
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("velmora_is_logged_in");
    const savedName = localStorage.getItem("velmora_user_name");
    const savedPic = localStorage.getItem("velmora_user_pic");
    const premium = localStorage.getItem("velmora_is_premium") === "true";
    const savedGender = localStorage.getItem("velmora_user_gender") as "male" | "female";
    const savedCountry = localStorage.getItem("velmora_user_country");
    
    if (saved === "true") setIsLoggedIn(true);
    if (savedName) setUserName(savedName);
    if (savedPic) setProfilePic(savedPic);
    if (savedGender) setGender(savedGender);
    if (savedCountry) setCountry(savedCountry);
    setIsPremium(premium);
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("velmora_is_logged_in", isLoggedIn ? "true" : "false");
      localStorage.setItem("velmora_user_name", userName);
      localStorage.setItem("velmora_user_pic", profilePic);
      localStorage.setItem("velmora_user_gender", gender);
      localStorage.setItem("velmora_user_country", country);
    }
  }, [isLoggedIn, isLoaded, userName, profilePic, gender, country]);

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
        if (rem.active && rem.time === currentTime && !alarmActive) triggerAlarm(rem.title);
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
    alarmTimeout.current = setTimeout(() => stopAlarm(audio), 60000);
    (window as any).currentAlarmAudio = audio;
  };

  const stopAlarm = (audio?: HTMLAudioElement) => {
    setAlarmActive(false);
    const activeAudio = audio || (window as any).currentAlarmAudio;
    if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; }
    if (alarmTimeout.current) clearTimeout(alarmTimeout.current);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "login" || authMode === "signup") setAuthMode("otp");
    else setIsLoggedIn(true);
  };

  const handlePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDF5F2] flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm card p-8 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#FFEDE8] rounded-[32px] flex items-center justify-center mx-auto mb-6 text-[#F88E7D] shadow-inner animate-float"><User size={40} /></div>
            <h2 className="text-2xl font-bold text-slate-800">{authMode === "login" ? "Welcome Back" : authMode === "signup" ? "Create Account" : "Verify OTP"}</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">{authMode === "otp" ? "Enter the code sent to your phone" : "Access your personalized skin journey"}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {authMode !== "otp" ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#FDF5F2] border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-[#FFB5A7] transition-all text-slate-700" />
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#FDF5F2] border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-[#FFB5A7] transition-all text-slate-700" />
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4].map(i => <input key={i} type="text" maxLength={1} className="w-14 h-14 bg-[#FDF5F2] border-2 border-transparent rounded-2xl text-center text-xl font-black outline-none focus:border-[#FFB5A7] transition-all text-slate-800" />)}
              </div>
            )}
            <button type="submit" className="w-full bg-primary-gradient h-14 rounded-2xl font-bold text-white shadow-xl shadow-orange-500/20 transition-all active:scale-95 mt-4">{authMode === "otp" ? "Verify & Login" : "Continue"}</button>
          </form>
          <div className="text-center pt-2">
            <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="text-[10px] text-[#F88E7D] font-bold uppercase tracking-widest hover:underline">{authMode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Login"}</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF5F2] pb-32 font-outfit">
      <AnimatePresence>
        {alarmActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary-gradient flex flex-col items-center justify-center text-white p-6">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-md"><BellRing size={64} /></motion.div>
            <h1 className="text-3xl font-bold mb-2 uppercase tracking-tighter text-center">Alarm Active!</h1>
            <p className="text-lg font-medium mb-12 text-white/80">{activeAlarmTitle}</p>
            <button onClick={() => stopAlarm()} className="w-full max-w-xs h-16 bg-white text-[#F88E7D] rounded-[32px] font-bold text-xl shadow-2xl active:scale-95 transition-transform">STOP ALARM</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 pt-16 flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className={`w-32 h-32 rounded-[48px] p-1.5 rotate-3 group ${isPremium ? 'bg-orange-400' : 'bg-primary-gradient'}`}>
            <div className="w-full h-full rounded-[42px] bg-white flex items-center justify-center overflow-hidden border-4 border-white -rotate-3 transition-transform group-hover:rotate-0">
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white border-4 border-[#FDF5F2] flex items-center justify-center text-[#F88E7D] shadow-xl active:scale-90 transition-transform">
            <Camera size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePicUpload} />
        </div>
        <div className="flex flex-col items-center">
          {isEditingName ? (
            <input ref={nameInputRef} type="text" value={userName} onChange={(e) => setUserName(e.target.value)} onBlur={() => setIsEditingName(false)} onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)} className="text-2xl font-bold text-slate-800 tracking-tight bg-transparent border-b-2 border-[#F88E7D] outline-none text-center px-2" autoFocus />
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              <h1 className="text-[24px] font-bold text-slate-800 tracking-tight">{userName}</h1>
              <Edit2 size={18} className="text-slate-300 group-hover:text-[#F88E7D] transition-colors" />
            </div>
          )}
          {isPremium ? (
            <div className="flex items-center gap-1.5 mt-1 bg-gradient-to-br from-[#F88E7D] to-[#FFB5A7] p-[1px] rounded-full shadow-lg shadow-orange-500/20">
              <div className="bg-white rounded-full px-4 py-1 flex items-center gap-1.5"><Gem size={12} className="text-[#F88E7D] fill-[#F88E7D]" /><p className="text-[10px] text-[#F88E7D] font-bold uppercase tracking-widest">Premium Member</p></div>
            </div>
          ) : (
            <Link href="/premium" className="flex items-center gap-1.5 mt-1 bg-[#FFEDE8] border border-[#F3EAE8] px-4 py-1.5 rounded-full shadow-sm">
              <Sparkles size={12} className="text-[#F88E7D]" /><p className="text-[10px] text-[#F88E7D] font-bold uppercase tracking-widest">Free Plan • Upgrade</p>
            </Link>
          )}
        </div>
      </header>

      <div className="px-6 mt-12 space-y-8">
        {!isPremium && (
          <Link href="/premium">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-primary-gradient rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden shadow-xl shadow-orange-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="z-10"><h2 className="text-white font-bold text-lg">Go Premium ✨</h2><p className="text-white/80 text-[11px] mt-1 font-medium">Unlock Advanced Skin Metrics & Expert Coaching</p></div>
              <ChevronRight size={24} className="text-white/50 z-10" />
            </motion.div>
          </Link>
        )}

        <section className="space-y-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">My Skin Profile</h3>
          <div className="space-y-3">
            <div className="card p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center"><Shield size={24} /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Skin Type</p>
                  <select value={skinType} onChange={(e) => setSkinType(e.target.value)} className="bg-transparent text-[15px] font-bold text-slate-800 outline-none cursor-pointer">
                    <option value="Oily">Oily Skin</option><option value="Dry">Dry Skin</option><option value="Combination">Combination Skin</option><option value="Sensitive">Sensitive Skin</option>
                  </select>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-200" />
            </div>

            <div className="card p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFEDE8] text-[#F88E7D] flex items-center justify-center"><User size={24} /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Gender</p>
                  <div className="flex gap-4 mt-1">
                    <button onClick={() => setGender("male")} className={cn("text-[14px] font-bold", gender === "male" ? "text-[#F88E7D]" : "text-slate-300")}>Male</button>
                    <button onClick={() => setGender("female")} className={cn("text-[14px] font-bold", gender === "female" ? "text-[#F88E7D]" : "text-slate-300")}>Female</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Target size={24} /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Location / Country</p>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-transparent text-[15px] font-bold text-slate-800 outline-none cursor-pointer">
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="UAE">UAE</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Reminders & Alarms</h3>
          <div className="space-y-3">
            {reminders.map((rem) => (
              <div key={rem.id} className="card p-6 flex items-center justify-between group transition-all hover:bg-[#FFEDE8]/30">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${rem.active ? 'bg-[#FFEDE8] text-[#F88E7D]' : 'bg-slate-50 text-slate-300'}`}><Clock size={24} /></div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-800">{rem.title}</p>
                    <input type="time" value={rem.time} onChange={(e) => setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, time: e.target.value } : r))} className="bg-transparent text-[12px] font-medium text-slate-400 outline-none" />
                  </div>
                </div>
                <button onClick={() => setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, active: !r.active } : r))} className={`w-14 h-7 rounded-full relative transition-all duration-300 ${rem.active ? 'bg-[#F88E7D] shadow-lg shadow-orange-500/20' : 'bg-slate-200'}`}>
                  <motion.div animate={{ x: rem.active ? 30 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem("velmora_is_logged_in"); localStorage.removeItem("velmora_is_premium"); }} className="w-full h-16 card flex items-center justify-center gap-3 text-red-400 font-bold text-[15px] hover:bg-red-50 border-red-50 transition-colors mt-8">
          <LogOut size={20} /> Log Out Account
        </button>
        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest pb-10">Velmora Premium • Build v1.4.0</p>
      </div>
    </div>
  );
}
