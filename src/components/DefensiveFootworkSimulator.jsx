import React, { useState, useRef } from "react";
import { FaShieldAlt, FaChevronLeft, FaChevronRight, FaBullseye, FaClipboardList, FaRobot, FaSave, FaPlay, FaExclamationTriangle, FaChartPie, FaUsers, FaFileExport, FaAngleUp, FaAngleDown, FaUserEdit, FaComments, FaSync } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- BUTTON
function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg,#FFD700 80%,#1de682 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "11px 18px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #FFD70044"
    }} {...props}>{children}</button>
  );
}

// --- DEMO DATA
const phaseTemplates = [
  { name: "Closeout", icon: <FaBullseye />, desc: "Fast closeout, hands up" },
  { name: "Slide Left", icon: <FaChevronLeft />, desc: "Lateral slide left" },
  { name: "Slide Right", icon: <FaChevronRight />, desc: "Lateral slide right" },
  { name: "Help & Recover", icon: <FaAngleUp />, desc: "Rotate to help, recover to man" },
  { name: "Trap", icon: <FaSync />, desc: "Double/trap ballhandler" }
];

const demoDefenders = [
  { name: "Defender 1", x: 170, y: 160, angle: 0, zone: "Perimeter", pressure: "High", color: "#FF4848" },
  { name: "Defender 2", x: 210, y: 90, angle: 45, zone: "Wing", pressure: "Medium", color: "#FFD700" }
];
const demoAttackers = [
  { name: "Attacker 1", x: 170, y: 40, zone: "Perimeter" }
];

// --- PRESSURE GRADIENT
function PressureMap({ defenders }) {
  // Paint a color gradient overlay based on defenders' pressure/zones
  return (
    <svg width={380} height={220} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      {defenders.map((d, i) => (
        <ellipse key={i} cx={d.x} cy={d.y} rx={55} ry={25}
          fill={`url(#grad${i})`} opacity={0.22} />
      ))}
      <defs>
        {defenders.map((d, i) => (
          <radialGradient id={`grad${i}`} key={i}>
            <stop offset="0%" stopColor={d.color} stopOpacity="0.9" />
            <stop offset="95%" stopColor={d.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
    </svg>
  );
}

// --- COURT UI
function DefenseCourt({ defenders, attackers, setDefenders, activePhase, rotateDefender, moveBall, selectDef, activeDef }) {
  const courtW = 380, courtH = 220;
  return (
    <div style={{ position: "relative" }}>
      <svg width={courtW} height={courtH} style={{ background: "#222e39", borderRadius: 18, boxShadow: "0 2px 18px #FFD70033", marginBottom: 8, zIndex: 2 }}>
        {/* Court lines */}
        <ellipse cx={courtW / 2} cy={32} rx={40} ry={14} fill="none" stroke="#FFD700" strokeWidth={2} />
        <rect x={courtW / 2 - 60} y={32} width={120} height={40} fill="none" stroke="#FFD700" strokeWidth={2} />
        {/* Attackers (ball movement) */}
        {attackers.map((a, idx) => (
          <g key={a.name} onClick={() => moveBall(idx)}>
            <circle cx={a.x} cy={a.y} r={18} fill="#1de682" stroke="#FFD700" strokeWidth={2.5} />
            <text x={a.x} y={a.y + 7} textAnchor="middle" fontWeight="bold" fontSize={13} fill="#232b39">A</text>
          </g>
        ))}
        {/* Defenders (drag, rotate) */}
        {defenders.map((d, i) => (
          <g key={d.name}
            style={{ cursor: "pointer" }}
            onClick={() => selectDef(i)}
            onMouseDown={e => {
              const svg = e.target.ownerSVGElement;
              function move(ev) {
                setDefenders(ds => ds.map((dd, idx) =>
                  idx === i
                    ? { ...dd, x: ev.clientX - svg.getBoundingClientRect().left, y: ev.clientY - svg.getBoundingClientRect().top }
                    : dd
                ));
              }
              function up() {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              }
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}>
            <circle cx={d.x} cy={d.y} r={20} fill={d.color} stroke={activeDef === i ? "#FFD700" : "#FFD70044"} strokeWidth={3} />
            <text x={d.x} y={d.y + 7} fontWeight="bold" fill="#181e23" fontSize={13} textAnchor="middle">{d.name.split(" ")[1]}</text>
            {/* Angle/stance arrow */}
            <line x1={d.x} y1={d.y}
              x2={d.x + 25 * Math.cos((d.angle - 90) * Math.PI / 180)}
              y2={d.y + 25 * Math.sin((d.angle - 90) * Math.PI / 180)}
              stroke="#232b39" strokeWidth={5} markerEnd="url(#arrow)" />
          </g>
        ))}
        {/* SVG Arrowhead Def */}
        <defs>
          <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,8 L8,4 z" fill="#232b39" />
          </marker>
        </defs>
      </svg>
      <PressureMap defenders={defenders} />
      {/* Rotate control for selected defender */}
      {activeDef !== null && (
        <div style={{ position: "absolute", top: defenders[activeDef].y - 40, left: defenders[activeDef].x + 20, background: "#181e23", borderRadius: 10, padding: 8, zIndex: 10 }}>
          <span style={{ color: "#FFD700", fontWeight: 900 }}>Angle:</span>
          <input
            type="range" min={-90} max={90}
            value={defenders[activeDef].angle}
            onChange={e => rotateDefender(activeDef, parseInt(e.target.value))}
            style={{ width: 85, marginLeft: 7 }}
          />
          <span style={{ color: "#FFD700", marginLeft: 8 }}>{defenders[activeDef].angle}°</span>
        </div>
      )}
    </div>
  );
}

// --- Timeline & Analytics
function FootworkPhaseTimeline({ phases, step, setStep, comments, setComments }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}>
      {phases.map((p, i) => (
        <Button key={p.name}
          style={{
            background: i === step ? "#FFD700" : "#1de682",
            color: i === step ? "#181e23" : "#222e39",
            fontSize: 15, padding: "8px 11px"
          }}
          onClick={() => setStep(i)}
        >
          {p.icon} {p.name}
        </Button>
      ))}
      <span style={{ marginLeft: 11 }}>
        <FaComments style={{ color: "#FFD700", fontSize: 18 }} />
        <input
          value={comments[step] || ""}
          placeholder="Comment/feedback"
          onChange={e => setComments(cs => cs.map((c, idx) => idx === step ? e.target.value : c))}
          style={{ marginLeft: 7, borderRadius: 7, padding: "3px 9px", fontWeight: 800, width: 120 }}
        />
      </span>
    </div>
  );
}

// --- Analytics Chart
function DisruptionAnalytics({ defenders, step, phases }) {
  // Dummy demo: You can extend with true heatmaps/charts from real data
  return (
    <div style={{ background: "#232b39", borderRadius: 14, padding: "15px 19px", marginBottom: 13 }}>
      <b style={{ color: "#FFD700", fontSize: 17 }}><FaChartPie style={{ marginRight: 6 }} /> Disruption Analytics</b>
      <div style={{ marginTop: 7, color: "#FFD700", fontWeight: 900 }}>Phase: {phases[step].name}</div>
      <div style={{ marginTop: 8, color: "#1de682", fontWeight: 900 }}>
        Pressure Intensity: <span style={{ color: "#FFD700" }}>{defenders.map(d => d.pressure).join(", ")}</span>
      </div>
      <div style={{ color: "#FFD700", marginTop: 8, fontWeight: 900 }}>
        Coverage Gaps: <span style={{ color: "#FF4848" }}>{defenders.filter(d => d.angle < -30 || d.angle > 70).length ? "Yes" : "None"}</span>
      </div>
      <div style={{ color: "#1de682", marginTop: 8, fontWeight: 900 }}>
        Deflection Risk: <span style={{ color: "#FFD700" }}>{step === 0 ? "High" : "Medium"}</span>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT
export default function DefensiveFootworkSimulator() {
  const [phases, setPhases] = useState([...phaseTemplates]);
  const [defenders, setDefenders] = useState([...demoDefenders]);
  const [attackers, setAttackers] = useState([...demoAttackers]);
  const [step, setStep] = useState(0);
  const [activeDef, setActiveDef] = useState(null);
  const [comments, setComments] = useState(Array(phaseTemplates.length).fill(""));
  const [showAI, setShowAI] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [savedDrills, setSavedDrills] = useState([]);

  // --- Move/rotate/drag handlers
  function rotateDefender(idx, angle) {
    setDefenders(ds => ds.map((d, i) => i === idx ? { ...d, angle } : d));
  }
  function moveBall(idx) {
    setAttackers(as => as.map((a, i) =>
      i === idx ? { ...a, x: Math.random() * 220 + 70, y: Math.random() * 130 + 45 } : a
    ));
    // Auto-update defenders' position slightly toward new ball
    setDefenders(ds => ds.map((d, i) => ({
      ...d,
      x: d.x + (attackers[idx].x - d.x) * 0.2,
      y: d.y + (attackers[idx].y - d.y) * 0.2
    })));
  }
  function selectDef(i) { setActiveDef(i === activeDef ? null : i); }

  // --- AI
  function runAIRisk() { setShowAI(true); }

  // --- Save drill/scenario
  function saveDrill() {
    if (!scenarioName.trim()) return;
    setSavedDrills([...savedDrills, { name: scenarioName, steps: phases.map(f => f.name), positions: defenders.map((d, i) => ({ ...d })) }]);
    setScenarioName("");
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#212c3a 0%, #283E51 100%)", color: "#fff", fontFamily: "Segoe UI,sans-serif" }}>
      {/* Top Panel */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "19px 28px 12px 28px", background: "#181e23", boxShadow: "0 1px 16px #FFD70025" }}>
        <FaShieldAlt style={{ fontSize: 30, color: "#FFD700" }} />
        <span style={{ fontSize: 22, fontWeight: 900, color: "#FFD700", letterSpacing: 1 }}>Defensive Footwork & Disruption Simulator</span>
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={runAIRisk}><FaRobot /> AI Disruption Lab</Button>
        <Button style={{ background: "#1de682", color: "#181e23" }} onClick={() => setShowExport(true)}><FaFileExport style={{ marginRight: 7 }} />Export</Button>
      </div>
      {/* Builder + Analytics */}
      <div style={{ display: "flex", gap: 38, padding: "25px 38px 0 38px", alignItems: "flex-start" }}>
        {/* Court */}
        <div style={{ background: "#232b39", borderRadius: 18, padding: "18px 19px", minWidth: 430 }}>
          <b style={{ color: "#FFD700", fontSize: 18 }}><FaBullseye style={{ marginRight: 6 }} /> Defensive Scenario Builder</b>
          <DefenseCourt defenders={defenders} attackers={attackers} setDefenders={setDefenders} activePhase={phases[step].name} rotateDefender={rotateDefender} moveBall={moveBall} selectDef={selectDef} activeDef={activeDef} />
          <FootworkPhaseTimeline phases={phases} step={step} setStep={setStep} comments={comments} setComments={setComments} />
          <div style={{ marginTop: 17 }}>
            <span style={{ color: "#FFD700", fontWeight: 900 }}>Scenario Name:</span>
            <input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Name this scenario..." style={{ fontWeight: 900, borderRadius: 7, padding: "8px 13px", marginLeft: 7 }} />
            <Button style={{ background: "#FFD700", color: "#181e23", marginLeft: 8, fontSize: 14 }} onClick={saveDrill}><FaSave /> Save</Button>
          </div>
        </div>
        {/* Analytics + Library */}
        <div style={{ flex: 1, minWidth: 350 }}>
          <DisruptionAnalytics defenders={defenders} step={step} phases={phases} />
          {/* Drill/Scenario Library */}
          <div style={{ background: "#232b39", borderRadius: 14, padding: "13px 16px", marginBottom: 14 }}>
            <b style={{ color: "#FFD700", fontSize: 16 }}><FaClipboardList style={{ marginRight: 6 }} /> Saved Scenarios</b>
            <ul>
              {savedDrills.map((s, i) =>
                <li key={i} style={{ color: "#FFD700", fontWeight: 900 }}>
                  <span style={{ marginRight: 7 }}>{s.name}</span>
                  <Button size="sm" style={{ background: "#1de682", color: "#181e23", fontSize: 13, padding: "4px 9px" }}>Load</Button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {/* AI Modal, Export */}
      <AnimatePresence>
        {showAI && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            style={{
              position: "fixed", top: 110, left: 0, right: 0, margin: "auto", width: 440, zIndex: 222,
              background: "#232b39", color: "#FFD700", borderRadius: 16, boxShadow: "0 4px 44px #FFD70044", padding: 32
            }}>
            <div style={{ fontWeight: 900, fontSize: 21, color: "#FFD700", marginBottom: 12 }}>AI Disruption Lab</div>
            <ul>
              <li>Auto-detected weak angle: <span style={{ color: "#FF4848" }}>Rotate Defender 1 +20°</span></li>
              <li>Passing Lane Risk: <span style={{ color: "#FFD700" }}>High left wing—slide coverage</span></li>
              <li>Coach Note: <span style={{ color: "#1de682" }}>Assign "Trap" in phase 4</span></li>
              <li>Player Reflection: <span style={{ color: "#1de682" }}>Add comment to Phase 2</span></li>
            </ul>
            <Button style={{ background: "#FFD700", color: "#181e23", marginTop: 17 }} onClick={() => setShowAI(false)}><FaChevronLeft /> Close</Button>
          </motion.div>
        )}
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed", top: 45, right: 45, zIndex: 120, background: "#232b39", color: "#FFD700", padding: 19, borderRadius: 12, boxShadow: "0 3px 18px #FFD70088", fontWeight: 900
            }}>
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (Full scenario PDF/analytics/feedback)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
