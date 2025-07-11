import React, { useState } from "react";
import {
  FaClipboardList, FaUserTie, FaUser, FaCrown, FaPlus, FaTrash, FaCopy, FaSave, FaRegFilePdf,
   FaPen, FaFileExport, FaArchive, FaEye, FaChartLine, FaListOl, FaUndo, FaArrowUp, FaArrowDown
} from "react-icons/fa";
import "./AssessmentTemplateSuite.css";

// Extended question types
const QUESTION_TYPES = [
  { label: "1–5 Rating", value: "rating" },
  { label: "Yes/No", value: "yesno" },
  { label: "Short Text", value: "text" },
  { label: "Long Text", value: "longtext" },
  { label: "Multiple Choice", value: "mcq" }
];
// Roles
const ROLES = [
  { label: "Coach", icon: <FaUserTie /> },
  { label: "Athlete", icon: <FaUser /> },
  { label: "Parent", icon: <FaCrown /> },
  { label: "Board", icon: <FaClipboardList /> }
];
// Starter templates
const INIT_TEMPLATES = [
  {
    id: 1,
    title: "Coach Appraisal",
    assigned: "Coach",
    lastUsed: "2025-06-01",
    cycles: 3,
    trend: [3.8, 4.0, 4.2],
    questions: [
      { q: "Session quality", type: "rating" },
      { q: "Communication clarity", type: "rating" },
      { q: "Role expectations are clear", type: "yesno" },
      { q: "Comments", type: "longtext" }
    ]
  },
  {
    id: 2,
    title: "Athlete Well-being",
    assigned: "Athlete",
    lastUsed: "2025-05-19",
    cycles: 2,
    trend: [3.5, 3.6],
    questions: [
      { q: "Feel rested and healthy", type: "rating" },
      { q: "Happy with training intensity", type: "yesno" },
      { q: "Pick your favorite recovery method", type: "mcq", options: "Ice bath,Stretching,Massage,Sauna" }
    ]
  },
  {
    id: 3,
    title: "Boardroom Self-Audit",
    assigned: "Board",
    lastUsed: "2025-04-30",
    cycles: 2,
    trend: [4.2, 4.0],
    questions: [
      { q: "Met all compliance targets", type: "yesno" },
      { q: "Finance reviewed on time", type: "yesno" },
      { q: "What’s our biggest current risk?", type: "longtext" }
    ]
  }
];

export default function AssessmentTemplateSuite() {
  const [templates, setTemplates] = useState(INIT_TEMPLATES);
  const [selected, setSelected] = useState(INIT_TEMPLATES[0].id);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAssigned, setEditAssigned] = useState(ROLES[0].label);
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ q: "", type: "rating", options: "" });
  const [search, setSearch] = useState("");
  const [cloneName, setCloneName] = useState("");
  const [exportLog, setExportLog] = useState([]);
  const [archive, setArchive] = useState([]);
  const [tab, setTab] = useState("view"); // view, stats, preview
  const [draggedQ, setDraggedQ] = useState(null);

  const filtered = templates.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );
  const tpl = templates.find(t => t.id === selected);

  // Edit handling
  function beginEdit(t) {
    setEditTitle(t.title);
    setEditAssigned(t.assigned);
    setQuestions([...t.questions]);
    setEditMode(true);
  }
  function saveEdit() {
    setTemplates(tpls =>
      tpls.map(t =>
        t.id === tpl.id
          ? { ...t, title: editTitle, assigned: editAssigned, questions: [...questions] }
          : t
      )
    );
    setEditMode(false);
  }
  function addQ() {
    if (!newQ.q.trim()) return;
    setQuestions(qs => [...qs, { ...newQ }]);
    setNewQ({ q: "", type: "rating", options: "" });
  }
  function removeQ(idx) {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
  }
  function editQ(idx, field, val) {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: val } : q));
  }
  function cloneTemplate() {
    if (!cloneName.trim()) return;
    setTemplates(tpls => [
      ...tpls,
      { ...tpl, id: Date.now(), title: cloneName, lastUsed: "", cycles: 0, trend: [], questions: [...tpl.questions] }
    ]);
    setCloneName("");
  }
  function deleteTemplate(id) {
    setTemplates(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (selected === id && filtered.length > 0) setSelected(filtered[0].id);
      return filtered;
    });
  }
  function archiveTemplate(id) {
    const toArchive = templates.find(t => t.id === id);
    setArchive(archive => [...archive, toArchive]);
    setTemplates(tpls => tpls.filter(t => t.id !== id));
    if (selected === id && templates.length > 1) setSelected(templates[0].id);
  }
  function restoreTemplate(id) {
    const toRestore = archive.find(t => t.id === id);
    setTemplates(tpls => [...tpls, toRestore]);
    setArchive(archive => archive.filter(t => t.id !== id));
  }
  function exportTemplate(type) {
    setExportLog(log => [
      { date: new Date().toLocaleString(), title: tpl.title, type },
      ...log
    ]);
    alert(`Exported as ${type.toUpperCase()} (stub)`);
  }
  // Drag & drop reorder questions
  function onDragStart(idx) { setDraggedQ(idx); }
  function onDrop(idx) {
    if (draggedQ === null) return;
    setQuestions(qs => {
      const newQs = [...qs];
      const [moved] = newQs.splice(draggedQ, 1);
      newQs.splice(idx, 0, moved);
      return newQs;
    });
    setDraggedQ(null);
  }

  // Template preview (renders as user sees it)
  function renderQuestion(q, idx, mode = "preview") {
    switch (q.type) {
      case "rating":
        return (
          <div key={idx} className="ats-prev-q">
            <b>{q.q}</b>
            <div className="ats-prev-ratings">
              {[1, 2, 3, 4, 5].map(n => (
                <span className="ats-prev-rate" key={n}>{n}</span>
              ))}
            </div>
          </div>
        );
      case "yesno":
        return (
          <div key={idx} className="ats-prev-q">
            <b>{q.q}</b>
            <label><input type="radio" name={`yn${idx}`} /> Yes</label>
            <label><input type="radio" name={`yn${idx}`} /> No</label>
          </div>
        );
      case "text":
        return (
          <div key={idx} className="ats-prev-q">
            <b>{q.q}</b>
            <input className="ats-prev-txt" type="text" placeholder="Short answer" />
          </div>
        );
      case "longtext":
        return (
          <div key={idx} className="ats-prev-q">
            <b>{q.q}</b>
            <textarea className="ats-prev-txt" placeholder="Long answer" />
          </div>
        );
      case "mcq":
        return (
          <div key={idx} className="ats-prev-q">
            <b>{q.q}</b>
            <div>
              {q.options && q.options.split(",").map((opt, i) => (
                <label key={i} style={{ marginRight: 14 }}>
                  <input type="radio" name={`mcq${idx}`} /> {opt.trim()}
                </label>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  }

  // Stats: average, cycles, trends
  function renderStats(tpl) {
    return (
      <div className="ats-stats-panel">
        <div className="ats-stats-row">
          <span className="ats-chip ats-chip-main"><FaClipboardList /> {tpl.title}</span>
          <span className="ats-chip ats-chip-role">{ROLES.find(r => r.label === tpl.assigned)?.icon} {tpl.assigned}</span>
          <span className="ats-chip ats-chip-cycles">Cycles: {tpl.cycles}</span>
          <span className="ats-chip ats-chip-last">Last Used: {tpl.lastUsed}</span>
        </div>
        <div className="ats-stats-trend">
          {tpl.trend && tpl.trend.length > 0 && (
            <>
              <span className="ats-trend-label"><FaChartLine /> Satisfaction Trend:</span>
              {tpl.trend.map((v, i) => (
                <span key={i} className="ats-trend-dot" style={{
                  background: v > tpl.trend[0] ? "#1de682" : "#FFD700"
                }}>{v}</span>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ats-root">
      <div className="ats-header">
        <FaClipboardList style={{ color: "#FFD700", fontSize: 38, marginRight: 14 }} />
        <span className="ats-title">ASSESSMENT TEMPLATE SUITE</span>
        <span className="ats-score">
          <FaPen style={{ color: "#1de682", marginRight: 6 }} />
          Templates: <b>{templates.length}</b>
        </span>
      </div>
      <div className="ats-brand-watermark">
        <span>CourtEvo Vero – BE REAL. BE VERO.</span>
      </div>
      <div className="ats-main-grid">
        {/* Template Library */}
        <div className="ats-list">
          <input
            className="ats-search"
            placeholder="Search template…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <ul>
            {filtered.map(t =>
              <li
                key={t.id}
                className={`ats-tpl-card${t.id === selected ? " selected" : ""}`}
                onClick={() => setSelected(t.id)}
              >
                <span className="ats-tpl-title">{t.title}</span>
                <span className="ats-tpl-role">{ROLES.find(r => r.label === t.assigned)?.icon} {t.assigned}</span>
                <span className="ats-tpl-cycles">Cycles: {t.cycles}</span>
                <span className="ats-tpl-trend">
                  {t.trend.length > 0 &&
                    (t.trend[t.trend.length - 1] > t.trend[0]
                      ? <FaArrowUp style={{ color: "#1de682" }} />
                      : <FaArrowDown style={{ color: "#FF4444" }} />)
                  }
                  {t.trend.length > 0 && t.trend[t.trend.length - 1]}
                </span>
                <button className="ats-tpl-edit" title="Edit" onClick={e => { e.stopPropagation(); beginEdit(t); }}>
                  <FaPen />
                </button>
                <button className="ats-tpl-delete" title="Delete" onClick={e => { e.stopPropagation(); deleteTemplate(t.id); }}>
                  <FaTrash />
                </button>
                <button className="ats-tpl-archive" title="Archive" onClick={e => { e.stopPropagation(); archiveTemplate(t.id); }}>
                  <FaArchive />
                </button>
                <button className="ats-tpl-clone" title="Clone" onClick={e => { e.stopPropagation(); setCloneName(t.title + " (Copy)"); }}>
                  <FaCopy />
                </button>
              </li>
            )}
          </ul>
          {/* Archive */}
          <div className="ats-archive-list">
            {archive.length > 0 && <h4>Archived</h4>}
            <ul>
              {archive.map(t =>
                <li key={t.id} className="ats-tpl-card archived">
                  <span className="ats-tpl-title">{t.title}</span>
                  <button className="ats-tpl-restore" onClick={() => restoreTemplate(t.id)} title="Restore"><FaUndo /></button>
                </li>
              )}
            </ul>
          </div>
        </div>
        {/* Template Tabs: View / Stats / Preview */}
        <div className="ats-dashboard">
          {!editMode ? (
            <>
              <div className="ats-tab-row">
                <button className={tab === "view" ? "active" : ""} onClick={() => setTab("view")}><FaListOl /> View</button>
                <button className={tab === "stats" ? "active" : ""} onClick={() => setTab("stats")}><FaChartLine /> Stats</button>
                <button className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}><FaEye /> Preview</button>
              </div>
              {tab === "view" && (
                <>
                  <div className="ats-tpl-header">
                    <span className="ats-tpl-main">{tpl.title}</span>
                    <span className="ats-tpl-typechip">
                      {ROLES.find(r => r.label === tpl.assigned)?.icon} {tpl.assigned}
                    </span>
                    <span className="ats-tpl-cycles-chip">Cycles: {tpl.cycles}</span>
                    <span className="ats-tpl-last-chip">Last: {tpl.lastUsed}</span>
                  </div>
                  <div className="ats-tpl-questions">
                    <h4>Questions</h4>
                    <ul>
                      {tpl.questions.map((q, i) => (
                        <li key={i}>
                          <b>{q.q}</b> <span className="ats-qtype">{QUESTION_TYPES.find(t => t.value === q.type)?.label}</span>
                          {q.type === "mcq" && <span className="ats-q-mcq">Options: {q.options}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="ats-tpl-actions">
                    <button className="ats-edit-btn" onClick={() => beginEdit(tpl)}><FaPen /> Edit</button>
                    <button className="ats-export-btn" onClick={() => exportTemplate("pdf")}><FaRegFilePdf /> Export PDF</button>
                    <button className="ats-export-btn" onClick={() => exportTemplate("csv")}><FaFileExport /> Export CSV</button>
                  </div>
                  {cloneName !== "" && (
                    <div className="ats-clone-row">
                      <input
                        className="ats-clone-input"
                        value={cloneName}
                        onChange={e => setCloneName(e.target.value)}
                      />
                      <button className="ats-clone-btn" onClick={cloneTemplate}><FaCopy /> Clone</button>
                    </div>
                  )}
                </>
              )}
              {tab === "stats" && renderStats(tpl)}
              {tab === "preview" && (
                <div className="ats-preview-panel">
                  <h4>Template Preview</h4>
                  {tpl.questions.map((q, i) => renderQuestion(q, i))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="ats-tpl-header">
                <input
                  className="ats-title-edit"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Template title"
                />
                <select
                  className="ats-role-edit"
                  value={editAssigned}
                  onChange={e => setEditAssigned(e.target.value)}
                >
                  {ROLES.map(r => (
                    <option key={r.label} value={r.label}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="ats-tpl-questions">
                <h4>Edit Questions</h4>
                <ul>
                  {questions.map((q, i) => (
                    <li
                      key={i}
                      draggable
                      onDragStart={() => onDragStart(i)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => onDrop(i)}
                      title="Drag to reorder"
                      className="ats-q-draggable"
                    >
                      <input
                        className="ats-q-edit"
                        value={q.q}
                        onChange={e => editQ(i, "q", e.target.value)}
                        placeholder="Question"
                      />
                      <select
                        className="ats-qtype-edit"
                        value={q.type}
                        onChange={e => editQ(i, "type", e.target.value)}
                      >
                        {QUESTION_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      {q.type === "mcq" &&
                        <input
                          className="ats-q-mcq-edit"
                          value={q.options || ""}
                          onChange={e => editQ(i, "options", e.target.value)}
                          placeholder="Comma-separated options"
                        />
                      }
                      <button className="ats-q-del" onClick={() => removeQ(i)}><FaTrash /></button>
                    </li>
                  ))}
                  <li>
                    <input
                      className="ats-q-edit"
                      value={newQ.q}
                      onChange={e => setNewQ(q => ({ ...q, q: e.target.value }))}
                      placeholder="Add new question"
                    />
                    <select
                      className="ats-qtype-edit"
                      value={newQ.type}
                      onChange={e => setNewQ(q => ({ ...q, type: e.target.value }))}
                    >
                      {QUESTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {newQ.type === "mcq" &&
                      <input
                        className="ats-q-mcq-edit"
                        value={newQ.options || ""}
                        onChange={e => setNewQ(q => ({ ...q, options: e.target.value }))}
                        placeholder="Comma-separated options"
                      />
                    }
                    <button className="ats-q-add" onClick={addQ}><FaPlus /></button>
                  </li>
                </ul>
              </div>
              <div className="ats-tpl-actions">
                <button className="ats-save-btn" onClick={saveEdit}><FaSave /> Save</button>
                <button className="ats-cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </>
          )}
        </div>
        {/* Usage/Export Log */}
        <div className="ats-log">
          <h4>Export Log</h4>
          <ul>
            {exportLog.length === 0 && <li>No exports yet.</li>}
            {exportLog.map((e, i) =>
              <li key={i}>
                {e.date}: <b>{e.title}</b> ({e.type.toUpperCase()})
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
