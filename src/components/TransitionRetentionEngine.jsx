import React, { useState } from "react";
import {
  FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaFileExport, FaRobot, FaClipboardList, FaLightbulb, FaChartBar, FaUserFriends, FaEnvelope, FaCommentDots, FaBell, FaUsers, FaStar, FaUserTie
} from "react-icons/fa";

// --- DEMO DATA ENRICHED --- //
const transitions = [
  {
    name: "Ivan Radic", from: "U16", to: "U18", risk: 0.75, readiness: 67, phase: "Development", age: 16, status: "Pending",
    bio: "Late", pulse: { athlete: 6, coach: 8, parent: 7, physio: 7, director: 6 },
    profile: { academic: 3, physical: 7, mental: 6, social: 5, summary: "Struggles with school workload, bio-late, needs more mentor check-ins." },
    flight: [
      { date: "2024-04-20", type: "Start", desc: "Coach meeting" },
      { date: "2024-05-03", type: "Parent call", desc: "Discussed new squad" },
      { date: "2024-06-01", type: "Expected Move", desc: "Transition date" }
    ],
    drivers: { motivation: 2, academics: 3, coach: 3, playing: 1, injury: 0, phv: 2 },
    touchpoints: [
      { date: "2024-05-03", by: "Coach", type: "Parent call", note: "Discussed new squad" },
      { date: "2024-05-08", by: "Athlete", type: "1:1", note: "Shared anxieties" }
    ],
    lastAction: "Parent call",
    comments: [{ by: "Director", text: "Schedule extra mentoring ASAP.", date: "2024-05-08" }]
  },
  {
    name: "Marko Proleta", from: "U18", to: "Senior", risk: 0.35, readiness: 87, phase: "Performance", age: 18, status: "Pending",
    bio: "On-time", pulse: { athlete: 8, coach: 9, parent: 8, physio: 8, director: 8 },
    profile: { academic: 7, physical: 8, mental: 9, social: 8, summary: "Mentally strong, physically ready, strong parent/coach support." },
    flight: [
      { date: "2024-04-10", type: "Start", desc: "Coach 1:1" },
      { date: "2024-05-05", type: "Mentoring", desc: "Senior mentor assigned" },
      { date: "2024-06-10", type: "Expected Move", desc: "First Senior practice" }
    ],
    drivers: { motivation: 1, academics: 0, coach: 2, playing: 3, injury: 0, phv: 0 },
    touchpoints: [
      { date: "2024-05-05", by: "Coach", type: "Athlete 1:1", note: "Mentoring on expectations" }
    ],
    lastAction: "Mentoring",
    comments: []
  },
  {
    name: "Filip Sesar", from: "U14", to: "U16", risk: 0.15, readiness: 91, phase: "Foundation", age: 14, status: "Completed",
    bio: "Early", pulse: { athlete: 9, coach: 9, parent: 9, physio: 8, director: 9 },
    profile: { academic: 8, physical: 9, mental: 8, social: 8, summary: "Proactive, excellent support, bio-early." },
    flight: [
      { date: "2024-03-15", type: "Start", desc: "DoC info session" },
      { date: "2024-04-28", type: "Parent Workshop", desc: "Explained next phase" },
      { date: "2024-05-15", type: "Completed", desc: "Transitioned to U16" }
    ],
    drivers: { motivation: 0, academics: 0, coach: 1, playing: 0, injury: 0, phv: 0 },
    touchpoints: [
      { date: "2024-04-28", by: "DoC", type: "Parent workshop", note: "Explained next phase" }
    ],
    lastAction: "Parent workshop",
    comments: []
  },
  {
    name: "Luka Prkacin", from: "U18", to: "Senior", risk: 0.52, readiness: 84, phase: "Performance", age: 18, status: "Pending",
    bio: "On-time", pulse: { athlete: 8, coach: 7, parent: 7, physio: 8, director: 7 },
    profile: { academic: 6, physical: 9, mental: 8, social: 7, summary: "Top athlete, but needs more academic focus, squad integration plan." },
    flight: [
      { date: "2024-03-11", type: "Start", desc: "Squad leadership assigned" },
      { date: "2024-05-01", type: "Coach 1:1", desc: "Academic plan discussed" },
      { date: "2024-06-20", type: "Expected Move", desc: "First Senior game" }
    ],
    drivers: { motivation: 3, academics: 1, coach: 1, playing: 2, injury: 0, phv: 1 },
    touchpoints: [
      { date: "2024-05-01", by: "Coach", type: "Academic meeting", note: "Discussed workload management" }
    ],
    lastAction: "Academic meeting",
    comments: [{ by: "Coach", text: "Monitor for burnout risk in next 2 months.", date: "2024-05-02" }]
  },
  {
    name: "Antonio Katic", from: "U12", to: "U14", risk: 0.22, readiness: 80, phase: "Foundation", age: 13, status: "Pending",
    bio: "Early", pulse: { athlete: 7, coach: 7, parent: 8, physio: 7, director: 7 },
    profile: { academic: 7, physical: 7, mental: 7, social: 8, summary: "Steady progress, well-balanced, very engaged parent." },
    flight: [
      { date: "2024-02-11", type: "Start", desc: "Parent intro call" },
      { date: "2024-03-01", type: "Coach 1:1", desc: "Discussed expectations" },
      { date: "2024-04-15", type: "Expected Move", desc: "U14 squad entry" }
    ],
    drivers: { motivation: 1, academics: 1, coach: 0, playing: 1, injury: 0, phv: 1 },
    touchpoints: [
      { date: "2024-03-01", by: "Coach", type: "Expectations", note: "Set clear plan with family" }
    ],
    lastAction: "Expectations",
    comments: []
  }
];

const riskDrivers = [
  { key: "motivation", label: "Motivation" }, { key: "academics", label: "Academics" }, { key: "coach", label: "Coach Fit" },
  { key: "playing", label: "Playing Time" }, { key: "injury", label: "Injury/Return" }, { key: "phv", label: "PHV/Bio" }
];

const interventionsInit = [
  { name: "Ivan Radic", date: "2024-05-04", action: "Assigned mentor; parent call", outcome: "Pending", who: "Coach/Parent", ROI: "+6%" }
];
const historicDropouts = [
  { name: "Petar K.", from: "U18", to: "Senior", reason: "Playing time", year: 2023 },
  { name: "Bruno L.", from: "U16", to: "U18", reason: "Academic", year: 2022 },
  { name: "Leon B.", from: "U14", to: "U16", reason: "Burnout", year: 2023 }
];
const cohortStats = [
  { phase: "U16→U18", year: 2023, success: 10, dropout: 3 },
  { phase: "U18→Senior", year: 2023, success: 5, dropout: 2 },
  { phase: "U14→U16", year: 2023, success: 12, dropout: 2 }
];
const commsLogInit = [
  { date: "2024-05-09", by: "Coach Sesar", to: "Parent", type: "Call", msg: "Explained risk, planned support" },
  { date: "2024-04-15", by: "Parent", to: "Coach", type: "Email", msg: "Family travel planned; risk of missed games" }
];
const auditLogInit = [
  { date: "2024-05-12", user: "Board", action: "Exported transition board pack" },
  { date: "2024-05-13", user: "Coach Jusup", action: "Added mentoring intervention for Ivan Radic" }
];
const learningFeedInit = [
  { date: "2024-05-14", title: "Mentoring on academic risk", result: "Reduced dropout by 7%", type: "Success" },
  { date: "2024-05-13", title: "Extra comms U18", result: "No impact", type: "Neutral" },
  { date: "2024-04-22", title: "Peer mentoring U14", result: "Boosted readiness", type: "Success" }
];

const globalBenchmarks = [
  { phase: "U16→U18", risk: 0.54, bestPractice: "Peer mentor program, coach-parent workshops, weekly check-ins" },
  { phase: "U18→Senior", risk: 0.39, bestPractice: "Early senior integration, role clarity sessions, academic counseling" },
  { phase: "U14→U16", risk: 0.35, bestPractice: "Growth/bio education, group socialization, family onboarding" }
];

// --- HELPERS --- //
function riskColor(val) { if (val >= 0.7) return "#ff4848"; if (val >= 0.4) return "#FFD700"; return "#1de682"; }
function riskLabel(val) { if (val >= 0.7) return "HIGH"; if (val >= 0.4) return "MODERATE"; return "LOW"; }
function readinessColor(val) { if (val >= 85) return "#1de682"; if (val >= 65) return "#FFD700"; return "#ff4848"; }
function aiScenario(name, risk, drivers) {
  if (risk >= 0.7) {
    let d = [];
    if (drivers.academics >= 2) d.push("Academic");
    if (drivers.motivation >= 2) d.push("Motivation");
    if (drivers.playing >= 2) d.push("Playing Time");
    if (drivers.coach >= 2) d.push("Coach Fit");
    return `HIGH dropout risk (${d.join(", ")}). Delay, boost support, assign mentor, communicate weekly.`;
  }
  if (risk >= 0.4) return `Moderate risk: Assign mentor, check-in before/after transition, increase coach-athlete contact.`;
  return `Promotion safe—focus on integration, squad bonding, and performance targets.`;
}
function scenarioSim(action, risk) {
  if (action.includes("mentor")) return risk - 0.19;
  if (action.includes("delay")) return risk - 0.08;
  if (action.includes("extra comms")) return risk - 0.12;
  return risk;
}

// --- COMPONENTS --- //
function LearningFeed({ learningFeed }) {
  return (
    <div style={{ background: "#FFD70022", borderRadius: 11, padding: 13, marginBottom: 9 }}>
      <b style={{ color: "#FFD700", fontSize: 16 }}><FaRobot style={{ marginRight: 7 }} /> Learning Feed</b>
      <ul>
        {learningFeed.map((l, i) =>
          <li key={i}>[{l.date}] {l.title} – {l.result} <span style={{ color: l.type === "Success" ? "#1de682" : "#FFD700" }}>{l.type}</span></li>
        )}
      </ul>
    </div>
  );
}
function RiskTimeline({ transitions, interventions, auditLog }) {
  const events = [
    ...transitions.flatMap(t => t.flight.map(f => ({ date: f.date, event: `${t.name}: ${f.type} (${f.desc})` }))),
    ...interventions.map(i => ({ date: i.date, event: `${i.name}: ${i.action}` })),
    ...auditLog.map(a => ({ date: a.date, event: `Audit: ${a.user} - ${a.action}` }))
  ].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div style={{ background: "#FFD70022", borderRadius: 11, padding: 13 }}>
      <b style={{ color: "#FFD700", fontSize: 16 }}><FaChartBar style={{ marginRight: 7 }} /> Risk/Event Timeline</b>
      <ul>
        {events.map((e, i) => <li key={i}>[{e.date}] {e.event}</li>)}
      </ul>
    </div>
  );
}
function ActionWorkflow({ interventions }) {
  return (
    <div style={{ background: "#FFD70022", borderRadius: 13, padding: 13, marginBottom: 9 }}>
      <b style={{ color: "#FFD700", fontSize: 16 }}><FaClipboardList style={{ marginRight: 7 }} /> Action Workflow</b>
      <table style={{ width: "100%", fontSize: 14, fontWeight: 700, borderRadius: 8 }}>
        <thead>
          <tr>
            <th>Action</th><th>Who</th><th>Status</th><th>ROI</th><th>Escalate</th>
          </tr>
        </thead>
        <tbody>
          {interventions.map((iv, i) =>
            <tr key={i}>
              <td>{iv.action}</td>
              <td>{iv.who}</td>
              <td>
                {iv.outcome === "Pending" ? <FaExclamationTriangle color="#FFD700" /> : <FaCheckCircle color="#1de682" />}
                {iv.outcome}
              </td>
              <td>{iv.ROI}</td>
              <td>{iv.outcome === "Pending" && <button onClick={() => alert("Escalated to Board!")} style={{
                background: "#ff4848", color: "#fff", borderRadius: 6, fontWeight: 800, fontSize: 13, padding: "2px 10px"
              }}><FaBell /> Escalate</button>}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function CrisisRadar({ crisisTransitions, globalBenchmarks }) {
  return (
    <div style={{ background: "#ff484822", borderRadius: 12, padding: 12, marginBottom: 9 }}>
      <b style={{ color: "#ff4848", fontSize: 18 }}><FaBell style={{ marginRight: 7 }} /> Crisis Radar: Live Critical Transitions</b>
      <ul>
        {crisisTransitions.map((t, i) => (
          <li key={i}><FaExclamationTriangle color="#ff4848" /> <b>{t.name}</b> {t.from}→{t.to}, Risk: <b style={{ color: "#ff4848" }}>{Math.round(t.risk * 100)}%</b></li>
        ))}
      </ul>
      <div style={{ marginTop: 8 }}>
        <b>Global Benchmark:</b>
        {globalBenchmarks.map((b, i) =>
          <div key={i}>
            <span style={{ color: "#FFD700" }}>{b.phase}: </span>
            <span>Avg Risk: <b style={{ color: "#FFD700" }}>{Math.round(b.risk * 100)}%</b></span>
            <span> | Best Practice: <span style={{ color: "#1de682" }}>{b.bestPractice}</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
function Playbook({ phase }) {
  const best = globalBenchmarks.find(b => b.phase === phase);
  return (
    <div style={{ background: "#FFD70022", borderRadius: 12, padding: 12, marginBottom: 9 }}>
      <b style={{ color: "#FFD700", fontSize: 17 }}><FaStar style={{ marginRight: 7 }} /> Global Intervention Playbook</b>
      <div>{best ? best.bestPractice : "No best-practice data for this phase."}</div>
    </div>
  );
}
function PulseGraph({ t }) {
  return (
    <div style={{ background: "#FFD70022", borderRadius: 12, padding: 12, marginBottom: 8 }}>
      <b style={{ color: "#FFD700", fontSize: 16 }}><FaUsers style={{ marginRight: 7 }} /> Stakeholder Pulse Score</b>
      <div style={{ display: "flex", gap: 9 }}>
        {Object.entries(t.pulse).map(([role, val]) =>
          <div key={role} style={{ textAlign: "center" }}>
            <div style={{
              width: 24, height: 24, borderRadius: 12, background: readinessColor(val * 10), color: "#232a2e", fontWeight: 900, fontSize: 16, marginBottom: 2
            }}>{val}</div>
            <div style={{ fontSize: 13 }}>{role.charAt(0).toUpperCase() + role.slice(1)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN MODULE --- //
const TransitionRetentionEngine = () => {
  const [selected, setSelected] = useState([0]);
  const [interventions, setInterventions] = useState(interventionsInit);
  const [newAction, setNewAction] = useState("");
  const [exporting, setExporting] = useState(false);
  const [commsLog, setCommsLog] = useState(commsLogInit);
  const [auditLog, setAuditLog] = useState(auditLogInit);
  const [comments, setComments] = useState(transitions.map(t => t.comments || []));
  const [commentText, setCommentText] = useState("");
  const [learningFeed, setLearningFeed] = useState(learningFeedInit);
  const crisisTransitions = transitions.filter(t => t.risk >= 0.7);

  function toggleSelect(idx) {
    setSelected(selected.includes(idx)
      ? selected.filter(i => i !== idx)
      : [...selected, idx].slice(0, 3));
  }
  function addIntervention(idx) {
    const t = transitions[idx];
    if (!newAction.trim()) return;
    setInterventions([{ name: t.name, date: new Date().toISOString().slice(0, 10), action: newAction, outcome: "Pending", who: "Board/Coach/Parent", ROI: "+6%" }, ...interventions]);
    setNewAction("");
    setAuditLog([{ date: new Date().toISOString().slice(0, 10), user: "Board", action: `Intervention added for ${t.name}` }, ...auditLog]);
    setLearningFeed([{ date: new Date().toISOString().slice(0, 10), title: newAction, result: "Logged for monitoring", type: "Neutral" }, ...learningFeed]);
  }
  function exportReport() {
    setExporting(true);
    setTimeout(() => {
      alert("Exported PDF/CSV: all transitions, readiness, risk, bio, ROI, drivers, flight paths, interventions, logs, cohort analytics, AI, comms, and scenarios.");
      setExporting(false);
      setAuditLog([{ date: new Date().toISOString().slice(0, 10), user: "Board", action: "Exported board pack" }, ...auditLog]);
    }, 1200);
  }
  function addComment(idx) {
    if (!commentText.trim()) return;
    const date = new Date().toISOString().slice(0, 10);
    setComments(comments.map((arr, i) =>
      i !== idx ? arr : [{ by: "Board", text: commentText, date }, ...arr]
    ));
    setCommentText("");
    setAuditLog([{ date, user: "Board", action: `Commented on ${transitions[idx].name}` }, ...auditLog]);
  }

  const selectedTransitions = selected.map(idx => transitions[idx]);

  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 36, maxWidth: 2600, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
        <FaArrowRight size={32} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>Transition Retention Engine <span style={{ color: "#FFD70088", fontWeight: 600, fontSize: 17 }}>SUPREME BOARDROOM OS</span></h2>
        <span style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 10, padding: '8px 25px',
          fontSize: 17, marginLeft: 17
        }}>CourtEvo Vero</span>
        <button onClick={exportReport} disabled={exporting} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900,
          fontSize: 17, padding: "9px 23px", marginLeft: 20
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> {exporting ? "Exporting..." : "Export Board PDF/CSV"}
        </button>
      </div>
      <CrisisRadar crisisTransitions={crisisTransitions} globalBenchmarks={globalBenchmarks} />
      <div style={{ margin: "12px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}>Select 1–3 Athletes for Compare: </b>
        {transitions.map((a, idx) =>
          <button key={a.name} onClick={() => toggleSelect(idx)}
            style={{
              background: selected.includes(idx) ? "#FFD700" : "#232a2e",
              color: selected.includes(idx) ? "#232a2e" : "#FFD700",
              fontWeight: 800, border: "none", borderRadius: 8, padding: "7px 13px", margin: 2, cursor: "pointer"
            }}>{a.name}</button>
        )}
      </div>
      {/* Compare Section */}
      <div style={{ display: "flex", gap: 26 }}>
        {selectedTransitions.map((t, idx) => (
          <div key={t.name} style={{
            background: "#232a2e", border: "2px solid #FFD70033", borderRadius: 17, padding: "19px 22px", minWidth: 410, flex: 1, boxShadow: "0 2px 12px #FFD70022"
          }}>
            <PulseGraph t={t} />
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 20, marginBottom: 3 }}>
              {t.name} ({t.from}→{t.to}) <span style={{
                background: riskColor(t.risk), color: "#232a2e", borderRadius: 7, padding: "3px 9px", fontWeight: 900, marginLeft: 7, fontSize: 15
              }}>{riskLabel(t.risk)}</span>
              <span style={{
                background: readinessColor(t.readiness), color: "#232a2e", borderRadius: 7, padding: "3px 9px", fontWeight: 900, marginLeft: 8, fontSize: 15
              }}>Readiness: {t.readiness}</span>
              <span style={{
                background: "#FFD70022", color: "#FFD700", borderRadius: 7, padding: "3px 8px", fontWeight: 800, marginLeft: 8, fontSize: 14
              }}>Bio: {t.bio}</span>
            </div>
            <Playbook phase={`${t.from}→${t.to}`} />
            <div style={{ background: "#FFD70022", borderRadius: 14, padding: 13, marginBottom: 11 }}>
              <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 18 }}>{t.name} – Athlete Profile</div>
              <div style={{ marginTop: 5, color: "#FFD700" }}>
                <b>Physical:</b> {t.profile.physical}/10 &nbsp;
                <b>Mental:</b> {t.profile.mental}/10 &nbsp;
                <b>Academic:</b> {t.profile.academic}/10 &nbsp;
                <b>Social:</b> {t.profile.social}/10 &nbsp;
              </div>
              <div style={{ marginTop: 4, color: "#FFD700" }}>
                <b>Summary:</b> {t.profile.summary}
              </div>
              <div style={{ marginTop: 7 }}>
                <b>Board/Coach/Parent Comments</b>
                <ul>
                  {comments[idx]?.map((c, i) => (
                    <li key={i}>[{c.date}] <b>{c.by}</b>: {c.text}</li>
                  ))}
                </ul>
                <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add comment..." style={{
                  borderRadius: 7, border: "1.2px solid #FFD70077", fontSize: 15, padding: 6, background: "#fff", color: "#232a2e", width: "90%", marginTop: 7
                }} />
                <button onClick={() => addComment(idx)} style={{
                  background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "5px 14px", marginTop: 6
                }}>Add Comment</button>
              </div>
            </div>
            {/* Flight path, drivers, AI scenario, workflow */}
            <b style={{ color: "#FFD700", fontSize: 15 }}>Flight Path</b>
            <ul>
              {t.flight.map((f, i) =>
                <li key={i} style={{ color: f.type === "Expected Move" ? "#FFD700" : "#1de682", fontWeight: f.type === "Expected Move" ? 900 : 700 }}>
                  [{f.date}] {f.type}: {f.desc}
                </li>
              )}
            </ul>
            <div style={{ margin: "8px 0 8px 0" }}>
              <b style={{ color: "#FFD700", fontSize: 15 }}>Risk Drivers</b>
              <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 15, marginTop: 5 }}>
                <tbody>
                  <tr>
                    {riskDrivers.map(d => (
                      <td key={d.key} style={{
                        background: t.drivers[d.key] >= 2 ? "#ff4848" : t.drivers[d.key] === 1 ? "#FFD700" : "#1de682",
                        color: "#232a2e", fontWeight: 900, borderRadius: 6, padding: "5px 7px"
                      }}>{d.label}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 7 }}>
              <b style={{ color: "#FFD700", fontSize: 15 }}><FaRobot style={{ marginRight: 6 }} />Scenario Simulator</b>
              <div style={{ background: "#FFD70022", borderRadius: 9, padding: 9, color: "#FFD700", fontWeight: 800, marginBottom: 7 }}>
                {aiScenario(t.name, t.risk, t.drivers)}
              </div>
              <div>
                <b style={{ color: "#FFD700", fontSize: 14 }}>Simulate Action:</b>
                <button onClick={() => alert(`Predicted risk if assigned mentor: ${Math.round(scenarioSim("mentor", t.risk)*100)}%`)} style={{
                  background: "#1de682", color: "#232a2e", borderRadius: 6, fontWeight: 800, marginRight: 5, fontSize: 14, padding: "3px 10px"
                }}>Assign Mentor</button>
                <button onClick={() => alert(`Predicted risk if transition delayed: ${Math.round(scenarioSim("delay", t.risk)*100)}%`)} style={{
                  background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 800, marginRight: 5, fontSize: 14, padding: "3px 10px"
                }}>Delay Move</button>
                <button onClick={() => alert(`Predicted risk if extra comms: ${Math.round(scenarioSim("extra comms", t.risk)*100)}%`)} style={{
                  background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 800, fontSize: 14, padding: "3px 10px"
                }}>Extra Comms</button>
              </div>
            </div>
            <ActionWorkflow interventions={interventions.filter(iv => iv.name === t.name)} />
          </div>
        ))}
      </div>
      <div style={{ margin: "31px 0 12px 0" }}>
        <LearningFeed learningFeed={learningFeed} />
      </div>
      <div style={{ margin: "31px 0 12px 0" }}>
        <RiskTimeline transitions={transitions} interventions={interventions} auditLog={auditLog} />
      </div>
      <div style={{ display: "flex", gap: 28, marginTop: 21 }}>
        <div>
          <b style={{ color: "#FFD700", fontSize: 18 }}><FaChartBar style={{ marginRight: 7 }} /> Cohort Analytics</b>
          <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 15, width: 500 }}>
            <thead>
              <tr>
                <th>Phase</th><th>Year</th><th>Success</th><th>Dropout</th>
              </tr>
            </thead>
            <tbody>
              {cohortStats.map((c, i) =>
                <tr key={i}>
                  <td>{c.phase}</td>
                  <td>{c.year}</td>
                  <td style={{ color: "#1de682" }}>{c.success}</td>
                  <td style={{ color: "#ff4848" }}>{c.dropout}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <b style={{ color: "#FFD700", fontSize: 18 }}>Historic Dropout Analytics</b>
          <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 15, width: 490 }}>
            <thead>
              <tr>
                <th>Athlete</th><th>From</th><th>To</th><th>Year</th><th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {historicDropouts.map((h, i) =>
                <tr key={i}>
                  <td>{h.name}</td>
                  <td>{h.from}</td>
                  <td>{h.to}</td>
                  <td>{h.year}</td>
                  <td>{h.reason}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <b style={{ color: "#FFD700", fontSize: 18 }}><FaClipboardList style={{ marginRight: 7 }} /> Audit Log</b>
          <ul style={{ color: "#FFD700", fontSize: 15 }}>
            {auditLog.map((a, i) =>
              <li key={i}>[{a.date}] {a.user}: {a.action}</li>
            )}
          </ul>
        </div>
      </div>
      <div style={{ margin: "14px 0 15px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 18 }}><FaClipboardList style={{ marginRight: 7 }} /> Communication Log</b>
        <ul style={{ color: "#FFD700", fontSize: 15 }}>
          {commsLog.map((c, i) =>
            <li key={i}>[{c.date}] {c.by} → {c.to} ({c.type}): {c.msg} <FaEnvelope style={{ marginLeft: 5, color: "#1de682" }} /></li>
          )}
        </ul>
      </div>
      {/* Supreme Boardroom Copilot */}
      <div style={{
        margin: "24px 0 0 0", background: "#FFD70022", color: "#FFD700", borderRadius: 12, padding: 15, fontWeight: 900, fontSize: 18
      }}>
        <FaRobot style={{ marginRight: 7 }} /> <b>AI Boardroom Copilot:</b>
        <div style={{ marginTop: 9, color: "#FFD700", fontWeight: 800, fontSize: 15 }}>
          Q: “What’s our biggest blind spot right now?” <br />
          <b>A:</b> “Monitoring late biological developers across U16→U18 transitions—extra support, academic interventions, and more transparent parent feedback loops recommended.”
        </div>
        <div style={{ marginTop: 11, color: "#FFD700", fontWeight: 800, fontSize: 15 }}>
          Q: “One-page board report on Filip Sesar?” <br />
          <b>A:</b> “Transitioned early from U14→U16, high readiness, strong social and academic support, no major risk events. System model for best-practice.”
        </div>
        <div style={{ marginTop: 13, color: "#FFD700", fontWeight: 800, fontSize: 15 }}>
          Q: “Show me only open risks for 2024-2025?” <br />
          <b>A:</b> {transitions.filter(t => t.status === "Pending" && t.risk >= 0.4).map(t =>
            <span key={t.name}>{t.name} ({t.from}→{t.to}) [{riskLabel(t.risk)}]; </span>
          )}
        </div>
      </div>
      <div style={{ marginTop: 15 }}>
        <button onClick={exportReport} disabled={exporting} style={{
          background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 16, padding: "7px 19px"
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> {exporting ? "Exporting..." : "Export Board PDF/CSV"}
        </button>
      </div>
      <div style={{ marginTop: 23, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | Transition Retention Engine – SUPREME BOARDROOM OS
      </div>
    </div>
  );
};

export default TransitionRetentionEngine;
