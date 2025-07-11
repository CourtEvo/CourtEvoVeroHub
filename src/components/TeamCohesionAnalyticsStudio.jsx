import React, { useState } from "react";
import { FaUsers, FaChartLine, FaComments, FaBullseye, FaRobot, FaUserFriends, FaUserTie, FaExclamationTriangle, FaFileExport,
     FaLink, FaUserPlus, FaChevronLeft, FaTrashAlt, FaCommentDots } from "react-icons/fa";
import { MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

// Button
function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg,#1de682 60%,#FFD700 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "11px 18px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #1de68233"
    }} {...props}>{children}</button>
  );
}

const demoPlayers = [
  { id: 1, name: "Luka", role: "PG", x: 210, y: 70, influence: 8, color: "#FFD700" },
  { id: 2, name: "Ivan", role: "SG", x: 110, y: 140, influence: 6, color: "#1de682" },
  { id: 3, name: "Tomislav", role: "C", x: 340, y: 170, influence: 7, color: "#FF4848" },
  { id: 4, name: "Borna", role: "PF", x: 220, y: 180, influence: 5, color: "#3faeff" },
  { id: 5, name: "Edi", role: "SF", x: 80, y: 90, influence: 4, color: "#FFD700" }
];
const demoLinks = [
  { from: 1, to: 2, type: "trust" }, { from: 1, to: 4, type: "mentor" },
  { from: 2, to: 5, type: "friend" }, { from: 3, to: 4, type: "rival" },
  { from: 4, to: 5, type: "mentor" }, { from: 2, to: 3, type: "trust" }
];
const influenceColors = { trust: "#FFD700", mentor: "#1de682", friend: "#3faeff", rival: "#FF4848" };

// Pulse history for animated line chart
function PulseTrend({ pulseHistory }) {
  if (pulseHistory.length < 2) return null;
  // Normalize
  const min = Math.min(...pulseHistory.map(p => +p.score));
  const max = Math.max(...pulseHistory.map(p => +p.score));
  const w = 180, h = 48;
  const pts = pulseHistory.map((p, i) => [
    (w / (pulseHistory.length - 1)) * i,
    h - (((+p.score - min) / (max - min + 0.1)) * (h - 18)) - 8
  ]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  return (
    <svg width={w} height={h} style={{ marginLeft: 18, marginTop: 3 }}>
      <path d={path} fill="none" stroke="#1de682" strokeWidth={3.5} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={pulseHistory[i].score >= pulseHistory[i - 1]?.score ? "#1de682" : "#FF4848"} />
      ))}
    </svg>
  );
}

// Social Graph (nodes/links)
function SocialGraph({ players, links, setPlayers, setLinks, selected, setSelected, lastRipple }) {
  // Drag player nodes
  function handleDrag(idx, e) {
    const svg = e.target.ownerSVGElement;
    function move(ev) {
      setPlayers(ps => ps.map((p, i) =>
        i === idx
          ? { ...p, x: ev.clientX - svg.getBoundingClientRect().left, y: ev.clientY - svg.getBoundingClientRect().top }
          : p
      ));
    }
    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }
  return (
    <svg width={460} height={290} style={{ background: "#222e39", borderRadius: 18, boxShadow: "0 2px 18px #1de68233", marginBottom: 7 }}>
      {/* Ripple effect for scenario */}
      {lastRipple && (
        <ellipse cx={lastRipple.x} cy={lastRipple.y} rx={45 + lastRipple.delta * 8} ry={27 + lastRipple.delta * 6} fill="#FFD700" opacity={0.23} />
      )}
      {/* Links */}
      {links.map((l, i) => {
        const from = players.find(p => p.id === l.from);
        const to = players.find(p => p.id === l.to);
        if (!from || !to) return null;
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={influenceColors[l.type] || "#FFD700"} strokeWidth={5}
              opacity={l.type === "rival" ? 0.34 : 0.74} />
            <FaLink x={from.x + (to.x - from.x) / 2 - 6} y={from.y + (to.y - from.y) / 2 - 6}
              color={influenceColors[l.type] || "#FFD700"} size={14} />
          </g>
        );
      })}
      {/* Nodes */}
      {players.map((p, idx) => (
        <g key={p.id}
          style={{ cursor: "pointer" }}
          onClick={() => setSelected(p.id)}
          onMouseDown={e => handleDrag(idx, e)}>
          <circle cx={p.x} cy={p.y} r={28} fill={selected === p.id ? "#1de682" : p.color} stroke="#FFD700" strokeWidth={selected === p.id ? 7 : 3} />
          <text x={p.x} y={p.y + 6} textAnchor="middle" fontWeight="bold" fontSize={15} fill={selected === p.id ? "#232b39" : "#232b39"}>{p.name}</text>
          <text x={p.x} y={p.y + 32} textAnchor="middle" fontWeight="bold" fontSize={12} fill="#1de682">{p.role}</text>
        </g>
      ))}
    </svg>
  );
}

// Cohesion Analytics (cliques, bridges, isolates, hidden leaders)
function CohesionAnalytics({ players, links, log, setLog }) {
  const cohesionScore = Math.round(70 + links.length * 3 - players.length * 1.5);
  const isolated = players.filter(p => !links.find(l => l.from === p.id || l.to === p.id));
  const glue = players.filter(p =>
    links.filter(l => l.from === p.id || l.to === p.id).length > 2 && p.influence > 6
  );
  const negative = players.filter(p => links.filter(l => (l.from === p.id || l.to === p.id) && l.type === "rival").length > 1);
  const bridges = players.filter(p =>
    links.filter(l => l.from === p.id || l.to === p.id).length > 0 && links.filter(l => l.from === p.id || l.to === p.id).some(l => influenceColors[l.type] !== "#FF4848")
  );
  // Logging events (module log)
  function logEvent(text) { setLog(lg => [...lg, { ts: new Date().toLocaleTimeString(), text }]); }
  return (
    <div style={{ background: "#232b39", borderRadius: 14, padding: "17px 18px", marginBottom: 13 }}>
      <b style={{ color: "#FFD700", fontSize: 17 }}><FaChartLine style={{ marginRight: 6 }} /> Cohesion & Influence Analytics</b>
      <div style={{ color: "#FFD700", fontWeight: 900, marginTop: 7 }}>Cohesion: <span style={{ color: "#1de682", fontSize: 22 }}>{cohesionScore}</span> / 100</div>
      <div style={{ color: "#FFD700", fontWeight: 900 }}>Isolated: {isolated.map(p => p.name).join(", ") || "None"}</div>
      <div style={{ color: "#FFD700", fontWeight: 900 }}>Glue Leaders: {glue.map(p => p.name).join(", ") || "None"}</div>
      <div style={{ color: "#1de682", fontWeight: 900 }}>Bridges: {bridges.map(p => p.name).join(", ") || "None"}</div>
      <div style={{ color: "#FF4848", fontWeight: 900 }}>Negatives: {negative.map(p => p.name).join(", ") || "None"}</div>
      {cohesionScore < 78 && (
        <div style={{ color: "#FF4848", fontWeight: 900, marginTop: 7 }}>
          <FaExclamationTriangle /> Low team cohesion—monitor at-risk connections!
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <Button size="sm" style={{ background: "#FFD700", color: "#181e23", fontSize: 14 }} onClick={() => logEvent("Intervention: Trust game assigned.")}>Log Intervention</Button>
        <Button size="sm" style={{ background: "#1de682", color: "#181e23", marginLeft: 6, fontSize: 14 }} onClick={() => logEvent("Mentor assignment initiated.")}>Log Mentor</Button>
      </div>
    </div>
  );
}

// Influence Bar Chart
function InfluenceHeatmap({ players }) {
  return (
    <div style={{ background: "#181e23", borderRadius: 14, padding: "10px 15px", marginBottom: 10 }}>
      <b style={{ color: "#1de682", fontSize: 15 }}><FaUserTie style={{ marginRight: 5 }} /> Influence Heatmap</b>
      {players.map(p => (
        <div key={p.id} style={{ marginTop: 4, display: "flex", alignItems: "center" }}>
          <span style={{ color: p.color, width: 68, display: "inline-block", fontWeight: 900 }}>{p.name}</span>
          <div style={{ background: "#FFD70033", borderRadius: 7, marginLeft: 7, width: 130 }}>
            <div style={{
              background: p.color, height: 13, borderRadius: 7, width: `${p.influence * 10}%`, minWidth: 14, fontWeight: 900,
              color: "#232b39", textAlign: "right", paddingRight: 4, fontSize: 13
            }}>{p.influence}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Team Pulse + Animated trend
function TeamPulse({ pulse, setPulse, addPulse, pulseHistory }) {
  return (
    <div style={{ background: "#232b39", borderRadius: 14, padding: "12px 18px", marginBottom: 10 }}>
      <b style={{ color: "#FFD700", fontSize: 14 }}><FaComments style={{ marginRight: 5 }} /> Weekly Team Pulse</b>
      <div>
        <span style={{ color: "#FFD700", fontWeight: 900 }}>Mood:</span>
        <select value={pulse.emoji} onChange={e => setPulse(p => ({ ...p, emoji: e.target.value }))} style={{ fontWeight: 900, padding: "7px 12px", borderRadius: 8 }}>
          <option value="">Choose</option>
          <option value="🔥">🔥</option>
          <option value="😃">😃</option>
          <option value="😐">😐</option>
          <option value="😬">😬</option>
          <option value="😴">😴</option>
        </select>
        <span style={{ marginLeft: 18, color: "#FFD700", fontWeight: 900 }}>Intensity:</span>
        <input type="range" min={1} max={10} value={pulse.score} onChange={e => setPulse(p => ({ ...p, score: e.target.value }))} />
        <span style={{ marginLeft: 7, color: "#FFD700", fontWeight: 900 }}>{pulse.score}</span>
        <Button size="sm" style={{ background: "#1de682", color: "#181e23", marginLeft: 11, fontSize: 14, padding: "4px 14px" }} onClick={addPulse}>Add</Button>
      </div>
      <div style={{ marginTop: 9, display: "flex", alignItems: "center" }}>
        <span style={{ color: "#FFD700", fontWeight: 900 }}>Trend:</span>
        <PulseTrend pulseHistory={pulseHistory} />
      </div>
    </div>
  );
}

// Session log
function LogTimeline({ log }) {
  return (
    <div style={{ background: "#181e23", borderRadius: 14, padding: "11px 16px", marginBottom: 12 }}>
      <b style={{ color: "#1de682", fontSize: 15 }}><FaCommentDots style={{ marginRight: 5 }} /> Session Log</b>
      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
        {log.slice(-7).reverse().map((l, i) => (
          <span key={i} style={{
            background: "#FFD700", color: "#232b39", borderRadius: 7, padding: "3px 9px", fontWeight: 900, marginRight: 2
          }}>
            [{l.ts}] {l.text}
          </span>
        ))}
      </div>
    </div>
  );
}

// MAIN
export default function TeamCohesionAnalyticsStudio() {
  const [players, setPlayers] = useState([...demoPlayers]);
  const [links, setLinks] = useState([...demoLinks]);
  const [selected, setSelected] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [pulse, setPulse] = useState({ emoji: "", score: 7 });
  const [pulseHistory, setPulseHistory] = useState([]);
  const [lastRipple, setLastRipple] = useState(null);
  const [log, setLog] = useState([{ ts: new Date().toLocaleTimeString(), text: "Module session started." }]);

  // AI Scenario
  function runAI() { setShowAI(true); }
  function addPulse() {
    setPulseHistory([...pulseHistory, { ...pulse, date: new Date().toLocaleDateString() }]);
    setLog(lg => [...lg, { ts: new Date().toLocaleTimeString(), text: `Team pulse: ${pulse.emoji} - ${pulse.score}` }]);
    setPulse({ emoji: "", score: 7 });
  }
  // Remove player
  function removeSelected() {
    setPlayers(ps => ps.filter(p => p.id !== selected));
    setLinks(ls => ls.filter(l => l.from !== selected && l.to !== selected));
    setLog(lg => [...lg, { ts: new Date().toLocaleTimeString(), text: `Player removed: ${players.find(p => p.id === selected)?.name}` }]);
    setSelected(null);
  }
  // Add player demo
  function addPlayer() {
    const name = prompt("Player name?");
    if (!name) return;
    const id = Math.max(...players.map(p => p.id)) + 1;
    setPlayers([...players, { id, name, role: "New", x: 120, y: 120, influence: 5, color: "#FFD700" }]);
    setLog(lg => [...lg, { ts: new Date().toLocaleTimeString(), text: `Player added: ${name}` }]);
  }
  // Add/remove links demo
  function addLink(type) {
    if (!selected) return;
    const target = prompt("Link to player (name)?");
    const t = players.find(p => p.name.toLowerCase() === target?.toLowerCase());
    if (!t) return alert("Player not found.");
    setLinks([...links, { from: selected, to: t.id, type }]);
    setLog(lg => [...lg, { ts: new Date().toLocaleTimeString(), text: `Link created: ${players.find(p => p.id === selected)?.name} → ${t.name} (${type})` }]);
    setLastRipple({ x: t.x, y: t.y, delta: Math.floor(Math.random() * 6 + 3) });
    setTimeout(() => setLastRipple(null), 900);
  }

  // Scenario ripple: Remove player, see predicted score shift (before confirm)
  function scenarioRemove() {
    if (!selected) return;
    const predScore = Math.round(70 + links.filter(l => l.from !== selected && l.to !== selected).length * 3 - (players.length - 1) * 1.5);
    alert(`Predicted Cohesion after removal: ${predScore} / 100`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(120deg,#1de682 0%, #FFD700 100%)", color: "#232b39", fontFamily: "Segoe UI,sans-serif" }}>
      {/* Top Panel */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 36px 10px 36px", background: "#232b39", boxShadow: "0 1px 16px #FFD70033" }}>
        <FaUsers style={{ fontSize: 32, color: "#1de682" }} />
        <span style={{ fontSize: 22, fontWeight: 900, color: "#FFD700", letterSpacing: 1 }}>Team Cohesion Analytics Studio</span>
        <Button style={{ background: "#1de682", color: "#181e23" }} onClick={runAI}><FaRobot /> AI Bridge Finder</Button>
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={addPlayer}><FaUserPlus /> Add Player</Button>
        {selected && (
          <>
            <Button style={{ background: "#FF4848", color: "#181e23" }} onClick={scenarioRemove}><MdTrendingDown /> Predict Remove</Button>
            <Button style={{ background: "#FF4848", color: "#181e23" }} onClick={removeSelected}><FaTrashAlt /> Remove</Button>
          </>
        )}
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={() => setShowExport(true)}><FaFileExport style={{ marginRight: 7 }} />Export</Button>
      </div>
      {/* Main Graph + Analytics */}
      <div style={{ display: "flex", gap: 38, padding: "30px 42px 0 42px" }}>
        <div>
          <SocialGraph players={players} links={links} setPlayers={setPlayers} setLinks={setLinks} selected={selected} setSelected={setSelected} lastRipple={lastRipple} />
          {selected && (
            <div style={{ marginTop: 8, background: "#232b39", borderRadius: 13, padding: 11 }}>
              <b style={{ color: "#FFD700" }}>{players.find(p => p.id === selected)?.name}</b>
              <Button size="sm" style={{ background: "#FFD700", color: "#181e23", marginLeft: 7, fontSize: 14 }} onClick={() => addLink("trust")}>Add Trust</Button>
              <Button size="sm" style={{ background: "#1de682", color: "#181e23", marginLeft: 3, fontSize: 14 }} onClick={() => addLink("mentor")}>Add Mentor</Button>
              <Button size="sm" style={{ background: "#3faeff", color: "#181e23", marginLeft: 3, fontSize: 14 }} onClick={() => addLink("friend")}>Add Friend</Button>
              <Button size="sm" style={{ background: "#FF4848", color: "#fff", marginLeft: 3, fontSize: 14 }} onClick={() => addLink("rival")}>Add Rival</Button>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 330 }}>
          <CohesionAnalytics players={players} links={links} log={log} setLog={setLog} />
          <InfluenceHeatmap players={players} />
          <TeamPulse pulse={pulse} setPulse={setPulse} addPulse={addPulse} pulseHistory={pulseHistory} />
          <LogTimeline log={log} />
        </div>
      </div>
      {/* AI Modal & Export */}
      <AnimatePresence>
        {showAI && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            style={{
              position: "fixed", top: 95, left: 0, right: 0, margin: "auto", width: 490, zIndex: 222,
              background: "#232b39", color: "#FFD700", borderRadius: 16, boxShadow: "0 4px 44px #1de68244", padding: 35
            }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#1de682", marginBottom: 9 }}>AI Bridge & Influence Engine</div>
            <div style={{ color: "#FFD700", fontWeight: 900, marginBottom: 7 }}>
              Key bridges: {players.filter(p => p.influence > 6).map(p => p.name).join(", ") || "None"}
            </div>
            <div style={{ color: "#FFD700", fontWeight: 900, marginBottom: 7 }}>
              Isolates: {players.filter(p =>
                !links.find(l => l.from === p.id || l.to === p.id)
              ).map(p => p.name).join(", ") || "None"}
            </div>
            <div style={{ color: "#FF4848", fontWeight: 900 }}>
              Intervention: Assign trust exercise, cross-role pairing, targeted mentorship.
            </div>
            <Button style={{ background: "#FFD700", color: "#181e23", marginTop: 19 }} onClick={() => setShowAI(false)}><FaChevronLeft /> Close</Button>
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
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (Session PDF, scenario analytics, log, AI)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
