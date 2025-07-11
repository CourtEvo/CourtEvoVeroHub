import React, { useState } from "react";
import {
  FaArrowUp, FaArrowDown, FaCircle, FaUser, FaBasketballBall, FaHeartbeat, FaChartBar, FaClipboardCheck, FaLightbulb, FaExclamationTriangle, FaArrowRight, FaFileExport, FaChevronDown, FaEdit, FaPlus, FaTrash, FaChartPie, FaComments
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };
const AXES = [
  { key: "technical", label: "Technical", desc: "Ball skills, shooting, finishing, footwork" },
  { key: "physical", label: "Physical", desc: "Strength, speed, endurance, vertical" },
  { key: "tactical", label: "Tactical IQ", desc: "Reads, spacing, decision-making" },
  { key: "psychological", label: "Psychological", desc: "Resilience, composure, adaptability" },
  { key: "social", label: "Social", desc: "Locker room, team fit, leadership" },
  { key: "contractual", label: "Contractual", desc: "Paperwork, buyout, agent, legal" },
  { key: "lifestyle", label: "Lifestyle", desc: "Habits, routine, off-court discipline" }
];
const TRAFFIC = {
  1: ["#ff4848", <FaArrowDown style={{ color: "#ff4848" }} />],
  2: ["#ff4848", <FaArrowDown style={{ color: "#ff4848" }} />],
  3: ["#FFD700", <FaArrowDown style={{ color: "#FFD700" }} />],
  4: ["#FFD700", <FaArrowDown style={{ color: "#FFD700" }} />],
  5: ["#FFD700", <FaCircle style={{ color: "#FFD700" }} />],
  6: ["#1de682", <FaCircle style={{ color: "#1de682" }} />],
  7: ["#1de682", <FaArrowUp style={{ color: "#1de682" }} />],
  8: ["#1de682", <FaArrowUp style={{ color: "#1de682" }} />],
  9: ["#1de682", <FaArrowUp style={{ color: "#1de682" }} />],
  10: ["#FFD700", <FaLightbulb style={{ color: "#FFD700" }} />],
};

const defaultAthletes = [
  {
    name: "Luka D.",
    photo: "https://i.imgur.com/df0tB8B.png",
    position: "G",
    club: "Split",
    value: 425000, // Estimated market value in €
    readiness: {
      technical: { score: 8, trend: "up", note: "Elite handle, needs off-dribble 3" },
      physical: { score: 7, trend: "up", note: "Solid, minor knee rehab ongoing" },
      tactical: { score: 7, trend: "up", note: "Reads NBA coverages, needs Euro pick & roll work" },
      psychological: { score: 6, trend: "steady", note: "Mentally strong, slight frustration after losses" },
      social: { score: 8, trend: "up", note: "Respected, future captain material" },
      contractual: { score: 5, trend: "down", note: "Buyout in negotiation" },
      lifestyle: { score: 7, trend: "steady", note: "Good off-court habits" }
    },
    timeline: [
      { label: "First pro contract", from: "2023-07-01", to: "2023-08-30", color: "#FFD700" },
      { label: "NBA Pre-draft", from: "2024-05-15", to: "2024-06-23", color: "#ff4848" }
    ]
  },
  {
    name: "Nikola S.",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    position: "F",
    club: "Cedevita",
    value: 210000,
    readiness: {
      technical: { score: 6, trend: "steady", note: "Above avg, needs left hand" },
      physical: { score: 8, trend: "up", note: "Pro body, needs more mobility" },
      tactical: { score: 8, trend: "up", note: "Very high, solves Euro rotations" },
      psychological: { score: 8, trend: "up", note: "Calm under pressure" },
      social: { score: 7, trend: "steady", note: "Good in group, not vocal yet" },
      contractual: { score: 7, trend: "steady", note: "Ready, agent signed" },
      lifestyle: { score: 6, trend: "steady", note: "Room for improvement" }
    },
    timeline: [
      { label: "Pro rookie year", from: "2022-08-01", to: "2023-06-01", color: "#1de682" },
      { label: "Senior national team tryout", from: "2023-11-10", to: "2023-12-15", color: "#FFD700" }
    ]
  }
];

// -- Helper: Weighted index, market impact --
function proRiskIndex(readiness) {
  let total = 0, weight = 0;
  AXES.forEach(ax => {
    let w = ["contractual", "psychological"].includes(ax.key) ? 1.5 : 1;
    total += (readiness[ax.key].score * w); weight += w * 10;
  });
  return Math.round((total / weight) * 100);
}

function projectValueLoss(readiness, baseValue) {
  // If any axis <6, -10% per axis, if any axis <4, -25% for each.
  let pen = 0;
  AXES.forEach(ax => {
    let s = readiness[ax.key].score;
    if (s < 4) pen += 0.25;
    else if (s < 6) pen += 0.10;
  });
  return Math.max(0, Math.round(baseValue * (1 - pen)));
}

function readinessRadarPoints(readiness) {
  // For SVG radar chart
  const keys = AXES.map(ax => ax.key);
  const angles = keys.map((k, i) => (2 * Math.PI * i) / keys.length);
  return keys.map((k, i) => {
    const score = (readiness[k]?.score || 0) / 10;
    const r = 70 * score + 20;
    return [
      100 + r * Math.cos(angles[i] - Math.PI/2),
      100 + r * Math.sin(angles[i] - Math.PI/2)
    ];
  });
}

const ProTransitionReadinessElite = () => {
  const [athletes, setAthletes] = useState(defaultAthletes);
  const [a1Idx, setA1Idx] = useState(0);
  const [a2Idx, setA2Idx] = useState(1);
  const [editIdx, setEditIdx] = useState(-1);
  const [editScores, setEditScores] = useState({});
  const [chat, setChat] = useState([
    { sender: "Consultant", text: "Luka's buyout and resilience are the two main risks." }
  ]);
  const [chatText, setChatText] = useState("");
  const [newAth, setNewAth] = useState({ name: "", club: "", position: "", photo: "", value: 100000 });
  const [timelineEdit, setTimelineEdit] = useState({ label: "", from: "", to: "", color: "#FFD700" });
  const [timelineTarget, setTimelineTarget] = useState(null);

  // Boardroom Chat
  const addChat = () => {
    if (!chatText.trim()) return;
    setChat([...chat, { sender: "You", text: chatText }]);
    setChatText("");
  };

  // Add/Remove Athlete
  const addAthlete = () => {
    setAthletes([...athletes, {
      ...newAth, readiness: AXES.reduce((acc, ax) => ({ ...acc, [ax.key]: { score: 5, trend: "steady", note: "" } }), {}), timeline: []
    }]);
    setNewAth({ name: "", club: "", position: "", photo: "", value: 100000 });
  };
  const removeAthlete = idx => {
    if (athletes.length < 3) return;
    setAthletes(athletes.filter((_, i) => i !== idx));
    if (a1Idx === idx) setA1Idx(0);
    if (a2Idx === idx) setA2Idx(1);
  };

  // Edit Readiness
  const startEdit = idx => { setEditIdx(idx); setEditScores({ ...athletes[idx].readiness }); };
  const cancelEdit = () => { setEditScores({}); setEditIdx(-1); };
  const saveEdit = () => {
    let newAthletes = athletes.slice();
    newAthletes[editIdx].readiness = { ...editScores };
    setAthletes(newAthletes); setEditScores({}); setEditIdx(-1);
  };

  // Timeline edit
  const addTimeline = idx => {
    let newAthletes = athletes.slice();
    newAthletes[idx].timeline.push({ ...timelineEdit });
    setAthletes(newAthletes); setTimelineEdit({ label: "", from: "", to: "", color: "#FFD700" }); setTimelineTarget(null);
  };
  const removeTimeline = (ai, ti) => {
    let newAthletes = athletes.slice();
    newAthletes[ai].timeline = newAthletes[ai].timeline.filter((_, i) => i !== ti);
    setAthletes(newAthletes);
  };

  // Smart Recommendations
  function aiRecommendation(readiness) {
    const risk = proRiskIndex(readiness);
    let advice = [];
    AXES.forEach(ax => {
      if (readiness[ax.key].score < 4) advice.push(`Critical: ${ax.label} (score ${readiness[ax.key].score})`);
      else if (readiness[ax.key].score < 6) advice.push(`Risk: ${ax.label} needs targeted work`);
    });
    if (advice.length === 0) return "All axes in safe zone. Pro transition can be planned with standard support.";
    if (risk < 60) return "Boardroom: Red flag—transition not advised. Major axes below threshold. " + advice.join(" | ");
    return "Boardroom: Caution—readiness gaps exist. " + advice.join(" | ");
  }

  // Comparative analytics
  const a1 = athletes[a1Idx], a2 = athletes[a2Idx];
  const radar1 = readinessRadarPoints(a1.readiness), radar2 = readinessRadarPoints(a2.readiness);
  const pointsStr1 = radar1.map(p => p.join(",")).join(" ");
  const pointsStr2 = radar2.map(p => p.join(",")).join(" ");

  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1350, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 8 }}>
        <FaClipboardCheck size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Pro Transition Readiness Cockpit (Elite)
        </h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | Elite Analytics
        </span>
      </div>
      {/* Add Athlete */}
      <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 4 }}>Add Athlete</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={newAth.name} placeholder="Name" onChange={e => setNewAth({ ...newAth, name: e.target.value })} style={inputStyle} />
          <input value={newAth.club} placeholder="Club" onChange={e => setNewAth({ ...newAth, club: e.target.value })} style={inputStyle} />
          <input value={newAth.position} placeholder="Position" onChange={e => setNewAth({ ...newAth, position: e.target.value })} style={inputStyle} />
          <input value={newAth.photo} placeholder="Photo URL" onChange={e => setNewAth({ ...newAth, photo: e.target.value })} style={inputStyle} />
          <input type="number" value={newAth.value} min={10000} step={5000} placeholder="Value (€)" onChange={e => setNewAth({ ...newAth, value: Number(e.target.value) })} style={inputStyle} />
          <button onClick={addAthlete} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
        </div>
      </div>
      {/* Cockpit compare */}
      <div style={{ display: "flex", gap: 40 }}>
        {[a1, a2].map((ath, idx) => (
          <div key={ath.name} style={{ flex: 1, background: "#232a2e", borderRadius: 17, boxShadow: "0 2px 14px #FFD70022", padding: 20, position: "relative" }}>
            <div style={{ fontWeight: 900, fontSize: 21, color: brand.gold }}>{ath.name} <span style={{ color: "#FFD700aa", fontSize: 15 }}>({ath.club})</span></div>
            <div style={{ fontSize: 14, color: "#FFD700aa", marginBottom: 7 }}>{ath.position} | Value: <span style={{ color: "#1de682" }}>{ath.value}€</span></div>
            <img src={ath.photo} alt={ath.name} style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 16, border: "3px solid #FFD700", marginBottom: 7 }} />
            {/* Radar */}
            <div style={{ margin: "12px 0" }}>
              <svg width={200} height={200}>
                {AXES.map((ax, i) => {
                  const angle = (2 * Math.PI * i) / AXES.length - Math.PI / 2;
                  return (
                    <g key={ax.key}>
                      <line x1={100} y1={100} x2={100 + 90 * Math.cos(angle)} y2={100 + 90 * Math.sin(angle)} stroke="#FFD70066" />
                      <text x={100 + 105 * Math.cos(angle)} y={100 + 105 * Math.sin(angle)} fill="#FFD700cc" fontSize={10}
                        textAnchor={Math.cos(angle) > 0.2 ? "start" : Math.cos(angle) < -0.2 ? "end" : "middle"} alignmentBaseline="middle">{ax.label}</text>
                    </g>
                  );
                })}
                <polygon points={idx === 0 ? pointsStr1 : pointsStr2} fill={idx === 0 ? "#FFD70044" : "#1de68244"} stroke={idx === 0 ? "#FFD700" : "#1de682"} strokeWidth={3} />
              </svg>
            </div>
            <div style={{ background: "#283E51", borderRadius: 10, padding: 9, marginBottom: 7, textAlign: "center" }}>
              <span style={{
                background: proRiskIndex(ath.readiness) > 80 ? "#1de682" : proRiskIndex(ath.readiness) > 60 ? "#FFD700" : "#ff4848",
                color: "#232a2e", fontWeight: 900, fontSize: 16, borderRadius: 11, padding: "8px 15px"
              }}>
                Pro Risk Index: {proRiskIndex(ath.readiness)}
              </span>
              <span style={{ marginLeft: 18, color: "#FFD700bb" }}>
                Projected Value: {projectValueLoss(ath.readiness, ath.value)}€
              </span>
            </div>
            {/* Edit / Remove */}
            <div style={{ marginBottom: 5 }}>
              <button onClick={() => startEdit(idx === 0 ? a1Idx : a2Idx)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}><FaEdit /> Edit</button>
              {athletes.length > 2 && <button onClick={() => removeAthlete(idx === 0 ? a1Idx : a2Idx)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>}
            </div>
            {/* Readiness Axes Table */}
            {editIdx === (idx === 0 ? a1Idx : a2Idx) ? (
              <div>
                {AXES.map(ax =>
                  <div key={ax.key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <label style={{ width: 80, fontWeight: 700 }}>{ax.label}</label>
                    <input type="number" min={1} max={10} value={editScores[ax.key]?.score || ""} onChange={e => setEditScores({ ...editScores, [ax.key]: { ...editScores[ax.key], score: Number(e.target.value), note: editScores[ax.key].note } })} style={inputStyle} />
                    <input placeholder="Coach/Scout Note" value={editScores[ax.key]?.note || ""} onChange={e => setEditScores({ ...editScores, [ax.key]: { ...editScores[ax.key], note: e.target.value, score: editScores[ax.key].score } })} style={inputStyleFull} />
                  </div>
                )}
                <button onClick={saveEdit} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}>Save</button>
                <button onClick={cancelEdit} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}>Cancel</button>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: "#fff", marginBottom: 9 }}>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Score</th>
                    <th>Trend</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {AXES.map(ax =>
                    <tr key={ax.key} style={{ borderBottom: "1px solid #FFD70022", background: ath.readiness[ax.key].score < 5 ? "#ff484822" : ath.readiness[ax.key].score < 7 ? "#FFD70022" : "#1de68222" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{ax.label}</td>
                      <td style={{ color: TRAFFIC[ath.readiness[ax.key].score][0], fontWeight: 800 }}>{ath.readiness[ax.key].score}</td>
                      <td>{TRAFFIC[ath.readiness[ax.key].score][1]}</td>
                      <td style={{ color: "#FFD700bb" }}>{ath.readiness[ax.key].note}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {/* Timeline CRUD */}
            <div style={{ background: "#283E51", borderRadius: 9, padding: 7, marginBottom: 9 }}>
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 15, marginBottom: 3 }}>Transition Windows</div>
              {ath.timeline.map((rw, i) =>
                <div key={i} style={{ background: rw.color, color: "#232a2e", borderRadius: 7, padding: "3px 9px", marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{rw.label} ({rw.from} – {rw.to})</span>
                  <button onClick={() => removeTimeline(idx === 0 ? a1Idx : a2Idx, i)} style={{ background: "#ff4848", color: "#fff", border: "none", borderRadius: 5, padding: "1px 8px", fontWeight: 700 }}><FaTrash /></button>
                </div>
              )}
              {timelineTarget === (idx === 0 ? a1Idx : a2Idx) ? (
                <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                  <input value={timelineEdit.label} placeholder="Label" onChange={e => setTimelineEdit({ ...timelineEdit, label: e.target.value })} style={inputStyle} />
                  <input type="date" value={timelineEdit.from} onChange={e => setTimelineEdit({ ...timelineEdit, from: e.target.value })} style={inputStyle} />
                  <input type="date" value={timelineEdit.to} onChange={e => setTimelineEdit({ ...timelineEdit, to: e.target.value })} style={inputStyle} />
                  <input value={timelineEdit.color} type="color" onChange={e => setTimelineEdit({ ...timelineEdit, color: e.target.value })} style={{ width: 45, height: 30, borderRadius: 7 }} />
                  <button onClick={() => addTimeline(idx === 0 ? a1Idx : a2Idx)} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /></button>
                </div>
              ) : (
                <button onClick={() => setTimelineTarget(idx === 0 ? a1Idx : a2Idx)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 3 }}><FaPlus /> Add Window</button>
              )}
            </div>
            {/* Recommendation */}
            <div style={{ background: "#1de68222", borderRadius: 9, padding: 8, marginBottom: 6, fontWeight: 700, color: "#232a2e", fontSize: 15 }}>
              <FaLightbulb style={{ marginRight: 7, color: "#FFD700" }} />
              {aiRecommendation(ath.readiness)}
            </div>
          </div>
        ))}
      </div>
      {/* Multi-athlete selection */}
      <div style={{ margin: "18px 0 10px 0", textAlign: "center" }}>
        <span style={{ color: "#FFD700", fontWeight: 700, marginRight: 6 }}>Compare:</span>
        <select value={a1Idx} onChange={e => setA1Idx(Number(e.target.value))} style={inputStyle}>{athletes.map((a, i) => <option key={i} value={i}>{a.name}</option>)}</select>
        <span style={{ margin: "0 10px", color: "#FFD700" }}>|</span>
        <select value={a2Idx} onChange={e => setA2Idx(Number(e.target.value))} style={inputStyle}>{athletes.map((a, i) => <option key={i} value={i}>{a.name}</option>)}</select>
      </div>
      {/* Boardroom Chat/History */}
      <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, margin: "28px 0 5px 0" }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 4 }}><FaComments style={{ marginRight: 6 }} /> Boardroom Chat Log</div>
        <div style={{ maxHeight: 90, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
          {chat.map((c, i) => <div key={i}><span style={{ color: c.sender === "Consultant" ? "#FFD700" : "#1de682", fontWeight: 700 }}>{c.sender}:</span> {c.text}</div>)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={chatText} placeholder="Write update, insight or action..." onChange={e => setChatText(e.target.value)} style={inputStyleFull} />
          <button onClick={addChat} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
        </div>
      </div>
      {/* Print/Export */}
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button onClick={() => window.print()} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginRight: 9 }}><FaFileExport style={{ marginRight: 6 }} /> Print</button>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1px solid #FFD70077", fontSize: 15, width: 110
};
const inputStyleFull = {
  ...inputStyle, width: 220
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default ProTransitionReadinessElite;
