import React, { useState } from "react";
import Timeline from "react-calendar-timeline";
import moment from "moment";
import { FaRocket, FaCheck, FaTimes, FaExclamationTriangle, FaFlag, FaClipboardCheck, FaFileExport, FaInfoCircle, FaPlus, FaCloudUploadAlt, FaLink, FaHistory, FaExclamationCircle } from "react-icons/fa";

const STATUS_COLORS = {
  "Done": "#1de682",
  "In Progress": "#FFD700",
  "Pending": "#e82e2e",
  "Overdue": "#e82e2e"
};
const STATUS_LABELS = {
  "Done": "Done",
  "In Progress": "In Progress",
  "Pending": "Pending",
  "Overdue": "Overdue"
};

// --- Board/owner groups, now with wider sidebar & adaptive label style ---
const GROUPS = [
  { id: 1, title: "President" },
  { id: 2, title: "Finance Director" },
  { id: 3, title: "Technical Director" },
  { id: 4, title: "Commercial Manager" },
  { id: 5, title: "Admin Lead" },
  { id: 6, title: "CourtEvo Vero Consultant" },
  { id: 7, title: "Medical Officer" },
  { id: 8, title: "Facilities Manager" }
];

// --- Initial demo milestones with dependencies, files, change log, more realism ---
const INIT = [
  {
    id: 1,
    milestone: "Club Leadership Alignment",
    owner: 1,
    start: "2024-06-20",
    end: "2024-06-28",
    status: "Done",
    dependencies: [],
    files: [],
    boardNote: "Leadership objectives and vision set.",
    color: "green",
    comments: ["Board: Alignment complete."],
    auditLog: [{ by: "President", date: "2024-06-28", action: "Marked Done" }]
  },
  {
    id: 2,
    milestone: "Full Budget Review & Freeze",
    owner: 2,
    start: "2024-06-29",
    end: "2024-07-06",
    status: "In Progress",
    dependencies: [1],
    files: [],
    boardNote: "Overspending on travel under review.",
    color: "yellow",
    comments: [],
    auditLog: [{ by: "Finance Director", date: "2024-07-01", action: "Started review" }]
  },
  {
    id: 3,
    milestone: "Youth Coach Pipeline Plan",
    owner: 3,
    start: "2024-07-07",
    end: "2024-07-18",
    status: "Pending",
    dependencies: [2],
    files: [],
    boardNote: "",
    color: "red",
    comments: [],
    auditLog: []
  },
  {
    id: 4,
    milestone: "Sponsorship/Partnership Quick Wins",
    owner: 4,
    start: "2024-07-01",
    end: "2024-07-15",
    status: "In Progress",
    dependencies: [],
    files: [],
    boardNote: "2 new sponsors in negotiation.",
    color: "yellow",
    comments: ["Commercial: Negotiations started."],
    auditLog: [{ by: "Commercial Manager", date: "2024-07-02", action: "Milestone in progress" }]
  },
  {
    id: 5,
    milestone: "Academy Registration Digitalization",
    owner: 5,
    start: "2024-07-20",
    end: "2024-07-31",
    status: "Pending",
    dependencies: [],
    files: [],
    boardNote: "",
    color: "red",
    comments: [],
    auditLog: []
  },
  {
    id: 6,
    milestone: "Full Club Diagnostic Report to Board",
    owner: 6,
    start: "2024-08-01",
    end: "2024-08-10",
    status: "Pending",
    dependencies: [2,3,5],
    files: [],
    boardNote: "",
    color: "red",
    comments: [],
    auditLog: []
  },
  {
    id: 7,
    milestone: "Medical Clearance Audit",
    owner: 7,
    start: "2024-06-29",
    end: "2024-07-05",
    status: "Done",
    dependencies: [],
    files: [],
    boardNote: "All players cleared.",
    color: "green",
    comments: [],
    auditLog: [{ by: "Medical Officer", date: "2024-07-05", action: "Clearance confirmed" }]
  },
  {
    id: 8,
    milestone: "Facility Booking Optimization",
    owner: 8,
    start: "2024-07-05",
    end: "2024-07-14",
    status: "In Progress",
    dependencies: [7],
    files: [],
    boardNote: "",
    color: "yellow",
    comments: [],
    auditLog: []
  }
];

export default function AcceleratorRoadmap() {
  const [rows, setRows] = useState(INIT);
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState({
    milestone: "", owner: 1, start: "", end: "", status: "Pending", dependencies: [], files: [], boardNote: "", comments: [], auditLog: []
  });
  const [fileInput, setFileInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [auditIdx, setAuditIdx] = useState(null);
  const [timelineVisible, setTimelineVisible] = useState(true);

  // Timeline items with wider groups and improved label rendering
  const items = rows.map(r => ({
    id: r.id,
    group: r.owner,
    title: r.milestone,
    start_time: moment(r.start),
    end_time: moment(r.end),
    itemProps: {
      style: {
        background: STATUS_COLORS[r.status] || "#FFD700",
        color: "#232a2e",
        fontWeight: 900,
        borderRadius: 8,
        border: "1.5px solid #232a2e",
        whiteSpace: "normal"
      }
    }
  }));

  // Analytics
  const done = rows.filter(r => r.status === "Done").length;
  const inProg = rows.filter(r => r.status === "In Progress").length;
  const pending = rows.filter(r => r.status === "Pending").length;
  const total = rows.length;
  const percent = Math.round((done / total) * 100);
  const overdue = rows.filter(r =>
    r.status !== "Done" && moment().isAfter(moment(r.end))
  );

  // Next milestone
  const nextMilestone = rows
    .filter(r => r.status !== "Done" && moment(r.start).isSameOrAfter(moment(), "day"))
    .sort((a, b) => moment(a.start) - moment(b.start))[0];

  // Table operations
  function addRow(e) {
    e.preventDefault();
    setRows([
      {
        ...newRow,
        id: Date.now(),
        auditLog: [{ by: "Board", date: moment().format("YYYY-MM-DD"), action: "Milestone created" }],
        files: (newRow.files || []),
        dependencies: (newRow.dependencies || []).map(Number)
      },
      ...rows
    ]);
    setNewRow({
      milestone: "", owner: 1, start: "", end: "", status: "Pending", dependencies: [], files: [], boardNote: "", comments: [], auditLog: []
    });
    setShowAdd(false);
  }
  function addFile(idx) {
    if (!fileInput.trim()) return;
    setRows(r =>
      r.map((row, i) =>
        i === idx ? {
          ...row,
          files: [...(row.files || []), fileInput],
          auditLog: [...(row.auditLog || []), { by: "Board", date: moment().format("YYYY-MM-DD"), action: "Added file" }]
        } : row
      )
    );
    setFileInput("");
  }
  function addComment(idx) {
    if (!commentInput.trim()) return;
    setRows(r =>
      r.map((row, i) =>
        i === idx ? {
          ...row,
          comments: [...(row.comments || []), commentInput],
          auditLog: [...(row.auditLog || []), { by: "Board", date: moment().format("YYYY-MM-DD"), action: "Added comment" }]
        } : row
      )
    );
    setCommentInput("");
  }
  function updateStatus(idx, status) {
    setRows(r =>
      r.map((row, i) =>
        i === idx
          ? {
              ...row,
              status,
              color: status === "Done" ? "green" : status === "In Progress" ? "yellow" : "red",
              auditLog: [...(row.auditLog || []), { by: "Board", date: moment().format("YYYY-MM-DD"), action: "Status changed to " + status }]
            }
          : row
      )
    );
  }
  function exportCSV() {
    const rowsArr = [["Milestone", "Owner", "Start", "End", "Status", "Dependencies", "Files", "BoardNote", "Comments"]];
    rows.forEach(r =>
      rowsArr.push([
        r.milestone,
        GROUPS.find(g => g.id === r.owner)?.title || "",
        r.start, r.end, r.status,
        (r.dependencies || []).join("; "),
        (r.files || []).join("; "),
        r.boardNote,
        (r.comments || []).join(" | ")
      ])
    );
    const csv = rowsArr.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accelerator_roadmap.csv";
    a.click();
  }

  // Dependency Graph helper
  function DependencyGraph() {
    return (
      <div style={{
        background: "#232a2e",
        borderRadius: 12,
        padding: "11px 19px",
        margin: "25px 0 0 0",
        color: "#FFD700",
        fontWeight: 700,
        fontSize: 14,
        boxShadow: "0 1px 10px #FFD70011"
      }}>
        <FaLink style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Milestone Dependencies:</b>
        <ul style={{ margin: 0, padding: "6px 0 0 19px" }}>
          {rows.filter(r => r.dependencies && r.dependencies.length).map(r =>
            <li key={r.id}>
              <span style={{ color: "#1de682" }}>{r.milestone}</span> cannot finish until:{" "}
              {r.dependencies.map(dep => (
                <span key={dep} style={{ color: "#FFD700", marginLeft: 5 }}>
                  {rows.find(x => x.id === dep)?.milestone}
                </span>
              ))}
            </li>
          )}
          {rows.filter(r => r.dependencies && r.dependencies.length).length === 0 && <li>None</li>}
        </ul>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 24,
      padding: 22,
      maxWidth: 1260,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 24px 0", background: "linear-gradient(90deg, #FFD700 10%, #1de682 100%)" }} />
      <h2 style={{ fontWeight: 900, marginBottom: 14 }}>
        <FaRocket style={{ marginRight: 8 }} /> 90-Day Accelerator Roadmap
      </h2>
      <div style={{ marginBottom: 18, fontSize: 15, background: "#232a2e", borderRadius: 12, padding: "10px 18px", color: "#FFD700cc" }}>
        <FaInfoCircle style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Strategic Club Execution:</b> Visualize, track, and deliver every key milestone.
        <br />
        <span style={{ color: "#1de682" }}>Dependency-aware. Calendar. Audit-ready. Club-changing.</span>
      </div>
      {/* Overdue Milestone Banner */}
      {overdue.length > 0 && (
        <div style={{
          background: "#e82e2e", color: "#fff", borderRadius: 9, fontWeight: 900, fontSize: 16,
          padding: "9px 19px", margin: "0 0 18px 0", boxShadow: "0 2px 14px #e82e2e33"
        }}>
          <FaExclamationCircle style={{ marginRight: 8 }} />
          <span>Overdue: {overdue.map(r => r.milestone).join(", ")}</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "12px 0" }}>
        <button style={addBtnStyle} onClick={() => setShowAdd(true)}><FaPlus /> Add Milestone</button>
        <button style={btnStyle} onClick={exportCSV}><FaFileExport /> Export</button>
        <button style={btnStyle} onClick={() => setTimelineVisible(v => !v)}>
          <FaFlag /> {timelineVisible ? "Hide Timeline" : "Show Timeline"}
        </button>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#FFD700", marginLeft: 30 }}>
          {percent}% Complete | {done} Done | {inProg} In Progress | {pending} Pending | <span style={{ color: "#e82e2e" }}>{overdue.length} Overdue</span>
        </div>
      </div>
      {/* Timeline */}
      {timelineVisible && (
        <div style={{
          background: "#181e23",
          borderRadius: 12,
          margin: "20px 0",
          padding: "14px 0",
          overflowX: "auto",
          minWidth: 700,
          maxWidth: "100%",
          boxShadow: "0 2px 18px #FFD70022"
        }}>
          <Timeline
            groups={GROUPS}
            items={items}
            defaultTimeStart={moment().subtract(5, "day")}
            defaultTimeEnd={moment().add(30, "day")}
            canMove={false}
            canResize={false}
            lineHeight={52}
            itemHeightRatio={0.75}
            sidebarWidth={200}
            minZoom={3.6e6 * 7}
            maxZoom={3.6e6 * 120}
            timeSteps={{ day: 1 }}
            groupRenderer={({ group }) => (
              <div style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#FFD700",
                padding: "9px 2px 9px 7px",
                whiteSpace: "normal",
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.28
              }} title={group.title}>
                {group.title}
              </div>
            )}
            verticalLineClassNamesForTime={time => {
              if (moment(time).isSame(moment(), "day")) return ["today-marker"];
              return [];
            }}
            itemRenderer={({ item, getItemProps, itemContext }) => (
              <div {...getItemProps({
                style: {
                  ...getItemProps().style,
                  boxShadow: itemContext.selected ? "0 2px 16px #FFD70066" : "",
                  borderLeft: itemContext.selected ? "4px solid #FFD700" : "4px solid transparent"
                }
              })}>
                <b>{item.title}</b>
                <br />
                <span style={{ fontSize: 12, color: "#232a2e" }}>{STATUS_LABELS[rows.find(r => r.id === item.id)?.status]}</span>
              </div>
            )}
          />
        </div>
      )}
      {/* Next Milestone */}
      {nextMilestone && (
        <div style={{
          background: "#181e23",
          borderRadius: 12,
          color: "#FFD700",
          fontWeight: 800,
          padding: "13px 19px",
          margin: "16px 0",
          fontSize: 15
        }}>
          <FaFlag style={{ color: "#FFD700", marginRight: 8 }} />
          <b>Next Major Milestone:</b> {nextMilestone.milestone} ({nextMilestone.start} – {nextMilestone.end}), Owner: {GROUPS.find(g => g.id === nextMilestone.owner)?.title}
        </div>
      )}
      {/* Add Milestone Form */}
      {showAdd && (
        <form onSubmit={addRow} style={{
          background: "#232a2e",
          borderRadius: 12,
          padding: "18px 20px",
          margin: "12px 0",
          boxShadow: "0 2px 12px #FFD70018"
        }}>
          <div style={{ display: "flex", gap: 13, flexWrap: "wrap" }}>
            <div>
              <label style={formLabel}>Milestone:</label><br />
              <input required value={newRow.milestone} onChange={e => setNewRow(n => ({ ...n, milestone: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Owner:</label><br />
              <select value={newRow.owner} onChange={e => setNewRow(n => ({ ...n, owner: Number(e.target.value) }))} style={formInput}>
                {GROUPS.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Start:</label><br />
              <input type="date" value={newRow.start} onChange={e => setNewRow(n => ({ ...n, start: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>End:</label><br />
              <input type="date" value={newRow.end} onChange={e => setNewRow(n => ({ ...n, end: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Status:</label><br />
              <select value={newRow.status} onChange={e => setNewRow(n => ({ ...n, status: e.target.value, color: e.target.value === "Done" ? "green" : e.target.value === "In Progress" ? "yellow" : "red" }))} style={formInput}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Done</option>
                <option>Overdue</option>
              </select>
            </div>
            <div>
              <label style={formLabel}>Dependencies:</label><br />
              <select multiple value={newRow.dependencies} onChange={e =>
                setNewRow(n => ({
                  ...n,
                  dependencies: Array.from(e.target.selectedOptions, opt => Number(opt.value))
                }))
              } style={{ ...formInput, minWidth: 70, minHeight: 36 }}>
                {rows.map(r => <option key={r.id} value={r.id}>{r.milestone}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={formLabel}>Board Note:</label><br />
            <input value={newRow.boardNote} onChange={e => setNewRow(n => ({ ...n, boardNote: e.target.value }))} style={{ ...formInput, minWidth: 200 }} />
          </div>
          <button type="submit" style={addBtnStyle}><FaCheck /> Add</button>
          <button type="button" style={editBtnStyle} onClick={() => setShowAdd(false)}><FaTimes /> Cancel</button>
        </form>
      )}
      {/* Table */}
      <div style={{
        overflowX: "auto",
        maxWidth: "100%",
        margin: "0 0 10px 0"
      }}>
        <table style={{
          width: "100%",
          fontSize: 15,
          borderCollapse: "collapse",
          background: "#232a2e",
          borderRadius: 12,
          tableLayout: "auto"
        }}>
          <thead style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "#181e23"
          }}>
            <tr style={{ color: "#FFD700" }}>
              <th>Milestone</th>
              <th>Owner</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Dependencies</th>
              <th>Files</th>
              <th>Board Note</th>
              <th>Comments</th>
              <th>Audit Log</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} style={{ background: "#232a2e", color: "#FFD700" }}>
                <td style={{ maxWidth: 180, wordBreak: "break-word" }}>{row.milestone}</td>
                <td style={{ maxWidth: 145, wordBreak: "break-word" }}>{GROUPS.find(g => g.id === row.owner)?.title}</td>
                <td>{row.start}</td>
                <td>{row.end}</td>
                <td>
                  <span style={{
                    background: STATUS_COLORS[row.status],
                    color: "#232a2e",
                    borderRadius: 5,
                    padding: "2px 12px",
                    fontWeight: 800
                  }}>
                    {row.status}
                  </span>
                </td>
                <td>
                  {(row.dependencies || []).map(dep =>
                    <span key={dep} style={{ background: "#181e23", color: "#FFD700", fontSize: 12, borderRadius: 5, padding: "1px 6px", marginRight: 4 }}>
                      <FaLink style={{ marginRight: 2, fontSize: 11 }} />{rows.find(x => x.id === dep)?.milestone}
                    </span>
                  )}
                </td>
                <td>
                  {(row.files || []).map((f, i) =>
                    <div key={i}><a href={f} target="_blank" rel="noopener noreferrer" style={{ color: "#1de682" }}>File {i + 1}</a></div>
                  )}
                  <input value={fileInput} onChange={e => setFileInput(e.target.value)} placeholder="URL" style={formInput} />
                  <button style={editBtnStyle} onClick={() => addFile(idx)}><FaCloudUploadAlt /></button>
                </td>
                <td>
                  <div style={{ fontSize: 13, maxWidth: 180, wordBreak: "break-word" }}>
                    {row.boardNote}
                  </div>
                </td>
                <td>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {(row.comments || []).map((c, i) => (
                      <li key={i} style={{ fontSize: 12 }}>{c}</li>
                    ))}
                  </ul>
                  <input value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder="Comment" style={formInput} />
                  <button style={addBtnStyle} onClick={() => addComment(idx)}><FaClipboardCheck /></button>
                </td>
                <td>
                  <button style={editBtnStyle} onClick={() => setAuditIdx(auditIdx === idx ? null : idx)}><FaHistory /></button>
                  {auditIdx === idx && (
                    <ul style={{
                      background: "#232a2e", color: "#FFD700", borderRadius: 8, fontSize: 12,
                      listStyle: "none", padding: "6px 9px", margin: "6px 0", maxHeight: 90, overflowY: "auto"
                    }}>
                      {(row.auditLog || []).map((a, i) =>
                        <li key={i}>{a.date} | {a.by}: {a.action}</li>
                      )}
                    </ul>
                  )}
                </td>
                <td>
                  <button style={addBtnStyle} onClick={() => updateStatus(idx, "Done")}><FaCheck /></button>
                  <button style={editBtnStyle} onClick={() => updateStatus(idx, "In Progress")}><FaExclamationTriangle /></button>
                  <button style={editBtnStyle} onClick={() => updateStatus(idx, "Pending")}><FaTimes /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DependencyGraph />
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "11px 14px",
        fontWeight: 600,
        fontSize: 14,
        marginTop: 17
      }}>
        <FaRocket style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Boardroom:</b> No confusion, no excuses. 90 days. Accountability for all.
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
  width: 90,
  marginBottom: 4
};
const formLabel = {
  color: "#FFD700",
  fontWeight: 800,
  fontSize: 13
};
