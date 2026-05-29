"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut as nextSignOut } from "next-auth/react";
import { 
  User, Shield, LogOut, ChevronRight, Sparkles,
  Edit2, Gem, Target, Camera
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [country, setCountry] = useState("India");
  
  const [userName, setUserName] = useState("User");
  const [profilePic, setProfilePic] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const premium = localStorage.getItem("velmora_is_premium") === "true";
    const savedGender = localStorage.getItem("velmora_user_gender") as "male" | "female";
    const savedCountry = localStorage.getItem("velmora_country");
    const savedSkin = localStorage.getItem("velmora_user_skin");
    
    if (savedGender) setGender(savedGender);
    if (savedCountry) setCountry(savedCountry);
    setIsPremium(premium);

    if (status === "authenticated" && session?.user) {
      setUserName(session.user.name || "User");
      setProfilePic(session.user.image || "");
    }
    
    setIsLoaded(true);
  }, [status, session]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("velmora_user_name", userName);
      localStorage.setItem("velmora_user_pic", profilePic);
      localStorage.setItem("velmora_user_gender", gender);
      localStorage.setItem("velmora_country", country);
    }
  }, [isLoaded, userName, profilePic, gender, country]);

  const handlePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    nextSignOut();
    localStorage.clear();
  };

  if (status === "loading") return <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F0886A]"></div></div>;

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-32 font-sans">
      <header className="px-6 pt-16 flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className={`w-32 h-32 rounded-[48px] p-1.5 rotate-3 group ${isPremium ? 'bg-orange-400' : 'bg-primary-gradient'}`}>
            <div className="w-full h-full rounded-[42px] bg-white flex items-center justify-center overflow-hidden border-4 border-white -rotate-3 transition-transform group-hover:rotate-0">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#F5F1EE] flex items-center justify-center text-[rgba(44,31,26,0.30)]"><User size={48} /></div>
              )}
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white border-4 border-[#FAF8F6] flex items-center justify-center text-[#F0886A] shadow-xl active:scale-90 transition-transform">
            <Camera size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePicUpload} />
        </div>
        
        <div className="flex flex-col items-center">
          {isEditingName ? (
            <input 
              ref={nameInputRef} 
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              onBlur={() => setIsEditingName(false)} 
              onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)} 
              className="text-2xl font-bold text-[#2C1F1A] tracking-tight bg-transparent border-b-2 border-[#F0886A] outline-none text-center px-2" 
              autoFocus 
            />
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              <h1 className="text-[24px] font-bold text-[#2C1F1A] tracking-tight">{userName}</h1>
              <Edit2 size={18} className="text-[rgba(44,31,26,0.30)] group-hover:text-[#F0886A] transition-colors" />
            </div>
          )}
          <p className="text-[12px] text-[rgba(44,31,26,0.38)] font-medium mt-1">{session?.user?.email}</p>
          {isPremium ? (
            <div className="flex items-center gap-1.5 mt-2 bg-gradient-to-br from-[#F0886A] to-[#F5C0A8] p-[1px] rounded-full shadow-lg shadow-[#F0886A]/20">
              <div className="bg-white rounded-full px-4 py-1 flex items-center gap-1.5"><Gem size={12} className="text-[#F0886A] fill-[#F0886A]" /><p className="text-[10px] text-[#F0886A] font-bold uppercase tracking-widest">Premium Member</p></div>
            </div>
          ) : (
            <Link href="/premium" className="flex items-center gap-1.5 mt-2 bg-[rgba(240,136,106,0.10)] border border-[rgba(60,30,20,0.08)] px-4 py-1.5 rounded-full shadow-sm">
              <Sparkles size={12} className="text-[#F0886A]" /><p className="text-[10px] text-[#F0886A] font-bold uppercase tracking-widest">Free Plan • Upgrade</p>
            </Link>
          )}
        </div>
      </header>

      <div className="px-6 mt-12 space-y-8">
        {!isPremium && (
          <Link href="/premium">
            <motion.div whileTap={{ scale: 0.98 }} className="bg-primary-gradient rounded-[22px] p-6 flex items-center justify-between relative overflow-hidden shadow-[0_4px_16px_rgba(60,30,20,0.07)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="z-10"><h2 className="text-white font-bold text-lg">Go Premium ✨</h2><p className="text-white/80 text-[11px] mt-1 font-medium">Unlock Advanced Skin Metrics & Expert Coaching</p></div>
              <ChevronRight size={24} className="text-white/50 z-10" />
            </motion.div>
          </Link>
        )}

        <section className="space-y-4">
          <h3 className="text-[11px] font-bold text-[rgba(44,31,26,0.38)] uppercase tracking-[0.2em] px-1">My Skin Profile</h3>
          <div className="space-y-3">


            <div className="card p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[rgba(240,136,106,0.10)] text-[#F0886A] flex items-center justify-center"><User size={24} /></div>
                <div>
                  <p className="text-[10px] text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-tight">Gender</p>
                  <div className="flex gap-4 mt-1">
                    <button onClick={() => setGender("male")} className={cn("text-[14px] font-bold", gender === "male" ? "text-[#F0886A]" : "text-[rgba(44,31,26,0.30)]")}>Male</button>
                    <button onClick={() => setGender("female")} className={cn("text-[14px] font-bold", gender === "female" ? "text-[#F0886A]" : "text-[rgba(44,31,26,0.30)]")}>Female</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Target size={24} /></div>
                <div>
                  <p className="text-[10px] text-[rgba(44,31,26,0.38)] font-bold uppercase tracking-tight">Location / Country</p>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-transparent text-[15px] font-bold text-[#2C1F1A] outline-none cursor-pointer">
                    {["India","USA","UK","UAE","Pakistan","Bangladesh","Canada","Australia","Singapore","Germany","France","Italy","Spain","Japan","South Korea","Brazil"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <button 
          onClick={() => setShowLogoutConfirm(true)} 
          className="w-full h-16 card flex items-center justify-center gap-3 text-red-400 font-bold text-[15px] hover:bg-red-50 border-red-50 transition-colors mt-8"
        >
          <LogOut size={20} /> Log Out Account
        </button>

        <p className="text-center text-[10px] text-[rgba(44,31,26,0.30)] font-bold uppercase tracking-widest pb-10">Velmora Premium • Build v1.4.0</p>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 rounded-[22px] flex items-center justify-center mx-auto mb-6 text-red-400">
                <LogOut size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#2C1F1A] mb-2">Logout?</h3>
              <p className="text-[13px] text-[rgba(44,31,26,0.38)] font-medium mb-8 leading-relaxed">Are you sure you want to log out? You will need to login again to access your routines.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleLogout}
                  className="w-full h-14 bg-red-400 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
                >
                  Yes, Log Out
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full h-14 bg-[#F5F1EE] text-[rgba(44,31,26,0.38)] font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
