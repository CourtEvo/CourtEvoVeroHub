import React, { useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { FaArrowUp, FaArrowDown, FaExclamationTriangle, FaCheckCircle, FaDownload, FaPlus, FaUserFriends, FaComment, FaRobot, FaStar } from "react-icons/fa";
import jsPDF from "jspdf";
import "./AthleteProgress360.css";

// --- Mock athlete list and data (extendable for backend/Excel) ---
const ATHLETES = [
  {
    id: "A001",
    name: "Luka Nović",
    position: "Guard",
    age: 17,
    team: "U18",
    progress: [
      { month: "2023-09", points: 13, rebounds: 4, assists: 5, attendance: 98, attitude: 9, wellness: 8 },
      { month: "2023-10", points: 14, rebounds: 3, assists: 6, attendance: 96, attitude: 8, wellness: 8 },
      { month: "2023-11", points: 18, rebounds: 5, assists: 8, attendance: 99, attitude: 9, wellness: 9 },
      { month: "2023-12", points: 11, rebounds: 2, assists: 3, attendance: 95, attitude: 8, wellness: 6 },
      { month: "2024-01", points: 21, rebounds: 7, assists: 9, attendance: 97, attitude: 9, wellness: 9 },
      { month: "2024-02", points: 16, rebounds: 6, assists: 7, attendance: 100, attitude: 10, wellness: 9 },
      { month: "2024-03", points: 19, rebounds: 8, assists: 8, attendance: 100, attitude: 10, wellness: 10 },
      { month: "2024-04", points: 24, rebounds: 8, assists: 10, attendance: 99, attitude: 10, wellness: 10 },
      { month: "2024-05", points: 18, rebounds: 4, assists: 5, attendance: 96, attitude: 8, wellness: 8 }
    ],
    flags: [
      { date: "2023-12", type: "injury", label: "Minor ankle sprain", color: "#f2a900" },
      { date: "2024-01", type: "milestone", label: "Career-high 21 pts", color: "#35b378" }
    ],
    status: {
      injury: false,
      attitude: "positive",
      attendance: "excellent",
      risk: "opportunity"
    },
    notes: ["Consistently improving, excellent leadership", "Recent minor injury fully resolved"],
    feedback: [
      { date: "2024-01-18", type: "coach", text: "Great bounce-back after injury.", resolved: true },
      { date: "2024-04-08", type: "coach", text: "Should maintain focus after reaching milestone.", resolved: false }
    ]
  },
  {
    id: "A002",
    name: "Ivan Radić",
    position: "Forward",
    age: 18,
    team: "U19",
    progress: [
      { month: "2023-09", points: 7, rebounds: 7, assists: 1, attendance: 90, attitude: 7, wellness: 7 },
      { month: "2023-10", points: 8, rebounds: 8, assists: 2, attendance: 89, attitude: 6, wellness: 6 },
      { month: "2023-11", points: 8, rebounds: 9, assists: 2, attendance: 92, attitude: 8, wellness: 7 },
      { month: "2023-12", points: 9, rebounds: 7, assists: 2, attendance: 93, attitude: 8, wellness: 7 },
      { month: "2024-01", points: 10, rebounds: 10, assists: 2, attendance: 91, attitude: 7, wellness: 8 },
      { month: "2024-02", points: 7, rebounds: 6, assists: 1, attendance: 92, attitude: 6, wellness: 6 },
      { month: "2024-03", points: 6, rebounds: 7, assists: 1, attendance: 89, attitude: 7, wellness: 6 },
      { month: "2024-04", points: 7, rebounds: 8, assists: 2, attendance: 93, attitude: 8, wellness: 8 },
      { month: "2024-05", points: 8, rebounds: 7, assists: 1, attendance: 95, attitude: 9, wellness: 8 }
    ],
    flags: [
      { date: "2023-10", type: "coach", label: "Attitude dip", color: "#f2a900" },
      { date: "2024-03", type: "injury", label: "Missed week: illness", color: "#f35650" }
    ],
    status: {
      injury: false,
      attitude: "variable",
      attendance: "good",
      risk: "stagnation"
    },
    notes: ["Needs to show more consistency", "Attendance improving since March"],
    feedback: [
      { date: "2024-03-14", type: "coach", text: "Needs to be more vocal on defense.", resolved: false }
    ]
  }
];

const KPI_KEYS = ["points", "rebounds", "assists", "attendance", "attitude", "wellness"];
const KPI_LABELS = {
  points: "Points",
  rebounds: "Rebounds",
  assists: "Assists",
  attendance: "Attendance",
  attitude: "Attitude",
  wellness: "Wellness"
};

// --- Helper: KPI R/Y/G Color & Trend Logic ---
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
function kpiHeat(val, prev) {
  if (val > prev) return "ath360-heat-up";
  if (val < prev) return "ath360-heat-down";
  return "ath360-heat-steady";
}
function statusBadge(status) {
  if (status === "opportunity") return <span className="ath360-status-badge ath360-ok"><FaArrowUp/> EMERGING</span>;
  if (status === "stagnation") return <span className="ath360-status-badge ath360-warn"><FaExclamationTriangle/> STAGNATION</span>;
  if (status === "risk") return <span className="ath360-status-badge ath360-risk"><FaExclamationTriangle/> AT RISK</span>;
  return null;
}

// --- Main Component ---
export default function AthleteProgress360() {
  const [idx, setIdx] = useState(0);
  const [compareIdx, setCompareIdx] = useState(null);
  const [milestoneText, setMilestoneText] = useState("");
  const [feedbacks, setFeedbacks] = useState(ATHLETES.map(a => a.feedback));
  const athlete = ATHLETES[idx];
  const athleteCompare = compareIdx !== null ? ATHLETES[compareIdx] : null;

  // -- Enrich: Heatmap data for all KPIs --
  const kpiHeatmap = KPI_KEYS.map(k => {
    return athlete.progress.map((row, i) => {
      if (i === 0) return "ath360-heat-steady";
      return kpiHeat(row[k], athlete.progress[i-1][k]);
    });
  });

  // -- AI Copilot: Analyze all risks/opportunities --
  function aiCopilot() {
    const last = athlete.progress[athlete.progress.length-1];
    const prev = athlete.progress[athlete.progress.length-2] || last;
    let risks = [], opps = [];
    if (last.attendance < 92) risks.push("Low attendance (<92%)");
    if (last.wellness < 7) risks.push("Wellness concern");
    if (last.attitude < 7) risks.push("Attitude drop");
    if (last.points > prev.points && last.points > 20) opps.push("High scoring run");
    if (last.wellness > prev.wellness && last.wellness > 8) opps.push("Wellness peak");
    if (last.attitude > prev.attitude && last.attitude > 8) opps.push("Attitude improving");
    if (athlete.status.risk === "opportunity") opps.push("Eligible for higher training group");
    if (athlete.status.risk === "stagnation") risks.push("Stagnation—action recommended");
    if (athlete.flags.some(f=>f.type==="injury")) risks.push("Recent injury history");
    return { risks, opps };
  }

  // -- Add milestone --
  function addMilestone() {
    if (!milestoneText.trim()) return;
    athlete.flags.push({ date: new Date().toISOString().slice(0,7), type: "milestone", label: milestoneText, color: "#FFD700" });
    setMilestoneText("");
  }

  // -- Feedback resolve/acknowledge --
  function resolveFeedback(i) {
    const fbArr = [...feedbacks];
    fbArr[idx][i].resolved = true;
    setFeedbacks(fbArr);
  }

    // -- PDF export (all charts, feedback, flags, R/Y/G badges, branding) --
function exportPDF() {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = margin + 2;

  // Header
  doc.setFillColor(35, 42, 46);
  doc.rect(0, 0, pageWidth, 21, "F");
  doc.setTextColor(255, 215, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("CourtEvo Vero Athlete Progress 360", margin, y);
  doc.setFontSize(12);
  doc.text("BE REAL. BE VERO.", pageWidth - 67, y);
  // -- Add logo if you want (base64 or url), or leave for branding print

  y += 12;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, y);

  y += 8;
  doc.setTextColor(35, 42, 46);
  doc.setFontSize(16);
  doc.text(`${athlete.name} (${athlete.position}, ${athlete.team})`, margin, y);

  y += 7;
  doc.setFontSize(11);
  doc.text(`Athlete ID: ${athlete.id}   |   Age: ${athlete.age}`, margin, y);

  y += 5;
  doc.setDrawColor(220,220,220);
  doc.line(margin, y, pageWidth - margin, y);

  y += 7;
  // -- Current KPIs Table
  doc.setFontSize(12);
  doc.setTextColor(35, 42, 46);
  doc.text("Latest KPIs & Trend:", margin, y);

  const last = athlete.progress[athlete.progress.length-1];
  const prev = athlete.progress[athlete.progress.length-2] || last;
  const kpiKeys = ["points", "rebounds", "assists", "attendance", "attitude", "wellness"];
  const kpiLabels = ["Points", "Reb", "Ast", "Attnd", "Attitude", "Wellness"];
  y += 4.5;

  // Table header
  let x = margin;
  doc.setFillColor(255,215,0);
  doc.setDrawColor(220,220,220);
  for (let i=0; i<kpiLabels.length; ++i) {
    doc.rect(x, y, 27, 8, "F");
    doc.setTextColor(35,42,46);
    doc.setFontSize(10);
    doc.text(kpiLabels[i], x+2, y+5.5);
    x += 27;
  }
  y += 8;

  // Table values with up/down/steady badge
  x = margin;
  for (let i=0; i<kpiKeys.length; ++i) {
    doc.setFillColor(255,255,255);
    doc.rect(x, y, 27, 8, "F");
    doc.setTextColor(35,42,46);
    doc.setFontSize(11);
    const val = last[kpiKeys[i]];
    const prevVal = prev[kpiKeys[i]];
    doc.text(`${val}`, x+2, y+5.5);

    // Trend badge
    if (val > prevVal) {
  doc.setTextColor(53,179,120); // green
  doc.text("↑", x+16, y+5.5);
} else if (val < prevVal) {
  doc.setTextColor(243,86,80); // red
  doc.text("↓", x+16, y+5.5);
} else {
  doc.setTextColor(242,169,0); // yellow
  doc.text("→", x+16, y+5.5);
}
  }
  y += 10;

  // -- Mini Heatmap Row
  doc.setFontSize(11);
  doc.setTextColor(35,42,46);
  doc.text("Heatmap (progress over months):", margin, y);

  for (let j=0; j<kpiKeys.length; ++j) {
    x = margin + j*27;
    for (let i=0; i<athlete.progress.length; ++i) {
      const val = athlete.progress[i][kpiKeys[j]];
      const prevVal = i === 0 ? val : athlete.progress[i-1][kpiKeys[j]];
      let color = "#b7bec9";
      if (val > prevVal) color = "#35b378";
      if (val < prevVal) color = "#f35650";
      if (val === prevVal) color = "#FFD700";
      doc.setFillColor(color);
      doc.rect(x+1, y+3 + i*5, 25, 4, "F");
    }
  }
  y += 5*athlete.progress.length + 8;

  // -- Status badges
  if (athlete.status.risk) {
    let badgeColor = "#FFD700";
    if (athlete.status.risk==="opportunity") badgeColor = "#35b378";
    if (athlete.status.risk==="stagnation") badgeColor = "#f2a900";
    if (athlete.status.risk==="risk") badgeColor = "#f35650";
    doc.setFillColor(badgeColor);
    doc.rect(margin, y, 38, 8, "F");
    doc.setTextColor(35,42,46);
    doc.text(athlete.status.risk.toUpperCase(), margin+2, y+5.5);
    y += 10;
  }

  // -- Flags/Timeline
  doc.setTextColor(35,42,46);
  doc.setFontSize(12);
  doc.text("Timeline & Flags:", margin, y);
  y += 6;
  doc.setFontSize(11);
  athlete.flags.forEach((f, i) => {
    doc.setFillColor(f.color);
    doc.rect(margin, y, 4, 4, "F");
    doc.setTextColor(35,42,46);
    doc.text(`${f.date}: ${f.label}`, margin+7, y+3.5);
    y += 5.5;
  });
  y += 3;

  // -- Coach Feedback Thread
  doc.setFontSize(12);
  doc.setTextColor(35,42,46);
  doc.text("Coach Feedback:", margin, y);
  y += 6;
  doc.setFontSize(11);
    athlete.feedback.forEach((fb, i) => {
    if (fb.resolved) {
      doc.setTextColor(53,179,120); // green
    } else {
      doc.setTextColor(243,86,80); // red
    }
    doc.text(fb.resolved ? "✓" : "•", margin, y+3.5);
    doc.setTextColor(35,42,46);
    doc.text(`${fb.date}: ${fb.text} ${fb.resolved ? "(Resolved)" : ""}`, margin+7, y+3.5);
    y += 5.5;
  });


  y += 4;
  doc.setTextColor(120,120,120);
  doc.setFontSize(9);
  doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", margin, y);

  // -- Save
  doc.save(`${athlete.name}_Progress360.pdf`);
}

  // -- Compare Mode: render if compareIdx !== null --
  if (athleteCompare) {
    return (
      <div className="ath360-main">
        <div className="ath360-compare-header">
          <FaUserFriends style={{color:"#FFD700",fontSize:22,marginRight:8}}/>
          Athlete Compare
        </div>
        <div className="ath360-compare-grid">
          {[athlete, athleteCompare].map((a, i) =>
            <div className="ath360-card" key={i}>
              <div className="ath360-header">
                <div>
                  <div className="ath360-title">{a.name} <span className="ath360-pos">{a.position}</span></div>
                  <div className="ath360-teamid">{a.team} • Age {a.age} • ID {a.id}</div>
                </div>
              </div>
              <div className="ath360-kpi-row">
                {KPI_KEYS.map((k,j)=>
                  <div className="ath360-kpi-group" key={j}>
                    <div className="ath360-kpi-label">{KPI_LABELS[k]}</div>
                    <div className="ath360-kpi-value" style={{color:kpiColor(k, a.progress[a.progress.length-1][k])}}>
                      {a.progress[a.progress.length-1][k]}
                    </div>
                  </div>
                )}
              </div>
              <div className="ath360-flag-timeline">
                <div className="ath360-timeline-label">Timeline:</div>
                <div className="ath360-timeline-track">
                  {a.flags.map((f,n) => (
                    <div className="ath360-flag-chip" style={{background:f.color}} key={n} title={f.label}>
                      {f.date}: {f.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="ath360-back-btn" onClick={()=>setCompareIdx(null)}>Back to Athlete 360</button>
      </div>
    );
  }

  // -- Main Athlete Card View --
  const { risks, opps } = aiCopilot();

  return (
    <div className="ath360-main">
      <div className="ath360-card">
        <div className="ath360-header">
          <div>
            <div className="ath360-title">{athlete.name} <span className="ath360-pos">{athlete.position}</span></div>
            <div className="ath360-teamid">{athlete.team} • Age {athlete.age} • ID {athlete.id}</div>
          </div>
          <button className="ath360-pdf-btn" onClick={exportPDF}><FaDownload/> Export PDF</button>
        </div>

        {/* KPI Trend Row & Heatmap */}
        <div className="ath360-kpi-row">
          {KPI_KEYS.map((k,i) => {
            const vals = athlete.progress.map(r=>r[k]);
            const trend = kpiTrend(vals[vals.length-2], vals[vals.length-1]);
            const badge = trend
              ? trend.dir==="up" ? <FaArrowUp className="ath360-kpi-trend-up"/>
              : trend.dir==="down" ? <FaArrowDown className="ath360-kpi-trend-down"/>
              : <FaCheckCircle className="ath360-kpi-trend-steady"/> : null;
            return (
              <div className="ath360-kpi-group" key={k}>
                <div className="ath360-kpi-label">{KPI_LABELS[k]}</div>
                <div className="ath360-kpi-value" style={{color:kpiColor(k, vals[vals.length-1])}}>
                  {vals[vals.length-1]}
                  {badge && <span className={`ath360-kpi-trend-badge ${trend.dir}`}>{badge}</span>}
                </div>
                <div className="ath360-heatmap-row">
                  {vals.map((v,ix) =>
                    <span
                      key={ix}
                      className={`ath360-heatmap-cell ${i>0?kpiHeat(v, vals[ix-1]):"ath360-heat-steady"}`}
                      title={`Month ${athlete.progress[ix].month}: ${v}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nivo Progress Lines */}
        <div className="ath360-nivo-row">
          <ResponsiveLine
            data={KPI_KEYS.slice(0,3).map(k=>({
              id: KPI_LABELS[k],
              data: athlete.progress.map((r,i)=>({x: r.month, y: r[k]}))
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
            height={135}
          />
        </div>

        {/* Status & Timeline */}
        <div className="ath360-status-row">
          <span className="ath360-status-label">Current Status:</span>
          {statusBadge(athlete.status.risk)}
          {athlete.status.injury && <span className="ath360-status-badge ath360-risk"><FaExclamationTriangle/> INJURY</span>}
        </div>
        <div className="ath360-flag-timeline">
          <div className="ath360-timeline-label">Timeline:</div>
          <div className="ath360-timeline-track">
            {athlete.flags.map((f,i) => (
              <div className="ath360-flag-chip" style={{background:f.color}} key={i} title={f.label}>
                {f.date}: {f.label}
              </div>
            ))}
            <input
              type="text"
              className="ath360-milestone-input"
              value={milestoneText}
              onChange={e=>setMilestoneText(e.target.value)}
              placeholder="Add milestone..."
              maxLength={28}
            />
            <button className="ath360-add-milestone-btn" onClick={addMilestone}><FaPlus/></button>
          </div>
        </div>

        {/* Coach Feedback Thread */}
        <div className="ath360-feedback-thread">
          <div className="ath360-feedback-title"><FaComment/> Coach Feedback</div>
          <ul>
            {feedbacks[idx].map((fb,i) =>
              <li key={i} className={fb.resolved?"ath360-fb-resolved":"ath360-fb-active"}>
                <span className="ath360-fb-date">{fb.date}</span>
                <span className="ath360-fb-text">{fb.text}</span>
                {fb.resolved
                  ? <span className="ath360-fb-badge ath360-ok">Resolved</span>
                  : <button className="ath360-fb-resolve-btn" onClick={()=>resolveFeedback(i)}>Acknowledge</button>
                }
              </li>
            )}
          </ul>
        </div>

        {/* AI Copilot */}
        <div className="ath360-copilot">
          <FaRobot style={{color:"#FFD700",marginRight:9,fontSize:22}}/>
          <span>
            <b>Status Copilot:</b>
            {risks.length === 0 && opps.length === 0 && " All stable."}
            {risks.length > 0 && <> <span style={{color:"#f35650"}}>Risks: {risks.join("; ")}</span> </>}
            {opps.length > 0 && <> <span style={{color:"#35b378"}}>Opportunities: {opps.join("; ")}</span> </>}
          </span>
        </div>
      </div>

      {/* Compare/Athlete Selector */}
      <div className="ath360-selector">
        <label>Select Athlete: </label>
        <select value={idx} onChange={e=>setIdx(Number(e.target.value))}>
          {ATHLETES.map((a,i)=><option value={i} key={a.id}>{a.name} ({a.team})</option>)}
        </select>
        <button className="ath360-compare-btn" onClick={()=>setCompareIdx(idx === 0 ? 1 : 0)}>
          <FaUserFriends/> Compare
        </button>
      </div>
      <div className="ath360-tagline">
        <span>BE REAL. BE VERO.</span>
      </div>
    </div>
  );
}
