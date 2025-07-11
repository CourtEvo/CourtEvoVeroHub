import React, { useState } from "react";
import {
  FaBalanceScale, FaDownload, FaPlusCircle, FaEdit, FaTrash, FaUserPlus,
  FaCheckCircle, FaExclamationTriangle, FaChartLine, FaUserTie, FaEnvelopeOpenText, FaListAlt
} from "react-icons/fa";

// Helper: DOB to Quarter
function getQuarter(dob) {
  if (!dob) return "-";
  const m = parseInt(dob.split("-")[1], 10);
  if (m <= 3) return "Q1";
  if (m <= 6) return "Q2";
  if (m <= 9) return "Q3";
  return "Q4";
}

// DEMO data: can start empty
const initialPlayers = [
  { id: 1, name: "Ivan Markovic", dob: "2011-01-15", squad: "U14 Boys", coach: "Peric", year: 2024, notes: "", watchlist: false },
  { id: 2, name: "Dino Ilic", dob: "2010-09-07", squad: "U14 Boys", coach: "Peric", year: 2024, notes: "", watchlist: false },
  { id: 3, name: "Luka Juric", dob: "2012-04-03", squad: "U12 Boys", coach: "Zaninovic", year: 2024, notes: "", watchlist: true },
  { id: 4, name: "Filip Simic", dob: "2012-12-30", squad: "U12 Boys", coach: "Zaninovic", year: 2024, notes: "Late dev.", watchlist: true },
];
const squads = ["U10 Boys", "U12 Boys", "U14 Boys", "U16 Boys", "U18 Boys", "Seniors"];
const coaches = ["Peric", "Zaninovic", "Petrovic", "Vukic", "Mikic"];

export default function AgeBiasImpactAnalyzer() {
  const [players, setPlayers] = useState(initialPlayers);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [trendYear, setTrendYear] = useState(2024);
  const [parentFeedback, setParentFeedback] = useState([]);
  const [showTrialList, setShowTrialList] = useState(false);
  const [actionLog, setActionLog] = useState([]);

  // CRUD handlers
  function handleEdit(player) {
    setEditing(player);
    setForm({ ...player });
    setAdding(false);
  }
  function handleDelete(id) {
    setPlayers(ps => ps.filter(p => p.id !== id));
    setActionLog(log => [
      ...log, { type: "delete", user: "Board", detail: `Deleted player ID ${id}`, date: new Date().toLocaleString() }
    ]);
    if (editing && editing.id === id) setEditing(null);
  }
  function handleSaveEdit() {
    setPlayers(ps => ps.map(p => p.id === editing.id ? { ...form, id: editing.id } : p));
    setActionLog(log => [
      ...log, { type: "edit", user: "Board", detail: `Edited player ${form.name}`, date: new Date().toLocaleString() }
    ]);
    setEditing(null);
  }
  function handleAddNew() {
    setPlayers(ps => [...ps, { ...form, id: Date.now() }]);
    setActionLog(log => [
      ...log, { type: "add", user: "Board", detail: `Added player ${form.name}`, date: new Date().toLocaleString() }
    ]);
    setAdding(false);
  }

  // Analysis by quarter/year/squad/coach
  const filteredPlayers = players.filter(p => p.year === trendYear);
  const qMap = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  filteredPlayers.forEach(p => {
    const q = getQuarter(p.dob);
    if (q in qMap) qMap[q]++;
  });
  const total = filteredPlayers.length;
  const overRep = Object.keys(qMap).find(q => qMap[q] > total / 4 + 1);
  const underRep = Object.keys(qMap).find(q => qMap[q] < total / 4 - 1);

  // By squad/coach for dashboard
  const bySquad = {};
  const byCoach = {};
  squads.forEach(sq => {
    bySquad[sq] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, total: 0 };
  });
  coaches.forEach(coach => {
    byCoach[coach] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, total: 0 };
  });
  filteredPlayers.forEach(p => {
    const q = getQuarter(p.dob);
    if (bySquad[p.squad]) {
      bySquad[p.squad][q]++;
      bySquad[p.squad].total++;
    }
    if (byCoach[p.coach]) {
      byCoach[p.coach][q]++;
      byCoach[p.coach].total++;
    }
  });

  // Persistent coach/squad bias alert
  const coachBias = Object.entries(byCoach).find(
    ([, c]) => Object.values(c).slice(0, 4).some(v => v > (c.total / 2))
  );
  const squadBias = Object.entries(bySquad).find(
    ([, s]) => Object.values(s).slice(0, 4).some(v => v > (s.total / 2))
  );

  // Year-over-year trend data
  const years = [...new Set(players.map(p => p.year))].sort();
  const trends = years.map(yr => {
    const arr = players.filter(p => p.year === yr);
    const tm = { year: yr, Q1: 0, Q2: 0, Q3: 0, Q4: 0, total: arr.length };
    arr.forEach(p => {
      const q = getQuarter(p.dob);
      if (q in tm) tm[q]++;
    });
    return tm;
  });

  // Late bloomer watchlist (Q3/Q4, flagged)
  const lateBloomers = filteredPlayers.filter(
    p => (getQuarter(p.dob) === "Q3" || getQuarter(p.dob) === "Q4") && p.watchlist
  );

  // AI trial recommendation: Q3/Q4, not on watchlist
  const trialTargets = filteredPlayers.filter(
    p => (getQuarter(p.dob) === "Q3" || getQuarter(p.dob) === "Q4") && !p.watchlist
  );

  // Export
  function exportCSV() {
    const header = "Name,DOB,Squad,Coach,Year,Quarter,Notes\n";
    const body = players.map(p => `${p.name},${p.dob},${p.squad},${p.coach},${p.year},${getQuarter(p.dob)},${p.notes}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "age_bias_data.csv";
    link.click();
  }

  // Parent feedback
  function submitFeedback(msg) {
    setParentFeedback(fb => [...fb, { msg, date: new Date().toISOString().split("T")[0] }]);
    setActionLog(log => [
      ...log, { type: "feedback", user: "Parent", detail: msg, date: new Date().toLocaleString() }
    ]);
    alert("Thank you! Your feedback has been submitted anonymously to the board.");
  }

  // Toggle watchlist
  function toggleWatchlist(p) {
    setPlayers(ps => ps.map(pl =>
      pl.id === p.id ? { ...pl, watchlist: !pl.watchlist } : pl
    ));
    setActionLog(log => [
      ...log, { type: "watchlist", user: "Board", detail: `${p.name} ${p.watchlist ? "removed from" : "added to"} watchlist`, date: new Date().toLocaleString() }
    ]);
  }

  // Build balanced trial list
  function trialList() {
    // Return a list of balanced (Q1/Q2/Q3/Q4) players (can be customized)
    const qList = { Q1: [], Q2: [], Q3: [], Q4: [] };
    filteredPlayers.forEach(p => qList[getQuarter(p.dob)].push(p));
    const len = Math.min(qList.Q1.length, qList.Q2.length, qList.Q3.length, qList.Q4.length);
    return ["Q1", "Q2", "Q3", "Q4"].flatMap(q => qList[q].slice(0, len));
  }

  // Boardroom alert
  const alertMsg = overRep || underRep
    ? `Bias alert: ${overRep ? overRep + " over-represented. " : ""}${underRep ? underRep + " under-represented. " : ""}Consider extra focus in trials.`
    : null;

  return (
    <div style={{
      background: "#232a2e",
      color: "#fff",
      fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh",
      borderRadius: "24px",
      padding: "38px 28px 18px 28px",
      boxShadow: "0 6px 32px 0 #1a1d20",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <FaBalanceScale size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            AGE BIAS IMPACT ANALYZER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Fix hidden birthdate bias in your talent pool. Boardroom insights. Enriched flow.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 10, fontWeight: 700,
            border: "none", padding: "10px 18px", marginRight: 10, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={exportCSV}
        >
          <FaDownload style={{ marginRight: 7 }} /> Export CSV
        </button>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 10, fontWeight: 700,
            border: "none", padding: "10px 18px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={() => { setAdding(true); setForm({}); setEditing(null); }}
        >
          <FaPlusCircle style={{ marginRight: 7 }} /> Add Player
        </button>
      </div>

      {/* Boardroom Alerts */}
      {(alertMsg || coachBias || squadBias) && (
        <div style={{
          background: "#FFD70022", color: "#FFD700", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 17, marginBottom: 16
        }}>
          {alertMsg && <><FaExclamationTriangle style={{ marginRight: 8 }} /> {alertMsg}<br /></>}
          {coachBias && <><FaUserTie style={{ marginRight: 8 }} /> <b>Coach bias:</b> {coachBias[0]}<br /></>}
          {squadBias && <><FaListAlt style={{ marginRight: 8 }} /> <b>Squad bias:</b> {squadBias[0]}<br /></>}
        </div>
      )}

      {/* Responsive Flex */}
      <div
        style={{
          display: "flex",
          gap: 38,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* CRUD Table */}
        <div
          style={{
            minWidth: 340,
            maxWidth: 480,
            flex: "1 1 380px",
            background: "#283E51",
            borderRadius: 22,
            padding: 22,
            boxShadow: "0 2px 12px 0 #15171a",
            overflowX: "auto",
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 9 }}>
            Player Data & CRUD
          </div>
          {(adding || editing) &&
            <div style={{
              background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "13px 11px", marginBottom: 13
            }}>
              <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 7 }}>{adding ? "Add New Player" : "Edit Player"}</div>
              <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
                <div>
                  <b>Name:</b>
                  <input type="text" value={form.name || ""} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>DOB:</b>
                  <input type="date" value={form.dob || ""} required
                    onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Squad:</b>
                  <select value={form.squad || ""} required
                    onChange={e => setForm(f => ({ ...f, squad: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }}>
                    <option value="">Select...</option>
                    {squads.map(sq => <option key={sq} value={sq}>{sq}</option>)}
                  </select>
                </div>
                <div>
                  <b>Coach:</b>
                  <select value={form.coach || ""} required
                    onChange={e => setForm(f => ({ ...f, coach: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }}>
                    <option value="">Select...</option>
                    {coaches.map(co => <option key={co} value={co}>{co}</option>)}
                  </select>
                </div>
                <div>
                  <b>Year:</b>
                  <input type="number" min={2022} max={2050} value={form.year || trendYear}
                    onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 75 }} />
                </div>
                <div>
                  <b>Notes:</b>
                  <input type="text" value={form.notes || ""}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 170 }} />
                </div>
                <div style={{ marginTop: 9 }}>
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", marginRight: 8, cursor: "pointer"
                  }}>{adding ? "Add" : "Save"}</button>
                  <button type="button" style={{
                    background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", cursor: "pointer"
                  }} onClick={() => { setAdding(false); setEditing(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          }
          <div style={{ overflowX: "auto", maxHeight: 390 }}>
            <table style={{ width: "100%", color: "#fff", fontSize: 15 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>Squad</th>
                  <th>Coach</th>
                  <th>Year</th>
                  <th>Quarter</th>
                  <th>Notes</th>
                  <th>Watchlist</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: "#FFD700", fontWeight: 700 }}>{p.name}</td>
                    <td>{p.dob}</td>
                    <td>{p.squad}</td>
                    <td>{p.coach}</td>
                    <td>{p.year}</td>
                    <td>{getQuarter(p.dob)}</td>
                    <td>{p.notes}</td>
                    <td>
                      <button onClick={() => toggleWatchlist(p)}
                        style={{ background: p.watchlist ? "#FFD700" : "#232a2e", color: "#232a2e", borderRadius: 6, fontWeight: 700, border: "none", padding: "2px 8px", cursor: "pointer" }}>
                        <FaCheckCircle color={p.watchlist ? "#1de682" : "#FFD700"} />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(p)}
                        style={{ background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 700, border: "none", marginRight: 3, padding: "2px 8px", cursor: "pointer" }}>
                        <FaEdit />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(p.id)}
                        style={{ background: "#ff6b6b", color: "#fff", borderRadius: 6, fontWeight: 700, border: "none", padding: "2px 8px", cursor: "pointer" }}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics/Right Column */}
        <div
          style={{
            minWidth: 320,
            maxWidth: 520,
            flex: "1 1 380px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "transparent",
            marginBottom: 18,
          }}
        >
          {/* Year selection and distribution */}
          <div style={{ background: "#232a2e", borderRadius: 14, padding: "14px 15px 8px 15px", marginBottom: 0, boxShadow: "0 2px 12px 0 #15171a" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 5 }}>Trend Year:
              <select value={trendYear} onChange={e => setTrendYear(Number(e.target.value))}
                style={{ marginLeft: 10, borderRadius: 5, padding: "4px 7px", fontSize: 15 }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15 }}>Birthdate Distribution</div>
            <BarChart data={qMap} />
          </div>
          {/* Year-over-year trendlines */}
          <div style={{ background: "#283E51", borderRadius: 13, padding: "13px 13px 7px 13px", marginBottom: 0, boxShadow: "0 2px 12px 0 #121416" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              Year-over-Year Trendlines
            </div>
            <TrendBarChart trends={trends} />
          </div>
          {/* Late bloomer & trial rec */}
          <div style={{ background: "#232a2e", borderRadius: 14, padding: "13px 13px 8px 13px", marginBottom: 0, boxShadow: "0 2px 12px 0 #15171a" }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>Late Bloomer Watchlist</span>
              <ul style={{ fontSize: 14, maxHeight: 60, overflowY: "auto" }}>
                {lateBloomers.length === 0 && <li>No flagged late-born players.</li>}
                {lateBloomers.map(p =>
                  <li key={p.id} style={{ color: "#1de682", fontWeight: 600 }}>{p.name} ({p.squad})</li>
                )}
              </ul>
            </div>
            <span style={{ color: "#FFD700", fontWeight: 700 }}>Trial Recommendation Engine</span>
            <ul style={{ fontSize: 14, maxHeight: 65, overflowY: "auto" }}>
              {trialTargets.length === 0 && <li>All Q3/Q4 monitored.</li>}
              {trialTargets.map(p =>
                <li key={p.id} style={{ color: "#FFD700", fontWeight: 600 }}>
                  <FaUserPlus /> {p.name} ({p.squad})
                  <button onClick={() => toggleWatchlist(p)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 5, marginLeft: 9, padding: "2px 7px", cursor: "pointer" }}>
                    Flag
                  </button>
                </li>
              )}
            </ul>
            <span style={{ color: "#FFD700", fontWeight: 700 }}>Build Balanced Trial List</span>
            <button onClick={() => setShowTrialList(s => !s)}
              style={{ background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 700, border: "none", marginTop: 5, marginBottom: 7, padding: "4px 12px", fontSize: 15, cursor: "pointer" }}>
              {showTrialList ? "Hide" : "Show"} List
            </button>
            {showTrialList &&
              <ul style={{ maxHeight: 90, overflowY: "auto", marginBottom: 10 }}>
                {trialList().map(p =>
                  <li key={p.id} style={{ color: "#FFD700", fontWeight: 600 }}>{p.name} ({p.squad}) - {getQuarter(p.dob)}</li>
                )}
              </ul>
            }
          </div>
          {/* Coach Impact Dashboard */}
          <div style={{ background: "#283E51", borderRadius: 13, padding: "11px 12px 8px 13px", marginBottom: 0, boxShadow: "0 2px 12px 0 #121416" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15 }}>Coach Impact Dashboard</div>
            <div style={{ overflowX: "auto", maxHeight: 110 }}>
              <table style={{ width: "100%", fontSize: 13, color: "#fff" }}>
                <thead>
                  <tr>
                    <th>Coach</th>
                    <th>Q1</th>
                    <th>Q2</th>
                    <th>Q3</th>
                    <th>Q4</th>
                    <th>Total</th>
                    <th>Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {coaches.map(co => (
                    <tr key={co}>
                      <td style={{ color: "#FFD700", fontWeight: 700 }}>{co}</td>
                      <td>{byCoach[co].Q1}</td>
                      <td>{byCoach[co].Q2}</td>
                      <td>{byCoach[co].Q3}</td>
                      <td>{byCoach[co].Q4}</td>
                      <td>{byCoach[co].total}</td>
                      <td>
                        {Object.values(byCoach[co]).slice(0, 4).some(v => v > byCoach[co].total / 2)
                          ? <FaExclamationTriangle color="#FFD700" title="High bias" />
                          : <FaCheckCircle color="#1de682" title="Balanced" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Parent Feedback */}
          <div style={{ background: "#FFD70022", borderRadius: 10, padding: 8, color: "#232a2e", fontWeight: 600 }}>
            <span><FaEnvelopeOpenText style={{ marginRight: 7 }} /> Anonymous Parent Feedback</span>
            <form onSubmit={e => { e.preventDefault(); submitFeedback(e.target.elements.feedback.value); e.target.reset(); }}>
              <input name="feedback" type="text" placeholder="Type bias concern..." style={{ borderRadius: 6, padding: "4px 9px", width: "77%", marginRight: 6 }} />
              <button type="submit" style={{
                background: "#FFD700", color: "#232a2e", borderRadius: 7, padding: "4px 10px", fontWeight: 700, border: "none", cursor: "pointer"
              }}>Submit</button>
            </form>
            {parentFeedback.length > 0 &&
              <ul style={{ marginTop: 6, fontSize: 13, maxHeight: 65, overflowY: "auto" }}>
                {parentFeedback.map((f, i) =>
                  <li key={i} style={{ color: "#FFD700" }}>{f.msg} <span style={{ fontSize: 11, opacity: 0.7 }}>({f.date})</span></li>
                )}
              </ul>
            }
          </div>
          {/* Action Log */}
          <div style={{ background: "#232a2e", borderRadius: 10, padding: 10, color: "#FFD700", marginTop: 6, fontWeight: 600, fontSize: 14 }}>
            <FaListAlt style={{ marginRight: 7 }} />
            <b>Boardroom Action Log</b>
            <ul style={{ marginTop: 6, fontSize: 13, maxHeight: 85, overflowY: "auto" }}>
              {actionLog.length === 0 && <li>No actions yet.</li>}
              {actionLog.map((log, i) =>
                <li key={i} style={{ color: "#FFD700" }}>
                  [{log.date}] <b>{log.user}:</b> {log.detail}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div
        style={{
          marginTop: 36,
          fontSize: 14,
          opacity: 0.7,
          textAlign: "center",
        }}
      >
        Proprietary to CourtEvo Vero. Remove bias. Expand your pipeline. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}

// Simple BarChart for quarters (no external libs)
function BarChart({ data }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <svg width={200} height={80}>
      {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
        <g key={q}>
          <rect
            x={20 + i * 40}
            y={60 - (data[q] / max) * 55}
            width={28}
            height={(data[q] / max) * 55}
            fill={["#FFD700", "#1de682", "#ff6b6b", "#485563"][i]}
            rx={4}
          />
          <text
            x={34 + i * 40}
            y={75}
            textAnchor="middle"
            fontWeight="bold"
            fill="#FFD700"
            fontSize={14}
          >{q}</text>
          <text
            x={34 + i * 40}
            y={55 - (data[q] / max) * 55}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
          >{data[q]}</text>
        </g>
      ))}
    </svg>
  );
}

// Trend bar chart (year-over-year)
function TrendBarChart({ trends }) {
  const max = Math.max(...trends.flatMap(t => [t.Q1, t.Q2, t.Q3, t.Q4]), 1);
  return (
    <svg width={220} height={75 + trends.length * 18}>
      {trends.map((t, y) =>
        ["Q1", "Q2", "Q3", "Q4"].map((q, qi) => (
          <rect
            key={q + y}
            x={25 + qi * 45}
            y={14 + y * 18}
            width={30}
            height={Math.max(4, (t[q] / max) * 14)}
            fill={["#FFD700", "#1de682", "#ff6b6b", "#485563"][qi]}
            rx={3}
          />
        ))
      )}
      {trends.map((t, y) => (
        <text
          key={y}
          x={8}
          y={24 + y * 18}
          fontSize={12}
          fontWeight="bold"
          fill="#FFD700"
        >{t.year}</text>
      ))}
      {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
        <text
          key={q}
          x={40 + i * 45}
          y={trends.length * 18 + 32}
          fontSize={13}
          fontWeight="bold"
          fill={["#FFD700", "#1de682", "#ff6b6b", "#485563"][i]}
        >{q}</text>
      ))}
    </svg>
  );
}
