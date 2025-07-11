import React, { useState } from "react";
import {
  FaClipboardList, FaUserCheck, FaPlusCircle, FaTrash, FaEdit, FaSearch, FaArrowTrendUp,
  FaExclamationTriangle, FaUserPlus, FaFileExport, FaCheckDouble, FaFilter, FaRobot, FaUndo, FaRedo, FaStar
} from "react-icons/fa";

const years = [2012, 2013, 2014, 2015];
const positions = ["PG", "SG", "SF", "PF", "C"];

// Example pool (add “late bloomer”, “sleeper”, risk, notes)
const initialPool = [
  { id: 1, name: "Filip Simic", year: 2012, age: 12, position: "PG", club: "Cibona", trend: [6, 7, 7, 8, 9], lateBloomer: true, sleeper: false, coachRec: true, aiRec: false, risk: "Low", note: "Late physical growth" },
  { id: 2, name: "Dino Ilic", year: 2013, age: 11, position: "SG", club: "Dubrava", trend: [5, 6, 8, 8, 9], lateBloomer: false, sleeper: true, coachRec: false, aiRec: true, risk: "Med", note: "Volatile performance" },
  { id: 3, name: "Marko Kovačević", year: 2012, age: 12, position: "SF", club: "Cedevita", trend: [7, 8, 8, 8, 8], lateBloomer: false, sleeper: false, coachRec: true, aiRec: false, risk: "Low", note: "Steady, strong BBIQ" },
  { id: 4, name: "Ivan Peric", year: 2014, age: 10, position: "PF", club: "Cibona", trend: [4, 4, 5, 7, 7], lateBloomer: true, sleeper: true, coachRec: false, aiRec: true, risk: "High", note: "Recent surge, needs monitoring" }
];

function trendColor(val) {
  if (val >= 8) return "#1de682";
  if (val >= 6) return "#FFD700";
  return "#ff6b6b";
}

export default function DynamicTrialListBuilder() {
  const [pool, setPool] = useState(initialPool);
  const [trialList, setTrialList] = useState([]);
  const [form, setForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ year: "", position: "", flag: "" });
  const [sidebar, setSidebar] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Undo/Redo
  function backup() { setHistory(h => [JSON.stringify({ trialList, pool }), ...h].slice(0, 10)); setRedoStack([]); }
  function undo() { if (history.length) { const last = JSON.parse(history[0]); setTrialList(last.trialList); setPool(last.pool); setHistory(h => h.slice(1)); setRedoStack(rs => [JSON.stringify({ trialList, pool }), ...rs]); } }
  function redo() { if (redoStack.length) { const next = JSON.parse(redoStack[0]); setTrialList(next.trialList); setPool(next.pool); setHistory(h => [JSON.stringify({ trialList, pool }), ...h]); setRedoStack(rs => rs.slice(1)); } }

  // Add to trial list
  function addToTrial(p) { backup(); setTrialList(l => [...l, { ...p, id: Date.now() }]); setPool(pool.filter(x => x.id !== p.id)); }
  function removeFromTrial(id) { backup(); setPool(p => [...pool, ...trialList.filter(x => x.id === id)]); setTrialList(trialList.filter(x => x.id !== id)); }
  function handleEdit(p) { setEditing(p); setForm({ ...p }); setAdding(false); }
  function handleDelete(id) { backup(); setTrialList(list => list.filter(x => x.id !== id)); setEditing(null); setSidebar(null); }
  function handleSaveEdit() { backup(); setTrialList(list => list.map(x => x.id === editing.id ? { ...form, id: editing.id } : x)); setEditing(null); }
  function handleAddNew() { backup(); setTrialList(list => [...list, { ...form, id: Date.now() }]); setAdding(false); }
  function exportCSV() {
    const header = "Name,Year,Age,Position,Club,Flags,Note\n";
    const body = trialList.map(p =>
      [p.name, p.year, p.age, p.position, p.club, (p.lateBloomer ? "LateBloomer " : "") + (p.sleeper ? "Sleeper " : ""), p.note].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "trial_list.csv";
    link.click();
  }

  // Auto-suggested optimal list
  function autoSuggest() {
    backup();
    // Example logic: include every core year, at least one from each position, at least one late bloomer, one sleeper, one coachRec, one aiRec
    let byYear = {};
    years.forEach(y => byYear[y] = pool.filter(p => p.year === y));
    let suggested = [];
    positions.forEach(pos => {
      const first = pool.find(p => p.position === pos && !suggested.includes(p));
      if (first) suggested.push(first);
    });
    const late = pool.find(p => p.lateBloomer && !suggested.includes(p));
    if (late) suggested.push(late);
    const sleeper = pool.find(p => p.sleeper && !suggested.includes(p));
    if (sleeper) suggested.push(sleeper);
    const rec = pool.find(p => (p.coachRec || p.aiRec) && !suggested.includes(p));
    if (rec) suggested.push(rec);
    setTrialList(suggested.map(p => ({ ...p, id: Date.now() + Math.random() })));
    setPool(pool.filter(p => !suggested.includes(p)));
  }

  // Filtering
  const filtered = pool.filter(p =>
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filter.year || p.year === Number(filter.year)) &&
    (!filter.position || p.position === filter.position) &&
    (!filter.flag || (filter.flag === "late" ? p.lateBloomer : filter.flag === "sleeper" ? p.sleeper : false))
  );

  // Inline trend chart
  function TrendMini({ trend }) {
    if (!trend?.length) return null;
    const max = Math.max(...trend, 10);
    return (
      <svg width={40} height={20}>
        <polyline
          fill="none"
          stroke="#FFD700"
          strokeWidth={2}
          points={trend.map((v, i) => `${i * 10},${20 - v / max * 18}`).join(" ")}
        />
        {trend.map((v, i) =>
          <circle key={i} cx={i * 10} cy={20 - v / max * 18} r={2.3} fill={trendColor(v)} />
        )}
      </svg>
    );
  }

  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "34px", padding: "31px 18px 18px 18px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 13, flexWrap: "wrap" }}>
        <FaClipboardList size={34} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 25, letterSpacing: 1, marginBottom: 3, color: "#FFD700"
          }}>
            DYNAMIC TRIAL LIST BUILDER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Build, optimize, and export the perfect, data-driven trial group.
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
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70033", marginLeft: 7
        }} onClick={autoSuggest}><FaRobot /> Auto-Suggest</button>
      </div>
      {/* FILTERS */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <FaSearch color="#FFD700" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Find athlete..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 15, width: 120, marginLeft: 5 }} />
        <FaFilter color="#FFD700" />
        <select value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))} style={{
          background: "#1a1d20", color: "#FFD700", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", cursor: "pointer"
        }}>
          <option value="">Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filter.position} onChange={e => setFilter(f => ({ ...f, position: e.target.value }))} style={{
          background: "#1a1d20", color: "#FFD700", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", cursor: "pointer"
        }}>
          <option value="">Position</option>
          {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
        </select>
        <select value={filter.flag} onChange={e => setFilter(f => ({ ...f, flag: e.target.value }))} style={{
          background: "#1a1d20", color: "#FFD700", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", cursor: "pointer"
        }}>
          <option value="">Flag</option>
          <option value="late">Late Bloomer</option>
          <option value="sleeper">Sleeper</option>
        </select>
      </div>
      {/* AVAILABLE POOL */}
      <div style={{
        minWidth: 400, maxWidth: 860, background: "#283E51", borderRadius: 20, padding: 16, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 8 }}>Eligible Athlete Pool</div>
        <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse", fontFamily: "Segoe UI" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Year</th>
              <th>Age</th>
              <th>Position</th>
              <th>Club</th>
              <th>Trend</th>
              <th>Flags</th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{
                background: p.lateBloomer ? "#FFD70019" : p.sleeper ? "#1de68219" : "#283E51"
              }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }} onClick={() => setSidebar(p)}>{p.name}</td>
                <td>{p.year}</td>
                <td>{p.age}</td>
                <td>{p.position}</td>
                <td>{p.club}</td>
                <td><TrendMini trend={p.trend} /></td>
                <td>
                  {p.lateBloomer && <span style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900, fontSize: 13, marginRight: 6 }}>Late</span>}
                  {p.sleeper && <span style={{ background: "#1de682", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900, fontSize: 13 }}>Sleeper</span>}
                </td>
                <td>
                  <button onClick={() => addToTrial(p)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 6, border: "none", fontWeight: 900, fontSize: 15, padding: "3px 13px", cursor: "pointer" }}>
                    <FaUserPlus />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* TRIAL LIST */}
      <div style={{
        minWidth: 430, maxWidth: 900, background: "#283E51", borderRadius: 20, padding: 16, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 9 }}>Trial List</div>
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
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <b>Name:</b>
                  <input type="text" value={form.name || ""} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 120 }} />
                </div>
                <div>
                  <b>Year:</b>
                  <select value={form.year || years[0]}
                    onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
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
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <b>Club:</b>
                  <input type="text" value={form.club || ""}
                    onChange={e => setForm(f => ({ ...f, club: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 80, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Late Bloomer:</b>
                  <input type="checkbox" checked={form.lateBloomer || false}
                    onChange={e => setForm(f => ({ ...f, lateBloomer: e.target.checked }))}
                    style={{ marginLeft: 6, width: 22, height: 22 }} />
                </div>
                <div>
                  <b>Sleeper:</b>
                  <input type="checkbox" checked={form.sleeper || false}
                    onChange={e => setForm(f => ({ ...f, sleeper: e.target.checked }))}
                    style={{ marginLeft: 6, width: 22, height: 22 }} />
                </div>
                <div>
                  <b>Coach Rec:</b>
                  <input type="checkbox" checked={form.coachRec || false}
                    onChange={e => setForm(f => ({ ...f, coachRec: e.target.checked }))}
                    style={{ marginLeft: 6, width: 22, height: 22 }} />
                </div>
                <div>
                  <b>AI Rec:</b>
                  <input type="checkbox" checked={form.aiRec || false}
                    onChange={e => setForm(f => ({ ...f, aiRec: e.target.checked }))}
                    style={{ marginLeft: 6, width: 22, height: 22 }} />
                </div>
                <div>
                  <b>Risk:</b>
                  <select value={form.risk || "Low"}
                    onChange={e => setForm(f => ({ ...f, risk: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "4px 10px", fontWeight: 700 }}>
                    <option value="Low">Low</option>
                    <option value="Med">Med</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <b>Note:</b>
                  <input type="text" value={form.note || ""}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 120, fontWeight: 700 }} />
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
              <th>Year</th>
              <th>Age</th>
              <th>Position</th>
              <th>Club</th>
              <th>Trend</th>
              <th>Flags</th>
              <th>Coach/AI Rec</th>
              <th>Risk</th>
              <th>Note</th>
              <th>Edit</th>
              <th>Del</th>
            </tr>
          </thead>
          <tbody>
            {trialList.map(p => (
              <tr key={p.id} style={{ background: "#FFD70019" }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }} onClick={() => setSidebar(p)}>{p.name}</td>
                <td>{p.year}</td>
                <td>{p.age}</td>
                <td>{p.position}</td>
                <td>{p.club}</td>
                <td><TrendMini trend={p.trend} /></td>
                <td>
                  {p.lateBloomer && <span style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900, fontSize: 13, marginRight: 6 }}>Late</span>}
                  {p.sleeper && <span style={{ background: "#1de682", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900, fontSize: 13 }}>Sleeper</span>}
                </td>
                <td>
                  {p.coachRec && <span title="Coach recommended" style={{ color: "#FFD700", marginRight: 7 }}><FaCheckDouble /></span>}
                  {p.aiRec && <span title="AI recommended" style={{ color: "#1de682" }}><FaRobot /></span>}
                </td>
                <td style={{ color: p.risk === "High" ? "#ff6b6b" : p.risk === "Med" ? "#FFD700" : "#1de682", fontWeight: 900 }}>{p.risk}</td>
                <td>{p.note}</td>
                <td>
                  <button onClick={() => handleEdit(p)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaEdit />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                  <button onClick={() => removeFromTrial(p.id)}
                    style={{ background: "#232a2e", color: "#FFD700", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer", marginLeft: 3 }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SIDEBAR: Player Profile */}
      <div style={{
        minWidth: 310, maxWidth: 420, background: "#232a2e", borderRadius: 19, padding: 19, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 12
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>Athlete Trial Profile</b>
        {sidebar ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 19, margin: "8px 0 6px 0" }}>{sidebar.name}</div>
            <div><b>Year:</b> {sidebar.year}</div>
            <div><b>Age:</b> {sidebar.age}</div>
            <div><b>Position:</b> {sidebar.position}</div>
            <div><b>Club:</b> {sidebar.club}</div>
            <div><b>Trend:</b> <TrendMini trend={sidebar.trend} /></div>
            <div>
              {sidebar.lateBloomer && <span style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900, fontSize: 13, marginRight: 6 }}>Late Bloomer</span>}
              {sidebar.sleeper && <span style={{ background: "#1de682", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900, fontSize: 13 }}>Sleeper</span>}
            </div>
            <div>
              {sidebar.coachRec && <span style={{ color: "#FFD700", marginRight: 7 }}><FaCheckDouble /> Coach Rec</span>}
              {sidebar.aiRec && <span style={{ color: "#1de682" }}><FaRobot /> AI Rec</span>}
            </div>
            <div style={{ color: sidebar.risk === "High" ? "#ff6b6b" : sidebar.risk === "Med" ? "#FFD700" : "#1de682", fontWeight: 900 }}>
              <b>Risk:</b> {sidebar.risk}
            </div>
            <div><b>Note:</b> <span style={{ color: "#FFD700" }}>{sidebar.note}</span></div>
          </>
        ) : (
          <div style={{ margin: "11px 0 10px 0", color: "#FFD700", fontSize: 15, fontWeight: 900 }}>
            Click on athlete for full trial profile.
          </div>
        )}
        <div style={{ marginTop: 12, color: "#FFD700" }}>
          <b>Trial List Size:</b> {trialList.length}
        </div>
        <div style={{ marginTop: 7 }}>
          <b>Representation:</b> {positions.map(pos => <span key={pos} style={{ color: "#FFD700", marginRight: 8 }}>{pos}: {trialList.filter(p => p.position === pos).length}</span>)}
        </div>
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
        Proprietary to CourtEvo Vero. Boardroom intelligence for selection & talent.
      </div>
    </div>
  );
}
