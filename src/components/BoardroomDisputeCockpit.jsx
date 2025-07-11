import React, { useState, useRef } from "react";
import { FaCheckCircle, FaUserCheck, FaUserTimes, FaSignature, FaFilePdf, FaCloudUploadAlt, FaGavel, FaChevronRight, FaChevronLeft, FaUserShield, FaDownload, FaFilter, FaSearch, FaExclamationCircle, FaListAlt, FaSyncAlt, FaChartBar, FaRobot } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { ResponsiveLine } from "@nivo/line";
import html2pdf from "html2pdf.js";
import "./BoardroomDisputeCockpit.css";

// Board members
const BOARD_MEMBERS = [
  { id: 1, name: "Ana B.", initials: "AB", chair: true, online: true, lastAction: "now" },
  { id: 2, name: "Marko P.", initials: "MP", chair: false, online: true, lastAction: "3m ago" },
  { id: 3, name: "Luka V.", initials: "LV", chair: false, online: true, lastAction: "1m ago" },
  { id: 4, name: "Zoran K.", initials: "ZK", chair: false, online: false, lastAction: "15m ago" },
  { id: 5, name: "D. Guest", initials: "DG", chair: false, online: false, lastAction: "offline" }
];

const STATUS = ["Pending", "Dispute", "Compliance", "Delayed", "Resolved"];
const STATUS_COLORS = { Pending: "#FFD700", Dispute: "#e94057", Compliance: "#00B4D8", Delayed: "#e96816", Resolved: "#27ef7d" };

const TAGS = ["Finance", "HR", "Operations", "Sponsorship", "Compliance", "Legal", "Sport", "Youth"];

const INITIAL_DECISIONS = [
  { id: 1, topic: "Sponsorship Allocation: Nike", type: "Approval", status: "Pending", owner: "Ana B.", due: "2025-07-01", tags: ["Sponsorship", "Finance"], created: "2025-06-01", resolved: null, votes: {}, signatures: {}, audit: [], flagged: false, legalDocs: [] },
  { id: 2, topic: "New Head Coach Appointment", type: "Dispute", status: "Dispute", owner: "Marko P.", due: "2025-06-21", tags: ["HR", "Sport"], created: "2025-06-05", resolved: null, votes: {}, signatures: {}, audit: [], flagged: true, legalDocs: [] },
  { id: 3, topic: "Compliance: GDPR Review", type: "Compliance", status: "Compliance", owner: "Luka V.", due: "2025-06-28", tags: ["Compliance", "Legal"], created: "2025-05-25", resolved: null, votes: {}, signatures: {}, audit: [], flagged: true, legalDocs: [] },
  { id: 4, topic: "Player Transfer Approval", type: "Approval", status: "Resolved", owner: "Zoran K.", due: "2025-06-16", tags: ["Sport", "Legal"], created: "2025-04-10", resolved: "2025-06-16", votes: {}, signatures: {}, audit: [], flagged: false, legalDocs: [] }
];

// Helper: Get color
const getStatusColor = s => STATUS_COLORS[s] || "#aaa";
const getStatusIcon = s =>
  s === "Resolved" ? <FaCheckCircle style={{ color: "#27ef7d" }} /> : s === "Dispute" ? <FaGavel style={{ color: "#e94057" }} /> : s === "Compliance" ? <FaUserShield style={{ color: "#00B4D8" }} /> : s === "Delayed" ? <FaExclamationCircle style={{ color: "#e96816" }} /> : <FaGavel style={{ color: "#FFD700" }} />;

// Analytics (KPI)
function getBoardKPI(decisions) {
  const resolved = decisions.filter(d => d.status === "Resolved").length;
  const overdue = decisions.filter(d => d.status === "Delayed").length;
  const flagged = decisions.filter(d => d.flagged).length;
  const signatures = decisions.reduce((acc, d) => acc + Object.values(d.signatures || {}).length, 0);
  return { resolved, overdue, flagged, signatures, total: decisions.length };
}

// --- AI INSIGHT MODULE ---
function AIBoardInsights({ decisions }) {
  // Simulated smart AI analysis (replace with real LLM backend if you wish)
  const now = new Date();
  const overdueCases = decisions.filter(d => d.status === "Delayed");
  const flagged = decisions.filter(d => d.flagged);
  const avgDaysToResolve = (() => {
    const closed = decisions.filter(d => d.status === "Resolved" && d.resolved && d.created);
    if (!closed.length) return "-";
    return (
      closed
        .map(d => (new Date(d.resolved) - new Date(d.created)) / (1000 * 3600 * 24))
        .reduce((a, b) => a + b, 0) / closed.length
    ).toFixed(1);
  })();
  const month = (d) => (d.created || "").slice(0, 7);
  const monthly = {};
  decisions.forEach(d => {
    const m = month(d);
    if (!m) return;
    if (!monthly[m]) monthly[m] = { open: 0, resolved: 0 };
    monthly[m].open += 1;
    if (d.status === "Resolved") monthly[m].resolved += 1;
  });

  let advice = [];
  if (overdueCases.length) advice.push("⚠️ " + overdueCases.length + " case(s) are overdue. Recommend immediate escalation.");
  if (flagged.length) advice.push("⚠️ " + flagged.length + " flagged as high risk/dispute. Assign senior board review.");
  if (avgDaysToResolve !== "-" && avgDaysToResolve > 20) advice.push("⏱️ Average case cycle is high. AI: Consider shorter review cycles.");
  if (decisions.length > 10 && (overdueCases.length / decisions.length) > 0.2) advice.push("❗ High overdue rate. Review board workflow.");
  if (advice.length === 0) advice.push("All systems optimal. No critical AI alerts.");

  return (
    <div className="ai-insight-banner">
      <FaRobot style={{ fontSize: 22, marginRight: 7, color: "#FFD700" }} />
      <span style={{ fontWeight: 900, color: "#FFD700" }}>AI Board Insight:</span>
      <ul style={{ margin: "4px 0 0 15px", fontSize: 16, color: "#FFD700" }}>
        {advice.map((a, i) => <li key={i}>{a.replace("⚠️ ", "")}</li>)}
      </ul>
      <div style={{ fontSize: 14, color: "#27ef7d", marginTop: 5 }}>
        Avg. time to resolve: <b>{avgDaysToResolve} days</b>
      </div>
    </div>
  );
}

// --- Timeline data generator ---
function buildTimelineData(decisions) {
  // Extract months
  const months = Array.from(new Set(decisions.map(d => (d.created || "").slice(0, 7)).concat(decisions.map(d => (d.resolved || "").slice(0, 7)))))
    .filter(Boolean)
    .sort();
  // Cases opened/resolved per month
  const opened = months.map(m => ({
    x: m,
    y: decisions.filter(d => (d.created || "").slice(0, 7) === m).length
  }));
  const resolved = months.map(m => ({
    x: m,
    y: decisions.filter(d => d.status === "Resolved" && (d.resolved || "").slice(0, 7) === m).length
  }));
  return [
    { id: "Opened", color: "#FFD700", data: opened },
    { id: "Resolved", color: "#27ef7d", data: resolved }
  ];
}

export default function BoardroomDisputeCockpit() {
  const [decisions, setDecisions] = useState(INITIAL_DECISIONS);
  const [selected, setSelected] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ topic: "", type: "Approval", owner: BOARD_MEMBERS[0].name, due: "", tags: [] });
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [search, setSearch] = useState("");
  const fileInput = useRef();

  // Export
  function handleExportPDF() {
    const el = document.getElementById("boardroom-table-root");
    if (el) html2pdf().from(el).set({ margin: 0.3, filename: "BoardroomDecisions.pdf" }).save();
  }
  // Export CSV
  function handleExportCSV() {
    let rows = [["Status", "Topic", "Type", "Due", "Owner", "Tags"]];
    decisions.forEach(d => rows.push([d.status, d.topic, d.type, d.due, d.owner, (d.tags || []).join(", ")]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "BoardroomDecisions.csv";
    a.click();
  }
  // Voting
  function handleVote(decisionId, memberId, value) {
    setDecisions(ds =>
      ds.map(d => d.id === decisionId
        ? { ...d, votes: { ...d.votes, [memberId]: value }, audit: [...d.audit, { t: "Vote", by: BOARD_MEMBERS.find(b => b.id === memberId).name, value, date: new Date().toLocaleString() }] }
        : d
      )
    );
  }
  // Signature
  function handleSign(decisionId, memberId) {
    setDecisions(ds =>
      ds.map(d => d.id === decisionId
        ? { ...d, signatures: { ...d.signatures, [memberId]: { name: BOARD_MEMBERS.find(b => b.id === memberId).name, time: new Date().toLocaleString() } }, audit: [...d.audit, { t: "Sign", by: BOARD_MEMBERS.find(b => b.id === memberId).name, date: new Date().toLocaleString() }] }
        : d
      )
    );
  }
  // Upload
  function handleDocUpload(files) {
    if (!selected) return;
    setDecisions(ds =>
      ds.map(d =>
        d.id === selected.id
          ? { ...d, legalDocs: [...(d.legalDocs || []), ...Array.from(files).map(f => ({ name: f.name, url: URL.createObjectURL(f) }))] }
          : d
      )
    );
    setUploadTarget(null);
  }
  // Add
  function handleAdd(e) {
    e.preventDefault();
    setDecisions(ds => [
      ...ds,
      {
        ...addForm,
        id: Date.now(),
        status: "Pending",
        created: new Date().toISOString().slice(0, 10),
        resolved: null,
        votes: {},
        signatures: {},
        audit: [{ t: "Created", by: addForm.owner, date: new Date().toLocaleString() }],
        legalDocs: []
      }
    ]);
    setShowAdd(false);
    setAddForm({ topic: "", type: "Approval", owner: BOARD_MEMBERS[0].name, due: "", tags: [] });
  }
  // Filtering & searching
  let shownDecisions = decisions
    .filter(d => (filterStatus ? d.status === filterStatus : true))
    .filter(d => (filterTag ? (d.tags || []).includes(filterTag) : true))
    .filter(d => search.length < 2 || d.topic.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase()));

  // Board Analytics
  const kpi = getBoardKPI(decisions);
  const timelineData = buildTimelineData(decisions);

  return (
    <div className="boardroom-dispute-cockpit" style={{ maxWidth: 1700, margin: "0 auto", padding: 44, background: "linear-gradient(120deg,#181E23 0%,#232a2e 100%)", borderRadius: 30, minHeight: 1350 }}>
      {/* AI Insight */}
      <AIBoardInsights decisions={decisions} />

      {/* Timeline */}
      <div style={{ background: "#232a2e", borderRadius: 18, boxShadow: "0 2px 17px #FFD70017", margin: "20px 0 30px 0", padding: "24px 17px" }}>
        <div style={{ fontWeight: 900, fontSize: 19, color: "#FFD700", marginBottom: 7, display: "flex", alignItems: "center" }}>
          <FaChartBar style={{ marginRight: 8, fontSize: 22 }} /> Boardroom Case Timeline
        </div>
        <div style={{ height: 230 }}>
          <ResponsiveLine
            data={timelineData}
            margin={{ top: 15, right: 80, bottom: 50, left: 65 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
            axisLeft={{
              tickSize: 7, tickPadding: 5, tickRotation: 0,
              legend: "Cases", legendOffset: -50, legendPosition: "middle"
            }}
            axisBottom={{
              tickSize: 7, tickPadding: 5, tickRotation: 0,
              legend: "Month", legendOffset: 40, legendPosition: "middle"
            }}
            colors={["#FFD700", "#27ef7d"]}
            pointSize={10}
            pointBorderWidth={3}
            pointBorderColor={{ from: "serieColor" }}
            enableGridX={false}
            enableGridY={true}
            enablePoints={true}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                translateX: 120,
                translateY: 0,
                itemWidth: 94,
                itemHeight: 23,
                itemsSpacing: 8,
                symbolSize: 15,
                symbolShape: "circle",
                itemTextColor: "#FFD700"
              }
            ]}
            theme={{
              textColor: "#FFD700",
              axis: { ticks: { text: { fill: "#FFD700" } }, legend: { text: { fill: "#FFD700" } } }
            }}
          />
        </div>
      </div>

      {/* Top analytics */}
      <div className="boardroom-analytics-row">
        <div className="boardroom-kpi">
          <FaChartBar /> <b>Resolved:</b> <span className="good">{kpi.resolved}</span> &nbsp; 
          <FaExclamationCircle /> <b>Overdue:</b> <span className={kpi.overdue > 0 ? "bad" : "good"}>{kpi.overdue}</span> &nbsp;
          <FaGavel /> <b>Flagged:</b> <span className={kpi.flagged > 0 ? "warn" : "good"}>{kpi.flagged}</span> &nbsp;
          <FaSignature /> <b>Signatures:</b> <span>{kpi.signatures}</span> &nbsp;
          <FaListAlt /> <b>Total:</b> <span>{kpi.total}</span>
        </div>
        <div className="boardroom-actions">
          <button onClick={() => setShowAdd(true)} className="kpi-btn add-btn">+ New Case</button>
          <button onClick={handleExportPDF} className="kpi-btn pdf-btn"><FaFilePdf style={{ marginRight: 7 }} />Export PDF</button>
          <button onClick={handleExportCSV} className="kpi-btn csv-btn"><FaListAlt style={{ marginRight: 7 }} />Export CSV</button>
        </div>
      </div>
      {/* Filter/search */}
      <div className="boardroom-filters">
        <span><FaFilter /> Status: 
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </span>
        <span>Tag: 
          <select className="filter-select" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
            <option value="">All</option>
            {TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
        </span>
        <span><FaSearch /> <input placeholder="Search topic/owner..." value={search} onChange={e => setSearch(e.target.value)} className="filter-search" /></span>
        <button className="kpi-btn reset-btn" onClick={() => { setFilterStatus(""); setFilterTag(""); setSearch(""); }}><FaSyncAlt /> Reset</button>
      </div>
      {/* Online board presence */}
      <div className="boardroom-presence">
        <b>Boardroom Presence:</b>
        {BOARD_MEMBERS.map(m =>
          <span key={m.id} className={m.online ? "online" : "offline"} title={m.name + (m.chair ? " (Chair)" : "")}>
            <span className="member-dot" style={{ background: m.online ? "#27ef7d" : "#FFD70099" }}></span>
            {m.initials} <span className="member-last">{m.lastAction}</span>
          </span>
        )}
      </div>
      {/* Table */}
      <div id="boardroom-table-root" className="boardroom-table-outer">
        <table className="boardroom-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Topic</th>
              <th>Type</th>
              <th>Due</th>
              <th>Owner</th>
              <th>Tags</th>
              <th>Quick Vote</th>
              <th>Quick Sign</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shownDecisions.length === 0 && (
              <tr><td colSpan={9} style={{ color: "#e94057", fontWeight: 900, textAlign: "center", fontSize: 17 }}>No cases found.</td></tr>
            )}
            {shownDecisions.map((d, idx) =>
              <tr key={d.id} className={selected && selected.id === d.id ? "selected-row" : ""} style={{ background: idx % 2 ? "#232d38" : "#232a2e", cursor: "pointer" }}>
                <td style={{ color: getStatusColor(d.status), fontWeight: 900, fontSize: 17, textAlign: "center" }}>
                  {getStatusIcon(d.status)}
                  <span style={{ marginLeft: 7 }}>{d.status}</span>
                </td>
                <td onClick={() => setSelected(d)} style={{ fontWeight: 800, color: "#FFD700", minWidth: 240 }}>{d.topic}</td>
                <td onClick={() => setSelected(d)} style={{ color: "#27ef7d", fontWeight: 700 }}>{d.type}</td>
                <td onClick={() => setSelected(d)} style={{ color: "#FFD700", fontWeight: 600 }}>{d.due}</td>
                <td onClick={() => setSelected(d)} style={{ color: "#fff", fontWeight: 600 }}>{d.owner}</td>
                <td>
                  {(d.tags || []).map(t =>
                    <span key={t} className="case-tag">{t}</span>
                  )}
                </td>
                {/* VOTING */}
                <td style={{ textAlign: "center" }}>
                  {BOARD_MEMBERS.map(m => (
                    <button key={m.id} title={m.name}
                      style={{
                        margin: 2, padding: "3px 7px", background: d.votes[m.id] === "approve" ? "#27ef7d" : d.votes[m.id] === "dispute" ? "#e94057" : "#232a2e",
                        color: d.votes[m.id] === "approve" ? "#181E23" : "#FFD700", borderRadius: 6, border: "2px solid #FFD70055", fontWeight: 900, fontSize: 13, cursor: m.online ? "pointer" : "not-allowed", opacity: m.online ? 1 : 0.4
                      }}
                      onClick={() => m.online && handleVote(d.id, m.id, d.votes[m.id] === "approve" ? "dispute" : "approve")}>
                      {m.initials}
                    </button>
                  ))}
                </td>
                {/* SIGN */}
                <td style={{ textAlign: "center" }}>
                  {BOARD_MEMBERS.map(m => (
                    <button key={m.id}
                      title={m.name}
                      style={{
                        margin: 2, padding: "3px 7px",
                        background: d.signatures[m.id] ? "#27ef7d" : "#232a2e",
                        color: d.signatures[m.id] ? "#181E23" : "#FFD700", borderRadius: 6, border: "2px solid #FFD70055", fontWeight: 900, fontSize: 13, cursor: m.online && !d.signatures[m.id] ? "pointer" : "not-allowed", opacity: m.online ? 1 : 0.4
                      }}
                      onClick={() => m.online && !d.signatures[m.id] && handleSign(d.id, m.id)}
                    >
                      <FaSignature style={{ marginRight: 3, fontSize: 12 }} />{m.initials}
                    </button>
                  ))}
                </td>
                <td>
                  <button onClick={() => setSelected(d)} style={{ background: "#232a2e", border: "none", color: "#FFD700", fontWeight: 800, fontSize: 17, borderRadius: 5, padding: "4px 10px" }}>
                    <FaChevronRight />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Side Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div className="side-panel" initial={{ x: 500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 500, opacity: 0 }}
            style={{
              position: "fixed", top: 70, right: 20, bottom: 50, width: 470, zIndex: 99, background: "#181e23", borderRadius: 19, boxShadow: "0 4px 44px #FFD70044", color: "#FFD700", padding: 36, overflowY: "auto"
            }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", left: -42, top: 14, background: "#FFD700", border: "none", color: "#181E23", borderRadius: "50%", width: 38, height: 38, fontSize: 18, fontWeight: 900, boxShadow: "0 2px 10px #FFD70055" }}>
              <FaChevronLeft />
            </button>
            <div style={{ fontSize: 23, fontWeight: 900, marginBottom: 14 }}>{selected.topic}</div>
            <div style={{ marginBottom: 18, color: "#27ef7d", fontWeight: 700 }}>{selected.type} | Status: <span style={{ color: getStatusColor(selected.status) }}>{selected.status}</span></div>
            <div style={{ marginBottom: 15 }}>
              <b>Owner:</b> {selected.owner} <br />
              <b>Due:</b> <span style={{ color: "#FFD700" }}>{selected.due}</span>
            </div>
            <hr style={{ border: "none", borderTop: "2px solid #FFD70022", margin: "17px 0" }} />
            <div style={{ marginBottom: 11 }}>
              <b>Board Votes:</b><br />
              {BOARD_MEMBERS.map(m =>
                <span key={m.id} style={{ display: "inline-block", margin: "2px 7px 2px 0", fontWeight: 800, color: selected.votes[m.id] === "approve" ? "#27ef7d" : selected.votes[m.id] === "dispute" ? "#e94057" : "#FFD700" }}>
                  {m.initials}: {selected.votes[m.id] === "approve" ? "Approve" : selected.votes[m.id] === "dispute" ? "Dispute" : "Pending"}
                </span>
              )}
            </div>
            <div style={{ marginBottom: 11 }}>
              <b>Signatures:</b><br />
              {BOARD_MEMBERS.map(m =>
                <span key={m.id} style={{ display: "inline-block", margin: "2px 7px 2px 0", fontWeight: 800, color: selected.signatures[m.id] ? "#27ef7d" : "#FFD700" }}>
                  <FaSignature style={{ fontSize: 13, marginRight: 2 }} />{m.initials} {selected.signatures[m.id] ? "(Signed)" : ""}
                </span>
              )}
            </div>
            <div style={{ marginBottom: 14 }}>
              <b>Tags:</b> {(selected.tags || []).map(t => <span key={t} className="case-tag">{t}</span>)}
            </div>
            <hr style={{ border: "none", borderTop: "2px solid #FFD70022", margin: "17px 0" }} />
            <div>
              <b>Legal Documents:</b>
              <ul>
                {(selected.legalDocs || []).map((f, i) =>
                  <li key={i}>
                    <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "#FFD700", fontWeight: 700 }}>
                      <FaDownload style={{ marginRight: 4 }} /> {f.name}
                    </a>
                  </li>
                )}
                {(selected.legalDocs || []).length === 0 && <li>No docs uploaded.</li>}
              </ul>
              <button onClick={() => setUploadTarget(selected.id)} style={{ background: "#FFD700", color: "#181E23", fontWeight: 700, borderRadius: 6, padding: "5px 14px", border: "none", marginTop: 8 }}>
                <FaCloudUploadAlt style={{ marginRight: 6 }} /> Upload Doc
              </button>
              {uploadTarget === selected.id && (
                <input type="file" multiple style={{ marginTop: 10, color: "#FFD700" }} onChange={e => handleDocUpload(e.target.files)} ref={fileInput} />
              )}
            </div>
            <hr style={{ border: "none", borderTop: "2px solid #FFD70022", margin: "17px 0" }} />
            <div>
              <b>Audit History:</b>
              <ul style={{ fontSize: 14 }}>
                {(selected.audit || []).map((a, i) => <li key={i}><span style={{ color: "#27ef7d" }}>{a.t}</span> by <b>{a.by}</b> {a.value ? <>({a.value})</> : ""} <span style={{ color: "#FFD700" }}>{a.date}</span></li>)}
                {(selected.audit || []).length === 0 && <li>No actions recorded.</li>}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ADD MODAL */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", left: 0, top: 0, right: 0, bottom: 0,
              zIndex: 150, background: "rgba(24,28,38,0.97)", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            <div style={{ background: "#232a2e", borderRadius: 16, padding: 38, color: "#FFD700", boxShadow: "0 6px 44px #FFD70055", minWidth: 350 }}>
              <h2 style={{ fontWeight: 900, marginBottom: 21, fontSize: 23 }}>Add New Board Case</h2>
              <form onSubmit={handleAdd}>
                <div style={{ marginBottom: 15 }}>
                  <b>Topic:</b>
                  <input required style={{ width: "100%", fontSize: 16, marginTop: 5, borderRadius: 8, border: "2px solid #FFD70044", background: "#181e23", color: "#FFD700", padding: "8px 12px", fontWeight: 700 }} value={addForm.topic} onChange={e => setAddForm(f => ({ ...f, topic: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 15 }}>
                  <b>Type:</b>
                  <select style={{ width: "100%", fontSize: 16, marginTop: 5, borderRadius: 8, border: "2px solid #FFD70044", background: "#181e23", color: "#FFD700", padding: "8px 12px", fontWeight: 700 }} value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
                    <option>Approval</option>
                    <option>Dispute</option>
                    <option>Compliance</option>
                  </select>
                </div>
                <div style={{ marginBottom: 15 }}>
                  <b>Owner:</b>
                  <select style={{ width: "100%", fontSize: 16, marginTop: 5, borderRadius: 8, border: "2px solid #FFD70044", background: "#181e23", color: "#FFD700", padding: "8px 12px", fontWeight: 700 }} value={addForm.owner} onChange={e => setAddForm(f => ({ ...f, owner: e.target.value }))}>
                    {BOARD_MEMBERS.map(m => <option key={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 15 }}>
                  <b>Tags:</b>
                  <select multiple style={{ width: "100%", fontSize: 16, marginTop: 5, borderRadius: 8, border: "2px solid #FFD70044", background: "#181e23", color: "#FFD700", padding: "8px 12px", fontWeight: 700 }} value={addForm.tags} onChange={e => setAddForm(f => ({ ...f, tags: Array.from(e.target.selectedOptions).map(o => o.value) }))}>
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 22 }}>
                  <b>Due:</b>
                  <input type="date" required style={{ width: "100%", fontSize: 16, marginTop: 5, borderRadius: 8, border: "2px solid #FFD70044", background: "#181e23", color: "#FFD700", padding: "8px 12px", fontWeight: 700 }} value={addForm.due} onChange={e => setAddForm(f => ({ ...f, due: e.target.value }))} />
                </div>
                <button type="submit" className="kpi-btn add-btn" style={{ marginTop: 7, marginRight: 8 }}>Add</button>
                <button type="button" onClick={() => setShowAdd(false)} className="kpi-btn reset-btn" style={{ marginTop: 7 }}>Cancel</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Bottom banner */}
      <div style={{ color: "#FFD70099", fontSize: 15, marginTop: 35, textAlign: "center" }}>
        Elite board governance. No spreadsheet. CourtEvo Vero™ Cockpit.
      </div>
    </div>
  );
}
