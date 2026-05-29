"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FEATURES = [
  "Unlimited AI skin scans",
  "Full AI routine builder",
  "Ask the AI — unlimited",
  "Trend analysis & diary insights",
  "PDF skin reports",
  "Priority product recommendations",
];

export default function PremiumPage() {
  const [plan, setPlan] = useState<"annual"|"monthly">("annual");
  const router = useRouter();

  const handleUpgrade = () => {
    localStorage.setItem("velmora_is_premium","true");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-10 overflow-y-auto">
      <div className="max-w-[430px] mx-auto px-5">

        {/* Close button */}
        <div className="flex justify-end pt-14 pb-2">
          <button onClick={() => router.back()}
            className="w-[34px] h-[34px] rounded-full bg-white border flex items-center justify-center cursor-pointer border-none"
            style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 3px 10px rgba(60,30,20,0.08)"}}>
            <span className="text-[rgba(44,31,26,0.56)] text-[16px]">×</span>
          </button>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4 text-[30px]"
            style={{background:"#F0886A", boxShadow:"0 10px 30px rgba(240,136,106,0.40)"}}>✦</div>
          <h1 className="text-[#2C1F1A] mb-2 leading-[1.05]"
            style={{fontFamily:"'Instrument Serif',Georgia,serif", fontSize:36, fontStyle:"italic"}}>
            Unlock your full<br/>skin potential
          </h1>
          <p className="text-[15px] text-[rgba(44,31,26,0.56)]">Everything you need to actually see results.</p>
        </div>

        {/* Features list */}
        <div className="rounded-[22px] bg-white p-[18px] mb-[18px] border"
          style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 20px rgba(60,30,20,0.08)"}}>
          {FEATURES.map((f,i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="text-[16px] font-bold text-[#C44E28]">✓</span>
              <span className="text-[15px] text-[#2C1F1A]">{f}</span>
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div className="flex flex-col gap-2.5 mb-[18px]">
          {([
            ["annual",  "Annual",  "$59.99/yr", "Save 50% · $5/mo", true  ],
            ["monthly", "Monthly", "$9.99/mo",  "Billed monthly",   false ],
          ] as const).map(([id,title,price,sub,best]) => (
            <button key={id} onClick={() => setPlan(id as any)}
              className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer border transition-all text-left"
              style={{
                background:   plan===id?"rgba(240,136,106,0.12)":"#fff",
                borderColor:  plan===id?"#F0886A":"rgba(60,30,20,0.08)",
                borderWidth:  "1.5px",
              }}>
              {/* Radio */}
              <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{border:`2px solid ${plan===id?"#F0886A":"rgba(60,30,20,0.13)"}`, background:plan===id?"#F0886A":"transparent"}}>
                {plan===id && <span className="text-[10px] font-extrabold text-[#241712]">✓</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-[#2C1F1A]">{title}</span>
                  {best && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[7px]"
                    style={{background:"rgba(240,136,106,0.12)", color:"#C44E28"}}>Best</span>}
                </div>
                <span className="text-[13px] text-[rgba(44,31,26,0.56)]">{sub}</span>
              </div>
              <span className="text-[15px] font-semibold text-[#2C1F1A]" style={{fontFamily:"'Space Grotesk',monospace"}}>{price}</span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button onClick={handleUpgrade}
          className="w-full h-[54px] rounded-2xl text-[17px] font-bold text-[#241712] border-none cursor-pointer"
          style={{background:"#F0886A", boxShadow:"0 8px 22px rgba(240,136,106,0.35)"}}>
          Start 7-Day Free Trial
        </button>

        <p className="text-center text-[13px] text-[rgba(44,31,26,0.33)] mt-3.5">
          Restore Purchases · Terms · Privacy
        </p>
      </div>
    </div>
  );
}
