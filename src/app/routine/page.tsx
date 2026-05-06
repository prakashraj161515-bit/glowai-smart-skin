"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar as CalendarIcon, Zap, TrendingUp, AlertCircle, Utensils, Droplets, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RoutinePage() {
  const [activeDay, setActiveDay] = useState(3);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [country, setCountry] = useState("India");
  const [latestScan, setLatestScan] = useState<any>(null);
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    const savedGender = localStorage.getItem("velmora_user_gender") as "male" | "female";
    if (savedGender) setGender(savedGender);
    
    const savedCountry = localStorage.getItem("velmora_user_country");
    if (savedCountry) setCountry(savedCountry);

    const scanData = localStorage.getItem("velmora_analysis");
    if (scanData) setLatestScan(JSON.parse(scanData));

    // Water Intake Persistence/Reset
    const today = new Date().toLocaleDateString();
    const savedWater = localStorage.getItem("velmora_water_intake");
    const savedWaterDate = localStorage.getItem("velmora_water_date");
    if (savedWaterDate === today) {
      if (savedWater) setWaterIntake(parseInt(savedWater));
    } else {
      setWaterIntake(0);
      localStorage.setItem("velmora_water_date", today);
      localStorage.setItem("velmora_water_intake", "0");
    }
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

  // Integrated Schedule Logic (Skin + Diet + Localized Food)
  const getSchedule = () => {
    const isOily = latestScan?.oil > 50;
    const isAcneProne = latestScan?.acne > 30;
    const isPigmented = latestScan?.pigmentation > 40;
    const isIndia = country === "India" || country === "Pakistan" || country === "Bangladesh";

    const schedule = [];

    // --- MORNING ---
    schedule.push({
      time: "08:00 AM",
      type: "skin",
      name: gender === "male" ? (isAcneProne ? "Salicylic Face Wash" : "Charcoal Face Wash") : (isAcneProne ? "BHA Gentle Cleanser" : "Hydrating Foaming Wash"),
      label: "Morning Cleanse",
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&q=80",
      color: "bg-blue-50"
    });

    schedule.push({
      time: "08:15 AM",
      type: "skin",
      name: isPigmented ? "Vitamin C + Niacinamide" : "Hydrating Serum",
      label: "Skin Protection",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&q=80",
      color: "bg-orange-50"
    });

    schedule.push({
      time: "08:30 AM",
      type: "skin",
      name: isOily ? "Matte Moisturizer + SPF" : "Rich Ceramide Cream + SPF",
      label: "Barrier & UV Shield",
      image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=100&q=80",
      color: "bg-cyan-50"
    });

    // --- BREAKFAST ---
    let breakfastName = isAcneProne ? "Oats with Berries" : "Avocado Toast";
    if (isIndia) {
      breakfastName = isAcneProne ? "Moong Dal Chilla / Poha" : "Dalia with Nuts";
    }

    schedule.push({
      time: "09:00 AM",
      type: "diet",
      name: breakfastName,
      label: gender === "male" ? "High Protein Breakfast" : "Healthy Glow Breakfast",
      image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=100&q=80",
      color: "bg-emerald-50"
    });

    // --- LUNCH ---
    let lunchName = isOily ? "Grilled Chicken Salad" : "Salmon with Veggies";
    if (isIndia) {
      lunchName = isOily ? "Roasted Paneer / Chicken with Salad" : "Dal, Brown Rice & Curd";
    }

    schedule.push({
      time: "01:30 PM",
      type: "diet",
      name: lunchName,
      label: "Balanced Lunch",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80",
      color: "bg-emerald-50"
    });

    // --- EVENING ---
    schedule.push({
      time: "05:00 PM",
      type: "diet",
      name: isIndia ? "Makhana (Fox Nuts) & Green Tea" : "Walnuts & Pumpkin Seeds",
      label: "Skin Superfood Snack",
      image: "https://images.unsplash.com/photo-1590779033100-9f60702a0559?w=100&q=80",
      color: "bg-orange-50"
    });

    // --- NIGHT ---
    schedule.push({
      time: "08:00 PM",
      type: "skin",
      name: "Double Cleanse (Oil + Water)",
      label: "Deep Detox",
      image: "https://images.unsplash.com/photo-1556229167-279262113337?w=100&q=80",
      color: "bg-indigo-50"
    });

    // --- DINNER ---
    let dinnerName = isAcneProne ? "Quinoa & Steamed Veggies" : "Light Vegetable Stir-fry";
    if (isIndia) {
      dinnerName = isAcneProne ? "Oatmeal Khichdi / Vegetable Soup" : "2 Jowar Roti & Boiled Veggies";
    }

    schedule.push({
      time: "08:30 PM",
      type: "diet",
      name: dinnerName,
      label: "Light Dinner",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&q=80",
      color: "bg-emerald-50"
    });

    schedule.push({
      time: "09:00 PM",
      type: "skin",
      name: isAcneProne ? "Retinol + Spot Treatment" : "Peptide Night Cream",
      label: "Overnight Repair",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100&q=80",
      color: "bg-purple-50"
    });

    return schedule;
  };

  const fullSchedule = getSchedule();

  return (
    <div className="min-h-screen bg-[#FDF5F2] font-outfit pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <Link href="/" className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-[#F3EAE8]">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-slate-800">Daily Schedule</h1>
          <p className="text-[10px] text-[#F88E7D] font-black uppercase tracking-widest">{gender} &bull; {country}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-sm border border-[#F3EAE8]">
          <CalendarIcon size={20} />
        </div>
      </header>

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

      {/* Timeline Schedule */}
      <div className="px-6 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-slate-800">Today&apos;s Journey</h2>
          {latestScan && (
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
              <Sparkles size={10} /> {latestScan.score}% Glow
            </div>
          )}
        </div>

        {/* Water Tracker Card - MOVED HERE */}
        <div className="bg-white rounded-[32px] p-6 border border-[#F3EAE8] shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Droplets size={20} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">Water Tracker</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Goal: 8 Glasses</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[18px] font-black text-blue-500">{waterIntake}</span>
              <span className="text-[12px] font-bold text-slate-300">/8</span>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all",
                  i <= waterIntake ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-slate-100"
                )} 
              />
            ))}
          </div>
          <button 
            onClick={() => {
              const newIntake = waterIntake + 1;
              setWaterIntake(newIntake);
              localStorage.setItem("velmora_water_intake", newIntake.toString());
            }}
            className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl text-[12px] font-bold transition-colors active:scale-95"
          >
            + Add a Glass (250ml)
          </button>
        </div>
        
        <div className="space-y-8 relative">
          <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-100" />

          {fullSchedule.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-6 relative"
            >
              <div className="w-16 flex-shrink-0 text-right">
                <p className="text-[13px] font-bold text-slate-800">{item.time.split(' ')[0]}</p>
                <p className="text-[9px] font-black text-slate-400 tracking-tight uppercase">{item.time.split(' ')[1]}</p>
              </div>

              <div className={cn(
                "absolute left-[28px] w-2 h-2 rounded-full border-2 border-white z-10",
                item.type === "skin" ? "bg-[#F88E7D]" : "bg-emerald-500"
              )} />
              
              <div className={cn(
                "flex-1 p-5 rounded-[32px] flex items-center gap-4 border border-white/50 shadow-sm relative group active:scale-95 transition-transform",
                item.color
              )}>
                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    {item.type === "skin" ? <Sparkles size={10} className="text-[#F88E7D]" /> : <Utensils size={10} className="text-emerald-500" />}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  </div>
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
