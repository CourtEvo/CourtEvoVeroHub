import React, { useState } from "react";
import {
  FaSitemap, FaCheckCircle, FaExclamationTriangle, FaFilePdf, FaFileExcel, FaBell, FaClipboardCheck, FaHistory, FaWrench, FaFlag, FaMapMarkedAlt, FaCalendarAlt, FaUser
} from "react-icons/fa";

// Mock Data: Only male teams
const FACILITIES = [
  {
    key: "main_court",
    name: "Main Hall Court A",
    type: "Court",
    usage: "U15, U17, U19",
    teams: [
      { team: "U15", hours: 6 },
      { team: "U17", hours: 7 },
      { team: "U19", hours: 8 }
    ],
    utilization: 89,
    access: "Excellent",
    quality: 9,
    safety: 10,
    equipment: "FIBA certified, 24s clock, seating",
    issues: "",
    lastAudit: "2025-06-10",
    status: "Green",
    fundingOpportunity: false,
    actions: [
      { by: "Board", date: "2025-06-10", note: "Full compliance confirmed." }
    ],
    maintenance: [],
    bookings: [
      // day, hour, team
      { day: "Mon", hour: 16, team: "U15" },
      { day: "Mon", hour: 17, team: "U15" },
      { day: "Tue", hour: 18, team: "U17" },
      { day: "Wed", hour: 18, team: "U17" },
      { day: "Thu", hour: 19, team: "U19" },
      { day: "Fri", hour: 20, team: "U19" }
    ]
  },
  {
    key: "practice_court",
    name: "Practice Court B",
    type: "Court",
    usage: "U11, U13",
    teams: [
      { team: "U11", hours: 3 },
      { team: "U13", hours: 4 }
    ],
    utilization: 52,
    access: "Limited (2x/week)",
    quality: 7,
    safety: 7,
    equipment: "Older baskets, no scoreboard",
    issues: "Scoreboard outdated, needs new net",
    lastAudit: "2025-06-05",
    status: "Yellow",
    fundingOpportunity: true,
    actions: [
      { by: "Coach Luka", date: "2025-06-05", note: "Requested scoreboard upgrade." }
    ],
    maintenance: [
      { issue: "Replace scoreboard", responsible: "Admin", due: "2025-07-01", status: "Open" }
    ],
    bookings: [
      { day: "Tue", hour: 16, team: "U11" },
      { day: "Thu", hour: 16, team: "U13" },
      { day: "Fri", hour: 17, team: "U11" }
    ]
  },
  {
    key: "weights_room",
    name: "Weights/Gym Room",
    type: "Support",
    usage: "U17, U19",
    teams: [
      { team: "U17", hours: 2 },
      { team: "U19", hours: 4 }
    ],
    utilization: 36,
    access: "Shared (by schedule)",
    quality: 6,
    safety: 5,
    equipment: "Basic weights, mats; no squat rack",
    issues: "No squat rack, poor ventilation",
    lastAudit: "2025-06-01",
    status: "Red",
    fundingOpportunity: true,
    actions: [
      { by: "Coach Marko", date: "2025-06-01", note: "Ventilation and new equipment urgent." }
    ],
    maintenance: [
      { issue: "Install squat rack", responsible: "Board", due: "2025-06-20", status: "Open" },
      { issue: "Improve ventilation", responsible: "Board", due: "2025-07-10", status: "Open" }
    ],
    bookings: [
      { day: "Wed", hour: 15, team: "U17" },
      { day: "Fri", hour: 17, team: "U19" }
    ]
  },
  {
    key: "meeting_room",
    name: "Meeting/Film Room",
    type: "Support",
    usage: "All Male Teams",
    teams: [
      { team: "U11", hours: 1 },
      { team: "U13", hours: 1 },
      { team: "U15", hours: 2 },
      { team: "U17", hours: 2 },
      { team: "U19", hours: 2 }
    ],
    utilization: 60,
    access: "Excellent",
    quality: 8,
    safety: 10,
    equipment: "Projector, whiteboard, wifi",
    issues: "",
    lastAudit: "2025-06-03",
    status: "Green",
    fundingOpportunity: false,
    actions: [
      { by: "Admin", date: "2025-06-03", note: "Ready for new season." }
    ],
    maintenance: [],
    bookings: [
      { day: "Mon", hour: 18, team: "U15" },
      { day: "Thu", hour: 18, team: "U19" }
    ]
  }
];

// Status color
const statusColor = s =>
  s === "Green" ? "#1de682"
    : s === "Yellow" ? "#FFD700"
    : "#e82e2e";

// Heatmap color: more bookings = darker green
function heatColor(val, max) {
  if (val === 0) return "#222";
  const percent = val / max;
  if (percent > 0.7) return "#1de682";
  if (percent > 0.3) return "#FFD700";
  return "#e82e2e";
}

// For calendar view
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = [15, 16, 17, 18, 19, 20]; // Typical club hours (15–20)

export default function FacilityAccessAudit() {
  const [facilities, setFacilities] = useState(FACILITIES);
  const [filter, setFilter] = useState("All");
  const [notif, setNotif] = useState("Weights Room marked RED! Urgent board action needed.");
  const [showActionsIdx, setShowActionsIdx] = useState(null);
  const [showMaintenanceIdx, setShowMaintenanceIdx] = useState(null);
  const [showHeatmapIdx, setShowHeatmapIdx] = useState(null);
  const [showCalendarIdx, setShowCalendarIdx] = useState(null);
  const [addAction, setAddAction] = useState("");

  // Stats
  const total = facilities.length;
  const redCount = facilities.filter(f => f.status === "Red").length;
  const yellowCount = facilities.filter(f => f.status === "Yellow").length;
  const greenCount = facilities.filter(f => f.status === "Green").length;
  const fundingCount = facilities.filter(f => f.fundingOpportunity).length;

  // Filtering
  let data = facilities;
  if (filter !== "All") data = facilities.filter(f => f.status === filter);

  // Detect if any male team is below required hours (example: under 4h/week)
  const CRITICAL_HOURS = 4;
  const underserved = [];
  facilities.forEach(f => {
    f.teams.forEach(t => {
      if (t.hours < CRITICAL_HOURS && !underserved.find(u => u.team === t.team)) {
        underserved.push({ team: t.team, facility: f.name, hours: t.hours });
      }
    });
  });

  function handleExport(fmt) {
    alert(`Export as ${fmt} coming soon!`);
  }

  function addLog(idx) {
    if (!addAction.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setFacilities(facilities =>
      facilities.map((f, i) =>
        i === idx
          ? { ...f, actions: [{ by: "Board", date: today, note: addAction }, ...(f.actions || [])] }
          : f
      )
    );
    setAddAction("");
    setShowActionsIdx(null);
  }

  // Heatmap: build a 5x6 matrix (weekdays x hours), count bookings
  function getHeatmap(facility) {
    // Matrix: weekday x hour
    const matrix = WEEKDAYS.map(d =>
      HOURS.map(h =>
        facility.bookings.filter(b => b.day === d && b.hour === h).length
      )
    );
    const max = Math.max(...matrix.flat());
    return { matrix, max: max || 1 };
  }

  // Calendar booking: show all bookings with teams
  function getCalendarTable(facility) {
    const calendar = {};
    WEEKDAYS.forEach(d => {
      calendar[d] = {};
      HOURS.forEach(h => {
        calendar[d][h] = facility.bookings.find(b => b.day === d && b.hour === h)
          ? facility.bookings.find(b => b.day === d && b.hour === h).team
          : "";
      });
    });
    return calendar;
  }

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>
        Facility & Access Audit <FaSitemap style={{ marginLeft: 10, color: "#1de682", fontSize: 23, verticalAlign: -3 }} />
        <button onClick={() => handleExport("PDF")} style={btnStyle}><FaFilePdf style={{ marginRight: 7 }} />PDF</button>
        <button onClick={() => handleExport("Excel")} style={btnStyle}><FaFileExcel style={{ marginRight: 7 }} />Excel</button>
      </h2>
      {/* Stats + critical issues */}
      <div style={{ display: "flex", gap: 32, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Total: <b>{total}</b></span>
        <span style={{ color: "#1de682", fontWeight: 700 }}>Green: <b>{greenCount}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Yellow: <b>{yellowCount}</b></span>
        <span style={{ color: "#e82e2e", fontWeight: 700 }}>Red: <b>{redCount}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>Funding Opportunities: <b>{fundingCount}</b></span>
        <label style={{ color: "#FFD700", fontWeight: 700, marginLeft: 20 }}>
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
            <option value="Green">Green</option>
            <option value="Yellow">Yellow</option>
            <option value="Red">Red</option>
          </select>
        </label>
      </div>
      {/* Alerts */}
      {notif && (
        <div style={{
          background: "#e82e2e",
          color: "#fff",
          fontWeight: 900,
          borderRadius: 10,
          marginBottom: 12,
          padding: "11px 19px",
          fontSize: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <FaBell style={{ marginRight: 9, color: "#FFD700" }} /> {notif}
        </div>
      )}
      {/* Critical issues bar */}
      {underserved.length > 0 && (
        <div style={{
          background: "#FFD700",
          color: "#e82e2e",
          fontWeight: 900,
          borderRadius: 9,
          marginBottom: 14,
          padding: "10px 17px",
          fontSize: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <FaFlag style={{ marginRight: 10, color: "#e82e2e" }} />
          Under-served teams:{" "}
          {underserved.map(u => (
            <span key={u.team} style={{ marginLeft: 11 }}>
              {u.team} <span style={{ color: "#232a2e" }}>(at {u.hours}h/week in {u.facility})</span>
            </span>
          ))}
        </div>
      )}
      {/* Placeholder for visual floorplan */}
      <div style={{
        background: "#22292e",
        color: "#FFD700",
        fontWeight: 700,
        borderRadius: 8,
        marginBottom: 14,
        padding: "15px 18px",
        display: "flex",
        alignItems: "center"
      }}>
        <FaMapMarkedAlt style={{ fontSize: 25, marginRight: 13 }} />
        <span>Floorplan Visual: <i>Interactive map coming soon (future upgrade, city/funder ready)</i></span>
      </div>
      {/* Table */}
      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "24px 36px",
        boxShadow: "0 2px 18px #FFD70018",
        marginBottom: 10
      }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th>Name</th>
              <th>Type</th>
              <th>Team Usage</th>
              <th>Utilization %</th>
              <th>Access</th>
              <th>Quality</th>
              <th>Safety</th>
              <th>Equipment</th>
              <th>Issues</th>
              <th>Status</th>
              <th>Audit</th>
              <th>Funding</th>
              <th>Maintenance</th>
              <th>Heatmap</th>
              <th>Calendar</th>
              <th>Board Log</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={15} style={{ color: "#e82e2e", fontWeight: 900, textAlign: "center", padding: 24 }}>
                  No facilities match selected status.
                </td>
              </tr>
            )}
            {data.map((f, idx) => {
              const { matrix, max } = getHeatmap(f);
              const calendar = getCalendarTable(f);
              return (
                <tr key={f.key} style={{
                  background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                  color: "#fff"
                }}>
                  <td style={{ color: "#FFD700", fontWeight: 700 }}>{f.name}</td>
                  <td>{f.type}</td>
                  <td>
                    {f.teams.map(t =>
                      <div key={t.team} style={{ fontWeight: 700, color: t.hours < CRITICAL_HOURS ? "#e82e2e" : "#FFD700" }}>
                        {t.team}: {t.hours}h/week
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "center", color: f.utilization > 75 ? "#1de682" : "#FFD700", fontWeight: 900 }}>
                    {f.utilization}%
                  </td>
                  <td>{f.access}</td>
                  <td style={{ color: f.quality < 7 ? "#e82e2e" : "#1de682", fontWeight: 700 }}>{f.quality}</td>
                  <td style={{ color: f.safety < 7 ? "#e82e2e" : "#1de682", fontWeight: 700 }}>{f.safety}</td>
                  <td>{f.equipment}</td>
                  <td style={{ color: f.issues ? "#FFD700" : "#1de682", fontWeight: 700 }}>{f.issues || "-"}</td>
                  <td style={{
                    fontWeight: 900,
                    color: statusColor(f.status),
                    fontSize: 16,
                    textAlign: "center"
                  }}>
                    {f.status}
                    {f.status === "Red" && <FaExclamationTriangle style={{ color: "#e82e2e", marginLeft: 6 }} />}
                    {f.status === "Yellow" && <FaWrench style={{ color: "#FFD700", marginLeft: 6 }} />}
                    {f.status === "Green" && <FaCheckCircle style={{ color: "#1de682", marginLeft: 6 }} />}
                  </td>
                  <td>{f.lastAudit}</td>
                  <td style={{ textAlign: "center", color: f.fundingOpportunity ? "#e82e2e" : "#1de682", fontWeight: 900 }}>
                    {f.fundingOpportunity
                      ? <span><FaFlag style={{ color: "#FFD700", marginRight: 5 }} />Needs Funding</span>
                      : "Covered"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {f.maintenance && f.maintenance.length > 0 ? (
                      <button style={logBtnStyle}
                        onClick={() => setShowMaintenanceIdx(showMaintenanceIdx === idx ? null : idx)}
                      >
                        <FaWrench style={{ marginRight: 7 }} />
                        Show
                      </button>
                    ) : <span style={{ color: "#FFD700" }}>-</span>}
                    {showMaintenanceIdx === idx && (
                      <div style={{
                        position: "absolute",
                        background: "#181e23",
                        color: "#FFD700",
                        borderRadius: 10,
                        padding: "14px 21px",
                        boxShadow: "0 3px 20px #FFD70033",
                        minWidth: 230,
                        zIndex: 10,
                        marginTop: 12
                      }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>
                          <FaWrench style={{ marginRight: 6 }} />Maintenance Tracker
                        </div>
                        <ul style={{ marginLeft: 9, marginBottom: 8 }}>
                          {f.maintenance.map((m, i) =>
                            <li key={i}><b>{m.issue}</b>: {m.status} (by {m.responsible}, due {m.due})</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button style={logBtnStyle}
                      onClick={() => setShowHeatmapIdx(showHeatmapIdx === idx ? null : idx)}
                    >
                      <FaMapMarkedAlt style={{ marginRight: 7 }} />
                      Heatmap
                    </button>
                    {showHeatmapIdx === idx && (
                      <div style={{
                        position: "absolute",
                        background: "#181e23",
                        color: "#FFD700",
                        borderRadius: 10,
                        padding: "14px 21px",
                        boxShadow: "0 3px 20px #FFD70033",
                        minWidth: 340,
                        zIndex: 10,
                        marginTop: 12
                      }}>
                        <div style={{ fontWeight: 900, marginBottom: 9, fontSize: 17 }}>
                          <FaMapMarkedAlt style={{ marginRight: 6 }} />Usage Heatmap (Bookings)
                        </div>
                        <table style={{ borderCollapse: "collapse", fontSize: 13, background: "#232a2e", borderRadius: 8 }}>
                          <thead>
                            <tr>
                              <th></th>
                              {HOURS.map(h => <th key={h} style={{ color: "#FFD700", padding: 4 }}>{h}:00</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {WEEKDAYS.map((d, row) => (
                              <tr key={d}>
                                <td style={{ color: "#FFD700", padding: 4 }}>{d}</td>
                                {HOURS.map((h, col) => (
                                  <td key={h}
                                    style={{
                                      background: heatColor(matrix[row][col], max),
                                      color: "#232a2e",
                                      fontWeight: 900,
                                      textAlign: "center",
                                      padding: "5px 10px",
                                      borderRadius: 5
                                    }}
                                  >
                                    {matrix[row][col] > 0 ? matrix[row][col] : ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ marginTop: 8, fontSize: 12, color: "#1de682" }}>
                          <b>Legend:</b> Dark = heavily booked, Yellow = moderate, Red = under-used.
                        </div>
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button style={logBtnStyle}
                      onClick={() => setShowCalendarIdx(showCalendarIdx === idx ? null : idx)}
                    >
                      <FaCalendarAlt style={{ marginRight: 7 }} />
                      Calendar
                    </button>
                    {showCalendarIdx === idx && (
                      <div style={{
                        position: "absolute",
                        background: "#181e23",
                        color: "#FFD700",
                        borderRadius: 10,
                        padding: "14px 21px",
                        boxShadow: "0 3px 20px #FFD70033",
                        minWidth: 430,
                        zIndex: 10,
                        marginTop: 12
                      }}>
                        <div style={{ fontWeight: 900, marginBottom: 9, fontSize: 17 }}>
                          <FaCalendarAlt style={{ marginRight: 6 }} />Booking Calendar
                        </div>
                        <table style={{ borderCollapse: "collapse", fontSize: 13, background: "#232a2e", borderRadius: 8 }}>
                          <thead>
                            <tr>
                              <th></th>
                              {HOURS.map(h => <th key={h} style={{ color: "#FFD700", padding: 4 }}>{h}:00</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {WEEKDAYS.map(d => (
                              <tr key={d}>
                                <td style={{ color: "#FFD700", padding: 4 }}>{d}</td>
                                {HOURS.map(h => (
                                  <td key={h}
                                    style={{
                                      background: "#22292e",
                                      color: "#FFD700",
                                      fontWeight: 700,
                                      textAlign: "center",
                                      padding: "5px 10px",
                                      borderRadius: 5
                                    }}
                                  >
                                    {calendar[d][h] &&
                                      <>
                                        <FaUser style={{ marginRight: 4, color: "#1de682" }} />
                                        {calendar[d][h]}
                                      </>
                                    }
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ marginTop: 8, fontSize: 12, color: "#FFD700" }}>
                          <b>Each booking shows team.</b> <span style={{ color: "#1de682" }}>Contact board to book slot.</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button style={logBtnStyle}
                      onClick={() => setShowActionsIdx(showActionsIdx === idx ? null : idx)}
                    >
                      <FaHistory style={{ marginRight: 7 }} />
                      Log
                    </button>
                    {showActionsIdx === idx && (
                      <div style={{
                        position: "absolute",
                        background: "#181e23",
                        color: "#FFD700",
                        borderRadius: 10,
                        padding: "14px 21px",
                        boxShadow: "0 3px 20px #FFD70033",
                        minWidth: 240,
                        zIndex: 10,
                        marginTop: 12
                      }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>
                          <FaHistory style={{ marginRight: 6 }} />Action Log
                        </div>
                        <ul style={{ marginLeft: 9, marginBottom: 8 }}>
                          {(f.actions && f.actions.length > 0)
                            ? f.actions.map((a, i) =>
                              <li key={i}><b>{a.by}</b> <span style={{ color: "#fff" }}>({a.date})</span>: {a.note}</li>
                            )
                            : <li style={{ color: "#1de682" }}>No actions yet.</li>
                          }
                        </ul>
                        <textarea
                          placeholder="Add board/staff action..."
                          value={addAction}
                          onChange={e => setAddAction(e.target.value)}
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
                          Add Action
                        </button>
                      </div>
                    )}
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
        <FaSitemap style={{ marginRight: 7, verticalAlign: -2 }} />
        All facility access, bookings, heatmaps, and risks are transparent for male teams only—boardroom, grant, and compliance ready.
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
