"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Chip, PrimaryBtn } from "@/glow/ui";

const MOODS = ["😣", "😕", "😐", "🙂", "😄"];
const TAGS = ["Dairy", "Sugar", "Greasy", "Healthy", "Alcohol", "Stressed", "Slept well"];

type Entry = { date: string; mood: number; water: number; tags: string[] };

export default function DiaryPage() {
  const router = useRouter();
  const [mood, setMood] = useState(3);
  const [water, setWater] = useState(6);
  const [tags, setTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    try { setEntries(JSON.parse(localStorage.getItem("velmora_diary_entries") || "[]")); } catch {}
  }, []);

  const toggle = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const save = () => {
    const entry: Entry = { date: new Date().toISOString(), mood, water, tags };
    const next = [entry, ...entries].slice(0, 30);
    setEntries(next);
    localStorage.setItem("velmora_diary_entries", JSON.stringify(next));
    localStorage.setItem("velmora_diary", JSON.stringify(entry));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", background: T.bg, padding: "56px 20px 40px" }}>
      <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 11, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16 }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
      <h1 style={{ fontFamily: SERIF, fontSize: 30, color: T.text, margin: "0 0 4px" }}>Skin Diary</h1>
      <div style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, marginBottom: 16 }}>Today · {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, marginBottom: 12 }}>How does your skin feel?</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {MOODS.map((e, i) => <button key={i} onClick={() => setMood(i)} style={{ width: 48, height: 48, borderRadius: 14, cursor: "pointer", border: `1.5px solid ${mood === i ? T.accent : T.border}`, background: mood === i ? T.accentSoft : "transparent", fontSize: 24, lineHeight: 1, transform: mood === i ? "scale(1.08)" : "scale(1)", transition: "all .15s" }}>{e}</button>)}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text }}>Water intake</span>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: T.accentText }}>{water} glasses</span>
        </div>
        <input type="range" min="0" max="12" value={water} onChange={e => setWater(+e.target.value)} style={{ width: "100%", accentColor: T.accent }} />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, marginBottom: 12 }}>Today&apos;s notes</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{TAGS.map(t => <Chip key={t} active={tags.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}</div>
      </Card>

      <PrimaryBtn icon="check" onClick={save} style={saved ? { background: "#7FB389", boxShadow: "0 8px 22px rgba(127,179,137,0.4)" } : undefined}>
        {saved ? "Saved ✓" : "Save Entry"}
      </PrimaryBtn>

      {/* recent entries */}
      {entries.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12 }}>Recent entries</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.slice(0, 7).map((en, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 2px 10px rgba(60,30,20,0.05)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{MOODS[en.mood]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: T.text }}>{new Date(en.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: T.textMute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{en.water} glasses{en.tags.length ? " · " + en.tags.join(", ") : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
