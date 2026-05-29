"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Gem, Sparkles, Zap, ShieldCheck, 
  ArrowLeft, Star, Gift, ChevronRight, Target, BrainCircuit, Scan, Utensils
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "half" | "yearly">("yearly");

  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "₹199",
      period: "per month",
      save: null,
      popular: false
    },
    {
      id: "half",
      name: "6 Months",
      price: "₹999",
      period: "bi-annually",
      save: "Save 16%",
      popular: false
    },
    {
      id: "yearly",
      name: "Yearly Access",
      price: "₹1599",
      period: "per year",
      save: "Save 33%",
      popular: true
    }
  ];

  const features = [
    { title: "Unlimited Daily Scans", desc: "No limits on AI skin analysis", icon: Scan, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Download PDF Reports", desc: "Get professional dermatological reports", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50" },
    { title: "Unlimited AI Coach", desc: "24/7 expert chat with no daily limits", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Product Scanner", desc: "Check if products match your skin type", icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Full 7-Day Diet Plan", desc: "Unlock detailed, personalized daily nutrition", icon: Utensils, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Ad-Free Experience", desc: "100% clean, distraction-free interface", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Advanced Skin Metrics", desc: "Scan wrinkles, dark circles & skin age", icon: BrainCircuit, color: "text-pink-500", bg: "bg-pink-50" }
  ];

  const saveToCloud = async (payload: object) => {
    try {
      await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("Cloud save failed:", e);
    }
  };

  const handleSubscribe = async () => {
    alert("This is a demo. Integrating payment gateway...");
    localStorage.setItem("velmora_is_premium", "true");
    await saveToCloud({ isPremium: true });
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FF] pb-32">
      {/* Header */}
      <div className="bg-primary-gradient pt-12 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <Link href="/profile" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6">
          <ArrowLeft size={18} />
        </Link>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-2xl">
            <Gem size={28} className="text-purple-300 fill-purple-300" />
          </div>
          <h1 className="text-2xl font-extrabold mb-1">GlowAI Premium</h1>
          <p className="text-white/80 font-bold text-[10px] uppercase tracking-[0.2em]">Upgrade for clinical results</p>
        </motion.div>
      </div>

      {/* Plans */}
      <div className="px-6 -mt-10 space-y-3.5">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPlan(plan.id as any)}
            className={`relative p-4 rounded-[24px] border-2 transition-all cursor-pointer ${
              selectedPlan === plan.id 
                ? "bg-white border-purple-500 shadow-xl shadow-purple-500/10" 
                : "bg-white/70 border-white shadow-sm"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 right-6 bg-yellow-400 text-[#2C1F1A] text-[8px] font-extrabold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-tighter">
                <Sparkles size={8} /> Most Popular
              </div>
            )}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[12px] font-extrabold text-[#2C1F1A]">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <h2 className="text-xl font-extrabold text-[#2C1F1A]">{plan.price}</h2>
                  <span className="text-[9px] text-[rgba(44,31,26,0.38)] font-bold">{plan.period}</span>
                </div>
                {plan.save && (
                  <p className="text-[9px] text-green-500 font-extrabold uppercase mt-1 flex items-center gap-1">
                    <Gift size={9} /> {plan.save}
                  </p>
                )}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === plan.id ? "border-purple-600 bg-purple-600" : "border-[rgba(60,30,20,0.10)]"
              }`}>
                {selectedPlan === plan.id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="px-6 mt-8 space-y-5">
        <h3 className="text-[10px] font-extrabold text-[rgba(44,31,26,0.38)] uppercase tracking-[0.2em] px-1 text-center">Premium Benefits</h3>
        <div className="grid grid-cols-1 gap-3">
          {features.map((f, i) => (
            <div key={i} className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-[rgba(60,30,20,0.08)] shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${f.bg} ${f.color} flex items-center justify-center flex-shrink-0`}>
                <f.icon size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold text-[#2C1F1A]">{f.title}</h4>
                <p className="text-[10px] text-[rgba(44,31,26,0.55)] font-medium leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Button - Lifted to avoid BottomNav overlap */}
      <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 w-full max-w-[430px] p-6 bg-gradient-to-t from-[#F4F6FF] via-[#F4F6FF] to-transparent z-40">
        <button 
          onClick={handleSubscribe}
          className="w-full h-16 bg-primary-gradient rounded-[24px] text-white font-extrabold text-lg shadow-2xl shadow-purple-500/30 active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          Subscribe Now <ChevronRight size={20} />
        </button>
        <p className="text-center text-[10px] text-[rgba(44,31,26,0.38)] font-bold mt-4">Cancel anytime • Secure Payment</p>
      </div>
    </div>
  );
}
