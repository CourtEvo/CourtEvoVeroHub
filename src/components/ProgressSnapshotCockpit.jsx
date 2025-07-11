import React, { useState } from "react";
import {
  FaChartLine, FaCrown, FaUserTie, FaBolt, FaExclamationTriangle,
  FaRegCheckCircle, FaRegClock, FaFileExport, FaHeartbeat
} from "react-icons/fa";
import "./ProgressSnapshotCockpit.css";

// Mock Data
const PROJECTS = [
  {
    id: 1,
    name: "AI Video Analytics Rollout",
    pillar: "Innovation",
    status: "In Progress",
    start: "2025-06-01",
    end: "2025-09-10",
    owner: "GM",
    impact: 7,
    milestones: [
      { name: "Vendor Selected", date: "2025-06-15", complete: true },
      { name: "First Team Pilot", date: "2025-07-10", complete: false },
      { name: "Club-wide Deployment", date: "2025-09-10", complete: false }
    ],
    dependencies: [],
    risk: "Amber",
    history: [
      { date: "2025-06-15", text: "Vendor approved by board." }
    ]
  },
  {
    id: 2,
    name: "Coach CPD Upgrade",
    pillar: "Coaching",
    status: "Delayed",
    start: "2025-05-10",
    end: "2025-08-01",
    owner: "Board",
    impact: 5,
    milestones: [
      { name: "Needs Analysis", date: "2025-05-15", complete: true },
      { name: "Curriculum Finalized", date: "2025-06-20", complete: false }
    ],
    dependencies: [],
    risk: "Red",
    history: [
      { date: "2025-05-20", text: "Analysis completed." },
      { date: "2025-06-22", text: "Curriculum review delayed by holidays." }
    ]
  },
  {
    id: 3,
    name: "Governance Policy Refresh",
    pillar: "Governance",
    status: "On Track",
    start: "2025-04-01",
    end: "2025-07-20",
    owner: "Board",
    impact: 6,
    milestones: [
      { name: "Draft Complete", date: "2025-05-10", complete: true },
      { name: "Legal Review", date: "2025-06-15", complete: false },
      { name: "Board Approval", date: "2025-07-20", complete: false }
    ],
    dependencies: [2],
    risk: "Green",
    history: [
      { date: "2025-05-10", text: "Draft circulated." }
    ]
  }
];

const PILLAR_COLORS = {
  "Innovation": "#1de682",
  "Coaching": "#FFD700",
  "Governance": "#FF4444",
  "HR": "#b5efb0",
  "Communication": "#fff",
  "Compliance": "#FFD700",
  "Youth": "#FFD700",
  "Facilities": "#b5efb0"
};
const RAG = {
  "Green": { color: "#1de682", label: "On Track", icon: <FaRegCheckCircle /> },
  "Amber": { color: "#FFD700", label: "Delayed", icon: <FaRegClock /> },
  "Red": { color: "#FF4444", label: "Critical", icon: <FaExclamationTriangle /> }
};
const OWNER_ICONS = {
  "Board": <FaCrown style={{ color: "#FFD700", marginRight: 2 }} />,
  "GM": <FaUserTie style={{ color: "#1de682", marginRight: 2 }} />
};

export default function ProgressSnapshotCockpit() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [aiForecast, setAIForecast] = useState("");
  const [snapshots, setSnapshots] = useState([]);

  // Timeline axis range
  const timelineMin = Math.min(...PROJECTS.map(p => new Date(p.start)));
  const timelineMax = Math.max(...PROJECTS.map(p => new Date(p.end)));

  function getPos(date) {
    const min = new Date(timelineMin);
    const max = new Date(timelineMax);
    const pos = (new Date(date) - min) / (max - min) * 100;
    return `${pos}%`;
  }

  function askAI(project) {
    let forecast, advice;
    if (project.status === "Delayed") {
      forecast = "2025-08-20";
      advice = "Project at risk. Recommend board intervention and adding resources.";
    } else if (project.status === "On Track") {
      forecast = project.end;
      advice = "On track. Maintain current oversight.";
    } else {
      forecast = "2025-09-10";
      advice = "Monitor milestone progress closely.";
    }
    setAIForecast(
      `AI Progress Forecast:
Expected Completion: ${forecast}
Status: ${RAG[project.risk].label}
Advice: ${advice}`
    );
  }

  function saveSnapshot() {
    const note = prompt("Optional: snapshot note?");
    setSnapshots([
      ...snapshots,
      {
        date: new Date().toLocaleString(),
        projects: PROJECTS.map(p => ({ name: p.name, status: p.status, owner: p.owner })),
        note
      }
    ]);
  }

  return (
    <div className="psc-root">
      {/* Header */}
      <div className="psc-header">
        <FaChartLine style={{ color: "#FFD700", fontSize: 38, marginRight: 17 }} />
        <span className="psc-title">PROGRESS SNAPSHOT COCKPIT</span>
        <span className="psc-sub">Executive Project Timeline & Impact</span>
        <button className="psc-snapshot-btn" onClick={saveSnapshot}>
          <FaFileExport style={{ marginRight: 7 }} /> Save Progress Snapshot
        </button>
      </div>
      {/* Timeline Axis */}
      <div className="psc-timeline-axis-row">
        <span />
        <div className="psc-timeline-axis-main">
          {[...Array(6)].map((_, i) => {
            const dt = new Date(timelineMin + ((timelineMax-timelineMin)/5) * i);
            return <span key={i}>{dt.toLocaleDateString('en-GB', {month:'short', day:'2-digit'})}</span>;
          })}
        </div>
      </div>
      {/* Project lanes */}
      <div className="psc-lane-stack">
        {PROJECTS.map((p, idx) => (
          <div key={p.id} className="psc-lane-card" onClick={() => setSelectedProject(p)}>
            <div className="psc-lane-head">
              <span className="psc-lane-badge" style={{ background: PILLAR_COLORS[p.pillar] }}>{p.pillar}</span>
              <span className="psc-lane-title">{p.name}</span>
              <span className="psc-lane-owner">{OWNER_ICONS[p.owner]}{p.owner}</span>
              <span className="psc-lane-status" style={{ background: RAG[p.risk].color }}>{RAG[p.risk].label}</span>
              <span className="psc-impact-chip" style={{ background: "#222", color: p.impact > 0 ? "#1de682" : "#FF4444" }}>
                <FaHeartbeat style={{ marginRight: 3 }} />
                {p.impact > 0 ? "+" : ""}{p.impact}
              </span>
            </div>
            <div className="psc-timeline-barwrap">
              {/* Timeline bar */}
              <div
                className="psc-timeline-bar"
                style={{
                  left: getPos(p.start),
                  width: `calc(${getPos(p.end)} - ${getPos(p.start)})`,
                  background: `linear-gradient(90deg, ${PILLAR_COLORS[p.pillar]}, #232a2e 98%)`
                }}
              />
              {/* Milestones under bar */}
              {p.milestones.map((m, i) => (
                <div
                  key={i}
                  className={`psc-milestone-dot${m.complete ? " complete" : ""}`}
                  style={{ left: getPos(m.date) }}
                  title={m.name}
                />
              ))}
            </div>
            {/* Milestone labels below */}
            <div className="psc-milestone-label-row">
              {p.milestones.map((m, i) => (
                <span
                  key={i}
                  className="psc-milestone-label"
                  style={{ left: getPos(m.date) }}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Progress Prediction Panel */}
      {selectedProject &&
        <div className="psc-modal-bg" onClick={() => setSelectedProject(null)}>
          <div className="psc-modal-card" onClick={e => e.stopPropagation()}>
            <div className="psc-modal-header">
              <span style={{ fontWeight: 700 }}>{selectedProject.name}</span>
              <button className="psc-modal-close" onClick={() => setSelectedProject(null)}>×</button>
            </div>
            <div className="psc-modal-content">
              <div><b>Pillar:</b> <span style={{ color: PILLAR_COLORS[selectedProject.pillar] }}>{selectedProject.pillar}</span></div>
              <div><b>Status:</b> <span style={{ color: RAG[selectedProject.risk].color }}>{RAG[selectedProject.risk].label}</span></div>
              <div><b>Owner:</b> {OWNER_ICONS[selectedProject.owner]}{selectedProject.owner}</div>
              <div><b>Timeline:</b> {selectedProject.start} to {selectedProject.end}</div>
              <div><b>Milestones:</b>
                <ul>
                  {selectedProject.milestones.map((m, i) =>
                    <li key={i}>
                      <span className={`psc-milestone-dot${m.complete ? " complete" : ""}`} style={{ position: "relative", left: 0 }} />{" "}
                      {m.name} ({m.date}) {m.complete ? "✓" : ""}
                    </li>
                  )}
                </ul>
              </div>
              <div><b>History:</b>
                <ul>
                  {selectedProject.history.map((h, i) =>
                    <li key={i}><span style={{ color: "#FFD700" }}>{h.date}:</span> {h.text}</li>
                  )}
                </ul>
              </div>
              <div style={{ marginTop: 16 }}>
                <button className="psc-ai-btn" onClick={() => askAI(selectedProject)}>
                  <FaBolt style={{ marginRight: 7 }} /> Ask AI: Forecast Progress
                </button>
                {aiForecast && (
                  <div className="psc-ai-panel">
                    <pre style={{ color: "#FFD700", whiteSpace: "pre-wrap" }}>{aiForecast}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      }

      {/* Progress Snapshots/Audit Log */}
      <div className="psc-snapshot-log">
        <h3>Progress Snapshots (Audit Log)</h3>
        <ul>
          {snapshots.map((snap, idx) => (
            <li key={idx}>
              <span className="psc-snap-date">{snap.date}</span>
              <span className="psc-snap-note">{snap.note ? `– ${snap.note}` : ""}</span>
              <ul className="psc-snap-projlist">
                {snap.projects.map((proj, i) =>
                  <li key={i}>
                    <span style={{ color: "#FFD700" }}>{proj.name}</span>
                    {" – "}
                    <span style={{ color: "#fff" }}>{proj.status}</span>
                    {" | "}
                    <span style={{ color: "#1de682" }}>{proj.owner}</span>
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
