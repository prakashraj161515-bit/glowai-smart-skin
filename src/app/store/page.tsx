"use client";
import { useState } from "react";
import Link from "next/link";

const PASTELS = ["#FEF0EB","#EFF0FD","#EBF5FE","#EDF7EE","#FEF7EB"];
const SHELF = [
  { name:"Gentle Gel Cleanser",  brand:"Beam Labs", cat:"Cleanser",    pi:0, rating:4.5, price:"$"  },
  { name:"15% Vitamin C",        brand:"Beam Labs", cat:"Serum",       pi:1, rating:4.8, price:"$$" },
  { name:"Quiet Hero 10%",       brand:"Lumen",     cat:"Serum",       pi:2, rating:4.7, price:"$$" },
  { name:"Cloud Cream",          brand:"Lumen",     cat:"Moisturizer", pi:3, rating:4.6, price:"$$" },
  { name:"Daily Shield SPF 50",  brand:"Solé",      cat:"SPF",         pi:4, rating:4.9, price:"$$" },
  { name:"Spot Gel",             brand:"Beam Labs", cat:"Treatment",   pi:0, rating:4.3, price:"$"  },
];
const DISCOVER = [
  { name:"Clarifying BHA Toner", brand:"Beam Labs", pi:0, rating:4.6, price:"$$",  tags:["Acne","Pores"] },
  { name:"Barrier Repair Cream", brand:"Lumen",     pi:3, rating:4.8, price:"$$$", tags:["Sensitive","Dry"] },
  { name:"Brightening Essence",  brand:"Solé",      pi:4, rating:4.4, price:"$$",  tags:["Dark spots"] },
];
const CATS = ["All","Cleanser","Serum","Moisturizer","SPF","Treatment"];

const INGS = [
  {name:"Niacinamide",    s:"good",    d:"Brightening · Oil control"},
  {name:"Aqua",           s:"good",    d:"Base ingredient"},
  {name:"Glycerin",       s:"good",    d:"Humectant · Hydrating"},
  {name:"Salicylic Acid", s:"neutral", d:"Exfoliant — use with care"},
  {name:"Phenoxyethanol", s:"neutral", d:"Preservative — generally safe"},
  {name:"Fragrance",      s:"flagged", d:"Flagged — avoid (your profile)"},
];
const ING_COL: any = {good:"#5FAD72", neutral:"#D9A040", flagged:"#E0685C"};
const ING_LBL: any = {good:"Good",    neutral:"Neutral", flagged:"Flagged"};
const ING_BG:  any = {good:"rgba(95,173,114,0.12)", neutral:"rgba(217,160,64,0.12)", flagged:"rgba(224,104,92,0.12)"};

export default function StorePage() {
  const [tab, setTab]   = useState<"My Shelf"|"Discover"|"Scan">("My Shelf");
  const [cat, setCat]   = useState("All");
  const [scanned, setScanned] = useState(false);
  const shown = cat==="All" ? SHELF : SHELF.filter(p=>p.cat===cat);

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-32">
      <div className="px-5 pt-[108px]">

        {/* Title */}
        <h1 className="mb-3.5" style={{fontFamily:"'Instrument Serif',Georgia,serif", fontSize:34, color:"#2C1F1A"}}>Shelf</h1>

        {/* Segmented control */}
        <div className="flex gap-0 p-1 rounded-[14px] bg-[#F5F1EE] mb-4">
          {(["My Shelf","Discover","Scan"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-[10px] text-[14px] font-bold border-none cursor-pointer transition-all"
              style={{
                background: tab===t?"#fff":"transparent",
                color:      tab===t?"#2C1F1A":"rgba(44,31,26,0.56)",
                boxShadow:  tab===t?"0 4px 12px rgba(60,30,20,0.08)":"none",
              }}>{t}</button>
          ))}
        </div>

        {/* MY SHELF */}
        {tab === "My Shelf" && (
          <>
            {/* Conflict warning */}
            <Link href="#" className="flex items-center gap-3 p-3.5 rounded-2xl mb-3.5 no-underline"
              style={{background:"rgba(224,104,92,0.10)", border:"1px solid rgba(224,104,92,0.30)"}}>
              <span className="text-[20px]">⚠️</span>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#E0685C]">1 conflict detected</p>
                <p className="text-[12.5px] text-[rgba(44,31,26,0.56)]">Vitamin C + BHA — tap to review</p>
              </div>
              <span className="text-[#E0685C] text-[18px]">›</span>
            </Link>

            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto mb-4" style={{scrollbarWidth:"none"}}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className="px-4 py-2.5 rounded-full text-[13.5px] font-medium flex-shrink-0 border cursor-pointer transition-all"
                  style={{
                    background:   cat===c?"#F0886A":"transparent",
                    borderColor:  cat===c?"#F0886A":"rgba(60,30,20,0.08)",
                    color:        cat===c?"#241712":"rgba(44,31,26,0.56)",
                    fontWeight:   cat===c?700:500,
                  }}>{c}</button>
              ))}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-3">
              {shown.map((p,i) => (
                <div key={i} className="rounded-[22px] overflow-hidden bg-white cursor-pointer"
                  style={{boxShadow:"0 4px 20px rgba(60,30,20,0.08)", border:"1px solid rgba(60,30,20,0.06)"}}>
                  <div className="h-[120px] flex items-center justify-center text-4xl" style={{background:PASTELS[p.pi%5]}}>🧴</div>
                  <div className="p-3 pb-3.5">
                    <p className="text-[14px] font-bold text-[#2C1F1A] leading-tight">{p.name}</p>
                    <p className="text-[12px] text-[rgba(44,31,26,0.56)] mt-0.5">{p.brand}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ingredient checker button */}
            <Link href="#" className="flex items-center justify-center gap-2 mt-5 h-[50px] rounded-[14px] bg-white no-underline border"
              style={{borderColor:"rgba(60,30,20,0.13)", boxShadow:"0 4px 14px rgba(60,30,20,0.07)"}}>
              <span className="text-[#C44E28] text-[17px]">ℹ️</span>
              <span className="text-[15px] font-bold text-[#2C1F1A]">Ingredient Checker</span>
            </Link>
          </>
        )}

        {/* DISCOVER */}
        {tab === "Discover" && (
          <>
            <h2 className="text-[18px] font-bold text-[#2C1F1A] mb-4">Recommended for you</h2>
            <div className="flex flex-col gap-3">
              {DISCOVER.map((p,i) => (
                <div key={i} className="flex items-center gap-3.5 p-3 rounded-[22px] bg-white cursor-pointer"
                  style={{boxShadow:"0 4px 20px rgba(60,30,20,0.08)", border:"1px solid rgba(60,30,20,0.06)"}}>
                  <div className="w-[76px] h-[76px] rounded-[14px] flex items-center justify-center text-3xl flex-shrink-0" style={{background:PASTELS[p.pi%5]}}>🧴</div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-[#2C1F1A]">{p.name}</p>
                    <p className="text-[12.5px] text-[rgba(44,31,26,0.56)] mt-0.5">{p.brand} · {p.price}</p>
                    <p className="text-[12px] font-semibold text-[#D9B86A] mt-1.5">★ {p.rating}</p>
                  </div>
                  <button className="w-9 h-9 rounded-[11px] flex items-center justify-center border-none cursor-pointer text-[20px] font-bold"
                    style={{background:"rgba(240,136,106,0.12)", color:"#C44E28"}}>+</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SCAN */}
        {tab === "Scan" && (
          <div>
            {/* Camera viewfinder */}
            <div className="rounded-[20px] overflow-hidden relative mb-4" style={{height:220, background:"#0c0908"}}>
              <div className="absolute inset-0 bg-black/48"/>
              {/* Scanner frame */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[110px] relative">
                {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
                  <div key={i} className="absolute w-6 h-6"
                    style={{[v]:0,[h]:0,borderTop:v==="top"?`3px solid ${scanned?"#5FAD72":"#F0886A"}`:"none",borderBottom:v==="bottom"?`3px solid ${scanned?"#5FAD72":"#F0886A"}`:"none",borderLeft:h==="left"?`3px solid ${scanned?"#5FAD72":"#F0886A"}`:"none",borderRight:h==="right"?`3px solid ${scanned?"#5FAD72":"#F0886A"}`:"none"}}/>
                ))}
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[12px] font-bold"
                style={{background:"rgba(0,0,0,0.45)", color:"rgba(255,255,255,0.75)", whiteSpace:"nowrap"}}>
                Point at a product barcode
              </div>
            </div>

            {/* Manual search */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-[14px] bg-white mb-4 border" style={{borderColor:"rgba(60,30,20,0.08)"}}>
              <span className="text-[18px]">🔍</span>
              <span className="text-[15px] text-[rgba(44,31,26,0.38)]">Search product name or brand</span>
            </div>

            {/* Scanned ingredients demo */}
            <div className="flex items-center gap-3.5 mb-4 p-4 rounded-[18px] bg-white border" style={{borderColor:"rgba(60,30,20,0.08)"}}>
              <div className="w-14 h-14 rounded-[14px] flex-shrink-0" style={{background:PASTELS[0]}}/>
              <div className="flex-1">
                <p className="text-[17px] font-bold text-[#2C1F1A]">Quiet Hero 10%</p>
                <p className="text-[13px] text-[rgba(44,31,26,0.56)]">Lumen · Niacinamide Serum</p>
              </div>
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-[8px]" style={{background:"rgba(95,173,114,0.16)", color:"#8FC299"}}>Safe</span>
            </div>

            <div className="flex flex-col gap-2">
              {INGS.map((ing,i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[13px] border" style={{background:"#fff", borderColor:"rgba(60,30,20,0.08)"}}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:ING_COL[ing.s], boxShadow:`0 0 6px ${ING_COL[ing.s]}`}}/>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-[#2C1F1A]">{ing.name}</p>
                    <p className="text-[12px] text-[rgba(44,31,26,0.56)] mt-0.5">{ing.d}</p>
                  </div>
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-[8px]" style={{background:ING_BG[ing.s], color:ING_COL[ing.s]}}>{ING_LBL[ing.s]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
