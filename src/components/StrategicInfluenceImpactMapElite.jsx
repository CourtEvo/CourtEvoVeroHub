import React, { useState } from "react";
import {
  FaProjectDiagram, FaUsers, FaMoneyBillWave, FaCity, FaUserTie, FaHandshake, FaChartLine, FaPowerOff, FaComments, FaPlus, FaTrash, FaLightbulb, FaArrowRight, FaTag, FaExclamationTriangle, FaCheckCircle
} from "react-icons/fa";

// NODES: type, label, health, sentiment, energy, group, etc.
const DEFAULT_NODES = [
  { id: 1, type: "Board", label: "President", group: "Internal", health: 9, sentiment: 8, energy: 7 },
  { id: 2, type: "Sponsor", label: "Erste Bank", group: "Sponsor", health: 8, sentiment: 7, energy: 6 },
  { id: 3, type: "City Official", label: "Mayor", group: "External", health: 7, sentiment: 5, energy: 5 },
  { id: 4, type: "Media", label: "Sports TV", group: "External", health: 8, sentiment: 6, energy: 4 },
  { id: 5, type: "Alumni", label: "Ex-Player (Cro)", group: "Alumni", health: 6, sentiment: 4, energy: 2 },
  { id: 6, type: "Parent", label: "U16 Parent", group: "Community", health: 8, sentiment: 8, energy: 7 }
];

// EDGES: from, to, type, strength, action plan
const DEFAULT_EDGES = [
  { from: 1, to: 2, type: "Financial", strength: 9, action: "Renewal negotiation", owner: "CFO" },
  { from: 1, to: 3, type: "Political", strength: 6, action: "Lobby for facilities", owner: "President" },
  { from: 3, to: 4, type: "Media", strength: 7, action: "Public relations", owner: "PR" },
  { from: 4, to: 5, type: "Reputation", strength: 5, action: "Promote alumni event", owner: "Marketing" },
  { from: 2, to: 6, type: "Community", strength: 7, action: "Sponsor youth day", owner: "Sponsorship" },
];

// ICONS by type
const ICONS = {
  "Board": <FaUserTie color="#FFD700" />,
  "Sponsor": <FaMoneyBillWave color="#1de682" />,
  "City Official": <FaCity color="#62d6ff" />,
  "Media": <FaComments color="#ffd700" />,
  "Alumni": <FaHandshake color="#FFD700" />,
  "Parent": <FaUsers color="#ffe066" />,
  "Coach": <FaChartLine color="#1de682" />,
  "Player": <FaUserTie color="#FFD700" />
};

const groupColors = {
  "Internal": "#FFD700",
  "Sponsor": "#1de682",
  "External": "#62d6ff",
  "Alumni": "#FFD70077",
  "Community": "#ffe066"
};

function getNodeColor(node) {
  if (node.health <= 4) return "#ff4848";
  if (node.health <= 6) return "#FFD700";
  return "#1de682";
}

function getEdgeColor(edge) {
  if (edge.strength >= 8) return "#FFD700";
  if (edge.strength >= 6) return "#1de682";
  return "#FFD70088";
}

// MAIN COMPONENT
const StrategicInfluenceImpactMapElite = () => {
  const [nodes, setNodes] = useState([...DEFAULT_NODES]);
  const [edges, setEdges] = useState([...DEFAULT_EDGES]);
  const [addMode, setAddMode] = useState(false);
  const [newNode, setNewNode] = useState({ label: "", type: "Sponsor", group: "Sponsor", health: 7, sentiment: 7, energy: 7 });
  const [newEdge, setNewEdge] = useState({ from: 1, to: 2, type: "Financial", strength: 6, action: "", owner: "" });
  const [editNode, setEditNode] = useState(null);
  const [editEdge, setEditEdge] = useState(null);
  const [selected, setSelected] = useState(null);
  const [scenarioNode, setScenarioNode] = useState(null);
  const [scenarioMsg, setScenarioMsg] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [actionOwner, setActionOwner] = useState("");
  const [actionTag, setActionTag] = useState("");
  const [log, setLog] = useState([{ by: "Board", txt: "Simulated loss of mayor node—risk cascaded to facilities, sponsor.", date: "2024-06-11", tags: ["scenario", "external"] }]);
  const [logText, setLogText] = useState("");
  const [logTag, setLogTag] = useState("");

  // Network visual (SVG force map)
  function layoutNodes(nodes, centerX = 330, centerY = 220, radius = 160) {
    const angleStep = (2 * Math.PI) / nodes.length;
    return nodes.map((node, idx) => ({
      ...node,
      x: centerX + radius * Math.cos(idx * angleStep),
      y: centerY + radius * Math.sin(idx * angleStep)
    }));
  }
  const laidOut = layoutNodes(nodes);

  // Add node/edge
  const addNode = () => {
    setNodes([...nodes, { ...newNode, id: nodes.length ? Math.max(...nodes.map(n => n.id)) + 1 : 1 }]);
    setAddMode(false);
    setNewNode({ label: "", type: "Sponsor", group: "Sponsor", health: 7, sentiment: 7, energy: 7 });
  };
  const addEdge = () => {
    if (!newEdge.from || !newEdge.to || newEdge.from === newEdge.to) return;
    setEdges([...edges, { ...newEdge }]);
    setNewEdge({ from: nodes[0]?.id, to: nodes[1]?.id, type: "Financial", strength: 6, action: "", owner: "" });
  };
  const removeNode = id => {
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(e => e.from !== id && e.to !== id));
  };
  const removeEdge = idx => setEdges(edges.filter((_, i) => i !== idx));

  // Action plan
  const setNodeAction = id => {
    setNodes(nodes.map(n => n.id === id ? { ...n, actionPlan: actionPlan, actionOwner: actionOwner, actionTag: actionTag } : n));
    setActionPlan(""); setActionOwner(""); setActionTag("");
  };

  // Scenario simulation
  const runScenario = id => {
    setScenarioNode(id);
    let impact = edges.filter(e => e.from === id || e.to === id).length;
    let msg = impact > 2
      ? "Removal would cascade risk to multiple domains (see red edges)."
      : "Removal is contained, but watch indirect flows.";
    setScenarioMsg(msg);
    setLog([...log, {
      by: "Board", txt: `Simulated scenario: removal of node ${nodes.find(n => n.id === id)?.label}. ${msg}`,
      date: new Date().toISOString().slice(0, 10), tags: ["scenario"]
    }]);
  };
  const resetScenario = () => { setScenarioNode(null); setScenarioMsg(""); };

  // Board log
  const addLog = () => {
    if (!logText.trim()) return;
    setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10), tags: (logTag ? logTag.split(",").map(x => x.trim()) : []) }]);
    setLogText(""); setLogTag("");
  };

  // --- UI ---
  return (
    <div style={{ background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1550, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <FaProjectDiagram size={32} color="#FFD700" />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: "#FFD700", letterSpacing: 2, margin: 0 }}>
          Strategic Influence Impact Map
        </h2>
        <span style={{ background: "#FFD700", color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | System Power
        </span>
      </div>
      {/* Visual Map */}
      <div style={{ marginBottom: 17, background: "#181e23", borderRadius: 20, position: "relative", padding: 8, minHeight: 460, overflow: "auto" }}>
        <svg width={680} height={440}>
          {/* Edges */}
          {edges.map((e, idx) => {
            let from = laidOut.find(n => n.id === e.from);
            let to = laidOut.find(n => n.id === e.to);
            if (!from || !to) return null;
            let isRed = scenarioNode && (e.from === scenarioNode || e.to === scenarioNode);
            return (
              <g key={idx}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isRed ? "#ff4848" : getEdgeColor(e)}
                  strokeWidth={isRed ? 7 : 4}
                  opacity={0.82}
                  markerEnd="url(#arrowhead)"
                />
                <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} fill="#FFD700" fontSize={13} textAnchor="middle">
                  {e.type}
                </text>
                <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 + 14} fill="#FFD70099" fontSize={11} textAnchor="middle">
                  {e.action}
                </text>
              </g>
            );
          })}
          {/* Arrowhead marker */}
          <defs>
            <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="3" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 7 3.5, 0 7" fill="#FFD700" />
            </marker>
          </defs>
          {/* Nodes */}
          {laidOut.map((node, idx) => (
            <g key={node.id} onClick={() => setSelected(idx)} style={{ cursor: "pointer" }}>
              <circle
                cx={node.x} cy={node.y} r={42}
                fill={getNodeColor(node)}
                stroke={scenarioNode === node.id ? "#ff4848" : groupColors[node.group] || "#FFD700"}
                strokeWidth={scenarioNode === node.id ? 9 : 6}
                opacity={0.91}
              />
              <text x={node.x} y={node.y - 20} fill="#232a2e" fontWeight={900} fontSize={15} textAnchor="middle">{ICONS[node.type] || <FaUserTie />}</text>
              <text x={node.x} y={node.y + 7} fill="#232a2e" fontWeight={900} fontSize={15} textAnchor="middle">{node.label}</text>
              {/* Animated pulses */}
              <circle
                cx={node.x} cy={node.y} r={24}
                fill="none" stroke="#FFD70044" strokeWidth={node.energy} opacity={0.25 + 0.04 * node.energy}
              />
              {/* Pulse bar (energy/sentiment) */}
              <rect
                x={node.x - 18} y={node.y + 22}
                width={node.energy * 6} height={7}
                fill="#FFD700" opacity={0.7}
                rx={3}
              />
              <rect
                x={node.x - 18} y={node.y + 32}
                width={node.sentiment * 6} height={5}
                fill="#1de682" opacity={0.7}
                rx={2}
              />
            </g>
          ))}
        </svg>
      </div>
      {/* Node/edge details & scenario */}
      {selected !== null && (
        <div style={{ marginBottom: 15, background: "#283E51", borderRadius: 13, padding: 14 }}>
          <b style={{ color: "#FFD700" }}>Node:</b> {nodes[selected]?.label} ({nodes[selected]?.type})<br />
          <span style={{ color: "#FFD70099" }}>Health: {nodes[selected].health} | Sentiment: {nodes[selected].sentiment} | Energy: {nodes[selected].energy} | Group: {nodes[selected].group}</span><br />
          <span style={{ color: "#FFD70099" }}>Current Action Plan: {nodes[selected].actionPlan || "-"}</span><br />
          <span style={{ color: "#FFD70099" }}>Action Owner: {nodes[selected].actionOwner || "-"}</span>
          <div style={{ marginTop: 5 }}>
            <input value={actionPlan} placeholder="Set action plan..." onChange={e => setActionPlan(e.target.value)} style={inputStyleMini} />
            <input value={actionOwner} placeholder="Owner..." onChange={e => setActionOwner(e.target.value)} style={inputStyleMini} />
            <input value={actionTag} placeholder="Tags..." onChange={e => setActionTag(e.target.value)} style={inputStyleMini} />
            <button onClick={() => setNodeAction(nodes[selected].id)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginLeft: 7 }}>Save</button>
          </div>
          <button onClick={() => setSelected(null)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 7 }}>Close</button>
          <button onClick={() => runScenario(nodes[selected].id)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", marginLeft: 7 }}>Scenario Simulate</button>
          <button onClick={() => removeNode(nodes[selected].id)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", marginLeft: 7 }}>Remove Node</button>
        </div>
      )}
      {scenarioNode &&
        <div style={{ background: "#181e23", color: "#FFD700", padding: 15, borderRadius: 12, marginBottom: 13 }}>
          <b>Scenario Simulation:</b> Node <span style={{ color: "#FFD700", fontWeight: 700 }}>{nodes.find(n => n.id === scenarioNode)?.label}</span>
          <div style={{ marginTop: 6 }}>{scenarioMsg}</div>
          <button onClick={resetScenario} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 7 }}><FaArrowRight /> Close</button>
        </div>
      }
      {/* Node/Edge CRUD */}
      <div style={{ display: "flex", gap: 12, marginBottom: 17 }}>
        <div style={{ background: "#232a2e", borderRadius: 12, padding: 11, flex: 1 }}>
          <b style={{ color: "#FFD700" }}><FaUsers /> Nodes</b><br />
          <input value={newNode.label} placeholder="Label" onChange={e => setNewNode({ ...newNode, label: e.target.value })} style={inputStyleMini} />
          <select value={newNode.type} onChange={e => setNewNode({ ...newNode, type: e.target.value })} style={inputStyleMini}>
            <option>Board</option><option>Sponsor</option><option>City Official</option><option>Media</option><option>Alumni</option><option>Parent</option><option>Coach</option><option>Player</option>
          </select>
          <select value={newNode.group} onChange={e => setNewNode({ ...newNode, group: e.target.value })} style={inputStyleMini}>
            <option>Internal</option><option>Sponsor</option><option>External</option><option>Alumni</option><option>Community</option>
          </select>
          <input value={newNode.health} type="number" min={1} max={10} placeholder="Health" onChange={e => setNewNode({ ...newNode, health: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newNode.sentiment} type="number" min={1} max={10} placeholder="Sentiment" onChange={e => setNewNode({ ...newNode, sentiment: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newNode.energy} type="number" min={1} max={10} placeholder="Energy" onChange={e => setNewNode({ ...newNode, energy: Number(e.target.value) })} style={inputStyleMini} />
          <button onClick={addNode} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 7 }}><FaPlus /> Add Node</button>
        </div>
        <div style={{ background: "#232a2e", borderRadius: 12, padding: 11, flex: 1 }}>
          <b style={{ color: "#FFD700" }}><FaProjectDiagram /> Edges</b><br />
          <select value={newEdge.from} onChange={e => setNewEdge({ ...newEdge, from: Number(e.target.value) })} style={inputStyleMini}>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <select value={newEdge.to} onChange={e => setNewEdge({ ...newEdge, to: Number(e.target.value) })} style={inputStyleMini}>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <select value={newEdge.type} onChange={e => setNewEdge({ ...newEdge, type: e.target.value })} style={inputStyleMini}>
            <option>Financial</option><option>Political</option><option>Media</option><option>Community</option><option>Reputation</option>
          </select>
          <input value={newEdge.strength} type="number" min={1} max={10} placeholder="Strength" onChange={e => setNewEdge({ ...newEdge, strength: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newEdge.action} placeholder="Action" onChange={e => setNewEdge({ ...newEdge, action: e.target.value })} style={inputStyleMini} />
          <input value={newEdge.owner} placeholder="Owner" onChange={e => setNewEdge({ ...newEdge, owner: e.target.value })} style={inputStyleMini} />
          <button onClick={addEdge} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 7 }}><FaPlus /> Add Edge</button>
        </div>
      </div>
      {/* Boardroom Log */}
      <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, marginBottom: 5 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaComments style={{ marginRight: 7 }} /> Boardroom Log</div>
        <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
          {log.map((c, i) =>
            <div key={i}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt}
              {(c.tags || []).length > 0 && <span style={{ color: "#FFD70099", marginLeft: 6 }}>[{c.tags.join(", ")}]</span>}
              <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={logText} placeholder="Add board note or action..." onChange={e => setLogText(e.target.value)} style={inputStyleFull} />
          <input value={logTag} placeholder="Tags (comma separated)" onChange={e => setLogTag(e.target.value)} style={inputStyleMini} />
          <button onClick={addLog} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1px solid #FFD70077", fontSize: 15, width: 110
};
const inputStyleFull = {
  ...inputStyle, width: 220
};
const inputStyleMini = {
  ...inputStyle, width: 70, fontSize: 14, marginRight: 0, marginBottom: 2
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default StrategicInfluenceImpactMapElite;
