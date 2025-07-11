import React, { useState } from "react";
import {
  FaExchangeAlt, FaArrowUp, FaArrowDown, FaUserCheck, FaTrash, FaPlusCircle, FaEdit, FaSearch, FaFileExport,
  FaUndo, FaRedo, FaExclamationTriangle, FaUsers, FaSitemap, FaHistory, FaStar, FaRegClock
} from "react-icons/fa";

const teams = ["U12", "U14", "U16", "U18", "Senior"];
const roles = ["Core", "Rotation", "Prospect", "Open"];

// Sample player pool
const initialPlayers = [
  { id: 1, name: "Filip Simic", team: "U12", role: "Prospect", status: "Active", depth: 3, value: 20000 },
  { id: 2, name: "Dino Ilic", team: "U14", role: "Rotation", status: "Active", depth: 2, value: 40000 },
  { id: 3, name: "Marko Kovačević", team: "U16", role: "Core", status: "Active", depth: 1, value: 90000 },
  { id: 4, name: "Luka Novak", team: "U18", role: "Prospect", status: "Active", depth: 3, value: 10000 },
  { id: 5, name: "Open Slot", team: "U16", role: "Open", status: "Vacant", depth: 4, value: 0 }
];

const actions = [
  { key: "Promote", icon: <FaArrowUp />, color: "#1de682" },
  { key: "Demote", icon: <FaArrowDown />, color: "#FFD700" },
  { key: "Transfer Out", icon: <FaExchangeAlt />, color: "#ff6b6b" },
  { key: "Transfer In", icon: <FaExchangeAlt />, color: "#FFD700" },
  { key: "Terminate", icon: <FaTrash />, color: "#ff6b6b" }
];

// Utility: team color
function teamColor(team) {
  const palette = { U12: "#1de682", U14: "#FFD700", U16: "#ff6b6b", U18: "#485563", Senior: "#FFD700" };
  return palette[team] || "#FFD700";
}

function riskColor(score) {
  if (score >= 80) return "#ff6b6b";
  if (score >= 40) return "#FFD700";
  return "#1de682";
}

// Cost/Risk Analyzer
function ScenarioCostRisk({ players, scenario }) {
  const lostValue = scenario.filter(a => a.action === "Transfer Out" || a.action === "Terminate").reduce((sum, a) => sum + (a.player.value || 0), 0);
  const gainedValue = scenario.filter(a => a.action === "Transfer In").reduce((sum, a) => sum + (a.player.value || 0), 0);
  // Pipeline risk: teams with <2 Core/Rotation players after all moves
  let risk = 0;
  teams.forEach(t => {
    const after = players.filter(p => p.team === t && (p.role === "Core" || p.role === "Rotation") && p.status === "Active").length;
    if (after < 2) risk += (2 - after) * 40;
  });
  return (
    <div style={{ background: "#232a2e", borderRadius: 13, padding: "11px 17px", margin: "12px 0", color: "#FFD700", fontWeight: 900, fontSize: 16, boxShadow: "0 2px 10px #FFD70022" }}>
      <FaStar color="#FFD700" style={{ marginRight: 9 }} />
      Commercial Out: <span style={{ color: "#ff6b6b" }}>€{lostValue}</span>
      {"  "} | In: <span style={{ color: "#1de682" }}>€{gainedValue}</span>
      {"  "} | Pipeline Risk: <span style={{ color: riskColor(risk) }}>{risk}</span>
    </div>
  );
}

// Team Strength Heatmap
function TeamStrengthHeatmap({ players }) {
  // Power = sum of values of active players by team
  const teamStrength = {};
  teams.forEach(t => {
    teamStrength[t] = players.filter(p => p.team === t && p.status === "Active").reduce((sum, p) => sum + (p.value || 0), 0);
  });
  const max = Math.max(...Object.values(teamStrength));
  return (
    <div style={{ background: "#232a2e", borderRadius: 13, padding: "11px 17px", margin: "12px 0", color: "#FFD700", fontWeight: 900, fontSize: 16, boxShadow: "0 2px 10px #FFD70022" }}>
      <FaUsers color="#FFD700" style={{ marginRight: 9 }} />
      Team Power: {teams.map(t => (
        <span key={t} style={{
          display: "inline-block", width: 78, marginRight: 10, color: teamColor(t)
        }}>{t}: <span style={{
          background: teamColor(t), color: "#232a2e", padding: "2px 10px", borderRadius: 7, fontWeight: 900
        }}>{teamStrength[t]}</span></span>
      ))}
    </div>
  );
}

// Mobility Network Graph (simple version)
function MobilityNetwork({ scenario }) {
  // Just show moves visually: From -> To per action
  if (!scenario.length) return null;
  return (
    <div style={{ background: "#232a2e", borderRadius: 14, padding: "12px 17px", margin: "12px 0", boxShadow: "0 2px 10px #FFD70022" }}>
      <b style={{ color: "#FFD700" }}><FaSitemap style={{ marginRight: 6 }} />Mobility Network</b>
      <div style={{ marginTop: 7, fontWeight: 800 }}>
        {scenario.map(a => (
          <div key={a.id} style={{ color: teamColor(a.from), marginBottom: 2, fontSize: 15 }}>
            <FaArrowUp color={teamColor(a.to)} style={{ marginRight: 7 }} />
            <span style={{ fontWeight: 900, color: "#FFD700" }}>{a.player.name}</span>
            {" "}{a.action === "Promote" ? "→" : a.action === "Demote" ? "↓" : a.action === "Transfer Out" ? "⇄ Out" : a.action === "Transfer In" ? "⇄ In" : "✖"}
            <span style={{ color: "#FFD700", fontWeight: 900 }}> {a.to}</span>
            {" "}({a.role})
          </div>
        ))}
      </div>
    </div>
  );
}

// Historical Scenario Log (in-memory)
function ScenarioLog({ log, onReplay }) {
  if (!log.length) return null;
  return (
    <div style={{ background: "#283E51", borderRadius: 14, padding: "12px 17px", margin: "14px 0", boxShadow: "0 2px 10px #FFD70022" }}>
      <b style={{ color: "#FFD700" }}><FaHistory style={{ marginRight: 6 }} />Scenario Log</b>
      <div style={{ marginTop: 7 }}>
        {log.map((l, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <button style={{
              background: "#FFD700", color: "#232a2e", borderRadius: 8, fontWeight: 900, border: "none", padding: "2px 14px", marginRight: 7, cursor: "pointer"
            }} onClick={() => onReplay(l.players, l.scenario)}>
              <FaRegClock /> Replay
            </button>
            <span style={{ color: "#FFD700" }}>Scenario {i + 1} ({l.scenario.length} moves)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TalentMobilityScenarioSimulator() {
  const [players, setPlayers] = useState(initialPlayers);
  const [scenario, setScenario] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({});
  const [log, setLog] = useState([]);

  // Undo/Redo
  function backup() {
    setHistory(h => [JSON.stringify({ players, scenario }), ...h].slice(0, 15));
    setRedoStack([]);
  }
  function undo() {
    if (history.length) {
      const last = JSON.parse(history[0]);
      setPlayers(last.players);
      setScenario(last.scenario);
      setHistory(h => h.slice(1));
      setRedoStack(rs => [JSON.stringify({ players, scenario }), ...rs]);
    }
  }
  function redo() {
    if (redoStack.length) {
      const next = JSON.parse(redoStack[0]);
      setPlayers(next.players);
      setScenario(next.scenario);
      setHistory(h => [JSON.stringify({ players, scenario }), ...h]);
      setRedoStack(rs => rs.slice(1));
    }
  }

  // CRUD for scenario
  function handleScenarioAdd() {
    backup();
    setScenario(s => [...s, { ...form, id: Date.now() }]);
    // effect on players:
    if (form.action === "Promote") {
      setPlayers(ps =>
        ps.map(p => p.id === form.player.id ? { ...p, team: form.to, role: form.role } : p)
      );
    }
    if (form.action === "Demote") {
      setPlayers(ps =>
        ps.map(p => p.id === form.player.id ? { ...p, team: form.to, role: "Prospect" } : p)
      );
    }
    if (form.action === "Transfer Out") {
      setPlayers(ps => ps.filter(p => p.id !== form.player.id));
    }
    if (form.action === "Transfer In") {
      setPlayers(ps => [...ps, { ...form.player, team: form.to, role: form.role, id: Date.now(), status: "Active" }]);
    }
    if (form.action === "Terminate") {
      setPlayers(ps => ps.map(p => p.id === form.player.id ? { ...p, status: "Terminated" } : p));
    }
    setAdding(false);
  }
  function handleScenarioDelete(id) {
    backup();
    setScenario(s => s.filter(a => a.id !== id));
  }
  function exportCSV() {
    const header = "Action,Player,From,To,Role\n";
    const body = scenario.map(a =>
      [a.action, a.player.name, a.from, a.to, a.role].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mobility_scenario.csv";
    link.click();
  }

  // Log scenario
  function logScenario() {
    setLog(l => [{ players: JSON.parse(JSON.stringify(players)), scenario: JSON.parse(JSON.stringify(scenario)) }, ...l.slice(0, 9)]);
  }
  function replayScenario(players, scenario) {
    setPlayers(JSON.parse(JSON.stringify(players)));
    setScenario(JSON.parse(JSON.stringify(scenario)));
  }

  // Bottleneck warning logic
  function getBottleneckWarnings(players) {
    let warning = [];
    teams.forEach(t => {
      roles.forEach(r => {
        const count = players.filter(p => p.team === t && p.role === r && p.status === "Active").length;
        if (r === "Core" && count < 1) warning.push(`No Core in ${t}`);
        if (count > 6) warning.push(`Overflow: ${t} ${r}`);
        if (count < 1 && r !== "Open") warning.push(`Gap: ${t} ${r}`);
      });
    });
    return warning;
  }

  // Talent depth tree
  function DepthTree({ players }) {
    return (
      <div style={{ background: "#232a2e", borderRadius: 14, padding: "13px 18px", margin: "13px 0", boxShadow: "0 2px 10px #FFD70022" }}>
        <b style={{ color: "#FFD700" }}>Talent Depth Tree</b>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 7 }}>
          {teams.map(team => (
            <div key={team} style={{ display: "flex", alignItems: "center", fontWeight: 900 }}>
              <span style={{ width: 58, color: teamColor(team) }}>{team}</span>
              {roles.map(r => {
                const count = players.filter(p => p.team === team && p.role === r && p.status === "Active").length;
                return (
                  <span key={r} style={{
                    width: 35, height: 22, borderRadius: 8,
                    background: count ? teamColor(team) : "#485563", color: "#232a2e",
                    fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 2
                  }}>{count}</span>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ marginLeft: 62, marginTop: 5, color: "#FFD700", fontWeight: 700, fontSize: 13 }}>
          {roles.map(r => <span key={r} style={{ marginRight: 28 }}>{r}</span>)}
        </div>
      </div>
    );
  }

  // --- Main ---
  const filtered = players.filter(p =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const bottlenecks = getBottleneckWarnings(players);

  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "32px", padding: "30px 18px 22px 18px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 11, flexWrap: "wrap" }}>
        <FaExchangeAlt size={38} color="#FFD700" style={{ marginRight: 11 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 28, letterSpacing: 1, marginBottom: 2, color: "#FFD700"
          }}>
            TALENT MOBILITY SCENARIO SIMULATOR
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Simulate, visualize, and command every movement and pipeline risk—instantly.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 21px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70055", marginLeft: 10
        }} onClick={exportCSV}>
          <FaFileExport style={{ marginRight: 8 }} /> Export Scenario CSV
        </button>
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70033", marginLeft: 7
        }} onClick={undo}><FaUndo /> Undo</button>
        <button style={{
          background: "#1de682", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #1de68233", marginLeft: 7
        }} onClick={redo}><FaRedo /> Redo</button>
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70033", marginLeft: 7
        }} onClick={logScenario}><FaHistory /> Log Scenario</button>
      </div>
      {/* SCENARIO LOG */}
      <ScenarioLog log={log} onReplay={replayScenario} />
      {/* Cost/Risk & Heatmap */}
      <ScenarioCostRisk players={players} scenario={scenario} />
      <TeamStrengthHeatmap players={players} />
      {/* Scenario warnings */}
      {bottlenecks.length > 0 &&
        <div style={{ background: "#ff6b6b22", color: "#ff6b6b", borderRadius: 13, padding: "10px 14px", marginBottom: 9, fontWeight: 900 }}>
          <FaExclamationTriangle style={{ marginRight: 7 }} /> {bottlenecks.join(" | ")}
        </div>
      }
      <MobilityNetwork scenario={scenario} />
      <DepthTree players={players} />
      {/* TABLE: Players */}
      <div style={{
        minWidth: 400, maxWidth: 860, background: "#283E51", borderRadius: 20, padding: 16, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 8 }}>Player Pool</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 9 }}>
          <FaSearch color="#FFD700" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Find player..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 15, width: 120, marginLeft: 5 }} />
        </div>
        <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse", fontFamily: "Segoe UI" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th>Role</th>
              <th>Status</th>
              <th>Value (€)</th>
              <th>Scenario</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{
                background: teamColor(p.team) + "19"
              }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }} onClick={() => setSelected(p)}>{p.name}</td>
                <td>{p.team}</td>
                <td>{p.role}</td>
                <td>{p.status}</td>
                <td>{p.value}</td>
                <td>
                  {actions.map(a =>
                    <button key={a.key} style={{
                      background: a.color, color: "#232a2e", borderRadius: 6, border: "none", fontWeight: 900, fontSize: 15, margin: "0 2px", padding: "3px 9px", cursor: "pointer"
                    }} onClick={() => {
                      setAdding(true);
                      setForm({ action: a.key, player: p, from: p.team, to: "", role: p.role });
                    }}>{a.icon}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ADD SCENARIO */}
      {adding &&
        <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "11px 9px", marginBottom: 12 }}>
          <form onSubmit={e => { e.preventDefault(); handleScenarioAdd(); }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <b>Action:</b>
              <select value={form.action || "Promote"}
                onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                style={{ marginLeft: 7, borderRadius: 7, padding: "4px 10px", fontWeight: 700 }}>
                {actions.map(a => <option key={a.key} value={a.key}>{a.key}</option>)}
              </select>
              <b>From:</b>
              <input type="text" value={form.from || ""} readOnly style={{ marginLeft: 6, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 60 }} />
              <b>To:</b>
              <select value={form.to || ""}
                onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                style={{ marginLeft: 7, borderRadius: 7, padding: "4px 10px", fontWeight: 700 }}>
                <option value=""></option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <b>Role:</b>
              <select value={form.role || "Core"}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{ marginLeft: 7, borderRadius: 7, padding: "4px 10px", fontWeight: 700 }}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="submit" style={{
                background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 8, fontWeight: 900, fontSize: 16,
                padding: "7px 22px", marginLeft: 12, cursor: "pointer", boxShadow: "0 2px 10px #FFD70022"
              }}>Confirm</button>
              <button type="button" style={{
                background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 900, fontSize: 16,
                padding: "7px 22px", marginLeft: 8, cursor: "pointer", boxShadow: "0 2px 10px #ff6b6b33"
              }} onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </form>
        </div>
      }
      {/* SCENARIO TABLE */}
      <div style={{
        minWidth: 430, maxWidth: 900, background: "#283E51", borderRadius: 20, padding: 16, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 9 }}>Scenario Moves</div>
        <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse", fontFamily: "Segoe UI" }}>
          <thead>
            <tr>
              <th>Action</th>
              <th>Player</th>
              <th>From</th>
              <th>To</th>
              <th>Role</th>
              <th>Del</th>
            </tr>
          </thead>
          <tbody>
            {scenario.map(a => (
              <tr key={a.id} style={{ background: "#FFD70019" }}>
                <td>{a.action}</td>
                <td>{a.player.name}</td>
                <td>{a.from}</td>
                <td>{a.to}</td>
                <td>{a.role}</td>
                <td>
                  <button onClick={() => handleScenarioDelete(a.id)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 12px", fontSize: 15, cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SIDEBAR: Scenario Impact */}
      <div style={{
        minWidth: 300, maxWidth: 440, background: "#232a2e", borderRadius: 18, padding: 20, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 16
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>Scenario Impact & Winners/Losers</b>
        {selected ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 19, margin: "8px 0 6px 0" }}>{selected.name}</div>
            <div><b>Team:</b> {selected.team}</div>
            <div><b>Role:</b> {selected.role}</div>
            <div><b>Status:</b> {selected.status}</div>
            <div style={{ marginTop: 9, color: "#FFD700" }}>
              <b>Current Depth:</b> {players.filter(p => p.team === selected.team && p.role === selected.role && p.status === "Active").length}
            </div>
          </>
        ) : (
          <div style={{ margin: "11px 0 10px 0", color: "#FFD700", fontSize: 15, fontWeight: 900 }}>
            Select a player to see scenario impact.
          </div>
        )}
        <div style={{ marginTop: 18, color: "#FFD700" }}>
          <b>Total Moves:</b> {scenario.length}
        </div>
        <div style={{ marginTop: 8, color: "#1de682" }}>
          <b>Winners:</b>{" "}
          {players.filter(p => p.status === "Active" && !["Open"].includes(p.role)).map(p => p.name).join(", ") || "None"}
        </div>
        <div style={{ marginTop: 8, color: "#ff6b6b" }}>
          <b>Critical Gaps:</b>{" "}
          {bottlenecks.length === 0
            ? <span style={{ color: "#1de682" }}>None</span>
            : <span style={{ color: "#ff6b6b" }}>{bottlenecks.join("; ")}</span>}
        </div>
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 24,
        fontSize: 14,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. The global gold standard for mobility scenario intelligence.
      </div>
    </div>
  );
}
