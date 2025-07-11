import React, { useState } from "react";
import {
  FaBullseye, FaCheckCircle, FaTimesCircle, FaChartBar, FaEdit, FaTrash, FaPlus, FaFileExport, FaLightbulb, FaArrowRight, FaComments
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const DEFAULT_PILLARS = [
  { key: "playerdev", label: "Player Development" },
  { key: "coachdev", label: "Coach Development" },
  { key: "culture", label: "Club Culture" },
  { key: "ethics", label: "Ethics/Integrity" },
  { key: "community", label: "Community Impact" }
];
const DEFAULT_DEPTS = [
  "Senior Team", "Youth", "Coaching", "Medical", "Operations", "Board", "Scouting", "Parents"
];

const demoAlignments = [
  // dept, pillar, score [1-10], comment
  { dept: "Senior Team", pillar: "playerdev", score: 9, note: "Elite training standards" },
  { dept: "Youth", pillar: "playerdev", score: 8, note: "Strong pathway" },
  { dept: "Coaching", pillar: "coachdev", score: 7, note: "Good CPD but room for more" },
  { dept: "Medical", pillar: "ethics", score: 9, note: "Best-practice care" },
  { dept: "Operations", pillar: "culture", score: 6, note: "Too many silos" },
  { dept: "Board", pillar: "ethics", score: 6, note: "Some decisions misaligned" },
  { dept: "Parents", pillar: "community", score: 5, note: "Weak engagement" }
];

const ClubDNAAlignmentElite = () => {
  // Pillars and Departments
  const [pillars, setPillars] = useState([...DEFAULT_PILLARS]);
  const [depts, setDepts] = useState([...DEFAULT_DEPTS]);
  // Alignment scores per dept x pillar
  const [alignments, setAlignments] = useState([...demoAlignments]);
  // Trend timeline for consulting view
  const [timeline, setTimeline] = useState([
    { date: "2024-03", gap: 1.7 },
    { date: "2024-06", gap: 1.3 },
    { date: "2024-09", gap: 1.9 }
  ]);
  // Pillar Editor
  const [newPillar, setNewPillar] = useState("");
  const [newDept, setNewDept] = useState("");
  // Board comments
  const [comments, setComments] = useState([{ by: "Board", txt: "Align parent comms with club culture.", date: "2024-05-15" }]);
  const [commentText, setCommentText] = useState("");
  // Scenario
  const [scenarioDept, setScenarioDept] = useState("");
  const [scenarioPillar, setScenarioPillar] = useState("");
  const [scenarioDelta, setScenarioDelta] = useState(0);

  // CRUD for alignments
  function setAlignment(dept, pillar, val) {
    let found = alignments.find(a => a.dept === dept && a.pillar === pillar);
    if (found) {
      setAlignments(alignments.map(a => a.dept === dept && a.pillar === pillar ? { ...a, score: val } : a));
    } else {
      setAlignments([...alignments, { dept, pillar, score: val, note: "" }]);
    }
  }
  // CRUD notes
  function setNote(dept, pillar, note) {
    setAlignments(alignments.map(a => a.dept === dept && a.pillar === pillar ? { ...a, note } : a));
  }
  // Add pillar/department
  function addPillar() {
    if (!newPillar) return;
    setPillars([...pillars, { key: newPillar.toLowerCase().replace(/ /g, ""), label: newPillar }]);
    setNewPillar("");
  }
  function addDept() {
    if (!newDept) return;
    setDepts([...depts, newDept]);
    setNewDept("");
  }
  // Remove pillar/department
  function removePillar(key) {
    setPillars(pillars.filter(p => p.key !== key));
    setAlignments(alignments.filter(a => a.pillar !== key));
  }
  function removeDept(dept) {
    setDepts(depts.filter(d => d !== dept));
    setAlignments(alignments.filter(a => a.dept !== dept));
  }
  // Boardroom comments
  function addComment() {
    if (!commentText.trim()) return;
    setComments([...comments, { by: "Board", txt: commentText, date: new Date().toISOString().slice(0, 10) }]);
    setCommentText("");
  }
  // Scenario simulation
  function runScenario() {
    if (!scenarioDept || !scenarioPillar) return null;
    let base = alignments.find(a => a.dept === scenarioDept && a.pillar === scenarioPillar)?.score || 0;
    let proj = Math.min(10, Math.max(1, base + Number(scenarioDelta)));
    return { base, proj };
  }

  // Export CSV
  function exportCSV() {
    let csv = ["Dept/Pillar," + pillars.map(p => p.label).join(",")];
    depts.forEach(d => {
      csv.push([d, ...pillars.map(p => {
        let a = alignments.find(x => x.dept === d && x.pillar === p.key);
        return a ? a.score : "";
      })].join(","));
    });
    csv.push("\nBoard Log:");
    comments.forEach(c => csv.push([c.date, c.by, c.txt].join(",")));
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "club_dna_alignment.csv";
    a.click(); URL.revokeObjectURL(url);
  }

  // Calculate heatmap and avg gap
  function gapScore() {
    let scores = depts.flatMap(d => pillars.map(p => {
      let a = alignments.find(x => x.dept === d && x.pillar === p.key);
      return a ? a.score : 0;
    }));
    if (!scores.length) return 0;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const gaps = scores.filter(s => s < 7).length;
    return { avg, gaps };
  }

  // --- UI ---
  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <FaBullseye size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Club/Academy DNA Audit & Strategic Alignment
        </h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | DNA & Strategy
        </span>
        <button onClick={exportCSV} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 16 }}><FaFileExport style={{ marginRight: 5 }} /> Export CSV</button>
      </div>
      {/* Pillar/Dept Editors */}
      <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#FFD700" }}>DNA Pillars</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {pillars.map(p =>
              <li key={p.key} style={{ marginBottom: 3, display: "flex", alignItems: "center" }}>
                <span style={{ color: "#FFD700", fontWeight: 700 }}>{p.label}</span>
                <button onClick={() => removePillar(p.key)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", fontSize: 13, padding: "1px 8px", marginLeft: 7 }}><FaTrash /></button>
              </li>
            )}
          </ul>
          <input value={newPillar} placeholder="Add pillar" onChange={e => setNewPillar(e.target.value)} style={inputStyle} />
          <button onClick={addPillar} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}><FaPlus /></button>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#FFD700" }}>Departments</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {depts.map(d =>
              <li key={d} style={{ marginBottom: 3, display: "flex", alignItems: "center" }}>
                <span style={{ color: "#1de682", fontWeight: 700 }}>{d}</span>
                <button onClick={() => removeDept(d)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", fontSize: 13, padding: "1px 8px", marginLeft: 7 }}><FaTrash /></button>
              </li>
            )}
          </ul>
          <input value={newDept} placeholder="Add department" onChange={e => setNewDept(e.target.value)} style={inputStyle} />
          <button onClick={addDept} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}><FaPlus /></button>
        </div>
      </div>
      {/* Alignment Heatmap */}
      <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, marginBottom: 5 }}>DNA Alignment Heatmap</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16, color: "#fff", marginBottom: 13 }}>
        <thead>
          <tr>
            <th>Department</th>
            {pillars.map(p => <th key={p.key}>{p.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {depts.map(d =>
            <tr key={d}>
              <td style={{ fontWeight: 700, color: "#FFD700" }}>{d}</td>
              {pillars.map(p => {
                const a = alignments.find(x => x.dept === d && x.pillar === p.key);
                const score = a ? a.score : "";
                return (
                  <td key={p.key} style={{
                    background: score >= 8 ? "#1de68244" : score >= 6 ? "#FFD70044" : score ? "#ff484844" : "#232a2e",
                    color: score >= 8 ? "#1de682" : score >= 6 ? "#FFD700" : score ? "#ff4848" : "#fff",
                    fontWeight: 700, minWidth: 60
                  }}>
                    <input
                      value={score}
                      type="number"
                      min={1}
                      max={10}
                      onChange={e => setAlignment(d, p.key, Number(e.target.value))}
                      style={inputStyleMini}
                    />
                    <FaEdit style={{ fontSize: 13, marginLeft: 5, cursor: "pointer" }}
                      title="Add/Edit Note"
                      onClick={() => setNote(d, p.key, prompt("Note for this cell:", a ? a.note : ""))}
                    />
                    {a && a.note &&
                      <span style={{ color: "#FFD70099", fontSize: 12, marginLeft: 4 }} title={a.note}>*</span>
                    }
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
      {/* Alignment Gaps & Timeline */}
      <div style={{ display: "flex", gap: 32, marginBottom: 18 }}>
        <div style={{ flex: 2, background: "#232a2e", borderRadius: 14, boxShadow: "0 2px 18px #FFD70022", padding: 15 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16 }}>Alignment Gaps & Timeline</div>
          <div style={{ color: "#FFD700aa", fontSize: 15, marginBottom: 7 }}>
            Average Alignment: <span style={{ color: "#1de682", fontWeight: 800 }}>{gapScore().avg.toFixed(2)}</span>
            &nbsp;|&nbsp; Gaps (&lt;7): <span style={{ color: "#ff4848", fontWeight: 800 }}>{gapScore().gaps}</span>
          </div>
          <svg width={300} height={70}>
            {timeline.map((t, i) => (
              <g key={i}>
                <rect x={20 + i * 80} y={50 - t.gap * 12} width={45} height={t.gap * 12} fill={t.gap > 1.8 ? "#ff4848" : t.gap > 1.4 ? "#FFD700" : "#1de682"} />
                <text x={40 + i * 80} y={62} fill="#FFD700cc" fontSize={13}>{t.date}</text>
                <text x={40 + i * 80} y={42 - t.gap * 12} fill="#fff" fontWeight={700} fontSize={13}>{t.gap.toFixed(1)}</text>
              </g>
            ))}
          </svg>
          <div style={{ fontSize: 13, color: "#FFD700bb" }}>Red = many alignment gaps, Green = strong.</div>
        </div>
        {/* Scenario Simulator */}
        <div style={{ flex: 1, background: "#283E51", borderRadius: 14, boxShadow: "0 2px 18px #FFD70022", padding: 14 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 15, marginBottom: 4 }}>Scenario Simulator</div>
          <select value={scenarioDept} onChange={e => setScenarioDept(e.target.value)} style={inputStyle}>
            <option value="">Select Dept</option>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={scenarioPillar} onChange={e => setScenarioPillar(e.target.value)} style={inputStyle}>
            <option value="">Select Pillar</option>
            {pillars.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <input value={scenarioDelta} type="number" min={-3} max={+3} placeholder="Δ" onChange={e => setScenarioDelta(Number(e.target.value))} style={inputStyleMini} />
          <button style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }} onClick={() => { }}>
            <FaArrowRight /> Simulate
          </button>
          {/* Show result */}
          {runScenario() && (
            <div style={{ marginTop: 5, color: "#FFD700" }}>
              From <b>{runScenario().base}</b> to <b>{runScenario().proj}</b>
              &nbsp;({scenarioDelta > 0 ? <span style={{ color: "#1de682" }}>Improvement</span> : scenarioDelta < 0 ? <span style={{ color: "#ff4848" }}>Risk</span> : "No Change"})
            </div>
          )}
        </div>
      </div>
      {/* Boardroom Recommendations & Log */}
      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16 }}><FaLightbulb style={{ marginRight: 7 }} /> Boardroom Recommendations</div>
          <ul>
            {gapScore().gaps > 2
              ? <li style={{ color: "#ff4848", fontWeight: 700 }}>Significant alignment gaps detected—launch alignment workshops and update policies immediately.</li>
              : <li style={{ color: "#1de682", fontWeight: 700 }}>Alignment is strong. Maintain peer review and transparency practices.</li>
            }
            <li style={{ color: "#FFD700", fontWeight: 600 }}>Monitor departments with gaps in ethics, culture, and community.</li>
          </ul>
        </div>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaComments style={{ marginRight: 7 }} /> Boardroom Log</div>
          <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
            {comments.map((c, i) => <div key={i}><span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt} <span style={{ color: "#FFD70077", fontSize: 12 }}>{c.date}</span></div>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={commentText} placeholder="Add board note or action..." onChange={e => setCommentText(e.target.value)} style={inputStyleFull} />
            <button onClick={addComment} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1px solid #FFD70077", fontSize: 15, width: 110
};
const inputStyleFull = {
  ...inputStyle, width: 220
};
const inputStyleMini = {
  ...inputStyle, width: 44, fontSize: 15, marginRight: 0
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default ClubDNAAlignmentElite;
