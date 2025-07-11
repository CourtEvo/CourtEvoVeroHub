// src/components/AthleteTimelineCompareGanttElite.jsx
import React, { useState } from "react";
import {
  FaBasketballBall, FaArrowUp, FaCheckCircle, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaBolt, FaHeartbeat, FaUserTie, FaAward, FaRunning, FaExchangeAlt, FaFileExport, FaUndo, FaRedo, FaLightbulb, FaChartBar, FaChartPie, FaTimes, FaUserPlus
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

// -------- ELITE DEMO ATHLETES --------
const initialAthletes = [
  {
    name: "Marko D.",
    info: "Combo guard, born 2004. Croatian U18, NBA draft prospect.",
    timeline: [
      { date: "2017-07-01", label: "Joined Club Zadar", category: "club", impact: "positive", notes: "Started basketball." },
      { date: "2018-04-05", label: "First Coach (Matosić)", category: "coach", impact: "positive", notes: "Laid technical foundation." },
      { date: "2019-01-11", label: "Growth Spurt", category: "growth", impact: "neutral", notes: "Grew 11cm in one year." },
      { date: "2020-09-20", label: "Knee Injury", category: "injury", impact: "negative", notes: "Partial meniscus tear, 3 months off." },
      { date: "2021-02-10", label: "Return to Play", category: "recovery", impact: "positive", notes: "Cleared after full rehab." },
      { date: "2021-10-02", label: "U17 National Team Selection", category: "award", impact: "positive", notes: "Standout performance at nationals." },
      { date: "2022-03-08", label: "Coach Change (Šarić)", category: "coach", impact: "positive", notes: "New focus on defense." },
      { date: "2022-12-01", label: "Fatigue/Overtraining Alert", category: "injury", impact: "alert", notes: "Flagged by physio, adjusted schedule." },
      { date: "2023-03-18", label: "Club Transfer to Split", category: "transition", impact: "limit", notes: "Moved for senior opportunity." },
      { date: "2024-05-17", label: "Euro U20 All-Tournament Team", category: "award", impact: "limit", notes: "Dominant performance, NBA scouts present." }
    ]
  },
  {
    name: "Nikola S.",
    info: "Forward, born 2005. Steady developer, high basketball IQ.",
    timeline: [
      { date: "2017-09-10", label: "Joined Club Cedevita", category: "club", impact: "positive", notes: "Started basketball." },
      { date: "2018-03-20", label: "Coach Change (Šimić)", category: "coach", impact: "neutral", notes: "Transition to team focus." },
      { date: "2019-04-15", label: "Growth Plateau", category: "growth", impact: "neutral", notes: "Stopped growing, re-evaluated role." },
      { date: "2020-05-12", label: "Injury (Ankle Sprain)", category: "injury", impact: "negative", notes: "Missed 2 months." },
      { date: "2020-08-15", label: "Recovery (Return)", category: "recovery", impact: "positive", notes: "Back to full strength." },
      { date: "2021-06-18", label: "U16 National Team Call", category: "award", impact: "positive", notes: "Strong at European camp." },
      { date: "2022-11-05", label: "Coach Mismatch", category: "coach", impact: "negative", notes: "Role confusion." },
      { date: "2023-02-13", label: "Leadership Role (Captain)", category: "award", impact: "positive", notes: "Named club U18 captain." },
      { date: "2024-04-22", label: "Breakthrough Game", category: "breakthrough", impact: "positive", notes: "30 points vs Partizan U20." }
    ]
  }
];

// --- Utilities ---
const sortByDate = arr => arr.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
const getCategory = k => EVENT_CATEGORIES.find(cat => cat.key === k) || EVENT_CATEGORIES[0];
function getPeriods(timeline) {
  // [{label, from, to, color}]
  let out = [];
  let open = null;
  sortByDate(timeline).forEach(ev => {
    if (["injury", "crisis", "alert"].includes(ev.category)) {
      open = { label: ev.label, from: ev.date, to: null, color: IMPACT_COLORS[ev.impact] || "#FFD700" };
    }
    if (["recovery", "breakthrough", "award", "transition", "limit"].includes(ev.category) && open) {
      open.to = ev.date; out.push(open); open = null;
    }
  });
  if (open) { open.to = open.from; out.push(open); }
  return out;
}
function getTimelineDiff(t1, t2) {
  const e1 = t1.map(ev => ev.label);
  const e2 = t2.map(ev => ev.label);
  return [
    t1.filter(ev => !e2.includes(ev.label)),
    t2.filter(ev => !e1.includes(ev.label))
  ];
}
function getImpactStats(data) {
  let stat = {};
  ["positive", "neutral", "negative", "alert", "limit"].forEach(i => stat[i] = 0);
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
function generateBoardroomSummary(name, data) {
  let stat = getImpactStats(data);
  let highImpact = data.filter(ev => ev.impact === "alert" || ev.impact === "negative" || ev.impact === "limit");
  let lines = [];
  lines.push(`${name}: ${stat.positive} positives, ${stat.negative} negatives, ${stat.limit} limit-breakers, ${stat.alert} alerts.`);
  if (highImpact.length)
    lines.push(`Action: ${highImpact.length} inflection(s) need review. Next: ${getNextRiskEvent(data)}`);
  else
    lines.push("Trajectory stable—no alerts/negatives.");
  let catStat = getCategoryStats(data);
  let maxCat = Object.keys(catStat).reduce((a, b) => catStat[a] > catStat[b] ? a : b, "club");
  if (catStat[maxCat] > 2)
    lines.push(`Most frequent root cause: ${(EVENT_CATEGORIES.find(cat => cat.key === maxCat) || {}).label} (${catStat[maxCat]})`);
  return lines;
}

// --- Component ---
const AthleteTimelineCompareGanttElite = () => {
  const [athletes, setAthletes] = useState(initialAthletes);
  const [a1Idx, setA1Idx] = useState(0);
  const [a2Idx, setA2Idx] = useState(1);
  const [showDiff, setShowDiff] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInfo, setNewInfo] = useState("");
  const [selectedAth, setSelectedAth] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventEditIdx, setEventEditIdx] = useState(-1);
  const [eventData, setEventData] = useState({});

  const a1 = athletes[a1Idx];
  const a2 = athletes[a2Idx];
  const [diff1, diff2] = getTimelineDiff(a1.timeline, a2.timeline);

  // Add new athlete
  const handleAddAthlete = e => {
    e.preventDefault();
    setAthletes([...athletes, { name: newName, info: newInfo, timeline: [] }]);
    setNewName(""); setNewInfo(""); setAddMode(false);
  };

  // Add/Edit Event
  const handleEventSubmit = e => {
    e.preventDefault();
    let newTimeline = selectedAth.timeline.slice();
    if (eventEditIdx >= 0) newTimeline[eventEditIdx] = eventData;
    else newTimeline.push(eventData);
    let newAthletes = athletes.map((ath, idx) =>
      idx === selectedAth.idx ? { ...ath, timeline: newTimeline } : ath
    );
    setAthletes(newAthletes);
    setSelectedAth(null); setEventData({}); setShowEventForm(false); setEventEditIdx(-1);
  };

  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1450, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 10 }}>
        <FaChartBar size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Athlete Timeline Compare & Gantt (Elite)
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8,
          padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022'
        }}>
          CourtEvo Vero | Elite Analytics
        </span>
        <button style={{ ...btnStyle, marginLeft: 20 }} onClick={() => setAddMode(m => !m)}>
          <FaUserPlus style={{ marginRight: 6 }} /> {addMode ? "Cancel" : "Add Athlete"}
        </button>
        <button style={{ ...btnStyle, marginLeft: 10, background: showStats ? "#1de682" : "#FFD700", color: "#232a2e" }} onClick={() => setShowStats(s => !s)}>
          {showStats ? <FaTimes /> : <FaChartPie />} {showStats ? "Hide Stats" : "Show Stats"}
        </button>
      </div>
      {/* Add Athlete */}
      {addMode && (
        <form onSubmit={handleAddAthlete} style={{ background: "#232a2e", padding: 14, borderRadius: 10, margin: "14px 0", display: "flex", gap: 10 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" required style={inputStyle} />
          <input value={newInfo} onChange={e => setNewInfo(e.target.value)} placeholder="Info" required style={inputStyle} />
          <button type="submit" style={btnStyle}><FaPlus /> Add</button>
        </form>
      )}
      {/* Athlete Selectors */}
      <div style={{ display: "flex", gap: 30, alignItems: "center", margin: "22px 0 12px 0" }}>
        <div>
          <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 3 }}>Athlete 1:</div>
          <select value={a1Idx} onChange={e => setA1Idx(Number(e.target.value))} style={inputStyle}>
            {athletes.map((a, i) => <option key={i} value={i}>{a.name}</option>)}
          </select>
          <div style={{ fontSize: 13, color: "#FFD700bb" }}>{a1.info}</div>
          <button style={{ ...btnStyle, background: "#FFD700", marginTop: 5 }} onClick={() => { setSelectedAth({ ...a1, idx: a1Idx }); setShowEventForm(true); }}>+ Event</button>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 3 }}>Athlete 2:</div>
          <select value={a2Idx} onChange={e => setA2Idx(Number(e.target.value))} style={inputStyle}>
            {athletes.map((a, i) => <option key={i} value={i}>{a.name}</option>)}
          </select>
          <div style={{ fontSize: 13, color: "#FFD700bb" }}>{a2.info}</div>
          <button style={{ ...btnStyle, background: "#FFD700", marginTop: 5 }} onClick={() => { setSelectedAth({ ...a2, idx: a2Idx }); setShowEventForm(true); }}>+ Event</button>
        </div>
        <button style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", fontWeight: 900, marginLeft: 20 }} onClick={() => setShowDiff(d => !d)}>
          {showDiff ? "Hide" : "Show"} Key Differences
        </button>
      </div>
      {/* Boardroom Automated Gap/Similarity & Stats */}
      {(showDiff || showStats) && (
        <div style={{ margin: "10px 0 15px 0", background: "#232a2e", borderRadius: 13, padding: 18, color: "#FFD700", fontWeight: 700, fontSize: 16, display: "flex", gap: 50 }}>
          {showDiff && (
            <div>
              <div>Unique to <span style={{ color: "#1de682" }}>{a1.name}</span>: {diff1.length ? diff1.map(e => e.label).join(", ") : "None"}</div>
              <div>Unique to <span style={{ color: "#1de682" }}>{a2.name}</span>: {diff2.length ? diff2.map(e => e.label).join(", ") : "None"}</div>
              <div style={{ marginTop: 7, color: "#FFD700cc", fontWeight: 600 }}>
                {diff1.length === 0 && diff2.length === 0 ? "Paths highly similar. Projected risk/opportunity patterns align." : "Trajectory gaps—review unique risk or acceleration triggers."}
              </div>
            </div>
          )}
          {showStats && (
            <>
              <div>
                <div style={{ fontWeight: 700, color: "#FFD700" }}>Impact Heatmap: {a1.name}</div>
                {Object.entries(getImpactStats(a1.timeline)).map(([imp, cnt]) => (
                  <div key={imp} style={{ color: IMPACT_COLORS[imp], fontWeight: 700, fontSize: 15 }}>
                    {imp[0].toUpperCase() + imp.slice(1)}: {cnt}
                  </div>
                ))}
                <div style={{ fontWeight: 700, color: "#FFD700", marginTop: 6 }}>Category Frequency</div>
                {Object.entries(getCategoryStats(a1.timeline)).map(([cat, cnt]) => cnt > 0 &&
                  <div key={cat} style={{ color: "#FFD700bb", fontWeight: 700, fontSize: 14 }}>
                    {(EVENT_CATEGORIES.find(c => c.key === cat) || {}).label}: {cnt}
                  </div>
                )}
                <div style={{ marginTop: 5, color: "#FFD700cc" }}>{generateBoardroomSummary(a1.name, a1.timeline).map((line, i) => <div key={i}>{line}</div>)}</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#FFD700" }}>Impact Heatmap: {a2.name}</div>
                {Object.entries(getImpactStats(a2.timeline)).map(([imp, cnt]) => (
                  <div key={imp} style={{ color: IMPACT_COLORS[imp], fontWeight: 700, fontSize: 15 }}>
                    {imp[0].toUpperCase() + imp.slice(1)}: {cnt}
                  </div>
                ))}
                <div style={{ fontWeight: 700, color: "#FFD700", marginTop: 6 }}>Category Frequency</div>
                {Object.entries(getCategoryStats(a2.timeline)).map(([cat, cnt]) => cnt > 0 &&
                  <div key={cat} style={{ color: "#FFD700bb", fontWeight: 700, fontSize: 14 }}>
                    {(EVENT_CATEGORIES.find(c => c.key === cat) || {}).label}: {cnt}
                  </div>
                )}
                <div style={{ marginTop: 5, color: "#FFD700cc" }}>{generateBoardroomSummary(a2.name, a2.timeline).map((line, i) => <div key={i}>{line}</div>)}</div>
              </div>
            </>
          )}
        </div>
      )}
      {/* Timeline Compare Side-by-Side */}
      <div style={{ display: "flex", gap: 30, justifyContent: "space-between", alignItems: "flex-start", margin: "18px 0 30px 0" }}>
        {[a1, a2].map((ath, idx) =>
          <div key={ath.name} style={{ background: "#232a2e", borderRadius: 16, minWidth: 350, flex: 1, boxShadow: "0 2px 14px #FFD70022", padding: "12px 12px" }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: brand.gold, marginBottom: 5 }}>{ath.name}</div>
            <div style={{ color: "#FFD700bb", fontSize: 13, marginBottom: 7 }}>{ath.info}</div>
            {sortByDate(ath.timeline).map((ev, ei) =>
              <div key={ev.date + ev.label} style={{
                display: "flex", alignItems: "center", gap: 7, marginBottom: 9, padding: "5px 0",
                borderLeft: `7px solid ${IMPACT_COLORS[ev.impact] || "#FFD700"}`
              }}>
                <div style={{ fontSize: 18 }}>{getCategory(ev.category).icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: IMPACT_COLORS[ev.impact] || "#FFD700" }}>{ev.label}</div>
                  <div style={{ fontSize: 13, color: "#FFD700cc" }}>{ev.date}</div>
                  <div style={{ fontSize: 13, color: getCategory(ev.category).color }}>{getCategory(ev.category).label}</div>
                  <div style={{ fontSize: 12, color: "#1de682" }}>{ev.notes}</div>
                </div>
                <button style={{ ...btnStyle, marginLeft: 8, background: "#1de682", color: "#232a2e" }}
                  onClick={() => { setSelectedAth({ ...ath, idx: idx === 0 ? a1Idx : a2Idx }); setShowEventForm(true); setEventEditIdx(ei); setEventData(ev); }}>
                  <FaEdit />
                </button>
                <button style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}
                  onClick={() => {
                    if (window.confirm("Delete this event?")) {
                      let t = ath.timeline.filter((_, i) => i !== ei);
                      let newAthletes = athletes.map((a, aid) => (aid === (idx === 0 ? a1Idx : a2Idx)) ? { ...a, timeline: t } : a);
                      setAthletes(newAthletes);
                    }
                  }}>
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Gantt Chart Visualization */}
      <div style={{ background: "#232a2e", borderRadius: 17, padding: 17, boxShadow: "0 2px 14px #FFD70022", margin: "24px 0" }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 17, marginBottom: 10 }}>Gantt-Style Periods (Risk/Recovery/Limit/Transition)</div>
        {[a1, a2].map((ath, idx) => (
          <div key={ath.name} style={{ marginBottom: 15 }}>
            <div style={{ color: brand.gold, fontWeight: 700 }}>{ath.name}</div>
            <div style={{ position: "relative", minHeight: 34, marginBottom: 7, background: "#283E51", borderRadius: 11, padding: "6px 2px" }}>
              {getPeriods(ath.timeline).map((period, i) => (
                <div key={i} style={{
                  position: "absolute", left: `${((new Date(period.from) - new Date("2017-06-01")) / (new Date("2025-12-31") - new Date("2017-06-01"))) * 100}%`,
                  width: `${((new Date(period.to) - new Date(period.from)) / (new Date("2025-12-31") - new Date("2017-06-01"))) * 100}%`,
                  height: 18, background: period.color, borderRadius: 6, top: 10, opacity: 0.87,
                  minWidth: 25, textAlign: "center", color: "#232a2e", fontWeight: 700, fontSize: 13, zIndex: 2
                }}>
                  {period.label}
                </div>
              ))}
              {/* Timeline axis */}
              <div style={{
                position: "absolute", left: 0, right: 0, top: 24, height: 1, background: "#FFD70055", zIndex: 1
              }} />
              {[2017,2018,2019,2020,2021,2022,2023,2024,2025].map(year =>
                <div key={year} style={{
                  position: "absolute", left: `${((new Date(`${year}-01-01`) - new Date("2017-06-01")) / (new Date("2025-12-31") - new Date("2017-06-01"))) * 100}%`,
                  top: 30, color: "#FFD700aa", fontSize: 12, fontWeight: 700
                }}>{year}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Add/Edit Event Modal */}
      {showEventForm && (
        <form onSubmit={handleEventSubmit} style={{
          position: "fixed", top: "13vh", left: "50%", transform: "translateX(-50%)", background: "#181e23", zIndex: 100, padding: 28, borderRadius: 15, minWidth: 380, boxShadow: "0 6px 32px #FFD70033"
        }}>
          <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 18, marginBottom: 10 }}>
            {eventEditIdx >= 0 ? "Edit Event" : "Add Event"} for {selectedAth?.name}
          </div>
          <input type="date" required value={eventData.date || ""} onChange={e => setEventData({ ...eventData, date: e.target.value })} style={inputStyle} />
          <input placeholder="Label" required value={eventData.label || ""} onChange={e => setEventData({ ...eventData, label: e.target.value })} style={inputStyle} />
          <select value={eventData.category || "club"} onChange={e => setEventData({ ...eventData, category: e.target.value })} style={inputStyle}>
            {EVENT_CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
          </select>
          <select value={eventData.impact || "positive"} onChange={e => setEventData({ ...eventData, impact: e.target.value })} style={inputStyle}>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
            <option value="limit">Limit Breaker</option>
            <option value="alert">Alert</option>
          </select>
          <input placeholder="Notes" value={eventData.notes || ""} onChange={e => setEventData({ ...eventData, notes: e.target.value })} style={inputStyleFull} />
          <div style={{ marginTop: 8 }}>
            <button type="submit" style={{ ...btnStyle, marginRight: 11 }}>{eventEditIdx >= 0 ? "Update" : "Add"}</button>
            <button type="button" onClick={() => { setShowEventForm(false); setEventEditIdx(-1); setEventData({}); setSelectedAth(null); }} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}>Cancel</button>
          </div>
        </form>
      )}
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
  ...inputStyle, width: 260
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default AthleteTimelineCompareGanttElite;
