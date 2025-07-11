import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";
import { saveAs } from "file-saver";
import { FaUserTie, FaCheckCircle, FaExclamationTriangle, FaPaperclip, FaUserEdit, FaTags, FaHistory } from "react-icons/fa";

const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const DIRECTORS = [
  "Ana Director", "Marko Head", "Ivan Board", "Sara Board"
];

const STATUS = [
  { label: "Completed", icon: <FaCheckCircle color="#27ef7d" /> },
  { label: "In Progress", icon: <FaExclamationTriangle color="#FFD700" /> }
];

const INIT = [
  {
    id: 1,
    date: "2025-06-01",
    decision: "Approve 2025/26 youth academy budget",
    madeBy: "Board of Directors",
    impact: "Green-light for expanded U14 recruitment, 2 new staff",
    votes: [
      { director: "Josip Director", vote: "Yes", comment: "Essential for club." },
      { director: "Marko Head", vote: "Yes" }
    ],
    followup: "Report on hiring in August meeting",
    status: "Completed",
    tags: ["Finance", "Youth"],
    linkedRisk: "1",
    files: [],
    signoffs: [
      { name: "Josip Director", date: "2025-06-01 11:41" }
    ],
    history: []
  }
];

const VOTE_OPTIONS = ["Yes", "No", "Abstain"];
const ALL_TAGS = ["Finance", "Youth", "Personnel", "Recruitment", "Risk", "Governance", "Facilities", "Policy"];

const BoardroomDecisionLog = () => {
  const [log, setLog] = useState(INIT);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null); // id
  const [historyView, setHistoryView] = useState(null); // id
  const [filterTag, setFilterTag] = useState("All");
  const [form, setForm] = useState({
    date: "", decision: "", madeBy: "", impact: "", votes: [], followup: "",
    status: "In Progress", files: [], signoffs: [], tags: [], linkedRisk: "", history: []
  });
  const [active, setActive] = useState(null); // id of entry being voted/signed/attached
  const [vote, setVote] = useState({ director: DIRECTORS[0], vote: "Yes", comment: "" });
  const [signer, setSigner] = useState(DIRECTORS[0]);
  const [upload, setUpload] = useState(null);
  const logRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => logRef.current,
    documentTitle: `CourtEvoVero_BoardLog_${new Date().toISOString().slice(0, 10)}`
  });

  // Add new decision
  const addEntry = e => {
    e.preventDefault();
    setLog([
      { ...form, id: Date.now(), votes: [], signoffs: [], files: [], tags: form.tags || [], history: [] },
      ...log
    ]);
    setAdding(false);
    setForm({
      date: "", decision: "", madeBy: "", impact: "", votes: [], followup: "", status: "In Progress",
      files: [], signoffs: [], tags: [], linkedRisk: "", history: []
    });
  };

  // Edit existing decision (tracks previous version in history)
  const saveEdit = () => {
    setLog(log =>
      log.map(entry =>
        entry.id === editing
          ? {
              ...form,
              history: [
                ...(entry.history || []),
                { ...entry, savedAt: new Date().toLocaleString() }
              ]
            }
          : entry
      )
    );
    setEditing(null);
    setForm({
      date: "", decision: "", madeBy: "", impact: "", votes: [], followup: "", status: "In Progress",
      files: [], signoffs: [], tags: [], linkedRisk: "", history: []
    });
  };

  // Download attachment
  const downloadFile = (file) => {
    const arr = file.data.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    saveAs(new Blob([u8arr], { type: mime }), file.name);
  };

  // Attach file
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setLog(l =>
        l.map(entry =>
          entry.id === upload
            ? {
                ...entry,
                files: [
                  ...entry.files,
                  { name: file.name, data: ev.target.result }
                ]
              }
            : entry
        )
      );
      setUpload(null);
    };
    reader.readAsDataURL(file);
  };

  // Add vote
  const handleAddVote = () => {
    setLog(l =>
      l.map(entry =>
        entry.id === active
          ? {
              ...entry,
              votes: [...(entry.votes || []), { ...vote }]
            }
          : entry
      )
    );
    setVote({ director: DIRECTORS[0], vote: "Yes", comment: "" });
    setActive(null);
  };

  // Add signoff
  const handleAddSignoff = () => {
    setLog(l =>
      l.map(entry =>
        entry.id === active
          ? {
              ...entry,
              signoffs: [...(entry.signoffs || []), { name: signer, date: new Date().toLocaleString() }]
            }
          : entry
      )
    );
    setActive(null);
  };

  // Start editing a decision
  const startEdit = entry => {
    setEditing(entry.id);
    setForm({ ...entry, history: entry.history || [] });
  };

  // Add or remove a tag in edit/add
  const toggleTag = tag => {
    setForm(f =>
      f.tags.includes(tag)
        ? { ...f, tags: f.tags.filter(t => t !== tag) }
        : { ...f, tags: [...(f.tags || []), tag] }
    );
  };

  // Tag filtering
  const filteredLog = filterTag === "All"
    ? log
    : log.filter(e => (e.tags || []).includes(filterTag));

  return (
    <div style={{ width: "100%", maxWidth: 1120, margin: "0 auto", padding: 0 }}>
      <motion.section
        ref={logRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 700, marginBottom: 18 }}>
          Boardroom Decision Log
        </h2>
        <div style={{ marginBottom: 18, textAlign: "center", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => setAdding(true)}
            style={{
              background: "#27ef7d",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "8px 22px",
              fontSize: 17,
              cursor: "pointer"
            }}>
            + Add Decision
          </button>
          <span style={{ fontWeight: 700, color: "#FFD700", fontSize: 17 }}><FaTags /> Filter by tag:</span>
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ fontWeight: 600, fontSize: 16, padding: 7, borderRadius: 5 }}>
            <option>All</option>
            {ALL_TAGS.map(tag => <option key={tag}>{tag}</option>)}
          </select>
        </div>
        <div style={{ overflowX: "auto", marginBottom: 18 }}>
          <table style={{ width: "100%", borderSpacing: 0, color: "#fff" }}>
            <thead>
              <tr style={{ background: "#FFD70022" }}>
                <th style={{ padding: 9 }}>Date</th>
                <th>Decision</th>
                <th>Tags</th>
                <th>Made By</th>
                <th>Impact/Reason</th>
                <th>Votes</th>
                <th>Attachments</th>
                <th>Sign-offs</th>
                <th>Risk</th>
                <th>Follow-up</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLog.map(entry => (
                <tr key={entry.id}
                  style={{
                    background: entry.status === "Completed" ? "#27ef7d22" : "#FFD70022"
                  }}>
                  <td style={{ padding: 8 }}>{entry.date}</td>
                  <td style={{ padding: 8 }}>{entry.decision}</td>
                  <td style={{ padding: 8 }}>
                    {(entry.tags || []).map(tag =>
                      <span key={tag} style={{
                        background: "#FFD700",
                        color: "#222",
                        fontWeight: 700,
                        borderRadius: 5,
                        padding: "2px 8px",
                        marginRight: 5,
                        fontSize: 14
                      }}>{tag}</span>
                    )}
                  </td>
                  <td style={{ padding: 8 }}>
                    <FaUserTie style={{ fontSize: 16, marginRight: 4 }} />
                    {entry.madeBy}
                  </td>
                  <td style={{ padding: 8 }}>{entry.impact}</td>
                  <td style={{ padding: 8 }}>
                    {(entry.votes || []).map((v, i) =>
                      <div key={i} style={{ color: v.vote === "Yes" ? "#27ef7d" : v.vote === "No" ? "#e94057" : "#FFD700", fontWeight: 600, fontSize: 15 }}>
                        {v.director}: {v.vote}
                        {v.comment && <span style={{ color: "#fff", fontWeight: 400, marginLeft: 5, fontSize: 13 }}>({v.comment})</span>}
                      </div>
                    )}
                    <button onClick={() => setActive(entry.id)}
                      style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 4, fontWeight: 700, padding: "3px 9px", marginTop: 5, fontSize: 15, cursor: "pointer" }}>
                      Add Vote
                    </button>
                  </td>
                  <td style={{ padding: 8 }}>
                    {(entry.files || []).map((f, i) =>
                      <div key={i} style={{ marginBottom: 5, color: "#FFD700", fontSize: 15, cursor: "pointer" }}
                        onClick={() => downloadFile(f)} title="Download">
                        <FaPaperclip style={{ marginRight: 6, marginBottom: -2 }} />{f.name}
                      </div>
                    )}
                    <button onClick={() => setUpload(entry.id)}
                      style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 4, fontWeight: 700, padding: "3px 9px", fontSize: 15, cursor: "pointer" }}>
                      Attach
                    </button>
                  </td>
                  <td style={{ padding: 8 }}>
                    {(entry.signoffs || []).map((s, i) =>
                      <div key={i} style={{ color: "#27ef7d", fontWeight: 600, fontSize: 15 }}>
                        <FaUserEdit style={{ marginRight: 5, fontSize: 15 }} />
                        {s.name} <span style={{ color: "#FFD700", fontSize: 13 }}>({s.date})</span>
                      </div>
                    )}
                    <button onClick={() => setActive(entry.id)}
                      style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 4, fontWeight: 700, padding: "3px 9px", fontSize: 15, cursor: "pointer" }}>
                      Sign
                    </button>
                  </td>
                  <td style={{ padding: 8 }}>{entry.linkedRisk ? `Risk #${entry.linkedRisk}` : ""}</td>
                  <td style={{ padding: 8 }}>{entry.followup}</td>
                  <td style={{ padding: 8, fontWeight: 600 }}>
                    {STATUS.find(s => s.label === entry.status)?.icon}
                    {entry.status}
                  </td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => startEdit(entry)}
                      style={{
                        background: "#FFD700", color: "#222", border: "none", borderRadius: 5, fontWeight: 700,
                        padding: "3px 8px", fontSize: 14, marginRight: 4, cursor: "pointer"
                      }}>Edit</button>
                    <button onClick={() => setHistoryView(entry.id)}
                      style={{
                        background: "#48b5ff", color: "#222", border: "none", borderRadius: 5, fontWeight: 700,
                        padding: "3px 8px", fontSize: 14, cursor: "pointer"
                      }}><FaHistory /> History</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            onClick={handlePrint}
            style={{
              background: "#FFD700",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "8px 18px",
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 2px 8px #FFD70033",
              marginBottom: 12
            }}
          >
            Export Decision Log (PDF)
          </button>
        </div>
      </motion.section>

      {/* Add/Edit Decision Modal */}
      {(adding || editing) && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.92)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={e => { e.preventDefault(); editing ? saveEdit() : addEntry(e); }}
            style={{
              background: "#fff", color: "#222", padding: 26, borderRadius: 15, minWidth: 420
            }}>
            <h3 style={{ color: "#FFD700", fontSize: 19, marginBottom: 10 }}>{editing ? "Edit Decision" : "New Board Decision"}</h3>
            <label>Date:<br />
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 4 }} required />
            </label>
            <label>Decision:<br />
              <input type="text" value={form.decision} onChange={e => setForm(f => ({ ...f, decision: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 4 }} required />
            </label>
            <label>Tags:<br />
              <div style={{ marginBottom: 7 }}>
                {ALL_TAGS.map(tag =>
                  <span
                    key={tag}
                    style={{
                      background: form.tags?.includes(tag) ? "#FFD700" : "#eee",
                      color: form.tags?.includes(tag) ? "#222" : "#666",
                      borderRadius: 5,
                      fontWeight: 700,
                      padding: "3px 10px",
                      marginRight: 6,
                      marginBottom: 4,
                      fontSize: 14,
                      cursor: "pointer",
                      border: "1px solid #FFD700"
                    }}
                    onClick={() => toggleTag(tag)}
                  >{tag}</span>
                )}
              </div>
            </label>
            <label>Linked Risk (ID or Summary):<br />
              <input type="text" value={form.linkedRisk} onChange={e => setForm(f => ({ ...f, linkedRisk: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 4 }} />
            </label>
            <label>Made By:<br />
              <input type="text" value={form.madeBy} onChange={e => setForm(f => ({ ...f, madeBy: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 4 }} required />
            </label>
            <label>Impact/Reason:<br />
              <input type="text" value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 4 }} />
            </label>
            <label>Votes/Consensus:<br />
              <input type="text" value={form.votesConsensus || ""} onChange={e => setForm(f => ({ ...f, votesConsensus: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 4 }} />
            </label>
            <label>Follow-up/Action:<br />
              <input type="text" value={form.followup} onChange={e => setForm(f => ({ ...f, followup: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7, marginBottom: 4 }} />
            </label>
            <label>Status:<br />
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 6, borderRadius: 7 }}>
                {STATUS.map(s => <option key={s.label}>{s.label}</option>)}
              </select>
            </label>
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <button
                type="submit"
                style={{
                  background: "#27ef7d", color: "#222", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16
                }}>{editing ? "Save Edit" : "Save"}</button>
              <button
                type="button"
                onClick={() => { setAdding(false); setEditing(null); }}
                style={{
                  background: "#e94057", color: "#fff", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16, marginLeft: 7
                }}
              >Cancel</button>
            </div>
            {editing && form.history && form.history.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <button type="button" style={{
                  background: "#48b5ff", color: "#222", border: "none", borderRadius: 5, fontWeight: 700,
                  padding: "3px 8px", fontSize: 14, cursor: "pointer"
                }} onClick={() => setHistoryView(editing)}><FaHistory /> Show Version History</button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Vote Modal */}
      {active && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.92)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={e => { e.preventDefault(); handleAddVote(); }}
            style={{
              background: "#fff", color: "#222", padding: 26, borderRadius: 15, minWidth: 320
            }}>
            <h3 style={{ color: "#FFD700", fontSize: 19, marginBottom: 10 }}>Add Board Vote</h3>
            <label>Director:<br />
              <select value={vote.director} onChange={e => setVote(v => ({ ...v, director: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 7, borderRadius: 7, marginBottom: 8 }}>
                {DIRECTORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>Vote:<br />
              <select value={vote.vote} onChange={e => setVote(v => ({ ...v, vote: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 7, borderRadius: 7, marginBottom: 8 }}>
                {VOTE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </label>
            <label>Comment:<br />
              <input type="text" value={vote.comment} onChange={e => setVote(v => ({ ...v, comment: e.target.value }))}
                style={{ width: "100%", fontSize: 16, padding: 7, borderRadius: 7, marginBottom: 8 }} />
            </label>
            <div style={{ textAlign: "right" }}>
              <button type="submit"
                style={{
                  background: "#27ef7d", color: "#222", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16
                }}>Save</button>
              <button type="button" onClick={() => setActive(null)}
                style={{
                  background: "#e94057", color: "#fff", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16, marginLeft: 7
                }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Attach Modal */}
      {upload && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.92)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <form
            style={{
              background: "#fff", color: "#222", padding: 26, borderRadius: 15, minWidth: 320
            }}>
            <h3 style={{ color: "#FFD700", fontSize: 19, marginBottom: 10 }}>Attach Document</h3>
            <input type="file" onChange={handleFile}
              style={{ marginBottom: 14, fontSize: 16 }} />
            <div style={{ textAlign: "right" }}>
              <button type="button" onClick={() => setUpload(null)}
                style={{
                  background: "#e94057", color: "#fff", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16
                }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Signoff Modal */}
      {active && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.92)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={e => { e.preventDefault(); handleAddSignoff(); }}
            style={{
              background: "#fff", color: "#222", padding: 26, borderRadius: 15, minWidth: 320
            }}>
            <h3 style={{ color: "#FFD700", fontSize: 19, marginBottom: 10 }}>Sign Decision</h3>
            <label>Director:<br />
              <select value={signer} onChange={e => setSigner(e.target.value)}
                style={{ width: "100%", fontSize: 16, padding: 7, borderRadius: 7, marginBottom: 8 }}>
                {DIRECTORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <div style={{ textAlign: "right" }}>
              <button type="submit"
                style={{
                  background: "#27ef7d", color: "#222", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16
                }}>Sign</button>
              <button type="button" onClick={() => setActive(null)}
                style={{
                  background: "#e94057", color: "#fff", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16, marginLeft: 7
                }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* History Modal */}
      {historyView && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(24,36,51,0.93)", zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", color: "#222", padding: 24, borderRadius: 13, minWidth: 390, maxWidth: 540
          }}>
            <h3 style={{ color: "#FFD700", fontSize: 19, marginBottom: 10 }}>Version History</h3>
            <ul style={{ fontSize: 15, maxHeight: 320, overflowY: "auto" }}>
              {(log.find(e => e.id === historyView)?.history || []).length === 0
                ? <li>No prior versions—edit decision to save history.</li>
                : (log.find(e => e.id === historyView)?.history || []).map((ver, i) => (
                  <li key={i} style={{ marginBottom: 11 }}>
                    <b>Saved:</b> {ver.savedAt || "—"}<br />
                    <b>Date:</b> {ver.date}<br />
                    <b>Decision:</b> {ver.decision}<br />
                    <b>Tags:</b> {(ver.tags || []).join(", ")}<br />
                    <b>Risk:</b> {ver.linkedRisk}<br />
                    <b>Status:</b> {ver.status}
                  </li>
                ))
              }
            </ul>
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setHistoryView(null)}
                style={{
                  background: "#FFD700", color: "#222", border: "none", borderRadius: 6,
                  padding: "7px 18px", fontWeight: 700, fontSize: 16, marginTop: 7
                }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardroomDecisionLog;
