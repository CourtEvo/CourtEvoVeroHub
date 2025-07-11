import React, { useState } from "react";
import {
  FaCalendarAlt, FaClipboardList, FaChartBar, FaExclamationTriangle, FaFilePdf, FaHeartbeat, FaRunning
} from "react-icons/fa";

// Templates for Micro & Mesocycle
const templates = {
  micro: [
    {
      name: "Standard U15 Microcycle",
      week: [
        { day: "Mon", session: "Skill + Shooting", focus: "Fundamentals", load: "Med", duration: 90 },
        { day: "Tue", session: "Physical (Strength)", focus: "Core strength", load: "High", duration: 75 },
        { day: "Wed", session: "Rest / Recovery", focus: "Mobility, mental", load: "Low", duration: 30 },
        { day: "Thu", session: "Tactical + Team Play", focus: "Spacing, transition", load: "Med", duration: 100 },
        { day: "Fri", session: "Game Simulation", focus: "Decision-making", load: "High", duration: 95 },
        { day: "Sat", session: "Physical (Speed/Agility)", focus: "Explosiveness", load: "High", duration: 60 },
        { day: "Sun", session: "Rest", focus: "-", load: "Low", duration: 0 }
      ]
    },
    {
      name: "Return from Injury",
      week: [
        { day: "Mon", session: "Light Movement", focus: "Mobility", load: "Low", duration: 35 },
        { day: "Tue", session: "Low-Impact Skills", focus: "Ball-handling", load: "Low", duration: 50 },
        { day: "Wed", session: "Rest / Physio", focus: "Recovery", load: "Low", duration: 30 },
        { day: "Thu", session: "Core Strength", focus: "Bodyweight", load: "Med", duration: 40 },
        { day: "Fri", session: "Gradual Intensity", focus: "Controlled shooting", load: "Med", duration: 50 },
        { day: "Sat", session: "Short Team Session", focus: "Passing, communication", load: "Low", duration: 45 },
        { day: "Sun", session: "Rest", focus: "-", load: "Low", duration: 0 }
      ]
    }
  ],
  meso: [
    {
      name: "4-Week U15 Mesocycle (Build Phase)",
      month: [
        { week: 1, theme: "Technical", focus: "Skill base", load: "Med", totalMin: 475 },
        { week: 2, theme: "Physical Emphasis", focus: "Strength + Endurance", load: "High", totalMin: 520 },
        { week: 3, theme: "Tactical", focus: "Spacing, Press", load: "Med", totalMin: 460 },
        { week: 4, theme: "Taper/Recovery", focus: "Rest + Fundamentals", load: "Low", totalMin: 370 }
      ]
    },
    {
      name: "Tournament Peak Mesocycle",
      month: [
        { week: 1, theme: "Intensity Buildup", focus: "Game prep", load: "High", totalMin: 530 },
        { week: 2, theme: "Peak Load", focus: "Competition", load: "High", totalMin: 560 },
        { week: 3, theme: "Active Recovery", focus: "Light skills", load: "Low", totalMin: 390 },
        { week: 4, theme: "Balance", focus: "Mixed", load: "Med", totalMin: 440 }
      ]
    }
  ]
};

const loadColor = { "Low": "#1de682", "Med": "#FFD700", "High": "#e82e2e" };

function adherenceScore(week) {
  // Basic logic: reward >1 rest, balanced load, max 3 highs, min 1 low, max 2 consecutive highs
  let rest = week.filter(s => s.load === "Low").length;
  let high = week.filter(s => s.load === "High").length;
  let med = week.filter(s => s.load === "Med").length;
  let balanced = Math.abs(high - med) <= 2;
  let twoHighRow = week.some((s, i) => s.load === "High" && week[i + 1]?.load === "High");
  let score = 70;
  if (rest >= 2) score += 10;
  if (balanced) score += 10;
  if (high <= 3) score += 5;
  if (week.length && week[week.length - 1].load === "Low") score += 5;
  if (!twoHighRow) score += 5;
  return Math.min(score, 100);
}

function riskFlag(week) {
  // Risk if more than 2 highs in a row or rest day missing
  let twoHighRow = week.some((s, i) => s.load === "High" && week[i + 1]?.load === "High");
  let rest = week.some(s => s.load === "Low");
  if (!rest) return "No rest day detected. Add recovery.";
  if (twoHighRow) return "Warning: Multiple high-load days in a row.";
  return null;
}

// Main component
export default function MicrocycleDesigner() {
  const [mode, setMode] = useState("micro"); // micro or meso
  const [templateIdx, setTemplateIdx] = useState(0);
  const [editable, setEditable] = useState(false);
  const [customWeek, setCustomWeek] = useState(null);

  // Use selected template
  const current = templates[mode][templateIdx];

  // For microcycle, enable editing of session/focus/load
  function handleEdit(idx, field, val) {
    if (!customWeek) setCustomWeek([...current.week]);
    const copy = customWeek ? [...customWeek] : [...current.week];
    copy[idx][field] = val;
    setCustomWeek(copy);
  }

  // For microcycle only
  const week = mode === "micro" ? (customWeek || current.week) : null;

  // Pie chart mock: show ratio of load types for week
  const loadCounts = week
    ? week.reduce((acc, s) => ({ ...acc, [s.load]: (acc[s.load] || 0) + 1 }), {})
    : {};
  const totalSessions = week ? week.length : 0;
  const loadPie = Object.entries(loadCounts);

  // Adherence, risks, advice
  const adherence = week ? adherenceScore(week) : null;
  const risk = week ? riskFlag(week) : null;
  const advice = week
    ? adherence >= 95
      ? "Excellent structure—matches all best-practice guidelines."
      : adherence >= 85
        ? "Very good; consider more rest or load balance for optimal recovery."
        : "Review load distribution; adjust high/low days and ensure at least one full rest."
    : "";

  // Dummy PDF export
  const handleExport = () => {
    alert("Export coming soon! (Wire to backend/print for production)");
  };

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 12 }}>
        Microcycle & Mesocycle Designer <FaCalendarAlt style={{ marginLeft: 10, color: "#1de682", fontSize: 24, verticalAlign: -2 }} />
        <button
          onClick={handleExport}
          style={{
            float: "right",
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontWeight: 800,
            fontSize: 15,
            boxShadow: "0 2px 8px #FFD70044",
            marginTop: 3,
            cursor: "pointer",
            transition: "background 0.18s"
          }}
        >
          <FaFilePdf style={{ marginRight: 8 }} /> Export Plan
        </button>
      </h2>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => { setMode("micro"); setTemplateIdx(0); setCustomWeek(null); }}
          style={{
            background: mode === "micro" ? "#FFD700" : "#232a2e",
            color: mode === "micro" ? "#222" : "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 900,
            fontSize: 15,
            padding: "9px 24px",
            boxShadow: mode === "micro" ? "0 2px 8px #FFD70066" : "",
            cursor: "pointer"
          }}
        >
          Microcycle (Week)
        </button>
        <button
          onClick={() => { setMode("meso"); setTemplateIdx(0); setCustomWeek(null); }}
          style={{
            background: mode === "meso" ? "#FFD700" : "#232a2e",
            color: mode === "meso" ? "#222" : "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 900,
            fontSize: 15,
            padding: "9px 24px",
            boxShadow: mode === "meso" ? "0 2px 8px #FFD70066" : "",
            cursor: "pointer"
          }}
        >
          Mesocycle (Month)
        </button>
        {mode === "micro" && (
          <button
            onClick={() => setEditable(!editable)}
            style={{
              background: editable ? "#1de682" : "#232a2e",
              color: editable ? "#232a2e" : "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 900,
              fontSize: 15,
              padding: "9px 22px",
              marginLeft: 18,
              boxShadow: editable ? "0 2px 8px #1de68255" : "",
              cursor: "pointer"
            }}
          >
            {editable ? "Lock Edit" : "Edit Sessions"}
          </button>
        )}
      </div>
      <div style={{ marginBottom: 18 }}>
        <b>Select Template:</b>{" "}
        <select
          value={templateIdx}
          onChange={e => { setTemplateIdx(Number(e.target.value)); setCustomWeek(null); }}
          style={{
            background: "#232a2e",
            color: "#FFD700",
            border: "1.5px solid #FFD700",
            borderRadius: 7,
            fontWeight: 700,
            padding: "6px 18px"
          }}
        >
          {templates[mode].map((t, i) => (
            <option value={i} key={t.name}>{t.name}</option>
          ))}
        </select>
      </div>
      {mode === "micro" && (
        <div style={{
          background: "#232a2e",
          borderRadius: 16,
          padding: "26px 36px",
          boxShadow: "0 2px 18px #FFD70018",
          marginBottom: 14
        }}>
          <h3 style={{ color: "#FFD700", fontSize: 18, marginBottom: 12 }}>
            Weekly Structure Overview {adherence && (
              <span style={{
                marginLeft: 20,
                background: adherence >= 95 ? "#1de682" : adherence >= 85 ? "#FFD700" : "#e82e2e",
                color: "#232a2e",
                borderRadius: 7,
                fontWeight: 900,
                fontSize: 15,
                padding: "5px 13px"
              }}>
                Adherence: {adherence}%
              </span>
            )}
          </h3>
          <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Day</th>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Session</th>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Focus</th>
                <th style={{ padding: "8px 6px", textAlign: "center" }}>Load</th>
                <th style={{ padding: "8px 6px", textAlign: "center" }}>Duration (min)</th>
              </tr>
            </thead>
            <tbody>
              {week.map((s, idx) => (
                <tr key={idx} style={{
                  background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                  color: "#fff"
                }}>
                  <td style={{ padding: "7px 6px", color: "#FFD700", fontWeight: 700 }}>{s.day}</td>
                  <td style={{ padding: "7px 6px" }}>
                    {editable
                      ? <input
                        type="text"
                        value={s.session}
                        onChange={e => handleEdit(idx, "session", e.target.value)}
                        style={{ background: "#232a2e", color: "#FFD700", border: "1px solid #FFD700", borderRadius: 5, width: 120, padding: 3 }}
                      />
                      : s.session
                    }
                  </td>
                  <td style={{ padding: "7px 6px" }}>
                    {editable
                      ? <input
                        type="text"
                        value={s.focus}
                        onChange={e => handleEdit(idx, "focus", e.target.value)}
                        style={{ background: "#232a2e", color: "#1de682", border: "1px solid #1de682", borderRadius: 5, width: 120, padding: 3 }}
                      />
                      : s.focus
                    }
                  </td>
                  <td style={{ padding: "7px 6px", textAlign: "center" }}>
                    {editable
                      ? <select
                        value={s.load}
                        onChange={e => handleEdit(idx, "load", e.target.value)}
                        style={{ background: loadColor[s.load], color: "#232a2e", fontWeight: 900, borderRadius: 6, padding: "2px 9px" }}
                      >
                        {Object.keys(loadColor).map(l => <option value={l} key={l}>{l}</option>)}
                      </select>
                      : <span style={{
                        color: "#222",
                        background: loadColor[s.load],
                        fontWeight: 800,
                        borderRadius: 7,
                        padding: "3px 10px"
                      }}>{s.load}</span>
                    }
                  </td>
                  <td style={{ padding: "7px 6px", textAlign: "center" }}>
                    {editable
                      ? <input
                        type="number"
                        min={0}
                        value={s.duration}
                        onChange={e => handleEdit(idx, "duration", Number(e.target.value))}
                        style={{ background: "#232a2e", color: "#FFD700", border: "1px solid #FFD700", borderRadius: 5, width: 60, padding: 3 }}
                      />
                      : s.duration
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pie chart: load distribution */}
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 30 }}>
            <div>
              <h4 style={{ color: "#FFD700", fontSize: 16, marginBottom: 9 }}>Load Distribution</h4>
              <svg width="88" height="88" style={{ background: "#181e23", borderRadius: "50%", boxShadow: "0 1px 7px #FFD70033" }}>
                {loadPie.reduce((acc, [load, count], i, arr) => {
                  const prev = acc.prev || 0;
                  const angle = (count / totalSessions) * 360;
                  const x = 44 + 38 * Math.cos((Math.PI / 180) * (prev - 90));
                  const y = 44 + 38 * Math.sin((Math.PI / 180) * (prev - 90));
                  const x2 = 44 + 38 * Math.cos((Math.PI / 180) * (prev + angle - 90));
                  const y2 = 44 + 38 * Math.sin((Math.PI / 180) * (prev + angle - 90));
                  const large = angle > 180 ? 1 : 0;
                  const path = `M44,44 L${x},${y} A38,38 0 ${large},1 ${x2},${y2} Z`;
                  acc.prev = prev + angle;
                  acc.pieces.push(<path key={load} d={path} fill={loadColor[load]} />);
                  return acc;
                }, { prev: 0, pieces: [] }).pieces}
              </svg>
              <div style={{ display: "flex", gap: 11, marginTop: 8 }}>
                {Object.keys(loadColor).map(l =>
                  <span key={l} style={{ color: loadColor[l], fontWeight: 700, fontSize: 13 }}>{l}</span>
                )}
              </div>
            </div>
            <div>
              <h4 style={{ color: "#FFD700", fontSize: 16, marginBottom: 8 }}>Total Weekly Duration:</h4>
              <div style={{ color: "#1de682", fontWeight: 900, fontSize: 22 }}>
                {week.reduce((acc, s) => acc + s.duration, 0)} min
              </div>
            </div>
            <div>
              {risk && (
                <div style={{
                  background: "#e82e2e",
                  color: "#fff",
                  borderRadius: 7,
                  padding: "7px 13px",
                  fontWeight: 700,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  marginTop: 6
                }}>
                  <FaExclamationTriangle style={{ marginRight: 7 }} />
                  {risk}
                </div>
              )}
            </div>
          </div>
          <div style={{
            marginTop: 22,
            background: "#181e23",
            color: "#FFD700",
            borderRadius: 10,
            padding: "12px 18px",
            fontWeight: 600,
            fontSize: 15
          }}>
            <FaClipboardList style={{ marginRight: 7, verticalAlign: -2 }} />
            <span>Coach Advice: {advice}</span>
          </div>
        </div>
      )}

      {mode === "meso" && (
        <div style={{
          background: "#232a2e",
          borderRadius: 16,
          padding: "26px 36px",
          boxShadow: "0 2px 18px #FFD70018",
          marginBottom: 14
        }}>
          <h3 style={{ color: "#FFD700", fontSize: 18, marginBottom: 12 }}>
            4-Week Mesocycle Structure
          </h3>
          <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Week</th>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Theme</th>
                <th style={{ padding: "8px 6px", textAlign: "left" }}>Focus</th>
                <th style={{ padding: "8px 6px", textAlign: "center" }}>Load</th>
                <th style={{ padding: "8px 6px", textAlign: "center" }}>Total Min</th>
              </tr>
            </thead>
            <tbody>
              {current.month.map((w, idx) => (
                <tr key={idx} style={{
                  background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                  color: "#fff"
                }}>
                  <td style={{ padding: "7px 6px", color: "#FFD700", fontWeight: 700 }}>Week {w.week}</td>
                  <td style={{ padding: "7px 6px" }}>{w.theme}</td>
                  <td style={{ padding: "7px 6px" }}>{w.focus}</td>
                  <td style={{ padding: "7px 6px", textAlign: "center" }}>
                    <span style={{
                      color: "#222",
                      background: loadColor[w.load],
                      fontWeight: 800,
                      borderRadius: 7,
                      padding: "3px 10px"
                    }}>{w.load}</span>
                  </td>
                  <td style={{ padding: "7px 6px", textAlign: "center" }}>{w.totalMin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "13px 21px",
        fontWeight: 600,
        fontSize: 15
      }}>
        <FaHeartbeat style={{ marginRight: 7, verticalAlign: -2 }} />
        Coaches can adapt templates, export for planning, and prove to board/parents that the development plan is world-class, safe, and LTAD-compliant.
      </div>
    </div>
  );
}
