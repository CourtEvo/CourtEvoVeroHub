import React, { useState } from "react";
import { FaArrowUp, FaArrowDown, FaDownload, FaFileCsv, FaCalendarAlt, FaSearch, FaRobot, FaExclamationTriangle, FaUsers, FaUserTie, FaClipboardCheck, FaHeartbeat } from "react-icons/fa";
import { ResponsiveLine } from "@nivo/line";
import jsPDF from "jspdf";
import "./ProgressReportingCenter.css";

// -- Generate Demo Data --
const ROLES = ["Athletes", "Staff", "Ops", "Community"];
const KPIS = [
  { key: "attendance", label: "Attendance (%)" },
  { key: "performance", label: "Performance" },
  { key: "wellness", label: "Wellness" },
  { key: "engagement", label: "Engagement" },
  { key: "contribution", label: "Contribution" }
];
function randomData(periods) {
  return periods.map((p, i) => ({
    period: p,
    attendance: 91 + Math.round(Math.random()*9),
    performance: 60 + Math.round(Math.random()*40),
    wellness: 7 + Math.round(Math.random()*3),
    engagement: 6 + Math.round(Math.random()*4),
    contribution: 7 + Math.round(Math.random()*3)
  }));
}
const PERIODS = ["2024-W21","2024-W22","2024-W23","2024-W24","2024-W25","2024-W26","2024-W27"];
const DEMO = ROLES.reduce((all, role) => ({
  ...all, [role]: randomData(PERIODS)
}), {});

// -- Live Event Log (Demo) --
const EVENT_LOG = [
  { date: "2024-W27", type: "info", text: "Record attendance for U18 squad." },
  { date: "2024-W26", type: "warn", text: "Staff absence rose 21%." },
  { date: "2024-W25", type: "good", text: "Wellness at highest this season." },
  { date: "2024-W24", type: "bad", text: "Community engagement dropped 11%." }
];

const ICONS = {
  Athletes: <FaUsers/>,
  Staff: <FaUserTie/>,
  Ops: <FaClipboardCheck/>,
  Community: <FaHeartbeat/>
};
const KPI_COLORS = {
  attendance: "#FFD700",
  performance: "#35b378",
  wellness: "#1de682",
  engagement: "#b7bec9",
  contribution: "#f2a900"
};

export default function ProgressReportingCenter() {
  const [role, setRole] = useState("Athletes");
  const [periodIdx, setPeriodIdx] = useState(PERIODS.length-1);
  const [compare, setCompare] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [cellDrill, setCellDrill] = useState(null);
  const [notepad, setNotepad] = useState({}); // board notes per cell

  const period = PERIODS[periodIdx];
  const prevPeriod = PERIODS[periodIdx-1] || PERIODS[periodIdx];
  const data = DEMO[role];
  const curr = data[periodIdx] || {};
  const prev = data[periodIdx-1] || {};
  // Find anomalies (demo: attendance<95, performance<70, or sharp drop)
  const anomalies = KPIS.filter(k=>curr[k.key]<((k.key==="attendance")?95:(k.key==="performance"?70:7)));

  // --- Cumulative Target Progress Bars ---
  const cumulativeBars = KPIS.map(k => {
    const TARGET = {attendance: 95, performance: 80, wellness: 9, engagement: 8, contribution: 8}[k.key];
    const sum = DEMO[role].reduce((a, r) => a + r[k.key], 0);
    const avg = Math.round(sum / DEMO[role].length * 10) / 10;
    const pct = Math.round((avg / TARGET) * 100);
    return (
      <div className="prc-cum-barbox" key={k.key}>
        <div className="prc-cum-label">{k.label} Target: {TARGET}</div>
        <div className="prc-cum-bar">
          <div className="prc-cum-bar-inner" style={{
            width: Math.min(100, pct) + "%",
            background: pct >= 100 ? "#35b378" : "#FFD700"
          }}/>
        </div>
        <div className="prc-cum-pct">{avg} / {TARGET} ({pct}%)</div>
      </div>
    );
  });

  // -- Helper for sparkline data
  function getSpark(role, kpi) {
    return DEMO[role].map((row,i)=>({x: row.period, y: row[kpi]}));
  }

  // -- PDF/CSV Export (Branded)
  function exportPDF(view) {
    const doc = new jsPDF("l", "mm", "a4");
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,297,22,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("CourtEvo Vero: Progress Report", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 225, y);
    y += 12;
    doc.setTextColor(35,42,46);
    doc.setFontSize(13);
    doc.text(`Period: ${view.period || "All"} | Role: ${view.role || "All"}`, 12, y); y+=7;
    KPIS.forEach((k,idx) => {
      doc.setFontSize(11); doc.setTextColor(35,42,46);
      doc.text(k.label, 30+idx*45, y);
    }); y+=6;
    (DEMO[view.role]||[]).forEach(r => {
      KPIS.forEach((k,idx) => {
        doc.text(String(r[k.key]), 30+idx*45, y);
      }); y+=7;
    });
    y += 7;
    doc.setTextColor(120,120,120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 13, 190);
    doc.save("Progress_Report.pdf");
  }
  function exportCSV(view) {
    const rows = [["Period",...KPIS.map(k=>k.label)]];
    (DEMO[view.role]||[]).forEach(r=>rows.push([r.period, ...KPIS.map(k=>r[k.key])]));
    const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Progress_Report.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // Boardroom pulse ticker
  function PulseTicker() {
    return (
      <div className="prc-pulse-ticker">
        {EVENT_LOG.map((e,i) => (
          <div className={`prc-pulse-event prc-pulse-${e.type}`} key={i}>
            <span className="prc-pulse-dot"/>
            {e.text}
          </div>
        ))}
      </div>
    );
  }
  // AI Copilot
  function AICopilot() {
    let insights = [];
    if (curr.attendance < 94) insights.push("Attendance below target.");
    if (curr.performance > prev.performance) insights.push("Performance trend up.");
    if (anomalies.length) insights.push("Flagged KPIs: " + anomalies.map(k=>k.label).join(", "));
    if (!insights.length) insights.push("All KPIs in healthy range.");
    return (
      <div className="prc-ai-copilot" onClick={()=>setAiOpen(v=>!v)}>
        <FaRobot/> {insights.join(" ")}
        {aiOpen && (
          <div className="prc-ai-copilot-modal">
            <b>AI Insights</b>
            <ul>
              <li>Staff absence rose 21% week-over-week (W26→W27).</li>
              <li>Community engagement needs attention (–11%).</li>
              <li>Wellness record for Athletes: W25.</li>
              <li>Attendance fully recovered after injury week.</li>
              <li>All KPIs above season mean (except Ops performance W24).</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Record weeks/medal
  const recordWeeks = (
    <div className="prc-medal-row">
      <b>Record Weeks:</b>
      {KPIS.map(k => {
        const max = Math.max(...DEMO[role].map(r=>r[k.key]));
        const best = DEMO[role].find(r=>r[k.key]===max);
        return (
          <span className="prc-medal" key={k.key}>
            🥇 {k.label}: {max} ({best.period})
          </span>
        );
      })}
    </div>
  );

  // Drilldown Modal for heatmap cell/flag
  const kpiLabel = (key) => KPIS.find(x=>x.key===key)?.label || key;
  const periodEvents = cellDrill
    ? EVENT_LOG.filter(e=>e.date===cellDrill.period)
    : [];

  return (
    <div className="prc-root">
      <div className="prc-header-row">
        <div className="prc-header-title">
          <FaCalendarAlt style={{color:"#FFD700",marginRight:13}}/>Progress Reporting Command Center
        </div>
        <div className="prc-header-actions">
          <button className="prc-btn" onClick={()=>exportPDF({role, period})}><FaDownload/> PDF</button>
          <button className="prc-btn" onClick={()=>exportCSV({role, period})}><FaFileCsv/> CSV</button>
        </div>
      </div>
      <PulseTicker/>
      {/* Role selector and period nav */}
      <div className="prc-role-row">
        {ROLES.map(r=>(
          <button
            className={`prc-role-btn${role===r ? " prc-role-active" : ""}`}
            key={r}
            onClick={()=>setRole(r)}
          >{ICONS[r]} {r}</button>
        ))}
        <div className="prc-period-slider">
          <button className="prc-per-btn" onClick={()=>setPeriodIdx(i=>Math.max(0,i-1))}>&lt;</button>
          <span className="prc-per-label">{period}</span>
          <button className="prc-per-btn" onClick={()=>setPeriodIdx(i=>Math.min(PERIODS.length-1,i+1))}>&gt;</button>
        </div>
        <button className="prc-compare-btn" onClick={()=>setCompare(v=>!v)}>{compare ? "Single Period" : "Compare Periods"}</button>
        <AICopilot/>
      </div>

      {/* Cumulative Target Progress Bars */}
      <div className="prc-cumulative-row">
        {cumulativeBars}
      </div>

      {/* Main cockpit layout */}
      <div className="prc-body-row">
        {/* Left: Summary Cards */}
        <div className="prc-summary-col">
          <div className="prc-summary-title">{role} – Summary</div>
          {KPIS.map((k, idx) => {
            const v = curr[k.key], prevV = prev[k.key];
            const delta = v - prevV;
            const color = KPI_COLORS[k.key];
            const trend = delta > 0 ? "up" : delta < 0 ? "down" : "steady";
            return (
              <div className={`prc-sumcard prc-sumcard-${trend}${anomalies.find(a=>a.key===k.key)?" prc-sumcard-flagged":""}`} key={k.key}>
                <div className="prc-sumcard-label">{k.label}</div>
                <div className="prc-sumcard-value" style={{color}}>
                  {v}
                  {trend === "up" && <FaArrowUp className="prc-trend-up"/>}
                  {trend === "down" && <FaArrowDown className="prc-trend-down"/>}
                </div>
                <div className="prc-sumcard-delta">
                  {trend === "up" ? "+" : ""}{delta} vs last
                </div>
                {anomalies.find(a=>a.key===k.key) && (
                  <span className="prc-anom-flag"><FaExclamationTriangle/> Flagged</span>
                )}
                {/* Sparkline */}
                <div className="prc-sumcard-spark">
                  <ResponsiveLine
                    data={[{
                      id: k.label,
                      data: DEMO[role].map((row,i)=>({x: row.period, y: row[k.key]}))
                    }]}
                    margin={{top:7,right:6,bottom:12,left:17}}
                    xScale={{ type: "point" }}
                    yScale={{ type: "linear", min: "auto", max: "auto" }}
                    axisBottom={null}
                    axisLeft={null}
                    enablePoints={false}
                    colors={[color]}
                    enableArea={true}
                    areaOpacity={0.13}
                    height={32}
                    width={120}
                    isInteractive={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* Right: Full Table Analytics */}
        <div className="prc-table-col">
          <div className="prc-table-title">KPI Analytics Grid</div>
          <table className="prc-table">
            <thead>
              <tr>
                <th>Period</th>
                {KPIS.map(k=><th key={k.key}>{k.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.period} className={idx===periodIdx?"prc-row-current":""}>
                  <td>{row.period}</td>
                  {KPIS.map(k=>{
                    const v = row[k.key];
                    const last = idx>0 ? data[idx-1][k.key] : v;
                    const delta = v - last;
                    let flag = "";
                    if (k.key==="attendance" && v<95) flag="prc-flag-bad";
                    if (k.key==="performance" && v<70) flag="prc-flag-bad";
                    if (delta<-3) flag="prc-flag-down";
                    if (delta>3) flag="prc-flag-up";
                    return (
                      <td
                        key={k.key}
                        className={flag}
                        onClick={()=>setCellDrill({period: row.period, kpi: k.key})}
                      >
                        {v}
                        {flag && <span className="prc-cell-flag"/>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Comparison mode */}
          {compare && (
            <div className="prc-compare-box">
              <div className="prc-compare-title">Period Comparison: {period} vs {prevPeriod}</div>
              <table className="prc-compare-table">
                <thead>
                  <tr>
                    <th>KPI</th><th>{prevPeriod}</th><th>{period}</th><th>Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {KPIS.map(k=>(
                    <tr key={k.key}>
                      <td>{k.label}</td>
                      <td>{prev[k.key]}</td>
                      <td>{curr[k.key]}</td>
                      <td className={curr[k.key]>prev[k.key]?"prc-up":curr[k.key]<prev[k.key]?"prc-down":""}>
                        {curr[k.key]-prev[k.key]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record weeks/medal bar */}
      {recordWeeks}

      {/* Flagged Event Log */}
      <div className="prc-log-row">
        <div className="prc-log-title"><FaExclamationTriangle/> Flagged Events & Anomalies Log</div>
        <ul className="prc-log-list">
          {EVENT_LOG.map((e,i)=>(
            <li key={i} className={`prc-log-item prc-log-${e.type}`}>
              <span className="prc-log-date">{e.date}</span>
              {e.text}
            </li>
          ))}
          {anomalies.length === 0 && (
            <li className="prc-log-ok">No critical events in this period.</li>
          )}
        </ul>
      </div>
      <div className="prc-tagline">BE REAL. BE VERO.</div>

      {/* Drilldown Modal for cell */}
      {cellDrill && (
        <div className="prc-modal-overlay" onClick={()=>setCellDrill(null)}>
          <div className="prc-modal" onClick={e=>e.stopPropagation()}>
            <div className="prc-modal-title">
              {cellDrill.period} – {kpiLabel(cellDrill.kpi)}
            </div>
            <div className="prc-modal-body">
              <div>
                <b>Incidents/Log:</b>
                <ul>
                  {periodEvents.map((e,i)=>
                    <li key={i}>{e.text}</li>
                  )}
                  {(!periodEvents.length) && <li>No incidents logged.</li>}
                </ul>
              </div>
              <div>
                <b>Boardroom Notepad:</b>
                <textarea
                  className="prc-notepad"
                  value={notepad[cellDrill.period+"-"+cellDrill.kpi]||""}
                  onChange={e=>setNotepad(n=>({...n, [cellDrill.period+"-"+cellDrill.kpi]:e.target.value}))}
                  placeholder="Type board note, action, or question..."
                />
              </div>
              <button
                className="prc-btn"
                onClick={()=>setCellDrill(null)}
              >Save & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
