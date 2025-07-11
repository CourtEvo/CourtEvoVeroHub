import React, { useState } from "react";
import {
  FaUserAlt, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaFlag, FaDownload, FaPlus, FaTrash, 
  FaGraduationCap, FaGlobe, FaHeartbeat, FaBolt, FaShieldAlt, FaChartLine
} from "react-icons/fa";
import { saveAs } from "file-saver";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// --- Timeline stages
const STAGES = ["U12", "U14", "U16", "U18", "U20", "Pro"];
const RISK_COLORS = { low: "#1de682", med: "#FFD700", high: "#e24242" };

// --- Default for new player
const newPlayerObj = (n = 1) => ({
  name: `Player ${n}`,
  yob: 2008,
  nationality: "CRO",
  dualCareer: false,
  school: "",
  position: "Guard",
  agent: "No",
  contract: "Amateur",
  club: "CourtEvo Club",
  scenario: [
    { from: "U12", to: "U14", age: 13, risk: "low", notes: "" },
    { from: "U14", to: "U16", age: 15, risk: "med", notes: "" },
    { from: "U16", to: "U18", age: 17, risk: "med", notes: "" },
    { from: "U18", to: "U20", age: 19, risk: "high", notes: "" }
  ]
});

const NATIONALITY_FLAGS = {
  CRO: "🇭🇷",
  SRB: "🇷🇸",
  SLO: "🇸🇮",
  BIH: "🇧🇦",
  MNE: "🇲🇪",
  ITA: "🇮🇹",
  ESP: "🇪🇸"
};

const POSITION_COLORS = {
  Guard: "#1de682",
  Forward: "#FFD700",
  Center: "#e24242"
};

// --- Demo players
const DEMO_PLAYERS = [
  {
    name: "Luka Vuković",
    yob: 2008,
    nationality: "CRO",
    dualCareer: true,
    school: "Euro School",
    position: "Guard",
    agent: "Yes",
    contract: "Semi-Pro",
    club: "Elite Club",
    scenario: [
      { from: "U12", to: "U14", age: 13, risk: "low", notes: "Smooth growth, all windows hit." },
      { from: "U14", to: "U16", age: 15, risk: "med", notes: "Late PHV, needs dual-career focus." },
      { from: "U16", to: "U18", age: 17, risk: "high", notes: "Injury at 16, delayed adaptation." },
      { from: "U18", to: "U20", age: 19, risk: "low", notes: "Fully recovered, ready for pro exposure." }
    ]
  },
  {
    name: "Marko Šarić",
    yob: 2007,
    nationality: "SRB",
    dualCareer: false,
    school: "Basketball Academy",
    position: "Forward",
    agent: "No",
    contract: "Amateur",
    club: "Progres Club",
    scenario: [
      { from: "U12", to: "U14", age: 14, risk: "med", notes: "Club transfer, new school." },
      { from: "U14", to: "U16", age: 16, risk: "high", notes: "Missed role switch, adaptation delayed." },
      { from: "U16", to: "U18", age: 18, risk: "low", notes: "Physical maturation complete." }
    ]
  }
];

function riskLabel(risk) {
  if (risk === "low") return <span style={{ color: "#1de682", fontWeight: 700 }}><FaCheckCircle /> Low</span>;
  if (risk === "med") return <span style={{ color: "#FFD700", fontWeight: 700 }}><FaExclamationTriangle /> Medium</span>;
  return <span style={{ color: "#e24242", fontWeight: 700 }}><FaFlag /> High</span>;
}

function riskDot(risk, key, popover) {
  return (
    <div title={popover}
      key={key}
      style={{
        width: 22, height: 22, borderRadius: 12,
        background: RISK_COLORS[risk] + "bb",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 1px 5px ${RISK_COLORS[risk]}66`, border: "3px solid #222",
        margin: "0 4px", cursor: popover ? "pointer" : undefined,
        transition: "all 0.2s"
      }}>
      {risk === "low" && <FaCheckCircle color="#222" />}
      {risk === "med" && <FaExclamationTriangle color="#222" />}
      {risk === "high" && <FaFlag color="#222" />}
    </div>
  );
}

function Sparkline({ data }) {
  // Show risk as color dot sequence (instead of SVG line, for clarity)
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {data.map((r, i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: 7,
          background: RISK_COLORS[r] + "ee", boxShadow: `0 0 4px ${RISK_COLORS[r]}88`
        }} />
      ))}
    </div>
  );
}

export default function PlayerTransitionComparison() {
  const [players, setPlayers] = useState(DEMO_PLAYERS);

  // --- Player CRUD
  const addPlayer = () => setPlayers([...players, newPlayerObj(players.length + 1)]);
  const removePlayer = idx => setPlayers(players.filter((_, i) => i !== idx));
  const editPlayerField = (idx, field, val) => {
    setPlayers(players.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  // --- Transition edit per player
  const editScenario = (pIdx, tIdx, field, val) => {
    const arr = [...players];
    arr[pIdx].scenario = arr[pIdx].scenario.map((t, i) => i === tIdx ? { ...t, [field]: val } : t);
    // risk update (simple)
    if (field === "age") {
      if (val < 13 || val > 20) arr[pIdx].scenario[tIdx].risk = "high";
      else if (val < 15 || val > 18) arr[pIdx].scenario[tIdx].risk = "med";
      else arr[pIdx].scenario[tIdx].risk = "low";
    }
    setPlayers(arr);
  };
  const addTransition = pIdx => {
    setPlayers(players.map((p, i) =>
      i === pIdx
        ? { ...p, scenario: [...p.scenario, { from: "U18", to: "Pro", age: 21, risk: "med", notes: "" }] }
        : p
    ));
  };

  // --- Export as CSV
  function exportCSV() {
    let rows = [["Player", "Nationality", "DualCareer", "School", "Position", "From", "To", "Age", "Risk", "Notes"]];
    players.forEach(p =>
      p.scenario.forEach(tr =>
        rows.push([
          p.name, p.nationality, p.dualCareer ? "Yes" : "No", p.school, p.position,
          tr.from, tr.to, tr.age, tr.risk, tr.notes
        ])
      )
    );
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `CourtEvoVero_MultiTransition_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // --- Analytics/Summary
  const risks = [];
  players.forEach((p, idx) =>
    p.scenario.forEach((tr, i) => risks.push({ ...tr, player: p.name, idx, tIdx: i, position: p.position, dualCareer: p.dualCareer, nationality: p.nationality }))
  );
  const highRisk = risks.filter(r => r.risk === "high");
  const medRisk = risks.filter(r => r.risk === "med");
  const lowRisk = risks.filter(r => r.risk === "low");
  // Pie chart data for risk
  const chartData = [
    { name: "High", value: highRisk.length, fill: "#e24242" },
    { name: "Medium", value: medRisk.length, fill: "#FFD700" },
    { name: "Low", value: lowRisk.length, fill: "#1de682" }
  ];

  // --- UI
  return (
    <div className="max-w-[1800px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #181e23 80%, #232a2e 100%)",
        borderRadius: "38px",
        boxShadow: "0 8px 32px #202a",
        minHeight: 980
      }}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-7 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine size={38} color="#FFD700" />
            <h1 className="font-extrabold text-3xl" style={{ color: "#FFD700", letterSpacing: 1 }}>
              PLAYER TRANSITION COMPARISON
            </h1>
          </div>
          <div className="text-[#FFD700] italic text-lg">
            Side-by-side risk analytics & live summary — CourtEvo Vero standard.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={exportCSV}>
            <FaDownload /> Export All
          </button>
          <button className="flex items-center gap-2 bg-[#1de682] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={addPlayer}>
            <FaPlus /> Add Player
          </button>
        </div>
      </div>
      {/* Summary Analytics */}
      <div className="bg-[#181e23] rounded-2xl p-6 shadow-xl mb-8 flex flex-col md:flex-row gap-7">
        <div className="flex-1">
          <div className="font-bold text-xl text-[#FFD700] mb-1 flex items-center gap-2">
            <FaFlag /> Risk Analytics
          </div>
          <div className="text-base mb-2">
            <b>High Risk:</b> {highRisk.length} &nbsp;|&nbsp;
            <b>Medium Risk:</b> {medRisk.length} &nbsp;|&nbsp;
            <b>Low Risk:</b> {lowRisk.length}
          </div>
          <div className="text-base mt-1">
            {highRisk.length > 0 &&
              <span className="text-[#e24242] font-bold">Immediate action: {highRisk.map(r => `${r.player} (${r.from}→${r.to})`).join(", ")}</span>
            }
            {highRisk.length === 0 && medRisk.length > 0 &&
              <span className="text-[#FFD700] font-bold">Monitor transitions for: {medRisk.map(r => `${r.player} (${r.from}→${r.to})`).join(", ")}</span>
            }
            {highRisk.length === 0 && medRisk.length === 0 &&
              <span className="text-[#1de682] font-bold">All player pathways optimal — no red flags.</span>
            }
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {Array.from(new Set(risks.filter(r => r.dualCareer).map(r => r.player))).length > 0 &&
              <span className="bg-[#FFD700] text-[#222] font-bold px-2 py-1 rounded flex items-center gap-1">
                <FaGraduationCap /> Dual Career:
                {Array.from(new Set(risks.filter(r => r.dualCareer).map(r => r.player))).join(", ")}
              </span>
            }
            {Array.from(new Set(risks.filter(r => r.nationality !== "CRO").map(r => r.player))).length > 0 &&
              <span className="bg-[#FFD700] text-[#222] font-bold px-2 py-1 rounded flex items-center gap-1">
                <FaGlobe /> Non-domestic:
                {Array.from(new Set(risks.filter(r => r.nationality !== "CRO").map(r => r.player))).join(", ")}
              </span>
            }
          </div>
        </div>
        <div className="w-full md:w-60">
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#FFD700" />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" isAnimationActive fill="#FFD700">
                {chartData.map((entry, index) => (
                  <rect
                    key={index}
                    x={index * 40}
                    y={90 - entry.value * 10}
                    width={35}
                    height={entry.value * 10}
                    fill={entry.fill}
                    rx={8}
                    ry={8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-2 mt-2">
            <span className="flex items-center gap-1 text-[#e24242] font-bold"><FaFlag /> High</span>
            <span className="flex items-center gap-1 text-[#FFD700] font-bold"><FaExclamationTriangle /> Med</span>
            <span className="flex items-center gap-1 text-[#1de682] font-bold"><FaCheckCircle /> Low</span>
          </div>
        </div>
      </div>
      {/* Cards: Side-by-side player comparison */}
      <div className="flex flex-nowrap overflow-x-auto gap-7 pb-7">
        {players.map((p, idx) => (
          <div key={idx}
            className="bg-gradient-to-br from-[#23292f] to-[#1d232a] rounded-3xl shadow-2xl min-w-[410px] max-w-[460px] w-full p-7 flex flex-col relative"
            style={{
              border: "5px solid #FFD700",
              boxShadow: p.scenario.some(tr => tr.risk === "high") ? "0 4px 32px #e2424288" :
                p.scenario.some(tr => tr.risk === "med") ? "0 4px 20px #FFD70066" : "0 2px 14px #1de68255",
              transition: "box-shadow 0.18s"
            }}>
            {/* Player Header */}
            <button
              onClick={() => removePlayer(idx)}
              className="absolute top-6 right-7 text-[#e24242] text-2xl font-bold hover:scale-125"
              title="Remove Player"
              style={{ zIndex: 2 }}
            >×</button>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-full w-12 h-12 flex items-center justify-center font-bold text-2xl"
                style={{
                  background: POSITION_COLORS[p.position] || "#FFD700",
                  color: "#23292f",
                  boxShadow: "0 1px 5px #FFD70088"
                }}>
                {NATIONALITY_FLAGS[p.nationality] || "🏀"}
              </div>
              <span className="font-extrabold text-2xl text-[#FFD700]">{p.name}</span>
              <span className="ml-auto bg-[#FFD700] text-[#23292f] font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                {p.position}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-1 mt-1">
              <span className="bg-[#1de682] text-[#23292f] px-2 py-1 rounded font-bold flex items-center gap-1">
                <FaHeartbeat /> {p.club}
              </span>
              <span className="bg-[#FFD700] text-[#23292f] px-2 py-1 rounded font-bold flex items-center gap-1">
                <FaGraduationCap /> {p.school || "N/A"}
              </span>
              <span className="bg-[#FFD700] text-[#23292f] px-2 py-1 rounded font-bold flex items-center gap-1">
                {p.agent === "Yes" ? <FaShieldAlt /> : <FaBolt />} Agent: {p.agent}
              </span>
              <span className="bg-[#1de682] text-[#23292f] px-2 py-1 rounded font-bold flex items-center gap-1">
                Contract: {p.contract}
              </span>
            </div>
            <div className="text-[#FFD700] text-xs mb-3 mt-1">Born: {p.yob} | Nationality: {NATIONALITY_FLAGS[p.nationality] || p.nationality}</div>
            <div className="mb-1">
              <Sparkline data={p.scenario.map(s => s.risk)} />
            </div>
            {/* Timeline: Animated Progress Bar w/ Dots */}
            <div className="flex items-center gap-1 mt-2 mb-4 relative" style={{ minHeight: 35 }}>
              <div style={{
                position: "absolute", top: 18, left: 0, width: "100%", height: 6, borderRadius: 5,
                background: `linear-gradient(90deg, ${p.scenario.map(s => RISK_COLORS[s.risk]).join(",")})`
              }} />
              {STAGES.map((stage, i) => {
                const tr = p.scenario.find(s => s.to === stage);
                return (
                  <div key={stage} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {riskDot(tr?.risk || "low", i, tr ? `Transition to ${stage}: ${tr.notes || "No notes"}` : null)}
                    <div className="text-[#FFD700]" style={{ fontSize: 12, marginTop: 2 }}>{stage}</div>
                  </div>
                );
              })}
            </div>
            {/* Scenario transitions */}
            <table className="w-full text-base bg-[#181e23] rounded-lg mb-2">
              <thead>
                <tr className="text-[#FFD700] font-bold">
                  <th>From</th>
                  <th>To</th>
                  <th>Age</th>
                  <th>Risk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {p.scenario.map((tr, tIdx) => (
                  <tr key={tIdx} style={{ background: tIdx % 2 === 0 ? "#222" : "#181e23" }}>
                    <td>
                      <select value={tr.from} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        onChange={e => editScenario(idx, tIdx, "from", e.target.value)}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={tr.to} className="bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        onChange={e => editScenario(idx, tIdx, "to", e.target.value)}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="number" min={10} max={25} value={tr.age} className="w-12 bg-[#23292f] border-b border-[#FFD700] text-white px-1"
                        onChange={e => editScenario(idx, tIdx, "age", Number(e.target.value))} />
                    </td>
                    <td>{riskLabel(tr.risk)}</td>
                    <td>
                      {/* add row remove if needed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-2 mb-1 bg-[#FFD700] text-[#23292f] font-bold px-3 py-1 rounded-lg flex items-center gap-2"
              onClick={() => addTransition(idx)}>
              <FaPlus /> Add Transition
            </button>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-14 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
