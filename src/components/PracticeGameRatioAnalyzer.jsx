import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell, CartesianGrid } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useReactToPrint } from "react-to-print";
import { FaFileExport, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

// Recommended ratios by age group/stage
const RECOMMENDED = {
  "U12": 4.0,
  "U14": 3.5,
  "U16": 3.0,
  "U18": 2.5,
  "Seniors": 2.0
};

const DEMO_TEAMS = [
  {
    team: "U12",
    period: "2024-25",
    practiceHours: 120,
    gameHours: 30,
    coach: "Coach Ana",
    lastRatio: 3.7,
    notes: "Transitioned to 2x weekly games in spring."
  },
  {
    team: "U14",
    period: "2024-25",
    practiceHours: 138,
    gameHours: 37,
    coach: "Coach Luka",
    lastRatio: 3.9,
    notes: "Added scrimmages to balance schedule."
  },
  {
    team: "U16",
    period: "2024-25",
    practiceHours: 112,
    gameHours: 42,
    coach: "Coach Marko",
    lastRatio: 3.2,
    notes: "Under target—consider tournament break."
  },
  {
    team: "Seniors",
    period: "2024-25",
    practiceHours: 84,
    gameHours: 45,
    coach: "Coach Ivan",
    lastRatio: 2.3,
    notes: "Balanced, high player retention."
  }
];

// Helpers
function calculateRatio(practice, games) {
  return games === 0 ? 0 : +(practice / games).toFixed(2);
}
function getStatusColor(ratio, recommended) {
  if (ratio >= recommended * 0.9 && ratio <= recommended * 1.1) return "#27ef7d";
  if (ratio >= recommended * 0.8 && ratio <= recommended * 1.2) return "#FFD700";
  return "#e94057";
}
function getStatusBadge(ratio, recommended) {
  const col = getStatusColor(ratio, recommended);
  if (col === "#27ef7d") return <span style={{ background: "#27ef7d", color: "#222", fontWeight: 700, borderRadius: 6, padding: "3px 10px", fontSize: 13 }}><FaCheckCircle /> Optimal</span>;
  if (col === "#FFD700") return <span style={{ background: "#FFD700", color: "#222", fontWeight: 700, borderRadius: 6, padding: "3px 10px", fontSize: 13 }}>Monitor</span>;
  return <span style={{ background: "#e94057", color: "#fff", fontWeight: 700, borderRadius: 6, padding: "3px 10px", fontSize: 13 }}><FaExclamationTriangle /> Risk</span>;
}
function getTrendIcon(ratio, lastRatio) {
  if (lastRatio == null) return "";
  if (ratio > lastRatio) return <span style={{ color: "#27ef7d", fontWeight: 700 }}>▲</span>;
  if (ratio < lastRatio) return <span style={{ color: "#e94057", fontWeight: 700 }}>▼</span>;
  return <span style={{ color: "#FFD700", fontWeight: 700 }}>●</span>;
}
function getRecommendation(ratio, recommended, d) {
  if (d.gameHours > d.practiceHours * 0.8)
    return {
      rec: "Burnout risk: too many games. Reduce competitions or increase training load.",
      why: "Players at this age risk injury and dropout if over-competed.",
      action: "Reduce number of games or add rest blocks."
    };
  if (ratio < recommended * 0.8)
    return {
      rec: "Under-competition: add more games or scrimmages for skill transfer.",
      why: "Without enough game context, practice skills don’t transfer.",
      action: "Schedule additional friendlies/scrimmages."
    };
  if (ratio > recommended * 1.2)
    return {
      rec: "Over-training risk: review balance, consider more competition for learning.",
      why: "Over-training can cause stagnation or boredom.",
      action: "Balance schedule, ask players for feedback."
    };
  return {
    rec: "On track. Keep monitoring as season progresses.",
    why: "Optimal for development and federation standards.",
    action: "Maintain, review monthly."
  };
}
function getOptimalGamePractice(target, currentGames) {
  const games = Math.round(currentGames || 12);
  return {
    neededPractice: Math.round(games * target),
    neededGames: Math.max(1, Math.round(currentGames))
  };
}
// --- AUTO-SUGGESTED TRAINING PLAN ---
function getSuggestedPlan(team, ratio, recommended) {
  let plan = { practice: 3, games: 1, rest: 1, tips: [] };
  if (ratio < recommended * 0.8) {
    plan.practice = 2; plan.games = 2; plan.rest = 1;
    plan.tips.push("Increase real-game play: organize more scrimmages or join mini-tournaments.");
  } else if (ratio > recommended * 1.2) {
    plan.practice = 4; plan.games = 1; plan.rest = 2;
    plan.tips.push("Reduce training intensity or add additional recovery blocks.");
  } else {
    plan.practice = Math.round(recommended); plan.games = 1; plan.rest = 1;
    plan.tips.push("Maintain balanced schedule; review player wellbeing weekly.");
  }
  if (team.startsWith("U12")) plan.tips.push("Keep sessions short, high fun, low pressure.");
  if (team === "Seniors") plan.practice = Math.max(plan.practice, 2);
  return plan;
}

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const PracticeGameRatioAnalyzer = () => {
  const [data, setData] = useState(DEMO_TEAMS);
  const [editIdx, setEditIdx] = useState(null);
  const [note, setNote] = useState("");
  const sectionRef = useRef();

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setData(rows.slice(1).map(row => ({
        team: row[0] || "",
        period: row[1] || "",
        practiceHours: Number(row[2] || 0),
        gameHours: Number(row[3] || 0),
        coach: row[4] || "",
        lastRatio: Number(row[5] || 0),
        notes: row[6] || ""
      })));
    };
    reader.readAsBinaryString(file);
  }
  function handleExport() {
    const rows = [
      ["Team", "Period", "PracticeHours", "GameHours", "Coach", "LastRatio", "Notes"]
    ].concat(
      data.map(d => [d.team, d.period, d.practiceHours, d.gameHours, d.coach, d.lastRatio, d.notes])
    );
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PracticeGameData");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `PracticeGameRatio_${new Date().toISOString().slice(0,10)}.xlsx`);
  }
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `PracticeGameRatio_${new Date().toISOString().slice(0,10)}`
  });
  const flagged = data.filter(d => {
    const ratio = calculateRatio(d.practiceHours, d.gameHours);
    const recommended = RECOMMENDED[d.team] || 3.0;
    return ratio < recommended * 0.8 || ratio > recommended * 1.2 || d.gameHours > d.practiceHours * 0.8;
  });
  const improving = [...data].sort((a, b) =>
    (calculateRatio(b.practiceHours, b.gameHours) - b.lastRatio) -
    (calculateRatio(a.practiceHours, a.gameHours) - a.lastRatio)
  )[0];
  const declining = [...data].sort((a, b) =>
    (calculateRatio(a.practiceHours, a.gameHours) - a.lastRatio) -
    (calculateRatio(b.practiceHours, b.gameHours) - b.lastRatio)
  )[0];
  function openEdit(idx) {
    setEditIdx(idx);
    setNote(data[idx].notes || "");
  }
  function saveNote(idx) {
    setData(ds => ds.map((d, i) => i === idx ? { ...d, notes: note } : d));
    setEditIdx(null);
  }

  return (
    <div style={{ width: "100%", maxWidth: 1040, margin: "0 auto" }}>
      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <div style={{ fontSize: 29, color: "#FFD700", fontWeight: 700, marginBottom: 18 }}>
          Practice-to-Competition Ratio Analyzer
        </div>
        {/* Upload/Export controls */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 17, flexWrap: "wrap" }}>
          <input type="file" accept=".xlsx,.csv" onChange={handleImport} />
          <button onClick={handleExport}
            style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "7px 18px", fontSize: 17, cursor: "pointer" }}>
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} />
            Export Excel
          </button>
          <button onClick={handlePrint}
            style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "7px 18px", fontSize: 17, cursor: "pointer" }}>
            Export PDF
          </button>
        </div>
        {/* Boardroom summary */}
        <div style={{ marginBottom: 16, color: "#FFD700cc", fontWeight: 700, fontSize: 16 }}>
          <span style={{ color: "#FFD700" }}>Boardroom Summary:</span>
          {flagged.length === 0 && <> All teams are in the optimal or monitor zone. Maintain current approach.</>}
          {flagged.length > 0 &&
            <>
              {" "}<span style={{ color: "#e94057" }}>{flagged.length} team(s) need immediate review:</span>
              {flagged.map(d => ` ${d.team}`)}
              {improving && <> | <span style={{ color: "#27ef7d" }}>Fastest improving: {improving.team}</span></>}
              {declining && <> | <span style={{ color: "#e94057" }}>Most at risk: {declining.team}</span></>}
            </>
          }
        </div>
        {/* Chart */}
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 12 }}>
          Ratio Chart (bars show actual, lines show recommended range)
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.map(d => ({
            ...d,
            actualRatio: calculateRatio(d.practiceHours, d.gameHours)
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="team" />
            <YAxis />
            <Tooltip formatter={(val, name) => [`${val} : 1`, name]} />
            <Legend />
            <Bar dataKey="actualRatio" name="Actual Ratio">
              {data.map((d, idx) => {
                const ratio = calculateRatio(d.practiceHours, d.gameHours);
                const recommended = RECOMMENDED[d.team] || 3.0;
                return <Cell key={idx} fill={getStatusColor(ratio, recommended)} />;
              })}
            </Bar>
            {data.map((d, i) => (
              <ReferenceLine
                key={i}
                x={d.team}
                y={RECOMMENDED[d.team] || 3.0}
                stroke="#FFD700"
                strokeDasharray="6 3"
                label={{
                  value: `Target: ${RECOMMENDED[d.team] || 3.0}`,
                  fill: "#FFD700",
                  fontSize: 13,
                  fontWeight: 700,
                  position: "insideTop"
                }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {/* Table with automation and polish */}
        <div style={{ marginTop: 28, overflowX: "auto" }}>
          <table style={{ width: "100%", color: "#FFD700", background: "#FFD70008", borderRadius: 7, fontSize: 16, borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, background: "#222", zIndex: 2 }}>
              <tr>
                <th>Team</th>
                <th>Season</th>
                <th>Practice Hours</th>
                <th>Game Hours</th>
                <th>Ratio</th>
                <th>Trend</th>
                <th>Status</th>
                <th>Recommended</th>
                <th>Optimal Practice/Game</th>
                <th>Coach</th>
                <th>Coach Notes</th>
                <th>Insight & Plan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => {
                const ratio = calculateRatio(d.practiceHours, d.gameHours);
                const recommended = RECOMMENDED[d.team] || 3.0;
                const ok = ratio >= recommended * 0.8 && ratio <= recommended * 1.2 && d.gameHours <= d.practiceHours * 0.8;
                const trendIcon = getTrendIcon(ratio, d.lastRatio);
                const { rec, why, action } = getRecommendation(ratio, recommended, d);
                const optimal = getOptimalGamePractice(recommended, d.gameHours);
                const plan = getSuggestedPlan(d.team, ratio, recommended);
                return (
                  <tr key={idx} style={{
                    color: getStatusColor(ratio, recommended),
                    fontWeight: 600,
                    background: idx % 2 === 0 ? "#fff1" : "#fff0"
                  }}>
                    <td>{d.team}</td>
                    <td>{d.period}</td>
                    <td>{d.practiceHours}</td>
                    <td>{d.gameHours}</td>
                    <td>
                      {ratio} : 1 {getStatusBadge(ratio, recommended)}
                    </td>
                    <td>{trendIcon}</td>
                    <td>{ok ? <span style={{ color: "#27ef7d" }}>OK</span> : <span style={{ color: "#e94057" }}>Attention</span>}</td>
                    <td>{recommended} : 1</td>
                    <td>
                      <span style={{ color: "#FFD700", fontSize: 15 }}>
                        {optimal.neededPractice} hrs / {optimal.neededGames} games
                      </span>
                    </td>
                    <td>{d.coach}</td>
                    <td>
                      {editIdx === idx ? (
                        <form onSubmit={e => { e.preventDefault(); saveNote(idx); }}>
                          <input value={note} onChange={e => setNote(e.target.value)} style={{ width: 130 }} />
                          <button type="submit" style={{ background: "#27ef7d", border: "none", color: "#222", borderRadius: 5, marginLeft: 4 }}>Save</button>
                          <button type="button" onClick={() => setEditIdx(null)} style={{ background: "#e94057", border: "none", color: "#fff", borderRadius: 5, marginLeft: 3 }}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <span>{d.notes || <span style={{ color: "#aaa" }}>None</span>}</span>
                          <button onClick={() => openEdit(idx)} style={{
                            marginLeft: 7, background: "#FFD70033", color: "#222", border: "none",
                            borderRadius: 5, fontWeight: 600, fontSize: 13, cursor: "pointer"
                          }}>Edit</button>
                        </>
                      )}
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700 }}>{rec}</span>
                        <br /><span style={{ color: "#FFD700bb" }}>{why}</span>
                        <br /><span style={{ color: "#27ef7d", fontSize: 15 }}>Action: {action}</span>
                        {/* --- SUGGESTED TRAINING PLAN --- */}
                        <div style={{ marginTop: 6, background: "#2224", borderRadius: 6, padding: 7, color: "#FFD700" }}>
                          <b>Suggested Plan:</b>
                          <br />
                          {plan.practice} practices / {plan.games} game(s) / {plan.rest} rest days per week.
                          <ul style={{ margin: "3px 0 0 10px", color: "#27ef7d", fontSize: 14 }}>
                            {plan.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 25, color: "#FFD700bb", fontSize: 15 }}>
          <b>Why it matters:</b> The right practice:game ratio reduces burnout, increases progression, and meets federation quality standards.<br />
          <b>Tip:</b> <span style={{ color: "#27ef7d" }}>Green = optimal.</span>
          <span style={{ color: "#FFD700" }}> Yellow = monitor.</span>
          <span style={{ color: "#e94057" }}> Red = act immediately.</span>
        </div>
      </motion.section>
    </div>
  );
};

export default PracticeGameRatioAnalyzer;
