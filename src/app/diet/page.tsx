"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Chip, PrimaryBtn } from "@/glow/ui";

const MOODS = ["😣", "😕", "😐", "🙂", "😄"];
const TAGS = ["Dairy", "Sugar", "Greasy", "Healthy", "Alcohol", "Stressed", "Slept well"];

type Entry = { date: string; mood: number; water: number; tags: string[] };

// water glasses → mood index (auto)
const moodFromWater = (g: number) => g >= 10 ? 4 : g >= 7 ? 3 : g >= 4 ? 2 : g >= 2 ? 1 : 0;

export default function DiaryPage() {
  const router = useRouter();
  const [mood, setMood] = useState(2);
  const [water, setWater] = useState(6);          // glasses (synced with routine ml)
  const [tags, setTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [popKey, setPopKey] = useState(0);

  useEffect(() => {
    try { setEntries(JSON.parse(localStorage.getItem("velmora_diary_entries") || "[]")); } catch {}
    // sync water from Daily Ritual (ml → glasses)
    const ml = parseInt(localStorage.getItem("velmora_water_intake") || "0");
    const g = Math.round(ml / 250);
    setWater(g); setMood(moodFromWater(g));
  }, []);

  const changeWater = (g: number) => {
    const v = Math.max(0, Math.min(12, g));
    setWater(v);
    setMood(moodFromWater(v));         // emoji auto-follows water
    setPopKey(k => k + 1);             // trigger bounce
    localStorage.setItem("velmora_water_intake", String(v * 250)); // sync back to routine
  };

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

  const del = (i: number) => {
    const next = entries.filter((_, x) => x !== i);
    setEntries(next);
    localStorage.setItem("velmora_diary_entries", JSON.stringify(next));
  };

  return (
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", background: T.bg, padding: "56px 20px 40px" }}>
      <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 11, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16 }}><Icon name="chevL" size={18} color={T.text} sw={2.2} /></button>
      <h1 style={{ fontFamily: SERIF, fontSize: 30, color: T.text, margin: "0 0 4px" }}>Skin Diary</h1>
      <div style={{ fontFamily: SANS, fontSize: 14, color: T.textMute, marginBottom: 16 }}>Today · {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>

      {/* mood — auto-follows water, animates */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, marginBottom: 12 }}>How does your skin feel?</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {MOODS.map((e, i) => (
            <button key={i} onClick={() => { setMood(i); setPopKey(k => k + 1); }}
              className={mood === i ? "mood-pop" : ""}
              style={{ width: 48, height: 48, borderRadius: 14, cursor: "pointer", border: `1.5px solid ${mood === i ? T.accent : T.border}`, background: mood === i ? T.accentSoft : "transparent", fontSize: 24, lineHeight: 1, transition: "border .15s, background .15s" }}>
              <span key={mood === i ? popKey : 0} className={mood === i ? "mood-pop" : ""} style={{ display: "inline-block" }}>{e}</span>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: T.textFaint, marginTop: 8 }}>Auto-set from your water intake — tap to override.</div>
      </Card>

      {/* water — synced with Daily Ritual */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text }}>Water intake</span>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: T.accentText }}>{water} glasses</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => changeWater(water - 1)} style={{ width: 40, height: 40, borderRadius: 12, border: `1.5px solid ${T.borderHi}`, background: T.surface, cursor: "pointer", fontFamily: SANS, fontSize: 20, fontWeight: 700, color: T.text }}>−</button>
          <div style={{ flex: 1, display: "flex", gap: 4 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} onClick={() => changeWater(i + 1)} style={{ flex: 1, height: 26, borderRadius: 7, cursor: "pointer", background: i < water ? "#4E8ED4" : T.surface2, transition: "background .2s" }} />
            ))}
          </div>
          <button onClick={() => changeWater(water + 1)} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "#4E8ED4", cursor: "pointer", fontFamily: SANS, fontSize: 20, fontWeight: 700, color: "#fff" }}>+</button>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: T.textFaint, marginTop: 8 }}>🔗 Linked with Daily Ritual — changes sync both ways.</div>
      </Card>

      {/* notes */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, marginBottom: 12 }}>Today&apos;s notes</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{TAGS.map(t => <Chip key={t} active={tags.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}</div>
      </Card>

      <PrimaryBtn icon="check" onClick={save} style={saved ? { background: "#7FB389", boxShadow: "0 8px 22px rgba(127,179,137,0.4)" } : undefined}>
        {saved ? "Saved ✓" : "Save Entry"}
      </PrimaryBtn>

      {/* recent entries with delete */}
      {entries.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12 }}>Recent entries</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.slice(0, 10).map((en, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 2px 10px rgba(60,30,20,0.05)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{MOODS[en.mood]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: T.text }}>{new Date(en.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: T.textMute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{en.water} glasses{en.tags.length ? " · " + en.tags.join(", ") : ""}</div>
                </div>
                <button onClick={() => del(i)} title="Delete" style={{ width: 34, height: 34, borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(224,104,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="bin" size={17} color="#E0685C" sw={1.8} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
