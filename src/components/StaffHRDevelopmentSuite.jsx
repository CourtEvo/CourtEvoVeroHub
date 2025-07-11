import React, { useState } from "react";
import { FaUserTie, FaUser, FaClipboardList, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaCrown, 
    FaRobot, FaDownload, FaFileCsv, FaChartPie, FaLayerGroup, FaBuilding, FaTag, FaPlus, FaHistory, FaFlag, 
    FaAward, FaFileAlt, FaArrowUp, FaArrowDown, FaStar } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import jsPDF from "jspdf";
import "./StaffHRDevelopmentSuite.css";

// --- Demo Data ---
const INIT_STAFF = [
  {
    id: "S001", name: "Ana Kovač", role: "Head Coach", dept: "Coaching", contract: "2024-09-01", compliance: "full", risk: "low",
    eval: { last: "2023-12-15", next: "2024-08-15", doc: "Evaluation2023.pdf" },
    tags: ["U18", "Senior"], status: "Active",
    timeline: [
      { date: "2023-07-01", type: "promotion", label: "Promoted to Head Coach", color: "#FFD700" },
      { date: "2023-12-16", type: "award", label: "League Coach of Year", color: "#35b378" }
    ],
    credentials: [
      { type: "FIBA License", valid: "2027-12-31" },
      { type: "Background Check", valid: "2025-09-01" }
    ],
    history: [
      { role: "Assistant Coach", from: "2021-07-01", to: "2023-06-30" }
    ],
    notes: [
      { date: "2023-12-15", by: "Board", text: "Outstanding leadership." }
    ]
  },
  {
    id: "S002", name: "Marko Bilić", role: "Volunteer Physio", dept: "Medical", contract: "2024-07-10", compliance: "partial", risk: "medium",
    eval: { last: "2023-10-10", next: "2024-07-10", doc: "" },
    tags: ["Medical"], status: "Active",
    timeline: [
      { date: "2023-09-12", type: "warning", label: "Late to session", color: "#f35650" }
    ],
    credentials: [
      { type: "Medical Degree", valid: "2025-12-31" }
    ],
    history: [],
    notes: [
      { date: "2023-09-15", by: "Board", text: "Great work, but needs punctuality." }
    ]
  },
  {
    id: "S003", name: "Jasna Vuković", role: "Academy Admin", dept: "Admin", contract: "2024-08-30", compliance: "at risk", risk: "high",
    eval: { last: "2023-10-01", next: "2024-07-30", doc: "" },
    tags: ["Academy"], status: "Active",
    timeline: [
      { date: "2024-05-10", type: "compliance", label: "Background Check expired", color: "#f35650" }
    ],
    credentials: [
      { type: "Background Check", valid: "2024-05-01" }
    ],
    history: [
      { role: "Volunteer Admin", from: "2022-01-01", to: "2023-06-30" }
    ],
    notes: [
      { date: "2024-05-10", by: "HR", text: "Compliance at risk—renew immediately." }
    ]
  }
];
const DEPTS = ["Coaching","Medical","Admin"];
const ROLES = ["Head Coach","Assistant Coach","Volunteer Physio","Academy Admin"];
const RISK_COLORS = { low: "#35b378", medium: "#FFD700", high: "#f35650" };
const COMPL_COLORS = { "full": "#35b378", "partial": "#FFD700", "at risk": "#f35650" };
const TIMELINE_ICONS = { promotion: <FaArrowUp/>, award: <FaAward/>, warning: <FaFlag/>, compliance: <FaExclamationTriangle/> };

function contractStatus(date) {
  const now = new Date();
  const exp = new Date(date);
  const diff = Math.round((exp-now)/(1000*60*60*24));
  if (diff<0) return "expired";
  if (diff<30) return "expiring";
  return "ok";
}
// --- PDF Export ---
function exportPDF(staff, mode="grid") {
  const doc = new jsPDF("p", "mm", "a4");
  (Array.isArray(staff)?staff:[staff]).forEach((s, i) => {
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Staff/Volunteer Card", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 12;
    doc.setTextColor(35,42,46);
    doc.setFontSize(13);
    doc.text(`${s.name} (${s.role}, ${s.dept})`, 12, y); y+=8;
    doc.text(`Status: ${s.status} | Contract: ${s.contract}`, 12, y); y+=8;
    doc.text(`Risk: ${s.risk} | Compliance: ${s.compliance}`, 12, y); y+=8;
    if (s.tags && s.tags.length) { doc.setFontSize(10); doc.text(`Tags: ${s.tags.join(", ")}`, 12, y); y+=6;}
    if (s.credentials && s.credentials.length) {
      doc.setFontSize(11); doc.text("Credentials:", 12, y); y+=6;
      s.credentials.forEach(c=>{ doc.text(`${c.type}: valid till ${c.valid}`, 14, y); y+=5; });
    }
    if (s.timeline && s.timeline.length) {
      doc.setFontSize(11); doc.text("Timeline/Events:", 12, y); y+=6;
      s.timeline.forEach(e=>{ doc.text(`${e.date}: ${e.label}`, 14, y); y+=5; });
    }
    y+=2; doc.setFontSize(12); doc.text("Notes:", 12, y); y+=6;
    (s.notes||[]).forEach(n=>{ doc.setFontSize(10); doc.text(`${n.date} (${n.by}): ${n.text}`, 12, y); y+=5; });
    y+=4;
    doc.setTextColor(120,120,120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    if (mode==="grid" && i<staff.length-1) doc.addPage();
  });
  doc.save(mode==="grid" ? "Staff_Grid.pdf" : `Staff_${staff.name}_Card.pdf`);
}
// --- CSV Export ---
function exportCSV(staff) {
  const rows = [
    ["ID","Name","Role","Dept","Contract","Compliance","Risk","Tags","Credentials","Timeline","Notes"]
  ];
  (Array.isArray(staff)?staff:[staff]).forEach(s=>{
    rows.push([
      s.id, s.name, s.role, s.dept, s.contract, s.compliance, s.risk,
      (s.tags||[]).join("|"),
      (s.credentials||[]).map(c=>`${c.type}:${c.valid}`).join("|"),
      (s.timeline||[]).map(e=>`${e.date}:${e.label}`).join("|"),
      (s.notes||[]).map(n=>`${n.date}: ${n.text} (${n.by})`).join(" || ")
    ]);
  });
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "StaffGrid.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
// --- Analytics ---
function deptAnalytics(staff) {
  const counts = {};
  staff.forEach(s=>{counts[s.dept]=1+(counts[s.dept]||0);});
  return Object.keys(counts).map(dept=>({dept,count:counts[dept]}));
}
function roleAnalytics(staff) {
  const counts = {};
  staff.forEach(s=>{counts[s.role]=1+(counts[s.role]||0);});
  return Object.keys(counts).map(role=>({role,count:counts[role]}));
}
function complianceAnalytics(staff) {
  const bins = { full:0, partial:0, "at risk":0 };
  staff.forEach(s=>{bins[s.compliance]++;});
  return Object.keys(bins).map(c=>({status:c,count:bins[c]}));
}
function expiringContracts(staff) {
  let soon=0, expired=0;
  staff.forEach(s=>{
    const stat = contractStatus(s.contract);
    if (stat==="expired") expired++;
    else if (stat==="expiring") soon++;
  });
  return [{type:"Expiring (<30d)",count:soon},{type:"Expired",count:expired}];
}
// --- Stars ---
function Stars({ val }) {
  return (
    <span className="hr-stars">
      {[...Array(5)].map((_,i)=>
        <FaStar key={i} style={{color:i<val?"#FFD700":"#b7bec9"}}/>
      )}
    </span>
  );
}
// --- AI Copilot ---
function aiCopilot(staff) {
  const nonCompliant = staff.filter(s=>s.compliance!=="full");
  const atRisk = staff.filter(s=>s.risk==="high");
  let notes = [];
  if (nonCompliant.length) notes.push(`${nonCompliant.length} not fully compliant.`);
  if (atRisk.length) notes.push(`${atRisk.length} at risk, review needed.`);
  if (!notes.length) notes.push("All staff compliant.");
  return (
    <div className="hr-copilot">
      <FaRobot style={{color:"#FFD700",marginRight:7}}/>
      {notes.join(" | ")}
    </div>
  );
}

export default function StaffHRDevelopmentSuite() {
  const [staff, setStaff] = useState(INIT_STAFF);
  const [drill, setDrill] = useState(null);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [complianceFilter, setComplianceFilter] = useState("");

  // Filtering
  let filtered = staff;
  if (filter) filtered = filtered.filter(s=>s.role===filter||s.dept===filter);
  if (riskFilter) filtered = filtered.filter(s=>s.risk===riskFilter);
  if (complianceFilter) filtered = filtered.filter(s=>s.compliance===complianceFilter);

  return (
    <div className="hr-main">
      <div className="hr-header">
        <h2><FaClipboardList style={{color:"#FFD700",marginRight:13}}/>Staff & Volunteer HR Suite</h2>
        <div>
          <button className="hr-pdf-btn" onClick={()=>exportPDF(filtered)}><FaDownload/> Export PDF</button>
          <button className="hr-csv-btn" onClick={()=>exportCSV(filtered)}><FaFileCsv/> Export CSV</button>
        </div>
      </div>

      {/* --- Analytics --- */}
      <div className="hr-analytics-row">
        <div className="hr-analytics-card">
          <div className="hr-analytics-title"><FaBuilding/> By Dept</div>
          <div style={{height:110, width:220}}>
            <ResponsiveBar
              data={deptAnalytics(staff)}
              keys={["count"]}
              indexBy="dept"
              margin={{top:16, right:15, bottom:32, left:36}}
              padding={0.33}
              colors={["#FFD700"]}
              axisBottom={{
                tickSize: 6,
                legend: "Dept",
                legendOffset: 16,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Staff",
                legendOffset: -20,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={80}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="hr-analytics-card">
          <div className="hr-analytics-title"><FaUserTie/> By Role</div>
          <div style={{height:110, width:220}}>
            <ResponsiveBar
              data={roleAnalytics(staff)}
              keys={["count"]}
              indexBy="role"
              margin={{top:16, right:15, bottom:32, left:36}}
              padding={0.33}
              colors={["#FFD700"]}
              axisBottom={{
                tickSize: 6,
                legend: "Role",
                legendOffset: 16,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Staff",
                legendOffset: -20,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={80}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="hr-analytics-card">
          <div className="hr-analytics-title"><FaClipboardList/> Compliance</div>
          <div style={{height:110, width:220}}>
            <ResponsiveBar
              data={complianceAnalytics(staff)}
              keys={["count"]}
              indexBy="status"
              margin={{top:16, right:15, bottom:32, left:36}}
              padding={0.33}
              colors={["#35b378","#FFD700","#f35650"]}
              axisBottom={{
                tickSize: 6,
                legend: "Status",
                legendOffset: 16,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Staff",
                legendOffset: -20,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={80}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="hr-analytics-card">
          <div className="hr-analytics-title"><FaCalendarAlt/> Expiring Contracts</div>
          <div style={{height:110, width:220}}>
            <ResponsiveBar
              data={expiringContracts(staff)}
              keys={["count"]}
              indexBy="type"
              margin={{top:16, right:15, bottom:32, left:36}}
              padding={0.33}
              colors={["#FFD700","#f35650"]}
              axisBottom={{
                tickSize: 6,
                legend: "Contract",
                legendOffset: 16,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Staff",
                legendOffset: -20,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={80}
              isInteractive={false}
            />
          </div>
        </div>
        {aiCopilot(staff)}
      </div>

      {/* Filters */}
      <div className="hr-filter-row">
        <label>Filter: </label>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">All</option>
          {DEPTS.map(d=><option value={d} key={d}>{d}</option>)}
          {ROLES.map(r=><option value={r} key={r}>{r}</option>)}
        </select>
        <label>Risk: </label>
        <select value={riskFilter} onChange={e=>setRiskFilter(e.target.value)}>
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label>Compliance: </label>
        <select value={complianceFilter} onChange={e=>setComplianceFilter(e.target.value)}>
          <option value="">All</option>
          <option value="full">Full</option>
          <option value="partial">Partial</option>
          <option value="at risk">At Risk</option>
        </select>
      </div>

      {/* --- Staff/Volunteer Grid --- */}
      <div className="hr-grid">
        <div className="hr-grid-row hr-grid-header">
          <div>Name</div>
          <div>Role</div>
          <div>Dept</div>
          <div>Contract</div>
          <div>Compliance</div>
          <div>Risk</div>
          <div>Status</div>
          <div>Tags</div>
          <div>Actions</div>
        </div>
        {filtered.length === 0 && (
          <div className="hr-grid-row hr-empty">
            <FaExclamationTriangle /> No staff/volunteers found.
          </div>
        )}
        {filtered.map((s,idx) => (
          <div className="hr-grid-row" key={s.id}>
            <div>
              <span className="hr-user-icon"><FaUserTie/></span>
              {s.name}
            </div>
            <div>{s.role}</div>
            <div>{s.dept}</div>
            <div>
              <span className={`hr-contract-badge hr-contract-${contractStatus(s.contract)}`}>
                <FaCalendarAlt/> {s.contract}
              </span>
            </div>
            <div>
              <span className="hr-compl-badge" style={{background:COMPL_COLORS[s.compliance]+"33",color:COMPL_COLORS[s.compliance]}}>
                {s.compliance.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="hr-risk-badge" style={{background:RISK_COLORS[s.risk]+"33",color:RISK_COLORS[s.risk]}}>
                {s.risk.toUpperCase()}
              </span>
            </div>
            <div>{s.status}</div>
            <div>{(s.tags||[]).map((t,i)=><span className="hr-tag">{t}</span>)}</div>
            <div>
              <button className="hr-detail-btn" onClick={()=>setDrill({s,idx})}><FaClipboardList/> Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Drilldown Modal --- */}
      {drill && (
        <div className="hr-modal-overlay">
          <div className="hr-modal">
            <div className="hr-modal-header">
              <FaUserTie/> {drill.s.name} ({drill.s.role}, {drill.s.dept})
              <button className="hr-modal-close" onClick={()=>setDrill(null)}>×</button>
            </div>
            <div className="hr-modal-status-row">
              <span className="hr-compl-badge" style={{background:COMPL_COLORS[drill.s.compliance]+"33",color:COMPL_COLORS[drill.s.compliance]}}>
                {drill.s.compliance.toUpperCase()}
              </span>
              <span className="hr-risk-badge" style={{background:RISK_COLORS[drill.s.risk]+"33",color:RISK_COLORS[drill.s.risk]}}>
                {drill.s.risk.toUpperCase()}
              </span>
              <span className={`hr-contract-badge hr-contract-${contractStatus(drill.s.contract)}`}>
                <FaCalendarAlt/> {drill.s.contract}
              </span>
            </div>
            {/* Timeline */}
            <div className="hr-modal-title"><FaHistory/> Timeline/Events</div>
            <div className="hr-timeline">
              {(drill.s.timeline||[]).map((e,i)=>
                <div className="hr-timeline-row" key={i} style={{borderLeft:`6px solid ${e.color}`}}>
                  <span className="hr-timeline-date">{e.date}</span>
                  <span className="hr-timeline-ic">{TIMELINE_ICONS[e.type]||<FaAward/>}</span>
                  <span className="hr-timeline-label">{e.label}</span>
                </div>
              )}
              {(!drill.s.timeline||!drill.s.timeline.length) && (
                <div className="hr-timeline-row" style={{borderLeft:"6px solid #b7bec9"}}>
                  <span className="hr-timeline-label" style={{color:"#b7bec9"}}>No events yet.</span>
                </div>
              )}
            </div>
            {/* Credentials */}
            <div className="hr-modal-title"><FaAward/> Credentials</div>
            <ul className="hr-cred-list">
              {(drill.s.credentials||[]).map((c,i)=>
                <li key={i}><FaTag/> {c.type}: valid till {c.valid}</li>
              )}
            </ul>
            {/* History */}
            <div className="hr-modal-title"><FaHistory/> Role History</div>
            <ul className="hr-hist-list">
              {(drill.s.history||[]).map((h,i)=>
                <li key={i}><FaArrowUp/> {h.role} ({h.from} - {h.to})</li>
              )}
              {(!drill.s.history||!drill.s.history.length) && (
                <li style={{color:"#b7bec9"}}>No previous roles.</li>
              )}
            </ul>
            {/* Eval */}
            <div className="hr-modal-title"><FaClipboardList/> Evaluation</div>
            <div className="hr-eval-row">
              <span><FaCalendarAlt/> Last: {drill.s.eval.last}</span>
              <span><FaCalendarAlt/> Next: {drill.s.eval.next}</span>
              {drill.s.eval.doc && (
                <span className="hr-eval-doc"><FaFileAlt/> {drill.s.eval.doc}</span>
              )}
            </div>
            {/* Notes */}
            <div className="hr-modal-title"><FaClipboardList/> Board/HR Notes</div>
            <div className="hr-modal-notes-list">
              {(drill.s.notes||[]).map((n,i)=>
                <div className="hr-modal-note" key={i}>
                  <span className="hr-modal-note-date">{n.date}</span>
                  <span className="hr-modal-note-user">{n.by}</span>
                  <span className="hr-modal-note-text">{n.text}</span>
                </div>
              )}
            </div>
            <div style={{marginTop:8, display:'flex', alignItems:'center', gap:10}}>
              <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add note..."/>
              <button className="hr-addnote-btn" onClick={()=>{
                if (!note.trim()) return;
                setStaff(list=>{
                  const next = [...list];
                  next[drill.idx].notes.push({
                    date: new Date().toISOString().slice(0,10),
                    by: "Board/HR",
                    text: note
                  });
                  return next;
                });
                setNote("");
              }}><FaPlus/> Add</button>
            </div>
            {/* AI Copilot */}
            <div className="hr-modal-copilot">
              <FaRobot style={{color:"#FFD700",marginRight:8}}/>
              {drill.s.compliance!=="full"
                ? "Compliance action needed."
                : drill.s.risk==="high"
                  ? "At Risk—review, board discussion."
                  : "Staff stable."}
            </div>
            <div className="hr-tagline hr-tagline-sticky">BE REAL. BE VERO.</div>
          </div>
        </div>
      )}
      <div className="hr-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
