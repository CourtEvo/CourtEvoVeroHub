import React, { useState } from "react";
import { FaCalendarAlt, FaFlag, FaUserTie, FaCheckCircle, FaExclamationTriangle, FaPoll, FaGavel, FaDownload, FaExternalLinkAlt, FaClock, FaPlus, FaBullhorn } from "react-icons/fa";
import moment from "moment";

// -- Demo roles for responsible
const ROLES = ["President", "Finance Director", "Technical Director", "Club Secretary", "Medical Officer", "CourtEvo Consultant", "Board", "Admin Lead", "Board DPO"];
// -- Demo event types and icons
const EVENT_TYPES = [
  { label: "Vote", icon: <FaGavel /> },
  { label: "Compliance", icon: <FaCheckCircle /> },
  { label: "Milestone", icon: <FaFlag /> },
  { label: "Board Meeting", icon: <FaCalendarAlt /> },
  { label: "Review", icon: <FaPoll /> }
];
const TYPE_COLORS = {
  "Vote": "#FFD700",
  "Compliance": "#1de682",
  "Milestone": "#7fa1ff",
  "Board Meeting": "#ae5fff",
  "Review": "#e82e2e"
};

// --- Demo events including recurrences, urgent, overdue, future
const RECURRING = [
  ...Array(6).fill().map((_, i) => ({
    date: moment("2024-07-03").add(i, "months").format("YYYY-MM-DD"),
    type: "Compliance",
    item: "Monthly Compliance Review",
    who: "Board DPO",
    link: "#",
    urgency: "medium",
    recurring: true
  }))
];

const INITIAL = [
  { date: "2024-07-02", type: "Milestone", item: "Season Opening Event", who: "President", link: "#", urgency: "medium" },
  { date: "2024-07-03", type: "Compliance", item: "Monthly Compliance Review", who: "Board DPO", link: "#", urgency: "medium", recurring: true },
  { date: "2024-07-04", type: "Vote", item: "Board Approval: Summer Transfers", who: "Board", link: "#", urgency: "high" },
  { date: "2024-07-06", type: "Review", item: "CPD Review - Coaches", who: "Technical Director", link: "#", urgency: "medium" },
  { date: "2024-07-08", type: "Vote", item: "Approve Sponsorship Model", who: "Board", link: "#", urgency: "high" },
  { date: "2024-07-10", type: "Compliance", item: "Annual Medical Review", who: "Medical Officer", link: "#", urgency: "medium" },
  { date: "2024-07-12", type: "Milestone", item: "Club Diagnostic Report", who: "CourtEvo Consultant", link: "#", urgency: "medium" },
  { date: "2024-07-14", type: "Board Meeting", item: "Q3 Board Meeting", who: "President", link: "#", urgency: "low" },
  { date: "2024-07-16", type: "Review", item: "CPD Compliance Review", who: "Technical Director", link: "#", urgency: "high" },
  { date: "2024-07-17", type: "Vote", item: "Budget Amendment", who: "Board", link: "#", urgency: "high" },
  { date: "2024-07-18", type: "Compliance", item: "Financial Compliance Audit", who: "Finance Director", link: "#", urgency: "high" },
  { date: "2024-07-20", type: "Compliance", item: "Data Privacy Audit", who: "Board DPO", link: "#", urgency: "medium" },
  { date: "2024-07-22", type: "Milestone", item: "Academy Registration Closes", who: "Admin Lead", link: "#", urgency: "medium" },
  { date: "2024-07-24", type: "Board Meeting", item: "Extraordinary Board Session", who: "President", link: "#", urgency: "high" }
].concat(RECURRING);

export default function BoardDecisionCalendar() {
  const [events, setEvents] = useState(INITIAL);
  const [typeFilter, setTypeFilter] = useState("");
  const [viewMode, setViewMode] = useState("month");
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: "", type: "Vote", item: "", who: ROLES[0], link: "#", urgency: "medium"
  });

  // --- Filtering logic
  const today = moment();
  const rangeStart = viewMode === "month" ? today.clone().startOf("month") : today.clone().startOf("week");
  const rangeEnd = viewMode === "month" ? today.clone().endOf("month") : today.clone().endOf("week");
  const filteredEvents = events.filter(ev =>
    (!typeFilter || ev.type === typeFilter) &&
    moment(ev.date).isBetween(rangeStart.clone().subtract(1, "day"), rangeEnd.clone().add(1, "day"), null, "[]")
  ).sort((a, b) => moment(a.date) - moment(b.date));

  // --- Analytics
  const overdue = events.filter(ev => moment(ev.date).isBefore(today, "day"));
  const dueThisWeek = events.filter(ev => moment(ev.date).isSameOrAfter(today, "day") && moment(ev.date).diff(today, "days") <= 7);
  const upcoming = events.filter(ev => moment(ev.date).isSameOrAfter(today, "day") && moment(ev.date).diff(today, "days") <= 14);

  // By type
  const countByType = EVENT_TYPES.map(et => ({
    type: et.label,
    count: events.filter(ev => ev.type === et.label && moment(ev.date).isBetween(rangeStart, rangeEnd, null, "[]")).length
  }));

  // Board readiness
  const readiness =
    overdue.length > 0 ? "red" :
    events.some(ev => ev.urgency === "high" && moment(ev.date).isSameOrAfter(today, "day")) ? "yellow" : "green";

  function exportCSV() {
    const rows = [["Date", "Type", "Item", "Responsible", "Urgency"]];
    filteredEvents.forEach(ev => rows.push([ev.date, ev.type, ev.item, ev.who, ev.urgency]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "board_decision_calendar.csv";
    a.click();
  }
  function sendReminder(ev) {
    alert(`Reminder sent to ${ev.who} for "${ev.item}"! (demo)`);
  }
  function addEvent(e) {
    e.preventDefault();
    setEvents([...events, { ...newEvent }]);
    setShowAdd(false);
    setNewEvent({ date: "", type: "Vote", item: "", who: ROLES[0], link: "#", urgency: "medium" });
  }

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 26,
      padding: 36,
      maxWidth: 1080,
      margin: "0 auto"
    }}>
      <div style={{ height: 8, borderRadius: 5, margin: "0 0 27px 0", background: "linear-gradient(90deg, #FFD700 24%, #1de682 100%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <FaCalendarAlt style={{ fontSize: 33, color: "#FFD700", marginRight: 13 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>Board Decision Calendar</h2>
        <span style={{
          background: readiness === "green" ? "#1de682" : readiness === "yellow" ? "#FFD700" : "#e82e2e",
          color: "#232a2e",
          fontWeight: 900,
          borderRadius: 12,
          padding: "9px 23px",
          marginLeft: 16,
          fontSize: 18
        }}>
          Readiness: {readiness === "green" ? "✔ On Track" : readiness === "yellow" ? "⚠ Check Urgencies" : "✗ Overdue"}
        </span>
      </div>
      {/* --- Banners --- */}
      {overdue.length > 0 && (
        <div style={{
          background: "#e82e2e", color: "#fff", fontWeight: 900, borderRadius: 13, margin: "0 0 14px 0", padding: "9px 16px"
        }}>
          <FaExclamationTriangle style={{ marginRight: 7 }} /> <b>Past Due:</b> {overdue.map(e => e.item + " (" + moment(e.date).format("MMM D") + ")").join(", ")}
        </div>
      )}
      {dueThisWeek.length > 0 && (
        <div style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 13, margin: "0 0 14px 0", padding: "9px 16px"
        }}>
          <FaClock style={{ marginRight: 7 }} /> <b>Due This Week:</b> {dueThisWeek.map(e => e.item + " (" + moment(e.date).format("MMM D") + ")").join(", ")}
        </div>
      )}
      {upcoming.length > 0 && (
        <div style={{
          background: "#232a2e", color: "#1de682", fontWeight: 800, borderRadius: 13, margin: "0 0 14px 0", padding: "9px 16px"
        }}>
          <FaFlag style={{ marginRight: 7 }} /> <b>Upcoming (14 days):</b> {upcoming.map(e => e.item + " (" + moment(e.date).format("MMM D") + ")").join(", ")}
        </div>
      )}

      {/* --- Analytics Cards --- */}
      <div style={{ display: "flex", gap: 18, margin: "0 0 20px 0", flexWrap: "wrap" }}>
        {countByType.map((ct, idx) => (
          <div key={ct.type} style={{
            background: "#181e23",
            color: TYPE_COLORS[ct.type],
            fontWeight: 900,
            borderRadius: 13,
            padding: "15px 17px",
            minWidth: 120
          }}>
            {EVENT_TYPES.find(et => et.label === ct.type)?.icon} {ct.type}: {ct.count}
          </div>
        ))}
      </div>

      {/* --- Add Event Form --- */}
      <button style={addBtn} onClick={() => setShowAdd(s => !s)}>
        <FaPlus style={{ marginRight: 7 }} /> {showAdd ? "Cancel" : "Add Event"}
      </button>
      {showAdd && (
        <form onSubmit={addEvent} style={{ background: "#232a2e", borderRadius: 13, padding: "13px 17px", margin: "12px 0" }}>
          <div style={{ display: "flex", gap: 11, flexWrap: "wrap" }}>
            <input required type="date" value={newEvent.date} onChange={e => setNewEvent(n => ({ ...n, date: e.target.value }))} style={inputStyle} />
            <select value={newEvent.type} onChange={e => setNewEvent(n => ({ ...n, type: e.target.value }))} style={inputStyle}>
              {EVENT_TYPES.map(et => <option key={et.label}>{et.label}</option>)}
            </select>
            <input required value={newEvent.item} onChange={e => setNewEvent(n => ({ ...n, item: e.target.value }))} placeholder="Item" style={inputStyle} />
            <select value={newEvent.who} onChange={e => setNewEvent(n => ({ ...n, who: e.target.value }))} style={inputStyle}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select value={newEvent.urgency} onChange={e => setNewEvent(n => ({ ...n, urgency: e.target.value }))} style={inputStyle}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button style={addBtn}><FaCheckCircle style={{ marginRight: 5 }} /> Add</button>
          </div>
        </form>
      )}

      {/* --- Filters --- */}
      <div style={{ display: "flex", gap: 13, marginBottom: 13, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ color: "#FFD700", fontWeight: 800, marginRight: 8 }}>Type:</label>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={inputStyle}>
          <option value="">All</option>
          {EVENT_TYPES.map(et => <option key={et.label}>{et.label}</option>)}
        </select>
        <button style={btnStyle} onClick={() => setViewMode(viewMode === "month" ? "week" : "month")}>
          {viewMode === "month" ? "Show This Week" : "Show Full Month"}
        </button>
        <button style={btnStyle} onClick={exportCSV}><FaDownload style={{ marginRight: 7, fontSize: 16 }} /> Export CSV</button>
      </div>

      {/* --- Calendar Table --- */}
      <div style={{ overflowX: "auto", marginBottom: 19 }}>
        <table style={{
          width: "100%",
          fontSize: 16,
          borderCollapse: "collapse",
          background: "#232a2e",
          borderRadius: 12
        }}>
          <thead>
            <tr style={{ color: "#FFD700" }}>
              <th>Date</th>
              <th>Type</th>
              <th>Item</th>
              <th>Responsible</th>
              <th>Urgency</th>
              <th>Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((e, idx) => (
              <tr key={idx} style={{ background: TYPE_COLORS[e.type] + "22" }}>
                <td>{moment(e.date).format("YYYY-MM-DD")}</td>
                <td>
                  <span style={{
                    background: TYPE_COLORS[e.type],
                    color: "#232a2e",
                    borderRadius: 6,
                    padding: "1px 10px",
                    fontWeight: 800
                  }}>
                    {EVENT_TYPES.find(et => et.label === e.type)?.icon} {e.type}
                  </span>
                </td>
                <td>{e.item}</td>
                <td><FaUserTie style={{ marginRight: 7, color: "#1de682" }} />{e.who}</td>
                <td style={{
                  color: e.urgency === "high" ? "#e82e2e" : e.urgency === "medium" ? "#FFD700" : "#1de682",
                  fontWeight: 900
                }}>
                  {e.urgency}
                </td>
                <td>
                  <a href={e.link} style={{ color: "#1de682" }}><FaExternalLinkAlt /></a>
                </td>
                <td>
                  {(e.urgency === "high" || moment(e.date).isBefore(today, "day")) && (
                    <button style={remBtn} onClick={() => sendReminder(e)}>
                      <FaBullhorn style={{ marginRight: 3 }} />Send Reminder
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={7} style={{ color: "#e82e2e", fontWeight: 900, padding: "20px 0", textAlign: "center" }}>
                  No events for this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "12px 14px",
        fontWeight: 700,
        fontSize: 15,
        marginTop: 17
      }}>
        <FaCalendarAlt style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Tip:</b> Recurring events and auto-reminders mean nothing gets missed by the board, ever.
      </div>
    </div>
  );
}

// --- Styling ---
const btnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  fontWeight: 900,
  fontSize: 15,
  padding: "7px 16px",
  cursor: "pointer"
};
const inputStyle = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 14,
  padding: "6px 8px",
  marginRight: 7,
  marginBottom: 3
};
const addBtn = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  fontWeight: 900,
  fontSize: 15,
  padding: "6px 16px",
  margin: "0 0 13px 0",
  cursor: "pointer"
};
const remBtn = {
  background: "#e82e2e",
  color: "#FFD700",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 13,
  padding: "4px 12px",
  marginLeft: 5,
  cursor: "pointer"
};
