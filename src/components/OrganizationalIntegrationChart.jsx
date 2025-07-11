import React, { useRef, useState } from 'react';
import {
  FaUserTie, FaCogs, FaChartLine, FaBullhorn, FaUser, FaExclamationTriangle, FaFilePdf,
  FaRegEdit, FaFlag, FaRobot, FaFileAlt, FaDownload, FaEye, FaHistory, FaUserClock, FaChartBar, FaUserShield
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Domain Colors
const DOMAIN_COLORS = {
  Executive: '#FFD700',
  Sport: '#1de682',
  'Finance & Admin': '#66c1ff',
  'Engagement & Media': '#a47fff',
  Operations: '#fe7f7f'
};

const ROLE_ICONS = {
  Executive: <FaUserTie />,
  Sport: <FaChartLine />,
  'Finance & Admin': <FaCogs />,
  'Engagement & Media': <FaBullhorn />,
  Operations: <FaUser />
};

// Initial Org Structure
const BASE_STRUCTURE = [
  {
    domain: "Executive",
    color: DOMAIN_COLORS.Executive,
    roles: [
      { name: "President", owner: "Marko", kpi: "Vision, External", status: "filled", risk: "low", docs: [], notes: "" },
      { name: "Vice-President", owner: "Ana", kpi: "Board, Ops", status: "filled", risk: "medium", docs: [], notes: "" }
    ]
  },
  {
    domain: "Sport",
    color: DOMAIN_COLORS.Sport,
    roles: [
      { name: "Sport Director", owner: "Luka", kpi: "Talent, Coaches", status: "filled", risk: "low", docs: [], notes: "" },
      { name: "Technical Director", owner: "Ivan", kpi: "Curriculum", status: "filled", risk: "low", docs: [], notes: "" },
      { name: "Youth Dev Lead", owner: "Petra", kpi: "Youth", status: "filled", risk: "medium", docs: [], notes: "" }
    ]
  },
  {
    domain: "Finance & Admin",
    color: DOMAIN_COLORS['Finance & Admin'],
    roles: [
      { name: "Finance Lead", owner: "Jakov", kpi: "Budget", status: "filled", risk: "medium", docs: [], notes: "" },
      { name: "Legal/Compliance", owner: "Martina", kpi: "Contracts", status: "filled", risk: "low", docs: [], notes: "" }
    ]
  },
  {
    domain: "Engagement & Media",
    color: DOMAIN_COLORS['Engagement & Media'],
    roles: [
      { name: "PR/Media Lead", owner: "Tina", kpi: "Comms", status: "filled", risk: "low", docs: [], notes: "" },
      { name: "Community Officer", owner: "Leo", kpi: "Outreach", status: "filled", risk: "medium", docs: [], notes: "" },
      { name: "Sponsorship Lead", owner: null, kpi: "Sponsors", status: "vacant", risk: "high", docs: [], notes: "" }
    ]
  },
  {
    domain: "Operations",
    color: DOMAIN_COLORS.Operations,
    roles: [
      { name: "Operations Manager", owner: null, kpi: "Logistics", status: "vacant", risk: "high", docs: [], notes: "" }
    ]
  }
];

// Integration links
const INTEGRATION_LINKS = [
  { from: "Sport Director", fromDomain: "Sport", to: "President", toDomain: "Executive" },
  { from: "Finance Lead", fromDomain: "Finance & Admin", to: "President", toDomain: "Executive" },
  { from: "PR/Media Lead", fromDomain: "Engagement & Media", to: "Sport Director", toDomain: "Sport" },
  { from: "Sponsorship Lead", fromDomain: "Engagement & Media", to: "Finance Lead", toDomain: "Finance & Admin" },
  { from: "Operations Manager", fromDomain: "Operations", to: "Technical Director", toDomain: "Sport" }
];

// Status/Risk styling
const STATUS_COLOR = { filled: "#1de682", vacant: "#FFD700" };
const RISK_COLOR = { low: "#27ef7d", medium: "#FFD700", high: "#e94057" };

// AI Suggestions (very basic for demo)
function aiSuggestion(role) {
  if (role.status === "vacant" || role.risk === "high")
    return "⚡ Immediate priority: Fill this role or mitigate high risk!";
  if (role.risk === "medium")
    return "Monitor this role for continuity and integration gaps.";
  return "Stable. Continue regular reviews.";
}

// Drilldown panel/modal (simple overlay, no extra lib)
function RoleDrilldown({ role, onClose, onUpdate }) {
  const [notes, setNotes] = useState(role.notes || "");
  const [files, setFiles] = useState(role.docs || []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(34,42,46,0.96)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#232a2e", color: "#fff", borderRadius: 18, maxWidth: 440, width: "100%",
        padding: "32px 32px 24px 32px", boxShadow: "0 2px 32px #FFD70077"
      }}>
        <h3 style={{ color: "#FFD700", marginBottom: 9 }}>{role.name} <FaRegEdit style={{ marginLeft: 8 }} /></h3>
        <div style={{ marginBottom: 7 }}>
          <b>Status:</b> <span style={{ color: STATUS_COLOR[role.status] }}>{role.status}</span>
        </div>
        <div style={{ marginBottom: 7 }}>
          <b>Owner:</b> <input value={role.owner || ""} onChange={e => onUpdate({ ...role, owner: e.target.value })} style={{ fontSize: 15, borderRadius: 5 }} />
        </div>
        <div style={{ marginBottom: 7 }}>
          <b>KPI:</b> <input value={role.kpi} onChange={e => onUpdate({ ...role, kpi: e.target.value })} style={{ fontSize: 15, borderRadius: 5 }} />
        </div>
        <div style={{ marginBottom: 7 }}>
          <b>Risk:</b>{" "}
          <select value={role.risk} onChange={e => onUpdate({ ...role, risk: e.target.value })}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </div>
        <div style={{ marginBottom: 7 }}>
          <b>Notes:</b>
          <textarea
            rows={3}
            style={{ width: "100%", borderRadius: 7, fontSize: 15 }}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => onUpdate({ ...role, notes })}
          />
        </div>
        <div style={{ marginBottom: 11 }}>
          <b>AI Suggestion:</b> <span style={{ color: "#FFD70099", marginLeft: 7 }}><FaRobot style={{ marginBottom: -2 }} /> {aiSuggestion(role)}</span>
        </div>
        <div style={{ marginBottom: 10 }}>
          <b>Supporting Docs:</b>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            style={{ marginLeft: 10 }}
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = evt => {
                setFiles(fs => {
                  const arr = [...fs, { name: file.name, data: evt.target.result }];
                  onUpdate({ ...role, docs: arr });
                  return arr;
                });
              };
              reader.readAsDataURL(file);
            }}
          />
          {files && files.length > 0 && (
            <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', fontSize: 14 }}>
              {files.map((doc, idx) => (
                <li key={idx}>
                  <a href={doc.data} download={doc.name} style={{ color: "#1de682", textDecoration: "underline" }}>{doc.name}</a>
                  <button style={{ color: "#FFD700", background: "none", border: "none", fontSize: 15, marginLeft: 4, cursor: "pointer" }}
                    onClick={() => {
                      const arr = files.filter((_, i) => i !== idx);
                      setFiles(arr); onUpdate({ ...role, docs: arr });
                    }}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ marginTop: 17, textAlign: "center" }}>
          <button onClick={onClose} style={{
            background: "#FFD700", color: "#232a2e", fontWeight: 900, border: "none",
            borderRadius: 7, padding: "8px 26px", fontSize: 18, cursor: "pointer"
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// AI Gap Analysis
function getAIGapAnalysis(structure) {
  const risks = [];
  structure.forEach(d =>
    d.roles.forEach(r => {
      if (r.status === "vacant" || r.risk === "high")
        risks.push(`[${d.domain}] ${r.name}: vacancy/risk`);
    })
  );
  if (risks.length === 0) return "No critical gaps. All key roles filled and stable.";
  return "⚠️ Attention: " + risks.join("; ");
}

// CSV Download utility
function downloadCSV(structure) {
  let csv = "Domain,Role,Owner,KPI,Status,Risk,Notes\n";
  structure.forEach(d => d.roles.forEach(r => {
    csv += `"${d.domain}","${r.name}","${r.owner || ""}","${r.kpi}","${r.status}","${r.risk}","${(r.notes || "").replace(/"/g,'""')}"\n`;
  }));
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OrgIntegrationChart_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Main component
export default function OrganizationalIntegrationChart() {
  const chartRef = useRef();
  const [structure, setStructure] = useState(BASE_STRUCTURE);
  const [filterVacant, setFilterVacant] = useState(false);
  const [filterHighRisk, setFilterHighRisk] = useState(false);
  const [drill, setDrill] = useState(null);

  // Export as PDF
  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "l", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`OrgIntegrationChart_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Visual filter logic
  let displayStructure = structure.map(d => ({
    ...d,
    roles: d.roles.filter(r =>
      (!filterVacant || r.status === "vacant") &&
      (!filterHighRisk || r.risk === "high")
    )
  })).filter(d => d.roles.length > 0);

  // SVG Integration lines (simple horizontal/column links for now)
  const columnOffsets = [0];
  const colWidths = 245;
  for (let i = 1; i < displayStructure.length; i++)
    columnOffsets.push(columnOffsets[i - 1] + colWidths);

  return (
    <div style={{ maxWidth: 1750, margin: "36px auto", padding: 24, background: "#232a2e", borderRadius: 24, boxShadow: "0 3px 18px #FFD70022" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 29 }}>Organizational Integration Chart</h2>
        <div style={{ display: "flex", gap: 11 }}>
          <button onClick={handleExportPDF} style={{
            background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 800,
            fontSize: 17, padding: "8px 18px", cursor: "pointer", boxShadow: "0 2px 8px #FFD70044"
          }}>
            <FaFilePdf style={{ marginRight: 7, marginBottom: -2 }} /> Export PDF
          </button>
          <button onClick={() => downloadCSV(structure)} style={{
            background: "#1de682", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 800,
            fontSize: 17, padding: "8px 18px", cursor: "pointer", boxShadow: "0 2px 8px #27ef7d44"
          }}>
            <FaDownload style={{ marginRight: 7, marginBottom: -2 }} /> Download CSV
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 7 }}>
        <button onClick={() => setFilterVacant(f => !f)} style={{
          background: filterVacant ? "#FFD700" : "#232a2e",
          color: filterVacant ? "#232a2e" : "#FFD700",
          border: "2px solid #FFD700",
          fontWeight: 700,
          fontSize: 16,
          borderRadius: 8,
          padding: "6px 18px",
          cursor: "pointer"
        }}><FaFlag style={{ marginBottom: -2, marginRight: 6 }} />Vacant Only</button>
        <button onClick={() => setFilterHighRisk(f => !f)} style={{
          background: filterHighRisk ? "#e94057" : "#232a2e",
          color: filterHighRisk ? "#fff" : "#e94057",
          border: "2px solid #e94057",
          fontWeight: 700,
          fontSize: 16,
          borderRadius: 8,
          padding: "6px 18px",
          cursor: "pointer"
        }}><FaExclamationTriangle style={{ marginBottom: -2, marginRight: 6 }} />High Risk Only</button>
        <button onClick={() => setFilterVacant(false) || setFilterHighRisk(false)} style={{
          background: "#283E51",
          color: "#fff",
          border: "2px solid #283E51",
          fontWeight: 700,
          fontSize: 16,
          borderRadius: 8,
          padding: "6px 18px",
          cursor: "pointer"
        }}><FaEye style={{ marginBottom: -2, marginRight: 6 }} />Show All</button>
      </div>
      {/* Org Chart Grid */}
      <div ref={chartRef} style={{
        display: 'flex', gap: 36, alignItems: "flex-start", overflowX: 'auto', padding: "18px 0", position: "relative"
      }}>
        {/* SVG Integration lines (basic, can be upgraded later) */}
        <svg width={displayStructure.length * colWidths + 150} height={300} style={{ position: "absolute", left: 0, top: 0, zIndex: 0 }}>
          {INTEGRATION_LINKS.map(link => {
            const fromCol = displayStructure.findIndex(d => d.domain === link.fromDomain);
            const toCol = displayStructure.findIndex(d => d.domain === link.toDomain);
            if (fromCol === -1 || toCol === -1) return null;
            const fromRoleIdx = displayStructure[fromCol].roles.findIndex(r => r.name === link.from);
            const toRoleIdx = displayStructure[toCol].roles.findIndex(r => r.name === link.to);
            if (fromRoleIdx === -1 || toRoleIdx === -1) return null;
            // Position
            const x1 = columnOffsets[fromCol] + 130, y1 = 70 + 70 * fromRoleIdx;
            const x2 = columnOffsets[toCol] + 130, y2 = 70 + 70 * toRoleIdx;
            return (
              <line
                key={link.from + link.to}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#FFD70099" strokeWidth="4"
                markerEnd="url(#arrowhead)" opacity={0.8}
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L8,4 L0,8" fill="#FFD70099" />
            </marker>
          </defs>
        </svg>
        {/* Grid */}
        {displayStructure.map(domain => (
          <div key={domain.domain} style={{ minWidth: 235, zIndex: 1 }}>
            <div style={{
              color: domain.color, fontWeight: 900, fontSize: 20, textAlign: "center",
              background: "#181e23", borderRadius: 11, padding: "11px 0", marginBottom: 7, border: `2px solid ${domain.color}`
            }}>
              {domain.domain}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
              {domain.roles.map((r, idx) => (
                <div
                  key={r.name}
                  style={{
                    background: "#282f36",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "10px 13px",
                    minWidth: 170,
                    textAlign: "center",
                    boxShadow: r.status === "vacant" ? "0 0 12px #FFD70099" : "0 2px 8px #1de68233",
                    border: `2.5px solid ${STATUS_COLOR[r.status]}`,
                    fontWeight: 700,
                    fontSize: 16,
                    position: "relative",
                    cursor: "pointer",
                    transition: "box-shadow 0.18s",
                    outline: r.risk === "high" ? "2px solid #e94057" : undefined
                  }}
                  title="Click for full drilldown"
                  onClick={() => setDrill({ ...r, domain: domain.domain, domainColor: domain.color, idx })}
                >
                  <span style={{ fontSize: 20, marginBottom: 3, display: "block" }}>
                    {ROLE_ICONS[domain.domain]}
                  </span>
                  {r.name}
                  <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 800, marginTop: 4 }}>
                    Owner: <span style={{ color: "#1de682" }}>{r.owner || "Vacant"}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#fff", marginTop: 2 }}>
                    KPI: {r.kpi}
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <span style={{
                      color: RISK_COLOR[r.risk],
                      fontWeight: 800, fontSize: 13, background: "#1e2429", borderRadius: 6, padding: "2px 7px"
                    }}>
                      {r.risk.toUpperCase()} RISK
                    </span>
                  </div>
                  {r.status === "vacant" && (
                    <div style={{ color: "#FFD700", marginTop: 2, fontSize: 13 }}>
                      <FaExclamationTriangle style={{ marginRight: 3 }} /> Vacant
                    </div>
                  )}
                  {r.docs && r.docs.length > 0 && (
                    <div style={{ marginTop: 2 }}>
                      <FaFileAlt style={{ color: "#FFD700", marginRight: 2 }} /> {r.docs.length} doc
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, color: "#FFD700", fontWeight: 700, fontSize: 15, textAlign: "center" }}>
        <FaRegEdit style={{ marginRight: 7 }} />
        <span>Integration flows:</span>
        <ul style={{ display: "inline-block", textAlign: "left", marginLeft: 9 }}>
          {INTEGRATION_LINKS.map(link => (
            <li key={link.from + link.to}>
              <b>{link.from}</b> <span style={{ color: "#1de682" }}>&rarr;</span> <b>{link.to}</b>
              <span style={{ color: "#FFD70099" }}> ({link.fromDomain} → {link.toDomain})</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 11, color: "#FFD70088", fontSize: 13, textAlign: "center" }}>
        <b>
          Board/Consultant Use:<br />
          Instantly audit, filter, drill down into, and align your entire organization for growth and resilience.<br />
          <span style={{ color: "#e94057" }}>Click any role for full drilldown and document upload.</span>
        </b>
      </div>
      <div style={{
        marginTop: 14, background: "#283e51", color: "#FFD700", fontWeight: 800, borderRadius: 9,
        padding: 10, fontSize: 16, textAlign: "center", boxShadow: "0 2px 16px #FFD70033"
      }}>
        <FaRobot style={{ marginBottom: -2, marginRight: 8 }} />
        AI GAP ANALYSIS: {getAIGapAnalysis(structure)}
      </div>
      {/* Drilldown overlay */}
      {drill && (
        <RoleDrilldown
          role={drill}
          onClose={() => setDrill(null)}
          onUpdate={update => {
            setStructure(structure =>
              structure.map(domain =>
                domain.domain !== drill.domain
                  ? domain
                  : {
                    ...domain,
                    roles: domain.roles.map(r =>
                      r.name !== drill.name ? r : { ...r, ...update }
                    )
                  }
              )
            );
            setDrill(drill => ({ ...drill, ...update }));
          }}
        />
      )}
    </div>
  );
}
