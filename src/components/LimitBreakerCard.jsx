import React, { useState } from "react";
import {
  FaArrowUp, FaArrowDown, FaCircle, FaUser, FaBasketballBall, FaHeartbeat, FaChartBar, FaClipboardCheck, FaLightbulb, FaExclamationTriangle, FaArrowRight, FaDownload, FaFileExport, FaPlus, FaEdit, FaTrash, FaCamera, FaPaperclip, FaTimes, FaChevronDown
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };

const IMPROVEMENT_AXES = [
  { key: "shooting", label: "Shooting Mechanics", desc: "Release, stability, kinetic chain" },
  { key: "driving", label: "Finishing/Driving", desc: "Acceleration, change-of-pace, control" },
  { key: "athleticism", label: "Athleticism", desc: "Speed, vertical, mobility" },
  { key: "biomechanics", label: "Biomechanics", desc: "Movement, flexibility, asymmetry" },
  { key: "defense", label: "Defensive Versatility", desc: "Switching, reads, rim protection" },
  { key: "tactical", label: "Tactical IQ", desc: "Spacing, reads, role fit" },
  { key: "psych", label: "Mental/Leadership", desc: "Resilience, focus, presence" },
  { key: "recovery", label: "Recovery/Fatigue", desc: "Load, sleep, overtraining risk" }
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

const demoProfiles = [
  {
    name: "Marko D.",
    bio: "Combo guard, born 2004. U18 Croatia, NBA draft prospect.",
    photo: "https://i.imgur.com/df0tB8B.png",
    position: "G",
    club: "Split",
    height: 196,
    wingspan: 206,
    weight: 90,
    hand: "Right",
    dominantFoot: "Right",
    stats: { points: 18.2, assists: 5.7, rebounds: 4.4 },
    axes: {
      shooting: { score: 7, trend: "up" },
      driving: { score: 8, trend: "up" },
      athleticism: { score: 6, trend: "up" },
      biomechanics: { score: 5, trend: "steady" },
      defense: { score: 7, trend: "up" },
      tactical: { score: 8, trend: "up" },
      psych: { score: 6, trend: "steady" },
      recovery: { score: 4, trend: "down" }
    },
    barriers: [
      { area: "Biomechanics", risk: "Stiff left ankle limits lateral movement.", action: "Mobility plan with S&C", severity: "medium" },
      { area: "Recovery/Fatigue", risk: "Multiple red flags for overtraining, fatigue after U20s.", action: "Monitor sleep, deload weeks", severity: "high" }
    ],
    riskWindows: [
      { label: "Fatigue/Overload", from: "2022-12-01", to: "2023-02-01", risk: "high" },
      { label: "Growth Spurt", from: "2019-01-01", to: "2019-10-01", risk: "medium" }
    ],
    forecast: "If biomechanics and fatigue management are addressed in the next 12 months, NBA/EuroLeague pro role is highly realistic. Immediate action required on recovery plan.",
    recommendations: [
      "S&C to target left ankle mobility deficit and core strength.",
      "Integrated load monitoring with sleep tracker.",
      "Work on quick-trigger off-the-dribble shooting to unlock scoring ceiling."
    ],
    attachments: [
      { type: "video", url: "https://youtube.com/shot-mechanics", label: "Shooting Video" },
      { type: "pdf", url: "https://medical-report.com/luka-2023.pdf", label: "Medical Report" }
    ]
  },
  {
    name: "Nikola S.",
    bio: "Forward, born 2005. Steady developer, high basketball IQ.",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    position: "F",
    club: "Cedevita",
    height: 201,
    wingspan: 212,
    weight: 93,
    hand: "Right",
    dominantFoot: "Right",
    stats: { points: 12.5, assists: 4.8, rebounds: 7.1 },
    axes: {
      shooting: { score: 6, trend: "steady" },
      driving: { score: 7, trend: "up" },
      athleticism: { score: 7, trend: "up" },
      biomechanics: { score: 6, trend: "steady" },
      defense: { score: 7, trend: "up" },
      tactical: { score: 9, trend: "up" },
      psych: { score: 8, trend: "up" },
      recovery: { score: 8, trend: "up" }
    },
    barriers: [
      { area: "Shooting", risk: "Release inconsistency under pressure.", action: "Mental skills + reps under stress.", severity: "medium" }
    ],
    riskWindows: [
      { label: "U18 National Camp", from: "2023-05-01", to: "2023-06-30", risk: "medium" }
    ],
    forecast: "With shooting improvement, could become EuroLeague starter in 2 years.",
    recommendations: [
      "Increase game-speed shooting under fatigue.",
      "Continue leadership/mental focus work."
    ],
    attachments: []
  }
];

const axisColors = [
  "#FFD700","#1de682","#FFD700","#1de682","#FFD700","#1de682","#FFD700","#ff4848"
];

// --- RADAR CHART Helper ---
function axesToRadarPoints(axes) {
  // Return array of [x, y] points (polygon) for SVG radar
  const keys = IMPROVEMENT_AXES.map(ax => ax.key);
  const angles = keys.map((k, i) => (2 * Math.PI * i) / keys.length);
  return keys.map((k, i) => {
    const score = (axes[k]?.score || 0) / 10;
    const r = 70 * score + 20;
    return [
      100 + r * Math.cos(angles[i] - Math.PI/2),
      100 + r * Math.sin(angles[i] - Math.PI/2)
    ];
  });
}

const LimitBreakerCardElite = () => {
  const [profiles, setProfiles] = useState(demoProfiles);
  const [profileIdx, setProfileIdx] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editAxes, setEditAxes] = useState({});
  const [newBarrier, setNewBarrier] = useState({ area: "", risk: "", action: "", severity: "medium" });
  const [newWindow, setNewWindow] = useState({ label: "", from: "", to: "", risk: "medium" });
  const [newAttachment, setNewAttachment] = useState({ type: "video", url: "", label: "" });
  const [scenarioText, setScenarioText] = useState("");
  const profile = profiles[profileIdx];

  // Handle editable axes
  const startEdit = () => { setEditAxes({ ...profile.axes }); setEditMode(true); };
  const cancelEdit = () => { setEditAxes({}); setEditMode(false); };
  const saveEdit = () => {
    let newProfiles = profiles.slice();
    newProfiles[profileIdx].axes = { ...editAxes };
    setProfiles(newProfiles); setEditAxes({}); setEditMode(false);
  };

  // Barriers
  const addBarrier = () => {
    if (!newBarrier.area) return;
    let newProfiles = profiles.slice();
    newProfiles[profileIdx].barriers = [...newProfiles[profileIdx].barriers, { ...newBarrier }];
    setProfiles(newProfiles); setNewBarrier({ area: "", risk: "", action: "", severity: "medium" });
  };
  const removeBarrier = i => {
    let newProfiles = profiles.slice();
    newProfiles[profileIdx].barriers = newProfiles[profileIdx].barriers.filter((b, idx) => idx !== i);
    setProfiles(newProfiles);
  };

  // Risk windows
  const addWindow = () => {
    if (!newWindow.label || !newWindow.from || !newWindow.to) return;
    let newProfiles = profiles.slice();
    newProfiles[profileIdx].riskWindows = [...newProfiles[profileIdx].riskWindows, { ...newWindow }];
    setProfiles(newProfiles); setNewWindow({ label: "", from: "", to: "", risk: "medium" });
  };
  const removeWindow = i => {
    let newProfiles = profiles.slice();
    newProfiles[profileIdx].riskWindows = newProfiles[profileIdx].riskWindows.filter((b, idx) => idx !== i);
    setProfiles(newProfiles);
  };

  // Attachments
  const addAttachment = () => {
    if (!newAttachment.url) return;
    let newProfiles = profiles.slice();
    newProfiles[profileIdx].attachments = [...newProfiles[profileIdx].attachments, { ...newAttachment }];
    setProfiles(newProfiles); setNewAttachment({ type: "video", url: "", label: "" });
  };
  const removeAttachment = i => {
    let newProfiles = profiles.slice();
    newProfiles[profileIdx].attachments = newProfiles[profileIdx].attachments.filter((b, idx) => idx !== i);
    setProfiles(newProfiles);
  };

  // Scenario Simulator (simple demo)
  const runScenario = () => {
    let text = "";
    if (profile.barriers.length === 0) text = "No active bottlenecks—athlete can progress to pro level with standard pathway interventions.";
    else if (profile.barriers.some(b => b.severity === "high"))
      text = "High-severity bottlenecks: immediate risk to pro projection. Board and staff action needed this quarter.";
    else text = "Medium bottlenecks—address in next 3-6 months to keep trajectory on pro track.";
    setScenarioText(text);
  };

  // Boardroom summary (advanced)
  function boardroomCopy() {
    let out = [];
    out.push(`${profile.name} | ${profile.bio}`);
    out.push(`Club: ${profile.club} | Position: ${profile.position} | Height: ${profile.height}cm`);
    out.push("Key Axes:");
    IMPROVEMENT_AXES.forEach(ax => out.push(`${ax.label}: ${profile.axes[ax.key].score}/10`));
    out.push("Bottlenecks: " + (profile.barriers.length ? profile.barriers.map(b => `${b.area} (${b.severity}): ${b.risk}`).join("; ") : "None"));
    out.push("Risk Windows: " + (profile.riskWindows.length ? profile.riskWindows.map(w => `${w.label} (${w.risk})`).join("; ") : "None"));
    out.push("Forecast: " + profile.forecast);
    out.push("Top Recommendations: " + profile.recommendations.join("; "));
    return out;
  }

  // Export CSV
  const exportCSV = () => {
    const axes = IMPROVEMENT_AXES.map(ax => `${ax.label},${profile.axes[ax.key].score}`).join("\n");
    const barriers = profile.barriers.map(b => `${b.area},${b.risk},${b.action},${b.severity}`).join("\n");
    const windows = profile.riskWindows.map(r => `${r.label},${r.from},${r.to},${r.risk}`).join("\n");
    const csv = [
      "Name,Bio,Position,Height,Wingspan,Weight,Hand,Club",
      [profile.name,profile.bio,profile.position,profile.height,profile.wingspan,profile.weight,profile.hand,profile.club].join(","),
      "Improvement Axes:",
      axes,
      "Barriers:",
      barriers,
      "Risk Windows:",
      windows,
      "Forecast:,",profile.forecast,
      "Recommendations:",
      ...profile.recommendations
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "limit_breaker_card.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // Radar chart
  const points = axesToRadarPoints(profile.axes);
  const pointsStr = points.map(p => p.join(",")).join(" ");

  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1050, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6 }}>
        <FaLightbulb size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Limit Breaker Diagnostic Card
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8,
          padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022'
        }}>
          CourtEvo Vero | Elite Pathway
        </span>
        <select value={profileIdx} onChange={e => setProfileIdx(Number(e.target.value))} style={{ ...btnStyle, marginLeft: 22 }}>
          {profiles.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
        </select>
        <button onClick={startEdit} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaEdit style={{marginRight: 7}} />Edit Axes</button>
      </div>
      {/* Card Main + Radar */}
      <div style={{ display: "flex", gap: 36, margin: "18px 0 16px 0", alignItems: "center" }}>
        <div>
          <img src={profile.photo} alt={profile.name} style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 22, border: "4px solid #FFD700" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: brand.gold, fontSize: 23 }}>{profile.name}</div>
          <div style={{ fontWeight: 700, color: "#FFD700cc", fontSize: 15, marginBottom: 6 }}>{profile.bio}</div>
          <div style={{ fontSize: 14, color: "#FFD700aa", marginBottom: 6 }}>
            <b>Club:</b> {profile.club} &nbsp; <b>Pos:</b> {profile.position} &nbsp; <b>H:</b> {profile.height}cm &nbsp; <b>WS:</b> {profile.wingspan}cm &nbsp; <b>W:</b> {profile.weight}kg
          </div>
          <div style={{ display: "flex", gap: 24, margin: "4px 0" }}>
            <div><FaChartBar style={{ color: "#FFD700" }} /> {profile.stats.points} PTS</div>
            <div><FaClipboardCheck style={{ color: "#FFD700" }} /> {profile.stats.assists} AST</div>
            <div><FaBasketballBall style={{ color: "#FFD700" }} /> {profile.stats.rebounds} REB</div>
          </div>
        </div>
        {/* Radar chart */}
        <div>
          <svg width={200} height={200}>
            {/* Background axes */}
            {IMPROVEMENT_AXES.map((ax, i) => {
              const angle = (2 * Math.PI * i) / IMPROVEMENT_AXES.length - Math.PI / 2;
              return (
                <g key={ax.key}>
                  <line
                    x1={100}
                    y1={100}
                    x2={100 + 90 * Math.cos(angle)}
                    y2={100 + 90 * Math.sin(angle)}
                    stroke="#FFD70066"
                  />
                  <text
                    x={100 + 100 * Math.cos(angle)}
                    y={100 + 100 * Math.sin(angle)}
                    fill="#FFD700cc"
                    fontSize={11}
                    textAnchor={Math.cos(angle) > 0.2 ? "start" : Math.cos(angle) < -0.2 ? "end" : "middle"}
                    alignmentBaseline="middle"
                  >
                    {ax.label.split(" ")[0]}
                  </text>
                </g>
              );
            })}
            {/* Radar polygon */}
            <polygon
              points={pointsStr}
              fill="#FFD70044"
              stroke="#FFD700"
              strokeWidth={3}
            />
          </svg>
        </div>
      </div>
      {/* Editable Axes Form */}
      {editMode && (
        <div style={{
          background: "#232a2e", borderRadius: 17, padding: 17, boxShadow: "0 2px 14px #FFD70022", marginBottom: 10
        }}>
          <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 16, marginBottom: 7 }}>Edit Axes</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 13 }}>
            {IMPROVEMENT_AXES.map(ax =>
              <div key={ax.key} style={{ display: "flex", flexDirection: "column", marginBottom: 7 }}>
                <label style={{ fontWeight: 700, color: "#FFD700" }}>{ax.label}</label>
                <input type="number" min={1} max={10} value={editAxes[ax.key]?.score || ""} onChange={e => setEditAxes({ ...editAxes, [ax.key]: { ...editAxes[ax.key], score: Number(e.target.value) } })} style={inputStyle} />
              </div>
            )}
          </div>
          <button onClick={saveEdit} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}>Save</button>
          <button onClick={cancelEdit} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}>Cancel</button>
        </div>
      )}
      {/* Improvement Axes Table */}
      <div style={{
        background: "#232a2e", borderRadius: 17, padding: 17, boxShadow: "0 2px 14px #FFD70022", margin: "24px 0"
      }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 17, marginBottom: 6 }}>Improvement Axes (1-10)</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff" }}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Score</th>
              <th>Trend</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {IMPROVEMENT_AXES.map(ax =>
              <tr key={ax.key} style={{ borderBottom: "1px solid #FFD70022", background: profile.axes[ax.key].score < 5 ? "#ff484822" : profile.axes[ax.key].score < 7 ? "#FFD70022" : "#1de68222" }}>
                <td style={{ fontWeight: 700, color: "#FFD700" }}>{ax.label}</td>
                <td style={{ color: TRAFFIC[profile.axes[ax.key].score][0], fontWeight: 800 }}>{profile.axes[ax.key].score}</td>
                <td>{TRAFFIC[profile.axes[ax.key].score][1]}</td>
                <td style={{ color: "#FFD700bb" }}>{ax.desc}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Barriers Section */}
      <div style={{ background: "#232a2e", borderRadius: 17, padding: 17, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 17, marginBottom: 7 }}>Barriers & Bottlenecks</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff", marginBottom: 10 }}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Barrier / Root Cause</th>
              <th>Recommended Action</th>
              <th>Severity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {profile.barriers.map((b, i) =>
              <tr key={i} style={{ borderBottom: "1px solid #FFD70022", background: b.severity === "high" ? "#ff484822" : b.severity === "medium" ? "#FFD70022" : "#1de68222" }}>
                <td style={{ fontWeight: 700 }}>{b.area}</td>
                <td>{b.risk}</td>
                <td style={{ color: "#FFD700" }}>{b.action}</td>
                <td style={{ color: b.severity === "high" ? "#ff4848" : b.severity === "medium" ? "#FFD700" : "#1de682", fontWeight: 700 }}>{b.severity}</td>
                <td><button style={{ ...btnStyle, background: "#ff4848", color: "#fff" }} onClick={() => removeBarrier(i)}><FaTrash /></button></td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Add Barrier */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input placeholder="Area" value={newBarrier.area} onChange={e => setNewBarrier({ ...newBarrier, area: e.target.value })} style={inputStyle} />
          <input placeholder="Root Cause" value={newBarrier.risk} onChange={e => setNewBarrier({ ...newBarrier, risk: e.target.value })} style={inputStyle} />
          <input placeholder="Action" value={newBarrier.action} onChange={e => setNewBarrier({ ...newBarrier, action: e.target.value })} style={inputStyle} />
          <select value={newBarrier.severity} onChange={e => setNewBarrier({ ...newBarrier, severity: e.target.value })} style={inputStyle}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addBarrier} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
        </div>
      </div>
      {/* Risk Windows */}
      <div style={{ background: "#232a2e", borderRadius: 17, padding: 17, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 17, marginBottom: 6 }}>Risk Windows Timeline</div>
        <div style={{ position: "relative", minHeight: 40, background: "#283E51", borderRadius: 10, marginTop: 7, marginBottom: 8 }}>
          {profile.riskWindows.map((rw, i) => (
            <div key={i} style={{
              position: "absolute", left: `${((new Date(rw.from) - new Date("2019-01-01")) / (new Date("2024-12-31") - new Date("2019-01-01"))) * 100}%`,
              width: `${((new Date(rw.to) - new Date(rw.from)) / (new Date("2024-12-31") - new Date("2019-01-01"))) * 100}%`,
              height: 16, background: rw.risk === "high" ? "#ff4848" : rw.risk === "medium" ? "#FFD700" : "#1de682", borderRadius: 7, top: 10, opacity: 0.87,
              minWidth: 28, textAlign: "center", color: "#232a2e", fontWeight: 700, fontSize: 12, zIndex: 2
            }}>
              {rw.label}
              <button onClick={() => removeWindow(i)} style={{ marginLeft: 7, border: "none", background: "none", color: "#fff" }}><FaTimes /></button>
            </div>
          ))}
          {/* Timeline axis */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: 22, height: 1, background: "#FFD70055", zIndex: 1
          }} />
          {[2019,2020,2021,2022,2023,2024].map(year =>
            <div key={year} style={{
              position: "absolute", left: `${((new Date(`${year}-01-01`) - new Date("2019-01-01")) / (new Date("2024-12-31") - new Date("2019-01-01"))) * 100}%`,
              top: 28, color: "#FFD700aa", fontSize: 11, fontWeight: 700
            }}>{year}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <input placeholder="Label" value={newWindow.label} onChange={e => setNewWindow({ ...newWindow, label: e.target.value })} style={inputStyle} />
          <input type="date" value={newWindow.from} onChange={e => setNewWindow({ ...newWindow, from: e.target.value })} style={inputStyle} />
          <input type="date" value={newWindow.to} onChange={e => setNewWindow({ ...newWindow, to: e.target.value })} style={inputStyle} />
          <select value={newWindow.risk} onChange={e => setNewWindow({ ...newWindow, risk: e.target.value })} style={inputStyle}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addWindow} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
        </div>
      </div>
      {/* Attachments */}
      <div style={{ background: "#232a2e", borderRadius: 17, padding: 17, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 17, marginBottom: 7 }}>Attachments</div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {profile.attachments.map((a, i) => (
            <div key={i} style={{
              background: "#181e23", color: "#FFD700", borderRadius: 7, padding: "4px 10px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6
            }}>
              {a.type === "video" ? <FaCamera /> : a.type === "pdf" ? <FaPaperclip /> : <FaPaperclip />}
              <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: "#FFD700" }}>{a.label || a.url.split("/").pop()}</a>
              <button onClick={() => removeAttachment(i)} style={{ marginLeft: 5, border: "none", background: "none", color: "#fff" }}><FaTimes /></button>
            </div>
          ))}
        </div>
        {/* Add Attachment */}
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 6 }}>
          <select value={newAttachment.type} onChange={e => setNewAttachment({ ...newAttachment, type: e.target.value })} style={inputStyle}>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="doc">Doc</option>
          </select>
          <input placeholder="URL" value={newAttachment.url} onChange={e => setNewAttachment({ ...newAttachment, url: e.target.value })} style={inputStyleFull} />
          <input placeholder="Label (optional)" value={newAttachment.label} onChange={e => setNewAttachment({ ...newAttachment, label: e.target.value })} style={inputStyle} />
          <button onClick={addAttachment} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
        </div>
      </div>
      {/* Limit Breaker Forecast & Consulting Recommendations */}
      <div style={{
        background: "#232a2e", borderRadius: 17, padding: 17, boxShadow: "0 2px 14px #FFD70022", marginBottom: 18
      }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 17, marginBottom: 8 }}>Limit Breaker Forecast</div>
        <div style={{ color: "#FFD700bb", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{profile.forecast}</div>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 16, marginTop: 10 }}>Boardroom Recommendations</div>
        <ul>
          {profile.recommendations.map((r, i) => (
            <li key={i} style={{ color: "#1de682", fontWeight: 600, marginBottom: 4 }}>{r}</li>
          ))}
        </ul>
      </div>
      {/* Scenario Simulator */}
      <div style={{ background: "#283E51", borderRadius: 17, padding: 13, marginBottom: 13 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 5 }}>Scenario Simulator</div>
        <button onClick={runScenario} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginRight: 13 }}>
          <FaLightbulb style={{ marginRight: 8 }} /> Run "No Barriers" Scenario
        </button>
        {scenarioText && <span style={{ color: "#1de682", fontWeight: 600, fontSize: 16 }}>{scenarioText}</span>}
      </div>
      {/* Export/Boardroom Copy */}
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button onClick={exportCSV} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginRight: 10 }}>
          <FaFileExport style={{ marginRight: 6 }} /> Export CSV
        </button>
        <button onClick={() => { window.alert(boardroomCopy().join("\n")); }} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>
          <FaDownload style={{ marginRight: 6 }} /> Boardroom Copy
        </button>
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

export default LimitBreakerCardElite;
