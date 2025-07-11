// src/components/AthleteMilestoneTimelineUltra.jsx
import React, { useState } from "react";
import {
  FaBasketballBall, FaArrowUp, FaArrowDown, FaCheckCircle, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaBolt, FaHeartbeat, FaUserTie, FaAward, FaRunning, FaExchangeAlt, FaFileExport, FaSave, FaUndo, FaRedo, FaLightbulb, FaFilter, FaTimes, FaChartPie
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };

const EVENT_CATEGORIES = [
  { key: "club", label: "Club", icon: <FaBasketballBall />, color: "#FFD700" },
  { key: "coach", label: "Coach", icon: <FaUserTie />, color: "#1de682" },
  { key: "injury", label: "Injury", icon: <FaHeartbeat />, color: "#ff4848" },
  { key: "growth", label: "Growth Spurt", icon: <FaArrowUp />, color: "#FFD700" },
  { key: "recovery", label: "Recovery", icon: <FaRunning />, color: "#1de682" },
  { key: "award", label: "Award", icon: <FaAward />, color: "#FFD700" },
  { key: "crisis", label: "Crisis", icon: <FaExclamationTriangle />, color: "#ff4848" },
  { key: "transition", label: "Transition", icon: <FaExchangeAlt />, color: "#FFD700" },
  { key: "breakthrough", label: "Breakthrough", icon: <FaBolt />, color: "#1de682" },
  { key: "limit", label: "Limit Breaker", icon: <FaLightbulb />, color: "#FFD700" }
];

const IMPACT_COLORS = {
  positive: "#1de682",
  negative: "#ff4848",
  neutral: "#FFD700",
  limit: "#FFD700",
  alert: "#ff4848"
};

const demoTimeline = [
  {
    date: "2018-08-15", label: "Joined Club X", category: "club", impact: "positive", notes: "First club registration.",
    details: "Entered local development program at age 10.",
    boardroom: "Classic positive milestone—athlete on path.",
    attachments: []
  },
  {
    date: "2019-09-10", label: "Coach Change (Perković)", category: "coach", impact: "positive",
    notes: "Switched to high-performing coach.", details: "Rapid improvement in discipline and skills.",
    boardroom: "Acceleration point—right coach at right time.",
    attachments: []
  },
  {
    date: "2020-02-21", label: "Growth Spurt", category: "growth", impact: "neutral",
    notes: "Grew 14cm in 10 months.", details: "Required monitoring of physical risk.",
    boardroom: "Monitor physical load and injury risk.",
    attachments: []
  },
  {
    date: "2021-04-12", label: "Knee Injury", category: "injury", impact: "negative",
    notes: "Partial meniscus tear.", details: "Missed 4 months. High physical/mental stress.",
    boardroom: "ALERT: Major negative inflection point—requires recovery scenario and staff intervention.",
    attachments: ["https://medreport.com/knee-mri-2021.pdf"]
  },
  {
    date: "2021-09-10", label: "Return to Play", category: "recovery", impact: "positive",
    notes: "Cleared for full activity.", details: "Reintegrated with strength program.",
    boardroom: "Successful recovery—monitor for recurrence risk.",
    attachments: []
  },
  {
    date: "2022-05-17", label: "First Senior Team Selection", category: "transition", impact: "limit",
    notes: "Debut with seniors at 15.", details: "Rapid career acceleration.",
    boardroom: "LIMIT BREAKER: Prepare mental, physical, and support plan.",
    attachments: []
  },
  {
    date: "2023-02-14", label: "Coach Mismatch", category: "coach", impact: "negative",
    notes: "New coach, role reduced.", details: "Motivation and performance declined.",
    boardroom: "ALERT: Risk of trajectory stall. Urgent review with staff/parents.",
    attachments: []
  },
  {
    date: "2023-05-20", label: "All-Star Tournament MVP", category: "award", impact: "positive",
    notes: "Dominated at national event.", details: "Top scorer, defensive anchor.",
    boardroom: "Positive breakthrough—use to leverage new development plan or promotion.",
    attachments: []
  },
  {
    date: "2024-01-06", label: "Injury Scare (Fatigue)", category: "injury", impact: "alert",
    notes: "Medical flagged burnout risk.", details: "Sleep and load monitoring increased.",
    boardroom: "ALERT: Fatigue risk—adjust training and ensure recovery protocol.",
    attachments: []
  },
  {
    date: "2024-08-22", label: "NBA Transition Offer", category: "transition", impact: "limit",
    notes: "Signed for NBA club.", details: "Negotiated support system and role.",
    boardroom: "LIMIT BREAKER: All-systems review—transition risk scenario activated.",
    attachments: []
  }
];

const impactOrder = ["positive", "neutral", "negative", "alert", "limit"];
const sortByDate = arr => arr.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

// Pie/Bar Chart helpers
function getImpactStats(data) {
  let stat = {};
  impactOrder.forEach(i => stat[i] = 0);
  data.forEach(ev => { stat[ev.impact] = (stat[ev.impact] || 0) + 1; });
  return stat;
}
function getCategoryStats(data) {
  let stat = {};
  EVENT_CATEGORIES.forEach(cat => stat[cat.key] = 0);
  data.forEach(ev => { stat[ev.category] = (stat[ev.category] || 0) + 1; });
  return stat;
}
function getNextRiskEvent(timeline) {
  const upcoming = sortByDate(timeline).find(ev => ev.impact === "alert" || ev.impact === "negative" || ev.impact === "limit");
  return upcoming ? `${upcoming.date}: ${upcoming.label} (${upcoming.impact})` : "No critical events on horizon.";
}

const AthleteMilestoneTimelineUltra = () => {
  const [timeline, setTimeline] = useState(demoTimeline);
  const [history, setHistory] = useState([demoTimeline]);
  const [redoStack, setRedoStack] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [impactFilter, setImpactFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [showStats, setShowStats] = useState(false);

  // CRUD
  const addEvent = ev => {
    const next = [...timeline, { ...ev, id: Date.now() }];
    setTimeline(next);
    setHistory([...history, next]);
    setRedoStack([]);
    setSelected(null);
    setShowForm(false);
  };
  const updateEvent = ev => {
    const next = timeline.map(e =>
      e.date === ev.date && e.label === ev.label ? { ...ev, id: e.id } : e
    );
    setTimeline(next);
    setHistory([...history, next]);
    setRedoStack([]);
    setSelected(null);
    setShowForm(false);
  };
  const deleteEvent = (date, label) => {
    const next = timeline.filter(e => !(e.date === date && e.label === label));
    setTimeline(next);
    setHistory([...history, next]);
    setRedoStack([]);
    setSelected(null);
    setShowForm(false);
  };
  const undo = () => {
    if (history.length <= 1) return;
    setRedoStack([timeline, ...redoStack]);
    const prev = history[history.length - 2];
    setTimeline(prev);
    setHistory(history.slice(0, -1));
    setSelected(null);
    setShowForm(false);
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    setHistory([...history, redoStack[0]]);
    setTimeline(redoStack[0]);
    setRedoStack(redoStack.slice(1));
    setSelected(null);
    setShowForm(false);
  };
  const saveScenario = () => {
    if (!scenarioName) return;
    setSavedScenarios([...savedScenarios, { name: scenarioName, timeline: JSON.parse(JSON.stringify(timeline)) }]);
    setScenarioName('');
  };
  const loadScenario = idx => {
    setTimeline(savedScenarios[idx].timeline);
    setHistory([...history, savedScenarios[idx].timeline]);
    setRedoStack([]);
    setSelected(null);
    setShowForm(false);
  };
  const exportCSV = () => {
    const csv = [
      "Date,Label,Category,Impact,Notes,Details,Boardroom,Attachments"
    ].concat(timeline.map(ev =>
      [ev.date, ev.label, ev.category, ev.impact, ev.notes, ev.details, ev.boardroom, (ev.attachments || []).join("|")].join(",")
    )).join('\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "milestone_timeline.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // Boardroom summary
  function boardroomCopy() {
    let lines = [];
    let stat = getImpactStats(timeline);
    let highImpact = timeline.filter(ev => ev.impact === "alert" || ev.impact === "negative" || ev.impact === "limit");
    lines.push(`Timeline: ${stat.positive} positives, ${stat.negative} negatives, ${stat.limit} limit-breakers, ${stat.alert} alerts.`);
    if (highImpact.length)
      lines.push(`Boardroom Action: ${highImpact.length} inflection(s) require executive attention. Next: ${getNextRiskEvent(timeline)}`);
    else
      lines.push("Trajectory is stable—no alerts/negatives upcoming.");
    // Root cause/cat analytics
    let catStat = getCategoryStats(timeline);
    let maxCat = Object.keys(catStat).reduce((a, b) => catStat[a] > catStat[b] ? a : b, "club");
    if (catStat[maxCat] > 2)
      lines.push(`Most frequent root cause: ${(EVENT_CATEGORIES.find(cat => cat.key === maxCat) || {}).label} (${catStat[maxCat]})`);
    return lines;
  }

  // Filtering logic
  let filtered = timeline.filter(ev =>
    (!impactFilter.length || impactFilter.includes(ev.impact)) &&
    (!categoryFilter.length || categoryFilter.includes(ev.category))
  );

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1200, margin: "0 auto"
    }}>
      {/* Header + Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <FaBasketballBall size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Athlete Milestone Timeline & Event Log
        </h2>
        <button onClick={() => setShowStats(s => !s)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginLeft: 30 }}>
          {showStats ? <FaTimes /> : <FaChartPie />} {showStats ? "Hide" : "Show"} Analytics
        </button>
        <button onClick={() => { setSelected(null); setShowForm(!showForm); }} style={{ ...btnStyle, background: brand.green, color: "#232a2e", marginLeft: 15 }}>
          <FaPlus style={{ marginRight: 8 }} />
          {showForm ? "Cancel" : "Add Event"}
        </button>
      </div>
      {/* Timeline Analytics */}
      {showStats && (
        <div style={{
          display: "flex", gap: 32, alignItems: "center", margin: "15px 0 15px 0", background: "#232a2e",
          borderRadius: 18, padding: 18, boxShadow: "0 2px 14px #FFD70022"
        }}>
          {/* Impact Heatmap */}
          <div>
            <div style={{ fontWeight: 700, color: "#FFD700" }}>Impact Heatmap</div>
            {Object.entries(getImpactStats(timeline)).map(([imp, cnt]) => (
              <div key={imp} style={{ color: IMPACT_COLORS[imp], fontWeight: 700, fontSize: 16 }}>
                {imp[0].toUpperCase() + imp.slice(1)}: {cnt}
              </div>
            ))}
          </div>
          {/* Category Table */}
          <div>
            <div style={{ fontWeight: 700, color: "#FFD700" }}>Event Category Frequency</div>
            {Object.entries(getCategoryStats(timeline)).map(([cat, cnt]) => cnt > 0 &&
              <div key={cat} style={{ color: "#FFD700bb", fontWeight: 700, fontSize: 15 }}>
                {(EVENT_CATEGORIES.find(c => c.key === cat) || {}).label}: {cnt}
              </div>
            )}
          </div>
          {/* Risk Now/Next */}
          <div>
            <div style={{ fontWeight: 700, color: "#FFD700" }}>Risk Now/Next</div>
            <div style={{ color: "#ff4848", fontWeight: 900 }}>{getNextRiskEvent(timeline)}</div>
          </div>
        </div>
      )}
      {/* Boardroom Copy Generator */}
      <div style={{
        background: "#283E51", borderRadius: 12, padding: 16, marginBottom: 12, fontWeight: 700, color: "#FFD700"
      }}>
        <FaLightbulb style={{ marginRight: 8, color: "#FFD700" }} />
        {boardroomCopy().map((line, i) => <div key={i}>{line}</div>)}
      </div>
      {/* Filter Panel */}
      <div style={{ display: "flex", gap: 20, marginBottom: 9, alignItems: "center" }}>
        <FaFilter color="#FFD700" />
        <span style={{ color: "#FFD700", fontWeight: 700, marginRight: 10 }}>Filter by Impact:</span>
        {impactOrder.map(imp =>
          <button key={imp} style={{
            ...btnStyle, background: impactFilter.includes(imp) ? "#FFD700" : "#232a2e", color: impactFilter.includes(imp) ? "#232a2e" : IMPACT_COLORS[imp]
          }} onClick={() => setImpactFilter(f => f.includes(imp) ? f.filter(x => x !== imp) : [...f, imp])}>
            {imp[0].toUpperCase() + imp.slice(1)}
          </button>
        )}
        <span style={{ color: "#FFD700", fontWeight: 700, marginLeft: 20, marginRight: 10 }}>Category:</span>
        {EVENT_CATEGORIES.map(cat =>
          <button key={cat.key} style={{
            ...btnStyle, background: categoryFilter.includes(cat.key) ? "#FFD700" : "#232a2e", color: categoryFilter.includes(cat.key) ? "#232a2e" : cat.color
          }} onClick={() => setCategoryFilter(f => f.includes(cat.key) ? f.filter(x => x !== cat.key) : [...f, cat.key])}>
            {cat.label}
          </button>
        )}
        {(impactFilter.length > 0 || categoryFilter.length > 0) &&
          <button style={{ ...btnStyle, background: "#ff4848", color: "#fff", marginLeft: 12 }} onClick={() => { setImpactFilter([]); setCategoryFilter([]); }}>
            Clear All
          </button>
        }
      </div>
      {/* Timeline List */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 14, marginBottom: 20
      }}>
        {sortByDate(filtered).map(ev =>
          <div key={ev.date + ev.label}
            style={{
              display: "flex", alignItems: "flex-start", gap: 14, background: "#232a2e",
              borderRadius: 14, padding: "14px 19px", boxShadow: "0 2px 18px #FFD70017", borderLeft: `7px solid ${IMPACT_COLORS[ev.impact] || "#FFD700"}`
            }}>
            <div style={{ fontSize: 26, marginRight: 7 }}>
              {EVENT_CATEGORIES.find(c => c.key === ev.category)?.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: IMPACT_COLORS[ev.impact] || "#FFD700" }}>
                {ev.label} <span style={{ fontWeight: 500, color: "#FFD70099", fontSize: 13, marginLeft: 8 }}>{ev.date}</span>
              </div>
              <div style={{ fontSize: 15, color: "#FFD700cc", marginBottom: 2 }}>{(EVENT_CATEGORIES.find(c => c.key === ev.category) || {}).label || ev.category}</div>
              <div style={{ fontSize: 14, marginBottom: 2 }}>{ev.notes}</div>
              <div style={{ fontSize: 13, color: "#fff" }}>{ev.details}</div>
              <div style={{ fontSize: 13, color: "#1de682", margin: "4px 0" }}>
                <b>Boardroom:</b> {ev.boardroom}
              </div>
              {ev.attachments && ev.attachments.length > 0 && (
                <div style={{ fontSize: 13, color: "#FFD70099" }}>
                  Attachments: {ev.attachments.map((att, i) =>
                    <a href={att} key={i} target="_blank" rel="noopener noreferrer" style={{ color: "#FFD700" }}>
                      {att.split("/").pop()}
                    </a>
                  )}
                </div>
              )}
            </div>
            <div>
              <button onClick={() => { setSelected(ev); setShowForm(true); }} style={{ ...btnStyle, background: brand.green, color: "#232a2e", padding: "2px 7px", marginRight: 4 }}><FaEdit /></button>
              <button onClick={() => {
                if (window.confirm("Delete this event?")) deleteEvent(ev.date, ev.label);
              }} style={{ ...btnStyle, background: "#ff4848", color: "#fff", padding: "2px 7px" }}><FaTrash /></button>
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div style={{ color: "#FFD700cc", fontWeight: 700, fontSize: 19, marginTop: 22 }}>No events match filters.</div>
        )}
      </div>
      {/* Add/Edit Event */}
      {showForm && (
        <form onSubmit={e => {
          e.preventDefault();
          const f = e.target;
          const ev = {
            date: f.date.value,
            label: f.label.value,
            category: f.category.value,
            impact: f.impact.value,
            notes: f.notes.value,
            details: f.details.value,
            boardroom: f.boardroom.value,
            attachments: f.attachments.value.split('|').map(s => s.trim()).filter(Boolean)
          };
          if (selected) updateEvent(ev); else addEvent(ev);
          f.reset();
          setShowForm(false); setSelected(null);
        }} style={{
          marginBottom: 32, background: "#283E51", borderRadius: 10, padding: 17, maxWidth: 750
        }}>
          <div style={{ display: "flex", gap: 13, flexWrap: "wrap", marginBottom: 7 }}>
            <input name="date" type="date" required defaultValue={selected?.date || ""} style={inputStyle} />
            <input name="label" placeholder="Event Label" required defaultValue={selected?.label || ""} style={inputStyle} />
            <select name="category" defaultValue={selected?.category || "club"} style={inputStyle}>
              {EVENT_CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
            </select>
            <select name="impact" defaultValue={selected?.impact || "positive"} style={inputStyle}>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
              <option value="limit">Limit Breaker</option>
              <option value="alert">Alert</option>
            </select>
          </div>
          <input name="notes" placeholder="Short Notes" required defaultValue={selected?.notes || ""} style={inputStyleFull} />
          <input name="details" placeholder="Full Details" defaultValue={selected?.details || ""} style={inputStyleFull} />
          <input name="boardroom" placeholder="Boardroom Recommendation" defaultValue={selected?.boardroom || ""} style={inputStyleFull} />
          <input name="attachments" placeholder="Attachments (pipe-separated URLs/names)" defaultValue={selected?.attachments?.join('|') || ""} style={inputStyleFull} />
          <div style={{ marginTop: 8 }}>
            <button type="submit" style={{ ...btnStyle, marginRight: 11 }}>{selected ? "Update" : "Add"}</button>
            <button type="button" onClick={() => { setSelected(null); setShowForm(false); }} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}>Cancel</button>
          </div>
        </form>
      )}
      {/* Controls */}
      <div style={{
        margin: "28px 0 5px 0", display: "flex", gap: 14, alignItems: "center"
      }}>
        <button onClick={undo} style={btnStyle}><FaUndo /> Undo</button>
        <button onClick={redo} style={btnStyle}><FaRedo /> Redo</button>
        <button onClick={exportCSV} style={{ ...btnStyle, background: brand.green, color: "#232a2e" }}><FaFileExport /> Export CSV</button>
        <input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Scenario Name"
          style={{ borderRadius: 6, padding: 5, border: "1px solid #FFD70077", fontWeight: 700, marginRight: 7, background: "#181e23", color: "#fff" }} />
        <button onClick={saveScenario} style={{ ...btnStyle, background: brand.gold, color: "#232a2e" }}><FaSave /> Save</button>
        {savedScenarios.length > 0 && (
          <span style={{ color: brand.gold, fontWeight: 600, fontSize: 14, marginLeft: 6 }}>
            Load:
            {savedScenarios.map((sc, idx) =>
              <button key={idx} onClick={() => loadScenario(idx)} style={{
                background: '#FFD700', color: '#232a2e', fontWeight: 700, border: 'none', borderRadius: 6, padding: '3px 8px', marginLeft: 5
              }}><FaFileExport style={{ marginRight: 4 }} />{sc.name}</button>
            )}
          </span>
        )}
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
  ...inputStyle, width: 270
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default AthleteMilestoneTimelineUltra;
