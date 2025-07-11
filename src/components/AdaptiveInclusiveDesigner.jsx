// src/components/AdaptiveInclusiveDesigner.jsx

import React, { useState } from "react";
import {
  FaAccessibleIcon,
  FaClipboardCheck,
  FaTrophy,
  FaBullhorn,
  FaLightbulb,
  FaDownload,
  FaShareAlt,
  FaChartBar,
  FaUserCheck,
  FaExclamationTriangle,
  FaUsers,
  FaRunning,
  FaBook,
  FaPuzzlePiece,
  FaChalkboardTeacher,
  FaTable,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

// --- Demo Data (MALE ONLY) ---
const squads = [
  {
    name: "U10 Boys",
    inclusionReadiness: 94,
    readinessTrend: [80, 83, 88, 90, 92, 94],
    atRisk: false,
    badge: true,
    needs: ["physical", "learning"],
    players: [
      { name: "Ivan Markovic", needs: ["physical"] },
      { name: "Marko Horvat", needs: ["learning"] },
    ],
    actionLog: [],
  },
  {
    name: "U12 Boys",
    inclusionReadiness: 72,
    readinessTrend: [65, 68, 70, 71, 72, 72],
    atRisk: true,
    badge: false,
    needs: ["physical"],
    players: [
      { name: "Dino Vukovic", needs: ["physical"] },
      { name: "Luka Ilic", needs: [] },
    ],
    actionLog: [],
  },
  {
    name: "U14 Boys",
    inclusionReadiness: 81,
    readinessTrend: [69, 72, 75, 78, 81, 81],
    atRisk: false,
    badge: false,
    needs: ["physical", "sensory"],
    players: [
      { name: "Juraj Juric", needs: ["physical", "sensory"] },
      { name: "Petar Soldo", needs: [] },
    ],
    actionLog: [],
  },
];

// Drills library (adapted drills)
const drillsLibrary = [
  {
    key: "chair_dribble",
    title: "Seated Chair Dribble",
    type: "physical",
    desc: "Ball-handling for reduced lower limb mobility.",
  },
  {
    key: "visual_cues_pass",
    title: "Visual Cues Passing",
    type: "sensory",
    desc: "Passing with high-contrast targets and cues.",
  },
  {
    key: "slow_motion_play",
    title: "Slow-Motion Play",
    type: "learning",
    desc: "Full-court play at reduced speed for understanding.",
  },
  {
    key: "partner_support",
    title: "Partner Support Defense",
    type: "physical",
    desc: "Pair less mobile athlete with a buddy for rotations.",
  },
  {
    key: "signal_start",
    title: "Auditory Signal Start",
    type: "sensory",
    desc: "All drills begin on whistle/sound, not sight.",
  },
];

// Inclusion resources database
const resourceDB = [
  {
    name: "Adapted Basketball Coach Ivan",
    type: "coach",
    contact: "ivan@vero.com",
    specialty: "Physical & learning",
  },
  {
    name: "SensiEquip Zagreb",
    type: "equipment",
    contact: "sensiequip@equip.com",
    specialty: "Sensory/adapted balls",
  },
  {
    name: "City Inclusion Grant",
    type: "funding",
    contact: "cityhall@zagreb.hr",
    specialty: "Funding for inclusion events",
  },
];

// Needs icons
const needsIcons = {
  physical: <FaRunning color="#FFD700" />,
  sensory: <FaBook color="#1de682" />,
  learning: <FaPuzzlePiece color="#ff6b6b" />,
};

// Board roles
const boardRoles = [
  "President",
  "Inclusion Lead",
  "Squad Coach",
  "Community Manager",
];

// Compliance summary (for sponsor/board)
const complianceSummary = squads => ({
  totalSquads: squads.length,
  goldSquads: squads.filter(sq => sq.inclusionReadiness >= 90).length,
  avgReadiness: (
    squads.reduce((a, sq) => a + sq.inclusionReadiness, 0) / squads.length
  ).toFixed(1),
  adaptedCount: squads.reduce(
    (a, sq) => a + sq.players.filter(p => p.needs.length > 0).length,
    0
  ),
  resourceCount: resourceDB.length,
});

export default function AdaptiveInclusiveDesigner() {
  const [selectedSquad, setSelectedSquad] = useState(squads[0]);
  const [sessionPlan, setSessionPlan] = useState([]);
  const [actionLog, setActionLog] = useState({});
  const [assignments, setAssignments] = useState({});
  const [expanded, setExpanded] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Inclusion readiness bar color
  function readinessColor(r) {
    if (r >= 90) return "#FFD700";
    if (r >= 75) return "#1de682";
    return "#ff6b6b";
  }

  // Smart alert: how many squads at risk/gold
  const atRiskCount = squads.filter(sq => sq.inclusionReadiness < 75).length;
  const goldCount = squads.filter(sq => sq.inclusionReadiness >= 90).length;

  // Action assign/log
  function assignAction(squad, action, player = null) {
    const now = new Date();
    setActionLog(log => ({
      ...log,
      [player ? player.name : squad.name]:
        (log[player ? player.name : squad.name] || []).concat([
          {
            action,
            assignedTo: assignments[squad.name] || "-",
            date: now.toISOString().split("T")[0],
            status: "Pending",
          },
        ]),
    }));
  }

  // Next best action AI (by readiness/needs)
  function nextBestAction(squad, player = null) {
    if (player) {
      if (player.needs.includes("sensory"))
        return "Order adapted sensory equipment for " + player.name;
      if (player.needs.includes("learning"))
        return "Assign mentor coach for learning needs";
      if (player.needs.includes("physical"))
        return "Plan session with adapted drills";
      return "Annual inclusion check-in";
    }
    if (squad.inclusionReadiness < 75)
      return "Schedule inclusion CPD for all coaches";
    if (squad.needs.includes("sensory"))
      return "Order adapted sensory balls for squad";
    if (squad.inclusionReadiness < 90)
      return "Plan inclusion family open house";
    return "Submit for city inclusion award";
  }

  // Heatmap dashboard: grid with squad/metric
  function SquadHeatmap({ squads, select }) {
    return (
      <table style={{ width: "100%", marginBottom: 7, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ fontWeight: 700, color: "#FFD700" }}>
            <th>Squad</th>
            <th>Readiness</th>
            <th>Badge</th>
            <th>Needs Met</th>
            <th>Players Adapted</th>
          </tr>
        </thead>
        <tbody>
          {squads.map(sq => (
            <tr
              key={sq.name}
              style={{
                background: selectedSquad.name === sq.name ? "#1a1d20" : "none",
                cursor: "pointer",
              }}
              onClick={() => select(sq)}
            >
              <td style={{ fontWeight: 700, color: "#FFD700" }}>{sq.name}</td>
              <td>
                <div
                  style={{
                    background: readinessColor(sq.inclusionReadiness),
                    color:
                      readinessColor(sq.inclusionReadiness) === "#FFD700"
                        ? "#232a2e"
                        : "#fff",
                    borderRadius: 8,
                    fontWeight: 700,
                    display: "inline-block",
                    padding: "2px 8px",
                  }}
                >
                  {sq.inclusionReadiness}%
                </div>
              </td>
              <td style={{ textAlign: "center" }}>
                {sq.inclusionReadiness >= 90 ? (
                  <FaTrophy color="#FFD700" />
                ) : (
                  "-"
                )}
              </td>
              <td>
                {sq.needs.map(n => (
                  <span key={n} style={{ marginRight: 7 }}>
                    {needsIcons[n]}
                  </span>
                ))}
              </td>
              <td style={{ textAlign: "center" }}>
                {
                  sq.players.filter(p => p.needs.length > 0).length
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Compliance summary
  const compliance = complianceSummary(squads);

  return (
    <div
      style={{
        background: "#232a2e",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
        borderRadius: "24px",
        padding: "38px 28px 18px 28px",
        boxShadow: "0 6px 32px 0 #1a1d20",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 13 }}>
        <FaAccessibleIcon size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 1,
              marginBottom: 4,
              color: "#FFD700",
            }}
          >
            ADAPTIVE & INCLUSIVE SPORTS DESIGNER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Europe’s most measurable, boardroom-ready inclusion platform. Male basketball only.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={{
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            padding: "10px 18px",
            marginRight: 10,
            fontFamily: "Segoe UI",
            cursor: "pointer",
            boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={() => window.print()}
        >
          <FaDownload style={{ marginRight: 7 }} />
          Export Inclusion Report
        </button>
        <button
          style={{
            background: "#1de682",
            color: "#232a2e",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            padding: "10px 18px",
            fontFamily: "Segoe UI",
            cursor: "pointer",
            boxShadow: "0 2px 12px 0 #2a2d31",
          }}
        >
          <FaShareAlt style={{ marginRight: 7 }} />
          Share
        </button>
      </div>

      {/* Sponsor/Board Compliance Card */}
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 11 }}>
        <div style={{
          background: "#FFD700",
          color: "#232a2e",
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 10,
          minWidth: 165,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaUsers style={{ marginRight: 7 }} />
          Squads: {compliance.totalSquads}
        </div>
        <div style={{
          background: "#1de682",
          color: "#232a2e",
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 10,
          minWidth: 165,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaTrophy style={{ marginRight: 7 }} />
          Gold: {compliance.goldSquads}
        </div>
        <div style={{
          background: "#283E51",
          color: "#FFD700",
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 10,
          minWidth: 170,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaChartBar style={{ marginRight: 7 }} />
          Avg Readiness: {compliance.avgReadiness}%
        </div>
        <div style={{
          background: "#FFD700",
          color: "#232a2e",
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 10,
          minWidth: 170,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaUserCheck style={{ marginRight: 7 }} />
          Adapted Players: {compliance.adaptedCount}
        </div>
        <div style={{
          background: "#1de682",
          color: "#232a2e",
          fontWeight: 700,
          padding: "11px 20px",
          borderRadius: 10,
          minWidth: 170,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaChalkboardTeacher style={{ marginRight: 7 }} />
          Resources: {compliance.resourceCount}
        </div>
      </div>

      {/* Alerts */}
      <div style={{ display: "flex", gap: 20, marginBottom: 8 }}>
        <div style={{
          background: atRiskCount > 0 ? "#ff6b6b" : "#1de682",
          color: atRiskCount > 0 ? "#fff" : "#232a2e",
          fontWeight: 700,
          borderRadius: 12,
          padding: "9px 16px",
          minWidth: 135,
          textAlign: "center",
          boxShadow: "0 2px 10px 0 #232a2e60"
        }}>
          <FaExclamationTriangle style={{ marginRight: 7 }} />
          At-Risk: {atRiskCount}
        </div>
        <div style={{
          background: goldCount > 0 ? "#FFD700" : "#283E51",
          color: goldCount > 0 ? "#232a2e" : "#FFD700",
          fontWeight: 700,
          borderRadius: 12,
          padding: "9px 16px",
          minWidth: 135,
          textAlign: "center",
          boxShadow: "0 2px 10px 0 #232a2e60"
        }}>
          <FaTrophy style={{ marginRight: 7 }} />
          Gold Standard: {goldCount}
        </div>
      </div>

      {/* Heatmap Dashboard */}
      <div style={{ marginBottom: 14, marginTop: 6 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 5, fontSize: 16 }}>Squad Inclusion Heatmap</div>
        <SquadHeatmap squads={squads} select={sq => {
          setSelectedSquad(sq);
          setSelectedPlayer(null);
        }} />
      </div>

      <div style={{ display: "flex", gap: 25, alignItems: "flex-start" }}>
        {/* Left: Session Builder + Trend + Export */}
        <div
          style={{
            background: "#283E51",
            borderRadius: 24,
            padding: 22,
            minWidth: 350,
            maxWidth: 410,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, marginBottom: 6 }}>
            Session Builder ({selectedSquad.name})
          </div>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 15, marginBottom: 7 }}>
            Needs:{" "}
            {selectedSquad.needs.map((n) => (
              <span key={n} style={{ marginRight: 8 }}>{needsIcons[n]} {n.charAt(0).toUpperCase() + n.slice(1)}</span>
            ))}
          </div>
          <div style={{ fontWeight: 700, color: "#1de682", marginBottom: 3 }}>Add Drill:</div>
          <select
            value=""
            onChange={e => {
              const drill = drillsLibrary.find(d => d.key === e.target.value);
              if (drill) setSessionPlan(s => [...s, drill]);
            }}
            style={{ borderRadius: 7, padding: "7px 12px", fontFamily: "Segoe UI", marginBottom: 10, width: "95%" }}
          >
            <option value="">Select adapted drill...</option>
            {drillsLibrary.filter(d => selectedSquad.needs.includes(d.type)).map(d => (
              <option key={d.key} value={d.key}>{d.title} ({d.type})</option>
            ))}
          </select>
          {sessionPlan.length > 0 && (
            <ul style={{ marginTop: 7 }}>
              {sessionPlan.map((d, idx) => (
                <li key={idx} style={{ marginBottom: 5, color: "#FFD700", fontWeight: 700 }}>
                  {needsIcons[d.type]} {d.title}
                  <span style={{ color: "#fff", fontWeight: 500, marginLeft: 7, fontSize: 15 }}>
                    {d.desc}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {sessionPlan.length === 0 && (
            <div style={{ color: "#fff", opacity: 0.7, marginTop: 8 }}>No drills added yet.</div>
          )}

          {/* Export session plan */}
          <button
            style={{
              background: "#FFD700",
              color: "#232a2e",
              borderRadius: 10,
              fontWeight: 700,
              padding: "10px 20px",
              marginTop: 16,
              border: "none",
              cursor: "pointer"
            }}
            onClick={() => window.print()}
          >
            <FaDownload style={{ marginRight: 7 }} />
            Export Session Plan
          </button>

          {/* Progress Trend */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 3 }}>Readiness Progress</div>
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={selectedSquad.readinessTrend.map((y, i) => ({ x: i + 1, y }))}>
                <Line type="monotone" dataKey="y" stroke="#FFD700" strokeWidth={2} dot={true} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle: Roster Drilldown */}
        <div
          style={{
            background: "#1a1d20",
            borderRadius: 22,
            minWidth: 310,
            maxWidth: 390,
            padding: 22,
            boxShadow: "0 2px 12px 0 #121416",
          }}
        >
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>
            Squad Roster: Adapted Players
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 15, marginBottom: 7 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Name</th>
                <th>Needs</th>
                <th>Drilldown</th>
              </tr>
            </thead>
            <tbody>
              {selectedSquad.players.map((p, idx) => (
                <tr key={p.name}>
                  <td style={{ color: "#FFD700", fontWeight: 600 }}>{p.name}</td>
                  <td>
                    {p.needs.map(n => (
                      <span key={n} style={{ marginRight: 7 }}>{needsIcons[n]}</span>
                    ))}
                  </td>
                  <td>
                    {p.needs.length > 0 && (
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#FFD700",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedPlayer(selectedPlayer && selectedPlayer.name === p.name ? null : p)}
                        title="View"
                      >
                        {selectedPlayer && selectedPlayer.name === p.name ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Player drilldown */}
          {selectedPlayer && (
            <div style={{
              background: "#FFD700",
              color: "#232a2e",
              borderRadius: 10,
              padding: "10px 17px",
              fontWeight: 600,
              marginTop: 8,
            }}>
              <FaLightbulb style={{ marginRight: 8 }} />
              {selectedPlayer.name}: {selectedPlayer.needs.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(", ")}
              <div style={{ color: "#232a2e", fontWeight: 500, marginTop: 7 }}>
                Next Best Action: <b>{nextBestAction(selectedSquad, selectedPlayer)}</b>
                <br />
                <button
                  style={{
                    background: "#FFD700",
                    color: "#232a2e",
                    borderRadius: 7,
                    padding: "6px 11px",
                    fontWeight: 700,
                    marginTop: 7,
                    border: "1.5px solid #232a2e",
                    cursor: "pointer"
                  }}
                  onClick={() => assignAction(selectedSquad, nextBestAction(selectedSquad, selectedPlayer), selectedPlayer)}
                >
                  <FaClipboardCheck style={{ marginRight: 6 }} />
                  Assign Action
                </button>
              </div>
              {/* Action log for player */}
              {actionLog[selectedPlayer.name] && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 700, color: "#232a2e" }}>Action Log</div>
                  <table style={{ width: "100%", fontSize: 14, color: "#232a2e", marginTop: 3 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>Action</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionLog[selectedPlayer.name].map((a, i) => (
                        <tr key={i}>
                          <td>{a.action}</td>
                          <td>{a.status}</td>
                          <td>{a.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Resource DB, Actions/Badge/AI */}
        <div
          style={{
            background: "#232a2e",
            borderRadius: 18,
            padding: "21px 10px 10px 12px",
            minWidth: 280,
            maxWidth: 350,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 9, textAlign: "center" }}>
            Inclusion Resources & Partners
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 14, marginBottom: 7 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Name</th>
                <th>Type</th>
                <th>Specialty</th>
              </tr>
            </thead>
            <tbody>
              {resourceDB.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td>{r.type.charAt(0).toUpperCase() + r.type.slice(1)}</td>
                  <td>{r.specialty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ color: "#FFD700", marginTop: 9, fontWeight: 700, fontSize: 15 }}>
            Total: {resourceDB.length}
          </div>
          {/* AI next action for squad */}
          <div style={{ marginTop: 18, color: "#FFD700", fontWeight: 700 }}>
            <FaLightbulb style={{ marginRight: 7 }} />
            Squad Next Best Action
          </div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginTop: 5 }}>
            {nextBestAction(selectedSquad)}
          </div>
          {/* Assign action + log */}
          <div style={{ marginTop: 12, fontWeight: 700, color: "#FFD700" }}>Assign to:</div>
          <select
            value={assignments[selectedSquad.name] || ""}
            onChange={e => setAssignments(a => ({ ...a, [selectedSquad.name]: e.target.value }))}
            style={{ borderRadius: 7, padding: "7px 12px", fontFamily: "Segoe UI", marginTop: 6 }}
          >
            <option value="">Assign...</option>
            {boardRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <button
            style={{
              background: "#FFD700",
              color: "#232a2e",
              borderRadius: 7,
              padding: "7px 12px",
              fontWeight: 700,
              border: "none",
              marginTop: 9,
              marginLeft: 5,
              cursor: "pointer",
            }}
            onClick={() => assignAction(selectedSquad, nextBestAction(selectedSquad))}
          >
            <FaClipboardCheck style={{ marginRight: 6 }} />
            Log Action
          </button>
          {/* Action log for squad */}
          {actionLog[selectedSquad.name] && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700, color: "#FFD700" }}>Action Log</div>
              <table style={{ width: "100%", fontSize: 14, color: "#fff", marginTop: 4 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Action</th>
                    <th>Assigned</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {actionLog[selectedSquad.name].map((a, i) => (
                    <tr key={i}>
                      <td>{a.action}</td>
                      <td>{a.assignedTo}</td>
                      <td>{a.status}</td>
                      <td>{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Badge if earned */}
          <div style={{ marginTop: 17 }}>
            {selectedSquad.inclusionReadiness >= 90 && (
              <div
                style={{
                  background: "#FFD700",
                  color: "#232a2e",
                  fontWeight: 800,
                  borderRadius: 14,
                  padding: "10px 20px",
                  fontSize: 18,
                  marginTop: 7,
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0 2px 18px 0 #FFD70077",
                }}
              >
                <FaTrophy style={{ marginRight: 12, fontSize: 23 }} />
                Inclusion Gold
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div
        style={{
          marginTop: 36,
          fontSize: 14,
          opacity: 0.7,
          textAlign: "center",
        }}
      >
        Proprietary to CourtEvo Vero. Inclusion analytics, session export, individual adaptation. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
