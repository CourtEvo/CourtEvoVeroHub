import React, { useState } from "react";
import { FaUserTie, FaBullseye, FaChartRadar, FaUserEdit, FaClipboardCheck, FaRobot, FaStar, FaChevronLeft, FaChevronRight, FaFileExport, FaLightbulb, FaChartLine, FaPlus, FaComment, FaUsers, FaClipboardList } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Button 
function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg,#FFD700 80%,#1de682 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "11px 18px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #FFD70044"
    }} {...props}>{children}</button>
  );
}

// Positions, initial skills, and more can be extended
const positions = [
  { code: "PG", label: "Point Guard" },
  { code: "SG", label: "Shooting Guard" },
  { code: "SF", label: "Small Forward" },
  { code: "PF", label: "Power Forward" },
  { code: "C",  label: "Center" }
];

// Position skill trees, now with custom skill add
const defaultPositionSkills = {
  PG: [
    { skill: "Ball Handling", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Pick & Roll", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Passing Vision", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Perimeter Defense", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Leadership", levels: ["Basic", "Advanced", "Elite"] }
  ],
  SG: [
    { skill: "Shooting Off Catch", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Attack Closeout", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "On-Ball Defense", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Cutting", levels: ["Basic", "Advanced", "Elite"] }
  ],
  SF: [
    { skill: "Spot-Up Shooting", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Transition Finishing", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Versatile Defense", levels: ["Basic", "Advanced", "Elite"] }
  ],
  PF: [
    { skill: "Post Moves", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Help Defense", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Pick & Pop", levels: ["Basic", "Advanced", "Elite"] }
  ],
  C: [
    { skill: "Rim Protection", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Rebounding", levels: ["Basic", "Advanced", "Elite"] },
    { skill: "Screen Setting", levels: ["Basic", "Advanced", "Elite"] }
  ]
};

const demoPlayers = [
  { id: 1, name: "Luka", pos: "PG", skills: { "Ball Handling": 1, "Pick & Roll": 0, "Passing Vision": 2, "Perimeter Defense": 1, "Leadership": 2 }, timeline: [], drills: {}, comments: [] },
  { id: 2, name: "Ivan", pos: "SG", skills: { "Shooting Off Catch": 2, "Attack Closeout": 1, "On-Ball Defense": 0, "Cutting": 1 }, timeline: [], drills: {}, comments: [] },
  { id: 3, name: "Tomislav", pos: "C", skills: { "Rim Protection": 2, "Rebounding": 1, "Screen Setting": 0 }, timeline: [], drills: {}, comments: [] }
];

function levelLabel(idx) {
  return ["Basic", "Advanced", "Elite"][idx];
}
function skillColor(level) {
  return ["#FF4848", "#FFD700", "#1de682"][level];
}

// --- Main Component
export default function PositionalProficiencyTracker() {
  const [currentPos, setCurrentPos] = useState("PG");
  const [players, setPlayers] = useState([...demoPlayers]);
  const [activePlayer, setActivePlayer] = useState(players[0]);
  const [positionSkills, setPositionSkills] = useState({ ...defaultPositionSkills });
  const [showAI, setShowAI] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [userMode, setUserMode] = useState("Coach"); // Coach, Director, Player, Boardroom
  const [newSkill, setNewSkill] = useState("");
  const [review, setReview] = useState("");
  const [pulse, setPulse] = useState({ emoji: "", score: 7 });

  // Add skill to position
  function addSkillToPosition() {
    if (!newSkill.trim()) return;
    setPositionSkills(ps => ({
      ...ps,
      [currentPos]: [...ps[currentPos], { skill: newSkill.trim(), levels: ["Basic", "Advanced", "Elite"] }]
    }));
    setNewSkill("");
  }

  // Handler: Set skill level, log timeline
  function setSkillLevel(skill, lvl) {
    setPlayers(ps => ps.map(p =>
      p.id === activePlayer.id
        ? {
            ...p,
            skills: { ...p.skills, [skill]: lvl },
            timeline: [...(p.timeline || []), { skill, lvl, ts: new Date().toLocaleDateString() }]
          }
        : p
    ));
    setActivePlayer(p => ({
      ...p,
      skills: { ...p.skills, [skill]: lvl },
      timeline: [...(p.timeline || []), { skill, lvl, ts: new Date().toLocaleDateString() }]
    }));
  }

  // Skill gap/calc
  const skillList = positionSkills[currentPos].map(s => s.skill);
  const skillDist = Object.fromEntries(skillList.map(s => [s, (activePlayer.skills[s] ?? 0) + 1]));
  const skillGap = skillList.filter(s => (activePlayer.skills[s] ?? -1) < 1);

  // AI recommendations (per gap)
  const aiSuggest = skillGap.length
    ? skillGap.map(skill => ({
        skill,
        tip: `Assign: micro-drill, mentor, or video for "${skill}".`,
        micro: `Drill: 2v2 for ${skill} or 1-on-1 focused breakdown.`
      }))
    : [{ skill: null, tip: "All skills advanced or elite!", micro: "Assign combo-drills for retention." }];

  // Drills handler
  function assignDrill(skill, text) {
    setPlayers(ps => ps.map(p =>
      p.id === activePlayer.id
        ? { ...p, drills: { ...p.drills, [skill]: text } }
        : p
    ));
    setActivePlayer(p => ({
      ...p,
      drills: { ...p.drills, [skill]: text }
    }));
  }

  // Timeline visual
  function GrowthTimeline({ timeline }) {
    if (!timeline || !timeline.length) return <div style={{ color: "#FFD700", opacity: 0.7 }}>No skill progression yet.</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {timeline.slice(-5).reverse().map((t, i) => (
          <span key={i} style={{
            background: skillColor(t.lvl),
            color: "#232b39", borderRadius: 8, padding: "3px 9px", fontWeight: 900, fontSize: 13
          }}>
            {t.ts}: {t.skill} → {levelLabel(t.lvl)}
          </span>
        ))}
      </div>
    );
  }

  // Radar chart, now wider
  function SkillRadar({ dist, skills }) {
    const cx = 110, cy = 110, r = 80; // Widened for clarity
    const pts = skills.map((s, i) => {
      const val = 30 + (dist[s] || 1) * 32;
      const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
      return [cx + Math.cos(angle) * val, cy + Math.sin(angle) * val];
    });
    const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ") + "Z";
    return (
      <svg width={220} height={220}>
        <circle cx={cx} cy={cy} r={r} fill="#283E51" stroke="#FFD70077" strokeWidth={2.3} />
        {skills.map((s, i) => {
          const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
          return <line key={s} x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke="#FFD70033" />;
        })}
        <path d={path} fill="#FFD70055" stroke="#FFD700" strokeWidth={2.8} />
        {skills.map((s, i) => {
          const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
          return <text key={s} x={cx + Math.cos(angle) * (r + 13)} y={cy + Math.sin(angle) * (r + 13) + 5} fill="#FFD700" fontWeight="bold" fontSize={13} textAnchor="middle">{s}</text>;
        })}
      </svg>
    );
  }

  // Export modal
  function ExportModal({ player, close }) {
    return (
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        style={{
          position: "fixed", top: 95, left: 0, right: 0, margin: "auto", width: 440, zIndex: 222,
          background: "#232b39", color: "#FFD700", borderRadius: 16, boxShadow: "0 4px 44px #FFD70044", padding: 33
        }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#FFD700", marginBottom: 11 }}>Skill Passport (Preview)</div>
        <div><b>Player:</b> {player.name} | <b>Position:</b> {player.pos}</div>
        <div style={{ margin: "13px 0" }}><b>Skills:</b>
          <ul>
            {positionSkills[player.pos].map(s =>
              <li key={s.skill}>
                {s.skill}: <span style={{ color: skillColor(player.skills[s.skill] ?? 0), fontWeight: 900 }}>
                  {levelLabel(player.skills[s.skill] ?? 0)}
                </span>
                {player.drills[s.skill] && (
                  <span style={{ color: "#1de682", marginLeft: 8, fontWeight: 900 }} title="Assigned Drill">| Drill: {player.drills[s.skill]}</span>
                )}
              </li>
            )}
          </ul>
        </div>
        <div><b>Timeline:</b> <GrowthTimeline timeline={player.timeline} /></div>
        <div style={{ marginTop: 10, color: "#1de682" }}>Reflection: {player.comments.slice(-1)[0]?.text || "No reflection yet."}</div>
        <Button style={{ background: "#FFD700", color: "#181e23", marginTop: 13 }} onClick={close}><FaChevronLeft /> Close</Button>
      </motion.div>
    );
  }

  // Comment handler
  function addComment(text) {
    setPlayers(ps => ps.map(p =>
      p.id === activePlayer.id
        ? { ...p, comments: [...(p.comments || []), { text, by: userMode, ts: new Date().toLocaleString() }] }
        : p
    ));
    setActivePlayer(p => ({
      ...p,
      comments: [...(p.comments || []), { text, by: userMode, ts: new Date().toLocaleString() }]
    }));
  }

  // Pulse Modal
  function PulseModal({ close }) {
    return (
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        style={{
          position: "fixed", top: 105, left: 0, right: 0, margin: "auto", width: 350, zIndex: 223,
          background: "#232b39", color: "#FFD700", borderRadius: 14, boxShadow: "0 4px 44px #FFD70044", padding: 27
        }}>
        <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 10 }}>Session Pulse (Player Quick Review)</div>
        <div>
          <span style={{ marginRight: 8, fontWeight: 900 }}>How do you feel?</span>
          <select value={pulse.emoji} onChange={e => setPulse(p => ({ ...p, emoji: e.target.value }))} style={{ fontWeight: 900, padding: "7px 18px", borderRadius: 8 }}>
            <option value="">Choose</option>
            <option value="🔥">On fire</option>
            <option value="🙂">Solid</option>
            <option value="😴">Tired</option>
            <option value="😬">Overloaded</option>
          </select>
        </div>
        <div style={{ marginTop: 9 }}>
          <span style={{ marginRight: 8, fontWeight: 900 }}>Intensity (1-10):</span>
          <input type="range" min={1} max={10} value={pulse.score} onChange={e => setPulse(p => ({ ...p, score: e.target.value }))} />
          <span style={{ marginLeft: 7, color: "#FFD700", fontWeight: 900 }}>{pulse.score}</span>
        </div>
        <Button style={{ background: "#1de682", color: "#181e23", marginTop: 12, fontSize: 13 }} onClick={close}>Save Pulse</Button>
      </motion.div>
    );
  }

  // --- Main Render
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#212c3a 0%, #283E51 100%)", color: "#fff", fontFamily: "Segoe UI,sans-serif" }}>
      {/* Top Panel */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "19px 30px 10px 30px", background: "#181e23", boxShadow: "0 1px 16px #FFD70025" }}>
        <FaUserTie style={{ fontSize: 30, color: "#FFD700" }} />
        <span style={{ fontSize: 23, fontWeight: 900, color: "#FFD700", letterSpacing: 1 }}>Positional Proficiency Tracker</span>
        <span style={{ background: "#FFD700", color: "#181e23", fontWeight: 900, borderRadius: 7, padding: "7px 16px" }}>
          {currentPos} · {positions.find(p=>p.code===currentPos)?.label}
        </span>
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={() => setShowAI(true)}><FaRobot /> AI Suggest</Button>
        <Button style={{ background: "#1de682", color: "#181e23" }} onClick={() => setShowExport(true)}><FaFileExport style={{ marginRight: 7 }} />Export</Button>
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={() => setUserMode("Boardroom")}><FaUsers /> Boardroom</Button>
        <Button style={{ background: "#1de682", color: "#181e23" }} onClick={() => setShowPulse(true)}><FaClipboardList /> Pulse</Button>
      </div>
      {/* Position/Player Select */}
      <div style={{ display: "flex", gap: 18, padding: "16px 30px 0 30px", alignItems: "center" }}>
        <span style={{ color: "#FFD700", fontWeight: 900 }}>Position:</span>
        <select value={currentPos} onChange={e => {
          setCurrentPos(e.target.value);
          const newPlayer = players.find(p => p.pos === e.target.value) || players[0];
          setActivePlayer(newPlayer);
        }} style={{ fontWeight: 900, padding: "7px 18px", borderRadius: 10 }}>
          {positions.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
        </select>
        <span style={{ color: "#FFD700", fontWeight: 900 }}>Player:</span>
        <select value={activePlayer?.id} onChange={e => setActivePlayer(players.find(p => p.id == e.target.value))} style={{ fontWeight: 900, padding: "7px 18px", borderRadius: 10 }}>
          {players.filter(p => p.pos === currentPos).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {userMode === "Coach" && (
          <>
            <span style={{ color: "#FFD700", fontWeight: 900, marginLeft: 12 }}>Add Skill:</span>
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="New skill" style={{ fontWeight: 900, padding: "7px 11px", borderRadius: 9, marginRight: 5 }} />
            <Button style={{ background: "#FFD700", color: "#181e23", fontSize: 15, padding: "7px 13px" }} onClick={addSkillToPosition}><FaPlus /></Button>
          </>
        )}
      </div>
      {/* Skill Matrix, Radar, Timeline */}
      <div style={{ display: "flex", gap: 40, padding: "25px 38px 0 38px" }}>
        {/* Skill Matrix Table */}
        <div style={{ background: "#232b39", borderRadius: 16, padding: "18px 28px", minWidth: 390 }}>
          <b style={{ color: "#FFD700", fontSize: 18 }}><FaChartLine style={{ marginRight: 6 }} /> Skill Matrix</b>
          <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 15, padding: "7px 3px" }}>Skill</th>
                {["Basic", "Advanced", "Elite"].map((lvl, i) => (
                  <th key={lvl} style={{ color: skillColor(i), fontWeight: 900, fontSize: 15, padding: "7px 3px" }}>{lvl}</th>
                ))}
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 14, padding: "7px 3px" }}>Drill/Comment</th>
              </tr>
            </thead>
            <tbody>
              {positionSkills[currentPos].map(s =>
                <tr key={s.skill}>
                  <td style={{ color: "#FFD700", fontWeight: 900, padding: "7px 3px" }}>{s.skill}</td>
                  {s.levels.map((_, i) =>
                    <td key={i}
                      style={{
                        background: (activePlayer.skills[s.skill] === i) ? skillColor(i) : "#232b39",
                        color: (activePlayer.skills[s.skill] === i) ? "#232b39" : "#fff",
                        borderRadius: 7, fontWeight: 900, cursor: "pointer", textAlign: "center", fontSize: 15,
                        border: (activePlayer.skills[s.skill] === i) ? "2px solid #FFD700" : "1px solid #333"
                      }}
                      onClick={() => setSkillLevel(s.skill, i)}>
                      {activePlayer.skills[s.skill] === i ? "✓" : ""}
                    </td>
                  )}
                  <td>
                    <input
                      style={{ borderRadius: 7, padding: "4px 8px", fontWeight: 800 }}
                      value={activePlayer.drills[s.skill] || ""}
                      placeholder="Assign drill/comment"
                      onChange={e => assignDrill(s.skill, e.target.value)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Radar/Analytics/Timeline */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ background: "#232b39", borderRadius: 14, padding: "19px 27px", marginBottom: 19 }}>
            <b style={{ color: "#FFD700", fontSize: 18 }}><FaStar style={{ marginRight: 7 }} /> Skill Progression Radar</b>
            <SkillRadar dist={skillDist} skills={skillList} />
            <div style={{ marginTop: 7, color: "#FFD700", fontWeight: 900 }}>Gap: {skillGap.length ? skillGap.join(", ") : "None"}</div>
            <div style={{ color: "#1de682", fontWeight: 900 }}>Reflection: {activePlayer.comments.slice(-1)[0]?.text || "No reflection yet."}</div>
          </div>
          <div style={{ background: "#232b39", borderRadius: 14, padding: "15px 18px", marginBottom: 15 }}>
            <b style={{ color: "#FFD700", fontSize: 16 }}><FaClipboardCheck style={{ marginRight: 6 }} /> Growth Timeline</b>
            <GrowthTimeline timeline={activePlayer.timeline} />
          </div>
          <div style={{ background: "#232b39", borderRadius: 14, padding: "14px 18px", marginBottom: 15 }}>
            <b style={{ color: "#FFD700", fontSize: 16 }}><FaComment style={{ marginRight: 6 }} /> Add Reflection/Comment</b>
            <textarea rows={2} value={review} onChange={e => setReview(e.target.value)} placeholder="Coach/player reflection..." style={{ width: "100%", borderRadius: 8, marginTop: 7, fontWeight: 800, fontSize: 15 }} />
            <Button style={{ background: "#1de682", color: "#181e23", marginTop: 6, fontSize: 13 }} onClick={() => { addComment(review); setReview(""); }}>Save</Button>
          </div>
        </div>
      </div>
      {/* AI Suggest, Export, Pulse */}
      <AnimatePresence>
        {showAI && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            style={{
              position: "fixed", top: 110, left: 0, right: 0, margin: "auto", width: 410, zIndex: 222,
              background: "#232b39", color: "#FFD700", borderRadius: 16, boxShadow: "0 4px 44px #FFD70044", padding: 32
            }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#FFD700", marginBottom: 12 }}>AI Skill Recommender</div>
            <ul>
              {aiSuggest.map((a, i) =>
                <li key={i} style={{ color: "#FFD700", fontWeight: 900, marginBottom: 2 }}>
                  <span style={{ color: "#1de682", marginRight: 8 }}>{a.skill}</span>
                  {a.tip} <span style={{ color: "#FFD700", marginLeft: 7 }}>{a.micro}</span>
                </li>
              )}
            </ul>
            <Button style={{ background: "#FFD700", color: "#181e23", marginTop: 19 }} onClick={() => setShowAI(false)}><FaChevronLeft /> Close</Button>
          </motion.div>
        )}
        {showExport && <ExportModal player={activePlayer} close={() => setShowExport(false)} />}
        {showPulse && <PulseModal close={() => setShowPulse(false)} />}
      </AnimatePresence>
    </div>
  );
}
