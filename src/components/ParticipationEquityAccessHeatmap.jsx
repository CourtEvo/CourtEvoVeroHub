// src/components/ParticipationEquityAccessHeatmap.jsx

import React, { useState } from "react";
import {
  FaMapMarkedAlt,
  FaArrowUp,
  FaExclamationTriangle,
  FaBus,
  FaMoneyBillAlt,
  FaWheelchair,
  FaFrown,
  FaSchool,
  FaLightbulb,
  FaDownload,
  FaShareAlt,
  FaUsers,
  FaTrophy,
  FaChartBar,
  FaEye,
  FaChartLine,
  FaUserTie,
  FaClipboardCheck,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Mock club data (enriched)
const clubs = [
  {
    clubId: "vero-elite",
    name: "Vero Elite Basketball Club",
    location: { x: 130, y: 160 },
    demographics: {
      male: 64,
      female: 18,
      minority: 12,
      disability: 2,
      lowIncome: 15,
    },
    equityScore: 74,
    barriers: {
      transport: 3,
      fees: 4,
      disability: 1,
      schoolLink: 2,
      dropout: 3,
    },
    progressHistory: [60, 66, 68, 70, 74, 74],
    lastUpdated: "2025-06-15",
    YOYProgress: 12,
  },
  {
    clubId: "golden-basket",
    name: "Golden Basket Academy",
    location: { x: 200, y: 110 },
    demographics: {
      male: 50,
      female: 40,
      minority: 17,
      disability: 5,
      lowIncome: 9,
    },
    equityScore: 91,
    barriers: {
      transport: 1,
      fees: 2,
      disability: 2,
      schoolLink: 2,
      dropout: 2,
    },
    progressHistory: [80, 80, 81, 89, 89, 91],
    lastUpdated: "2025-06-15",
    YOYProgress: 8,
  },
  // Add more clubs as needed
];

// Enriched for progress lines
const demographicsColors = {
  male: "#FFD700",
  female: "#1de682",
  minority: "#63c2d1",
  disability: "#a37fc9",
  lowIncome: "#f77f00",
};

const barriersMeta = {
  transport: { label: "Transport", icon: <FaBus color="#FFD700" /> },
  fees: { label: "Fees", icon: <FaMoneyBillAlt color="#FFD700" /> },
  disability: { label: "Disability", icon: <FaWheelchair color="#1de682" /> },
  schoolLink: { label: "School Link", icon: <FaSchool color="#FFD700" /> },
  dropout: { label: "Dropout", icon: <FaFrown color="#ff6b6b" /> },
};

function getSeverityColor(severity) {
  if (severity >= 4) return "#ff6b6b";
  if (severity === 3) return "#FFD700";
  if (severity <= 2) return "#1de682";
}

// Intervention simulation: effects on equity/barriers (edit for your methodology)
const interventions = [
  {
    key: "transport",
    label: "Transport Pooling",
    impact: { equity: 7, barriers: { transport: -2 } },
    icon: <FaBus color="#FFD700" />,
  },
  {
    key: "fees",
    label: "Micro-Grants for Fees",
    impact: { equity: 6, barriers: { fees: -2 } },
    icon: <FaMoneyBillAlt color="#FFD700" />,
  },
  {
    key: "disability",
    label: "Adaptive Sessions",
    impact: { equity: 8, barriers: { disability: -2 } },
    icon: <FaWheelchair color="#1de682" />,
  },
  {
    key: "schoolLink",
    label: "School Link Events",
    impact: { equity: 3, barriers: { schoolLink: -1 } },
    icon: <FaSchool color="#FFD700" />,
  },
];

// For assign-to dropdown
const boardRoles = [
  "President",
  "Technical Director",
  "Operations Lead",
  "Community Manager",
  "Board Member",
];

const ClubMapPin = ({ club, isActive, onClick }) => (
  <g style={{ cursor: "pointer" }} onClick={() => onClick(club)}>
    <circle
      cx={club.location.x}
      cy={club.location.y}
      r={isActive ? 15 : 12}
      fill={
        club.equityScore >= 90
          ? "#FFD700"
          : club.equityScore >= 80
          ? "#1de682"
          : club.equityScore >= 65
          ? "#63c2d1"
          : "#ff6b6b"
      }
      stroke={isActive ? "#fff" : "#232a2e"}
      strokeWidth={isActive ? 4 : 2}
    />
    <text
      x={club.location.x}
      y={club.location.y + 30}
      textAnchor="middle"
      fontSize="12"
      fill="#fff"
      style={{ fontFamily: "Segoe UI" }}
    >
      {club.name}
    </text>
  </g>
);

export default function ParticipationEquityAccessHeatmap() {
  const [selectedClub, setSelectedClub] = useState(clubs[0] || null);
  const [interventionsApplied, setInterventionsApplied] = useState([]);
  const [assignments, setAssignments] = useState({}); // boardroom actions

  // Clone & apply intervention simulation
  function getSimulatedClub(club) {
    let sim = { ...club, barriers: { ...club.barriers } };
    let equityAdd = 0;
    interventionsApplied.forEach((key) => {
      const intv = interventions.find((i) => i.key === key);
      if (intv) {
        equityAdd += intv.impact.equity;
        Object.entries(intv.impact.barriers).forEach(([bKey, bDelta]) => {
          sim.barriers[bKey] = Math.max(
            1,
            Math.min(5, (sim.barriers[bKey] || 1) + bDelta)
          );
        });
      }
    });
    return {
      ...sim,
      equityScore: Math.min(100, sim.equityScore + equityAdd),
    };
  }

  const clubView = getSimulatedClub(selectedClub);

  // Table sort
  const sortedClubs = [...clubs].sort((a, b) => b.equityScore - a.equityScore);

  // Executive summary
  const atRiskClubs = clubs.filter((c) => c.equityScore < 60).length;
  const inclusionLeaders = clubs.filter((c) => c.equityScore >= 90).length;
  const regionalAvg =
    Math.round(clubs.reduce((a, b) => a + b.equityScore, 0) / clubs.length);

  // Critical gaps
  const criticalGroups =
    clubView &&
    Object.entries(clubView.demographics)
      .filter(([k, v]) => v < 20)
      .map(([k]) => k);

  // Boardroom actions, enriched
  const boardActions = [
    {
      key: "transport",
      text: "Launch transport pooling to reduce barrier.",
      icon: <FaBus />,
    },
    {
      key: "fees",
      text: "Initiate micro-grant for player fees.",
      icon: <FaMoneyBillAlt />,
    },
    {
      key: "disability",
      text: "Pilot adaptive sessions for inclusion.",
      icon: <FaWheelchair />,
    },
    {
      key: "schoolLink",
      text: "Organize 'school link' open days.",
      icon: <FaSchool />,
    },
  ];

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
        <FaMapMarkedAlt size={40} color="#FFD700" style={{ marginRight: 16 }} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: 1,
              marginBottom: 4,
              color: "#FFD700",
            }}
          >
            PARTICIPATION EQUITY & ACCESS HEATMAP
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 16 }}>
            Elite basketball only. No compromise.
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

      {/* Executive Summary */}
      <div style={{ display: "flex", gap: 22, marginBottom: 18 }}>
        <div
          style={{
            background: "#FFD700",
            color: "#232a2e",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: 10,
            minWidth: 120,
            textAlign: "center",
          }}
        >
          At Risk: {atRiskClubs}
        </div>
        <div
          style={{
            background: "#1de682",
            color: "#232a2e",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: 10,
            minWidth: 120,
            textAlign: "center",
          }}
        >
          Inclusion Leaders: {inclusionLeaders}
        </div>
        <div
          style={{
            background: "#283E51",
            color: "#FFD700",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: 10,
            minWidth: 120,
            textAlign: "center",
          }}
        >
          Regional Avg: {regionalAvg}
        </div>
      </div>

      {/* Main Map + Details */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* SVG Map */}
        <div
          style={{
            background: "#283E51",
            borderRadius: 24,
            minWidth: 350,
            minHeight: 350,
            padding: 10,
            flex: "0 0 400px",
            position: "relative",
            boxShadow: "0 2px 12px 0 #15171a",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#FFD700",
              fontSize: 18,
              marginBottom: 6,
              letterSpacing: 1,
              marginLeft: 10,
            }}
          >
            Map: Club & Academy Participation
          </div>
          <svg width={380} height={340} style={{ borderRadius: 22 }}>
            <rect
              x={0}
              y={0}
              width={380}
              height={340}
              fill="#232a2e"
              stroke="#485563"
              strokeWidth={2}
            />
            {clubs.map((club) => (
              <ClubMapPin
                key={club.clubId}
                club={club}
                isActive={selectedClub && selectedClub.clubId === club.clubId}
                onClick={setSelectedClub}
              />
            ))}
          </svg>
          <div
            style={{
              position: "absolute",
              right: 15,
              top: 16,
              color: "#fff",
              fontSize: 15,
              opacity: 0.7,
            }}
          >
            <FaUsers style={{ marginRight: 5 }} />
            {clubs.length} clubs shown
          </div>
        </div>

        {/* Club Demographic Card */}
        <div
          style={{
            background: "#1a1d20",
            borderRadius: 22,
            minWidth: 360,
            padding: 26,
            boxShadow: "0 2px 12px 0 #121416",
            flex: "0 0 430px",
          }}
        >
          {/* Critical Gap Alert */}
          {criticalGroups && criticalGroups.length > 0 && (
            <div
              style={{
                background: "#ff6b6b",
                color: "#fff",
                borderRadius: 10,
                padding: "8px 15px",
                fontWeight: 700,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaExclamationTriangle style={{ marginRight: 8 }} />
              ALERT: {criticalGroups.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(", ")} below critical threshold!
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: "#FFD700",
                marginRight: 10,
              }}
            >
              {clubView?.name || "—"}
            </div>
            <span
              style={{
                background:
                  clubView?.equityScore >= 90
                    ? "#FFD700"
                    : clubView?.equityScore >= 80
                    ? "#1de682"
                    : "#ff6b6b",
                color: "#232a2e",
                fontWeight: 700,
                borderRadius: 10,
                padding: "5px 16px",
                fontSize: 16,
                marginRight: 10,
              }}
            >
              Equity Score: {clubView?.equityScore}
            </span>
            {/* Animated Progress Bar */}
            <div
              style={{
                background: "#283E51",
                borderRadius: 8,
                height: 12,
                width: 80,
                margin: "0 10px",
                display: "inline-block",
              }}
            >
              <div
                style={{
                  background: "#FFD700",
                  height: "100%",
                  borderRadius: 8,
                  width: `${clubView?.equityScore || 0}%`,
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            {clubView?.equityScore >= 90 && (
              <div
                style={{
                  marginLeft: 8,
                  fontWeight: 700,
                  color: "#FFD700",
                  background: "#1de68222",
                  borderRadius: 8,
                  padding: "4px 14px",
                  display: "inline-block",
                  animation: "trophyPop 1s",
                }}
              >
                <FaTrophy style={{ marginRight: 7 }} />
                Inclusion Leader
              </div>
            )}
          </div>
          {/* Sparkline + YOY */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
            <span
              style={{
                color: "#1de682",
                fontWeight: 700,
                fontSize: 14,
                marginRight: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaArrowUp style={{ marginRight: 3 }} />
              {clubView?.YOYProgress ? `+${clubView.YOYProgress}% YOY` : ""}
            </span>
            {/* Sparkline */}
            {clubView?.progressHistory && (
              <LineChart
                width={70}
                height={24}
                data={clubView.progressHistory.map((v, i) => ({
                  x: i,
                  y: v,
                }))}
              >
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 15,
              color: "#fff",
              marginBottom: 6,
              marginTop: 8,
              opacity: 0.78,
            }}
          >
            Demographics
          </div>
          {/* Demographics bar chart */}
          <ResponsiveContainer width="100%" height={90}>
            <BarChart
              data={
                clubView
                  ? Object.entries(clubView.demographics).map(([k, v]) => ({
                      label: k,
                      value: v,
                    }))
                  : []
              }
              layout="vertical"
              margin={{ left: 14, right: 20, top: 10, bottom: 10 }}
              barSize={20}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: "#FFD700" }}
              />
              <Tooltip />
              <Bar
                dataKey="value"
                radius={[8, 8, 8, 8]}
                fill="#FFD700"
                isAnimationActive={false}
              >
                {clubView &&
                  Object.keys(clubView.demographics).map((k, idx) => (
                    <Cell
                      key={`cell-${k}`}
                      fill={demographicsColors[k] || "#FFD700"}
                    />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Barriers */}
          <div
            style={{
              fontWeight: 500,
              fontSize: 15,
              color: "#fff",
              marginBottom: 8,
              marginTop: 16,
              opacity: 0.78,
            }}
          >
            Barriers to Entry
          </div>
          <div style={{ display: "flex", gap: 15 }}>
            {clubView &&
              Object.entries(clubView.barriers).map(([k, v]) => (
                <div
                  key={k}
                  title={barriersMeta[k]?.label}
                  style={{
                    background: "#232a2e",
                    borderRadius: 10,
                    padding: "7px 10px",
                    display: "flex",
                    alignItems: "center",
                    minWidth: 80,
                    boxShadow: "0 1px 6px 0 #15171a",
                  }}
                >
                  <span style={{ marginRight: 7 }}>
                    {barriersMeta[k]?.icon}
                  </span>
                  <span
                    style={{
                      color: getSeverityColor(v),
                      fontWeight: 700,
                      fontSize: 17,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
          </div>

          {/* Intervention Simulator */}
          <div
            style={{
              marginTop: 18,
              marginBottom: 2,
              fontWeight: 700,
              color: "#FFD700",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaLightbulb color="#FFD700" style={{ marginRight: 6 }} />
            Intervention Simulator
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {interventions.map((intv) => (
              <label
                key={intv.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: interventionsApplied.includes(intv.key)
                    ? "#1de682"
                    : "#232a2e",
                  color: interventionsApplied.includes(intv.key)
                    ? "#232a2e"
                    : "#fff",
                  borderRadius: 8,
                  padding: "7px 12px",
                  fontWeight: 700,
                  marginBottom: 7,
                  cursor: "pointer",
                  border: "1.5px solid #FFD700",
                  boxShadow: interventionsApplied.includes(intv.key)
                    ? "0 2px 8px #1de68244"
                    : "",
                }}
              >
                <input
                  type="checkbox"
                  checked={interventionsApplied.includes(intv.key)}
                  onChange={() => {
                    setInterventionsApplied((prev) =>
                      prev.includes(intv.key)
                        ? prev.filter((k) => k !== intv.key)
                        : [...prev, intv.key]
                    );
                  }}
                  style={{ marginRight: 8 }}
                />
                {intv.icon}
                <span style={{ marginLeft: 6 }}>{intv.label}</span>
              </label>
            ))}
          </div>

          {/* Boardroom Actions, assign responsibility */}
          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <FaClipboardCheck color="#FFD700" style={{ marginRight: 6 }} />
            <span style={{ fontWeight: 700, color: "#FFD700", fontSize: 15 }}>
              Boardroom Actions & Responsibility
            </span>
          </div>
          <ul style={{ color: "#1de682", fontSize: 15, paddingLeft: 18 }}>
            {boardActions.map((a) => (
              <li key={a.key} style={{ marginBottom: 8 }}>
                {a.icon}
                <span style={{ marginLeft: 6 }}>{a.text}</span>
                {/* Assign to dropdown */}
                <select
                  style={{
                    marginLeft: 12,
                    borderRadius: 6,
                    padding: "2px 6px",
                    fontFamily: "Segoe UI",
                  }}
                  value={assignments[a.key] || ""}
                  onChange={(e) =>
                    setAssignments((s) => ({
                      ...s,
                      [a.key]: e.target.value,
                    }))
                  }
                >
                  <option value="">Assign to…</option>
                  {boardRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>

        {/* Leaderboard */}
        <div
          style={{
            background: "#232a2e",
            borderRadius: 18,
            padding: "22px 10px 8px 10px",
            minWidth: 300,
            flex: "0 0 340px",
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div
            style={{
              color: "#FFD700",
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Club Equity Leaderboard
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "#fff",
                fontSize: 14,
                fontFamily: "Segoe UI",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #485563" }}>
                  <th style={{ textAlign: "left", padding: 5 }}>Club</th>
                  <th>Score</th>
                  <th>
                    <FaExclamationTriangle color="#FFD700" title="Largest Gap" />
                  </th>
                  <th>
                    <FaArrowUp color="#1de682" title="YOY" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedClubs.map((club) => {
                  const largestBarrier = Object.entries(club.barriers).sort(
                    (a, b) => b[1] - a[1]
                  )[0][0];
                  return (
                    <tr
                      key={club.clubId}
                      style={{
                        borderBottom: "1px solid #283E51",
                        background:
                          selectedClub &&
                          selectedClub.clubId === club.clubId
                            ? "#1a1d20"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "5px 0", fontWeight: 600 }}>
                        {club.name}
                      </td>
                      <td
                        style={{
                          color:
                            club.equityScore >= 90
                              ? "#FFD700"
                              : club.equityScore >= 80
                              ? "#1de682"
                              : "#ff6b6b",
                          fontWeight: 700,
                        }}
                      >
                        {club.equityScore}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {barriersMeta[largestBarrier]?.icon}
                      </td>
                      <td style={{ color: "#1de682", textAlign: "center" }}>
                        +{club.YOYProgress}%
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#FFD700",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedClub(club)}
                          title="View"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            style={{
              marginTop: 12,
              textAlign: "center",
              color: "#FFD700",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <FaTrophy color="#FFD700" style={{ marginRight: 5 }} />
            Inclusion Leader:{" "}
            {sortedClubs.filter((c) => c.equityScore >= 90)[0]?.name || "—"}
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
        All data visualizations, boardroom actions, and exports are proprietary to CourtEvo Vero.
        Elite. Basketball. Only.
      </div>
    </div>
  );
}
