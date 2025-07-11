import React, { useState } from "react";
import {
  FaSitemap, FaGavel, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaQuestionCircle,
  FaUserTie, FaPlusCircle, FaEdit, FaTrash, FaArrowRight, FaSearch, FaFilter, FaCloudDownloadAlt,
  FaChartBar, FaFire, FaPaperclip, FaCommentDots, FaBolt, FaRegClock, FaRegCalendarAlt
} from "react-icons/fa";

// --- Decision Types, Statuses, etc ---
const statusIcons = {
  approved: <FaCheckCircle color="#1de682" />,
  rejected: <FaTimesCircle color="#ff6b6b" />,
  deferred: <FaHourglassHalf color="#FFD700" />,
  review: <FaQuestionCircle color="#FFD700" />
};
const statusColors = {
  approved: "#1de682",
  rejected: "#ff6b6b",
  deferred: "#FFD700",
  review: "#FFD700"
};
const impactZones = [
  { key: "financial", label: "Financial" },
  { key: "talent", label: "Talent" },
  { key: "operations", label: "Operations" },
  { key: "reputation", label: "Reputation" },
  { key: "infrastructure", label: "Infrastructure" }
];

const initialDecisions = [
  {
    id: 1,
    issue: "Hire Strength Coach",
    impactZone: "talent",
    context: "Needed for elite youth program expansion.",
    date: "2024-05-04",
    owner: "Performance Board",
    status: "approved",
    rationale: "Reduce injuries, enhance S&C standards.",
    alternatives: "Delay hire, part-time contract.",
    predictedImpact: "Lower injury risk by 20%, accelerate U18 readiness.",
    votes: { yes: 6, no: 0, abstain: 1 },
    attachments: ["Contract_Draft.pdf"],
    comments: [{ user: "Ivan Babic", text: "Can we benchmark S&C results?" }],
    scenario: "Talent pipeline gap",
    reviewDate: "2024-09-15",
    outcomeMetric: "Injury rate, fitness scores",
    actualOutcome: "",
    heat: 8,
    actions: [
      { desc: "Finalize contract", owner: "Board", done: false },
      { desc: "Medical clearance", owner: "Medical", done: false }
    ],
    regret: 0,
    notes: ""
  },
  {
    id: 2,
    issue: "Rebrand U14 Tournament",
    impactZone: "reputation",
    context: "Boost sponsor visibility, attract top teams.",
    date: "2024-06-10",
    owner: "Marketing",
    status: "deferred",
    rationale: "Waiting on design agency feedback.",
    alternatives: "Keep old brand, merge with another event.",
    predictedImpact: "Increase attendance by 30%, 2x sponsor leads.",
    votes: { yes: 4, no: 1, abstain: 2 },
    attachments: [],
    comments: [],
    scenario: "Event clash risk",
    reviewDate: "2024-08-01",
    outcomeMetric: "Attendance, sponsor leads",
    actualOutcome: "",
    heat: 4,
    actions: [
      { desc: "Get agency proposal", owner: "Marketing", done: true },
      { desc: "Board review", owner: "Board", done: false }
    ],
    regret: 0,
    notes: ""
  }
];

// --- AI Scoring (mock logic, replace with real AI call if you want) ---
function aiScore(decision) {
  // Score 1-10: high heat = high impact + high regret + overdue + uncompleted actions
  let base = decision.heat || 5;
  if ((decision.actions || []).some(a => !a.done)) base += 2;
  if (decision.regret && decision.regret > 0) base += 2;
  if (decision.status === "review") base += 1;
  return Math.max(1, Math.min(10, base));
}

// --- Board Patterns ---
function getPatterns(decisions) {
  const zones = {}, owners = {}, reviewDelays = [], overdueActions = [], regretHot = [];
  decisions.forEach(d => {
    zones[d.impactZone] = (zones[d.impactZone] || 0) + 1;
    owners[d.owner] = (owners[d.owner] || 0) + 1;
    if (d.reviewDate && d.date) {
      reviewDelays.push((new Date(d.reviewDate) - new Date(d.date)) / (1000 * 3600 * 24));
    }
    if ((d.actions || []).some(a => !a.done)) overdueActions.push(d.issue);
    if (d.regret && d.regret > 0) regretHot.push(d.issue);
  });
  return {
    topZone: Object.entries(zones).sort((a, b) => b[1] - a[1])[0]?.[0],
    busiestOwner: Object.entries(owners).sort((a, b) => b[1] - a[1])[0]?.[0],
    avgReviewDelay: reviewDelays.length
      ? Math.round(reviewDelays.reduce((a, b) => a + b, 0) / reviewDelays.length)
      : 0,
    overdueActions,
    regretHot
  };
}

// --- Visual: Decision Flow Map (Sankey-style logic, simple SVG) ---
function DecisionFlowMap({ decisions }) {
  const stats = { approved: 0, rejected: 0, deferred: 0, review: 0 };
  decisions.forEach(d => stats[d.status]++);
  return (
    <svg width={310} height={70} style={{ margin: "14px 0 12px 0" }}>
      <rect x={7} y={10} width={40} height={40} fill="#FFD700" rx={10} />
      <text x={27} y={37} fill="#232a2e" fontWeight="900" fontSize="22" textAnchor="middle">Pro</text>
      {/* Flows */}
      {["approved", "deferred", "rejected", "review"].map((status, i) => (
        <g key={status}>
          <line x1={47} y1={30} x2={110 + i * 45} y2={20 + i * 12} stroke={statusColors[status]} strokeWidth={8} />
          <rect x={110 + i * 45} y={10 + i * 12} width={34} height={34} fill={statusColors[status]} rx={9} />
          <text x={127 + i * 45} y={32 + i * 12} fill="#232a2e" fontWeight="900" fontSize="17" textAnchor="middle">{stats[status]}</text>
        </g>
      ))}
      <text x={27} y={60} fill="#FFD700" fontSize={13} textAnchor="middle">Proposals</text>
      <text x={127} y={60} fill="#1de682" fontSize={13} textAnchor="middle">Approved</text>
      <text x={172} y={60} fill="#FFD700" fontSize={13} textAnchor="middle">Deferred</text>
      <text x={217} y={60} fill="#ff6b6b" fontSize={13} textAnchor="middle">Rejected</text>
      <text x={262} y={60} fill="#FFD700" fontSize={13} textAnchor="middle">Review</text>
    </svg>
  );
}

// --- Impact Chart ---
function DecisionImpactTrend({ decisions }) {
  // Simple line chart of heat/impact by decision date (most recent N=6)
  const sorted = [...decisions].sort((a, b) => a.date > b.date ? 1 : -1).slice(-6);
  if (!sorted.length) return null;
  const H = 46, W = 180, max = Math.max(...sorted.map(d => aiScore(d)));
  return (
    <svg width={W} height={H} style={{ background: "#1a1d20", borderRadius: 7, boxShadow: "0 1px 6px #FFD70022" }}>
      <polyline
        fill="none" stroke="#FFD700" strokeWidth={4}
        points={sorted.map((d, i) =>
          `${i * (W / (sorted.length - 1))},${H - ((aiScore(d) / max) * (H - 9))}`
        ).join(" ")}
      />
      {sorted.map((d, i) => (
        <circle
          key={d.id}
          cx={i * (W / (sorted.length - 1))}
          cy={H - ((aiScore(d) / max) * (H - 9))}
          r={6}
          fill={aiScore(d) >= 8 ? "#ff6b6b" : aiScore(d) >= 6 ? "#FFD700" : "#1de682"}
        >
          <title>{d.issue}: {aiScore(d)}</title>
        </circle>
      ))}
    </svg>
  );
}

// --- Outcome Heatmap ---
function OutcomeHeatmap({ decisions }) {
  return (
    <div style={{ margin: "7px 0 12px 0" }}>
      <b style={{ color: "#FFD700", fontSize: 16 }}>Impact Heatmap</b>
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        {decisions.map((d, i) => {
          const bg = aiScore(d) >= 8 ? "#ff6b6b" : aiScore(d) >= 6 ? "#FFD700" : "#1de682";
          return (
            <div key={i} title={d.issue}
              style={{
                height: 22, width: 32, borderRadius: 7, background: bg,
                color: "#232a2e", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
              {aiScore(d)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BoardroomDecisionMasteryCockpit() {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);

  // CRUD
  function handleEdit(d) {
    setEditing(d); setForm({ ...d }); setAdding(false);
  }
  function handleDelete(id) {
    setDecisions(ds => ds.filter(d => d.id !== id)); setEditing(null); setSelected(null);
  }
  function handleSaveEdit() {
    setDecisions(ds => ds.map(d => d.id === editing.id ? { ...form, id: editing.id } : d));
    setEditing(null); setSelected(null);
  }
  function handleAddNew() {
    setDecisions(ds => [...ds, { ...form, id: Date.now(), status: "review", comments: [], attachments: [], actions: [] }]);
    setAdding(false);
  }
  function addComment(decision, user, text) {
    setDecisions(ds => ds.map(d => d.id === decision.id
      ? { ...d, comments: [...(d.comments || []), { user, text }] }
      : d
    ));
  }
  function addAction(decision, desc, owner) {
    setDecisions(ds => ds.map(d => d.id === decision.id
      ? { ...d, actions: [...(d.actions || []), { desc, owner, done: false }] }
      : d
    ));
  }
  function toggleAction(decision, idx) {
    setDecisions(ds => ds.map(d => d.id === decision.id
      ? { ...d, actions: d.actions.map((a, i) => i === idx ? { ...a, done: !a.done } : a) }
      : d
    ));
  }
  function exportCSV() {
    const header = "Issue,Context,Date,Owner,Status,ImpactZone,Rationale,Alternatives,PredictedImpact,Votes,OutcomeMetric,ReviewDate,Scenario,Outcome,Notes\n";
    const body = decisions.map(d =>
      [
        d.issue, d.context, d.date, d.owner, d.status, d.impactZone, d.rationale, d.alternatives, d.predictedImpact,
        `Y:${d.votes.yes},N:${d.votes.no},Abst:${d.votes.abstain}`, d.outcomeMetric, d.reviewDate, d.scenario, d.actualOutcome, d.notes
      ].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "decision_mastery_log.csv";
    link.click();
  }

  // Filter/search
  const filtered = decisions.filter(d =>
    (!filterStatus || d.status === filterStatus) &&
    (!filterZone || d.impactZone === filterZone) &&
    (!filterOwner || d.owner === filterOwner) &&
    (search === "" || d.issue.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase()))
  );
  // Timeline sort (latest first)
  const sorted = [...filtered].sort((a, b) => (a.date > b.date ? -1 : 1));
  // Analytics & Board AI
  const { topZone, busiestOwner, avgReviewDelay, overdueActions, regretHot } = getPatterns(decisions);
  const owners = Array.from(new Set(decisions.map(d => d.owner)));

  // --- Boardroom Notification ---
  const notification =
    (overdueActions.length || regretHot.length) ? (
      <div style={{
        background: "#ff6b6b22", color: "#ff6b6b", fontWeight: 900, borderRadius: 11,
        padding: "13px 20px", marginBottom: 12, fontSize: 16, display: "flex", alignItems: "center", gap: 16
      }}>
        <FaFire color="#ff6b6b" size={20} />
        {overdueActions.length > 0 && <span>Overdue actions: {overdueActions.join(", ")}</span>}
        {regretHot.length > 0 && <span>Regret hotspot: {regretHot.join(", ")}</span>}
      </div>
    ) : null;

  // --- AI Insights Panel ---
  function AIInsights() {
    return (
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "15px 20px", marginBottom: 16, boxShadow: "0 2px 10px #FFD70022", color: "#FFD700", fontWeight: 800, fontSize: 15
      }}>
        <FaBolt color="#FFD700" size={20} style={{ marginRight: 10 }} />
        <span>
          <b>AI Insights:</b>{" "}
          Most heated zone: <span style={{ color: "#1de682" }}>{topZone || "—"}</span>{" | "}
          Most overdue: <span style={{ color: "#FFD700" }}>{overdueActions[0] || "None"}</span>{" | "}
          Avg review lag: <span style={{ color: "#1de682" }}>{avgReviewDelay} days</span>{" | "}
          Busiest owner: <span style={{ color: "#FFD700" }}>{busiestOwner || "—"}</span>
        </span>
      </div>
    );
  }

  // --- Main ---
  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "34px", padding: "36px 28px 20px 28px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 15, flexWrap: "wrap" }}>
        <FaSitemap size={44} color="#FFD700" style={{ marginRight: 18 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 32, letterSpacing: 2, marginBottom: 5, color: "#FFD700"
          }}>
            BOARDROOM DECISION MASTERY COCKPIT
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 17 }}>
            All decisions. Patterns. Impact. AI risk. Unmatched boardroom power.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <FaSearch color="#FFD700" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Find decision..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 17, width: 170, marginLeft: 8 }} />
          <FaFilter color="#FFD700" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 8,
              border: "none", fontWeight: 700, fontSize: 16, padding: "6px 14px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="deferred">Deferred</option>
            <option value="review">Under Review</option>
          </select>
          <select
            value={filterZone}
            onChange={e => setFilterZone(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 8,
              border: "none", fontWeight: 700, fontSize: 16, padding: "6px 14px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Zones</option>
            {impactZones.map(z => <option key={z.key} value={z.key}>{z.label}</option>)}
          </select>
          <select
            value={filterOwner}
            onChange={e => setFilterOwner(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 8,
              border: "none", fontWeight: 700, fontSize: 16, padding: "6px 14px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Owners</option>
            {owners.map(owner => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </div>
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
            border: "none", padding: "11px 23px", marginLeft: 24, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70055"
          }}
          onClick={exportCSV}
        >
          <FaCloudDownloadAlt style={{ marginRight: 9 }} /> Export CSV
        </button>
      </div>
      {notification}
      <AIInsights />
      <div style={{
        display: "flex", gap: 30, alignItems: "center", background: "#232a2e", borderRadius: 16,
        padding: "15px 20px", marginBottom: 16, boxShadow: "0 2px 10px #FFD70022"
      }}>
        <FaChartBar color="#FFD700" size={23} style={{ marginRight: 7 }} />
        <span style={{ color: "#FFD700", fontWeight: 800 }}>Top Zone: <b style={{ color: "#1de682" }}>{topZone || "—"}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 800 }}>Busiest Owner: <b style={{ color: "#1de682" }}>{busiestOwner || "—"}</b></span>
        <span style={{ color: "#FFD700", fontWeight: 800 }}>Avg Review: <b style={{ color: "#1de682" }}>{avgReviewDelay} days</b></span>
        <DecisionImpactTrend decisions={decisions} />
        <OutcomeHeatmap decisions={decisions} />
        <DecisionFlowMap decisions={decisions} />
      </div>
      {/* TIMELINE + DETAILS */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* TIMELINE PANEL */}
        <div style={{
          minWidth: 460, maxWidth: 700, flex: "1 1 600px", background: "#283E51", borderRadius: 22, padding: 20, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowY: "auto", maxHeight: 720
        }}>
          <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 19, marginBottom: 11 }}>Board Decision Timeline</div>
          <button
            style={{
              background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
              border: "none", padding: "9px 18px", fontSize: 16, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 10px 0 #1de68266",
              marginBottom: 12
            }}
            onClick={() => { setAdding(true); setForm({ status: "review", votes: { yes: 0, no: 0, abstain: 0 }, comments: [], attachments: [], actions: [] }); setEditing(null); }}>
            <FaPlusCircle style={{ marginRight: 8 }} /> Add Decision
          </button>
          {(adding || editing) &&
            <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "15px 14px", marginBottom: 15 }}>
              <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <b>Issue:</b>
                    <input type="text" value={form.issue || ""} required
                      onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 170 }} />
                  </div>
                  <div>
                    <b>Date:</b>
                    <input type="date" value={form.date || ""}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800 }} />
                  </div>
                  <div>
                    <b>Owner:</b>
                    <input type="text" value={form.owner || ""} required
                      onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 110 }} />
                  </div>
                  <div>
                    <b>Status:</b>
                    <select value={form.status || "review"}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800 }}>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="deferred">Deferred</option>
                      <option value="review">Under Review</option>
                    </select>
                  </div>
                  <div>
                    <b>Impact Zone:</b>
                    <select value={form.impactZone || ""}
                      onChange={e => setForm(f => ({ ...f, impactZone: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800 }}>
                      <option value="">Select</option>
                      {impactZones.map(z => <option key={z.key} value={z.key}>{z.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                  <div>
                    <b>Context:</b>
                    <input type="text" value={form.context || ""}
                      onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 180 }} />
                  </div>
                  <div>
                    <b>Rationale:</b>
                    <input type="text" value={form.rationale || ""}
                      onChange={e => setForm(f => ({ ...f, rationale: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 180 }} />
                  </div>
                  <div>
                    <b>Alternatives:</b>
                    <input type="text" value={form.alternatives || ""}
                      onChange={e => setForm(f => ({ ...f, alternatives: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 170 }} />
                  </div>
                  <div>
                    <b>Predicted Impact:</b>
                    <input type="text" value={form.predictedImpact || ""}
                      onChange={e => setForm(f => ({ ...f, predictedImpact: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 170 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                  <div>
                    <b>Votes (Y/N/Abst):</b>
                    <input type="number" min={0} value={form.votes?.yes || 0}
                      onChange={e => setForm(f => ({ ...f, votes: { ...f.votes, yes: Number(e.target.value) } }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", width: 40, fontWeight: 800 }} />
                    <input type="number" min={0} value={form.votes?.no || 0}
                      onChange={e => setForm(f => ({ ...f, votes: { ...f.votes, no: Number(e.target.value) } }))}
                      style={{ marginLeft: 7, borderRadius: 6, padding: "5px 13px", width: 40, fontWeight: 800 }} />
                    <input type="number" min={0} value={form.votes?.abstain || 0}
                      onChange={e => setForm(f => ({ ...f, votes: { ...f.votes, abstain: Number(e.target.value) } }))}
                      style={{ marginLeft: 7, borderRadius: 6, padding: "5px 13px", width: 40, fontWeight: 800 }} />
                  </div>
                  <div>
                    <b>Outcome Metric:</b>
                    <input type="text" value={form.outcomeMetric || ""}
                      onChange={e => setForm(f => ({ ...f, outcomeMetric: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 150 }} />
                  </div>
                  <div>
                    <b>Review Date:</b>
                    <input type="date" value={form.reviewDate || ""}
                      onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800 }} />
                  </div>
                  <div>
                    <b>Scenario:</b>
                    <input type="text" value={form.scenario || ""}
                      onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 140 }} />
                  </div>
                  <div>
                    <b>Heat (1-10):</b>
                    <input type="number" min={1} max={10} value={form.heat || 5}
                      onChange={e => setForm(f => ({ ...f, heat: Number(e.target.value) }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", width: 65, fontWeight: 800 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                  <div>
                    <b>Outcome:</b>
                    <input type="text" value={form.actualOutcome || ""}
                      onChange={e => setForm(f => ({ ...f, actualOutcome: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 170 }} />
                  </div>
                  <div>
                    <b>Notes:</b>
                    <input type="text" value={form.notes || ""}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 6, padding: "5px 13px", fontWeight: 800, width: 150 }} />
                  </div>
                </div>
                <div style={{ marginTop: 13 }}>
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 16,
                    padding: "8px 25px", marginRight: 10, cursor: "pointer", boxShadow: "0 2px 10px #FFD70022"
                  }}>{adding ? "Add" : "Save"}</button>
                  <button type="button" style={{
                    background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 16,
                    padding: "8px 25px", cursor: "pointer", boxShadow: "0 2px 10px #ff6b6b33"
                  }} onClick={() => { setAdding(false); setEditing(null); setForm({}); }}>Cancel</button>
                </div>
              </form>
            </div>
          }
          {/* TIMELINE CARDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {sorted.map(d => (
              <div key={d.id} style={{
                background: "#232a2e", borderLeft: `7px solid ${statusColors[d.status] || "#FFD700"}`, borderRadius: 11,
                boxShadow: `0 2px 12px ${statusColors[d.status] || "#FFD700"}22`, padding: "13px 16px", cursor: "pointer"
              }} onClick={() => setSelected(d)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 23 }}>{statusIcons[d.status] || statusIcons["review"]}</div>
                  <div>
                    <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 18 }}>{d.issue}</div>
                    <div style={{ color: "#1de682", fontWeight: 700, fontSize: 15 }}>{d.owner} &middot; {d.date}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={{
                      background: "#1a1d20", color: "#FFD700", borderRadius: 8, padding: "4px 12px", fontWeight: 900, marginRight: 8
                    }}>{impactZones.find(z => z.key === d.impactZone)?.label}</span>
                    <span style={{
                      background: "#FFD700", color: "#232a2e", borderRadius: 8, padding: "4px 11px", fontWeight: 900
                    }}>{d.status.toUpperCase()}</span>
                    <span style={{
                      background: aiScore(d) >= 8 ? "#ff6b6b" : aiScore(d) >= 6 ? "#FFD700" : "#1de682",
                      color: "#232a2e", borderRadius: 8, padding: "4px 11px", fontWeight: 900, marginLeft: 8
                    }} title={`AI impact: ${aiScore(d)}`}>
                      <FaBolt style={{ marginRight: 3 }} /> {aiScore(d)}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: 7, color: "#fff", fontSize: 15, fontStyle: "italic" }}>
                  {d.context}
                </div>
                {/* Attachments */}
                {d.attachments?.length > 0 &&
                  <div style={{ marginTop: 4 }}>
                    <FaPaperclip color="#FFD700" />{" "}
                    {d.attachments.map((att, i) => (
                      <span key={i} style={{ color: "#FFD700", marginRight: 7 }}>{att}</span>
                    ))}
                  </div>
                }
                {/* Action Tracker */}
                {d.actions && d.actions.length > 0 &&
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: "#FFD700", fontWeight: 800 }}>Actions: </span>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {d.actions.map((a, i) =>
                        <span key={i}
                          style={{
                            background: a.done ? "#1de682" : "#FFD700",
                            color: "#232a2e", borderRadius: 6, padding: "2px 9px", fontWeight: 900, marginRight: 3, cursor: "pointer"
                          }}
                          onClick={e => { e.stopPropagation(); toggleAction(d, i); }}>
                          {a.owner}: {a.desc} {a.done ? <FaCheckCircle /> : <FaRegClock />}
                        </span>
                      )}
                    </div>
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
        {/* SIDEBAR: Decision Intelligence Card with Comments/Actions */}
        <div style={{
          minWidth: 340, maxWidth: 500, background: "#232a2e", borderRadius: 22, padding: 24, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, height: "100%"
        }}>
          <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 19 }}>Decision Intelligence</b>
          {selected ? (
            <>
              <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 20, margin: "9px 0 7px 0" }}>{selected.issue}</div>
              <div><b>Date:</b> {selected.date}</div>
              <div><b>Owner:</b> {selected.owner}</div>
              <div style={{ margin: "6px 0" }}><b>Status:</b> <span style={{ color: statusColors[selected.status], fontWeight: 900 }}>{selected.status.toUpperCase()}</span></div>
              <div><b>Impact Zone:</b> {impactZones.find(z => z.key === selected.impactZone)?.label}</div>
              <div><b>Context:</b> {selected.context}</div>
              <div><b>Rationale:</b> {selected.rationale}</div>
              <div><b>Alternatives:</b> {selected.alternatives}</div>
              <div><b>Predicted Impact:</b> {selected.predictedImpact}</div>
              <div><b>Votes:</b> Yes: {selected.votes.yes} | No: {selected.votes.no} | Abstain: {selected.votes.abstain}</div>
              <div><b>Outcome Metric:</b> {selected.outcomeMetric}</div>
              <div><b>Review Date:</b> {selected.reviewDate}</div>
              <div><b>Scenario:</b> {selected.scenario}</div>
              <div><b>Outcome:</b> {selected.actualOutcome}</div>
              <div><b>Notes:</b> {selected.notes}</div>
              {/* Attachments */}
              <div style={{ marginTop: 9 }}>
                <b>Attachments:</b>{" "}
                {selected.attachments?.length > 0
                  ? selected.attachments.map((att, i) =>
                    <span key={i} style={{ color: "#FFD700", marginRight: 8 }}>{att}</span>)
                  : <span style={{ color: "#1de682" }}>None</span>}
              </div>
              {/* Comments */}
              <div style={{ marginTop: 8 }}>
                <b>Comments:</b>
                <ul style={{ margin: 0, fontSize: 15 }}>
                  {(selected.comments || []).map((c, i) =>
                    <li key={i} style={{ color: "#FFD700" }}>
                      <FaCommentDots color="#FFD700" style={{ marginRight: 4 }} /> <b>{c.user}:</b> {c.text}
                    </li>
                  )}
                </ul>
              </div>
              {/* Add Comment */}
              <div style={{ marginTop: 7 }}>
                <input
                  type="text"
                  placeholder="Add comment (your name: comment)..."
                  style={{ borderRadius: 7, padding: "5px 12px", width: 170, marginRight: 6 }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const [user, ...txt] = e.target.value.split(":");
                      if (user && txt.length > 0) {
                        addComment(selected, user.trim(), txt.join(":").trim());
                        e.target.value = "";
                      }
                    }
                  }}
                />
              </div>
              {/* Action Tracker */}
              <div style={{ marginTop: 14 }}>
                <b>Actions:</b>{" "}
                {selected.actions && selected.actions.length > 0
                  ? (
                    <ul style={{ margin: 0, fontSize: 15 }}>
                      {selected.actions.map((a, i) =>
                        <li key={i}
                          style={{
                            textDecoration: a.done ? "line-through" : "none", color: a.done ? "#1de682" : "#FFD700", fontWeight: 800, cursor: "pointer"
                          }}
                          onClick={() => toggleAction(selected, i)}
                        >
                          {a.owner}: {a.desc} {a.done ? <FaCheckCircle /> : <FaRegClock />}
                        </li>
                      )}
                    </ul>
                  )
                  : <span style={{ color: "#1de682" }}>No actions</span>}
                {/* Add Action */}
                <div style={{ marginTop: 7 }}>
                  <input
                    type="text"
                    placeholder="Action description..."
                    style={{ borderRadius: 7, padding: "5px 12px", width: 120, marginRight: 6 }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        addAction(selected, e.target.value, "Board");
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div style={{ margin: "15px 0 11px 0", color: "#FFD700", fontSize: 17, fontWeight: 900 }}>
              Select a decision to see full intelligence.
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 38,
        fontSize: 16,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. This is decision power, redefined.
      </div>
    </div>
  );
}
