import React, { useState } from "react";
import { FaStar, FaExclamationTriangle, FaUserTie, FaUsers, FaHeartbeat, FaClipboardCheck, FaHandshake, FaAward, FaChartBar, FaBullhorn, FaPlus, FaDownload, FaFileCsv, FaRobot, FaFlag, FaHistory, FaChevronRight } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import jsPDF from "jspdf";
import "./StakeholderPipelineSuite.css";

// --- Pipeline Stages ---
const STAGES = [
  { key: "prospect", label: "Prospects", color: "#FFD700" },
  { key: "screened", label: "Screened", color: "#1de682" },
  { key: "onboarded", label: "Onboarded", color: "#b7bec9" },
  { key: "active", label: "Active", color: "#35b378" },
  { key: "alumni", label: "Alumni", color: "#f2a900" }
];

const TYPES = [
  { key: "coach", label: "Coach", icon: <FaUserTie/> },
  { key: "ref", label: "Referee", icon: <FaAward/> },
  { key: "medical", label: "Medical", icon: <FaHeartbeat/> },
  { key: "ops", label: "Ops", icon: <FaClipboardCheck/> },
  { key: "marketing", label: "Marketing", icon: <FaBullhorn/> }
];

// --- Demo Pipeline Data ---
const DEMO_STAKEHOLDERS = [
  { id: "V001", name: "Karlo Novak", type: "coach", since: "2023-09-12", phase: "active", note: "Elite youth leader", star: true, history: [{phase:"prospect", date:"2023-07-01"},{phase:"screened",date:"2023-08-01"},{phase:"onboarded",date:"2023-08-18"},{phase:"active",date:"2023-09-12"}], comments: [{by:"Board",date:"2024-02-10",text:"Ready for higher role"}]},
  { id: "V002", name: "Ivana Šarić", type: "ref", since: "2022-06-01", phase: "active", note: "Top event referee", star: false, flagged: true, history: [{phase:"prospect", date:"2022-04-11"},{phase:"screened",date:"2022-05-10"},{phase:"onboarded",date:"2022-05-18"},{phase:"active",date:"2022-06-01"}], comments: [{by:"Ref Lead",date:"2024-03-15",text:"Flagged after late arrival"}]},
  { id: "V003", name: "Ana Šimić", type: "medical", since: "2024-02-21", phase: "onboarded", note: "Physio onboarding", star: false, history: [{phase:"prospect",date:"2024-01-15"},{phase:"screened",date:"2024-02-02"},{phase:"onboarded",date:"2024-02-21"}], comments:[]},
  { id: "V004", name: "Luka Prskalo", type: "ops", since: "2024-03-05", phase: "screened", note: "", star: false, flagged: true, history: [{phase:"prospect",date:"2024-02-01"},{phase:"screened",date:"2024-03-05"}], comments:[]},
  { id: "V005", name: "Marko Milić", type: "marketing", since: "2023-05-17", phase: "alumni", note: "Transitioned to pro agency", star: false, history: [{phase:"prospect",date:"2022-12-15"},{phase:"screened",date:"2023-01-12"},{phase:"onboarded",date:"2023-02-10"},{phase:"active",date:"2023-05-17"},{phase:"alumni",date:"2024-05-19"}], comments: [{by:"Board",date:"2024-06-02",text:"Exit interview needed"}]},
  { id: "V006", name: "Petra Blažević", type: "coach", since: "2024-04-10", phase: "prospect", note: "Recommended by U16 coach", star: false, history: [{phase:"prospect",date:"2024-04-10"}], comments:[]},
  { id: "V007", name: "Dario Zovko", type: "ops", since: "2023-10-22", phase: "active", note: "", star: false, history: [{phase:"prospect",date:"2023-08-01"},{phase:"screened",date:"2023-09-01"},{phase:"onboarded",date:"2023-09-15"},{phase:"active",date:"2023-10-22"}], comments:[]}
];

function typeIcon(type) {
  const t = TYPES.find(t=>t.key===type);
  return t ? t.icon : <FaUsers/>;
}
function typeLabel(type) {
  const t = TYPES.find(t=>t.key===type);
  return t ? t.label : type;
}
function phaseColor(phase) {
  const s = STAGES.find(s=>s.key===phase);
  return s ? s.color : "#b7bec9";
}
function monthDiff(d1, d2) {
  let dt1 = new Date(d1), dt2 = new Date(d2);
  return (dt2.getFullYear() - dt1.getFullYear()) * 12 + (dt2.getMonth() - dt1.getMonth());
}

function exportPDF(pipeline) {
  const doc = new jsPDF("l", "mm", "a4");
  let y = 19;
  doc.setFillColor(35,42,46);
  doc.rect(0,0,297,22,"F");
  doc.setTextColor(255,215,0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CourtEvo Vero: Stakeholder Pipeline", 12, y);
  doc.setFontSize(10);
  doc.text("BE REAL. BE VERO.", 220, y);
  y += 11;
  doc.setTextColor(35,42,46);
  doc.setFontSize(11);
  doc.text("Stage", 13, y); doc.text("Name", 43, y); doc.text("Type", 92, y); doc.text("Since", 135, y); doc.text("Note", 160, y);
  y += 6;
  pipeline.forEach(row => {
    doc.setTextColor(35,42,46);
    doc.text(row.phase, 13, y);
    doc.text(row.name, 43, y);
    doc.text(typeLabel(row.type), 92, y);
    doc.text(row.since, 135, y);
    doc.text((row.note||"-").slice(0,60), 160, y);
    y += 6;
    if (y > 180) { y=25; doc.addPage(); }
  });
  y += 4;
  doc.setTextColor(120,120,120);
  doc.setFontSize(9);
  doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 13, 190);
  doc.save("Stakeholder_Pipeline.pdf");
}

function exportCSV(pipeline) {
  const rows = [["Name","Type","Since","Phase","Note"]];
  pipeline.forEach(r=>rows.push([r.name, typeLabel(r.type), r.since, r.phase, r.note||""]));
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "StakeholderPipeline.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function pipelineStats(list) {
  const active = list.filter(x=>x.phase==="active").length;
  const alumni = list.filter(x=>x.phase==="alumni").length;
  const flagged = list.filter(x=>x.flagged).length;
  const total = list.length;
  const activeRate = total ? Math.round(100*active/total) : 0;
  const avgTenure = total ? (
    Math.round(list.filter(x=>x.since).reduce((sum,s)=>sum+monthDiff(s.since,new Date()),0)/total*10)/10
  ) : 0;
  return {active, alumni, flagged, total, activeRate, avgTenure};
}

function typePhaseAnalytics(list) {
  const roles = {};
  list.forEach(x=>{
    if (!roles[x.type]) roles[x.type] = {};
    roles[x.type][x.phase] = 1+(roles[x.type][x.phase]||0);
  });
  return Object.keys(roles).map(role=>({
    type: typeLabel(role),
    ...STAGES.reduce((a,s)=>({...a,[s.key]:roles[role][s.key]||0}),{})
  }));
}

function phaseSize(list, phase) {
  const total = list.length;
  const count = list.filter(x=>x.phase===phase).length;
  return total ? Math.round(100*count/total) : 0;
}

function mostCommonType(list, phase) {
  const phaseList = list.filter(x=>x.phase===phase);
  const freq = {};
  phaseList.forEach(x=>{freq[x.type]=1+(freq[x.type]||0);});
  let max = 0, key = null;
  Object.entries(freq).forEach(([k,v])=>{if (v>max){max=v;key=k;}});
  return typeLabel(key);
}

function aiCopilot(list) {
  // Flagged = "exit risk"; pipeline thin; >40% in alumni is attrition alert
  const flagged = list.filter(x=>x.flagged).length;
  const alumniPct = phaseSize(list,"alumni");
  const onboarding = list.filter(x=>x.phase==="onboarded").length;
  let needs = [];
  if (flagged) needs.push(`${flagged} exit risk${flagged>1?"s":""}`);
  if (alumniPct > 40) needs.push("High attrition—review causes");
  if (onboarding<1) needs.push("No onboarding in progress");
  if (phaseSize(list,"prospect")<15) needs.push("Pipeline thin (<15%)");
  if (!needs.length) needs.push("All phases healthy.");
  return (
    <div className="sps-ai-widget sps-ai-sticky">
      <FaRobot style={{color:"#FFD700",marginRight:7}}/>
      {needs.join(" | ")}
    </div>
  );
}

export default function StakeholderPipelineSuite() {
  const [stakeholders, setStakeholders] = useState(DEMO_STAKEHOLDERS);
  const [dragId, setDragId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [drill, setDrill] = useState(null);
  const [newStake, setNewStake] = useState({ name: "", type: "coach", since: "", phase: "prospect", note: "", star: false, flagged: false });
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("");
  const [phaseF, setPhaseF] = useState("");
  const [flagF, setFlagF] = useState(false);
  const [comment, setComment] = useState("");

  // DnD logic (demo + phase history logging)
  function onDragStart(id) { setDragId(id); }
  function onDrop(phase) {
    if (dragId) {
      setStakeholders(list=>{
        return list.map(s=>{
          if (s.id===dragId) {
            let h = (s.history||[]);
            if (h[h.length-1]?.phase!==phase) h = [...h,{phase,date:new Date().toISOString().slice(0,10)}];
            // AI: Auto-star if >8 months in active
            let star = s.star;
            if (phase==="active" && s.since && monthDiff(s.since,new Date())>=8) star = true;
            // Auto-flag if phase is "screened" and role is ops
            let flagged = s.flagged;
            if (phase==="screened" && s.type==="ops") flagged = true;
            return {...s, phase, history: h, star, flagged};
          }
          return s;
        });
      });
      setDragId(null);
    }
  }
  // Global filtering
  let filtered = stakeholders;
  if (search) filtered = filtered.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
  if (typeF) filtered = filtered.filter(s=>s.type===typeF);
  if (phaseF) filtered = filtered.filter(s=>s.phase===phaseF);
  if (flagF) filtered = filtered.filter(s=>s.flagged);

  // Analytics
  const stats = pipelineStats(stakeholders);
  const analytics = typePhaseAnalytics(stakeholders);

  return (
    <div className="sps-root">
      {/* STATS BAR */}
      <div className="sps-stat-row sps-stat-sticky">
        <div className="sps-stat-block">
          <div className="sps-stat-label"><FaUsers/> Total</div>
          <div className="sps-stat-value">{stats.total}</div>
        </div>
        <div className="sps-stat-block sps-stat-active">
          <div className="sps-stat-label"><FaClipboardCheck/> Active</div>
          <div className="sps-stat-value">{stats.active}</div>
        </div>
        <div className="sps-stat-block sps-stat-alumni">
          <div className="sps-stat-label"><FaAward/> Alumni</div>
          <div className="sps-stat-value">{stats.alumni}</div>
        </div>
        <div className="sps-stat-block sps-stat-flagged">
          <div className="sps-stat-label"><FaExclamationTriangle/> Flagged</div>
          <div className="sps-stat-value">{stats.flagged}</div>
        </div>
        <div className="sps-stat-block">
          <div className="sps-stat-label"><FaChartBar/> Active %</div>
          <div className="sps-stat-value">{stats.activeRate}%</div>
        </div>
        <div className="sps-stat-block">
          <div className="sps-stat-label"><FaHistory/> Avg. Tenure</div>
          <div className="sps-stat-value">{stats.avgTenure} mo</div>
        </div>
        <div className="sps-stat-actions">
          <button className="sps-btn" onClick={()=>exportPDF(stakeholders)}><FaDownload/> PDF</button>
          <button className="sps-btn" onClick={()=>exportCSV(stakeholders)}><FaFileCsv/> CSV</button>
          <button className="sps-btn" onClick={()=>setShowAdd(true)}><FaPlus/> Add</button>
        </div>
      </div>
      {/* GLOBAL FILTERS */}
      <div className="sps-filter-row">
        <input className="sps-search" type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name..." />
        <select value={typeF} onChange={e=>setTypeF(e.target.value)}>
          <option value="">All Types</option>
          {TYPES.map(t=><option value={t.key} key={t.key}>{t.label}</option>)}
        </select>
        <select value={phaseF} onChange={e=>setPhaseF(e.target.value)}>
          <option value="">All Phases</option>
          {STAGES.map(s=><option value={s.key} key={s.key}>{s.label}</option>)}
        </select>
        <label className="sps-flag-checkbox">
          <input type="checkbox" checked={flagF} onChange={e=>setFlagF(e.target.checked)}/> Flagged Only
        </label>
      </div>
      {/* ANALYTICS */}
      <div className="sps-analytics-row">
        <div className="sps-analytics-card">
          <div className="sps-analytics-title"><FaChartBar/> Role by Phase</div>
          <div style={{height:110, width:270}}>
            <ResponsiveBar
              data={analytics}
              keys={STAGES.map(s=>s.key)}
              indexBy="type"
              margin={{top:13,right:15,bottom:38,left:34}}
              padding={0.27}
              colors={["#FFD700","#1de682","#b7bec9","#35b378","#f2a900"]}
              axisBottom={{tickSize:5,legend:"Type",legendOffset:23,legendPosition:"middle"}}
              axisLeft={{tickSize:5,legend:"#",legendOffset:-17,legendPosition:"middle"}}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={85}
              isInteractive={false}
              groupMode="stacked"
            />
          </div>
        </div>
      </div>
      {/* PIPELINE */}
      <div className="sps-pipeline-row">
        {STAGES.map(stage=>{
          const sizePct = phaseSize(filtered, stage.key);
          const mostRole = mostCommonType(filtered, stage.key);
          return (
            <div
              className={`sps-pipeline-lane sps-pipeline-lane-${stage.key}`}
              key={stage.key}
              onDragOver={e=>e.preventDefault()}
              onDrop={()=>onDrop(stage.key)}
            >
              <div className="sps-pipeline-header" style={{color:stage.color}}>
                {stage.label}
                <span className="sps-pipeline-badge">{sizePct}%</span>
                <span className="sps-pipeline-role"><FaUsers/> {mostRole||"--"}</span>
              </div>
              {filtered.filter(s=>s.phase===stage.key).length === 0 && (
                <div className="sps-lane-empty">No stakeholders</div>
              )}
              {filtered.filter(s=>s.phase===stage.key).map(s=>
                <div
                  className={`sps-card${s.star ? " sps-card-star" : ""}${s.flagged ? " sps-card-flagged" : ""}`}
                  key={s.id}
                  draggable
                  onDragStart={()=>onDragStart(s.id)}
                  onClick={()=>setDrill(s)}
                  title="Click for full details. Drag to move."
                >
                  <div className="sps-card-header">
                    <span className="sps-card-icon">{typeIcon(s.type)}</span>
                    <span className="sps-card-name">{s.name}</span>
                    {s.star && <span className="sps-card-badge"><FaStar/> Elite</span>}
                    {s.flagged && <span className="sps-card-flag"><FaFlag/> Risk</span>}
                  </div>
                  <div className="sps-card-type">{typeLabel(s.type)}</div>
                  <div className="sps-card-meta"><FaClipboardCheck/> Since {s.since}</div>
                  <div className="sps-card-note">{s.note}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* RIGHT-SIDE DRILL PANEL */}
      {drill && (
        <div className="sps-drawer-overlay" onClick={()=>setDrill(null)}>
          <div className="sps-drawer" onClick={e=>e.stopPropagation()}>
            <div className="sps-drawer-header">
              <span className="sps-drawer-icon">{typeIcon(drill.type)}</span>
              <span className="sps-drawer-name">{drill.name}</span>
              {drill.star && <span className="sps-card-badge"><FaStar/> Elite</span>}
              {drill.flagged && <span className="sps-card-flag"><FaFlag/> Risk</span>}
              <button className="sps-drawer-close" onClick={()=>setDrill(null)}><FaChevronRight/></button>
            </div>
            <div className="sps-drawer-type">{typeLabel(drill.type)} – <span style={{color:phaseColor(drill.phase),fontWeight:900}}>{drill.phase.toUpperCase()}</span></div>
            <div className="sps-drawer-meta-row">
              <span><FaClipboardCheck/> Since {drill.since}</span>
              <span><FaUsers/> ID {drill.id}</span>
            </div>
            <div className="sps-drawer-note">{drill.note}</div>
            {/* Phase Movement Timeline */}
            <div className="sps-drawer-title"><FaHistory/> Pipeline Timeline</div>
            <div className="sps-drawer-timeline">
              {(drill.history||[]).map((h,i)=>
                <div className="sps-drawer-timeline-row" key={i}>
                  <span className="sps-drawer-phase" style={{color:phaseColor(h.phase)}}>{h.phase.toUpperCase()}</span>
                  <span className="sps-drawer-date">{h.date}</span>
                </div>
              )}
            </div>
            {/* Comments */}
            <div className="sps-drawer-title"><FaUsers/> Board/Role Comments</div>
            <div className="sps-drawer-comments">
              {(drill.comments||[]).map((c,i)=>
                <div className="sps-drawer-comment" key={i}>
                  <span className="sps-drawer-comment-date">{c.date}</span>
                  <span className="sps-drawer-comment-by">{c.by}</span>
                  <span className="sps-drawer-comment-text">{c.text}</span>
                </div>
              )}
            </div>
            <div style={{marginTop:7,display:'flex',alignItems:'center',gap:10}}>
              <input className="sps-comment-input" type="text" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add comment..." />
              <button className="sps-btn" onClick={()=>{
                if (!comment.trim()) return;
                setStakeholders(list=>{
                  const idx = list.findIndex(x=>x.id===drill.id);
                  const next = [...list];
                  if (!next[idx].comments) next[idx].comments = [];
                  next[idx].comments.push({
                    date: new Date().toISOString().slice(0,10),
                    by: "Board/Role",
                    text: comment
                  });
                  return next;
                });
                setComment("");
              }}><FaPlus/> Add</button>
            </div>
          </div>
        </div>
      )}
      {/* ADD STAKEHOLDER MODAL */}
      {showAdd && (
        <div className="sps-modal-overlay">
          <div className="sps-modal">
            <div className="sps-modal-header">
              <FaUsers/> Add Stakeholder
              <button className="sps-modal-close" onClick={()=>setShowAdd(false)}>×</button>
            </div>
            <div className="sps-modal-form-row">
              <label>Name</label>
              <input type="text" value={newStake.name} onChange={e=>setNewStake(s=>({...s, name: e.target.value}))}/>
            </div>
            <div className="sps-modal-form-row">
              <label>Type</label>
              <select value={newStake.type} onChange={e=>setNewStake(s=>({...s, type: e.target.value}))}>
                {TYPES.map(t=><option value={t.key} key={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="sps-modal-form-row">
              <label>Since</label>
              <input type="date" value={newStake.since} onChange={e=>setNewStake(s=>({...s, since: e.target.value}))}/>
            </div>
            <div className="sps-modal-form-row">
              <label>Note</label>
              <input type="text" value={newStake.note} onChange={e=>setNewStake(s=>({...s, note: e.target.value}))}/>
            </div>
            <div className="sps-modal-form-row sps-modal-bool-row">
              <label><input type="checkbox" checked={newStake.star} onChange={e=>setNewStake(s=>({...s, star: e.target.checked}))}/> Elite/Star</label>
              <label><input type="checkbox" checked={newStake.flagged} onChange={e=>setNewStake(s=>({...s, flagged: e.target.checked}))}/> Flagged</label>
            </div>
            <div className="sps-modal-actions">
              <button className="sps-btn" onClick={()=>{
                if (!newStake.name) return;
                setStakeholders(list=>[
                  ...list,
                  {...newStake, id:"V"+Math.floor(Math.random()*9999), phase:"prospect", history:[{phase:"prospect", date:newStake.since||new Date().toISOString().slice(0,10)}], comments:[] }
                ]);
                setShowAdd(false);
                setNewStake({ name: "", type: "coach", since: "", phase: "prospect", note: "", star: false, flagged: false });
              }}><FaPlus/> Add</button>
            </div>
          </div>
        </div>
      )}
      {aiCopilot(stakeholders)}
      <div className="sps-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
