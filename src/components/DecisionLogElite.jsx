import React, { useState } from "react";
import {
  FaUserTie, FaCrown, FaExclamationTriangle, FaCheckCircle, FaClock, FaFileExport, FaPlus, FaSearch, FaPaperclip, FaRegCommentDots, FaChartPie, FaChevronDown, FaChevronUp, FaRegLightbulb
} from "react-icons/fa";
import "./DecisionLogElite.css";

// Mock data (extend as needed)
const INIT_DECISIONS = [
  {
    id: 1,
    date: "2025-05-12",
    owner: "Board",
    category: "Strategy",
    decision: "Appoint new GM",
    rationale: "Drive professionalization and youth development",
    status: "Closed",
    risk: "Low",
    attachment: "https://club.com/contracts/GM_2025.pdf",
    comments: [{ by: "Board", text: "Process completed as planned.", date: "2025-05-20" }],
    followup: "Onboard GM, report in July"
  },
  {
    id: 2,
    date: "2025-05-18",
    owner: "GM",
    category: "Operations",
    decision: "Launch digital athlete tracking pilot",
    rationale: "Increase operational efficiency and talent retention",
    status: "In Progress",
    risk: "Medium",
    attachment: "",
    comments: [
      { by: "Board", text: "Schedule update with IT.", date: "2025-05-30" }
    ],
    followup: "Monitor adoption, update at Q3 meeting"
  },
  {
    id: 3,
    date: "2025-06-02",
    owner: "Board",
    category: "Compliance",
    decision: "Initiate club-wide ethics review",
    rationale: "Align with new federation compliance standards",
    status: "Open",
    risk: "High",
    attachment: "",
    comments: [],
    followup: "Form ethics panel, draft new policies"
  }
];

const CATEGORIES = ["All", "Strategy", "Operations", "Finance", "HR", "Compliance", "Talent"];

const STATUS_COLOR = {
  Open: "#FFD700",
  "In Progress": "#1de682",
  Closed: "#b5efb0",
  Risk: "#FF4444"
};
const RISK_ICON = {
  Low: <FaCheckCircle style={{ color: "#1de682" }} />,
  Medium: <FaExclamationTriangle style={{ color: "#FFD700" }} />,
  High: <FaExclamationTriangle style={{ color: "#FF4444" }} />
};
const OWNER_AVATAR = {
  Board: <FaCrown style={{ color: "#FFD700", fontSize: 17 }} />,
  GM: <FaUserTie style={{ color: "#1de682", fontSize: 17 }} />
};

export default function DecisionLogElite() {
  const [decisions, setDecisions] = useState(INIT_DECISIONS);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    date: "",
    owner: "Board",
    category: "Strategy",
    decision: "",
    rationale: "",
    status: "Open",
    risk: "Low",
    attachment: "",
    followup: "",
    comments: []
  });
  const [expanded, setExpanded] = useState({});
  const [commentText, setCommentText] = useState("");
  const [aiReview, setAiReview] = useState("");

  // Filtering logic
  const filtered = decisions.filter(d =>
    (!search || d.decision.toLowerCase().includes(search.toLowerCase()) || d.rationale.toLowerCase().includes(search.toLowerCase())) &&
    (!ownerFilter || d.owner === ownerFilter) &&
    (!statusFilter || d.status === statusFilter) &&
    (catFilter === "All" || d.category === catFilter) &&
    (!dateFrom || d.date >= dateFrom) &&
    (!dateTo || d.date <= dateTo)
  );

  // Timeline split (before/after today)
  const todayStr = new Date().toISOString().slice(0, 10);
  const past = filtered.filter(d => d.date < todayStr);
  const todayAndFuture = filtered.filter(d => d.date >= todayStr);

  // Boardroom analytics mini-dashboard
  const analytics = {
    open: filtered.filter(d => d.status === "Open").length,
    progress: filtered.filter(d => d.status === "In Progress").length,
    closed: filtered.filter(d => d.status === "Closed").length,
    highRisk: filtered.filter(d => d.risk === "High" && d.status !== "Closed").length
  };
  const total = analytics.open + analytics.progress + analytics.closed;

  // Add new decision
  function handleAdd() {
    if (!form.decision.trim() || !form.date.trim()) return;
    setDecisions([
      { ...form, id: decisions.length + 1, comments: [] },
      ...decisions
    ]);
    setModal(false);
    setForm({
      date: "",
      owner: "Board",
      category: "Strategy",
      decision: "",
      rationale: "",
      status: "Open",
      risk: "Low",
      attachment: "",
      followup: "",
      comments: []
    });
  }

  // Add comment to decision
  function addComment(did) {
    if (!commentText.trim()) return;
    setDecisions(ds => ds.map(d =>
      d.id === did
        ? {
            ...d,
            comments: [
              ...d.comments,
              { by: "Board", text: commentText, date: new Date().toLocaleDateString() }
            ]
          }
        : d
    ));
    setCommentText("");
    setExpanded(e => ({ ...e, [did]: true }));
  }

  // AI review (simulated)
  function doAiReview() {
    const risky = filtered.filter(d => (d.risk === "High" || d.status === "Open"));
    if (risky.length === 0) {
      setAiReview("No high-risk or open decisions. Board action backlog is clear.");
      return;
    }
    setAiReview(
      "AI Boardroom Review:\n" +
      risky.map(d =>
        `• [${d.date}] "${d.decision}" (${d.status}, Risk: ${d.risk}) - Owner: ${d.owner}, Follow-up: ${d.followup || "None"}`
      ).join("\n")
    );
  }

  return (
    <div className="dle-root">
      {/* Header */}
      <div className="dle-header">
        <span className="dle-title">DECISION LOG ELITE</span>
        <span className="dle-sub">Boardroom Timeline of Strategic Actions</span>
        <button className="dle-export-btn">
          <FaFileExport style={{ marginRight: 7 }} /> Export Log
        </button>
      </div>
      {/* Analytics */}
      <div className="dle-analytics-row">
        <div className="dle-analytic"><FaChartPie /> Open: <b>{analytics.open}</b></div>
        <div className="dle-analytic" style={{ color: "#1de682" }}>In Progress: <b>{analytics.progress}</b></div>
        <div className="dle-analytic" style={{ color: "#FFD700" }}>Closed: <b>{analytics.closed}</b></div>
        <div className="dle-analytic" style={{ color: "#FF4444" }}>High Risk: <b>{analytics.highRisk}</b></div>
        <button className="dle-ai-btn" onClick={doAiReview}><FaRegLightbulb style={{ marginRight: 4 }} />AI Review</button>
      </div>
      {aiReview && (
        <div className="dle-ai-review-box">
          {aiReview}
        </div>
      )}
      {/* Filters */}
      <div className="dle-filters">
        <span className="dle-filter">
          <FaSearch style={{ color: "#FFD700", marginRight: 5 }} />
          <input
            className="dle-filter-input"
            placeholder="Search decision or rationale…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </span>
        <select className="dle-filter-select" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
          <option value="">All Owners</option>
          <option value="Board">Board</option>
          <option value="GM">GM</option>
        </select>
        <select className="dle-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
        <select className="dle-filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {CATEGORIES.map(cat =>
            <option value={cat} key={cat}>{cat}</option>
          )}
        </select>
        <input type="date" className="dle-filter-date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input type="date" className="dle-filter-date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <button className="dle-add-btn" onClick={() => setModal(true)}>
          <FaPlus style={{ marginRight: 5 }} /> Add Decision
        </button>
      </div>
      {/* Timeline */}
      <div className="dle-timeline">
        {todayAndFuture.length > 0 && (
          <div className="dle-timeline-today">Upcoming / Today</div>
        )}
        {todayAndFuture.map(d =>
          <DecisionEvent
            key={d.id}
            d={d}
            expanded={expanded[d.id]}
            setExpanded={e => setExpanded({ ...expanded, [d.id]: e })}
            commentText={commentText}
            setCommentText={setCommentText}
            addComment={addComment}
          />
        )}
        {past.length > 0 && (
          <div className="dle-timeline-today dle-timeline-divider">Past</div>
        )}
        {past.map(d =>
          <DecisionEvent
            key={d.id}
            d={d}
            expanded={expanded[d.id]}
            setExpanded={e => setExpanded({ ...expanded, [d.id]: e })}
            commentText={commentText}
            setCommentText={setCommentText}
            addComment={addComment}
          />
        )}
        {filtered.length === 0 && (
          <div className="dle-empty">No decisions found for selected filters.</div>
        )}
      </div>
      {/* Add Decision Modal */}
      {modal &&
        <div className="dle-modal-bg" onClick={() => setModal(false)}>
          <div className="dle-modal-card" onClick={e => e.stopPropagation()}>
            <div className="dle-modal-title">Add Strategic Decision</div>
            <div className="dle-modal-form">
              <input className="dle-modal-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <select className="dle-modal-input" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })}>
                <option>Board</option>
                <option>GM</option>
              </select>
              <select className="dle-modal-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.filter(cat => cat !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input className="dle-modal-input" placeholder="Decision summary" value={form.decision} onChange={e => setForm({ ...form, decision: e.target.value })} />
              <input className="dle-modal-input" placeholder="Rationale" value={form.rationale} onChange={e => setForm({ ...form, rationale: e.target.value })} />
              <select className="dle-modal-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
              <select className="dle-modal-input" value={form.risk} onChange={e => setForm({ ...form, risk: e.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input className="dle-modal-input" placeholder="Attachment (URL, PDF, etc)" value={form.attachment} onChange={e => setForm({ ...form, attachment: e.target.value })} />
              <input className="dle-modal-input" placeholder="Follow-up action/notes" value={form.followup} onChange={e => setForm({ ...form, followup: e.target.value })} />
              <button className="dle-modal-add-btn" onClick={handleAdd}>Add Decision</button>
              <button className="dle-modal-cancel-btn" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      }
      <div className="dle-footer">
        <b>Prepared for:</b> <span style={{ color: "#FFD700" }}>Zagreb Youth Basketball Club</span>
        <span style={{ marginLeft: 14, color: "#FFD700" }}>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// -- Timeline Decision Event Component --
function DecisionEvent({ d, expanded, setExpanded, commentText, setCommentText, addComment }) {
  return (
    <div className={`dle-event dle-${d.status.toLowerCase().replace(" ", "-")}`}>
      <div className="dle-dot" style={{ background: STATUS_COLOR[d.status] || "#FFD700" }}>
        {OWNER_AVATAR[d.owner]}
      </div>
      <div className="dle-main">
        <div className="dle-event-row">
          <span className="dle-event-date">{d.date}</span>
          <span className="dle-event-owner">{d.owner}</span>
          <span className="dle-event-category">{d.category}</span>
          <span className="dle-event-status" style={{ background: STATUS_COLOR[d.status] || "#FFD700", color: "#232a2e" }}>{d.status}</span>
          <span className="dle-event-risk">{RISK_ICON[d.risk]} {d.risk}</span>
          {d.attachment && (
            <a className="dle-attachment" href={d.attachment} target="_blank" rel="noopener noreferrer" title="Open attachment">
              <FaPaperclip />
            </a>
          )}
          <button className="dle-comment-toggle" onClick={() => setExpanded(!expanded)}>
            <FaRegCommentDots /> {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
        <div className="dle-event-title">{d.decision}</div>
        <div className="dle-event-rationale">{d.rationale}</div>
        {d.followup && (
          <div className="dle-event-followup">
            <FaClock style={{ color: "#FFD700", marginRight: 6 }} />
            {d.followup}
          </div>
        )}
        {expanded && (
          <div className="dle-comments-log">
            <div className="dle-comments-head">Boardroom Comments</div>
            <ul>
              {d.comments.length === 0 && <li className="dle-no-comments">No comments yet.</li>}
              {d.comments.map((c, i) =>
                <li key={i}>
                  <span className="dle-comment-owner">{c.by}</span>
                  <span className="dle-comment-date">{c.date}:</span>
                  <span className="dle-comment-text">{c.text}</span>
                </li>
              )}
            </ul>
            <div className="dle-comment-add">
              <input
                className="dle-comment-input"
                placeholder="Add comment (Board/GM only)…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addComment(d.id); }}
              />
              <button className="dle-comment-btn" onClick={() => addComment(d.id)}>Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
