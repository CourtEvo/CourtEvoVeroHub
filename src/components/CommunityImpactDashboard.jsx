import React, { useState } from "react";
import {
  FaBullhorn, FaHandHoldingHeart, FaCalendarAlt, FaUsers, FaMedal, FaFilePdf, FaFileExcel, FaFlag, FaHistory, FaCheckCircle, FaExclamationTriangle, FaStar, FaEdit, FaThumbsUp, FaThumbsDown, FaPrint
} from "react-icons/fa";

// Categories/colors
const CATS = {
  "School Clinic": "#1de682",
  "Charity Event": "#FFD700",
  "Public Event": "#FFD700",
  "Education": "#5ec8f8",
  "Health Initiative": "#e82e2e",
  "Partnership": "#5ec8f8",
  "Anti-Bullying": "#ff5722",
  "Other": "#bbb"
};
const GROUPS = [
  "Local Schools",
  "Low-Income",
  "Special Needs",
  "Youth",
  "Families",
  "Coaches",
  "Teachers",
  "Public",
  "Other"
];

const INIT_PROGRAMS = [
  {
    title: "Basketball in Schools",
    type: "School Clinic",
    targets: ["Youth", "Local Schools"],
    reach: 120,
    schools: 5,
    hours: 18,
    mediaHits: 4,
    special: "Two scholarships awarded",
    lastRun: "2025-04-11",
    owner: "Coach Luka",
    testimonial: "We saw kids who had never played pick up a ball! – School principal",
    photo: "",
    qualitative: 4,
    recurring: true,
    boardStatus: "Approved",
    log: [
      { by: "Board", date: "2025-04-12", note: "Clinic completed, coverage in Sportske Novosti." }
    ]
  },
  {
    title: "City Charity 3x3",
    type: "Charity Event",
    targets: ["Public", "Youth"],
    reach: 60,
    schools: 0,
    hours: 6,
    mediaHits: 2,
    special: "€1500 raised for local hospital",
    lastRun: "2025-05-02",
    owner: "Board",
    testimonial: "Local media called it 'the best city event of the spring.'",
    photo: "",
    qualitative: 5,
    recurring: false,
    boardStatus: "Pending",
    log: [
      { by: "Board", date: "2025-05-02", note: "Excellent public turnout." }
    ]
  },
  {
    title: "Family Open Day",
    type: "Public Event",
    targets: ["Families", "Public"],
    reach: 80,
    schools: 0,
    hours: 4,
    mediaHits: 3,
    special: "Free basketball clinic for parents and kids",
    lastRun: "2025-03-15",
    owner: "Admin",
    testimonial: "First time my son played with pro coaches! – Parent",
    photo: "",
    qualitative: 5,
    recurring: true,
    boardStatus: "Approved",
    log: [
      { by: "Admin", date: "2025-03-15", note: "Positive community feedback." }
    ]
  },
  {
    title: "Coach-to-Coach Forum",
    type: "Education",
    targets: ["Coaches", "Teachers"],
    reach: 25,
    schools: 0,
    hours: 3,
    mediaHits: 1,
    special: "New regional partnership",
    lastRun: "2025-05-22",
    owner: "Coach Marko",
    testimonial: "Inspired to collaborate for player growth.",
    photo: "",
    qualitative: 4,
    recurring: false,
    boardStatus: "Approved",
    log: [
      { by: "Board", date: "2025-05-22", note: "Presented player development model." }
    ]
  },
  {
    title: "Anti-Bullying Campaign",
    type: "Anti-Bullying",
    targets: ["Youth", "Schools", "Low-Income"],
    reach: 200,
    schools: 7,
    hours: 10,
    mediaHits: 5,
    special: "City council supported; 3 follow-up workshops",
    lastRun: "2025-04-25",
    owner: "Community Officer",
    testimonial: "Changed my son’s attitude. – Parent",
    photo: "",
    qualitative: 5,
    recurring: true,
    boardStatus: "Pending",
    log: [
      { by: "Board", date: "2025-04-26", note: "Workshop requests increased after TV spot." }
    ]
  },
  {
    title: "Health Day: Active Life",
    type: "Health Initiative",
    targets: ["Public", "Youth"],
    reach: 100,
    schools: 2,
    hours: 8,
    mediaHits: 4,
    special: "Medical screenings + sports",
    lastRun: "2025-04-18",
    owner: "Medical Partner",
    testimonial: "Grateful for free checkup – Local family",
    photo: "",
    qualitative: 5,
    recurring: false,
    boardStatus: "Declined",
    log: [
      { by: "Board", date: "2025-04-18", note: "Low turnout, consider better timing next year." }
    ]
  }
];

// For simple star display
function stars(n) { return [...Array(5)].map((_, i) => <FaStar key={i} color={i < n ? "#FFD700" : "#555"} />); }

export default function CommunityImpactDashboard() {
  const [programs, setPrograms] = useState(INIT_PROGRAMS);
  const [notif, setNotif] = useState("");
  const [showLogIdx, setShowLogIdx] = useState(null);
  const [addNote, setAddNote] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [reportMode, setReportMode] = useState(false);

  const emptyProgram = {
    title: "",
    type: "",
    targets: [],
    reach: "",
    schools: "",
    hours: "",
    mediaHits: "",
    special: "",
    lastRun: "",
    owner: "",
    testimonial: "",
    photo: "",
    qualitative: 3,
    recurring: false,
    boardStatus: "Pending",
    log: []
  };
  const [newProgram, setNewProgram] = useState(emptyProgram);

  // --- Analytics ---
  const totalEvents = programs.length;
  const totalReach = programs.reduce((a, p) => a + (Number(p.reach) || 0), 0);
  const totalSchools = programs.reduce((a, p) => a + (Number(p.schools) || 0), 0);
  const totalHours = programs.reduce((a, p) => a + (Number(p.hours) || 0), 0);
  const totalMedia = programs.reduce((a, p) => a + (Number(p.mediaHits) || 0), 0);
  const totalSust = programs.filter(p => p.recurring).length;
  const mostServed = GROUPS.map(g => ({
    group: g,
    count: programs.filter(p => (p.targets || []).includes(g)).length
  })).sort((a, b) => b.count - a.count)[0];

  // --- Gaps ---
  const GOALS = { youth: 200, events: 6, media: 10, schools: 6 };
  const gaps = [];
  if (totalReach < GOALS.youth) gaps.push("Youth reached below goal");
  if (totalEvents < GOALS.events) gaps.push("Too few events");
  if (totalSchools < GOALS.schools) gaps.push("Not enough schools engaged");
  if (totalMedia < GOALS.media) gaps.push("Low media coverage");

  // --- Add/Edit ---
  function saveProgram(e) {
    e.preventDefault();
    const finalProgram = {
      ...newProgram,
      reach: Number(newProgram.reach),
      schools: Number(newProgram.schools),
      hours: Number(newProgram.hours),
      mediaHits: Number(newProgram.mediaHits),
      log: newProgram.log.length === 0 ? [{ by: "Admin", date: new Date().toISOString().slice(0, 10), note: editIdx == null ? "Program created." : "Program edited." }] : newProgram.log
    };
    if (editIdx == null) {
      setPrograms([finalProgram, ...programs]);
    } else {
      setPrograms(programs.map((p, i) => i === editIdx ? finalProgram : p));
    }
    setAddMode(false);
    setEditIdx(null);
    setNewProgram(emptyProgram);
  }
  function editProgram(idx) {
    setEditIdx(idx);
    setAddMode(true);
    setNewProgram({ ...programs[idx] });
  }

  function handleExport(fmt) {
    alert(`Export as ${fmt} coming soon!`);
  }

  function addLog(idx) {
    if (!addNote.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setPrograms(programs =>
      programs.map((p, i) =>
        i === idx
          ? { ...p, log: [{ by: "Board", date: today, note: addNote }, ...(p.log || [])] }
          : p
      )
    );
    setAddNote("");
    setShowLogIdx(null);
  }

  // Board approval workflow
  function setStatus(idx, status) {
    setPrograms(programs =>
      programs.map((p, i) =>
        i === idx
          ? { ...p, boardStatus: status, log: [{ by: "Board", date: new Date().toISOString().slice(0, 10), note: `Status changed to ${status}.` }, ...(p.log || [])] }
          : p
      )
    );
  }

  // Auto report generator: opens a new printable window
  function printReport() {
    const html = `
      <html>
        <head>
          <title>Community Impact Report</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; color: #222; margin: 40px; }
            h1 { color: #232a2e; }
            .program { border-left: 8px solid #FFD700; background: #f8f8f8; margin-bottom: 28px; padding: 22px 26px 22px 20px; border-radius: 14px; box-shadow: 0 2px 15px #232a2e22; }
            .header { font-weight: 900; font-size: 22px; color: #232a2e; margin-bottom: 4px;}
            .info { font-size: 15px; color: #232a2e; margin-bottom: 7px;}
            .cat { font-weight: 700; font-size: 16px; color: #FFD700;}
            .score { color: #FFD700; font-weight: 900; font-size: 16px;}
            .testimonial { font-style: italic; color: #888; margin-top: 9px;}
            .approved { color: #1de682; font-weight: bold;}
            .pending { color: #FFD700; font-weight: bold;}
            .declined { color: #e82e2e; font-weight: bold;}
          </style>
        </head>
        <body>
          <h1>Community Impact Report</h1>
          <div style="margin-bottom:18px;">
            <b>Total Programs:</b> ${programs.length}<br>
            <b>Youth Reached:</b> ${totalReach}<br>
            <b>Schools:</b> ${totalSchools}<br>
            <b>Hours Delivered:</b> ${totalHours}<br>
            <b>Media Hits:</b> ${totalMedia}<br>
            <b>Sustainable:</b> ${totalSust}<br>
            <b>Most-Served Group:</b> ${mostServed ? mostServed.group : "-"}<br>
          </div>
          ${programs.map(p => `
            <div class="program" style="border-left-color:${CATS[p.type] || "#FFD700"}">
              <div class="header">${p.title} <span class="cat">(${p.type})</span></div>
              <div class="info">Target Groups: ${(p.targets || []).join(", ")}<br>
                Owner: <b>${p.owner}</b> | Last Run: <b>${p.lastRun}</b> | Status: 
                <span class="${p.boardStatus === "Approved" ? "approved" : (p.boardStatus === "Pending" ? "pending" : "declined")}">${p.boardStatus}</span>
              </div>
              <div class="info">Youth Reached: <b>${p.reach}</b> | Schools: <b>${p.schools}</b> | Hours: <b>${p.hours}</b> | Media: <b>${p.mediaHits}</b></div>
              <div class="info">Special Outcome: ${p.special || "-"}</div>
              <div class="score">Impact Score: ${"★".repeat(p.qualitative)}${"☆".repeat(5-p.qualitative)}</div>
              <div class="info">Recurring: <b>${p.recurring ? "Yes" : "No"}</b></div>
              <div class="testimonial">${p.testimonial || ""}</div>
            </div>
          `).join("")}
        </body>
      </html>
    `;
    const win = window.open("", "_blank", "width=1000,height=900");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 450);
  }

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 12 }}>
        Community Impact <FaHandHoldingHeart style={{ marginLeft: 10, color: "#1de682", fontSize: 22, verticalAlign: -2 }} />
        <button onClick={() => handleExport("PDF")} style={btnStyle}><FaFilePdf style={{ marginRight: 7 }} />PDF</button>
        <button onClick={() => handleExport("Excel")} style={btnStyle}><FaFileExcel style={{ marginRight: 7 }} />Excel</button>
        <button onClick={() => { setAddMode(true); setEditIdx(null); setNewProgram(emptyProgram); }} style={recruitBtnStyle}>
          <FaBullhorn style={{ marginRight: 6 }} />
          New Program
        </button>
        <button onClick={printReport} style={printBtnStyle}><FaPrint style={{ marginRight: 8 }} />Auto Report</button>
      </h2>
      {/* Analytics */}
      <div style={{ display: "flex", gap: 30, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Events: <b>{totalEvents}</b></span>
        <span style={{ color: "#1de682", fontWeight: 700 }}>Total Youth Reached: <b>{totalReach}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Schools: <b>{totalSchools}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Hours Delivered: <b>{totalHours}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Media Hits: <b>{totalMedia}</b></span>
        <span style={{ color: "#1de682", fontWeight: 700 }}>Sustainable: <b>{totalSust}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Most-Served: <b>{mostServed ? mostServed.group : "-"}</b></span>
        <span style={{ color: "#1de682", fontWeight: 700 }}>Avg. Impact: <b>{(programs.reduce((a, p) => a + (Number(p.qualitative) || 0), 0) / (programs.length || 1)).toFixed(1)} <FaStar color="#FFD700" /></b></span>
      </div>
      {/* Gaps */}
      {gaps.length > 0 && (
        <div style={{
          background: "#e82e2e",
          color: "#FFD700",
          fontWeight: 900,
          borderRadius: 10,
          marginBottom: 13,
          padding: "11px 19px",
          fontSize: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <FaFlag style={{ marginRight: 10 }} />
          Gaps: {gaps.map(g => (
            <span key={g} style={{ marginLeft: 12, color: "#fff" }}>{g}</span>
          ))}
        </div>
      )}
      {/* Add/Edit Program */}
      {addMode && (
        <form onSubmit={saveProgram} style={{
          background: "#232a2e",
          borderRadius: 16,
          padding: "28px 36px",
          marginBottom: 18,
          boxShadow: "0 2px 18px #FFD70018"
        }}>
          <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 9 }}>
            {editIdx == null ? "Add Community Program" : "Edit Community Program"}
          </div>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <div>
              <label style={formLabel}>Title:</label><br />
              <input required value={newProgram.title} onChange={e => setNewProgram(p => ({ ...p, title: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Type:</label><br />
              <select required value={newProgram.type} onChange={e => setNewProgram(p => ({ ...p, type: e.target.value }))} style={formInput}>
                <option value="">-</option>
                {Object.keys(CATS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Target Groups:</label><br />
              <select multiple value={newProgram.targets} onChange={e => setNewProgram(p => ({
                ...p, targets: Array.from(e.target.selectedOptions, o => o.value)
              }))} style={{ ...formInput, height: 58 }}>
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Youth Reached:</label><br />
              <input required type="number" value={newProgram.reach} onChange={e => setNewProgram(p => ({ ...p, reach: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Schools Involved:</label><br />
              <input type="number" value={newProgram.schools} onChange={e => setNewProgram(p => ({ ...p, schools: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Hours Delivered:</label><br />
              <input required type="number" value={newProgram.hours} onChange={e => setNewProgram(p => ({ ...p, hours: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Media Hits:</label><br />
              <input type="number" value={newProgram.mediaHits} onChange={e => setNewProgram(p => ({ ...p, mediaHits: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Special Outcome:</label><br />
              <input value={newProgram.special} onChange={e => setNewProgram(p => ({ ...p, special: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Last Run Date:</label><br />
              <input type="date" value={newProgram.lastRun} onChange={e => setNewProgram(p => ({ ...p, lastRun: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Owner:</label><br />
              <input value={newProgram.owner} onChange={e => setNewProgram(p => ({ ...p, owner: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Impact Story/Testimonial:</label><br />
              <input value={newProgram.testimonial} onChange={e => setNewProgram(p => ({ ...p, testimonial: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Qualitative Score:</label><br />
              <select value={newProgram.qualitative} onChange={e => setNewProgram(p => ({ ...p, qualitative: Number(e.target.value) }))} style={formInput}>
                {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Star{s > 1 && "s"}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Sustainable/Recurring:</label><br />
              <input type="checkbox" checked={newProgram.recurring} onChange={e => setNewProgram(p => ({ ...p, recurring: e.target.checked }))} style={{ ...formInput, width: 20 }} />
              <span style={{ marginLeft: 8, color: "#FFD700" }}>Recurring</span>
            </div>
          </div>
          <button type="submit" style={{
            marginTop: 16, ...recruitBtnStyle, fontSize: 16, padding: "8px 26px"
          }}>
            <FaCheckCircle style={{ marginRight: 7 }} /> {editIdx == null ? "Add Program" : "Save Changes"}
          </button>
        </form>
      )}
      {/* Table */}
      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "24px 38px",
        boxShadow: "0 2px 18px #FFD70018",
        marginBottom: 12,
        marginTop: 10
      }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th>Title</th>
              <th>Type</th>
              <th>Target Groups</th>
              <th>Youth Reached</th>
              <th>Schools</th>
              <th>Hours</th>
              <th>Media Hits</th>
              <th>Special Outcome</th>
              <th>Last Run</th>
              <th>Owner</th>
              <th>Impact Story</th>
              <th>Score</th>
              <th>Recurring</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Board</th>
              <th>Audit Log</th>
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 && (
              <tr>
                <td colSpan={17} style={{ color: "#e82e2e", fontWeight: 900, textAlign: "center", padding: 24 }}>
                  No programs found.
                </td>
              </tr>
            )}
            {programs.map((p, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff",
                borderLeft: `9px solid ${CATS[p.type] || "#bbb"}`
              }}>
                <td style={{ fontWeight: 800, color: "#FFD700" }}>{p.title}</td>
                <td style={{ color: CATS[p.type] || "#FFD700", fontWeight: 700 }}>{p.type}</td>
                <td>{(p.targets || []).join(", ")}</td>
                <td style={{ fontWeight: 700, color: "#FFD700" }}>{p.reach}</td>
                <td>{p.schools}</td>
                <td>{p.hours}</td>
                <td>{p.mediaHits}</td>
                <td>{p.special}</td>
                <td>{p.lastRun}</td>
                <td>{p.owner}</td>
                <td style={{ color: "#FFD700", fontWeight: 500, maxWidth: 120 }}>{p.testimonial}</td>
                <td style={{ fontWeight: 900 }}>{stars(p.qualitative)}</td>
                <td>{p.recurring ? <span style={{ color: "#1de682", fontWeight: 900 }}>Yes</span> : "No"}</td>
                <td style={{ fontWeight: 800 }}>
                  {p.boardStatus === "Approved" && <span style={{ color: "#1de682" } }><FaThumbsUp style={{ marginRight: 4 }}/>Approved</span>}
                  {p.boardStatus === "Pending" && <span style={{ color: "#FFD700" } }><FaExclamationTriangle style={{ marginRight: 4 }}/>Pending</span>}
                  {p.boardStatus === "Declined" && <span style={{ color: "#e82e2e" } }><FaThumbsDown style={{ marginRight: 4 }}/>Declined</span>}
                </td>
                <td>
                  <button onClick={() => editProgram(idx)} style={editBtnStyle}><FaEdit /></button>
                </td>
                <td>
                  <button disabled={p.boardStatus === "Approved"} onClick={() => setStatus(idx, "Approved")} style={boardBtnStyle}><FaThumbsUp /></button>
                  <button disabled={p.boardStatus === "Declined"} onClick={() => setStatus(idx, "Declined")} style={boardBtnStyle}><FaThumbsDown /></button>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button style={logBtnStyle}
                    onClick={() => setShowLogIdx(showLogIdx === idx ? null : idx)}
                  >
                    <FaHistory style={{ marginRight: 7 }} />
                    Log
                  </button>
                  {showLogIdx === idx && (
                    <div style={{
                      position: "absolute",
                      background: "#181e23",
                      color: "#FFD700",
                      borderRadius: 10,
                      padding: "14px 21px",
                      boxShadow: "0 3px 20px #FFD70033",
                      minWidth: 250,
                      zIndex: 10,
                      marginTop: 12
                    }}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>
                        <FaHistory style={{ marginRight: 6 }} />Audit Log
                      </div>
                      <ul style={{ marginLeft: 9, marginBottom: 8 }}>
                        {(p.log && p.log.length > 0)
                          ? p.log.map((l, i) =>
                            <li key={i}><b>{l.by}</b> <span style={{ color: "#fff" }}>({l.date})</span>: {l.note}</li>
                          )
                          : <li style={{ color: "#1de682" }}>No entries yet.</li>
                        }
                      </ul>
                      <textarea
                        placeholder="Add board/staff note..."
                        value={addNote}
                        onChange={e => setAddNote(e.target.value)}
                        style={{
                          background: "#232a2e",
                          color: "#FFD700",
                          border: "1.5px solid #FFD700",
                          borderRadius: 7,
                          fontWeight: 700,
                          fontSize: 14,
                          padding: "8px 13px",
                          width: "100%",
                          marginBottom: 7,
                          minHeight: 37
                        }}
                      />
                      <button style={logBtnStyle}
                        onClick={() => addLog(idx)}
                      >
                        Add Note
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
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
        <FaHandHoldingHeart style={{ marginRight: 7, verticalAlign: -2 }} />
        Board, management, and sponsors see live, auditable evidence of community impact, public engagement, and program approval—export, print, or audit any time.
      </div>
    </div>
  );
}

const btnStyle = {
  float: "right",
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 800,
  fontSize: 15,
  boxShadow: "0 2px 8px #FFD70044",
  marginTop: 3,
  marginLeft: 6,
  cursor: "pointer",
  transition: "background 0.18s"
};
const recruitBtnStyle = {
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
const printBtnStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 8,
  fontWeight: 900,
  fontSize: 15,
  marginLeft: 12,
  padding: "8px 18px",
  boxShadow: "0 2px 12px #FFD70022",
  cursor: "pointer"
};
const logBtnStyle = {
  background: "#FFD700",
  color: "#232a2e",
  fontWeight: 800,
  fontSize: 15,
  border: "none",
  borderRadius: 8,
  padding: "6px 15px",
  boxShadow: "0 1px 7px #FFD70033",
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
const boardBtnStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 16,
  marginRight: 5,
  marginLeft: 0,
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
  width: 160,
  marginBottom: 8
};
const formLabel = {
  color: "#FFD700",
  fontWeight: 800,
  fontSize: 14
};
