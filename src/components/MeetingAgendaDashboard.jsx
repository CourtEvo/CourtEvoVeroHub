import React, { useState, useEffect, useRef } from "react";
import { FaCheck, FaExclamationTriangle, FaPlus, FaTrash, FaUserCircle, FaChevronUp, FaChevronDown, FaPaperclip, FaFileDownload, FaLink, FaHistory, FaClipboardList, FaLightbulb, FaSave, FaEdit, FaFolderOpen, FaFilter, FaRegClone, FaListAlt, FaDownload } from "react-icons/fa";
import Papa from "papaparse";
import { saveAs } from "file-saver";

// --- AI SUGGESTION LOGIC (demo, non-API) ---
const getAISuggestions = (agenda) => {
  // Very basic; swap with OpenAI call if needed
  if (!agenda) return [];
  let suggestions = [];
  if (agenda.items.length === 0) {
    suggestions.push("Add main club priorities to the agenda. For example: 'Set budget targets', 'Approve player contracts', 'Review medical reports'.");
  } else {
    const statusCounts = agenda.items.reduce((a, b) => {
      a[b.status] = (a[b.status] || 0) + 1;
      return a;
    }, {});
    if ((statusCounts.pending || 0) > 3) suggestions.push("There are several 'pending' items. Consider reviewing these for next steps.");
    if (agenda.items.some(i => i.type === "decision" && (i.votes?.yes || 0) === 0)) suggestions.push("Some decisions have no votes. Remind board to review & vote.");
    if (agenda.items.some(i => (i.due && new Date(i.due) < new Date()))) suggestions.push("One or more items are overdue. Consider rescheduling or updating statuses.");
    if (agenda.items.some(i => i.files && i.files.length === 0)) suggestions.push("Consider attaching key supporting documents to important agenda items.");
    if (agenda.items.length > 8) suggestions.push("Meeting agenda is long. Consider grouping similar items or using sub-agendas for focus.");
  }
  if (suggestions.length === 0) suggestions.push("No major suggestions. Good agenda management!");
  return suggestions;
};

// --- MULTI-AGENDA TEMPLATES ---
const agendaTemplates = [
  {
    name: "Standard Board Meeting",
    items: [
      { type: "decision", title: "Approve Previous Minutes", assigned: "Secretary", due: "", status: "pending", notes: "Review and approve prior meeting notes", votes: { yes: 0, no: 0, abstain: 0 }, files: [], links: [] },
      { type: "action", title: "Financial Overview", assigned: "Treasurer", due: "", status: "pending", notes: "Share quarterly financials", votes: { yes: 0, no: 0, abstain: 0 }, files: [], links: [] },
      { type: "decision", title: "Player Contract Renewals", assigned: "Sport Director", due: "", status: "pending", notes: "Approve/deny contract extensions", votes: { yes: 0, no: 0, abstain: 0 }, files: [], links: [] },
      { type: "action", title: "Set Next Training Camp Dates", assigned: "Head Coach", due: "", status: "pending", notes: "Schedule preseason camp", votes: { yes: 0, no: 0, abstain: 0 }, files: [], links: [] },
    ]
  },
  {
    name: "Season Kickoff",
    items: [
      { type: "decision", title: "Approve Season Objectives", assigned: "President", due: "", status: "pending", notes: "Set targets for the new season", votes: { yes: 0, no: 0, abstain: 0 }, files: [], links: [] },
      { type: "action", title: "Media Day Planning", assigned: "PR Officer", due: "", status: "pending", notes: "Set up media day logistics", votes: { yes: 0, no: 0, abstain: 0 }, files: [], links: [] },
      { type: "decision", title: "Sponsorship Package Approval", assigned: "Marketing", due: "", status: "pending", notes: "Review and approve sponsor deals", votes: { yes: 0, no: 0, abstain: 0 }, files: [], links: [] }
    ]
  }
];

// --- INITIAL DATA ---
const initialAgendas = [
  {
    id: 1,
    title: "Quarterly Board Meeting",
    date: new Date().toISOString().slice(0, 10),
    items: [
      {
        id: 11,
        type: "decision",
        title: "Approve Annual Budget",
        assigned: "Marko",
        due: new Date().toISOString().slice(0, 10),
        status: "pending",
        notes: "Budget requires majority vote",
        aiFeedback: "",
        votes: { yes: 3, no: 0, abstain: 1 },
        files: [],
        links: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "Marko",
      }
    ],
  }
];

const statusOptions = [
  "pending", "in review", "for approval", "approved", "rejected", "complete", "archived"
];

function MeetingAgendaDashboard() {
  // --- State ---
  const [agendas, setAgendas] = useState(() => {
    let data = JSON.parse(localStorage.getItem("courtEvoMeetingAgendas") || "null");
    if (!data) data = initialAgendas;
    // Patch all votes for robustness
    return data.map(a => ({
      ...a,
      items: a.items.map(i =>
        i.votes
          ? i
          : { ...i, votes: { yes: 0, no: 0, abstain: 0 } }
      )
    }));
  });
  const [activeAgenda, setActiveAgenda] = useState(agendas.length ? agendas[0].id : null);
  const [newItem, setNewItem] = useState({
    type: "decision",
    title: "",
    assigned: "",
    due: "",
    status: "pending",
    notes: "",
    aiFeedback: "",
    files: [],
    links: [],
    votes: { yes: 0, no: 0, abstain: 0 }
  });
  const [isEditingAgenda, setIsEditingAgenda] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState("");
  const [newAgendaDate, setNewAgendaDate] = useState(new Date().toISOString().slice(0, 10));
  const [agendaFilter, setAgendaFilter] = useState("all");
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem("courtEvoMeetingAgendas", JSON.stringify(agendas));
  }, [agendas]);
  // Patch votes for old/legacy data
  useEffect(() => {
    setAgendas(ags =>
      ags.map(a => ({
        ...a,
        items: a.items.map(i =>
          i.votes
            ? i
            : { ...i, votes: { yes: 0, no: 0, abstain: 0 } }
        )
      }))
    );
  }, []);

  // --- Agenda actions ---
  const addAgenda = (templateIdx = null) => {
    if (!newAgendaTitle.trim()) return;
    const templateItems = templateIdx !== null ? agendaTemplates[templateIdx].items.map((item, idx) => ({
      ...item,
      id: Date.now() + idx,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Admin"
    })) : [];
    const newAgenda = {
      id: Date.now(),
      title: newAgendaTitle,
      date: newAgendaDate,
      items: templateItems
    };
    setAgendas(ags => [...ags, newAgenda]);
    setActiveAgenda(newAgenda.id);
    setNewAgendaTitle("");
    setNewAgendaDate(new Date().toISOString().slice(0, 10));
    setIsEditingAgenda(false);
  };
  const deleteAgenda = id => {
    setAgendas(ags => ags.filter(a => a.id !== id));
    if (activeAgenda === id && agendas.length > 1) setActiveAgenda(agendas[0].id);
  };
  const cloneAgenda = id => {
    const toClone = agendas.find(a => a.id === id);
    if (!toClone) return;
    const cloned = {
      ...toClone,
      id: Date.now(),
      title: toClone.title + " (Copy)",
      date: new Date().toISOString().slice(0, 10),
      items: toClone.items.map(item => ({ ...item, id: Date.now() + Math.floor(Math.random() * 10000) }))
    };
    setAgendas(ags => [...ags, cloned]);
    setActiveAgenda(cloned.id);
  };

  // --- Item-level actions (as in earlier code, same robust fixes) ---
  const setStatus = (aid, iid, status) => {
    setAgendas(ags =>
      ags.map(a =>
        a.id === aid
          ? {
              ...a,
              items: a.items.map(i =>
                i.id === iid ? { ...i, status, updatedAt: new Date().toISOString() } : i
              ),
            }
          : a
      )
    );
  };

  const vote = (aid, iid, field) => {
    setAgendas(ags =>
      ags.map(a =>
        a.id === aid
          ? {
              ...a,
              items: a.items.map(i =>
                i.id === iid
                  ? {
                      ...i,
                      votes: {
                        ...(i.votes || { yes: 0, no: 0, abstain: 0 }),
                        [field]: ((i.votes?.[field] || 0) + 1),
                      },
                      updatedAt: new Date().toISOString(),
                    }
                  : i
              ),
            }
          : a
      )
    );
  };

  const setAIFeedback = (aid, iid, aiFeedback) => {
    setAgendas(ags =>
      ags.map(a =>
        a.id === aid
          ? {
              ...a,
              items: a.items.map(i =>
                i.id === iid ? { ...i, aiFeedback, updatedAt: new Date().toISOString() } : i
              ),
            }
          : a
      )
    );
  };

  const attachFile = (aid, iid, file) => {
    setAgendas(ags =>
      ags.map(a =>
        a.id === aid
          ? {
              ...a,
              items: a.items.map(i =>
                i.id === iid
                  ? { ...i, files: [...(i.files || []), file], updatedAt: new Date().toISOString() }
                  : i
              ),
            }
          : a
      )
    );
  };

  const linkItem = (aid, iid, targetId) => {
    setAgendas(ags =>
      ags.map(a =>
        a.id === aid
          ? {
              ...a,
              items: a.items.map(i =>
                i.id === iid
                  ? { ...i, links: [...(i.links || []), targetId], updatedAt: new Date().toISOString() }
                  : i
              ),
            }
          : a
      )
    );
  };

  const deleteItem = (aid, iid) => {
    setAgendas(ags =>
      ags.map(a =>
        a.id === aid
          ? {
              ...a,
              items: a.items.filter(i => i.id !== iid),
            }
          : a
      )
    );
  };

  const moveItem = (aid, idx, dir) => {
    setAgendas(ags =>
      ags.map(a => {
        if (a.id !== aid) return a;
        const items = [...a.items];
        const [item] = items.splice(idx, 1);
        items.splice(idx + dir, 0, item);
        return { ...a, items };
      })
    );
  };

  const addItemToAgenda = aid => {
    if (!newItem.title.trim()) return;
    setAgendas(ags =>
      ags.map(a =>
        a.id === aid
          ? {
              ...a,
              items: [
                ...a.items,
                {
                  ...newItem,
                  id: Date.now(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: "Admin",
                  votes: { ...newItem.votes },
                  files: [],
                  links: [],
                },
              ],
            }
          : a
      )
    );
    setNewItem({
      type: "decision",
      title: "",
      assigned: "",
      due: "",
      status: "pending",
      notes: "",
      aiFeedback: "",
      files: [],
      links: [],
      votes: { yes: 0, no: 0, abstain: 0 }
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const agenda = agendas.find(a => a.id === activeAgenda);
    if (!agenda) return;
    const rows = agenda.items.map(item => ({
      ...item,
      files: item.files?.map(f => f.name).join(";"),
      links: item.links?.join(";"),
      aiFeedback: item.aiFeedback,
      votes: `Yes:${item.votes?.yes || 0},No:${item.votes?.no || 0},Abstain:${item.votes?.abstain || 0}`
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${agenda.title.replace(/\s+/g, "_")}_Agenda.csv`);
  };

  // Agenda filter (by status, date, etc.)
  const filteredAgendas = agendaFilter === "all" ? agendas : agendas.filter(a =>
    a.items.some(i => i.status === agendaFilter)
  );

  // --- RENDER ---
  return (
    <div style={{ padding: 18, background: "#181e23", minHeight: "92vh", borderRadius: 18, boxShadow: "0 2px 24px #FFD70015" }}>
      <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 34, letterSpacing: 1, marginBottom: 16 }}>
        Meeting Agenda Dashboard
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 10 }}>
        <button onClick={() => setIsEditingAgenda(true)} style={navBtnStyle}>
          <FaPlus /> Add New Agenda
        </button>
        <div style={{ color: "#FFD700", fontWeight: 700, marginLeft: 10 }}>
          <FaFilter /> Filter:
        </div>
        <select value={agendaFilter} onChange={e => setAgendaFilter(e.target.value)} style={navBtnStyle}>
          <option value="all">All</option>
          {statusOptions.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={handleExportCSV} style={navBtnStyle}><FaDownload /> Export CSV</button>
        <button onClick={() => setShowAISuggestions(s => !s)} style={navBtnStyle}>
          <FaLightbulb /> {showAISuggestions ? "Hide" : "Show"} AI Suggestions
        </button>
      </div>
      <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
        {filteredAgendas.map(a => (
          <button
            key={a.id}
            onClick={() => setActiveAgenda(a.id)}
            style={{
              background: activeAgenda === a.id ? "#FFD700" : "#232a2e",
              color: activeAgenda === a.id ? "#232a2e" : "#FFD700",
              fontWeight: 800,
              border: "none",
              borderRadius: 8,
              fontSize: 18,
              padding: "11px 29px",
              boxShadow: activeAgenda === a.id ? "0 2px 10px #FFD70033" : "none",
              marginBottom: 5,
              minWidth: 210,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>
              <FaClipboardList style={{ marginRight: 4 }} />
              {a.title} — {a.date}
            </span>
            <span>
              <button title="Clone" onClick={e => { e.stopPropagation(); cloneAgenda(a.id); }} style={navBtnSm}><FaRegClone /></button>
              <button title="Delete" onClick={e => { e.stopPropagation(); deleteAgenda(a.id); }} style={navBtnSm}><FaTrash /></button>
            </span>
          </button>
        ))}
      </div>

      {/* ADD/EDIT AGENDA FORM */}
      {isEditingAgenda && (
        <div style={{
          background: "#232a2e", borderRadius: 14, padding: 18, marginBottom: 18, boxShadow: "0 2px 16px #FFD70022"
        }}>
          <h3 style={{ color: "#FFD700", fontWeight: 800 }}>New Agenda</h3>
          <input type="text" placeholder="Agenda Title" value={newAgendaTitle}
            onChange={e => setNewAgendaTitle(e.target.value)}
            style={{ ...inputStyle, minWidth: 200, fontWeight: 700, marginRight: 9 }}
          />
          <input type="date" value={newAgendaDate} onChange={e => setNewAgendaDate(e.target.value)} style={inputStyle} />
          <span style={{ color: "#FFD700", fontWeight: 600, margin: "0 16px" }}>or use a template:</span>
          {agendaTemplates.map((tpl, idx) => (
            <button key={tpl.name} onClick={() => { setNewAgendaTitle(tpl.name); addAgenda(idx); }}
              style={navBtnStyle}><FaListAlt /> {tpl.name}</button>
          ))}
          <button onClick={() => addAgenda(null)} style={navBtnStyle}><FaSave /> Save Agenda</button>
          <button onClick={() => setIsEditingAgenda(false)} style={navBtnStyle}><FaTrash /> Cancel</button>
        </div>
      )}

      {/* AI SUGGESTIONS PANEL */}
      {showAISuggestions && (
        <div style={{
          background: "#283E51", borderRadius: 13, marginBottom: 22, padding: "11px 18px", boxShadow: "0 2px 9px #FFD70044"
        }}>
          <h4 style={{ color: "#FFD700", fontWeight: 900, fontSize: 17, margin: "4px 0 7px 0" }}>
            <FaLightbulb style={{ color: "#1de682", fontSize: 17, marginRight: 5 }} />
            Board/AI Smart Suggestions
          </h4>
          <ul style={{ color: "#1de682", fontWeight: 700, margin: 0, paddingLeft: 19, fontSize: 15 }}>
            {(getAISuggestions(agendas.find(a => a.id === activeAgenda)) || []).map((s, i) =>
              <li key={i} style={{ marginBottom: 2 }}>{s}</li>
            )}
          </ul>
        </div>
      )}

      {/* MAIN AGENDA TABLE */}
      {(() => {
        const agenda = agendas.find(a => a.id === activeAgenda);
        if (!agenda) return <div style={{ color: "#FFD700", fontWeight: 900 }}>Select or add an agenda to begin.</div>;
        return (
          <div>
            <h3 style={{
              color: "#FFD700", fontWeight: 900, fontSize: 25, margin: "12px 0"
            }}>
              {agenda.title} <span style={{ color: "#27ef7d", fontWeight: 600, fontSize: 17 }}>({agenda.date})</span>
            </h3>
            <div style={{ color: "#FFD700aa", fontWeight: 500, marginBottom: 9, fontSize: 15 }}>
              Total items: <b>{agenda.items.length}</b>
              {" | "} Decisions: <b>{agenda.items.filter(i => i.type === "decision").length}</b>
              {" | "} Actions: <b>{agenda.items.filter(i => i.type === "action").length}</b>
              {" | "} Pending: <b>{agenda.items.filter(i => i.status === "pending").length}</b>
              {" | "} Complete: <b>{agenda.items.filter(i => i.status === "complete").length}</b>
              {" | "} Last updated: <b>{agenda.items.length && agenda.items[agenda.items.length - 1].updatedAt ? new Date(agenda.items[agenda.items.length - 1].updatedAt).toLocaleString() : "N/A"}</b>
            </div>
            {/* AI summary */}
            <div style={{ color: "#1de682", fontWeight: 700, marginBottom: 9, fontSize: 15 }}>
              <FaLightbulb /> AI Agenda Summary: <span style={{ color: "#fff" }}>
                {
                  agenda.items.length === 0
                    ? "No agenda items yet. Add items or use a template."
                    : `Meeting contains ${agenda.items.filter(i => i.type === "decision").length} decisions and ${agenda.items.filter(i => i.type === "action").length} actions.`
                }
              </span>
            </div>
            <table style={{ width: "100%", background: "#232a2e", borderRadius: 8, marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={thS}>Type</th>
                  <th style={thS}>Title</th>
                  <th style={thS}>Assigned</th>
                  <th style={thS}>Due</th>
                  <th style={thS}>Status</th>
                  <th style={thS}>Votes</th>
                  <th style={thS}>Files</th>
                  <th style={thS}>Links</th>
                  <th style={thS}>Notes</th>
                  <th style={thS}>AI Feedback</th>
                  <th style={thS}>Move</th>
                  <th style={thS}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agenda.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={tdS}>
                      <select value={item.type} onChange={e => {
                        const val = e.target.value;
                        setAgendas(ags =>
                          ags.map(a => a.id === agenda.id
                            ? { ...a, items: a.items.map((it, i) => i === idx ? { ...it, type: val } : it) }
                            : a
                          )
                        );
                      }} style={{ ...inputStyle, fontWeight: 900, color: "#232a2e", background: "#FFD700" }}>
                        <option value="decision">decision</option>
                        <option value="action">action</option>
                      </select>
                    </td>
                    <td style={tdS}>
                      <input type="text" value={item.title} onChange={e => {
                        const val = e.target.value;
                        setAgendas(ags =>
                          ags.map(a => a.id === agenda.id
                            ? { ...a, items: a.items.map((it, i) => i === idx ? { ...it, title: val } : it) }
                            : a
                          )
                        );
                      }}
                        style={{ ...inputStyle, minWidth: 130, fontWeight: 700 }} />
                    </td>
                    <td style={tdS}>
                      <input type="text" value={item.assigned} onChange={e => {
                        const val = e.target.value;
                        setAgendas(ags =>
                          ags.map(a => a.id === agenda.id
                            ? { ...a, items: a.items.map((it, i) => i === idx ? { ...it, assigned: val } : it) }
                            : a
                          )
                        );
                      }}
                        style={{ ...inputStyle, minWidth: 90, fontWeight: 700 }} />
                    </td>
                    <td style={tdS}>
                      <input type="date" value={item.due} onChange={e => {
                        const val = e.target.value;
                        setAgendas(ags =>
                          ags.map(a => a.id === agenda.id
                            ? { ...a, items: a.items.map((it, i) => i === idx ? { ...it, due: val } : it) }
                            : a
                          )
                        );
                      }}
                        style={inputStyle} />
                    </td>
                    <td style={tdS}>
                      <select value={item.status} onChange={e => setStatus(agenda.id, item.id, e.target.value)}
                        style={{
                          padding: 4, borderRadius: 4, border: "none",
                          background: "#FFD700", color: "#232a2e", fontWeight: 800
                        }}>
                        {statusOptions.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={tdS}>
                      <span style={voteSpan}><FaCheck color="#1de682" /> {item.votes?.yes || 0}</span>
                      <span style={{ ...voteSpan, background: "#e94057", color: "#fff" }}><FaExclamationTriangle /> {item.votes?.no || 0}</span>
                      <span style={{ ...voteSpan, background: "#bbb", color: "#232a2e" }}>= {item.votes?.abstain || 0}</span>
                      <span>
                        <button onClick={() => vote(agenda.id, item.id, "yes")} style={voteBtn}>+1</button>
                        <button onClick={() => vote(agenda.id, item.id, "no")} style={voteBtn}>-1</button>
                        <button onClick={() => vote(agenda.id, item.id, "abstain")} style={voteBtn}>=</button>
                      </span>
                    </td>
                    <td style={tdS}>
                      <input type="file" style={{ display: "none" }} id={`attach-file-${item.id}`} onChange={e => {
                        if (e.target.files.length) attachFile(agenda.id, item.id, e.target.files[0]);
                      }} />
                      <label htmlFor={`attach-file-${item.id}`} style={{ cursor: "pointer" }}>
                        <FaPaperclip />
                      </label>
                      {item.files && item.files.map((file, i) =>
                        <span key={i} style={{
                          background: "#FFD70033", borderRadius: 5, padding: "2px 8px", marginRight: 4,
                          display: "inline-flex", alignItems: "center", gap: 3
                        }}>
                          <FaFileDownload style={{ fontSize: 13 }} />
                          {file.name}
                        </span>
                      )}
                    </td>
                    <td style={tdS}>
                      {item.links && item.links.map((lid, i) =>
                        <span key={i} style={{
                          background: "#27ef7d44", borderRadius: 5, padding: "2px 8px", marginRight: 4,
                          display: "inline-flex", alignItems: "center", gap: 3
                        }}>
                          <FaLink style={{ fontSize: 13 }} />
                          {lid}
                        </span>
                      )}
                      <button onClick={() => {
                        const otherIds = agenda.items.filter(i => i.id !== item.id).map(i => i.id);
                        if (otherIds.length === 0) return;
                        const target = window.prompt("Enter ID to link (choose from: " + otherIds.join(",") + "):", otherIds[0]);
                        if (!target) return;
                        linkItem(agenda.id, item.id, target);
                      }}
                        style={navBtnSm}><FaLink /></button>
                    </td>
                    <td style={tdS}>
                      <input type="text" value={item.notes} onChange={e => {
                        const val = e.target.value;
                        setAgendas(ags =>
                          ags.map(a => a.id === agenda.id
                            ? { ...a, items: a.items.map((it, i) => i === idx ? { ...it, notes: val } : it) }
                            : a
                          )
                        );
                      }}
                        style={{ ...inputStyle, minWidth: 110, fontWeight: 700 }} />
                    </td>
                    <td style={tdS}>
                      <textarea value={item.aiFeedback || ""} onChange={e => setAIFeedback(agenda.id, item.id, e.target.value)}
                        placeholder="AI feedback"
                        style={{
                          background: "#181e23", color: "#FFD700",
                          border: "1.3px solid #FFD70022", borderRadius: 5, padding: 3, minWidth: 80, fontWeight: 700, fontSize: 12
                        }} />
                    </td>
                    <td style={tdS}>
                      <button onClick={() => moveItem(agenda.id, idx, -1)} disabled={idx === 0} style={navBtnSm}><FaChevronUp /></button>
                      <button onClick={() => moveItem(agenda.id, idx, 1)} disabled={idx === agenda.items.length - 1} style={navBtnSm}><FaChevronDown /></button>
                    </td>
                    <td style={tdS}>
                      <button onClick={() => deleteItem(agenda.id, item.id)} style={navBtnSm}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
                {/* --- ADD NEW ITEM ROW --- */}
                <tr>
                  <td style={tdS}>
                    <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                      style={{ ...inputStyle, fontWeight: 900, color: "#232a2e", background: "#FFD700" }}>
                      <option value="decision">decision</option>
                      <option value="action">action</option>
                    </select>
                  </td>
                  <td style={tdS}>
                    <input type="text" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="Title" style={{ ...inputStyle, minWidth: 130, fontWeight: 700 }} />
                  </td>
                  <td style={tdS}>
                    <input type="text" value={newItem.assigned} onChange={e => setNewItem({ ...newItem, assigned: e.target.value })}
                      placeholder="Assigned" style={{ ...inputStyle, minWidth: 90, fontWeight: 700 }} />
                  </td>
                  <td style={tdS}>
                    <input type="date" value={newItem.due} onChange={e => setNewItem({ ...newItem, due: e.target.value })}
                      style={inputStyle} />
                  </td>
                  <td style={tdS}>
                    <select value={newItem.status} onChange={e => setNewItem({ ...newItem, status: e.target.value })}
                      style={{
                        padding: 4, borderRadius: 4, border: "none",
                        background: "#FFD700", color: "#232a2e", fontWeight: 800
                      }}>
                      {statusOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={tdS}>
                    <span style={voteSpan}><FaCheck color="#1de682" /> {newItem.votes.yes}</span>
                    <span style={{ ...voteSpan, background: "#e94057", color: "#fff" }}><FaExclamationTriangle /> {newItem.votes.no}</span>
                    <span style={{ ...voteSpan, background: "#bbb", color: "#232a2e" }}>= {newItem.votes.abstain}</span>
                  </td>
                  <td style={tdS}>
                    <input type="file" style={{ display: "none" }} id="attach-file-new" onChange={e => {
                      if (e.target.files.length) setNewItem(item => ({
                        ...item,
                        files: [...(item.files || []), e.target.files[0]]
                      }));
                    }} />
                    <label htmlFor="attach-file-new" style={{ cursor: "pointer" }}>
                      <FaPaperclip />
                    </label>
                    {newItem.files && newItem.files.map((file, i) =>
                      <span key={i} style={{
                        background: "#FFD70033", borderRadius: 5, padding: "2px 8px", marginRight: 4,
                        display: "inline-flex", alignItems: "center", gap: 3
                      }}>
                        <FaFileDownload style={{ fontSize: 13 }} />
                        {file.name}
                      </span>
                    )}
                  </td>
                  <td style={tdS}>—</td>
                  <td style={tdS}>
                    <input type="text" value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                      placeholder="Note/Action/Reason" style={{ ...inputStyle, minWidth: 110, fontWeight: 700 }} />
                  </td>
                  <td style={tdS}>
                    <textarea value={newItem.aiFeedback} onChange={e => setNewItem({ ...newItem, aiFeedback: e.target.value })}
                      placeholder="AI feedback"
                      style={{
                        background: "#181e23", color: "#FFD700",
                        border: "1.3px solid #FFD70022", borderRadius: 5, padding: 3, minWidth: 80, fontWeight: 700, fontSize: 12
                      }} />
                  </td>
                  <td style={tdS}>—</td>
                  <td style={tdS}>
                    <button onClick={() => addItemToAgenda(agenda.id)}
                      style={{
                        background: "#1de682", color: "#232a2e", borderRadius: 7,
                        fontWeight: 900, padding: "5px 11px", border: "none", fontSize: 16
                      }}>
                      <FaPlus /> Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ color: "#FFD700bb", fontWeight: 600, marginTop: 5, fontSize: 15 }}>
              Attachments and links are visible to all with access. Remember to update status for each item!
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// --- STYLES ---
const thS = {
  background: "#1b232e", color: "#FFD700", fontWeight: 900, fontSize: 15, padding: "7px 10px",
  border: "none", borderRadius: 5
};
const tdS = {
  background: "#232a2e", color: "#fff", fontWeight: 700, fontSize: 14, padding: "7px 9px",
  border: "none", borderRadius: 5, textAlign: "center"
};
const voteSpan = {
  background: "#FFD70044", color: "#232a2e", borderRadius: 4, padding: "1px 7px", fontWeight: 700, marginRight: 2
};
const voteBtn = {
  background: "#FFD700", color: "#232a2e", borderRadius: 4, border: "none", fontWeight: 800, marginLeft: 4, padding: "1px 7px", cursor: "pointer"
};
const navBtnStyle = {
  background: "#232a2e", color: "#FFD700", fontWeight: 700, border: "none", borderRadius: 7, padding: "7px 18px", fontSize: 15, cursor: "pointer", marginRight: 8
};
const navBtnSm = {
  background: "#FFD700", color: "#232a2e", borderRadius: 4, border: "none", fontWeight: 900, fontSize: 13, marginLeft: 5, cursor: "pointer", padding: "3px 6px"
};
const inputStyle = {
  background: "#181e23", color: "#FFD700", border: "1.3px solid #FFD70022", borderRadius: 5, padding: 4, margin: 0
};

export default MeetingAgendaDashboard;
