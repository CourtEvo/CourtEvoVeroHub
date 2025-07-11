import React, { useState } from "react";
import { FaClipboardCheck, FaPlus, FaUserTie, FaCheckCircle, FaEdit, FaTimes, FaArrowRight, FaFileExport, FaArrowUp, FaArrowDown, FaFlag, FaExclamationTriangle, FaStar } from "react-icons/fa";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from "recharts";

// Default diagnostic areas, can add more!
const DEFAULT_AREAS = [
  { area: "Leadership", weighted: 1, critical: false, priority: false },
  { area: "Financial Health", weighted: 1, critical: true, priority: false },
  { area: "Player Development", weighted: 1.5, critical: false, priority: true },
  { area: "Facilities", weighted: 1, critical: false, priority: false },
  { area: "Marketing", weighted: 1, critical: false, priority: false },
  { area: "Governance", weighted: 1, critical: true, priority: false },
  { area: "Risk", weighted: 1, critical: true, priority: false },
  { area: "Innovation", weighted: 1, critical: false, priority: true },
  { area: "Stakeholder Engagement", weighted: 1, critical: false, priority: false }
];

function initDiagAreas(areas = DEFAULT_AREAS) {
  return areas.map(d => ({
    ...d,
    score: null,
    comments: [],
    swot: { S: [], W: [], O: [], T: [] },
    audit: [],
    actions: []
  }));
}

export default function ClubBoardroomDiagnostic() {
  const [diag, setDiag] = useState(initDiagAreas());
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [score, setScore] = useState("");
  const [weighted, setWeighted] = useState(1);
  const [comment, setComment] = useState("");
  const [boardRole, setBoardRole] = useState(""); // e.g., "President", "Finance Chair"
  const [swotType, setSwotType] = useState("S");
  const [swotText, setSwotText] = useState("");
  const [swotBoard, setSwotBoard] = useState("");
  const [action, setAction] = useState({ title: "", owner: "", deadline: "", status: "Open", notes: "" });
  const [showActionIdx, setShowActionIdx] = useState(null);
  const [showSwotOverview, setShowSwotOverview] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [trend, setTrend] = useState([]);
  const [newArea, setNewArea] = useState({ area: "", weighted: 1, critical: false, priority: false });

  // Area editing (add, move, delete)
  function addArea() {
    if (!newArea.area.trim()) return;
    setDiag([...diag, { ...newArea, score: null, comments: [], swot: { S: [], W: [], O: [], T: [] }, audit: [], actions: [] }]);
    setNewArea({ area: "", weighted: 1, critical: false, priority: false });
  }
  function moveArea(idx, dir) {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === diag.length - 1)) return;
    const newDiag = [...diag];
    const [removed] = newDiag.splice(idx, 1);
    newDiag.splice(idx + dir, 0, removed);
    setDiag(newDiag);
  }
  function deleteArea(idx) {
    setDiag(diag.filter((_, i) => i !== idx));
  }
  // Save score/comment/SWOT/action (all with board role attribution)
  function saveScore(idx) {
    setDiag(diag =>
      diag.map((d, i) =>
        i === idx
          ? {
              ...d,
              score: parseFloat(score),
              weighted,
              audit: [{ date: new Date().toISOString().slice(0, 10), by: boardRole || "Board", note: `Scored ${score}/5, weighted ${weighted}` }, ...(d.audit || [])]
            }
          : d
      )
    );
    setTrend([
      ...trend,
      { date: new Date().toISOString().slice(0, 10), area: diag[idx].area, score: parseFloat(score) }
    ]);
    setScore(""); setWeighted(1); setBoardRole("");
  }
  function saveComment(idx) {
    if (!comment.trim() || !boardRole.trim()) return;
    setDiag(diag =>
      diag.map((d, i) =>
        i === idx
          ? {
              ...d,
              comments: [{ by: boardRole, date: new Date().toISOString().slice(0, 10), text: comment }, ...(d.comments || [])]
            }
          : d
      )
    );
    setComment(""); setBoardRole("");
  }
  function saveSWOT(idx) {
    if (!swotText.trim() || !swotBoard.trim()) return;
    setDiag(diag =>
      diag.map((d, i) =>
        i === idx
          ? {
              ...d,
              swot: {
                ...d.swot,
                [swotType]: [{ by: swotBoard, date: new Date().toISOString().slice(0, 10), text: swotText }, ...(d.swot[swotType] || [])]
              }
            }
          : d
      )
    );
    setSwotText(""); setSwotBoard("");
  }
  function saveAction(idx) {
    if (!action.title.trim()) return;
    setDiag(diag =>
      diag.map((d, i) =>
        i === idx
          ? {
              ...d,
              actions: [{ ...action, audit: [{ by: "Board", date: new Date().toISOString().slice(0, 10), note: "Action added" }], votes: {} }, ...(d.actions || [])]
            }
          : d
      )
    );
    setAction({ title: "", owner: "", deadline: "", status: "Open", notes: "" });
    setShowActionIdx(null);
  }
  // Action Filtering, Approval
  function changeActionStatus(idx, aIdx, status, closeNote = "") {
    setDiag(diag =>
      diag.map((d, i) =>
        i === idx
          ? {
              ...d,
              actions: d.actions.map((a, j) =>
                j === aIdx
                  ? {
                      ...a,
                      status,
                      closeNote,
                      audit: [{ by: "Board", date: new Date().toISOString().slice(0, 10), note: `Status set to ${status}${closeNote ? `: ${closeNote}` : ""}` }, ...(a.audit || [])]
                    }
                  : a
              )
            }
          : d
      )
    );
  }
  function avg(arr, f) {
    const n = arr.length;
    if (!n) return 0;
    return arr.reduce((acc, x) => acc + (f ? f(x) : x), 0) / n;
  }
  // Export CSV
  function exportCSV() {
    const rows = [["Area", "Score", "Weighted", "Comments", "SWOT S", "SWOT W", "SWOT O", "SWOT T", "Actions"]];
    diag.forEach(d => {
      rows.push([
        d.area, d.score, d.weighted,
        (d.comments || []).map(c => c.text).join("; "),
        (d.swot.S || []).map(s => s.text).join("; "),
        (d.swot.W || []).map(w => w.text).join("; "),
        (d.swot.O || []).map(o => o.text).join("; "),
        (d.swot.T || []).map(t => t.text).join("; "),
        (d.actions || []).map(a => a.title + " [" + a.status + "]").join("; ")
      ]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "club_boardroom_diagnostic.csv";
    a.click();
  }

  // Analytics
  const scored = diag.filter(d => d.score != null);
  const avgScore = avg(scored, d => d.score);
  const lowAreas = diag.filter(d => d.score != null && d.score < 3);
  const radarData = diag.map(d => ({
    area: d.area,
    Score: d.score || 0
  }));
  const trendData = trend.map(t => ({ date: t.date, area: t.area, score: t.score }));

  // SWOT Overview (boardroom-style tab)
  const allSWOT = diag.flatMap(d =>
    ["S", "W", "O", "T"].flatMap(type =>
      (d.swot[type] || []).map(s => ({
        area: d.area,
        type,
        ...s
      }))
    )
  );

  // Color helpers
  const getAreaBg = d => d.critical ? "#e82e2e22" : d.priority ? "#1de68222" : "#232a2e";
  const getAreaTitle = d => d.critical ? (<span><FaExclamationTriangle color="#e82e2e" /> {d.area}</span>) : d.priority ? (<span><FaStar color="#FFD700" /> {d.area}</span>) : d.area;

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 24,
      padding: 22
    }}>
      <h2 style={{ fontWeight: 900, marginBottom: 14 }}>
        <FaClipboardCheck style={{ marginRight: 8 }} /> Club Boardroom Diagnostic
      </h2>
      {/* Board can add new diagnostic areas */}
      <div style={{ background: "#181e23", borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: "0 2px 18px #FFD70013" }}>
        <h4 style={{ color: "#FFD700", marginBottom: 6 }}>Diagnostic Areas (customizable)</h4>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <input value={newArea.area} onChange={e => setNewArea(a => ({ ...a, area: e.target.value }))} placeholder="New Area" style={formInput} />
          <select value={newArea.weighted} onChange={e => setNewArea(a => ({ ...a, weighted: parseFloat(e.target.value) }))} style={formInput}>
            {[1, 1.5, 2, 2.5, 3].map(w => <option key={w} value={w}>{w}x</option>)}
          </select>
          <label>
            <input type="checkbox" checked={newArea.critical} onChange={e => setNewArea(a => ({ ...a, critical: e.target.checked }))} /> Critical
          </label>
          <label>
            <input type="checkbox" checked={newArea.priority} onChange={e => setNewArea(a => ({ ...a, priority: e.target.checked }))} /> Strategic
          </label>
          <button style={addBtnStyle} onClick={addArea}><FaPlus /> Add Area</button>
        </div>
      </div>
      {/* Area List with reordering */}
      <div style={{ marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 14 }}>
        {diag.map((d, idx) => (
          <div key={d.area} style={{ background: getAreaBg(d), borderRadius: 13, padding: "13px 22px", minWidth: 210 }}>
            <b>{getAreaTitle(d)}</b>
            <button style={areaBtn} onClick={() => moveArea(idx, -1)} disabled={idx === 0}><FaArrowUp /></button>
            <button style={areaBtn} onClick={() => moveArea(idx, 1)} disabled={idx === diag.length - 1}><FaArrowDown /></button>
            <button style={areaBtn} onClick={() => deleteArea(idx)}><FaTimes /></button>
            <span style={{ fontSize: 14, color: "#FFD700", marginLeft: 11, fontWeight: 800 }}>
              {d.critical && "Critical | "}
              {d.priority && "Strategic"}
            </span>
          </div>
        ))}
      </div>
      {/* Analytics/Charts */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", margin: "20px 0" }}>
        <div style={snapCard}>
          <b>Areas Scored:</b> {scored.length} / {diag.length}
        </div>
        <div style={snapCard}>
          <b>Average Score:</b> {avgScore.toFixed(2)}
        </div>
        <div style={snapCard}>
          <b>At Risk:</b> {lowAreas.map(a => a.area).join(", ") || "None"}
        </div>
        <button style={btnStyle} onClick={() => setShowExport(true)}>
          <FaFileExport /> Export
        </button>
        {showExport && (
          <div style={{
            background: "#232a2e", color: "#FFD700", padding: 24, borderRadius: 16, zIndex: 99, position: "absolute", left: 160, top: 38, minWidth: 330, boxShadow: "0 8px 32px #FFD70011"
          }}>
            <button style={editBtnStyle} onClick={() => setShowExport(false)}><FaTimes /></button>
            <button style={addBtnStyle} onClick={exportCSV}><FaFileExport /> Download CSV</button>
            <button style={addBtnStyle} onClick={() => window.print()}><FaFileExport /> Print</button>
          </div>
        )}
      </div>
      {/* Radar/Trendline */}
      <div style={{ display: "flex", gap: 32, marginBottom: 30, flexWrap: "wrap" }}>
        <div style={{ background: "#181e23", borderRadius: 16, padding: 18, flex: "1 1 340px" }}>
          <h4 style={{ color: "#FFD700", marginBottom: 6 }}>Score Radar</h4>
          <ResponsiveContainer width="100%" height={270}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="area" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="Score" dataKey="Score" stroke="#FFD700" fill="#FFD700" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "#181e23", borderRadius: 16, padding: 18, flex: "1 1 340px" }}>
          <h4 style={{ color: "#FFD700", marginBottom: 6 }}>Trendline</h4>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#1de682" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Diagnostic Table */}
      <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse", background: "#232a2e", borderRadius: 12 }}>
        <thead>
          <tr style={{ color: "#FFD700" }}>
            <th>Area</th>
            <th>Score</th>
            <th>Weighted</th>
            <th>Board Comments</th>
            <th>SWOT</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {diag.map((d, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: 900, color: "#FFD700" }}>{getAreaTitle(d)}</td>
              <td>
                <input type="number" value={d.score ?? ""} onChange={e => setScore(e.target.value)} min={1} max={5} style={formInput} />
                <select value={weighted} onChange={e => setWeighted(parseFloat(e.target.value))} style={formInput}>
                  {[1, 1.5, 2, 2.5, 3].map(w => <option key={w} value={w}>{w}x</option>)}
                </select>
                <input value={boardRole} onChange={e => setBoardRole(e.target.value)} placeholder="Role (e.g. President)" style={formInput} />
                <button style={addBtnStyle} onClick={() => saveScore(idx)}><FaCheckCircle /> Save</button>
                <div style={{ fontSize: 12, color: "#FFD700" }}>Last: {d.score || "-"} ({d.weighted || "1"}x)</div>
              </td>
              <td>{d.weighted}</td>
              <td>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Board Comment" style={formInput} />
                <input value={boardRole} onChange={e => setBoardRole(e.target.value)} placeholder="Role" style={formInput} />
                <button style={addBtnStyle} onClick={() => saveComment(idx)}><FaPlus /> Add</button>
                <ul style={{ marginTop: 6 }}>
                  {(d.comments || []).map((c, i) =>
                    <li key={i} style={{ fontSize: 13 }}>{c.by}: {c.text} ({c.date})</li>
                  )}
                </ul>
              </td>
              <td>
                <select value={swotType} onChange={e => setSwotType(e.target.value)} style={formInput}>
                  <option value="S">Strength</option>
                  <option value="W">Weakness</option>
                  <option value="O">Opportunity</option>
                  <option value="T">Threat</option>
                </select>
                <textarea value={swotText} onChange={e => setSwotText(e.target.value)} placeholder="SWOT Note" style={formInput} />
                <input value={swotBoard} onChange={e => setSwotBoard(e.target.value)} placeholder="Role" style={formInput} />
                <button style={addBtnStyle} onClick={() => saveSWOT(idx)}><FaPlus /> Add</button>
                <ul style={{ marginTop: 6 }}>
                  {(d.swot[swotType] || []).map((s, i) =>
                    <li key={i} style={{ fontSize: 13 }}>{s.by}: {s.text} ({s.date})</li>
                  )}
                </ul>
              </td>
              <td>
                <button style={addBtnStyle} onClick={() => setShowActionIdx(idx)}>
                  <FaPlus /> Action
                </button>
                {showActionIdx === idx && (
                  <div style={{
                    background: "#181e23",
                    color: "#FFD700",
                    borderRadius: 14,
                    padding: 12,
                    minWidth: 280,
                    boxShadow: "0 2px 12px #FFD70022",
                    position: "absolute",
                    zIndex: 10
                  }}>
                    <input value={action.title} onChange={e => setAction(a => ({ ...a, title: e.target.value }))} placeholder="Action Title" style={formInput} />
                    <input value={action.owner} onChange={e => setAction(a => ({ ...a, owner: e.target.value }))} placeholder="Owner" style={formInput} />
                    <input type="date" value={action.deadline} onChange={e => setAction(a => ({ ...a, deadline: e.target.value }))} style={formInput} />
                    <input value={action.notes} onChange={e => setAction(a => ({ ...a, notes: e.target.value }))} placeholder="Notes" style={formInput} />
                    <button style={addBtnStyle} onClick={() => saveAction(idx)}><FaCheckCircle /> Save</button>
                    <button style={editBtnStyle} onClick={() => setShowActionIdx(null)}><FaTimes /> Cancel</button>
                  </div>
                )}
                {/* Actions List */}
                <ul>
                  {(d.actions || []).filter(a => a.status !== "Closed").map((a, aIdx) =>
                    <li key={aIdx} style={{ fontSize: 13 }}>
                      {a.title} <FaArrowRight /> {a.owner} [{a.status}]
                      <button style={addBtnStyle} onClick={() => changeActionStatus(idx, aIdx, a.status === "Open" ? "Closed" : "Open")}>{a.status === "Open" ? "Close" : "Reopen"}</button>
                      <span style={{ marginLeft: 8 }}>
                        <span style={{ color: "#FFD700" }}>Deadline: {a.deadline}</span>
                        {a.notes && <span style={{ marginLeft: 8, color: "#1de682" }}>{a.notes}</span>}
                      </span>
                    </li>
                  )}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* SWOT Overview */}
      <div style={{ marginTop: 38 }}>
        <button style={btnStyle} onClick={() => setShowSwotOverview(s => !s)}><FaFlag /> SWOT Overview</button>
        {showSwotOverview && (
          <div style={{ background: "#232a2e", borderRadius: 18, padding: 16, marginTop: 11 }}>
            <h4 style={{ color: "#FFD700" }}>All SWOT Entries (Board/Area/Role)</h4>
            <table style={{ width: "100%", fontSize: 15 }}>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Type</th>
                  <th>Text</th>
                  <th>By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allSWOT.map((s, i) => (
                  <tr key={i}>
                    <td>{s.area}</td>
                    <td>
                      {s.type === "S" ? "Strength" : s.type === "W" ? "Weakness" : s.type === "O" ? "Opportunity" : "Threat"}
                    </td>
                    <td>{s.text}</td>
                    <td>{s.by}</td>
                    <td>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Audit Trail */}
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "13px 21px",
        fontWeight: 600,
        fontSize: 15,
        marginTop: 24
      }}>
        <FaClipboardCheck style={{ marginRight: 7, verticalAlign: -2 }} />
        Every action, score, and SWOT is fully auditable for city, AGM, or sponsor inspection.
      </div>
    </div>
  );
}

// --- Styling constants ---
const btnStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 18,
  padding: "8px 12px",
  margin: "0 4px",
  cursor: "pointer"
};
const addBtnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 900,
  fontSize: 15,
  marginLeft: 12,
  boxShadow: "0 2px 12px #1de68244",
  cursor: "pointer"
};
const editBtnStyle = {
  background: "#FFD70022",
  color: "#FFD700",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 17,
  padding: "6px 11px",
  boxShadow: "0 1px 7px #FFD70022",
  cursor: "pointer"
};
const formInput = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 15,
  padding: "7px 13px",
  width: 120,
  marginBottom: 8
};
const snapCard = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 15,
  fontWeight: 800,
  fontSize: 17,
  padding: "14px 20px",
  minWidth: 150
};
const areaBtn = {
  background: "#232a2e",
  color: "#1de682",
  border: "1.5px solid #1de682",
  borderRadius: 8,
  fontWeight: 900,
  fontSize: 14,
  margin: "0 3px",
  cursor: "pointer"
};
