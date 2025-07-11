import React, { useState } from "react";
import {
  FaCrown, FaComments, FaRobot, FaLightbulb, FaCheckCircle, FaTimes, FaFileExport, FaUserTie, FaArrowRight, FaPlus, FaChartLine, FaUserEdit, FaUsers, FaLink, FaHistory
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };
const BOARD = [
  { name: "President", influence: 9 },
  { name: "GM", influence: 8 },
  { name: "Legal", influence: 7 },
  { name: "Youth Dir", influence: 6 },
  { name: "Finance", influence: 8 }
];

const STATUS = {
  "Open": "#FFD700",
  "Closed": "#1de682",
  "In Progress": "#FFD700bb",
  "Blocked": "#ff4848"
};
const BIAS_TYPES = ["Groupthink", "Recency", "Missing Data", "Overconfidence", "Risk Aversion"];

function aiBiasDetect(thread) {
  // Extremely simplified (real AI would analyze much deeper)
  let bias = [];
  if (!thread.evidence.length) bias.push("Missing Data");
  if (thread.pro && thread.con && thread.pro.length - thread.con.length > 30) bias.push("Overconfidence");
  if (thread.pro && thread.pro.includes("everyone")) bias.push("Groupthink");
  if ((thread.history || []).length > 3) bias.push("Recency");
  if (thread.status === "Blocked") bias.push("Risk Aversion");
  return bias;
}
function aiDigest(threads) {
  // World-first: Boardroom digest of issues and risks
  let open = threads.filter(t => t.status === "Open");
  let closed = threads.filter(t => t.status === "Closed");
  let blocked = threads.filter(t => t.status === "Blocked");
  return `Digest: ${open.length} open, ${closed.length} closed, ${blocked.length} blocked threads. Key open: ${open.map(t => t.topic).join(", ")}. Immediate action: ${blocked.map(t => t.topic).join(", ")}.`;
}

// Main component
const BoardroomAISensemakingArena = () => {
  const [threads, setThreads] = useState([
    {
      id: 1,
      topic: "Foreign player quota for 2025/26",
      scenario: "FIBA reduces non-EU limit from 2 to 1",
      evidence: ["FIBA agenda leak", "Croatian clubs protest", "League lawyer memo"],
      pro: "Greater domestic minutes; easier for youth",
      con: "Sponsorship threat; loss of competitive edge",
      ai: "AI: Must model squad and finance; risk 8/10; recommend proactive lobbying",
      action: "Board to prepare impact memo for meeting with federation",
      owner: "President",
      status: "Open",
      history: [],
      dependencies: [],
      votes: { President: "Approve", GM: "Block", Legal: "Abstain", "Youth Dir": "Approve", Finance: "Block" },
      completion: 35
    },
    {
      id: 2,
      topic: "Youth player transfer rule reform",
      scenario: "Federation proposes tighter junior contracts",
      evidence: ["Legal draft", "Parent group protest", "Agent feedback"],
      pro: "More stability for development; less poaching",
      con: "May limit flexibility; could backfire with top talents",
      ai: "AI: More data on outflows; monitor UEFA; risk 7/10; seek legal opinion",
      action: "Legal to prepare options, Board to schedule forum with parents",
      owner: "Legal",
      status: "Blocked",
      history: [],
      dependencies: [1],
      votes: { President: "Approve", GM: "Abstain", Legal: "Block", "Youth Dir": "Approve", Finance: "Approve" },
      completion: 10
    }
  ]);
  const [addMode, setAddMode] = useState(false);
  const [newThread, setNewThread] = useState({ topic: "", scenario: "", evidence: [], pro: "", con: "", ai: "", action: "", owner: BOARD[0].name, status: "Open", votes: {}, history: [], dependencies: [], completion: 0 });
  const [selected, setSelected] = useState(null);
  const [log, setLog] = useState([{ txt: "Board reviewed all threads for bias and blockers.", by: "AI", date: "2024-06-12" }]);
  const [logText, setLogText] = useState("");
  const [digest, setDigest] = useState(aiDigest(threads));
  const [voting, setVoting] = useState({});
  const [depLink, setDepLink] = useState({ from: "", to: "" });
  const [timelineMode, setTimelineMode] = useState(false);

  // Add thread
  const addThread = () => {
    if (!newThread.topic || !newThread.scenario) return;
    setThreads([
      ...threads,
      { ...newThread, id: threads.length ? Math.max(...threads.map(t => t.id)) + 1 : 1 }
    ]);
    setAddMode(false);
    setNewThread({ topic: "", scenario: "", evidence: [], pro: "", con: "", ai: "", action: "", owner: BOARD[0].name, status: "Open", votes: {}, history: [], dependencies: [], completion: 0 });
  };
  const closeThread = idx => setThreads(threads.map((t, i) => i === idx ? { ...t, status: "Closed" } : t));
  const blockThread = idx => setThreads(threads.map((t, i) => i === idx ? { ...t, status: "Blocked" } : t));
  const setCompletion = (idx, pct) => setThreads(threads.map((t, i) => i === idx ? { ...t, completion: pct } : t));
  const voteOnThread = (idx, member, vote) => setThreads(threads.map((t, i) =>
    i === idx ? { ...t, votes: { ...t.votes, [member]: vote } } : t
  ));
  // Thread dependencies
  const linkThreads = () => {
    let fromIdx = threads.findIndex(t => t.id === Number(depLink.from));
    let toIdx = threads.findIndex(t => t.id === Number(depLink.to));
    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
      setThreads(threads.map((t, i) =>
        i === fromIdx ? { ...t, dependencies: [...new Set([...(t.dependencies || []), Number(depLink.to)])] } : t
      ));
    }
    setDepLink({ from: "", to: "" });
  };

  // Export CSV
  function exportCSV() {
    let csv = ["Topic,Scenario,Evidence,Pro,Con,AI Insights,Action,Owner,Status,Completion,Dependencies,Votes"];
    threads.forEach(t =>
      csv.push([t.topic, t.scenario, t.evidence.join("|"), t.pro, t.con, t.ai, t.action, t.owner, t.status, t.completion + "%", (t.dependencies || []).join("|"), Object.entries(t.votes || {}).map(([k, v]) => `${k}:${v}`).join("|")].join(","))
    );
    csv.push("\nLog:");
    log.forEach(l => csv.push([l.date, l.by, l.txt].join(",")));
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "boardroom_ai_sensemaking_elite.csv";
    a.click(); URL.revokeObjectURL(url);
  }
  // Log
  const addLog = () => {
    if (!logText.trim()) return;
    setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10) }]);
    setLogText("");
  };

  // --- UI ---
  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1700, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12 }}>
        <FaCrown size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Boardroom AI Sensemaking Arena
        </h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | Board Intelligence
        </span>
        <button onClick={exportCSV} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 16 }}><FaFileExport style={{ marginRight: 5 }} /> Export CSV</button>
        <button onClick={() => setTimelineMode(m => !m)} style={{ ...btnStyle, background: "#FFD70044", color: "#FFD700", marginLeft: 8 }}><FaHistory style={{ marginRight: 5 }} /> {timelineMode ? "Hide Timeline" : "Show Timeline"}</button>
      </div>
      {/* Boardroom Digest */}
      <div style={{
        background: "#FFD70011", color: "#FFD700", borderRadius: 12,
        padding: 10, fontWeight: 800, marginBottom: 13, fontSize: 17, letterSpacing: 1
      }}>{aiDigest(threads)}</div>
      {/* Thread Dependency Visual */}
      <div style={{ marginBottom: 15, display: "flex", gap: 14, alignItems: "center" }}>
        <FaLink color="#FFD700" size={19} />
        <select value={depLink.from} onChange={e => setDepLink({ ...depLink, from: e.target.value })} style={inputStyleMini}>
          <option value="">Select thread</option>
          {threads.map(t => <option key={t.id} value={t.id}>{t.topic}</option>)}
        </select>
        <span style={{ color: "#FFD700", fontWeight: 600 }}>depends on</span>
        <select value={depLink.to} onChange={e => setDepLink({ ...depLink, to: e.target.value })} style={inputStyleMini}>
          <option value="">Select thread</option>
          {threads.map(t => <option key={t.id} value={t.id}>{t.topic}</option>)}
        </select>
        <button onClick={linkThreads} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Link Threads</button>
      </div>
      {/* Add Thread */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setAddMode(a => !a)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginBottom: 8 }}>
          <FaPlus /> {addMode ? "Cancel" : "Add Thread"}
        </button>
        {addMode &&
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 9 }}>
            <input value={newThread.topic} placeholder="Thread Topic" onChange={e => setNewThread({ ...newThread, topic: e.target.value })} style={inputStyle} />
            <input value={newThread.scenario} placeholder="Scenario" onChange={e => setNewThread({ ...newThread, scenario: e.target.value })} style={inputStyle} />
            <input value={newThread.evidence.join(", ")} placeholder="Evidence (comma separated)" onChange={e => setNewThread({ ...newThread, evidence: e.target.value.split(",").map(x => x.trim()) })} style={inputStyle} />
            <input value={newThread.pro} placeholder="Pro" onChange={e => setNewThread({ ...newThread, pro: e.target.value })} style={inputStyleMini} />
            <input value={newThread.con} placeholder="Con" onChange={e => setNewThread({ ...newThread, con: e.target.value })} style={inputStyleMini} />
            <input value={newThread.owner} placeholder="Owner" onChange={e => setNewThread({ ...newThread, owner: e.target.value })} style={inputStyleMini} />
            <button onClick={addThread} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
          </div>
        }
      </div>
      {/* Thread Table */}
      <div style={{ marginBottom: 11, borderRadius: 13, background: "#181e23", padding: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff" }}>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Scenario</th>
              <th>Evidence</th>
              <th>Pro</th>
              <th>Con</th>
              <th>AI Bias Radar</th>
              <th>Votes</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Completion</th>
              <th>Dependencies</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {threads.map((t, i) => (
              <tr key={i} style={{ background: STATUS[t.status] + "22", transition: "background 0.3s" }}>
                <td>{t.topic}</td>
                <td>{t.scenario}</td>
                <td>{(t.evidence || []).map((ev, j) => <span key={j} style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, padding: "1px 8px", margin: "0 2px", fontSize: 12 }}>{ev}</span>)}</td>
                <td>{t.pro}</td>
                <td>{t.con}</td>
                <td style={{ color: "#ff4848", fontWeight: 700 }}>{aiBiasDetect(t).join(", ") || "-"}</td>
                <td>
                  {BOARD.map(m => (
                    <span key={m.name}>
                      <FaUserTie style={{ fontSize: 15, marginRight: 3, color: "#FFD700" }} />{m.name[0]}:
                      <select
                        value={t.votes?.[m.name] || ""}
                        onChange={e => voteOnThread(i, m.name, e.target.value)}
                        style={{ ...inputStyleMini, width: 52, marginRight: 3 }}
                      >
                        <option value="">-</option>
                        <option value="Approve">Approve</option>
                        <option value="Block">Block</option>
                        <option value="Abstain">Abstain</option>
                      </select>
                    </span>
                  ))}
                </td>
                <td>
                  <span style={{
                    background: STATUS[t.status], color: "#232a2e",
                    fontWeight: 700, borderRadius: 7, padding: "1px 12px", fontSize: 13
                  }}>{t.status}</span>
                  {t.status !== "Closed" &&
                    <button onClick={() => closeThread(i)} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 3 }}><FaCheckCircle /></button>
                  }
                  {t.status !== "Blocked" &&
                    <button onClick={() => blockThread(i)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", marginLeft: 3 }}><FaTimes /></button>
                  }
                </td>
                <td>{t.owner}</td>
                <td>
                  <input
                    type="range" min={0} max={100} value={t.completion}
                    onChange={e => setCompletion(i, Number(e.target.value))}
                    style={{ width: 66, accentColor: "#FFD700" }}
                  />{" "}
                  <span style={{
                    background: t.completion === 100 ? "#1de682" : t.completion > 50 ? "#FFD700" : "#ff4848",
                    color: "#232a2e", fontWeight: 700, borderRadius: 7, padding: "1px 7px"
                  }}>{t.completion}%</span>
                </td>
                <td>
                  {(t.dependencies || []).map((d, j) =>
                    <span key={j} style={{
                      background: "#FFD70022", color: "#FFD700", borderRadius: 7,
                      padding: "1px 7px", fontSize: 12, marginRight: 2
                    }}>#{d}</span>
                  )}
                </td>
                <td>
                  <button onClick={() => setSelected(i)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Timeline mode */}
      {timelineMode &&
        <div style={{ marginBottom: 15, background: "#FFD70022", borderRadius: 11, padding: 13 }}>
          <b style={{ color: "#FFD700" }}><FaHistory style={{ marginRight: 7 }} /> Decision Timeline (All Threads)</b>
          <ul>
            {threads.map((t, i) =>
              <li key={i} style={{ marginBottom: 3 }}>
                <span style={{ color: "#FFD700", fontWeight: 700 }}>{t.topic}:</span> {t.history && t.history.length
                  ? t.history.map((h, j) => <span key={j} style={{ color: "#1de682", marginRight: 6 }}>{h.date}: {h.action}</span>)
                  : <span style={{ color: "#FFD70099" }}>No timeline yet</span>}
              </li>
            )}
          </ul>
        </div>
      }
      {/* Thread detail drawer */}
      {selected !== null &&
        <div style={{ marginBottom: 11, background: "#283E51", borderRadius: 13, padding: 14 }}>
          <b style={{ color: "#FFD700" }}>Thread:</b> {threads[selected]?.topic}<br />
          <span style={{ color: "#FFD70099" }}>Scenario: {threads[selected]?.scenario}</span><br />
          <span style={{ color: "#FFD70099" }}>Action: {threads[selected]?.action}</span><br />
          <span style={{ color: "#FFD70099" }}>AI: {threads[selected]?.ai}</span>
          <div style={{ marginTop: 7 }}>
            <b>Thread Timeline:</b>
            <ul>
              {(threads[selected].history || []).map((h, j) =>
                <li key={j}>{h.date}: {h.action}</li>
              )}
            </ul>
            <button onClick={() => setSelected(null)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 7 }}>Close</button>
          </div>
        </div>
      }
      {/* Boardroom Log */}
      <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, marginBottom: 5 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaComments style={{ marginRight: 7 }} /> Boardroom Log</div>
        <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
          {log.map((c, i) =>
            <div key={i}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt}
              <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={logText} placeholder="Add board note or action..." onChange={e => setLogText(e.target.value)} style={inputStyleFull} />
          <button onClick={addLog} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
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
  ...inputStyle, width: 65, fontSize: 14, marginRight: 0, marginBottom: 2
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default BoardroomAISensemakingArena;
