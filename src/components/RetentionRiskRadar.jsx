// src/components/RetentionRiskRadar.jsx

import React, { useState } from "react";
import { m } from "framer-motion";
import {
  FaBullseye,
  FaClipboardCheck,
  FaUserCheck,
  FaExclamationTriangle,
  FaChartLine,
  FaDownload,
  FaShareAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";

// Radar color system
const radarColors = {
  low: "#1de682",
  medium: "#FFD700",
  high: "#ff6b6b",
};

const boys = [
  {
    id: "A001",
    name: "Ivan Markovic",
    squad: "U12 Boys",
    risk: 0.87,
    trend: [0.54, 0.71, 0.81, 0.87],
    factors: ["Low attendance", "No parental involvement", "Negative mood"],
    assignedTo: "",
    status: "At Risk",
    resilience: 3.2, // for added creative
    talentScore: 8.4, // for heatmap legend
    engagement: [0.9, 0.72, 0.62, 0.44], // for sparkline
  },
  {
    id: "A002",
    name: "Dino Ilic",
    squad: "U14 Boys",
    risk: 0.32,
    trend: [0.33, 0.30, 0.31, 0.32],
    factors: ["Good attendance", "Positive coach feedback"],
    assignedTo: "",
    status: "Healthy",
    resilience: 7.9,
    talentScore: 9.1,
    engagement: [0.92, 0.91, 0.89, 0.85],
  },
  {
    id: "A003",
    name: "Luka Juric",
    squad: "U10 Boys",
    risk: 0.61,
    trend: [0.51, 0.58, 0.59, 0.61],
    factors: ["Late to training", "Quiet in sessions"],
    assignedTo: "",
    status: "Monitor",
    resilience: 6.1,
    talentScore: 6.8,
    engagement: [0.73, 0.67, 0.58, 0.41],
  },
  {
    id: "A004",
    name: "Filip Simic",
    squad: "U12 Boys",
    risk: 0.74,
    trend: [0.66, 0.68, 0.72, 0.74],
    factors: ["Missed key tournament", "Low socialization"],
    assignedTo: "",
    status: "At Risk",
    resilience: 5.2,
    talentScore: 7.2,
    engagement: [0.80, 0.77, 0.64, 0.45],
  },
  // ... add more for demo richness
];

const directors = [
  "President",
  "Technical Director",
  "Squad Coach",
  "Retention Officer",
  "Parent Liaison",
];

export default function RetentionRiskRadar() {
  const [selected, setSelected] = useState(boys[0]);
  const [assignments, setAssignments] = useState({});
  const [interventionLog, setInterventionLog] = useState([]);
  const [viewDeparted, setViewDeparted] = useState(false);
  const [radarPulse, setRadarPulse] = useState(1);

  // Animate radar pulse every 1.4s for effect
  React.useEffect(() => {
    const t = setInterval(() => setRadarPulse(p => (p === 1 ? 1.14 : 1)), 1400);
    return () => clearInterval(t);
  }, []);

  // Squads as radar sectors
  const squads = [...new Set(boys.map(b => b.squad))];
  const boysInView = boys.filter(b => (viewDeparted ? b.status === "Departed" : b.status !== "Departed"));

  function assignIntervention(boy, director) {
    setAssignments(a => ({ ...a, [boy.id]: director }));
    setInterventionLog(log => [
      ...log,
      {
        boy: boy.name,
        director,
        date: new Date().toISOString().split("T")[0],
        action: "Intervention Assigned",
        status: "In Progress",
      },
    ]);
  }

  function updateStatus(boy, status) {
    setInterventionLog(log => [
      ...log,
      {
        boy: boy.name,
        director: assignments[boy.id] || "-",
        date: new Date().toISOString().split("T")[0],
        action: status === "Retained" ? "Retained" : "Departed",
        status,
      },
    ]);
    boy.status = status;
    setSelected(boy);
  }

  function riskSummary(boy) {
    if (boy.risk < 0.35) return "Low risk. Steady engagement, positive indicators.";
    if (boy.risk < 0.7)
      return (
        "Medium risk. " +
        (boy.factors[0] ? boy.factors[0] + ". " : "") +
        "Monitor attendance and social signals."
      );
    return (
      "HIGH RISK. " +
      (boy.factors.length ? boy.factors.join("; ") + ". " : "") +
      "Immediate director/coach outreach advised."
    );
  }

  function getSectorAngle(squad) {
    return (
      (squads.indexOf(squad) / squads.length) * 2 * Math.PI +
      Math.PI / squads.length
    );
  }

  function exportReport() {
    window.print();
  }

  // Creative: Radar legend
  function radarLegend() {
    return (
      <div style={{ display: "flex", gap: 15, marginTop: 9, justifyContent: "center" }}>
        <div style={{ color: radarColors.high, fontWeight: 700 }}>● High Risk</div>
        <div style={{ color: radarColors.medium, fontWeight: 700 }}>● Moderate</div>
        <div style={{ color: radarColors.low, fontWeight: 700 }}>● Low</div>
        <div style={{ color: "#FFD700", fontWeight: 700 }}>● Selected</div>
      </div>
    );
  }

  // Creative: Squad ring legend with talent & resilience heatmap
  function squadInfo(sq) {
    const members = boysInView.filter(b => b.squad === sq);
    const avgTalent = (members.reduce((a, b) => a + b.talentScore, 0) / (members.length || 1)).toFixed(1);
    const avgResilience = (members.reduce((a, b) => a + b.resilience, 0) / (members.length || 1)).toFixed(1);
    return (
      <div style={{ color: "#FFD700", fontSize: 13 }}>
        {sq}: <span style={{ color: "#1de682" }}>Talent {avgTalent}</span> / <span style={{ color: "#ff6b6b" }}>Resilience {avgResilience}</span>
      </div>
    );
  }

  // Sparkline
  function Sparkline({ data, color }) {
    const w = 68, h = 26, max = Math.max(...data), min = Math.min(...data);
    return (
      <svg width={w} height={h}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={data.map((v, i) =>
            `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min + 0.01)) * (h - 6) - 3}`
          ).join(' ')}
        />
      </svg>
    );
  }

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
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <FaBullseye size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            RETENTION RISK RADAR
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Live, boardroom-first analytics: anticipate and act before you lose talent.
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
          onClick={exportReport}
        >
          <FaDownload style={{ marginRight: 7 }} />
          Export Report
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

      {/* Radar Visualization */}
      <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        {/* Radar */}
        <div style={{ minWidth: 420, maxWidth: 540, background: "#283E51", borderRadius: 24, padding: 28, boxShadow: "0 2px 12px 0 #15171a" }}>
          <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 7, fontSize: 18 }}>Live Retention Radar</div>
          <svg width={360} height={360} style={{ display: "block", margin: "0 auto" }}>
            <m.circle
              animate={{ scale: radarPulse }}
              transition={{ duration: 1.3, ease: "easeInOut" }}
              cx={180} cy={180} r={158}
              fill="none"
              stroke="#FFD70044"
              strokeWidth="3"
            />
            {[1, 2, 3].map(r =>
              <circle
                key={r}
                cx={180}
                cy={180}
                r={r * 52}
                fill="none"
                stroke="#485563"
                strokeDasharray="6 6"
                strokeWidth="1.2"
              />
            )}
            {squads.map((sq, i) => {
              const a = (i / squads.length) * 2 * Math.PI;
              const x = 180 + Math.sin(a) * 158;
              const y = 180 - Math.cos(a) * 158;
              return (
                <g key={sq}>
                  <line x1={180} y1={180} x2={x} y2={y} stroke="#FFD70033" strokeWidth="1.5" />
                  <text x={180 + Math.sin(a) * 180} y={180 - Math.cos(a) * 180} textAnchor="middle" fill="#FFD700" fontWeight={700} fontSize={15}>{sq}</text>
                </g>
              );
            })}
            {/* Animated “dots” for each boy */}
            {boysInView.map(boy => {
              const a = getSectorAngle(boy.squad);
              const r = 52 + boy.risk * 100;
              const x = 180 + Math.sin(a) * r;
              const y = 180 - Math.cos(a) * r;
              let color = radarColors.low;
              if (boy.risk >= 0.7) color = radarColors.high;
              else if (boy.risk >= 0.35) color = radarColors.medium;
              return (
                <m.circle
                  key={boy.id}
                  cx={x}
                  cy={y}
                  r={selected.id === boy.id ? 16 : 11}
                  fill={selected.id === boy.id ? "#FFD700" : color}
                  stroke="#fff"
                  strokeWidth={selected.id === boy.id ? 3 : 1}
                  style={{ cursor: "pointer" }}
                  animate={{
                    opacity: [1, boy.risk >= 0.7 ? 0.5 : 1, 1],
                    scale: [1, boy.risk >= 0.7 ? 1.22 : 1, 1],
                  }}
                  transition={{
                    duration: 1.1 + Math.random() * 0.7,
                    repeat: Infinity,
                  }}
                  onClick={() => setSelected(boy)}
                />
              );
            })}
          </svg>
          {radarLegend()}
          <div style={{ marginTop: 13, display: "flex", flexWrap: "wrap", gap: 13 }}>
            {squads.map(sq => (
              <div key={sq}>{squadInfo(sq)}</div>
            ))}
          </div>
        </div>

        {/* Hotlist & Boardroom AI */}
        <div style={{ minWidth: 295, maxWidth: 340 }}>
          <div style={{ background: "#232a2e", borderRadius: 14, padding: "14px 16px 10px 15px", boxShadow: "0 2px 12px 0 #15171a" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 4, fontSize: 17 }}>
              Imminent Exit Hotlist
            </div>
            <ul style={{ color: "#ff6b6b", fontWeight: 600, fontSize: 15, minHeight: 55 }}>
              {boysInView.filter(b => b.risk >= 0.7).length === 0 && <li>No one at high risk.</li>}
              {boysInView.filter(b => b.risk >= 0.7).map(b => (
                <li key={b.id} style={{ marginBottom: 7, cursor: "pointer" }} onClick={() => setSelected(b)}>
                  <FaExclamationTriangle style={{ marginRight: 7 }} />
                  {b.name} ({b.squad})
                </li>
              ))}
            </ul>
            <div style={{ margin: "15px 0 2px 0", color: "#1de682", fontWeight: 700 }}>
              {boysInView.filter(b => b.risk < 0.7).length} under monitoring
            </div>
          </div>
          {/* Boardroom AI Feed */}
          <div style={{ background: "#283E51", borderRadius: 14, padding: "14px 15px 10px 15px", marginTop: 20, boxShadow: "0 2px 12px 0 #15171a" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 4, fontSize: 16 }}>
              Boardroom Feed: AI Why at Risk?
            </div>
            <div style={{ color: selected.risk >= 0.7 ? "#ff6b6b" : "#FFD700", fontWeight: 600 }}>
              {selected.name} ({selected.squad}):<br />
              <span style={{ fontWeight: 500, color: "#fff" }}>{riskSummary(selected)}</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <b style={{ color: "#FFD700" }}>Assign Retention Action:</b><br />
              <select
                value={assignments[selected.id] || ""}
                onChange={e => setAssignments(a => ({ ...a, [selected.id]: e.target.value }))}
                style={{ borderRadius: 7, padding: "7px 10px", fontFamily: "Segoe UI", marginTop: 5 }}
              >
                <option value="">Assign...</option>
                {directors.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button
                style={{
                  background: "#FFD700",
                  color: "#232a2e",
                  borderRadius: 7,
                  padding: "7px 10px",
                  fontWeight: 700,
                  border: "none",
                  marginTop: 7,
                  marginLeft: 7,
                  cursor: "pointer",
                }}
                onClick={() => assignIntervention(selected, assignments[selected.id])}
              >
                <FaClipboardCheck style={{ marginRight: 6 }} />
                Log
              </button>
            </div>
            <div style={{ marginTop: 9 }}>
              <button
                style={{
                  background: "#1de682",
                  color: "#232a2e",
                  borderRadius: 7,
                  padding: "6px 13px",
                  fontWeight: 700,
                  border: "none",
                  marginRight: 8,
                  cursor: "pointer",
                }}
                onClick={() => updateStatus(selected, "Retained")}
              >
                <FaUserCheck style={{ marginRight: 6 }} />
                Mark Retained
              </button>
              <button
                style={{
                  background: "#ff6b6b",
                  color: "#fff",
                  borderRadius: 7,
                  padding: "6px 13px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => updateStatus(selected, "Departed")}
              >
                <FaExclamationTriangle style={{ marginRight: 6 }} />
                Mark Departed
              </button>
            </div>
          </div>
        </div>

        {/* Intervention Log & Sparkline */}
        <div style={{ minWidth: 360, maxWidth: 450 }}>
          <div style={{ background: "#1a1d20", borderRadius: 14, padding: "16px 17px 8px 17px", boxShadow: "0 2px 12px 0 #121416" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 6, textAlign: "center" }}>
              Boardroom Intervention Log
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 14, marginBottom: 7 }}>
              <thead>
                <tr>
                  <th>Boys</th>
                  <th>Director/Coach</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {interventionLog.slice(-6).reverse().map((a, i) => (
                  <tr key={i}>
                    <td style={{ color: "#FFD700", fontWeight: 600 }}>{a.boy}</td>
                    <td>{a.director}</td>
                    <td>{a.action}</td>
                    <td style={{
                      color: a.status === "Retained" ? "#1de682" : a.status === "Departed" ? "#ff6b6b" : "#FFD700",
                      fontWeight: 700,
                    }}>{a.status}</td>
                    <td>{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12, color: "#FFD700", fontWeight: 700, fontSize: 15 }}>
              <FaChartLine style={{ marginRight: 7 }} />
              {selected.name} Risk Trend & Engagement
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div>
                <svg width={100} height={38}>
                  <polyline
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="3"
                    points={selected.trend.map((v, i) =>
                      `${(i / (selected.trend.length - 1)) * 98},${34 - v * 30}`
                    ).join(' ')}
                  />
                </svg>
                <div style={{ color: "#FFD700", fontSize: 12, textAlign: "center" }}>Risk</div>
              </div>
              <div>
                <Sparkline data={selected.engagement} color="#1de682" />
                <div style={{ color: "#1de682", fontSize: 12, textAlign: "center" }}>Engagement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toggle departed */}
      <div style={{ marginTop: 16, color: "#FFD700", fontWeight: 700, fontSize: 15 }}>
        <input type="checkbox" checked={viewDeparted} onChange={e => setViewDeparted(e.target.checked)} /> Show Departed Boys
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
        Proprietary to CourtEvo Vero. Retention analytics, boardroom interventions, all male athletes. <span style={{ color: "#FFD700", fontWeight: 700 }}>BE REAL. BE VERO.</span>
      </div>
    </div>
  );
}
