// src/components/PolicyFundingOpportunityRadar.jsx

import React, { useState } from "react";
import {
  FaBalanceScale,
  FaBullhorn,
  FaMoneyCheckAlt,
  FaSearch,
  FaBolt,
  FaDownload,
  FaShareAlt,
  FaUserTie,
  FaClock,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaLightbulb,
  FaExclamationTriangle,
} from "react-icons/fa";

// Mock demo data
const opportunities = [
  {
    id: "op-001",
    title: "National Sports Grant 2025",
    type: "Funding",
    deadline: "2025-09-01",
    relevance: 95,
    status: "Open",
    description: "Up to €20,000 for clubs meeting youth inclusion standards.",
    assigned: "",
    readiness: 92,
    action: "Prepare documents, assign to President",
    region: "National",
    actionLog: [
      { by: "CourtEvo Vero", action: "Created", date: "2025-05-01" },
    ],
  },
  {
    id: "op-002",
    title: "Regional ESG Compliance Policy",
    type: "Policy",
    deadline: "2025-08-15",
    relevance: 82,
    status: "Review",
    description:
      "New environmental/social governance criteria for club licensing.",
    assigned: "",
    readiness: 60,
    action: "Conduct compliance audit, assign to Operations Lead",
    region: "Region",
    actionLog: [
      { by: "CourtEvo Vero", action: "Created", date: "2025-05-02" },
    ],
  },
  {
    id: "op-003",
    title: "Youth Inclusion Micro-Grant",
    type: "Funding",
    deadline: "2025-07-10",
    relevance: 88,
    status: "Urgent",
    description:
      "Micro-grants for clubs with increased minority and female athlete participation.",
    assigned: "",
    readiness: 58,
    action: "Submit online application, assign to Community Manager",
    region: "City",
    actionLog: [
      { by: "CourtEvo Vero", action: "Created", date: "2025-05-02" },
    ],
  },
];

const boardRoles = [
  "President",
  "Technical Director",
  "Operations Lead",
  "Community Manager",
  "Board Member",
];

function daysLeft(deadline) {
  const d = new Date(deadline);
  const now = new Date();
  return Math.max(0, Math.round((d - now) / (1000 * 60 * 60 * 24)));
}

const regionList = ["National", "Region", "City"];

export default function PolicyFundingOpportunityRadar() {
  const [search, setSearch] = useState("");
  const [assigned, setAssigned] = useState({});
  const [expanded, setExpanded] = useState("");
  const [status, setStatus] = useState({});
  const [log, setLog] = useState({});
  const [regionFilter, setRegionFilter] = useState("");
  const [reminderOpp, setReminderOpp] = useState(null);

  // --- Filter logic ---
  let filteredOpps = opportunities
    .filter((o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.type.toLowerCase().includes(search.toLowerCase()) ||
      o.region.toLowerCase().includes(search.toLowerCase())
    )
    .filter((o) => (regionFilter ? o.region === regionFilter : true));

  // --- Boardroom summary ---
  const openOpps = filteredOpps.filter((o) => o.status === "Open" || o.status === "Urgent");
  const urgentOpps = filteredOpps.filter((o) => daysLeft(o.deadline) < 14);
  const avgRelevance =
    filteredOpps.length > 0
      ? Math.round(
          filteredOpps.reduce((a, b) => a + b.relevance, 0) / filteredOpps.length
        )
      : 0;
  const riskOpps = filteredOpps.filter((o) => o.readiness < 60);

  // --- Reminders (Demo Alert) ---
  function handleSetReminder(op) {
    setReminderOpp(op.id);
    setTimeout(() => setReminderOpp(null), 1600);
  }

  // --- Action log ---
  function addAction(opId, role, actionText) {
    const date = new Date().toISOString().substring(0, 10);
    setLog((prev) => ({
      ...prev,
      [opId]: [
        ...(prev[opId] || []),
        {
          by: role,
          action: actionText,
          date,
        },
      ],
    }));
  }

  // --- Status logic ---
  function handleStatus(opId, newStatus, assignedRole) {
    setStatus((prev) => ({ ...prev, [opId]: newStatus }));
    addAction(opId, assignedRole, `Marked as ${newStatus}`);
  }

  return (
    <div
      style={{
        background: "#232a2e",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
        borderRadius: "24px",
        padding: "38px 28px 18px 28px",
        boxShadow: "0 6px 32px 0 #1a1d20",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <FaBalanceScale size={36} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 29,
              letterSpacing: 1,
              marginBottom: 4,
              color: "#FFD700",
            }}
          >
            POLICY & FUNDING OPPORTUNITY RADAR
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Every opportunity. No missed funding. Maximum compliance.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={{
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            padding: "10px 18px",
            marginRight: 10,
            fontFamily: "Segoe UI",
            cursor: "pointer",
            boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={() => window.print()}
        >
          <FaDownload style={{ marginRight: 7 }} />
          Export Board Deck
        </button>
        <button
          style={{
            background: "#1de682",
            color: "#232a2e",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            padding: "10px 18px",
            fontFamily: "Segoe UI",
            cursor: "pointer",
            boxShadow: "0 2px 12px 0 #2a2d31",
          }}
        >
          <FaShareAlt style={{ marginRight: 7 }} />
          Share Report
        </button>
      </div>

      {/* Boardroom Summary Cards */}
      <div style={{ display: "flex", gap: 22, marginBottom: 20 }}>
        <div
          style={{
            background: "#FFD700",
            color: "#232a2e",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: 10,
            minWidth: 120,
            textAlign: "center",
          }}
        >
          Open: {openOpps.length}
        </div>
        <div
          style={{
            background: "#1de682",
            color: "#232a2e",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: 10,
            minWidth: 120,
            textAlign: "center",
          }}
        >
          Urgent: {urgentOpps.length}
        </div>
        <div
          style={{
            background: "#283E51",
            color: "#FFD700",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: 10,
            minWidth: 120,
            textAlign: "center",
          }}
        >
          Avg Relevance: {avgRelevance}%
        </div>
        <div
          style={{
            background: "#ff6b6b",
            color: "#fff",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: 10,
            minWidth: 120,
            textAlign: "center",
          }}
        >
          At Risk: {riskOpps.length}
        </div>
      </div>

      {/* Opportunity Radar Map/Filter */}
      <div style={{ margin: "20px 0" }}>
        <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 8 }}>Regional Radar</div>
        <div style={{ display: "flex", gap: 16 }}>
          {regionList.map((region) => {
            const count = filteredOpps.filter((o) => o.region === region).length;
            return (
              <button
                key={region}
                onClick={() => setRegionFilter(regionFilter === region ? "" : region)}
                style={{
                  background: regionFilter === region ? "#FFD700" : "#232a2e",
                  color: regionFilter === region ? "#232a2e" : "#FFD700",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: regionFilter === region ? "0 2px 8px #FFD70055" : "",
                  borderBottom: regionFilter === region ? "2.5px solid #1de682" : "",
                  fontSize: 15,
                }}
              >
                <FaMapMarkerAlt style={{ marginRight: 7 }} />
                {region}: {count}
              </button>
            );
          })}
          <button
            onClick={() => setRegionFilter("")}
            style={{
              marginLeft: 10,
              border: "1.5px solid #FFD700",
              borderRadius: 8,
              background: "#232a2e",
              color: "#FFD700",
              padding: "8px 16px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            All Regions
          </button>
        </div>
      </div>

      {/* Search/Filter */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div
          style={{
            background: "#283E51",
            borderRadius: 8,
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaSearch color="#FFD700" />
          <input
            placeholder="Search policy/funding..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 16,
              marginLeft: 6,
              fontFamily: "Segoe UI",
              outline: "none",
              width: 220,
            }}
          />
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          marginTop: 14,
          background: "#1a1d20",
          borderRadius: 16,
          padding: 14,
          boxShadow: "0 2px 12px 0 #121416",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#fff",
            fontSize: 14,
            fontFamily: "Segoe UI",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #485563" }}>
              <th style={{ padding: 7, textAlign: "left" }}>Title</th>
              <th>Type</th>
              <th>Deadline</th>
              <th>Progress</th>
              <th>Relevance</th>
              <th>Status</th>
              <th>Assign</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOpps.map((op) => (
              <React.Fragment key={op.id}>
                <tr
                  style={{
                    borderBottom: "1px solid #283E51",
                    background:
                      expanded === op.id ? "#232a2e" : "transparent",
                  }}
                >
                  <td style={{ fontWeight: 600 }}>
                    <span style={{ color: "#FFD700", marginRight: 5 }}>
                      {op.type === "Funding" ? <FaMoneyCheckAlt /> : <FaBalanceScale />}
                    </span>
                    {op.title}
                    {daysLeft(op.deadline) < 14 && (
                      <span
                        style={{
                          background: "#ff6b6b",
                          color: "#fff",
                          borderRadius: 7,
                          padding: "2px 8px",
                          marginLeft: 9,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        <FaClock style={{ marginRight: 5 }} />
                        {daysLeft(op.deadline)}d left
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{op.type}</td>
                  {/* Deadline/progress */}
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        background: "#232a2e",
                        borderRadius: 6,
                        height: 9,
                        width: 52,
                        margin: "0 auto",
                        marginBottom: 2,
                      }}
                    >
                      <div
                        style={{
                          background:
                            daysLeft(op.deadline) < 14
                              ? "#ff6b6b"
                              : daysLeft(op.deadline) < 30
                              ? "#1de682"
                              : "#FFD700",
                          width: `${
                            100 -
                            Math.min(100, Math.round((daysLeft(op.deadline) / 60) * 100))
                          }%`,
                          height: "100%",
                          borderRadius: 6,
                          transition: "width 1s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#FFD700",
                        fontWeight: 600,
                        letterSpacing: 1,
                      }}
                    >
                      {daysLeft(op.deadline)}d
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: op.relevance >= 90 ? "#FFD700" : "#1de682" }}>
                    {op.relevance}%
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      color: op.status === "Urgent" ? "#ff6b6b" : "#FFD700",
                      fontWeight: 700,
                    }}
                  >
                    {op.status}
                  </td>
                  {/* Assign/track */}
                  <td style={{ textAlign: "center" }}>
                    <select
                      value={assigned[op.id] || ""}
                      onChange={(e) => {
                        setAssigned((a) => ({
                          ...a,
                          [op.id]: e.target.value,
                        }));
                        addAction(op.id, e.target.value, "Assigned");
                      }}
                      style={{
                        borderRadius: 7,
                        padding: "3px 8px",
                        fontFamily: "Segoe UI",
                      }}
                    >
                      <option value="">Assign to…</option>
                      {boardRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Expand */}
                  <td style={{ textAlign: "center" }}>
                    <button
                      style={{
                        background: "#FFD700",
                        border: "none",
                        borderRadius: 7,
                        color: "#232a2e",
                        padding: "4px 11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setExpanded((curr) => (curr === op.id ? "" : op.id))
                      }
                      title="Expand"
                    >
                      <FaClipboardCheck />
                    </button>
                  </td>
                </tr>
                {expanded === op.id && (
                  <tr>
                    <td colSpan={8} style={{ background: "#283E51", borderRadius: 12, padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 5 }}>
                            Details & Boardroom Next Step
                          </div>
                          <div style={{ color: "#fff", marginBottom: 6 }}>
                            <FaBullhorn style={{ marginRight: 7 }} />
                            {op.description}
                          </div>
                          <div style={{ margin: "9px 0", color: "#FFD700", fontWeight: 700 }}>
                            <FaLightbulb style={{ marginRight: 8 }} />
                            Recommended Action:
                          </div>
                          <div style={{ color: "#1de682", fontWeight: 600, fontSize: 15 }}>
                            {op.action}
                          </div>
                          {/* AI narrative panel */}
                          <div
                            style={{
                              marginTop: 15,
                              background: "#FFD700",
                              color: "#232a2e",
                              borderRadius: 10,
                              padding: "11px 17px",
                              fontWeight: 600,
                              fontStyle: "italic",
                            }}
                          >
                            <FaLightbulb style={{ marginRight: 8 }} />
                            Boardroom Talking Point: This opportunity supports CourtEvo Vero’s growth, aligns with inclusion, and offers direct PR/compliance value. <b>ROI: High.</b>
                          </div>
                          {/* Smart Reminder */}
                          <button
                            style={{
                              background: "#FFD700",
                              color: "#232a2e",
                              borderRadius: 8,
                              padding: "7px 13px",
                              fontWeight: 700,
                              marginTop: 12,
                              cursor: "pointer",
                              border: "none",
                            }}
                            onClick={() => handleSetReminder(op)}
                          >
                            <FaClock style={{ marginRight: 7 }} /> Set Reminder
                          </button>
                          {reminderOpp === op.id && (
                            <span
                              style={{
                                color: "#1de682",
                                fontWeight: 700,
                                marginLeft: 10,
                                fontSize: 15,
                              }}
                            >
                              Reminder set! (Demo)
                            </span>
                          )}
                        </div>
                        {/* Readiness + Status + Log */}
                        <div style={{ minWidth: 200, maxWidth: 260 }}>
                          <div style={{ fontWeight: 700, color: "#1de682", marginBottom: 8 }}>
                            Readiness Score
                          </div>
                          <div
                            style={{
                              background: "#232a2e",
                              borderRadius: 8,
                              height: 12,
                              width: "100%",
                              margin: "0 0 12px 0",
                            }}
                          >
                            <div
                              style={{
                                background: op.readiness >= 90 ? "#FFD700" : "#1de682",
                                height: "100%",
                                borderRadius: 8,
                                width: `${op.readiness}%`,
                                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            />
                          </div>
                          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 15 }}>
                            {op.readiness}% Ready
                          </div>
                          {op.readiness >= 90 && (
                            <div
                              style={{
                                marginTop: 6,
                                background: "#FFD700",
                                color: "#232a2e",
                                borderRadius: 8,
                                padding: "6px 12px",
                                fontWeight: 700,
                                display: "inline-block",
                              }}
                            >
                              <FaBolt style={{ marginRight: 5 }} />
                              Apply Now!
                            </div>
                          )}
                          {/* Status/action log */}
                          <div style={{ marginTop: 16, color: "#FFD700", fontWeight: 700, marginBottom: 5 }}>
                            Action Log
                          </div>
                          <div style={{ fontSize: 14, color: "#fff" }}>
                            {(log[op.id] || []).map((entry, idx) => (
                              <div key={idx} style={{ marginBottom: 3 }}>
                                <FaUserTie style={{ marginRight: 5 }} />
                                <b>{entry.by}</b>: {entry.action} <span style={{ color: "#FFD700", marginLeft: 5 }}>{entry.date}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <select
                              value={status[op.id] || "In Progress"}
                              onChange={(e) =>
                                handleStatus(op.id, e.target.value, assigned[op.id] || "—")
                              }
                              style={{
                                borderRadius: 6,
                                padding: "4px 10px",
                                fontFamily: "Segoe UI",
                                fontWeight: 600,
                              }}
                            >
                              <option value="In Progress">In Progress</option>
                              <option value="Submitted">Submitted</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </div>
                          {op.readiness < 60 && (
                            <div
                              style={{
                                marginTop: 14,
                                background: "#ff6b6b",
                                color: "#fff",
                                borderRadius: 8,
                                padding: "6px 12px",
                                fontWeight: 700,
                                display: "inline-block",
                              }}
                            >
                              <FaExclamationTriangle style={{ marginRight: 6 }} />
                              AT RISK: Improve readiness!
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
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
        All funding, compliance, and opportunity analytics are proprietary to CourtEvo Vero. Boardroom decisions, powered by intelligence.
      </div>
    </div>
  );
}
