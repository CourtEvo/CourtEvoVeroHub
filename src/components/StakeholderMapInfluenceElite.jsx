import React, { useState } from "react";
import {
  FaUsers, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaSearch, FaPlus, FaEdit, FaTrash, FaFileExport, FaLightbulb, FaArrowRight, FaComments, FaHistory, FaTag
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const DEFAULT_STAKEHOLDERS = [
  { group: "Board", name: "President", influence: 10, engagement: 9, sentiment: 8, lastContact: "2024-06-14", tags: ["strategic"], history: [{ date: "2024-06-14", action: "Weekly call", sentiment: 8 }], atRisk: false },
  { group: "Sponsor", name: "Erste Bank", influence: 9, engagement: 7, sentiment: 7, lastContact: "2024-05-28", tags: ["main sponsor"], history: [{ date: "2024-05-28", action: "Renewal talk", sentiment: 7 }], atRisk: false },
  { group: "Sponsor", name: "Adidas", influence: 7, engagement: 5, sentiment: 6, lastContact: "2024-05-15", tags: ["apparel"], history: [{ date: "2024-05-15", action: "Emailed, no response", sentiment: 6 }], atRisk: true },
  { group: "City Official", name: "Sport Director", influence: 8, engagement: 6, sentiment: 5, lastContact: "2024-05-19", tags: ["government"], history: [{ date: "2024-05-19", action: "Facility allocation call", sentiment: 5 }], atRisk: false },
  { group: "Parent", name: "Top U16 Parent", influence: 5, engagement: 9, sentiment: 9, lastContact: "2024-06-01", tags: ["youth parent"], history: [{ date: "2024-06-01", action: "Youth event", sentiment: 9 }], atRisk: false },
  { group: "Alumni", name: "Ex-Player (Cro)", influence: 7, engagement: 4, sentiment: 5, lastContact: "2024-03-02", tags: ["ex-player"], history: [{ date: "2024-03-02", action: "Low engagement", sentiment: 5 }], atRisk: true },
  { group: "Fan", name: "Fan Club Leader", influence: 6, engagement: 8, sentiment: 8, lastContact: "2024-05-10", tags: ["fans"], history: [{ date: "2024-05-10", action: "Social media", sentiment: 8 }], atRisk: false }
];

const groupColors = {
  "Board": "#FFD700",
  "Sponsor": "#1de682",
  "City Official": "#62d6ff",
  "Parent": "#ffe066",
  "Alumni": "#FFD70077",
  "Fan": "#ffd7b2",
  "Media": "#bbb"
};

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

const StakeholderMapInfluenceElite = () => {
  const [stakeholders, setStakeholders] = useState([...DEFAULT_STAKEHOLDERS]);
  const [filterGroup, setFilterGroup] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newStake, setNewStake] = useState({ group: "Sponsor", name: "", influence: 5, engagement: 5, sentiment: 5, lastContact: "", tags: [], history: [], atRisk: false });
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [log, setLog] = useState([{ by: "Board", txt: "Reviewed sponsor engagement for renewal.", date: "2024-05-29", type: "action" }]);
  const [logText, setLogText] = useState("");
  const [logType, setLogType] = useState("all");
  const [scenarioIdx, setScenarioIdx] = useState(-1);
  const [scenarioStatus, setScenarioStatus] = useState("");

  // Filtering
  const filtered = stakeholders.filter(s =>
    (filterGroup === "All" || s.group === filterGroup) &&
    (!searchText || s.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  // CRUD
  const addStakeholder = () => {
    if (!newStake.name) return;
    setStakeholders([...stakeholders, { ...newStake, tags: (newStake.tags || []).filter(Boolean), history: [] }]);
    setAddMode(false);
    setNewStake({ group: "Sponsor", name: "", influence: 5, engagement: 5, sentiment: 5, lastContact: "", tags: [], history: [], atRisk: false });
  };
  const startEdit = idx => { setEditMode(idx); setEditData({ ...stakeholders[idx] }); };
  const saveEdit = () => {
    setStakeholders(stakeholders.map((s, i) => i === editMode ? { ...editData } : s));
    setEditMode(false); setEditData({});
  };
  const removeStake = idx => setStakeholders(stakeholders.filter((_, i) => i !== idx));

  // Scenario engine
  const runScenario = idx => {
    setScenarioIdx(idx);
    let s = stakeholders[idx];
    let newTotalInf = stakeholders.reduce((a, b, i) => i === idx ? a : a + b.influence, 0);
    let newEng = stakeholders.reduce((a, b, i) => i === idx ? a : a + b.engagement, 0);
    let newSent = stakeholders.reduce((a, b, i) => i === idx ? a : a + b.sentiment, 0);
    let atRiskNow = stakeholders.filter((st, i) => i !== idx && st.atRisk).length;
    if (s.influence >= 9) setScenarioStatus(
      <>Loss of this stakeholder = <b style={{ color: "#ff4848" }}>CRITICAL</b>.<br />
      Board must mitigate immediately. Total influence drops to <b>{newTotalInf}</b>.<br />
      At-risk count: {atRiskNow}</>
    );
    else if (s.engagement <= 4) setScenarioStatus(
      <>Low engagement: at risk of drift. Activate action plan.<br />
      Engagement drops to <b>{newEng}</b>.</>
    );
    else setScenarioStatus(<>Scenario: risk is manageable, but monitor closely.<br />
      Influence: {newTotalInf}, Engagement: {newEng}, Sentiment: {newSent}.</>
    );
  };

  // Engagement analytics
  function avgScore(key, arr = stakeholders) {
    if (!arr.length) return 0;
    return (arr.reduce((a, s) => a + (s[key] || 0), 0) / arr.length).toFixed(1);
  }
  function groupHeat(group) {
    let arr = stakeholders.filter(s => s.group === group);
    if (!arr.length) return "gray";
    let risk = arr.filter(s => s.atRisk).length / arr.length;
    if (risk > 0.5) return "#ff4848";
    if (risk > 0.2) return "#FFD700";
    return "#1de682";
  }
  function groupAvgDays(group) {
    let arr = stakeholders.filter(s => s.group === group);
    if (!arr.length) return "-";
    return Math.round(arr.reduce((a, s) => a + daysSince(s.lastContact), 0) / arr.length);
  }
  function groupTrend(group, key) {
    let arr = stakeholders.filter(s => s.group === group);
    if (!arr.length) return [];
    return arr.map(s => (s.history || []).map(h => h[key] || 0)).flat();
  }

  // Alerts
  function alerts() {
    let out = [];
    stakeholders.forEach(s => {
      if (s.group === "Sponsor" && daysSince(s.lastContact) > 30)
        out.push(`Sponsor ${s.name} not contacted in over 30 days.`);
      if (s.group === "Alumni" && (s.sentiment <= 5))
        out.push(`Alumni ${s.name} sentiment is low.`);
    });
    return out;
  }

  // Add event to history
  function addHistory(idx, event) {
    setStakeholders(stakeholders.map((s, i) =>
      i === idx ? { ...s, history: [...(s.history || []), { ...event }] } : s
    ));
  }

  // CSV Export (all fields/tags/history)
  function exportCSV() {
    let csv = ["Group,Name,Influence,Engagement,Sentiment,LastContact,Tags,AtRisk,History"];
    stakeholders.forEach(s => csv.push([
      s.group, s.name, s.influence, s.engagement, s.sentiment, s.lastContact,
      (s.tags || []).join("|"), s.atRisk,
      (s.history || []).map(h => `${h.date}: ${h.action} (${h.sentiment})`).join("|")
    ].join(",")));
    csv.push("\nLog:");
    log.forEach(l => csv.push([l.date, l.by, l.txt, l.type || ""].join(",")));
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "stakeholder_map.csv";
    a.click(); URL.revokeObjectURL(url);
  }

  // Add log
  const addLog = () => {
    if (!logText.trim()) return;
    setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10), type: logType }]);
    setLogText("");
  };

  // --- UI ---
  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1650, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <FaUsers size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Stakeholder Mapping & Influence Analytics
        </h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | Elite Influence
        </span>
        <button onClick={exportCSV} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 16 }}><FaFileExport style={{ marginRight: 5 }} /> Export CSV</button>
      </div>
      {/* Alerts */}
      {alerts().length > 0 &&
        <div style={{ background: "#ff484822", color: "#ff4848", fontWeight: 700, padding: 9, borderRadius: 10, marginBottom: 8 }}>
          {alerts().map((a, i) => <div key={i}><FaExclamationTriangle /> {a}</div>)}
        </div>
      }
      {/* Filters/Add/Search */}
      <div style={{ display: "flex", gap: 17, alignItems: "center", marginBottom: 11 }}>
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} style={inputStyleMini}>
          <option value="All">All Groups</option>
          {[...new Set(stakeholders.map(s => s.group))].map(g => <option key={g}>{g}</option>)}
        </select>
        <FaSearch />
        <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search name..." style={inputStyle} />
        <button onClick={() => setAddMode(m => !m)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>
          <FaPlus /> {addMode ? "Cancel" : "Add Stakeholder"}
        </button>
      </div>
      {addMode &&
        <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 13 }}>
          <select value={newStake.group} onChange={e => setNewStake({ ...newStake, group: e.target.value })} style={inputStyleMini}>
            <option>Board</option>
            <option>Sponsor</option>
            <option>City Official</option>
            <option>Parent</option>
            <option>Alumni</option>
            <option>Fan</option>
            <option>Media</option>
          </select>
          <input value={newStake.name} placeholder="Name" onChange={e => setNewStake({ ...newStake, name: e.target.value })} style={inputStyle} />
          <input value={newStake.influence} type="number" min={1} max={10} placeholder="Influence" onChange={e => setNewStake({ ...newStake, influence: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newStake.engagement} type="number" min={1} max={10} placeholder="Engagement" onChange={e => setNewStake({ ...newStake, engagement: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newStake.sentiment} type="number" min={1} max={10} placeholder="Sentiment" onChange={e => setNewStake({ ...newStake, sentiment: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newStake.lastContact} type="date" onChange={e => setNewStake({ ...newStake, lastContact: e.target.value })} style={inputStyleMini} />
          <input value={newStake.tags?.join(", ")} placeholder="Tags (comma separated)" onChange={e => setNewStake({ ...newStake, tags: e.target.value.split(",").map(x => x.trim()) })} style={inputStyleMini} />
          <select value={newStake.atRisk} onChange={e => setNewStake({ ...newStake, atRisk: e.target.value === "true" })} style={inputStyleMini}>
            <option value="false">Not at risk</option>
            <option value="true">At risk</option>
          </select>
          <button onClick={addStakeholder} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
        </div>
      }
      {/* Quadrant map */}
      <div style={{ marginBottom: 16, background: "#232a2e", borderRadius: 13, padding: 18, boxShadow: "0 2px 18px #FFD70022" }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 6 }}>Influence vs. Engagement Map</div>
        <div style={{ position: "relative", height: 320, width: 520, background: "#181e23", borderRadius: 15 }}>
          <svg width={520} height={320}>
            {/* Quadrants */}
            <rect x={0} y={0} width={260} height={160} fill="#ff484822" />
            <rect x={260} y={0} width={260} height={160} fill="#FFD70022" />
            <rect x={0} y={160} width={260} height={160} fill="#FFD70022" />
            <rect x={260} y={160} width={260} height={160} fill="#1de68222" />
            {/* Axes */}
            <line x1={260} y1={0} x2={260} y2={320} stroke="#FFD70066" strokeWidth={2} />
            <line x1={0} y1={160} x2={520} y2={160} stroke="#FFD70066" strokeWidth={2} />
            {/* Points */}
            {filtered.map((s, i) => (
              <circle
                key={i}
                cx={52 + s.influence * 20}
                cy={272 - s.engagement * 20}
                r={17}
                fill={groupColors[s.group] || "#FFD700"}
                stroke={s.atRisk ? "#ff4848" : "#232a2e"}
                strokeWidth={s.atRisk ? 5 : 2}
                onClick={() => setSelected(i)}
                style={{ cursor: "pointer", opacity: selected === i ? 1 : 0.82 }}
              />
            ))}
            {/* Names */}
            {filtered.map((s, i) => (
              <text key={i} x={52 + s.influence * 20} y={272 - s.engagement * 20 - 24} fill="#fff" fontSize={13} textAnchor="middle">{s.name}</text>
            ))}
            {/* Quadrant labels */}
            <text x={120} y={20} fill="#FFD700" fontWeight={800}>Monitor</text>
            <text x={400} y={20} fill="#FFD700" fontWeight={800}>Key Players</text>
            <text x={400} y={310} fill="#FFD700" fontWeight={800}>Keep Informed</text>
            <text x={120} y={310} fill="#FFD700" fontWeight={800}>Minimal Effort</text>
          </svg>
        </div>
        {selected !== null &&
          <div style={{ marginTop: 11, background: "#283E51", padding: 14, borderRadius: 8 }}>
            <b>{filtered[selected].name}</b> ({filtered[selected].group})<br />
            Tags: {filtered[selected].tags?.map((t, i) => <span key={i} style={{ background: "#FFD700", color: "#232a2e", fontWeight: 700, fontSize: 12, borderRadius: 6, padding: "1px 8px", margin: "0 2px" }}><FaTag /> {t}</span>)}<br />
            Influence: <b>{filtered[selected].influence}</b> | Engagement: <b>{filtered[selected].engagement}</b> | Sentiment: <b>{filtered[selected].sentiment}</b><br />
            Last Contact: {filtered[selected].lastContact || "-"}<br />
            Notes: {filtered[selected].notes || "-"}
            <div style={{ marginTop: 9 }}>
              <b><FaHistory /> History</b>
              <ul style={{ fontSize: 13, paddingLeft: 15 }}>
                {(filtered[selected].history || []).map((h, j) =>
                  <li key={j}>{h.date}: {h.action} (Sentiment: {h.sentiment})</li>
                )}
              </ul>
              <input placeholder="Add event..." onBlur={e => addHistory(selected, { date: new Date().toISOString().slice(0, 10), action: e.target.value, sentiment: filtered[selected].sentiment })} style={inputStyleMini} />
            </div>
            <button onClick={() => setSelected(null)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 7 }}>Close</button>
          </div>
        }
      </div>
      {/* Group Analytics */}
      <div style={{ display: "flex", gap: 11, marginBottom: 18 }}>
        {[...new Set(stakeholders.map(s => s.group))].map(g =>
          <div key={g} style={{ background: groupHeat(g), color: "#232a2e", borderRadius: 12, padding: 10, minWidth: 180, fontWeight: 700 }}>
            <b>{g}</b><br />
            <span style={{ color: "#232a2e", fontWeight: 800 }}>
              At risk: {stakeholders.filter(s => s.group === g && s.atRisk).length} <FaExclamationTriangle />
            </span><br />
            Avg Inf: {avgScore("influence", stakeholders.filter(s => s.group === g))}
            &nbsp;| Eng: {avgScore("engagement", stakeholders.filter(s => s.group === g))}
            &nbsp;| Sent: {avgScore("sentiment", stakeholders.filter(s => s.group === g))}
            <br />
            Last contact (days avg): {groupAvgDays(g)}
          </div>
        )}
        <div style={{ background: "#FFD70033", color: "#FFD700", borderRadius: 12, padding: 10, fontWeight: 700 }}>
          <b>ALL</b> | Inf: {avgScore("influence")}, Eng: {avgScore("engagement")}, Sent: {avgScore("sentiment")}
        </div>
      </div>
      {/* Table */}
      <div style={{ marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff" }}>
          <thead>
            <tr>
              <th>Group</th>
              <th>Name</th>
              <th>Influence</th>
              <th>Engagement</th>
              <th>Sentiment</th>
              <th>Last Contact</th>
              <th>Tags</th>
              <th>At Risk?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => editMode === i ? (
              <tr key={i} style={{ background: "#FFD70022" }}>
                <td>
                  <select value={editData.group} onChange={e => setEditData({ ...editData, group: e.target.value })} style={inputStyleMini}>
                    <option>Board</option>
                    <option>Sponsor</option>
                    <option>City Official</option>
                    <option>Parent</option>
                    <option>Alumni</option>
                    <option>Fan</option>
                    <option>Media</option>
                  </select>
                </td>
                <td><input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={inputStyle} /></td>
                <td><input value={editData.influence} type="number" min={1} max={10} onChange={e => setEditData({ ...editData, influence: Number(e.target.value) })} style={inputStyleMini} /></td>
                <td><input value={editData.engagement} type="number" min={1} max={10} onChange={e => setEditData({ ...editData, engagement: Number(e.target.value) })} style={inputStyleMini} /></td>
                <td><input value={editData.sentiment} type="number" min={1} max={10} onChange={e => setEditData({ ...editData, sentiment: Number(e.target.value) })} style={inputStyleMini} /></td>
                <td><input value={editData.lastContact} type="date" onChange={e => setEditData({ ...editData, lastContact: e.target.value })} style={inputStyleMini} /></td>
                <td>
                  <input value={editData.tags?.join(", ")} onChange={e => setEditData({ ...editData, tags: e.target.value.split(",").map(x => x.trim()) })} style={inputStyleMini} />
                </td>
                <td>
                  <select value={editData.atRisk} onChange={e => setEditData({ ...editData, atRisk: e.target.value === "true" })} style={inputStyleMini}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </td>
                <td>
                  <button onClick={saveEdit} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaCheckCircle /></button>
                  <button onClick={() => setEditMode(false)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                </td>
              </tr>
            ) : (
              <tr key={i} style={{ background: s.atRisk ? "#ff484822" : "#232a2e" }}>
                <td style={{ color: groupColors[s.group] || "#FFD700", fontWeight: 700 }}>{s.group}</td>
                <td>{s.name}</td>
                <td>{s.influence}</td>
                <td>{s.engagement}</td>
                <td style={{ color: s.sentiment >= 7 ? "#1de682" : s.sentiment <= 4 ? "#ff4848" : "#FFD700", fontWeight: 700 }}>{s.sentiment}</td>
                <td>{s.lastContact}</td>
                <td>
                  {(s.tags || []).map((t, j) => <span key={j} style={{ background: "#FFD700", color: "#232a2e", fontWeight: 700, fontSize: 12, borderRadius: 6, padding: "1px 8px", margin: "0 2px" }}><FaTag /> {t}</span>)}
                </td>
                <td style={{ color: s.atRisk ? "#ff4848" : "#1de682", fontWeight: 700 }}>{s.atRisk ? "YES" : "NO"}</td>
                <td>
                  <button onClick={() => startEdit(i)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginRight: 3 }}><FaEdit /></button>
                  <button onClick={() => removeStake(i)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                  <button onClick={() => runScenario(i)} style={{ ...btnStyle, background: "#FFD70066", color: "#232a2e" }}><FaLightbulb /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Scenario result */}
        {scenarioIdx >= 0 && (
          <div style={{ background: "#181e23", color: "#FFD700", padding: 15, borderRadius: 12, marginTop: 10 }}>
            <b>Scenario Analysis for:</b> <span style={{ color: "#FFD700", fontWeight: 700 }}>{filtered[scenarioIdx]?.name}</span>
            <div style={{ marginTop: 5 }}>{scenarioStatus}</div>
            <button onClick={() => setScenarioIdx(-1)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 7 }}><FaArrowRight /> Close</button>
          </div>
        )}
      </div>
      {/* Boardroom Log */}
      <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, marginBottom: 5 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaComments style={{ marginRight: 7 }} /> Boardroom Log</div>
        <div>
          <select value={logType} onChange={e => setLogType(e.target.value)} style={inputStyleMini}>
            <option value="all">All</option>
            <option value="action">Action</option>
            <option value="alert">Alert</option>
            <option value="contact">Contact</option>
          </select>
        </div>
        <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
          {log.filter(l => logType === "all" || l.type === logType).map((c, i) =>
            <div key={i}><span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt} <span style={{ color: "#FFD70077", fontSize: 12 }}>{c.date}</span></div>
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
  ...inputStyle,
  width: 60,
  fontSize: 14,
  marginRight: 0,
  marginBottom: 2
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default StakeholderMapInfluenceElite;
