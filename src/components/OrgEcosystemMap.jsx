import React, { useState } from "react";
import {
  FaCrown, FaUserTie, FaUser, FaChild, FaUserMd, FaDumbbell,
  FaChartLine, FaChartPie, FaBullhorn, FaGavel, FaHeartbeat, FaRobot, FaBolt, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";
import "./OrgEcosystemMap.css";

// --- Org Structure Data ---
const ORG_NODES = [
  {
    id: "board",
    label: "BOARD OF DIRECTORS",
    icon: <FaCrown />,
    dept: "Executive",
    reportsTo: null,
    status: "Filled",
    clarity: 10
  },
  {
    id: "gm",
    label: "GENERAL MANAGER",
    icon: <FaUserTie />,
    dept: "Executive",
    reportsTo: "board",
    status: "Filled",
    clarity: 9
  },
  {
    id: "youthdir",
    label: "YOUTH DIRECTOR",
    icon: <FaChild />,
    dept: "Youth",
    reportsTo: "gm",
    status: "Filled",
    clarity: 8
  },
  {
    id: "headcoach",
    label: "HEAD COACH",
    icon: <FaUser />,
    dept: "Coaching",
    reportsTo: "gm",
    status: "Filled",
    clarity: 7
  },
  {
    id: "asstcoach",
    label: "ASSISTANT COACH",
    icon: <FaUser />,
    dept: "Coaching",
    reportsTo: "headcoach",
    status: "Filled",
    clarity: 6
  },
  {
    id: "medical",
    label: "MEDICAL",
    icon: <FaUserMd />,
    dept: "Medical",
    reportsTo: "gm",
    status: "Vacant",
    clarity: 4
  },
  {
    id: "snc",
    label: "S&C COACH",
    icon: <FaDumbbell />,
    dept: "Performance",
    reportsTo: "gm",
    status: "Filled",
    clarity: 7
  },
  {
    id: "analytics",
    label: "ANALYTICS",
    icon: <FaChartPie />,
    dept: "Analytics",
    reportsTo: "gm",
    status: "Filled",
    clarity: 8
  },
  {
    id: "marketing",
    label: "MARKETING & PR",
    icon: <FaBullhorn />,
    dept: "Marketing",
    reportsTo: "gm",
    status: "Overlapping",
    clarity: 5
  },
  {
    id: "legal",
    label: "LEGAL/COMPLIANCE",
    icon: <FaGavel />,
    dept: "Admin",
    reportsTo: "board",
    status: "Filled",
    clarity: 7
  },
  {
    id: "dataai",
    label: "DATA/AI OPS",
    icon: <FaRobot />,
    dept: "Analytics",
    reportsTo: "analytics",
    status: "At Risk",
    clarity: 4
  }
];

// Department color map
const DEPT_COLORS = {
  "Executive": "#FFD700",
  "Coaching": "#1de682",
  "Youth": "#37c6ff",
  "Medical": "#f14f63",
  "Performance": "#9d72ff",
  "Analytics": "#1e7fdc",
  "Marketing": "#ffac49",
  "Admin": "#ffffff"
};

// Status/clarity chips
const STATUS_CHIP = {
  "Filled": { color: "#1de682", icon: <FaCheckCircle /> },
  "Vacant": { color: "#FFD700", icon: <FaExclamationTriangle /> },
  "Overlapping": { color: "#FF4444", icon: <FaExclamationTriangle /> },
  "At Risk": { color: "#FF4444", icon: <FaExclamationTriangle /> }
};

// For demo: conflicts/overlaps detected
const CONFLICTS = [
  {
    node: "marketing",
    issue: "Overlapping role (shared with admin, youth, and GM). Clarity needed.",
    suggestion: "Split responsibilities, appoint a clear lead."
  },
  {
    node: "dataai",
    issue: "Role at risk (unclear reporting, high technical demand).",
    suggestion: "Define reporting line and set up external analytics support."
  },
  {
    node: "medical",
    issue: "Vacant – urgent for athlete safety.",
    suggestion: "Prioritize immediate recruitment."
  }
];

export default function OrgEcosystemMap() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [aiReply, setAIReply] = useState("");

  function handleAIclarity(node) {
    // Demo AI text
    let txt = "";
    if (node.status === "Overlapping") txt = "AI Suggestion: Split 'Marketing & PR' duties between a dedicated Marketing lead and a comms/PR lead. Reduce reporting ambiguity by defining board/GM touchpoints.";
    else if (node.status === "At Risk") txt = "AI Suggestion: Assign Data/AI Ops an experienced mentor and clarify reporting to Analytics or Board, depending on club priorities.";
    else if (node.status === "Vacant") txt = "AI Suggestion: Prioritize medical role recruitment—consider interim/part-time or local partner until filled.";
    else txt = "Role clarity acceptable. Consider periodic review of responsibilities as club grows.";
    setAIReply(txt);
  }

  // Utility: get all nodes reporting to an id
  function getReportsTo(id) {
    return ORG_NODES.filter(n => n.reportsTo === id);
  }

  return (
    <div className="orgmap-root">
      {/* Branding header */}
      <div className="orgmap-header">
        <span className="orgmap-logo"></span>
        <span className="orgmap-title">ORG ECOSYSTEM & ROLE CLARITY MAP</span>
        <span className="orgmap-sub">Elite Basketball Consulting | CourtEvo Vero</span>
      </div>
      {/* Org Map */}
      <div className="orgmap-map-stack">
        {/* Recursive render function */}
        <OrgNodeTree
          id="board"
          getReportsTo={getReportsTo}
          onNodeClick={setSelectedNode}
          selectedNode={selectedNode}
        />
      </div>
      {/* Conflict Radar */}
      <div className="orgmap-radar-card">
        <div className="orgmap-radar-head">
          <FaBolt style={{ color: "#FFD700", marginRight: 8 }} />
          <span>Role Conflict Radar</span>
        </div>
        <ul>
          {CONFLICTS.map((c, i) =>
            <li key={i}>
              <span className="orgmap-conflict-label">{ORG_NODES.find(n => n.id === c.node)?.label}</span>: {c.issue}
              <span className="orgmap-conflict-sugg">{c.suggestion}</span>
            </li>
          )}
        </ul>
      </div>
      {/* Footer/branding */}
      <div className="orgmap-footer">
        <b>Prepared for:</b> <span style={{ color: "#FFD700" }}>Zagreb Youth Basketball Club</span>
        <span style={{ marginLeft: 16, color: "#FFD700" }}>{new Date().toLocaleDateString()}</span>
      </div>
      {/* Modal / AI role clarity */}
      {selectedNode &&
        <div className="orgmap-modal-bg" onClick={() => { setSelectedNode(null); setAIReply(""); }}>
          <div className="orgmap-modal-card" onClick={e => e.stopPropagation()}>
            <div className="orgmap-modal-header">
              <span>{selectedNode.label}</span>
              <button className="orgmap-modal-close" onClick={() => { setSelectedNode(null); setAIReply(""); }}>×</button>
            </div>
            <div className="orgmap-modal-content">
              <div><b>Department:</b> <span style={{ color: DEPT_COLORS[selectedNode.dept] }}>{selectedNode.dept}</span></div>
              <div><b>Status:</b> <span style={{ color: STATUS_CHIP[selectedNode.status].color }}>{selectedNode.status}</span></div>
              <div><b>Role Clarity:</b> <span style={{ color: selectedNode.clarity >= 7 ? "#1de682" : "#FFD700" }}>{selectedNode.clarity}/10</span></div>
              <button className="orgmap-ai-btn" onClick={() => handleAIclarity(selectedNode)}>
                <FaBolt style={{ marginRight: 7 }} /> Ask AI: Role Clarity Suggestion
              </button>
              {aiReply && (
                <div className="orgmap-ai-panel">{aiReply}</div>
              )}
            </div>
          </div>
        </div>
      }
    </div>
  );
}

// --- Recursive tree ---
function OrgNodeTree({ id, getReportsTo, onNodeClick, selectedNode, depth = 0 }) {
  const node = ORG_NODES.find(n => n.id === id);
  if (!node) return null;
  const children = getReportsTo(id);
  return (
    <div className="orgmap-node-group" style={{ marginLeft: depth * 68 }}>
      <div
        className={`orgmap-node-card${selectedNode && selectedNode.id === node.id ? " active" : ""}`}
        style={{
          borderLeft: `5px solid ${DEPT_COLORS[node.dept]}`,
          background: selectedNode && selectedNode.id === node.id ? "#283238" : "#232a2e"
        }}
        onClick={() => onNodeClick(node)}
      >
        <span className="orgmap-node-icon" style={{ color: DEPT_COLORS[node.dept] }}>{node.icon}</span>
        <span className="orgmap-node-label">{node.label}</span>
        <span className="orgmap-node-status"
          style={{ background: STATUS_CHIP[node.status].color, color: "#232a2e" }}>
          {STATUS_CHIP[node.status].icon}
          {node.status}
        </span>
        <span className="orgmap-clarity-chip"
          style={{ background: node.clarity >= 7 ? "#1de682" : "#FFD700", color: "#232a2e" }}>
          {node.clarity}/10
        </span>
      </div>
      {/* Render lines for tree */}
      <div className="orgmap-node-children">
        {children.map(child =>
          <OrgNodeTree
            key={child.id}
            id={child.id}
            getReportsTo={getReportsTo}
            onNodeClick={onNodeClick}
            selectedNode={selectedNode}
            depth={depth + 1}
          />
        )}
      </div>
    </div>
  );
}
