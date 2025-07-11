import React, { useState } from "react";
import {
  FaUsers, FaHeartbeat, FaArrowUp, FaArrowDown, FaFilePdf, FaFileExcel, FaBell,
  FaClipboardCheck, FaChartLine, FaInfoCircle, FaEnvelopeOpenText, FaHistory, FaCommentDots, FaExclamationTriangle
} from "react-icons/fa";

// Demo historical data and action logs
const STAKEHOLDERS = [
  {
    key: "parents",
    label: "Parents",
    pulse: 8.7,
    lastMonth: 8.1,
    atRisk: false,
    lastAction: "Parent townhall scheduled",
    lastSurvey: "2025-06-11",
    history: [7.7, 8.1, 8.0, 8.2, 8.7],
    log: [
      { by: "Board", date: "2025-06-11", comment: "Parent forum scheduled after survey drop." },
      { by: "Staff", date: "2025-05-10", comment: "New U15 WhatsApp group launched." }
    ]
  },
  {
    key: "volunteers",
    label: "Volunteers",
    pulse: 7.2,
    lastMonth: 7.6,
    atRisk: false,
    lastAction: "Thank-you event organized",
    lastSurvey: "2025-06-09",
    history: [7.4, 7.6, 7.2, 7.6, 7.2],
    log: [
      { by: "Staff", date: "2025-06-09", comment: "Annual BBQ appreciation event held." }
    ]
  },
  {
    key: "sponsors",
    label: "Sponsors",
    pulse: 6.2,
    lastMonth: 8.2,
    atRisk: true,
    lastAction: "Quarterly report sent",
    lastSurvey: "2025-06-01",
    history: [8.2, 7.7, 7.3, 7.0, 6.2],
    log: [
      { by: "Board", date: "2025-06-01", comment: "Low response to Q2 campaign—follow-up needed." }
    ],
    segment: [
      { name: "Gold", pulse: 6.7 },
      { name: "Silver", pulse: 6.0 },
      { name: "Bronze", pulse: 5.8 }
    ]
  },
  {
    key: "localgov",
    label: "Local Government",
    pulse: 7.9,
    lastMonth: 7.1,
    atRisk: false,
    lastAction: "Facility meeting held",
    lastSurvey: "2025-06-07",
    history: [6.6, 7.1, 7.5, 7.6, 7.9],
    log: []
  },
  {
    key: "alumni",
    label: "Alumni",
    pulse: 5.5,
    lastMonth: 6.0,
    atRisk: true,
    lastAction: "New alumni newsletter campaign",
    lastSurvey: "2025-06-03",
    history: [6.0, 6.1, 5.9, 6.2, 5.5],
    log: [
      { by: "Board", date: "2025-06-03", comment: "Alumni event in planning—engagement weak." }
    ]
  },
  {
    key: "staff",
    label: "Staff",
    pulse: 9.0,
    lastMonth: 8.8,
    atRisk: false,
    lastAction: "Staff upskilling launched",
    lastSurvey: "2025-06-10",
    history: [8.8, 8.9, 8.7, 9.0, 9.0],
    log: []
  }
];

const pulseColor = score =>
  score >= 8 ? "#1de682"
    : score >= 7 ? "#FFD700"
    : "#e82e2e";

function sparkline(arr) {
  // Simple SVG sparkline—boardroom proof!
  const w = 40, h = 22;
  if (!arr || arr.length < 2) return null;
  const min = Math.min(...arr), max = Math.max(...arr);
  const y = v => h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
  const pts = arr.map((v, i) => `${(i / (arr.length - 1)) * (w - 3) + 2},${y(v)}`).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline
        fill="none"
        stroke="#FFD700"
        strokeWidth="2"
        points={pts}
      />
      <circle cx={w - 2} cy={y(arr[arr.length - 1])} r={3.5} fill="#FFD700" />
    </svg>
  );
}

export default function StakeholderEngagementMatrix() {
  const [matrix, setMatrix] = useState(STAKEHOLDERS);
  const [filterAtRisk, setFilterAtRisk] = useState(false);
  const [notif, setNotif] = useState("Sponsor pulse dropped below target! Board alert.");
  const [modalIdx, setModalIdx] = useState(null);
  const [showSegmentIdx, setShowSegmentIdx] = useState(null);
  const [addComment, setAddComment] = useState("");
  const [surveying, setSurveying] = useState(null);

  // Summary stats
  const avgPulse = (matrix.reduce((sum, s) => sum + s.pulse, 0) / matrix.length).toFixed(2);
  const pulseChange = (matrix.reduce((sum, s) => sum + (s.pulse - s.lastMonth), 0) / matrix.length).toFixed(2);
  const atRiskCount = matrix.filter(s => s.atRisk).length;

  // Top 3 at risk
  const topAtRisk = matrix.filter(s => s.atRisk).sort((a, b) => a.pulse - b.pulse).slice(0, 3);

  // Filtered data
  const data = filterAtRisk ? matrix.filter(s => s.atRisk) : matrix;

  function handleExport(fmt) {
    alert(`Export as ${fmt} coming soon!`);
  }

  // Add board/staff comment
  function addLog(idx) {
    if (!addComment.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setMatrix(m =>
      m.map((s, i) =>
        i === idx
          ? { ...s, log: [{ by: "Board", date: today, comment: addComment }, ...(s.log || [])] }
          : s
      )
    );
    setAddComment("");
    setModalIdx(null);
  }

  // Simulate sending a survey
  function sendSurvey(idx) {
    setSurveying(idx);
    setTimeout(() => {
      setSurveying(null);
      alert(`Pulse survey sent to ${matrix[idx].label}.`);
    }, 700);
  }

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>
        Stakeholder Engagement Matrix <FaUsers style={{ marginLeft: 10, color: "#1de682", fontSize: 23, verticalAlign: -3 }} />
        <FaInfoCircle title="Maps & monitors all key stakeholder groups. Boardroom compliance, sponsor-ready." style={{ marginLeft: 10, color: "#FFD700", verticalAlign: -3 }} />
        <button onClick={() => handleExport("PDF")} style={btnStyle}><FaFilePdf style={{ marginRight: 7 }} />PDF</button>
        <button onClick={() => handleExport("Excel")} style={btnStyle}><FaFileExcel style={{ marginRight: 7 }} />Excel</button>
      </h2>
      {/* Summary stats + top at risk */}
      <div style={{
        display: "flex",
        gap: 32,
        alignItems: "center",
        marginBottom: 13,
        flexWrap: "wrap"
      }}>
        <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>
          Average Pulse: <span style={{ color: "#1de682", fontWeight: 900, fontSize: 21 }}>{avgPulse}</span>
        </span>
        <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>
          Net Change: <span style={{ color: pulseChange >= 0 ? "#1de682" : "#e82e2e", fontWeight: 900, fontSize: 21 }}>{pulseChange}</span>
        </span>
        <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>
          At Risk: <span style={{ color: "#e82e2e", fontWeight: 900, fontSize: 21 }}>{atRiskCount}</span>
        </span>
        <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>
          <FaExclamationTriangle style={{ color: "#e82e2e", marginRight: 5 }} />Top 3 At Risk:
        </span>
        <span>
          {topAtRisk.map((s, i) =>
            <span key={s.key} style={{ color: "#e82e2e", fontWeight: 900, fontSize: 15, marginLeft: 7 }}>
              {s.label}{i < topAtRisk.length - 1 ? "," : ""}
            </span>
          )}
        </span>
      </div>
      {/* Live alert/notification */}
      {notif && (
        <div style={{
          background: "#e82e2e",
          color: "#fff",
          fontWeight: 900,
          borderRadius: 10,
          marginBottom: 18,
          padding: "11px 19px",
          fontSize: 16,
          display: "flex",
          alignItems: "center"
        }}>
          <FaBell style={{ marginRight: 9, color: "#FFD700" }} /> {notif}
        </div>
      )}
      <div style={{ marginBottom: 13 }}>
        <label style={{ fontWeight: 700, color: "#FFD700" }}>
          <input
            type="checkbox"
            checked={filterAtRisk}
            onChange={e => setFilterAtRisk(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Board Audit: Show Only “At Risk” Stakeholder Groups
        </label>
      </div>
      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "24px 36px",
        boxShadow: "0 2px 18px #FFD70018",
        marginBottom: 10
      }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th>Group</th>
              <th>PULSE</th>
              <th>Trend</th>
              <th>Status</th>
              <th>Last Action</th>
              <th>Last Survey</th>
              <th>Segment</th>
              <th>Board Log</th>
              <th>Survey</th>
              <th>History</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={10} style={{ color: "#e82e2e", fontWeight: 900, textAlign: "center", padding: 24 }}>
                  No at risk stakeholder groups found.
                </td>
              </tr>
            )}
            {data.map((s, idx) => (
              <tr key={s.key} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff"
              }}>
                <td style={{ color: "#FFD700", fontWeight: 700 }}>{s.label}</td>
                <td style={{
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: 17,
                  color: pulseColor(s.pulse)
                }}>
                  <FaHeartbeat style={{ color: pulseColor(s.pulse), marginRight: 5, verticalAlign: -2 }} />
                  {s.pulse.toFixed(1)}
                  <div style={{ marginTop: 3 }}>{sparkline(s.history)}</div>
                </td>
                <td style={{
                  textAlign: "center",
                  color: s.pulse - s.lastMonth > 0 ? "#1de682" : "#e82e2e",
                  fontWeight: 800,
                  fontSize: 15
                }}>
                  {s.pulse - s.lastMonth > 0
                    ? <span><FaArrowUp style={{ verticalAlign: -2 }} /> {Math.abs(s.pulse - s.lastMonth).toFixed(1)}</span>
                    : <span><FaArrowDown style={{ verticalAlign: -2 }} /> {Math.abs(s.pulse - s.lastMonth).toFixed(1)}</span>
                  }
                </td>
                <td style={{
                  textAlign: "center",
                  fontWeight: 900,
                  color: s.atRisk ? "#e82e2e" : "#1de682"
                }}>
                  {s.atRisk ? "At Risk" : "Healthy"}
                </td>
                <td style={{ fontWeight: 600 }}>{s.lastAction}</td>
                <td style={{
                  textAlign: "center",
                  color: "#FFD700",
                  fontWeight: 700
                }}>
                  {s.lastSurvey}
                  {new Date() - new Date(s.lastSurvey) > 1000 * 60 * 60 * 24 * 30 && (
                    <span style={{ background: "#e82e2e", color: "#fff", marginLeft: 7, padding: "2px 6px", borderRadius: 6, fontWeight: 900 }}>Overdue</span>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  {s.segment
                    ? <button style={{
                      background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 700, fontSize: 14, border: "none", padding: "3px 10px", cursor: "pointer"
                    }}
                      onClick={() => setShowSegmentIdx(showSegmentIdx === idx ? null : idx)}
                    >View
                    </button>
                    : <span style={{ color: "#FFD700", fontSize: 13 }}>-</span>
                  }
                  {showSegmentIdx === idx && (
                    <div style={{
                      position: "absolute",
                      background: "#232a2e",
                      color: "#FFD700",
                      borderRadius: 8,
                      padding: "13px 24px",
                      boxShadow: "0 2px 16px #FFD70033",
                      marginTop: 6,
                      marginLeft: -40,
                      zIndex: 5
                    }}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>Segment Breakdown</div>
                      {s.segment.map(seg =>
                        <div key={seg.name} style={{ fontWeight: 700, color: pulseColor(seg.pulse) }}>
                          {seg.name}: <FaHeartbeat style={{ marginRight: 5, color: pulseColor(seg.pulse) }} />{seg.pulse}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button style={logBtnStyle}
                    onClick={() => setModalIdx(modalIdx === idx ? null : idx)}
                  >
                    <FaCommentDots style={{ marginRight: 7 }} />
                    Log
                  </button>
                  {modalIdx === idx && (
                    <div style={{
                      position: "absolute",
                      background: "#181e23",
                      color: "#FFD700",
                      borderRadius: 10,
                      padding: "14px 21px",
                      boxShadow: "0 3px 20px #FFD70033",
                      minWidth: 270,
                      zIndex: 10,
                      marginTop: 12
                    }}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>
                        <FaHistory style={{ marginRight: 6 }} />Action Log
                      </div>
                      <ul style={{ marginLeft: 9, marginBottom: 8 }}>
                        {(s.log && s.log.length > 0)
                          ? s.log.map((l, i) =>
                            <li key={i}><b>{l.by}</b> <span style={{ color: "#fff" }}>({l.date})</span>: {l.comment}</li>
                          )
                          : <li style={{ color: "#1de682" }}>No comments yet.</li>
                        }
                      </ul>
                      <textarea
                        placeholder="Add board/staff comment..."
                        value={addComment}
                        onChange={e => setAddComment(e.target.value)}
                        style={{
                          background: "#232a2e",
                          color: "#FFD700",
                          border: "1.5px solid #FFD700",
                          borderRadius: 7,
                          fontWeight: 700,
                          fontSize: 14,
                          padding: "8px 13px",
                          width: "100%",
                          marginBottom: 7,
                          minHeight: 37
                        }}
                      />
                      <button style={logBtnStyle}
                        onClick={() => addLog(idx)}
                      >
                        Add Comment
                      </button>
                    </div>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button style={surveyBtnStyle}
                    onClick={() => sendSurvey(idx)}
                    disabled={surveying === idx}
                  >
                    <FaEnvelopeOpenText style={{ marginRight: 7 }} />
                    {surveying === idx ? "Sending..." : "Pulse"}
                  </button>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button style={logBtnStyle}
                    onClick={() => alert('Export log coming soon!')}
                  >
                    <FaFilePdf style={{ marginRight: 7 }} />
                    Export Log
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "13px 21px",
        fontWeight: 600,
        fontSize: 15
      }}>
        <FaUsers style={{ marginRight: 7, verticalAlign: -2 }} />
        Board, management, and staff see *all* key stakeholder pulse ratings, trends, and actions—live, with historical analytics, segmentation, audit log, and sponsor/municipal export.
      </div>
    </div>
  );
}

const btnStyle = {
  float: "right",
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 800,
  fontSize: 15,
  boxShadow: "0 2px 8px #FFD70044",
  marginTop: 3,
  marginLeft: 6,
  cursor: "pointer",
  transition: "background 0.18s"
};
const logBtnStyle = {
  background: "#FFD700",
  color: "#232a2e",
  fontWeight: 800,
  fontSize: 15,
  border: "none",
  borderRadius: 8,
  padding: "6px 15px",
  boxShadow: "0 1px 7px #FFD70033",
  cursor: "pointer"
};
const surveyBtnStyle = {
  background: "#1de682",
  color: "#232a2e",
  fontWeight: 800,
  fontSize: 15,
  border: "none",
  borderRadius: 8,
  padding: "6px 15px",
  boxShadow: "0 1px 7px #1de68233",
  cursor: "pointer"
};
