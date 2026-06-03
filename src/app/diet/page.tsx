"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, SERIF, MONO, SANS, rgba, Icon, Card, Chip, PrimaryBtn } from "@/glow/ui";
import { isPremium } from "@/glow/premium";

const MOODS = ["😣", "😕", "😐", "🙂", "😄"];
const MOOD_BG = ["rgba(224,104,92,0.18)", "rgba(232,162,76,0.18)", "rgba(180,160,140,0.18)", "rgba(127,179,137,0.18)", "rgba(95,173,114,0.24)"];
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
    // Free members keep only the last 7 entries; Premium keeps up to 365
    const cap = isPremium() ? 365 : 7;
    const next = [entry, ...entries].slice(0, cap);
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
    <div className="glow-scroll" style={{ minHeight: "100vh", overflowY: "auto", background: T.bg, paddingBottom: 40 }}>
      {/* gradient hero */}
      <div style={{ background: "linear-gradient(165deg, #E8DFF6 0%, #F3D9E4 55%, #FAF8F6 100%)", padding: "56px 20px 46px", position: "relative" }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 14 }}><Icon name="chevL" size={18} color="#2C1F1A" sw={2.2} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 30 }}>{MOODS[mood]}</span>
          <div>
            <h1 style={{ fontFamily: SERIF, fontSize: 32, color: "#2C1F1A", margin: 0, lineHeight: 1 }}>Skin Diary</h1>
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: "rgba(44,31,26,0.6)", fontWeight: 600, marginTop: 3 }}>Today · {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px", marginTop: -20, position: "relative", zIndex: 2 }}>
      {/* mood — auto-follows water, animates */}
      <Card style={{ marginBottom: 16, boxShadow: "0 12px 30px rgba(60,30,20,0.1)" }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 650, color: T.text, marginBottom: 12 }}>How does your skin feel?</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {MOODS.map((e, i) => (
            <button key={i} onClick={() => { setMood(i); setPopKey(k => k + 1); }}
              className={mood === i ? "mood-pop" : ""}
              style={{ width: 48, height: 48, borderRadius: 14, cursor: "pointer", border: `1.5px solid ${mood === i ? T.accent : T.border}`, background: mood === i ? MOOD_BG[i] : "transparent", fontSize: 24, lineHeight: 1, transition: "border .15s, background .15s", transform: mood === i ? "scale(1.08)" : "scale(1)" }}>
              <span key={mood === i ? popKey : 0} className={mood === i ? "mood-pop" : ""} style={{ display: "inline-block" }}>{e}</span>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: T.textFaint, marginTop: 8 }}>Auto-set from your water intake — tap to override.</div>
      </Card>

      {/* water — synced with Daily Ritual (blue gradient hero card) */}
      <div style={{ marginBottom: 16, borderRadius: 22, padding: 18, background: "linear-gradient(150deg, #5B9BD5 0%, #4E8ED4 60%, #3F7CC4 100%)", boxShadow: "0 10px 28px rgba(78,142,212,0.35)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, borderRadius: 99, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, position: "relative" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: SANS, fontSize: 15, fontWeight: 700, color: "#fff" }}><Icon name="drop" size={18} color="#fff" fill />Water intake</span>
          <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: "#fff" }}>{water} <span style={{ fontSize: 12, opacity: 0.85 }}>glasses</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <button onClick={() => changeWater(water - 1)} style={{ width: 40, height: 40, borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", cursor: "pointer", fontFamily: SANS, fontSize: 20, fontWeight: 700, color: "#fff" }}>−</button>
          <div style={{ flex: 1, display: "flex", gap: 4 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} onClick={() => changeWater(i + 1)} style={{ flex: 1, height: 28, borderRadius: 7, cursor: "pointer", background: i < water ? "#fff" : "rgba(255,255,255,0.22)", transition: "background .2s", boxShadow: i < water ? "0 2px 6px rgba(0,0,0,0.12)" : "none" }} />
            ))}
          </div>
          <button onClick={() => changeWater(water + 1)} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "#fff", cursor: "pointer", fontFamily: SANS, fontSize: 20, fontWeight: 700, color: "#4E8ED4" }}>+</button>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 10, position: "relative" }}>🔗 Linked with Daily Ritual — changes sync both ways.</div>
      </div>

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: T.text }}>Recent entries</span>
            {!isPremium() && (
              <button onClick={() => router.push("/premium")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: T.accentText, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="crown" size={12} color={T.accentText} fill /> 7 saved · unlimited in Premium
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.slice(0, 10).map((en, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 2px 10px rgba(60,30,20,0.05)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: MOOD_BG[en.mood], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{MOODS[en.mood]}</div>
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
    </div>
  );
}
