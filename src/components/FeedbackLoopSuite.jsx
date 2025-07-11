import React, { useState } from "react";
import {
  FaUserTie, FaUser, FaChartLine, FaComments, FaBolt, FaArrowUp, FaArrowDown, FaBalanceScale, FaClipboardList, FaExclamationTriangle
} from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import "./FeedbackLoopSuite.css";

const INIT_FEEDBACK = [
  {
    id: 1,
    type: "Athlete",
    name: "Luka Marić",
    area: "Training",
    cycle: "Spring 2025",
    status: "At Risk",
    responses: [
      { q: "Session difficulty is appropriate", a: 2 },
      { q: "Communication from coach is clear", a: 3 },
      { q: "Feel valued in the team", a: 2 }
    ],
    comments: ["I often feel sessions are too intense.", "Not always sure what’s expected of me."],
    flagged: true,
    trend: [4, 3, 3, 2]
  },
  {
    id: 2,
    type: "Coach",
    name: "Ana Perković",
    area: "Communication",
    cycle: "Spring 2025",
    status: "In Progress",
    responses: [
      { q: "Athletes are engaged in training", a: 4 },
      { q: "Staff communication is efficient", a: 3 },
      { q: "Feel supported by management", a: 2 }
    ],
    comments: ["More feedback from board needed."],
    flagged: false,
    trend: [2, 3, 2, 3]
  },
  {
    id: 3,
    type: "Athlete",
    name: "Filip Horvat",
    area: "Well-being",
    cycle: "Spring 2025",
    status: "Resolved",
    responses: [
      { q: "Feel healthy and rested", a: 4 },
      { q: "Recovery practices are in place", a: 5 },
      { q: "Mental health is prioritized", a: 4 }
    ],
    comments: [],
    flagged: false,
    trend: [4, 4, 5, 4]
  },
  {
    id: 4,
    type: "Coach",
    name: "Ivan Kovač",
    area: "Role Clarity",
    cycle: "Spring 2025",
    status: "At Risk",
    responses: [
      { q: "Role and duties are clear", a: 2 },
      { q: "Know where to get support", a: 2 },
      { q: "Feedback is actionable", a: 2 }
    ],
    comments: ["Sometimes unclear expectations.", "Role changes not communicated."],
    flagged: true,
    trend: [3, 2, 2, 2]
  }
];

const STATUS_COLORS = {
  "At Risk": "#FF4444",
  "In Progress": "#FFD700",
  "Resolved": "#1de682"
};
const TYPE_ICONS = {
  "Athlete": <FaUser style={{ color: "#1de682" }} />,
  "Coach": <FaUserTie style={{ color: "#FFD700" }} />
};

export default function FeedbackLoopSuite() {
  const [feedback, setFeedback] = useState(INIT_FEEDBACK);
  const [selected, setSelected] = useState(INIT_FEEDBACK[0].id);
  const [boardActions, setBoardActions] = useState([
    { id: 1, text: "Review athlete intensity complaints", owner: "Board", status: "To Do" }
  ]);
  const [aiInsights, setAiInsights] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [comment, setComment] = useState("");
  const [newAction, setNewAction] = useState("");
  const [newOwner, setNewOwner] = useState("Board");

  // Filter and select
  const filtered = feedback.filter(f =>
    (!filterType || f.type === filterType) &&
    (!filterStatus || f.status === filterStatus)
  );
  const fb = feedback.find(f => f.id === selected);

  // For trend chart (average satisfaction per cycle)
  const allTrends = [
    {
      id: "Avg Trend",
      color: "#FFD700",
      data: fb.trend.map((v, i) => ({
        x: `C${i + 1}`,
        y: v
      }))
    }
  ];

  // For bar chart (response breakdown)
  const barData = fb.responses.map(r => ({
    question: r.q,
    score: r.a
  }));

  // AI Insights
  function runAI() {
    let msg = `AI Insight for ${fb.name} (${fb.type}):\n`;
    const avg = (fb.responses.reduce((s, r) => s + r.a, 0) / fb.responses.length).toFixed(1);
    if (fb.status === "At Risk" || fb.flagged) {
      msg += `⚠️ Recurring red flags detected. Board should review feedback, communicate with ${fb.type.toLowerCase()}, and prioritize this in next meeting.\n`;
    }
    msg += `• Current average score: ${avg}\n`;
    msg += fb.comments.length
      ? `• Noted comments: ${fb.comments.map(c => `"${c}"`).join(" | ")}\n`
      : "";
    msg += "• Suggested action: Assign responsible board/GM, provide feedback, and check trend at next cycle.";
    setAiInsights(msg);
  }

  // Add boardroom action
  function addAction() {
    if (!newAction.trim()) return;
    setBoardActions(actions => [
      ...actions,
      {
        id: Date.now(),
        text: newAction,
        owner: newOwner,
        status: "To Do"
      }
    ]);
    setNewAction("");
    setNewOwner("Board");
  }

  // Board action status
  function setActionStatus(id, status) {
    setBoardActions(actions =>
      actions.map(a => a.id === id ? { ...a, status } : a)
    );
  }
  function setActionOwner(id, owner) {
    setBoardActions(actions =>
      actions.map(a => a.id === id ? { ...a, owner } : a)
    );
  }

  // Add comment to feedback
  function addComment() {
    if (!comment.trim()) return;
    setFeedback(feedback =>
      feedback.map(f =>
        f.id === selected
          ? { ...f, comments: [...f.comments, comment] }
          : f
      )
    );
    setComment("");
  }

  return (
    <div className="fls-root">
      <div className="fls-header">
        <FaComments style={{ color: "#FFD700", fontSize: 40, marginRight: 18 }} />
        <span className="fls-title">ATHLETE & COACH FEEDBACK LOOP SUITE</span>
        <span className="fls-score">
          <FaClipboardList style={{ color: "#1de682", marginRight: 5 }} />
          Cycles: <b>{feedback.length}</b>
        </span>
      </div>
      {/* Quick filters */}
      <div className="fls-filter-row">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Athlete">Athlete</option>
          <option value="Coach">Coach</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="At Risk">At Risk</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
      <div className="fls-main-grid">
        {/* Feedback List */}
        <div className="fls-list">
          <ul>
            {filtered.map(f =>
              <li
                key={f.id}
                className={`fls-fb-card${f.id === selected ? " selected" : ""}`}
                onClick={() => setSelected(f.id)}
              >
                <span className="fls-fb-icon">{TYPE_ICONS[f.type]}</span>
                <span className="fls-fb-name">{f.name}</span>
                <span className="fls-fb-type">{f.type}</span>
                <span className="fls-fb-area">{f.area}</span>
                <span className="fls-fb-cycle">{f.cycle}</span>
                <span className="fls-fb-status" style={{ background: STATUS_COLORS[f.status] }}>{f.status}</span>
                {f.flagged && <span className="fls-fb-flag"><FaExclamationTriangle /></span>}
              </li>
            )}
          </ul>
        </div>
        {/* Feedback Dashboard */}
        <div className="fls-dashboard">
          <div className="fls-fb-header">
            {TYPE_ICONS[fb.type]} <span className="fls-fb-main">{fb.name}</span>
            <span className="fls-fb-typechip">{fb.type}</span>
            <span className="fls-fb-cyclechip">{fb.cycle}</span>
            <span className="fls-fb-statuschip" style={{ background: STATUS_COLORS[fb.status] }}>{fb.status}</span>
          </div>
          <div className="fls-trend-section">
            <div className="fls-trend-title">
              <FaChartLine style={{ color: "#FFD700", marginRight: 6 }} />
              Trend Over Cycles
            </div>
            <div className="fls-trend-chart">
              <ResponsiveLine
                data={allTrends}
                margin={{ top: 18, right: 22, bottom: 38, left: 36 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: 5, stacked: false }}
                axisBottom={{
                  tickSize: 3, tickPadding: 8, legend: "Cycle", legendOffset: 24, legendPosition: "middle"
                }}
                axisLeft={{
                  tickSize: 3, tickPadding: 7, legend: "Score", legendOffset: -28, legendPosition: "middle"
                }}
                colors={["#FFD700"]}
                pointSize={8}
                pointColor="#FFD700"
                pointBorderWidth={2}
                pointBorderColor="#232a2e"
                enableArea={true}
                areaOpacity={0.09}
                theme={{
                  fontFamily: "Segoe UI, sans-serif",
                  textColor: "#fff",
                  axis: { ticks: { text: { fill: "#fff" } }, legend: { text: { fill: "#FFD700" } } }
                }}
                useMesh={true}
                tooltip={({ point }) => (
                  <div style={{ background: "#232a2e", color: "#FFD700", padding: 7, borderRadius: 7 }}>
                    <b>{point.data.x}</b>: {point.data.y}
                  </div>
                )}
              />
            </div>
          </div>
          <div className="fls-bar-section">
            <div className="fls-bar-title">
              Response Breakdown
            </div>
            <div className="fls-bar-chart">
              <ResponsiveBar
                data={barData}
                keys={['score']}
                indexBy="question"
                margin={{ top: 10, right: 10, bottom: 52, left: 42 }}
                padding={0.22}
                axisBottom={{ tickSize: 3, tickPadding: 10, tickRotation: 0 }}
                colors={b => b.data.score < 3 ? "#FF4444" : b.data.score < 4 ? "#FFD700" : "#1de682"}
                theme={{
                  fontFamily: "Segoe UI, sans-serif",
                  fontSize: 15,
                  textColor: "#fff",
                  axis: { ticks: { text: { fill: "#fff" } }, legend: { text: { fill: "#FFD700" } } }
                }}
                enableLabel={false}
                tooltip={({ data }) =>
                  <div style={{ background: "#232a2e", color: "#fff", padding: 8, borderRadius: 8 }}>
                    <b>{data.question}</b><br />
                    Score: <span style={{ color: "#FFD700" }}>{data.score}</span>
                  </div>
                }
              />
            </div>
          </div>
          <div className="fls-fb-comments">
            <h4>Anonymous Comments</h4>
            <ul>
              {fb.comments.length === 0 && <li>No comments.</li>}
              {fb.comments.map((c, i) => (
                <li key={i}><FaUser style={{ marginRight: 6, color: "#FFD700" }} /> {c}</li>
              ))}
            </ul>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add anonymous comment…"
              className="fls-comment-input"
              rows={2}
            />
            <button className="fls-comment-btn" onClick={addComment}>Add Comment</button>
          </div>
          <div className="fls-ai-section">
            <button className="fls-ai-btn" onClick={runAI}>
              <FaBolt style={{ marginRight: 7 }} /> AI Insight
            </button>
            {aiInsights && (
              <div className="fls-ai-output"><pre>{aiInsights}</pre></div>
            )}
          </div>
        </div>
        {/* Boardroom Action Tracker */}
        <div className="fls-kanban">
          <h3><FaClipboardList style={{ marginRight: 7 }} />Boardroom Action Tracker</h3>
          <div className="fls-kanban-board">
            {["To Do", "In Progress", "Done"].map(status => (
              <div className="fls-kanban-col" key={status}>
                <div className="fls-kanban-title">{status}</div>
                {boardActions.filter(a => a.status === status).map(a =>
                  <div key={a.id} className="fls-kanban-card">
                    <div className="fls-kanban-text">{a.text}</div>
                    <div>
                      <span className="fls-kanban-owner">Owner:</span>
                      <select
                        value={a.owner}
                        onChange={e => setActionOwner(a.id, e.target.value)}
                      >
                        <option>Board</option>
                        <option>GM</option>
                      </select>
                    </div>
                    <div>
                      <span className="fls-kanban-status">Status:</span>
                      <select
                        value={a.status}
                        onChange={e => setActionStatus(a.id, e.target.value)}
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="fls-kanban-add">
            <input
              value={newAction}
              onChange={e => setNewAction(e.target.value)}
              className="fls-kanban-input"
              placeholder="Add new board/GM action…"
            />
            <select value={newOwner} onChange={e => setNewOwner(e.target.value)}>
              <option>Board</option>
              <option>GM</option>
            </select>
            <button className="fls-kanban-btn" onClick={addAction}>Add</button>
          </div>
        </div>
      </div>
      <div className="fls-footer">
        <b>Prepared by CourtEvo Vero – Elite Basketball Consulting</b>
      </div>
    </div>
  );
}
