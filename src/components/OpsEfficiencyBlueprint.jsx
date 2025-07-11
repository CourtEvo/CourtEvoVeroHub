import React, { useState } from "react";
import {
  FaCogs, FaExclamationTriangle, FaChartBar, FaUserTie, FaSitemap, FaUsers, FaArrowRight, FaChartLine,
  FaDownload, FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaBolt, FaBalanceScale, FaMoneyBillWave, FaPlus, FaFileExport, FaUsersCog
} from "react-icons/fa";

// Demo Data: For real use, connect to backend/db
const ROLES = [
  { role: "President", holder: "Petar Horvat", status: "filled", keyTasks: 7, dependents: 2, raci: "A - Board, R - Board, C - Finance, I - Staff" },
  { role: "Technical Director", holder: "Luka Perić", status: "filled", keyTasks: 5, dependents: 4, raci: "A - Board, R - Coaches, C - Players, I - Admin" },
  { role: "Finance Director", holder: "Marko Kovač", status: "filled", keyTasks: 8, dependents: 1, raci: "A - Board, R - Finance, C - Admin, I - President" },
  { role: "Medical Officer", holder: "Open", status: "open", keyTasks: 4, dependents: 0, raci: "A - President, R - Medical, C - Coaches, I - Players" },
  { role: "Facilities Manager", holder: "Open", status: "open", keyTasks: 3, dependents: 1, raci: "A - President, R - Facilities, C - Finance, I - Board" }
];
const PROCESSES = [
  { process: "Budget Approval", owner: "Finance Director", status: "on-time", last: "2024-05-10" },
  { process: "Staff Appraisals", owner: "Technical Director", status: "overdue", last: "2024-04-01" },
  { process: "Medical Screenings", owner: "Medical Officer", status: "pending", last: "2023-12-15" }
];
const COST_SAVINGS = [
  { initiative: "Shared Facility Use", annual: 12000 },
  { initiative: "Vendor Renegotiation", annual: 6000 },
  { initiative: "Digital Invoicing", annual: 3400 }
];
const REVENUE_BOOSTERS = [
  { name: "Mini-Academy Clinics", value: 18000 },
  { name: "Sponsorship Activation", value: 34000 },
  { name: "Merch Launch", value: 7000 }
];
const BOTTLENECKS = [
  { area: "Admin", risk: "MEDIUM", note: "New software training needed" },
  { area: "Medical", risk: "HIGH", note: "Open position, process delay" },
  { area: "Facilities", risk: "LOW", note: "All systems go" }
];
const PROCESS_KPIS = [
  { kpi: "Avg. Process Delay (days)", val: 4.5, warn: 3, danger: 7 },
  { kpi: "Open Tasks >30 days", val: 2, warn: 1, danger: 3 }
];
const PROCESS_HEAT = [
  { step: "Budget", risk: "low" },
  { step: "Staffing", risk: "medium" },
  { step: "Medical", risk: "high" },
  { step: "Facilities", risk: "low" },
  { step: "Equipment", risk: "medium" }
];
const IMPROVEMENTS = [
  { date: "2024-05-13", action: "Launched digital invoicing", by: "Finance Director", effect: "+15% admin speed" },
  { date: "2024-04-27", action: "Shared facilities with U16 team", by: "President", effect: "€10k savings" }
];

export default function OpsEfficiencyBlueprint() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [improve, setImprove] = useState("");
  const [improvements, setImprovements] = useState(IMPROVEMENTS);
  const [openRoles, setOpenRoles] = useState(ROLES.filter(r => r.status === "open"));
  const [assignName, setAssignName] = useState("");
  const [showAssigned, setShowAssigned] = useState(false);

  function getRiskColor(risk) {
    if (risk === "high" || risk === "HIGH") return "#e82e2e";
    if (risk === "medium" || risk === "MEDIUM") return "#FFD700";
    return "#1de682";
  }
  function addImprovement() {
    if (improve.trim() !== "") {
      setImprovements([
        { date: new Date().toISOString().slice(0, 10), action: improve, by: "Board", effect: "Board added" },
        ...improvements
      ]);
      setImprove("");
    }
  }
  function assignRole(roleIdx) {
    if (assignName.trim() !== "") {
      let newRoles = [...ROLES];
      newRoles[roleIdx] = { ...newRoles[roleIdx], holder: assignName, status: "filled" };
      setOpenRoles(newRoles.filter(r => r.status === "open"));
      setAssignName("");
      setShowAssigned(true);
      setTimeout(() => setShowAssigned(false), 1700);
    }
  }

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1650,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 22px 0", background: "linear-gradient(90deg, #FFD700 40%, #1de682 100%)" }} />
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <FaCogs style={{ fontSize: 30, color: "#FFD700", marginRight: 10 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>
          Operational Efficiency Blueprint
        </h2>
        <button style={btnStyle}><FaDownload style={{ marginRight: 8, fontSize: 15 }} /> Export PDF</button>
        <button style={miniBtn}><FaFileExport style={{ marginRight: 5 }} /> Export CSV</button>
      </div>
      {/* Open Roles */}
      {openRoles.length > 0 && (
        <div style={{
          background: "#181e23", color: "#FFD700", borderRadius: 14, padding: "13px 19px",
          marginBottom: 18, display: "flex", alignItems: "center", gap: 18
        }}>
          <FaUsersCog style={{ fontSize: 24, marginRight: 7, color: "#FFD700" }} />
          <b>Open/Critical Roles:</b>
          {openRoles.map((r, idx) => (
            <span key={r.role} style={{ color: "#FFD700", fontWeight: 900, marginLeft: 7 }}>
              {r.role} ({r.holder})
              <input
                type="text"
                value={assignName}
                onChange={e => setAssignName(e.target.value)}
                placeholder="Assign name"
                style={inputStyle}
              />
              <button style={miniBtn} onClick={() => assignRole(idx)}>
                <FaCheckCircle style={{ color: "#1de682" }} /> Assign Now
              </button>
            </span>
          ))}
          {showAssigned && <span style={{ color: "#1de682", marginLeft: 20 }}>Role assigned!</span>}
        </div>
      )}
      {/* Role Matrix */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "16px 18px", marginBottom: 18
      }}>
        <b style={{ fontSize: 18, color: "#FFD700" }}><FaSitemap style={{ marginRight: 7 }} /> Role Matrix (Key Roles)</b>
        <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 16 }}>
          <thead>
            <tr>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Holder</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Key Tasks</th>
              <th style={thStyle}>Dependents</th>
              <th style={thStyle}>RACI</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r, i) => (
              <tr
                key={i}
                style={{ background: r.status === "open" ? "#FFD70022" : "#232a2e", cursor: "pointer" }}
                onClick={() => setSelectedRole(selectedRole === i ? null : i)}
                title="Click to view RACI details"
              >
                <td style={tdStyle}>{r.role}</td>
                <td style={tdStyle}>{r.holder}</td>
                <td style={{ ...tdStyle, color: r.status === "open" ? "#FFD700" : "#1de682", fontWeight: 900 }}>
                  {r.status === "open" ? "Open" : "Filled"}
                </td>
                <td style={tdStyle}>{r.keyTasks}</td>
                <td style={tdStyle}>{r.dependents}</td>
                <td style={tdStyle}>{r.raci.split(",")[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* RACI popover */}
        {selectedRole !== null && (
          <div style={{
            marginTop: 11, background: "#283E51", color: "#FFD700", borderRadius: 9, padding: "17px 18px"
          }}>
            <b>RACI Detail for {ROLES[selectedRole].role}:</b>
            <div style={{ marginTop: 7, color: "#FFD700", fontWeight: 700 }}>{ROLES[selectedRole].raci}</div>
            <button style={miniBtn} onClick={() => setSelectedRole(null)}>Close</button>
          </div>
        )}
      </div>
      {/* Process Compliance */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "16px 18px", marginBottom: 18
      }}>
        <b style={{ fontSize: 18, color: "#FFD700" }}><FaClipboardCheck style={{ marginRight: 7 }} /> Process Compliance</b>
        {/* Heatmap */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "13px 0 12px 0" }}>
          <b>Process Heatmap:</b>
          {PROCESS_HEAT.map((ph, i) => (
            <div key={ph.step} style={{
              background: getRiskColor(ph.risk),
              color: "#232a2e",
              borderRadius: 6,
              padding: "8px 14px",
              marginRight: 4,
              fontWeight: 900
            }}>{ph.step}</div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
          <thead>
            <tr>
              <th style={thStyle}>Process</th>
              <th style={thStyle}>Owner</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Last Completion</th>
            </tr>
          </thead>
          <tbody>
            {PROCESSES.map((p, i) => (
              <tr key={i} style={{ background: p.status === "overdue" ? "#e82e2e22" : p.status === "pending" ? "#FFD70022" : "#232a2e" }}>
                <td style={tdStyle}>{p.process}</td>
                <td style={tdStyle}>{p.owner}</td>
                <td style={{
                  ...tdStyle,
                  color: p.status === "on-time" ? "#1de682" : p.status === "pending" ? "#FFD700" : "#e82e2e",
                  fontWeight: 900
                }}>
                  {p.status.replace("-", " ").toUpperCase()}
                </td>
                <td style={tdStyle}>{p.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Cost Savings + Revenue Boosters */}
      <div style={{ display: "flex", gap: 34, marginBottom: 17, flexWrap: "wrap" }}>
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "16px 17px", minWidth: 290, maxWidth: 400, flex: 1
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}><FaBalanceScale style={{ marginRight: 7 }} /> Cost Saving Initiatives</b>
          <ul style={{ margin: "10px 0 0 19px", color: "#FFD700", fontWeight: 800 }}>
            {COST_SAVINGS.map((c, i) => (
              <li key={i}>{c.initiative} <span style={{ color: "#1de682" }}>({c.annual} € saved)</span></li>
            ))}
          </ul>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "16px 17px", minWidth: 290, maxWidth: 400, flex: 1
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}><FaMoneyBillWave style={{ marginRight: 7 }} /> Revenue Boosters</b>
          <ul style={{ margin: "10px 0 0 19px", color: "#FFD700", fontWeight: 800 }}>
            {REVENUE_BOOSTERS.map((r, i) => (
              <li key={i}>{r.name} <span style={{ color: "#1de682" }}>({r.value} €)</span></li>
            ))}
          </ul>
        </div>
      </div>
      {/* Bottlenecks and Process KPIs */}
      <div style={{ display: "flex", gap: 34, marginBottom: 17, flexWrap: "wrap" }}>
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "16px 17px", minWidth: 310, flex: 1
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}><FaBolt style={{ marginRight: 7 }} /> Operational Bottlenecks</b>
          <ul style={{ margin: "10px 0 0 19px" }}>
            {BOTTLENECKS.map((b, i) => (
              <li key={i} style={{
                color: getRiskColor(b.risk), fontWeight: 900, fontSize: 15
              }}>
                {b.area}: {b.risk}
                <span style={{ color: "#FFD700bb", fontWeight: 700 }}> – {b.note}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "16px 17px", minWidth: 310, flex: 1
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}><FaChartBar style={{ marginRight: 7 }} /> Process KPIs</b>
          <ul style={{ margin: "10px 0 0 19px" }}>
            {PROCESS_KPIS.map((k, i) => (
              <li key={i} style={{
                color: k.val >= k.danger ? "#e82e2e" : k.val >= k.warn ? "#FFD700" : "#1de682",
                fontWeight: 900, fontSize: 15
              }}>
                {k.kpi}: <span style={{ fontWeight: 800 }}>{k.val}</span>
                {k.val >= k.danger ? <FaTimesCircle style={{ color: "#e82e2e", marginLeft: 6 }} /> :
                  k.val >= k.warn ? <FaExclamationTriangle style={{ color: "#FFD700", marginLeft: 6 }} /> :
                    <FaCheckCircle style={{ color: "#1de682", marginLeft: 6 }} />}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Improvement Action Panel */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "16px 18px", marginBottom: 13, marginTop: 15
      }}>
        <b style={{ fontSize: 18, color: "#FFD700" }}><FaPlus style={{ marginRight: 7 }} /> Add Improvement Action</b>
        <div style={{ display: "flex", gap: 13, alignItems: "center", marginTop: 11 }}>
          <input
            type="text"
            value={improve}
            onChange={e => setImprove(e.target.value)}
            placeholder="Describe improvement (action, owner, expected effect)…"
            style={inputStyle}
          />
          <button style={miniBtn} onClick={addImprovement}>
            <FaCheckCircle style={{ color: "#1de682" }} /> Add
          </button>
        </div>
        <ul style={{ margin: "13px 0 0 19px" }}>
          {improvements.slice(0, 5).map((imp, i) => (
            <li key={i} style={{ fontWeight: 900 }}>
              {imp.date}: {imp.action} <span style={{ color: "#FFD700bb", fontWeight: 700 }}>({imp.by})</span>
              <span style={{ color: "#1de682", fontWeight: 800, marginLeft: 11 }}>{imp.effect}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Actionable Insights */}
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "12px 14px",
        fontWeight: 700,
        fontSize: 15,
        marginTop: 17
      }}>
        <FaExclamationTriangle style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Board Action:</b> Prioritize filling open Medical & Facilities roles, accelerate digital processes, track overdue staff appraisals.
      </div>
    </div>
  );
}

// --- Styles ---
const thStyle = {
  color: "#FFD700",
  background: "#232a2e",
  fontWeight: 900,
  padding: "13px 12px",
  textAlign: "center",
  borderRadius: "10px 10px 0 0"
};
const tdStyle = {
  background: "#fff",
  color: "#232a2e",
  fontWeight: 700,
  padding: "11px 9px"
};
const btnStyle = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 14,
  padding: "5px 13px",
  marginRight: 5,
  cursor: "pointer"
};
const miniBtn = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 6,
  fontWeight: 900,
  fontSize: 13,
  padding: "4px 10px",
  marginTop: 4,
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
