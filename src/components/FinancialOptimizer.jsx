import React, { useState } from "react";
import {
  FaMoneyBillWave, FaExclamationTriangle, FaDownload, FaArrowUp, FaArrowDown,
  FaCheckCircle, FaChartLine, FaTools, FaChartPie, FaHistory, FaPrint,
  FaFileContract, FaCalendarAlt, FaEnvelope, FaThumbsUp, FaThumbsDown, FaHourglass
} from "react-icons/fa";

// --- Demo data ---
const DEMO_SCENARIOS = [
  { scenario: "Baseline", revenue: 210000, cost: 188000, keyActions: ["Status Quo"], notes: "Current year as-is.", approval: "approved", by: "President" },
  { scenario: "Sponsor Added", revenue: 260000, cost: 188000, keyActions: ["New Main Sponsor", "Increase marketing"], notes: "Sponsorship deal signed.", approval: "pending", by: null },
  { scenario: "Cost Optimization", revenue: 210000, cost: 166000, keyActions: ["Cut travel", "Share facilities"], notes: "Cost reduction strategies activated.", approval: "rejected", by: "Finance Dir." }
];
const DEMO_LEVERS = [
  { name: "Add Main Sponsor", type: "revenue", value: 30000 },
  { name: "Add Minor Sponsor", type: "revenue", value: 12000 },
  { name: "Reduce Travel Costs", type: "cost", value: -9000 },
  { name: "Cut Utilities by 10%", type: "cost", value: -3000 },
  { name: "Add New Player", type: "cost", value: 12000 }
];
const DEMO_TRENDS = [
  { year: 2020, revenue: 165000, cost: 159000 },
  { year: 2021, revenue: 188000, cost: 173000 },
  { year: 2022, revenue: 196000, cost: 181000 },
  { year: 2023, revenue: 203000, cost: 186000 },
  { year: 2024, revenue: 210000, cost: 188000 }
];
const SPONSORS = [
  { name: "Main Sponsor", value: 60000, type: "Gold", percent: 27 },
  { name: "Retail Partner", value: 17000, type: "Silver", percent: 8 },
  { name: "Local Gov Grant", value: 14000, type: "Public", percent: 7 },
  { name: "Medical Partner", value: 9500, type: "Bronze", percent: 5 },
  { name: "Others", value: 109500, type: "Other", percent: 53 }
];
const COST_CENTERS = [
  { name: "Salaries", percent: 47, risk: "medium" },
  { name: "Travel", percent: 13, risk: "high" },
  { name: "Utilities", percent: 7, risk: "low" },
  { name: "Facility Rental", percent: 18, risk: "high" },
  { name: "Equipment", percent: 8, risk: "medium" },
  { name: "Medical", percent: 7, risk: "medium" }
];
const CONTRACTS = [
  { name: "Main Sponsor", value: 60000, expires: "2025-06-01", type: "sponsor" },
  { name: "Head Coach", value: 25000, expires: "2024-08-01", type: "staff" },
  { name: "Star Player", value: 20000, expires: "2025-01-10", type: "player" }
];
const BOARD_ACTIONS = [
  { date: "2023-11-01", desc: "Board approved main sponsor renewal", type: "vote" },
  { date: "2023-09-15", desc: "Cost reduction program initiated", type: "decision" },
  { date: "2023-05-10", desc: "Signed new player contract", type: "contract" },
  { date: "2024-01-10", desc: "Utilities contract renegotiated", type: "contract" }
];
const CRITICAL_RATIOS = [
  { name: "Cost/Revenue %", get: (rev, cost) => Math.round(cost / rev * 100), warn: 85, danger: 93 },
  { name: "Net Surplus (€)", get: (rev, cost) => rev - cost, warn: 0, danger: -1000 }
];
const STRESS_TESTS = [
  { label: "Lose Main Sponsor", type: "revenue", percent: -30, field: "revenue" },
  { label: "10% Cost Inflation", type: "cost", percent: 10, field: "cost" },
  { label: "Gain Extra Youth Grant", type: "revenue", percent: 8, field: "revenue" }
];

export default function FinancialOptimizer() {
  const [scenario, setScenario] = useState(0);
  const [custom, setCustom] = useState({ revenue: 210000, cost: 188000, actions: [], approval: "pending", by: null });
  const [trend, setTrend] = useState(DEMO_TRENDS);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [stress, setStress] = useState(null);
  const [cagr, setCAGR] = useState(0.05); // 5% default
  const [years, setYears] = useState(5);
  const [approvalState, setApprovalState] = useState("pending");
  const [approvalBy, setApprovalBy] = useState("");
  const [log, setLog] = useState([]);
  const [reminderSent, setReminderSent] = useState(false);

  // --- Export CSV must be above first JSX use ---
  function exportCSV() {
    const rows = [["Scenario", "Revenue (€)", "Cost (€)", "Net (€)", "Actions"]];
    rows.push(["Custom", custom.revenue, custom.cost, custom.revenue - custom.cost, custom.actions.join(" / ")]);
    DEMO_SCENARIOS.forEach(s => rows.push([s.scenario, s.revenue, s.cost, s.revenue - s.cost, s.keyActions.join(" / ")]));
    savedScenarios.forEach(s =>
      rows.push([s.label, s.revenue, s.cost, s.net, s.actions])
    );
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "courtEvoVero_financial_scenarios.csv";
    a.click();
  }

  // --- Lever logic ---
  function applyLever(l) {
    setCustom(c => ({
      ...c,
      revenue: l.type === "revenue" ? c.revenue + l.value : c.revenue,
      cost: l.type === "cost" ? c.cost + l.value : c.cost,
      actions: [...c.actions, l.name]
    }));
    setLog(log => [...log, { time: new Date().toLocaleString(), action: `Lever: ${l.name}` }]);
  }
  function resetCustom() {
    setCustom({ revenue: 210000, cost: 188000, actions: [], approval: "pending", by: null });
    setStress(null);
  }
  function applyStress(st) {
    setStress(st.label);
    setCustom(c => ({
      ...c,
      [st.field]: Math.round(c[st.field] * (1 + st.percent / 100)),
      actions: [...c.actions, `Stress: ${st.label}`]
    }));
    setLog(log => [...log, { time: new Date().toLocaleString(), action: `Stress test: ${st.label}` }]);
  }
  function saveScenario() {
    setSavedScenarios([
      ...savedScenarios,
      {
        label: `Scenario${savedScenarios.length + 1}`,
        revenue: custom.revenue,
        cost: custom.cost,
        net: custom.revenue - custom.cost,
        actions: custom.actions.join("; "),
        approval: approvalState,
        by: approvalBy
      }
    ]);
    setLog(log => [...log, { time: new Date().toLocaleString(), action: `Saved scenario ${savedScenarios.length + 1}` }]);
  }
  function handleApproval(status) {
    setApprovalState(status);
    setApprovalBy(status === "approved" ? "President" : "Finance Dir.");
    setCustom(c => ({ ...c, approval: status, by: status === "approved" ? "President" : "Finance Dir." }));
    setLog(log => [...log, { time: new Date().toLocaleString(), action: `Scenario ${status} by ${status === "approved" ? "President" : "Finance Dir."}` }]);
  }
  function sendReminder() {
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
    setLog(log => [...log, { time: new Date().toLocaleString(), action: "Sent board email reminder" }]);
  }

  // --- Projection logic ---
  function multiYearProj() {
    const arr = [];
    let rev = custom.revenue, cost = custom.cost;
    for (let i = 1; i <= years; ++i) {
      rev = Math.round(rev * (1 + cagr));
      cost = Math.round(cost * (1 + cagr * 0.8));
      arr.push({ year: 2024 + i, revenue: rev, cost, net: rev - cost });
    }
    return arr;
  }

  // --- Pie visuals (SVG for demo) ---
  function Pie({ percent, color, label }) {
    const r = 36, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, percent));
    return (
      <svg width={90} height={90}>
        <circle cx={45} cy={45} r={r} fill="#232a2e" stroke="#444" strokeWidth={8} />
        <circle
          cx={45} cy={45} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${v * c} ${c}`}
          strokeDashoffset={c * 0.25}
        />
        <text x={45} y={50} textAnchor="middle" fontWeight={900} fontSize={16} fill="#FFD700">
          {Math.round(percent * 100)}%
        </text>
        <text x={45} y={72} textAnchor="middle" fontSize={12} fill="#FFD700bb">
          {label}
        </text>
      </svg>
    );
  }

  // --- AI-Powered Recommendation (simple logic demo) ---
  function aiSuggest() {
    if (custom.revenue - custom.cost < 0) return "Review all major costs and pursue new sponsor ASAP.";
    if (custom.revenue / custom.cost < 1.11) return "Margin too low. Consider travel/utility cuts and minor sponsors.";
    if (custom.revenue / custom.cost > 1.20) return "Strong position. Invest in development or marketing.";
    return "Maintain cost vigilance. Revisit contracts before renewal.";
  }

  // --- Colors ---
  function getColor(value, warn, danger, reverse = false) {
    if (!reverse) {
      if (value >= danger) return "#e82e2e";
      if (value >= warn) return "#FFD700";
      return "#1de682";
    } else {
      if (value <= danger) return "#e82e2e";
      if (value <= warn) return "#FFD700";
      return "#1de682";
    }
  }
  function riskColor(risk) {
    if (risk === "high") return "#e82e2e";
    if (risk === "medium") return "#FFD700";
    return "#1de682";
  }

  // --- Chart logic (for trends, seasonality) ---
  const chartWidth = 340, chartHeight = 125, maxRev = Math.max(...trend.map(d => d.revenue));
  const pointsRev = trend.map((d, i) => [20 + i * 60, chartHeight - (d.revenue / maxRev) * 100 + 10]);
  const pointsCost = trend.map((d, i) => [20 + i * 60, chartHeight - (d.cost / maxRev) * 100 + 10]);

  // --- Main render ---
  const s = DEMO_SCENARIOS[scenario];
  const scenarios = [{ scenario: "Custom", revenue: custom.revenue, cost: custom.cost, actions: custom.actions, approval: custom.approval, by: custom.by }, ...DEMO_SCENARIOS];
  const proj = multiYearProj();

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1850,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 22px 0", background: "linear-gradient(90deg, #FFD700 40%, #1de682 100%)" }} />
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 21 }}>
        <FaMoneyBillWave style={{ fontSize: 30, color: "#FFD700", marginRight: 10 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>Finance Optimizer – Hyper Boardroom Suite</h2>
        <button style={btnStyle} onClick={exportCSV}><FaDownload style={{ marginRight: 8, fontSize: 15 }} /> Export CSV</button>
        <button style={miniBtn} onClick={() => window.print()}><FaPrint /> Print (Board PDF)</button>
        <button style={miniBtn} onClick={sendReminder}><FaEnvelope /> Email Board Reminder</button>
        {reminderSent && <span style={{ color: "#1de682", fontWeight: 900, marginLeft: 12 }}>Board reminder sent!</span>}
      </div>
      {/* --- Boardroom Approval --- */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "14px 17px", marginBottom: 15, display: "flex", gap: 20, alignItems: "center"
      }}>
        <b style={{ fontSize: 18, color: "#FFD700" }}>Scenario Approval Workflow:</b>
        <button style={approvalState === "approved" ? { ...btnStyle, background: "#1de682" } : btnStyle} onClick={() => handleApproval("approved")}><FaThumbsUp /> Approve</button>
        <button style={approvalState === "rejected" ? { ...btnStyle, background: "#e82e2e" } : btnStyle} onClick={() => handleApproval("rejected")}><FaThumbsDown /> Reject</button>
        <button style={approvalState === "pending" ? { ...btnStyle, background: "#FFD700" } : btnStyle} onClick={() => handleApproval("pending")}><FaHourglass /> Pending</button>
        <span style={{ marginLeft: 17 }}>
          Current: <b style={{
            color: approvalState === "approved" ? "#1de682" : approvalState === "rejected" ? "#e82e2e" : "#FFD700"
          }}>{approvalState.toUpperCase()}</b>
          {approvalBy && <span> by {approvalBy}</span>}
        </span>
      </div>
      {/* --- Boardroom Insights --- */}
      <div style={{
        display: "flex", gap: 24, marginBottom: 21, flexWrap: "wrap"
      }}>
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "16px 17px",
          minWidth: 290, maxWidth: 370
        }}>
          <FaExclamationTriangle style={{ color: "#FFD700", fontSize: 22, marginRight: 7 }} />
          <b style={{ fontSize: 18, color: "#FFD700" }}>AI Recommendation</b>
          <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>{aiSuggest()}</div>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "16px 17px",
          minWidth: 290, maxWidth: 370
        }}>
          <FaCheckCircle style={{ color: "#1de682", fontSize: 22, marginRight: 7 }} />
          <b style={{ fontSize: 18, color: "#FFD700" }}>Next Board Actions</b>
          <ul style={{ margin: "10px 0 0 19px", color: "#FFD700", fontWeight: 800 }}>
            <li>Board vote: new cost reduction package</li>
            <li>Sponsor contract: set negotiation meeting</li>
            <li>Annual financial report: ready for audit</li>
          </ul>
        </div>
        {/* --- Contracts panel --- */}
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "16px 17px",
          minWidth: 290, maxWidth: 370
        }}>
          <FaFileContract style={{ color: "#FFD700", fontSize: 22, marginRight: 7 }} />
          <b style={{ fontSize: 18, color: "#FFD700" }}>Major Contracts/Renewals</b>
          <ul style={{ margin: "10px 0 0 19px" }}>
            {CONTRACTS.map((c, i) => (
              <li key={i} style={{ color: c.type === "sponsor" ? "#1de682" : "#FFD700", fontWeight: 900 }}>
                {c.name} <span style={{ color: "#FFD700bb" }}>({c.type})</span> – {c.value.toLocaleString()} € (expires {c.expires})
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* --- Multi-Year Projection --- */}
      <div style={{
        background: "#232a2e", borderRadius: 14, padding: "15px 19px", marginBottom: 12
      }}>
        <b style={{ fontSize: 18, color: "#FFD700" }}><FaChartLine style={{ marginRight: 7 }} /> Multi-Year Projection</b>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 23 }}>
          CAGR:
          <input
            type="number"
            value={cagr}
            step="0.01"
            min="0"
            max="0.20"
            onChange={e => setCAGR(Number(e.target.value))}
            style={{ ...inputStyle, width: 70 }}
          /> (as decimal, e.g. 0.05 for 5%)
          Years:
          <input
            type="number"
            value={years}
            min="1"
            max="8"
            onChange={e => setYears(Number(e.target.value))}
            style={{ ...inputStyle, width: 55 }}
          />
        </div>
        <table style={{
          width: "100%", marginTop: 13, borderCollapse: "collapse", fontSize: 16
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Year</th>
              <th style={thStyle}>Revenue (€)</th>
              <th style={thStyle}>Cost (€)</th>
              <th style={thStyle}>Net (€)</th>
            </tr>
          </thead>
          <tbody>
            {multiYearProj().map((p, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{p.year}</td>
                <td style={tdStyle}>{p.revenue.toLocaleString()}</td>
                <td style={tdStyle}>{p.cost.toLocaleString()}</td>
                <td style={{ ...tdStyle, color: p.net < 0 ? "#e82e2e" : "#1de682", fontWeight: 900 }}>
                  {p.net.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* --- Cash Flow Calendar (demo spark chart) --- */}
      <div style={{
        background: "#232a2e", borderRadius: 14, padding: "13px 19px", marginBottom: 12
      }}>
        <b style={{ fontSize: 18, color: "#FFD700" }}><FaCalendarAlt style={{ marginRight: 7 }} /> Cash Flow Seasonality</b>
        <svg width={320} height={74} style={{ display: "block", margin: "13px 0" }}>
          {[110,80,160,135,250,310,420,330,210,140,95,115].map((y, i, arr) =>
            <line
              key={i}
              x1={i*26+19} y1={64-y/6}
              x2={(i+1)*26+19} y2={arr[i+1] ? 64-arr[i+1]/6 : 64-y/6}
              stroke="#FFD700"
              strokeWidth={3}
            />
          )}
        </svg>
        <div style={{ fontSize: 13, color: "#FFD700bb" }}>
          Jan-Dec. Peaks: sponsorship in June/July, expenses in August/September, grants in Feb/March.
        </div>
      </div>
      {/* --- Sponsor Pie & Dependence --- */}
      <div style={{
        display: "flex", gap: 44, marginBottom: 15, flexWrap: "wrap"
      }}>
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "12px 18px", minWidth: 310, textAlign: "center"
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}><FaChartPie style={{ marginRight: 7 }} /> Sponsor Segmentation</b>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 3, marginTop: 11 }}>
            {SPONSORS.map((sp, i) => (
              <Pie key={i} percent={sp.percent/100} color={sp.type==="Gold"?"#FFD700":sp.type==="Silver"?"#bbbbbb":sp.type==="Bronze"?"#ab7b32":"#1de682"} label={sp.name}/>
            ))}
          </div>
          <div style={{ color: "#FFD700", fontSize: 15, marginTop: 9 }}>
            Top sponsor: <b style={{ color: "#FFD700" }}>{SPONSORS[0].name}</b> {SPONSORS[0].percent}% of revenue. <span style={{ color: "#e82e2e" }}>{SPONSORS[0].percent > 30 ? "Dependence Risk!" : ""}</span>
          </div>
        </div>
        {/* --- Expansion Radar (demo) --- */}
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "12px 18px", minWidth: 310
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}>Expansion Radar</b>
          <div style={{ fontSize: 15, color: "#FFD700bb", margin: "7px 0" }}>
            Next growth: target new partners in digital, fintech, media.
          </div>
          <svg width={170} height={110}>
            <circle cx={85} cy={55} r={35} fill="#1de68244" stroke="#FFD700" strokeWidth={2}/>
            <text x={85} y={60} textAnchor="middle" fontSize={13} fill="#FFD700">Media</text>
            <text x={42} y={41} textAnchor="middle" fontSize={11} fill="#1de682">Digital</text>
            <text x={128} y={40} textAnchor="middle" fontSize={11} fill="#FFD700">Fintech</text>
            <text x={40} y={83} textAnchor="middle" fontSize={11} fill="#FFD700">Retail</text>
            <text x={132} y={86} textAnchor="middle" fontSize={11} fill="#1de682">Health</text>
          </svg>
        </div>
        {/* --- Cost center pie --- */}
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: "12px 18px", minWidth: 310, textAlign: "center"
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}>Cost Center Breakdown</b>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 3, marginTop: 11 }}>
            {COST_CENTERS.map((c, i) => (
              <Pie key={i} percent={c.percent/100} color={riskColor(c.risk)} label={c.name} />
            ))}
          </div>
        </div>
      </div>
      {/* --- Scenario Table, Save/Load, Board Actions --- */}
      <div style={{
        display: "flex", gap: 31, marginBottom: 19, flexWrap: "wrap"
      }}>
        <div style={{
          background: "#232a2e", borderRadius: 13, marginBottom: 14, padding: "18px 18px", minWidth: 550
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}>Scenario Comparison Table</b>
          <table style={{
            width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 16
          }}>
            <thead>
              <tr>
                <th style={thStyle}>Scenario</th>
                <th style={thStyle}>Revenue (€)</th>
                <th style={thStyle}>Cost (€)</th>
                <th style={thStyle}>Net (€)</th>
                <th style={thStyle}>Actions</th>
                <th style={thStyle}>Approval</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc, idx) => (
                <tr key={idx} style={{ background: idx === 0 ? "#FFD70022" : "#232a2e" }}>
                  <td style={tdStyle}>{sc.scenario}</td>
                  <td style={tdStyle}>{sc.revenue.toLocaleString()}</td>
                  <td style={tdStyle}>{sc.cost.toLocaleString()}</td>
                  <td style={{ ...tdStyle, color: sc.revenue - sc.cost < 0 ? "#e82e2e" : "#1de682", fontWeight: 900 }}>
                    {(sc.revenue - sc.cost).toLocaleString()}
                  </td>
                  <td style={tdStyle}>{sc.actions?.length ? sc.actions.join(", ") : "--"}</td>
                  <td style={{ ...tdStyle, fontWeight: 900 }}>
                    {sc.approval === "approved" && <span style={{ color: "#1de682" }}>✔ Approved</span>}
                    {sc.approval === "rejected" && <span style={{ color: "#e82e2e" }}>✖ Rejected</span>}
                    {sc.approval === "pending" && <span style={{ color: "#FFD700" }}>⏳ Pending</span>}
                  </td>
                </tr>
              ))}
              {savedScenarios.map((s, idx) => (
                <tr key={1000+idx} style={{ background: "#1de68222" }}>
                  <td style={tdStyle}>{s.label}</td>
                  <td style={tdStyle}>{s.revenue.toLocaleString()}</td>
                  <td style={tdStyle}>{s.cost.toLocaleString()}</td>
                  <td style={{ ...tdStyle, color: s.net < 0 ? "#e82e2e" : "#1de682", fontWeight: 900 }}>
                    {s.net.toLocaleString()}
                  </td>
                  <td style={tdStyle}>{s.actions}</td>
                  <td style={{ ...tdStyle, fontWeight: 900 }}>
                    {s.approval === "approved" && <span style={{ color: "#1de682" }}>✔ Approved</span>}
                    {s.approval === "rejected" && <span style={{ color: "#e82e2e" }}>✖ Rejected</span>}
                    {s.approval === "pending" && <span style={{ color: "#FFD700" }}>⏳ Pending</span>}
                    {s.by ? <span style={{ color: "#FFD700bb" }}> by {s.by}</span> : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={{ ...btnStyle, marginTop: 13 }} onClick={saveScenario}>
            Save Custom as New Scenario
          </button>
        </div>
        {/* --- Board actions --- */}
        <div style={{
          background: "#232a2e", borderRadius: 13, marginBottom: 14, padding: "18px 18px", minWidth: 310, flex: 1
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}><FaHistory style={{ marginRight: 8 }} /> Boardroom Action Timeline</b>
          <ul style={{ margin: "13px 0 0 19px" }}>
            {BOARD_ACTIONS.map((a, i) => (
              <li key={i} style={{ color: a.type === "vote" ? "#1de682" : "#FFD700", fontWeight: 900, fontSize: 15 }}>
                <span style={{ color: "#FFD700bb" }}>{a.date}</span>: {a.desc}
              </li>
            ))}
            {log.map((l, i) =>
              <li key={100+i} style={{ color: "#FFD70088", fontWeight: 700, fontSize: 14 }}>
                <span style={{ color: "#FFD700bb" }}>{l.time}</span>: {l.action}
              </li>
            )}
          </ul>
        </div>
        {/* --- Critical Ratios --- */}
        <div style={{
          background: "#232a2e", borderRadius: 13, marginBottom: 14, padding: "18px 18px", minWidth: 270, maxWidth: 320
        }}>
          <b style={{ fontSize: 18, color: "#FFD700" }}>Critical Ratios</b>
          <ul style={{ margin: "14px 0 0 13px", padding: 0 }}>
            {CRITICAL_RATIOS.map((r, idx) => {
              const val = r.get(custom.revenue, custom.cost);
              return (
                <li key={r.name} style={{
                  color: getColor(val, r.warn, r.danger, r.name.includes("Surplus")),
                  fontWeight: 900,
                  fontSize: 17
                }}>
                  {r.name}: {typeof val === "number" ? val : "--"}
                  {typeof val === "number" && r.name.includes("%") && "%"}
                  {typeof val === "number" && r.name.includes("Surplus") && " €"}
                  {val >= r.danger && <FaExclamationTriangle style={{ marginLeft: 7, color: "#e82e2e" }} />}
                </li>
              );
            })}
          </ul>
          <div style={{ fontSize: 13, color: "#FFD700bb", marginTop: 13 }}>
            <FaCheckCircle style={{ color: "#FFD700", marginRight: 7 }} />
            Target: Net Surplus positive, Cost/Revenue below 85%.
          </div>
        </div>
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
        <FaExclamationTriangle style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Tip:</b> No top club has this cockpit—AI, multi-year, risk, workflow, and all analytics live for the board.
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
