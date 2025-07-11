import React, { useState } from "react";
import {
  FaChartLine, FaCrown, FaUserTie, FaFileExport, FaCheckCircle, FaArrowUp, FaArrowDown, FaBolt, FaBalanceScale, FaBookOpen, FaTasks, FaExclamationTriangle, FaUser, FaPen
} from "react-icons/fa";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import "./OrgDiagnosticScoringSuite.css";

const INIT_PILLARS = [
  {
    id: "Governance",
    color: "#FFD700",
    score: 82,
    weight: 0.18,
    trend: [76, 78, 81, 83, 82, 84],
    volatility: 2.1,
    resource: "https://basketballconsulting.com/best-practices-governance",
    subs: [
      { name: "Board Composition", score: 85 },
      { name: "Policies", score: 75 },
      { name: "Transparency", score: 81 }
    ],
    actions: [
      { id: 1, text: "Quarterly Board Review", status: "To Do", owner: "Board" }
    ]
  },
  {
    id: "Finance",
    color: "#1de682",
    score: 73,
    weight: 0.17,
    trend: [65, 70, 72, 75, 73, 77],
    volatility: 4.5,
    resource: "https://basketballconsulting.com/best-practices-finance",
    subs: [
      { name: "Budgeting", score: 70 },
      { name: "Controls", score: 74 },
      { name: "Sponsorship", score: 80 }
    ],
    actions: [
      { id: 2, text: "Launch sponsorship campaign", status: "To Do", owner: "GM" }
    ]
  },
  {
    id: "Coaching",
    color: "#2ea2f0",
    score: 67,
    weight: 0.14,
    trend: [62, 68, 67, 66, 67, 71],
    volatility: 5.1,
    resource: "https://basketballconsulting.com/best-practices-coaching",
    subs: [
      { name: "Coach Dev", score: 65 },
      { name: "CPD", score: 70 }
    ],
    actions: []
  },
  {
    id: "HR",
    color: "#b5efb0",
    score: 85,
    weight: 0.12,
    trend: [80, 81, 83, 84, 85, 86],
    volatility: 1.2,
    resource: "https://basketballconsulting.com/best-practices-hr",
    subs: [
      { name: "Staff Development", score: 82 },
      { name: "Recruitment", score: 88 }
    ],
    actions: []
  },
  {
    id: "Communication",
    color: "#bfc3ff",
    score: 63,
    weight: 0.13,
    trend: [61, 59, 60, 62, 63, 61],
    volatility: 2.9,
    resource: "https://basketballconsulting.com/best-practices-communication",
    subs: [
      { name: "Internal", score: 62 },
      { name: "External", score: 66 }
    ],
    actions: []
  },
  {
    id: "Compliance",
    color: "#ab88ff",
    score: 89,
    weight: 0.08,
    trend: [87, 87, 88, 88, 89, 89],
    volatility: 0.6,
    resource: "https://basketballconsulting.com/best-practices-compliance",
    subs: [
      { name: "Licenses", score: 90 },
      { name: "Policies", score: 87 }
    ],
    actions: []
  },
  {
    id: "Youth",
    color: "#fca311",
    score: 76,
    weight: 0.09,
    trend: [72, 75, 75, 76, 76, 77],
    volatility: 1.8,
    resource: "https://basketballconsulting.com/best-practices-youth",
    subs: [
      { name: "Talent ID", score: 77 },
      { name: "Development Pathway", score: 75 }
    ],
    actions: []
  },
  {
    id: "Facilities",
    color: "#43b0f1",
    score: 70,
    weight: 0.08,
    trend: [68, 68, 69, 70, 70, 71],
    volatility: 1.1,
    resource: "https://basketballconsulting.com/best-practices-facilities",
    subs: [
      { name: "Maintenance", score: 73 },
      { name: "Availability", score: 66 }
    ],
    actions: []
  },
  {
    id: "Innovation",
    color: "#e53935",
    score: 61,
    weight: 0.08,
    trend: [65, 62, 62, 61, 61, 59],
    volatility: 3.5,
    resource: "https://basketballconsulting.com/best-practices-innovation",
    subs: [
      { name: "Tech Adoption", score: 58 },
      { name: "Process", score: 65 }
    ],
    actions: []
  }
];

const RISK_THRESHOLDS = { high: 65, critical: 60 };
const OWNERS = [
  { label: "Board", icon: <FaCrown style={{ color: "#FFD700" }} /> },
  { label: "GM", icon: <FaUserTie style={{ color: "#1de682" }} /> }
];
const ACTION_STATUS = ["To Do", "In Progress", "Done", "At Risk"];

export default function OrgDiagnosticScoringSuite() {
  const [pillars, setPillars] = useState(INIT_PILLARS);
  const [comments, setComments] = useState([]);
  const [aiSuggest, setAiSuggest] = useState({});
  const [exportLog, setExportLog] = useState([]);
  const [modal, setModal] = useState(null);
  const [modalTab, setModalTab] = useState("summary");
  const [historicQuarter, setHistoricQuarter] = useState(5); // 0-indexed: most recent
  const [qna, setQna] = useState("");
  const [auditLog, setAuditLog] = useState([]);

  // Weighted score
  const weightedScore = pillars.reduce((sum, p) => sum + p.score * p.weight, 0).toFixed(1);

  // Historic weighted score by quarter
  const lineData = [
    {
      id: "Weighted Avg",
      color: "#FFD700",
      data: pillars[0].trend.map((_, i) => ({
        x: `Q${i + 1}`,
        y: pillars.reduce((sum, p) => sum + p.trend[i] * p.weight, 0).toFixed(1)
      }))
    }
  ];

  // Pie chart for weights
  const pieData = pillars.map(p => ({
    id: p.id,
    label: p.id,
    value: p.weight,
    color: p.color
  }));

  function updatePillar(idx, field, val) {
    setPillars(ps =>
      ps.map((p, i) =>
        i === idx ? { ...p, [field]: field === "score" ? parseInt(val) : parseFloat(val) } : p
      )
    );
    setAuditLog(log => [
      { date: new Date().toLocaleString(), text: `Pillar ${pillars[idx].id} ${field} updated to ${val}` }, ...log
    ]);
  }

  function addComment(idx, user, comment) {
    setComments(comments => [
      {
        pillar: pillars[idx].id,
        user,
        comment,
        date: new Date().toLocaleString()
      },
      ...comments
    ]);
    setAuditLog(log => [
      { date: new Date().toLocaleString(), text: `Comment added to ${pillars[idx].id}` }, ...log
    ]);
  }

  function getAISuggest(pillar) {
    let msg = `AI for ${pillar.id}:\n`;
    const diff = pillar.trend[historicQuarter] - pillar.trend[historicQuarter - 1] || 0;
    if (pillar.score < RISK_THRESHOLDS.critical) {
      msg += `CRITICAL: ${pillar.id} score fell to ${pillar.score}. Volatility high (${pillar.volatility}). Immediate action plan: assign board champion, consult external expert. See ${pillar.resource}`;
    } else if (pillar.score < RISK_THRESHOLDS.high) {
      msg += `HIGH RISK: ${pillar.id} at ${pillar.score}. Review action plan and best-practice. Change from last quarter: ${diff > 0 ? "+" : ""}${diff}.`;
    } else {
      msg += `Stable: ${pillar.id} at ${pillar.score}. Maintain oversight, monitor sub-area scores.`;
    }
    setAiSuggest(ai => ({ ...ai, [pillar.id]: msg }));
  }

  function exportBoardroom() {
    setExportLog(log => [
      { date: new Date().toLocaleString(), weightedScore, type: "PDF" }, ...log
    ]);
    setAuditLog(log => [
      { date: new Date().toLocaleString(), text: "Exported boardroom report" }, ...log
    ]);
    alert("Exported as PDF/CSV (stub: hook in backend).");
  }

  function openPillarModal(idx) {
    setModal(idx);
    setModalTab("summary");
  }

  function closeModal() { setModal(null); }

  function updateSubscore(pIdx, sIdx, val) {
    setPillars(ps =>
      ps.map((p, i) =>
        i === pIdx
          ? {
              ...p,
              subs: p.subs.map((s, j) => (j === sIdx ? { ...s, score: parseInt(val) } : s))
            }
          : p
      )
    );
    setAuditLog(log => [
      { date: new Date().toLocaleString(), text: `Subscore in ${pillars[pIdx].id} updated to ${val}` }, ...log
    ]);
  }

  // Kanban actions for this pillar
  function updateActionStatus(pIdx, aIdx, status) {
    setPillars(ps =>
      ps.map((p, i) =>
        i === pIdx
          ? {
              ...p,
              actions: p.actions.map((a, j) =>
                j === aIdx ? { ...a, status } : a
              )
            }
          : p
      )
    );
  }
  function addAction(pIdx, text, owner) {
    setPillars(ps =>
      ps.map((p, i) =>
        i === pIdx
          ? { ...p, actions: [...p.actions, { id: Date.now(), text, status: "To Do", owner }] }
          : p
      )
    );
    setAuditLog(log => [
      { date: new Date().toLocaleString(), text: `Action added to ${pillars[pIdx].id}` }, ...log
    ]);
  }
  function assignOwner(pIdx, aIdx, owner) {
    setPillars(ps =>
      ps.map((p, i) =>
        i === pIdx
          ? {
              ...p,
              actions: p.actions.map((a, j) => (j === aIdx ? { ...a, owner } : a))
            }
          : p
      )
    );
  }

  // Risk banners
  const atRisk = pillars.filter(p => p.score < RISK_THRESHOLDS.high);
  const critical = pillars.filter(p => p.score < RISK_THRESHOLDS.critical);

  return (
    <div className="ods-root">
      {/* Header */}
      <div className="ods-header">
        <span className="ods-title"><FaBalanceScale style={{ marginRight: 10 }} />ORG DIAGNOSTIC SCORING SUITE</span>
        <span className="ods-score">
          {weightedScore}
          <span className="ods-score-label">Weighted Score</span>
        </span>
        <button className="ods-export-btn" onClick={exportBoardroom}>
          <FaFileExport style={{ marginRight: 8 }} /> Export PDF/CSV
        </button>
      </div>
      <div className="ods-brand-line">
        <b>Prepared for:</b> <span style={{ color: "#FFD700" }}>Zagreb Youth Basketball Club</span>
        <span style={{ marginLeft: 16, color: "#FFD700", fontWeight: 700 }}> {new Date().toLocaleDateString()} </span>
      </div>
      {/* Historic quarter selection */}
      <div className="ods-historic-select">
        <label>Historic Quarter:&nbsp;</label>
        <select value={historicQuarter} onChange={e => setHistoricQuarter(Number(e.target.value))}>
          {pillars[0].trend.map((_, i) => (
            <option key={i} value={i}>Q{i + 1}</option>
          ))}
        </select>
      </div>
      {/* Risk banners */}
      {critical.length > 0 && (
        <div className="ods-banner ods-banner-critical">
          <FaArrowDown /> CRITICAL: {critical.map(p => p.id).join(", ")} scoring below 60. Board action required!
        </div>
      )}
      {atRisk.length > 0 && !critical.length && (
        <div className="ods-banner ods-banner-risk">
          <FaExclamationTriangle /> At risk: {atRisk.map(p => p.id).join(", ")} below 65. Prioritize in board review.
        </div>
      )}
      {/* Weighting Pie */}
      <div className="ods-pie-card">
        <h3>Weighting Distribution</h3>
        <div className="ods-pie-chart">
          <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 90, bottom: 40, left: 90 }}
            innerRadius={0.48}
            padAngle={1}
            cornerRadius={5}
            colors={pieData.map(p => p.color)}
            borderWidth={2}
            borderColor="#232a2e"
            enableRadialLabels={false}
            theme={{
              fontFamily: "Segoe UI, sans-serif",
              fontSize: 14,
              textColor: "#fff"
            }}
            legends={[{
              anchor: "right",
              direction: "column",
              translateX: 100,
              itemWidth: 92,
              itemHeight: 21,
              symbolSize: 16,
              itemTextColor: "#FFD700"
            }]}
            tooltip={({ datum }) => (
              <div style={{ background: "#232a2e", color: datum.color, padding: 8, borderRadius: 8 }}>
                <b>{datum.id}</b>: {(datum.value * 100).toFixed(1)}%
              </div>
            )}
          />
        </div>
      </div>
      {/* Pillar Grid */}
      <div className="ods-pillar-grid">
        {pillars.map((p, idx) => (
          <div className="ods-pillar-card" key={p.id} style={{ borderColor: p.color }}>
            <div className="ods-pillar-header" style={{ color: p.color }} onClick={() => openPillarModal(idx)}>
              <FaBookOpen style={{ marginRight: 7 }} /> {p.id}
              <span className="ods-volatility" style={{ color: "#FFD700" }}>
                Volatility: {p.volatility}
                {p.trend[historicQuarter] > p.trend[historicQuarter - 1] ? <FaArrowUp style={{ color: "#1de682" }} /> : <FaArrowDown style={{ color: "#FF4444" }} />}
              </span>
            </div>
            <div className="ods-score-row">
              <div>
                <label>Score:</label>
                <input
                  className="ods-score-input"
                  type="number"
                  value={p.score}
                  min="0"
                  max="100"
                  onChange={e => updatePillar(idx, "score", e.target.value)}
                  style={{ borderColor: p.color }}
                />
              </div>
              <div>
                <label>Weight:</label>
                <input
                  className="ods-weight-input"
                  type="number"
                  step="0.01"
                  value={p.weight}
                  min="0.01"
                  max="0.30"
                  onChange={e => updatePillar(idx, "weight", e.target.value)}
                  style={{ borderColor: p.color }}
                />
              </div>
            </div>
            <div className="ods-trendline">
              <FaChartLine style={{ color: p.color, marginRight: 6 }} />{" "}
              {p.trend.map((val, i) => (
                <span
                  key={i}
                  className="ods-trend-dot"
                  style={{
                    background: val >= 80 ? "#1de682" : val >= 70 ? "#FFD700" : "#FF4444",
                    outline: i === historicQuarter ? "2px solid #FFF" : "none"
                  }}
                >
                  {val}
                </span>
              ))}
              <span className="ods-pillar-resource">
                <a href={p.resource} target="_blank" rel="noopener noreferrer" style={{ color: p.color, marginLeft: 7 }}>
                  Best Practice
                </a>
              </span>
            </div>
            <div className="ods-ai-row">
              <button className="ods-ai-btn" onClick={() => getAISuggest(p)}>
                <FaBolt style={{ color: "#FFD700" }} /> AI Suggestion
              </button>
              {aiSuggest[p.id] && (
                <div className="ods-ai-suggestion">
                  <pre>{aiSuggest[p.id]}</pre>
                </div>
              )}
            </div>
            <div className="ods-comment-row">
              <input
                className="ods-comment-input"
                placeholder="Board comment…"
                onKeyDown={e => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    addComment(idx, "Board", e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Pillar Modal */}
      {modal !== null && (() => {
        const p = pillars[modal];
        return (
          <div className="ods-modal-bg" onClick={closeModal}>
            <div className="ods-modal-card" onClick={e => e.stopPropagation()}>
              <div className="ods-modal-tabs">
                <button className={modalTab === "summary" ? "active" : ""} onClick={() => setModalTab("summary")}>Summary</button>
                <button className={modalTab === "subs" ? "active" : ""} onClick={() => setModalTab("subs")}>Subscores</button>
                <button className={modalTab === "actions" ? "active" : ""} onClick={() => setModalTab("actions")}>Kanban Actions</button>
                <button className={modalTab === "audit" ? "active" : ""} onClick={() => setModalTab("audit")}>Audit/Q&A</button>
                <button className="ods-modal-close" onClick={closeModal}>×</button>
              </div>
              <div className="ods-modal-content">
                {modalTab === "summary" && (
                  <>
                    <h2 style={{ color: p.color }}>{p.id} – Pillar Deep Dive</h2>
                    <p><b>Score:</b> <span style={{ color: "#FFD700" }}>{p.score}</span></p>
                    <p><b>Volatility:</b> <span style={{ color: "#1de682" }}>{p.volatility}</span></p>
                    <p><a href={p.resource} target="_blank" rel="noopener noreferrer" style={{ color: "#FFD700" }}>Best Practice Resource</a></p>
                  </>
                )}
                {modalTab === "subs" && (
                  <>
                    <h3>Subscores</h3>
                    <table className="ods-modal-table">
                      <thead>
                        <tr><th>Sub-area</th><th>Score</th><th></th></tr>
                      </thead>
                      <tbody>
                        {p.subs.map((s, j) => (
                          <tr key={j}>
                            <td>{s.name}</td>
                            <td>
                              <input
                                type="number"
                                value={s.score}
                                min="0"
                                max="100"
                                onChange={e => updateSubscore(modal, j, e.target.value)}
                                className="ods-score-input"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
                {modalTab === "actions" && (
                  <>
                    <h3>Kanban Action Tracker</h3>
                    <div className="ods-kanban-board">
                      {ACTION_STATUS.map(status => (
                        <div className="ods-kanban-col" key={status}>
                          <div className="ods-kanban-col-title">{status}</div>
                          {p.actions.filter(a => a.status === status).map((a, aIdx) =>
                            <div className="ods-kanban-card" key={a.id}>
                              <div>
                                <b>{a.text}</b>
                              </div>
                              <div>
                                <span className="ods-kanban-owner">Owner:</span>
                                <select
                                  value={a.owner}
                                  onChange={e => assignOwner(modal, aIdx, e.target.value)}
                                >
                                  {OWNERS.map(o => (
                                    <option key={o.label} value={o.label}>{o.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <span className="ods-kanban-status">Status:</span>
                                <select
                                  value={a.status}
                                  onChange={e => updateActionStatus(modal, aIdx, e.target.value)}
                                >
                                  {ACTION_STATUS.map(status2 => (
                                    <option key={status2} value={status2}>{status2}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="ods-kanban-add">
                      <input className="ods-kanban-input" placeholder="Add new board/GM action…" id="ods-kanban-input"/>
                      <select id="ods-kanban-owner">
                        {OWNERS.map(o => (
                          <option key={o.label} value={o.label}>{o.label}</option>
                        ))}
                      </select>
                      <button
                        className="ods-kanban-add-btn"
                        onClick={() => {
                          const txt = document.getElementById('ods-kanban-input').value;
                          const owner = document.getElementById('ods-kanban-owner').value;
                          if (txt.trim()) {
                            addAction(modal, txt, owner);
                            document.getElementById('ods-kanban-input').value = '';
                          }
                        }}
                      >Add</button>
                    </div>
                  </>
                )}
                {modalTab === "audit" && (
                  <>
                    <h3>Audit & Q&A</h3>
                    <div className="ods-modal-auditlog">
                      {auditLog.filter(a => a.text.includes(p.id)).map((a, i) => (
                        <div key={i} className="ods-audit-entry">
                          <span>{a.date}:</span>
                          <span>{a.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ods-modal-qna">
                      <textarea
                        value={qna}
                        onChange={e => setQna(e.target.value)}
                        placeholder="Ask a board/GM question or add insight"
                        rows={2}
                        className="ods-qna-box"
                      />
                      <button
                        className="ods-qna-submit"
                        onClick={() => {
                          if (qna.trim()) {
                            setAuditLog(log => [
                              { date: new Date().toLocaleString(), text: `[Q&A] ${p.id}: ${qna}` }, ...log
                            ]);
                            setQna("");
                          }
                        }}
                      >Submit Q&A</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Weighted Score (Nivo Line) */}
      <div className="ods-history-section">
        <h3>Historical Weighted Score</h3>
        <div className="ods-history-chart">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 30, right: 38, bottom: 46, left: 55 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 50, max: 100, stacked: false }}
            axisBottom={{
              tickSize: 4,
              tickPadding: 10,
              tickRotation: 0,
              legend: "Quarter",
              legendOffset: 36,
              legendPosition: "middle",
              tickValues: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]
            }}
            axisLeft={{
              tickSize: 4,
              tickPadding: 7,
              legend: "Weighted Score",
              legendOffset: -44,
              legendPosition: "middle"
            }}
            colors={["#FFD700"]}
            pointSize={10}
            pointColor="#FFD700"
            pointBorderWidth={2}
            pointBorderColor="#232a2e"
            enableArea={true}
            areaBaselineValue={60}
            areaOpacity={0.09}
            theme={{
              fontFamily: "Segoe UI, sans-serif",
              textColor: "#fff",
              axis: { ticks: { text: { fill: "#fff" } }, legend: { text: { fill: "#FFD700" } } }
            }}
            useMesh={true}
            tooltip={({ point }) => (
              <div style={{ background: "#232a2e", color: "#FFD700", padding: 8, borderRadius: 8 }}>
                <b>{point.data.x}</b>: {point.data.y}
              </div>
            )}
          />
        </div>
      </div>
      {/* Board Comment Log */}
      <div className="ods-comment-log">
        <h3>Boardroom Comment & Change Log</h3>
        <ul>
          {comments.length === 0 && <li>No comments yet.</li>}
          {comments.map((c, i) => (
            <li key={i}>
              <span className="ods-comment-user">
                {c.user === "Board" ? <FaCrown /> : <FaUserTie />}
              </span>
              <span className="ods-comment-pill">{c.pillar}</span>
              <span className="ods-comment-date">{c.date}</span>
              <span className="ods-comment-text">{c.comment}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Export Log */}
      <div className="ods-export-log">
        <b>Export Log:</b>
        <ul>
          {exportLog.length === 0 && <li>No exports yet.</li>}
          {exportLog.map((e, i) => (
            <li key={i}>
              {e.date}: Weighted Score {e.weightedScore} ({e.type})
            </li>
          ))}
        </ul>
      </div>
      <div className="ods-footer">
        <b>Prepared by CourtEvo Vero – Elite Basketball Consulting</b>
      </div>
    </div>
  );
}
