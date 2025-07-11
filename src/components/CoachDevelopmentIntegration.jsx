import React, { useState } from "react";
import {
  FaChalkboardTeacher, FaClipboardCheck, FaCheckCircle, FaFileExport, FaExclamationTriangle, FaRobot, FaChartLine, FaCertificate, FaSyncAlt, FaCommentDots, FaUserTie, FaArrowUp, FaUsers, FaCloudUploadAlt, FaChartPie
} from "react-icons/fa";

// Phases/squads
const phases = ["Foundation", "Development", "Performance", "Elite"];
const squads = ["U14", "U16", "U18", "Senior"];

const initCoaches = [
  {
    name: "Sandro Sesar",
    role: "Head Coach U16",
    phase: "Development",
    cpd: [{ year: 2022, course: "FIBA Youth", cert: true, file: "fiba-youth.pdf" }, { year: 2023, course: "CBBF A", cert: true, file: "cbbf-a.pdf" }],
    cpdDue: false,
    cpdProgress: [1, 1, 1, 1], // green
    compliance: "ok",
    assignments: ["U16", "Academy"],
    impact: { squads: 2, players: 28, effect: 0.89 },
    portfolio: { philosophy: "Fast pace, high engagement", strengths: "Team cohesion", growth: "Analytics integration" },
    history: [
      { date: "2024-03-09", action: "CPD completed: FIBA Youth", by: "Sesar" },
      { date: "2024-04-13", action: "Board review passed", by: "DoC" }
    ],
    directorReview: "",
    alerts: [],
    peer: "Ante Jusup"
  },
  {
    name: "Ante Jusup",
    role: "Assistant Coach U18",
    phase: "Performance",
    cpd: [{ year: 2023, course: "EuroLeague Clinic", cert: false, file: "" }],
    cpdDue: true,
    cpdProgress: [1, 1, 0, 0], // yellow/red
    compliance: "warning",
    assignments: ["U18"],
    impact: { squads: 1, players: 14, effect: 0.81 },
    portfolio: { philosophy: "Defense-first", strengths: "Individual improvement", growth: "Digital tools" },
    history: [],
    directorReview: "",
    alerts: ["CPD overdue: EuroLeague Clinic"],
    peer: "Sandro Sesar"
  }
];

// Heatmap matrix builder
function buildCoverageHeatmap(coaches) {
  // Each phase/squad cell: how many coaches assigned/qualified (demo: binary)
  return squads.map(sq =>
    phases.map(ph =>
      coaches.some(c => c.assignments.includes(sq) && c.phase === ph)
    )
  );
}
// Impact map: demo bar for each coach
function impactBar(impact) {
  const width = Math.round(impact.effect * 140);
  return (
    <div style={{ background: "#FFD70022", borderRadius: 6, width: 140, height: 16, position: "relative" }}>
      <div style={{
        background: "#1de682", height: "100%", borderRadius: 6,
        width: width, transition: "width .2s"
      }} />
      <span style={{
        position: "absolute", left: 4, top: 0, fontSize: 13, fontWeight: 700, color: "#232a2e"
      }}>{Math.round(impact.effect * 100)}%</span>
    </div>
  );
}
// CPD progress
function progressBar(arr) {
  const cols = ["#1de682", "#FFD700", "#ff4848"];
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {arr.map((v, i) =>
        <div key={i} style={{
          width: 20, height: 9, background: cols[v], borderRadius: 3
        }} />
      )}
    </div>
  );
}
const complianceColors = { ok: "#1de682", warning: "#FFD700", risk: "#ff4848" };

const CoachDevelopmentIntegration = () => {
  const [coaches, setCoaches] = useState(initCoaches);
  const [selected, setSelected] = useState(0);
  const [addNote, setAddNote] = useState("");
  const [directorReview, setDirectorReview] = useState("");
  const [uploading, setUploading] = useState("");
  const [exporting, setExporting] = useState(false);

  // File upload (demo)
  function handleUpload(idx, i) {
    const file = prompt("Type filename (demo; real = upload):");
    setCoaches(coaches.map((c, k) => k !== idx ? c : {
      ...c,
      cpd: c.cpd.map((cpd, j) => j !== i ? cpd : { ...cpd, file })
    }));
    setUploading("");
  }

  // Add director review/comment
  function saveDirectorReview(idx) {
    setCoaches(coaches.map((c, i) => i !== idx ? c : { ...c, directorReview }));
    setDirectorReview("");
  }
  // Add history log
  function addHistory(idx) {
    setCoaches(coaches.map((c, i) => i !== idx ? c : {
      ...c,
      history: [
        { date: new Date().toISOString().slice(0, 10), action: addNote, by: "Director" },
        ...(c.history || [])
      ]
    }));
    setAddNote("");
  }
  // Export
  function exportReport() {
    setExporting(true);
    setTimeout(() => {
      alert("Exported PDF/CSV: coach matrix, evidence, heatmap, scenario, impact, logs, and all federation data.");
      setExporting(false);
    }, 1200);
  }
  // Growth zone AI
  function aiSuggest(c) {
    if (c.cpdDue) return "Complete overdue CPD; assign next learning in analytics or digital tools.";
    if (c.portfolio.growth.toLowerCase().includes("analytics")) return "Prioritize analytics training—align with club digital strategy.";
    if (c.portfolio.growth.toLowerCase().includes("digital")) return "Digital tools upskilling. Assign to Digital Performance Lab for Q3.";
    return "Continue current phase; recommend cross-role peer coaching.";
  }
  // Peer suggestion
  function peerSuggest(c) {
    return `Suggested peer: ${c.peer} (${c.portfolio.strengths})`;
  }
  // Scenario: promote/rotate
  function scenarioRotate(idx) {
    alert("Scenario engine: If promoted/rotated, effect is +0.06 development impact, gap on current squad. Board decision required. Heatmap updates live.");
  }

  // Coverage heatmap
  const heatmap = buildCoverageHeatmap(coaches);

  const coach = coaches[selected];

  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 36, maxWidth: 1640, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
        <FaChalkboardTeacher size={32} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>Coach Development Integration <span style={{ color: "#FFD70088", fontWeight: 600, fontSize: 17 }}>ULTIMATE BOARDROOM+</span></h2>
        <span style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 10, padding: '8px 25px',
          fontSize: 17, marginLeft: 17
        }}>CourtEvo Vero</span>
        <button onClick={exportReport} disabled={exporting} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900,
          fontSize: 17, padding: "9px 23px", marginLeft: 20
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> {exporting ? "Exporting..." : "Export Board Pack"}
        </button>
      </div>
      {/* Heatmap */}
      <div style={{ margin: "22px 0 18px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 18 }}><FaChartPie style={{ marginRight: 7 }} /> Coverage Heatmap</b>
        <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 9, fontWeight: 700, fontSize: 16 }}>
          <thead>
            <tr>
              <th>Squad / Phase</th>
              {phases.map(ph => <th key={ph}>{ph}</th>)}
            </tr>
          </thead>
          <tbody>
            {squads.map((sq, i) =>
              <tr key={sq}>
                <td style={{ fontWeight: 800 }}>{sq}</td>
                {phases.map((ph, j) => (
                  <td key={ph} style={{
                    background: heatmap[i][j] ? "#1de682" : "#ff4848", color: "#232a2e", borderRadius: 6, padding: "7px 0", fontWeight: 900
                  }}>
                    {heatmap[i][j] ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ marginTop: 7, color: "#FFD70099" }}>Green = covered by assigned/qualified coach; Red = gap/risk for board action.</div>
      </div>
      {/* Coach matrix/portfolio */}
      <div style={{ display: "flex", gap: 34, alignItems: "flex-start" }}>
        <div>
          <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 12, fontWeight: 700, fontSize: 16 }}>
            <thead>
              <tr>
                <th>Name</th><th>Role</th><th>Phase</th><th>CPD</th><th>Progress</th><th>Compliance</th><th>Assignments</th><th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((c, idx) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>{c.role}</td>
                  <td>{c.phase}</td>
                  <td>
                    {c.cpd.map((cpd, i) =>
                      <span key={i} style={{ marginRight: 4, color: cpd.cert ? "#1de682" : "#ff4848" }}>
                        <FaCertificate style={{ marginRight: 2 }} /> {cpd.course} ({cpd.year})
                        <button style={{
                          background: "#FFD70022", border: "none", borderRadius: 4, marginLeft: 5, color: "#FFD700", cursor: "pointer", fontSize: 14
                        }}
                          onClick={() => handleUpload(idx, i)}
                        ><FaCloudUploadAlt style={{ marginRight: 2 }} />{cpd.file || "Upload"}</button>
                      </span>
                    )}
                    {c.cpdDue && <span style={{ color: "#ff4848", marginLeft: 7 }}><FaExclamationTriangle /> CPD due</span>}
                  </td>
                  <td>{progressBar(c.cpdProgress)}</td>
                  <td style={{
                    color: complianceColors[c.compliance], fontWeight: 900
                  }}>
                    {c.compliance.toUpperCase()}
                  </td>
                  <td>{c.assignments.join(", ")}</td>
                  <td>{impactBar(c.impact)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Coach portfolio */}
        <div style={{
          background: "#FFD70022", borderRadius: 14, padding: "17px 25px", minWidth: 320, color: "#FFD700", fontWeight: 900, boxShadow: "0 2px 18px #FFD70033"
        }}>
          <div style={{ fontSize: 18 }}>{coach.name} ({coach.role})</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Phase:</b> {coach.phase}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Philosophy:</b> {coach.portfolio.philosophy}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Strengths:</b> {coach.portfolio.strengths}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Growth Area:</b> {coach.portfolio.growth}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Assignments:</b> {coach.assignments.join(", ")}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Director Review:</b>
            <input value={coach.directorReview} onChange={e => setDirectorReview(e.target.value)} onBlur={() => saveDirectorReview(selected)}
              placeholder="Type review/comment" style={{
                borderRadius: 6, border: "1.2px solid #FFD70077", fontSize: 13, padding: 2,
                background: "#fff", color: "#232a2e", width: 160, marginLeft: 6
              }} />
          </div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}>
            <b>Alerts:</b> {coach.alerts?.length ? coach.alerts.map((al, i) => <span key={i} style={{ color: "#ff4848", marginLeft: 6 }}>{al}</span>) : <span style={{ color: "#1de682" }}>None</span>}
          </div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}>
            <b>Peer Pathway:</b> {peerSuggest(coach)}
          </div>
        </div>
        {/* Learning journey, impact, logs */}
        <div style={{
          minWidth: 340, background: "#232a2e", borderRadius: 12, padding: "13px 20px", color: "#FFD700", fontWeight: 900
        }}>
          <b><FaChartLine style={{ marginRight: 6 }} /> Learning Journey Timeline</b>
          <ul style={{ marginTop: 9, color: "#FFD700" }}>
            {coach.history.map((h, i) => (
              <li key={i}>[{h.date}] {h.by}: {h.action}</li>
            ))}
          </ul>
          <textarea value={addNote} onChange={e => setAddNote(e.target.value)} placeholder="Log CPD/action..." style={{
            borderRadius: 7, border: "1.2px solid #FFD70077", fontSize: 15, padding: 6, background: "#fff", color: "#232a2e", width: "100%", marginTop: 7
          }} />
          <button onClick={() => addHistory(selected)} style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "5px 14px", marginTop: 6
          }}>Add Log Entry</button>
          <div style={{ marginTop: 14, color: "#FFD700", fontWeight: 800 }}>
            <FaRobot style={{ marginRight: 6 }} /> Growth Zone AI: <span style={{ color: "#FFD700", fontWeight: 700 }}>{aiSuggest(coach)}</span>
          </div>
          <button onClick={() => scenarioRotate(selected)} style={{
            background: "#1de682", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 900, padding: "7px 19px", marginTop: 10
          }}><FaSyncAlt style={{ marginRight: 6 }} />Scenario: Promote/Rotate</button>
        </div>
      </div>
      <div style={{ marginTop: 24, color: "#FFD70099", fontSize: 16 }}>
        <FaClipboardCheck style={{ marginRight: 6 }} /> Compliance, evidence, board review, peer pathways, impact, all printable/exportable.
      </div>
      <div style={{ marginTop: 11 }}>
        <button onClick={exportReport} disabled={exporting} style={{
          background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 16, padding: "7px 19px"
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> {exporting ? "Exporting..." : "Export Board PDF/CSV"}
        </button>
      </div>
      <div style={{ marginTop: 19, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | Coach Dev ULTIMATE BOARDROOM+
      </div>
    </div>
  );
};

export default CoachDevelopmentIntegration;
