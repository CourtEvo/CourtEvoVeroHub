import React, { useState } from "react";
import {
  FaChartLine, FaRulerVertical, FaHeartbeat, FaBell, FaCheck, FaExclamationTriangle, FaPlus, FaTrash, FaFileExport, FaCommentDots, FaUserMd, FaClipboardCheck, FaUserFriends, FaEnvelopeOpen, FaFlag, FaTasks, FaCalendarAlt
} from "react-icons/fa";

const PHV_COLORS = { normal: "#1de682", risk: "#FFD700", danger: "#ff4848" };
const SQUAD_COLORS = ["#FFD70011", "#FFD70055", "#1de68222", "#FFD70022"];
const SQUADS = ["U14", "U16", "U18", "U20", "Senior"];

const futurePHV = history => {
  if (history.length < 2) return 0;
  // Linear projection based on last 2 entries
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const phv = ((last.height - prev.height) / (monthsBetween(last.date, prev.date) || 1)) * 12;
  return (phv + ((last.height - prev.height) / (monthsBetween(last.date, prev.date) || 1)) * 12) / 2;
};
function monthsBetween(date1, date2) {
  const d1 = new Date(date1), d2 = new Date(date2);
  return Math.abs((d1.getFullYear() - d2.getFullYear()) * 12 + d1.getMonth() - d2.getMonth());
}
function calcPHV(curr, prev) {
  if (!prev) return 0;
  const months = monthsBetween(curr.date, prev.date);
  if (months <= 0) return 0;
  return ((curr.height - prev.height) / months) * 12;
}
function riskLevel(phv) {
  if (phv > 9) return "danger";
  if (phv > 7) return "risk";
  return "normal";
}
function trendColor(arr) {
  if (arr.length < 2) return "#FFD700";
  const last = arr[arr.length - 1]?.phv ?? 0;
  const prev = arr[arr.length - 2]?.phv ?? 0;
  if (last > prev) return "#1de682";
  if (last < prev) return "#ff4848";
  return "#FFD700";
}

const initAthletes = [
  {
    id: 1,
    name: "Ivan Radic",
    squad: "U14",
    birth: "2010-02-18",
    history: [
      { date: "2023-06-10", height: 178, sitting: 88, weight: 65 },
      { date: "2024-01-10", height: 185, sitting: 92, weight: 68 }
    ],
    notes: "",
    injuries: [{ diagnosis: "Knee pain", date: "2023-11-18", rtp: "2024-02-18", status: "Completed" }],
    assigned: "",
    actionItems: [{ type: "Coach", text: "Reduce sprint load 15%", completed: true }],
    notifications: [{ txt: "Coach notified: monitor loading", date: "2024-02-01" }]
  },
  {
    id: 2,
    name: "Marko Proleta",
    squad: "U16",
    birth: "2010-07-24",
    history: [
      { date: "2023-06-10", height: 176, sitting: 87, weight: 61 },
      { date: "2024-01-10", height: 181, sitting: 89, weight: 63 }
    ],
    notes: "Recent rapid growth",
    injuries: [],
    assigned: "Physio",
    actionItems: [{ type: "Medical", text: "Monitor for Osgood-Schlatter", completed: false }],
    notifications: []
  }
];

const PHVModule = () => {
  const [athletes, setAthletes] = useState(initAthletes);
  const [selected, setSelected] = useState(athletes[0]?.id || null);
  const [adding, setAdding] = useState(false);
  const [entry, setEntry] = useState({ date: "", height: "", sitting: "", weight: "" });
  const [athleteName, setAthleteName] = useState("");
  const [athleteBirth, setAthleteBirth] = useState("");
  const [athleteSquad, setAthleteSquad] = useState(SQUADS[0]);
  const [noteText, setNoteText] = useState("");
  const [teamLog, setTeamLog] = useState([
    { msg: "Ivan Radic PHV 8.7cm/yr (Watch injury risk!)", date: "2024-02-01", level: "risk" }
  ]);
  const [compare, setCompare] = useState([]);
  // Compliance logic
  const today = new Date();
  const measurementOverdue = a => {
    const last = a.history[a.history.length - 1];
    return monthsBetween(today.toISOString().slice(0, 10), last?.date) > 6;
  };

  // Helper for chart
  function getPHVHistory(history) {
    if (history.length < 2) return [];
    let phvArr = [];
    for (let i = 1; i < history.length; ++i) {
      phvArr.push({
        date: history[i].date,
        phv: calcPHV(history[i], history[i - 1])
      });
    }
    return phvArr;
  }

  function handleAddEntry() {
    setAthletes(athletes.map(a =>
      a.id === selected
        ? { ...a, history: [...a.history, { ...entry, height: +entry.height, sitting: +entry.sitting, weight: +entry.weight }] }
        : a
    ));
    setEntry({ date: "", height: "", sitting: "", weight: "" });
    setAdding(false);
  }
  function handleAddAthlete() {
    const id = Math.max(0, ...athletes.map(a => a.id)) + 1;
    setAthletes([...athletes, {
      id, name: athleteName, birth: athleteBirth, squad: athleteSquad, history: [], notes: "", injuries: [], assigned: "", actionItems: [], notifications: []
    }]);
    setAthleteName(""); setAthleteBirth("");
    setSelected(id);
  }
  function handleDeleteAthlete(id) {
    setAthletes(athletes.filter(a => a.id !== id));
    if (selected === id) setSelected(athletes.length ? athletes[0]?.id : null);
  }
  function handleAddNote(id) {
    setAthletes(athletes.map(a =>
      a.id === id ? { ...a, notes: noteText } : a
    ));
    setNoteText("");
  }
  // Assign workflow
  function assignMedical(id) {
    setAthletes(athletes.map(a =>
      a.id === id ? { ...a, assigned: "Physio", actionItems: [...a.actionItems, { type: "Medical", text: "Evaluate PHV risk", completed: false }] } : a
    ));
    setTeamLog([{ msg: `${athletes.find(x => x.id === id)?.name} assigned to Physio for PHV risk.`, date: new Date().toISOString().slice(0, 10), level: "risk" }, ...teamLog]);
  }
  function addNotification(id, txt) {
    setAthletes(athletes.map(a =>
      a.id === id ? { ...a, notifications: [...a.notifications, { txt, date: new Date().toISOString().slice(0, 10) }] } : a
    ));
  }
  // Add injury logic
  function addInjury(id) {
    const diagnosis = prompt("Diagnosis (e.g. Osgood-Schlatter, Knee pain):");
    const date = prompt("Diagnosis Date (YYYY-MM-DD):");
    const rtp = prompt("Expected RTP (YYYY-MM-DD):");
    setAthletes(athletes.map(a =>
      a.id === id ? {
        ...a,
        injuries: [...a.injuries, { diagnosis, date, rtp, status: "Active" }],
        actionItems: [...a.actionItems, { type: "Medical", text: `Rehab for ${diagnosis}`, completed: false }]
      } : a
    ));
    setTeamLog([{ msg: `${athletes.find(x => x.id === id)?.name} new injury: ${diagnosis}`, date: date, level: "danger" }, ...teamLog]);
  }
  function markAction(id, idx) {
    setAthletes(athletes.map(a =>
      a.id === id ? { ...a, actionItems: a.actionItems.map((x, i) => i === idx ? { ...x, completed: !x.completed } : x) } : a
    ));
  }
  // Export stub
  function exportCSV() {
    alert("Exporting Boardroom PDF/CSV with athletes, growth, risk, actions, compliance, case logs and visual dashboards.");
  }
  // ---- UI ----
  const athlete = athletes.find(a => a.id === selected);
  // Growth spurt clustering: if >2 athletes in squad at "danger" or "risk" this month
  const spurtCluster = SQUADS.map(sq => {
    const filtered = athletes.filter(a => a.squad === sq);
    let count = 0;
    filtered.forEach(a => {
      const phvArr = getPHVHistory(a.history);
      const last = phvArr[phvArr.length - 1]?.phv || 0;
      if (last > 7) count++;
    });
    return { squad: sq, count };
  }).filter(sq => sq.count > 1);
  // Compliance
  const overdue = athletes.filter(measurementOverdue);
  // Comparison data
  const compareAthletes = compare.length > 1 ? athletes.filter(a => compare.includes(a.id)) : [];
  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 36, maxWidth: 1480, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <FaChartLine size={28} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 26, letterSpacing: 1 }}>PHV / Growth Maturity Module</h2>
        <span style={{ background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 10, padding: '7px 18px', fontSize: 15, marginLeft: 15 }}>CourtEvo Vero</span>
        <button onClick={exportCSV} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 17, padding: "8px 18px", marginLeft: 20
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> Export Board Pack
        </button>
      </div>
      {/* Weekly compliance digest */}
      <div style={{ margin: "16px 0 12px 0", background: "#FFD70022", borderRadius: 13, padding: 13 }}>
        <FaFlag color="#FFD700" /> <b>Compliance Digest:</b> {overdue.length === 0 ? (
          <span style={{ color: "#1de682", fontWeight: 700 }}>All athletes up-to-date!</span>
        ) : (
          <span style={{ color: "#FFD700", fontWeight: 700 }}>{overdue.map(a => a.name).join(", ")} overdue for measurement!</span>
        )}
      </div>
      {/* Growth spurt clustering */}
      {spurtCluster.length > 0 && (
        <div style={{ background: "#FFD70022", borderRadius: 13, padding: 13, marginBottom: 10 }}>
          <FaUserFriends color="#FFD700" /> <b>Growth Spurt Alert:</b> <span style={{ color: "#FFD700" }}>{spurtCluster.map(s => `${s.squad} (${s.count} athletes)`).join(", ")}</span>
          <span style={{ color: "#FFD70099", marginLeft: 7 }}>Coach should monitor injury prevention for these squads!</span>
        </div>
      )}
      {/* Heatmap / Team Dashboard */}
      <div style={{ margin: "16px 0 20px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 18 }}>Team PHV Heatmap & Compliance</b>
        <div style={{ display: "flex", gap: 18, margin: "10px 0 0 0" }}>
          {SQUADS.map((sq, idx) => {
            const filtered = athletes.filter(a => a.squad === sq);
            let risk = "normal";
            filtered.forEach(a => {
              const phvArr = getPHVHistory(a.history);
              const lastPHV = phvArr[phvArr.length - 1]?.phv || 0;
              const lvl = riskLevel(lastPHV);
              if (lvl === "danger") risk = "danger";
              else if (lvl === "risk" && risk !== "danger") risk = "risk";
            });
            return (
              <div key={sq} style={{
                background: SQUAD_COLORS[idx % SQUAD_COLORS.length], borderRadius: 12, padding: "17px 30px", fontWeight: 900, fontSize: 17, color: risk === "danger" ? "#ff4848" : risk === "risk" ? "#FFD700" : "#1de682",
                border: risk === "danger" ? "2.5px solid #ff4848" : risk === "risk" ? "2.5px solid #FFD700" : "2.5px solid #1de682"
              }}>
                {sq} <br />
                <span style={{ fontSize: 22 }}>
                  {risk === "danger" && <FaExclamationTriangle />}
                  {risk === "risk" && <FaBell />}
                  {risk === "normal" && <FaCheck />}
                </span>
                <br />
                <span style={{ color: "#FFD70099", fontWeight: 700 }}>{filtered.length} athletes</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Athlete selection and CRUD */}
      <div style={{ display: "flex", gap: 18, margin: "25px 0 15px 0" }}>
        <div>
          <b style={{ color: "#FFD700", fontSize: 17 }}>Select Athlete:</b>
          <div style={{ marginTop: 7 }}>
            {athletes.map(a =>
              <button key={a.id} onClick={() => setSelected(a.id)}
                style={{
                  background: selected === a.id ? "#FFD700" : "#232a2e",
                  color: selected === a.id ? "#232a2e" : "#FFD700",
                  fontWeight: 800, border: "none", borderRadius: 8, padding: "7px 13px", margin: 2, cursor: "pointer"
                }}>{a.name}</button>
            )}
            <button onClick={() => setAdding("athlete")}
              style={{
                background: "#1de682", color: "#232a2e", fontWeight: 900,
                borderRadius: 8, padding: "7px 13px", margin: "0 0 0 5px"
              }}>+ Add Athlete</button>
          </div>
        </div>
        {adding === "athlete" && (
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <input placeholder="Name" value={athleteName} onChange={e => setAthleteName(e.target.value)} style={inputStyleMini} />
            <input type="date" placeholder="DOB" value={athleteBirth} onChange={e => setAthleteBirth(e.target.value)} style={inputStyleMini} />
            <select value={athleteSquad} onChange={e => setAthleteSquad(e.target.value)} style={inputStyleMini}>
              {SQUADS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleAddAthlete} style={btnStyle}>Add</button>
            <button onClick={() => setAdding(false)} style={btnStyleLight}>Cancel</button>
          </div>
        )}
      </div>
      {/* Comparison panel */}
      <div style={{ marginBottom: 15 }}>
        <b style={{ color: "#FFD700" }}>Compare Athletes (hold Ctrl to multi-select):</b>
        <select
          multiple
          value={compare}
          onChange={e => setCompare(Array.from(e.target.selectedOptions, option => Number(option.value)))}
          style={{ ...inputStyleMini, minWidth: 200, minHeight: 36, fontSize: 15 }}
        >
          {athletes.map(a => <option key={a.id} value={a.id}>{a.name} ({a.squad})</option>)}
        </select>
        {compareAthletes.length > 1 && (
          <div>
            <svg width={400} height={130}>
              {compareAthletes.map((a, idx) => {
                const phvArr = getPHVHistory(a.history);
                return (
                  <polyline
                    key={a.id}
                    fill="none"
                    stroke={SQUAD_COLORS[idx % SQUAD_COLORS.length]}
                    strokeWidth={3}
                    points={phvArr.map((h, i) =>
                      `${30 + i * 65},${110 - h.phv * 5}`
                    ).join(" ")}
                  />
                );
              })}
              {compareAthletes.map((a, idx) => {
                const phvArr = getPHVHistory(a.history);
                return phvArr.map((h, i) => (
                  <circle
                    key={i + "_" + a.id}
                    cx={30 + i * 65}
                    cy={110 - h.phv * 5}
                    r={6}
                    fill={SQUAD_COLORS[idx % SQUAD_COLORS.length]}
                  />
                ));
              })}
              <text x={8} y={19} fill="#FFD700" fontWeight={800}>PHV (cm/year) – Multi Athlete</text>
            </svg>
            <div style={{ color: "#FFD70099", fontSize: 15, marginTop: 4 }}>
              Compare how growth risk and velocity differ by age, position, and intervention.
            </div>
          </div>
        )}
      </div>
      {/* Athlete detail */}
      {athlete && (
        <div>
          <div style={{ marginBottom: 17 }}>
            <span style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>{athlete.name}</span> | Squad: <b style={{ color: "#1de682" }}>{athlete.squad}</b> | DOB: {athlete.birth}
            <button onClick={() => handleDeleteAthlete(athlete.id)} style={{ background: "#ff4848", color: "#fff", borderRadius: 7, fontWeight: 700, padding: "2px 11px", marginLeft: 20, border: "none" }}><FaTrash /></button>
          </div>
          <div style={{ margin: "15px 0 8px 0" }}>
            <b style={{ color: "#FFD700" }}>Growth History / PHV Trend</b>
            <table style={{ width: "100%", fontSize: 16, marginTop: 6 }}>
              <thead>
                <tr style={{ color: "#FFD700" }}>
                  <th>Date</th><th>Height (cm)</th><th>Sitting (cm)</th><th>Weight (kg)</th><th>PHV (cm/yr)</th><th>Risk</th><th>Assign</th>
                </tr>
              </thead>
              <tbody>
                {athlete.history.map((h, i, arr) => {
                  const prev = i > 0 ? arr[i - 1] : null;
                  const phv = prev ? calcPHV(h, prev) : 0;
                  const level = riskLevel(phv);
                  return (
                    <tr key={i} style={{ color: PHV_COLORS[level], fontWeight: 700 }}>
                      <td>{h.date}</td>
                      <td>{h.height}</td>
                      <td>{h.sitting}</td>
                      <td>{h.weight}</td>
                      <td>{i > 0 ? phv.toFixed(1) : "-"}</td>
                      <td>
                        {i > 0 && (
                          <>
                            {level === "danger" && <FaExclamationTriangle color="#ff4848" />}
                            {level === "risk" && <FaBell color="#FFD700" />}
                            {level === "normal" && <FaCheck color="#1de682" />}
                          </>
                        )}
                      </td>
                      <td>
                        {(level === "danger" || level === "risk") && (
                          <button onClick={() => assignMedical(athlete.id)} style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 700, border: "none", padding: "2px 9px", fontSize: 15 }}>
                            <FaUserMd style={{ marginRight: 5 }} /> Physio
                          </button>
                        )}
                        {athlete.assigned && <span style={{ marginLeft: 9, color: "#1de682" }}><FaUserMd /> {athlete.assigned}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button onClick={() => setAdding("entry")}
              style={{
                background: "#FFD700", color: "#232a2e", fontWeight: 900,
                borderRadius: 8, padding: "7px 13px", margin: "12px 0 0 0"
              }}><FaPlus /> Add Entry</button>
            <button onClick={() => addInjury(athlete.id)} style={{
              background: "#FFD70055", color: "#232a2e", borderRadius: 8, fontWeight: 700, border: "none", padding: "7px 13px", marginLeft: 12
            }}>
              <FaHeartbeat style={{ marginRight: 4 }} /> Add Injury
            </button>
            {adding === "entry" && (
              <div style={{ marginTop: 8, display: "flex", gap: 7, alignItems: "center" }}>
                <input type="date" value={entry.date} onChange={e => setEntry({ ...entry, date: e.target.value })} placeholder="Date" style={inputStyleMini} />
                <input value={entry.height} onChange={e => setEntry({ ...entry, height: e.target.value })} placeholder="Height" type="number" style={inputStyleMini} />
                <input value={entry.sitting} onChange={e => setEntry({ ...entry, sitting: e.target.value })} placeholder="Sitting" type="number" style={inputStyleMini} />
                <input value={entry.weight} onChange={e => setEntry({ ...entry, weight: e.target.value })} placeholder="Weight" type="number" style={inputStyleMini} />
                <button onClick={handleAddEntry} style={btnStyle}>Add</button>
                <button onClick={() => setAdding(false)} style={btnStyleLight}>Cancel</button>
              </div>
            )}
          </div>
          {/* PHV trendline (SVG) */}
          <div style={{ margin: "20px 0 10px 0" }}>
            <b style={{ color: "#FFD700" }}>PHV Trendline / Projection</b>
            <svg width={380} height={130}>
              <polyline
                fill="none"
                stroke={trendColor(getPHVHistory(athlete.history))}
                strokeWidth={3}
                points={getPHVHistory(athlete.history).map((h, i) =>
                  `${30 + i * 70},${110 - h.phv * 6}`
                ).join(" ")}
              />
              {getPHVHistory(athlete.history).map((h, i) =>
                <circle key={i} cx={30 + i * 70} cy={110 - h.phv * 6} r={6} fill={PHV_COLORS[riskLevel(h.phv)]} />
              )}
              {/* Projected PHV */}
              {getPHVHistory(athlete.history).length > 0 && (
                <>
                  <line x1={30 + getPHVHistory(athlete.history).length * 70} y1={110 - futurePHV(athlete.history) * 6}
                    x2={30 + (getPHVHistory(athlete.history).length + 1) * 70} y2={110 - futurePHV(athlete.history) * 6}
                    stroke="#FFD700" strokeDasharray="5,5" strokeWidth={3} />
                  <circle cx={30 + (getPHVHistory(athlete.history).length + 1) * 70} cy={110 - futurePHV(athlete.history) * 6} r={7} fill="#FFD700" />
                  <text x={30 + (getPHVHistory(athlete.history).length + 1) * 70 + 6} y={110 - futurePHV(athlete.history) * 6 + 5} fontSize={15} fill="#FFD700" fontWeight={700}>Proj</text>
                </>
              )}
              <text x={10} y={15} fill="#FFD700" fontWeight={800}>PHV (cm/year)</text>
            </svg>
            <div style={{ color: "#FFD70099", fontSize: 15, marginTop: 4 }}>
              <FaCalendarAlt style={{ marginRight: 4 }} /> Next PHV forecast: <b>{futurePHV(athlete.history).toFixed(1)} cm/yr</b>
            </div>
          </div>
          {/* Action items */}
          <div style={{ background: "#232a2e", borderRadius: 13, padding: 10, marginBottom: 8 }}>
            <b style={{ color: "#FFD700" }}><FaTasks style={{ marginRight: 6 }} /> Action Items / Interventions:</b>
            <ul style={{ margin: "6px 0 0 13px", padding: 0 }}>
              {(athlete.actionItems || []).map((x, i) =>
                <li key={i} style={{ color: x.completed ? "#1de682" : "#FFD700", fontWeight: 700 }}>
                  {x.type}: {x.text}{" "}
                  <button onClick={() => markAction(athlete.id, i)} style={{ background: x.completed ? "#1de682" : "#FFD70033", color: "#232a2e", border: "none", borderRadius: 8, padding: "3px 10px", fontWeight: 800 }}>
                    {x.completed ? <FaCheck /> : "Mark done"}
                  </button>
                </li>
              )}
            </ul>
          </div>
          {/* Injuries */}
          {(athlete.injuries || []).length > 0 && (
            <div style={{ background: "#232a2e", borderRadius: 13, padding: 10, marginBottom: 8 }}>
              <b style={{ color: "#FFD700" }}><FaHeartbeat style={{ marginRight: 6 }} /> Injury / RTP:</b>
              <ul style={{ margin: "6px 0 0 13px", padding: 0 }}>
                {athlete.injuries.map((inj, i) => (
                  <li key={i} style={{ color: inj.status === "Completed" ? "#1de682" : "#FFD700", fontWeight: 700 }}>
                    {inj.diagnosis}, {inj.date} – RTP: {inj.rtp} [{inj.status}]
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Athlete notifications */}
          <div style={{ background: "#FFD70022", borderRadius: 13, padding: 10, marginBottom: 8 }}>
            <b style={{ color: "#FFD700" }}><FaEnvelopeOpen style={{ marginRight: 6 }} /> Athlete Notifications:</b>
            <ul style={{ margin: "6px 0 0 13px", padding: 0 }}>
              {(athlete.notifications || []).map((n, i) =>
                <li key={i} style={{ color: "#FFD700", fontWeight: 700 }}>{n.txt} <span style={{ color: "#FFD70099" }}>({n.date})</span></li>
              )}
            </ul>
            <button onClick={() => addNotification(athlete.id, "Coach notified: monitor loading")} style={btnStyleLight}>Simulate Notification</button>
          </div>
          {/* Notes */}
          <div>
            <b style={{ color: "#FFD700" }}>Coach/Parent Notes</b>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} style={{ ...inputStyle, width: 220, minHeight: 34 }} placeholder="Add/update note..." />
            <button onClick={() => handleAddNote(athlete.id)} style={btnStyleLight}><FaCommentDots /> Save</button>
            <div style={{ color: "#FFD70099", marginTop: 4, fontSize: 15 }}>{athlete.notes}</div>
          </div>
        </div>
      )}
      {/* Boardroom Log */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: 13, margin: "28px 0 0 0"
      }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}><FaBell style={{ marginRight: 7 }} /> Coach/Medical/Boardroom Log</b>
        <div style={{ maxHeight: 110, overflowY: "auto", fontSize: 15, marginBottom: 8 }}>
          {teamLog.map((c, i) =>
            <div key={i} style={{ color: PHV_COLORS[c.level], fontWeight: 700 }}>
              {c.msg} <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 7 }}>{c.date}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | Elite Athlete Development Intelligence
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 15, width: 135
};
const inputStyleMini = {
  ...inputStyle, width: 105, fontSize: 14
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "6px 14px", marginRight: 6, cursor: "pointer"
};
const btnStyleLight = {
  background: "#FFD70022", color: "#FFD700", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, padding: "5px 12px", marginLeft: 4, cursor: "pointer"
};

export default PHVModule;
