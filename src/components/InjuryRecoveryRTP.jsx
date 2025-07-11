import React, { useState } from "react";
import { FaUserTie, FaHeartbeat, FaCalendarCheck, FaExclamationTriangle, FaCheckCircle, FaDownload, FaRobot, FaPlus, FaEdit, FaFileCsv, FaClipboardList, FaClock, FaSignature, FaHistory, FaInfoCircle } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import jsPDF from "jspdf";
import "./InjuryRecoveryRTP.css";

const AVG_DAYS = { "Assessment": 2, "Rehab": 12, "Conditional RTP": 6, "Full RTP": 0 }; // Demo standard

const INIT_CASES = [
  {
    id: 1,
    athlete: "Luka Nović",
    team: "U18",
    injury: "Ankle sprain",
    date: "2024-05-10",
    status: "Rehab",
    currentPhase: 2,
    protocol: [
      { step: "Assessment", start: "2024-05-10", end: "2024-05-11", staff: "Team Doctor", cleared: true },
      { step: "Rehab", start: "2024-05-12", end: "", staff: "Physio", cleared: false },
      { step: "Conditional RTP", start: "", end: "", staff: "", cleared: false },
      { step: "Full RTP", start: "", end: "", staff: "", cleared: false }
    ],
    staff: "Physio Marko",
    risk: "on track",
    notes: [
      { date: "2024-05-11", text: "Initial swelling, recovery plan set", user: "Team Doctor" },
      { date: "2024-05-16", text: "Rehab progress good, next check 20/5", user: "Physio Marko" }
    ],
    compliance: {
      signedOff: false,
      boardAttest: false,
      overdue: false,
      reinjuryRisk: false
    },
    actionLog: [
      { time: "2024-05-10", who: "Team Doctor", action: "Assessment started" },
      { time: "2024-05-11", who: "Team Doctor", action: "Assessment cleared" },
      { time: "2024-05-12", who: "Physio Marko", action: "Rehab started" }
    ]
  },
  {
    id: 2,
    athlete: "Ivan Radić",
    team: "U19",
    injury: "Hamstring strain",
    date: "2024-04-27",
    status: "Conditional RTP",
    currentPhase: 3,
    protocol: [
      { step: "Assessment", start: "2024-04-27", end: "2024-04-28", staff: "Team Doctor", cleared: true },
      { step: "Rehab", start: "2024-04-29", end: "2024-05-12", staff: "Physio Marko", cleared: true },
      { step: "Conditional RTP", start: "2024-05-13", end: "", staff: "Performance Coach", cleared: false },
      { step: "Full RTP", start: "", end: "", staff: "", cleared: false }
    ],
    staff: "Performance Coach",
    risk: "overdue",
    notes: [
      { date: "2024-05-13", text: "Conditional RTP started, slow progress", user: "Performance Coach" }
    ],
    compliance: {
      signedOff: false,
      boardAttest: false,
      overdue: true,
      reinjuryRisk: false
    },
    actionLog: [
      { time: "2024-04-27", who: "Team Doctor", action: "Assessment started" },
      { time: "2024-04-28", who: "Team Doctor", action: "Assessment cleared" },
      { time: "2024-04-29", who: "Physio Marko", action: "Rehab started" },
      { time: "2024-05-12", who: "Physio Marko", action: "Rehab cleared" },
      { time: "2024-05-13", who: "Performance Coach", action: "Conditional RTP started" }
    ]
  }
];

const PHASES = ["Assessment", "Rehab", "Conditional RTP", "Full RTP"];
const RISK_COLORS = { "on track": "#35b378", overdue: "#FFD700", risk: "#f35650", cleared: "#b7bec9" };

// --- Helper: date diff in days
function daysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
}

// --- Helper: current date
function today() {
  return new Date().toISOString().slice(0, 10);
}

// --- Helper: Status badge
function riskBadge(risk) {
  let icon, color, label;
  if (risk === "on track") { icon = <FaCheckCircle/>; color = "#35b378"; label="ON TRACK"; }
  if (risk === "overdue")  { icon = <FaExclamationTriangle/>; color = "#FFD700"; label="OVERDUE"; }
  if (risk === "risk")     { icon = <FaExclamationTriangle/>; color = "#f35650"; label="RISK"; }
  if (risk === "cleared")  { icon = <FaCalendarCheck/>; color = "#b7bec9"; label="CLEARED"; }
  return <span className="irtp-badge" style={{background:color+"22",color}}>{icon} {label}</span>;
}

// --- PDF export (includes logo + signatories)
function exportPDF(cases) {
  cases = Array.isArray(cases)?cases:[cases];
  const doc = new jsPDF("p", "mm", "a4");
  for (const c of cases) {
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Injury Recovery Protocol", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    // -- Logo placeholder: addImage (if base64 or URL), or leave for print
    y += 10;
    doc.setTextColor(255,255,255);
    doc.setFontSize(11);
    doc.text(`Generated: ${today()} ${new Date().toLocaleTimeString()}`, 12, y);
    y += 10;
    doc.setTextColor(35,42,46);
    doc.setFontSize(12);
    doc.text(`${c.athlete} (${c.team}) | ${c.injury} | ${c.date}`, 12, y); y += 7;
    doc.setTextColor(120,120,120); doc.text("Phase timeline:", 12, y); y+=6;
    c.protocol.forEach((p,i)=>{
      doc.setTextColor(35,42,46);
      doc.text(`${p.step}: ${p.start} → ${p.end||"active"} | ${p.staff||"-"} | Cleared: ${p.cleared?"Yes":"No"}`, 12, y); y+=5;
      doc.text(`Days in phase: ${daysBetween(p.start, p.end||today())} (Standard: ${AVG_DAYS[p.step]}d)`, 26, y); y+=5;
    });
    y+=3; doc.setTextColor(35,42,46); doc.setFontSize(12); doc.text("Notes log:", 12, y); y+=6;
    c.notes.forEach(n=>{ doc.text(`${n.date}: ${n.text} (${n.user})`, 12, y); y+=5; });
    y+=4; doc.setTextColor(35,42,46); doc.text("Compliance & Signatories:", 12, y); y+=6;
    doc.text(`Medical: ${c.compliance.signedOff ? "Signed" : "Pending"}   |   Board: ${c.compliance.boardAttest ? "Attested" : "Pending"}`, 12, y); y+=5;
    y+=3; doc.setTextColor(120,120,120); doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    if (cases.length>1) doc.addPage();
  }
  doc.save(cases.length===1 ? `InjuryRecovery_${cases[0].athlete}.pdf` : "InjuryRecoveryCases.pdf");
}

// --- CSV export (includes full protocol, risk, signatories)
function exportCSV(cases) {
  const rows = [
    ["Athlete","Team","Injury","Date","Status","Lead Staff","Phase","Start","End","Days","Cleared","Compliance","Risk","Notes"]
  ];
  for (const c of cases) {
    c.protocol.forEach(p=>{
      rows.push([
        c.athlete, c.team, c.injury, c.date, c.status, c.staff,
        p.step, p.start, p.end, daysBetween(p.start,p.end||today()), p.cleared?"Yes":"No",
        (c.compliance.signedOff?"Signed":"Not signed")+(c.compliance.overdue?" | Overdue":"")+(c.compliance.boardAttest?" | Attested":""),
        c.risk,
        c.notes.map(n=>`${n.date}: ${n.text} (${n.user})`).join("; ")
      ]);
    });
  }
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "InjuryRecoveryCases.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// --- Analytics Nivo data
function analyticsByStatus(cases) {
  let stats = PHASES.concat(["Cleared"]).map(ph=>({
    phase: ph,
    count: cases.filter(c=>
      (ph==="Cleared" ? c.protocol[3]?.cleared : c.protocol.find(p=>p.step===ph && !p.cleared===false))
    ).length
  }));
  return stats;
}
function avgDaysByPhase(cases) {
  return PHASES.map(ph=>{
    let arr = [];
    cases.forEach(c=>{
      let p = c.protocol.find(x=>x.step===ph);
      if (p && p.start && (p.end||c.currentPhase>PHASES.indexOf(ph))) arr.push(daysBetween(p.start,p.end||today()));
    });
    return { phase: ph, avg: arr.length?Math.round(arr.reduce((a,b)=>a+b,0)/arr.length):0 };
  });
}

// --- AI Copilot
function aiCopilot(cases, action) {
  const overdue = cases.filter(c=>c.risk==="overdue");
  const atRisk = cases.filter(c=>c.compliance.reinjuryRisk);
  const slowPhase = cases.find(c=>{
    const todayD = new Date();
    return c.protocol.some(p=>
      !p.cleared &&
      p.start &&
      (new Date(p.start)<new Date(todayD - 1000*60*60*24*14)) // >14 days
    );
  });
  let notes = [];
  if (overdue.length) notes.push(`${overdue.length} overdue clearance${overdue.length>1?"s":""}.`);
  if (atRisk.length) notes.push(`${atRisk.length} reinjury risk${atRisk.length>1?"s":""}.`);
  if (slowPhase) notes.push(`Delayed: ${slowPhase.athlete} in ${PHASES[slowPhase.currentPhase-1]}`);
  if (!notes.length) notes.push("All cases on track.");
  // Risk if: cleared too fast, phase skipped, no notes in 7+ days, rehab too long
  cases.forEach(c=>{
    c.protocol.forEach((p,i)=>{
      const days = daysBetween(p.start, p.end||today());
      if (p.step==="Rehab" && p.cleared && days<7) notes.push(`Warning: ${c.athlete} rehab <7d (risk of reinjury).`);
      if (p.cleared && !p.start) notes.push(`Warning: ${c.athlete} skipped ${p.step}.`);
    });
    if (!c.notes.find(n=>daysBetween(n.date,today())<=7))
      notes.push(`Note: No medical log for ${c.athlete} in 7+ days.`);
  });
  return (
    <div className="irtp-copilot-col">
      <span>{notes.join(" | ")}</span>
      <div className="irtp-copilot-actions">
        <button className="irtp-copilot-btn" onClick={()=>action("remind")}>Remind Staff</button>
        <button className="irtp-copilot-btn" onClick={()=>action("flag")}>Flag for Board</button>
        <button className="irtp-copilot-btn" onClick={()=>action("risk")}>Request Review</button>
      </div>
    </div>
  );
}

// --- Editable protocol steps
function PhaseEditor({ protocol, onUpdate }) {
  function editStep(idx, field, val) {
    const next = protocol.map((p,i)=>i===idx?{...p,[field]:val}:p);
    onUpdate(next);
  }
  function toggleCleared(idx) {
    const next = protocol.map((p,i)=>i===idx?{...p,cleared:!p.cleared}:p);
    onUpdate(next);
  }
  function addStep() {
    onUpdate([...protocol,{step:"Custom",start:today(),end:"",staff:"",cleared:false}]);
  }
  return (
    <div className="irtp-phaseeditor">
      {protocol.map((p,i)=>
        <div className="irtp-phaseeditor-row" key={i}>
          <input value={p.step} onChange={e=>editStep(i,"step",e.target.value)} className="irtp-edit-input" />
          <input type="date" value={p.start} onChange={e=>editStep(i,"start",e.target.value)} className="irtp-edit-input" />
          <input type="date" value={p.end} onChange={e=>editStep(i,"end",e.target.value)} className="irtp-edit-input" />
          <input value={p.staff} onChange={e=>editStep(i,"staff",e.target.value)} className="irtp-edit-input" placeholder="Staff"/>
          <button className="irtp-phaseeditor-btn" onClick={()=>toggleCleared(i)}>
            {p.cleared?<FaCheckCircle/>:"Clear"}
          </button>
        </div>
      )}
      <button className="irtp-phaseeditor-btn irtp-phaseeditor-add" onClick={addStep}><FaPlus/> Add Custom Step</button>
    </div>
  );
}

export default function InjuryRecoveryRTP() {
  const [cases, setCases] = useState(INIT_CASES);
  const [drill, setDrill] = useState(null);
  const [addNote, setAddNote] = useState("");
  const [editPhases, setEditPhases] = useState(false);

  function copilotAction(key) {
    alert("Demo: Copilot action – " + key);
  }
  function addNewNote(idx) {
    if (!addNote.trim()) return;
    setCases(list => {
      const next = [...list];
      next[idx].notes.push({
        date: today(),
        text: addNote,
        user: "Board Admin"
      });
      next[idx].actionLog.push({
        time: today(),
        who: "Board Admin",
        action: "Added protocol note"
      });
      return next;
    });
    setAddNote("");
  }
  function updatePhase(idx, proto) {
    setCases(list => {
      const next = [...list];
      next[idx].protocol = proto;
      next[idx].actionLog.push({
        time: today(),
        who: "Board Admin",
        action: "Updated protocol steps"
      });
      return next;
    });
  }
  function toggleSignOff(idx) {
    setCases(list => {
      const next = [...list];
      next[idx].compliance.signedOff = !next[idx].compliance.signedOff;
      next[idx].actionLog.push({
        time: today(),
        who: "Team Doctor",
        action: "Toggled medical sign-off"
      });
      return next;
    });
  }
  function toggleAttest(idx) {
    setCases(list => {
      const next = [...list];
      next[idx].compliance.boardAttest = !next[idx].compliance.boardAttest;
      next[idx].actionLog.push({
        time: today(),
        who: "Board Rep",
        action: "Toggled board attest"
      });
      return next;
    });
  }

  // --- Analytics
  const analytics = analyticsByStatus(cases);
  const avgPhaseData = avgDaysByPhase(cases);

  return (
    <div className="irtp-main">
      <div className="irtp-header">
        <h2>
          <FaHeartbeat style={{ color: "#FFD700", marginRight: 13 }} />
          Injury Recovery & Return-to-Play Protocol
        </h2>
        <div>
          <button className="irtp-pdf-btn" onClick={() => exportPDF(cases)}>
            <FaDownload /> Export PDF
          </button>
          <button className="irtp-csv-btn" onClick={() => exportCSV(cases)}>
            <FaFileCsv /> Export CSV
          </button>
        </div>
      </div>

      {/* --- Analytics --- */}
      <div className="irtp-analytics-bar">
        <div className="irtp-analytics-title"><FaClipboardList/> Protocol Phase Analytics</div>
        <div style={{height: 140, width: 470}}>
          <ResponsiveBar
            data={analytics}
            keys={["count"]}
            indexBy="phase"
            margin={{top: 18, right: 20, bottom: 40, left: 45}}
            padding={0.38}
            colors={["#35b378","#FFD700","#f35650","#b7bec9","#b7bec9"]}
            axisBottom={{
              tickSize: 7,
              legend: "Phase",
              legendOffset: 26,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 6,
              legend: "Cases",
              legendOffset: -26,
              legendPosition: "middle"
            }}
            labelSkipWidth={100}
            labelSkipHeight={12}
            labelTextColor="#232a2e"
            enableLabel={true}
            theme={{
              axis: { ticks: { text: { fill: "#FFD700" } } },
              grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
            }}
            height={120}
            isInteractive={false}
          />
        </div>
        <div className="irtp-analytics-title" style={{marginTop:16}}><FaClock/> Avg Days by Phase</div>
        <div style={{height: 120, width: 470}}>
          <ResponsiveBar
            data={avgPhaseData}
            keys={["avg"]}
            indexBy="phase"
            margin={{top: 18, right: 20, bottom: 40, left: 45}}
            padding={0.38}
            colors={["#FFD700"]}
            axisBottom={{
              tickSize: 7,
              legend: "Phase",
              legendOffset: 26,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 6,
              legend: "Avg Days",
              legendOffset: -26,
              legendPosition: "middle"
            }}
            labelSkipWidth={100}
            labelSkipHeight={12}
            labelTextColor="#232a2e"
            enableLabel={true}
            theme={{
              axis: { ticks: { text: { fill: "#FFD700" } } },
              grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
            }}
            height={100}
            isInteractive={false}
          />
        </div>
      </div>

      {/* --- AI Copilot --- */}
      <div className="irtp-copilot-card">
        <div className="irtp-copilot-title"><FaRobot/> RTP Copilot</div>
        {aiCopilot(cases, copilotAction)}
      </div>

      {/* --- Main Case Grid --- */}
      <div className="irtp-grid">
        <div className="irtp-grid-row irtp-grid-header">
          <div>Athlete</div>
          <div>Injury</div>
          <div>Date</div>
          <div>Team</div>
          <div>Status</div>
          <div>Lead Staff</div>
          <div>Risk</div>
          <div>Protocol</div>
          <div>Actions</div>
        </div>
        {cases.length === 0 && (
          <div className="irtp-grid-row irtp-empty">
            <FaExclamationTriangle /> No cases found.
          </div>
        )}
        {cases.map((c,idx) => (
          <div className="irtp-grid-row" key={c.id}>
            <div>{c.athlete}</div>
            <div>{c.injury}</div>
            <div>{c.date}</div>
            <div>{c.team}</div>
            <div>{c.status}</div>
            <div>{c.staff}</div>
            <div>{riskBadge(c.risk)}</div>
            <div>
              <div className="irtp-protocol-bar">
                {c.protocol.map((p,i) =>
                  <span
                    className={`irtp-protocol-phase${i===c.currentPhase-1 ? " irtp-phase-active" : ""}${p.cleared?" irtp-phase-cleared":""}`}
                    key={p.step}
                    title={p.step}
                  >{p.step[0]}</span>
                )}
              </div>
            </div>
            <div>
              <button className="irtp-edit-btn" onClick={()=>{setDrill({c,idx});setEditPhases(false);}}><FaEdit/> Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Drilldown Modal --- */}
      {drill && (
        <div className="irtp-modal-overlay">
          <div className="irtp-modal">
            <div className="irtp-modal-header">
              <FaHeartbeat/> {drill.c.athlete} ({drill.c.team}) – {drill.c.injury}
              <button className="irtp-modal-close" onClick={()=>setDrill(null)}>×</button>
            </div>
            <div className="irtp-modal-status">
              {riskBadge(drill.c.risk)}
              <button className="irtp-pdf-btn" onClick={()=>exportPDF(drill.c)}><FaDownload /> PDF</button>
            </div>
            {/* Protocol Timeline */}
            <div className="irtp-modal-timeline-title"><FaClock/> Protocol Timeline & Days</div>
            {!editPhases ? (
              <div className="irtp-modal-timeline">
                {drill.c.protocol.map((p,i) => {
                  const days = daysBetween(p.start, p.end||today());
                  const isOver = (days > AVG_DAYS[p.step]) && p.cleared !== true;
                  return (
                    <div className={`irtp-modal-phase${p.cleared?" irtp-modal-phase-cleared":""}${i===drill.c.currentPhase-1?" irtp-modal-phase-active":""}`} key={p.step}>
                      <div className="irtp-phase-step">{p.step}</div>
                      <div className="irtp-phase-staff">{p.staff || "-"}</div>
                      <div className="irtp-phase-dates">{p.start} → {p.end||"active"}</div>
                      <div className="irtp-phase-days">
                        <FaInfoCircle/> {days}d <span className={isOver?"irtp-overdue-days":""} title="Industry standard">{isOver?" (Overdue)":""}</span>
                      </div>
                      <div className="irtp-phase-status">
                        {p.cleared
                          ? <span className="irtp-phase-badge irtp-phase-ok"><FaCheckCircle/> Cleared</span>
                          : <span className="irtp-phase-badge irtp-phase-warn">Active</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <PhaseEditor protocol={drill.c.protocol} onUpdate={proto=>updatePhase(drill.idx,proto)} />
            )}
            <button className="irtp-phaseeditor-btn" style={{marginTop:8,marginBottom:8}} onClick={()=>setEditPhases(e=>!e)}>{editPhases?"Done":"Edit Protocol Phases"}</button>
            {/* Notes log */}
            <div className="irtp-modal-notes-title"><FaClipboardList/> Protocol Log</div>
            <div className="irtp-modal-notes-list">
              {drill.c.notes.map((n,i)=>
                <div className="irtp-modal-note" key={i}>
                  <span className="irtp-modal-note-date">{n.date}</span>
                  <span className="irtp-modal-note-user">{n.user}</span>
                  <span className="irtp-modal-note-text">{n.text}</span>
                </div>
              )}
            </div>
            <div style={{marginTop:8, display:'flex', alignItems:'center', gap:10}}>
              <input type="text" value={addNote} onChange={e=>setAddNote(e.target.value)} placeholder="Add protocol note..."/>
              <button className="irtp-addnote-btn" onClick={()=>addNewNote(drill.idx)}><FaPlus/> Add</button>
            </div>
            {/* Compliance */}
            <div className="irtp-modal-compliance">
              <b>Compliance:</b>
              <button className={`irtp-sign-btn${drill.c.compliance.signedOff?" irtp-signed":""}`} onClick={()=>toggleSignOff(drill.idx)}>
                <FaSignature/> Medical Sign-off: {drill.c.compliance.signedOff?"Yes":"No"}
              </button>
              <button className={`irtp-sign-btn${drill.c.compliance.boardAttest?" irtp-signed":""}`} onClick={()=>toggleAttest(drill.idx)}>
                <FaUserTie/> Board Attest: {drill.c.compliance.boardAttest?"Yes":"No"}
              </button>
            </div>
            {/* Full audit log */}
            <div className="irtp-modal-notes-title"><FaHistory/> Action Log</div>
            <div className="irtp-modal-notes-list">
              {drill.c.actionLog.map((log,i)=>
                <div className="irtp-modal-note" key={i}>
                  <span className="irtp-modal-note-date">{log.time}</span>
                  <span className="irtp-modal-note-user">{log.who}</span>
                  <span className="irtp-modal-note-text">{log.action}</span>
                </div>
              )}
            </div>
            <div className="irtp-tagline irtp-tagline-sticky">BE REAL. BE VERO.</div>
          </div>
        </div>
      )}

      <div className="irtp-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
