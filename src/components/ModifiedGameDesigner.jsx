import React, { useState } from "react";
import {
  FaBasketballBall, FaPlus, FaTrash, FaDownload, FaUserCheck, FaUserTimes, FaArrowLeft, FaExclamationTriangle, FaCheckCircle
} from "react-icons/fa";
import { saveAs } from "file-saver";

// --- Block types (for LTAD session design)
const GAME_BLOCKS = [
  { key: "1v1", label: "1v1", color: "#1de682" },
  { key: "2v2", label: "2v2", color: "#FFD700" },
  { key: "3v3", label: "3v3", color: "#48e6a3" },
  { key: "4v4", label: "4v4", color: "#FFD700" },
  { key: "5v5", label: "5v5", color: "#1de682" },
  { key: "ssg", label: "SSG", color: "#FFD700" }, // small-sided games
  { key: "shooting", label: "Shooting", color: "#ffd70077" },
  { key: "passing", label: "Passing", color: "#1de68277" },
  { key: "decision", label: "Decision", color: "#ffd700aa" },
];

// --- LTAD "Gold Standard" session ratios per stage
const LTAD_STANDARDS = {
  FUNdamentals: { "1v1": 25, "2v2": 25, "3v3": 25, "4v4": 10, "5v5": 0, ssg: 10, shooting: 5, passing: 0, decision: 0 },
  "Learn to Train": { "1v1": 15, "2v2": 15, "3v3": 30, "4v4": 15, "5v5": 10, ssg: 10, shooting: 5, passing: 0, decision: 0 },
  "Train to Train": { "1v1": 10, "2v2": 10, "3v3": 15, "4v4": 15, "5v5": 30, ssg: 10, shooting: 5, passing: 5, decision: 0 },
  "Train to Compete": { "1v1": 5, "2v2": 10, "3v3": 10, "4v4": 15, "5v5": 40, ssg: 10, shooting: 5, passing: 5, decision: 0 },
  "Train to Win": { "1v1": 5, "2v2": 5, "3v3": 10, "4v4": 10, "5v5": 55, ssg: 5, shooting: 5, passing: 5, decision: 0 },
};

const LTAD_BANDS = Object.keys(LTAD_STANDARDS);

// --- Demo athlete list (plug in real data or Excel import later)
const DEMO_ATHLETES = [
  { name: "Luka Vuković", stage: "FUNdamentals" },
  { name: "Ivan Krstović", stage: "Learn to Train" },
  { name: "Stjepan Radić", stage: "Train to Train" },
  { name: "Marko Proleta", stage: "Train to Compete" }
];

export default function ModifiedGameDesigner() {
  const [ltad, setLtad] = useState("FUNdamentals");
  const [session, setSession] = useState([]); // [{block: "1v1", duration: 8}]
  const [assignDrawer, setAssignDrawer] = useState(false);
  const [athletes, setAthletes] = useState(DEMO_ATHLETES);
  const [assigned, setAssigned] = useState([]); // athlete names assigned

  // Add block to session timeline
  function addBlock(blockKey) {
    setSession([...session, { block: blockKey, duration: 8 }]);
  }
  function updateBlock(idx, field, val) {
    const arr = [...session];
    arr[idx][field] = field === "duration" ? Number(val) : val;
    setSession(arr);
  }
  function removeBlock(idx) {
    setSession(session.filter((_, i) => i !== idx));
  }
  function clearSession() {
    setSession([]);
  }

  // Analytics: % breakdown vs. LTAD
  function sessionBreakdown() {
    const total = session.reduce((s, b) => s + b.duration, 0) || 1;
    const byType = {};
    GAME_BLOCKS.forEach(b => { byType[b.key] = 0; });
    session.forEach(b => { byType[b.block] += b.duration; });
    Object.keys(byType).forEach(k => { byType[k] = Math.round((byType[k] / total) * 100); });
    return byType;
  }
  // Fit calculation (how close to LTAD standard for that band)
  function ltadFitPercent() {
    const breakdown = sessionBreakdown();
    const std = LTAD_STANDARDS[ltad];
    let fit = 0;
    let total = 0;
    Object.keys(std).forEach(k => {
      fit += 100 - Math.abs(std[k] - breakdown[k]);
      total += 100;
    });
    return Math.round((fit / total) * 100);
  }
  // Warnings (e.g., too much 5v5 for young)
  function sessionWarnings() {
    const breakdown = sessionBreakdown();
    const std = LTAD_STANDARDS[ltad];
    const warnings = [];
    Object.keys(std).forEach(k => {
      if (breakdown[k] > std[k] + 15)
        warnings.push(`Too much ${k} for ${ltad}.`);
      if (breakdown[k] < std[k] - 20 && std[k] > 0)
        warnings.push(`Not enough ${k} for ${ltad}.`);
    });
    if (session.length < 3)
      warnings.push("Session may be too short or not enough variety.");
    return warnings;
  }

  // Assign/dismiss athlete
  function toggleAthlete(name) {
    if (assigned.includes(name))
      setAssigned(assigned.filter(n => n !== name));
    else
      setAssigned([...assigned, name]);
  }

  // Athlete fit: check if their LTAD stage matches session's LTAD band
  function athleteFit(name) {
    const a = athletes.find(a => a.name === name);
    if (!a) return null;
    if (a.stage === ltad) return "fit";
    if (
      (ltad === "Learn to Train" && a.stage === "FUNdamentals") ||
      (ltad === "Train to Train" && a.stage === "Learn to Train") ||
      (ltad === "Train to Compete" && a.stage === "Train to Train")
    ) return "close";
    return "mismatch";
  }

  // Export as CSV
  function exportCSV() {
    let rows = [["Order", "Block", "Duration"]];
    session.forEach((b, idx) =>
      rows.push([idx + 1, b.block, b.duration])
    );
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `CourtEvoVero_Session_${ltad}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // UI
  return (
    <div className="max-w-[1420px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #1d232a 85%, #232a2e 100%)",
        borderRadius: "38px",
        boxShadow: "0 8px 32px #202a",
        minHeight: 990
      }}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaBasketballBall size={44} color="#FFD700" />
            <h1 className="font-extrabold text-4xl" style={{ color: "#FFD700", letterSpacing: 1 }}>
              MODIFIED GAME DESIGNER
            </h1>
          </div>
          <div className="text-[#FFD700] italic text-lg">
            Drag & build elite LTAD sessions, analytics & export — CourtEvo Vero standard.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="rounded px-2 py-2 bg-[#FFD700] text-[#222] font-bold"
            value={ltad}
            onChange={e => { setLtad(e.target.value); clearSession(); }}>
            {LTAD_BANDS.map(b => <option key={b}>{b}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={exportCSV}>
            <FaDownload /> Export Session
          </button>
        </div>
      </div>
      {/* Session composer */}
      <div className="flex flex-col md:flex-row gap-7">
        {/* Blocks to drag in */}
        <div className="md:w-1/4 w-full flex flex-col gap-3 mb-6">
          <div className="font-bold text-lg text-[#FFD700] mb-2">Game Blocks</div>
          {GAME_BLOCKS.map(b => (
            <button key={b.key}
              className="w-full py-3 rounded-xl font-bold flex items-center gap-3 mb-1"
              style={{ background: b.color, color: "#23292f", fontSize: 18, boxShadow: "0 1px 7px #0002" }}
              onClick={() => addBlock(b.key)}>
              <FaPlus /> {b.label}
            </button>
          ))}
          <button
            className="w-full py-2 mt-3 bg-[#23292f] text-[#FFD700] rounded-xl font-bold hover:bg-[#FFD70033]"
            onClick={clearSession}
          >
            Clear Session
          </button>
        </div>
        {/* Timeline */}
        <div className="md:w-2/4 w-full">
          <div className="font-bold text-lg text-[#FFD700] mb-2">Session Timeline</div>
          <div className="bg-[#181e23] rounded-2xl p-5 shadow-lg min-h-[210px]">
            {session.length === 0 && <div className="text-[#FFD700] text-center my-12 text-xl">Drag blocks to start building!</div>}
            <div className="flex flex-col gap-3">
              {session.map((b, idx) => {
                const blockType = GAME_BLOCKS.find(x => x.key === b.block);
                return (
                  <div key={idx} className="flex items-center gap-4 bg-[#23292f] rounded-xl py-3 px-3 shadow" style={{ borderLeft: `7px solid ${blockType.color}` }}>
                    <div className="font-bold text-lg" style={{ color: blockType.color }}>{blockType.label}</div>
                    <span className="text-[#FFD700] font-bold ml-2">Duration:</span>
                    <input type="number" min={4} max={30} value={b.duration}
                      className="w-16 bg-[#1a2229] text-white rounded px-2 ml-1"
                      onChange={e => updateBlock(idx, "duration", e.target.value)}
                    />
                    <span className="text-[#bbb] text-xs ml-1">min</span>
                    <button className="ml-auto text-[#FFD700]" onClick={() => removeBlock(idx)}>
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {/* LTAD Fit/Progress Bar */}
          <div className="mt-6">
            <div className="font-bold text-lg text-[#FFD700] mb-1 flex items-center gap-2">
              Development Fit
              {ltadFitPercent() >= 80
                ? <FaCheckCircle color="#1de682" />
                : ltadFitPercent() >= 60
                  ? <FaExclamationTriangle color="#FFD700" />
                  : <FaExclamationTriangle color="#e24242" />
              }
            </div>
            <div className="w-full bg-[#23292f] rounded-xl h-8 flex items-center shadow">
              <div
                className="h-8 rounded-xl flex items-center justify-center font-bold"
                style={{
                  width: `${ltadFitPercent()}%`,
                  background:
                    ltadFitPercent() >= 80
                      ? "linear-gradient(90deg, #1de682 60%, #FFD700 100%)"
                      : ltadFitPercent() >= 60
                        ? "linear-gradient(90deg, #FFD700 60%, #e24242 100%)"
                        : "#e24242",
                  color: "#222",
                  transition: "width 0.4s",
                }}
              >
                {ltadFitPercent()}%
              </div>
            </div>
            {/* Warnings */}
            <ul className="mt-2">
              {sessionWarnings().map((w, i) => (
                <li key={i} className="text-[#FFD700] font-bold flex items-center gap-2">
                  <FaExclamationTriangle /> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Athlete assignment */}
        <div className="md:w-1/4 w-full">
          <div className="font-bold text-lg text-[#FFD700] mb-2">Assign Athletes</div>
          <div className="bg-[#181e23] rounded-2xl p-5 shadow-lg">
            {athletes.map(a => (
              <div key={a.name} className="flex items-center gap-3 mb-2">
                <button
                  className="rounded-full px-2 py-1"
                  style={{
                    background: assigned.includes(a.name) ? "#1de682" : "#23292f",
                    color: assigned.includes(a.name) ? "#23292f" : "#FFD700",
                    border: `2px solid ${assigned.includes(a.name) ? "#1de682" : "#FFD700"}`,
                    fontWeight: 700,
                    minWidth: 32,
                  }}
                  onClick={() => toggleAthlete(a.name)}
                >
                  {assigned.includes(a.name) ? <FaUserCheck /> : <FaUserTimes />}
                </button>
                <span className="font-bold">{a.name}</span>
                <span className="ml-auto text-xs px-2 rounded"
                  style={{
                    background: athleteFit(a.name) === "fit" ? "#1de682" : athleteFit(a.name) === "close" ? "#FFD700" : "#e24242",
                    color: "#222",
                    fontWeight: 700
                  }}>
                  {athleteFit(a.name) === "fit" ? "Perfect" : athleteFit(a.name) === "close" ? "Good" : "Mismatch"}
                </span>
              </div>
            ))}
          </div>
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
