"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar as CalendarIcon, Zap, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RoutinePage() {
  const [activeDay, setActiveDay] = useState(3);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [latestScan, setLatestScan] = useState<any>(null);

  useEffect(() => {
    const savedGender = localStorage.getItem("velmora_user_gender") as "male" | "female";
    if (savedGender) setGender(savedGender);
    
    const scanData = localStorage.getItem("velmora_analysis");
    if (scanData) setLatestScan(JSON.parse(scanData));
  }, []);

  const days = [
    { num: 1, label: "SUN" },
    { num: 2, label: "MON" },
    { num: 3, label: "TUE" },
    { num: 4, label: "WED" },
    { num: 5, label: "THU" },
    { num: 6, label: "FRI" },
    { num: 7, label: "SAT" },
  ];

  // Dynamic Routine Logic based on Scan + Gender
  const getRoutine = () => {
    const isOily = latestScan?.oil > 50;
    const isAcneProne = latestScan?.acne > 30;
    
    if (gender === "male") {
      return [
        { 
          time: "08:00 AM", 
          name: isAcneProne ? "Salicylic Face Wash" : "Charcoal Face Wash", 
          label: isAcneProne ? "Acne Control" : "Deep Pore Cleanse", 
          image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&q=80", 
          color: "bg-blue-50" 
        },
        { time: "08:15 AM", name: "Soothing Shave Balm", label: "Anti-Irritation", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&q=80", color: "bg-orange-50" },
        { time: "08:30 AM", name: isOily ? "Oil-Free Moisturizer" : "Hydrating Cream", label: "Moisture", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=100&q=80", color: "bg-cyan-50" },
        { time: "08:00 PM", name: "Mild Face Cleanser", label: "Evening Reset", image: "https://images.unsplash.com/photo-1556229167-279262113337?w=100&q=80", color: "bg-indigo-50" },
        { time: "08:30 PM", name: "Night Repair Gel", label: "Recovery", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100&q=80", color: "bg-purple-50" },
      ];
    } else {
      return [
        { 
          time: "08:00 AM", 
          name: isAcneProne ? "BHA Gentle Cleanser" : "Hydrating Foaming Wash", 
          label: "Morning Glow", 
          image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&q=80", 
          color: "bg-pink-50" 
        },
        { time: "08:15 AM", name: "Vitamin C Serum", label: "Protection", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&q=80", color: "bg-orange-50" },
        { time: "08:30 AM", name: "Lightweight Lotion", label: "Barrier Support", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=100&q=80", color: "bg-cyan-50" },
        { time: "08:45 AM", name: "SPF 50+ Sunscreen", label: "UV Shield", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=100&q=80", color: "bg-blue-50" },
        { time: "08:00 PM", name: "Micellar Water + Cleanser", label: "Double Cleanse", image: "https://images.unsplash.com/photo-1556229167-279262113337?w=100&q=80", color: "bg-indigo-50" },
        { time: "08:30 PM", name: isAcneProne ? "Spot Treatment" : "Niacinamide Serum", label: "Targeted Care", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100&q=80", color: "bg-purple-50" },
        { time: "09:00 PM", name: "Intense Night Repair", label: "Overnight Reset", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100&q=80", color: "bg-pink-50" },
      ];
    }
  };

  const activeRoutine = getRoutine();

  return (
    <div className="min-h-screen bg-[#FDF5F2] font-outfit pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <Link href="/" className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-[#F3EAE8]">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-slate-800">Daily Routine</h1>
          <p className="text-[10px] text-[#F88E7D] font-black uppercase tracking-widest">{gender} &bull; {latestScan ? "Custom" : "Standard"}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-sm border border-[#F3EAE8]">
          <CalendarIcon size={20} />
        </div>
      </header>

      {/* Growth Insight Card */}
      {latestScan && (
        <div className="px-6 mb-8">
          <div className="bg-white rounded-[32px] p-6 border border-[#F3EAE8] shadow-sm flex items-center justify-between overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#FDF5F2] rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800">Growth Track</p>
                <p className="text-[11px] text-slate-400 font-medium">Score: <span className="text-[#F88E7D] font-black">{latestScan.score}%</span> &bull; {latestScan.date}</p>
              </div>
            </div>
            <div className="text-emerald-500 font-black text-xs relative z-10 flex flex-col items-end">
              <span>ACTIVE</span>
              <span className="text-[9px] text-slate-300">Tracking daily</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Bar */}
      <div className="px-6 flex justify-between gap-2 mb-8">
        {days.map((day) => (
          <button 
            key={day.num}
            onClick={() => setActiveDay(day.num)}
            className={cn(
              "flex-1 py-4 rounded-[24px] flex flex-col items-center gap-1 transition-all",
              activeDay === day.num ? "bg-[#F88E7D] text-white shadow-lg shadow-orange-500/20" : "bg-white text-slate-400 border border-[#F3EAE8]"
            )}
          >
            <span className="text-[18px] font-bold">{day.num}</span>
            <span className="text-[10px] font-black tracking-widest">{day.label}</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="px-6 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-slate-800">Today&apos;s Steps</h2>
          {latestScan && latestScan.acne > 30 && (
            <div className="bg-orange-50 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
              <AlertCircle size={10} /> Acne Target Mode
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {activeRoutine.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 flex-shrink-0">
                <p className="text-[14px] font-bold text-slate-800">{item.time.split(' ')[0]}</p>
                <p className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">{item.time.split(' ')[1]}</p>
              </div>
              
              <div className={cn(
                "flex-1 p-4 rounded-[32px] flex items-center gap-4 border border-white/50 shadow-sm",
                item.color
              )}>
                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#F88E7D] uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-[14px] font-bold text-slate-800 leading-snug">{item.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
