// src/components/BarrierSolutionSuite.jsx

import React, { useState } from "react";
import {
  FaChartBar,
  FaExclamationTriangle,
  FaMoneyBillAlt,
  FaBus,
  FaUsers,
  FaSmile,
  FaClock,
  FaLightbulb,
  FaDownload,
  FaUserCheck,
  FaClipboardCheck,
  FaShareAlt,
  FaHome,
  FaUserTie,
  FaChevronDown,
  FaChevronUp,
  FaBolt,
  FaLineChart,
  FaTrophy,
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// --- Demo Data: MALE ONLY, NO FEMALE ---
const barrierData = [
  {
    group: "U10 Boys",
    dropOff: 32,
    barriers: { fees: 4, transport: 3, social: 2, enjoyment: 4, time: 2, family: 3 },
    club: "Vero Elite",
    trend: [24, 26, 28, 32],
    actionLog: [],
  },
  {
    group: "U12 Boys",
    dropOff: 19,
    barriers: { fees: 3, transport: 2, social: 3, enjoyment: 2, time: 2, family: 3 },
    club: "Vero Elite",
    trend: [15, 16, 18, 19],
    actionLog: [],
  },
  {
    group: "U14 Boys",
    dropOff: 12,
    barriers: { fees: 2, transport: 3, social: 2, enjoyment: 3, time: 1, family: 2 },
    club: "Vero Elite",
    trend: [8, 10, 11, 12],
    actionLog: [],
  },
  // ... add more age groups
];

const barrierColors = {
  fees: "#FFD700",
  transport: "#1de682",
  social: "#63c2d1",
  enjoyment: "#f77f00",
  time: "#a37fc9",
  family: "#ff6b6b",
};

const barrierIcons = {
  fees: <FaMoneyBillAlt color="#FFD700" />,
  transport: <FaBus color="#1de682" />,
  social: <FaUsers color="#63c2d1" />,
  enjoyment: <FaSmile color="#f77f00" />,
  time: <FaClock color="#a37fc9" />,
  family: <FaHome color="#ff6b6b" />,
};

const solutionsLibrary = {
  fees: [
    "Launch hardship scholarship fund",
    "Secure sponsor to cover fees",
    "Install payment plan for families",
  ],
  transport: [
    "Organize club van pickup",
    "Create verified parent carpool group",
    "Negotiate transport discount with city",
  ],
  social: [
    "Assign squad mentor for new boys",
    "Monthly team-bonding event",
    "Coach/parent communication training",
  ],
  enjoyment: [
    "Introduce game-based training blocks",
    "Monthly 'skills & fun' challenge",
    "Survey: favorite activities, adjust plan",
  ],
  time: [
    "Optimize practice schedule for school",
    "Offer condensed weekday sessions",
    "Provide digital skills/home drills option",
  ],
  family: [
    "Family open house event",
    "Quarterly parent feedback sessions",
    "Provide training schedules in advance",
  ],
};

const boardRoles = [
  "President",
  "Technical Director",
  "Ops Lead",
  "Community Manager",
  "Board Member",
];

export default function BarrierSolutionSuite() {
  const [selected, setSelected] = useState(barrierData[0]);
  const [solutions, setSolutions] = useState({});
  const [assignments, setAssignments] = useState({});
  const [impactSim, setImpactSim] = useState({});
  const [expanded, setExpanded] = useState(false);

  // Simulate barrier drop (demo only)
  function simulateImpact(barrier, sol) {
    return Math.max(1, (selected.barriers[barrier] || 1) - 1);
  }

  // Boardroom critical thresholds
  const isCritical = selected.dropOff >= 25 || Object.values(selected.barriers).some(v => v >= 4);

  // Drop-off dashboard
  const atRiskGroups = barrierData.filter(g => g.dropOff >= 25);

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
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <FaChartBar size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 29,
              letterSpacing: 1,
              marginBottom: 4,
              color: "#FFD700",
            }}
          >
            BARRIER IDENTIFICATION & SOLUTION SUITE
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Elite analytics. Male youth only. No compromise.
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
          Export Board Deck
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
          Share Report
        </button>
      </div>

      {/* Boardroom Dashboard */}
      <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
        <div style={{
          background: "#FFD700",
          color: "#232a2e",
          fontWeight: 700,
          padding: "12px 20px",
          borderRadius: 10,
          minWidth: 120,
          textAlign: "center",
        }}>
          At Risk: {atRiskGroups.length}
        </div>
        <div style={{
          background: "#1de682",
          color: "#232a2e",
          fontWeight: 700,
          padding: "12px 20px",
          borderRadius: 10,
          minWidth: 120,
          textAlign: "center",
        }}>
          Total Groups: {barrierData.length}
        </div>
        <div style={{
          background: "#283E51",
          color: "#FFD700",
          fontWeight: 700,
          padding: "12px 20px",
          borderRadius: 10,
          minWidth: 120,
          textAlign: "center",
        }}>
          Club: {selected.club}
        </div>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Left: Group/Barriers/Trend */}
        <div
          style={{
            background: "#283E51",
            borderRadius: 24,
            padding: 22,
            minWidth: 350,
            maxWidth: 390,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#FFD700",
              fontSize: 20,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            {selected.group}
            <span style={{ color: "#1de682", fontWeight: 600, marginLeft: 12 }}>
              • {selected.club}
            </span>
            <span style={{ marginLeft: 14, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
              {expanded ? <FaChevronUp color="#FFD700" /> : <FaChevronDown color="#FFD700" />}
            </span>
          </div>
          {isCritical && (
            <div
              style={{
                background: "#ff6b6b",
                color: "#fff",
                borderRadius: 10,
                padding: "7px 15px",
                fontWeight: 700,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaExclamationTriangle style={{ marginRight: 8 }} />
              CRITICAL: Drop-off/barrier above threshold!
            </div>
          )}
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            Drop-off Trend
          </div>
          <LineChart width={170} height={42} data={selected.trend.map((y, i) => ({ x: i, y }))}>
            <Line type="monotone" dataKey="y" stroke="#FFD700" strokeWidth={2} dot={true} />
          </LineChart>
          <div style={{ marginTop: 18, fontWeight: 700, color: "#FFD700", fontSize: 15 }}>
            Top Barriers
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 11, marginTop: 8 }}>
            {Object.entries(selected.barriers).map(([bar, level]) => (
              <div
                key={bar}
                style={{
                  background: "#232a2e",
                  borderRadius: 10,
                  padding: "7px 10px",
                  display: "flex",
                  alignItems: "center",
                  minWidth: 80,
                  boxShadow: "0 1px 6px 0 #15171a",
                  fontWeight: 700,
                  color: barrierColors[bar],
                }}
              >
                {barrierIcons[bar]} <span style={{ marginLeft: 7 }}>{level}</span>
              </div>
            ))}
          </div>
          {/* Expandable: Details/Narrative */}
          {expanded && (
            <div style={{
              marginTop: 20,
              background: "#FFD700",
              color: "#232a2e",
              borderRadius: 8,
              padding: "11px 17px",
              fontWeight: 600,
              fontStyle: "italic"
            }}>
              <FaLightbulb style={{ marginRight: 8 }} />
              Boardroom Insight: "{selected.group}" faces highest drop-off from [{
                Object.entries(selected.barriers).sort((a, b) => b[1] - a[1])[0][0]
              }]—intervention required this quarter.
            </div>
          )}
        </div>

        {/* Middle: Solution Assignment */}
        <div
          style={{
            background: "#1a1d20",
            borderRadius: 22,
            minWidth: 350,
            maxWidth: 430,
            padding: 30,
            boxShadow: "0 2px 12px 0 #121416",
          }}
        >
          <div style={{
            color: "#FFD700",
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 13,
            display: "flex",
            alignItems: "center"
          }}>
            <FaLightbulb style={{ marginRight: 8 }} />
            Solutions & Impact Simulation
          </div>
          {Object.entries(selected.barriers).map(([barrier, level]) => (
            <div key={barrier} style={{ marginBottom: 17 }}>
              <div style={{ color: barrierColors[barrier], fontWeight: 700 }}>
                {barrierIcons[barrier]} {barrier.charAt(0).toUpperCase() + barrier.slice(1)} (Level {level})
              </div>
              <div style={{ marginLeft: 8, marginTop: 3 }}>
                <select
                  value={solutions[barrier] || ""}
                  onChange={e => {
                    setSolutions(s => ({ ...s, [barrier]: e.target.value }));
                    setImpactSim(s => ({ ...s, [barrier]: simulateImpact(barrier, e.target.value) }));
                  }}
                  style={{ borderRadius: 7, padding: "6px 12px", fontFamily: "Segoe UI", marginRight: 8 }}
                >
                  <option value="">Assign solution...</option>
                  {solutionsLibrary[barrier].map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
                {solutions[barrier] && (
                  <span style={{ color: "#FFD700", marginLeft: 7, fontWeight: 700 }}>
                    <FaUserCheck style={{ marginRight: 4 }} /> Assigned
                  </span>
                )}
              </div>
              {/* Impact sim: show new barrier level */}
              {solutions[barrier] && (
                <div style={{ marginLeft: 10, color: "#1de682", marginTop: 3 }}>
                  Simulated new barrier level: <b>{impactSim[barrier]}</b>
                  <span style={{ marginLeft: 12, color: "#FFD700" }}>
                    {impactSim[barrier] <= 2 && <><FaBolt /> Impactful</>}
                  </span>
                </div>
              )}
            </div>
          ))}
          {/* Assign responsibility */}
          <div style={{ marginTop: 13, fontWeight: 700, color: "#FFD700" }}>
            Assign responsibility:
          </div>
          <select
            value={assignments[selected.group] || ""}
            onChange={e => setAssignments(a => ({ ...a, [selected.group]: e.target.value }))}
            style={{ borderRadius: 7, padding: "7px 12px", fontFamily: "Segoe UI", marginTop: 6 }}
          >
            <option value="">Assign...</option>
            {boardRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Right: Leaderboard & Drilldown */}
        <div
          style={{
            background: "#232a2e",
            borderRadius: 18,
            padding: "18px 10px 8px 10px",
            minWidth: 260,
            maxWidth: 320,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div
            style={{
              color: "#FFD700",
              fontWeight: 700,
              fontSize: 17,
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Drop-off Leaderboard (Boys)
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#fff",
              fontSize: 14,
              fontFamily: "Segoe UI",
              marginBottom: 5,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #485563" }}>
                <th style={{ textAlign: "left", padding: 4 }}>Group</th>
                <th style={{ textAlign: "center", padding: 4 }}>Drop-Off</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {barrierData.map((g, idx) => (
                <tr
                  key={g.group}
                  style={{
                    borderBottom: "1px solid #283E51",
                    background:
                      selected.group === g.group ? "#1a1d20" : "none",
                  }}
                >
                  <td style={{ color: "#FFD700", fontWeight: 600 }}>{g.group}</td>
                  <td style={{
                    textAlign: "center",
                    color: g.dropOff >= 25 ? "#ff6b6b" : "#FFD700",
                    fontWeight: 700,
                  }}>
                    {g.dropOff}%
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#FFD700",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelected(g)}
                      title="View"
                    >
                      <FaClipboardCheck />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            color: "#FFD700", marginTop: 10, fontWeight: 700, textAlign: "center"
          }}>
            <FaTrophy color="#FFD700" style={{ marginRight: 5 }} />
            Lowest Drop-off: {
              barrierData.reduce((prev, curr) => prev.dropOff < curr.dropOff ? prev : curr).group
            }
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
        Proprietary to CourtEvo Vero. Elite analytics, male youth only. <span style={{ color: "#FFD700", fontWeight: 700 }}>BE REAL. BE VERO.</span>
      </div>
    </div>
  );
}
