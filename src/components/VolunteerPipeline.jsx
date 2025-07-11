import React, { useState } from "react";
import {
  FaUsers, FaUserPlus, FaUserTimes, FaBell, FaClipboardCheck, FaExclamationTriangle, FaFilePdf, FaFileExcel, FaHistory, FaMedkit, FaMoneyBillWave, FaBullhorn, FaChartLine, FaFlag, FaStar, FaCheck
} from "react-icons/fa";

// Demo data: Add as needed
const INIT_VOLUNTEERS = [
  {
    name: "Ivan Vuković",
    role: "Coaching Support",
    subrole: "Team Logistics",
    team: "U15",
    active: true,
    onboarding: false,
    accreditation: "Background Check",
    accStatus: "Valid",
    attritionRisk: false,
    readyForPaid: false,
    readyDate: "",
    exitReason: "",
    exitDate: "",
    log: [
      { by: "Admin", date: "2025-05-10", comment: "Assigned to U15 for transport coordination." }
    ]
  },
  {
    name: "Matej Stanić",
    role: "Marketing/Media",
    subrole: "Social Media",
    team: "-",
    active: true,
    onboarding: false,
    accreditation: "Club Media Training",
    accStatus: "Valid",
    attritionRisk: false,
    readyForPaid: true,
    readyDate: "2025-06-15",
    exitReason: "",
    exitDate: "",
    log: [
      { by: "Board", date: "2025-06-01", comment: "Launched TikTok club channel." },
      { by: "Board", date: "2025-06-15", comment: "Recommended for part-time role." }
    ]
  },
  {
    name: "Petar Brekalo",
    role: "Administration",
    subrole: "Finance",
    team: "-",
    active: true,
    onboarding: false,
    accreditation: "Data Privacy Training",
    accStatus: "Expiring Soon",
    attritionRisk: false,
    readyForPaid: false,
    readyDate: "",
    exitReason: "",
    exitDate: "",
    log: [
      { by: "Club Office", date: "2025-05-22", comment: "Needs privacy re-training by 2025-07-01." }
    ]
  },
  {
    name: "Tomislav Blažević",
    role: "Event Operations",
    subrole: "Game-Day Staff",
    team: "-",
    active: true,
    onboarding: false,
    accreditation: "-",
    accStatus: "-",
    attritionRisk: false,
    readyForPaid: false,
    readyDate: "",
    exitReason: "",
    exitDate: "",
    log: []
  },
  {
    name: "Marko Božić",
    role: "Fundraising/Sponsorship",
    subrole: "Sponsor Liaison",
    team: "-",
    active: false,
    onboarding: true,
    accreditation: "-",
    accStatus: "-",
    attritionRisk: false,
    readyForPaid: false,
    readyDate: "",
    exitReason: "",
    exitDate: "",
    log: [
      { by: "Board", date: "2025-06-11", comment: "Interview for sponsorship lead." }
    ]
  },
  {
    name: "Dragan Jelavić",
    role: "Medical/Physio",
    subrole: "Game-Day Physio",
    team: "U19",
    active: false,
    onboarding: false,
    accreditation: "First Aid License",
    accStatus: "Expired",
    attritionRisk: true,
    readyForPaid: false,
    readyDate: "",
    exitReason: "License expired, offboarded",
    exitDate: "2025-06-18",
    log: [
      { by: "Board", date: "2025-05-18", comment: "License expired—can’t work until renewed." },
      { by: "Admin", date: "2025-06-18", comment: "Offboarded due to expired license." }
    ]
  }
];

const ROLES = [
  "Coaching Support",
  "Marketing/Media",
  "Administration",
  "Event Operations",
  "Fundraising/Sponsorship",
  "Medical/Physio"
];

function statusColor(status) {
  if (status === "Expired") return "#e82e2e";
  if (status === "Expiring Soon") return "#FFD700";
  if (status === "Valid") return "#1de682";
  return "#fff";
}

export default function VolunteerPipeline() {
  const [vols, setVols] = useState(INIT_VOLUNTEERS);
  const [filter, setFilter] = useState("All");
  const [notif, setNotif] = useState("Medical/Physio license expired—cover at risk!");
  const [showLogIdx, setShowLogIdx] = useState(null);
  const [addComment, setAddComment] = useState("");
  const [recruitForm, setRecruitForm] = useState(false);
  const [newVol, setNewVol] = useState({
    name: "",
    role: ROLES[0],
    subrole: "",
    team: "",
    accreditation: "",
    accStatus: "",
    onboarding: true,
    attritionRisk: false,
    readyForPaid: false
  });
  const [readyIdx, setReadyIdx] = useState(null);

  // --- Analytics ---
  const total = vols.length;
  const onboarding = vols.filter(v => v.onboarding).length;
  const atRisk = vols.filter(v => v.attritionRisk).length;
  const expired = vols.filter(v => v.accStatus === "Expired").length;
  const expSoon = vols.filter(v => v.accStatus === "Expiring Soon").length;
  const byRole = ROLES.map(r => ({ role: r, count: vols.filter(v => v.role === r && v.active).length }));
  const ready = vols.filter(v => v.readyForPaid).length;
  const completed = vols.filter(v => !v.onboarding && v.active).length;
  const exit = vols.filter(v => v.exitDate).length;

  // --- CRITICAL GAPS ---
  const CRITICAL_MIN = 1; // For demo: flag any role with <1 active
  const criticalGaps = byRole.filter(r => r.count < CRITICAL_MIN);

  // --- Filtering ---
  let data = vols;
  if (filter !== "All") data = vols.filter(v => v.role === filter);

  // --- Log ---
  function addLog(idx) {
    if (!addComment.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setVols(vols =>
      vols.map((v, i) =>
        i === idx
          ? { ...v, log: [{ by: "Board", date: today, comment: addComment }, ...(v.log || [])] }
          : v
      )
    );
    setAddComment("");
    setShowLogIdx(null);
  }

  // --- Export (stub) ---
  function handleExport(fmt) {
    alert(`Export as ${fmt} coming soon!`);
  }

  // --- Recruitment Form ---
  function addVolunteer(e) {
    e.preventDefault();
    setVols([
      {
        ...newVol,
        active: false,
        onboarding: true,
        attritionRisk: false,
        readyForPaid: false,
        readyDate: "",
        exitReason: "",
        exitDate: "",
        log: [
          { by: "Admin", date: new Date().toISOString().slice(0, 10), comment: "Volunteer created and onboarding started." }
        ]
      },
      ...vols
    ]);
    setRecruitForm(false);
    setNewVol({
      name: "",
      role: ROLES[0],
      subrole: "",
      team: "",
      accreditation: "",
      accStatus: "",
      onboarding: true,
      attritionRisk: false,
      readyForPaid: false
    });
  }

  // --- Ready for Paid Role toggle ---
  function markReady(idx) {
    setVols(vols =>
      vols.map((v, i) =>
        i === idx
          ? { ...v, readyForPaid: !v.readyForPaid, readyDate: !v.readyForPaid ? new Date().toISOString().slice(0, 10) : "", log: [{ by: "Board", date: new Date().toISOString().slice(0, 10), comment: (!v.readyForPaid ? "Marked as ready for paid role." : "Paid role status removed.") }, ...(v.log || [])] }
          : v
      )
    );
    setReadyIdx(null);
  }

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 12 }}>
        Volunteer Pipeline <FaUsers style={{ marginLeft: 10, color: "#1de682", fontSize: 22, verticalAlign: -2 }} />
        <button onClick={() => handleExport("PDF")} style={btnStyle}><FaFilePdf style={{ marginRight: 7 }} />PDF</button>
        <button onClick={() => handleExport("Excel")} style={btnStyle}><FaFileExcel style={{ marginRight: 7 }} />Excel</button>
        <button onClick={() => setRecruitForm(f => !f)} style={recruitBtnStyle}>
          <FaUserPlus style={{ marginRight: 6 }} />
          New Volunteer
        </button>
      </h2>
      {/* Analytics */}
      <div style={{ display: "flex", gap: 30, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Total: <b>{total}</b></span>
        <span style={{ color: "#1de682", fontWeight: 700 }}>Onboarding: <b>{onboarding}</b></span>
        <span style={{ color: "#1de682", fontWeight: 700 }}>Completed: <b>{completed}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Ready for Paid: <b>{ready}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Exits: <b>{exit}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Exp Soon: <b>{expSoon}</b></span>
        <span style={{ color: "#e82e2e", fontWeight: 700 }}>Attrition: <b>{atRisk}</b></span>
        <span style={{ color: "#e82e2e", fontWeight: 700 }}>Expired Accr: <b>{expired}</b></span>
        {byRole.map(r => (
          <span key={r.role} style={{ color: "#FFD700", fontWeight: 700 }}>{r.role}: <b>{r.count}</b></span>
        ))}
      </div>
      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
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
          Critical Volunteer Gaps: {criticalGaps.map(r => (
            <span key={r.role} style={{ marginLeft: 10, color: "#fff" }}>{r.role}</span>
          ))}
        </div>
      )}
      {/* Notification */}
      {notif && (
        <div style={{
          background: "#e82e2e",
          color: "#fff",
          fontWeight: 900,
          borderRadius: 10,
          marginBottom: 13,
          padding: "11px 19px",
          fontSize: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <FaBell style={{ marginRight: 9, color: "#FFD700" }} /> {notif}
        </div>
      )}
      {/* Recruitment Form */}
      {recruitForm && (
        <form onSubmit={addVolunteer} style={{
          background: "#232a2e",
          borderRadius: 16,
          padding: "28px 36px",
          marginBottom: 20,
          boxShadow: "0 2px 18px #FFD70018"
        }}>
          <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 9 }}>
            New Volunteer Recruitment
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <label style={formLabel}>Name:</label><br />
              <input required value={newVol.name} onChange={e => setNewVol(v => ({ ...v, name: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Role:</label><br />
              <select required value={newVol.role} onChange={e => setNewVol(v => ({ ...v, role: e.target.value }))} style={formInput}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Subrole:</label><br />
              <input value={newVol.subrole} onChange={e => setNewVol(v => ({ ...v, subrole: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Team (if any):</label><br />
              <input value={newVol.team} onChange={e => setNewVol(v => ({ ...v, team: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Accreditation:</label><br />
              <input value={newVol.accreditation} onChange={e => setNewVol(v => ({ ...v, accreditation: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Accred Status:</label><br />
              <select value={newVol.accStatus} onChange={e => setNewVol(v => ({ ...v, accStatus: e.target.value }))} style={formInput}>
                <option value="">-</option>
                <option value="Valid">Valid</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{
            marginTop: 19, ...recruitBtnStyle, fontSize: 16, padding: "8px 26px"
          }}>
            <FaUserPlus style={{ marginRight: 7 }} /> Add Volunteer
          </button>
        </form>
      )}
      {/* Filter */}
      <label style={{ color: "#FFD700", fontWeight: 700, marginLeft: 13 }}>
        Filter:
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            background: "#232a2e",
            color: "#FFD700",
            border: "1.5px solid #FFD700",
            borderRadius: 7,
            fontWeight: 700,
            fontSize: 15,
            padding: "6px 14px",
            marginLeft: 8
          }}>
          <option value="All">All</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
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
              <th>Name</th>
              <th>Role</th>
              <th>Subrole</th>
              <th>Team</th>
              <th>Active</th>
              <th>Onboarding</th>
              <th>Accreditation</th>
              <th>Accred Status</th>
              <th>Attrition Risk</th>
              <th>Ready for Paid</th>
              <th>Exit Reason</th>
              <th>Exit Date</th>
              <th>Board Log</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={13} style={{ color: "#e82e2e", fontWeight: 900, textAlign: "center", padding: 24 }}>
                  No volunteers match filter.
                </td>
              </tr>
            )}
            {data.map((v, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff"
              }}>
                <td style={{ fontWeight: 800, color: "#FFD700" }}>{v.name}</td>
                <td>{v.role}</td>
                <td>{v.subrole}</td>
                <td>{v.team}</td>
                <td style={{ color: v.active ? "#1de682" : "#FFD700", fontWeight: 900 }}>
                  {v.active ? "Yes" : "No"}
                </td>
                <td style={{ color: v.onboarding ? "#FFD700" : "#1de682", fontWeight: 900 }}>
                  {v.onboarding ? <FaUserPlus style={{ marginRight: 4 }} /> : <FaClipboardCheck style={{ marginRight: 4 }} />}
                  {v.onboarding ? "Onboarding" : "Active"}
                </td>
                <td>{v.accreditation || "-"}</td>
                <td style={{
                  color: statusColor(v.accStatus),
                  fontWeight: 900
                }}>
                  {v.accStatus}
                  {v.accStatus === "Expired" && <span style={{ marginLeft: 7, fontWeight: 900 }}><FaExclamationTriangle style={{ color: "#e82e2e" }} /> Expired</span>}
                  {v.accStatus === "Expiring Soon" && <span style={{ marginLeft: 7, fontWeight: 900 }}><FaBell style={{ color: "#FFD700" }} /> Soon</span>}
                </td>
                <td style={{
                  color: v.attritionRisk ? "#e82e2e" : "#1de682",
                  fontWeight: 900
                }}>
                  {v.attritionRisk ? <FaUserTimes style={{ marginRight: 4 }} /> : <FaClipboardCheck style={{ marginRight: 4 }} />}
                  {v.attritionRisk ? "At Risk" : "Stable"}
                </td>
                <td style={{ color: v.readyForPaid ? "#1de682" : "#FFD700", fontWeight: 900 }}>
                  <button
                    style={paidBtnStyle}
                    onClick={() => markReady(idx)}
                  >
                    {v.readyForPaid ? <FaStar style={{ color: "#1de682", marginRight: 5 }} /> : <FaCheck style={{ color: "#FFD700", marginRight: 5 }} />}
                    {v.readyForPaid ? "Yes" : "No"}
                  </button>
                  {v.readyForPaid && v.readyDate && (
                    <div style={{ fontSize: 12, color: "#1de682" }}>since {v.readyDate}</div>
                  )}
                </td>
                <td>{v.exitReason || "-"}</td>
                <td>{v.exitDate || "-"}</td>
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
                        <FaHistory style={{ marginRight: 6 }} />Action Log
                      </div>
                      <ul style={{ marginLeft: 9, marginBottom: 8 }}>
                        {(v.log && v.log.length > 0)
                          ? v.log.map((l, i) =>
                            <li key={i}><b>{l.by}</b> <span style={{ color: "#fff" }}>({l.date})</span>: {l.comment}</li>
                          )
                          : <li style={{ color: "#1de682" }}>No comments yet.</li>
                        }
                      </ul>
                      <textarea
                        placeholder="Add board/staff comment..."
                        value={addComment}
                        onChange={e => setAddComment(e.target.value)}
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
                        Add Comment
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
        <FaUsers style={{ marginRight: 7, verticalAlign: -2 }} />
        Board and management have a real-time, auditable pipeline for every volunteer role—recruitment, onboarding, critical risk, and paid talent flagged.
      </div>
    </div>
  );
}

// --- STYLES ---
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
const paidBtnStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 15,
  padding: "6px 15px",
  marginBottom: 2,
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
