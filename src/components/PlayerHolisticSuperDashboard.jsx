import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useReactToPrint } from "react-to-print";
import { FaHeartbeat, FaBrain, FaUsers, FaHandHoldingHeart, FaLightbulb, FaTrophy, FaFileExport, FaExclamationTriangle, FaUserCheck, FaUser } from "react-icons/fa";

const BENCHMARKS = {
  PG: { Physical: 70, Technical: 80, Tactical: 70, Mental: 75, Emotional: 70, Social: 75 },
  SG: { Physical: 72, Technical: 82, Tactical: 72, Mental: 75, Emotional: 70, Social: 75 },
  SF: { Physical: 76, Technical: 76, Tactical: 74, Mental: 72, Emotional: 72, Social: 75 },
  PF: { Physical: 80, Technical: 72, Tactical: 72, Mental: 72, Emotional: 72, Social: 75 },
  C:  { Physical: 85, Technical: 70, Tactical: 70, Mental: 70, Emotional: 72, Social: 75 }
};

const NATIONAL_AVG = { Physical: 74, Technical: 75, Tactical: 73, Mental: 73, Emotional: 72, Social: 74 };

// DEMO DATA
const TEAMS_INIT = [
  {
    id: "u14", name: "U14",
    players: [
      {
        id: "luka", name: "Luka Ivic", age: 14, position: "PG", team: "U14",
        radar: [
          { aspect: "Physical", value: 78 },
          { aspect: "Technical", value: 80 },
          { aspect: "Tactical", value: 66 },
          { aspect: "Mental", value: 73 },
          { aspect: "Emotional", value: 62 },
          { aspect: "Social", value: 85 }
        ],
        milestones: [
          { area: "Emotional", achieved: false, label: "Handles pressure in close games" },
          { area: "Technical", achieved: true, label: "Can finish both hands, both sides" },
          { area: "Social", achieved: true, label: "Builds positive team chemistry" },
          { area: "Mental", achieved: false, label: "Maintains focus after mistake" }
        ],
        history: [
          { date: "2024-09", radar: [74,77,61,66,57,78] },
          { date: "2025-02", radar: [78,80,66,73,62,85] }
        ],
        feedback: [
          { by: "Coach Marko", role: "Coach", note: "Strong bounce-back after December injury.", date: "2025-02-15" }
        ],
        badges: ["Technical Breakthrough"],
        goals: [
          { aspect: "Technical", target: 85, due: "2025-07-01" }
        ],
        selfAssessment: [
          { aspect: "Physical", value: 75 },
          { aspect: "Technical", value: 85 },
          { aspect: "Tactical", value: 65 },
          { aspect: "Mental", value: 76 },
          { aspect: "Emotional", value: 67 },
          { aspect: "Social", value: 82 }
        ]
      },
      {
        id: "Ivan", name: "Ivan Petrović", age: 13, position: "SG", team: "U14",
        radar: [
          { aspect: "Physical", value: 71 },
          { aspect: "Technical", value: 83 },
          { aspect: "Tactical", value: 71 },
          { aspect: "Mental", value: 79 },
          { aspect: "Emotional", value: 82 },
          { aspect: "Social", value: 72 }
        ],
        milestones: [
          { area: "Emotional", achieved: true, label: "Handles pressure in close games" },
          { area: "Technical", achieved: true, label: "Can finish both hands, both sides" },
          { area: "Social", achieved: true, label: "Builds positive team chemistry" },
          { area: "Mental", achieved: true, label: "Maintains focus after mistake" }
        ],
        history: [
          { date: "2024-09", radar: [67,76,65,72,75,67] },
          { date: "2025-02", radar: [71,83,71,79,82,72] }
        ],
        feedback: [],
        badges: ["Social Leader"],
        goals: [],
        selfAssessment: null
      }
    ]
  }
];

const aspectIcons = {
  Physical: <FaHeartbeat color="#FFD700" />,
  Technical: <FaTrophy color="#27ef7d" />,
  Tactical: <FaLightbulb color="#48b5ff" />,
  Mental: <FaBrain color="#a064fe" />,
  Emotional: <FaHandHoldingHeart color="#FFD700" />,
  Social: <FaUsers color="#27ef7d" />
};

const fadeIn = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };

function getAverageRadar(players) {
  const aspects = ["Physical", "Technical", "Tactical", "Mental", "Emotional", "Social"];
  return aspects.map(aspect => {
    const sum = players.reduce((acc, p) =>
      acc + (p.radar.find(r => r.aspect === aspect)?.value || 0), 0
    );
    return { aspect, value: Math.round(sum / players.length) };
  });
}

function getFeedback(radar) {
  return radar.map((item) => {
    if (item.value < 65) return `Focus on ${item.aspect}—below best-practice range.`;
    if (item.value < 75) return `Solid ${item.aspect}, but could strengthen further.`;
    return `${item.aspect} area is strong—maintain growth!`;
  });
}

function getPercentile(val, aspect) {
  // For MVP, use the NATIONAL_AVG. Real system: fetch real percentiles.
  if (!NATIONAL_AVG[aspect]) return "—";
  return val > NATIONAL_AVG[aspect] ? "▲ Above National Avg" : "▼ Below National Avg";
}

const PlayerHolisticSuperDashboard = () => {
  const [teams, setTeams] = useState(TEAMS_INIT);
  const [teamId, setTeamId] = useState(teams[0].id);
  const selectedTeam = teams.find(t => t.id === teamId);
  const [playerId, setPlayerId] = useState(selectedTeam.players[0].id);
  const player = selectedTeam.players.find(p => p.id === playerId);
  const [feedbackForm, setFeedbackForm] = useState({ by: "", role: "", note: "" });
  const [compareId, setCompareId] = useState("");
  const [showSelfModal, setShowSelfModal] = useState(false);
  const [selfForm, setSelfForm] = useState(player.radar.map(a => ({ aspect: a.aspect, value: a.value })));

  // Compute averages and comparison
  const averageRadar = getAverageRadar(selectedTeam.players);
  const comparePlayer = compareId ? selectedTeam.players.find(p => p.id === compareId) : null;
  const feedback = getFeedback(player.radar);

  // At-risk detector
  const atRisk = player.radar.filter(a => a.value < 65).length > 0
    || player.milestones.filter(m => !m.achieved).length > 1;

  // Excel import/export
  function handleExcelImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const header = rows[0];
      const playersByTeam = {};
      for (let i = 1; i < rows.length; ++i) {
        const [teamName, playerName, ...scores] = rows[i];
        if (!playersByTeam[teamName]) playersByTeam[teamName] = [];
        playersByTeam[teamName].push({
          id: playerName.toLowerCase().replace(/ /g, "_"),
          name: playerName,
          radar: header.slice(2, 8).map((aspect, idx) => ({
            aspect, value: Number(scores[idx] || 0)
          })),
          milestones: [],
          history: [],
          feedback: [],
          badges: [],
          goals: [],
          selfAssessment: null
        });
      }
      setTeams(Object.entries(playersByTeam).map(([team, players]) => ({
        id: team.toLowerCase(), name: team, players
      })));
      setTeamId(Object.keys(playersByTeam)[0].toLowerCase());
      setPlayerId(playersByTeam[Object.keys(playersByTeam)[0]][0].id);
      setCompareId("");
    };
    reader.readAsArrayBuffer(file);
  }
  function handleExcelExport() {
    const rows = [];
    teams.forEach(team =>
      team.players.forEach(player =>
        rows.push([
          team.name,
          player.name,
          ...player.radar.map(r => r.value)
        ])
      )
    );
    const ws = XLSX.utils.aoa_to_sheet([["Team","Player","Physical","Technical","Tactical","Mental","Emotional","Social"], ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Players");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `CourtEvoVero_Player360_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  // PDF export
  const sectionRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `CourtEvoVero_Player360_${player.name.replace(" ", "_")}_${new Date().toISOString().slice(0,10)}`
  });

  // Add feedback
  function handleAddFeedback(e) {
    e.preventDefault();
    if (!feedbackForm.by || !feedbackForm.role || !feedbackForm.note) return;
    const now = new Date().toISOString().slice(0, 10);
    setTeams(ts => ts.map(team =>
      team.id !== teamId ? team : {
        ...team, players: team.players.map(p =>
          p.id !== playerId ? p : {
            ...p, feedback: [...(p.feedback || []), { ...feedbackForm, date: now }]
          })
      }
    ));
    setFeedbackForm({ by: "", role: "", note: "" });
  }

  // Handle goal edit
  function handleGoalChange(idx, field, value) {
    setTeams(ts => ts.map(team =>
      team.id !== teamId ? team : {
        ...team, players: team.players.map(p =>
          p.id !== playerId ? p : {
            ...p, goals: (p.goals || []).map((g, i) => i !== idx ? g : { ...g, [field]: value })
          })
      }
    ));
  }

  // Handle self-assessment modal
  function handleSelfAssessmentSubmit(e) {
    e.preventDefault();
    setTeams(ts => ts.map(team =>
      team.id !== teamId ? team : {
        ...team, players: team.players.map(p =>
          p.id !== playerId ? p : {
            ...p, selfAssessment: selfForm.map(a => ({ ...a, value: Number(a.value) }))
          })
      }
    ));
    setShowSelfModal(false);
  }

  // Awards & Badges assignment (demo: based on score)
  function computeBadges(p) {
    const newBadges = [];
    if (p.radar.find(r => r.aspect === "Technical" && r.value >= 90)) newBadges.push("Technical Breakthrough");
    if (p.radar.find(r => r.aspect === "Social" && r.value >= 90)) newBadges.push("Social Leader");
    // add more rules...
    return Array.from(new Set([...(p.badges || []), ...newBadges]));
  }

  // Apply badges live (could move to useEffect for full scale)
  player.badges = computeBadges(player);

  // Dynamic benchmarks
  const roleBench = BENCHMARKS[player.position] || NATIONAL_AVG;

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto" }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 15, alignItems: "center", marginTop: 33, marginBottom: -10, flexWrap: "wrap" }}>
        <input type="file" accept=".xlsx,.csv" onChange={handleExcelImport} />
        <button onClick={handleExcelExport}
          style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "8px 18px", fontSize: 17, cursor: "pointer" }}>
          Export Excel
        </button>
        <button onClick={handlePrint}
          style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "8px 18px", fontSize: 17, cursor: "pointer", boxShadow: "0 2px 8px #FFD70033" }}>
          <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} />
          Export Player Report (PDF)
        </button>
        <label style={{ color: "#FFD700", fontWeight: 700, fontSize: 18, marginLeft: 12 }}>
          Team:
          <select
            value={teamId}
            onChange={e => {
              setTeamId(e.target.value);
              setPlayerId(teams.find(t => t.id === e.target.value).players[0].id);
              setCompareId("");
            }}
            style={{ marginLeft: 7, fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "5px 10px" }}
          >
            {teams.map(t => <option value={t.id} key={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>
          Player:
          <select
            value={playerId}
            onChange={e => setPlayerId(e.target.value)}
            style={{ marginLeft: 7, fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "5px 10px" }}
          >
            {selectedTeam.players.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label style={{ color: "#FFD700", fontWeight: 700, fontSize: 18, marginLeft: 18 }}>
          Compare:
          <select
            value={compareId}
            onChange={e => setCompareId(e.target.value)}
            style={{ marginLeft: 7, fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "5px 10px" }}
          >
            <option value="">—</option>
            {selectedTeam.players.map(p => p.id !== playerId && <option value={p.id} key={p.id}>{p.name}</option>)}
          </select>
        </label>
        <button onClick={() => { setSelfForm(player.radar.map(a => ({ ...a }))); setShowSelfModal(true); }}
          style={{ marginLeft: 15, background: "#27ef7d", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "8px 18px", fontSize: 17, cursor: "pointer" }}>
          Player Self-Assessment
        </button>
      </div>

      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 32,
          marginTop: 28,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        {/* Automated alert */}
        {atRisk && <div style={{ color: "#e94057", fontWeight: 700, margin: "15px 0", fontSize: 17 }}>
          <FaExclamationTriangle style={{ marginRight: 7, fontSize: 20 }} />
          ALERT: Player at risk—review with care!
        </div>}

        <div style={{ display: "flex", alignItems: "flex-start", gap: 36, flexWrap: "wrap" }}>
          {/* Left: Player info and radar chart */}
          <div style={{ flex: 1, minWidth: 340 }}>
            <div style={{ fontSize: 25, color: "#FFD700", fontWeight: 700 }}>
              {player.name} <span style={{ color: "#fff", fontWeight: 400, fontSize: 19 }}>({player.position})</span>
            </div>
            <div style={{ color: "#FFD700", fontSize: 16, marginBottom: 11 }}>
              Age: {player.age} | Team: {player.team}
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart cx="50%" cy="50%" outerRadius={110} data={player.radar}>
                <PolarGrid stroke="#FFD70022" />
                <PolarAngleAxis dataKey="aspect" tick={{ fill: "#FFD700", fontSize: 16, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} tick={{ fill: "#FFD70088", fontSize: 13 }} />
                <Radar name="This Player" dataKey="value" stroke="#27ef7d" fill="#27ef7d88" fillOpacity={0.4} dot />
                {comparePlayer && (
                  <Radar name={comparePlayer.name} dataKey="value" stroke="#FFD700" fill="#FFD70055" fillOpacity={0.2} dot data={comparePlayer.radar} />
                )}
                {/* National avg overlay (as benchmark line) */}
                <Radar name="Nat. Avg" dataKey="value" stroke="#a064fe" fill="#a064fe44" fillOpacity={0.1} dot data={Object.keys(NATIONAL_AVG).map(a => ({ aspect: a, value: NATIONAL_AVG[a] }))} />
                {/* Role adaptive target (as dashed line) */}
                <Radar name="Role Target" dataKey="value" stroke="#e94057" fillOpacity={0} dot data={Object.keys(roleBench).map(a => ({ aspect: a, value: roleBench[a] }))} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 14, color: "#FFD700bb", marginTop: 8 }}>
              <FaUserCheck style={{ marginBottom: -2 }} /> Nat. Avg &nbsp;
              <FaUser style={{ marginBottom: -2, color: "#e94057" }} /> Role Target
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18 }}>Awards & Badges</div>
              <ul style={{ fontSize: 17, color: "#27ef7d", marginLeft: 6 }}>
                {(player.badges || []).map((b, i) => <li key={i}>🏅 {b}</li>)}
              </ul>
            </div>
          </div>
          {/* Middle: Team average radar */}
          <div style={{
            flex: 1, minWidth: 320, maxWidth: 340,
            background: "#25314911", borderRadius: 14, padding: "17px 15px", marginTop: 10
          }}>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 20, marginBottom: 9 }}>
              Team/Club Average
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart
                cx="50%" cy="50%" outerRadius={75}
                data={averageRadar}
              >
                <PolarGrid stroke="#FFD70022" />
                <PolarAngleAxis dataKey="aspect" tick={{ fill: "#FFD700", fontSize: 14, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} tick={{ fill: "#FFD70088", fontSize: 11 }} />
                <Radar
                  name="Average"
                  dataKey="value"
                  stroke="#FFD700"
                  fill="#FFD70066"
                  fillOpacity={0.28}
                  dot
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Right: Checklist, feedback, progression timeline */}
          <div style={{
            flex: 1,
            minWidth: 260,
            background: "#25314911",
            borderRadius: 14,
            padding: "22px 15px",
            marginTop: 10
          }}>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 20, marginBottom: 12 }}>
              Development Checklist
            </div>
            <ul style={{ fontSize: 16, color: "#fff", marginLeft: 5 }}>
              {player.milestones.map(m =>
                <li key={m.label} style={{
                  marginBottom: 9,
                  textDecoration: m.achieved ? "none" : "underline",
                  color: m.achieved ? "#27ef7d" : "#FFD700"
                }}>
                  {aspectIcons[m.area]} {m.label} {m.achieved ? "✓" : ""}
                </li>
              )}
            </ul>
            {/* Dynamic Goals */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18 }}>Goals & Progress</div>
              <ul>
                {(player.goals || []).map((g, idx) => {
                  const val = player.radar.find(r => r.aspect === g.aspect)?.value || 0;
                  return (
                    <li key={g.aspect}>
                      {g.aspect}: <b>{val}</b> / <span style={{ color: "#FFD700" }}>{g.target}</span>
                      <span style={{ color: val >= g.target ? "#27ef7d" : "#e94057", fontWeight: 600, marginLeft: 9 }}>
                        {val >= g.target ? "On Pace" : "Behind"}
                      </span>
                      <input type="number" value={g.target} style={{ width: 56, marginLeft: 7 }}
                        onChange={e => handleGoalChange(idx, "target", e.target.value)} />
                      <input type="date" value={g.due} style={{ marginLeft: 7 }}
                        onChange={e => handleGoalChange(idx, "due", e.target.value)} />
                    </li>
                  );
                })}
              </ul>
            </div>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, margin: "16px 0 6px 0" }}>
              Feedback & Next Steps
            </div>
            <ul style={{ fontSize: 16, color: "#FFD700bb", marginLeft: 8 }}>
              {feedback.map((f, i) =>
                <li key={i}>{f}</li>
              )}
              {/* Show benchmark/percentile */}
              {player.radar.map((r, i) => (
                <li key={i} style={{ color: "#b7ffbb", fontSize: 13 }}>
                  {r.aspect} {getPercentile(r.value, r.aspect)}
                </li>
              ))}
            </ul>
            {/* Progression timeline */}
            <div style={{ margin: "18px 0 10px 0" }}>
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, marginBottom: 6 }}>
                Progression Timeline
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={
                  (player.history || []).map((h, i) => ({
                    date: h.date,
                    Physical: h.radar[0],
                    Technical: h.radar[1],
                    Tactical: h.radar[2],
                    Mental: h.radar[3],
                    Emotional: h.radar[4],
                    Social: h.radar[5]
                  }))
                }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {["Physical","Technical","Tactical","Mental","Emotional","Social"].map((k, idx) =>
                    <Line key={k} type="monotone" dataKey={k} stroke={["#FFD700","#27ef7d","#48b5ff","#a064fe","#e94057","#7bdfcc"][idx]} strokeWidth={2} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Feedback form */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18 }}>Feedback/Notes</div>
              <ul style={{ fontSize: 16, color: "#FFD700bb" }}>
                {(player.feedback || []).map((f, i) =>
                  <li key={i}><b>{f.by}</b> ({f.role}): {f.note} <span style={{ color: "#888" }}>({f.date})</span></li>
                )}
              </ul>
              <form onSubmit={handleAddFeedback} style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 9 }}>
                <input placeholder="Name" value={feedbackForm.by} onChange={e => setFeedbackForm(f => ({ ...f, by: e.target.value }))} />
                <input placeholder="Role (Coach/Parent/Player)" value={feedbackForm.role} onChange={e => setFeedbackForm(f => ({ ...f, role: e.target.value }))} />
                <input placeholder="Feedback" value={feedbackForm.note} onChange={e => setFeedbackForm(f => ({ ...f, note: e.target.value }))} />
                <button type="submit"
                  style={{
                    background: "#27ef7d", color: "#222", fontWeight: 700,
                    border: "none", borderRadius: 7, padding: "4px 12px", fontSize: 16, marginTop: 4
                  }}>
                  Add Note
                </button>
              </form>
            </div>
            {/* Self-assessment */}
            {player.selfAssessment && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17 }}>Player Self-Assessment</div>
                <ResponsiveContainer width="100%" height={110}>
                  <RadarChart cx="50%" cy="50%" outerRadius={55} data={player.selfAssessment}>
                    <PolarGrid stroke="#27ef7d22" />
                    <PolarAngleAxis dataKey="aspect" tick={{ fill: "#27ef7d", fontSize: 13, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={4} tick={{ fill: "#27ef7d88", fontSize: 10 }} />
                    <Radar name="Self" dataKey="value" stroke="#27ef7d" fill="#27ef7d44" fillOpacity={0.19} dot />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Self-Assessment Modal */}
      {showSelfModal && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.95)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={handleSelfAssessmentSubmit}
            style={{
              background: "#fff", color: "#222", padding: 28, borderRadius: 15, minWidth: 360
            }}>
            <h3 style={{ color: "#FFD700", fontSize: 20, marginBottom: 11 }}>Player Self-Assessment</h3>
            {selfForm.map((a, idx) => (
              <div key={a.aspect} style={{ marginBottom: 12 }}>
                <label>{a.aspect}:</label>
                <input type="number" min={0} max={100} step={1}
                  value={a.value}
                  onChange={e => setSelfForm(sf => sf.map((s, i) => i !== idx ? s : { ...s, value: e.target.value }))}
                  style={{ width: 70, marginLeft: 9, fontSize: 16, borderRadius: 5 }}
                />
              </div>
            ))}
            <div style={{ textAlign: "right", marginTop: 10 }}>
              <button type="submit"
                style={{
                  background: "#27ef7d", color: "#222", border: "none", borderRadius: 7,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16, marginRight: 7
                }}>Save</button>
              <button type="button" onClick={() => setShowSelfModal(false)}
                style={{
                  background: "#e94057", color: "#fff", border: "none", borderRadius: 7,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16
                }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlayerHolisticSuperDashboard;
