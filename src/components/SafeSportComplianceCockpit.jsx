// src/components/SafeSportComplianceCockpit.jsx

import React, { useState } from "react";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTable,
  FaClipboardCheck,
  FaDownload,
  FaShareAlt,
  FaClipboardList,
  FaBullhorn,
  FaUserCheck,
  FaUserTimes,
  FaUserTie,
  FaLineChart,
  FaArrowRight,
  FaFileAlt,
} from "react-icons/fa";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

// --- DEMO DATA ---
const squads = [
  { name: "U10 Boys", compliance: 98, risk: false, staff: "Ivan Markovic", lastAudit: "2025-05-15", trend: [90, 93, 95, 98] },
  { name: "U12 Boys", compliance: 81, risk: false, staff: "Dino Vukovic", lastAudit: "2025-05-10", trend: [71, 74, 78, 81] },
  { name: "U14 Boys", compliance: 67, risk: true, staff: "Juraj Juric", lastAudit: "2025-04-28", trend: [72, 74, 71, 67] },
];

const staff = [
  { name: "Ivan Markovic", role: "Coach", safesport: true, concussion: true, cpd: true, onboarding: true },
  { name: "Dino Vukovic", role: "Coach", safesport: true, concussion: false, cpd: true, onboarding: true },
  { name: "Juraj Juric", role: "Coach", safesport: false, concussion: true, cpd: false, onboarding: true },
];

const checklist = [
  { key: "safesport", label: "Safeguarding/Background Check", complete: true },
  { key: "antiBullying", label: "Anti-Bullying Protocol", complete: true },
  { key: "concussion", label: "Concussion Protocol", complete: false },
  { key: "mentalHealth", label: "Mental Health Resource", complete: true },
  { key: "onboarding", label: "Coach/Staff Onboarding", complete: true },
  { key: "injuryTracking", label: "Injury Reporting/Tracking", complete: false },
];

const demoAuditLog = [
  { date: "2025-05-16", action: "Anti-Bullying Training Complete", by: "Ivan Markovic", status: "OK" },
  { date: "2025-05-10", action: "Concussion Protocol Missed", by: "Dino Vukovic", status: "ALERT" },
  { date: "2025-05-09", action: "New Injury Tracked: U14", by: "Juraj Juric", status: "ALERT" },
  { date: "2025-04-22", action: "Staff Onboarding Complete", by: "Ivan Markovic", status: "OK" },
];

// Policy repo (links to club docs, PDF, future uploads)
const policyRepo = [
  { name: "Safeguarding Policy 2025", type: "PDF", link: "#", updated: "2025-03-01" },
  { name: "Concussion Management", type: "PDF", link: "#", updated: "2025-02-20" },
  { name: "Anti-Bullying Charter", type: "PDF", link: "#", updated: "2025-01-30" },
];

// Staff roles for assignment
const boardRoles = [
  "President",
  "Compliance Officer",
  "Head Coach",
  "Safeguarding Lead",
];

// Assignments/action log state
const defaultActions = {};

export default function SafeSportComplianceCockpit() {
  const [selectedSquad, setSelectedSquad] = useState(squads[0]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [actionLog, setActionLog] = useState(defaultActions);
  const [showPolicy, setShowPolicy] = useState(false);

  // Boardroom compliance health
  const avgCompliance =
    squads.reduce((a, sq) => a + sq.compliance, 0) / squads.length;
  const riskSquads = squads.filter(sq => sq.compliance < 75);
  const riskStaff = staff.filter(
    st => !st.safesport || !st.concussion || !st.cpd || !st.onboarding
  );

  // Risk heatmap: squad X area
  function heatmapCell(squad, area) {
    if (!squad || !area) return "#283E51";
    if (area === "compliance")
      return squad.compliance >= 90
        ? "#FFD700"
        : squad.compliance >= 75
        ? "#1de682"
        : "#ff6b6b";
    const st = staff.find(st => st.name === squad.staff);
    if (!st) return "#232a2e";
    switch (area) {
      case "safesport":
        return st.safesport ? "#1de682" : "#ff6b6b";
      case "concussion":
        return st.concussion ? "#1de682" : "#ff6b6b";
      case "cpd":
        return st.cpd ? "#1de682" : "#ff6b6b";
      case "onboarding":
        return st.onboarding ? "#1de682" : "#ff6b6b";
      default:
        return "#232a2e";
    }
  }

  // Assign board action
  function assignAction(squad, area) {
    const now = new Date();
    setActionLog(log => ({
      ...log,
      [squad.name + area]: [
        ...(log[squad.name + area] || []),
        {
          action: "Address: " + area,
          assignedTo: assignments[squad.name + area] || "-",
          date: now.toISOString().split("T")[0],
          status: "Pending",
        },
      ],
    }));
  }

  // Next best action (AI) for boardroom
  function nextBestAction(squad) {
    if (squad.compliance < 75)
      return "Assign safeguarding refresher for " + squad.name;
    if (squad.compliance < 90)
      return "Schedule concussion protocol training";
    return "Conduct annual compliance audit";
  }

  // Compliance risk trend (club avg over last 4 periods)
  const clubTrend = [
    Math.round(squads.reduce((a, s) => a + s.trend[0], 0) / squads.length),
    Math.round(squads.reduce((a, s) => a + s.trend[1], 0) / squads.length),
    Math.round(squads.reduce((a, s) => a + s.trend[2], 0) / squads.length),
    Math.round(squads.reduce((a, s) => a + s.trend[3], 0) / squads.length),
  ];

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
      <div style={{ display: "flex", alignItems: "center", marginBottom: 15 }}>
        <FaShieldAlt size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 1,
              marginBottom: 4,
              color: "#FFD700",
            }}
          >
            SAFESPORT & WELLBEING COMPLIANCE COCKPIT
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Full-club risk, audit, and action management. Boys only.
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
          Export Compliance Report
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
          Share
        </button>
      </div>

      {/* Club Risk Trendline */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 4 }}>
          Club Compliance Trend
        </div>
        <ResponsiveContainer width="50%" height={38}>
          <LineChart data={clubTrend.map((y, i) => ({ x: i + 1, y }))}>
            <Line type="monotone" dataKey="y" stroke="#FFD700" strokeWidth={2} dot={true} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Health Bar & Boardroom Alerts */}
      <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
        <div style={{
          background: avgCompliance >= 90
            ? "#FFD700"
            : avgCompliance >= 75
            ? "#1de682"
            : "#ff6b6b",
          color: avgCompliance >= 75 ? "#232a2e" : "#fff",
          fontWeight: 700,
          borderRadius: 12,
          padding: "9px 22px",
          minWidth: 180,
          textAlign: "center",
          fontSize: 17,
        }}>
          <FaCheckCircle style={{ marginRight: 7 }} />
          Health: {Math.round(avgCompliance)}%
        </div>
        <div style={{
          background: riskSquads.length > 0 ? "#ff6b6b" : "#1de682",
          color: riskSquads.length > 0 ? "#fff" : "#232a2e",
          fontWeight: 700,
          borderRadius: 12,
          padding: "9px 16px",
          minWidth: 135,
          textAlign: "center",
        }}>
          <FaExclamationTriangle style={{ marginRight: 7 }} />
          At-Risk Squads: {riskSquads.length}
        </div>
        <div style={{
          background: riskStaff.length > 0 ? "#ff6b6b" : "#FFD700",
          color: riskStaff.length > 0 ? "#fff" : "#232a2e",
          fontWeight: 700,
          borderRadius: 12,
          padding: "9px 16px",
          minWidth: 135,
          textAlign: "center",
        }}>
          <FaExclamationTriangle style={{ marginRight: 7 }} />
          Staff Issues: {riskStaff.length}
        </div>
        <div style={{
          background: "#283E51",
          color: "#FFD700",
          fontWeight: 700,
          borderRadius: 12,
          padding: "9px 16px",
          minWidth: 135,
          textAlign: "center",
        }}>
          <FaTable style={{ marginRight: 7 }} />
          Total Squads: {squads.length}
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 4 }}>
          Compliance Risk Heatmap
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", fontWeight: 700 }}>
              <th>Squad</th>
              <th>Compliance</th>
              <th>Safeguarding</th>
              <th>Concussion</th>
              <th>CPD</th>
              <th>Onboarding</th>
            </tr>
          </thead>
          <tbody>
            {squads.map(sq => (
              <tr key={sq.name}>
                <td style={{ color: "#FFD700", fontWeight: 700 }}>{sq.name}</td>
                <td style={{ background: heatmapCell(sq, "compliance"), color: "#232a2e", fontWeight: 700, textAlign: "center" }}>{sq.compliance}%</td>
                <td style={{ background: heatmapCell(sq, "safesport"), color: "#232a2e", textAlign: "center" }}>
                  {staff.find(st => st.name === sq.staff)?.safesport ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </td>
                <td style={{ background: heatmapCell(sq, "concussion"), color: "#232a2e", textAlign: "center" }}>
                  {staff.find(st => st.name === sq.staff)?.concussion ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </td>
                <td style={{ background: heatmapCell(sq, "cpd"), color: "#232a2e", textAlign: "center" }}>
                  {staff.find(st => st.name === sq.staff)?.cpd ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </td>
                <td style={{ background: heatmapCell(sq, "onboarding"), color: "#232a2e", textAlign: "center" }}>
                  {staff.find(st => st.name === sq.staff)?.onboarding ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Action & Next Best Action */}
      <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        {/* Checklist & Next Action */}
        <div
          style={{
            background: "#283E51",
            borderRadius: 22,
            padding: 22,
            minWidth: 290,
            maxWidth: 350,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 8 }}>
            Compliance Checklist
          </div>
          <ul style={{ fontWeight: 600, fontSize: 15, listStyle: "none", padding: 0 }}>
            {checklist.map(c => (
              <li key={c.key} style={{
                display: "flex",
                alignItems: "center",
                color: c.complete ? "#1de682" : "#ff6b6b",
                marginBottom: 5,
              }}>
                {c.complete ? <FaCheckCircle style={{ marginRight: 8 }} /> : <FaExclamationTriangle style={{ marginRight: 8 }} />}
                {c.label}
              </li>
            ))}
          </ul>
          {/* Assign/Log */}
          <div style={{ marginTop: 8, fontWeight: 700, color: "#FFD700" }}>
            Assign Action (Squad):<br />
            <select
              value={assignments[selectedSquad.name + "check"] || ""}
              onChange={e => setAssignments(a => ({ ...a, [selectedSquad.name + "check"]: e.target.value }))}
              style={{ borderRadius: 7, padding: "6px 12px", fontFamily: "Segoe UI", marginTop: 7 }}
            >
              <option value="">Assign...</option>
              {boardRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button
              style={{
                background: "#FFD700",
                color: "#232a2e",
                borderRadius: 7,
                padding: "6px 11px",
                fontWeight: 700,
                marginTop: 8,
                border: "none",
                marginLeft: 7,
                cursor: "pointer"
              }}
              onClick={() => assignAction(selectedSquad, "check")}
            >
              <FaClipboardCheck style={{ marginRight: 6 }} />
              Log
            </button>
            {/* Log table */}
            {actionLog[selectedSquad.name + "check"] && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700, color: "#FFD700" }}>Action Log</div>
                <table style={{ width: "100%", fontSize: 13, color: "#fff", marginTop: 3 }}>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Assigned</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionLog[selectedSquad.name + "check"].map((a, i) => (
                      <tr key={i}>
                        <td>{a.action}</td>
                        <td>{a.assignedTo}</td>
                        <td>{a.status}</td>
                        <td>{a.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Next best action */}
          <div style={{ marginTop: 14, fontWeight: 700, color: "#1de682" }}>
            <FaBullhorn style={{ marginRight: 7 }} />
            Next Best Action:<br />
            <span style={{ color: "#FFD700", fontWeight: 700 }}>{nextBestAction(selectedSquad)}</span>
          </div>
        </div>

        {/* Staff/Squad Table & Drilldown */}
        <div
          style={{
            background: "#1a1d20",
            borderRadius: 22,
            minWidth: 340,
            maxWidth: 440,
            padding: 24,
            boxShadow: "0 2px 12px 0 #121416",
          }}
        >
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 17, marginBottom: 8, textAlign: "center" }}>
            Squad & Staff Compliance Table
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 14, fontFamily: "Segoe UI", marginBottom: 7 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #485563" }}>
                <th style={{ textAlign: "left", padding: 4 }}>Squad</th>
                <th>Compliance</th>
                <th>Staff</th>
                <th>Drilldown</th>
              </tr>
            </thead>
            <tbody>
              {squads.map((sq) => (
                <tr key={sq.name} style={{ borderBottom: "1px solid #283E51", background: selectedSquad.name === sq.name ? "#232a2e" : "none" }}>
                  <td style={{ color: "#FFD700", fontWeight: 600 }}>{sq.name}</td>
                  <td style={{ textAlign: "center", color: sq.compliance >= 90 ? "#FFD700" : sq.compliance >= 75 ? "#1de682" : "#ff6b6b", fontWeight: 700 }}>
                    {sq.compliance}%
                  </td>
                  <td style={{ textAlign: "center", color: "#1de682", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => setSelectedStaff(staff.find(st => st.name === sq.staff))}
                  >
                    {sq.staff}
                  </td>
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
                      onClick={() => setSelectedSquad(sq)}
                      title="View"
                    >
                      <FaClipboardCheck />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Staff drilldown */}
          {selectedStaff && (
            <div style={{
              marginTop: 10,
              background: "#FFD700",
              color: "#232a2e",
              borderRadius: 9,
              padding: "10px 14px",
              fontWeight: 600,
            }}>
              <FaUserTie style={{ marginRight: 8 }} />
              {selectedStaff.name} ({selectedStaff.role})
              <div style={{ fontSize: 15, marginTop: 7 }}>
                Safeguarding: {selectedStaff.safesport ? <FaCheckCircle color="#1de682" /> : <FaUserTimes color="#ff6b6b" />} <br />
                Concussion: {selectedStaff.concussion ? <FaCheckCircle color="#1de682" /> : <FaUserTimes color="#ff6b6b" />} <br />
                CPD: {selectedStaff.cpd ? <FaCheckCircle color="#1de682" /> : <FaUserTimes color="#ff6b6b" />} <br />
                Onboarding: {selectedStaff.onboarding ? <FaCheckCircle color="#1de682" /> : <FaUserTimes color="#ff6b6b" />}
              </div>
            </div>
          )}
        </div>

        {/* Policy Repository & Audit Log */}
        <div
          style={{
            background: "#232a2e",
            borderRadius: 18,
            padding: "19px 10px 10px 13px",
            minWidth: 280,
            maxWidth: 360,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div
            style={{
              color: "#FFD700",
              fontWeight: 700,
              fontSize: 17,
              marginBottom: 7,
              textAlign: "center",
            }}
          >
            Policy & Document Repository
            <button
              onClick={() => setShowPolicy(show => !show)}
              style={{
                background: "#FFD700",
                color: "#232a2e",
                border: "none",
                borderRadius: 7,
                fontWeight: 700,
                padding: "5px 13px",
                marginLeft: 10,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {showPolicy ? "Hide" : "Show"}
            </button>
          </div>
          {showPolicy && (
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 14, marginBottom: 6 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {policyRepo.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <FaFileAlt style={{ marginRight: 7, color: "#FFD700" }} />
                      <a href={p.link} style={{ color: "#FFD700", textDecoration: "underline" }}>{p.name}</a>
                    </td>
                    <td>{p.type}</td>
                    <td>{p.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div
            style={{
              color: "#FFD700",
              fontWeight: 700,
              fontSize: 15,
              margin: "10px 0 7px 0",
              textAlign: "center",
            }}
          >
            Compliance Audit Log
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 14, marginBottom: 6 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {demoAuditLog.map((a, i) => (
                <tr key={i}>
                  <td>{a.date}</td>
                  <td>{a.action}</td>
                  <td>{a.by}</td>
                  <td style={{
                    color: a.status === "OK" ? "#1de682" : "#ff6b6b",
                    fontWeight: 700
                  }}>
                    {a.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        Proprietary to CourtEvo Vero. Full compliance, audit, and risk. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
