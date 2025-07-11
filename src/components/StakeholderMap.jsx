import React, { useState } from "react";
import { FaUsers, FaUserTie, FaUserAlt, FaUserFriends, FaHandshake, FaBuilding, FaRegNewspaper, FaUserPlus, FaDownload, FaEnvelopeOpen, FaCheckCircle, FaExclamationTriangle, FaRegClock, FaUserEdit, FaEdit, FaSort, FaPhone, FaLink } from "react-icons/fa";
import { saveAs } from "file-saver";

// Group icons/emoji for distinct visual
const groupIcons = {
  Board: <FaUserTie size={30} color="#FFD700" />,
  Coaches: <FaUserAlt size={30} color="#1de682" />,
  Players: <FaUserFriends size={30} color="#3498db" />,
  Parents: <span style={{ fontSize: 29 }}>👨‍👩‍👦</span>,
  Sponsors: <span style={{ fontSize: 28 }}>💼</span>,
  Community: <span style={{ fontSize: 29 }}>🌍</span>,
  Media: <FaRegNewspaper size={30} color="#FFD700" />,
  Partners: <FaHandshake size={30} color="#e24242" />,
  Other: <FaBuilding size={30} color="#888" />,
};

const defaultEngagementTypes = [
  "Meeting", "Survey", "Email", "Call", "Conflict", "Opportunity", "Update"
];

const initStakeholders = [
  {
    group: "Board",
    lead: "J. Smith",
    lastEngage: "2025-06-13",
    members: ["J. Smith", "M. Dalić", "I. Ivanović"],
    risk: 0,
    notes: "Monthly board meets, AGM July",
    log: [
      { date: "2025-06-13", action: "Board meeting", type: "Meeting", doc: "" },
      { date: "2025-05-09", action: "Quarterly update sent", type: "Email", doc: "" },
    ],
    responseRate: 97,
    links: [],
  },
  {
    group: "Coaches",
    lead: "A. Proleta",
    lastEngage: "2025-06-14",
    members: ["A. Proleta", "B. Marinčić", "L. Kostić"],
    risk: 0,
    notes: "All CPD up to date",
    log: [
      { date: "2025-06-14", action: "Session plan shared", type: "Update", doc: "" },
      { date: "2025-06-08", action: "Coaching CPD completed", type: "Opportunity", doc: "" },
    ],
    responseRate: 92,
    links: [],
  },
  {
    group: "Players",
    lead: "M. Nikolić",
    lastEngage: "2025-06-11",
    members: ["M. Nikolić", "B. Petrović", "I. Radić", "M. Tomić"],
    risk: 1,
    notes: "Parent feedback needed for new players",
    log: [
      { date: "2025-06-11", action: "Player survey closed", type: "Survey", doc: "" },
      { date: "2025-05-28", action: "Team meeting", type: "Meeting", doc: "" },
    ],
    responseRate: 76,
    links: [],
  },
  {
    group: "Parents",
    lead: "R. Grgić",
    lastEngage: "2025-05-31",
    members: ["R. Grgić", "S. Jurić"],
    risk: 2,
    notes: "Overdue feedback, plan comms",
    log: [
      { date: "2025-05-12", action: "Parent info night", type: "Meeting", doc: "" },
      { date: "2025-05-31", action: "Survey sent", type: "Survey", doc: "" },
    ],
    responseRate: 49,
    links: [],
  },
  {
    group: "Sponsors",
    lead: "N. Đorđević",
    lastEngage: "2025-06-08",
    members: ["N. Đorđević", "Optimus Sports"],
    risk: 1,
    notes: "Sponsorship renewal up in August",
    log: [
      { date: "2025-06-08", action: "Quarterly report sent", type: "Email", doc: "" },
      { date: "2025-05-16", action: "VIP game invite", type: "Opportunity", doc: "" },
    ],
    responseRate: 61,
    links: [],
  },
  {
    group: "Community",
    lead: "M. Grabar",
    lastEngage: "2025-06-01",
    members: ["Local School", "Zagreb Youth Org"],
    risk: 2,
    notes: "Next event to be scheduled",
    log: [
      { date: "2025-06-01", action: "Summer camp launched", type: "Opportunity", doc: "" }
    ],
    responseRate: 32,
    links: [],
  }
];

// Risk color logic
function riskColor(risk) {
  if (risk === 0) return "#1de682";
  if (risk === 1) return "#FFD700";
  return "#e24242";
}
function riskBadge(risk) {
  if (risk === 0) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#1de682] text-black font-bold text-xs"><FaCheckCircle className="mr-1" />Engaged</span>;
  if (risk === 1) return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#FFD700] text-black font-bold text-xs"><FaRegClock className="mr-1" />At Risk</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-xl bg-[#e24242] text-white font-bold text-xs"><FaExclamationTriangle className="mr-1" />Critical</span>;
}
function exportCSV(groups) {
  let rows = [["Group", "Lead", "Last Engage", "# Members", "Risk", "Notes", "Response Rate"]];
  groups.forEach(g =>
    rows.push([g.group, g.lead, g.lastEngage, g.members.length, g.risk, g.notes, g.responseRate])
  );
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_Stakeholders_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function StakeholderMap() {
  const [groups, setGroups] = useState(initStakeholders);
  const [editIdx, setEditIdx] = useState(null);
  const [memberInput, setMemberInput] = useState("");
  const [logInput, setLogInput] = useState("");
  const [logType, setLogType] = useState(defaultEngagementTypes[0]);
  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("risk");

  // Sorting logic
  const sortedGroups = [...groups].sort((a, b) => {
    if (sortBy === "risk") return b.risk - a.risk;
    if (sortBy === "lastEngage") return new Date(b.lastEngage) - new Date(a.lastEngage);
    if (sortBy === "responseRate") return b.responseRate - a.responseRate;
    return a.group.localeCompare(b.group);
  });

  // Add group
  function addGroup() {
    setGroups([
      ...groups,
      {
        group: "Other",
        lead: "",
        lastEngage: new Date().toISOString().slice(0,10),
        members: [],
        risk: 1,
        notes: "",
        log: [],
        responseRate: 0,
        links: [],
      }
    ]);
    setEditIdx(groups.length);
  }
  // Remove group
  function removeGroup(idx) {
    setGroups(groups.filter((_, i) => i !== idx));
    setEditIdx(null);
  }
  // Inline update
  function updateGroup(idx, key, val) {
    const arr = [...groups];
    arr[idx][key] = val;
    setGroups(arr);
  }
  // Add/remove member
  function addMember(idx) {
    if (!memberInput.trim()) return;
    const arr = [...groups];
    arr[idx].members.push(memberInput.trim());
    setGroups(arr);
    setMemberInput("");
  }
  function removeMember(idx, m) {
    const arr = [...groups];
    arr[idx].members = arr[idx].members.filter(x => x !== m);
    setGroups(arr);
  }
  // Add log
  function addLog(idx) {
    if (!logInput.trim()) return;
    const arr = [...groups];
    arr[idx].log = [{ date: new Date().toISOString().slice(0, 10), action: logInput.trim(), type: logType, doc: "" }, ...arr[idx].log];
    setGroups(arr);
    setLogInput("");
  }
  // Add doc/link
  function addLink(idx, url) {
    if (!url.trim()) return;
    const arr = [...groups];
    arr[idx].links.push(url.trim());
    setGroups(arr);
  }

  // Toggle view
  function toggleView() {
    setView(view === "grid" ? "table" : "grid");
  }

  // Analytics
  const numCritical = groups.filter(g => g.risk === 2).length;
  const mostEngaged = groups.sort((a, b) => a.risk - b.risk)[0];
  const overdue = groups.filter(g => {
    const now = new Date();
    const d = new Date(g.lastEngage);
    return (now - d) / 86400000 > 21;
  });
  const pending = groups.filter(g => g.responseRate < 70);

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif",
        color: "#fff",
        background: "linear-gradient(120deg, #222a2e 70%, #283E51 100%)",
        borderRadius: "32px",
        boxShadow: "0 8px 32px #2229",
        minHeight: 950
      }}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FaUsers size={38} color="#FFD700" />
            <h1 className="font-extrabold text-3xl" style={{ color: "#FFD700" }}>STAKEHOLDER MAP</h1>
          </div>
          <div className="text-[#FFD700] italic text-base">
            Network, engagement, CRM, analytics. Full control, inline edit, docs, grid/table toggle, export.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-[#181e23] rounded-xl px-3 py-1 text-[#FFD700] font-bold flex items-center gap-2"
            onClick={toggleView}>
            <FaSort /> {view === "grid" ? "Table" : "Grid"}
          </button>
          <button className="flex items-center gap-2 bg-[#FFD700] text-black px-5 py-2 rounded-xl font-bold hover:scale-105"
            onClick={() => exportCSV(groups)}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Board summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#e24242]">
          <div className="font-black text-2xl mb-1 text-[#e24242]">{numCritical}</div>
          <div className="font-bold">Critical Risk</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#1de682]">
          <div className="font-black text-lg mb-1 text-[#1de682]">{mostEngaged ? mostEngaged.group : "—"}</div>
          <div className="font-bold">Most Engaged</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD700]">
          <div className="font-black text-2xl mb-1 text-[#FFD700]">{overdue.length}</div>
          <div className="font-bold">Overdue Comms</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#FFD70099]">
          <div className="font-black text-2xl mb-1 text-[#FFD700]">{pending.length}</div>
          <div className="font-bold">Pending Action</div>
        </div>
        <div className="bg-[#181e23] rounded-xl p-6 flex flex-col items-center border-l-4 border-[#3498db]">
          <div className="font-black text-2xl mb-1 text-[#3498db]">{groups.length}</div>
          <div className="font-bold">Groups</div>
        </div>
      </div>

      {/* View: grid */}
      {view === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {sortedGroups.map((g, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow-xl p-6 bg-[#181e23] border-t-8"
              style={{
                borderColor: riskColor(g.risk),
                minHeight: 290,
                cursor: "pointer",
                position: "relative",
                transition: "box-shadow .18s"
              }}
              onClick={() => setEditIdx(idx)}
            >
              <div className="flex items-center gap-3 mb-2">
                {groupIcons[g.group] || groupIcons.Other}
                <input
                  className="font-bold text-2xl bg-[#181e23] text-[#FFD700] w-32"
                  style={{ border: "none", fontWeight: 800 }}
                  value={g.group}
                  onChange={e => updateGroup(idx, "group", e.target.value)}
                />
              </div>
              <div className="mb-1 text-lg flex items-center gap-2">
                <FaUserEdit className="text-[#FFD700]" /> Lead:
                <input className="bg-[#1de68222] text-[#1de682] rounded px-2 py-1 w-28"
                  value={g.lead}
                  onChange={e => updateGroup(idx, "lead", e.target.value)}
                />
              </div>
              <div className="mb-1 text-lg flex items-center gap-2">
                <FaEnvelopeOpen className="text-[#FFD700]" /> Last:
                <input type="date"
                  className="bg-[#FFD70022] text-[#FFD700] rounded px-2 py-1 w-28"
                  value={g.lastEngage}
                  onChange={e => updateGroup(idx, "lastEngage", e.target.value)}
                />
              </div>
              <div className="mb-1 text-lg flex items-center gap-2">
                <FaUsers className="text-[#FFD700]" /> Members:
              </div>
              <ul className="mb-2 flex flex-wrap gap-2">
                {g.members.map(m => (
                  <li key={m} className="bg-[#FFD700] text-[#23292f] rounded px-2 py-1 flex items-center gap-2 font-bold">
                    {m}
                    <button className="ml-1 text-[#e24242] font-bold" onClick={e => { e.stopPropagation(); removeMember(idx, m); }}>×</button>
                  </li>
                ))}
                <input
                  className="bg-[#23292f] text-white rounded px-2 py-1 w-20"
                  placeholder="Add"
                  value={memberInput}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setMemberInput(e.target.value)}
                  onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") addMember(idx); }}
                />
              </ul>
              <div className="mb-1 text-lg flex items-center gap-2">
                <FaRegClock /> Risk:
                <select
                  className="bg-[#23292f] text-white rounded px-2 py-1"
                  value={g.risk}
                  onChange={e => updateGroup(idx, "risk", Number(e.target.value))}
                >
                  <option value={0}>Engaged</option>
                  <option value={1}>At Risk</option>
                  <option value={2}>Critical</option>
                </select>
                {riskBadge(g.risk)}
              </div>
              <div className="mb-1 flex items-center gap-2">
                <FaEdit /> Notes:
                <input className="bg-[#23292f] text-white rounded px-2 py-1 w-32"
                  value={g.notes}
                  onChange={e => updateGroup(idx, "notes", e.target.value)}
                />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <FaEnvelopeOpen /> Log:
                <input
                  className="bg-[#23292f] text-white rounded px-2 py-1 w-24"
                  placeholder="Add entry"
                  value={logInput}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setLogInput(e.target.value)}
                  onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") addLog(idx); }}
                />
                <select
                  className="bg-[#23292f] text-white rounded px-2 py-1"
                  value={logType}
                  onChange={e => setLogType(e.target.value)}
                >
                  {defaultEngagementTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <ul className="mb-2 max-h-24 overflow-y-auto text-sm">
                {g.log.slice(0, 3).map((l, i) => (
                  <li key={i} className="text-[#FFD700]">{l.date}: {l.action} <span className="italic text-[#1de682]">{l.type}</span></li>
                ))}
              </ul>
              <div className="mb-1 flex items-center gap-2">
                <FaPhone /> <FaEnvelopeOpen />
                <span className="text-xs text-[#FFD700] ml-1">Quick Action</span>
              </div>
              <div className="mb-1 flex items-center gap-2">
                <FaLink /> Attach:
                <input
                  className="bg-[#23292f] text-white rounded px-2 py-1 w-32"
                  placeholder="Paste URL"
                  onBlur={e => addLink(idx, e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1 text-xs mt-1">
                {g.links && g.links.map((url, i) => <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="underline text-[#FFD700]">{url.slice(0, 16)}…</a>)}
              </div>
              <div className="absolute top-3 right-4">
                <button onClick={e => { e.stopPropagation(); removeGroup(idx); }}
                  className="bg-[#e24242] text-white rounded px-2 font-bold text-lg"
                >×</button>
              </div>
              <div className="text-xs text-[#FFD700] absolute bottom-3 left-6">Response: {g.responseRate}%</div>
            </div>
          ))}
          <div
            className="rounded-2xl shadow-xl p-6 bg-[#23292f] border-t-8 border-[#FFD700] flex flex-col items-center justify-center cursor-pointer"
            onClick={addGroup}
          >
            <FaUserPlus size={40} className="mb-2 text-[#FFD700]" />
            <div className="font-bold text-[#FFD700] text-lg">Add Group</div>
          </div>
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="overflow-x-auto bg-[#181e23] rounded-2xl p-4 shadow mb-8">
          <table className="min-w-full text-lg">
            <thead>
              <tr>
                <th>Group</th>
                <th>Lead</th>
                <th>Members</th>
                <th>Risk</th>
                <th>Notes</th>
                <th>Last Engage</th>
                <th>Response %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedGroups.map((g, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      className="bg-[#23292f] text-[#FFD700] font-bold rounded px-2 py-1 w-28"
                      value={g.group}
                      onChange={e => updateGroup(idx, "group", e.target.value)}
                    />
                  </td>
                  <td>
                    <input className="bg-[#1de68222] text-[#1de682] rounded px-2 py-1 w-20"
                      value={g.lead}
                      onChange={e => updateGroup(idx, "lead", e.target.value)}
                    />
                  </td>
                  <td>
                    <span>{g.members.join(", ")}</span>
                    <input
                      className="bg-[#23292f] text-white rounded px-2 py-1 w-16 ml-2"
                      placeholder="Add"
                      value={memberInput}
                      onChange={e => setMemberInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addMember(idx); }}
                    />
                  </td>
                  <td>
                    <select
                      className="bg-[#23292f] text-white rounded px-2 py-1"
                      value={g.risk}
                      onChange={e => updateGroup(idx, "risk", Number(e.target.value))}
                    >
                      <option value={0}>Engaged</option>
                      <option value={1}>At Risk</option>
                      <option value={2}>Critical</option>
                    </select>
                    {riskBadge(g.risk)}
                  </td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 w-32"
                      value={g.notes}
                      onChange={e => updateGroup(idx, "notes", e.target.value)}
                    />
                  </td>
                  <td>
                    <input type="date"
                      className="bg-[#FFD70022] text-[#FFD700] rounded px-2 py-1 w-28"
                      value={g.lastEngage}
                      onChange={e => updateGroup(idx, "lastEngage", e.target.value)}
                    />
                  </td>
                  <td>{g.responseRate}%</td>
                  <td>
                    <button onClick={() => removeGroup(idx)} className="bg-[#e24242] text-white rounded px-2 font-bold text-lg">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-12 border-t pt-6 border-[#FFD700]">
        <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
