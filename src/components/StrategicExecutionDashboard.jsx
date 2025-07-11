import React, { useState, useRef } from "react";
import {
  FaUserTie, FaTasks, FaFlag, FaChartLine, FaFilePdf, FaDownload, FaChartBar, FaCalendarAlt,
  FaCheckCircle, FaClock, FaBug, FaRobot, FaFileAlt, FaExclamationTriangle, FaHistory,
  FaTag, FaFilter, FaSearch, FaGavel, FaRegThumbsUp, FaRegThumbsDown, FaExpand
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Sparkline chart (very basic)
function Sparkline({ data, color = "#FFD700", width = 48, height = 16 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const norm = v => height - ((v - min) / (max - min || 1)) * height;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${norm(v)}`).join(' ');
  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

// EXAMPLE BASE PLAN (add more fields: tags, kpis[], kpiHistory, history, votes, boardLog, etc.)
const BASE_PLAN = [
  {
    id: 1,
    title: "Grow Youth Participation",
    owner: "Petra",
    phase: "Execution",
    progress: 65,
    kpis: [{ name: "Active members", value: 260, trend: [200, 210, 250, 245, 260] }],
    risk: "amber",
    blockers: "School holiday dips",
    dependencies: ["Community Partnerships"],
    tags: ["Youth", "Community"],
    docs: [],
    notes: "Need more coaches for U10-U12.",
    timeline: "Q2–Q4",
    status: "On Track",
    history: [
      { date: "2024-05-20", action: "Created", by: "Petra" },
      { date: "2024-05-30", action: "Progress updated to 50%", by: "Petra" }
    ],
    votes: [],
    boardLog: [],
    scenario: "",
    aiRec: "",
    overdue: false
  },
  {
    id: 2,
    title: "Establish New Sponsor Pipeline",
    owner: "Tina",
    phase: "Planning",
    progress: 30,
    kpis: [{ name: "Sponsors contacted", value: 3, trend: [0, 2, 3, 3, 3] }],
    risk: "red",
    blockers: "Lack of contact list",
    dependencies: ["Board Approval"],
    tags: ["Commercial", "Sponsorship"],
    docs: [],
    notes: "Research regional brands.",
    timeline: "Q2",
    status: "Behind",
    history: [{ date: "2024-05-20", action: "Created", by: "Tina" }],
    votes: [],
    boardLog: [],
    scenario: "",
    aiRec: "",
    overdue: true
  },
  {
    id: 3,
    title: "Digitalize Club Ops",
    owner: "Jakov",
    phase: "Review",
    progress: 90,
    kpis: [
      { name: "Automation %", value: 88, trend: [30, 45, 65, 80, 88] },
      { name: "Error rate", value: 2, trend: [6, 4, 3, 2, 2] }
    ],
    risk: "green",
    blockers: "",
    dependencies: ["IT Vendor"],
    tags: ["Operations", "Digital"],
    docs: [],
    notes: "Staff training complete.",
    timeline: "Q1–Q3",
    status: "Ahead",
    history: [],
    votes: [],
    boardLog: [],
    scenario: "",
    aiRec: "",
    overdue: false
  },
  {
    id: 4,
    title: "Launch Elite Coach Development Program",
    owner: "Ivan",
    phase: "Execution",
    progress: 50,
    kpis: [{ name: "Coaches certified", value: 7, trend: [0, 1, 3, 5, 7] }],
    risk: "amber",
    blockers: "Scheduling conflicts",
    dependencies: [],
    tags: ["Coach", "Development"],
    docs: [],
    notes: "",
    timeline: "Q2–Q4",
    status: "On Track",
    history: [],
    votes: [],
    boardLog: [],
    scenario: "",
    aiRec: "",
    overdue: false
  }
];

// Tag color palette
const TAG_COLORS = {
  Youth: "#44b8ff",
  Commercial: "#FFD700",
  Sponsorship: "#ff78c7",
  Community: "#1de682",
  Operations: "#7e9fff",
  Digital: "#8f61ff",
  Coach: "#ffb366",
  Development: "#21c6b1"
};
const PHASE_COLORS = {
  Planning: "#FFD700",
  Execution: "#1de682",
  Review: "#66c1ff",
  Complete: "#a47fff"
};
const RISK_COLORS = {
  green: "#1de682",
  amber: "#FFD700",
  red: "#e94057"
};

// AI Recommendation and Scenario
function aiRecommendation(item) {
  if (item.risk === "red" || item.overdue) return "Immediate board action required: risk or overdue.";
  if (item.risk === "amber") return "Monitor closely. Clear blockers, update board if not resolved.";
  if ((item.kpis || []).some(k => (k.trend?.slice(-1)[0] || 0) < (k.trend?.slice(-2)[0] || 0))) return "Warning: KPI(s) trending down, investigate cause.";
  if (item.blockers && item.blockers.length > 1) return "Review blockers, reallocate resources if needed.";
  return "Progress on target.";
}

// Board voting logic
function voteSummary(votes = []) {
  const up = votes.filter(v => v === "up").length;
  const down = votes.filter(v => v === "down").length;
  return { up, down };
}

function downloadCSV(plan) {
  let csv = "Title,Owner,Phase,Progress,Tags,KPIs,Risk,Blockers,Dependencies,Timeline,Status,Notes\n";
  plan.forEach(i => {
    csv += `"${i.title}","${i.owner}","${i.phase}","${i.progress}%","${(i.tags || []).join('; ')}","${(i.kpis || []).map(k => `${k.name}:${k.value}`).join('; ')}","${i.risk}","${i.blockers}","${i.dependencies.join('; ')}","${i.timeline}","${i.status}","${i.notes.replace(/"/g, '""')}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `StrategicExecutionPlan_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function PhaseBadge({ phase }) {
  return (
    <span style={{
      color: PHASE_COLORS[phase] || "#fff",
      background: "#232a2e",
      border: `1.5px solid ${PHASE_COLORS[phase] || "#fff"}`,
      borderRadius: 8,
      fontWeight: 800,
      padding: "2px 10px",
      fontSize: 15
    }}>{phase}</span>
  );
}
function RiskFlag({ risk }) {
  return (
    <span style={{
      color: "#fff",
      background: RISK_COLORS[risk] || "#FFD700",
      borderRadius: 8,
      fontWeight: 800,
      padding: "2px 9px",
      fontSize: 15,
      marginLeft: 6
    }}>
      {risk === "green" && <FaCheckCircle style={{ marginBottom: -2, marginRight: 3 }} />}
      {risk === "amber" && <FaExclamationTriangle style={{ marginBottom: -2, marginRight: 3 }} />}
      {risk === "red" && <FaFlag style={{ marginBottom: -2, marginRight: 3 }} />}
      {risk.toUpperCase()}
    </span>
  );
}
function TagBadges({ tags = [] }) {
  return (
    <span>
      {tags.map(tag => (
        <span key={tag} style={{
          background: TAG_COLORS[tag] || "#FFD70066",
          color: "#222", fontWeight: 800,
          fontSize: 13, padding: "1px 8px", borderRadius: 8, marginRight: 5
        }}>
          <FaTag style={{ marginBottom: -2, marginRight: 3 }} />{tag}
        </span>
      ))}
    </span>
  );
}

function GanttTimeline({ plan }) {
  // Fake timeline: Q1-Q4, 2024
  const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
  // Color per phase
  return (
    <div style={{
      background: "#232a2e", borderRadius: 18, boxShadow: "0 2px 16px #FFD70022",
      padding: 22, marginTop: 18, marginBottom: 17, overflowX: "auto"
    }}>
      <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 21, marginBottom: 8 }}>
        <FaChartBar style={{ marginBottom: -3, marginRight: 7 }} /> Gantt Timeline
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ color: "#FFD700", fontWeight: 700, fontSize: 15, padding: "7px 10px" }}>Initiative</th>
            {QUARTERS.map(q => <th key={q} style={{ color: "#FFD700", fontWeight: 700, fontSize: 15 }}>{q}</th>)}
          </tr>
        </thead>
        <tbody>
          {plan.map(item => (
            <tr key={item.id}>
              <td style={{ color: "#FFD700", fontWeight: 700, padding: "5px 10px" }}>{item.title}</td>
              {QUARTERS.map(q => (
                <td key={q} style={{ padding: "5px 10px" }}>
                  {/* Highlight cell if matches timeline */}
                  {item.timeline.includes(q) &&
                    <div style={{
                      background: PHASE_COLORS[item.phase],
                      color: "#232a2e", borderRadius: 7, fontWeight: 800,
                      fontSize: 14, textAlign: "center"
                    }}>
                      {item.phase}
                    </div>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoardLog({ boardLog = [] }) {
  if (!boardLog.length) return <span style={{ color: "#aaa" }}>No board decisions yet.</span>;
  return (
    <ul style={{ fontSize: 14, paddingLeft: 17 }}>
      {boardLog.map((log, idx) => (
        <li key={idx}>
          <FaGavel style={{ marginRight: 6 }} /> <b>{log.date}:</b> {log.note}
        </li>
      ))}
    </ul>
  );
}

function AuditHistory({ history = [] }) {
  if (!history.length) return <span style={{ color: "#aaa" }}>No changes yet.</span>;
  return (
    <ul style={{ fontSize: 13, paddingLeft: 17, color: "#FFD700" }}>
      {history.map((h, idx) => (
        <li key={idx}><FaHistory style={{ marginRight: 4 }} /> {h.date}: <b>{h.action}</b> <i style={{ color: "#1de682" }}>({h.by})</i></li>
      ))}
    </ul>
  );
}

// Drilldown modal/panel
function ItemDrilldown({ item, onClose, onUpdate }) {
  const [notes, setNotes] = useState(item.notes || "");
  const [docs, setDocs] = useState(item.docs || []);
  const [tagEdit, setTagEdit] = useState(item.tags ? item.tags.join(", ") : "");
  const [vote, setVote] = useState(null);
  const [boardNote, setBoardNote] = useState("");
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(34,42,46,0.98)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#232a2e", color: "#fff", borderRadius: 20, maxWidth: 530, width: "100%",
        padding: "38px 32px 26px 32px", boxShadow: "0 2px 32px #FFD70099"
      }}>
        <h3 style={{ color: "#FFD700", marginBottom: 11 }}>{item.title}</h3>
        <div style={{ marginBottom: 8 }}>
          <b>Phase:</b> <PhaseBadge phase={item.phase} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Owner:</b> <input value={item.owner} onChange={e => onUpdate({ ...item, owner: e.target.value })} style={{ fontSize: 15, borderRadius: 5 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Progress:</b> <input
            type="number"
            value={item.progress}
            min={0}
            max={100}
            onChange={e => onUpdate({ ...item, progress: Number(e.target.value) })}
            style={{ width: 60, fontSize: 15, borderRadius: 5 }} /> %
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>KPIs:</b>
          {(item.kpis || []).map((k, idx) => (
            <div key={idx} style={{ marginBottom: 3 }}>
              <input
                style={{ fontSize: 14, borderRadius: 4, marginRight: 6 }}
                value={k.name}
                onChange={e => {
                  const arr = [...item.kpis];
                  arr[idx].name = e.target.value;
                  onUpdate({ ...item, kpis: arr });
                }}
              />
              <input
                type="number"
                style={{ width: 55, fontSize: 14, borderRadius: 4, marginRight: 8 }}
                value={k.value}
                onChange={e => {
                  const arr = [...item.kpis];
                  arr[idx].value = Number(e.target.value);
                  onUpdate({ ...item, kpis: arr });
                }}
              />
              <Sparkline data={k.trend} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Tags:</b> <input value={tagEdit} onChange={e => setTagEdit(e.target.value)} onBlur={() => onUpdate({ ...item, tags: tagEdit.split(',').map(s => s.trim()) })} style={{ fontSize: 15, borderRadius: 5, width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Risk:</b>{" "}
          <select value={item.risk} onChange={e => onUpdate({ ...item, risk: e.target.value })}>
            <option value="green">Green</option><option value="amber">Amber</option><option value="red">Red</option>
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Blockers:</b> <input value={item.blockers} onChange={e => onUpdate({ ...item, blockers: e.target.value })} style={{ fontSize: 15, borderRadius: 5, width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Dependencies:</b> <input value={item.dependencies.join(', ')} onChange={e => onUpdate({ ...item, dependencies: e.target.value.split(',').map(s => s.trim()) })} style={{ fontSize: 15, borderRadius: 5, width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Timeline:</b> <input value={item.timeline} onChange={e => onUpdate({ ...item, timeline: e.target.value })} style={{ fontSize: 15, borderRadius: 5 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Status:</b> <input value={item.status} onChange={e => onUpdate({ ...item, status: e.target.value })} style={{ fontSize: 15, borderRadius: 5 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Notes:</b>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => onUpdate({ ...item, notes })}
            style={{ width: "100%", fontSize: 14, borderRadius: 5 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Docs:</b>
          <input
            type="file"
            multiple
            onChange={e => {
              const files = Array.from(e.target.files);
              setDocs(docs.concat(files));
              onUpdate({ ...item, docs: docs.concat(files) });
            }}
          />
          {docs && docs.length > 0 && (
            <ul style={{ color: "#FFD700", fontSize: 14, marginTop: 4 }}>
              {docs.map((f, idx) => <li key={idx}><FaFileAlt /> {typeof f === "string" ? f : f.name}</li>)}
            </ul>
          )}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Audit Log:</b> <AuditHistory history={item.history} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Board Decision Log:</b> <BoardLog boardLog={item.boardLog} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>AI Scenario Modeling:</b>
          <textarea
            rows={2}
            placeholder="Describe your what-if scenario (e.g., 'If we move resource from A to B…')"
            value={item.scenario || ""}
            onChange={e => onUpdate({ ...item, scenario: e.target.value })}
            style={{ width: "100%", fontSize: 14, borderRadius: 5 }}
          />
          <div style={{ color: "#FFD700cc", fontSize: 14, marginTop: 2 }}>
            {/* AI-powered simulation placeholder */}
            {item.scenario && <b>AI: </b>}<i>{item.scenario ? "If scenario implemented, estimated impact will be displayed here (integration-ready)." : "Try an 'if-then' scenario for instant recommendations."}</i>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Board Voting:</b>
          <span style={{ marginLeft: 8 }}>
            <button onClick={() => { setVote("up"); onUpdate({ ...item, votes: [...(item.votes || []), "up"] }); }} style={{ fontSize: 16, color: "#1de682", marginRight: 8, background: "none", border: "none" }}><FaRegThumbsUp /></button>
            <button onClick={() => { setVote("down"); onUpdate({ ...item, votes: [...(item.votes || []), "down"] }); }} style={{ fontSize: 16, color: "#e94057", background: "none", border: "none" }}><FaRegThumbsDown /></button>
            <span style={{ marginLeft: 7 }}>
              {voteSummary(item.votes).up} 👍 / {voteSummary(item.votes).down} 👎
            </span>
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Add Board Decision:</b>
          <input value={boardNote} onChange={e => setBoardNote(e.target.value)} style={{ fontSize: 14, borderRadius: 5, width: "82%" }} />
          <button onClick={() => {
            if (boardNote) {
              onUpdate({ ...item, boardLog: [...(item.boardLog || []), { date: new Date().toLocaleDateString(), note: boardNote }] });
              setBoardNote("");
            }
          }} style={{ fontSize: 14, marginLeft: 7, background: "#FFD700", color: "#232a2e", borderRadius: 5, fontWeight: 700 }}>+ Add</button>
        </div>
        <button onClick={onClose} style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 800, padding: "8px 30px", borderRadius: 10,
          marginTop: 17, fontSize: 18, display: "block", marginLeft: "auto"
        }}>Close</button>
      </div>
    </div>
  );
}

export default function StrategicExecutionDashboard() {
  const [plan, setPlan] = useState(BASE_PLAN);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [phaseFilter, setPhaseFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [boardMode, setBoardMode] = useState(false);
  const [drill, setDrill] = useState(null);

  // Board alerts: overdue or risk=red or >1 blocker
  const boardAlerts = plan.filter(i => i.overdue || i.risk === "red" || (i.blockers && i.blockers.split(",").length > 1));

  // Filter logic
  let filtered = plan;
  if (search.trim())
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.owner.toLowerCase().includes(search.toLowerCase()) ||
      (i.notes && i.notes.toLowerCase().includes(search.toLowerCase()))
    );
  if (tagFilter !== "All")
    filtered = filtered.filter(i => (i.tags || []).includes(tagFilter));
  if (riskFilter !== "All")
    filtered = filtered.filter(i => i.risk === riskFilter);
  if (phaseFilter !== "All")
    filtered = filtered.filter(i => i.phase === phaseFilter);
  if (ownerFilter !== "All")
    filtered = filtered.filter(i => i.owner === ownerFilter);

  // PDF export (board pack)
  const exportRef = useRef();
  const handlePDF = async () => {
    const canvas = await html2canvas(exportRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    pdf.addImage(imgData, "PNG", 25, 30, 770, 540);
    pdf.save("Strategic_Execution_Plan_BoardPack.pdf");
  };

  // Add a new initiative (for demo)
  function addDemoItem() {
    setPlan(plan => [
      ...plan,
      {
        id: plan.length + 1,
        title: "New Strategic Initiative",
        owner: "Ana",
        phase: "Planning",
        progress: 0,
        kpis: [{ name: "KPI Example", value: 0, trend: [0] }],
        risk: "green",
        blockers: "",
        dependencies: [],
        tags: [],
        docs: [],
        notes: "",
        timeline: "Q3–Q4",
        status: "Planning",
        history: [{ date: new Date().toLocaleDateString(), action: "Created", by: "Ana" }],
        votes: [],
        boardLog: [],
        scenario: "",
        aiRec: "",
        overdue: false
      }
    ]);
  }

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: boardMode ? 0 : 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 17 }}>
        <h2 style={{ color: "#FFD700", fontWeight: 800, fontSize: 32, letterSpacing: 2 }}>
          <FaTasks style={{ marginBottom: -7, marginRight: 7 }} /> Strategic Execution Plan Dashboard
        </h2>
        <div>
          <button
            onClick={() => setBoardMode(m => !m)}
            style={{
              background: boardMode ? "#FFD700" : "#232a2e",
              color: boardMode ? "#232a2e" : "#FFD700",
              border: "none", borderRadius: 8, fontWeight: 800, fontSize: 16, padding: "10px 18px", marginRight: 11
            }}
          ><FaExpand style={{ marginBottom: -2 }} /> {boardMode ? "Exit Boardroom" : "Boardroom Mode"}</button>
          <button onClick={handlePDF} style={{
            background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 16, padding: "10px 18px", marginRight: 11
          }}><FaFilePdf style={{ marginBottom: -2 }} /> Export PDF</button>
          <button onClick={() => downloadCSV(plan)} style={{
            background: "#1de682", color: "#232a2e", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 16, padding: "10px 18px"
          }}><FaDownload style={{ marginBottom: -2 }} /> Export CSV</button>
        </div>
      </div>
      {/* Board Alerts */}
      <div style={{
        background: "#e94057", color: "#fff", borderRadius: 16,
        padding: "13px 26px", fontWeight: 800, fontSize: 16, marginBottom: 19, boxShadow: "0 2px 24px #e9405712"
      }}>
        <FaExclamationTriangle style={{ marginRight: 12, fontSize: 20 }} />
        Board Alerts: {boardAlerts.length === 0 ? <span style={{ color: "#fff" }}>No urgent issues</span> :
          boardAlerts.map((i, idx) => <span key={i.id}>{i.title}{idx < boardAlerts.length - 1 ? ', ' : ''}</span>)}
      </div>
      {/* Advanced Filters/Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: "#FFD700" }}><FaFilter style={{ marginBottom: -2, marginRight: 4 }} /> Filters:</span>
        <input
          placeholder="Search initiatives…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 8, fontSize: 16, padding: "5px 13px", width: 180 }}
        />
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={{ borderRadius: 8, fontSize: 15 }}>
          <option>All</option>
          {Object.keys(TAG_COLORS).map(tag => <option key={tag}>{tag}</option>)}
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ borderRadius: 8, fontSize: 15 }}>
          <option>All</option><option value="green">Green</option><option value="amber">Amber</option><option value="red">Red</option>
        </select>
        <select value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)} style={{ borderRadius: 8, fontSize: 15 }}>
          <option>All</option><option>Planning</option><option>Execution</option><option>Review</option><option>Complete</option>
        </select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={{ borderRadius: 8, fontSize: 15 }}>
          <option>All</option>{Array.from(new Set(plan.map(i => i.owner))).map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={addDemoItem} style={{ fontWeight: 800, borderRadius: 8, fontSize: 15, background: "#FFD700", color: "#232a2e", padding: "7px 18px", marginLeft: 8 }}>+ Add Demo Initiative</button>
      </div>
      {/* Gantt Timeline */}
      <GanttTimeline plan={filtered} />
      <div ref={exportRef} style={{ borderRadius: 14, background: "#181e23", boxShadow: "0 2px 22px #FFD70022", padding: 15 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
          <thead>
            <tr>
              <th style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>Initiative</th>
              <th>Owner</th>
              <th>Phase</th>
              <th>Progress</th>
              <th>Tags</th>
              <th>KPIs</th>
              <th>Risk</th>
              <th>Blockers</th>
              <th>Dependencies</th>
              <th>Timeline</th>
              <th>Status</th>
              <th>Docs</th>
              <th>Notes</th>
              <th>AI/Scenario</th>
              <th>Audit</th>
              <th>Board Voting</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr
                key={item.id}
                onClick={() => setDrill(item)}
                style={{
                  background: item.risk === "red" || item.overdue ? "#e9405733" : undefined,
                  cursor: "pointer", fontWeight: 700, borderBottom: "2.5px solid #222"
                }}
                title="Click to view/edit"
              >
                <td style={{ color: "#FFD700", fontWeight: 800 }}>{item.title}</td>
                <td>{item.owner}</td>
                <td><PhaseBadge phase={item.phase} /></td>
                <td>
                  <div style={{
                    height: 18, background: "#1e2228", borderRadius: 8, width: 110, position: "relative"
                  }}>
                    <div style={{
                      width: `${item.progress}%`,
                      background: item.progress > 85 ? "#1de682" : item.progress > 50 ? "#FFD700" : "#e94057",
                      height: "100%", borderRadius: 7
                    }}></div>
                    <span style={{
                      position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                      fontWeight: 800, color: "#222", fontSize: 13
                    }}>{item.progress}%</span>
                  </div>
                </td>
                <td><TagBadges tags={item.tags} /></td>
                <td>
                  {(item.kpis || []).map((k, idx) =>
                    <div key={idx}>
                      <span>{k.name}: <b>{k.value}</b></span> <Sparkline data={k.trend} />
                    </div>
                  )}
                </td>
                <td><RiskFlag risk={item.risk} /></td>
                <td style={{ color: "#FFD70099", fontWeight: 600 }}>{item.blockers}</td>
                <td>{item.dependencies.join(", ")}</td>
                <td>{item.timeline}</td>
                <td>{item.status}</td>
                <td>
                  {item.docs && item.docs.length > 0 ? (
                    <span style={{ color: "#FFD700" }}><FaFileAlt /> {item.docs.length} doc</span>
                  ) : ""}
                </td>
                <td style={{ color: "#fff", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.notes}
                </td>
                <td style={{ color: "#FFD70099" }}>
                  <FaRobot style={{ marginBottom: -2, marginRight: 3 }} />
                  {aiRecommendation(item)}
                </td>
                <td>
                  <AuditHistory history={item.history} />
                </td>
                <td>
                  <span style={{ color: "#FFD700" }}>{voteSummary(item.votes).up} 👍 / {voteSummary(item.votes).down} 👎</span>
                  <BoardLog boardLog={item.boardLog} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{
          marginTop: 16, color: "#FFD70088", fontWeight: 600, fontSize: 14, textAlign: "center",
          borderTop: "1.5px solid #333", paddingTop: 11
        }}>
          <b>
            Click any row to drill down and manage initiative details, notes, docs, blockers, board voting, history, and more.<br />
            <span style={{ color: "#FFD700" }}>Board/Director Export:</span> PDF/CSV snapshot for board packs, export for club/federation review.
          </b>
        </div>
      </div>
      {drill && (
        <ItemDrilldown
          item={drill}
          onClose={() => setDrill(null)}
          onUpdate={update => {
            setPlan(plan =>
              plan.map(i => i.id !== update.id ? i : { ...i, ...update })
            );
            setDrill(update);
          }}
        />
      )}
    </div>
  );
}
