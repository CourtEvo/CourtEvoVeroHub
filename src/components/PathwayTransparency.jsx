import React, { useState } from "react";
import {
  FaUser, FaRoad, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaClipboardCheck, FaFilePdf, FaCommentDots
} from "react-icons/fa";

// Example pathway stages
const PATHWAY_STAGES = [
  "Fundamentals",
  "Defensive Fundamentals",
  "Skill Acceleration",
  "Tactical Refinement",
  "High-Performance"
];

// Demo athlete data (with comment log)
const athletes = [
  {
    name: "Petar Horvat",
    age: 15,
    stage: "Skill Acceleration",
    status: "On Track",
    nextStage: "Tactical Refinement",
    expectedNext: "2026-02",
    coach: "Coach Luka",
    coachEmail: "luka@courtevo-vero.com",
    comments: [
      { by: "Coach Luka", date: "2025-06-01", msg: "Progressing well, focus on shooting." },
      { by: "Parent", date: "2025-05-21", msg: "Thank you for feedback, will work extra at home." }
    ]
  },
  {
    name: "Ivan Petrovic",
    age: 16,
    stage: "Tactical Refinement",
    status: "At Risk",
    nextStage: "High-Performance",
    expectedNext: "Delayed",
    coach: "Coach Marko",
    coachEmail: "marko@courtevo-vero.com",
    comments: [
      { by: "Coach Marko", date: "2025-06-03", msg: "Needs to improve attendance and focus." }
    ]
  },
  {
    name: "Luka Marinović",
    age: 14,
    stage: "Defensive Fundamentals",
    status: "On Track",
    nextStage: "Skill Acceleration",
    expectedNext: "2025-12",
    coach: "Coach Petar",
    coachEmail: "petar@courtevo-vero.com",
    comments: []
  }
];

const statusColor = s => s === "On Track" ? "#1de682" : "#FFD700";
const statusIcon = s => s === "On Track"
  ? <FaCheckCircle style={{ color: "#1de682", marginRight: 7 }} />
  : <FaExclamationTriangle style={{ color: "#FFD700", marginRight: 7 }} />;

export default function PathwayTransparency() {
  const [auditOnly, setAuditOnly] = useState(false);
  const [showCommentsIdx, setShowCommentsIdx] = useState(null);

  // Boardroom audit: show only "At Risk" or delayed
  const rows = auditOnly
    ? athletes.filter(a => a.status !== "On Track" || a.expectedNext === "Delayed")
    : athletes;

  const handleExport = () => {
    alert("Export coming soon! (Wire to backend/print for production)");
  };

  // Timeline visualization helper
  function ProgressBar({ stage }) {
    const idx = PATHWAY_STAGES.indexOf(stage);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 2, minWidth: 180 }}>
        {PATHWAY_STAGES.map((s, i) => (
          <span key={s} style={{
            width: 30,
            height: 8,
            borderRadius: 5,
            background: i <= idx ? "#FFD700" : "#222",
            marginRight: i < PATHWAY_STAGES.length - 1 ? 2 : 0,
            display: "inline-block"
          }} title={s}></span>
        ))}
        <span style={{
          marginLeft: 10,
          fontSize: 12,
          color: "#FFD700",
          fontWeight: 800
        }}>{stage}</span>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 12 }}>
        Pathway Transparency <FaRoad style={{ marginLeft: 10, color: "#1de682", fontSize: 22, verticalAlign: -2 }} />
        <button
          onClick={handleExport}
          style={{
            float: "right",
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontWeight: 800,
            fontSize: 15,
            boxShadow: "0 2px 8px #FFD70044",
            marginTop: 3,
            cursor: "pointer",
            transition: "background 0.18s"
          }}
        >
          <FaFilePdf style={{ marginRight: 8 }} /> Export Table
        </button>
      </h2>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontWeight: 700, color: "#FFD700", marginRight: 11 }}>
          <input
            type="checkbox"
            checked={auditOnly}
            onChange={e => setAuditOnly(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Boardroom Audit: Only Show “At Risk” or Delayed
        </label>
      </div>
      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "24px 38px",
        boxShadow: "0 2px 18px #FFD70018",
        marginBottom: 18
      }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Athlete</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Pathway Progress</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Next Stage</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Expected Next</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Coach</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Badge</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a, idx) => (
              <tr key={a.name} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff"
              }}>
                <td style={{ padding: "7px 6px", color: "#FFD700", fontWeight: 700 }}>
                  <FaUser style={{ marginRight: 6, color: "#FFD700", verticalAlign: -2 }} />
                  {a.name}
                </td>
                <td style={{ padding: "7px 6px" }}>
                  <ProgressBar stage={a.stage} />
                </td>
                <td style={{ padding: "7px 6px", color: statusColor(a.status), fontWeight: 800 }}>
                  {statusIcon(a.status)}
                  {a.status}
                </td>
                <td style={{ padding: "7px 6px" }}>
                  <FaArrowRight style={{ color: "#FFD700", marginRight: 5 }} />
                  {a.nextStage}
                </td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>
                  {a.expectedNext}
                </td>
                <td style={{ padding: "7px 6px" }}>
                  {a.coach}
                  <div style={{ color: "#FFD700", fontSize: 12 }}>{a.coachEmail}</div>
                </td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>
                  {PATHWAY_STAGES.indexOf(a.stage) === PATHWAY_STAGES.length - 1
                    ? <FaCheckCircle color="#1de682" title="Completed" />
                    : a.status !== "On Track"
                      ? <FaExclamationTriangle color="#FFD700" title="Attention Needed" />
                      : <FaCheckCircle color="#FFD700" title="In Progress" />}
                </td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    title="Show comments"
                    onClick={() => setShowCommentsIdx(showCommentsIdx === idx ? null : idx)}
                  >
                    <FaCommentDots color="#FFD700" />
                    {a.comments.length > 0 && (
                      <span style={{
                        background: "#FFD700", color: "#232a2e", borderRadius: 7,
                        marginLeft: 3, fontSize: 13, padding: "1px 6px", fontWeight: 800
                      }}>{a.comments.length}</span>
                    )}
                  </span>
                  {/* Show comments inline */}
                  {showCommentsIdx === idx && (
                    <div style={{
                      marginTop: 7,
                      background: "#181e23",
                      borderRadius: 7,
                      color: "#FFD700",
                      fontSize: 14,
                      padding: "10px 16px",
                      boxShadow: "0 2px 10px #FFD70033"
                    }}>
                      <ul style={{ marginLeft: 14 }}>
                        {a.comments.length === 0 && (
                          <li style={{ color: "#1de682" }}>No comments yet.</li>
                        )}
                        {a.comments.map((c, i) => (
                          <li key={i}><b>{c.by}</b> <span style={{ color: "#fff" }}>({c.date})</span>: {c.msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
        <FaClipboardCheck style={{ marginRight: 7, verticalAlign: -2 }} />
        All athlete progression is transparent to board, parents, and staff—evidence-based, clear, and ready for audit.
      </div>
    </div>
  );
}
