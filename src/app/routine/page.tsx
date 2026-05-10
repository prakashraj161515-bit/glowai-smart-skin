"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Calendar as CalendarIcon, Zap, TrendingUp, AlertCircle, Utensils, Droplets, Sparkles, CheckCircle2, MessageSquare, BrainCircuit, X, RefreshCcw, Bell, BellOff } from "lucide-react";
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
  const [reminders, setReminders] = useState<string[]>([]);
  const [dietSeed, setDietSeed] = useState(0);
  const [activeAlarm, setActiveAlarm] = useState<string | null>(null);
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);

  const [activeTab, setActiveTab] = useState<"skincare" | "diet">("skincare");

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
    
    const savedReminders = localStorage.getItem("velmora_reminders");
    if (savedReminders) setReminders(JSON.parse(savedReminders));

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

  const toggleReminder = (name: string) => {
    const updated = reminders.includes(name)
      ? reminders.filter(i => i !== name)
      : [...reminders, name];
    setReminders(updated);
    localStorage.setItem("velmora_reminders", JSON.stringify(updated));
    
    if (!reminders.includes(name)) {
      // Simulate enabling alarm - small chime
      const chime = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      chime.volume = 0.2;
      chime.play().catch(() => {});
      
      // Simulate a real alarm triggering (for demo)
      setTimeout(() => {
        triggerAlarm(name);
      }, 5000); // Trigger after 5s for demo
    }
  };

  const triggerAlarm = (name: string) => {
    setActiveAlarm(name);
    // New premium ringtone: Soft Zen Chime
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
    audio.loop = true;
    audio.play().catch(() => {});
    setAlarmAudio(audio);
    
    // Auto stop after 1 min
    setTimeout(() => stopAlarm(), 60000);
  };

  const stopAlarm = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      setAlarmAudio(null);
    }
    setActiveAlarm(null);
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
    const isDry = latestScan?.oil < 30;
    const isAcneProne = latestScan?.acne > 30;
    const isPigmented = latestScan?.pigmentation > 40;
    const isIndia = country === "India" || country === "Pakistan" || country === "Bangladesh";

    const schedule = [];
    
    // Targeted Skincare names (Doctor Approved)
    let fwName = "Deep Pore Charcoal Wash";
    let fwImage = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80";
    let crName = "Hydrating Gel Moisturizer";
    let crImage = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80";

    if (isAcneProne) {
      fwName = "Salicylic Acid Purifying Wash";
      fwImage = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80";
      crName = "Zinc & Niacinamide Healing Gel";
      crImage = "https://images.unsplash.com/photo-1556228578-567ba127e37f?w=200&q=80";
    }
    else if (isDry) { 
      fwName = "Creamy Oat Cleanser"; 
      fwImage = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80";
      crName = "Ceramide Rich Barrier Cream"; 
      crImage = "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=200&q=80";
    }
    else if (isOily) { 
      fwName = "Salicylic Acid Purifying Wash"; 
      fwImage = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80";
      crName = "Oil-Free Niacinamide Gel"; 
      crImage = "https://images.unsplash.com/photo-1556228578-567ba127e37f?w=200&q=80";
    }
    else if (isPigmented) { 
      fwName = "Vitamin C Brightening Wash"; 
      fwImage = "https://images.unsplash.com/photo-1611080626919-7cf5a969fc8f?w=200&q=80";
      crName = "Kojic Acid Night Repair"; 
      crImage = "https://images.unsplash.com/photo-1594125356715-c0852e690082?w=200&q=80";
    }

    // Skincare Steps
    schedule.push({ time: "08:00 AM", type: "skincare", name: fwName, label: "Morning Cleansing", image: fwImage, color: "bg-blue-50" });
    schedule.push({ time: "08:15 AM", type: "skincare", name: crName, label: "Day Protection Cream", image: crImage, color: "bg-blue-50" });
    
    schedule.push({ time: "01:00 PM", type: "skincare", name: "Aqua Fresh Face Wash", label: "Mid-Day Oil Control", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80", color: "bg-cyan-50" });
    schedule.push({ time: "01:15 PM", type: "skincare", name: "Lightweight Hydrator", label: "Post-Wash Care", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80", color: "bg-cyan-50" });
    
    // 7 Days Different Healthy Vegetable Diets (Targeted by Skin Problem)
    const today = new Date().getDay(); // 0-6
    
    const getTargetedDiet = () => {
      // Base diets for 7 days
      const diets = [
        { b: "Fresh Papaya & Pomegranate", l: "Boiled Lauki (Bottle Gourd)", s: "Crunchy Gajar & Cucumber", d: "Steamed Palak Soup" },
        { b: "Seb (Apple) & Banana", l: "Sautéed Gobi & Matar", s: "Beetroot & Kheera Salad", d: "Mixed Veg Soup (Gajar-Tamatar)" },
        { b: "Watermelon (Tarbooj)", l: "Boiled Turai (Ridge Gourd)", s: "Ankurit Moong (Sprouts)", d: "Stir-fry Beans & Carrot" },
        { b: "Guava (Amrud) Slices", l: "Steamed Patta Gobi", s: "Roasted Makhana (Fox Nuts)", d: "Gajar & Methi Sabzi" },
        { b: "Orange & Pomegranate", l: "Sautéed Kundru (Ivy Gourd)", s: "Radish (Mooli) Sticks", d: "Lauki Ka Soup" },
        { b: "Green Seb & Grapes", l: "Boiled Karela (Bitter Gourd)", s: "Steamed Moong Dal", d: "Pumpkin (Kaddu) Stew" },
        { b: "Fresh Papaya Bowl", l: "Moringa (Sahjan) Leaves Soup", s: "Cucumber & Mint Salad", d: "Mixed Dal & Veggie Bowl" }
      ];
      
      // Auto-refresh seed based on date string (YYYY-MM-DD)
      const dateStr = new Date().toISOString().split('T')[0];
      const seed = dateStr.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const dayIdx = (seed + (typeof dietSeed !== 'undefined' ? dietSeed : 0)) % 7;
      return diets[dayIdx];
    };

    const diet = getTargetedDiet();

    const getDietImage = (name) => {
      const n = name.toLowerCase();
      // Fruits
      if (n.includes("papaya")) return "https://images.unsplash.com/photo-1517282004455-f8238689bb4e?w=400&q=80";
      if (n.includes("apple")) return "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80";
      if (n.includes("banana")) return "https://images.unsplash.com/photo-1571771894821-ad99024177c6?w=400&q=80";
      if (n.includes("watermelon") || n.includes("melon")) return "https://images.unsplash.com/photo-1589733901241-5e5647c4464a?w=400&q=80";
      if (n.includes("pineapple")) return "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80";
      if (n.includes("pomegranate")) return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80";
      if (n.includes("citrus") || n.includes("orange") || n.includes("lemon")) return "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&q=80";
      if (n.includes("kiwi")) return "https://images.unsplash.com/photo-1585052245554-bc5a0c226e90?w=400&q=80";
      if (n.includes("guava")) return "https://images.unsplash.com/photo-1536511132770-e5066929976b?w=400&q=80";
      
      // Vegetables / Cooked Meals
      if (n.includes("soup") || n.includes("stew") || n.includes("moringa") || n.includes("dal")) return "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80";
      if (n.includes("gourd") || n.includes("lauki") || n.includes("turai") || n.includes("kaddu") || n.includes("pumpkin")) return "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80";
      if (n.includes("spinach") || n.includes("kale") || n.includes("green") || n.includes("palak") || n.includes("methi")) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
      if (n.includes("salad") || n.includes("carrot") || n.includes("gajar") || n.includes("cucumber") || n.includes("kheera") || n.includes("beetroot") || n.includes("mooli")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80";
      if (n.includes("sprouts") || n.includes("moong") || n.includes("makhana")) return "https://images.unsplash.com/photo-1590779033100-9f60702a0559?w=400&q=80";
      if (n.includes("broccoli") || n.includes("cauliflower") || n.includes("gobi") || n.includes("matar")) return "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&q=80";
      
      // Hindi Keywords
      if (n.includes("amrud")) return "https://images.unsplash.com/photo-1536511132770-e5066929976b?w=400&q=80";
      if (n.includes("seb")) return "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80";
      if (n.includes("tarbooj")) return "https://images.unsplash.com/photo-1589733901241-5e5647c4464a?w=400&q=80";
      
      // Default / Mixed Fruit
      if (n.includes("fruit")) return "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&q=80";
      return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80";
    };

    const waterImg = "/water-glass.png";

    // 8 Glasses of Water (Doctor Approved Timing)
    schedule.push({ time: "07:00 AM", type: "diet", name: "Glass 1: Wake Up Water", label: "Metabolism Boost", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "08:30 AM", type: "diet", name: "Glass 2: Post-Breakfast", label: "Morning Hydration", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "09:00 AM", type: "diet", name: diet.b, label: "Breakfast", image: getDietImage(diet.b), color: "bg-emerald-50" });
    schedule.push({ time: "11:00 AM", type: "diet", name: "Glass 3: Mid-Morning", label: "Brain Power", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "01:00 PM", type: "diet", name: "Glass 4: Pre-Lunch", label: "Digestion Support", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "01:30 PM", type: "diet", name: diet.l, label: "Balanced Lunch", image: getDietImage(diet.l), color: "bg-emerald-50" });
    schedule.push({ time: "04:00 PM", type: "diet", name: "Glass 5: Afternoon", label: "Energy Lift", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "05:00 PM", type: "diet", name: diet.s, label: "Evening Snack", image: getDietImage(diet.s), color: "bg-orange-50" });
    schedule.push({ time: "06:00 PM", type: "diet", name: "Glass 6: Evening", label: "Cravings Control", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "08:00 PM", type: "diet", name: "Glass 7: Pre-Dinner", label: "Weight Management", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "08:30 PM", type: "diet", name: diet.d, label: "Light Dinner", image: getDietImage(diet.d), color: "bg-emerald-50" });
    
    schedule.push({ time: "09:35 PM", type: "skincare", name: "Derm-Grade Gentle Cleanser", label: "Doctor's Night Wash", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80", color: "bg-indigo-50" });
    schedule.push({ time: "10:00 PM", type: "skincare", name: crName.includes("Night") ? crName : "Hyaluronic Night Repair", label: "Night Recovery Cream", image: crImage, color: "bg-indigo-50" });
    schedule.push({ time: "10:30 PM", type: "diet", name: "Glass 8: Night", label: "Cell Recovery", image: waterImg, color: "bg-blue-50" });

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
        <button onClick={() => setDietSeed(s => s + 1)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#F88E7D] shadow-sm border border-[#F3EAE8] active:scale-90 transition-transform">
          <RefreshCcw size={20} />
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

        {/* Water Tracker - Premium UI */}
        <div className="bg-white rounded-[32px] p-6 border border-[#F3EAE8] shadow-sm relative overflow-hidden group mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <Droplets size={20} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">Water Intake</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{waterIntake} / 8 Glasses</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { if(waterIntake > 0) { const n = waterIntake - 1; setWaterIntake(n); localStorage.setItem("velmora_water_intake", n.toString()); } }} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-bold">-</button>
              <button onClick={() => { const n = waterIntake + 1; setWaterIntake(n); localStorage.setItem("velmora_water_intake", n.toString()); }} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">+</button>
            </div>
          </div>
          <div className="flex gap-1.5 h-1.5">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className={cn("flex-1 rounded-full transition-all duration-500", i <= waterIntake ? "bg-blue-400" : "bg-slate-100")} />
            ))}
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] mb-8 border border-slate-200/50">
          <button 
            onClick={() => setActiveTab("skincare")}
            className={cn(
              "flex-1 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex flex-col items-center gap-1",
              activeTab === "skincare" ? "bg-white text-[#F88E7D] shadow-sm" : "text-slate-400"
            )}
          >
            <span>Facewash</span>
            <span className="text-[8px] opacity-60 font-bold -mt-1">(Skin Routine)</span>
          </button>
          <button 
            onClick={() => setActiveTab("diet")}
            className={cn(
              "flex-1 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex flex-col items-center gap-1",
              activeTab === "diet" ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400"
            )}
          >
            <span>Diet Plan</span>
            <span className="text-[8px] opacity-60 font-bold -mt-1">(Khane Ka Plan)</span>
          </button>
        </div>

        <h2 className="text-[20px] font-bold text-slate-800 mb-4">
          {activeTab === "skincare" ? "Daily Facewash Routine" : "Full Day Diet Plan"}
        </h2>
        
        <div className="space-y-6 relative">
          <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-100" />
          {fullSchedule.filter(item => item.type === activeTab).map((item, idx) => (
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
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.type === "skin" ? <Sparkles size={10} className="text-[#F88E7D]" /> : <Utensils size={10} className="text-emerald-500" />}
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleReminder(item.name); }}
                      className={cn(
                        "p-1.5 rounded-full transition-colors",
                        reminders.includes(item.name) ? "bg-slate-800 text-white" : "text-slate-300 hover:text-slate-800"
                      )}
                    >
                      {reminders.includes(item.name) ? <Bell size={14} className="animate-bounce fill-white" /> : <BellOff size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className={cn("text-[14px] font-bold text-slate-800 leading-snug", completedItems.includes(item.name) && "line-through opacity-50")}>{item.name}</p>
                    <div 
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                          completedItems.includes(item.name) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 bg-white"
                        )}
                      >
                        {completedItems.includes(item.name) && <CheckCircle2 size={16} />}
                      </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Alarm Overlay */}
      <AnimatePresence>
        {activeAlarm && (
          <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="fixed inset-0 z-[200] bg-[#F88E7D]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#F88E7D] mb-8 animate-bounce shadow-2xl">
              <Bell size={48} />
            </div>
            <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Diet Time!</h2>
            <p className="text-xl font-bold mb-12 opacity-90">{activeAlarm}</p>
            <button 
              onClick={stopAlarm}
              className="w-full h-20 bg-white text-[#F88E7D] rounded-[32px] text-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform"
            >
              Stop Alarm
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Coach Overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{opacity:0, y: 100}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 100}} className="fixed inset-0 z-[150] bg-white flex flex-col">
            <div className="px-6 pt-16 pb-6 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFEDE8] rounded-2xl flex items-center justify-center text-[#F88E7D]"><BrainCircuit size={28} /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">AI Skin Coach</h3>
                  <p className="text-[10px] text-[#F88E7D] font-black uppercase tracking-widest italic">Personalized Report</p>
                </div>
              </div>
              <button onClick={()=>setShowFeedback(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
              <div className="text-[15px] text-slate-600 leading-relaxed font-medium">
                {aiFeedback ? formatMarkdown(aiFeedback) : (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#FFEDE8] border-t-[#F88E7D] rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating Strategy...</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 border-t border-slate-50">
              <button onClick={()=>setShowFeedback(false)} className="w-full h-16 bg-[#F88E7D] text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-transform">
                Got it, Thanks! ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Coach Trigger Button (Bottom Right) */}
      {!showFeedback && !activeAlarm && (
        <button 
          onClick={getDailyFeedback}
          className="fixed bottom-32 right-6 w-16 h-16 bg-[#F88E7D] rounded-full flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 z-50 active:scale-90 transition-transform"
        >
          <BrainCircuit size={28} />
        </button>
      )}
    </div>
  );
}
