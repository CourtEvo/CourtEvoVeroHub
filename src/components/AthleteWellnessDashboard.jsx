import React, { useState, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, Line } from "recharts";
import { motion } from "framer-motion";
import { FaUser, FaHeartbeat, FaFileExport, FaNotesMedical, FaExclamationTriangle, FaCheck, FaBell } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

// Demo data
const PLAYERS = [
  { id: "p1", name: "Marko Horvat", team: "U14" },
  { id: "p2", name: "Luka Petrović", team: "U16" }
];

// Each week is a record: { week, sleep, soreness, energy, injury, comment, coachNote }
const INIT_WEEKS = [
  [
    { week: "Wk 1", sleep: 7.5, soreness: 2, energy: 3, injury: false, comment: "Felt good", coachNote: "" },
    { week: "Wk 2", sleep: 6, soreness: 4, energy: 2, injury: false, comment: "Slight knee pain", coachNote: "" },
    { week: "Wk 3", sleep: 8, soreness: 1, energy: 3, injury: false, comment: "High energy", coachNote: "" },
    { week: "Wk 4", sleep: 6, soreness: 5, energy: 1, injury: true, comment: "Minor ankle sprain", coachNote: "" },
    { week: "Wk 5", sleep: 7, soreness: 3, energy: 2, injury: false, comment: "Back to normal", coachNote: "" }
  ],
  [
    { week: "Wk 1", sleep: 8, soreness: 1, energy: 3, injury: false, comment: "All good", coachNote: "" },
    { week: "Wk 2", sleep: 7, soreness: 2, energy: 3, injury: false, comment: "Felt strong", coachNote: "" },
    { week: "Wk 3", sleep: 7.5, soreness: 3, energy: 2, injury: false, comment: "Lower energy", coachNote: "" },
    { week: "Wk 4", sleep: 6.5, soreness: 4, energy: 2, injury: false, comment: "Soreness after game", coachNote: "" },
    { week: "Wk 5", sleep: 6, soreness: 5, energy: 1, injury: true, comment: "Hamstring tightness", coachNote: "" }
  ]
];

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const AthleteWellnessDashboard = () => {
  const [playerIdx, setPlayerIdx] = useState(0);
  const [weeks, setWeeks] = useState(INIT_WEEKS);
  const [noteVal, setNoteVal] = useState("");
  const [newEntry, setNewEntry] = useState({ sleep: "", soreness: "", energy: "", injury: false, comment: "" });
  const sectionRef = useRef();

  const player = PLAYERS[playerIdx];
  const data = weeks[playerIdx];

  // Status logic
  function weekStatus(w) {
    if (w.injury) return "red";
    if (w.soreness > 3 || w.energy < 2 || w.sleep < 6.5) return "yellow";
    return "green";
  }
  function statusBadge(status) {
    if (status === "green") return <span style={{ background: "#27ef7d", color: "#222", borderRadius: 7, padding: "2px 7px" }}><FaCheck /> OK</span>;
    if (status === "yellow") return <span style={{ background: "#FFD700", color: "#222", borderRadius: 7, padding: "2px 7px" }}><FaExclamationTriangle /> Monitor</span>;
    return <span style={{ background: "#e94057", color: "#fff", borderRadius: 7, padding: "2px 7px" }}><FaExclamationTriangle /> At Risk</span>;
  }

  // Multi-player trend: compute team avg for each week index
  const numWeeks = Math.max(...weeks.map(w => w.length));
  const teamAvg = Array.from({ length: numWeeks }, (_, i) => {
    const weekObjs = weeks.map(w => w[i]).filter(Boolean);
    if (weekObjs.length === 0) return null;
    return {
      week: weekObjs[0].week,
      sleep: +(weekObjs.reduce((s, w) => s + w.sleep, 0) / weekObjs.length).toFixed(2),
      soreness: +(weekObjs.reduce((s, w) => s + w.soreness, 0) / weekObjs.length).toFixed(2),
      energy: +(weekObjs.reduce((s, w) => s + w.energy, 0) / weekObjs.length).toFixed(2)
    };
  }).filter(Boolean);

  // Team-wide risk alert
  const playerRisks = weeks.map(wArr =>
    wArr.filter(w => weekStatus(w) === "red").length
  );
  const anyHighRisk = playerRisks.find(r => r > 1);
  const mostAtRiskIdx = playerRisks.reduce((maxIdx, val, idx, arr) => val > arr[maxIdx] ? idx : maxIdx, 0);

  // Export PDF
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `Wellness_${player.name}_${new Date().toISOString().slice(0, 10)}`
  });

  // Update coach note
  function saveCoachNote(idx) {
    setWeeks(ws =>
      ws.map((pWeeks, pIdx) =>
        pIdx === playerIdx
          ? pWeeks.map((w, i) => (i === idx ? { ...w, coachNote: noteVal } : w))
          : pWeeks
      )
    );
    setNoteVal("");
  }

  // Add new weekly log
  function handleAddEntry(e) {
    e.preventDefault();
    setWeeks(ws =>
      ws.map((pWeeks, pIdx) =>
        pIdx === playerIdx
          ? [
              ...pWeeks,
              {
                week: `Wk ${pWeeks.length + 1}`,
                sleep: Number(newEntry.sleep),
                soreness: Number(newEntry.soreness),
                energy: Number(newEntry.energy),
                injury: Boolean(newEntry.injury),
                comment: newEntry.comment,
                coachNote: ""
              }
            ]
          : pWeeks
      )
    );
    setNewEntry({ sleep: "", soreness: "", energy: false, injury: false, comment: "" });
  }

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <div style={{ fontSize: 27, color: "#FFD700", fontWeight: 700, marginBottom: 12 }}>
          Athlete Wellness & Availability Dashboard
        </div>
        {/* Player selector */}
        <div style={{ display: "flex", gap: 15, alignItems: "center", marginBottom: 13 }}>
          <FaUser style={{ color: "#FFD700", fontSize: 20, marginRight: 5 }} />
          <select
            value={playerIdx}
            onChange={e => setPlayerIdx(Number(e.target.value))}
            style={{ fontSize: 17, borderRadius: 6, padding: "7px 10px", fontWeight: 600 }}>
            {PLAYERS.map((p, i) => (
              <option value={i} key={p.id}>{p.name} ({p.team})</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "7px 18px", fontSize: 16, cursor: "pointer" }}>
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} /> Export PDF
          </button>
        </div>
        {/* Team trend/alerts */}
        <div style={{ marginBottom: 10, color: "#FFD700", fontWeight: 700 }}>
          <FaHeartbeat style={{ color: "#FFD700", marginBottom: -2, marginRight: 3 }} />
          Team Risk Monitor:&nbsp;
          {anyHighRisk
            ? <span style={{ color: "#e94057", fontWeight: 700 }}><FaBell /> {PLAYERS[mostAtRiskIdx].name} flagged as 'At Risk' for {playerRisks[mostAtRiskIdx]} weeks!</span>
            : <span style={{ color: "#27ef7d" }}>No multi-week red flags across the team.</span>
          }
        </div>
        {/* Charts */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ width: 370, height: 205, background: "#1a1d24", borderRadius: 14, padding: 7 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="wellnessY" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity={0.8} />
                    <stop offset="90%" stopColor="#FFD700" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" />
                <YAxis domain={[0, 10]} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="sleep" stroke="#27ef7d" fill="#27ef7d33" name="Sleep (hrs)" />
                <Area type="monotone" dataKey="soreness" stroke="#e94057" fill="url(#wellnessY)" name="Soreness (1-5)" />
                <Area type="monotone" dataKey="energy" stroke="#FFD700" fill="#FFD70022" name="Energy (1-3)" />
                {/* Team average trend */}
                <Line type="monotone" dataKey="sleep" data={teamAvg} stroke="#FFD700" strokeDasharray="5 2" dot={false} name="Team Avg Sleep" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: 260, height: 205, background: "#1a1d24", borderRadius: 14, padding: 7 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="injury" fill="#e94057" name="Injury/Unavailable">
                  {data.map((w, idx) => (
                    <Cell key={idx} fill={w.injury ? "#e94057" : "#27ef7d"} />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Weekly logs */}
        <div style={{ marginBottom: 12 }}>
          <table style={{ width: "100%", background: "#FFD70009", borderRadius: 7, fontSize: 16, borderCollapse: "collapse" }}>
            <thead style={{ background: "#222", color: "#FFD700" }}>
              <tr>
                <th>Week</th>
                <th>Sleep</th>
                <th>Soreness</th>
                <th>Energy</th>
                <th>Status</th>
                <th>Injury</th>
                <th>Player Comment</th>
                <th>Coach/Medical Note</th>
              </tr>
            </thead>
            <tbody>
              {data.map((w, i) => {
                const status = weekStatus(w);
                return (
                  <tr key={i} style={{
                    color: status === "green" ? "#27ef7d"
                      : status === "yellow" ? "#FFD700"
                      : "#e94057",
                    fontWeight: 600,
                    background: i % 2 === 0 ? "#fff1" : "#fff0"
                  }}>
                    <td>{w.week}</td>
                    <td>{w.sleep}h</td>
                    <td>{w.soreness}</td>
                    <td>{w.energy}</td>
                    <td>{statusBadge(status)}</td>
                    <td>
                      {w.injury ? <span style={{ color: "#e94057", fontWeight: 700 }}>YES</span> : "No"}
                    </td>
                    <td>{w.comment}</td>
                    <td>
                      <div>
                        {w.coachNote}
                        <form style={{ marginTop: 2, display: "inline" }}
                          onSubmit={e => { e.preventDefault(); saveCoachNote(i); }}>
                          <input
                            value={noteVal}
                            onChange={e => setNoteVal(e.target.value)}
                            placeholder="Add note"
                            style={{ width: 80, fontSize: 14, borderRadius: 4, marginLeft: 5 }}
                          />
                          <button type="submit" style={{
                            background: "#27ef7d", border: "none", color: "#222", borderRadius: 4,
                            padding: "1px 9px", marginLeft: 3, fontSize: 13, fontWeight: 700
                          }}><FaNotesMedical /> Save</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Add new weekly entry */}
        <form onSubmit={handleAddEntry} style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          <span style={{ color: "#FFD700", fontWeight: 700 }}>Log new week:</span>
          <input
            type="number"
            step="0.1"
            placeholder="Sleep (h)"
            value={newEntry.sleep}
            onChange={e => setNewEntry(n => ({ ...n, sleep: e.target.value }))}
            style={{ width: 75, fontSize: 15, borderRadius: 5 }}
            min={0} max={12}
            required
          />
          <input
            type="number"
            placeholder="Soreness (1-5)"
            value={newEntry.soreness}
            onChange={e => setNewEntry(n => ({ ...n, soreness: e.target.value }))}
            style={{ width: 55, fontSize: 15, borderRadius: 5 }}
            min={1} max={5}
            required
          />
          <input
            type="number"
            placeholder="Energy (1-3)"
            value={newEntry.energy}
            onChange={e => setNewEntry(n => ({ ...n, energy: e.target.value }))}
            style={{ width: 55, fontSize: 15, borderRadius: 5 }}
            min={1} max={3}
            required
          />
          <label style={{ color: "#FFD700", fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={newEntry.injury}
              onChange={e => setNewEntry(n => ({ ...n, injury: e.target.checked }))}
              style={{ marginRight: 3 }}
            />Injury
          </label>
          <input
            type="text"
            placeholder="Comment"
            value={newEntry.comment}
            onChange={e => setNewEntry(n => ({ ...n, comment: e.target.value }))}
            style={{ width: 120, fontSize: 15, borderRadius: 5 }}
          />
          <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, padding: "5px 11px" }}>Add</button>
        </form>
        {/* Quick Analytics */}
        <div style={{ color: "#FFD700", fontWeight: 700 }}>
          <b>Summary:</b>
          {" "}{data.filter(w => weekStatus(w) === "red").length > 0
            ? <span style={{ color: "#e94057" }}>Player at risk—see injury/soreness trend!</span>
            : data.filter(w => weekStatus(w) === "yellow").length > 0
              ? <span style={{ color: "#FFD700" }}>Monitor this player—flagged weeks present.</span>
              : <span style={{ color: "#27ef7d" }}>All weeks OK!</span>
          }
        </div>
        <div style={{ color: "#FFD700bb", fontSize: 15, marginTop: 8 }}>
          <b>Tip:</b> Log and monitor for early detection of overload, under-recovery, or injury.<br />
          PDF report ready for coach/medical/parent meetings.
        </div>
      </motion.section>
    </div>
  );
};

export default AthleteWellnessDashboard;
