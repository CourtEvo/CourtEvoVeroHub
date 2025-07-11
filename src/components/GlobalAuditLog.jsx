import React, { useState } from "react";
import { FaHistory, FaSearch, FaFilter, FaDownload, FaClipboardCheck, FaUserTie, FaExternalLinkAlt, FaExclamationTriangle, FaFileExport, FaChartBar, FaPlusCircle, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { Bar } from "react-chartjs-2";

// --- Demo activity log, now with actionType, url, files, critical ---
const DEMO = [
  { date: "2024-07-06", user: "President", module: "Accelerator Roadmap", action: "Marked 'Full Budget Review' as Done", actionType: "Status Change", url: "#", files: [], critical: false },
  { date: "2024-07-05", user: "Medical Officer", module: "Policy & Compliance", action: "Completed Medical Records Policy Review", actionType: "Signoff", url: "#", files: ["medical_policy.pdf"], critical: false },
  { date: "2024-07-03", user: "Technical Director", module: "Coach CPD Tracker", action: "Logged CPD for Coach B. Marić", actionType: "Creation", url: "#", files: ["cpd_bmaric.pdf"], critical: false },
  { date: "2024-07-03", user: "Club Secretary", module: "Data Privacy & Ethics", action: "Added new process: Athlete Registration Portal", actionType: "Creation", url: "#", files: [], critical: false },
  { date: "2024-07-02", user: "Commercial Manager", module: "Innovation Board", action: "Submitted idea for Sponsor Activation", actionType: "Creation", url: "#", files: [], critical: false },
  { date: "2024-07-01", user: "President", module: "Volunteer Pipeline", action: "Promoted V. Juric to Assistant Coach", actionType: "Status Change", url: "#", files: [], critical: true },
  { date: "2024-06-29", user: "Board DPO", module: "Data Privacy & Ethics", action: "Board signoff on 'Medical Records Upload'", actionType: "Signoff", url: "#", files: ["medical_signoff.pdf"], critical: false },
  { date: "2024-06-25", user: "Admin Lead", module: "Accelerator Roadmap", action: "Uploaded new facility optimization file", actionType: "File Upload", url: "#", files: ["facility_opt.xlsx"], critical: false },
  { date: "2024-06-21", user: "Board", module: "Executive Cockpit", action: "Downloaded full board pack", actionType: "Export", url: "#", files: ["board_pack.pdf"], critical: false },
  { date: "2024-06-19", user: "Facilities Manager", module: "Facility Heatmap", action: "Booked new slot for U16 practice", actionType: "Creation", url: "#", files: [], critical: false },
  { date: "2024-06-17", user: "CourtEvo Consultant", module: "Club Diagnostic", action: "Completed SWOT and final report", actionType: "Edit", url: "#", files: ["swot_report.pdf"], critical: true },
];

const USERS = Array.from(new Set(DEMO.map(e => e.user)));
const MODULES = Array.from(new Set(DEMO.map(e => e.module)));
const TYPES = Array.from(new Set(DEMO.map(e => e.actionType)));

const TYPE_COLORS = {
  "Status Change": "#FFD700",
  "Signoff": "#1de682",
  "Edit": "#7fa1ff",
  "Creation": "#1de6c2",
  "File Upload": "#f8a14b",
  "Export": "#ae5fff"
};

export default function GlobalAuditLog() {
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expand, setExpand] = useState(null);

  // Filtering
  const filtered = DEMO.filter(entry =>
    (!userFilter || entry.user === userFilter) &&
    (!moduleFilter || entry.module === moduleFilter) &&
    (!typeFilter || entry.actionType === typeFilter) &&
    (
      entry.date.toLowerCase().includes(search.toLowerCase()) ||
      entry.user.toLowerCase().includes(search.toLowerCase()) ||
      entry.module.toLowerCase().includes(search.toLowerCase()) ||
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.actionType.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Analytics
  const analytics = {
    total: DEMO.length,
    users: USERS.length,
    modules: MODULES.length,
    types: TYPES.length,
    byType: TYPES.map(type => ({
      type,
      count: DEMO.filter(e => e.actionType === type).length
    })),
    byModule: MODULES.map(module => ({
      module,
      count: DEMO.filter(e => e.module === module).length
    })),
    byUser: USERS.map(user => ({
      user,
      count: DEMO.filter(e => e.user === user).length
    })),
  };

  // Activity by date chart
  const byDate = {};
  DEMO.forEach(e => {
    byDate[e.date] = (byDate[e.date] || 0) + 1;
  });
  const chartData = {
    labels: Object.keys(byDate),
    datasets: [
      {
        label: "Actions per Day",
        data: Object.values(byDate),
        backgroundColor: "#FFD70088"
      }
    ]
  };

  function exportCSV() {
    const rows = [["Date", "User", "Module", "Action", "ActionType"]];
    filtered.forEach(e =>
      rows.push([e.date, e.user, e.module, e.action, e.actionType])
    );
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "global_audit_log.csv";
    a.click();
  }

  // If there are any "critical" actions, notify board
  const critical = filtered.filter(e => e.critical);

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 32,
      maxWidth: 1220,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 30px 0", background: "linear-gradient(90deg, #FFD700 35%, #1de682 100%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 12 }}>
        <FaHistory style={{ fontSize: 32, color: "#FFD700", marginRight: 14 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 1, margin: 0 }}>Audit & Activity Log</h2>
      </div>
      <div style={{ fontSize: 16, background: "#232a2e", borderRadius: 13, padding: "11px 17px", color: "#FFD700cc", marginBottom: 25 }}>
        <FaClipboardCheck style={{ marginRight: 8, verticalAlign: -2 }} />
        <b>Regulatory-grade audit trail.</b> See all user actions across every module, filter and export for board/consulting transparency.
      </div>

      {/* --- CRITICAL/URGENT BANNER --- */}
      {critical.length > 0 && (
        <div style={{
          background: "#e82e2e", color: "#fff", borderRadius: 9, fontWeight: 900, fontSize: 16,
          padding: "9px 19px", margin: "0 0 18px 0", boxShadow: "0 2px 14px #e82e2e33"
        }}>
          <FaExclamationTriangle style={{ marginRight: 8 }} />
          <span>Critical Actions:</span>
          {critical.map((c, idx) => (
            <span key={idx} style={{ marginLeft: 18 }}>
              [{c.module}] {c.action}
              <a href={c.url} style={{ marginLeft: 9, color: "#FFD700" }}><FaExternalLinkAlt /></a>
            </span>
          ))}
        </div>
      )}

      {/* --- Analytics Panel --- */}
      <div style={{
        display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap"
      }}>
        <div style={analyticCard}><FaChartBar style={{ color: "#FFD700", marginRight: 8 }} /> Total Actions: {analytics.total}</div>
        <div style={analyticCard}><FaUserTie style={{ color: "#1de682", marginRight: 8 }} /> Users: {analytics.users}</div>
        <div style={analyticCard}><FaClipboardCheck style={{ color: "#FFD700", marginRight: 8 }} /> Modules: {analytics.modules}</div>
        <div style={analyticCard}><FaClipboardCheck style={{ color: "#FFD700", marginRight: 8 }} /> Action Types: {analytics.types}</div>
        <div style={analyticCard}>
          <FaFileExport style={{ color: "#FFD700", marginRight: 8 }} /> <button style={btnStyle} onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      {/* --- Chart: Actions per Day --- */}
      <div style={{
        background: "#232a2e",
        borderRadius: 13,
        margin: "13px 0 21px 0",
        padding: "16px 20px",
        boxShadow: "0 2px 14px #FFD70015"
      }}>
        <Bar data={chartData} options={{
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { color: "#232a2e" }, ticks: { color: "#FFD700" } },
            y: { grid: { color: "#FFD70022" }, ticks: { color: "#FFD700" }, beginAtZero: true }
          }
        }} height={72} />
      </div>

      {/* --- Filters (sticky at top) --- */}
      <div style={{
        display: "flex", gap: 13, marginBottom: 14, flexWrap: "wrap", alignItems: "center", position: "sticky", top: 0, zIndex: 20, background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)"
      }}>
        <FaSearch style={{ fontSize: 18, color: "#FFD700", marginRight: 5 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all..." style={inputStyle} />
        <FaFilter style={{ fontSize: 18, color: "#FFD700", marginLeft: 17 }} />
        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={inputStyle}>
          <option value="">All Users</option>
          {USERS.map(u => <option key={u}>{u}</option>)}
        </select>
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={inputStyle}>
          <option value="">All Modules</option>
          {MODULES.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={inputStyle}>
          <option value="">All Action Types</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* --- Table --- */}
      <div style={{ overflowX: "auto", maxWidth: "100%", margin: "0 0 18px 0" }}>
        <table style={{
          width: "100%",
          fontSize: 15,
          borderCollapse: "collapse",
          background: "#232a2e",
          borderRadius: 10
        }}>
          <thead>
            <tr style={{ color: "#FFD700" }}>
              <th>Date</th>
              <th>User</th>
              <th>Module</th>
              <th>Action</th>
              <th>Type</th>
              <th>Files</th>
              <th>Link</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, idx) => (
              <tr key={idx} style={{ background: e.critical ? "#e82e2e55" : TYPE_COLORS[e.actionType] + "22" }}>
                <td>{e.date}</td>
                <td><FaUserTie style={{ marginRight: 7, color: "#1de682" }} />{e.user}</td>
                <td>{e.module}</td>
                <td>{e.action}</td>
                <td>
                  <span style={{
                    background: TYPE_COLORS[e.actionType],
                    color: "#232a2e",
                    borderRadius: 5,
                    padding: "1px 7px",
                    fontWeight: 900,
                    fontSize: 13
                  }}>{e.actionType}</span>
                  {e.critical && <FaExclamationTriangle style={{ color: "#e82e2e", marginLeft: 6, fontSize: 13 }} />}
                </td>
                <td>
                  {(e.files || []).map((f, i) =>
                    <a key={i} href={"#"} style={{ color: "#1de682" }}>{f}</a>
                  )}
                </td>
                <td>
                  <a href={e.url} style={{ color: "#FFD700" }}><FaExternalLinkAlt /></a>
                </td>
                <td>
                  <button style={expandBtn} onClick={() => setExpand(expand === idx ? null : idx)}>
                    {expand === idx ? <FaTimes /> : <FaPlusCircle />}
                  </button>
                  {expand === idx && (
                    <div style={{
                      background: "#181e23", color: "#FFD700", borderRadius: 10, padding: "7px 12px", marginTop: 7, fontSize: 13, maxWidth: 220
                    }}>
                      <b>Details:</b><br />
                      <b>Date:</b> {e.date}<br />
                      <b>User:</b> {e.user}<br />
                      <b>Module:</b> {e.module}<br />
                      <b>Action:</b> {e.action}<br />
                      <b>Type:</b> {e.actionType}<br />
                      <b>Files:</b> {(e.files || []).join(", ") || "None"}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ color: "#e82e2e", fontWeight: 900, padding: "20px 0", textAlign: "center" }}>
                  No activity found.
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
        <FaHistory style={{ marginRight: 7, verticalAlign: -2 }} />
        All actions. All modules. One audit trail for consulting and regulatory needs.
      </div>
    </div>
  );
}

// --- Styling ---
const btnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 15,
  padding: "7px 14px",
  cursor: "pointer"
};
const analyticCard = {
  background: "#181e23",
  color: "#FFD700",
  borderRadius: 12,
  padding: "13px 18px",
  fontWeight: 800,
  fontSize: 17,
  minWidth: 150
};
const inputStyle = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 14,
  padding: "7px 7px",
  marginRight: 7,
  marginBottom: 3
};
const expandBtn = {
  background: "#FFD70033",
  color: "#FFD700",
  border: "none",
  borderRadius: 6,
  padding: "3px 10px",
  fontSize: 16,
  cursor: "pointer"
};
