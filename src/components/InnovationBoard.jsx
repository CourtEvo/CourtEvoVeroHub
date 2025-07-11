import React, { useState } from "react";
import { FaLightbulb, FaPlus, FaUserTie, FaCheckCircle, FaEdit, FaTimes, FaCloudUploadAlt, FaFileExport, FaVoteYea, FaStar, FaExclamationTriangle, FaChartBar, FaChartPie, FaLink, FaHourglass, FaCopy, FaShieldAlt } from "react-icons/fa";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const AREAS = ["Coaching", "Analytics", "Tech", "Fan Engagement", "Revenue", "Medical", "Admin", "Other"];
const STAGES = ["Idea", "Proposal", "Board Review", "Approved", "In Pilot", "Scaled", "Archived"];

// Enhanced status coloring for legibility
const STATUS_COLORS = {
  "Idea": "#39361c",            // Deep gold brown
  "Proposal": "#1e3429",        // Deep green
  "Board Review": "#31314b",    // Deep blue/purple
  "Approved": "#193a2a",        // Board green
  "In Pilot": "#253046",        // Slate blue
  "Scaled": "#b39914",          // Vivid gold
  "Archived": "#232a2e"         // Board dark
};

const STATUS_TEXT_COLORS = {
  "Idea": "#FFD700",
  "Proposal": "#1de682",
  "Board Review": "#FFD700",
  "Approved": "#1de682",
  "In Pilot": "#FFD700",
  "Scaled": "#232a2e",
  "Archived": "#FFD700"
};

const PIE_COLORS = ["#FFD700", "#1de682", "#283E51", "#FFD700bb", "#1de68299", "#FFD70055", "#39361c", "#232a2e"];

const INIT = [
  {
    id: 1001,
    title: "AI Video Scouting Tool",
    description: "Automated video analysis for player development. Integrate Synergy-like auto tagging, with club-specific metrics.",
    owner: "Marko Proleta",
    champion: "Director of Analytics",
    area: "Analytics",
    date: "2024-07-01",
    stage: "In Pilot",
    impact: 5,
    cost: 4,
    impactIndex: 1.25,
    priority: true,
    risk: false,
    confidential: false,
    attachments: ["https://demo.com/scouting.pdf"],
    related: [],
    audit: [{ by: "Board", date: "2024-07-15", note: "Approved for pilot." }],
    boardVotes: { "President": true, "Director": true },
    notes: "Fast-tracked for U16 program.",
    stageEntered: "2024-07-01"
  },
  {
    id: 1002,
    title: "Digital Matchday Tickets",
    description: "Move all ticket sales online with QR scanning. Mobile-only entry, no paper. Target: +12% attendance.",
    owner: "Petar Horvat",
    champion: "Commercial Director",
    area: "Revenue",
    date: "2024-05-18",
    stage: "Board Review",
    impact: 4,
    cost: 2,
    impactIndex: 2.00,
    priority: true,
    risk: false,
    confidential: false,
    attachments: [],
    related: [],
    audit: [{ by: "Board", date: "2024-05-20", note: "Awaiting sponsor signoff." }],
    boardVotes: { "President": true, "Finance": false },
    notes: "Needs data privacy check.",
    stageEntered: "2024-05-18"
  },
  {
    id: 1003,
    title: "Volunteer Recruitment Portal",
    description: "Streamlined online application for coaching, events, and admin volunteers. Includes analytics for conversion and engagement.",
    owner: "Board Secretary",
    champion: "HR Lead",
    area: "Admin",
    date: "2024-04-01",
    stage: "Approved",
    impact: 3,
    cost: 1,
    impactIndex: 3.00,
    priority: false,
    risk: false,
    confidential: false,
    attachments: [],
    related: [],
    audit: [{ by: "President", date: "2024-04-01", note: "Approved for build-out." }],
    boardVotes: { "HR": true, "President": true },
    notes: "",
    stageEntered: "2024-04-01"
  },
  {
    id: 1004,
    title: "Athlete Health Passport",
    description: "Centralized medical records, physical tests, and clearance certificates in one dashboard. Linked with external clinics.",
    owner: "Medical Officer",
    champion: "Board Medical Lead",
    area: "Medical",
    date: "2024-02-25",
    stage: "Proposal",
    impact: 4,
    cost: 3,
    impactIndex: 1.33,
    priority: false,
    risk: true,
    confidential: true,
    attachments: [],
    related: [],
    audit: [{ by: "Board", date: "2024-02-25", note: "Needs legal review for GDPR." }],
    boardVotes: { "Medical": true },
    notes: "Confidential until privacy cleared.",
    stageEntered: "2024-02-25"
  },
  {
    id: 1005,
    title: "Coach Playbook App",
    description: "A club-branded mobile app for sharing playbooks, drills, and video with coaches. Includes feedback/quiz modules.",
    owner: "Technical Director",
    champion: "President",
    area: "Coaching",
    date: "2024-01-10",
    stage: "Scaled",
    impact: 5,
    cost: 3,
    impactIndex: 1.67,
    priority: true,
    risk: false,
    confidential: false,
    attachments: [],
    related: [],
    audit: [{ by: "Board", date: "2024-01-11", note: "Scaled after 2-month pilot." }],
    boardVotes: { "President": true, "Coach Lead": true },
    notes: "",
    stageEntered: "2024-01-10"
  },
  {
    id: 1006,
    title: "Halftime Fan Engagement Contest",
    description: "On-court fan contests with app-based signup. Build digital CRM, boost halftime retention, drive sponsor engagement.",
    owner: "Fan Engagement Lead",
    champion: "Marketing Director",
    area: "Fan Engagement",
    date: "2024-03-04",
    stage: "In Pilot",
    impact: 3,
    cost: 2,
    impactIndex: 1.50,
    priority: false,
    risk: false,
    confidential: false,
    attachments: [],
    related: [],
    audit: [{ by: "Marketing", date: "2024-03-05", note: "Pilot for next two games." }],
    boardVotes: { "Marketing": true },
    notes: "",
    stageEntered: "2024-03-04"
  }
];

function daysSince(date) {
  if (!date) return "-";
  return Math.max(1, Math.floor((new Date() - new Date(date)) / 86400000));
}

export default function InnovationBoard() {
  const [innov, setInnov] = useState(INIT);
  const [newInnov, setNewInnov] = useState({
    id: null, title: "", description: "", owner: "", champion: "", area: AREAS[0], date: "", stage: "Idea",
    impact: 3, cost: 3, impactIndex: 1, priority: false, risk: false, confidential: false, attachments: [], notes: "", related: [], stageEntered: ""
  });
  const [attach, setAttach] = useState("");
  const [comment, setComment] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [voteRole, setVoteRole] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showStage, setShowStage] = useState("All");
  const [showExport, setShowExport] = useState(false);

  function saveInnov(e) {
    e.preventDefault();
    const id = Date.now();
    setInnov([{ ...newInnov, id, date: new Date().toISOString().slice(0, 10), impactIndex: (newInnov.impact / newInnov.cost).toFixed(2), audit: [{ by: newInnov.owner, date: new Date().toISOString().slice(0, 10), note: "Submitted." }], boardVotes: {}, stageEntered: new Date().toISOString().slice(0, 10) }, ...innov]);
    setNewInnov({ id: null, title: "", description: "", owner: "", champion: "", area: AREAS[0], date: "", stage: "Idea", impact: 3, cost: 3, impactIndex: 1, priority: false, risk: false, confidential: false, attachments: [], notes: "", related: [], stageEntered: "" });
    setShowAdd(false);
  }
  function moveStage(idx, dir) {
    setInnov(innov =>
      innov.map((i, n) =>
        n === idx
          ? { ...i, stage: STAGES[Math.max(0, Math.min(STAGES.length - 1, STAGES.indexOf(i.stage) + dir))], stageEntered: new Date().toISOString().slice(0, 10),
              audit: [{ by: "Board", date: new Date().toISOString().slice(0, 10), note: `Moved to ${STAGES[Math.max(0, Math.min(STAGES.length - 1, STAGES.indexOf(i.stage) + dir))]}` }, ...(i.audit || [])]
            }
          : i
      )
    );
  }
  function addComment(idx) {
    if (!comment.trim()) return;
    setInnov(innov =>
      innov.map((i, n) =>
        n === idx
          ? { ...i, audit: [{ by: reviewer, date: new Date().toISOString().slice(0, 10), note: comment }, ...(i.audit || [])] }
          : i
      )
    );
    setComment(""); setReviewer("");
  }
  function addAttachment(idx) {
    if (!attach.trim()) return;
    setInnov(innov =>
      innov.map((i, n) =>
        n === idx
          ? { ...i, attachments: [...(i.attachments || []), attach] }
          : i
      )
    );
    setAttach("");
  }
  function voteOnInnov(idx, approve) {
    if (!voteRole.trim()) return;
    setInnov(innov =>
      innov.map((i, n) =>
        n === idx
          ? { ...i, boardVotes: { ...i.boardVotes, [voteRole]: approve } }
          : i
      )
    );
    setVoteRole("");
  }
  function exportCSV() {
    const rows = [["ID", "Title", "Area", "Stage", "Owner", "Champion", "Impact", "Cost", "ImpactIndex", "Priority", "Risk", "Notes", "Attachments", "Confidential"]];
    innov.forEach(i => {
      rows.push([i.id, i.title, i.area, i.stage, i.owner, i.champion, i.impact, i.cost, i.impactIndex, i.priority ? "Yes" : "No", i.risk ? "Yes" : "No", i.notes, (i.attachments || []).join("; "), i.confidential ? "Yes" : "No"]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "innovation_board.csv";
    a.click();
  }

  const pipeline = STAGES.map(stage => ({ stage, count: innov.filter(i => i.stage === stage).length }));
  const areaData = AREAS.map(area => ({ area, count: innov.filter(i => i.area === area).length }));
  const impactCost = innov.map(i => ({ title: i.title, impact: i.impact, cost: i.cost, impactIndex: i.impactIndex }));
  const copyToAgenda = idx => { navigator.clipboard.writeText(innov[idx].title + ": " + innov[idx].description); };

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 24,
      padding: 22,
      maxWidth: 1000,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 24px 0", background: "linear-gradient(90deg, #FFD700 25%, #1de682 75%)" }} />
      <h2 style={{ fontWeight: 900, marginBottom: 12 }}>
        <FaLightbulb style={{ marginRight: 8 }} /> Innovation Board
      </h2>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", margin: "18px 0 0 0" }}>
        <button style={addBtnStyle} onClick={() => setShowAdd(true)}><FaPlus /> New Innovation</button>
        <button style={btnStyle} onClick={() => setShowExport(true)}><FaFileExport /> Export</button>
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
      {/* Analytics */}
      <div style={{ display: "flex", gap: 15, flexWrap: "wrap", margin: "14px 0" }}>
        <div style={snapCard}>
          <b>Total Innovations:</b> {innov.length}
        </div>
        <div style={snapCard}>
          <b>In Pipeline:</b> {innov.filter(i => i.stage !== "Archived").length}
        </div>
        <div style={snapCard}>
          <b>High Priority:</b> {innov.filter(i => i.priority).length}
        </div>
        <div style={snapCard}>
          <b>Confidential:</b> {innov.filter(i => i.confidential).length}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ background: "#181e23", borderRadius: 12, padding: 12, minWidth: 200, minHeight: 160 }}>
          <h4 style={{ color: "#FFD700", fontSize: 15, margin: 0 }}>By Stage</h4>
          <ResponsiveContainer width={180} height={110}>
            <BarChart data={pipeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#1de682" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "#181e23", borderRadius: 10, padding: 12, minWidth: 300, minHeight: 150, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h4 style={{ color: "#FFD700", fontSize: 15, margin: 0 }}>By Area</h4>
          <ResponsiveContainer width={160} height={110}>
            <PieChart>
              <Pie
                data={areaData}
                dataKey="count"
                nameKey="area"
                outerRadius={50}
                innerRadius={10}
                label={({ area, percent }) => `${area} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {areaData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "#181e23", borderRadius: 12, padding: 12, minWidth: 240, minHeight: 160 }}>
          <h4 style={{ color: "#FFD700", fontSize: 15, margin: 0 }}>Impact/Cost Index</h4>
          <ResponsiveContainer width={200} height={110}>
            <BarChart data={impactCost}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" fontSize={10} />
              <YAxis domain={[0, 5]} fontSize={10} />
              <Tooltip />
              <Bar dataKey="impact" fill="#FFD700" />
              <Bar dataKey="cost" fill="#1de682" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11, color: "#1de682", marginTop: 2 }}>Index: Impact ÷ Cost (aim for 2.0+)</div>
        </div>
      </div>
      <div style={{ margin: "8px 0 8px 0" }}>
        <b>Filter by Stage: </b>
        <select value={showStage} onChange={e => setShowStage(e.target.value)} style={formInput}>
          <option value="All">All</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      {/* New Innovation Form */}
      {showAdd && (
        <form onSubmit={saveInnov} style={{
          background: "#232a2e",
          borderRadius: 12,
          padding: "18px 20px",
          marginBottom: 12,
          boxShadow: "0 2px 12px #FFD70018"
        }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div>
              <label style={formLabel}>Title:</label><br />
              <input required value={newInnov.title} onChange={e => setNewInnov(n => ({ ...n, title: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Area:</label><br />
              <select value={newInnov.area} onChange={e => setNewInnov(n => ({ ...n, area: e.target.value }))} style={formInput}>
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Owner:</label><br />
              <input value={newInnov.owner} onChange={e => setNewInnov(n => ({ ...n, owner: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Champion:</label><br />
              <input value={newInnov.champion} onChange={e => setNewInnov(n => ({ ...n, champion: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Impact (1-5):</label><br />
              <input type="number" min={1} max={5} value={newInnov.impact} onChange={e => setNewInnov(n => ({ ...n, impact: parseInt(e.target.value), impactIndex: ((parseInt(e.target.value) || 1)/(newInnov.cost || 1)).toFixed(2) }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Cost (1-5):</label><br />
              <input type="number" min={1} max={5} value={newInnov.cost} onChange={e => setNewInnov(n => ({ ...n, cost: parseInt(e.target.value), impactIndex: ((newInnov.impact || 1)/(parseInt(e.target.value) || 1)).toFixed(2) }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Index:</label>
              <div style={{ fontWeight: 900, color: "#1de682", marginBottom: 8 }}>{newInnov.impactIndex || 1.00}</div>
            </div>
            <div>
              <label><input type="checkbox" checked={newInnov.priority} onChange={e => setNewInnov(n => ({ ...n, priority: e.target.checked }))} /> Priority</label>
              <label><input type="checkbox" checked={newInnov.risk} onChange={e => setNewInnov(n => ({ ...n, risk: e.target.checked }))} /> At Risk</label>
              <label><input type="checkbox" checked={newInnov.confidential} onChange={e => setNewInnov(n => ({ ...n, confidential: e.target.checked }))} /> <FaShieldAlt /> Confidential</label>
            </div>
            <div>
              <label style={formLabel}>Links (comma separated):</label><br />
              <input value={newInnov.attachments.join(", ")} onChange={e => setNewInnov(n => ({ ...n, attachments: e.target.value.split(",").map(s => s.trim()) }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Related IDs:</label><br />
              <input value={newInnov.related.join(", ")} onChange={e => setNewInnov(n => ({ ...n, related: e.target.value.split(",").map(s => s.trim()) }))} style={formInput} />
            </div>
          </div>
          <div>
            <label style={formLabel}>Description/Pilot Plan:</label><br />
            <textarea value={newInnov.description} onChange={e => setNewInnov(n => ({ ...n, description: e.target.value }))} style={{ ...formInput, minWidth: 300, minHeight: 45 }} />
          </div>
          <div>
            <label style={formLabel}>Boardroom Notes:</label><br />
            <input value={newInnov.notes} onChange={e => setNewInnov(n => ({ ...n, notes: e.target.value }))} style={{ ...formInput, minWidth: 220 }} />
          </div>
          <button type="submit" style={addBtnStyle}><FaCheckCircle /> Submit</button>
          <button type="button" style={editBtnStyle} onClick={() => setShowAdd(false)}><FaTimes /> Cancel</button>
        </form>
      )}
      {/* Innovation Table */}
      <div style={{ overflowX: "auto", maxWidth: "100%", margin: "0 0 10px 0" }}>
      <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse", background: "#232a2e", borderRadius: 12 }}>
        <thead>
          <tr style={{ color: "#FFD700" }}>
            <th>ID</th>
            <th>Title</th>
            <th>Area</th>
            <th>Owner</th>
            <th>Champion</th>
            <th>Date</th>
            <th>Stage</th>
            <th>Impact</th>
            <th>Cost</th>
            <th>Index</th>
            <th>Priority</th>
            <th>Risk</th>
            <th>Conf.</th>
            <th>Files</th>
            <th>Related</th>
            <th>Days</th>
            <th>Audit Trail</th>
            <th>Votes</th>
            <th>Flow</th>
            <th>Copy</th>
          </tr>
        </thead>
        <tbody>
          {innov.filter(i => showStage === "All" || i.stage === showStage).map((i, idx) => (
            <tr key={i.id} style={{
              background: STATUS_COLORS[i.stage],
              color: STATUS_TEXT_COLORS[i.stage]
            }}>
              <td style={{ fontWeight: 800 }}>{i.id}</td>
              <td style={{ fontWeight: 800 }}>{i.title}</td>
              <td>{i.area}</td>
              <td>{i.owner}</td>
              <td>{i.champion}</td>
              <td>{i.date}</td>
              <td>{i.stage}</td>
              <td>{i.impact}</td>
              <td>{i.cost}</td>
              <td style={{ color: "#1de682", fontWeight: 800 }}>{i.impactIndex}</td>
              <td>{i.priority && <FaStar color="#FFD700" />}</td>
              <td>{i.risk && <FaExclamationTriangle color="#e82e2e" />}</td>
              <td>{i.confidential && <FaShieldAlt color="#FFD700" />}</td>
              <td>
                {(i.attachments || []).map((a, aIdx) => (
                  <div key={aIdx}>
                    <a href={a} target="_blank" rel="noopener noreferrer" style={{ color: "#1de682" }}>File {aIdx + 1}</a>
                  </div>
                ))}
                <input value={attach} onChange={e => setAttach(e.target.value)} placeholder="URL" style={formInput} />
                <button style={editBtnStyle} onClick={() => addAttachment(idx)}><FaCloudUploadAlt /></button>
              </td>
              <td>
                {(i.related || []).map((rel, rIdx) => (
                  <div key={rIdx}><FaLink /> {rel}</div>
                ))}
              </td>
              <td>
                <FaHourglass /> {daysSince(i.stageEntered)}
              </td>
              <td>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {(i.audit || []).map((a, aIdx) => (
                    <li key={aIdx} style={{ fontSize: 12 }}>{a.by}: {a.note} ({a.date})</li>
                  ))}
                </ul>
                <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Board Comment" style={formInput} />
                <input value={reviewer} onChange={e => setReviewer(e.target.value)} placeholder="Reviewer" style={formInput} />
                <button style={addBtnStyle} onClick={() => addComment(idx)}><FaPlus /> Add</button>
              </td>
              <td>
                <input value={voteRole} onChange={e => setVoteRole(e.target.value)} placeholder="Role" style={formInput} />
                <button style={addBtnStyle} onClick={() => voteOnInnov(idx, true)}><FaVoteYea /> Approve</button>
                <button style={editBtnStyle} onClick={() => voteOnInnov(idx, false)}><FaTimes /> Reject</button>
                <div style={{ fontSize: 12 }}>
                  {Object.entries(i.boardVotes || {}).map(([role, val]) =>
                    <div key={role}>{role}: {val ? "👍" : "👎"}</div>
                  )}
                </div>
              </td>
              <td>
                <button style={addBtnStyle} onClick={() => moveStage(idx, -1)} disabled={i.stage === STAGES[0]}>Back</button>
                <button style={addBtnStyle} onClick={() => moveStage(idx, 1)} disabled={i.stage === STAGES[STAGES.length - 1]}>Next</button>
              </td>
              <td>
                <button style={addBtnStyle} onClick={() => copyToAgenda(idx)}><FaCopy /> Copy</button>
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
        padding: "11px 14px",
        fontWeight: 600,
        fontSize: 14,
        marginTop: 17
      }}>
        <FaLightbulb style={{ marginRight: 7, verticalAlign: -2 }} />
        Boardroom pipeline: Ideas to action, every vote and file audit-ready. <b>Index = Impact ÷ Cost</b> (Board prioritizes 2.0+)
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
  fontSize: 16,
  padding: "6px 10px",
  margin: "0 3px",
  cursor: "pointer"
};
const addBtnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  padding: "6px 12px",
  fontWeight: 900,
  fontSize: 14,
  marginLeft: 7,
  boxShadow: "0 2px 10px #1de68244",
  cursor: "pointer"
};
const editBtnStyle = {
  background: "#FFD70022",
  color: "#FFD700",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 14,
  padding: "5px 8px",
  boxShadow: "0 1px 7px #FFD70022",
  cursor: "pointer"
};
const formInput = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 13,
  padding: "6px 7px",
  width: 85,
  marginBottom: 6
};
const snapCard = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 15,
  padding: "11px 13px",
  minWidth: 120
};
const formLabel = {
  color: "#FFD700",
  fontWeight: 800,
  fontSize: 13
};
