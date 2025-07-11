import React, { useState } from "react";
import {
  FaChartLine, FaHeartbeat, FaRegClock, FaExclamationTriangle, FaPlusCircle, FaEdit, FaTrash,
  FaFileExport, FaUndo, FaRedo, FaSearch, FaFilter, FaFlagCheckered, FaChartBar, FaAngleRight, FaMagic
} from "react-icons/fa";

const growthTypes = [
  { key: "Physical", color: "#FFD700" },
  { key: "Technical", color: "#1de682" },
  { key: "Tactical", color: "#00c4cc" },
  { key: "Cognitive", color: "#34a0ff" },
  { key: "Emotional", color: "#e86be6" }
];

const pipelineYears = Array.from({ length: 11 }, (_, i) => i + 8); // 8-18

const initialAthletes = [
  {
    id: 1, name: "Filip Simic", age: 12, position: "PG", phv: 12.1,
    windows: {
      Physical: [11, 13], Technical: [10, 14], Tactical: [13, 15], Cognitive: [11, 14], Emotional: [13, 16]
    },
    scores: { Physical: 6.5, Technical: 8.1, Tactical: 7.1, Cognitive: 7.5, Emotional: 7.0 },
    currentWindow: "Physical",
    risk: "Missed Window",
    log: [
      { type: "entered", window: "Physical", year: 2024, note: "PHV entered" },
      { type: "risk", risk: "Missed Window", year: 2025, note: "Physical dev late" }
    ],
    note: "PHV reached early; needs extra attention"
  },
  {
    id: 2, name: "Dino Ilic", age: 11, position: "SG", phv: 12.6,
    windows: {
      Physical: [12, 14], Technical: [10, 13], Tactical: [12, 15], Cognitive: [12, 15], Emotional: [13, 17]
    },
    scores: { Physical: 7.2, Technical: 7.9, Tactical: 7.4, Cognitive: 6.8, Emotional: 6.5 },
    currentWindow: "Technical",
    risk: "Overlap Risk",
    log: [
      { type: "entered", window: "Technical", year: 2024, note: "Good entry" },
      { type: "risk", risk: "Overlap Risk", year: 2025, note: "Multiple overlaps" }
    ],
    note: "Multiple windows; avoid overload"
  },
  {
    id: 3, name: "Marko Kovačević", age: 14, position: "SF", phv: 13.2,
    windows: {
      Physical: [12, 13], Technical: [11, 14], Tactical: [13, 16], Cognitive: [12, 16], Emotional: [14, 18]
    },
    scores: { Physical: 8.1, Technical: 8.0, Tactical: 7.6, Cognitive: 8.3, Emotional: 7.7 },
    currentWindow: "Tactical",
    risk: "None",
    log: [
      { type: "entered", window: "Tactical", year: 2026, note: "Advantage on entry" }
    ],
    note: "On track"
  }
];

// Score color for development overlay
function scoreColor(score) {
  if (score >= 8) return "#1de682";
  if (score >= 7) return "#FFD700";
  if (score >= 5) return "#34a0ff";
  return "#ff6b6b";
}
function riskColor(risk) {
  if (risk === "Missed Window") return "#ff6b6b";
  if (risk === "Overlap Risk") return "#FFD700";
  if (risk === "Late PHV") return "#34a0ff";
  return "#1de682";
}

// Growth window Gantt chart: scrollable, one row per athlete
function GrowthWindowGantt({ athletes }) {
  return (
    <div style={{
      overflowX: "auto", marginBottom: 24, background: "#283E51", borderRadius: 18, boxShadow: "0 2px 14px #15171a",
      padding: "12px 9px", minWidth: 580
    }}>
      <div style={{ display: "flex", fontWeight: 900, color: "#FFD700", marginBottom: 8 }}>
        <div style={{ width: 130 }}>Athlete</div>
        {pipelineYears.map(y =>
          <div key={y} style={{ width: 38, textAlign: "center" }}>{y}</div>
        )}
      </div>
      {athletes.map(a => (
        <div key={a.id} style={{ display: "flex", alignItems: "center", marginBottom: 3, fontSize: 16 }}>
          <div style={{
            width: 130, color: "#FFD700", fontWeight: 900, background: riskColor(a.risk) + "22",
            borderRadius: 10, padding: "2px 0 2px 9px"
          }}>
            {a.name} <span style={{ color: riskColor(a.risk), marginLeft: 7, fontWeight: 700, fontSize: 13 }}>{a.risk !== "None" ? a.risk : ""}</span>
          </div>
          {pipelineYears.map(age => {
            const windowType = growthTypes.find(t => {
              const [start, end] = a.windows[t.key];
              return age >= start && age <= end;
            });
            const isNow = a.age === age;
            return (
              <div key={age} style={{
                width: 38, height: 22, borderRadius: 5, margin: "0 1px",
                background: windowType ? windowType.color : "#222b30",
                border: isNow ? "2px solid #FFD700" : "none",
                opacity: isNow ? 1 : windowType ? 0.85 : 0.55,
                position: "relative"
              }}>
                {isNow && <span style={{
                  position: "absolute", left: "50%", top: -15, transform: "translateX(-50%)", fontSize: 15, color: "#FFD700", fontWeight: 900
                }}>▲</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Mini PHV trend chart (simulate, random line for each athlete)
function PHVTrend({ phv, age }) {
  // Simulate historical PHV data points
  const trend = [phv - 0.5, phv - 0.2, phv, phv + 0.2, phv + 0.4];
  const max = Math.max(...trend, 14);
  return (
    <svg width={50} height={18}>
      <polyline
        fill="none"
        stroke="#FFD700"
        strokeWidth={2}
        points={trend.map((v, i) => `${i * 12},${18 - v / max * 16}`).join(" ")}
      />
      {trend.map((v, i) =>
        <circle key={i} cx={i * 12} cy={18 - v / max * 16} r={2} fill="#1de682" />
      )}
      <circle cx={((age - (phv - 0.5)) / 1.3) * 48} cy={18 - phv / max * 16} r={2.8} fill="#FFD700" />
    </svg>
  );
}

// Development profile overlay
function DevProfile({ scores }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 8 }}>
      {growthTypes.map(t => (
        <span key={t.key} style={{
          background: scoreColor(scores[t.key]), color: "#232a2e", fontWeight: 900,
          borderRadius: 5, padding: "2px 7px", fontSize: 14
        }}>{t.key[0]}: {scores[t.key]}</span>
      ))}
    </div>
  );
}

export default function AthleteGrowthWindowOptimizer() {
  const [athletes, setAthletes] = useState(initialAthletes);
  const [form, setForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebar, setSidebar] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [simScenario, setSimScenario] = useState(null);

  // Undo/Redo
  function backup() { setHistory(h => [JSON.stringify(athletes), ...h].slice(0, 10)); setRedoStack([]); }
  function undo() { if (history.length) { setAthletes(JSON.parse(history[0])); setHistory(h => h.slice(1)); setRedoStack(rs => [JSON.stringify(athletes), ...rs]); } }
  function redo() { if (redoStack.length) { setAthletes(JSON.parse(redoStack[0])); setHistory(h => [JSON.stringify(athletes), ...h]); setRedoStack(rs => rs.slice(1)); } }

  // CRUD
  function handleEdit(a) { setEditing(a); setForm({ ...a }); setAdding(false); }
  function handleDelete(id) { backup(); setAthletes(list => list.filter(x => x.id !== id)); setEditing(null); setSidebar(null); }
  function handleSaveEdit() { backup(); setAthletes(list => list.map(x => x.id === editing.id ? { ...form, id: editing.id } : x)); setEditing(null); }
  function handleAddNew() { backup(); setAthletes(list => [...list, { ...form, id: Date.now() }]); setAdding(false); }
  function exportCSV() {
    const header = "Name,Age,Position,PHV,Physical,Technical,Tactical,Cognitive,Emotional,CurrentWindow,Risk,Note\n";
    const body = athletes.map(a =>
      [a.name, a.age, a.position, a.phv, ...growthTypes.map(t => a.windows[t.key].join("-")), a.currentWindow, a.risk, a.note].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "growth_window.csv";
    link.click();
  }

  // Scenario simulation: e.g. move window, extend window, trigger risk
  function simulateScenario(type, a) {
    setSimScenario({ type, base: a });
  }
  function runScenario(type, a) {
    backup();
    setAthletes(list => list.map(x => {
      if (x.id !== a.id) return x;
      if (type === "moveWindow") {
        let win = { ...x.windows };
        win[x.currentWindow] = [win[x.currentWindow][0] + 1, win[x.currentWindow][1] + 1];
        return { ...x, windows: win, log: [...(x.log || []), { type: "scenario", note: "Window moved", year: 2027 }] };
      }
      if (type === "extendWindow") {
        let win = { ...x.windows };
        win[x.currentWindow][1] += 1;
        return { ...x, windows: win, log: [...(x.log || []), { type: "scenario", note: "Window extended", year: 2027 }] };
      }
      if (type === "triggerRisk") {
        return { ...x, risk: "Missed Window", log: [...(x.log || []), { type: "scenario", risk: "Missed Window", year: 2027 }] };
      }
      return x;
    }));
    setSimScenario(null);
  }

  // Filtering
  const filtered = athletes.filter(a => search === "" || a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "34px", padding: "31px 18px 18px 18px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 13, flexWrap: "wrap" }}>
        <FaChartLine size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 27, letterSpacing: 1, marginBottom: 3, color: "#FFD700"
          }}>
            ATHLETE GROWTH WINDOW OPTIMIZER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Science-driven risk, scenario, and opportunity for elite development.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 21px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70055", marginLeft: 10
        }} onClick={exportCSV}>
          <FaFileExport style={{ marginRight: 8 }} /> Export CSV
        </button>
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70033", marginLeft: 7
        }} onClick={undo}><FaUndo /> Undo</button>
        <button style={{
          background: "#1de682", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #1de68233", marginLeft: 7
        }} onClick={redo}><FaRedo /> Redo</button>
      </div>

      {/* PIPELINE GANTT */}
      <div>
        <GrowthWindowGantt athletes={athletes} />
      </div>

      {/* TABLE */}
      <div style={{
        minWidth: 420, maxWidth: 900, background: "#283E51", borderRadius: 22, padding: 16, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 8 }}>Growth Window Table</div>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
            border: "none", padding: "8px 16px", fontSize: 16, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 8px 0 #1de68266",
            marginBottom: 12
          }}
          onClick={() => { setAdding(true); setForm({}); setEditing(null); }}>
          <FaPlusCircle style={{ marginRight: 8 }} /> Add Athlete
        </button>
        {(adding || editing) &&
          <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "12px 10px", marginBottom: 12 }}>
            <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
              <div style={{ display: "flex", gap: 13, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <b>Name:</b>
                  <input type="text" value={form.name || ""} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 120 }} />
                </div>
                <div>
                  <b>Age:</b>
                  <input type="number" value={form.age || ""}
                    onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 45, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Position:</b>
                  <select value={form.position || "PG"}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {["PG", "SG", "SF", "PF", "C"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <b>PHV:</b>
                  <input type="number" step="0.1" value={form.phv || ""}
                    onChange={e => setForm(f => ({ ...f, phv: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 55, fontWeight: 700 }} />
                </div>
                {growthTypes.map(t => (
                  <div key={t.key}>
                    <b>{t.key} Window:</b>
                    <input type="text" placeholder="eg 11-13" value={form.windows?.[t.key]?.join("-") || ""}
                      onChange={e => setForm(f => ({
                        ...f,
                        windows: { ...f.windows, [t.key]: e.target.value.split("-").map(Number) }
                      }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 60, fontWeight: 700 }} />
                  </div>
                ))}
                <div>
                  <b>Current Window:</b>
                  <select value={form.currentWindow || "Physical"}
                    onChange={e => setForm(f => ({ ...f, currentWindow: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {growthTypes.map(t => <option key={t.key} value={t.key}>{t.key}</option>)}
                  </select>
                </div>
                <div>
                  <b>Risk:</b>
                  <select value={form.risk || "None"}
                    onChange={e => setForm(f => ({ ...f, risk: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    <option value="None">None</option>
                    <option value="Missed Window">Missed Window</option>
                    <option value="Overlap Risk">Overlap Risk</option>
                    <option value="Late PHV">Late PHV</option>
                  </select>
                </div>
                <div>
                  <b>Note:</b>
                  <input type="text" value={form.note || ""}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 110, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Scores:</b>
                  <input type="text" placeholder="7.5,8.1,7.7,7.4,7.1"
                    value={growthTypes.map(t => form.scores?.[t.key] ?? "").join(",")}
                    onChange={e => {
                      const vals = e.target.value.split(",").map(Number);
                      setForm(f => ({
                        ...f,
                        scores: growthTypes.reduce((acc, t, i) => ({ ...acc, [t.key]: vals[i] }), {})
                      }));
                    }}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 90, fontWeight: 700 }} />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <button type="submit" style={{
                  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 9, fontWeight: 900, fontSize: 16,
                  padding: "7px 22px", marginRight: 12, cursor: "pointer", boxShadow: "0 2px 10px #FFD70022"
                }}>{adding ? "Add" : "Save"}</button>
                <button type="button" style={{
                  background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 9, fontWeight: 900, fontSize: 16,
                  padding: "7px 22px", cursor: "pointer", boxShadow: "0 2px 10px #ff6b6b33"
                }} onClick={() => { setAdding(false); setEditing(null); setForm({}); }}>Cancel</button>
              </div>
            </form>
          </div>
        }
        <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse", fontFamily: "Segoe UI" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Pos</th>
              <th>PHV</th>
              <th>PHV Trend</th>
              <th>Development</th>
              <th>Current Window</th>
              <th>Risk</th>
              <th>Note</th>
              <th>Edit</th>
              <th>Del</th>
              <th>Simulate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} style={{ background: riskColor(a.risk) + "19" }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }} onClick={() => setSidebar(a)}>{a.name}</td>
                <td>{a.age}</td>
                <td>{a.position}</td>
                <td>{a.phv}</td>
                <td><PHVTrend phv={a.phv} age={a.age} /></td>
                <td><DevProfile scores={a.scores || {}} /></td>
                <td>{a.currentWindow}</td>
                <td style={{ color: riskColor(a.risk), fontWeight: 900 }}>{a.risk}</td>
                <td>{a.note}</td>
                <td>
                  <button onClick={() => handleEdit(a)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaEdit />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(a.id)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                </td>
                <td>
                  <button title="Move window" onClick={() => simulateScenario("moveWindow", a)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "2px 10px", fontSize: 14, cursor: "pointer", marginRight: 3 }}>
                    <FaAngleRight />
                  </button>
                  <button title="Extend window" onClick={() => simulateScenario("extendWindow", a)}
                    style={{ background: "#1de682", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "2px 10px", fontSize: 14, cursor: "pointer", marginRight: 3 }}>
                    <FaMagic />
                  </button>
                  <button title="Trigger Missed" onClick={() => simulateScenario("triggerRisk", a)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "2px 10px", fontSize: 14, cursor: "pointer" }}>
                    <FaExclamationTriangle />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SIDEBAR: Growth Passport */}
      <div style={{
        minWidth: 340, maxWidth: 470, background: "#232a2e", borderRadius: 19, padding: 20, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 12
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>Athlete Growth Passport</b>
        {sidebar ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 21, margin: "8px 0 6px 0" }}>{sidebar.name}</div>
            <div><b>Age:</b> {sidebar.age}</div>
            <div><b>Position:</b> {sidebar.position}</div>
            <div><b>PHV:</b> {sidebar.phv} <PHVTrend phv={sidebar.phv} age={sidebar.age} /></div>
            <div><b>Development:</b> <DevProfile scores={sidebar.scores || {}} /></div>
            <div><b>Current Window:</b> {sidebar.currentWindow}</div>
            <div><b>Risk:</b> <span style={{ color: riskColor(sidebar.risk), fontWeight: 900 }}>{sidebar.risk}</span></div>
            <div><b>Growth Windows:</b>
              <ul style={{ marginLeft: 13 }}>
                {growthTypes.map(t => (
                  <li key={t.key} style={{ color: t.color, fontWeight: 900 }}>
                    {t.key}: {sidebar.windows?.[t.key]?.join("–")}
                  </li>
                ))}
              </ul>
            </div>
            <div><b>Note:</b> <span style={{ color: "#FFD700" }}>{sidebar.note}</span></div>
            <div><b>Progress Log:</b>
              <ul style={{ marginLeft: 13, fontSize: 13 }}>
                {(sidebar.log || []).map((log, i) =>
                  <li key={i} style={{ color: log.type === "risk" ? "#ff6b6b" : "#FFD700" }}>
                    {log.type === "entered" && <>Entered {log.window} ({log.year}): {log.note}</>}
                    {log.type === "risk" && <>Risk: {log.risk} ({log.year}): {log.note}</>}
                    {log.type === "scenario" && <>Scenario: {log.note} ({log.year})</>}
                  </li>
                )}
              </ul>
            </div>
            {simScenario && simScenario.base.id === sidebar.id &&
              <div style={{ marginTop: 14 }}>
                <b>Simulate Scenario:</b>
                <button style={{
                  background: "#FFD700", color: "#232a2e", borderRadius: 9, fontWeight: 900, border: "none",
                  padding: "6px 14px", fontSize: 15, marginLeft: 7, marginRight: 4, cursor: "pointer"
                }} onClick={() => runScenario(simScenario.type, sidebar)}>
                  Confirm
                </button>
                <button style={{
                  background: "#283E51", color: "#FFD700", borderRadius: 9, fontWeight: 900, border: "none",
                  padding: "6px 14px", fontSize: 15, marginLeft: 4, cursor: "pointer"
                }} onClick={() => setSimScenario(null)}>
                  Cancel
                </button>
              </div>
            }
          </>
        ) : (
          <div style={{ margin: "11px 0 10px 0", color: "#FFD700", fontSize: 15, fontWeight: 900 }}>
            Click athlete for full growth passport.
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 20,
        fontSize: 14,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. Boardroom-grade, science-driven talent.
      </div>
    </div>
  );
}
