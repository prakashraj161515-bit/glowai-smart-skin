"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, Crown, Sparkles, Zap, ShieldCheck, 
  ArrowLeft, Star, Gift, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "half" | "yearly">("yearly");

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
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
      name: "Yearly",
      price: "₹1599",
      period: "per year",
      save: "Save 33%",
      popular: true
    }
  ];

  const features = [
    { title: "Advanced Skin Metrics", desc: "Scan wrinkles, dark circles & skin age", icon: Sparkles },
    { title: "Download PDF Reports", desc: "Get professional dermatological reports", icon: ShieldCheck },
    { title: "Unlimited AI Coach", desc: "24/7 expert chat with no daily limits", icon: Zap },
    { title: "Product Ingredient Scanner", desc: "Check if products match your skin type", icon: Star },
    { title: "Priority AI Processing", desc: "Deep analysis from 4,000+ clinical images", icon: DatabaseIcon }
  ];

  const handleSubscribe = () => {
    alert("This is a demo. Integrating payment gateway...");
    localStorage.setItem("glowai_is_premium", "true");
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FF] pb-32">
      {/* Header */}
      <div className="bg-primary-gradient pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <Link href="/profile" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6">
          <ArrowLeft size={20} />
        </Link>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-2xl">
            <Crown size={32} className="text-yellow-300 fill-yellow-300" />
          </div>
          <h1 className="text-3xl font-black mb-2">GlowAI Premium</h1>
          <p className="text-white/80 font-bold text-sm uppercase tracking-widest">Upgrade for clinical results</p>
        </motion.div>
      </div>

      {/* Plans */}
      <div className="px-6 -mt-12 space-y-4">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPlan(plan.id as any)}
            className={`relative p-5 rounded-[28px] border-2 transition-all cursor-pointer ${
              selectedPlan === plan.id 
                ? "bg-white border-purple-500 shadow-xl shadow-purple-500/10" 
                : "bg-white/70 border-white shadow-sm"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 right-6 bg-yellow-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-tighter">
                <Sparkles size={10} /> Most Popular
              </div>
            )}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-black text-slate-900">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h2 className="text-2xl font-black text-slate-900">{plan.price}</h2>
                  <span className="text-[10px] text-slate-400 font-bold">{plan.period}</span>
                </div>
                {plan.save && (
                  <p className="text-[10px] text-green-500 font-black uppercase mt-1 flex items-center gap-1">
                    <Gift size={10} /> {plan.save}
                  </p>
                )}
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === plan.id ? "border-purple-600 bg-purple-600" : "border-slate-200"
              }`}>
                {selectedPlan === plan.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="px-6 mt-10 space-y-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 text-center">Premium Benefits</h3>
        <div className="space-y-4">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                <f.icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{f.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F4F6FF] via-[#F4F6FF] to-transparent">
        <button 
          onClick={handleSubscribe}
          className="w-full h-16 bg-primary-gradient rounded-[24px] text-white font-black text-lg shadow-2xl shadow-purple-500/30 active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          Subscribe Now <ChevronRight size={20} />
        </button>
        <p className="text-center text-[10px] text-slate-400 font-bold mt-4">Cancel anytime. Terms & Conditions apply.</p>
      </div>
    </div>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
