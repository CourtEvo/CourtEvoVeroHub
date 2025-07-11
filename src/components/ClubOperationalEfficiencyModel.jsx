import React, { useState, useRef } from "react";
import {
  FaCog, FaUsers, FaChartBar, FaBuilding, FaRobot, FaClipboardCheck, FaFileExport, FaArrowUp, FaArrowDown,
  FaComment, FaHistory, FaPaperclip, FaBell, FaTrophy
} from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

// --- Elite Icons per sector
const sectorIcons = {
  Finance: <FaCog />,
  Staffing: <FaUsers />,
  Facility: <FaBuilding />,
  "Digital Ops": <FaChartBar />,
  Compliance: <FaClipboardCheck />,
  Process: <FaChartBar />
};
// --- Elite Benchmarks per sector
const sectorBenchmarks = {
  Finance: { efficiency: 87, label: "Elite avg: 87%" },
  Staffing: { efficiency: 79, label: "Elite avg: 79%" },
  Facility: { efficiency: 92, label: "Elite avg: 92%" },
  "Digital Ops": { efficiency: 85, label: "Elite avg: 85%" },
  Compliance: { efficiency: 96, label: "Elite avg: 96%" },
  Process: { efficiency: 77, label: "Elite avg: 77%" }
};
// --- KPI initial data (add your KPIs or extend)
const initialKPIs = [
  // --- FINANCE ---
  { sector: "Finance", kpi: "Budget Variance", value: 2, target: 0, unit: "%", trend: "up", status: "Risk", notes: "Cost overrun due to unplanned travel" },
  { sector: "Finance", kpi: "Revenue per Player", value: 1050, target: 1200, unit: "€", trend: "down", status: "Monitor", notes: "Decrease after sponsor loss" },
  { sector: "Finance", kpi: "Expense Ratio", value: 0.62, target: 0.58, unit: "", trend: "up", status: "Risk", notes: "" },
  // --- STAFFING ---
  { sector: "Staffing", kpi: "Coach-to-Player Ratio", value: 1 / 13, target: 1 / 12, unit: "", trend: "up", status: "Optimal", notes: "" },
  { sector: "Staffing", kpi: "Staff Retention Rate", value: 92, target: 90, unit: "%", trend: "up", status: "Optimal", notes: "" },
  { sector: "Staffing", kpi: "Volunteer Hours", value: 140, target: 180, unit: "h", trend: "down", status: "Monitor", notes: "" },
  // --- FACILITY ---
  { sector: "Facility", kpi: "Utilization Rate", value: 94, target: 95, unit: "%", trend: "down", status: "Monitor", notes: "" },
  { sector: "Facility", kpi: "Maintenance Gaps", value: 2, target: 0, unit: "", trend: "up", status: "Risk", notes: "Floor needs urgent fix" },
  // --- DIGITAL OPS ---
  { sector: "Digital Ops", kpi: "Data Quality", value: 83, target: 90, unit: "%", trend: "down", status: "Monitor", notes: "" },
  { sector: "Digital Ops", kpi: "Workflow Automation", value: 10, target: 13, unit: "flows", trend: "up", status: "Optimal", notes: "" },
  // --- COMPLIANCE ---
  { sector: "Compliance", kpi: "Policy Audits Passed", value: 18, target: 20, unit: "", trend: "down", status: "Monitor", notes: "" },
  { sector: "Compliance", kpi: "Incident Response Time", value: 9, target: 6, unit: "h", trend: "down", status: "Risk", notes: "Recent spike" },
  // --- PROCESS ---
  { sector: "Process", kpi: "Process Deviation Rate", value: 7, target: 5, unit: "%", trend: "up", status: "Risk", notes: "" },
  { sector: "Process", kpi: "Process Adoption", value: 79, target: 90, unit: "%", trend: "down", status: "Monitor", notes: "" }
];

// --- Color per KPI status
const statusColor = { Optimal: "#27ef7d", Monitor: "#FFD700", Risk: "#e94057" };

// --- Simple AI suggestions (expand as needed)
function getAISuggestions(kpis) {
  const tips = [];
  if (kpis.some(k => k.status === "Risk")) tips.push("Prioritize KPIs with Risk status.");
  if (kpis.filter(k => k.status === "Monitor").length > 2) tips.push("Too many metrics in 'Monitor' status—pick one to escalate.");
  if (kpis.filter(k => k.status === "Optimal").length === kpis.length) tips.push("All KPIs optimal. Consider raising targets for continuous improvement.");
  return tips.length ? tips : ["Review each sector for optimization opportunities."];
}
function getSectorScore(kpis, sector) {
  const items = kpis.filter(k => k.sector === sector);
  if (!items.length) return 0;
  let score = 0;
  items.forEach(k => {
    const dev = Math.abs((k.value - k.target) / (k.target || 1));
    score += dev < 0.05 ? 100 : dev < 0.12 ? 80 : 60;
  });
  return Math.round(score / items.length);
}

export default function ClubOperationalEfficiencyModel() {
  const [kpis, setKpis] = useState(initialKPIs);
  const [selectedSector, setSelectedSector] = useState("All");
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [comments, setComments] = useState({});
  const [attachments, setAttachments] = useState({});
  const [showDetailsIdx, setShowDetailsIdx] = useState(null);
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  // PDF export
  const dashboardRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => dashboardRef.current,
    documentTitle: `CourtEvoVero_Operational_Efficiency_${new Date().toISOString().slice(0, 10)}`
  });

  // --- Alerts logic ---
  const alerts = [];
  ["Finance", "Staffing", "Facility", "Digital Ops", "Compliance", "Process"].forEach(sector => {
    const score = getSectorScore(kpis, sector);
    if (score < 80) alerts.push({
      sector,
      text: `${sector} efficiency is below optimal: ${score}% (review actions)`,
      color: "#e94057"
    });
  });

  // --- AI Next Best Actions ---
  function getNextBestActions() {
    return ["Finance", "Staffing", "Facility", "Digital Ops", "Compliance", "Process"].map(sector => {
      const sectorKPIs = kpis.filter(k => k.sector === sector);
      if (!sectorKPIs.length) return null;
      const worst = sectorKPIs.reduce((min, k) =>
        Math.abs(k.value - k.target) > Math.abs(min.value - min.target) ? k : min, sectorKPIs[0]
      );
      return {
        sector,
        kpi: worst.kpi,
        suggestion: `Focus on "${worst.kpi}"—current: ${worst.value}${worst.unit} vs. target: ${worst.target}${worst.unit}. ${worst.trend === "up" ? "Identify drivers for increase." : "Investigate barriers for improvement."}`
      };
    }).filter(Boolean);
  }

  // --- Changelog (simulate; replace with actual logic if needed) ---
  const [changeLog, setChangeLog] = useState([
    { date: "2025-06-15", user: "Board", action: "Reviewed operational KPIs and set new targets" },
    { date: "2025-06-10", user: "Director", action: "Added 'Workflow Automation' metric" }
  ]);

  // --- Handle comments ---
  const addComment = (idx, text) => setComments(c => ({
    ...c, [idx]: [...(c[idx] || []), { text, at: new Date().toLocaleString() }]
  }));
  // --- Attachments ---
  const attachFile = (idx, file) => setAttachments(a => ({
    ...a, [idx]: [...(a[idx] || []), { name: file.name, at: new Date().toLocaleString() }]
  }));

  // --- Filtered view ---
  const filteredKPIs = selectedSector === "All" ? kpis : kpis.filter(k => k.sector === selectedSector);
  const sectorList = ["Finance", "Staffing", "Facility", "Digital Ops", "Compliance", "Process"];

  return (
    <div style={{ maxWidth: 1250, margin: "0 auto", padding: "0 0 60px 0" }}>
      <div ref={dashboardRef}>
        {/* ALERTS */}
        {alerts.length > 0 && (
          <div style={{
            background: "#e94057", color: "#fff", fontWeight: 800, fontSize: 17,
            padding: "13px 20px", borderRadius: 11, margin: "23px 0 15px 0", boxShadow: "0 2px 16px #FFD70033"
          }}>
            <FaBell style={{ marginRight: 9 }} />
            {alerts.map(a => (
              <span key={a.sector} style={{ marginRight: 20 }}>{a.text}</span>
            ))}
          </div>
        )}

        {/* SECTOR QUICK STATS */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 17, justifyContent: "center"
        }}>
          {sectorList.map(sec => {
            const score = getSectorScore(kpis, sec);
            return (
              <div key={sec} style={{
                minWidth: 185, background: "#181e23", borderRadius: 14, padding: "19px 14px",
                boxShadow: score >= 90 ? "0 2px 18px #27ef7d44" : score >= 80 ? "0 2px 18px #FFD70044" : "0 2px 18px #e9405744",
                display: "flex", flexDirection: "column", alignItems: "center"
              }}>
                <div style={{ fontSize: 29, marginBottom: 3 }}>
                  {sectorIcons[sec]}
                </div>
                <div style={{
                  fontWeight: 900, fontSize: 21, color: score >= 90 ? "#27ef7d" : score >= 80 ? "#FFD700" : "#e94057"
                }}>
                  {score}%
                </div>
                <div style={{
                  color: "#FFD700", fontSize: 14, fontWeight: 700, textTransform: "uppercase", marginBottom: 2
                }}>
                  {sec}
                </div>
                {showBenchmarks && (
                  <div style={{
                    background: "#FFD70022", color: "#FFD700", fontSize: 12, borderRadius: 7,
                    padding: "2px 7px", marginTop: 6, fontWeight: 700
                  }}>
                    <FaTrophy style={{ marginRight: 5 }} /> {sectorBenchmarks[sec].label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- CONTROLS --- */}
        <section style={{
          background: "rgba(36,41,50,0.99)", borderRadius: 20, padding: 28, margin: "18px 0 18px 0",
          boxShadow: "0 3px 22px #FFD70022"
        }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 17, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => setShowBenchmarks(s => !s)}
              style={{
                background: showBenchmarks ? "#FFD700" : "#181e23",
                color: showBenchmarks ? "#232a2e" : "#FFD700",
                fontWeight: 900, border: "none", borderRadius: 8, padding: "8px 19px", fontSize: 16, cursor: "pointer"
              }}>
              <FaTrophy style={{ marginRight: 4 }} /> Benchmarks
            </button>
            <button onClick={handlePrint}
              style={{
                background: "#232a2e", color: "#FFD700", fontWeight: 700, border: "none", borderRadius: 8,
                padding: "8px 19px", fontSize: 16, cursor: "pointer"
              }}>
              <FaFileExport style={{ marginRight: 5 }} /> Export PDF
            </button>
            <button onClick={() => setShowAISuggestions(s => !s)}
              style={{
                background: showAISuggestions ? "#27ef7d" : "#181e23",
                color: showAISuggestions ? "#232a2e" : "#27ef7d",
                fontWeight: 800, border: "none", borderRadius: 8, padding: "8px 19px", fontSize: 16, cursor: "pointer"
              }}>
              <FaRobot style={{ marginRight: 5 }} /> AI Assist
            </button>
            <button onClick={() => setShowChangeLog(s => !s)}
              style={{
                background: showChangeLog ? "#FFD700" : "#181e23",
                color: showChangeLog ? "#232a2e" : "#FFD700",
                fontWeight: 900, border: "none", borderRadius: 8, padding: "8px 19px", fontSize: 16, cursor: "pointer"
              }}>
              <FaHistory style={{ marginRight: 5 }} /> Change Log
            </button>
            <select value={selectedSector} onChange={e => setSelectedSector(e.target.value)}
              style={{
                padding: "8px 15px", fontWeight: 800, fontSize: 16, color: "#232a2e",
                background: "#FFD700", borderRadius: 8, border: "none"
              }}>
              <option value="All">All Sectors</option>
              {sectorList.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>

          {/* --- AI Next Best Action (per sector) --- */}
          <div style={{
            background: "#283E51", borderRadius: 13, marginBottom: 16, padding: "11px 18px", boxShadow: "0 2px 9px #FFD70044"
          }}>
            <h4 style={{ color: "#FFD700", fontWeight: 900, fontSize: 18, margin: "4px 0 7px 0" }}>
              <FaRobot style={{ color: "#1de682", fontSize: 18, marginRight: 5 }} />
              AI Next Best Action (per sector)
            </h4>
            <ul style={{ color: "#1de682", fontWeight: 700, margin: 0, paddingLeft: 19, fontSize: 15 }}>
              {getNextBestActions().map((s, i) =>
                <li key={i}><b>{s.sector}:</b> {s.suggestion}</li>
              )}
            </ul>
          </div>

          {/* --- AI Smart Suggestions --- */}
          {showAISuggestions && (
            <div style={{
              background: "#283E51", borderRadius: 13, marginBottom: 13, padding: "8px 15px", boxShadow: "0 2px 9px #FFD70044"
            }}>
              <h4 style={{ color: "#FFD700", fontWeight: 900, fontSize: 17, margin: "2px 0 4px 0" }}>
                <FaRobot style={{ color: "#1de682", fontSize: 16, marginRight: 4 }} />
                AI Smart Suggestions
              </h4>
              <ul style={{ color: "#1de682", fontWeight: 700, margin: 0, paddingLeft: 16, fontSize: 14 }}>
                {getAISuggestions(selectedSector === "All" ? kpis : kpis.filter(k => k.sector === selectedSector)).map((s, i) =>
                  <li key={i}>{s}</li>
                )}
              </ul>
            </div>
          )}

          {/* --- MAIN TABLE --- */}
          <div style={{
            overflowX: "auto", borderRadius: 12, boxShadow: "0 2px 12px #FFD70022",
            marginBottom: 15, background: "#232a2e"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thS}>Sector</th>
                  <th style={thS}>KPI</th>
                  <th style={thS}>Current</th>
                  <th style={thS}>Target</th>
                  <th style={thS}>Status</th>
                  <th style={thS}>Trend</th>
                  <th style={thS}>Notes</th>
                  <th style={thS}>Comment</th>
                  <th style={thS}>Attach</th>
                  <th style={thS}>History</th>
                </tr>
              </thead>
              <tbody>
                {filteredKPIs.map((k, idx) => (
                  <tr key={idx}>
                    <td style={tdS}>
                      <span style={{ fontWeight: 800, color: "#FFD700", fontSize: 16 }}>
                        {sectorIcons[k.sector]} {k.sector}
                      </span>
                    </td>
                    <td style={tdS}>{k.kpi}</td>
                    <td style={tdS}>
                      {k.value}
                      {k.unit}
                    </td>
                    <td style={tdS}>{k.target}{k.unit}</td>
                    <td style={{ ...tdS, color: statusColor[k.status], fontWeight: 900 }}>{k.status}</td>
                    <td style={tdS}>
                      {k.trend === "up"
                        ? <FaArrowUp color="#27ef7d" />
                        : <FaArrowDown color="#e94057" />}
                    </td>
                    <td style={tdS}>{k.notes}</td>
                    {/* --- Comments --- */}
                    <td style={tdS}>
                      <button
                        title="Add comment"
                        style={{ background: "transparent", border: "none", color: "#FFD700", fontSize: 18, cursor: "pointer" }}
                        onClick={() => setShowDetailsIdx(idx === showDetailsIdx ? null : idx)}
                      >
                        <FaComment />
                      </button>
                      {/* Comment Popup */}
                      {showDetailsIdx === idx && (
                        <div style={{
                          position: "absolute", background: "#232a2e", color: "#fff", padding: 11,
                          borderRadius: 10, zIndex: 100, boxShadow: "0 2px 18px #FFD70055", marginTop: 8
                        }}>
                          <b>Add Comment:</b>
                          <textarea
                            rows={3}
                            style={{ width: 180, margin: "7px 0", borderRadius: 7, border: "1px solid #FFD700", padding: 6 }}
                            onBlur={e => addComment(idx, e.target.value)}
                            placeholder="Enter comment and click outside"
                          />
                          <div style={{ fontSize: 13, color: "#27ef7d" }}>
                            {comments[idx]?.map((c, i) => (
                              <div key={i} style={{ margin: "4px 0" }}>
                                <b>{c.at}:</b> {c.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    {/* --- Attachments --- */}
                    <td style={tdS}>
                      <label title="Attach file" style={{ cursor: "pointer" }}>
                        <FaPaperclip style={{ color: "#FFD700", fontSize: 19 }} />
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={e => {
                            if (e.target.files[0]) attachFile(idx, e.target.files[0]);
                          }}
                        />
                      </label>
                      {attachments[idx]?.map((f, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#FFD700" }}>
                          {f.name} ({f.at})
                        </div>
                      ))}
                    </td>
                    {/* --- Change log/history popup --- */}
                    <td style={tdS}>
                      <button
                        title="Show history"
                        style={{ background: "transparent", border: "none", color: "#FFD700", fontSize: 18, cursor: "pointer" }}
                        onClick={() => setShowChangeLog(!showChangeLog)}
                      >
                        <FaHistory />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- Change Log Sidebar --- */}
          {showChangeLog && (
            <div style={{
              background: "#232a2e", borderRadius: 10, padding: 18, margin: "18px 0", boxShadow: "0 2px 16px #FFD70022"
            }}>
              <h4 style={{ color: "#FFD700", fontWeight: 900, fontSize: 17, marginBottom: 8 }}>
                <FaHistory style={{ marginRight: 6 }} /> Change Log
              </h4>
              <ul style={{ color: "#FFD700", fontWeight: 700, fontSize: 15 }}>
                {changeLog.map((log, i) => (
                  <li key={i}>
                    <b>{log.date}</b> — {log.user}: {log.action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// --- table styles
const thS = {
  background: "#283E51",
  color: "#FFD700",
  fontWeight: 900,
  fontSize: 17,
  padding: "11px 10px",
  borderBottom: "2px solid #FFD700"
};
const tdS = {
  padding: "10px 9px",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  borderBottom: "1px solid #FFD70022",
  background: "#232a2e",
  verticalAlign: "top"
};
