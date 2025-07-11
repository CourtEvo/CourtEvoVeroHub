import React, { useState, useEffect } from "react";
import {
  FaHeartbeat, FaCrown, FaUserTie, FaExclamationTriangle, FaChartLine,
  FaFileExport, FaArrowUp, FaArrowDown, FaBolt, FaQuestionCircle, FaBookOpen
} from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveRadar } from "@nivo/radar";
import "./OperationalHealthDiagnostic.css";

// 1. DATA (put your full data here)
const pillarsData = [
  { id: "Governance", score: 82, weight: 0.19, trend: [76, 78, 81, 83, 82, 84], volatility: 2.1,
    subs: [ { name: "Board Composition", score: 85, risk: "Low" }, { name: "Policies", score: 75, risk: "Med" }, { name: "Transparency", score: 81, risk: "Low" } ],
    lastActions: ["Implemented new board charter (+3)", "Quarterly self-audit completed"], resource: "https://basketballconsulting.com/best-practices-governance" },
  { id: "Finance", score: 73, weight: 0.17, trend: [65, 70, 72, 75, 73, 77], volatility: 4.5,
    subs: [ { name: "Budgeting", score: 70, risk: "Med" }, { name: "Controls", score: 74, risk: "Low" }, { name: "Sponsorship", score: 80, risk: "Low" } ],
    lastActions: ["Rolled out cost-control policy", "Launched new sponsorship search"], resource: "https://basketballconsulting.com/best-practices-finance" },
  { id: "Coaching", score: 67, weight: 0.15, trend: [62, 68, 67, 66, 67, 71], volatility: 5.1,
    subs: [ { name: "Coach Dev", score: 65, risk: "High" }, { name: "CPD", score: 70, risk: "Med" } ],
    lastActions: ["Scheduled CPD clinic", "Added video feedback for all youth teams"], resource: "https://basketballconsulting.com/best-practices-coaching" },
  { id: "HR", score: 85, weight: 0.11, trend: [80, 81, 83, 84, 85, 86], volatility: 1.2,
    subs: [ { name: "Staff Development", score: 82, risk: "Low" }, { name: "Recruitment", score: 88, risk: "Low" } ],
    lastActions: ["Hired assistant GM", "Rolled out new staff dev pathway"], resource: "https://basketballconsulting.com/best-practices-hr" },
  { id: "Communication", score: 63, weight: 0.13, trend: [61, 59, 60, 62, 63, 61], volatility: 2.9,
    subs: [ { name: "Internal", score: 62, risk: "Med" }, { name: "External", score: 66, risk: "Low" } ],
    lastActions: ["Launched staff newsletter", "Revised crisis comms plan"], resource: "https://basketballconsulting.com/best-practices-communication" },
  { id: "Compliance", score: 89, weight: 0.08, trend: [87, 87, 88, 88, 89, 89], volatility: 0.6,
    subs: [ { name: "Licenses", score: 90, risk: "Low" }, { name: "Policies", score: 87, risk: "Low" } ],
    lastActions: ["Updated child protection training"], resource: "https://basketballconsulting.com/best-practices-compliance" },
  { id: "Youth", score: 76, weight: 0.09, trend: [72, 75, 75, 76, 76, 77], volatility: 1.8,
    subs: [ { name: "Talent ID", score: 77, risk: "Low" }, { name: "Development Pathway", score: 75, risk: "Med" } ],
    lastActions: ["Held U15 camp", "Added progression tracking"], resource: "https://basketballconsulting.com/best-practices-youth" },
  { id: "Facilities", score: 70, weight: 0.08, trend: [68, 68, 69, 70, 70, 71], volatility: 1.1,
    subs: [ { name: "Maintenance", score: 73, risk: "Low" }, { name: "Availability", score: 66, risk: "Med" } ],
    lastActions: ["Repaired gym floor", "Extended access hours"], resource: "https://basketballconsulting.com/best-practices-facilities" },
  { id: "Innovation", score: 61, weight: 0.08, trend: [65, 62, 62, 61, 61, 59], volatility: 3.5,
    subs: [ { name: "Tech Adoption", score: 58, risk: "High" }, { name: "Process", score: 65, risk: "Med" } ],
    lastActions: ["Tested AI scouting tool"], resource: "https://basketballconsulting.com/best-practices-innovation" }
];
const ACTION_STATUS = [
  { key: "open", label: "Open", color: "#FFD700" },
  { key: "in-progress", label: "In Progress", color: "#1de682" },
  { key: "complete", label: "Complete", color: "#b5efb0" },
  { key: "at-risk", label: "At Risk", color: "#FF4444" }
];
const OWNERS = [
  { label: "Board", icon: <FaCrown style={{ color: "#FFD700" }} /> },
  { label: "GM", icon: <FaUserTie style={{ color: "#1de682" }} /> }
];

// Overlay label configs for Radar (custom, unique color for each)
const radarLabels = [
  { text: "Governance", color: "#1de682", left: "50%", top: "-3%" },
  { text: "Finance", color: "#FFD700", left: "77%", top: "12%" },
  { text: "Coaching", color: "#FF4444", left: "96%", top: "45%" },
  { text: "HR", color: "#b5efb0", left: "77%", top: "82%" },
  { text: "Communication", color: "#fff", left: "50%", top: "99%" },
  { text: "Compliance", color: "#1de682", left: "15%", top: "80%" },
  { text: "Youth", color: "#FFD700", left: "3%", top: "45%" },
  { text: "Facilities", color: "#FF4444", left: "15%", top: "12%" },
  { text: "Innovation", color: "#b5efb0", left: "33%", top: "-4%" }
];

export default function OperationalHealthDiagnostic() {
  // === STATE HOOKS ===
  const [pillarModal, setPillarModal] = useState(null);
  const [kanbanActions, setKanbanActions] = useState([
    { id: 1, text: "Launch new coach analytics training", pillar: "Coaching", status: "in-progress", owner: "GM", deadline: "2025-08-15" },
    { id: 2, text: "Monthly board session", pillar: "Governance", status: "open", owner: "Board", deadline: "2025-07-10" },
    { id: 3, text: "Adopt AI video analysis", pillar: "Innovation", status: "open", owner: "GM", deadline: "2025-08-01" }
  ]);
  const [draggedAction, setDraggedAction] = useState(null);
  const [aiWhatIf, setAIWhatIf] = useState({ pillar: "", boost: "", result: null });
  const [aiSuggest, setAISuggest] = useState("");
  const [snapshots, setSnapshots] = useState([]);
  const [historicData, setHistoricData] = useState("");

  // === SCORE, SPARKLINE, TRENDS ===
  const weightedScore = pillarsData.reduce((sum, p) => sum + p.score * p.weight, 0).toFixed(1);
  const sparklineData = pillarsData[0].trend.map((_, i) =>
    ({ x: `P${i+1}`, y: pillarsData.reduce((sum, p) => sum + p.trend[i]*p.weight, 0).toFixed(1) })
  );
  const latestSpark = sparklineData[sparklineData.length-1];
  const prevSpark = sparklineData[sparklineData.length-2];
  const trendUp = parseFloat(latestSpark.y) > parseFloat(prevSpark.y);

  // === KANBAN: AT RISK AUTO-MOVE ===
  useEffect(() => {
    setKanbanActions(prev =>
      prev.map(a => {
        if (a.status !== "complete" && a.status !== "at-risk" && a.deadline) {
          const overdue = new Date(a.deadline) < new Date();
          if (overdue) return { ...a, status: "at-risk" };
        }
        return a;
      })
    );
  }, []);

  // === HANDLERS ===
  function handleDragStart(id) { setDraggedAction(id); }
  function handleDrop(statusKey) {
    if (draggedAction) {
      setKanbanActions(kanbanActions =>
        kanbanActions.map(a =>
          a.id === draggedAction ? { ...a, status: statusKey } : a
        )
      );
      setDraggedAction(null);
    }
  }
  function assignOwner(id, owner) {
    setKanbanActions(kanbanActions =>
      kanbanActions.map(a =>
        a.id === id ? { ...a, owner } : a
      )
    );
  }
  function handleAIWhatIf() {
    const { pillar, boost } = aiWhatIf;
    const p = pillarsData.find(p => p.id.toLowerCase() === pillar.toLowerCase());
    if (p && !isNaN(parseInt(boost))) {
      const newScore = (
        parseFloat(weightedScore) +
        p.weight * parseInt(boost)
      ).toFixed(1);
      setAIWhatIf({ ...aiWhatIf, result: newScore });
    } else {
      setAIWhatIf({ ...aiWhatIf, result: "Invalid input" });
    }
  }
  function handleAISuggest(pillar) {
    const text =
      pillar === "Communication"
        ? "1. Reestablish weekly team briefings\n2. Set up cross-functional info channels\n3. Initiate feedback survey to find root blockages"
        : "1. Conduct root cause analysis\n2. Assign rapid response task force\n3. Benchmark against top-performing peers";
    setAISuggest(text);
  }
  function saveSnapshot() {
    const comment = prompt("Snapshot comment or board action note:");
    const user = Math.random() > 0.5 ? "FaCrown" : "FaUserTie";
    setSnapshots([
      ...snapshots,
      {
        date: new Date().toLocaleString(),
        score: weightedScore,
        comment: comment || "",
        user
      }
    ]);
  }
  function handleHistoricUpload() {
    const text = prompt("Paste previous quarter weighted scores separated by commas (e.g. 68,71,75,77,80):");
    if (text) setHistoricData(text.split(",").map(s => parseFloat(s.trim())));
  }
  function openPillarModal(pillar) { setPillarModal(pillar); }
  function closePillarModal() { setPillarModal(null); }

  // === RENDER ===
  return (
    <div className="ohd-root">
      {/* HEADER */}
      <div className="ohd-header">
        <FaHeartbeat className="ohd-icon-main" />
        <span className="ohd-title">OPERATIONAL HEALTH DIAGNOSTIC SUITE</span>
        <span className="ohd-sparkline-header">
          <span className="ohd-score">
            {weightedScore}
            <span className="ohd-score-label">Weighted Score</span>
          </span>
          <span className="ohd-sparkline">
            {sparklineData.map((pt, idx) => (
              <span
                key={idx}
                className="ohd-spark-dot"
                style={{
                  background: idx === sparklineData.length-1
                    ? (trendUp ? "#1de682" : "#FF4444")
                    : "#FFD700"
                }}
              />
            ))}
            <span className="ohd-sparkline-caption">
              {trendUp ? <FaArrowUp style={{ color: "#1de682" }} /> : <FaArrowDown style={{ color: "#FF4444" }} />}
              <span style={{ color: trendUp ? "#1de682" : "#FF4444" }}>
                {Math.abs((parseFloat(latestSpark.y) - parseFloat(prevSpark.y)).toFixed(1))} pts
              </span> since last period
            </span>
          </span>
        </span>
        <span className="ohd-benchmark">
          <FaChartLine style={{ color: "#1de682", marginRight: 8 }} />
          Benchmark vs Elite
        </span>
      </div>

      {/* CLUB BRANDING */}
      <div className="ohd-brand-line">
        <b>Prepared for:</b> <span style={{ color: "#FFD700" }}>Zagreb Youth Basketball Club</span>
        <span style={{ marginLeft: 12, color: "#FFD700", fontWeight: 600 }}> {new Date().toLocaleDateString()} </span>
      </div>

      {/* HISTORICAL DATA */}
      <button className="ohd-historic-btn" onClick={handleHistoricUpload}>
        Upload Historic Scores
      </button>
      {historicData && (
        <div style={{ marginTop: 7, color: "#FFD700" }}>
          Previous scores: {historicData.join(", ")}
          <br />
          Change from first to last: <b style={{ color: (historicData[historicData.length-1] - historicData[0]) > 0 ? "#1de682" : "#FF4444" }}>
            {(historicData[historicData.length-1] - historicData[0]).toFixed(1)} pts
          </b>
        </div>
      )}

      {/* RADAR + CUSTOM LABEL OVERLAY */}
      <div style={{ position: "relative", height: 340, marginBottom: 22 }}>
        <ResponsiveRadar
          data={pillarsData.map(p => ({
            pillar: p.id,
            score: p.score
          }))}
          keys={["score"]}
          indexBy="pillar"
          maxValue={100}
          margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
          curve="linearClosed"
          borderWidth={2}
          borderColor="#FFD700"
          gridShape="linear"
          colors="#1de682"
          dotSize={6}
          dotColor="#FFD700"
          theme={{
            fontFamily: "Segoe UI, sans-serif",
            fontSize: 14,
            axis: { ticks: { text: { fill: "#232a2e", fontWeight: 700 } } }, // hide original labels
            grid: { line: { stroke: "#FFD700", strokeWidth: 1, opacity: 0.28 } },
            tooltip: { container: { background: "#232a2e", color: "#FFD700" } }
          }}
          legends={[]}
        />
        {/* Overlayed Custom Labels */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {radarLabels.map((lbl, idx) => (
            <span
              key={lbl.text}
              style={{
                position: "absolute",
                left: lbl.left,
                top: lbl.top,
                transform: "translate(-50%, -50%)",
                color: lbl.color,
                fontWeight: 900,
                fontSize: 18,
                textShadow: "1px 1px 7px #232a2e, 0 1px 6px #000"
              }}
            >{lbl.text}</span>
          ))}
        </div>
      </div>

      {/* TRENDS & ANOMALY ALERTS */}
      <div className="ohd-trend-alerts">
        {pillarsData.filter(p => {
          const t = p.trend;
          return t[t.length-1] < t[t.length-2] && t[t.length-2] < t[t.length-3];
        }).map(p =>
          <div key={p.id} className="ohd-anomaly-alert">
            <FaExclamationTriangle style={{ color: "#FF4444" }} /> {p.id} is trending down 3 periods. Board review advised!
            <button className="ohd-ai-suggest-btn" onClick={() => handleAISuggest(p.id)}>
              <FaBolt style={{ color: "#FFD700" }} /> AI: Suggest Actions for {p.id}
            </button>
          </div>
        )}
        {aiSuggest && (
          <div className="ohd-ai-suggest-panel">
            <b>AI Recommendation:</b>
            <pre style={{ color: "#FFD700", whiteSpace: "pre-wrap" }}>{aiSuggest}</pre>
          </div>
        )}
      </div>

      {/* PILLAR BAR CHART */}
      <div className="ohd-main">
        <div className="ohd-bar-card">
          <h3>Pillar Breakdown</h3>
          <div style={{ height: 260 }}>
            <ResponsiveBar
              data={pillarsData.map(p => ({ pillar: p.id, score: p.score }))}
              keys={['score']}
              indexBy="pillar"
              margin={{ top: 16, right: 12, bottom: 38, left: 40 }}
              padding={0.23}
              axisBottom={{ tickSize: 3, tickPadding: 8, tickRotation: 0 }}
              colors={b => b.data.score < 70 ? "#FF4444" : (b.data.score < 80 ? "#FFD700" : "#1de682")}
              theme={{
                fontFamily: "Segoe UI, sans-serif",
                fontSize: 15,
                textColor: "#fff",
                axis: { ticks: { text: { fill: "#fff" } }, legend: { text: { fill: "#FFD700" } } }
              }}
              enableLabel={false}
              tooltip={({ data }) =>
                <div style={{ background: "#232a2e", color: "#fff", padding: 8, borderRadius: 8 }}>
                  <b>{data.pillar}</b><br />
                  Score: <span style={{ color: "#FFD700" }}>{data.score}</span>
                </div>
              }
              onClick={bar => {
                const pillar = pillarsData.find(p => p.id === bar.data.pillar);
                openPillarModal(pillar);
              }}
            />
          </div>
        </div>
      </div>

      {/* KANBAN ACTION TRACKER */}
      <div className="ohd-kanban-board">
        {ACTION_STATUS.map(col => (
          <div
            className="ohd-kanban-col"
            key={col.key}
            style={{ borderColor: col.color }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(col.key)}
          >
            <div className="ohd-kanban-col-title" style={{ color: col.color }}>
              {col.label}
            </div>
            {kanbanActions.filter(a => a.status === col.key).map(a =>
              <div
                key={a.id}
                className="ohd-kanban-card"
                draggable
                onDragStart={() => handleDragStart(a.id)}
                style={{
                  background: col.key === "at-risk" ? "#FF4444" : "#232a2e",
                  color: col.key === "at-risk" ? "#fff" : "#FFD700",
                  borderLeft: `4px solid ${col.color}`
                }}
              >
                <div className="ohd-kanban-owner">
                  Owner:
                  <span style={{ marginLeft: 4, marginRight: 7 }}>
                    {OWNERS.find(o => o.label === a.owner)?.icon}
                    {a.owner}
                  </span>
                  <select
                    className="ohd-owner-select"
                    value={a.owner}
                    onChange={e => assignOwner(a.id, e.target.value)}
                  >
                    {OWNERS.map(o => (
                      <option key={o.label} value={o.label}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div><b>{a.text}</b></div>
                <div>Pillar: <span style={{ color: "#1de682" }}>{a.pillar}</span></div>
                <div>
                  Deadline: <span style={{ color: "#FFD700" }}>{a.deadline}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI WHAT IF ENGINE */}
      <div className="ohd-aiwhatif-card">
        <h3>
          <FaBolt style={{ color: "#1de682" }} /> AI What-If Boardroom Engine
        </h3>
        <div>
          <input
            className="ohd-ai-input"
            type="text"
            placeholder="Pillar (e.g. Innovation)"
            value={aiWhatIf.pillar}
            onChange={e => setAIWhatIf({ ...aiWhatIf, pillar: e.target.value })}
          />
          <input
            className="ohd-ai-input"
            type="number"
            placeholder="Boost Amount (e.g. 12)"
            value={aiWhatIf.boost}
            onChange={e => setAIWhatIf({ ...aiWhatIf, boost: e.target.value })}
            style={{ marginLeft: 7 }}
          />
          <button className="ohd-ai-btn" onClick={handleAIWhatIf}>Simulate</button>
        </div>
        {aiWhatIf.result && (
          <div className="ohd-ai-result">
            New Weighted Score: <b style={{ color: "#FFD700" }}>{aiWhatIf.result}</b>
          </div>
        )}
      </div>

      {/* SNAPSHOT BUTTONS */}
      <button className="ohd-snapshot-btn" onClick={saveSnapshot}>
        <FaFileExport style={{ marginRight: 7 }} />
        Save Board Snapshot
      </button>

      {/* SNAPSHOT LOG */}
      <div className="ohd-snapshot-log">
        <h3>Snapshot & Audit Log</h3>
        <ul>
          {snapshots.map((s, i) => (
            <li key={i}>
              <span className="ohd-timeline-user">
                {s.user === "FaCrown" ? <FaCrown /> : <FaUserTie />}
              </span>
              <span className="ohd-timeline-date">{s.date}</span>
              <span className="ohd-timeline-text">Score: <b>{s.score}</b> {s.comment && `– ${s.comment}`}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* PILLAR DRILL-DOWN MODAL */}
      {pillarModal &&
        <div className="ohd-modal-bg" onClick={closePillarModal}>
          <div className="ohd-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ohd-modal-header">
              <span className="ohd-modal-title">
                <FaBookOpen style={{ color: "#FFD700", marginRight: 7 }} />
                {pillarModal.id} Deep Dive
              </span>
              <button className="ohd-modal-close" onClick={closePillarModal}>×</button>
            </div>
            <div className="ohd-modal-content">
              <div className="ohd-modal-section">
                <b>Weighted Score:</b> <span style={{ color: "#FFD700" }}>{pillarModal.score}</span>
              </div>
              <div className="ohd-modal-section">
                <b>Sub-Areas:</b>
                <ul>
                  {pillarModal.subs.map((s, i) =>
                    <li key={i}>
                      <span className="ohd-pill" style={{
                        background: s.score < 70 ? "#FF4444" : (s.score < 80 ? "#FFD700" : "#1de682"),
                        color: "#232a2e"
                      }}>{s.name}: {s.score}</span>
                      <span className="ohd-sub-risk">{s.risk} risk</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="ohd-modal-section">
                <b>Recent Board Actions:</b>
                <ul>
                  {pillarModal.lastActions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
              <div className="ohd-modal-section">
                <b>Volatility:</b> <span style={{ color: "#1de682" }}>{pillarModal.volatility}</span>
              </div>
              <div className="ohd-modal-section">
                <a href={pillarModal.resource} target="_blank" rel="noopener noreferrer" className="ohd-resource-link">
                  <FaQuestionCircle style={{ marginRight: 6 }} />
                  Best Practice: Improve {pillarModal.id}
                </a>
              </div>
              <div className="ohd-modal-section ohd-modal-qna">
                <b>Boardroom Q&A:</b>
                <div className="ohd-qna-box">
                  <textarea rows={3} placeholder="Ask a question or add insight (board/GM only)" />
                  <button className="ohd-qna-submit">Submit Q&A</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}
