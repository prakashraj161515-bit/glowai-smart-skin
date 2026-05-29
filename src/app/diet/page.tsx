"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, Icon, Card, Chip, PrimaryBtn } from "@/glow/ui";

const MOODS = ["😣", "😕", "😐", "🙂", "😄"];
const TAGS = ["Dairy", "Sugar", "Greasy", "Healthy", "Alcohol", "Stressed", "Slept well"];

export default function DiaryPage() {
  const router = useRouter();
  const [mood, setMood] = useState(3);
  const [water, setWater] = useState(6);
  const [tags, setTags] = useState<string[]>([]);
  const toggle = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const save = () => { localStorage.setItem("velmora_diary", JSON.stringify({ date: new Date().toISOString(), mood, water, tags })); router.push("/profile"); };

  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", background: T.bg, padding: "56px 20px 40px" }}>
      <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 11, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16 }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
      <h1 style={{ fontFamily: SERIF, fontSize: 30, color: T.text, margin: "0 0 4px" }}>Skin Diary</h1>
      <div style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, marginBottom: 16 }}>Today · {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, marginBottom: 12 }}>How does your skin feel?</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {MOODS.map((e, i) => <button key={i} onClick={() => setMood(i)} style={{ width: 48, height: 48, borderRadius: 14, cursor: "pointer", border: `1.5px solid ${mood === i ? T.accent : T.border}`, background: mood === i ? T.accentSoft : "transparent", fontSize: 24, lineHeight: 1 }}>{e}</button>)}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text }}>Water intake</span>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: T.accentText }}>{water} glasses</span>
        </div>
        <input type="range" min="0" max="10" value={water} onChange={e => setWater(+e.target.value)} style={{ width: "100%", accentColor: T.accent }} />
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, marginBottom: 12 }}>Today&apos;s notes</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{TAGS.map(t => <Chip key={t} active={tags.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}</div>
      </Card>
      <PrimaryBtn icon="check" onClick={save}>Save Entry</PrimaryBtn>
    </div>
  );
}
