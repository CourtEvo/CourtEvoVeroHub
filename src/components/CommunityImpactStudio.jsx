import React, { useState } from "react";
import { FaGlobe, FaStar, FaAward, FaHandshake, FaChartBar, FaCalendarAlt, FaUserTie,
     FaBullhorn, FaCheckCircle, FaDownload, FaFileCsv, FaFlag, FaUsers, FaPlus,
      FaRobot, FaClipboardList, FaComments } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import jsPDF from "jspdf";
import "./CommunityImpactStudio.css";

// --- Demo Data ---
const INIT_IMPACTS = [
  {
    id: "I001", title: "Basketball for All: Youth Inclusion Day", type: "Inclusion", date: "2024-05-12",
    lead: "Ana Kovač", partners: ["City Youth Dept"], impact: 260, impactArea: "Youth", status: "completed", tags: ["inclusion","youth"],
    timeline: [
      { date: "2024-04-21", label: "Planned", color: "#FFD700" },
      { date: "2024-05-12", label: "Event executed", color: "#35b378" }
    ],
    notes: [
      { date: "2024-05-13", by: "Board", text: "Reached underserved neighborhoods. 40% first-timers." }
    ],
    highlight: true
  },
  {
    id: "I002", title: "Community Health Screening Drive", type: "Health", date: "2024-06-04",
    lead: "Marko Bilić", partners: ["General Hospital", "City Hall"], impact: 120, impactArea: "Health", status: "active", tags: ["health","csr"],
    timeline: [
      { date: "2024-05-19", label: "Launched", color: "#FFD700" },
      { date: "2024-06-04", label: "Ongoing", color: "#1de682" }
    ],
    notes: [
      { date: "2024-06-06", by: "Medical Lead", text: "High turnout for screenings. Media covered." }
    ]
  },
  {
    id: "I003", title: "Green Court Initiative", type: "Sustainability", date: "2024-04-10",
    lead: "Jasna Vuković", partners: ["EcoFuture", "Local School"], impact: 70, impactArea: "Sustainability", status: "completed", tags: ["eco","youth","media"],
    timeline: [
      { date: "2024-03-19", label: "Kickoff", color: "#FFD700" },
      { date: "2024-04-10", label: "50+ trees planted", color: "#1de682" }
    ],
    notes: [
      { date: "2024-04-12", by: "Media", text: "Picked up by 2 news outlets." }
    ],
    highlight: false
  }
];

const TYPES = ["Inclusion","Health","Sustainability","Youth","Charity","Media"];
const AREAS = ["Youth","Health","Sustainability"];
const STATUS = ["planned","active","completed"];
const STATUS_COLORS = { planned: "#FFD700", active: "#1de682", completed: "#35b378" };

function exportPDF(initiatives) {
  const doc = new jsPDF("p", "mm", "a4");
  (Array.isArray(initiatives)?initiatives:[initiatives]).forEach((i, n) => {
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Community Impact", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 12;
    doc.setTextColor(35,42,46);
    doc.setFontSize(13);
    doc.text(`${i.title} (${i.type})`, 12, y); y+=8;
    doc.text(`Date: ${i.date} | Status: ${i.status}`, 12, y); y+=8;
    doc.text(`Lead: ${i.lead} | Partners: ${(i.partners||[]).join(", ")}`, 12, y); y+=8;
    doc.text(`Impact Area: ${i.impactArea} | Impact: ${i.impact}`, 12, y); y+=8;
    if (i.tags && i.tags.length) { doc.setFontSize(10); doc.text(`Tags: ${i.tags.join(", ")}`, 12, y); y+=6;}
    if (i.timeline && i.timeline.length) {
      doc.setFontSize(11); doc.text("Timeline:", 12, y); y+=6;
      i.timeline.forEach(e=>{ doc.text(`${e.date}: ${e.label}`, 14, y); y+=5; });
    }
    y+=2; doc.setFontSize(12); doc.text("Notes:", 12, y); y+=6;
    (i.notes||[]).forEach(n=>{ doc.setFontSize(10); doc.text(`${n.date} (${n.by}): ${n.text}`, 12, y); y+=5; });
    y+=4;
    doc.setTextColor(120,120,120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    if (n<initiatives.length-1) doc.addPage();
  });
  doc.save("Community_Impact.pdf");
}
function exportCSV(initiatives) {
  const rows = [
    ["ID","Title","Type","Date","Lead","Partners","Impact","Area","Status","Tags","Timeline","Notes"]
  ];
  (Array.isArray(initiatives)?initiatives:[initiatives]).forEach(i=>{
    rows.push([
      i.id, i.title, i.type, i.date, i.lead, (i.partners||[]).join("|"), i.impact, i.impactArea, i.status,
      (i.tags||[]).join("|"),
      (i.timeline||[]).map(e=>`${e.date}:${e.label}`).join("|"),
      (i.notes||[]).map(n=>`${n.date}:${n.by}:${n.text}`).join("|")
    ]);
  });
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "CommunityImpact.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function typeAnalytics(list) {
  const counts = {};
  list.forEach(i=>{counts[i.type]=1+(counts[i.type]||0);});
  return Object.keys(counts).map(type=>({type,count:counts[type]}));
}
function areaAnalytics(list) {
  const counts = {};
  list.forEach(i=>{counts[i.impactArea]=1+(counts[i.impactArea]||0);});
  return Object.keys(counts).map(area=>({area,count:counts[area]}));
}
function statusAnalytics(list) {
  const bins = { planned:0, active:0, completed:0 };
  list.forEach(i=>{bins[i.status]++;});
  return Object.keys(bins).map(s=>({status:s,count:bins[s]}));
}
function monthTrend(list) {
  const months = {};
  list.forEach(i=>{
    const m = i.date.slice(0,7);
    months[m]=(months[m]||0)+1;
  });
  return Object.keys(months).map(m=>({month:m,count:months[m]}));
}
function topImpact(list, n=3) {
  return [...list].sort((a,b)=>b.impact-a.impact).slice(0,n);
}
function aiCopilot(list) {
  const overdue = list.filter(i=>i.status!=="completed" && (!i.notes||i.notes.length===0));
  const areas = areaAnalytics(list);
  const focus = areas.reduce((a,b)=>a.count<b.count?a:b,{area:"",count:1/0});
  let notes = [];
  if (overdue.length) notes.push(`${overdue.length} missing follow-up.`);
  if (focus.area) notes.push(`Area needing focus: ${focus.area}.`);
  const top = topImpact(list,1)[0];
  if (top) notes.push(`Top impact: ${top.title}.`);
  if (!notes.length) notes.push("All initiatives healthy.");
  return (
    <div className="cis-ai-widget">
      <FaRobot style={{color:"#FFD700",marginRight:7}}/>
      {notes.join(" | ")}
    </div>
  );
}

export default function CommunityImpactStudio() {
  const [impacts, setImpacts] = useState(INIT_IMPACTS);
  const [drill, setDrill] = useState(null);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [comment, setComment] = useState("");

  let filtered = impacts;
  if (filter) filtered = filtered.filter(i=>i.title.toLowerCase().includes(filter.toLowerCase()));
  if (typeFilter) filtered = filtered.filter(i=>i.type===typeFilter);
  if (areaFilter) filtered = filtered.filter(i=>i.impactArea===areaFilter);
  if (statusFilter) filtered = filtered.filter(i=>i.status===statusFilter);

  return (
    <div className="cis-root">
      {/* TOP ACTION/AI BAR */}
      <div className="cis-actionbar">
        <div className="cis-title"><FaGlobe style={{color:"#FFD700",marginRight:13}}/>Community Impact Studio</div>
        <div>
          <button className="cis-btn" onClick={()=>exportPDF(filtered)}><FaDownload/> PDF</button>
          <button className="cis-btn" onClick={()=>exportCSV(filtered)}><FaFileCsv/> CSV</button>
        </div>
      </div>
      <div className="cis-filter-row">
        <input type="text" placeholder="Search initiatives..." value={filter} onChange={e=>setFilter(e.target.value)}/>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map(t=><option value={t} key={t}>{t}</option>)}
        </select>
        <select value={areaFilter} onChange={e=>setAreaFilter(e.target.value)}>
          <option value="">All Areas</option>
          {AREAS.map(a=><option value={a} key={a}>{a}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        {aiCopilot(impacts)}
      </div>
      {/* ANALYTICS */}
      <div className="cis-analytics-row">
        <div className="cis-analytics-card">
          <div className="cis-analytics-title"><FaChartBar/> By Type</div>
          <div style={{height:95, width:180}}>
            <ResponsiveBar
              data={typeAnalytics(impacts)}
              keys={["count"]}
              indexBy="type"
              margin={{top:13,right:15,bottom:24,left:34}}
              padding={0.36}
              colors={["#FFD700"]}
              axisBottom={{tickSize:5,legend:"Type",legendOffset:15,legendPosition:"middle"}}
              axisLeft={{tickSize:5,legend:"Initiatives",legendOffset:-17,legendPosition:"middle"}}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={75}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="cis-analytics-card">
          <div className="cis-analytics-title"><FaChartBar/> By Status</div>
          <div style={{height:95, width:180}}>
            <ResponsiveBar
              data={statusAnalytics(impacts)}
              keys={["count"]}
              indexBy="status"
              margin={{top:13,right:15,bottom:24,left:34}}
              padding={0.36}
              colors={["#FFD700","#1de682","#35b378"]}
              axisBottom={{tickSize:5,legend:"Status",legendOffset:15,legendPosition:"middle"}}
              axisLeft={{tickSize:5,legend:"Initiatives",legendOffset:-17,legendPosition:"middle"}}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={75}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="cis-analytics-card">
          <div className="cis-analytics-title"><FaChartBar/> By Area</div>
          <div style={{height:95, width:180}}>
            <ResponsiveBar
              data={areaAnalytics(impacts)}
              keys={["count"]}
              indexBy="area"
              margin={{top:13,right:15,bottom:24,left:34}}
              padding={0.36}
              colors={["#FFD700"]}
              axisBottom={{tickSize:5,legend:"Area",legendOffset:15,legendPosition:"middle"}}
              axisLeft={{tickSize:5,legend:"Initiatives",legendOffset:-17,legendPosition:"middle"}}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={75}
              isInteractive={false}
            />
          </div>
        </div>
      </div>
      {/* TOP 3 IMPACT BANNERS */}
      <div className="cis-top-row">
        {topImpact(impacts).map(i=>(
          <div className="cis-top-card" key={i.id}>
            <div className="cis-top-star"><FaStar/> Top Impact</div>
            <div className="cis-top-title">{i.title}</div>
            <div className="cis-top-metric"><FaUsers/> {i.impact} reached</div>
          </div>
        ))}
      </div>
      {/* IMPACT GRID */}
      <div className="cis-cardgrid">
        {filtered.length===0 && (
          <div className="cis-empty">No initiatives found.</div>
        )}
        {filtered.map(i=>(
          <div className={`cis-card ${i.highlight?"cis-card-highlight":""}`} key={i.id} onClick={()=>setDrill(i)}>
            <div className="cis-card-type" style={{background:STATUS_COLORS[i.status]}}>{i.type}</div>
            <div className="cis-card-title">{i.title}</div>
            <div className="cis-card-row">
              <span><FaCalendarAlt/> {i.date}</span>
              <span><FaUserTie/> {i.lead}</span>
            </div>
            <div className="cis-card-row">
              <span><FaUsers/> {i.impact} reached</span>
              <span><FaAward/> {i.partners.join(", ")}</span>
            </div>
            <div className="cis-card-row">
              <span className="cis-card-area">{i.impactArea}</span>
              <span className={`cis-card-status cis-card-status-${i.status}`}>{i.status.toUpperCase()}</span>
            </div>
            <div className="cis-card-tags">
              {(i.tags||[]).map(tag=><span className="cis-tag">{tag}</span>)}
            </div>
            {i.highlight && <div className="cis-card-star"><FaStar/></div>}
            {/* Impact meter */}
            <div className="cis-impact-meter">
              <div className="cis-impact-bar" style={{width: `${Math.min(100,i.impact)}%`}}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Drilldown Modal */}
      {drill && (
        <div className="cis-modal-overlay">
          <div className="cis-modal">
            <div className="cis-modal-header">
              <FaGlobe/> {drill.title}
              <button className="cis-modal-close" onClick={()=>setDrill(null)}>×</button>
            </div>
            <div className="cis-modal-status-row">
              <span className="cis-modal-type">{drill.type}</span>
              <span className="cis-modal-area">{drill.impactArea}</span>
              <span className="cis-modal-status" style={{color:STATUS_COLORS[drill.status]}}>{drill.status.toUpperCase()}</span>
            </div>
            <div className="cis-modal-metrics-row">
              <span><FaCalendarAlt/> {drill.date}</span>
              <span><FaUserTie/> {drill.lead}</span>
              <span><FaUsers/> {drill.impact} reached</span>
              <span><FaAward/> {(drill.partners||[]).join(", ")}</span>
            </div>
            {/* Timeline */}
            <div className="cis-modal-title"><FaClipboardList/> Timeline</div>
            <div className="cis-modal-timeline">
              {(drill.timeline||[]).map((e,i)=>
                <div className="cis-modal-timeline-row" key={i} style={{borderLeft:`6px solid ${e.color}`}}>
                  <span className="cis-modal-timeline-date">{e.date}</span>
                  <span className="cis-modal-timeline-label">{e.label}</span>
                </div>
              )}
            </div>
            {/* Notes/comments */}
            <div className="cis-modal-title"><FaComments/> Board/Lead Notes</div>
            <div className="cis-modal-notes">
              {(drill.notes||[]).map((n,i)=>
                <div className="cis-modal-note" key={i}>
                  <span className="cis-modal-note-date">{n.date}</span>
                  <span className="cis-modal-note-user">{n.by}</span>
                  <span className="cis-modal-note-text">{n.text}</span>
                </div>
              )}
            </div>
            <div style={{marginTop:7,display:'flex',alignItems:'center',gap:10}}>
              <input type="text" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add note/comment..."/>
              <button className="cis-addnote-btn" onClick={()=>{
                if (!comment.trim()) return;
                setImpacts(list=>{
                  const idx = list.findIndex(x=>x.id===drill.id);
                  const next = [...list];
                  if (!next[idx].notes) next[idx].notes = [];
                  next[idx].notes.push({
                    date: new Date().toISOString().slice(0,10),
                    by: "Board/Lead",
                    text: comment
                  });
                  return next;
                });
                setComment("");
              }}><FaPlus/> Add</button>
            </div>
            {/* Tag row */}
            <div className="cis-modal-tags-row">
              {(drill.tags||[]).map((tag,i)=>
                <span className="cis-modal-tag">{tag}</span>
              )}
            </div>
            {/* AI Copilot */}
            <div className="cis-modal-copilot">
              <FaRobot style={{color:"#FFD700",marginRight:8}}/>
              {drill.status==="completed"
                ? "Initiative completed."
                : drill.status==="active"
                  ? "Ongoing—track participation & media."
                  : "Upcoming—promote to target groups."}
            </div>
            <div className="cis-tagline cis-tagline-sticky">BE REAL. BE VERO.</div>
          </div>
        </div>
      )}
      <div className="cis-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
