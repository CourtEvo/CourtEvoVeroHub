import React, { useState } from "react";
import {
  FaExclamationTriangle, FaHeartbeat, FaUserSlash, FaUserClock, FaFileContract, FaMoneyBillWave, FaChevronUp, FaChevronDown, FaCheckCircle
} from "react-icons/fa";

// --- Mock risk data (as before, add history/actions) ---
const risks = [
  {
    type: "Talent Drain",
    icon: <FaUserSlash style={{ color: "#e82e2e", fontSize: 22 }} />,
    status: "Critical",
    color: "#e82e2e",
    trend: "up",
    count: 2,
    description: "2 key athletes considering transfer.",
    actions: [
      { action: "Retention interview with player", by: "Coach Marko", date: "2025-06-10" },
      { action: "Parent call scheduled", by: "Club Director", date: "2025-06-11" }
    ],
    boardAction: "Assign mentorship/engagement plan"
  },
  {
    type: "Injury Cluster",
    icon: <FaHeartbeat style={{ color: "#FFD700", fontSize: 22 }} />,
    status: "Elevated",
    color: "#FFD700",
    trend: "up",
    count: 3,
    description: "3 soft tissue injuries in last 30 days.",
    actions: [
      { action: "Load reduced for affected players", by: "S&C Coach", date: "2025-06-07" },
      { action: "Added weekly physio screening", by: "Medical Staff", date: "2025-06-08" }
    ],
    boardAction: "Review injury prevention protocols"
  },
  {
    type: "Compliance Risk",
    icon: <FaFileContract style={{ color: "#1de682", fontSize: 22 }} />,
    status: "Stable",
    color: "#1de682",
    trend: "flat",
    count: 0,
    description: "All staff certifications up-to-date.",
    actions: [
      { action: "All staff recertified", by: "Admin", date: "2025-04-02" }
    ],
    boardAction: "Prepare next recertification schedule"
  },
  {
    type: "Engagement Drop",
    icon: <FaUserClock style={{ color: "#FFD700", fontSize: 22 }} />,
    status: "Elevated",
    color: "#FFD700",
    trend: "down",
    count: 1,
    description: "Attendance down for U15 cohort.",
    actions: [
      { action: "Coach meeting with team", by: "Coach Ana", date: "2025-06-09" }
    ],
    boardAction: "Run athlete/parent engagement survey"
  },
  {
    type: "Financial Alert",
    icon: <FaMoneyBillWave style={{ color: "#FFD700", fontSize: 22 }} />,
    status: "Stable",
    color: "#1de682",
    trend: "flat",
    count: 0,
    description: "Budget tracking within targets.",
    actions: [
      { action: "Quarterly financial review complete", by: "Finance", date: "2025-05-15" }
    ],
    boardAction: "Start sponsor renewal negotiations"
  }
];

// Mock trend data per risk
const trendData = {
  "Talent Drain": [2, 1, 2, 2, 2],
  "Injury Cluster": [2, 2, 3, 3, 3],
  "Compliance Risk": [0, 0, 0, 0, 0],
  "Engagement Drop": [0, 1, 1, 1, 1],
  "Financial Alert": [0, 0, 0, 0, 0]
};

// Helper: Sparkline
function MiniTrend({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <svg width="60" height="18" style={{ marginLeft: 8, verticalAlign: "middle" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={data
          .map((v, i) =>
            `${(i / (data.length - 1)) * 55 + 3},${18 - (v / max) * 13 - 2}`
          )
          .join(" ")}
      />
    </svg>
  );
}

// Overall risk scoring (mock logic: critical=2, elevated=1, stable=0)
function getOverallStatus(risks) {
  const total = risks.reduce((sum, r) =>
    sum + (r.status === "Critical" ? 2 : r.status === "Elevated" ? 1 : 0), 0
  );
  if (total >= 3) return { label: "HIGH RISK", color: "#e82e2e" };
  if (total >= 1) return { label: "ELEVATED", color: "#FFD700" };
  return { label: "STABLE", color: "#1de682" };
}

// Find most urgent risk(s)
function getCriticalAlerts(risks) {
  return risks.filter(r => r.status === "Critical");
}

export default function RiskDashboard() {
  const [expanded, setExpanded] = useState(Array(risks.length).fill(false));
  const overall = getOverallStatus(risks);
  const criticals = getCriticalAlerts(risks);

  const toggleExpand = idx => {
    setExpanded(expanded => {
      const copy = [...expanded];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>
        Real-Time Risk Dashboard <FaExclamationTriangle style={{ marginLeft: 10, color: "#e82e2e", fontSize: 24, verticalAlign: -2 }} />
      </h2>
      {/* Overall Status Bar */}
      <div style={{
        background: overall.color,
        color: overall.color === "#FFD700" ? "#222" : "#fff",
        borderRadius: 11,
        padding: "12px 26px",
        fontWeight: 900,
        fontSize: 19,
        marginBottom: 16,
        letterSpacing: 1.1,
        boxShadow: `0 2px 12px ${overall.color}33`
      }}>
        Overall Risk Status: {overall.label}
      </div>
      {/* Critical Alerts */}
      {criticals.length > 0 && (
        <div style={{
          background: "#e82e2e",
          color: "#fff",
          borderRadius: 10,
          padding: "10px 22px",
          fontWeight: 700,
          marginBottom: 15,
          boxShadow: "0 3px 16px #e82e2e66",
          display: "flex",
          alignItems: "center",
          gap: 13
        }}>
          <FaExclamationTriangle style={{ fontSize: 20 }} />
          <span>
            {criticals.map(c => `${c.type}: ${c.description}`).join(" | ")}
          </span>
        </div>
      )}

      {/* Risks */}
      <div style={{
        display: "flex",
        gap: 28,
        flexWrap: "wrap",
        marginBottom: 26
      }}>
        {risks.map((risk, idx) => (
          <div key={idx} style={{
            background: "#232a2e",
            borderRadius: 16,
            boxShadow: `0 2px 18px ${risk.color}33`,
            minWidth: 270,
            flex: 1,
            padding: "24px 21px 20px 21px",
            marginBottom: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            border: risk.status === "Critical" ? "2.5px solid #e82e2e" : risk.status === "Elevated" ? "2px solid #FFD700" : "2px solid #1de682"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              {risk.icon}
              <span style={{ color: risk.color, fontWeight: 800, fontSize: 18 }}>{risk.type}</span>
              <span style={{
                background: risk.color,
                color: "#232a2e",
                borderRadius: 7,
                fontWeight: 900,
                fontSize: 13,
                marginLeft: 11,
                padding: "3px 13px"
              }}>{risk.status}</span>
              <MiniTrend data={trendData[risk.type]} color={risk.color} />
            </div>
            <div style={{ fontWeight: 700, color: "#fff", marginTop: 2 }}>
              {risk.description}
            </div>
            {risk.count > 0 && (
              <div style={{ color: "#FFD700", fontWeight: 700 }}>
                <b>{risk.count}</b> {risk.type === "Talent Drain" ? "athletes" : "cases"}
              </div>
            )}
            <div>
              <button
                style={{
                  background: "#1de682",
                  color: "#232a2e",
                  fontWeight: 800,
                  fontSize: 14,
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 18px",
                  marginTop: 6,
                  cursor: "pointer",
                  boxShadow: "0 1px 6px #1de68222"
                }}
                onClick={() => toggleExpand(idx)}
              >
                {expanded[idx] ? <FaChevronUp style={{ marginRight: 5 }} /> : <FaChevronDown style={{ marginRight: 5 }} />}
                Board Actions & Log
              </button>
              {expanded[idx] && (
                <div style={{
                  background: "#181e23",
                  borderRadius: 8,
                  marginTop: 12,
                  padding: "12px 13px"
                }}>
                  <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 6 }}>
                    Next Board Action:
                  </div>
                  <div style={{ color: "#1de682", fontWeight: 800, marginBottom: 10 }}>
                    {risk.boardAction}
                  </div>
                  <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 4 }}>
                    Action Log:
                  </div>
                  <ul style={{ marginLeft: 18, color: "#fff", fontSize: 14 }}>
                    {risk.actions.map((a, i) => (
                      <li key={i}>
                        <FaCheckCircle style={{ color: "#1de682", fontSize: 12, marginRight: 7 }} />
                        {a.action} <span style={{ color: "#FFD700" }}>({a.by}, {a.date})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "13px 21px",
        fontWeight: 600,
        fontSize: 15
      }}>
        <FaHeartbeat style={{ marginRight: 7, verticalAlign: -2 }} />
        Risks are monitored live. Board and coaches can assign actions, review mitigation steps, and track trends—all in one place.
      </div>
    </div>
  );
}
