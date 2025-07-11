import React, { useState, useRef } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { FaUser, FaAward, FaFileExport, FaTrophy, FaPlus, FaSave } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

// Demo player/team data
const PLAYERS = [
  {
    id: "p1", name: "Marko Horvat", team: "U14", badges: ["Shooter", "Ironman"],
    skills: {
      Technical: 82, Tactical: 65, Physical: 71, Mental: 78
    },
    assessments: [
      { domain: "Technical", note: "Shooting >80%. Work on off-hand dribble." },
      { domain: "Mental", note: "Very coachable, responds to feedback." }
    ],
    goals: [
      { text: "Raise Tactical from 65→75", done: false },
      { text: "Consistent game leadership", done: false }
    ]
  },
  {
    id: "p2", name: "Luka Petrović", team: "U16", badges: ["Leader"],
    skills: {
      Technical: 69, Tactical: 85, Physical: 76, Mental: 81
    },
    assessments: [{ domain: "Tactical", note: "Excellent game reading." }],
    goals: [
      { text: "Increase Physical from 76→80", done: false }
    ]
  }
];

// Skill domains for radar
const DOMAINS = [
  { key: "Technical", color: "#FFD700" },
  { key: "Tactical", color: "#48b5ff" },
  { key: "Physical", color: "#27ef7d" },
  { key: "Mental", color: "#e94057" }
];

// All possible badges
const BADGES = [
  { key: "Shooter", label: "Shooter", icon: <FaTrophy />, color: "#FFD700" },
  { key: "Leader", label: "Leader", icon: <FaAward />, color: "#48b5ff" },
  { key: "Ironman", label: "Ironman", icon: <FaTrophy />, color: "#e94057" }
];

const fadeIn = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

const SkillsPassport = () => {
  const [playerId, setPlayerId] = useState(PLAYERS[0].id);
  const [players, setPlayers] = useState(PLAYERS);
  const [addGoal, setAddGoal] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addBadge, setAddBadge] = useState("");
  const sectionRef = useRef();

  const player = players.find(p => p.id === playerId);

  // PDF export
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `SkillsPassport_${player.name}_${new Date().toISOString().slice(0, 10)}`
  });

  // Analytics: strengths, gaps, badge unlock
  const skillsArr = DOMAINS.map(d => ({ domain: d.key, value: player.skills[d.key] }));
  const maxDomain = skillsArr.reduce((a, b) => (a.value > b.value ? a : b), { value: -1 });
  const minDomain = skillsArr.reduce((a, b) => (a.value < b.value ? a : b), { value: 101 });

  // Add goal, note, badge
  function handleAddGoal() {
    if (!addGoal) return;
    setPlayers(ps => ps.map(p =>
      p.id === playerId ? { ...p, goals: [...p.goals, { text: addGoal, done: false }] } : p
    ));
    setAddGoal("");
  }
  function handleToggleGoal(idx) {
    setPlayers(ps => ps.map(p =>
      p.id === playerId ? { ...p, goals: p.goals.map((g, i) => i === idx ? { ...g, done: !g.done } : g) } : p
    ));
  }
  function handleAddNote(domain) {
    if (!addNote) return;
    setPlayers(ps => ps.map(p =>
      p.id === playerId ? { ...p, assessments: [...p.assessments, { domain, note: addNote }] } : p
    ));
    setAddNote("");
  }
  function handleAddBadge(badgeKey) {
    if (!badgeKey || player.badges.includes(badgeKey)) return;
    setPlayers(ps => ps.map(p =>
      p.id === playerId ? { ...p, badges: [...p.badges, badgeKey] } : p
    ));
    setAddBadge("");
  }

  return (
    <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <div style={{ fontSize: 27, color: "#FFD700", fontWeight: 700, marginBottom: 12 }}>
          Skills Passport
        </div>
        {/* Player selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 17 }}>
          <FaUser style={{ color: "#FFD700", fontSize: 20, marginRight: 4 }} />
          <select
            value={playerId}
            onChange={e => setPlayerId(e.target.value)}
            style={{ fontSize: 17, borderRadius: 6, padding: "7px 10px", fontWeight: 600 }}>
            {players.map(p => (
              <option value={p.id} key={p.id}>{p.name} ({p.team})</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "7px 18px", fontSize: 16, cursor: "pointer" }}>
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} /> Export PDF
          </button>
        </div>
        {/* Radar & Bars */}
        <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 16 }}>
          <div style={{ width: 260, height: 260, background: "#1a1d24", borderRadius: "50%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsArr}>
                <PolarGrid />
                <PolarAngleAxis dataKey="domain" stroke="#FFD700" fontSize={14} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Skill" dataKey="value" stroke="#FFD700" fill="#FFD700" fillOpacity={0.28} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Progress bars */}
          <div style={{ flex: 1 }}>
            {DOMAINS.map(d => (
              <div key={d.key} style={{ marginBottom: 11 }}>
                <div style={{ color: d.color, fontWeight: 700 }}>{d.key}</div>
                <div style={{
                  width: "100%", background: "#222", borderRadius: 8,
                  overflow: "hidden", height: 16, marginTop: 2
                }}>
                  <div style={{
                    width: `${player.skills[d.key]}%`, background: d.color, height: "100%",
                    borderRadius: 8, transition: "width 0.5s"
                  }} />
                </div>
                <div style={{ color: "#FFD700cc", fontSize: 14 }}>
                  {player.skills[d.key]} / 100
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Badges */}
        <div style={{ marginBottom: 15 }}>
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 5 }}>Badges</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 9 }}>
            {player.badges.map(badgeKey => {
              const badge = BADGES.find(b => b.key === badgeKey);
              if (!badge) return null;
              return (
                <span key={badge.key} style={{
                  background: badge.color, color: "#222", fontWeight: 700,
                  borderRadius: 7, padding: "5px 13px", display: "flex", alignItems: "center", gap: 6
                }}>
                  {badge.icon} {badge.label}
                </span>
              );
            })}
          </div>
          {/* Add badge */}
          <form onSubmit={e => { e.preventDefault(); handleAddBadge(addBadge); }}>
            <select value={addBadge} onChange={e => setAddBadge(e.target.value)}
              style={{ fontSize: 15, borderRadius: 5, marginRight: 7 }}>
              <option value="">Add badge...</option>
              {BADGES.filter(b => !player.badges.includes(b.key)).map(b =>
                <option key={b.key} value={b.key}>{b.label}</option>
              )}
            </select>
            <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 14, padding: "5px 13px" }}><FaPlus /> Add</button>
          </form>
        </div>
        {/* Analytics */}
        <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 7 }}>
          <b>Strength:</b> {maxDomain.domain} | <b>Gap:</b> {minDomain.domain}
        </div>
        {/* Assessments/notes */}
        <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 6 }}>Coach Assessments</div>
        <div style={{ marginBottom: 10 }}>
          {player.assessments.map((a, i) => (
            <div key={i} style={{
              background: "#FFD70022", borderRadius: 7, padding: "6px 11px", marginBottom: 4,
              color: DOMAINS.find(d => d.key === a.domain)?.color || "#FFD700"
            }}>
              <b>{a.domain}:</b> {a.note}
            </div>
          ))}
        </div>
        {/* Add new assessment */}
        <form style={{ marginBottom: 16, display: "flex", gap: 7, alignItems: "center" }}
          onSubmit={e => { e.preventDefault(); handleAddNote(DOMAINS[0].key); }}>
          <select value={DOMAINS[0].key} disabled style={{ fontSize: 15, borderRadius: 5 }}>
            {DOMAINS.map(d => <option value={d.key} key={d.key}>{d.key}</option>)}
          </select>
          <input
            type="text"
            placeholder="Add assessment note..."
            value={addNote}
            onChange={e => setAddNote(e.target.value)}
            style={{ width: 170, fontSize: 15, borderRadius: 5 }}
          />
          <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 14, padding: "5px 13px" }}><FaSave /> Add</button>
        </form>
        {/* Goals */}
        <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 5 }}>Goals</div>
        <div style={{ marginBottom: 9 }}>
          {player.goals.map((g, i) => (
            <label key={i} style={{
              display: "flex", alignItems: "center", gap: 7,
              color: g.done ? "#27ef7d" : "#FFD700", fontWeight: 600,
              textDecoration: g.done ? "line-through" : "none"
            }}>
              <input
                type="checkbox"
                checked={g.done}
                onChange={() => handleToggleGoal(i)}
                style={{ accentColor: "#FFD700", width: 17, height: 17 }}
              />
              {g.text}
            </label>
          ))}
        </div>
        {/* Add goal */}
        <form style={{ display: "flex", gap: 7, alignItems: "center" }} onSubmit={e => { e.preventDefault(); handleAddGoal(); }}>
          <input
            type="text"
            placeholder="Add new goal..."
            value={addGoal}
            onChange={e => setAddGoal(e.target.value)}
            style={{ width: 170, fontSize: 15, borderRadius: 5 }}
          />
          <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 14, padding: "5px 13px" }}><FaSave /> Add</button>
        </form>
      </motion.section>
    </div>
  );
};

export default SkillsPassport;
