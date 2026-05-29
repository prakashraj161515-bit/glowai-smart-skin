"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const MOODS  = ["😣","😕","😐","🙂","😄"];
const TAGS   = ["Dairy","Sugar","Greasy","Healthy","Alcohol","Stressed","Slept well","Exercised"];
const TARGET = 3000;

export default function DiaryPage() {
  const [mood,  setMood]  = useState(2);
  const [water, setWater] = useState(6);
  const [tags,  setTags]  = useState<Set<string>>(new Set());

  const toggleTag = (t:string) => {
    const next = new Set(tags);
    next.has(t) ? next.delete(t) : next.add(t);
    setTags(next);
  };

  const save = () => {
    const entry = { date:new Date().toISOString(), mood, water, tags:[...tags] };
    const prev  = JSON.parse(localStorage.getItem("velmora_diary")||"[]");
    localStorage.setItem("velmora_diary", JSON.stringify([entry, ...prev.slice(0,29)]));
    alert("Entry saved! ✓");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] pb-32 px-5 pt-[96px]">

      {/* Title */}
      <h1 className="text-[#2C1F1A] mb-0.5" style={{fontFamily:"'Instrument Serif',Georgia,serif", fontSize:30}}>Skin Diary</h1>
      <p className="text-[14px] text-[rgba(44,31,26,0.56)] mb-4">Today · {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long"})}</p>

      {/* Mood */}
      <div className="rounded-[22px] bg-white p-[18px] mb-4 border" style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 20px rgba(60,30,20,0.08)"}}>
        <p className="text-[14px] font-bold text-[#2C1F1A] mb-3">How does your skin feel?</p>
        <div className="flex justify-between">
          {MOODS.map((e,i) => (
            <button key={i} onClick={() => setMood(i)}
              className="w-12 h-12 rounded-[14px] text-[24px] flex items-center justify-center cursor-pointer border transition-all"
              style={{
                borderColor:  mood===i?"#F0886A":"rgba(60,30,20,0.08)",
                borderWidth:  "1.5px",
                background:   mood===i?"rgba(240,136,106,0.12)":"transparent",
              }}>{e}</button>
          ))}
        </div>
      </div>

      {/* Water intake */}
      <div className="rounded-[22px] bg-white p-[18px] mb-4 border" style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 20px rgba(60,30,20,0.08)"}}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[14px] font-bold text-[#2C1F1A]">Water intake</p>
          <p className="text-[14px] font-semibold text-[#C44E28]" style={{fontFamily:"'Space Grotesk',monospace"}}>{water} glasses</p>
        </div>
        {/* Glass indicators */}
        <div className="flex gap-1.5 mb-3">
          {Array.from({length:12}).map((_,i) => (
            <button key={i} onClick={() => setWater(i+1)}
              className="flex-1 h-2 rounded-full border-none cursor-pointer transition-all"
              style={{background:i<water?"#F0886A":"#F5F1EE"}}/>
          ))}
        </div>
        <p className="text-[12px] text-[rgba(44,31,26,0.56)]">{water>=12?"🎉 Daily goal reached!":`${12-water} more to go`}</p>
      </div>

      {/* Notes tags */}
      <div className="rounded-[22px] bg-white p-[18px] mb-5 border" style={{borderColor:"rgba(60,30,20,0.08)", boxShadow:"0 4px 20px rgba(60,30,20,0.08)"}}>
        <p className="text-[14px] font-bold text-[#2C1F1A] mb-3">Today&apos;s notes</p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(t => (
            <button key={t} onClick={() => toggleTag(t)}
              className="px-4 py-2.5 rounded-full text-[13.5px] font-medium border cursor-pointer transition-all"
              style={{
                background:  tags.has(t)?"#F0886A":"transparent",
                borderColor: tags.has(t)?"#F0886A":"rgba(60,30,20,0.08)",
                color:       tags.has(t)?"#241712":"rgba(44,31,26,0.56)",
                fontWeight:  tags.has(t)?700:500,
                borderWidth:"1.5px",
              }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={save}
        className="w-full h-[54px] rounded-2xl text-[17px] font-bold text-[#241712] border-none cursor-pointer flex items-center justify-center gap-2"
        style={{background:"#F0886A", boxShadow:"0 8px 22px rgba(240,136,106,0.35)"}}>
        ✓&nbsp; Save Entry
      </button>
    </div>
  );
}
