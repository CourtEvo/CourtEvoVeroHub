import React, { useState } from "react";
import { FaChalkboardTeacher, FaUserPlus, FaPlus, FaCheckCircle, FaTimes, FaEdit, FaRegFilePdf, FaHistory, FaFileExport, FaClock, FaEye, FaSun, FaMoon } from "react-icons/fa";

const LEVELS = ["Head Coach", "Assistant Coach", "Youth Coach", "Skills Coach", "Fitness Coach"];
const CPD_TYPES = ["Workshop", "Course", "Online", "Self-study", "Mentoring", "Event", "Other"];

const INIT_COACHES = [
  {
    id: 1,
    name: "Marko Proleta",
    level: "Head Coach",
    photo: "",
    startDate: "2020-08-01",
    cpdLog: [
      {
        type: "Workshop",
        title: "Modern Offense Tactics",
        date: "2024-04-20",
        hours: 6,
        provider: "EuroLeague",
        cert: "",
        notes: "Elite session",
        approved: true
      },
      {
        type: "Mentoring",
        title: "Mentored Petar Horvat, promoted to U18",
        date: "2024-12-10",
        hours: 4,
        provider: "",
        cert: "",
        notes: "Player promotion: Petar Horvat",
        playerPromoted: "Petar Horvat",
        approved: true
      }
    ],
    playersPromoted: ["Petar Horvat"],
    auditTrail: [
      { date: "2024-08-01", by: "Board", note: "Hired as Head Coach" }
    ]
  }
];

// CPD requirements by level
const CPD_REQUIREMENTS = {
  "Head Coach": { minHours: 24, minWorkshops: 2, minPromotions: 2 },
  "Assistant Coach": { minHours: 16, minWorkshops: 1, minPromotions: 1 },
  "Youth Coach": { minHours: 12, minWorkshops: 1, minPromotions: 1 },
  "Skills Coach": { minHours: 10, minWorkshops: 1, minPromotions: 1 },
  "Fitness Coach": { minHours: 10, minWorkshops: 1, minPromotions: 0 }
};

function sum(arr, f) {
  return arr.reduce((acc, x) => acc + (f(x) || 0), 0);
}

export default function CoachCPDTracker() {
  const [coaches, setCoaches] = useState(INIT_COACHES);
  const [theme, setTheme] = useState("dark");
  const [colorblind, setColorblind] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);
  const [newCoach, setNewCoach] = useState({ name: "", level: LEVELS[0], photo: "", startDate: "", cpdLog: [], playersPromoted: [], auditTrail: [] });
  const [editCoachIdx, setEditCoachIdx] = useState(null);
  const [showCPDModal, setShowCPDModal] = useState(false);
  const [cpdCoachIdx, setCPDCoachIdx] = useState(null);
  const [newCPD, setNewCPD] = useState({ type: CPD_TYPES[0], title: "", date: "", hours: "", provider: "", cert: "", notes: "", playerPromoted: "" });

  // Add new coach
  function saveCoach(e) {
    e.preventDefault();
    if (!newCoach.name) return;
    const coachData = { ...newCoach, id: Date.now(), cpdLog: [], playersPromoted: [], auditTrail: [{ date: new Date().toISOString().slice(0, 10), by: "Board", note: "Coach added" }] };
    setCoaches([coachData, ...coaches]);
    setNewCoach({ name: "", level: LEVELS[0], photo: "", startDate: "", cpdLog: [], playersPromoted: [], auditTrail: [] });
    setShowAddCoach(false);
  }
  // Add CPD entry
  function addCPD(e) {
    e.preventDefault();
    if (!newCPD.title || !newCPD.date || !newCPD.hours) return;
    setCoaches(coaches =>
      coaches.map((c, i) =>
        i === cpdCoachIdx
          ? {
              ...c,
              cpdLog: [{ ...newCPD, approved: false }, ...(c.cpdLog || [])],
              playersPromoted: newCPD.playerPromoted ? Array.from(new Set([...(c.playersPromoted || []), newCPD.playerPromoted])) : c.playersPromoted
            }
          : c
      )
    );
    setShowCPDModal(false);
    setNewCPD({ type: CPD_TYPES[0], title: "", date: "", hours: "", provider: "", cert: "", notes: "", playerPromoted: "" });
  }
  // Approve CPD
  function approveCPD(idx, cpdIdx) {
    setCoaches(coaches =>
      coaches.map((c, i) =>
        i === idx
          ? { ...c, cpdLog: c.cpdLog.map((cpd, j) => j === cpdIdx ? { ...cpd, approved: true } : cpd) }
          : c
      )
    );
  }
  // Delete CPD
  function deleteCPD(idx, cpdIdx) {
    setCoaches(coaches =>
      coaches.map((c, i) =>
        i === idx
          ? { ...c, cpdLog: c.cpdLog.filter((_, j) => j !== cpdIdx) }
          : c
      )
    );
  }

  // Analytics
  const totalCoaches = coaches.length;
  const totalHours = sum(coaches, c => sum(c.cpdLog, e => parseFloat(e.hours)));
  const totalPromoted = sum(coaches, c => c.playersPromoted.length);
  const overdue = coaches.filter(c => {
    const req = CPD_REQUIREMENTS[c.level];
    const yearHours = sum(c.cpdLog, e => new Date(e.date).getFullYear() === new Date().getFullYear() ? parseFloat(e.hours) : 0);
    return yearHours < req.minHours;
  }).length;

  return (
    <div style={{
      background: theme === "dark" ? "#232a2e" : "#f5f5f5",
      color: theme === "dark" ? "#FFD700" : "#232a2e",
      minHeight: "100vh",
      borderRadius: 20,
      padding: 18
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontWeight: 900, marginBottom: 14 }}>
          <FaChalkboardTeacher style={{ marginRight: 8 }} /> Coach CPD Tracker
        </h2>
        <div>
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={btnStyle}>
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => setColorblind(c => !c)} style={btnStyle}><FaEye />{colorblind ? "Colorblind ON" : "Colorblind OFF"}</button>
          <button style={btnStyle} onClick={() => window.print()}><FaFileExport /> Print</button>
        </div>
      </div>
      {/* Analytics */}
      <div style={{ display: "flex", gap: 28, margin: "18px 0", flexWrap: "wrap" }}>
        <div style={snapCard}>Coaches: {totalCoaches}</div>
        <div style={snapCard}>Total CPD Hours: {totalHours}</div>
        <div style={snapCard}>Total Players Promoted: {totalPromoted}</div>
        <div style={snapCard}>Overdue: {overdue}</div>
      </div>
      {/* CPD Requirement Matrix */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontWeight: 900, color: "#FFD700" }}>CPD Requirement Matrix (Annual)</h4>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700" }}>
              <th>Level</th>
              <th>Min Hours</th>
              <th>Min Workshops</th>
              <th>Players Promoted</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map(l =>
              <tr key={l}>
                <td>{l}</td>
                <td>{CPD_REQUIREMENTS[l].minHours}</td>
                <td>{CPD_REQUIREMENTS[l].minWorkshops}</td>
                <td>{CPD_REQUIREMENTS[l].minPromotions}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add Coach */}
      <button style={addBtnStyle} onClick={() => setShowAddCoach(true)}>
        <FaUserPlus /> Add Coach
      </button>
      {showAddCoach && (
        <form onSubmit={saveCoach} style={{
          background: "#232a2e",
          borderRadius: 16,
          padding: "28px 36px",
          marginBottom: 18,
          marginTop: 10,
          boxShadow: "0 2px 18px #FFD70018"
        }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <label style={formLabel}>Name:</label><br />
              <input required value={newCoach.name} onChange={e => setNewCoach(c => ({ ...c, name: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Level:</label><br />
              <select value={newCoach.level} onChange={e => setNewCoach(c => ({ ...c, level: e.target.value }))} style={formInput}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Start Date:</label><br />
              <input type="date" value={newCoach.startDate} onChange={e => setNewCoach(c => ({ ...c, startDate: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Photo URL (optional):</label><br />
              <input value={newCoach.photo} onChange={e => setNewCoach(c => ({ ...c, photo: e.target.value }))} style={formInput} />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: 16, ...addBtnStyle, fontSize: 16, padding: "8px 26px"
          }}>
            <FaCheckCircle style={{ marginRight: 7 }} /> Add Coach
          </button>
          <button type="button" style={editBtnStyle} onClick={() => setShowAddCoach(false)}>
            <FaTimes /> Cancel
          </button>
        </form>
      )}
      {/* Coach Table */}
      <div style={{ background: "#232a2e", borderRadius: 16, padding: "20px 28px", boxShadow: "0 2px 18px #FFD70018", marginBottom: 10, marginTop: 10 }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700" }}>
              <th>Photo</th>
              <th>Name</th>
              <th>Level</th>
              <th>Start</th>
              <th>CPD Hours</th>
              <th>Workshops</th>
              <th>Promoted</th>
              <th>CPD Log</th>
              <th>Status</th>
              <th>Add CPD</th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((c, idx) => {
              const req = CPD_REQUIREMENTS[c.level];
              const yearHours = sum(c.cpdLog, e => new Date(e.date).getFullYear() === new Date().getFullYear() ? parseFloat(e.hours) : 0);
              const yearWorkshops = c.cpdLog.filter(e => e.type === "Workshop" && new Date(e.date).getFullYear() === new Date().getFullYear()).length;
              const status = (yearHours >= req.minHours && yearWorkshops >= req.minWorkshops && (c.playersPromoted.length >= req.minPromotions)) ? "Current" :
                (yearHours >= req.minHours * 0.8 ? "Due Soon" : "Overdue");
              return (
                <tr key={idx} style={{ background: idx % 2 === 0 ? "#21282c" : "#232a2e" }}>
                  <td>
                    {c.photo
                      ? <img src={c.photo} alt={c.name} style={{ width: 38, borderRadius: "50%" }} />
                      : <FaChalkboardTeacher style={{ fontSize: 32, color: "#FFD700" }} />}
                  </td>
                  <td style={{ fontWeight: 800, color: "#FFD700" }}>{c.name}</td>
                  <td>{c.level}</td>
                  <td>{c.startDate}</td>
                  <td style={{ fontWeight: 700 }}>{yearHours}</td>
                  <td>{yearWorkshops}</td>
                  <td>{(c.playersPromoted || []).join(", ")}</td>
                  <td>
                    <button style={btnStyle} onClick={() => { setShowCPDModal(true); setCPDCoachIdx(idx); }}>
                      <FaHistory /> Log
                    </button>
                    {showCPDModal && cpdCoachIdx === idx && (
                      <div style={{
                        background: "#232a2e",
                        color: "#FFD700",
                        borderRadius: 14,
                        padding: 17,
                        margin: 6,
                        minWidth: 420,
                        boxShadow: "0 2px 16px #FFD70033",
                        position: "absolute",
                        zIndex: 9
                      }}>
                        <div style={{ fontWeight: 900, marginBottom: 10 }}>
                          CPD Log for {c.name}
                        </div>
                        <table style={{ width: "100%", fontSize: 15 }}>
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Title</th>
                              <th>Date</th>
                              <th>Hours</th>
                              <th>Provider</th>
                              <th>Cert</th>
                              <th>Player Promoted</th>
                              <th>Notes</th>
                              <th>Approve</th>
                              <th>Delete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {c.cpdLog.map((e, j) => (
                              <tr key={j} style={{ background: e.approved ? "#1de68244" : "#FFD70022" }}>
                                <td>{e.type}</td>
                                <td>{e.title}</td>
                                <td>{e.date}</td>
                                <td>{e.hours}</td>
                                <td>{e.provider}</td>
                                <td>
                                  {e.cert
                                    ? <a href={e.cert} target="_blank" rel="noopener noreferrer"><FaRegFilePdf /></a>
                                    : "-"}
                                </td>
                                <td>{e.playerPromoted || ""}</td>
                                <td>{e.notes}</td>
                                <td>
                                  {!e.approved && (
                                    <button style={addBtnStyle} onClick={() => approveCPD(idx, j)}><FaCheckCircle /></button>
                                  )}
                                </td>
                                <td>
                                  <button style={editBtnStyle} onClick={() => deleteCPD(idx, j)}><FaTimes /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Add CPD Entry */}
                        <form onSubmit={addCPD} style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 12 }}>
                          <select value={newCPD.type} onChange={e => setNewCPD(c => ({ ...c, type: e.target.value }))} style={formInput}>
                            {CPD_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                          <input value={newCPD.title} onChange={e => setNewCPD(c => ({ ...c, title: e.target.value }))} placeholder="Title" style={formInput} />
                          <input type="date" value={newCPD.date} onChange={e => setNewCPD(c => ({ ...c, date: e.target.value }))} style={formInput} />
                          <input value={newCPD.hours} onChange={e => setNewCPD(c => ({ ...c, hours: e.target.value }))} placeholder="Hours" type="number" style={formInput} />
                          <input value={newCPD.provider} onChange={e => setNewCPD(c => ({ ...c, provider: e.target.value }))} placeholder="Provider" style={formInput} />
                          <input value={newCPD.cert} onChange={e => setNewCPD(c => ({ ...c, cert: e.target.value }))} placeholder="Cert URL" style={formInput} />
                          <input value={newCPD.playerPromoted} onChange={e => setNewCPD(c => ({ ...c, playerPromoted: e.target.value }))} placeholder="Player Promoted (optional)" style={formInput} />
                          <input value={newCPD.notes} onChange={e => setNewCPD(c => ({ ...c, notes: e.target.value }))} placeholder="Notes" style={formInput} />
                          <button type="submit" style={addBtnStyle}><FaPlus /> Add</button>
                        </form>
                        <button style={editBtnStyle} onClick={() => setShowCPDModal(false)}><FaTimes /> Close</button>
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      color: status === "Current" ? "#1de682" : status === "Due Soon" ? "#FFD700" : "#e82e2e",
                      fontWeight: 900
                    }}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <button style={addBtnStyle} onClick={() => { setShowCPDModal(true); setCPDCoachIdx(idx); }}>
                      <FaPlus /> CPD
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "13px 21px",
        fontWeight: 600,
        fontSize: 15
      }}>
        <FaChalkboardTeacher style={{ marginRight: 7, verticalAlign: -2 }} />
        Track coach learning, growth, and the impact of developing players—export and print for board/HR audit.
      </div>
    </div>
  );
}

const btnStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 18,
  padding: "8px 12px",
  margin: "0 4px",
  cursor: "pointer"
};
const addBtnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 900,
  fontSize: 15,
  marginLeft: 12,
  boxShadow: "0 2px 12px #1de68244",
  cursor: "pointer"
};
const editBtnStyle = {
  background: "#FFD70022",
  color: "#FFD700",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 17,
  padding: "6px 11px",
  boxShadow: "0 1px 7px #FFD70022",
  cursor: "pointer"
};
const formInput = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 15,
  padding: "7px 13px",
  width: 110,
  marginBottom: 8
};
const snapCard = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 15,
  fontWeight: 800,
  fontSize: 17,
  padding: "14px 20px",
  minWidth: 150
};
const formLabel = {
  color: "#FFD700",
  fontWeight: 800,
  fontSize: 14
};
