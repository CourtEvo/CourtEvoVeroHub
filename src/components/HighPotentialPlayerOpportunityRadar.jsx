import React, { useState } from "react";
import {
  FaRegStar, FaBullseye, FaChartLine, FaSearch, FaFilter, FaPlusCircle, FaEdit, FaTrash,
  FaUserTie, FaArrowUp, FaCloudDownloadAlt, FaBolt, FaUsers, FaTrophy, FaRegClock, FaCheckCircle, FaExclamationTriangle, FaBrain
} from "react-icons/fa";

// Elite opportunity statuses and colors
const statuses = [
  { key: "Watchlist", color: "#FFD700" },
  { key: "Late Bloomer", color: "#1de682" },
  { key: "Trial Recommendation", color: "#FFD700" },
  { key: "Transfer Opportunity", color: "#485563" },
  { key: "Promotion Candidate", color: "#FFD700" },
  { key: "At Risk", color: "#ff6b6b" }
];

// Mock player data
const initialPlayers = [
  {
    id: 1,
    name: "Filip Simic",
    team: "U12 Boys",
    year: 2012,
    age: 12,
    status: "Late Bloomer",
    trend: [2, 3, 4, 7, 8],
    opScore: 9,
    opportunity: "Late Bloomer, strong Q4 metrics",
    nextStep: "Invite to advanced trial",
    agent: "",
    lastReview: "2024-06-01",
    growth: [122, 130, 136, 142, 149], // cm for height
    promotionWindow: true,
    contextLog: [
      { date: "2024-03-11", context: "Missed U12 trial, fast Q3 growth" },
      { date: "2024-06-01", context: "Dominated late spring tournament" }
    ]
  },
  {
    id: 2,
    name: "Dino Ilic",
    team: "U14 Boys",
    year: 2010,
    age: 14,
    status: "Trial Recommendation",
    trend: [4, 5, 6, 8, 10],
    opScore: 8,
    opportunity: "Physical upside, strong camp feedback",
    nextStep: "Trial with senior U16s",
    agent: "ProScout",
    lastReview: "2024-06-10",
    growth: [148, 153, 156, 160, 165],
    promotionWindow: false,
    contextLog: [
      { date: "2024-02-14", context: "Missed 1 month due to injury" },
      { date: "2024-05-30", context: "Top 5 in combine sprints" }
    ]
  },
  {
    id: 3,
    name: "Marko Kovačević",
    team: "U16 Boys",
    year: 2008,
    age: 16,
    status: "Transfer Opportunity",
    trend: [6, 7, 8, 9, 10],
    opScore: 7,
    opportunity: "Transfer window opening, interest from ABA club",
    nextStep: "Meeting with agent",
    agent: "AdvanceTalent",
    lastReview: "2024-06-13",
    growth: [172, 176, 180, 181, 182],
    promotionWindow: false,
    contextLog: [
      { date: "2024-03-01", context: "Received approach from ABA club" }
    ]
  }
];

// AI/visual color by opportunity score
function opColor(score) {
  if (score >= 9) return "#FFD700";
  if (score >= 7) return "#1de682";
  if (score >= 5) return "#485563";
  return "#ff6b6b";
}

// Age bands for heatmap
const ageBands = [12, 13, 14, 15, 16, 17, 18];

// Boardroom AI Insights Panel
function AIInsights({ players }) {
  // Identify: late bloomers, fast risers, at-risk, bottleneck age, missed window
  const lateBloomers = players.filter(p => p.status === "Late Bloomer");
  const fastRisers = players.filter(p => (p.trend && p.trend.slice(-2).reduce((a, b) => b - a) > 1));
  const atRisk = players.filter(p => p.opScore < 5 || (p.status === "At Risk"));
  const bottleneckAge = ageBands.sort((a, b) =>
    players.filter(p => p.age === b).length - players.filter(p => p.age === a).length
  )[0];
  const missedWindows = players.filter(p => p.promotionWindow === false && p.status === "Promotion Candidate");

  return (
    <div style={{
      background: "#232a2e", borderRadius: 13, padding: "14px 20px", marginBottom: 14, boxShadow: "0 2px 10px #FFD70022", color: "#FFD700", fontWeight: 800, fontSize: 15
    }}>
      <FaBrain color="#FFD700" size={19} style={{ marginRight: 9 }} />
      <span>
        <b>AI Insights:</b>{" "}
        Late Bloomers: <span style={{ color: "#1de682" }}>{lateBloomers.length}</span> |{" "}
        Fast Risers: <span style={{ color: "#FFD700" }}>{fastRisers.length}</span> |{" "}
        At Risk: <span style={{ color: "#ff6b6b" }}>{atRisk.length}</span> |{" "}
        Bottleneck Age: <span style={{ color: "#FFD700" }}>{bottleneckAge}</span> |{" "}
        Missed Promotion Windows: <span style={{ color: "#ff6b6b" }}>{missedWindows.length}</span>
      </span>
    </div>
  );
}

// Opportunity Heatmap by age/team
function OpportunityHeatmap({ players }) {
  // Matrix: age (x), status (y), colored by opScore avg
  const statusKeys = statuses.map(s => s.key);
  const matrix = ageBands.map(age =>
    statusKeys.map(st => {
      const filtered = players.filter(p => p.age === age && p.status === st);
      if (!filtered.length) return null;
      const avg = Math.round(filtered.reduce((a, b) => a + (b.opScore || 0), 0) / filtered.length);
      return { count: filtered.length, avg };
    })
  );
  return (
    <div style={{ margin: "18px 0" }}>
      <b style={{ color: "#FFD700" }}>Opportunity Heatmap (Age × Status)</b>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 7 }}>
        <div style={{ display: "flex" }}>
          <span style={{ width: 54 }} />
          {ageBands.map(a => <span key={a} style={{ width: 38, color: "#FFD700", fontWeight: 900, textAlign: "center" }}>{a}</span>)}
        </div>
        {statusKeys.map((st, j) => (
          <div key={st} style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <span style={{ width: 90, color: statuses[j].color }}>{st}</span>
            {ageBands.map((a, i) =>
              matrix[i][j] ? (
                <span key={i} style={{
                  width: 37, height: 27, borderRadius: 8,
                  background: opColor(matrix[i][j].avg), color: "#232a2e",
                  fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 2
                }}>
                  {matrix[i][j].count}
                </span>
              ) : (
                <span key={i} style={{ width: 37, height: 27, display: "inline-flex" }} />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Growth Trajectory Chart
function GrowthTrajectory({ growth }) {
  if (!growth) return null;
  const H = 46, W = 120, max = Math.max(...growth);
  return (
    <svg width={W} height={H} style={{ background: "#283E51", borderRadius: 7, boxShadow: "0 1px 4px #FFD70022", marginLeft: 6 }}>
      <polyline
        fill="none" stroke="#1de682" strokeWidth={3}
        points={growth.map((d, i) =>
          `${i * (W / (growth.length - 1))},${H - ((d / max) * (H - 7))}`
        ).join(" ")}
      />
      {growth.map((d, i) => (
        <circle
          key={i}
          cx={i * (W / (growth.length - 1))}
          cy={H - ((d / max) * (H - 7))}
          r={5}
          fill="#FFD700"
        />
      ))}
    </svg>
  );
}

// Opportunity Trend Chart
function OpportunityTrendChart({ trend }) {
  if (!trend) return null;
  const H = 32, W = 90, max = Math.max(...trend);
  return (
    <svg width={W} height={H} style={{ background: "#283E51", borderRadius: 7, boxShadow: "0 1px 4px #FFD70022", marginLeft: 6 }}>
      <polyline
        fill="none" stroke="#FFD700" strokeWidth={3}
        points={trend.map((d, i) =>
          `${i * (W / (trend.length - 1))},${H - ((d / max) * (H - 7))}`
        ).join(" ")}
      />
      {trend.map((d, i) => (
        <circle
          key={i}
          cx={i * (W / (trend.length - 1))}
          cy={H - ((d / max) * (H - 7))}
          r={4}
          fill={opColor(d)}
        />
      ))}
    </svg>
  );
}

// Promotion/Transfer Pipeline Visual
function Pipeline({ players }) {
  const stages = ["Late Bloomer", "Watchlist", "Trial Recommendation", "Promotion Candidate", "Transfer Opportunity"];
  return (
    <div style={{ background: "#232a2e", borderRadius: 14, padding: "9px 17px", margin: "15px 0", boxShadow: "0 2px 8px #FFD70022" }}>
      <b style={{ color: "#FFD700" }}><FaArrowUp /> Promotion / Transfer Pipeline</b>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        {stages.map(st => {
          const count = players.filter(p => p.status === st).length;
          return (
            <div key={st} style={{
              background: count ? "#FFD700" : "#485563", color: count ? "#232a2e" : "#1de682", borderRadius: 9,
              fontWeight: 900, width: 74, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px #FFD70033", fontSize: 16, flexDirection: "column"
            }}>
              <span>{st.split(" ")[0]}</span>
              <span style={{ fontSize: 17 }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HighPotentialPlayerOpportunityRadar() {
  const [players, setPlayers] = useState(initialPlayers);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);

  // CRUD
  function handleEdit(p) { setEditing(p); setForm({ ...p }); setAdding(false); }
  function handleDelete(id) { setPlayers(ps => ps.filter(p => p.id !== id)); setEditing(null); setSelected(null); }
  function handleSaveEdit() {
    setPlayers(ps => ps.map(p => p.id === editing.id ? { ...form, id: editing.id } : p));
    setEditing(null); setSelected(null);
  }
  function handleAddNew() {
    setPlayers(ps => [...ps, { ...form, id: Date.now(), trend: [form.opScore || 5], growth: [], contextLog: [], lastReview: new Date().toISOString().slice(0, 10) }]);
    setAdding(false);
  }
  function exportCSV() {
    const header = "Name,Team,Year,Age,Status,OpScore,Opportunity,NextStep,Agent,LastReview\n";
    const body = players.map(p =>
      [
        p.name, p.team, p.year, p.age, p.status, p.opScore, p.opportunity, p.nextStep, p.agent, p.lastReview
      ].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "player_opportunity_radar.csv";
    link.click();
  }

  // Filtering
  const filtered = players.filter(
    p =>
      (!filterStatus || p.status === filterStatus) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase()))
  );

  // --- Main ---
  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "32px", padding: "34px 22px 22px 22px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <FaRegStar size={42} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 30, letterSpacing: 1, marginBottom: 2, color: "#FFD700"
          }}>
            HIGH POTENTIAL PLAYER OPPORTUNITY RADAR
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Pipeline. Heatmap. Late bloomers. Upside meter. Boardroom impact.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <FaSearch color="#FFD700" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Find player..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 15, width: 120, marginLeft: 5 }} />
          <FaFilter color="#FFD700" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 7,
              border: "none", fontWeight: 700, fontSize: 15, padding: "5px 9px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Status</option>
            {statuses.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
          </select>
        </div>
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 12, fontWeight: 900,
            border: "none", padding: "10px 22px", marginLeft: 22, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 10px 0 #FFD70055"
          }}
          onClick={exportCSV}
        >
          <FaCloudDownloadAlt style={{ marginRight: 8 }} /> Export CSV
        </button>
      </div>
      <AIInsights players={players} />
      <Pipeline players={players} />
      <OpportunityHeatmap players={players} />
      {/* TABLE */}
      <div style={{
        minWidth: 430, maxWidth: 900, background: "#283E51", borderRadius: 22, padding: 19, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 9 }}>Player Opportunity Table</div>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
            border: "none", padding: "7px 15px", fontSize: 15, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 8px 0 #1de68266",
            marginBottom: 9
          }}
          onClick={() => { setAdding(true); setForm({ status: "Watchlist", opScore: 5 }); setEditing(null); }}>
          <FaPlusCircle style={{ marginRight: 6 }} /> Add Player
        </button>
        {(adding || editing) &&
          <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "13px 11px", marginBottom: 13 }}>
            <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
              <div style={{ display: "flex", gap: 15, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <b>Name:</b>
                  <input type="text" value={form.name || ""} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 120 }} />
                </div>
                <div>
                  <b>Team:</b>
                  <input type="text" value={form.team || ""}
                    onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 120 }} />
                </div>
                <div>
                  <b>Year:</b>
                  <input type="number" value={form.year || 2012}
                    onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 70, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Age:</b>
                  <input type="number" value={form.age || ""}
                    onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 50, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Status:</b>
                  <select value={form.status || "Watchlist"}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {statuses.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
                  </select>
                </div>
                <div>
                  <b>Op Score:</b>
                  <input type="number" min={1} max={10} value={form.opScore || 5}
                    onChange={e => setForm(f => ({ ...f, opScore: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 55, fontWeight: 700 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 15, flexWrap: "wrap", alignItems: "center", marginTop: 9 }}>
                <div>
                  <b>Opportunity:</b>
                  <input type="text" value={form.opportunity || ""}
                    onChange={e => setForm(f => ({ ...f, opportunity: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 160 }} />
                </div>
                <div>
                  <b>Next Step:</b>
                  <input type="text" value={form.nextStep || ""}
                    onChange={e => setForm(f => ({ ...f, nextStep: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 130 }} />
                </div>
                <div>
                  <b>Agent:</b>
                  <input type="text" value={form.agent || ""}
                    onChange={e => setForm(f => ({ ...f, agent: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 110 }} />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <button type="submit" style={{
                  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 9, fontWeight: 900, fontSize: 16,
                  padding: "7px 24px", marginRight: 12, cursor: "pointer", boxShadow: "0 2px 10px #FFD70022"
                }}>{adding ? "Add" : "Save"}</button>
                <button type="button" style={{
                  background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 9, fontWeight: 900, fontSize: 16,
                  padding: "7px 24px", cursor: "pointer", boxShadow: "0 2px 10px #ff6b6b33"
                }} onClick={() => { setAdding(false); setEditing(null); setForm({}); }}>Cancel</button>
              </div>
            </form>
          </div>
        }
        <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse", fontFamily: "Segoe UI" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th>Year</th>
              <th>Age</th>
              <th>Status</th>
              <th>Op Score</th>
              <th>Trend</th>
              <th>Growth</th>
              <th>Opportunity</th>
              <th>Next Step</th>
              <th>Agent</th>
              <th>Review</th>
              <th>Edit</th>
              <th>Del</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{
                background: opColor(p.opScore) + "22"
              }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }}
                  onClick={() => setSelected(p)}>{p.name}</td>
                <td>{p.team}</td>
                <td>{p.year}</td>
                <td>{p.age}</td>
                <td>
                  <span style={{
                    background: statuses.find(s => s.key === p.status)?.color || "#FFD700",
                    color: "#232a2e", borderRadius: 7, padding: "2px 11px", fontWeight: 900, fontSize: 14
                  }}>{p.status}</span>
                </td>
                <td>
                  <span style={{
                    background: opColor(p.opScore), color: "#232a2e", borderRadius: 7, padding: "2px 10px", fontWeight: 900
                  }}>{p.opScore}</span>
                </td>
                <td><OpportunityTrendChart trend={p.trend} /></td>
                <td><GrowthTrajectory growth={p.growth} /></td>
                <td>{p.opportunity}</td>
                <td>{p.nextStep}</td>
                <td>{p.agent}</td>
                <td>{p.lastReview}</td>
                <td>
                  <button onClick={() => handleEdit(p)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaEdit />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SIDEBAR: Player Profile & Opportunity Radar */}
      <div style={{
        minWidth: 330, maxWidth: 470, background: "#232a2e", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, height: "100%"
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>Player Opportunity Profile</b>
        {selected ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 20, margin: "8px 0 6px 0" }}>{selected.name}</div>
            <div><b>Team:</b> {selected.team}</div>
            <div><b>Year:</b> {selected.year}</div>
            <div><b>Age:</b> {selected.age}</div>
            <div><b>Status:</b> {selected.status}</div>
            <div><b>Op Score:</b> <span style={{
              background: opColor(selected.opScore), color: "#232a2e", borderRadius: 7, padding: "2px 10px", fontWeight: 900
            }}>{selected.opScore}</span></div>
            <div><b>Opportunity:</b> {selected.opportunity}</div>
            <div><b>Next Step:</b> {selected.nextStep}</div>
            <div><b>Agent:</b> {selected.agent || <span style={{ color: "#1de682" }}>None</span>}</div>
            <div><b>Last Review:</b> {selected.lastReview}</div>
            <div style={{ marginTop: 8 }}>
              <b>Trend:</b>
              <OpportunityTrendChart trend={selected.trend} />
            </div>
            <div style={{ marginTop: 8 }}>
              <b>Growth Trajectory:</b>
              <GrowthTrajectory growth={selected.growth} />
            </div>
            <div style={{ marginTop: 8 }}>
              <b>Context Log:</b>
              <ul style={{ margin: 0, fontSize: 15 }}>
                {(selected.contextLog || []).map((c, i) =>
                  <li key={i} style={{ color: "#FFD700" }}>
                    <FaExclamationTriangle color="#FFD700" style={{ marginRight: 5 }} /> <b>{c.date}:</b> {c.context}
                  </li>
                )}
              </ul>
            </div>
          </>
        ) : (
          <div style={{ margin: "12px 0 10px 0", color: "#FFD700", fontSize: 16, fontWeight: 900 }}>
            Select a player to see full opportunity profile.
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 24,
        fontSize: 14,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. The elite talent radar.
      </div>
    </div>
  );
}
