// src/components/StakeholderEngagementCockpit.jsx
import React, { useState } from 'react';
import {
  FaUsers, FaUserTie, FaBasketballBall, FaHandshake, FaUserFriends, FaChartLine, FaBullhorn, FaCalendarAlt, FaCheckCircle,
  FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaSave, FaUndo, FaRedo, FaFileExport, FaArrowRight, FaExchangeAlt
} from 'react-icons/fa';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, AreaChart, Area, Legend
} from 'recharts';

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };

const GROUPS = [
  { key: "board", label: "Board", icon: <FaUserTie />, color: "#FFD700" },
  { key: "coaches", label: "Coaches", icon: <FaBasketballBall />, color: "#1de682" },
  { key: "players", label: "Players", icon: <FaUsers />, color: "#FFD70099" },
  { key: "parents", label: "Parents", icon: <FaUserFriends />, color: "#c2b280" },
  { key: "sponsors", label: "Sponsors", icon: <FaHandshake />, color: "#ffda64" },
  { key: "city", label: "City", icon: <FaBullhorn />, color: "#FFD70044" },
  { key: "alumni", label: "Alumni", icon: <FaCalendarAlt />, color: "#485563" }
];

// DEMO DATA
const demoStakeholders = [
  // groupKey, name, influence (1–10), engagement (1–10), sentiment (–1 to 1), lastInteraction, risk (boolean), history: [{date, action, note}]
  { id: 1, group: "board", name: "Ivica R.", influence: 9, engagement: 7, sentiment: 0.7, last: "2025-06-01", risk: false, history: [{date: "2025-06-01", action: "Board meeting", note: "Strategy review"}] },
  { id: 2, group: "coaches", name: "Perković", influence: 7, engagement: 9, sentiment: 0.8, last: "2025-06-10", risk: false, history: [{date: "2025-06-10", action: "Coach clinic", note: "High turnout"}] },
  { id: 3, group: "players", name: "U17", influence: 6, engagement: 6, sentiment: 0.3, last: "2025-06-08", risk: true, history: [{date: "2025-06-08", action: "Practice", note: "Missed by 3"}] },
  { id: 4, group: "parents", name: "U15 Parents", influence: 5, engagement: 4, sentiment: -0.2, last: "2025-05-25", risk: true, history: [{date: "2025-05-25", action: "Parent feedback", note: "Concern: travel"}] },
  { id: 5, group: "sponsors", name: "Sponsor X", influence: 8, engagement: 7, sentiment: 0.5, last: "2025-05-30", risk: false, history: [{date: "2025-05-30", action: "Sponsor event", note: "Positive"}] },
  { id: 6, group: "city", name: "City Sports Office", influence: 7, engagement: 6, sentiment: 0.6, last: "2025-06-05", risk: false, history: [{date: "2025-06-05", action: "Facility review", note: "Support for summer camp"}] },
  { id: 7, group: "alumni", name: "1999 Team", influence: 4, engagement: 8, sentiment: 0.9, last: "2025-05-18", risk: false, history: [{date: "2025-05-18", action: "Alumni game", note: "Huge engagement"}] }
];

// Engagement Campaigns
const demoCampaigns = [
  { id: 1, name: "Sponsor Day", owner: "Proleta", target: "sponsors", status: "Completed", impact: 0.18, start: "2025-05-10", end: "2025-05-30" },
  { id: 2, name: "Alumni Return Night", owner: "Grgić", target: "alumni", status: "Active", impact: 0.22, start: "2025-06-01", end: "2025-06-28" },
  { id: 3, name: "Parent Info Session", owner: "Perković", target: "parents", status: "Planned", impact: null, start: "2025-07-10", end: "2025-07-10" }
];

const StakeholderEngagementCockpit = () => {
  const [stakeholders, setStakeholders] = useState(demoStakeholders);
  const [campaigns, setCampaigns] = useState(demoCampaigns);
  const [history, setHistory] = useState([demoStakeholders]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCampForm, setShowCampForm] = useState(false);
  const [tab, setTab] = useState('pulse');

  // CRUD Stakeholder
  const addStakeholder = s => {
    const next = [...stakeholders, { ...s, id: Date.now(), history: [] }];
    setHistory([...history, next]);
    setStakeholders(next);
    setRedoStack([]);
    setShowForm(false);
    setSelectedStakeholder(null);
  };
  const updateStakeholder = s => {
    const next = stakeholders.map(sh => sh.id === s.id ? s : sh);
    setHistory([...history, next]);
    setStakeholders(next);
    setRedoStack([]);
    setShowForm(false);
    setSelectedStakeholder(null);
  };
  const deleteStakeholder = id => {
    const next = stakeholders.filter(sh => sh.id !== id);
    setHistory([...history, next]);
    setStakeholders(next);
    setRedoStack([]);
    setShowForm(false);
    setSelectedStakeholder(null);
  };

  // Undo/Redo
  const undo = () => {
    if (history.length <= 1) return;
    setRedoStack([stakeholders, ...redoStack]);
    const prev = history[history.length - 2];
    setStakeholders(prev);
    setHistory(history.slice(0, -1));
    setShowForm(false); setSelectedStakeholder(null);
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    setHistory([...history, redoStack[0]]);
    setStakeholders(redoStack[0]);
    setRedoStack(redoStack.slice(1));
    setShowForm(false); setSelectedStakeholder(null);
  };

  // CRUD Campaign
  const addCampaign = c => {
    setCampaigns([...campaigns, { ...c, id: Date.now() }]);
    setShowCampForm(false);
    setSelectedCampaign(null);
  };
  const updateCampaign = c => {
    setCampaigns(campaigns.map(camp => camp.id === c.id ? c : camp));
    setShowCampForm(false);
    setSelectedCampaign(null);
  };
  const deleteCampaign = id => {
    setCampaigns(campaigns.filter(camp => camp.id !== id));
    setShowCampForm(false);
    setSelectedCampaign(null);
  };

  // Boardroom Narrative
  function boardroomCopy() {
    const parents = stakeholders.find(s => s.group === "parents");
    const alumni = stakeholders.find(s => s.group === "alumni");
    const sponsors = stakeholders.find(s => s.group === "sponsors");
    let copy = [];
    if (parents && parents.sentiment < 0) copy.push(`Parental sentiment is down—run campaign & listen sessions.`);
    if (alumni && alumni.engagement > 7) copy.push(`Alumni engagement is at a two-year high. Celebrate with content.`);
    if (sponsors && sponsors.engagement < 6) copy.push(`Sponsor engagement has dropped; immediate owner follow-up required.`);
    if (!copy.length) copy.push("Stakeholder ecosystem healthy. Monitor weak signals and continue campaigns.");
    return copy;
  }

  // Export
  const exportCSV = () => {
    const csv = [
      "Group,Name,Influence,Engagement,Sentiment,LastInteraction,Risk"
    ].concat(stakeholders.map(s =>
      [s.group, s.name, s.influence, s.engagement, s.sentiment, s.last, s.risk ? "Y" : ""].join(",")
    )).join('\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "stakeholders.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // Sentiment trend demo
  const sentimentTrend = [
    { period: "Q1", board: 0.6, coaches: 0.8, players: 0.5, parents: -0.1, sponsors: 0.4, city: 0.5, alumni: 0.7 },
    { period: "Q2", board: 0.7, coaches: 0.9, players: 0.6, parents: 0.1, sponsors: 0.5, city: 0.6, alumni: 0.8 },
    { period: "Q3", board: 0.8, coaches: 0.7, players: 0.55, parents: 0.12, sponsors: 0.43, city: 0.65, alumni: 0.9 }
  ];

  // UI
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1400, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <FaUsers size={30} color={brand.gold} />
        <h2 style={{
          fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0
        }}>
          Stakeholder Engagement Cockpit
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8,
          padding: '3px 16px', fontSize: 14, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022'
        }}>
          CourtEvo Vero Boardroom
        </span>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 18, margin: "18px 0 10px 0" }}>
        {[
          { key: "pulse", label: <><FaChartLine style={{ marginRight: 8 }} /> Pulseboard</> },
          { key: "map", label: <><FaUsers style={{ marginRight: 8 }} /> Stakeholder Map</> },
          { key: "log", label: <><FaCalendarAlt style={{ marginRight: 8 }} /> Action Log</> },
          { key: "campaigns", label: <><FaBullhorn style={{ marginRight: 8 }} /> Campaign Engine</> },
          { key: "trend", label: <><FaExchangeAlt style={{ marginRight: 8 }} /> Sentiment Trend</> }
        ].map(tabItem => (
          <button key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            style={{
              background: tab === tabItem.key ? brand.gold : brand.accent,
              color: tab === tabItem.key ? '#232a2e' : '#fff',
              fontWeight: 700, border: 'none', borderRadius: 13,
              fontSize: 15, padding: '8px 24px', cursor: 'pointer',
              boxShadow: tab === tabItem.key ? '0 2px 14px #FFD70033' : 'none'
            }}>
            {tabItem.label}
          </button>
        ))}
      </div>
      {/* Boardroom Narrative */}
      <div style={{
        background: "#283E51", borderRadius: 12, padding: 16, marginBottom: 16, fontWeight: 700,
        color: "#FFD700"
      }}>
        <FaBullhorn style={{ marginRight: 8, color: "#FFD700" }} />
        {boardroomCopy().map((line, i) => <div key={i}>{line}</div>)}
      </div>
      {/* Pulseboard */}
      {tab === "pulse" && (
        <div style={{
          background: "#232a2e", borderRadius: 16, padding: 20, marginBottom: 15
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 8 }}>Engagement Pulse</h4>
          <table style={{ width: "100%", fontSize: 16, color: "#fff", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Group</th><th>Name</th><th>Influence</th><th>Engagement</th><th>Sentiment</th><th>Last</th><th>Risk</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map(s =>
                <tr key={s.id} style={{ borderBottom: "1px solid #FFD70022", background: s.risk ? "#ff484822" : "transparent" }}>
                  <td style={{ color: GROUPS.find(g => g.key === s.group).color, fontWeight: 700 }}>{GROUPS.find(g => g.key === s.group).label}</td>
                  <td>{s.name}</td>
                  <td>{s.influence}</td>
                  <td style={{ color: s.engagement < 6 ? "#ff4848" : "#1de682", fontWeight: 700 }}>{s.engagement}</td>
                  <td style={{ color: s.sentiment < 0 ? "#ff4848" : "#1de682" }}>{s.sentiment}</td>
                  <td>{s.last}</td>
                  <td>{s.risk && <FaExclamationTriangle style={{ color: "#ff4848" }} />}</td>
                  <td>
                    <button onClick={() => { setSelectedStakeholder(s); setShowForm(true); }} style={{ ...btnStyle, background: brand.green, color: "#232a2e", padding: "2px 7px", marginRight: 4 }}><FaEdit /></button>
                    <button onClick={() => deleteStakeholder(s.id)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", padding: "2px 7px" }}><FaTrash /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={() => { setShowForm(!showForm); setSelectedStakeholder(null); }} style={{ ...btnStyle, marginTop: 11, background: brand.gold, color: "#232a2e" }}>
            <FaPlus style={{ marginRight: 7 }} /> {showForm ? "Cancel" : "Add Stakeholder"}
          </button>
          {showForm && (
            <form onSubmit={e => {
              e.preventDefault();
              const f = e.target;
              const s = {
                id: selectedStakeholder ? selectedStakeholder.id : undefined,
                group: f.group.value,
                name: f.name.value,
                influence: Number(f.influence.value),
                engagement: Number(f.engagement.value),
                sentiment: Number(f.sentiment.value),
                last: f.last.value,
                risk: f.risk.checked,
                history: selectedStakeholder?.history || []
              };
              if (selectedStakeholder) updateStakeholder(s);
              else addStakeholder(s);
              f.reset();
            }} style={{
              marginTop: 12, background: "#283E51", borderRadius: 10, padding: 12
            }}>
              <select name="group" defaultValue={selectedStakeholder?.group || "board"} style={inputStyle}>
                {GROUPS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
              <input name="name" placeholder="Name/Label" required defaultValue={selectedStakeholder?.name || ""} style={inputStyle} />
              <input name="influence" type="number" placeholder="Influence (1-10)" min={1} max={10} required defaultValue={selectedStakeholder?.influence || ""} style={inputStyle} />
              <input name="engagement" type="number" placeholder="Engagement (1-10)" min={1} max={10} required defaultValue={selectedStakeholder?.engagement || ""} style={inputStyle} />
              <input name="sentiment" type="number" step={0.01} placeholder="Sentiment (–1 to 1)" min={-1} max={1} required defaultValue={selectedStakeholder?.sentiment || ""} style={inputStyle} />
              <input name="last" type="date" required defaultValue={selectedStakeholder?.last || ""} style={inputStyle} />
              <label style={{ color: "#FFD700", marginRight: 15 }}>
                <input name="risk" type="checkbox" defaultChecked={selectedStakeholder?.risk || false} />
                At Risk
              </label>
              <button type="submit" style={{ ...btnStyle, marginRight: 11 }}>{selectedStakeholder ? "Update" : "Add"}</button>
              {selectedStakeholder &&
                <button type="button" onClick={() => { setSelectedStakeholder(null); setShowForm(false); }} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}>Cancel</button>
              }
            </form>
          )}
        </div>
      )}
      {/* Map */}
      {tab === "map" && (
        <div style={{
          background: "#283E51", borderRadius: 18, padding: 24, marginBottom: 15
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 12 }}>Stakeholder Network Map (Simplified)</h4>
          <div style={{
            display: "flex", gap: 38, flexWrap: "wrap", justifyContent: "center", alignItems: "center"
          }}>
            {GROUPS.map(g => (
              <div key={g.key} style={{
                background: g.color, color: "#232a2e", borderRadius: 22, minWidth: 120, minHeight: 90, boxShadow: "0 2px 14px #FFD70044",
                padding: 16, textAlign: "center", fontWeight: 900, fontSize: 18, marginBottom: 16
              }}>
                {g.icon}
                <div style={{ marginTop: 8 }}>{g.label}</div>
                <div style={{ fontWeight: 700, color: "#232a2e", marginTop: 7 }}>
                  Engagement: <span style={{ color: "#1de682" }}>
                    {stakeholders.filter(s => s.group === g.key).reduce((sum, s) => sum + s.engagement, 0) /
                      (stakeholders.filter(s => s.group === g.key).length || 1)
                    }
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: "#ff4848", marginTop: 2 }}>
                  At Risk: <span>
                    {stakeholders.filter(s => s.group === g.key && s.risk).length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Action Log */}
      {tab === "log" && (
        <div style={{
          background: "#232a2e", borderRadius: 16, padding: 18, marginBottom: 15
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 8 }}>Engagement Touchpoint Log</h4>
          <table style={{ width: "100%", fontSize: 16, color: "#fff", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Stakeholder</th><th>Date</th><th>Action</th><th>Note</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.flatMap(s =>
                (s.history || []).map((h, idx) =>
                  <tr key={s.id + "_" + idx} style={{ borderBottom: "1px solid #FFD70022" }}>
                    <td>{s.name}</td>
                    <td>{h.date}</td>
                    <td>{h.action}</td>
                    <td>{h.note}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Campaign Engine */}
      {tab === "campaigns" && (
        <div style={{
          background: "#283E51", borderRadius: 18, padding: 24, marginBottom: 15
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 12 }}>Engagement Campaigns</h4>
          <table style={{ width: "100%", fontSize: 16, color: "#fff", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Name</th><th>Owner</th><th>Target</th><th>Status</th><th>Impact</th><th>Dates</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c =>
                <tr key={c.id} style={{ borderBottom: "1px solid #FFD70022" }}>
                  <td>{c.name}</td>
                  <td>{c.owner}</td>
                  <td>{GROUPS.find(g => g.key === c.target)?.label || c.target}</td>
                  <td style={{ color: c.status === "Completed" ? "#1de682" : c.status === "Active" ? "#FFD700" : "#283E51" }}>{c.status}</td>
                  <td>{c.impact !== null ? (c.impact * 100).toFixed(1) + "%" : "—"}</td>
                  <td>{c.start} → {c.end}</td>
                  <td>
                    <button onClick={() => { setShowCampForm(true); setSelectedCampaign(c); }} style={{ ...btnStyle, background: brand.green, color: "#232a2e", padding: "2px 7px", marginRight: 4 }}><FaEdit /></button>
                    <button onClick={() => deleteCampaign(c.id)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", padding: "2px 7px" }}><FaTrash /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={() => { setShowCampForm(!showCampForm); setSelectedCampaign(null); }} style={{ ...btnStyle, marginTop: 11, background: brand.gold, color: "#232a2e" }}>
            <FaPlus style={{ marginRight: 7 }} /> {showCampForm ? "Cancel" : "Add Campaign"}
          </button>
          {showCampForm && (
            <form onSubmit={e => {
              e.preventDefault();
              const f = e.target;
              const c = {
                id: selectedCampaign ? selectedCampaign.id : undefined,
                name: f.name.value,
                owner: f.owner.value,
                target: f.target.value,
                status: f.status.value,
                impact: f.impact.value !== "" ? Number(f.impact.value) : null,
                start: f.start.value,
                end: f.end.value
              };
              if (selectedCampaign) updateCampaign(c);
              else addCampaign(c);
              f.reset();
            }} style={{
              marginTop: 12, background: "#232a2e", borderRadius: 10, padding: 12
            }}>
              <input name="name" placeholder="Campaign Name" required defaultValue={selectedCampaign?.name || ""} style={inputStyle} />
              <input name="owner" placeholder="Owner" required defaultValue={selectedCampaign?.owner || ""} style={inputStyle} />
              <select name="target" defaultValue={selectedCampaign?.target || "board"} style={inputStyle}>
                {GROUPS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
              <select name="status" defaultValue={selectedCampaign?.status || "Planned"} style={inputStyle}>
                <option>Planned</option>
                <option>Active</option>
                <option>Completed</option>
              </select>
              <input name="impact" type="number" step={0.01} placeholder="Impact (0–1)" min={0} max={1} defaultValue={selectedCampaign?.impact || ""} style={inputStyle} />
              <input name="start" type="date" required defaultValue={selectedCampaign?.start || ""} style={inputStyle} />
              <input name="end" type="date" required defaultValue={selectedCampaign?.end || ""} style={inputStyle} />
              <button type="submit" style={{ ...btnStyle, marginRight: 11 }}>{selectedCampaign ? "Update" : "Add"}</button>
              {selectedCampaign &&
                <button type="button" onClick={() => { setSelectedCampaign(null); setShowCampForm(false); }} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}>Cancel</button>
              }
            </form>
          )}
        </div>
      )}
      {/* Sentiment Trend */}
      {tab === "trend" && (
        <div style={{
          background: "#232a2e", borderRadius: 18, padding: 24, marginBottom: 15
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 12 }}>Stakeholder Sentiment Trend</h4>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={sentimentTrend}>
              <XAxis dataKey="period" stroke="#FFD700" />
              <YAxis stroke="#1de682" domain={[-1, 1]} />
              <CartesianGrid strokeDasharray="3 3" />
              {GROUPS.map(g => (
                <Area key={g.key} type="monotone" dataKey={g.key} stroke={g.color} fill={g.color + "44"} />
              ))}
              <Legend />
              <ReTooltip />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Controls */}
      <div style={{
        margin: "28px 0 5px 0", display: "flex", gap: 14, alignItems: "center"
      }}>
        <button onClick={undo} style={btnStyle}><FaUndo /> Undo</button>
        <button onClick={redo} style={btnStyle}><FaRedo /> Redo</button>
        <button onClick={exportCSV} style={{ ...btnStyle, background: brand.green, color: "#232a2e" }}><FaFileExport /> Export CSV</button>
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
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default StakeholderEngagementCockpit;
