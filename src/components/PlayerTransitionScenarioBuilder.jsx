import React, { useState } from "react";
import {
  FaUserAlt, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaFlag, FaDownload, FaChartLine, FaPlus
} from "react-icons/fa";
import { saveAs } from "file-saver";

// --- Stages & Risks ---
const STAGES = [
  { key: "U12", label: "U12", color: "#FFD700" },
  { key: "U14", label: "U14", color: "#1de682" },
  { key: "U16", label: "U16", color: "#FFD700" },
  { key: "U18", label: "U18", color: "#1de682" },
  { key: "U20", label: "U20", color: "#FFD700" },
  { key: "Pro", label: "PRO", color: "#181E23" }
];
const RISK_COLORS = { low: "#1de682", med: "#FFD700", high: "#e24242" };

// --- Demo player profile
const demoPlayer = {
  name: "Luka Vuković",
  yob: 2008,
  position: "Guard",
  agent: "Yes",
  contract: "Semi-Pro",
  currentStage: "U18",
  injuries: ["None"],
  club: "Elite Club",
  transitions: [
    { from: "U12", to: "U14", age: 13, risk: "low", notes: "Smooth growth, all windows hit." },
    { from: "U14", to: "U16", age: 15, risk: "med", notes: "Late PHV, needs dual-career focus." },
    { from: "U16", to: "U18", age: 17, risk: "high", notes: "Injury at 16, delayed adaptation." },
    { from: "U18", to: "U20", age: 19, risk: "low", notes: "Fully recovered, ready for pro exposure." }
  ]
};

function riskLabel(risk) {
  if (risk === "low") return <span style={{ color: "#1de682", fontWeight: 700 }}><FaCheckCircle /> Low</span>;
  if (risk === "med") return <span style={{ color: "#FFD700", fontWeight: 700 }}><FaExclamationTriangle /> Medium</span>;
  return <span style={{ color: "#e24242", fontWeight: 700 }}><FaFlag /> High</span>;
}

export default function PlayerTransitionScenarioBuilder() {
  const [player, setPlayer] = useState(demoPlayer);
  const [scenario, setScenario] = useState([...demoPlayer.transitions]);
  const [editIdx, setEditIdx] = useState(null);

  // --- Scenario editing
  const handleEdit = (idx, field, value) => {
    const arr = [...scenario];
    arr[idx][field] = value;
    // Risk recalc (simple demo logic, real = more data driven)
    if (field === "age") {
      if (value < 13 || value > 20) arr[idx].risk = "high";
      else if (value < 15 || value > 18) arr[idx].risk = "med";
      else arr[idx].risk = "low";
    }
    setScenario(arr);
  };
  const addTransition = () => {
    setScenario([...scenario, { from: "U18", to: "Pro", age: 21, risk: "med", notes: "Final transition." }]);
    setEditIdx(scenario.length);
  };

  // --- Export as CSV (PDF = add react-to-print or similar)
  function exportCSV() {
    let rows = [["From", "To", "Age", "Risk", "Notes"]];
    scenario.forEach(tr =>
      rows.push([tr.from, tr.to, tr.age, tr.risk, tr.notes])
    );
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `CourtEvoVero_TransitionScenario_${player.name.replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // --- UI
  return (
    <div className="max-w-[1280px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #1d232a 85%, #232a2e 100%)",
        borderRadius: "36px",
        boxShadow: "0 8px 32px #222a",
        minHeight: 860
      }}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-7 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine size={38} color="#FFD700" />
            <h1 className="font-extrabold text-3xl" style={{ color: "#FFD700", letterSpacing: 1 }}>
              PLAYER TRANSITION SCENARIO BUILDER
            </h1>
          </div>
          <div className="text-[#FFD700] italic text-lg">Pathway risk heatmaps, scenario simulation, contract/agent logic — CourtEvo Vero.</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={exportCSV}>
            <FaDownload /> Export Scenario
          </button>
        </div>
      </div>
      {/* Player summary */}
      <div className="flex gap-8 items-center mb-7">
        <div className="flex items-center gap-3">
          <FaUserAlt size={44} color="#FFD700" />
          <div>
            <div className="font-bold text-2xl text-[#FFD700]">{player.name}</div>
            <div className="text-[#1de682] font-bold">{player.position} | {player.club}</div>
            <div className="text-[#FFD700] text-xs">Born: {player.yob} | Contract: {player.contract} | Agent: {player.agent}</div>
          </div>
        </div>
      </div>
      {/* Pathway timeline */}
      <div className="flex flex-col gap-3 mb-9">
        <div className="font-bold text-lg text-[#FFD700] mb-1">Transition Pathway</div>
        <div className="flex items-center flex-wrap gap-5 p-4 bg-[#181e23] rounded-2xl shadow-lg">
          {STAGES.map((stage, i) => (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full w-16 h-16 flex items-center justify-center font-black text-xl mb-2"
                  style={{
                    background: scenario.find(tr => tr.from === stage.key || tr.to === stage.key)
                      ? (scenario.find(tr => tr.to === stage.key)?.risk === "high"
                        ? "#e24242"
                        : scenario.find(tr => tr.to === stage.key)?.risk === "med"
                          ? "#FFD700"
                          : "#1de682")
                      : stage.color,
                    color: "#23292f",
                    border: "4px solid #FFD700"
                  }}
                >
                  {stage.label}
                </div>
                <div style={{ fontSize: 13, color: "#FFD700", marginTop: -4 }}>{stage.key}</div>
              </div>
              {i < STAGES.length - 1 && (
                <FaArrowRight size={32} color="#FFD700" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Transitions */}
      <div className="mb-9">
        <div className="font-bold text-lg text-[#FFD700] mb-3 flex items-center gap-2">
          <FaFlag /> Transition Events & Risks
        </div>
        <table className="w-full bg-[#23292f] rounded-xl overflow-hidden text-base">
          <thead>
            <tr className="text-[#FFD700] font-bold">
              <th>From</th>
              <th>To</th>
              <th>Age</th>
              <th>Risk</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scenario.map((tr, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#222" : "#181e23" }}>
                <td>
                  <select value={tr.from} className="bg-[#23292f] border-b border-[#FFD700] text-white px-2"
                    onChange={e => handleEdit(idx, "from", e.target.value)}>
                    {STAGES.map(s => <option key={s.key}>{s.key}</option>)}
                  </select>
                </td>
                <td>
                  <select value={tr.to} className="bg-[#23292f] border-b border-[#FFD700] text-white px-2"
                    onChange={e => handleEdit(idx, "to", e.target.value)}>
                    {STAGES.map(s => <option key={s.key}>{s.key}</option>)}
                  </select>
                </td>
                <td>
                  <input type="number" min={10} max={25} value={tr.age} className="w-14 bg-[#23292f] border-b border-[#FFD700] text-white px-2"
                    onChange={e => handleEdit(idx, "age", Number(e.target.value))} />
                </td>
                <td>{riskLabel(tr.risk)}</td>
                <td>
                  <input value={tr.notes} className="w-full bg-[#23292f] border-b border-[#FFD700] text-white px-2"
                    onChange={e => handleEdit(idx, "notes", e.target.value)} />
                </td>
                <td>
                  {/* remove event not allowed for demo transitions */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-3 bg-[#FFD700] text-[#23292f] font-bold px-5 py-2 rounded-lg flex items-center gap-2"
          onClick={addTransition}>
          <FaPlus /> Add Transition
        </button>
      </div>
      {/* Scenario analytics & recommendation */}
      <div className="bg-[#181e23] rounded-2xl p-7 shadow-xl">
        <div className="font-bold text-lg text-[#FFD700] mb-2 flex items-center gap-2">
          <FaChartLine /> Scenario Analytics & Recommendations
        </div>
        <ul className="text-base mb-2">
          {scenario.map((tr, idx) => (
            <li key={idx} className="flex items-center gap-2 mb-1">
              {riskLabel(tr.risk)}
              <span className="text-[#FFD700] font-bold">Transition {tr.from} → {tr.to} at age {tr.age}:</span>
              <span className="text-white">{tr.notes}</span>
            </li>
          ))}
        </ul>
        {/* Basic recommendations logic */}
        <div className="mt-2 text-lg text-[#1de682] font-bold">
          {
            scenario.some(tr => tr.risk === "high")
              ? "Warning: One or more transitions are HIGH RISK. Adjust age, add support (dual-career, injury recovery, agent), or delay step."
              : scenario.some(tr => tr.risk === "med")
                ? "Caution: At least one MEDIUM RISK transition. Review support plans, monitor closely."
                : "All transitions LOW RISK — pathway is optimal."
          }
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-14 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
