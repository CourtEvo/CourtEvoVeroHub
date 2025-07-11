import React, { useState } from "react";
import { FaSignature, FaUserTie, FaClipboardCheck, FaArrowRight, FaCheckCircle, FaTrash, 
  FaExclamationTriangle, FaClock, FaComments, FaChevronDown, FaChevronUp, FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNowStrict, parseISO, isBefore } from "date-fns";

const BOARD = [
  { name: "M. Proleta", role: "President" },
  { name: "S. Savović", role: "Board" },
  { name: "N. Petrov", role: "Finance" }
];

const INIT = [
  { id: 1, text: "Sign Nike renewal", assignee: "M. Proleta", status: "To Do", needsSignature: true, signatures: [], due: "2025-06-21", priority: "High", comments: [], log: [] },
  { id: 2, text: "Approve Playoff Load Plan", assignee: "N. Petrov", status: "In Progress", needsSignature: false, signatures: [], due: "2025-06-23", priority: "Normal", comments: [], log: [] },
  { id: 3, text: "Review Injury Report", assignee: "S. Savović", status: "To Do", needsSignature: true, signatures: [], due: "2025-06-20", priority: "Low", comments: [], log: [] }
];

const STATUSES = ["To Do", "In Progress", "Completed", "Board Sign-Off"];
const PRIORITIES = ["High", "Normal", "Low"];
const priorityColor = prio =>
  prio === "High" ? "#F87171"
  : prio === "Normal" ? "#FFD700"
  : "#1de682";
const statusColor = stat =>
  stat === "To Do" ? "#FFD700"
  : stat === "In Progress" ? "#1de682"
  : stat === "Completed" ? "#A3E635"
  : "#00B4D8";

// --- Helper
function daysDiff(due) {
  const date = parseISO(due + "T12:00:00");
  const now = new Date();
  const diff = formatDistanceToNowStrict(date, { addSuffix: true });
  const overdue = isBefore(date, now);
  return { diff, overdue };
}

export default function BoardroomDnDPipeline() {
  const [actions, setActions] = useState(INIT);
  const [dragged, setDragged] = useState(null);
  const [showSig, setShowSig] = useState({});
  const [details, setDetails] = useState(null);
  const [filter, setFilter] = useState("");
  const [showLogs, setShowLogs] = useState({});

  // DnD logic
  function onDragStart(id) { setDragged(id); }
  function onDrop(status) {
    if (dragged == null) return;
    setActions(a =>
      a.map(x =>
        x.id === dragged
          ? {
              ...x,
              status,
              log: [
                { ts: new Date().toISOString(), event: `Moved to ${status}` },
                ...x.log
              ]
            }
          : x
      )
    );
    setDragged(null);
  }

  // Signature logic
  function signAction(id, member) {
    setActions(a =>
      a.map(x =>
        x.id === id
          ? {
              ...x,
              signatures: x.signatures.includes(member.name)
                ? x.signatures
                : [...x.signatures, member.name],
              log: [
                { ts: new Date().toISOString(), event: `Signed by ${member.name}` },
                ...x.log
              ]
            }
          : x
      )
    );
    setShowSig(s => ({ ...s, [id]: false }));
  }

  // Priority toggle
  function togglePriority(id) {
    setActions(a =>
      a.map(x =>
        x.id === id
          ? {
              ...x,
              priority:
                x.priority === "High"
                  ? "Normal"
                  : x.priority === "Normal"
                  ? "Low"
                  : "High",
              log: [
                { ts: new Date().toISOString(), event: `Priority set to ${x.priority === "High" ? "Normal" : x.priority === "Normal" ? "Low" : "High"}` },
                ...x.log
              ]
            }
          : x
      )
    );
  }

  // Comment
  function addComment(id, text) {
    if (!text) return;
    setActions(a =>
      a.map(x =>
        x.id === id
          ? {
              ...x,
              comments: [
                ...x.comments,
                { author: "Board", text, ts: new Date().toISOString() }
              ],
              log: [
                { ts: new Date().toISOString(), event: "Comment added" },
                ...x.log
              ]
            }
          : x
      )
    );
  }

  // Filter/search
  const filtered = actions.filter(
    a =>
      a.text.toLowerCase().includes(filter.toLowerCase()) ||
      a.assignee.toLowerCase().includes(filter.toLowerCase()) ||
      a.status.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{
      minHeight: "88vh",
      background: "linear-gradient(135deg, #232a2e 0%, #181e23 100%)",
      fontFamily: "Segoe UI, sans-serif",
      padding: 32
    }}>
      <div style={{ fontWeight: 900, fontSize: 38, color: "#FFD700", marginBottom: 18, letterSpacing: 1.5 }}>
        <FaClipboardCheck style={{ color: "#1de682", fontSize: 35, marginRight: 17 }} />
        Boardroom Action Pipeline (Drag & Sign)
      </div>
      <div style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
        <FaSearch style={{ color: "#FFD700", fontSize: 20 }} />
        <input
          placeholder="Filter by action, assignee, or status…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "none",
            fontSize: 16,
            background: "#232e3b",
            color: "#FFD700",
            fontWeight: 700,
            width: 270
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 30, justifyContent: "stretch", flexWrap: "wrap" }}>
        {STATUSES.map(status => (
          <div key={status}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(status)}
            style={{
              flex: 1,
              background: "#232a2e",
              borderRadius: 17,
              border: "3px solid " + (status === "Board Sign-Off" ? "#FFD700" : "#1de682"),
              padding: 18,
              minHeight: 410,
              boxShadow: "0 2px 18px #FFD70014",
              marginBottom: 14
            }}>
            <div style={{ color: statusColor(status), fontWeight: 900, fontSize: 18, marginBottom: 11 }}>
              {status}
            </div>
            {filtered.filter(a => a.status === status).length === 0 && (
              <div style={{ color: "#FFD70033", textAlign: "center", marginTop: 28, fontWeight: 700, fontSize: 15 }}>
                (Empty)
              </div>
            )}
            {filtered.filter(a => a.status === status).map(a => {
              const { diff, overdue } = daysDiff(a.due);
              return (
                <motion.div
                  key={a.id}
                  draggable
                  onDragStart={() => onDragStart(a.id)}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    background: "#181e23",
                    border: "2px solid #FFD70044",
                    borderRadius: 12,
                    padding: "13px 14px",
                    boxShadow: "0 1px 8px #FFD70012",
                    cursor: "grab",
                    marginBottom: 11,
                    position: "relative"
                  }}>
                  {/* Main row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17 }}>
                      {a.text}
                    </div>
                    {/* Priority chip */}
                    <button
                      onClick={() => togglePriority(a.id)}
                      title="Toggle priority"
                      style={{
                        background: priorityColor(a.priority),
                        color: "#232a2e",
                        fontWeight: 800,
                        fontSize: 13,
                        padding: "2px 11px",
                        border: "none",
                        borderRadius: 9,
                        marginLeft: 6,
                        cursor: "pointer"
                      }}
                    >{a.priority}</button>
                    {/* Days left/overdue */}
                    <div title="Due date" style={{
                      color: overdue ? "#F87171" : "#1de682",
                      fontWeight: 800,
                      marginLeft: 8,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center"
                    }}>
                      <FaClock style={{ marginRight: 3 }} />
                      {diff}
                      {overdue && <FaExclamationTriangle style={{ color: "#F87171", marginLeft: 4 }} />}
                    </div>
                  </div>
                  {/* Assigned */}
                  <div style={{ color: "#1de682", fontWeight: 700, marginTop: 2, fontSize: 14 }}>
                    Assigned: {a.assignee}
                  </div>
                  {/* Status chip */}
                  <div style={{
                    position: "absolute", right: 12, top: 15,
                    background: statusColor(a.status),
                    color: "#232a2e", fontWeight: 900, borderRadius: 10, fontSize: 12, padding: "2px 9px"
                  }}>{a.status}</div>
                  {/* Signature block */}
                  {a.needsSignature && (
                    <div style={{ fontSize: 13, marginTop: 4, color: "#FFD700", display: "flex", alignItems: "center" }}>
                      <FaSignature title="Needs Signature" style={{ marginRight: 7, fontSize: 18 }} />
                      Signatures: {a.signatures.join(", ") || "(none yet)"}
                      {a.signatures.length >= BOARD.length &&
                        <FaCheckCircle style={{ color: "#1de682", fontSize: 17, marginLeft: 8 }} title="All Board Signed" />
                      }
                      <button
                        style={{
                          background: "#232e3b",
                          color: "#FFD700",
                          border: "1.5px solid #FFD700",
                          borderRadius: 8,
                          fontWeight: 800,
                          marginLeft: 14,
                          padding: "2px 10px",
                          cursor: "pointer"
                        }}
                        onClick={() => setShowSig(s => ({ ...s, [a.id]: !s[a.id] }))}
                      >Sign</button>
                    </div>
                  )}
                  {/* Comments and Details */}
                  <div style={{ display: "flex", alignItems: "center", marginTop: 6, gap: 9 }}>
                    <button
                      style={{
                        background: "#FFD70033",
                        color: "#FFD700",
                        border: "none",
                        borderRadius: 7,
                        fontWeight: 800,
                        fontSize: 13,
                        padding: "2px 11px",
                        cursor: "pointer"
                      }}
                      title="View/Add Comments"
                      onClick={() => setDetails(a)}
                    >
                      <FaComments style={{ marginRight: 4 }} /> {a.comments.length} Comments
                    </button>
                    <button
                      style={{
                        background: "#232e3b",
                        color: "#1de682",
                        border: "1.5px solid #1de682",
                        borderRadius: 7,
                        fontWeight: 800,
                        fontSize: 13,
                        padding: "2px 11px",
                        cursor: "pointer"
                      }}
                      title="View Audit Log"
                      onClick={() => setShowLogs(l => ({ ...l, [a.id]: !l[a.id] }))}
                    >
                      {showLogs[a.id] ? <FaChevronUp /> : <FaChevronDown />} Log
                    </button>
                  </div>
                  {/* Signature Panel */}
                  <AnimatePresence>
                    {showSig[a.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          marginTop: 8,
                          padding: "8px 11px",
                          border: "2px solid #FFD700",
                          borderRadius: 9,
                          background: "#232a2e"
                        }}>
                        <div style={{ fontWeight: 800, color: "#FFD700", marginBottom: 6 }}>Click to Sign:</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {BOARD.map(bm =>
                            <button
                              key={bm.name}
                              style={{
                                background: a.signatures.includes(bm.name) ? "#1de682" : "#FFD700",
                                color: "#232a2e",
                                fontWeight: 800,
                                padding: "6px 15px",
                                borderRadius: 7,
                                cursor: a.signatures.includes(bm.name) ? "not-allowed" : "pointer"
                              }}
                              disabled={a.signatures.includes(bm.name)}
                              onClick={() => signAction(a.id, bm)}
                            >
                              {bm.name}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Log panel */}
                  <AnimatePresence>
                    {showLogs[a.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 7 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 7 }}
                        style={{
                          marginTop: 7,
                          background: "#202d36",
                          border: "1.5px solid #FFD70099",
                          borderRadius: 7,
                          padding: "7px 13px"
                        }}>
                        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 13, marginBottom: 5 }}>Last 4 Moves</div>
                        <ul style={{ color: "#FFD700a0", fontSize: 13, fontWeight: 600 }}>
                          {a.log.slice(0, 4).map((l, idx) => (
                            <li key={idx}>{l.event} ({formatDistanceToNowStrict(parseISO(l.ts))} ago)</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Details/Comments Modal */}
      <AnimatePresence>
        {details && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.73)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            <div style={{
              background: "#232a2e",
              border: "4px solid #FFD700",
              borderRadius: 21,
              padding: 28,
              width: 390,
              position: "relative"
            }}>
              <button style={{
                position: "absolute", top: 16, right: 19,
                color: "#FFD700", fontSize: 29, background: "none", border: "none"
              }} onClick={() => setDetails(null)}>
                <FaTimes />
              </button>
              <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 22, marginBottom: 9 }}>
                {details.text}
              </div>
              <div style={{ color: "#1de682", fontWeight: 700, marginBottom: 8 }}>Assigned: {details.assignee}</div>
              <div style={{ color: priorityColor(details.priority), fontWeight: 700, marginBottom: 5 }}>Priority: {details.priority}</div>
              <div style={{ color: statusColor(details.status), fontWeight: 700, marginBottom: 5 }}>Status: {details.status}</div>
              <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 4 }}>Due: {details.due}</div>
              <div style={{ color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>Comments:</div>
              <ul style={{ marginBottom: 10, color: "#FFD700bb", fontWeight: 600 }}>
                {details.comments.length === 0 && <li style={{ color: "#FFD70077" }}>No comments</li>}
                {details.comments.map((c, i) => (
                  <li key={i}>
                    <FaUserTie style={{ color: "#1de682", marginRight: 6, fontSize: 14 }} />
                    <b>{c.author}</b>:
                    <span style={{ marginLeft: 5 }}>{c.text}</span>
                    <span style={{ marginLeft: 9, color: "#FFD70088", fontSize: 12 }}>
                      ({formatDistanceToNowStrict(parseISO(c.ts))} ago)
                    </span>
                  </li>
                ))}
              </ul>
              <form onSubmit={e => {
                e.preventDefault();
                const txt = e.target.comment.value.trim();
                addComment(details.id, txt);
                setDetails(d => ({ ...d, comments: [...d.comments, { author: "Board", text: txt, ts: new Date().toISOString() }] }));
                e.target.reset();
              }}>
                <input name="comment" placeholder="Add comment…" style={{
                  width: "100%", padding: "7px 11px", borderRadius: 7, border: "none", fontSize: 15,
                  background: "#181e23", color: "#FFD700"
                }} />
                <button style={{
                  background: "#FFD700", color: "#232a2e", border: "none",
                  borderRadius: 7, padding: "6px 22px", fontWeight: 900, fontSize: 15, marginTop: 8, cursor: "pointer", float: "right"
                }}>
                  Comment
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ marginTop: 28, color: "#FFD700a0", fontSize: 14, textAlign: "center" }}>
        <FaExclamationTriangle style={{ marginRight: 6 }} />
        Drag board actions across pipeline. Color and status show risk, priority, and overdue.  
        All signatures, comments, moves are audit-logged. CourtEvo Vero: Elite club boardroom, zero excuses.
      </div>
    </div>
  );
}
