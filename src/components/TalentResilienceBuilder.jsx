// src/components/TalentResilienceBuilder.jsx

import React, { useState } from "react";
import {
  FaShieldAlt,
  FaArrowUpRight,
  FaArrowDown,
  FaArrowRight,
  FaClipboardCheck,
  FaChartLine,
  FaUserCheck,
  FaFire,
  FaRegSmile,
  FaRegTired,
  FaRegMeh,
  FaUserTie,
  FaDownload,
  FaShareAlt,
  FaBullseye,
  FaHeartbeat,
  FaBolt,
  FaExclamationTriangle,
  FaMedal,
} from "react-icons/fa";

const quadrantColors = {
  Elite: "#FFD700",
  Risk: "#ff6b6b",
  Workhorse: "#1de682",
  Growth: "#485563",
};

const directors = [
  "President",
  "Technical Director",
  "Squad Coach",
  "Parent Liaison",
];

// Demo athletes: added shock, roadmap, pulse, impact
const athletes = [
  {
    id: "A001",
    name: "Ivan Markovic",
    squad: "U12 Boys",
    talent: 8.7,
    resilience: 3.2,
    trend: [2.7, 2.9, 3.1, 3.2],
    adversity: ["Knee injury", "Lost starting role"],
    shock: "Knee injury (5 days ago)",
    roadmap: ["Peer Mentor", "Coach Check-in", "Parental Support"],
    peer: 3,
    coach: 2,
    self: 4,
    pulse: { pressure: 4, stress: 4, motivation: 2 },
    interventions: [],
    impact: [-0.4, 0.2, 0, 0.3],
    status: "Risk",
  },
  {
    id: "A002",
    name: "Dino Ilic",
    squad: "U14 Boys",
    talent: 9.1,
    resilience: 7.9,
    trend: [7.6, 7.8, 8.0, 7.9],
    adversity: [],
    shock: "",
    roadmap: ["Coach Check-in", "Special Assignment"],
    peer: 8,
    coach: 8,
    self: 8,
    pulse: { pressure: 2, stress: 2, motivation: 5 },
    interventions: [],
    impact: [0.3, 0.4, 0.1, 0.0],
    status: "Elite",
  },
  {
    id: "A003",
    name: "Luka Juric",
    squad: "U10 Boys",
    talent: 6.8,
    resilience: 6.1,
    trend: [5.6, 5.9, 6.0, 6.1],
    adversity: ["Parental divorce"],
    shock: "",
    roadmap: ["Peer Mentor", "Mental Skills Training"],
    peer: 7,
    coach: 6,
    self: 5,
    pulse: { pressure: 3, stress: 2, motivation: 3 },
    interventions: [],
    impact: [0.2, 0.1, -0.1, 0.1],
    status: "Workhorse",
  },
  {
    id: "A004",
    name: "Filip Simic",
    squad: "U12 Boys",
    talent: 5.2,
    resilience: 2.9,
    trend: [3.4, 2.9, 2.9, 2.9],
    adversity: ["Homesick", "Failed math test"],
    shock: "Failed math test (yesterday)",
    roadmap: ["Parental Support", "Coach Check-in"],
    peer: 3,
    coach: 3,
    self: 3,
    pulse: { pressure: 5, stress: 5, motivation: 1 },
    interventions: [],
    impact: [-0.2, 0, -0.2, -0.1],
    status: "Growth",
  },
];

const interventionsList = [
  "Assign Peer Mentor",
  "Mental Skills Training",
  "Coach Check-in",
  "Special Assignment",
  "Parental Support"
];

// Demo anonymous pressure pulse for club
const demoPulse = [
  { pressure: 3, stress: 2, motivation: 4 },
  { pressure: 4, stress: 4, motivation: 3 },
  { pressure: 2, stress: 2, motivation: 5 },
  { pressure: 5, stress: 4, motivation: 2 },
  { pressure: 3, stress: 3, motivation: 4 },
  { pressure: 1, stress: 1, motivation: 5 },
];

function getQuadrant(talent, resilience) {
  if (talent >= 7.5 && resilience >= 7.5) return "Elite";
  if (talent >= 7.5) return "Risk";
  if (resilience >= 7.5) return "Workhorse";
  return "Growth";
}

export default function TalentResilienceBuilder() {
  const [selected, setSelected] = useState(athletes[0]);
  const [assignments, setAssignments] = useState({});
  const [interventionLog, setInterventionLog] = useState([]);
  const [showPulse, setShowPulse] = useState(false);

  const squads = [...new Set(athletes.map(a => a.squad))];

  // Squad cohesion calculation
  const squadCohesion = squads.map(sq => {
    const squadBoys = athletes.filter(b => b.squad === sq);
    const ratingDiff = squadBoys.map(a => Math.abs(a.coach - a.peer) + Math.abs(a.peer - a.self) + Math.abs(a.coach - a.self));
    const adversity = squadBoys.map(a => a.adversity.length);
    return {
      squad: sq,
      cohesion: 10 - (ratingDiff.reduce((a, b) => a + b, 0) / squadBoys.length + adversity.reduce((a, b) => a + b, 0) / squadBoys.length),
    };
  });

  // Club pulse summary
  const clubPulse = {
    pressure: (demoPulse.reduce((a, p) => a + p.pressure, 0) / demoPulse.length).toFixed(2),
    stress: (demoPulse.reduce((a, p) => a + p.stress, 0) / demoPulse.length).toFixed(2),
    motivation: (demoPulse.reduce((a, p) => a + p.motivation, 0) / demoPulse.length).toFixed(2),
  };

  // AI alert logic
  function aiAlert(athlete) {
    if (athlete.shock)
      return (
        <div style={{ color: "#ff6b6b", fontWeight: 700, background: "#232a2e", borderRadius: 7, padding: "6px 9px", marginBottom: 8 }}>
          <FaBolt style={{ marginRight: 7 }} />
          Shock Event: {athlete.shock} – <b>Immediate check-in required!</b>
        </div>
      );
    if (athlete.trend[3] - athlete.trend[2] < -0.5)
      return (
        <div style={{ color: "#FFD700", fontWeight: 700, background: "#232a2e", borderRadius: 7, padding: "6px 9px", marginBottom: 8 }}>
          <FaExclamationTriangle style={{ marginRight: 7 }} />
          AI Alert: Rapid resilience drop detected. {athlete.coach < athlete.self ? "Coach sees more issues than athlete reports." : "Self-rating is low; confidence crisis likely."}
        </div>
      );
    return null;
  }

  // Personalized roadmap
  function ResilienceRoadmap({ steps }) {
    return (
      <div style={{ display: "flex", alignItems: "center", margin: "7px 0" }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{
              background: "#FFD700",
              color: "#232a2e",
              borderRadius: 10,
              padding: "5px 13px",
              fontWeight: 700,
              fontSize: 14,
              minWidth: 78,
              textAlign: "center"
            }}>{s}</div>
            {i < steps.length - 1 && <FaArrowRight style={{ margin: "0 8px", color: "#FFD700" }} />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  function assignIntervention(athlete, intervention, director) {
    if (!intervention || !director) return;
    setAssignments(a => ({ ...a, [athlete.id]: { intervention, director } }));
    setInterventionLog(log => [
      ...log,
      {
        athlete: athlete.name,
        director,
        intervention,
        date: new Date().toISOString().split("T")[0],
        status: "Assigned",
      },
    ]);
    athlete.interventions.push({ intervention, director, date: new Date().toISOString().split("T")[0] });
  }

  // Impact badge logic (if >0.2 avg improvement)
  function impactBadge(athlete) {
    const avg = athlete.impact.reduce((a, b) => a + b, 0) / athlete.impact.length;
    if (avg > 0.2)
      return <span style={{ color: "#FFD700", fontWeight: 700 }}><FaMedal style={{ marginRight: 3 }} /> Impact ↑</span>;
    if (avg < -0.2)
      return <span style={{ color: "#ff6b6b", fontWeight: 700 }}><FaMedal style={{ marginRight: 3 }} /> At Risk ↓</span>;
    return null;
  }

  // Sparkline
  function Sparkline({ data, color }) {
    const w = 72, h = 26, max = Math.max(...data), min = Math.min(...data);
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

  function exportReport() { window.print(); }

  // Retention at-risk highlight
  function isRetentionAtRisk(athlete) {
    const all = athletes.map(a => a.resilience);
    const sorted = [...all].sort((a, b) => a - b);
    return athlete.resilience <= sorted[Math.floor(0.1 * sorted.length)];
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
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <FaShieldAlt size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            TALENT RESILIENCE BUILDER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Boardroom analytics, AI alerts, adversity & cohesion, all male squads.
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

      <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        {/* Quadrant Scatterplot */}
        <div style={{ minWidth: 340, maxWidth: 440, background: "#283E51", borderRadius: 24, padding: 27, boxShadow: "0 2px 12px 0 #15171a" }}>
          <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 7, fontSize: 18 }}>Resilience Matrix</div>
          <svg width={320} height={320} style={{ background: "#232a2e", borderRadius: 18, marginBottom: 9 }}>
            <rect x={0} y={0} width={160} height={160} fill="#FFD70011" />
            <rect x={160} y={0} width={160} height={160} fill="#ff6b6b11" />
            <rect x={0} y={160} width={160} height={160} fill="#1de68211" />
            <rect x={160} y={160} width={160} height={160} fill="#48556322" />
            <line x1={160} y1={0} x2={160} y2={320} stroke="#485563" strokeWidth="2" />
            <line x1={0} y1={160} x2={320} y2={160} stroke="#485563" strokeWidth="2" />
            {/* Labels */}
            <text x={17} y={18} fontSize={13} fill="#FFD700" fontWeight={700}>Elite</text>
            <text x={252} y={18} fontSize={13} fill="#ff6b6b" fontWeight={700}>Risk</text>
            <text x={15} y={314} fontSize={13} fill="#1de682" fontWeight={700}>Workhorse</text>
            <text x={256} y={314} fontSize={13} fill="#485563" fontWeight={700}>Growth</text>
            <text x={150} y={310} fontSize={12} fill="#FFD700" textAnchor="middle">Talent</text>
            <text x={10} y={170} fontSize={12} fill="#1de682" textAnchor="middle" transform="rotate(-90 10,170)">Resilience</text>
            {/* Dots & shock */}
            {athletes.map(a => (
              <g key={a.id}>
                <circle
                  cx={32 + (a.talent / 10) * 256}
                  cy={320 - (32 + (a.resilience / 10) * 256)}
                  r={selected.id === a.id ? 15 : 10}
                  fill={quadrantColors[getQuadrant(a.talent, a.resilience)]}
                  stroke={selected.id === a.id ? "#FFD700" : "#fff"}
                  strokeWidth={selected.id === a.id ? 3 : 1.5}
                  style={{ cursor: "pointer", opacity: 0.96 }}
                  onClick={() => setSelected(a)}
                />
                {a.shock &&
                  <FaBolt
                    style={{
                      position: "absolute",
                      left: `${32 + (a.talent / 10) * 256 - 8}px`,
                      top: `${320 - (32 + (a.resilience / 10) * 256) - 13}px`,
                      color: "#ff6b6b",
                      fontSize: 19,
                      zIndex: 3,
                    }}
                  />
                }
              </g>
            ))}
          </svg>
          <div style={{ fontWeight: 600, marginTop: 2, fontSize: 15 }}>
            {(() => {
              switch (getQuadrant(selected.talent, selected.resilience)) {
                case "Elite": return <span style={{ color: "#FFD700", fontWeight: 700 }}><FaBullseye /> Elite</span>;
                case "Risk": return <span style={{ color: "#ff6b6b", fontWeight: 700 }}><FaFire /> Risk</span>;
                case "Workhorse": return <span style={{ color: "#1de682", fontWeight: 700 }}><FaUserCheck /> Workhorse</span>;
                case "Growth": return <span style={{ color: "#485563", fontWeight: 700 }}><FaRegTired /> Growth</span>;
                default: return "";
              }
            })()} – {selected.name}
          </div>
          {impactBadge(selected)}
          <div style={{ marginTop: 8 }}>
            <span style={{ color: "#FFD700", fontWeight: 700 }}>Talent:</span> {selected.talent} / 10
            <br />
            <span style={{ color: "#1de682", fontWeight: 700 }}>Resilience:</span> {selected.resilience} / 10
            {isRetentionAtRisk(selected) &&
              <span style={{ color: "#ff6b6b", fontWeight: 700, marginLeft: 12 }} title="Also at risk of exit – see Retention Risk Radar!"><FaExclamationTriangle /> Retention</span>
            }
          </div>
          <div style={{ marginTop: 7, color: "#fff", fontSize: 13 }}>
            <b>Squad:</b> {selected.squad}
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ color: "#FFD700", fontWeight: 700 }}>Trend:</span>
            <Sparkline data={selected.trend} color="#FFD700" />
          </div>
        </div>

        {/* Profile Drilldown, AI, Roadmap, Assignment */}
        <div style={{ minWidth: 350, maxWidth: 440 }}>
          <div style={{ background: "#232a2e", borderRadius: 14, padding: "16px 18px 10px 18px", boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 7, fontSize: 17 }}>Profile Drilldown</div>
            {aiAlert(selected)}
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 15, marginBottom: 5 }}>Adversity History</div>
            <ul style={{ marginBottom: 7 }}>
              {selected.adversity.length === 0 && <li>No major adversity yet.</li>}
              {selected.adversity.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 15, marginBottom: 5 }}>Personalized Roadmap</div>
            <ResilienceRoadmap steps={selected.roadmap} />
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 15, marginBottom: 5 }}>Resilience Ratings</div>
            <div style={{ marginBottom: 7 }}>
              <span style={{ color: "#FFD700" }}>Coach:</span> {selected.coach} &nbsp;
              <span style={{ color: "#FFD700" }}>Peer:</span> {selected.peer} &nbsp;
              <span style={{ color: "#FFD700" }}>Self:</span> {selected.self}
            </div>
            <div style={{ fontWeight: 700, color: "#FFD700", marginTop: 10 }}>Assign Intervention</div>
            <select
              value={assignments[selected.id]?.intervention || ""}
              onChange={e => setAssignments(a => ({
                ...a,
                [selected.id]: { ...a[selected.id], intervention: e.target.value }
              }))}
              style={{ borderRadius: 7, padding: "7px 12px", fontFamily: "Segoe UI", marginTop: 5, width: "95%" }}
            >
              <option value="">Select...</option>
              {interventionsList.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <div style={{ marginTop: 5, fontWeight: 700, color: "#FFD700" }}>Assign to:</div>
            <select
              value={assignments[selected.id]?.director || ""}
              onChange={e => setAssignments(a => ({
                ...a,
                [selected.id]: { ...a[selected.id], director: e.target.value }
              }))}
              style={{ borderRadius: 7, padding: "7px 12px", fontFamily: "Segoe UI", marginTop: 2, width: "95%" }}
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
                padding: "7px 14px",
                fontWeight: 700,
                border: "none",
                marginTop: 8,
                marginLeft: 5,
                cursor: "pointer",
              }}
              onClick={() => assignIntervention(selected, assignments[selected.id]?.intervention, assignments[selected.id]?.director)}
            >
              <FaClipboardCheck style={{ marginRight: 6 }} />
              Log
            </button>
          </div>
          {/* Action log for selected athlete */}
          <div style={{ background: "#283E51", borderRadius: 14, padding: "13px 17px 7px 17px", boxShadow: "0 2px 12px 0 #121416" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 5 }}>Intervention Log</div>
            <table style={{ width: "100%", fontSize: 13, color: "#fff", marginBottom: 4 }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Intervention</th>
                  <th>Director</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {interventionLog.filter(l => l.athlete === selected.name).map((l, i) => (
                  <tr key={i}>
                    <td>{l.date}</td>
                    <td>{l.intervention}</td>
                    <td>{l.director}</td>
                    <td>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trends, Cohesion, Pressure Pulse */}
        <div style={{ minWidth: 340, maxWidth: 440 }}>
          <div style={{ background: "#1a1d20", borderRadius: 14, padding: "14px 13px 10px 15px", boxShadow: "0 2px 12px 0 #15171a", marginBottom: 12 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 6, textAlign: "center" }}>
              Squad Cohesion & Club Trends
            </div>
            <table style={{ width: "100%", fontSize: 14, color: "#fff" }}>
              <thead>
                <tr>
                  <th>Squad</th>
                  <th>Cohesion</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {squadCohesion.map((t, i) => (
                  <tr key={i}>
                    <td style={{ color: "#FFD700", fontWeight: 600 }}>{t.squad}</td>
                    <td>{t.cohesion.toFixed(2)}</td>
                    <td><Sparkline data={athletes.filter(a => a.squad === t.squad).map(a => a.resilience)} color="#FFD700" /></td>
                  </tr>
                ))}
                <tr>
                  <td style={{ color: "#1de682", fontWeight: 700 }}>Club Pulse</td>
                  <td colSpan={2}>
                    <span style={{ color: "#FFD700" }}>Pressure: {clubPulse.pressure} </span> | <span style={{ color: "#ff6b6b" }}>Stress: {clubPulse.stress} </span> | <span style={{ color: "#1de682" }}>Motivation: {clubPulse.motivation}</span>
                    <button
                      onClick={() => setShowPulse(p => !p)}
                      style={{
                        background: "#FFD700",
                        color: "#232a2e",
                        border: "none",
                        borderRadius: 7,
                        fontWeight: 700,
                        padding: "5px 10px",
                        marginLeft: 15,
                        fontSize: 13,
                        cursor: "pointer"
                      }}
                    >{showPulse ? "Hide" : "Show"} Pulse</button>
                  </td>
                </tr>
              </tbody>
            </table>
            {showPulse &&
              <div style={{ marginTop: 7, background: "#FFD70022", borderRadius: 7, padding: 8, color: "#232a2e", fontWeight: 600 }}>
                {demoPulse.map((p, i) =>
                  <div key={i}>#{i + 1} Pressure: {p.pressure} | Stress: {p.stress} | Motivation: {p.motivation}</div>
                )}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Heatmap Table */}
      <div style={{ marginTop: 25 }}>
        <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 7 }}>Squad Resilience Heatmap</div>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 15 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Squad</th>
              <th>Talent</th>
              <th>Resilience</th>
              <th>Quadrant</th>
              <th>Status</th>
              <th>Shock</th>
              <th>Retention</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map(a => (
              <tr key={a.id} style={{ background: a.status === "Risk" ? "#ff6b6b22" : a.status === "Elite" ? "#FFD70022" : a.status === "Workhorse" ? "#1de68222" : "#48556322" }}>
                <td style={{ color: "#FFD700", fontWeight: 600 }}>{a.name}</td>
                <td>{a.squad}</td>
                <td>{a.talent}</td>
                <td>{a.resilience}</td>
                <td>{(() => {
                  switch (getQuadrant(a.talent, a.resilience)) {
                    case "Elite": return <span style={{ color: "#FFD700", fontWeight: 700 }}>Elite</span>;
                    case "Risk": return <span style={{ color: "#ff6b6b", fontWeight: 700 }}>Risk</span>;
                    case "Workhorse": return <span style={{ color: "#1de682", fontWeight: 700 }}>Workhorse</span>;
                    case "Growth": return <span style={{ color: "#485563", fontWeight: 700 }}>Growth</span>;
                    default: return "";
                  }
                })()}</td>
                <td style={{ color: a.status === "Risk" ? "#ff6b6b" : a.status === "Elite" ? "#FFD700" : "#1de682", fontWeight: 700 }}>{a.status}</td>
                <td>{a.shock && <FaBolt style={{ color: "#ff6b6b", fontSize: 18 }} title={a.shock} />}</td>
                <td>
                  {isRetentionAtRisk(a) &&
                    <span style={{ color: "#ff6b6b", fontWeight: 700 }} title="Also at risk of exit – see Retention Risk Radar!"><FaExclamationTriangle /> Retention</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        Proprietary to CourtEvo Vero. Boardroom analytics, AI alerts, real impact. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
