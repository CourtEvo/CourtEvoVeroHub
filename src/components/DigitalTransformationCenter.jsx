import React, { useState } from "react";
import { FaCogs, FaPlus, FaFilter, FaSearch, FaCheck, FaTimes, FaExclamationTriangle, FaRocket, FaCloud, FaUser, FaCloudUploadAlt, FaFolderOpen, FaBolt, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import "./DigitalTransformationCenter.css";

// --- Board Data
const INITIAL_PROJECTS = [
  { id: "p1", name: "Athlete App Rollout", stage: "In Progress", team: ["Ana", "Luka"], kpi: "User Adoption", risk: "Low", progress: 65, spend: 9000, timeline: ["2025-03-01", "2025-07-01"], activity: ["Kickoff", "UI prototype", "Beta launch"], docs: [] },
  { id: "p2", name: "Video Analytics Integration", stage: "Delayed", team: ["Marko", "Zoran"], kpi: "Clips Indexed", risk: "High", progress: 35, spend: 7200, timeline: ["2025-01-01", "2025-06-15"], activity: ["Planning", "Vendor call"], docs: [] },
  { id: "p3", name: "Ticketing Automation", stage: "Review", team: ["Ana"], kpi: "Tickets Processed", risk: "Medium", progress: 85, spend: 5000, timeline: ["2025-05-01", "2025-09-10"], activity: ["Kickoff", "API test", "QA pass"], docs: [] },
  { id: "p4", name: "Club Website Rebuild", stage: "Complete", team: ["Luka", "Marko"], kpi: "Page Views", risk: "Low", progress: 100, spend: 12000, timeline: ["2024-12-01", "2025-04-01"], activity: ["Design", "Frontend", "Launch"], docs: [] },
  { id: "p5", name: "Data Lake Migration", stage: "Planned", team: ["Zoran"], kpi: "Latency", risk: "Medium", progress: 0, spend: 0, timeline: ["2025-10-01", "2026-01-10"], activity: ["Planning"], docs: [] }
];
const STAGES = ["Planned", "In Progress", "Review", "Complete", "Delayed"];
const STAGE_COLORS = { Planned: "#A3E635", "In Progress": "#FFD700", Review: "#00B4D8", Complete: "#27ef7d", Delayed: "#e94057" };

export default function DigitalTransformationCenter() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "", team: "", stage: "Planned", kpi: "", risk: "Low", progress: 0, spend: 0, timeline: ["", ""], activity: [], docs: []
  });

  // Board metrics
  const filteredProjects = projects.filter(
    p => (stageFilter === "All" || p.stage === stageFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.team.join(",").toLowerCase().includes(search.toLowerCase()))
  );
  const totalSpend = filteredProjects.reduce((sum, p) => sum + p.spend, 0);
  const avgProgress = filteredProjects.length ? (filteredProjects.reduce((s, p) => s + p.progress, 0) / filteredProjects.length).toFixed(1) : 0;
  const riskCount = stage => filteredProjects.filter(p => p.risk === stage).length;

  // Project detail (modal)
  function ProjectDetail({ proj, onClose }) {
    return (
      <motion.div className="dtc-detail-modal"
        initial={{ x: 500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 500, opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="dtc-detail-header">
          <div className="dtc-detail-title">
            <FaCogs style={{ marginRight: 7, color: "#FFD700" }} /> {proj.name}
          </div>
          <button className="dtc-close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="dtc-detail-meta">
          <span style={{ color: STAGE_COLORS[proj.stage] }}>{proj.stage}</span>
          <span style={{ color: proj.risk === "High" ? "#e94057" : proj.risk === "Medium" ? "#FFD700" : "#27ef7d" }}>{proj.risk} Risk</span>
          <span>Progress: <b>{proj.progress}%</b></span>
        </div>
        <div className="dtc-detail-grid">
          <div><b>KPI:</b> {proj.kpi}</div>
          <div><b>Team:</b> {proj.team.join(", ")}</div>
          <div><b>Spend:</b> €{proj.spend}</div>
          <div><b>Timeline:</b> {moment(proj.timeline[0]).format("YYYY-MM-DD")} – {moment(proj.timeline[1]).format("YYYY-MM-DD")}</div>
        </div>
        <div className="dtc-detail-section">
          <div><FaBolt style={{ color: "#FFD700" }} /> <b>Recent Activity:</b></div>
          <ul>{proj.activity.map((act, i) => <li key={i}><FaInfoCircle style={{ color: "#FFD700", marginRight: 5 }} />{act}</li>)}</ul>
        </div>
        <div className="dtc-detail-section">
          <div><FaCloudUploadAlt style={{ color: "#FFD700" }} /> <b>Docs:</b></div>
          <div>
            <input type="file" style={{ marginBottom: 9 }} onChange={e => {
              if (!e.target.files.length) return;
              setProjects(ps => ps.map(p => p.id === proj.id
                ? { ...p, docs: [...p.docs, e.target.files[0].name] }
                : p
              ));
            }} />
            <ul>{proj.docs.map((d, i) => <li key={i}><FaFolderOpen style={{ color: "#FFD700", marginRight: 5 }} />{d}</li>)}</ul>
          </div>
        </div>
        <div className="dtc-detail-section">
          <div><b>Audit History (Collapsible):</b></div>
          <details>
            <summary style={{ cursor: "pointer", color: "#FFD700", fontWeight: 700 }}>Show/Hide</summary>
            <ul>
              <li>2025-06-01: {proj.name} created.</li>
              <li>2025-07-01: Progress updated to {proj.progress}%.</li>
              <li>2025-07-03: Activity updated.</li>
            </ul>
          </details>
        </div>
      </motion.div>
    );
  }

  // Add new project
  function handleAddProject() {
    if (!newProject.name || !newProject.team || !newProject.kpi) return;
    setProjects(ps => [
      ...ps,
      {
        ...newProject,
        id: "p" + Date.now(),
        team: newProject.team.split(",").map(t => t.trim()),
        timeline: [moment().format("YYYY-MM-DD"), moment().add(120, "days").format("YYYY-MM-DD")],
        activity: ["Created"],
        docs: []
      }
    ]);
    setAddMode(false);
    setNewProject({
      name: "", team: "", stage: "Planned", kpi: "", risk: "Low", progress: 0, spend: 0, timeline: ["", ""], activity: [], docs: []
    });
  }

  return (
    <div className="dtc-board-main">
      <div className="dtc-board-header">
        <h2>
          <FaCogs style={{ marginRight: 13, color: "#FFD700", fontSize: 35 }} />
          Digital Transformation Center
        </h2>
        <div className="dtc-board-meta">
          <span><FaRocket style={{ color: "#27ef7d", marginRight: 3 }} /> Total Spend: <b>€{totalSpend}</b></span>
          <span><FaCloud style={{ color: "#00B4D8", marginRight: 3 }} /> Avg. Progress: <b>{avgProgress}%</b></span>
          <span><FaExclamationTriangle style={{ color: "#FFD700", marginRight: 3 }} /> High Risk: <b>{riskCount("High")}</b></span>
        </div>
      </div>
      <div className="dtc-board-controls">
        <span>
          <FaSearch /> <input className="dtc-board-search"
            value={search}
            placeholder="Search project/team…"
            onChange={e => setSearch(e.target.value)}
          />
        </span>
        <span>
          <FaFilter style={{ marginRight: 4 }} />{" "}
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="dtc-board-select">
            <option value="All">All Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </span>
        <button className="dtc-add-btn" onClick={() => setAddMode(true)}><FaPlus style={{ marginRight: 5 }} /> Add Project</button>
      </div>
      {/* Project Board */}
      <div className="dtc-board-table">
        <div className="dtc-board-table-header">
          <span>Name</span>
          <span>Stage</span>
          <span>Progress</span>
          <span>Team</span>
          <span>Risk</span>
          <span>KPI</span>
          <span>Spend (€)</span>
          <span>Open</span>
        </div>
        {filteredProjects.map(proj => (
          <motion.div key={proj.id}
            className="dtc-board-row"
            whileHover={{ scale: 1.01, boxShadow: "0 2px 20px #FFD70022" }}
            transition={{ duration: 0.23 }}
          >
            <span style={{ fontWeight: 900, color: "#FFD700" }}>{proj.name}</span>
            <span style={{ color: STAGE_COLORS[proj.stage] }}>{proj.stage}</span>
            <span>
              <div className="dtc-prog-bar-bg">
                <div className="dtc-prog-bar-fg" style={{
                  width: `${proj.progress}%`,
                  background: proj.progress === 100 ? "#27ef7d" : "#FFD700"
                }}></div>
              </div>
              <span style={{ fontWeight: 900, fontSize: 14, marginLeft: 6 }}>{proj.progress}%</span>
            </span>
            <span>{proj.team.join(", ")}</span>
            <span style={{ color: proj.risk === "High" ? "#e94057" : proj.risk === "Medium" ? "#FFD700" : "#27ef7d" }}>{proj.risk}</span>
            <span>{proj.kpi}</span>
            <span>€{proj.spend}</span>
            <span>
              <button className="dtc-open-btn" onClick={() => setSelected(proj)}><FaCheck /></button>
            </span>
          </motion.div>
        ))}
        {filteredProjects.length === 0 && (
          <div style={{ color: "#FFD700", padding: 29, textAlign: "center", fontWeight: 900 }}>No projects found.</div>
        )}
      </div>

      {/* Modal: Project detail */}
      <AnimatePresence>
        {selected && (
          <ProjectDetail proj={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      {/* Modal: Add project */}
      <AnimatePresence>
        {addMode && (
          <motion.div className="dtc-add-modal"
            initial={{ y: -350, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -350, opacity: 0 }} transition={{ duration: 0.32 }}>
            <div className="dtc-detail-header">
              <div className="dtc-detail-title"><FaPlus style={{ marginRight: 6 }} /> New Project</div>
              <button className="dtc-close-btn" onClick={() => setAddMode(false)}><FaTimes /></button>
            </div>
            <div className="dtc-add-form">
              <input placeholder="Project Name" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
              <input placeholder="Team (comma-separated)" value={newProject.team} onChange={e => setNewProject({ ...newProject, team: e.target.value })} />
              <select value={newProject.stage} onChange={e => setNewProject({ ...newProject, stage: e.target.value })}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input placeholder="KPI" value={newProject.kpi} onChange={e => setNewProject({ ...newProject, kpi: e.target.value })} />
              <select value={newProject.risk} onChange={e => setNewProject({ ...newProject, risk: e.target.value })}>
                {["Low", "Medium", "High"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <input type="number" placeholder="Progress (%)" min={0} max={100} value={newProject.progress} onChange={e => setNewProject({ ...newProject, progress: Number(e.target.value) })} />
              <input type="number" placeholder="Spend (€)" min={0} value={newProject.spend} onChange={e => setNewProject({ ...newProject, spend: Number(e.target.value) })} />
              <button className="dtc-add-btn" onClick={handleAddProject}><FaCheck style={{ marginRight: 5 }} /> Create</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
