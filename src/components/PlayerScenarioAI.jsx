import React, { useState } from "react";
import {
  FaChartLine, FaRobot, FaBolt, FaCheckCircle, FaExclamationTriangle, FaFlag, FaRedo, FaLightbulb,
  FaDownload, FaUserAlt
} from "react-icons/fa";
import { saveAs } from "file-saver";

// --- Timeline stages & risk colors
const STAGES = ["U12", "U14", "U16", "U18", "U20", "Pro"];
const RISK_COLORS = { low: "#1de682", med: "#FFD700", high: "#e24242" };

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

// --- Helper: risk dots for timeline visual
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

// --- AI engine: explainable recommendations and "actions"
function aiScenario(player) {
  let high = 0, med = 0, notes = [], aiActions = [];
  const { scenario, dualCareer, agent, nationality, school, contract, position } = player;

  scenario.forEach(tr => {
    if (tr.risk === "high") high += 1;
    if (tr.risk === "med") med += 1;
  });

  if (high > 0) {
    notes.push({
      icon: <FaFlag color="#e24242" />, color: "#e24242",
      text: "High-risk transition(s) detected. Immediate intervention required."
    });
    aiActions.push({
      label: "Delay risky transition", action: "delay", reason: "Delaying U16 or U18 transition may reduce risk.",
      color: "#e24242"
    });
  }
  if (!dualCareer && scenario.some(tr => ["med", "high"].includes(tr.risk))) {
    notes.push({
      icon: <FaBolt color="#FFD700" />, color: "#FFD700",
      text: "Dual-career support recommended for player with moderate/high risk."
    });
    aiActions.push({
      label: "Add dual-career support", action: "dualCareer", reason: "Research shows dual-career lowers dropout risk.", color: "#FFD700"
    });
  }
  if (nationality !== "CRO") {
    notes.push({
      icon: <FaLightbulb color="#FFD700" />, color: "#FFD700",
      text: "Monitor for international transfer/regulation risks."
    });
    aiActions.push({
      label: "Review transfer rules", action: "transfer", reason: "International moves increase pathway risk.", color: "#FFD700"
    });
  }
  if (contract === "Pro" && scenario.some(tr => tr.age < 18)) {
    notes.push({
      icon: <FaExclamationTriangle color="#FFD700" />, color: "#FFD700",
      text: "Early pro contract may raise dropout or burnout risk."
    });
    aiActions.push({
      label: "Delay pro contract", action: "delayPro", reason: "Later pro entry increases long-term success odds.", color: "#FFD700"
    });
  }
  if (position === "Forward" && scenario.some(tr => tr.risk === "med")) {
    notes.push({
      icon: <FaCheckCircle color="#1de682" />, color: "#1de682",
      text: "Consider position-specific support; Forwards often peak later."
    });
    aiActions.push({
      label: "Add position mentor", action: "mentor", reason: "Mentoring can stabilize role transitions.", color: "#1de682"
    });
  }
  if (notes.length === 0) {
    notes.push({
      icon: <FaCheckCircle color="#1de682" />, color: "#1de682",
      text: "Pathway optimal. Maintain current support structure."
    });
  }
  return {
    riskScore: Math.min(100, high * 35 + med * 20 + (dualCareer ? 0 : 15) + (contract === "Pro" ? 10 : 0)),
    summary: high > 0 ? "HIGH RISK" : med > 0 ? "MEDIUM RISK" : "LOW RISK",
    notes,
    aiActions
  };
}

export default function PlayerScenarioAI() {
  const [players, setPlayers] = useState(DEMO_PLAYERS);
  const [aiMode, setAiMode] = useState("player"); // "player" or "global"

  // --- Apply AI actions
  const applyAIAction = (pIdx, action) => {
    let arr = [...players];
    if (action === "dualCareer") arr[pIdx].dualCareer = true;
    if (action === "delay") {
      arr[pIdx].scenario = arr[pIdx].scenario.map(tr =>
        (tr.risk === "high" && tr.age < 21) ? { ...tr, age: tr.age + 1, risk: "med" } : tr
      );
    }
    if (action === "delayPro") {
      arr[pIdx].scenario = arr[pIdx].scenario.map(tr =>
        (tr.to === "Pro" && tr.age < 20) ? { ...tr, age: 20, risk: "med" } : tr
      );
    }
    setPlayers(arr);
  };

  // --- Global AI Simulate
  const simulateAll = action => {
    let arr = [...players];
    if (action === "dualCareer") arr = arr.map(p => ({ ...p, dualCareer: true }));
    if (action === "delayAllU16") arr = arr.map(p => ({
      ...p,
      scenario: p.scenario.map(tr => (tr.from === "U14" && tr.to === "U16" && tr.age < 17)
        ? { ...tr, age: tr.age + 1, risk: "med" } : tr)
    }));
    setPlayers(arr);
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
    saveAs(blob, `CourtEvoVero_ScenarioAI_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // --- UI
  return (
    <div className="max-w-[1820px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #181e23 80%, #232a2e 100%)",
        borderRadius: "38px",
        boxShadow: "0 8px 32px #202a",
        minHeight: 990
      }}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-7 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine size={38} color="#FFD700" />
            <FaRobot size={38} color="#1de682" />
            <h1 className="font-extrabold text-3xl" style={{ color: "#FFD700", letterSpacing: 1 }}>
              PLAYER SCENARIO AI LAB
            </h1>
          </div>
          <div className="text-[#FFD700] italic text-lg">
            AI-powered risk forecast, explainable recommendations & “what-if” simulation — CourtEvo Vero.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={exportCSV}>
            <FaDownload /> Export All
          </button>
          <button className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold ${aiMode === "player" ? "bg-[#1de682] text-black" : "bg-[#FFD700] text-black"} hover:scale-105`}
            onClick={() => setAiMode(aiMode === "player" ? "global" : "player")}>
            {aiMode === "player" ? <FaRedo /> : <FaLightbulb />} {aiMode === "player" ? "Global AI Sim" : "Per Player AI"}
          </button>
        </div>
      </div>
      {/* AI Analytics */}
      {aiMode === "global" && (
        <div className="bg-[#181e23] rounded-2xl p-6 shadow-xl mb-7">
          <div className="font-bold text-xl text-[#FFD700] mb-2 flex items-center gap-2">
            <FaRobot /> Global AI Simulation Lab
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button className="bg-[#FFD700] text-[#222] px-4 py-2 rounded-xl font-bold hover:scale-105"
              onClick={() => simulateAll("dualCareer")}>
              Add Dual-Career Support (All)
            </button>
            <button className="bg-[#FFD700] text-[#222] px-4 py-2 rounded-xl font-bold hover:scale-105"
              onClick={() => simulateAll("delayAllU16")}>
              Delay All U16 Transitions +1yr
            </button>
          </div>
          <div className="text-[#1de682] font-bold text-lg">
            Instantly test support policies or structural changes — see all risk analytics update live.
          </div>
        </div>
      )}
      {/* Player AI Cards */}
      <div className="flex flex-nowrap overflow-x-auto gap-7 pb-7">
        {players.map((p, idx) => {
          const ai = aiScenario(p);
          return (
            <div key={idx}
              className="bg-gradient-to-br from-[#23292f] to-[#1d232a] rounded-3xl shadow-2xl min-w-[430px] max-w-[480px] w-full p-8 flex flex-col relative"
              style={{
                border: "5px solid #FFD700",
                boxShadow: ai.riskScore > 80 ? "0 4px 32px #e2424288" :
                  ai.riskScore > 50 ? "0 4px 20px #FFD70066" : "0 2px 14px #1de68255",
                transition: "box-shadow 0.18s"
              }}>
              <div className="flex items-center gap-3 mb-2">
                <FaUserAlt size={28} color="#FFD700" />
                <span className="font-extrabold text-2xl text-[#FFD700]">{p.name}</span>
                <span className="ml-auto bg-[#FFD700] text-[#23292f] font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                  {p.position}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2 mt-1">
                <span className="bg-[#1de682] text-[#23292f] px-2 py-1 rounded font-bold flex items-center gap-1">
                  {p.club}
                </span>
                <span className="bg-[#FFD700] text-[#23292f] px-2 py-1 rounded font-bold flex items-center gap-1">
                  {p.school || "No School"}
                </span>
                <span className="bg-[#FFD700] text-[#23292f] px-2 py-1 rounded font-bold flex items-center gap-1">
                  Agent: {p.agent}
                </span>
                <span className="bg-[#1de682] text-[#23292f] px-2 py-1 rounded font-bold flex items-center gap-1">
                  Contract: {p.contract}
                </span>
              </div>
              <div className="mb-2 mt-1 text-xs text-[#FFD700]">Born: {p.yob} | Nationality: {p.nationality}</div>
              {/* Scenario Timeline */}
              <div className="flex items-center gap-1 mt-2 mb-2 relative" style={{ minHeight: 38 }}>
                <div style={{
                  position: "absolute", top: 20, left: 0, width: "100%", height: 8, borderRadius: 5,
                  background: `linear-gradient(90deg, ${p.scenario.map(s => RISK_COLORS[s.risk]).join(",")})`
                }} />
                {STAGES.map((stage, i) => {
                  const tr = p.scenario.find(s => s.to === stage);
                  return (
                    <div key={stage} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ marginBottom: 1 }}>
                        {riskDot(tr?.risk || "low", i, tr ? `Transition to ${stage}: ${tr.notes || "No notes"}` : null)}
                      </div>
                      <div className="text-[#FFD700]" style={{ fontSize: 12 }}>{stage}</div>
                    </div>
                  );
                })}
              </div>
              {/* AI Panel */}
              <div className="mt-3 mb-2 bg-[#181e23] rounded-xl p-5 shadow flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <FaRobot color="#1de682" size={18} />
                  <span className="font-bold text-[#1de682]">Scenario AI</span>
                  <span className="ml-auto text-sm px-3 py-1 rounded-full font-bold"
                    style={{
                      background: ai.riskScore > 80 ? "#e24242" : ai.riskScore > 50 ? "#FFD700" : "#1de682",
                      color: "#23292f"
                    }}>
                    {ai.summary} ({ai.riskScore}/100)
                  </span>
                </div>
                {ai.notes.map((n, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    {n.icon}
                    <span style={{ color: n.color, fontWeight: 600 }}>{n.text}</span>
                  </div>
                ))}
                {ai.aiActions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {ai.aiActions.map((a, j) => (
                      <button key={j}
                        className="px-3 py-1 rounded-lg font-bold text-[#222] flex items-center gap-1"
                        style={{
                          background: a.color, boxShadow: "0 2px 8px #FFD70044"
                        }}
                        onClick={() => applyAIAction(idx, a.action)}
                        title={a.reason}
                      >
                        <FaBolt /> {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-14 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
