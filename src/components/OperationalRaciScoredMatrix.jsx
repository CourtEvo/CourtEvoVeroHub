import React, { useState } from "react";
import {
  FaUserTie, FaCheckCircle, FaExclamationTriangle, FaBolt, FaDownload, FaChartBar,
  FaHistory, FaUndo, FaComment, FaFlag, FaArrowUp, FaArrowDown, FaSitemap, FaUserFriends, FaRobot, FaPaperPlane
} from "react-icons/fa";
import "./OperationalRaciScoredMatrix.css";

const orgAreas = [
  "Youth Development Pathway", "Financial Management", "Coach Dev & Integration", "Marketing & Engagement"
];
const orgRoles = [
  "Technical Director", "Youth Coord.", "Coaches",
  "Finance Dir", "Treasurer", "Sponsor Mgr",
  "Coach Dev Lead", "Head Coach", "Mentors",
  "Marketing Mgr", "Community Coord", "Staff"
];
const initialRows = [
  {
    area: "Youth Development Pathway",
    roles: [
      { name: "Technical Director", raci: "A/R" },
      { name: "Youth Coord.", raci: "R" },
      { name: "Coaches", raci: "C/I" }
    ],
    drift: 30,
    kpi: { label: "Talent Promoted", value: 7, change: +2 },
    driftTimeline: [
      { date: "2024-01-02", desc: "A assigned to Technical Director" },
      { date: "2024-05-09", desc: "C/I added to Coaches" }
    ]
  },
  {
    area: "Financial Management",
    roles: [
      { name: "Finance Dir", raci: "A/R" },
      { name: "Treasurer", raci: "R" },
      { name: "Sponsor Mgr", raci: "C/I" }
    ],
    drift: 120,
    kpi: { label: "Surplus", value: 12000, change: +2000 },
    driftTimeline: [
      { date: "2024-02-15", desc: "A removed from Treasurer" }
    ]
  },
  {
    area: "Coach Dev & Integration",
    roles: [
      { name: "Coach Dev Lead", raci: "A/R" },
      { name: "Head Coach", raci: "R" },
      { name: "Mentors", raci: "C/I" }
    ],
    drift: 7,
    kpi: { label: "CPD Progress", value: 88, change: -4 },
    driftTimeline: [
      { date: "2024-03-11", desc: "R assigned to Head Coach" },
      { date: "2024-05-25", desc: "C/I removed from Mentors" }
    ]
  },
  {
    area: "Marketing & Engagement",
    roles: [
      { name: "Marketing Mgr", raci: "A/R" },
      { name: "Community Coord", raci: "R" },
      { name: "Staff", raci: "C/I" }
    ],
    drift: 300,
    kpi: { label: "Engagement", value: 49, change: -11 },
    driftTimeline: [
      { date: "2023-08-10", desc: "A assigned to Marketing Mgr" }
    ]
  }
];

// --- Helper Functions ---
function raciScore(roles) {
  let score = 0, aCount = 0, rCount = 0;
  roles.forEach(r => {
    if (r.raci === "A/R") { score += 3; aCount++; rCount++; }
    else if (r.raci === "A") { score += 2; aCount++; }
    else if (r.raci === "R") { score += 1; rCount++; }
    else if (r.raci === "C/I") { score += 0.5; }
  });
  if (aCount === 0) score -= 2;
  if (aCount > 1) score -= 2;
  if (rCount === 0) score -= 2;
  return score;
}
function scoreColor(score) {
  if (score >= 4.5) return "#35b378";
  if (score >= 3.5) return "#FFD700";
  if (score >= 2) return "#f2a900";
  return "#f35650";
}
function driftColor(days) {
  if (days > 180) return "#f35650";
  if (days > 60) return "#f2a900";
  return "#35b378";
}
function heatClass(score) {
  if (score >= 4.5) return "raci-heat-optimal";
  if (score >= 3.5) return "raci-heat-warning";
  return "raci-heat-critical";
}
function detectConflicts(roles) {
  const aCount = roles.filter(r => r.raci.includes("A")).length;
  return aCount === 0 || aCount > 1;
}
function raciAnalytics(rows) {
  let counts = { A: 0, R: 0, C: 0, I: 0 };
  rows.forEach(row => row.roles.forEach(r => {
    if (r.raci === "A/R") { counts.A++; counts.R++; }
    else if (r.raci === "A") counts.A++;
    else if (r.raci === "R") counts.R++;
    else if (r.raci === "C/I") { counts.C++; counts.I++; }
  }));
  return counts;
}
function getNowDate() {
  const d = new Date();
  return d.toISOString().slice(0,10) + " " + d.toTimeString().slice(0,5);
}

// --- Main Component ---
export default function OperationalRACICommandCenter() {
  const [rows, setRows] = useState(initialRows);
  const [activeRow, setActiveRow] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [log, setLog] = useState([]);
  const [comment, setComment] = useState("");
  const [boardChat, setBoardChat] = useState([
    { author: "President", text: "Review needed on Marketing structure", time: "2024-06-01 12:30" }
  ]);
  const [chatMsg, setChatMsg] = useState("");
  const [notiPanel, setNotiPanel] = useState(true);

  // Org Health
  const avgScore = rows.reduce((acc, r) => acc + raciScore(r.roles), 0) / rows.length;
  const conflicts = rows.filter(r => detectConflicts(r.roles)).map(r => r.area);
  const analytics = raciAnalytics(rows);

  // Role Overload
  const allA = {};
  rows.forEach(r =>
    r.roles.forEach(role => {
      if (role.raci.includes("A")) {
        allA[role.name] = (allA[role.name] || 0) + 1;
      }
    })
  );
  const overloads = Object.entries(allA).filter(([k,v])=>v>2);

  // Handler: Change RACI role
  function handleChangeRACI(rowIdx, roleIdx) {
    setRows(rs =>
      rs.map((r, i) => {
        if (i !== rowIdx) return r;
        const newRoles = [...r.roles];
        const opts = ["A/R", "A", "R", "C/I"];
        const idx = opts.indexOf(newRoles[roleIdx].raci);
        newRoles[roleIdx] = { ...newRoles[roleIdx], raci: opts[(idx + 1) % opts.length] };
        // Drift resets on change, driftTimeline logs
        return {
          ...r,
          roles: newRoles,
          drift: 0,
          driftTimeline: [
            ...(r.driftTimeline || []),
            { date: getNowDate(), desc: `RACI change: ${newRoles[roleIdx].name} now ${opts[(idx + 1) % opts.length]}` }
          ]
        };
      })
    );
    setLog(l => [
      ...l,
      { time: getNowDate(), action: `Changed RACI for ${rows[rowIdx].area}/${rows[rowIdx].roles[roleIdx].name}`, comment: comment || undefined }
    ]);
    setComment("");
  }

  // Drift timer (simulate time passing)
  React.useEffect(()=>{
    const t = setInterval(()=>{
      setRows(rs=>rs.map(r=>({...r, drift: r.drift+1})));
    },180000);
    return ()=>clearInterval(t);
  },[]);

  // Scenario Sandbox: AI auto-fix all conflicts/overloads
  function aiAutoFix() {
    setRows(rs=>
      rs.map(row=>{
        let newRoles=[...row.roles];
        // Auto-fix: If >1 A, leave 1 A, others to R
        let aIdxs=newRoles.map((r,i)=>r.raci.includes("A")?i:-1).filter(i=>i!==-1);
        if(aIdxs.length>1){
          aIdxs.slice(1).forEach(i=>newRoles[i]={...newRoles[i],raci:"R"});
        }
        // If no A, make first role A
        if(aIdxs.length===0&&newRoles.length>0)newRoles[0]={...newRoles[0],raci:"A"};
        // If no R, make second role R if exists
        if(!newRoles.some(r=>r.raci.includes("R"))&&newRoles.length>1)newRoles[1]={...newRoles[1],raci:"R"};
        return {...row,roles:newRoles,drift:0,driftTimeline:[...(row.driftTimeline||[]),{date:getNowDate(),desc:"AI Auto-fix run"}]};
      })
    );
    setLog(l=>[...l,{time:getNowDate(),action:"AI Auto-fix run"}]);
  }

  // Board Chat
  function sendChat() {
    if(chatMsg.trim().length){
      setBoardChat(chat=>[...chat,{author:"You",text:chatMsg,time:getNowDate()}]);
      setChatMsg("");
    }
  }

  // Org Network Map (for now, simple SVG showing areas and role links)
  function OrgNetworkMap() {
    const width = 520, height = 240;
    const areaY = [50, 100, 150, 200];
    return (
      <svg width={width} height={height} style={{ background: "#283E51", borderRadius: 15, marginBottom: 15, boxShadow: "0 2px 19px #283E5133" }}>
        {rows.map((row, i) =>
          <g key={row.area}>
            <rect x={35} y={areaY[i]-14} width={150} height={28} rx={11}
              fill={heatClass(raciScore(row.roles)) === "raci-heat-optimal" ? "#263d2f" : heatClass(raciScore(row.roles)) === "raci-heat-warning" ? "#373517" : "#452723"}
              stroke="#FFD700" strokeWidth="1.5"/>
            <text x={42} y={areaY[i]+5} fill="#FFD700" fontWeight="700" fontSize="1.04rem">{row.area}</text>
            {row.roles.map((r,j)=>
              <g key={j}>
                <circle cx={270+j*70} cy={areaY[i]} r={14}
                  fill={r.raci==="A/R"?"#FFD700":r.raci==="A"?"#f2a900":r.raci==="R"?"#35b378":"#b7bec9"}
                  stroke="#2b3238" strokeWidth="2"
                  onClick={()=>setActiveRow(i)}
                  style={{cursor:"pointer"}}
                />
                <text x={270+j*70} y={areaY[i]+5} fill="#232a2e" fontWeight="800" fontSize="0.99rem" textAnchor="middle">
                  {r.name.split(" ").map(s=>s[0]).join("")}
                </text>
                {/* Draw lines from area to each role */}
                <line x1={185} y1={areaY[i]} x2={270+j*70-14} y2={areaY[i]} stroke="#FFD700" strokeDasharray="3 2" strokeWidth="1"/>
              </g>
            )}
          </g>
        )}
      </svg>
    );
  }

  // Role Overlap Matrix
  const roleMap = {};
  rows.forEach(row => row.roles.forEach(r => {
    if (!roleMap[r.name]) roleMap[r.name] = [];
    roleMap[r.name].push(row.area);
  }));

  return (
    <div className="raci-main">
      <div className="raci-header">
        <h2><FaSitemap style={{marginRight:7}}/> Operational RACI Command Center</h2>
        <div className="raci-org-health">
          <OrgHealthDial value={avgScore} />
          <RaciDonut counts={analytics} />
          <div className="raci-health-label">
            Org Health: <b style={{ color: scoreColor(avgScore) }}>{avgScore.toFixed(2)}</b>
          </div>
        </div>
        <button className="raci-export-btn" onClick={()=>setShowExport(true)}>
          <FaDownload style={{ marginRight: 6 }} /> Export Board PDF
        </button>
      </div>

      {/* Org Network Map */}
      <OrgNetworkMap />

      {/* Scenario Sandbox */}
      <div className="raci-sim-sandbox">
        <span>AI Scenario Sandbox:</span>
        <button onClick={aiAutoFix}><FaRobot style={{marginRight:5}}/> Auto-fix All Issues</button>
        <button onClick={()=>setRows(initialRows)}><FaUndo/> Reset All</button>
      </div>

      {/* Boardroom Notification Center */}
      {notiPanel && (
        <div className="raci-noti-panel">
          <div>
            <b>Notifications</b>
            <button className="raci-noti-hide" onClick={()=>setNotiPanel(false)}>×</button>
          </div>
          {conflicts.length>0 && (
            <div className="raci-noti-row"><FaFlag/> <b>{conflicts.length}</b> Conflicts: {conflicts.join(", ")}</div>
          )}
          {overloads.length>0 && (
            <div className="raci-noti-row"><FaUserFriends/> Role overload: {overloads.map(([k])=>k).join(", ")}</div>
          )}
          {rows.filter(r=>r.drift>90).length>0 && (
            <div className="raci-noti-row"><FaHistory/> Drift alert: {rows.filter(r=>r.drift>90).map(r=>r.area).join(", ")}</div>
          )}
          <div className="raci-noti-row"><FaBolt/> AI: {avgScore < 3 ? "Review structure: Low efficiency." : "All key roles covered."}</div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="raci-table">
        <div className="raci-thead">
          <div>Operational Area</div>
          <div>Key Roles</div>
          <div>Score</div>
          <div>Status</div>
          <div>KPI</div>
          <div>AI Suggestion</div>
        </div>
        {rows.map((row, i) => {
          const score = raciScore(row.roles);
          return (
            <div
              className={`raci-trow ${heatClass(score)}`}
              key={row.area}
              onClick={() => setActiveRow(i)}
              title="Click for area details"
            >
              <div className="raci-td raci-area">
                {row.area}
                <span className="raci-drift" style={{color:driftColor(row.drift)}}>
                  <FaHistory style={{marginRight:2}}/> {row.drift}d
                </span>
                {/* Drift timeline dots */}
                <span className="raci-drift-ticks">
                  {(row.driftTimeline||[]).map((ev,idx)=>(
                    <span key={idx} className="raci-drift-dot" title={`${ev.date}: ${ev.desc}`}></span>
                  ))}
                </span>
              </div>
              <div className="raci-td">
                <ul className="raci-rolelist">
                  {row.roles.map((r, j) => (
                    <li
                      key={j}
                      className={`raci-role ${allA[r.name]>2?"raci-overload":""}`}
                      onClick={e => { e.stopPropagation(); handleChangeRACI(i, j); }}
                      title="Click to cycle RACI"
                    >
                      <FaUserTie style={{ color: "#FFD700", marginRight: 5 }} />
                      {r.name}
                      <span className="raci-raci">{r.raci}</span>
                      {allA[r.name]>2 && <span className="raci-fatigue"><FaExclamationTriangle/></span>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="raci-td">
                <span className="raci-score" style={{ color: scoreColor(score) }}>
                  {score.toFixed(2)}
                </span>
              </div>
              <div className="raci-td">
                {detectConflicts(row.roles) ? (
                  <span className="raci-alert"><FaExclamationTriangle style={{ color: "#FFD700" }} /> Conflict</span>
                ) : score < 3 ? (
                  <span style={{ color: "#f35650" }}>Risk</span>
                ) : (
                  <span style={{ color: "#35b378" }}>OK</span>
                )}
              </div>
              <div className="raci-td raci-kpi">
                <KPIBox kpi={row.kpi}/>
              </div>
              <div className="raci-td raci-ai">
                <FaBolt style={{ color: "#f2a900", marginRight: 4 }} />
                {detectConflicts(row.roles)
                  ? "Assign one clear 'A'."
                  : score < 3
                  ? "Rebalance roles to boost efficiency."
                  : allA[row.roles.find(r=>r.raci.includes("A"))?.name]>2
                  ? "Overload: redistribute A."
                  : "Structure optimal."}
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap/Status Bar */}
      <div className="raci-statusbar">
        {rows.map((row, i) => (
          <span key={i} className={`raci-statusblock ${heatClass(raciScore(row.roles))}`}></span>
        ))}
      </div>

      {/* Role Overlap Matrix */}
      <div className="raci-role-coverage">
        <h4><FaUserFriends style={{marginRight:7}}/>Role Coverage Matrix</h4>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Areas Covered</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(roleMap).map(([role, areas],i)=>
              <tr key={i}>
                <td>{role}</td>
                <td>{areas.join(", ")}</td>
                <td>
                  {areas.length===1?<span style={{color:"#35b378"}}>OK</span>:
                    areas.length===2?<span style={{color:"#f2a900"}}>Double</span>:
                      <span style={{color:"#f35650",fontWeight:800}}>Overloaded</span>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Boardroom Chat Thread */}
      <div className="raci-chat-thread">
        <h4><FaComment style={{marginRight:7}}/>Board Chat/Comments</h4>
        <ul>
          {boardChat.map((c,i)=>(
            <li key={i}><b>{c.author}:</b> {c.text} <span className="raci-chat-time">{c.time}</span></li>
          ))}
        </ul>
        <div className="raci-chatbox">
          <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} placeholder="Add comment to board..." />
          <button onClick={sendChat}><FaPaperPlane/></button>
        </div>
      </div>

      {/* Approval Log */}
      <div className="raci-approval-log">
        <h4><FaHistory style={{marginRight:5}}/>Board Approval Log</h4>
        <ul>
          {log.map((l,i)=>(
            <li key={i}>
              <span className="raci-log-time">{l.time}</span>
              <span className="raci-log-action">{l.action}</span>
              {l.comment&&<span className="raci-log-comment"><FaComment style={{marginRight:3}}/>{l.comment}</span>}
            </li>
          ))}
        </ul>
        <div className="raci-log-commentbox">
          <input
            value={comment}
            onChange={e=>setComment(e.target.value)}
            placeholder="Add boardroom comment (optional)"
          />
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="raci-export-modal">
          <div className="raci-export-box">
            <button className="raci-export-close" onClick={()=>setShowExport(false)}>×</button>
            <h3>PDF Board Pack Export (Preview)</h3>
            <div style={{ color: "#FFD700", fontWeight: 700 }}>Summary: {conflicts.length} Conflicts, {overloads.length} Overloads, Org Health {avgScore.toFixed(2)}.</div>
            <div style={{ marginTop: 13, color: "#fff" }}>
              <div>Risks: <b>{conflicts.concat(overloads.map(([k,v])=>k)).join(", ")||"None"}</b></div>
              <div>Action Items: AI suggests {avgScore < 3 ? "Restructure and review coverage" : "Monitor for overload only"}.</div>
              <div style={{ marginTop: 13, fontSize: 15, color: "#35b378" }}>CourtEvo Vero branding, board signature and notes ready for export/print.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SVG Dials/KPIs
function OrgHealthDial({ value }) {
  const min = 0, max = 7;
  const angle = 225 + 270 * ((value - min) / (max - min));
  let color = "#35b378";
  if (value < 3) color = "#f2a900";
  if (value < 2) color = "#f35650";
  return (
    <svg width="75" height="75" style={{ marginRight: 14 }}>
      <circle cx="37.5" cy="37.5" r="28" stroke="#283E51" strokeWidth="12" fill="none"/>
      <path
        d={`M37.5,37.5 L37.5,9 A28,28 0 ${angle > 360 ? 1 : 0} 1 ${37.5 + 28 * Math.cos((angle-90)*Math.PI/180)},${37.5 + 28 * Math.sin((angle-90)*Math.PI/180)}`}
        stroke={color}
        strokeWidth="8"
        fill="none"
      />
      <circle cx="37.5" cy="37.5" r="17" fill="#22272b"/>
      <text x="50%" y="55%" textAnchor="middle" fontSize="17" fill={color} fontWeight="700" dy="0.3em">
        {value.toFixed(1)}
      </text>
    </svg>
  );
}
function RaciDonut({ counts }) {
  const total = counts.A + counts.R + counts.C + counts.I;
  const percent = k => (counts[k] / (total || 1)) * 100;
  const angles = [
    { k: 'A', color: '#FFD700', start: 0, end: percent('A') * 3.6 },
    { k: 'R', color: '#35b378', start: percent('A') * 3.6, end: (percent('A') + percent('R')) * 3.6 },
    { k: 'C', color: '#f2a900', start: (percent('A') + percent('R')) * 3.6, end: (percent('A') + percent('R') + percent('C')) * 3.6 },
    { k: 'I', color: '#b7bec9', start: (percent('A') + percent('R') + percent('C')) * 3.6, end: 360 }
  ];
  function arc(start, end) {
    const r = 29, cx = 37.5, cy = 37.5;
    const x1 = cx + r * Math.cos((start - 90) * Math.PI / 180);
    const y1 = cy + r * Math.sin((start - 90) * Math.PI / 180);
    const x2 = cx + r * Math.cos((end - 90) * Math.PI / 180);
    const y2 = cy + r * Math.sin((end - 90) * Math.PI / 180);
    const big = end - start > 180 ? 1 : 0;
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${big} 1 ${x2},${y2} Z`;
  }
  return (
    <svg width="75" height="75">
      {angles.map((seg, i) =>
        <path key={i} d={arc(seg.start, seg.end)} fill={seg.color} fillOpacity="0.77" stroke="#22272b" strokeWidth="2"/>
      )}
      <circle cx="37.5" cy="37.5" r="16" fill="#22272b"/>
      <text x="50%" y="53%" textAnchor="middle" fontSize="13" fill="#FFD700" fontWeight="600" dy="0.3em">A/R/C/I</text>
    </svg>
  );
}
function KPIBox({kpi}) {
  const isFinance = kpi.label.toLowerCase().includes("surplus")||kpi.label.toLowerCase().includes("deficit");
  return (
    <div className="raci-kpi-box" style={{color:isFinance?(kpi.value>=0?"#35b378":"#f35650"):"#FFD700"}}>
      <span>{kpi.label}:</span>
      <span style={{marginLeft:5,fontWeight:800}}>
        {typeof kpi.value==="number"? (isFinance?"€":"") + kpi.value : kpi.value}
      </span>
      {kpi.change && (
        <span className="raci-kpi-change" style={{marginLeft:5,color:kpi.change>0?"#35b378":"#f35650"}}>
          {kpi.change>0?<FaArrowUp/>:<FaArrowDown/>} {Math.abs(kpi.change)}
        </span>
      )}
    </div>
  );
}
