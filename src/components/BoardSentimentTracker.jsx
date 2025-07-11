import React, { useState } from "react";
import {
  FaChartBar, FaThumbsUp, FaThumbsDown, FaBalanceScale, FaExclamationTriangle,
  FaCheckCircle, FaUsers, FaGavel, FaComments, FaBolt, FaTimesCircle
} from "react-icons/fa";

// --- Demo Data ---
const BOARD_MEMBERS = ["President", "Finance Director", "Technical Director", "Admin Lead", "Facilities Manager"];
const DECISIONS = [
  {
    date: "2024-06-01",
    topic: "Approve new main sponsor deal",
    votes: { President: "yes", "Finance Director": "yes", "Technical Director": "yes", "Admin Lead": "yes", "Facilities Manager": "yes" },
    comment: "Great long-term stability, no major objections."
  },
  {
    date: "2024-04-21",
    topic: "Adopt new risk policy",
    votes: { President: "yes", "Finance Director": "yes", "Technical Director": "no", "Admin Lead": "yes", "Facilities Manager": "no" },
    comment: "Concerns about implementation timeline. Technical & Facilities want slower rollout."
  },
  {
    date: "2024-03-10",
    topic: "Increase team travel budget",
    votes: { President: "yes", "Finance Director": "no", "Technical Director": "no", "Admin Lead": "yes", "Facilities Manager": "yes" },
    comment: "Finance & Technical question ROI. Will revisit in Q2."
  },
  {
    date: "2024-01-22",
    topic: "Extend head coach contract",
    votes: { President: "yes", "Finance Director": "yes", "Technical Director": "yes", "Admin Lead": "no", "Facilities Manager": "no" },
    comment: "Admin & Facilities feel player voices not consulted enough."
  },
  {
    date: "2023-12-14",
    topic: "Adopt child safeguarding update",
    votes: { President: "yes", "Finance Director": "yes", "Technical Director": "yes", "Admin Lead": "yes", "Facilities Manager": "yes" },
    comment: "Unanimous. Board feels this is a priority area."
  }
];

function getAlignment(votes) {
  const yes = Object.values(votes).filter(v => v === "yes").length;
  const no = Object.values(votes).filter(v => v === "no").length;
  if (yes === BOARD_MEMBERS.length) return "unanimous";
  if (yes === 0) return "none";
  if (yes === no) return "split";
  if (yes > no && no === 0) return "strong";
  if (yes > no && no > 0) return no === 1 ? "minorDissent" : "divided";
  return "fragile";
}
function getAlignmentColor(type) {
  switch (type) {
    case "unanimous": return "#1de682";
    case "strong": return "#FFD700";
    case "minorDissent": return "#FFD700";
    case "divided": return "#e87f22";
    case "fragile": return "#FFD700";
    case "split": return "#e82e2e";
    case "none": return "#e82e2e";
    default: return "#FFD700";
  }
}
// Assign score for sparklines and risk alert
function alignmentScore(type) {
  switch (type) {
    case "unanimous": return 1.0;
    case "strong": case "minorDissent": return 0.7;
    case "divided": return 0.4;
    case "split": case "fragile": return 0.2;
    default: return 0;
  }
}
function sentimentTrend(decisions) {
  return decisions.map(d => alignmentScore(getAlignment(d.votes)));
}

// Heatmap: per-member dissent count by topic
function buildHeatmap(decisions) {
  let map = {};
  BOARD_MEMBERS.forEach(m => map[m] = []);
  decisions.forEach((d, idx) => {
    BOARD_MEMBERS.forEach(m => {
      map[m][idx] = d.votes[m] === "no" ? 1 : 0;
    });
  });
  return map;
}

export default function BoardSentimentTracker() {
  const [highlight, setHighlight] = useState(null);
  const [drillIdx, setDrillIdx] = useState(null);
  const [comments, setComments] = useState(Array(DECISIONS.length).fill(""));
  const [showRisk, setShowRisk] = useState(false);

  // Consensus Score Sparkline (last 4)
  const trends = sentimentTrend(DECISIONS);
  const lastFour = trends.slice(-4);
  const heatmap = buildHeatmap(DECISIONS);

  // Risk alert: consensus drops <0.5 for 3+ in a row
  let alertNow = false, streak = 0;
  for (let i = 0; i < trends.length; ++i) {
    if (trends[i] < 0.5) streak += 1;
    else streak = 0;
    if (streak >= 3) alertNow = true;
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #232a2e 0%, #283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1400,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 22px 0", background: "linear-gradient(90deg, #FFD700 40%, #1de682 100%)" }} />
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22 }}>
        <FaChartBar style={{ fontSize: 30, color: "#FFD700", marginRight: 10 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>
          Board Sentiment Tracker
        </h2>
      </div>

      {/* Consensus Sparkline */}
      <div style={{ background: "#232a2e", borderRadius: 13, padding: "10px 19px 7px 19px", marginBottom: 19 }}>
        <b style={{ fontSize: 17, color: "#FFD700" }}><FaBalanceScale style={{ marginRight: 7 }} /> Quarterly Consensus Score</b>
        <svg width={210} height={34}>
          <polyline
            fill="none"
            stroke="#1de682"
            strokeWidth={4}
            points={lastFour.map((v, i) => `${20 + i * 60},${26 - v * 20}`).join(" ")}
            style={{ transition: "all .45s" }}
          />
          {lastFour.map((v, i) => (
            <circle key={i} cx={20 + i * 60} cy={26 - v * 20} r={8}
              fill={v === 1 ? "#1de682" : v >= 0.7 ? "#FFD700" : v >= 0.4 ? "#e87f22" : "#e82e2e"}
              stroke="#232a2e" strokeWidth={4}
            />
          ))}
        </svg>
        <span style={{ color: "#FFD700bb", marginLeft: 11 }}>
          {lastFour.map((v, i) =>
            <span key={i} style={{
              color: v === 1 ? "#1de682" : v >= 0.7 ? "#FFD700" : v >= 0.4 ? "#e87f22" : "#e82e2e",
              fontWeight: 900, marginRight: 7
            }}>{(v * 100).toFixed(0)}%</span>
          )}
          (last 4 board quarters)
        </span>
      </div>

      {/* Animated Board Risk Alert */}
      {alertNow &&
        <div style={{
          background: "#e82e2e",
          color: "#fff",
          borderRadius: 11,
          fontWeight: 900,
          fontSize: 17,
          padding: "13px 19px",
          marginBottom: 14,
          animation: "pulse .8s infinite alternate"
        }}>
          <FaBolt style={{ marginRight: 8, verticalAlign: -2 }} />
          <span>CRITICAL ALERT: Board consensus has been fragile for 3+ consecutive decisions!</span>
          <style>
            {`@keyframes pulse {0%{box-shadow:0 0 15px #e82e2e99;} 100%{box-shadow:0 0 45px #e82e2e;}}`}
          </style>
        </div>
      }

      {/* Decision Log Table */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "13px 19px", marginBottom: 18
      }}>
        <b style={{ fontSize: 17, color: "#FFD700" }}><FaGavel style={{ marginRight: 7 }} /> Board Decision Log</b>
        <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse", fontSize: 16 }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Topic</th>
              <th style={thStyle}>Alignment</th>
              <th style={thStyle}>Votes</th>
              <th style={thStyle}>Drilldown</th>
            </tr>
          </thead>
          <tbody>
            {DECISIONS.map((d, i) => {
              const alignment = getAlignment(d.votes);
              const color = getAlignmentColor(alignment);
              return (
                <tr key={i} style={{ background: highlight === i ? "#FFD70033" : "#232a2e", cursor: "pointer" }}
                  onMouseEnter={() => setHighlight(i)} onMouseLeave={() => setHighlight(null)}>
                  <td style={tdStyle}>{d.date}</td>
                  <td style={tdStyle}>{d.topic}</td>
                  <td style={{ ...tdStyle, color, fontWeight: 900 }}>{alignment.toUpperCase()}</td>
                  <td style={tdStyle}>
                    {BOARD_MEMBERS.map(m =>
                      d.votes[m] === "yes"
                        ? <span key={m} style={voteYes}>{m[0]}</span>
                        : <span key={m} style={voteNo}>{m[0]}</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button style={miniBtn} onClick={() => setDrillIdx(i)}>
                      <FaComments /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ color: "#FFD700bb", fontSize: 13, marginTop: 7 }}>
          <span style={voteYes}>Y</span> = yes, <span style={voteNo}>N</span> = no
        </div>
      </div>

      {/* Drilldown Modal */}
      {drillIdx !== null &&
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "#232a2ecc", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#232a2e", borderRadius: 19, padding: 28, minWidth: 430, maxWidth: 640, boxShadow: "0 0 45px #FFD70066"
          }}>
            <h3 style={{ color: "#FFD700", marginBottom: 13 }}><FaGavel style={{ marginRight: 7 }} /> {DECISIONS[drillIdx].topic}</h3>
            <div style={{ marginBottom: 6, color: "#FFD700bb" }}>
              <FaBalanceScale style={{ marginRight: 6 }} />
              <b>Alignment:</b> {getAlignment(DECISIONS[drillIdx].votes).toUpperCase()}
            </div>
            <ul>
              {BOARD_MEMBERS.map(m =>
                <li key={m} style={{
                  color: DECISIONS[drillIdx].votes[m] === "yes" ? "#1de682" : "#e82e2e",
                  fontWeight: 900,
                  fontSize: 15
                }}>
                  {m}: {DECISIONS[drillIdx].votes[m].toUpperCase()}
                </li>
              )}
            </ul>
            <div style={{ margin: "16px 0 9px 0", fontStyle: "italic", color: "#FFD700" }}>
              <FaComments style={{ marginRight: 7 }} />
              <b>Board Comment:</b> {DECISIONS[drillIdx].comment}
            </div>
            <textarea
              style={inputStyle}
              rows={2}
              placeholder="Board member note (demo, non-persistent)…"
              value={comments[drillIdx] || ""}
              onChange={e => {
                let c = [...comments]; c[drillIdx] = e.target.value; setComments(c);
              }}
            />
            <button style={{ ...miniBtn, marginTop: 7 }} onClick={() => setDrillIdx(null)}><FaTimesCircle /> Close</button>
          </div>
        </div>
      }

      {/* Recurring Dissent Heatmap */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "14px 18px", marginBottom: 17
      }}>
        <b style={{ fontSize: 16, color: "#FFD700" }}><FaExclamationTriangle style={{ marginRight: 7 }} /> Recurring Dissent Heatmap</b>
        <table style={{ width: "100%", marginTop: 7, borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr>
              <th style={thStyle}>Board Member</th>
              {DECISIONS.map((d, i) => (
                <th key={i} style={thStyle}>{d.date.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOARD_MEMBERS.map((m, row) => (
              <tr key={m}>
                <td style={{ ...tdStyle, fontWeight: 900 }}>{m}</td>
                {heatmap[m].map((h, col) =>
                  <td key={col} style={{
                    ...tdStyle,
                    background: h
                      ? `repeating-linear-gradient(-45deg,#e82e2e,#e82e2e 9px,#232a2e 10px,#232a2e 20px)`
                      : "#28303e"
                  }}>
                    {h ? "NO" : ""}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Final actionable insight */}
      <div style={{
        background: "#181e23", color: "#FFD700", borderRadius: 10,
        padding: "12px 14px", fontWeight: 700, fontSize: 15, marginTop: 17
      }}>
        <FaExclamationTriangle style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Boardroom Advisory:</b> Proactively address repeat dissent, especially on finance/technical topics. Use modal to log context for future decisions.
      </div>
    </div>
  );
}

const thStyle = {
  color: "#FFD700",
  background: "#232a2e",
  fontWeight: 900,
  padding: "13px 12px",
  textAlign: "center",
  borderRadius: "10px 10px 0 0"
};
const tdStyle = {
  background: "#28303e",
  color: "#FFD700",
  fontWeight: 700,
  padding: "11px 9px"
};
const voteYes = {
  background: "#1de682",
  color: "#232a2e",
  borderRadius: 6,
  padding: "2px 7px",
  fontWeight: 900,
  marginRight: 3
};
const voteNo = {
  background: "#e82e2e",
  color: "#fff",
  borderRadius: 6,
  padding: "2px 7px",
  fontWeight: 900,
  marginRight: 3
};
const miniBtn = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 6,
  fontWeight: 900,
  fontSize: 14,
  padding: "4px 11px",
  cursor: "pointer"
};
const inputStyle = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 14,
  padding: "6px 8px",
  margin: "4px 0"
};
