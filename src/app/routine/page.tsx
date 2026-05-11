"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Utensils, Droplets, Sparkles, CheckCircle2, MessageSquare, BrainCircuit, X, RefreshCcw, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RoutinePage() {
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [gender, setGender] = useState<"male" | "female">("female");
  const [country, setCountry] = useState("India");
  const [latestScan, setLatestScan] = useState<any>(null);
  const [waterIntake, setWaterIntake] = useState(0);
  
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
    const savedCountry = localStorage.getItem("velmora_country");
    if (savedCountry) setCountry(savedCountry);
    const scanData = localStorage.getItem("velmora_analysis");
    if (scanData) setLatestScan(JSON.parse(scanData));

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
    setActiveDay(new Date().getDay());
  }, []);

  const fullSchedule = useMemo(() => {
    const isOily = latestScan?.oil > 50;
    const isDry = latestScan?.oil < 30;
    const isAcneProne = latestScan?.acne > 30;
    const isPigmented = latestScan?.pigmentation > 40;

    const schedule = [];
    let fwName = "Deep Pore Charcoal Wash";
    let fwImage = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80";
    let crName = "Hydrating Gel Moisturizer";
    let crImage = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80";

    if (isAcneProne) {
      fwName = "Salicylic Acid Purifying Wash";
      fwImage = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80";
      crName = "Zinc & Niacinamide Healing Gel";
      crImage = "https://images.unsplash.com/photo-1556228578-567ba127e37f?w=200&q=80";
    } else if (isDry) { 
      fwName = "Creamy Oat Cleanser"; 
      fwImage = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80";
      crName = "Ceramide Rich Barrier Cream"; 
      crImage = "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=200&q=80";
    } else if (isOily) { 
      fwName = "Salicylic Acid Purifying Wash"; 
      fwImage = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80";
      crName = "Oil-Free Niacinamide Gel"; 
      crImage = "https://images.unsplash.com/photo-1556228578-567ba127e37f?w=200&q=80";
    } else if (isPigmented) { 
      fwName = "Vitamin C Brightening Wash"; 
      fwImage = "https://images.unsplash.com/photo-1611080626919-7cf5a969fc8f?w=200&q=80";
      crName = "Kojic Acid Night Repair"; 
      crImage = "https://images.unsplash.com/photo-1594125356715-c0852e690082?w=200&q=80";
    }

    schedule.push({ time: "08:00 AM", type: "skincare", name: fwName, label: "Morning Cleansing", image: fwImage, color: "bg-blue-50" });
    schedule.push({ time: "08:15 AM", type: "skincare", name: crName, label: "Day Protection Cream", image: crImage, color: "bg-blue-50" });
    schedule.push({ time: "01:00 PM", type: "skincare", name: "Aqua Fresh Face Wash", label: "Mid-Day Oil Control", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80", color: "bg-cyan-50" });
    schedule.push({ time: "01:15 PM", type: "skincare", name: "Lightweight Hydrator", label: "Post-Wash Care", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80", color: "bg-cyan-50" });
    
    const countryDiets: Record<string, any[]> = {
      "India": [
        { b: "Papaya & Pomegranate", l: "Boiled Lauki (Bottle Gourd)", s: "Crunchy Gajar & Cucumber", d: "Steamed Palak Soup" },
        { b: "Seb (Apple) & Banana", l: "Sautéed Gobi & Matar", s: "Beetroot & Kheera Salad", d: "Mixed Veg Soup" },
        { b: "Watermelon (Tarbooj)", l: "Boiled Turai (Ridge Gourd)", s: "Ankurit Moong (Sprouts)", d: "Stir-fry Beans" },
        { b: "Guava (Amrud) Slices", l: "Steamed Patta Gobi", s: "Roasted Makhana (Fox Nuts)", d: "Gajar & Methi Sabzi" },
        { b: "Orange & Pomegranate", l: "Sautéed Kundru (Ivy Gourd)", s: "Radish (Mooli) Sticks", d: "Lauki Ka Soup" },
        { b: "Green Seb & Grapes", l: "Boiled Karela (Bitter Gourd)", s: "Steamed Moong Dal", d: "Pumpkin Stew" },
        { b: "Fresh Papaya Bowl", l: "Moringa Leaves Soup", s: "Cucumber & Mint Salad", d: "Mixed Dal Bowl" }
      ],
      "USA": [
        { b: "Greek Yogurt & Berries", l: "Grilled Salmon & Asparagus", s: "Handful of Almonds", d: "Quinoa Veggie Bowl" },
        { b: "Avocado Toast", l: "Turkey Avocado Wrap", s: "Apple Slices with Peanut Butter", d: "Roasted Chicken & Broccoli" },
        { b: "Oatmeal with Walnuts", l: "Kale & Chickpea Salad", s: "Carrot Sticks & Hummus", d: "Baked Sweet Potato & Beans" },
        { b: "Smoothie Bowl", l: "Tuna Salad (No Mayo)", s: "Greek Yogurt", d: "Lentil Pasta & Zucchini" },
        { b: "Eggs & Spinach", l: "Chicken Breast & Quinoa", s: "Cottage Cheese & Peaches", d: "Grilled Shrimp & Salad" },
        { b: "Protein Pancakes", l: "Buddha Bowl with Tofu", s: "Trail Mix", d: "Mushroom & Kale Risotto" },
        { b: "Chia Seed Pudding", l: "Beef & Vegetable Stir-fry", s: "Hard Boiled Egg", d: "Roasted Vegetable Salad" }
      ],
      "UK": [
        { b: "Porridge with Honey", l: "Baked Potato with Beans", s: "Pear Slices", d: "Vegetable Shepherds Pie" },
        { b: "Poached Eggs on Rye", l: "Roast Beef & Root Veg", s: "Oatcakes & Cheese", d: "Cod & Mushy Peas" },
        { b: "Bran Flakes & Milk", l: "Chicken & Barley Soup", s: "Yogurt & Walnuts", d: "Grilled Sausages & Mash" },
        { b: "Muesli with Raspberries", l: "Ploughman's Lunch", s: "Apple & Cheddar", d: "Steak & Kidney Pie" },
        { b: "Scrambled Eggs", l: "Lamb & Vegetable Stew", s: "Scone & Jam", d: "Fish Cakes & Greens" },
        { b: "Grilled Mushrooms & Toast", l: "Coronation Chicken Salad", s: "Tea & Digestive", d: "Cottage Pie" },
        { b: "Kipper on Toast", l: "Lancashire Hotpot", s: "Blueberry Muffin", d: "Bangers & Mash" }
      ]
    };

    // Fallback to India diet if country not found
    const diets = countryDiets[country] || countryDiets["India"];
    
    // Diet now depends on the active day AND the refresh seed for shuffling
    const diet = diets[(activeDay + dietSeed) % 7];

    const getDietImage = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("papaya")) return "https://images.unsplash.com/photo-1517282004455-f8238689bb4e?w=400&q=80";
      if (n.includes("apple") || n.includes("seb")) return "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80";
      if (n.includes("banana")) return "https://images.unsplash.com/photo-1571771894821-ad99024177c6?w=400&q=80";
      if (n.includes("watermelon") || n.includes("tarbooj")) return "https://images.unsplash.com/photo-1589733901241-5e5647c4464a?w=400&q=80";
      if (n.includes("pomegranate")) return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80";
      if (n.includes("orange") || n.includes("lemon")) return "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&q=80";
      if (n.includes("guava") || n.includes("amrud")) return "https://images.unsplash.com/photo-1536511132770-e5066929976b?w=400&q=80";
      if (n.includes("soup") || n.includes("stew") || n.includes("dal")) return "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80";
      if (n.includes("gourd") || n.includes("lauki") || n.includes("pumpkin")) return "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80";
      if (n.includes("salad") || n.includes("carrot") || n.includes("cucumber")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80";
      if (n.includes("chicken") || n.includes("beef") || n.includes("turkey") || n.includes("salmon") || n.includes("shrimp")) return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80";
      if (n.includes("yogurt") || n.includes("chia") || n.includes("oatmeal") || n.includes("pudding")) return "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80";
      if (n.includes("toast") || n.includes("pie") || n.includes("muffin") || n.includes("pasta")) return "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80";
      return "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&q=80";
    };

    const waterImg = "/water-glass.png";
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
  }, [latestScan, dietSeed, activeDay, country]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      const currentTimeStr = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

      fullSchedule.forEach(item => {
        if (reminders.includes(item.name) && item.time === currentTimeStr && !activeAlarm) {
          triggerAlarm(item.name);
        }
      });
    };

    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [reminders, activeAlarm, fullSchedule]);

  const toggleItem = (name: string) => {
    const updated = completedItems.includes(name) ? completedItems.filter(i => i !== name) : [...completedItems, name];
    setCompletedItems(updated);
    localStorage.setItem("velmora_completed_routine", JSON.stringify(updated));
  };

  const toggleReminder = (name: string) => {
    const updated = reminders.includes(name) ? reminders.filter(i => i !== name) : [...reminders, name];
    setReminders(updated);
    localStorage.setItem("velmora_reminders", JSON.stringify(updated));
    if (!reminders.includes(name)) {
      const chime = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      chime.volume = 0.2;
      chime.play().catch(() => {});
    }
  };

  const triggerAlarm = (name: string) => {
    if (activeAlarm) return;
    setActiveAlarm(name);
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
    audio.loop = true;
    audio.play().catch(() => {});
    setAlarmAudio(audio);
  };

  const stopAlarm = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
      setAlarmAudio(null);
    }
    setActiveAlarm(null);
  };

  const formatMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 font-bold">$1</strong>');
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 mb-1.5 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F88E7D] mt-2 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[*-]\s*/, "") }} />
          </div>
        );
      }
      return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  const getDailyFeedback = async () => {
    setIsAnalyzing(true);
    setAiFeedback("");
    setShowFeedback(true);
    
    const dietItems = fullSchedule.filter(i => i.type === "diet" && !i.name.includes("Glass"));
    const completedDiet = dietItems.filter(item => completedItems.includes(item.name));
    const pendingDiet = dietItems.filter(item => !completedItems.includes(item.name));

    const summary = `
**Today's Diet Summary:**
${completedDiet.length > 0 ? "✅ **Completed:**\n" + completedDiet.map(i => "- " + i.name).join("\n") : ""}
${pendingDiet.length > 0 ? "⏳ **Pending:**\n" + pendingDiet.map(i => "- " + i.name).join("\n") : ""}

**AI Analysis:**
Analyzing your choices for ${country} lifestyle...
    `;
    setAiFeedback(summary);

    const context = `User from ${country} is following a ${gender} diet plan. Today they completed ${completedDiet.length} out of ${dietItems.length} diet items. Completed: ${completedDiet.map(i=>i.name).join(", ")}. Pending: ${pendingDiet.map(i=>i.name).join(", ")}. Provide brief, encouraging feedback.`;
    
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customPrompt: context }) });
      const data = await res.json();
      setAiFeedback(summary.replace("Analyzing your choices for " + country + " lifestyle...", data.text));
    } catch {
      setAiFeedback(summary.replace("Analyzing your choices for " + country + " lifestyle...", "Great effort today! Keep sticking to the plan for better results. ✨"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const days = [{ label: "SUN" }, { label: "MON" }, { label: "TUE" }, { label: "WED" }, { label: "THU" }, { label: "FRI" }, { label: "SAT" }];

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

      <div className="px-4 grid grid-cols-7 gap-1 mb-8">
        {days.map((day, idx) => (
          <button key={idx} onClick={() => setActiveDay(idx)} className={cn("py-3 rounded-[20px] flex flex-col items-center justify-center gap-1 transition-all", activeDay === idx ? "bg-[#F88E7D] text-white shadow-lg shadow-orange-500/20" : "bg-white text-slate-400 border border-[#F3EAE8]")}>
            <span className="text-[9px] font-black tracking-tighter">{day.label}</span>
            {activeDay === idx && <div className="w-1 h-1 rounded-full bg-white mt-0.5" />}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-4">
        <h2 className="text-[20px] font-bold text-slate-800 mb-4">Today&apos;s Progress</h2>
        <div className="bg-white rounded-[32px] p-6 border border-[#F3EAE8] shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Droplets size={20} /></div>
              <div><h3 className="text-[14px] font-bold text-slate-900">Water</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{waterIntake}ml / 2000ml</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { if(waterIntake >= 250) { const n = waterIntake - 250; setWaterIntake(n); localStorage.setItem("velmora_water_intake", n.toString()); } }} className="bg-slate-50 px-3 py-1.5 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">-250ml</button>
              <button onClick={() => { const n = waterIntake + 250; setWaterIntake(n); localStorage.setItem("velmora_water_intake", n.toString()); }} className="bg-blue-50 px-3 py-1.5 rounded-xl text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-colors">+250ml</button>
            </div>
          </div>
          <div className="flex gap-1.5 h-1.5">
            {[250,500,750,1000,1250,1500,1750,2000].map((i) => (<div key={i} className={cn("flex-1 rounded-full transition-all duration-500", i <= waterIntake ? "bg-blue-400" : "bg-slate-100")} />))}
          </div>
        </div>
        
        <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] mb-8">
          <button onClick={() => setActiveTab("skincare")} className={cn("flex-1 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all", activeTab === "skincare" ? "bg-white text-[#F88E7D] shadow-sm" : "text-slate-400")}>Facewash</button>
          <button onClick={() => setActiveTab("diet")} className={cn("flex-1 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all", activeTab === "diet" ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400")}>Diet Plan</button>
        </div>

        <div className="space-y-6 relative">
          <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-100" />
          {fullSchedule.filter(item => item.type === activeTab).map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center gap-6 relative">
              <div className="w-16 flex-shrink-0 text-right">
                <p className="text-[13px] font-bold text-slate-800">{item.time.split(' ')[0]}</p>
                <p className="text-[9px] font-black text-slate-400 tracking-tight uppercase">{item.time.split(' ')[1]}</p>
              </div>
              <div className={cn("absolute left-[28px] w-2 h-2 rounded-full border-2 border-white z-10", completedItems.includes(item.name) ? "bg-emerald-500" : (item.type === "skincare" ? "bg-[#F88E7D]" : "bg-emerald-500 opacity-30"))} />
              <div onClick={() => toggleItem(item.name)} className={cn("flex-1 p-5 rounded-[32px] flex items-center gap-4 border transition-all cursor-pointer relative overflow-hidden bg-white shadow-sm hover:border-[#F88E7D]/30", completedItems.includes(item.name) && "opacity-60")}>
                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden flex-shrink-0 shadow-inner"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <button onClick={(e) => { e.stopPropagation(); toggleReminder(item.name); }} className={cn("p-1.5 rounded-full", reminders.includes(item.name) ? "bg-slate-800 text-white" : "text-slate-300")}>
                      {reminders.includes(item.name) ? <Bell size={14} className="animate-bounce fill-white" /> : <BellOff size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className={cn("text-[14px] font-bold text-slate-800 leading-snug", completedItems.includes(item.name) && "line-through")}>{item.name}</p>
                    <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center", completedItems.includes(item.name) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200")}>{completedItems.includes(item.name) && <CheckCircle2 size={16} />}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeAlarm && (
          <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.8, opacity:0}} className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[200] bg-[#F88E7D]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
            <Bell size={48} className="animate-bounce mb-8" />
            <h2 className="text-4xl font-black mb-2">Time for {activeAlarm}!</h2>
            <button onClick={stopAlarm} className="w-full h-20 bg-white text-[#F88E7D] rounded-[32px] text-2xl font-black uppercase shadow-2xl active:scale-95 transition-transform">Stop Alarm</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{opacity:0, y: 100}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 100}} className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[150] bg-white flex flex-col p-8">
            <div className="flex justify-between mb-8"><h3 className="text-lg font-black">AI Skin Coach</h3><button onClick={()=>setShowFeedback(false)}><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto no-scrollbar">{aiFeedback ? formatMarkdown(aiFeedback) : "Analyzing..."}</div>
            <button onClick={()=>setShowFeedback(false)} className="w-full h-16 bg-[#F88E7D] text-white rounded-[24px] font-black uppercase shadow-xl mt-8">Got it!</button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showFeedback && !activeAlarm && (
        <button onClick={getDailyFeedback} className="fixed bottom-32 left-1/2 translate-x-[110px] w-16 h-16 bg-primary-gradient rounded-full flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 z-50 animate-pulse active:scale-90 transition-transform">
          <Sparkles size={32} className="fill-white" />
        </button>
      )}
    </div>
  );
}
