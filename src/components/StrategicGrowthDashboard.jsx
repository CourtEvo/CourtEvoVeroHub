import React, { useState, useMemo } from "react";
import {
  FaChartLine, FaHandHoldingUsd, FaWifi, FaUsers, FaBuilding, FaPlus, FaCheck, FaExclamationTriangle,
  FaFilePdf, FaFileAlt, FaArrowCircleUp, FaFlagCheckered, FaFilter, FaSearch, FaCloudDownloadAlt
} from "react-icons/fa";

// --- SECTORS ---
const SECTORS = [
  { key: "Sport", label: "Sport", icon: <FaChartLine color="#FFD700" />, color: "#FFD700" },
  { key: "Business", label: "Business", icon: <FaHandHoldingUsd color="#1de682" />, color: "#1de682" },
  { key: "Digital", label: "Digital", icon: <FaWifi color="#48b5ff" />, color: "#48b5ff" },
  { key: "Fanbase", label: "Fanbase", icon: <FaUsers color="#e94057" />, color: "#e94057" },
  { key: "Infrastructure", label: "Infrastructure", icon: <FaBuilding color="#a064fe" />, color: "#a064fe" }
];

// --- STATUS COLORS ---
const STATUS_COLOR = {
  "Planned": "#48b5ff",
  "In Progress": "#FFD700",
  "Complete": "#1de682",
  "At Risk": "#e94057"
};

// --- INITIATIVES (4 PER SECTOR) ---
const INIT_OPPS = [
  // SPORT
  {
    id: 1, sector: "Sport", name: "Expand Elite Youth Academy", owner: "Sport Director", due: "2025-10-01",
    status: "In Progress", boardPriority: "High", progress: 55, kpi: "New academy intakes", risk: "Coach turnover", dependencies: "Coach hiring", milestone: "First selection done", aiRec: "Accelerate coach interviews", docUrl: "",
    boardEscalation: false
  },
  {
    id: 2, sector: "Sport", name: "Player Development Analytics", owner: "Sport Director", due: "2025-09-01",
    status: "In Progress", boardPriority: "High", progress: 45, kpi: "Player improvement %", risk: "Data gaps", dependencies: "Analytics tool", milestone: "Tool selected", aiRec: "Pilot with U16", docUrl: "",
    boardEscalation: false
  },
  {
    id: 3, sector: "Sport", name: "Upgrade Coaching Curriculum", owner: "Sport Director", due: "2025-07-01",
    status: "Planned", boardPriority: "Medium", progress: 0, kpi: "Coach upskilling", risk: "Coach resistance", dependencies: "Coach feedback", milestone: "Draft ready", aiRec: "Coach forum scheduled", docUrl: "",
    boardEscalation: false
  },
  {
    id: 4, sector: "Sport", name: "Athlete Wellness Program", owner: "Wellness Lead", due: "2025-08-15",
    status: "Planned", boardPriority: "Low", progress: 0, kpi: "Injury rate reduction", risk: "Buy-in", dependencies: "Medical staff", milestone: "Partner found", aiRec: "Kick-off wellness survey", docUrl: "",
    boardEscalation: false
  },
  // BUSINESS
  {
    id: 5, sector: "Business", name: "Secure New Main Sponsor", owner: "CEO", due: "2025-06-15",
    status: "In Progress", boardPriority: "High", progress: 70, kpi: "Sponsorship value", risk: "Market downturn", dependencies: "Sponsor proposals", milestone: "Shortlist created", aiRec: "Board meet with top lead", docUrl: "",
    boardEscalation: true
  },
  {
    id: 6, sector: "Business", name: "Diversify Revenue Streams", owner: "CFO", due: "2025-11-01",
    status: "Planned", boardPriority: "High", progress: 0, kpi: "New revenue %", risk: "Slow rollout", dependencies: "Market analysis", milestone: "Study delivered", aiRec: "Survey fans for ideas", docUrl: "",
    boardEscalation: false
  },
  {
    id: 7, sector: "Business", name: "Optimize Merchandise Sales", owner: "COO", due: "2025-09-20",
    status: "In Progress", boardPriority: "Medium", progress: 40, kpi: "Sales growth", risk: "Stock delays", dependencies: "Supplier contracts", milestone: "Contract signed", aiRec: "Review supplier pricing", docUrl: "",
    boardEscalation: false
  },
  {
    id: 8, sector: "Business", name: "Cost Efficiency Review", owner: "COO", due: "2025-07-30",
    status: "At Risk", boardPriority: "High", progress: 15, kpi: "OPEX reduction", risk: "Dept buy-in", dependencies: "All heads", milestone: "Initial data in", aiRec: "Board support required", docUrl: "",
    boardEscalation: false
  },
  // DIGITAL
  {
    id: 9, sector: "Digital", name: "Launch New Club Website", owner: "Digital Lead", due: "2025-07-10",
    status: "In Progress", boardPriority: "High", progress: 68, kpi: "Site traffic", risk: "Vendor delay", dependencies: "Vendor contract", milestone: "Beta live", aiRec: "Focus mobile UX", docUrl: "",
    boardEscalation: false
  },
  {
    id: 10, sector: "Digital", name: "App for Player/Parent Portal", owner: "Digital Lead", due: "2025-08-01",
    status: "Planned", boardPriority: "High", progress: 0, kpi: "Active users", risk: "Integration bugs", dependencies: "App dev", milestone: "Scope agreed", aiRec: "Phase rollout", docUrl: "",
    boardEscalation: false
  },
  {
    id: 11, sector: "Digital", name: "Video Analytics Platform", owner: "Analyst", due: "2025-09-15",
    status: "Planned", boardPriority: "Medium", progress: 0, kpi: "Sessions logged", risk: "Data accuracy", dependencies: "Platform vendor", milestone: "Trial started", aiRec: "Request extra support", docUrl: "",
    boardEscalation: false
  },
  {
    id: 12, sector: "Digital", name: "CRM Integration", owner: "Digital Lead", due: "2025-11-10",
    status: "Planned", boardPriority: "Medium", progress: 0, kpi: "Leads tracked", risk: "Staff skills", dependencies: "CRM vendor", milestone: "Training session", aiRec: "Hire part-time CRM expert", docUrl: "",
    boardEscalation: false
  },
  // FANBASE
  {
    id: 13, sector: "Fanbase", name: "Season Ticket Campaign", owner: "Marketing", due: "2025-06-01",
    status: "In Progress", boardPriority: "High", progress: 74, kpi: "Tickets sold", risk: "Market fatigue", dependencies: "Promo plan", milestone: "Campaign live", aiRec: "Add digital-only offer", docUrl: "",
    boardEscalation: false
  },
  {
    id: 14, sector: "Fanbase", name: "Fan Engagement Platform", owner: "Marketing", due: "2025-07-25",
    status: "Planned", boardPriority: "Medium", progress: 0, kpi: "Fan activity %", risk: "Adoption", dependencies: "IT", milestone: "Pilot group formed", aiRec: "Recruit influencer fans", docUrl: "",
    boardEscalation: false
  },
  {
    id: 15, sector: "Fanbase", name: "Monthly Newsletter Expansion", owner: "Marketing", due: "2025-06-20",
    status: "In Progress", boardPriority: "Low", progress: 60, kpi: "Open rate %", risk: "Low signups", dependencies: "Copy team", milestone: "First send", aiRec: "Personalize content", docUrl: "",
    boardEscalation: false
  },
  {
    id: 16, sector: "Fanbase", name: "Social Media Challenge", owner: "Marketing", due: "2025-08-05",
    status: "Planned", boardPriority: "Medium", progress: 0, kpi: "Engagement %", risk: "Low participation", dependencies: "Graphic designer", milestone: "Assets ready", aiRec: "Invite pro athletes", docUrl: "",
    boardEscalation: false
  },
  // INFRASTRUCTURE
  {
    id: 17, sector: "Infrastructure", name: "Upgrade Training Facilities", owner: "COO", due: "2025-10-01",
    status: "Planned", boardPriority: "High", progress: 0, kpi: "Facility rating", risk: "Contractor delay", dependencies: "Budget signoff", milestone: "Contract signed", aiRec: "Board approve budget", docUrl: "",
    boardEscalation: false
  },
  {
    id: 18, sector: "Infrastructure", name: "LED Scoreboard Install", owner: "COO", due: "2025-07-15",
    status: "In Progress", boardPriority: "Medium", progress: 55, kpi: "Operational date", risk: "Tech issues", dependencies: "Supplier", milestone: "Hardware shipped", aiRec: "IT test schedule", docUrl: "",
    boardEscalation: false
  },
  {
    id: 19, sector: "Infrastructure", name: "Locker Room Refurb", owner: "COO", due: "2025-09-01",
    status: "Planned", boardPriority: "Low", progress: 0, kpi: "Feedback score", risk: "Budget risk", dependencies: "Facility mgr", milestone: "Specs ready", aiRec: "Seek sponsor", docUrl: "",
    boardEscalation: false
  },
  {
    id: 20, sector: "Infrastructure", name: "Stadium Wi-Fi Upgrade", owner: "COO", due: "2025-08-25",
    status: "Planned", boardPriority: "Medium", progress: 0, kpi: "Speed rating", risk: "Dead zones", dependencies: "IT", milestone: "RFP issued", aiRec: "Fan pilot test", docUrl: "",
    boardEscalation: false
  }
];

// --- CSV Export Helper ---
const toCSV = (rows) => {
  const headers = Object.keys(rows[0] || {});
  return [
    headers.join(","),
    ...rows.map(row =>
      headers.map(field => `"${(row[field] || "").toString().replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n");
};

const StrategicGrowthDashboard = () => {
  const [opps, setOpps] = useState(INIT_OPPS);
  const [filterSector, setFilterSector] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterOwner, setFilterOwner] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newOpp, setNewOpp] = useState({
    sector: "Business", name: "", owner: "", due: "", status: "Planned", boardPriority: "Medium", progress: 0, kpi: "", risk: "", dependencies: "", milestone: "", aiRec: "", docUrl: "", boardEscalation: false
  });

  // --- Filtered, Searched Display ---
  const owners = useMemo(() => [...new Set(opps.map(o => o.owner))], [opps]);
  const display = useMemo(() => {
    let rows = [...opps];
    if (filterSector !== "All") rows = rows.filter(o => o.sector === filterSector);
    if (filterStatus !== "All") rows = rows.filter(o => o.status === filterStatus);
    if (filterPriority !== "All") rows = rows.filter(o => o.boardPriority === filterPriority);
    if (filterOwner !== "All") rows = rows.filter(o => o.owner === filterOwner);
    if (search.length > 1) rows = rows.filter(
      o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.owner.toLowerCase().includes(search.toLowerCase()) ||
        o.kpi.toLowerCase().includes(search.toLowerCase())
    );
    return rows;
  }, [opps, filterSector, filterStatus, filterPriority, filterOwner, search]);

  // --- Global Stats for Executive View ---
  const allDone = opps.filter(o => o.status === "Complete").length;
  const allRisk = opps.filter(o => o.status === "At Risk").length;
  const allTotal = opps.length;
  const topPriorities = opps.filter(o => o.boardPriority === "High").length;
  const percentDone = allTotal ? Math.round((allDone / allTotal) * 100) : 0;
  const aiSignal = allRisk === 0 ? "Healthy" : allRisk / allTotal > 0.25 ? "Critical" : "Watch";

  // --- Sector Stats for Cards ---
  const sectorStats = useMemo(() => {
    return SECTORS.map(sector => {
      const rows = opps.filter(o => o.sector === sector.key);
      const done = rows.filter(o => o.status === "Complete").length;
      const atRisk = rows.filter(o => o.status === "At Risk").length;
      const avgProgress = rows.length ? Math.round(rows.reduce((a, b) => a + (b.progress || 0), 0) / rows.length) : 0;
      return {
        ...sector,
        total: rows.length,
        done, atRisk, avgProgress
      };
    });
  }, [opps]);

  // --- AI Confidence Calculation ---
  function aiConfidence(op) {
    if (op.status === "At Risk") return <span style={{ color: "#e94057" }}>Low</span>;
    if (op.status === "Complete") return <span style={{ color: "#1de682" }}>100%</span>;
    if (op.progress >= 70) return <span style={{ color: "#1de682" }}>High</span>;
    if (op.progress >= 30) return <span style={{ color: "#FFD700" }}>Moderate</span>;
    return <span style={{ color: "#48b5ff" }}>Early</span>;
  }

  // --- Timeline Helper ---
  function daysTo(due) {
    if (!due) return "-";
    const now = new Date();
    const dt = new Date(due);
    const days = Math.ceil((dt - now) / (1000 * 60 * 60 * 24));
    if (isNaN(days)) return "-";
    return (
      <span style={{
        color: days < 0 ? "#e94057" : days < 7 ? "#FFD700" : "#1de682",
        fontWeight: 800
      }}>
        {days < 0 ? `Overdue (${Math.abs(days)}d)` : `${days}d`}
      </span>
    );
  }

  // --- Escalation Toggle, Status Update, Add ---
  function toggleEscalation(id) {
    setOpps(ops =>
      ops.map(o => o.id === id ? { ...o, boardEscalation: !o.boardEscalation } : o)
    );
  }
  function updateStatus(id, status) {
    setOpps(ops =>
      ops.map(o =>
        o.id === id
          ? { ...o, status, progress: status === "Complete" ? 100 : o.progress }
          : o
      )
    );
  }
  function handleAdd(e) {
    e.preventDefault();
    setOpps(ops => [
      ...ops,
      { ...newOpp, id: Date.now(), progress: Number(newOpp.progress) }
    ]);
    setShowAdd(false);
    setNewOpp({
      sector: "Business", name: "", owner: "", due: "", status: "Planned", boardPriority: "Medium", progress: 0, kpi: "", risk: "", dependencies: "", milestone: "", aiRec: "", docUrl: "", boardEscalation: false
    });
  }

  // --- Export Handlers ---
  function handleExportCSV() {
    const blob = new Blob([toCSV(opps)], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StrategicGrowthDashboard_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  function handlePrint() {
    window.print();
  }

  // --- RENDER ---
  return (
    <div style={{ padding: 0, margin: 0 }}>
      {/* --- EXECUTIVE SUMMARY --- */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 22, margin: "30px 0 15px 0", alignItems: "center" }}>
        <div style={{
          background: "#232a2e", borderRadius: 16, boxShadow: "0 3px 12px #FFD70022",
          padding: "18px 26px", color: "#FFD700", minWidth: 200, flex: 1
        }}>
          <div style={{ fontWeight: 800, fontSize: 26 }}>{percentDone}%</div>
          <div style={{ fontWeight: 700, fontSize: 15, opacity: 0.89 }}>Initiatives Complete</div>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 16, boxShadow: "0 3px 12px #1de68222",
          padding: "18px 26px", color: "#1de682", minWidth: 200, flex: 1
        }}>
          <div style={{ fontWeight: 800, fontSize: 26 }}>{topPriorities}</div>
          <div style={{ fontWeight: 700, fontSize: 15, opacity: 0.89 }}>Top Priority Initiatives</div>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 16, boxShadow: "0 3px 12px #e9405722",
          padding: "18px 26px", color: "#e94057", minWidth: 200, flex: 1
        }}>
          <div style={{ fontWeight: 800, fontSize: 26 }}>{allRisk}</div>
          <div style={{ fontWeight: 700, fontSize: 15, opacity: 0.89 }}>At Risk</div>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 16, boxShadow: "0 3px 12px #48b5ff22",
          padding: "18px 26px", color: "#48b5ff", minWidth: 200, flex: 1
        }}>
          <div style={{ fontWeight: 800, fontSize: 26 }}>{aiSignal}</div>
          <div style={{ fontWeight: 700, fontSize: 15, opacity: 0.89 }}>AI Board Signal</div>
        </div>
      </div>

      {/* --- SECTOR CARDS --- */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 17, marginTop: 2 }}>
        {sectorStats.map(sec => (
          <div key={sec.key} style={{
            background: sec.color + "22",
            borderRadius: 13,
            boxShadow: `0 2px 10px ${sec.color}33`,
            color: sec.color,
            padding: "14px 20px",
            flex: "1 1 180px",
            minWidth: 165,
            textAlign: "left",
            fontWeight: 700,
            fontSize: 17
          }}>
            <span style={{ fontSize: 22, marginRight: 7 }}>{sec.icon}</span> {sec.label}
            <div style={{ marginTop: 4, fontSize: 14, color: "#fff", fontWeight: 500 }}>
              Total: <b>{sec.total}</b> | Done: <b>{sec.done}</b> | Risk: <b>{sec.atRisk}</b> <br />
              Progress: <b>{sec.avgProgress}%</b>
            </div>
          </div>
        ))}
      </div>

      {/* --- CONTROLS --- */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <button onClick={() => setShowAdd(true)} style={btnS}><FaPlus /> Add Initiative</button>
        <button onClick={handleExportCSV} style={{ ...btnS, background: "#FFD700", color: "#232a2e" }}><FaCloudDownloadAlt /> Export CSV</button>
        <button onClick={handlePrint} style={{ ...btnS, background: "#232a2e", color: "#FFD700" }}><FaFilePdf /> Print</button>
        <span style={{ color: "#FFD700", fontWeight: 600, fontSize: 15, marginLeft: 18 }}><FaFilter /> Sector:</span>
        <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={inputS}>
          <option>All</option>{SECTORS.map(s => <option key={s.key}>{s.key}</option>)}
        </select>
        <span style={{ color: "#FFD700", fontWeight: 600, fontSize: 15, marginLeft: 10 }}>Status:</span>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputS}>
          <option>All</option>
          <option>Planned</option>
          <option>In Progress</option>
          <option>Complete</option>
          <option>At Risk</option>
        </select>
        <span style={{ color: "#FFD700", fontWeight: 600, fontSize: 15, marginLeft: 10 }}>Priority:</span>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={inputS}>
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <span style={{ color: "#FFD700", fontWeight: 600, fontSize: 15, marginLeft: 10 }}>Owner:</span>
        <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} style={inputS}>
          <option>All</option>
          {owners.map(o => <option key={o}>{o}</option>)}
        </select>
        <span style={{ color: "#FFD700", fontWeight: 600, fontSize: 15, marginLeft: 10 }}>Search:</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputS, width: 170, background: "#181e23" }}
          placeholder="Search name, owner, KPI"
        />
      </div>

      {/* --- INITIATIVE TABLE --- */}
      <div style={{
        background: "#232a2e", borderRadius: 15, boxShadow: "0 4px 22px #181e2322",
        padding: "7px 5px 22px 5px", marginBottom: 18, overflowX: "auto"
      }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1380 }}>
          <thead>
            <tr>
              <th style={thS}>Sector</th>
              <th style={thS}>Initiative Name</th>
              <th style={thS}>Owner</th>
              <th style={thS}>Due</th>
              <th style={thS}>Status</th>
              <th style={thS}>Priority</th>
              <th style={thS}>Progress</th>
              <th style={thS}>KPI</th>
              <th style={thS}>Risk</th>
              <th style={thS}>Dependencies</th>
              <th style={thS}>Milestone</th>
              <th style={thS}>AI Recommendation</th>
              <th style={thS}>Board Escalation</th>
              <th style={thS}>AI Confidence</th>
              <th style={thS}>Days to Due</th>
              <th style={thS}>Docs</th>
              <th style={thS}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {display.map(op => (
              <tr key={op.id}>
                <td style={tdS}><span style={{
                  color: SECTORS.find(s => s.key === op.sector)?.color || "#fff",
                  fontWeight: 800
                }}>{op.sector}</span></td>
                <td style={tdS}>{op.name}</td>
                <td style={tdS}>{op.owner}</td>
                <td style={tdS}>{op.due}</td>
                <td style={{ ...tdS, color: STATUS_COLOR[op.status], fontWeight: 800 }}>{op.status}</td>
                <td style={tdS}>{op.boardPriority}</td>
                <td style={tdS}>
                  <div style={{ fontWeight: 700 }}>
                    <span style={{ color: "#1de682" }}>{op.progress}%</span>
                    <div style={{ height: 9, borderRadius: 7, background: "#232a2e", width: 76, marginTop: 2, overflow: "hidden" }}>
                      <div style={{
                        width: `${op.progress}%`,
                        height: "100%",
                        background: op.progress === 100 ? "#1de682"
                          : op.progress >= 70 ? "#FFD700"
                            : op.status === "At Risk" ? "#e94057" : "#48b5ff",
                        borderRadius: 7
                      }} />
                    </div>
                  </div>
                </td>
                <td style={tdS}>{op.kpi}</td>
                <td style={tdS}>{op.risk}</td>
                <td style={tdS}>{op.dependencies}</td>
                <td style={tdS}>{op.milestone}</td>
                <td style={tdS}>{op.aiRec}</td>
                <td style={tdS}>
                  <button
                    onClick={() => toggleEscalation(op.id)}
                    style={{
                      background: op.boardEscalation ? "#FFD700" : "#222",
                      color: op.boardEscalation ? "#222" : "#FFD700",
                      fontWeight: 900, border: "none", borderRadius: 7, padding: "3px 12px", cursor: "pointer",
                      boxShadow: op.boardEscalation ? "0 2px 8px #FFD70055" : undefined
                    }}>
                    {op.boardEscalation ? <FaArrowCircleUp /> : <FaArrowCircleUp style={{ opacity: 0.3 }} />}
                  </button>
                </td>
                <td style={tdS}>{aiConfidence(op)}</td>
                <td style={tdS}>{daysTo(op.due)}</td>
                <td style={tdS}>
                  {op.docUrl ? (
                    op.docUrl.endsWith(".pdf") ?
                      <a href={op.docUrl} target="_blank" rel="noopener noreferrer" title="View PDF">
                        <FaFilePdf style={{ color: "#FFD700", fontSize: 18 }} />
                      </a> :
                      <a href={op.docUrl} target="_blank" rel="noopener noreferrer" title="View File">
                        <FaFileAlt style={{ color: "#1de682", fontSize: 18 }} />
                      </a>
                  ) : <span style={{ color: "#444" }}>-</span>}
                </td>
                <td style={tdS}>
                  {op.status !== "Complete" && (
                    <button onClick={() => updateStatus(op.id, "Complete")} style={btnS}><FaCheck /> Mark Complete</button>
                  )}
                  {op.status !== "At Risk" && (
                    <button onClick={() => updateStatus(op.id, "At Risk")} style={{ ...btnS, background: "#e94057", color: "#fff" }}><FaExclamationTriangle /> Flag Risk</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {display.length === 0 && (
          <div style={{ color: "#FFD700", fontWeight: 700, textAlign: "center", padding: 44, fontSize: 23 }}>No initiatives for this sector yet.</div>
        )}
      </div>

      {/* --- ADD INITIATIVE MODAL --- */}
      {showAdd && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(30,40,55,0.88)", zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={handleAdd} style={{
            background: "#232a2e", borderRadius: 17, boxShadow: "0 8px 34px #181e2377",
            padding: 44, minWidth: 440, maxWidth: 610, display: "flex", flexDirection: "column", gap: 14, color: "#fff"
          }}>
            <h3 style={{ color: "#FFD700", fontSize: 24, fontWeight: 800, marginBottom: 5 }}>
              Add Strategic Initiative
            </h3>
            <label style={labelS}>Sector</label>
            <select value={newOpp.sector} onChange={e => setNewOpp(o => ({ ...o, sector: e.target.value }))} style={inputS}>
              {SECTORS.map(s => <option key={s.key}>{s.key}</option>)}
            </select>
            <label style={labelS}>Initiative Name</label>
            <input value={newOpp.name} onChange={e => setNewOpp(o => ({ ...o, name: e.target.value }))} style={inputS} required />
            <label style={labelS}>Owner</label>
            <input value={newOpp.owner} onChange={e => setNewOpp(o => ({ ...o, owner: e.target.value }))} style={inputS} required />
            <label style={labelS}>Due Date</label>
            <input type="date" value={newOpp.due} onChange={e => setNewOpp(o => ({ ...o, due: e.target.value }))} style={inputS} required />
            <label style={labelS}>Status</label>
            <select value={newOpp.status} onChange={e => setNewOpp(o => ({ ...o, status: e.target.value }))} style={inputS}>
              <option>Planned</option>
              <option>In Progress</option>
              <option>Complete</option>
              <option>At Risk</option>
            </select>
            <label style={labelS}>Priority</label>
            <select value={newOpp.boardPriority} onChange={e => setNewOpp(o => ({ ...o, boardPriority: e.target.value }))} style={inputS}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <label style={labelS}>Progress (%)</label>
            <input type="number" value={newOpp.progress} min={0} max={100} onChange={e => setNewOpp(o => ({ ...o, progress: e.target.value }))} style={inputS} />
            <label style={labelS}>KPI</label>
            <input value={newOpp.kpi} onChange={e => setNewOpp(o => ({ ...o, kpi: e.target.value }))} style={inputS} />
            <label style={labelS}>Risk</label>
            <input value={newOpp.risk} onChange={e => setNewOpp(o => ({ ...o, risk: e.target.value }))} style={inputS} />
            <label style={labelS}>Dependencies</label>
            <input value={newOpp.dependencies} onChange={e => setNewOpp(o => ({ ...o, dependencies: e.target.value }))} style={inputS} />
            <label style={labelS}>Milestone</label>
            <input value={newOpp.milestone} onChange={e => setNewOpp(o => ({ ...o, milestone: e.target.value }))} style={inputS} />
            <label style={labelS}>AI Recommendation</label>
            <input value={newOpp.aiRec} onChange={e => setNewOpp(o => ({ ...o, aiRec: e.target.value }))} style={inputS} />
            <label style={labelS}>Supporting Document URL</label>
            <input value={newOpp.docUrl} onChange={e => setNewOpp(o => ({ ...o, docUrl: e.target.value }))} style={inputS} placeholder="https://...pdf" />
            <label style={labelS}>Board Escalation</label>
            <select value={newOpp.boardEscalation ? "Yes" : "No"} onChange={e => setNewOpp(o => ({ ...o, boardEscalation: e.target.value === "Yes" }))} style={inputS}>
              <option>No</option>
              <option>Yes</option>
            </select>
            <button type="submit" style={{ ...btnS, background: "#FFD700", color: "#232a2e", marginTop: 12 }}>
              <FaCheck /> Add Initiative
            </button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ ...btnS, background: "#232a2e", color: "#FFD700", marginTop: 2 }}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const thS = {
  color: "#FFD700", fontWeight: 900, fontSize: 15, padding: "10px 7px", background: "#181e23", textAlign: "left", letterSpacing: 1
};
const tdS = {
  padding: "10px 7px", color: "#fff", fontWeight: 600, fontSize: 15, borderBottom: "1px solid #232a2e"
};
const btnS = {
  background: "#1de682", color: "#232a2e", fontWeight: 700, border: "none", borderRadius: 7,
  padding: "6px 14px", fontSize: 14, cursor: "pointer", margin: "2px 0 0 0", boxShadow: "0 1px 8px #1de68244", display: "inline-flex", alignItems: "center", gap: 6
};
const labelS = { color: "#FFD700", fontWeight: 700, marginBottom: 2, fontSize: 14 };
const inputS = {
  width: "100%", padding: "7px 9px", borderRadius: 6, fontSize: 16,
  border: "none", marginTop: 2, background: "#181e23", color: "#FFD700", fontWeight: 700
};

export default StrategicGrowthDashboard;
