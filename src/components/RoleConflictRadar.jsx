import React, { useState } from "react";
import {
  FaSitemap, FaExclamationTriangle, FaCheckCircle, FaBolt, FaUserTie, FaListAlt, FaDownload, FaBalanceScale, FaUsers
} from "react-icons/fa";

// Expanded realistic demo data:
const ROLES = [
  { role: "President", primary: ["Strategy", "Governance"], shared: ["Audit Sign-off"], conflict: false },
  { role: "Finance Director", primary: ["Finance", "Budgeting"], shared: ["Sponsorship Approval", "Audit Sign-off", "Vendor Selection"], conflict: true },
  { role: "Technical Director", primary: ["Coaching Staff", "Player Development"], shared: ["Sponsorship Approval"], conflict: true },
  { role: "Admin Lead", primary: ["Registration", "Scheduling"], shared: ["Facilities Use", "Vendor Selection"], conflict: true },
  { role: "Facilities Manager", primary: ["Facility Ops", "Equipment"], shared: ["Facilities Use"], conflict: false },
  { role: "Medical Officer", primary: ["Health Protocols"], shared: ["Audit Sign-off"], conflict: false },
  { role: "Marketing Lead", primary: ["Social Media", "Community"], shared: ["Sponsorship Approval"], conflict: true },
  { role: "Youth Academy Director", primary: ["U18/Youth Program"], shared: ["Facilities Use"], conflict: true }
];
const SHARED_AREAS = [
  { process: "Sponsorship Approval", roles: ["Finance Director", "Technical Director", "Marketing Lead"], risk: "HIGH" },
  { process: "Facilities Use", roles: ["Admin Lead", "Facilities Manager", "Youth Academy Director"], risk: "MEDIUM" },
  { process: "Audit Sign-off", roles: ["Finance Director", "President", "Medical Officer"], risk: "HIGH" },
  { process: "Vendor Selection", roles: ["Finance Director", "Admin Lead"], risk: "MEDIUM" }
];
const SHADOW_RESPONSIBILITY = [
  { process: "Team Travel Approval", involved: ["President (consulted)", "Admin Lead (informed)"], missing: "Finance Director" }
];
const CONFLICTS = [
  {
    area: "Sponsorship Approval",
    roles: ["Finance Director", "Technical Director", "Marketing Lead"],
    risk: "HIGH",
    desc: "Three roles share power to approve sponsors. No escalation/tiebreak defined."
  },
  {
    area: "Facilities Use",
    roles: ["Admin Lead", "Facilities Manager", "Youth Academy Director"],
    risk: "MEDIUM",
    desc: "Booking can be initiated from all three—prime slots could be double-booked or lead to junior/senior conflicts."
  },
  {
    area: "Audit Sign-off",
    roles: ["Finance Director", "President", "Medical Officer"],
    risk: "HIGH",
    desc: "Multiple sign-offs needed; delays likely without protocol."
  },
  {
    area: "Vendor Selection",
    roles: ["Finance Director", "Admin Lead"],
    risk: "MEDIUM",
    desc: "Finance/Admin both negotiate. Risk: inconsistent terms."
  }
];

export default function RoleConflictRadar() {
  const [selected, setSelected] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [actionLog, setActionLog] = useState([]);
  const [assignNote, setAssignNote] = useState("");

  // Analytics
  const filteredAreas = filter === "ALL"
    ? SHARED_AREAS
    : filter === "HIGH"
      ? SHARED_AREAS.filter(a => a.risk === "HIGH")
      : SHARED_AREAS.filter(a => a.roles.includes(filter));
  const totalConflicts = SHARED_AREAS.length;
  const highRisk = SHARED_AREAS.filter(a => a.risk === "HIGH").length;
  const mostShared = SHARED_AREAS.reduce((acc, area) =>
    area.roles.length > acc.roles.length ? area : acc, SHARED_AREAS[0]);
  const roleRisk = ROLES.map(r => ({ ...r, overlapCount: SHARED_AREAS.filter(a => a.roles.includes(r.role)).length }))
    .sort((a, b) => b.overlapCount - a.overlapCount);

  function handleExport() {
    setShowExport(true);
    setTimeout(() => setShowExport(false), 1200);
  }
  function getNodePos(idx, total) {
    const angle = (2 * Math.PI * idx) / total;
    return {
      x: 340 + 210 * Math.cos(angle - Math.PI / 2),
      y: 250 + 170 * Math.sin(angle - Math.PI / 2)
    };
  }
  // SVG lines for filter
  let svgLines = [];
  let svgHot = [];
  filteredAreas.forEach(area => {
    for (let i = 0; i < area.roles.length; ++i) {
      for (let j = i + 1; j < area.roles.length; ++j) {
        const fromIdx = ROLES.findIndex(r => r.role === area.roles[i]);
        const toIdx = ROLES.findIndex(r => r.role === area.roles[j]);
        if (fromIdx !== -1 && toIdx !== -1) {
          svgLines.push({
            from: getNodePos(fromIdx, ROLES.length),
            to: getNodePos(toIdx, ROLES.length),
            risk: area.risk,
            label: area.process
          });
          svgHot.push({
            x: (getNodePos(fromIdx, ROLES.length).x + getNodePos(toIdx, ROLES.length).x) / 2,
            y: (getNodePos(fromIdx, ROLES.length).y + getNodePos(toIdx, ROLES.length).y) / 2,
            risk: area.risk,
            label: area.process
          });
        }
      }
    }
  });

  function handleAssign(i) {
    if (assignNote.trim()) {
      setActionLog([
        { conflict: CONFLICTS[i].area, by: "Board", note: assignNote, time: new Date().toLocaleString() },
        ...actionLog
      ]);
      setAssignNote("");
      setSelected(null);
    }
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #232a2e 0%, #283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1700,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 22px 0", background: "linear-gradient(90deg, #FFD700 40%, #1de682 100%)" }} />
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22 }}>
        <FaSitemap style={{ fontSize: 30, color: "#FFD700", marginRight: 10 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>
          Role Conflict Radar
        </h2>
        <button style={miniBtn} onClick={handleExport}><FaDownload style={{ marginRight: 7 }} /> Export Report</button>
        {showExport && <span style={{ color: "#1de682", fontWeight: 900, marginLeft: 10 }}>Exported!</span>}
      </div>
      {/* Live Filter */}
      <div style={{ marginBottom: 18, display: "flex", gap: 15, alignItems: "center" }}>
        <b>Filter network:</b>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            background: "#232a2e", color: "#FFD700", fontWeight: 900, fontSize: 16,
            borderRadius: 8, border: "2px solid #FFD700", padding: "4px 13px"
          }}
        >
          <option value="ALL">Show all</option>
          <option value="HIGH">High risk only</option>
          {ROLES.map(r => <option key={r.role} value={r.role}>{r.role}</option>)}
        </select>
      </div>
      {/* Analytics Panel */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "15px 18px", marginBottom: 14, display: "flex", gap: 35, flexWrap: "wrap"
      }}>
        <div><b>Total Shared Processes:</b> <span style={{ color: "#FFD700", fontWeight: 900 }}>{totalConflicts}</span></div>
        <div><b>High Risk Overlaps:</b> <span style={{ color: "#e82e2e", fontWeight: 900 }}>{highRisk}</span></div>
        <div><b>Most Shared Area:</b> <span style={{ color: "#1de682", fontWeight: 900 }}>{mostShared.process}</span></div>
        <div><b>Role w/ Most Shared Areas:</b> <span style={{ color: "#FFD700", fontWeight: 900 }}>{roleRisk[0].role} ({roleRisk[0].overlapCount})</span></div>
        {SHADOW_RESPONSIBILITY.length > 0 &&
          <div style={{ color: "#FFD700", fontWeight: 900 }}>
            <FaExclamationTriangle style={{ color: "#FFD700", marginRight: 6 }} />
            <b>Shadow Area:</b> {SHADOW_RESPONSIBILITY[0].process} <span style={{ color: "#e87f22" }}>No clear decision-maker</span>
          </div>
        }
      </div>
      {/* SVG Network Diagram */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: 22, marginBottom: 16, boxShadow: "0 0 18px #FFD70033"
      }}>
        <b style={{ fontSize: 17, color: "#FFD700" }}><FaSitemap style={{ marginRight: 8 }} /> Shared Responsibilities Network</b>
        <svg width={700} height={520}>
          {/* Shared lines */}
          {svgLines.map((l, i) =>
            <g key={i}>
              <line
                x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y}
                stroke={l.risk === "HIGH" ? "#e82e2e" : "#FFD700"}
                strokeWidth={l.risk === "HIGH" ? 6 : 3}
                opacity={l.risk === "HIGH" ? 0.9 : 0.6}
                style={l.risk === "HIGH" ? { filter: "drop-shadow(0 0 9px #e82e2e66)" } : {}}
              />
              {/* Animated pulse for high risk */}
              {l.risk === "HIGH" && (
                <circle cx={(l.from.x + l.to.x) / 2} cy={(l.from.y + l.to.y) / 2} r={15}
                  fill="#e82e2e" opacity="0.22">
                  <animate attributeName="r" values="15;22;15" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.22;0.39;0.22" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          )}
          {/* Hotspot tooltips */}
          {svgHot.map((h, i) =>
            <g key={i}>
              <circle
                cx={h.x} cy={h.y}
                r={h.risk === "HIGH" ? 14 : 10}
                fill={h.risk === "HIGH" ? "#e82e2e" : "#FFD700"}
                opacity={h.risk === "HIGH" ? 0.32 : 0.15}
              />
              <text x={h.x} y={h.y - 19} textAnchor="middle" fontSize={12} fill="#FFD700" fontWeight={900}>{h.label}</text>
            </g>
          )}
          {/* Role nodes */}
          {ROLES.map((r, i) => {
            const pos = getNodePos(i, ROLES.length);
            return (
              <g key={r.role}>
                <circle
                  cx={pos.x} cy={pos.y}
                  r={27}
                  fill={r.conflict ? "#FFD700" : "#1de682"}
                  stroke="#232a2e"
                  strokeWidth={7}
                  style={r.conflict ? { filter: "drop-shadow(0 0 12px #FFD700)" } : {}}
                />
                <text
                  x={pos.x} y={pos.y - 7}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={900}
                  fill="#FFD700"
                >
                  {r.role}
                </text>
                <text
                  x={pos.x} y={pos.y + 16}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill="#FFD700"
                >
                  {r.primary[0]}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ color: "#FFD700bb", marginTop: 7 }}>
          <FaExclamationTriangle style={{ color: "#e82e2e", marginRight: 7 }} />
          Red pulse = High-risk overlap; Gold = medium/low; Green = low/no conflict.
        </div>
      </div>
      {/* Conflict Hotspots */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "16px 24px", marginBottom: 18
      }}>
        <b style={{ fontSize: 17, color: "#FFD700" }}><FaBolt style={{ marginRight: 7 }} /> Conflict Hotspots</b>
        <div style={{ display: "flex", gap: 38, marginTop: 9, flexWrap: "wrap" }}>
          {CONFLICTS.map((c, i) => (
            <div key={i} style={{
              background: c.risk === "HIGH" ? "#e82e2e44" : "#FFD70033",
              borderRadius: 13, padding: "15px 18px", minWidth: 320,
              border: `3px solid ${c.risk === "HIGH" ? "#e82e2e" : "#FFD700"}`,
              boxShadow: c.risk === "HIGH" ? "0 0 15px #e82e2e88" : "0 0 10px #FFD70055"
            }}>
              <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 6 }}>
                <FaExclamationTriangle style={{ color: c.risk === "HIGH" ? "#e82e2e" : "#FFD700", marginRight: 8 }} />
                {c.area}
              </div>
              <div>
                <b>Roles Involved:</b>{" "}
                {c.roles.map(r => (
                  <span key={r} style={{
                    background: "#FFD70022",
                    color: "#FFD700",
                    borderRadius: 7,
                    padding: "2px 9px",
                    marginRight: 7,
                    fontWeight: 900
                  }}>{r}</span>
                ))}
              </div>
              <div style={{ marginTop: 8, color: "#FFD700bb", fontSize: 15 }}>
                {c.desc}
              </div>
              <div style={{ marginTop: 9 }}>
                <b style={{ color: "#1de682" }}>Boardroom Actions:</b>
                <ul style={{ color: "#FFD700", marginTop: 3 }}>
                  <li><FaCheckCircle style={{ color: "#1de682", marginRight: 8 }} /> Assign escalation protocol (President as tiebreaker).</li>
                  <li><FaCheckCircle style={{ color: "#1de682", marginRight: 8 }} /> Document and communicate every decision.</li>
                  <li><FaCheckCircle style={{ color: "#1de682", marginRight: 8 }} /> Quarterly review of shared zones.</li>
                </ul>
              </div>
              <button style={miniBtn} onClick={() => setSelected(i)}>Resolve/Log</button>
            </div>
          ))}
        </div>
      </div>
      {/* Solution/Resolution Modal */}
      {selected !== null &&
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "#232a2ecc", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#232a2e", borderRadius: 19, padding: 28, minWidth: 410, maxWidth: 620, boxShadow: "0 0 55px #FFD70066"
          }}>
            <h3 style={{ color: "#FFD700", marginBottom: 13 }}>
              <FaBolt style={{ marginRight: 7 }} /> Conflict Resolution: {CONFLICTS[selected].area}
            </h3>
            <div style={{ color: "#FFD700bb", marginBottom: 12 }}>{CONFLICTS[selected].desc}</div>
            <b style={{ color: "#1de682" }}>Document Boardroom Action:</b>
            <textarea
              style={inputStyle}
              placeholder="e.g. 'Escalation protocol assigned. President final approval on ties.'"
              value={assignNote}
              onChange={e => setAssignNote(e.target.value)}
              rows={3}
            />
            <button style={{ ...miniBtn, marginTop: 11 }} onClick={() => handleAssign(selected)}>Save & Close</button>
          </div>
        </div>
      }
      {/* Action Log */}
      <div style={{
        background: "#181e23", color: "#FFD700", borderRadius: 13,
        padding: "13px 15px", margin: "17px 0 13px 0", fontWeight: 700
      }}>
        <FaUsers style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Boardroom Action Log:</b>
        <ul style={{ margin: 7 }}>
          {actionLog.length === 0 && <li style={{ color: "#FFD700aa" }}>No boardroom conflict resolutions logged yet.</li>}
          {actionLog.map((l, i) => (
            <li key={i}>
              <b>{l.conflict}:</b> {l.note} <span style={{ color: "#FFD700aa", fontSize: 13 }}>({l.time})</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Role Ownership Matrix */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "16px 18px", marginBottom: 15
      }}>
        <b style={{ fontSize: 17, color: "#FFD700" }}><FaListAlt style={{ marginRight: 7 }} /> Role Ownership Matrix</b>
        <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse", fontSize: 16 }}>
          <thead>
            <tr>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Primary Responsibilities</th>
              <th style={thStyle}>Shared/Overlap</th>
              <th style={thStyle}>Conflict?</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r, i) => (
              <tr key={r.role}>
                <td style={tdStyle}><FaUserTie style={{ marginRight: 6 }} /> {r.role}</td>
                <td style={tdStyle}>{r.primary.join(", ")}</td>
                <td style={tdStyle}>{r.shared.join(", ") || "--"}</td>
                <td style={{
                  ...tdStyle,
                  color: r.conflict ? "#FFD700" : "#1de682",
                  fontWeight: 900
                }}>
                  {r.conflict
                    ? (<><FaExclamationTriangle style={{ color: "#FFD700", marginRight: 6 }} />Yes</>)
                    : (<><FaCheckCircle style={{ color: "#1de682", marginRight: 6 }} />No</>)
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Final actionable insight */}
      <div style={{
        background: "#181e23", color: "#FFD700", borderRadius: 10,
        padding: "12px 14px", fontWeight: 700, fontSize: 15, marginTop: 17
      }}>
        <FaBalanceScale style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Elite Boardroom Advisory:</b> Visualize, filter, and resolve all overlap and shadow responsibility zones—before they become a crisis.
      </div>
    </div>
  );
}

const thStyle = {
  color: "#FFD700",
  background: "#232a2e",
  fontWeight: 900,
  padding: "13px 12px",
  textAlign: "center",
  borderRadius: "10px 10px 0 0"
};
const tdStyle = {
  background: "#28303e",
  color: "#FFD700",
  fontWeight: 700,
  padding: "11px 9px"
};
const miniBtn = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 6,
  fontWeight: 900,
  fontSize: 14,
  padding: "4px 11px",
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
  margin: "7px 0"
};
