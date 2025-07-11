import React, { useState } from "react";
import {
  FaChartLine, FaArrowUp, FaArrowDown, FaFileExport, FaCrown, FaUserTie, FaBolt, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import "./QuarterlyProgressReport.css";

// --- MOCK DATA (can swap for live data/context) ---
const KPI_LIST = [
  {
    key: "operational",
    label: "Operational Score",
    value: 82,
    last: 78,
    target: 80,
    spark: [72, 75, 79, 78, 82],
    qtrTrend: [68, 74, 78, 82],
    owner: "Board",
    comment: "",
    history: [
      { date: "2025-01-01", value: 68 },
      { date: "2025-04-01", value: 74 },
      { date: "2025-07-01", value: 78 },
      { date: "2025-10-01", value: 82 },
    ],
    rationale: "Board-level operational initiatives driven by compliance & new workflow tools."
  },
  {
    key: "retention",
    label: "Player Retention",
    value: 91,
    last: 87,
    target: 90,
    spark: [84, 85, 86, 87, 91],
    qtrTrend: [81, 86, 87, 91],
    owner: "GM",
    comment: "",
    history: [
      { date: "2025-01-01", value: 81 },
      { date: "2025-04-01", value: 86 },
      { date: "2025-07-01", value: 87 },
      { date: "2025-10-01", value: 91 },
    ],
    rationale: "Enhanced player pathway and feedback system."
  },
  {
    key: "coachsat",
    label: "Coach Satisfaction",
    value: 88,
    last: 88,
    target: 90,
    spark: [85, 89, 90, 88, 88],
    qtrTrend: [79, 84, 88, 88],
    owner: "Board",
    comment: "",
    history: [
      { date: "2025-01-01", value: 79 },
      { date: "2025-04-01", value: 84 },
      { date: "2025-07-01", value: 88 },
      { date: "2025-10-01", value: 88 },
    ],
    rationale: "Some board/coach misalignment, plan CPD upgrade."
  },
  {
    key: "revenue",
    label: "Net Revenue (k€)",
    value: 180,
    last: 195,
    target: 210,
    spark: [195, 170, 160, 190, 180],
    qtrTrend: [170, 180, 195, 180],
    owner: "GM",
    comment: "",
    history: [
      { date: "2025-01-01", value: 170 },
      { date: "2025-04-01", value: 180 },
      { date: "2025-07-01", value: 195 },
      { date: "2025-10-01", value: 180 },
    ],
    rationale: "Delayed event payments—risk to be addressed Q1."
  },
  {
    key: "sponsorship",
    label: "Sponsorship Value (k€)",
    value: 53,
    last: 48,
    target: 55,
    spark: [42, 45, 50, 48, 53],
    qtrTrend: [40, 45, 48, 53],
    owner: "Board",
    comment: "",
    history: [
      { date: "2025-01-01", value: 40 },
      { date: "2025-04-01", value: 45 },
      { date: "2025-07-01", value: 48 },
      { date: "2025-10-01", value: 53 },
    ],
    rationale: "New local partners, but one major sponsor renewal delayed."
  },
  {
    key: "youth",
    label: "Youth Progression",
    value: 75,
    last: 74,
    target: 80,
    spark: [70, 71, 73, 74, 75],
    qtrTrend: [65, 72, 74, 75],
    owner: "GM",
    comment: "",
    history: [
      { date: "2025-01-01", value: 65 },
      { date: "2025-04-01", value: 72 },
      { date: "2025-07-01", value: 74 },
      { date: "2025-10-01", value: 75 },
    ],
    rationale: "Academy structure improved, but transition to senior lagging."
  },
  {
    key: "compliance",
    label: "Compliance Score",
    value: 97,
    last: 95,
    target: 95,
    spark: [95, 94, 96, 95, 97],
    qtrTrend: [90, 92, 95, 97],
    owner: "Board",
    comment: "",
    history: [
      { date: "2025-01-01", value: 90 },
      { date: "2025-04-01", value: 92 },
      { date: "2025-07-01", value: 95 },
      { date: "2025-10-01", value: 97 },
    ],
    rationale: "Policy and audit procedures now world-class."
  }
];

const INITIATIVES = [
  { label: "AI Video Analytics Rollout", percent: 60 },
  { label: "Coach CPD Upgrade", percent: 45 },
  { label: "Governance Policy Refresh", percent: 90 },
  { label: "New Sponsorship Campaign", percent: 30 }
];

// For demo, a few Q&A threads:
const DEMO_QA = [
  {
    q: "What is driving the drop in net revenue this quarter?",
    a: "Delayed receipt from sponsor and postponed event income, expected to normalize Q1."
  },
  {
    q: "Why is coach satisfaction not hitting the target?",
    a: "Feedback highlights need for CPD and better communication with Board."
  }
];

// Top 3 wins/risks, computed dynamically

export default function QuarterlyProgressReport() {
  const [kpis, setKPIs] = useState(KPI_LIST);
  const [summary, setSummary] = useState(
    "Strong operational and compliance performance, with major progress in sponsorship value. Net revenue and youth progression need focused intervention next quarter."
  );
  const [snapshots, setSnapshots] = useState([]);
  const [aiSummary, setAISummary] = useState("");
  const [qna, setQNA] = useState(DEMO_QA);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [modalKPI, setModalKPI] = useState(null);

  // --- AI Board Summary (demo logic) ---
  function askAI() {
    const best = kpis.filter(k => k.value > k.last).map(k => k.label);
    const down = kpis.filter(k => k.value < k.last).map(k => k.label);
    let out = "Board Summary:\n";
    if (best.length) out += `• Improved: ${best.join(", ")}.\n`;
    if (down.length) out += `• Downward trend: ${down.join(", ")}.\n`;
    if (best.length && best.length >= 5) out += "• Club is on a strong upward trajectory. Maintain focus on strategic execution.";
    if (down.length) out += "• Address key risk areas next quarter.";
    setAISummary(out);
  }

  // --- Save report snapshot ---
  function saveSnapshot() {
    setSnapshots([
      ...snapshots,
      {
        date: new Date().toLocaleDateString(),
        kpis: kpis.map(k => ({ ...k })),
        summary
      }
    ]);
  }

  // --- Edit KPI card comment ---
  function updateComment(key, text) {
    setKPIs(kpis =>
      kpis.map(k =>
        k.key === key ? { ...k, comment: text } : k
      )
    );
  }

  // --- Q&A Panel ---
  function addQ() {
    if (!newQ.trim()) return;
    setQNA([...qna, { q: newQ, a: "" }]);
    setNewQ("");
  }
  function addA(idx) {
    if (!newA.trim()) return;
    setQNA(qna.map((qa, i) =>
      i === idx ? { ...qa, a: newA } : qa
    ));
    setNewA("");
  }

  // --- KPI Modal (drilldown) actions ---
  function addActionToModal(text) {
    if (!modalKPI) return;
    const updated = kpis.map(k =>
      k.key === modalKPI.key
        ? { ...k, actions: [...(k.actions || []), { text, date: new Date().toLocaleDateString() }] }
        : k
    );
    setKPIs(updated);
    setModalKPI({ ...modalKPI, actions: [...(modalKPI.actions || []), { text, date: new Date().toLocaleDateString() }] });
  }

  // Progress completion
  const overallPercent = Math.round(
    INITIATIVES.reduce((sum, i) => sum + i.percent, 0) / INITIATIVES.length
  );

  // Top 3 wins/risks
  const sorted = kpis.slice().sort((a, b) => (b.value - b.last) - (a.value - a.last));
  const wins = sorted.filter(k => k.value - k.last > 0).slice(0, 3);
  const risks = sorted.filter(k => k.value - k.last < 0).slice(-3);

  // Any risk > 10% down
  const riskAlert = kpis.find(k => (k.value - k.last) / (k.last || 1) < -0.10);

  // Owner chips
  const OWNER_ICONS = {
    "Board": <FaCrown style={{ color: "#FFD700", marginRight: 4 }} />,
    "GM": <FaUserTie style={{ color: "#1de682", marginRight: 4 }} />
  };

  return (
    <div className="qpr-root">
      {/* Cover/branding */}
      <div className="qpr-cover">
        <FaChartLine style={{ color: "#FFD700", fontSize: 36, marginRight: 18 }} />
        <span className="qpr-title">QUARTERLY PROGRESS REPORT</span>
        <span className="qpr-sub">Boardroom KPI Dashboard & Summary</span>
        <div className="qpr-cover-footer">
          <b>Prepared for:</b> <span style={{ color: "#FFD700" }}>Zagreb Youth Basketball Club</span>
          <span style={{ marginLeft: 14, color: "#FFD700" }}>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Top 3 wins / risks */}
      <div className="qpr-top3-row">
        <div className="qpr-top3-card win">
          <div className="qpr-top3-title">TOP 3 WINS</div>
          <ul>
            {wins.length === 0 && <li>No major gains this quarter.</li>}
            {wins.map((k, i) =>
              <li key={i}>
                <FaArrowUp style={{ color: "#1de682", marginRight: 7 }} />
                <b>{k.label}:</b> +{k.value - k.last}
              </li>
            )}
          </ul>
        </div>
        <div className="qpr-top3-card risk">
          <div className="qpr-top3-title">TOP 3 RISKS</div>
          <ul>
            {risks.length === 0 && <li>No significant declines.</li>}
            {risks.map((k, i) =>
              <li key={i}>
                <FaArrowDown style={{ color: "#FF4444", marginRight: 7 }} />
                <b>{k.label}:</b> {k.value - k.last}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Risk alert */}
      {riskAlert && (
        <div className="qpr-risk-alert">
          <FaTimesCircle style={{ color: "#FF4444", marginRight: 8, fontSize: 22 }} />
          <b>Risk Alert:</b> {riskAlert.label} dropped by more than 10%. Board review required!
        </div>
      )}

      {/* KPI Cards */}
      <div className="qpr-kpi-stack">
        {kpis.map(k => {
          const up = k.value > k.last;
          const flat = k.value === k.last;
          const delta = k.value - k.last;
          const targetHit = up ? k.value >= k.target : k.value === k.target;
          return (
            <div className="qpr-kpi-card" key={k.key} onClick={() => setModalKPI(k)}>
              <div className="qpr-kpi-label-row">
                <span className="qpr-kpi-label">{k.label}</span>
                <span className="qpr-kpi-owner">{OWNER_ICONS[k.owner]}{k.owner}</span>
              </div>
              <div className="qpr-kpi-value-row">
                <span className="qpr-kpi-value">{k.value}</span>
                <span
                  className="qpr-kpi-arrow"
                  style={{ color: flat ? "#FFD700" : up ? "#1de682" : "#FF4444" }}
                >
                  {flat ? "=" : up ? <FaArrowUp /> : <FaArrowDown />}
                </span>
                <span className="qpr-kpi-delta"
                  style={{
                    background: flat ? "#FFD70077" : up ? "#1de682" : "#FF4444",
                    color: "#232a2e"
                  }}>
                  {delta > 0 ? "+" : ""}{delta}
                </span>
                <span className="qpr-kpi-target"
                  style={{
                    background: targetHit ? "#1de682" : "#FFD700",
                    color: "#232a2e"
                  }}>
                  Target: {k.target} {targetHit ? <FaCheckCircle style={{ color: "#232a2e", marginLeft: 2 }} /> : <FaTimesCircle style={{ color: "#232a2e", marginLeft: 2 }} />}
                </span>
              </div>
              <div className="qpr-kpi-sparkline">
                {k.spark.map((v, i) =>
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 18,
                      background: i === k.spark.length - 1 ? (up ? "#1de682" : "#FF4444") : "#FFD700",
                      opacity: 0.84,
                      borderRadius: 2,
                      marginRight: 2,
                      marginTop: 18 - (v / 120) * 18
                    }}
                  />
                )}
              </div>
              <textarea
                className="qpr-kpi-comment"
                placeholder="Board commentary…"
                value={k.comment}
                onChange={e => updateComment(k.key, e.target.value)}
                rows={2}
              />
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="qpr-progress-wrap">
        <div className="qpr-progress-head">Initiative Progress</div>
        <div className="qpr-progress-bar-bg">
          <div
            className="qpr-progress-bar-fill"
            style={{
              width: overallPercent + "%",
              background: overallPercent >= 80 ? "#1de682" : overallPercent >= 60 ? "#FFD700" : "#FF4444"
            }}
          />
        </div>
        <span className="qpr-progress-percent">{overallPercent}% Complete</span>
        <div className="qpr-progress-list">
          {INITIATIVES.map(i =>
            <div key={i.label} className="qpr-progress-initiative">
              <span className="qpr-progress-label">{i.label}</span>
              <span className="qpr-progress-value">{i.percent}%</span>
              <div className="qpr-progress-initiative-bar">
                <div
                  style={{
                    width: i.percent + "%",
                    background: i.percent >= 80 ? "#1de682" : i.percent >= 60 ? "#FFD700" : "#FF4444"
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Board summary */}
      <div className="qpr-summary-wrap">
        <div className="qpr-summary-head">Boardroom Summary & Recommendations</div>
        <textarea
          className="qpr-summary-editor"
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={4}
        />
        <button className="qpr-ai-btn" onClick={askAI}>
          <FaBolt style={{ marginRight: 6 }} /> AI: Suggest Board Summary
        </button>
        {aiSummary && (
          <div className="qpr-ai-summary">{aiSummary}</div>
        )}
      </div>

      {/* Boardroom Q&A */}
      <div className="qpr-qna-wrap">
        <div className="qpr-qna-head">Boardroom Q&A</div>
        <div className="qpr-qna-new">
          <input
            className="qpr-qna-input"
            placeholder="Ask a question…"
            value={newQ}
            onChange={e => setNewQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addQ(); }}
          />
          <button className="qpr-qna-btn" onClick={addQ}>Submit</button>
        </div>
        <div className="qpr-qna-thread">
          {qna.map((qa, idx) =>
            <div className="qpr-qna-block" key={idx}>
              <b>Q:</b> {qa.q}
              {qa.a
                ? <div style={{ marginLeft: 17, color: "#1de682" }}><b>A:</b> {qa.a}</div>
                : (
                  <div className="qpr-qna-answer">
                    <input
                      className="qpr-qna-input"
                      placeholder="Type answer…"
                      value={newA}
                      onChange={e => setNewA(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addA(idx); }}
                    />
                    <button className="qpr-qna-btn" onClick={() => addA(idx)}>Reply</button>
                  </div>
                )
              }
            </div>
          )}
        </div>
      </div>

      {/* Snapshot log */}
      <div className="qpr-snaplog">
        <h3>Quarterly Snapshots</h3>
        <ul>
          {snapshots.map((snap, idx) =>
            <li key={idx}>
              <span className="qpr-snap-date">{snap.date}</span>
              <div className="qpr-snap-kpis">
                {snap.kpis.map((k, i) =>
                  <span key={i} style={{ marginRight: 12, color: "#FFD700" }}>{k.label}: <b>{k.value}</b></span>
                )}
              </div>
              <div className="qpr-snap-summary">{snap.summary}</div>
            </li>
          )}
        </ul>
      </div>

      {/* KPI Drilldown Modal */}
      {modalKPI &&
        <div className="qpr-modal-bg" onClick={() => setModalKPI(null)}>
          <div className="qpr-modal-card" onClick={e => e.stopPropagation()}>
            <div className="qpr-modal-header">
              <span>{modalKPI.label} — KPI Drilldown</span>
              <button className="qpr-modal-close" onClick={() => setModalKPI(null)}>×</button>
            </div>
            <div className="qpr-modal-content">
              <div><b>Current Value:</b> <span style={{ color: "#FFD700" }}>{modalKPI.value}</span></div>
              <div><b>Target:</b> <span style={{ color: "#1de682" }}>{modalKPI.target}</span></div>
              <div><b>Quarterly Trend:</b>
                <div style={{ marginTop: 7 }}>
                  {modalKPI.qtrTrend.map((v, i) =>
                    <span key={i}
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 30,
                        background: "#FFD700",
                        opacity: 0.82,
                        borderRadius: 3,
                        marginRight: 2,
                        marginTop: 30 - (v / 120) * 30
                      }}
                    />
                  )}
                </div>
              </div>
              <div style={{ marginTop: 10 }}><b>Rationale:</b> {modalKPI.rationale}</div>
              <div style={{ marginTop: 12 }}>
                <b>Actions & Follow-ups</b>
                <ul>
                  {(modalKPI.actions || []).map((a, i) =>
                    <li key={i} style={{ color: "#1de682" }}>{a.text} <span style={{ color: "#FFD700", marginLeft: 4 }}>{a.date}</span></li>
                  )}
                </ul>
                <input
                  className="qpr-modal-action"
                  placeholder="Add action/follow-up…"
                  onKeyDown={e => { if (e.key === "Enter") addActionToModal(e.target.value); e.target.value = ""; }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <b>History:</b>
                <ul>
                  {modalKPI.history.map((h, i) =>
                    <li key={i}><span style={{ color: "#FFD700" }}>{h.date}:</span> {h.value}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}
