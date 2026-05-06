"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Calendar as CalendarIcon, Zap, TrendingUp, AlertCircle, Utensils, Droplets, Sparkles, CheckCircle2, MessageSquare, BrainCircuit, X, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RoutinePage() {
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [gender, setGender] = useState<"male" | "female">("female");
  const [country, setCountry] = useState("India");
  const [latestScan, setLatestScan] = useState<any>(null);
  const [waterIntake, setWaterIntake] = useState(0);
  
  // New States for Completion & AI
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const savedGender = localStorage.getItem("velmora_user_gender") as "male" | "female";
    if (savedGender) setGender(savedGender);
    
    const savedCountry = localStorage.getItem("velmora_user_country");
    if (savedCountry) setCountry(savedCountry);

    const scanData = localStorage.getItem("velmora_analysis");
    if (scanData) setLatestScan(JSON.parse(scanData));

    // Water Intake & Completion Persistence
    const today = new Date().toLocaleDateString();
    const savedWaterDate = localStorage.getItem("velmora_water_date");
    
    if (savedWaterDate === today) {
      const savedWater = localStorage.getItem("velmora_water_intake");
      if (savedWater) setWaterIntake(parseInt(savedWater));
      
      const savedCompleted = localStorage.getItem("velmora_completed_routine");
      if (savedCompleted) setCompletedItems(JSON.parse(savedCompleted));
    } else {
      setWaterIntake(0);
      setCompletedItems([]);
      localStorage.setItem("velmora_water_date", today);
      localStorage.setItem("velmora_water_intake", "0");
      localStorage.setItem("velmora_completed_routine", "[]");
    }

    // Set active day to current day
    setActiveDay(new Date().getDay());
  }, []);

  const toggleItem = (name: string) => {
    const updated = completedItems.includes(name) 
      ? completedItems.filter(i => i !== name)
      : [...completedItems, name];
    
    setCompletedItems(updated);
    localStorage.setItem("velmora_completed_routine", JSON.stringify(updated));
  };

  const formatMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 font-bold">$1</strong>');
      
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 mb-1.5 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F88E7D] mt-2 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[*-]\s*/, "") }} />
          </div>
        );
      }
      
      if (line.trim() === "") return <div key={i} className="h-2" />;
      
      return (
        <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  const getDailyFeedback = async () => {
    setIsAnalyzing(true);
    setAiFeedback("");
    setShowFeedback(true);
    
    const dietItems = fullSchedule.filter(i => i.type === "diet").map(i => i.name);
    const completedDiet = completedItems.filter(name => dietItems.includes(name));
    
    const totalItems = fullSchedule.length;
    const completedCount = completedItems.length;
    
    const context = `User is in ${country} and is following a skin-focused diet. 
    Total Diet Goals: ${dietItems.join(", ")}. 
    Completed Diet Today: ${completedDiet.length > 0 ? completedDiet.join(", ") : "None yet"}.
    Water intake: ${waterIntake} glasses.
    Total steps completed (Skin+Diet): ${completedCount}/${totalItems}.
    Analyze how their diet was today for their skin health in ${country}. Provide a short, encouraging feedback (2-3 lines) about their diet performance and what to adjust tomorrow.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPrompt: context })
      });
      const data = await res.json();
      setAiFeedback(data.text);
    } catch {
      setAiFeedback("Great effort today! Keep sticking to your routine for best results. ✨");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const days = [
    { label: "SUN" }, { label: "MON" }, { label: "TUE" },
    { label: "WED" }, { label: "THU" }, { label: "FRI" },
    { label: "SAT" },
  ];

  const getSchedule = () => {
    const isOily = latestScan?.oil > 50;
    const isAcneProne = latestScan?.acne > 30;
    const isPigmented = latestScan?.pigmentation > 40;
    const isIndia = country === "India" || country === "Pakistan" || country === "Bangladesh";

    const schedule = [];
    
    // Targeted Skincare names
    let fwName = "Hydrating Wash";
    let crName = "Barrier Cream";
    if (isAcneProne) { fwName = "Salicylic Acid Cleanser"; crName = "Benzoyl Peroxide Spot Treatment"; }
    else if (isOily) { fwName = "Oil-Control Foam"; crName = "Matte Gel Moisturizer"; }
    else if (isPigmented) { fwName = "Brightening Vitamin C Wash"; crName = "Kojic Acid Night Serum"; }

    schedule.push({ time: "08:00 AM", type: "skin", name: fwName, label: "Morning Cleanse", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&q=80", color: "bg-blue-50" });
    schedule.push({ time: "08:15 AM", type: "skin", name: isPigmented ? "Niacinamide Serum" : "Hyaluronic Acid", label: "Skin Protection", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&q=80", color: "bg-orange-50" });
    schedule.push({ time: "08:30 AM", type: "skin", name: crName + " + SPF", label: "Barrier & UV Shield", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=100&q=80", color: "bg-cyan-50" });
    
    // 7 Days Different Healthy Vegetable Diets (Targeted by Skin Problem)
    const today = new Date().getDay(); // 0-6
    
    const getTargetedDiet = () => {
      // Base diets for 7 days
      const diets = [
        { b: "Spinach Smoothie", l: "Lauki (Bottle Gourd) Sabzi", s: "Carrots", d: "Vegetable Soup" },
        { b: "Oats with Veggies", l: "Cabbage & Peas", s: "Cucumber", d: "Pumpkin Mash" },
        { b: "Sprouts Salad", l: "Turai (Ridge Gourd) & Dal", s: "Beetroot", d: "Stir-fry Greens" },
        { b: "Vegetable Poha", l: "Cauliflower & Matar", s: "Bell Peppers", d: "Spinach Salad" },
        { b: "Besan Chilla", l: "Kundru (Ivy Gourd) Sabzi", s: "Radish", d: "Lentil Stew" },
        { b: "Green Juice", l: "Karela (Bitter Gourd) Sabzi", s: "Roasted Makhana", d: "Zucchini Salad" },
        { b: "Vegetable Upma", l: "Moringa (Drumstick) Dal", s: "Asparagus", d: "Kale Salad" }
      ];
      
      const dayDiet = diets[today];
      
      // Personalize names based on skin problem
      if (isAcneProne) {
        dayDiet.l += " (Zinc Rich)";
        dayDiet.d += " (Anti-Inflammatory)";
      } else if (isOily) {
        dayDiet.l += " (Oil-Control)";
        dayDiet.s += " (Hydrating)";
      } else if (isPigmented) {
        dayDiet.b += " (Vit-C Boost)";
        dayDiet.l += " (Skin Brightening)";
      }
      
      return dayDiet;
    };

    const diet = getTargetedDiet();

    schedule.push({ time: "09:00 AM", type: "diet", name: diet.b, label: "Breakfast", image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=100&q=80", color: "bg-emerald-50" });
    schedule.push({ time: "01:30 PM", type: "diet", name: diet.l, label: "Balanced Lunch", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80", color: "bg-emerald-50" });
    schedule.push({ time: "05:00 PM", type: "diet", name: diet.s, label: "Evening Snack", image: "https://images.unsplash.com/photo-1590779033100-9f60702a0559?w=100&q=80", color: "bg-orange-50" });
    
    schedule.push({ time: "08:00 PM", type: "skin", name: "Double Cleanse", label: "Deep Detox", image: "https://images.unsplash.com/photo-1556229167-279262113337?w=100&q=80", color: "bg-indigo-50" });
    schedule.push({ time: "08:30 PM", type: "diet", name: diet.d, label: "Light Dinner", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&q=80", color: "bg-emerald-50" });
    schedule.push({ time: "09:00 PM", type: "skin", name: crName, label: "Overnight Repair", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100&q=80", color: "bg-purple-50" });

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
        <button onClick={getDailyFeedback} className="w-12 h-12 rounded-full bg-[#F88E7D] flex items-center justify-center text-white shadow-lg shadow-orange-500/20 active:scale-90 transition-transform">
          <BrainCircuit size={20} />
        </button>
      </header>

      {/* Calendar Bar */}
      <div className="px-6 flex justify-between gap-2 mb-8">
        {days.map((day, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveDay(idx)}
            className={cn(
              "flex-1 py-4 rounded-[24px] flex flex-col items-center justify-center gap-1 transition-all",
              activeDay === idx ? "bg-[#F88E7D] text-white shadow-lg shadow-orange-500/20" : "bg-white text-slate-400 border border-[#F3EAE8]"
            )}
          >
            <span className="text-[11px] font-black tracking-widest">{day.label}</span>
            {activeDay === idx && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1" />}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-4">
        {/* AI Feedback Overlay */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 20}} className="bg-white rounded-[32px] p-6 border-2 border-[#F88E7D]/20 shadow-xl mb-6 relative">
              <button onClick={()=>setShowFeedback(false)} className="absolute top-4 right-4 text-slate-300"><X size={18} /></button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#FFEDE8] rounded-xl flex items-center justify-center text-[#F88E7D]"><MessageSquare size={20} /></div>
                <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-tight">AI Skin Coach Feedback</h3>
              </div>
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs animate-pulse py-2">
                  <RefreshCcw size={14} className="animate-spin" /> Analyzing your consistency...
                </div>
              ) : (
                <div className="text-[13px] text-slate-600 leading-relaxed italic font-medium">
                  {aiFeedback ? formatMarkdown(aiFeedback) : "Analysis complete."}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="text-[20px] font-bold text-slate-800 mb-4">Today&apos;s Progress</h2>

        {/* Water Tracker Card */}
        <div className="bg-white rounded-[32px] p-6 border border-[#F3EAE8] shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Droplets size={20} /></div>
              <div><h3 className="text-[14px] font-bold text-slate-800">Water Tracker</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Goal: 8 Glasses</p></div>
            </div>
            <div className="text-right"><span className="text-[18px] font-black text-blue-500">{waterIntake}</span><span className="text-[12px] font-bold text-slate-300">/8</span></div>
          </div>
          <div className="flex gap-2 mb-6">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className={cn("flex-1 h-1.5 rounded-full transition-all", i <= waterIntake ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-slate-100")} />
            ))}
          </div>
          <button onClick={() => { const n = waterIntake + 1; setWaterIntake(n); localStorage.setItem("velmora_water_intake", n.toString()); }} className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl text-[12px] font-bold active:scale-95 transition-transform">+ Add a Glass</button>
        </div>
        
        <div className="space-y-6 relative">
          <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-100" />
          {fullSchedule.map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center gap-6 relative">
              <div className="w-16 flex-shrink-0 text-right">
                <p className="text-[13px] font-bold text-slate-800">{item.time.split(' ')[0]}</p>
                <p className="text-[9px] font-black text-slate-400 tracking-tight uppercase">{item.time.split(' ')[1]}</p>
              </div>
              <div className={cn("absolute left-[28px] w-2 h-2 rounded-full border-2 border-white z-10", completedItems.includes(item.name) ? "bg-emerald-500" : (item.type === "skin" ? "bg-[#F88E7D]" : "bg-emerald-500 opacity-30"))} />
              
              <div 
                onClick={() => toggleItem(item.name)}
                className={cn(
                  "flex-1 p-5 rounded-[32px] flex items-center gap-4 border transition-all cursor-pointer relative overflow-hidden",
                  completedItems.includes(item.name) ? "bg-emerald-50 border-emerald-100 shadow-inner scale-[0.98]" : cn("bg-white border-white shadow-sm hover:border-[#F88E7D]/30", item.color)
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden flex-shrink-0 shadow-inner">
                  <img src={item.image} alt={item.name} className={cn("w-full h-full object-cover transition-opacity", completedItems.includes(item.name) ? "opacity-40 grayscale" : "opacity-100")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    {item.type === "skin" ? <Sparkles size={10} className="text-[#F88E7D]" /> : <Utensils size={10} className="text-emerald-500" />}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  </div>
                  <p className={cn("text-[14px] font-bold text-slate-800 leading-snug", completedItems.includes(item.name) && "line-through opacity-50")}>{item.name}</p>
                </div>
                {completedItems.includes(item.name) && (
                  <div className="text-emerald-500"><CheckCircle2 size={24} /></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
