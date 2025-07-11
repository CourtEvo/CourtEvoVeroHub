import React, { useState } from "react";
import {
  FaProjectDiagram, FaUserTie, FaFlagCheckered, FaClock, FaExclamationTriangle, FaCheckCircle, FaArrowRight, FaTrash, FaEdit, FaPlus, FaFileExport, FaLightbulb, FaChevronLeft, FaChevronRight, FaFilter, FaSearch
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const AREAS = ["First Team", "Youth", "Facility", "Commercial", "Digital", "Medical", "Boardroom"];

const DEFAULT_PROJECTS = [
  { name: "Upgrade Youth Academy Facility", owner: "Ops Director", area: "Facility", start: "2024-01", end: "2024-10", status: "On Track", progress: 55, budget: 100000, spent: 42000, deps: [], notes: "Grant awarded", risk: "Low", milestones: [{ label: "Phase 1", due: "2024-03", status: "Done" }, { label: "Phase 2", due: "2024-08", status: "Pending" }] },
  { name: "Commercial Partner Expansion", owner: "CEO", area: "Commercial", start: "2024-04", end: "2025-03", status: "At Risk", progress: 22, budget: 80000, spent: 10000, deps: [], notes: "New sponsor leads in pipeline", risk: "Medium", milestones: [{ label: "Lead List", due: "2024-05", status: "Done" }, { label: "First Pitch", due: "2024-07", status: "Pending" }] },
  { name: "Digital Analytics Rollout", owner: "Head of Digital", area: "Digital", start: "2024-07", end: "2025-01", status: "Delayed", progress: 10, budget: 22000, spent: 3500, deps: ["Commercial Partner Expansion"], notes: "Board wants more detail", risk: "High", milestones: [{ label: "Vendor Shortlist", due: "2024-09", status: "Pending" }] },
  { name: "Player Wellness Program", owner: "Head of Performance", area: "First Team", start: "2024-03", end: "2024-11", status: "On Track", progress: 62, budget: 15000, spent: 9000, deps: [], notes: "", risk: "Low", milestones: [{ label: "Staff Hired", due: "2024-04", status: "Done" }, { label: "Initial Assessments", due: "2024-07", status: "Pending" }] }
];

const statusColors = {
  "On Track": "#1de682",
  "At Risk": "#FFD700",
  "Delayed": "#ff4848",
  "Completed": "#232a2e"
};

const milestoneColors = {
  "Pending": "#FFD700",
  "Done": "#1de682",
  "Overdue": "#ff4848"
};

const monthsRange = (start, end) => {
  let s = start.split("-"), e = end.split("-");
  let y1 = +s[0], m1 = +s[1], y2 = +e[0], m2 = +e[1];
  let months = [];
  for (let y = y1; y <= y2; y++) {
    for (let m = 1; m <= 12; m++) {
      if ((y > y1 || m >= m1) && (y < y2 || m <= m2)) months.push(`${y}-${String(m).padStart(2, "0")}`);
    }
  }
  return months;
};

const StrategicRoadmapCockpitEliteExtended = () => {
  const [projects, setProjects] = useState([...DEFAULT_PROJECTS]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const [addMode, setAddMode] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", owner: "", area: AREAS[0], start: "2024-01", end: "2024-12", status: "On Track", progress: 0, budget: 0, spent: 0, deps: [], notes: "", risk: "Low", milestones: [] });
  const [areaFilter, setAreaFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [scenarioIdx, setScenarioIdx] = useState(-1);
  const [scenarioStatus, setScenarioStatus] = useState("");
  const [notesLog, setNotesLog] = useState([{ date: "2024-05-14", txt: "Board approved new digital investment.", tags: ["Board", "Digital"] }]);
  const [noteText, setNoteText] = useState("");
  const [noteTag, setNoteTag] = useState("");
  const [ganttScroll, setGanttScroll] = useState(0);

  // Determine timeline window (min start, max end)
  const allMonths = (() => {
    let all = projects.map(p => [p.start, p.end]).flat();
    let min = all.sort()[0], max = all.sort().reverse()[0];
    return monthsRange(min, max);
  })();

  // CRUD
  const addProject = () => {
    setProjects([...projects, { ...newProject, deps: (newProject.deps || []).filter(Boolean), milestones: newProject.milestones || [] }]);
    setAddMode(false);
    setNewProject({ name: "", owner: "", area: AREAS[0], start: "2024-01", end: "2024-12", status: "On Track", progress: 0, budget: 0, spent: 0, deps: [], notes: "", risk: "Low", milestones: [] });
  };
  const startEdit = idx => {
    setEditing(idx);
    setEditData({ ...projects[idx], deps: projects[idx].deps || [], milestones: projects[idx].milestones || [] });
  };
  const saveEdit = () => {
    setProjects(projects.map((p, i) => i === editing ? { ...editData, deps: (editData.deps || []).filter(Boolean), milestones: editData.milestones || [] } : p));
    setEditing(null);
    setEditData({});
  };
  const removeProject = idx => setProjects(projects.filter((_, i) => i !== idx));
  // Add/remove milestone
  const addMilestone = (pidx, label, due) => {
    if (!label || !due) return;
    setProjects(projects.map((p, i) =>
      i === pidx
        ? { ...p, milestones: [...(p.milestones || []), { label, due, status: "Pending" }] }
        : p
    ));
  };
  const updateMilestone = (pidx, midx, updates) => {
    setProjects(projects.map((p, i) =>
      i === pidx
        ? {
          ...p,
          milestones: p.milestones.map((m, j) => j === midx ? { ...m, ...updates } : m)
        }
        : p
    ));
  };
  const removeMilestone = (pidx, midx) => {
    setProjects(projects.map((p, i) =>
      i === pidx
        ? { ...p, milestones: p.milestones.filter((_, j) => j !== midx) }
        : p
    ));
  };

  // Scenario: simulate delay/budget overspend
  const runScenario = idx => {
    setScenarioIdx(idx);
    let p = projects[idx];
    if (p.status === "On Track") setScenarioStatus("If delayed: timeline slips by 3 months, risk increases, dependencies at risk.");
    else if (p.status === "At Risk") setScenarioStatus("If not resolved: budget overrun and possible strategic goal miss.");
    else setScenarioStatus("Scenario not available.");
  };

  // Boardroom notes
  const addNote = () => {
    if (!noteText.trim()) return;
    setNotesLog([...notesLog, { date: new Date().toISOString().slice(0, 10), txt: noteText, tags: noteTag ? noteTag.split(",").map(x => x.trim()) : [] }]);
    setNoteText("");
    setNoteTag("");
  };

  // Export CSV
  const exportCSV = () => {
    let csv = ["Name,Owner,Area,Start,End,Status,Progress,Budget,Spent,Dependencies,Notes,Risk,Milestones"];
    projects.forEach(p =>
      csv.push([
        p.name, p.owner, p.area, p.start, p.end, p.status, p.progress, p.budget, p.spent, (p.deps || []).join("|"), p.notes, p.risk,
        (p.milestones || []).map(m => `${m.label} (${m.due}) [${m.status}]`).join("|")
      ].join(","))
    );
    csv.push("\nBoard Log:");
    notesLog.forEach(n => csv.push([n.date, n.txt, (n.tags || []).join("|")].join(",")));
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "strategic_roadmap.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // Budget burn + progress
  function getBurnStatus(p) {
    if (!p.budget) return "";
    if (p.spent > p.budget) return "Overspent";
    if (p.spent / p.budget > 0.85) return "Close to over";
    return "";
  }

  // Filtering
  const filteredProjects = projects.filter(p =>
    (areaFilter === "All" || p.area === areaFilter) &&
    (!searchText || p.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Gantt scroll (responsive horizontal)
  const visibleMonths = allMonths.slice(ganttScroll, ganttScroll + 10);

  // --- UI ---
  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12 }}>
        <FaProjectDiagram size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Multi-Year Strategic Roadmap Cockpit
        </h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | Elite Consulting
        </span>
        <button onClick={exportCSV} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 16 }}><FaFileExport style={{ marginRight: 5 }} /> Export CSV</button>
      </div>
      {/* Filters/Search */}
      <div style={{ display: "flex", gap: 17, alignItems: "center", marginBottom: 11 }}>
        <FaFilter />
        <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} style={inputStyleMini}>
          <option value="All">All Areas</option>
          {AREAS.map(a => <option key={a}>{a}</option>)}
        </select>
        <FaSearch />
        <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search initiative..." style={inputStyle} />
      </div>
      {/* Add Project */}
      <div style={{ marginBottom: 9 }}>
        <button onClick={() => setAddMode(a => !a)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginBottom: 8 }}>
          <FaPlus /> {addMode ? "Cancel" : "Add Initiative"}
        </button>
        {addMode &&
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 9 }}>
            <input value={newProject.name} placeholder="Name" onChange={e => setNewProject({ ...newProject, name: e.target.value })} style={inputStyle} />
            <input value={newProject.owner} placeholder="Owner" onChange={e => setNewProject({ ...newProject, owner: e.target.value })} style={inputStyle} />
            <select value={newProject.area} onChange={e => setNewProject({ ...newProject, area: e.target.value })} style={inputStyle}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
            <input value={newProject.start} type="month" onChange={e => setNewProject({ ...newProject, start: e.target.value })} style={inputStyleMini} />
            <input value={newProject.end} type="month" onChange={e => setNewProject({ ...newProject, end: e.target.value })} style={inputStyleMini} />
            <select value={newProject.status} onChange={e => setNewProject({ ...newProject, status: e.target.value })} style={inputStyleMini}>
              <option>On Track</option>
              <option>At Risk</option>
              <option>Delayed</option>
              <option>Completed</option>
            </select>
            <input value={newProject.progress} type="number" min={0} max={100} placeholder="% Progress" onChange={e => setNewProject({ ...newProject, progress: Number(e.target.value) })} style={inputStyleMini} />
            <input value={newProject.budget} type="number" placeholder="Budget" onChange={e => setNewProject({ ...newProject, budget: Number(e.target.value) })} style={inputStyleMini} />
            <input value={newProject.spent} type="number" placeholder="Spent" onChange={e => setNewProject({ ...newProject, spent: Number(e.target.value) })} style={inputStyleMini} />
            <input value={newProject.deps.join(", ")} placeholder="Deps" onChange={e => setNewProject({ ...newProject, deps: e.target.value.split(",").map(x => x.trim()) })} style={inputStyle} />
            <input value={newProject.notes} placeholder="Notes" onChange={e => setNewProject({ ...newProject, notes: e.target.value })} style={inputStyle} />
            <select value={newProject.risk} onChange={e => setNewProject({ ...newProject, risk: e.target.value })} style={inputStyleMini}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button onClick={addProject} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
          </div>
        }
      </div>
      {/* Gantt Chart with scroll */}
      <div style={{ background: "#232a2e", borderRadius: 14, boxShadow: "0 2px 18px #FFD70022", padding: 14, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 6 }}>Strategic Roadmap (Gantt View)</div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <button disabled={ganttScroll === 0} onClick={() => setGanttScroll(s => Math.max(0, s - 1))} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", fontSize: 16 }}><FaChevronLeft /></button>
          <span style={{ color: "#FFD700bb", fontWeight: 600, marginLeft: 8 }}>Timeline</span>
          <button disabled={ganttScroll + 10 >= allMonths.length} onClick={() => setGanttScroll(s => Math.min(allMonths.length - 10, s + 1))} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", fontSize: 16, marginLeft: 8 }}><FaChevronRight /></button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th>Initiative</th>
                <th>Owner</th>
                <th>Area</th>
                <th colSpan={visibleMonths.length} style={{ textAlign: "center" }}>Timeline</th>
                <th>Status</th>
                <th>%</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Risk</th>
                <th>Milestones</th>
                <th>Notes</th>
                <th></th>
              </tr>
              <tr>
                <td colSpan={3}></td>
                {visibleMonths.map((m, i) => <td key={i} style={{ color: "#FFD70066", fontSize: 11 }}>{m}</td>)}
                <td colSpan={6}></td>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p, idx) =>
                editing === idx ? (
                  <tr key={idx} style={{ background: "#FFD70022" }}>
                    <td><input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={inputStyleMini} /></td>
                    <td><input value={editData.owner} onChange={e => setEditData({ ...editData, owner: e.target.value })} style={inputStyleMini} /></td>
                    <td>
                      <select value={editData.area} onChange={e => setEditData({ ...editData, area: e.target.value })} style={inputStyleMini}>
                        {AREAS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </td>
                    {visibleMonths.map((m, i) => (
                      <td key={i} style={{ background: m >= editData.start && m <= editData.end ? statusColors[editData.status] + "66" : undefined }} />
                    ))}
                    <td>
                      <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })} style={inputStyleMini}>
                        <option>On Track</option>
                        <option>At Risk</option>
                        <option>Delayed</option>
                        <option>Completed</option>
                      </select>
                    </td>
                    <td><input value={editData.progress} type="number" min={0} max={100} onChange={e => setEditData({ ...editData, progress: Number(e.target.value) })} style={inputStyleMini} /></td>
                    <td><input value={editData.budget} type="number" onChange={e => setEditData({ ...editData, budget: Number(e.target.value) })} style={inputStyleMini} /></td>
                    <td><input value={editData.spent} type="number" onChange={e => setEditData({ ...editData, spent: Number(e.target.value) })} style={inputStyleMini} /></td>
                    <td>
                      <select value={editData.risk} onChange={e => setEditData({ ...editData, risk: e.target.value })} style={inputStyleMini}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </td>
                    <td>
                      {/* Milestone Editor */}
                      {(editData.milestones || []).map((m, midx) =>
                        <div key={midx} style={{ marginBottom: 2 }}>
                          <input value={m.label} style={inputStyleMini} onChange={e => {
                            let ms = [...editData.milestones];
                            ms[midx].label = e.target.value;
                            setEditData({ ...editData, milestones: ms });
                          }} />
                          <input value={m.due} type="month" style={inputStyleMini} onChange={e => {
                            let ms = [...editData.milestones];
                            ms[midx].due = e.target.value;
                            setEditData({ ...editData, milestones: ms });
                          }} />
                          <select value={m.status} onChange={e => {
                            let ms = [...editData.milestones];
                            ms[midx].status = e.target.value;
                            setEditData({ ...editData, milestones: ms });
                          }} style={inputStyleMini}>
                            <option>Pending</option>
                            <option>Done</option>
                            <option>Overdue</option>
                          </select>
                          <button onClick={() => {
                            let ms = [...editData.milestones];
                            ms.splice(midx, 1);
                            setEditData({ ...editData, milestones: ms });
                          }} style={{ ...btnStyle, background: "#ff4848", color: "#fff", fontSize: 12 }}><FaTrash /></button>
                        </div>
                      )}
                      <div>
                        <input placeholder="Milestone" style={inputStyleMini} onBlur={e => setEditData(ed => ({ ...ed, newMLabel: e.target.value }))} />
                        <input type="month" style={inputStyleMini} onBlur={e => setEditData(ed => ({ ...ed, newMDue: e.target.value }))} />
                        <button onClick={() => {
                          if (editData.newMLabel && editData.newMDue) {
                            setEditData({
                              ...editData,
                              milestones: [...(editData.milestones || []), { label: editData.newMLabel, due: editData.newMDue, status: "Pending" }],
                              newMLabel: "", newMDue: ""
                            });
                          }
                        }} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", fontSize: 12 }}><FaPlus /></button>
                      </div>
                    </td>
                    <td><input value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })} style={inputStyleMini} /></td>
                    <td>
                      <button onClick={saveEdit} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaCheckCircle /></button>
                      <button onClick={() => setEditing(null)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                    </td>
                  </tr>
                ) : (
                  <tr key={idx} style={{ background: p.status === "Delayed" ? "#ff484822" : p.status === "At Risk" ? "#FFD70022" : p.status === "On Track" ? "#1de68222" : "#232a2e" }}>
                    <td style={{ color: "#FFD700", fontWeight: 700 }}>{p.name}</td>
                    <td>{p.owner}</td>
                    <td>{p.area}</td>
                    {visibleMonths.map((m, i) => (
                      <td key={i} style={{
                        background: m >= p.start && m <= p.end ? statusColors[p.status] + "88" : undefined,
                        borderRadius: m === p.start ? "14px 0 0 14px" : m === p.end ? "0 14px 14px 0" : 0,
                        position: "relative"
                      }}>
                        {/* Milestone markers */}
                        {(p.milestones || []).map((ms, midx) => ms.due === m &&
                          <div key={midx} style={{
                            background: milestoneColors[ms.status], borderRadius: "50%", width: 14, height: 14,
                            position: "absolute", left: "50%", top: 2, transform: "translate(-50%,0)", border: "2px solid #fff"
                          }} title={ms.label}></div>
                        )}
                        {m === p.start && <FaFlagCheckered style={{ fontSize: 13, color: "#FFD700" }} />}
                        {m === p.end && <FaCheckCircle style={{ fontSize: 13, color: "#1de682" }} />}
                      </td>
                    ))}
                    <td style={{ color: statusColors[p.status], fontWeight: 700 }}>{p.status}</td>
                    <td>
                      <div style={{ width: 56, height: 12, background: "#283E51", borderRadius: 5, position: "relative" }}>
                        <div style={{
                          width: `${p.progress || 0}%`, height: "100%",
                          background: p.progress < 60 ? "#FFD700" : "#1de682",
                          borderRadius: 5, transition: "width .15s"
                        }} />
                        <span style={{ fontSize: 12, position: "absolute", left: 6, top: -1 }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td>
                      {p.budget ? p.budget.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }) : ""}
                      {getBurnStatus(p) && <span style={{ color: "#ff4848", fontWeight: 700, marginLeft: 5 }}>{getBurnStatus(p)}</span>}
                    </td>
                    <td>
                      {p.spent ? p.spent.toLocaleString("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }) : ""}
                    </td>
                    <td style={{ color: p.risk === "High" ? "#ff4848" : p.risk === "Medium" ? "#FFD700" : "#1de682", fontWeight: 700 }}>{p.risk}</td>
                    <td>
                      {(p.milestones || []).map((ms, midx) =>
                        <div key={midx} style={{
                          color: milestoneColors[ms.status], fontWeight: 700, fontSize: 12
                        }}>
                          {ms.label} <span style={{ color: "#FFD70099" }}>({ms.due})</span> [{ms.status}]
                        </div>
                      )}
                    </td>
                    <td>{p.notes}</td>
                    <td>
                      <button onClick={() => startEdit(idx)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginRight: 3 }}><FaEdit /></button>
                      <button onClick={() => removeProject(idx)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                      <button onClick={() => runScenario(idx)} style={{ ...btnStyle, background: "#FFD70066", color: "#232a2e" }}><FaLightbulb /></button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        {/* Scenario result */}
        {scenarioIdx >= 0 && (
          <div style={{ background: "#181e23", color: "#FFD700", padding: 15, borderRadius: 12, marginTop: 10 }}>
            <b>Scenario Analysis for:</b> <span style={{ color: "#FFD700", fontWeight: 700 }}>{filteredProjects[scenarioIdx]?.name}</span>
            <div style={{ marginTop: 5 }}>{scenarioStatus}</div>
            <button onClick={() => setScenarioIdx(-1)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 7 }}><FaArrowRight /> Close</button>
          </div>
        )}
      </div>
      {/* Boardroom Recommendations & Log */}
      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16 }}><FaLightbulb style={{ marginRight: 7 }} /> Boardroom Recommendations</div>
          <ul>
            {filteredProjects.filter(p => p.status === "Delayed").length > 0 && <li style={{ color: "#ff4848", fontWeight: 700 }}>Critical delays detected—escalate to board or adjust timelines/funding.</li>}
            {filteredProjects.filter(p => p.status === "At Risk").length > 0 && <li style={{ color: "#FFD700", fontWeight: 700 }}>Risks flagged: assign clear ownership and track mitigation steps.</li>}
            <li style={{ color: "#1de682", fontWeight: 600 }}>Review completed projects for best-practice learnings.</li>
          </ul>
        </div>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaFlagCheckered style={{ marginRight: 7 }} /> Boardroom Log</div>
          <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
            {notesLog.map((n, i) =>
              <div key={i}>
                <span style={{ color: "#FFD700", fontWeight: 700 }}>{n.date}:</span> {n.txt}
                {n.tags?.length ? <span style={{ color: "#FFD70088", marginLeft: 7 }}>[{n.tags.join(", ")}]</span> : ""}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={noteText} placeholder="Add board note or action..." onChange={e => setNoteText(e.target.value)} style={inputStyleFull} />
            <input value={noteTag} placeholder="Tags (comma separated)" onChange={e => setNoteTag(e.target.value)} style={inputStyleMini} />
            <button onClick={addNote} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
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
  ...inputStyle, width: 65, marginBottom: 0
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default StrategicRoadmapCockpitEliteExtended;
