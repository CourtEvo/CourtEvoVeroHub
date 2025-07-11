import React, { useState } from "react";
import { FaUserTie, FaStar, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaCheckCircle, FaDownload, FaRobot, FaPlus, FaFileCsv } from "react-icons/fa";
import { ResponsiveLine } from "@nivo/line";
import jsPDF from "jspdf";
import "./AthleteProgressIDCardSuite.css";

// --- MOCK DATA (extend with backend/Excel) ---
const INIT_ATHLETES = [
  {
    id: "A001",
    name: "Luka Nović",
    position: "Guard",
    age: 17,
    team: "U18",
    status: "Active",
    progress: [
      { month: "2024-01", points: 18, rebounds: 5, assists: 8, attendance: 97, attitude: 9, wellness: 8 },
      { month: "2024-02", points: 21, rebounds: 7, assists: 9, attendance: 100, attitude: 10, wellness: 9 },
      { month: "2024-03", points: 16, rebounds: 6, assists: 7, attendance: 100, attitude: 10, wellness: 9 },
      { month: "2024-04", points: 24, rebounds: 8, assists: 10, attendance: 99, attitude: 10, wellness: 10 },
      { month: "2024-05", points: 18, rebounds: 4, assists: 5, attendance: 96, attitude: 8, wellness: 8 }
    ],
    flags: [
      { date: "2024-02", type: "milestone", label: "Career-high 21 pts", color: "#FFD700" }
    ],
    notes: ["Excellent leadership", "Recent minor injury resolved"],
    feedback: [
      { date: "2024-04-08", type: "coach", text: "Maintain focus after milestone.", resolved: false }
    ]
  },
  {
    id: "A002",
    name: "Ivan Radić",
    position: "Forward",
    age: 18,
    team: "U19",
    status: "Active",
    progress: [
      { month: "2024-01", points: 7, rebounds: 7, assists: 1, attendance: 90, attitude: 7, wellness: 7 },
      { month: "2024-02", points: 8, rebounds: 8, assists: 2, attendance: 89, attitude: 6, wellness: 6 },
      { month: "2024-03", points: 8, rebounds: 9, assists: 2, attendance: 92, attitude: 8, wellness: 7 },
      { month: "2024-04", points: 9, rebounds: 7, assists: 2, attendance: 93, attitude: 8, wellness: 7 },
      { month: "2024-05", points: 10, rebounds: 10, assists: 2, attendance: 91, attitude: 7, wellness: 8 }
    ],
    flags: [
      { date: "2024-02", type: "coach", label: "Attitude dip", color: "#FFD700" }
    ],
    notes: ["Needs consistency", "Attendance improved since March"],
    feedback: [
      { date: "2024-03-14", type: "coach", text: "Be more vocal on defense.", resolved: false }
    ]
  }
];

const KPI_KEYS = ["points", "rebounds", "assists", "attendance", "attitude", "wellness"];
const KPI_LABELS = {
  points: "Points",
  rebounds: "Reb",
  assists: "Ast",
  attendance: "Attendance",
  attitude: "Attitude",
  wellness: "Wellness"
};

function kpiColor(type, value) {
  if (type === "attendance") return value > 97 ? "#35b378" : value > 94 ? "#f2a900" : "#f35650";
  if (type === "attitude") return value > 8 ? "#35b378" : value > 7 ? "#f2a900" : "#f35650";
  if (type === "wellness") return value > 8 ? "#35b378" : value > 7 ? "#f2a900" : "#f35650";
  if (type === "points" || type === "rebounds" || type === "assists") return "#FFD700";
  return "#b7bec9";
}
function kpiTrend(prev, current) {
  if (prev === undefined) return null;
  const change = current - prev;
  if (change > 1) return { dir: "up", value: change };
  if (change < -1) return { dir: "down", value: change };
  return { dir: "steady", value: 0 };
}
function statusBadge(status, isRisk) {
  if (isRisk) return <span className="apid-badge apid-risk"><FaExclamationTriangle /> AT RISK</span>;
  if (status === "Active") return <span className="apid-badge apid-ok"><FaCheckCircle /> ACTIVE</span>;
  return null;
}

// --- Microdashboard Summary ---
function microdashboardSummary(athletes) {
  const total = athletes.length;
  const avgAtt = Math.round(athletes.reduce((s,a)=>s+a.progress[a.progress.length-1].attendance,0)/total);
  const atRisk = athletes.filter(a => isAtRisk(a)).length;
  const milestones = athletes.reduce((s,a)=>s+(a.flags?a.flags.filter(f=>f.type==="milestone").length:0),0);
  return { total, avgAtt, atRisk, milestones };
}
function isAtRisk(a) {
  // Red attendance or wellness 2+ months, attitude dip, or custom logic
  const att = a.progress.slice(-2).map(p=>p.attendance);
  const well = a.progress.slice(-2).map(p=>p.wellness);
  const attRisk = att.filter(x=>x<95).length>=2;
  const wellRisk = well.filter(x=>x<7).length>=2;
  const attDrop = a.progress[a.progress.length-1].attitude<7;
  return attRisk||wellRisk||attDrop;
}

// --- CSV Export (selected or all) ---
function exportCSV(athletes) {
  const rows = [
    ["ID","Name","Position","Team","Age","Status",...KPI_KEYS.map(k=>KPI_LABELS[k]),"Flags"]
  ];
  for (const a of athletes) {
    const last = a.progress[a.progress.length-1];
    rows.push([
      a.id, a.name, a.position, a.team, a.age, a.status,
      ...KPI_KEYS.map(k=>last[k]),
      (a.flags?a.flags.map(f=>`${f.date}: ${f.label}`).join("; "):"")
    ]);
  }
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "AthleteProgressIDCards.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// --- PDF Export (all or single) ---
function exportPDF(athletes) {
  athletes = Array.isArray(athletes)?athletes:[athletes];
  const doc = new jsPDF("p", "mm", "a4");
  for (const a of athletes) {
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Athlete Progress ID Card", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 10;
    doc.setTextColor(255,255,255);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 12, y);
    y += 10;
    doc.setTextColor(35,42,46);
    doc.setFontSize(12);
    doc.text(`${a.name} (${a.position}, ${a.team}) | ID: ${a.id} | Age: ${a.age}`, 12, y);
    y += 6;
    doc.setFontSize(12);
    doc.text("Latest KPIs:", 12, y);
    y += 5;
    let x = 12;
    const last = a.progress[a.progress.length-1];
    const prev = a.progress[a.progress.length-2] || last;
    for (let i=0; i<KPI_KEYS.length; ++i) {
      doc.setFillColor(255,215,0);
      doc.rect(x, y, 27, 8, "F");
      doc.setTextColor(35,42,46);
      doc.setFontSize(10);
      doc.text(KPI_LABELS[KPI_KEYS[i]], x+2, y+5.5);
      x += 27;
    }
    y += 8;
    x = 12;
    for (let i=0; i<KPI_KEYS.length; ++i) {
      doc.setFillColor(255,255,255);
      doc.rect(x, y, 27, 8, "F");
      doc.setTextColor(35,42,46);
      doc.setFontSize(11);
      doc.text(`${last[KPI_KEYS[i]]}`, x+2, y+5.5);
      if (last[KPI_KEYS[i]] > prev[KPI_KEYS[i]]) {
        doc.setTextColor(53,179,120);
        doc.text("↑", x+16, y+5.5);
      } else if (last[KPI_KEYS[i]] < prev[KPI_KEYS[i]]) {
        doc.setTextColor(243,86,80);
        doc.text("↓", x+16, y+5.5);
      } else {
        doc.setTextColor(242,169,0);
        doc.text("→", x+16, y+5.5);
      }
      x += 27;
    }
    y += 10;
    doc.setTextColor(35,42,46);
    doc.setFontSize(12);
    doc.text("Coach Feedback Log:", 12, y); y+=6;
    a.feedback.forEach(fb => {
      doc.setTextColor(fb.resolved ? 53 : 243, fb.resolved ? 179 : 86, fb.resolved ? 120 : 80);
      doc.text(fb.resolved ? "✓" : "•", 12, y+3.5);
      doc.setTextColor(35,42,46);
      doc.text(`${fb.date}: ${fb.text} ${fb.resolved ? "(Resolved)" : ""}`, 19, y+3.5);
      y += 5.5;
    });
    y += 4;
    doc.setTextColor(120,120,120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    if (athletes.length>1) doc.addPage();
  }
  doc.save(athletes.length===1 ? `${athletes[0].name}_ProgressIDCard.pdf` : "AthleteProgressIDCards.pdf");
}

export default function AthleteProgressIDCardSuite() {
  const [athletes, setAthletes] = useState(INIT_ATHLETES);
  const [drilldown, setDrilldown] = useState(null);
  const [compare, setCompare] = useState([]); // array of idxs
  const [addFB, setAddFB] = useState("");     // feedback field (modal)
  const [addMS, setAddMS] = useState("");     // milestone field (modal)

  // --- Microdashboard
  const micro = microdashboardSummary(athletes);

  // --- Select for compare
  function toggleCompare(idx) {
    setCompare(cs =>
      cs.includes(idx) ? cs.filter(i => i !== idx)
      : cs.length < 3 ? [...cs, idx] : cs
    );
  }
  function clearCompare() { setCompare([]); }

  // --- Add feedback/milestone
  function addFeedback(aIdx) {
    if (!addFB.trim()) return;
    setAthletes(list => {
      const next = [...list];
      next[aIdx].feedback.push({
        date: new Date().toISOString().slice(0, 10),
        type: "coach",
        text: addFB,
        resolved: false
      });
      return next;
    });
    setAddFB("");
  }
  function addMilestone(aIdx) {
    if (!addMS.trim()) return;
    setAthletes(list => {
      const next = [...list];
      next[aIdx].flags.push({
        date: new Date().toISOString().slice(0, 7),
        type: "milestone",
        label: addMS,
        color: "#FFD700"
      });
      return next;
    });
    setAddMS("");
  }
  function resolveFB(aIdx, fbIdx) {
    setAthletes(list => {
      const next = [...list];
      next[aIdx].feedback[fbIdx].resolved = true;
      return next;
    });
  }

  // --- AI Copilot "next action"
  function aiCopilot(a) {
    const last = a.progress[a.progress.length - 1];
    const prev = a.progress[a.progress.length - 2] || last;
    let actions = [];
    if (last.attendance < 92) actions.push("Invite to attendance check-in");
    if (last.wellness < 7) actions.push("Book wellness consult");
    if (last.attitude < 7) actions.push("Coach 1-on-1 required");
    if (last.points > prev.points && last.points > 20) actions.push("Highlight scoring run in newsletter");
    if (last.wellness > prev.wellness && last.wellness > 8) actions.push("Nominate for leadership group");
    if (last.attitude > prev.attitude && last.attitude > 8) actions.push("Flag for positive recognition");
    if (a.flags.filter(f=>f.type==="milestone").length>0)
      actions.push("Public reward for milestone");
    if (!actions.length) actions.push("Continue current pathway.");
    return actions;
  }

  // --- Main UI
  return (
    <div className="apid-main">
      <div className="apid-header">
        <h2>
          <FaUserTie style={{ color: "#FFD700", marginRight: 13 }} />
          Elite Athlete Progress ID Card Suite
        </h2>
      </div>
      {/* --- Microdashboard --- */}
      <div className="apid-microdashboard-row">
        <div className="apid-microdashboard-card">Athletes<br/><b>{micro.total}</b></div>
        <div className="apid-microdashboard-card">Avg Attendance<br/><b>{micro.avgAtt}%</b></div>
        <div className="apid-microdashboard-card">At Risk<br/><b>{micro.atRisk}</b></div>
        <div className="apid-microdashboard-card">Milestones<br/><b>{micro.milestones}</b></div>
        <button className="apid-csv-btn" onClick={()=>exportCSV(compare.length?compare.map(i=>athletes[i]):athletes)}>
          <FaFileCsv/> Export CSV
        </button>
        <button className="apid-pdf-btn" onClick={()=>exportPDF(compare.length?compare.map(i=>athletes[i]):athletes)}>
          <FaDownload/> Bulk PDF
        </button>
      </div>

      {/* --- Athlete Grid with select/compare --- */}
      <div className="apid-grid">
        {athletes.map((a, idx) => {
          const last = a.progress[a.progress.length-1];
          const risk = isAtRisk(a);
          return (
            <div className={`apid-card${risk ? " apid-risk-card" : ""}`} key={a.id} onClick={()=>setDrilldown({a, idx})}>
              <div className="apid-card-header">
                <span className="apid-card-name">{a.name}</span>
                <span className="apid-card-role">{a.position} • {a.team}</span>
                <span className="apid-card-age">Age {a.age}</span>
                <span className="apid-card-id">{a.id}</span>
              </div>
              <div className="apid-card-status">{statusBadge(a.status, risk)}</div>
              <div className="apid-card-kpis">
                {KPI_KEYS.map(k =>
                  <span className="apid-kpi-group" key={k}>
                    <span className="apid-kpi-label">{KPI_LABELS[k]}</span>
                    <span className="apid-kpi-value" style={{color:kpiColor(k,last[k])}}>{last[k]}</span>
                  </span>
                )}
              </div>
              <div className="apid-card-flags">
                {a.flags && a.flags.map((f,i) =>
                  <span className="apid-flag" style={{background:f.color}} key={i}>{f.label}</span>
                )}
              </div>
              <div className="apid-compare-selector">
                <input type="checkbox" checked={compare.includes(idx)} onChange={e=>{e.stopPropagation();toggleCompare(idx);}}/>
                <span>Select</span>
              </div>
              <button className="apid-pdf-btn" onClick={e=>{e.stopPropagation();exportPDF(a);}}><FaDownload /> PDF</button>
            </div>
          );
        })}
      </div>

      {/* --- Multi-Athlete Compare Overlay --- */}
      {compare.length>=2 && (
        <div className="apid-modal-overlay" onClick={clearCompare}>
          <div className="apid-modal apid-modal-compare" onClick={e=>e.stopPropagation()}>
            <div className="apid-modal-header">
              <FaUserTie/> Multi-Athlete Compare ({compare.length})
              <button className="apid-modal-close" onClick={clearCompare}>×</button>
            </div>
            <div className="apid-compare-row">
              {compare.map(idx => {
                const a = athletes[idx];
                const last = a.progress[a.progress.length-1];
                return (
                  <div className="apid-compare-card" key={a.id}>
                    <div className="apid-card-name">{a.name}</div>
                    <div className="apid-card-role">{a.position} • {a.team}</div>
                    <div className="apid-card-status">{statusBadge(a.status, isAtRisk(a))}</div>
                    <div className="apid-card-kpis">
                      {KPI_KEYS.map(k =>
                        <span className="apid-kpi-group" key={k}>
                          <span className="apid-kpi-label">{KPI_LABELS[k]}</span>
                          <span className="apid-kpi-value" style={{color:kpiColor(k,last[k])}}>{last[k]}</span>
                        </span>
                      )}
                    </div>
                    <div className="apid-card-flags">
                      {a.flags && a.flags.map((f,i) =>
                        <span className="apid-flag" style={{background:f.color}} key={i}>{f.label}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{height:120, width:compare.length*260,marginTop:7}}>
              <ResponsiveLine
                data={KPI_KEYS.slice(0,3).map(k=>({
                  id: KPI_LABELS[k],
                  data: compare.map(idx=>athletes[idx]).map(a=>
                    a.progress.map((r,i)=>({x: `${a.name.slice(0,3)} ${r.month}`, y: r[k]}))
                  ).flat()
                }))}
                margin={{top:18,right:26,bottom:28,left:35}}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: "auto", max: "auto" }}
                axisBottom={{tickRotation: -33, tickSize: 7, legend:"Athlete/Month", legendOffset:28, legendPosition:"middle"}}
                axisLeft={{tickSize:6,legend:"Stat",legendOffset:-20,legendPosition:"middle"}}
                colors={["#FFD700","#35b378","#b7bec9"]}
                enablePoints={true}
                pointSize={8}
                theme={{
                  axis:{ticks:{text:{fill:"#FFD700"}}},
                  grid:{line:{stroke:"#5c636e",strokeDasharray:"3 3"}},
                  legends:{text:{fill:"#FFD700"}}
                }}
                curve="monotoneX"
                enableArea={false}
                legends={[{anchor:"top-right",direction:"column",translateY:-7,translateX:18,itemWidth:55,itemHeight:18,symbolSize:15,symbolShape:"circle"}]}
                height={105}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- Drilldown Overlay --- */}
      {drilldown && (
        <div className="apid-modal-overlay">
          <div className="apid-modal">
            <div className="apid-modal-header">
              <FaUserTie/> {drilldown.a.name} ({drilldown.a.position}, {drilldown.a.team}) – Age {drilldown.a.age}, ID {drilldown.a.id}
              <button className="apid-modal-close" onClick={()=>setDrilldown(null)}>×</button>
            </div>
            <div className="apid-modal-row apid-modal-status">
              {statusBadge(drilldown.a.status, isAtRisk(drilldown.a))}
              <button className="apid-pdf-btn" onClick={()=>exportPDF(drilldown.a)}><FaDownload /> Export PDF</button>
            </div>
            {/* KPI Trend */}
            <div className="apid-modal-kpi-row">
              {KPI_KEYS.map(k => {
                const vals = drilldown.a.progress.map(r=>r[k]);
                const trend = kpiTrend(vals[vals.length-2], vals[vals.length-1]);
                return (
                  <span className="apid-modal-kpi-group" key={k}>
                    <span className="apid-kpi-label">{KPI_LABELS[k]}</span>
                    <span className="apid-kpi-value" style={{color:kpiColor(k,vals[vals.length-1])}}>{vals[vals.length-1]}
                      {trend && trend.dir==="up" && <FaArrowUp className="apid-trend-up"/>}
                      {trend && trend.dir==="down" && <FaArrowDown className="apid-trend-down"/>}
                      {trend && trend.dir==="steady" && <FaCheckCircle className="apid-trend-steady"/>}
                    </span>
                  </span>
                );
              })}
            </div>
            {/* --- Progress Trends (Nivo) --- */}
            <div style={{height:110, width:"100%",marginTop:7}}>
              <ResponsiveLine
                data={KPI_KEYS.slice(0,3).map(k=>({
                  id: KPI_LABELS[k],
                  data: drilldown.a.progress.map((r,i)=>({x: r.month, y: r[k]}))
                }))}
                margin={{top:18,right:26,bottom:28,left:35}}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: "auto", max: "auto" }}
                axisBottom={{tickRotation: -33, tickSize: 7, legend:"Month", legendOffset:28, legendPosition:"middle"}}
                axisLeft={{tickSize:6,legend:"Stat",legendOffset:-20,legendPosition:"middle"}}
                colors={["#FFD700","#35b378","#b7bec9"]}
                enablePoints={true}
                pointSize={8}
                theme={{
                  axis:{ticks:{text:{fill:"#FFD700"}}},
                  grid:{line:{stroke:"#5c636e",strokeDasharray:"3 3"}},
                  legends:{text:{fill:"#FFD700"}}
                }}
                curve="monotoneX"
                enableArea={false}
                legends={[{anchor:"top-right",direction:"column",translateY:-7,translateX:18,itemWidth:55,itemHeight:18,symbolSize:15,symbolShape:"circle"}]}
                height={105}
              />
            </div>
            {/* Flags/Milestones */}
            <div className="apid-modal-flags">
              <span className="apid-modal-flags-title">Timeline & Milestones:</span>
              <span className="apid-modal-flags-list">
                {drilldown.a.flags && drilldown.a.flags.map((f,i) =>
                  <span className="apid-flag" style={{background:f.color}} key={i}>{f.date}: {f.label}</span>
                )}
              </span>
              <div style={{marginTop:7, display:'flex', alignItems:'center', gap:10}}>
                <input type="text" value={addMS} onChange={e=>setAddMS(e.target.value)} placeholder="Add milestone..."/>
                <button className="apid-milestone-btn" onClick={()=>addMilestone(drilldown.idx)}><FaPlus/> Add</button>
              </div>
            </div>
            {/* Feedback Log */}
            <div className="apid-modal-feedback">
              <span className="apid-modal-feedback-title"><FaRobot style={{color:"#FFD700",marginRight:8}}/> Coach Feedback</span>
              <ul>
                {drilldown.a.feedback.map((fb,i) =>
                  <li key={i} className={fb.resolved?"apid-fb-resolved":"apid-fb-active"}>
                    <span className="apid-fb-date">{fb.date}</span>
                    <span className="apid-fb-text">{fb.text}</span>
                    {fb.resolved
                      ? <span className="apid-fb-badge apid-ok">Resolved</span>
                      : <button className="apid-fb-resolve-btn" onClick={()=>resolveFB(drilldown.idx,i)}>Acknowledge</button>
                    }
                  </li>
                )}
              </ul>
              <div style={{marginTop:6, display:'flex', alignItems:'center', gap:10}}>
                <input type="text" value={addFB} onChange={e=>setAddFB(e.target.value)} placeholder="Add feedback..."/>
                <button className="apid-feedback-btn" onClick={()=>addFeedback(drilldown.idx)}><FaPlus/> Add</button>
              </div>
            </div>
            {/* AI Copilot */}
            <div className="apid-modal-copilot">
              <FaRobot style={{color:"#FFD700",marginRight:7,fontSize:20}}/>
              <span>
                <b>Boardroom Copilot – Next Actions:</b>
                {" "}
                {aiCopilot(drilldown.a).join(" | ")}
              </span>
            </div>
            <div className="apid-tagline apid-tagline-sticky">BE REAL. BE VERO.</div>
          </div>
        </div>
      )}

      <div className="apid-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
