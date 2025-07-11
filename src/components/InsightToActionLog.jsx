import React, { useState } from "react";
import {
  FaRobot, FaClipboardCheck, FaArrowRight, FaCheck, FaLightbulb, FaChartBar, FaFilter, FaFilePdf, FaFileExcel, FaUserEdit, FaHistory, FaExclamationTriangle, FaStar, FaBell
} from "react-icons/fa";

// Impact types and sources for advanced filtering
const IMPACT_TYPES = ["All", "Talent", "Injury", "Compliance", "Financial"];
const ROLES = ["All", "Board", "Coach", "AI", "Org"];

const logsInit = [
  {
    id: 1,
    source: "AIProjections",
    impact: "Injury",
    role: "AI",
    insight: "Projected increased injury risk for Ivan Petrovic due to high load.",
    recommendation: "Reduce next microcycle by 20% for Ivan.",
    actionTaken: "Load reduced for Ivan (Coach Marko, 2025-06-07)",
    outcome: "Injury risk normalized; Ivan returned to full training.",
    outcomeRating: "Success",
    closed: true,
    created: "2025-06-01",
    closedDate: "2025-06-11",
    history: [
      { date: "2025-06-01", by: "AIProjections", action: "Insight generated" },
      { date: "2025-06-07", by: "Coach Marko", action: "Action taken: Load reduced" },
      { date: "2025-06-11", by: "Coach Marko", action: "Outcome: Risk normalized, closed" }
    ]
  },
  {
    id: 2,
    source: "RiskDashboard",
    impact: "Talent",
    role: "Board",
    insight: "Talent drain risk: 2 key athletes reported exploring transfers.",
    recommendation: "Retention meetings with both athletes and parents.",
    actionTaken: "Meetings held; one athlete committed to stay.",
    outcome: "Talent risk dropped to ‘stable’.",
    outcomeRating: "Success",
    closed: true,
    created: "2025-05-20",
    closedDate: "2025-05-24",
    history: [
      { date: "2025-05-20", by: "RiskDashboard", action: "Insight generated" },
      { date: "2025-05-22", by: "Board", action: "Meetings held" },
      { date: "2025-05-24", by: "Board", action: "Outcome: Talent stabilized, closed" }
    ]
  },
  {
    id: 3,
    source: "PlayerScenarioAI",
    impact: "Talent",
    role: "Coach",
    insight: "Scenario: Luka Marinović best fit for combo guard role next season.",
    recommendation: "Assign off-season ball-handling program to Luka.",
    actionTaken: "Coach Petar assigned new plan. In progress.",
    outcome: "",
    outcomeRating: "",
    closed: false,
    created: "2025-06-12",
    history: [
      { date: "2025-06-12", by: "PlayerScenarioAI", action: "Insight generated" },
      { date: "2025-06-13", by: "Coach Petar", action: "Action: Off-season plan assigned" }
    ]
  },
  {
    id: 4,
    source: "OrgScenarioAICockpit",
    impact: "Compliance",
    role: "Org",
    insight: "Board-level: Compliance certifications expire Q4.",
    recommendation: "Schedule recertification course for all staff.",
    actionTaken: "",
    outcome: "",
    outcomeRating: "",
    closed: false,
    created: "2025-06-09",
    history: [
      { date: "2025-06-09", by: "OrgScenarioAICockpit", action: "Insight generated" }
    ]
  },
  {
    id: 5,
    source: "AIProjections",
    impact: "Financial",
    role: "AI",
    insight: "Sponsorship revenue projection for Q3 below target.",
    recommendation: "Initiate sponsor engagement campaign.",
    actionTaken: "",
    outcome: "",
    outcomeRating: "",
    closed: false,
    created: "2025-06-13",
    history: [
      { date: "2025-06-13", by: "AIProjections", action: "Insight generated" }
    ],
    critical: true // highlight as "urgent"
  }
];

// Role/impact color helpers
const impactColor = type =>
  type === "Injury" ? "#e82e2e"
    : type === "Talent" ? "#1de682"
    : type === "Compliance" ? "#FFD700"
    : type === "Financial" ? "#4688ff"
    : "#FFD700";

const outcomeColor = rating =>
  rating === "Success" ? "#1de682"
    : rating === "Neutral" ? "#FFD700"
    : rating === "Unresolved" ? "#e82e2e"
    : "#bbb";

export default function InsightToActionLog() {
  const [logs, setLogs] = useState(logsInit);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [filterSource, setFilterSource] = useState("");
  const [filterImpact, setFilterImpact] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [addActionIdx, setAddActionIdx] = useState(null);
  const [newAction, setNewAction] = useState("");
  const [addOutcomeIdx, setAddOutcomeIdx] = useState(null);
  const [newOutcome, setNewOutcome] = useState("");
  const [newOutcomeRating, setNewOutcomeRating] = useState("Success");
  const [showHistoryIdx, setShowHistoryIdx] = useState(null);
  const [notif, setNotif] = useState("New critical insight: Sponsorship revenue below target!");

  // Summary stats
  const openCount = logs.filter(l => !l.closed).length;
  const closedCount = logs.filter(l => l.closed).length;
  const avgClose = logs.filter(l => l.closed && l.closedDate).length > 0
    ? Math.round(logs.filter(l => l.closed && l.closedDate).reduce((sum, l) =>
      sum + daysDiff(l.created, l.closedDate), 0) /
      logs.filter(l => l.closed && l.closedDate).length)
    : "-";

  // Filters
  let filtered = logs;
  if (showOnlyOpen) filtered = filtered.filter(l => !l.closed);
  if (filterSource) filtered = filtered.filter(l => l.source === filterSource);
  if (filterImpact && filterImpact !== "All") filtered = filtered.filter(l => l.impact === filterImpact);
  if (filterRole && filterRole !== "All") filtered = filtered.filter(l => l.role === filterRole);

  function handleExport(fmt) {
    alert(`Export as ${fmt} coming soon! (Wire to backend for production)`);
  }

  // Add new action handler
  function submitNewAction(idx) {
    const today = new Date().toISOString().slice(0, 10);
    setLogs(logs =>
      logs.map((l, i) =>
        l.id === idx
          ? {
            ...l,
            actionTaken: newAction,
            history: [...l.history, { date: today, by: "Board", action: `Action logged: ${newAction}` }]
          }
          : l
      )
    );
    setNewAction("");
    setAddActionIdx(null);
  }

  // Add/close outcome
  function submitNewOutcome(idx) {
    const today = new Date().toISOString().slice(0, 10);
    setLogs(logs =>
      logs.map((l, i) =>
        l.id === idx
          ? {
            ...l,
            outcome: newOutcome,
            outcomeRating: newOutcomeRating,
            closed: true,
            closedDate: today,
            history: [...l.history, { date: today, by: "Board", action: `Closed: ${newOutcome}` }]
          }
          : l
      )
    );
    setNewOutcome("");
    setAddOutcomeIdx(null);
  }

  // Days difference
  function daysDiff(start, end) {
    return Math.floor((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  }

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 12 }}>
        Insight-to-Action Log <FaClipboardCheck style={{ marginLeft: 10, color: "#1de682", fontSize: 22, verticalAlign: -2 }} />
        <button onClick={() => handleExport("PDF")} style={btnStyle}><FaFilePdf style={{ marginRight: 6 }} /> PDF</button>
        <button onClick={() => handleExport("Excel")} style={btnStyle}><FaFileExcel style={{ marginRight: 6 }} /> Excel</button>
      </h2>
      {/* Live notification */}
      {notif && (
        <div style={{
          background: "#e82e2e",
          color: "#fff",
          fontWeight: 900,
          borderRadius: 10,
          marginBottom: 18,
          padding: "11px 19px",
          fontSize: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <FaBell style={{ marginRight: 9, color: "#FFD700" }} /> {notif}
        </div>
      )}
      {/* Summary stats */}
      <div style={{
        display: "flex",
        gap: 34,
        marginBottom: 22,
        flexWrap: "wrap"
      }}>
        <StatBox icon={<FaClipboardCheck color="#FFD700" size={21} />} label="Open" value={openCount} />
        <StatBox icon={<FaCheck color="#1de682" size={21} />} label="Closed" value={closedCount} />
        <StatBox icon={<FaChartBar color="#FFD700" size={21} />} label="Avg. Closure (days)" value={avgClose} />
      </div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <label>
          <input
            type="checkbox"
            checked={showOnlyOpen}
            onChange={e => setShowOnlyOpen(e.target.checked)}
            style={{ marginRight: 7 }}
          />
          Show Only Open Actions
        </label>
        <span style={{ fontWeight: 700, color: "#FFD700" }}>
          <FaFilter style={{ marginRight: 7 }} />Source:
        </span>
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          style={dropdownStyle}
        >
          <option value="">All</option>
          {[...new Set(logs.map(l => l.source))].map(s => (
            <option value={s} key={s}>{s}</option>
          ))}
        </select>
        <span style={{ fontWeight: 700, color: "#FFD700" }}>
          Impact:
        </span>
        <select
          value={filterImpact}
          onChange={e => setFilterImpact(e.target.value)}
          style={dropdownStyle}
        >
          {IMPACT_TYPES.map(t => <option value={t} key={t}>{t}</option>)}
        </select>
        <span style={{ fontWeight: 700, color: "#FFD700" }}>
          Role:
        </span>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={dropdownStyle}
        >
          {ROLES.map(r => <option value={r} key={r}>{r}</option>)}
        </select>
      </div>
      {/* Table */}
      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "24px 38px",
        boxShadow: "0 2px 18px #FFD70018",
        marginBottom: 18
      }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th>Source</th>
              <th>Impact</th>
              <th>Insight</th>
              <th>AI Recommendation</th>
              <th>Action Taken</th>
              <th>Outcome</th>
              <th>Status</th>
              <th>Outcome Rating</th>
              <th>Log/Close Action</th>
              <th>History</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, idx) => (
              <tr key={l.id} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff",
                border: l.critical && !l.closed ? "2.5px solid #e82e2e" : ""
              }}>
                <td style={{ fontWeight: 700 }}>
                  {l.source === "AIProjections" && <FaRobot color="#1de682" style={{ marginRight: 5, verticalAlign: -2 }} />}
                  {l.source === "PlayerScenarioAI" && <FaLightbulb color="#FFD700" style={{ marginRight: 5, verticalAlign: -2 }} />}
                  {l.source === "OrgScenarioAICockpit" && <FaChartBar color="#FFD700" style={{ marginRight: 5, verticalAlign: -2 }} />}
                  {l.source === "RiskDashboard" && <FaChartBar color="#e82e2e" style={{ marginRight: 5, verticalAlign: -2 }} />}
                  {l.source}
                </td>
                <td style={{ color: impactColor(l.impact), fontWeight: 900 }}>{l.impact}</td>
                <td>
                  {l.insight}
                  {!l.closed && l.critical && (
                    <span style={{
                      background: "#e82e2e", color: "#FFD700",
                      fontWeight: 900, borderRadius: 7, fontSize: 13, padding: "2px 7px", marginLeft: 7
                    }}>
                      <FaExclamationTriangle style={{ marginRight: 2, verticalAlign: -2 }} /> Critical!
                    </span>
                  )}
                </td>
                <td>{l.recommendation}</td>
                <td>
                  {l.actionTaken || "-"}
                  {addActionIdx === l.id && (
                    <div style={{ marginTop: 7 }}>
                      <input
                        value={newAction}
                        onChange={e => setNewAction(e.target.value)}
                        placeholder="Describe action taken..."
                        style={inputStyle}
                      />
                      <button
                        onClick={() => submitNewAction(l.id)}
                        style={saveBtnStyle}
                      >Save</button>
                    </div>
                  )}
                </td>
                <td>
                  {l.outcome || "-"}
                  {addOutcomeIdx === l.id && (
                    <div style={{ marginTop: 7 }}>
                      <input
                        value={newOutcome}
                        onChange={e => setNewOutcome(e.target.value)}
                        placeholder="Describe outcome..."
                        style={inputStyle}
                      />
                      <select
                        value={newOutcomeRating}
                        onChange={e => setNewOutcomeRating(e.target.value)}
                        style={{
                          background: outcomeColor(newOutcomeRating), color: "#232a2e", border: "none", fontWeight: 800, borderRadius: 7, padding: "5px 13px"
                        }}
                      >
                        <option value="Success">Success</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Unresolved">Unresolved</option>
                      </select>
                      <button
                        onClick={() => submitNewOutcome(l.id)}
                        style={saveBtnStyle}
                      >Save & Close</button>
                    </div>
                  )}
                </td>
                <td style={{
                  textAlign: "center",
                  color: l.closed ? "#1de682" : "#FFD700",
                  fontWeight: 900
                }}>
                  {l.closed ? <FaCheck /> : <FaArrowRight />}
                  <br />
                  {l.closed && l.closedDate && (
                    <span style={{
                      color: "#FFD700",
                      fontWeight: 700,
                      fontSize: 12
                    }}>
                      Closed in {daysDiff(l.created, l.closedDate)}d
                    </span>
                  )}
                </td>
                <td style={{
                  color: outcomeColor(l.outcomeRating), fontWeight: 900, textAlign: "center"
                }}>
                  {l.outcomeRating}
                </td>
                <td style={{ textAlign: "center" }}>
                  {!l.closed && (
                    <button
                      onClick={() => setAddActionIdx(addActionIdx === l.id ? null : l.id)}
                      style={actionBtnStyle}
                    >
                      <FaUserEdit style={{ marginRight: 6 }} /> Log Action
                    </button>
                  )}
                  {!l.closed && (
                    <button
                      onClick={() => setAddOutcomeIdx(addOutcomeIdx === l.id ? null : l.id)}
                      style={{ ...actionBtnStyle, background: "#1de682", color: "#232a2e", marginLeft: 6 }}
                    >
                      <FaStar style={{ marginRight: 6 }} /> Close & Rate
                    </button>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    title="Show history"
                    onClick={() => setShowHistoryIdx(showHistoryIdx === l.id ? null : l.id)}
                  >
                    <FaHistory color="#FFD700" />
                    {l.history.length > 0 && (
                      <span style={{
                        background: "#FFD700", color: "#232a2e", borderRadius: 7,
                        marginLeft: 3, fontSize: 13, padding: "1px 6px", fontWeight: 800
                      }}>{l.history.length}</span>
                    )}
                  </span>
                  {showHistoryIdx === l.id && (
                    <div style={{
                      marginTop: 7,
                      background: "#181e23",
                      borderRadius: 7,
                      color: "#FFD700",
                      fontSize: 14,
                      padding: "10px 16px",
                      boxShadow: "0 2px 10px #FFD70033"
                    }}>
                      <ul style={{ marginLeft: 14 }}>
                        {l.history.map((h, i) => (
                          <li key={i}><b>{h.by}</b> <span style={{ color: "#fff" }}>({h.date})</span>: {h.action}</li>
                        ))}
                      </ul>
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
        <FaClipboardCheck style={{ marginRight: 7, verticalAlign: -2 }} />
        Board, coaches, and directors track every insight, action, and outcome—live, transparent, and exportable. Audit and sponsor ready.
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div style={{
      background: "#232a2e",
      borderRadius: 14,
      boxShadow: `0 3px 12px #FFD70024`,
      padding: "17px 22px",
      minWidth: 170,
      display: "flex",
      alignItems: "center",
      gap: 12
    }}>
      {icon}
      <div>
        <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
      </div>
    </div>
  );
}

const dropdownStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 15,
  padding: "6px 14px"
};

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

const inputStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 15,
  padding: "5px 14px",
  marginRight: 7,
  width: 220
};

const actionBtnStyle = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 15,
  padding: "6px 18px",
  cursor: "pointer",
  boxShadow: "0 1px 7px #FFD70033",
  marginTop: 3
};

const saveBtnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 15,
  padding: "6px 16px",
  cursor: "pointer",
  marginLeft: 5
};
