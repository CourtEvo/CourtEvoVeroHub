import React, { useState } from "react";
import {
  FaChartLine, FaArrowUp, FaArrowDown, FaUserGraduate, FaUsers, FaExclamationTriangle, FaHeartbeat, FaTrophy, FaRobot, FaComments, FaClipboardCheck, FaCalendarAlt, FaCheckCircle, FaBolt, FaCogs, FaFileExport, FaEuroSign, FaHandshake, FaExternalLinkAlt, FaPlus, FaTrash
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const SQUADS = [
  { label: "U14", key: "u14" }, { label: "U16", key: "u16" }, { label: "U18", key: "u18" }, { label: "SENIOR", key: "senior" }
];

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];
const OBSTACLE_ICONS = {
  "Injury": <FaHeartbeat color="#ff4848" />, "Academic": <FaClipboardCheck color="#FFD700" />, "Attitude": <FaExclamationTriangle color="#FFD700" />,
  "Contract": <FaCogs color="#FFD700" />, "Tactical": <FaBolt color="#FFD700" />
};

const DEFAULT_PLAYERS = [
  {
    id: 1, name: "Ivan Radic", currentSquad: "u18", pos: "SG", yearsInAcademy: 5, readiness: 85, readinessTrend: [+3, +2, +4], promotionProb: 82, commercialValue: 25000,
    obstacles: [], sponsor: "Nike", externalOffers: [{ type: "Transfer", club: "Partizan", value: 35000, link: "#" }],
    timeline: [{ date: "2022-08", event: "Joined U16" }, { date: "2023-09", event: "Promoted to U18" }],
    scenarioNote: "Board sees strong U18/first team fit in next 12m. Needs contract resolved.",
    aiNarr: "Radic is the highest-potential SG; minor contract delay. Promotion could open sponsor/academy commercial."
  },
  {
    id: 2, name: "Marko Proleta", currentSquad: "u18", pos: "PG", yearsInAcademy: 6, readiness: 77, readinessTrend: [+2, 0, -1], promotionProb: 69, commercialValue: 17000,
    obstacles: [{ type: "Academic", note: "Missed tests" }], sponsor: "Erste Bank", externalOffers: [],
    timeline: [{ date: "2022-08", event: "Joined U16" }, { date: "2023-09", event: "Promoted to U18" }, { date: "2024-05", event: "Academic warning" }],
    scenarioNote: "Blocked for next 6m (academic probation)",
    aiNarr: "Proleta is a top PG prospect, but academic compliance is holding back. No board action until cleared."
  },
  {
    id: 3, name: "Luka Sibenik", currentSquad: "u16", pos: "C", yearsInAcademy: 4, readiness: 62, readinessTrend: [-2, -3, 0], promotionProb: 55, commercialValue: 11000,
    obstacles: [{ type: "Injury", note: "Knee recovery" }], sponsor: "", externalOffers: [],
    timeline: [{ date: "2023-01", event: "Injury" }],
    scenarioNote: "Rehab program, expected return Q4.",
    aiNarr: "Physical readiness low—injury risk for now. Do not promote; focus on rehab/squad support."
  },
  {
    id: 4, name: "Kristijan Krstic", currentSquad: "senior", pos: "SF", yearsInAcademy: 7, readiness: 92, readinessTrend: [+2, +1, 0], promotionProb: 0, commercialValue: 60000,
    obstacles: [], sponsor: "", externalOffers: [],
    timeline: [{ date: "2021-06", event: "Promoted to Senior" }],
    scenarioNote: "Full senior. Board to review leadership contract renewal.",
    aiNarr: "Core SF, now senior leadership. Review for captaincy/commercial value."
  }
];

// Helper functions
function squadColor(squad) { switch (squad) { case "u14": return "#283E51"; case "u16": return "#485563"; case "u18": return "#FFD70022"; case "senior": return "#1de68222"; default: return "#232a2e"; } }
function readinessColor(val) { if (val >= 85) return "#1de682"; if (val >= 70) return "#FFD700"; return "#ff4848"; }
function probColor(val) { if (val >= 80) return "#1de682"; if (val >= 60) return "#FFD700"; return "#ff4848"; }
function valueColor(val) { if (val >= 30000) return "#1de682"; if (val >= 15000) return "#FFD700"; return "#fff"; }
function trendArrow(val) { return val > 0 ? <FaArrowUp color="#1de682" /> : val < 0 ? <FaArrowDown color="#ff4848" /> : ""; }

// Bottleneck & Risk Radar SVG
function BottleneckRadar({ players }) {
  const data = POSITIONS.map(pos =>
    players.filter(p => p.pos === pos && p.currentSquad !== "senior").length
  );
  return (
    <svg width={250} height={250}>
      <circle cx={125} cy={125} r={90} fill="#FFD70011" />
      {data.map((v, i) => {
        const angle = (2 * Math.PI / data.length) * i - Math.PI / 2;
        const r = 50 + v * 20;
        const x = 125 + r * Math.cos(angle);
        const y = 125 + r * Math.sin(angle);
        return (
          <g key={i}>
            <line x1={125} y1={125} x2={x} y2={y} stroke="#FFD700" strokeWidth={2 + v} />
            <circle cx={x} cy={y} r={8 + v * 2} fill={v > 1 ? "#1de682" : "#FFD700"} />
            <text x={x} y={y - 13} fill="#FFD700" fontWeight={700} fontSize={14} textAnchor="middle">{POSITIONS[i]}</text>
            <text x={x} y={y + 17} fill="#FFD70099" fontWeight={500} fontSize={12} textAnchor="middle">{v}</text>
          </g>
        );
      })}
      <text x={125} y={125} fill="#1de682" fontWeight={900} fontSize={18} textAnchor="middle">Pipeline</text>
    </svg>
  );
}

// Animated flowmap SVG
function TalentFlowmap({ players }) {
  return (
    <svg width={820} height={110}>
      {SQUADS.map((s, idx) => (
        <rect key={s.key} x={20 + idx * 200} y={10} width={160} height={90} rx={18} fill={squadColor(s.key)} />
      ))}
      {SQUADS.map((s, idx) => (
        <text key={s.key} x={100 + idx * 200} y={34} fill="#FFD700" fontWeight={900} fontSize={18} textAnchor="middle">{s.label}</text>
      ))}
      {players.map((p, idx) => {
        let fromIdx = SQUADS.findIndex(x => x.key === p.currentSquad);
        if (fromIdx < 1) return null;
        let x1 = 100 + (fromIdx - 1) * 200;
        let y1 = 60 + idx * 6 % 70;
        let x2 = 100 + fromIdx * 200;
        let y2 = y1 + (Math.random() - 0.5) * 8;
        return (
          <line key={p.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD700" strokeWidth={2} markerEnd="url(#arrowhead)" opacity="0.7" />
        );
      })}
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="#FFD700" />
        </marker>
      </defs>
      {players.map((p, idx) => {
        let sIdx = SQUADS.findIndex(x => x.key === p.currentSquad);
        let x = 100 + sIdx * 200;
        let y = 62 + idx * 7 % 70;
        return (
          <g key={p.id}>
            <circle cx={x} cy={y} r={15} fill={readinessColor(p.readiness)} stroke="#FFD700" strokeWidth={2} />
            <text x={x} y={y + 5} fill="#232a2e" fontWeight={900} fontSize={14} textAnchor="middle">{p.name.split(" ")[0]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Main module
const ProgressionEngineElite = () => {
  const [players, setPlayers] = useState([...DEFAULT_PLAYERS]);
  const [expanded, setExpanded] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [log, setLog] = useState([
    { by: "Board", txt: "Promoted Ivan Radic to U18", date: "2023-09-01" },
    { by: "Coach", txt: "Academic probation for Marko Proleta", date: "2024-05-18" }
  ]);
  const [logText, setLogText] = useState("");
  const [view, setView] = useState("flowmap");
  const [scenarioSettings, setScenarioSettings] = useState({ fastTrackU16: false, seniorDeparture: false });
  const [newPlayer, setNewPlayer] = useState({
    name: "", pos: "PG", currentSquad: "u16", yearsInAcademy: 1, readiness: 60, readinessTrend: [0, 0, 0], promotionProb: 50, commercialValue: 9000, obstacles: [],
    sponsor: "", externalOffers: [], timeline: [], scenarioNote: "", aiNarr: ""
  });

  // CRUD & scenario
  const addPlayer = () => {
    setPlayers([...players, { ...newPlayer, id: players.length ? Math.max(...players.map(a => a.id)) + 1 : 1 }]);
    setNewPlayer({ name: "", pos: "PG", currentSquad: "u16", yearsInAcademy: 1, readiness: 60, readinessTrend: [0, 0, 0], promotionProb: 50, commercialValue: 9000, obstacles: [], sponsor: "", externalOffers: [], timeline: [], scenarioNote: "", aiNarr: "" });
  };
  const removePlayer = id => setPlayers(players.filter(p => p.id !== id));
  const addObstacle = (id, type, note) => setPlayers(players.map(p => p.id === id ? { ...p, obstacles: [...p.obstacles, { type, note }] } : p));
  const clearObstacle = (id, idx) => setPlayers(players.map(p => p.id === id ? { ...p, obstacles: p.obstacles.filter((_, i) => i !== idx) } : p));
  const addTimeline = (id, event) => setPlayers(players.map(p => p.id === id ? { ...p, timeline: [...p.timeline, event] } : p));
  const runScenario = (id) => {
    const player = players.find(p => p.id === id);
    setScenario({
      player,
      ai: "Dynamic scenario not implemented in this stub.", // Extend as needed
      teamRisk: player.obstacles.length ? "Blocked—see below." : player.readiness < 70 ? "Not ready" : "Ready—squad risk minimal.",
      squadImpact: player.currentSquad === "u18" ? "U18 depth reduced; may need backfill." : "No immediate risk."
    });
    setExpanded(id);
  };

  // Depth chart by position (down to U14)
  function getDepthChart(pos) {
    return SQUADS.map(squad =>
      players.filter(p => p.pos === pos && p.currentSquad === squad.key)
    );
  }

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 29,
      padding: 33, boxShadow: "0 8px 64px #FFD70055", maxWidth: 1850, margin: "0 auto"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <FaChartLine size={38} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 32, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Academy-to-First Team Progression Engine
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 800, borderRadius: 17,
          padding: '8px 28px', fontSize: 17, marginLeft: 18, boxShadow: '0 2px 10px #FFD70044'
        }}>
          CourtEvo Vero | Elite Talent Pipeline
        </span>
        <button style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10,
          fontWeight: 900, fontSize: 17, padding: "11px 26px", marginLeft: 13
        }}>
          <FaFileExport style={{ marginRight: 8 }} /> Export Board PDF/CSV
        </button>
      </div>
      {/* Main nav */}
      <div style={{ display: "flex", gap: 13, marginBottom: 20 }}>
        <button onClick={() => setView("flowmap")} style={{
          background: view === "flowmap" ? "#FFD700" : "#232a2e", color: view === "flowmap" ? "#232a2e" : "#FFD700",
          fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 17
        }}>Flowmap</button>
        <button onClick={() => setView("heatmap")} style={{
          background: view === "heatmap" ? "#FFD700" : "#232a2e", color: view === "heatmap" ? "#232a2e" : "#FFD700",
          fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 17
        }}>Squad Heatmap</button>
        <button onClick={() => setView("timeline")} style={{
          background: view === "timeline" ? "#FFD700" : "#232a2e", color: view === "timeline" ? "#232a2e" : "#FFD700",
          fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 17
        }}>Player Timelines</button>
        <button onClick={() => setView("dashboard")} style={{
          background: view === "dashboard" ? "#FFD700" : "#232a2e", color: view === "dashboard" ? "#232a2e" : "#FFD700",
          fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 17
        }}>Pipeline Dashboard</button>
      </div>
      {/* Animated flow + radar */}
      {view === "flowmap" &&
        <div style={{ display: "flex", gap: 44, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 21, marginBottom: 8 }}><FaArrowUp /> Talent Flow</div>
            <TalentFlowmap players={players} />
          </div>
          <div style={{ background: "#232a2e", borderRadius: 17, padding: 20, boxShadow: "0 2px 14px #FFD70022" }}>
            <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 18, marginBottom: 7 }}>Bottleneck & Risk Radar</div>
            <BottleneckRadar players={players} />
          </div>
        </div>
      }
      {/* Squad heatmap */}
      {view === "heatmap" &&
        <div style={{ background: "#232a2e", borderRadius: 15, padding: 25, marginBottom: 20 }}>
          <table style={{ width: "100%", textAlign: "center", fontSize: 16 }}>
            <thead>
              <tr style={{ color: "#FFD700", fontWeight: 900 }}>
                <th>Position</th>
                {SQUADS.map(s => <th key={s.key}>{s.label}</th>)}
                <th>Commercial</th>
                <th>Sponsor</th>
                <th>Offers</th>
              </tr>
            </thead>
            <tbody>
              {POSITIONS.map(pos => (
                <tr key={pos}>
                  <td style={{ color: "#FFD700", fontWeight: 700 }}>{pos}</td>
                  {SQUADS.map(squad => {
                    const p = players.find(p => p.pos === pos && p.currentSquad === squad.key);
                    return (
                      <td key={squad.key} style={{
                        background: squadColor(squad.key), borderRadius: 10, minWidth: 120, height: 60, position: "relative"
                      }}>
                        {p ? (
                          <div style={{ cursor: "pointer" }} onClick={() => setExpanded(p.id)}>
                            <b style={{ fontSize: 17, color: "#FFD700" }}>{p.name}</b>
                            <div style={{ color: readinessColor(p.readiness), fontWeight: 700, fontSize: 15 }}>
                              {p.readiness} <FaArrowUp style={{ color: "#1de682", marginLeft: 3 }} />
                            </div>
                            <div style={{ color: probColor(p.promotionProb), fontWeight: 700, fontSize: 14 }}>
                              {p.promotionProb}%
                            </div>
                            <div style={{ fontSize: 13, marginTop: 1 }}>
                              {p.obstacles.length > 0 && p.obstacles.map((o, i) =>
                                <span key={i} style={{ marginRight: 3 }}>{OBSTACLE_ICONS[o.type]}</span>
                              )}
                            </div>
                          </div>
                        ) : <span style={{ color: "#ff4848", fontWeight: 900 }}>–</span>}
                      </td>
                    );
                  })}
                  {/* Add commercial/sponsor/offers columns */}
                  <td style={{ color: valueColor(players.find(p => p.pos === pos)?.commercialValue || 0), fontWeight: 700 }}>
                    {players.find(p => p.pos === pos)?.commercialValue ? (
                      <>€{players.find(p => p.pos === pos).commercialValue.toLocaleString()}</>
                    ) : "—"}
                  </td>
                  <td style={{ color: "#1de682" }}>
                    {players.find(p => p.pos === pos)?.sponsor || "—"}
                  </td>
                  <td style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>
                    {players.find(p => p.pos === pos)?.externalOffers?.length
                      ? <FaExternalLinkAlt />
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      {/* Player timelines */}
      {view === "timeline" &&
        <div>
          <b style={{ color: "#FFD700", fontSize: 18 }}>Player Development Timelines</b>
          <div style={{ marginTop: 13 }}>
            {players.map((p, i) => (
              <div key={p.id} style={{
                background: "#232a2e", borderRadius: 13, marginBottom: 15, padding: 18, boxShadow: "0 2px 18px #FFD70022"
              }}>
                <b style={{ color: "#FFD700" }}>{p.name}</b> <span style={{ color: "#1de682", fontWeight: 700 }}>{p.pos} | {p.currentSquad.toUpperCase()}</span>
                <div style={{ margin: "6px 0", color: "#FFD70099", fontSize: 13 }}>
                  {p.timeline.map((e, j) =>
                    <span key={j} style={{ marginRight: 10 }}><FaCalendarAlt style={{ marginRight: 3 }} />{e.date}: {e.event}</span>
                  )}
                </div>
                <div style={{ marginTop: 7 }}>
                  <button onClick={() => setExpanded(p.id)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", fontSize: 15 }}>
                    <FaComments style={{ marginRight: 6 }} /> View Storyboard
                  </button>
                  <button onClick={() => {
                    let date = prompt("Date (YYYY-MM):");
                    let event = prompt("Event:");
                    if (date && event) addTimeline(p.id, { date, event });
                  }} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", fontSize: 15, marginLeft: 11 }}>
                    <FaPlus style={{ marginRight: 6 }} /> Add Timeline Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      {/* Pipeline dashboard */}
      {view === "dashboard" &&
        <div style={{
          background: "#232a2e", borderRadius: 15, padding: 30, display: "flex", gap: 55
        }}>
          <div style={{ flex: 1.7 }}>
            <b style={{ color: "#FFD700", fontSize: 19 }}>Talent Pipeline Health</b>
            <ul style={{ fontWeight: 700, fontSize: 17, margin: "12px 0 16px 0" }}>
              {POSITIONS.map(pos => {
                const count = players.filter(p => p.pos === pos && p.currentSquad !== "senior").length;
                return (
                  <li key={pos} style={{ color: count > 1 ? "#1de682" : "#FFD700" }}>
                    {pos}: {count} prospect{count !== 1 && "s"}
                  </li>
                );
              })}
            </ul>
            <b style={{ color: "#FFD700", fontSize: 17 }}>Potential Bottlenecks:</b>
            <ul>
              {POSITIONS.filter(pos => players.filter(p => p.pos === pos && p.currentSquad !== "senior").length === 0).map(pos =>
                <li key={pos} style={{ color: "#ff4848" }}>{pos}: <FaExclamationTriangle /> No pipeline prospects</li>
              )}
              {POSITIONS.every(pos => players.filter(p => p.pos === pos && p.currentSquad !== "senior").length > 0)
                && <li style={{ color: "#1de682", fontWeight: 700 }}>No critical bottlenecks detected</li>
              }
            </ul>
            <b style={{ color: "#FFD700", fontSize: 17 }}>Boardroom Recommendations:</b>
            <ul>
              <li style={{ color: "#FFD700" }}>Monitor academic and contract obstacles—high risk for SG/PG.</li>
              <li style={{ color: "#1de682" }}>Prepare U18 succession for C position after injury recovery.</li>
              <li style={{ color: "#FFD700" }}>Board: scenario test each high-probability player this quarter.</li>
            </ul>
          </div>
          {/* Promotion probability */}
          <div style={{ flex: 1.3 }}>
            <b style={{ color: "#FFD700", fontSize: 18 }}><FaRobot style={{ marginRight: 6 }} /> AI Promotion Probability</b>
            <ul>
              {players.map((p, i) =>
                <li key={i} style={{ color: probColor(p.promotionProb), fontWeight: 700, fontSize: 15 }}>
                  {p.name} ({p.pos}, {p.currentSquad.toUpperCase()}): {p.promotionProb}% — <span style={{ color: "#FFD700" }}>{p.aiNarr}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      }
      {/* Player details drawer */}
      {expanded && (() => {
        const p = players.find(x => x.id === expanded);
        if (!p) return null;
        return (
          <div style={{
            background: "#232a2e", borderRadius: 23, boxShadow: "0 4px 48px #FFD70033",
            padding: 33, marginBottom: 25, marginTop: 23
          }}>
            <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 25 }}>{p.name} <span style={{ color: "#1de682" }}>{p.pos} | {p.currentSquad.toUpperCase()}</span></h3>
            <div style={{ fontSize: 16, color: readinessColor(p.readiness), fontWeight: 800 }}>
              Readiness: {p.readiness} {trendArrow(p.readinessTrend.slice(-1)[0])}
            </div>
            <div style={{ fontSize: 16, color: probColor(p.promotionProb), fontWeight: 800 }}>
              Promotion Probability: {p.promotionProb}%
            </div>
            <div style={{ fontSize: 16, color: valueColor(p.commercialValue), fontWeight: 800 }}>
              Commercial Value: €{p.commercialValue.toLocaleString()}
            </div>
            {p.sponsor && <div style={{ fontSize: 15, color: "#1de682", fontWeight: 800 }}>Sponsor: {p.sponsor}</div>}
            {p.externalOffers?.length > 0 && (
              <div style={{ fontSize: 14, color: "#FFD700", fontWeight: 700, marginTop: 6 }}>
                External Offers:
                <ul style={{ margin: 0 }}>
                  {p.externalOffers.map((o, idx) =>
                    <li key={idx}>
                      {o.type} from {o.club} (€{o.value.toLocaleString()}) <a href={o.link} style={{ color: "#1de682" }} target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    </li>
                  )}
                </ul>
              </div>
            )}
            <div style={{ marginTop: 10, color: "#FFD700", fontSize: 16 }}>
              {p.scenarioNote}
            </div>
            <div style={{ marginTop: 10, color: "#1de682", fontWeight: 800, fontSize: 15 }}>
              AI Narrative: {p.aiNarr}
            </div>
            <div style={{ marginTop: 12 }}>
              <b style={{ color: "#FFD700" }}>Obstacles:</b>
              <ul>
                {(p.obstacles || []).map((o, j) =>
                  <li key={j} style={{ color: "#ff4848", fontWeight: 700 }}>
                    {OBSTACLE_ICONS[o.type]} {o.type}: {o.note} <button onClick={() => clearObstacle(p.id, j)} style={{
                      background: "#ff4848", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, padding: "2px 11px", marginLeft: 7, cursor: "pointer"
                    }}>Clear</button>
                  </li>
                )}
                {(!p.obstacles || p.obstacles.length === 0) && <li style={{ color: "#1de682" }}>No current obstacles</li>}
              </ul>
              <button onClick={() => {
                let type = prompt("Obstacle type (Injury, Academic, Attitude, Contract, Tactical):");
                let note = prompt("Obstacle note:");
                if (type && note) addObstacle(p.id, type, note);
              }} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", fontSize: 15 }}>
                <FaPlus style={{ marginRight: 6 }} /> Add Obstacle
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              <b style={{ color: "#FFD700" }}>Development Timeline:</b>
              <ul>
                {(p.timeline || []).map((e, j) =>
                  <li key={j} style={{ color: "#FFD700", fontWeight: 700 }}>
                    <FaCalendarAlt style={{ color: "#FFD700", marginRight: 4 }} /> {e.date}: {e.event}
                  </li>
                )}
              </ul>
            </div>
            <button onClick={() => runScenario(p.id)} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", fontSize: 16, marginTop: 9 }}>
              <FaArrowUp style={{ marginRight: 7 }} /> Run Promotion Scenario
            </button>
            <button onClick={() => setExpanded(null)} style={{
              ...btnStyle, background: "#FFD700", color: "#232a2e", fontSize: 17, marginLeft: 13
            }}>
              Close
            </button>
            {scenario && scenario.player.id === p.id &&
              <div style={{
                marginTop: 18, background: "#FFD70022", borderRadius: 14, padding: 17, fontSize: 16, color: "#232a2e", fontWeight: 800
              }}>
                <b>Scenario Outcome:</b> <br />
                <span style={{ color: "#232a2e" }}>{scenario.ai}</span><br />
                <span style={{ color: "#FFD700" }}>Team/Squad Impact:</span> {scenario.squadImpact}
              </div>
            }
          </div>
        );
      })()}
      {/* Add new player */}
      <div style={{ marginTop: 28 }}>
        <h3 style={{ color: "#FFD700" }}>Add New Prospect</h3>
        <input value={newPlayer.name} placeholder="Name" onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} style={inputStyle} />
        <select value={newPlayer.pos} onChange={e => setNewPlayer({ ...newPlayer, pos: e.target.value })} style={inputStyleMini}>
          {POSITIONS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={newPlayer.currentSquad} onChange={e => setNewPlayer({ ...newPlayer, currentSquad: e.target.value })} style={inputStyleMini}>
          {SQUADS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <input value={newPlayer.yearsInAcademy} type="number" min={1} max={10} placeholder="Years in Academy" onChange={e => setNewPlayer({ ...newPlayer, yearsInAcademy: Number(e.target.value) })} style={inputStyleMini} />
        <input value={newPlayer.readiness} type="number" min={1} max={100} placeholder="Readiness" onChange={e => setNewPlayer({ ...newPlayer, readiness: Number(e.target.value) })} style={inputStyleMini} />
        <input value={newPlayer.promotionProb} type="number" min={0} max={100} placeholder="Promotion Probability" onChange={e => setNewPlayer({ ...newPlayer, promotionProb: Number(e.target.value) })} style={inputStyleMini} />
        <input value={newPlayer.commercialValue} type="number" min={0} placeholder="Commercial Value (€)" onChange={e => setNewPlayer({ ...newPlayer, commercialValue: Number(e.target.value) })} style={inputStyleMini} />
        <input value={newPlayer.sponsor} placeholder="Sponsor" onChange={e => setNewPlayer({ ...newPlayer, sponsor: e.target.value })} style={inputStyleMini} />
        <button onClick={addPlayer} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginLeft: 13 }}>
          <FaPlus /> Add
        </button>
      </div>
      {/* Boardroom log */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: 13, margin: "24px 0 0 0"
      }}>
        <b style={{ color: "#FFD700", fontSize: 18 }}><FaClipboardCheck style={{ marginRight: 7 }} /> Progression Boardroom Log</b>
        <div style={{ maxHeight: 100, overflowY: "auto", fontSize: 15, marginBottom: 8 }}>
          {log.map((c, i) =>
            <div key={i}><span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt} <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span></div>
          )}
        </div>
        <input value={logText} placeholder="Log board action, scenario, or note..." onChange={e => setLogText(e.target.value)} style={inputStyleFull} />
        <button onClick={() => {
          setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10) }]); setLogText("");
        }} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginLeft: 7 }}>Send</button>
      </div>
      <div style={{ marginTop: 15, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 15, width: 135
};
const inputStyleMini = {
  ...inputStyle, width: 95, fontSize: 14
};
const inputStyleFull = {
  ...inputStyle, width: 230
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "8px 15px", marginRight: 6, cursor: "pointer"
};

export default ProgressionEngineElite;
