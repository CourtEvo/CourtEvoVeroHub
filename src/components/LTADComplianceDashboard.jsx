import React, { useState } from "react";
import {
  FaCheckCircle, FaTimes, FaExclamationTriangle, FaClipboardCheck, FaBalanceScale, FaBolt, FaUserTie, FaChartLine, FaArrowRight, FaFileExport, FaTasks, FaInfoCircle, FaComments
} from "react-icons/fa";

const SQUADS = ["U14", "U16", "U18", "Senior"];
const PRINCIPLES = [
  { key: "practiceComp", label: "Practice/Game Ratio", target: "≥3:1" },
  { key: "earlySpec", label: "Early Specialization Avoided", target: "Yes" },
  { key: "roleRotation", label: "Role Rotation", target: "2+ Positions" },
  { key: "indiv", label: "Individualized Plan", target: "Yes" },
  { key: "sensitive", label: "Sensitive Periods Hit", target: "All" }
];
const INIT_SQUAD_COMPLIANCE = [
  {
    squad: "U14",
    history: [77, 82, 85, 81, 87, 92],
    athletes: [
      {
        name: "Ivan Radic",
        lastUpdate: "2024-06-01",
        compliance: { practiceComp: true, earlySpec: true, roleRotation: true, indiv: false, sensitive: true },
        reasons: { indiv: "Coach hasn’t set plan yet" }
      },
      {
        name: "Ante Kovac",
        lastUpdate: "2024-06-01",
        compliance: { practiceComp: false, earlySpec: true, roleRotation: true, indiv: false, sensitive: false },
        reasons: { practiceComp: "Too many games in spring", indiv: "Awaiting plan", sensitive: "Missed shooting window" }
      }
    ]
  },
  {
    squad: "U16",
    history: [68, 73, 75, 78, 81, 85],
    athletes: [
      {
        name: "Marko Proleta",
        lastUpdate: "2024-06-01",
        compliance: { practiceComp: true, earlySpec: true, roleRotation: true, indiv: true, sensitive: true },
        reasons: {}
      },
      {
        name: "Bruno Sesar",
        lastUpdate: "2024-06-01",
        compliance: { practiceComp: false, earlySpec: false, roleRotation: false, indiv: false, sensitive: true },
        reasons: { practiceComp: "Injury time", earlySpec: "Played only basketball", roleRotation: "Locked at PF", indiv: "Not started" }
      }
    ]
  }
];
const INIT_ACTIONS = [
  { squad: "U14", principle: "indiv", action: "Coach to implement individual plans for all", owner: "Head Coach", status: "Open", boardComment: "" },
  { squad: "U16", principle: "practiceComp", action: "Add practice hours to hit ratio", owner: "DoC", status: "Open", boardComment: "" }
];
function complianceRate(squad) {
  let total = 0, yes = 0;
  squad.athletes.forEach(a => {
    PRINCIPLES.forEach(p => {
      total += 1;
      if (a.compliance[p.key]) yes += 1;
    });
  });
  return (yes / total) * 100;
}
// Athlete radar data
function radarPoints(compliance) {
  const keys = PRINCIPLES.map(p => p.key);
  const r = 40;
  return keys.map((k, i) => {
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    return [
      50 + (compliance[k] ? r : r * 0.35) * Math.cos(angle),
      50 + (compliance[k] ? r : r * 0.35) * Math.sin(angle)
    ].join(",");
  }).join(" ");
}

const inputStyleMini = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 15, width: 135
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "6px 14px", marginRight: 6, cursor: "pointer"
};
const boardInput = {
  borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 15, padding: 3, marginLeft: 9, minWidth: 130
};

const cellStyle = compliant => ({
  fontWeight: 800,
  background: compliant ? "#1de68222" : "#FFD70033",
  borderRadius: 5,
  padding: "7px 3px",
  cursor: "pointer",
  position: "relative"
});

const LTADComplianceDashboard = () => {
  const [squads, setSquads] = useState(INIT_SQUAD_COMPLIANCE);
  const [actions, setActions] = useState(INIT_ACTIONS);
  const [selectedSquad, setSelectedSquad] = useState(SQUADS[0]);
  const [newAction, setNewAction] = useState({ squad: "", principle: "", action: "", owner: "", status: "Open", boardComment: "" });
  const [popover, setPopover] = useState({ show: false, squadIdx: -1, athIdx: -1, pKey: "" });
  const [popoverComment, setPopoverComment] = useState("");

  // Compliance trendline (now per squad)
  const currSquad = squads.find(s => s.squad === selectedSquad);

  function handleActionClose(idx) {
    setActions(actions.map((a, i) => i === idx ? { ...a, status: "Closed" } : a));
  }
  function handleNewAction() {
    setActions([{ ...newAction, status: "Open" }, ...actions]);
    setNewAction({ squad: "", principle: "", action: "", owner: "", status: "Open", boardComment: "" });
  }
  function exportCompliance() {
    alert("Exporting LTAD Compliance Board Report: all teams, trends, radars, comments, actions, for PDF/CSV.");
  }
  // AI Next Steps
  function aiRecommendations(squad) {
    const nonCompliant = [];
    squad.athletes.forEach(a =>
      PRINCIPLES.forEach(p => {
        if (!a.compliance[p.key] && !nonCompliant.includes(p.label)) nonCompliant.push(p.label);
      })
    );
    if (nonCompliant.length === 0) return ["Maintain best-practice, log review quarterly."];
    return nonCompliant.map(nc => `Focus on: ${nc}. Assign coach/DoC to address.`)
  }
  // Cell popover for non-compliance
  function openPopover(squadIdx, athIdx, pKey) {
    setPopover({ show: true, squadIdx, athIdx, pKey });
    setPopoverComment("");
  }
  function savePopover() {
    setSquads(squads.map((s, sIdx) =>
      sIdx === popover.squadIdx
        ? {
            ...s,
            athletes: s.athletes.map((a, aIdx) =>
              aIdx === popover.athIdx
                ? {
                    ...a,
                    reasons: { ...a.reasons, [popover.pKey]: popoverComment }
                  }
                : a
            )
          }
        : s
    ));
    setPopover({ show: false, squadIdx: -1, athIdx: -1, pKey: "" });
    setPopoverComment("");
  }
  // Board comment per action
  function handleBoardComment(idx, comment) {
    setActions(actions.map((a, i) => i === idx ? { ...a, boardComment: comment } : a));
  }
  // Boardroom alerts: lowest compliance, most overdue, last update >30 days
  const boardAlerts = squads.map((s, i) => {
    const outdated = s.athletes.filter(a => {
      const days = (new Date() - new Date(a.lastUpdate)) / (1000 * 3600 * 24);
      return days > 30;
    });
    return {
      squad: s.squad,
      low: complianceRate(s) < 80,
      overdue: outdated.length > 0,
      overdueNames: outdated.map(a => a.name)
    };
  }).filter(x => x.low || x.overdue);

  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 38, maxWidth: 1420, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <FaClipboardCheck size={36} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 30, letterSpacing: 1, margin: 0 }}>
          LTAD Compliance Dashboard
        </h2>
        <span style={{ background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 15, padding: '8px 27px', fontSize: 18, marginLeft: 22 }}>CourtEvo Vero</span>
        <button onClick={exportCompliance} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10,
          fontWeight: 900, fontSize: 17, padding: "11px 26px", marginLeft: 18
        }}>
          <FaFileExport style={{ marginRight: 8 }} /> Export Board Pack
        </button>
      </div>
      {/* Boardroom Alerts */}
      {boardAlerts.length > 0 && (
        <div style={{ background: "#FFD70022", borderRadius: 11, padding: 11, margin: "19px 0 13px 0" }}>
          <FaExclamationTriangle style={{ color: "#FFD700", fontSize: 20, marginRight: 9 }} />
          <b>Boardroom Alerts:</b>
          {boardAlerts.map((b, i) => (
            <div key={i} style={{ color: "#FFD700", fontWeight: 800, marginTop: 2 }}>
              {b.squad} {b.low && "has low compliance (<80%)"}
              {b.overdue && `- last update overdue: ${b.overdueNames.join(", ")}`}
            </div>
          ))}
        </div>
      )}
      {/* Compliance Heatmap & Trendline */}
      <div style={{ display: "flex", gap: 38, margin: "29px 0 20px 0", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <b style={{ color: "#FFD700", fontSize: 20 }}>Squad Compliance Heatmap</b>
          <div style={{ display: "flex", gap: 20, marginTop: 13 }}>
            {squads.map((sq, idx) =>
              <div key={sq.squad} style={{
                background: "#FFD70011", borderRadius: 10, padding: "15px 27px", fontWeight: 900, fontSize: 17, color: complianceRate(sq) >= 85 ? "#1de682" : complianceRate(sq) >= 75 ? "#FFD700" : "#ff4848",
                border: complianceRate(sq) >= 85 ? "2.5px solid #1de682" : complianceRate(sq) >= 75 ? "2.5px solid #FFD700" : "2.5px solid #ff4848"
              }}>
                {sq.squad}<br />
                <span style={{ fontSize: 22 }}>{complianceRate(sq).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>
        {/* Compliance trendline, now squad-selectable */}
        <div style={{ width: 260, height: 130 }}>
          <b style={{ color: "#FFD700", fontSize: 19 }}>Compliance Trend: {selectedSquad}</b>
          <svg width={230} height={85}>
            {currSquad && (
              <>
                <polyline
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth={4}
                  points={currSquad.history.map((c, i) =>
                    `${15 + i * 40},${80 - (c - 70) * 1.8}`
                  ).join(" ")}
                />
                {currSquad.history.map((c, i) =>
                  <circle key={i} cx={15 + i * 40} cy={80 - (c - 70) * 1.8} r={5} fill="#FFD700" />
                )}
              </>
            )}
          </svg>
          <div style={{ color: "#FFD70099", fontSize: 14 }}>Last 6 board reviews</div>
        </div>
      </div>
      {/* Squad selection */}
      <div style={{ margin: "20px 0 15px 0" }}>
        <b style={{ color: "#FFD700" }}>Select Squad: </b>
        <select value={selectedSquad} onChange={e => setSelectedSquad(e.target.value)} style={{ ...inputStyleMini, minWidth: 130 }}>
          {SQUADS.map(sq => <option key={sq}>{sq}</option>)}
        </select>
      </div>
      {/* Compliance matrix */}
      {currSquad && (
        <div>
          <table style={{ width: "100%", marginBottom: 12, fontSize: 17 }}>
            <thead>
              <tr style={{ color: "#FFD700" }}>
                <th>Athlete</th>
                {PRINCIPLES.map(p => <th key={p.key}>{p.label}<br /><span style={{ fontSize: 13, color: "#FFD70099" }}>({p.target})</span></th>)}
                <th>Radar</th>
              </tr>
            </thead>
            <tbody>
              {currSquad.athletes.map((a, athIdx) =>
                <tr key={a.name}>
                  <td style={{ fontWeight: 700 }}>
                    {a.name}
                    <br /><span style={{ color: "#FFD70099", fontSize: 12 }}>Last update: {a.lastUpdate}</span>
                  </td>
                  {PRINCIPLES.map((p, pIdx) => (
                    <td key={p.key}
                      style={cellStyle(a.compliance[p.key])}
                      title={a.compliance[p.key] ? "Compliant" : (a.reasons?.[p.key] || "No reason logged")}
                      onClick={() => !a.compliance[p.key] && openPopover(squads.findIndex(sq => sq.squad === selectedSquad), athIdx, p.key)}
                    >
                      {a.compliance[p.key]
                        ? <span style={{ color: "#1de682" }}><FaCheckCircle /></span>
                        : <span style={{ color: "#FFD700" }}><FaTimes /><FaExclamationTriangle style={{ marginLeft: 5 }} /></span>
                      }
                      {!a.compliance[p.key] && a.reasons?.[p.key] && (
                        <FaInfoCircle style={{ color: "#FFD70099", marginLeft: 7, fontSize: 15 }} title={a.reasons[p.key]} />
                      )}
                    </td>
                  ))}
                  {/* Athlete compliance radar */}
                  <td>
                    <svg width={100} height={100}>
                      <polygon
                        points={radarPoints(a.compliance)}
                        fill="#FFD70055"
                        stroke="#FFD700"
                        strokeWidth={2}
                      />
                      {PRINCIPLES.map((p, i) => {
                        const angle = (Math.PI * 2 * i) / PRINCIPLES.length - Math.PI / 2;
                        return (
                          <text
                            key={p.key}
                            x={50 + 55 * Math.cos(angle)}
                            y={50 + 55 * Math.sin(angle) + 5}
                            fontSize={11}
                            textAnchor="middle"
                            fill="#FFD700"
                          >{p.label.replace(/ .*/, "")}</text>
                        );
                      })}
                      <circle cx={50} cy={50} r={40} fill="none" stroke="#FFD70044" strokeWidth={1.4} />
                    </svg>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ margin: "7px 0 11px 0" }}>
            <b style={{ color: "#FFD700" }}>AI Recommendations:</b>
            <ul>
              {aiRecommendations(currSquad).map((rec, i) =>
                <li key={i} style={{ color: "#FFD700", fontWeight: 700 }}>{rec}</li>
              )}
            </ul>
          </div>
        </div>
      )}
      {/* Popover for cell click */}
      {popover.show && (
        <div style={{
          position: "fixed", top: 200, left: 320, background: "#232a2e", color: "#FFD700",
          border: "2px solid #FFD70077", borderRadius: 14, padding: 21, zIndex: 1000, minWidth: 370
        }}>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 7 }}>
            <FaComments style={{ marginRight: 9 }} /> Log Non-Compliance Reason
          </div>
          <div style={{ marginBottom: 7 }}>
            <b>Athlete:</b> {currSquad.athletes[popover.athIdx].name}<br />
            <b>Pillar:</b> {PRINCIPLES.find(p => p.key === popover.pKey).label}
          </div>
          <textarea
            value={popoverComment}
            placeholder="Reason, assign coach, or board note..."
            onChange={e => setPopoverComment(e.target.value)}
            style={{ width: "100%", borderRadius: 7, minHeight: 50, fontSize: 15, border: "1.5px solid #FFD70077", padding: 5 }}
          />
          <div style={{ marginTop: 10 }}>
            <button onClick={savePopover} style={btnStyle}><FaCheckCircle /> Save</button>
            <button onClick={() => setPopover({ show: false })} style={btnStyle}>Cancel</button>
          </div>
        </div>
      )}
      {/* Action workflow */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: 13, margin: "24px 0 0 0"
      }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}><FaTasks style={{ marginRight: 8 }} /> Compliance Action Workflow</b>
        <table style={{ width: "100%", fontSize: 16, marginTop: 8 }}>
          <thead>
            <tr style={{ color: "#FFD700" }}>
              <th>Squad</th><th>Principle</th><th>Action</th><th>Owner</th><th>Status</th><th>Board Comment</th><th>Complete</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a, idx) =>
              <tr key={idx}>
                <td>{a.squad}</td>
                <td>{PRINCIPLES.find(p => p.key === a.principle)?.label || a.principle}</td>
                <td>{a.action}</td>
                <td>{a.owner}</td>
                <td style={{ color: a.status === "Open" ? "#FFD700" : "#1de682", fontWeight: 800 }}>{a.status}</td>
                <td>
                  <input
                    value={a.boardComment}
                    onChange={e => handleBoardComment(idx, e.target.value)}
                    placeholder="Board/coach comment"
                    style={boardInput}
                  />
                </td>
                <td>
                  {a.status === "Open" &&
                    <button onClick={() => handleActionClose(idx)} style={btnStyle}>
                      <FaCheckCircle /> Close
                    </button>
                  }
                  {a.status === "Closed" &&
                    <span style={{ color: "#1de682", fontWeight: 800 }}>Done</span>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ marginTop: 13, fontWeight: 800, color: "#FFD700" }}>Add New Action:</div>
        <div style={{ display: "flex", gap: 10, marginTop: 7, alignItems: "center" }}>
          <select value={newAction.squad} onChange={e => setNewAction({ ...newAction, squad: e.target.value })} style={inputStyleMini}>
            <option value="">Squad...</option>
            {SQUADS.map(sq => <option key={sq}>{sq}</option>)}
          </select>
          <select value={newAction.principle} onChange={e => setNewAction({ ...newAction, principle: e.target.value })} style={inputStyleMini}>
            <option value="">Principle...</option>
            {PRINCIPLES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <input value={newAction.action} placeholder="Action" onChange={e => setNewAction({ ...newAction, action: e.target.value })} style={inputStyleMini} />
          <input value={newAction.owner} placeholder="Owner" onChange={e => setNewAction({ ...newAction, owner: e.target.value })} style={inputStyleMini} />
          <button onClick={handleNewAction} style={btnStyle}>Add</button>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | LTAD Board Compliance Engine
      </div>
    </div>
  );
};

export default LTADComplianceDashboard;
