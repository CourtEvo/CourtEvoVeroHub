import React, { useState } from "react";
import {
  FaCalendarAlt, FaBus, FaBed, FaDumbbell, FaHeartbeat, FaEuroSign,
  FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaFlag, FaRobot, FaUndo, FaSave, FaPrint
} from "react-icons/fa";
import "./ProTeamOpsWarRoom.css";

// --- Demo Data ---
const initialEvents = [
  { id: 1, date: "2024-09-01", type: "Practice", location: "Main Gym", time: "17:00", staff: "Ivan Horvat", notes: "Standard team session" },
  { id: 2, date: "2024-09-03", type: "Game", location: "Arena Cedevita", time: "19:00", staff: "Ivan Horvat", opponent: "Cedevita", notes: "League match" },
  { id: 3, date: "2024-09-05", type: "Travel", location: "Split", time: "08:00", staff: "Team Manager", notes: "Bus departs club" },
  { id: 4, date: "2024-09-06", type: "Medical", location: "Club Clinic", time: "10:00", staff: "Dr. Novak", notes: "Annual check-up" }
];
const travel = [
  { id: 1, dest: "Split", date: "2024-09-05", transport: "Bus", hotel: "Hotel Split", meals: "Club Menu", staff: "Horvat, Perić, Bašić, Marić", special: "Late checkout", cost: 390, approved: true },
  { id: 2, dest: "Zadar", date: "2024-09-12", transport: "Bus", hotel: "Zadar Inn", meals: "Standard", staff: "All team", special: "Vegetarian meals", cost: 420, approved: false }
];
const initialEquipment = [
  { item: "Basketballs", qty: 20, assigned: "Team", condition: "Good", reorder: false },
  { item: "Warmups", qty: 25, assigned: "All", condition: "Good", reorder: false },
  { item: "Resistance Bands", qty: 5, assigned: "Physio", condition: "Order", reorder: true }
];
const initialMedical = [
  { athlete: "Marko Kovač", type: "Injury", date: "2024-09-03", status: "Sprained ankle", plan: "Week rest", clearance: "Pending", doctor: "Dr. Novak", notes: "Needs recheck" },
  { athlete: "Ivan Perić", type: "Medical", date: "2024-09-06", status: "Annual check", plan: "Clear", clearance: "Complete", doctor: "Dr. Novak", notes: "Healthy" }
];
const initialExpenses = [
  { category: "Travel", budget: 400, actual: 390, notes: "Bus to Split" },
  { category: "Equipment", budget: 180, actual: 200, notes: "Bands reorder" },
  { category: "Meals", budget: 250, actual: 240, notes: "Hotel Split" }
];
const kpis = [
  { label: "Upcoming Tasks", value: 2 },
  { label: "Medical Alerts", value: 1 },
  { label: "Travel Events", value: 2 },
  { label: "Reorder Items", value: 1 },
  { label: "Budget Used", value: "87%" }
];

const eventTypes = {
  "Practice": { color: "#1de682", icon: <FaDumbbell /> },
  "Game": { color: "#FFD700", icon: <FaCalendarAlt /> },
  "Travel": { color: "#4ad1e7", icon: <FaBus /> },
  "Medical": { color: "#e84855", icon: <FaHeartbeat /> }
};

const today = "2024-09-03";

// --- Helper functions ---
function detectConflicts(evts) {
  // Travel and practice on same day is a conflict
  const dateMap = {};
  evts.forEach(e => {
    if (!dateMap[e.date]) dateMap[e.date] = [];
    dateMap[e.date].push(e.type);
  });
  const conflicts = Object.entries(dateMap)
    .filter(([d, types]) => types.length > 1)
    .map(([d, types]) => ({ date: d, types }));
  return conflicts;
}
function aiOpsTip(medical, equipment, expenses) {
  const med = medical.find(m => m.clearance === "Pending");
  const equip = equipment.find(e => e.reorder);
  const exp = expenses.find(e => e.actual > e.budget);
  if (med) return `Medical clearance pending for ${med.athlete}.`;
  if (equip) return `Reorder required: ${equip.item}.`;
  if (exp) return `Budget overrun on ${exp.category}.`;
  return "All operations optimal.";
}

// --- Component ---
export default function ProTeamOpsWarRoom() {
  const [events, setEvents] = useState(initialEvents);
  const [activeDay, setActiveDay] = useState(today);
  const [playing, setPlaying] = useState(false);
  const [playDayIdx, setPlayDayIdx] = useState(0);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [equipment, setEquipment] = useState(initialEquipment);
  const [medical, setMedical] = useState(initialMedical);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [simMsg, setSimMsg] = useState("");
  const [showExport, setShowExport] = useState(false);

  // Calendar logic
  const allDates = [...new Set(events.map(e => e.date))].sort();
  const calendarDays = getMonthDays("2024-09-01", 14);

  // Animate playbook
  React.useEffect(() => {
    if (playing && playDayIdx < allDates.length) {
      const timer = setTimeout(() => {
        setActiveDay(allDates[playDayIdx]);
        setPlayDayIdx(i => i + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (playing) {
      setPlaying(false);
      setPlayDayIdx(0);
    }
  }, [playing, playDayIdx, allDates]);

  // Conflict
  const conflicts = detectConflicts(events);

  // Drag & drop
  function handleDropEvent(date) {
    if (draggedEvent) {
      setEvents(evts =>
        evts.map(e => e.id === draggedEvent.id ? { ...e, date } : e)
      );
      setDraggedEvent(null);
      setActiveDay(date);
    }
  }

  // Heatmap for calendar days
  function getHeat(day) {
    const count = events.filter(e => e.date === day).length;
    if (count >= 3) return "opswr-heat-high";
    if (count === 2) return "opswr-heat-medium";
    return "opswr-heat-low";
  }

  // Scenario Sandbox
  function simulateEvent(type) {
    if (type === "injury") {
      setMedical(meds => [
        ...meds,
        { athlete: "Petar Petrović", type: "Injury", date: "2024-09-07", status: "Knee sprain", plan: "2 weeks rest", clearance: "Pending", doctor: "Dr. Novak", notes: "Simulated injury" }
      ]);
      setSimMsg("Simulated: Petar Petrović knee injury! Boardroom risk flagged.");
    } else if (type === "travelDelay") {
      setEvents(evts =>
        evts.map(e =>
          e.type === "Travel" ? { ...e, time: "13:00", notes: "Delayed 5 hours" } : e
        )
      );
      setSimMsg("Simulated: Travel delay. All subsequent events at risk of overlap!");
    } else if (type === "practiceCancel") {
      setEvents(evts => evts.filter(e => !(e.type === "Practice" && e.date === activeDay)));
      setSimMsg("Simulated: Practice on this day cancelled.");
    }
    setTimeout(() => setSimMsg(""), 2600);
  }
  function undoSimulation() {
    setEvents(initialEvents);
    setMedical(initialMedical);
    setSimMsg("Simulation reset to original.");
    setTimeout(() => setSimMsg(""), 1600);
  }

  // PDF Export (UI only)
  function exportPDF() { setShowExport(true); }

  return (
    <div className="opswr-main">
      <div className="opswr-header">
        <h2>Pro Team Operations War Room</h2>
        <div className="opswr-subtitle">
          <FaCalendarAlt style={{ marginRight: 8, color: "#FFD700" }} />
          All ops, logistics, risk, and board alerts in one timeline-driven command cockpit.
        </div>
      </div>

      {/* Scenario Sandbox */}
      <div className="opswr-sandbox-controls">
        <button onClick={() => simulateEvent('injury')}>Simulate Injury</button>
        <button onClick={() => simulateEvent('travelDelay')}>Simulate Travel Delay</button>
        <button onClick={() => simulateEvent('practiceCancel')}>Simulate Practice Cancel</button>
        <button onClick={undoSimulation}><FaUndo style={{ marginRight: 5 }} /> Undo Simulation</button>
        <button onClick={exportPDF}><FaPrint style={{ marginRight: 5 }} /> PDF Board Export</button>
      </div>
      {simMsg && (
        <div className="opswr-alert-banner">
          <FaFlag style={{ marginRight: 7 }} />
          {simMsg}
        </div>
      )}

      {/* Heatmap calendar */}
      <div className="opswr-heatmap-row">
        {calendarDays.map(day => (
          <div
            className={`opswr-heatmap-day ${getHeat(day)}`}
            key={day}
            onClick={() => setActiveDay(day)}
          >
            {day.slice(-2)}
          </div>
        ))}
      </div>

      {/* Timeline Command Center */}
      <div className="opswr-section">
        <div className="opswr-section-title">
          Timeline Calendar
          <button className="opswr-btn" onClick={() => setPlaying(!playing)} style={{ marginLeft: 16 }}>
            {playing ? "Pause" : "Play Week"}
          </button>
        </div>
        <div className="opswr-timeline-wrap">
          {calendarDays.map(date => (
            <div
              className={`opswr-timeline-day${activeDay === date ? " opswr-active-day" : ""}`}
              key={date}
              onClick={() => setActiveDay(date)}
              onDrop={() => handleDropEvent(date)}
              onDragOver={e => e.preventDefault()}
            >
              <div className="opswr-timeline-date">{date}</div>
              <div className="opswr-timeline-events">
                {events.filter(e => e.date === date).map(e => (
                  <div
                    key={e.id}
                    className="opswr-timeline-event"
                    style={{ background: eventTypes[e.type].color }}
                    draggable
                    onDragStart={() => setDraggedEvent(e)}
                  >
                    <span className="opswr-timeline-icon">{eventTypes[e.type].icon}</span>
                    {e.type} <span style={{ color: "#232a2e", fontWeight: 600 }}>@ {e.time}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="opswr-event-details">
          <div className="opswr-details-title">Events on {activeDay}</div>
          {events.filter(e => e.date === activeDay).map(e => (
            <div className="opswr-details-card" key={e.id}>
              <div className="opswr-details-head">
                {eventTypes[e.type].icon} <b>{e.type}</b> {e.location ? `@ ${e.location}` : ""}
                {e.opponent && <> <FaArrowRight /> {e.opponent} </>}
                <span className="opswr-details-staff">Staff: {e.staff}</span>
              </div>
              <div className="opswr-details-notes">{e.notes}</div>
            </div>
          ))}
        </div>
        {conflicts.length > 0 && (
          <div className="opswr-alert-banner">
            <FaExclamationTriangle style={{ color: "#FFD700", marginRight: 5 }} />
            <span>Ops Conflict: Multiple event types scheduled for {conflicts.map(c => c.date).join(", ")}!</span>
          </div>
        )}
      </div>

      {/* Travel & Logistics Cockpit */}
      <div className="opswr-section">
        <div className="opswr-section-title">Travel & Game Logistics</div>
        <div className="opswr-travel-table">
          <div className="opswr-travel-head">
            <div>Destination</div><div>Date</div><div>Transport</div>
            <div>Hotel</div><div>Meals</div><div>Staff/Roster</div>
            <div>Special Requests</div><div>Cost</div><div>Status</div>
          </div>
          {travel.map(t => (
            <div className="opswr-travel-row" key={t.id}>
              <div>{t.dest}</div><div>{t.date}</div><div>{t.transport}</div>
              <div>{t.hotel}</div><div>{t.meals}</div><div>{t.staff}</div>
              <div className={t.special ? "opswr-travel-special" : ""}>{t.special}</div>
              <div>€{t.cost}</div>
              <div>
                {t.approved
                  ? <span className="opswr-approved"><FaCheckCircle /> Approved</span>
                  : <span className="opswr-flagged"><FaFlag /> Pending</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource & Risk Radar + Live Meter */}
      <div className="opswr-section">
        <div className="opswr-section-title">Resource Risk & Efficiency Radar</div>
        <div className="opswr-risk-grid">
          <div className="opswr-risk-card">
            <div className="opswr-risk-label"><FaDumbbell /> Equipment</div>
            <ul>
              {equipment.map(e => (
                <li key={e.item} style={{ color: e.reorder ? "#e84855" : "#1de682" }}>
                  {e.item}: {e.qty} [{e.condition}]
                  {e.reorder && <span className="opswr-risk-alert"> Reorder!</span>}
                </li>
              ))}
            </ul>
            <div className="opswr-resource-meter">
              {equipment.map(e => (
                <div className="opswr-resource-item" key={e.item}>
                  {e.item}: <progress value={e.qty} max={25}></progress>
                  {e.qty <= 3 && <span className="opswr-critical">Critical!</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="opswr-risk-card">
            <div className="opswr-risk-label"><FaHeartbeat /> Medical</div>
            <ul>
              {medical.map(m => (
                <li key={m.athlete} style={{ color: m.clearance === "Pending" ? "#FFD700" : "#1de682" }}>
                  <b>{m.athlete}</b>: {m.status} ({m.clearance})
                  {m.clearance === "Pending" && <span className="opswr-risk-alert"> Clearance needed!</span>}
                  <div className="opswr-medical-notes">Dr: {m.doctor}. {m.notes}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="opswr-risk-card">
            <div className="opswr-risk-label"><FaEuroSign /> Expenses</div>
            <ul>
              {expenses.map(exp => (
                <li key={exp.category} style={{ color: exp.actual > exp.budget ? "#e84855" : "#1de682" }}>
                  {exp.category}: Budget €{exp.budget}, Actual €{exp.actual}
                  {exp.actual > exp.budget && <span className="opswr-risk-alert"> Over!</span>}
                  <span className="opswr-exp-spark">
                    <ExpenseSparkline budget={exp.budget} actual={exp.actual} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Boardroom Ops Dashboard & AI Advisor */}
      <div className="opswr-section">
        <div className="opswr-section-title">Boardroom Ops Dashboard</div>
        <div className="opswr-kpi-row">
          {kpis.map(k => (
            <div className="opswr-kpi-card" key={k.label}>
              <div className="opswr-kpi-label">{k.label}</div>
              <div className="opswr-kpi-value">{k.value}</div>
            </div>
          ))}
        </div>
        <div className="opswr-ai-panel">
          <FaRobot style={{ color: "#1de682", marginRight: 7 }} />
          <span>AI Ops Copilot: {aiOpsTip(medical, equipment, expenses)}</span>
        </div>
        <div className="opswr-ai-ask">
          <span>Ask Ops AI:</span>
          <button onClick={() => alert("Unapproved trips: Zadar")}>Unapproved Trips?</button>
          <button onClick={() => alert("Next week travel risk: Vegetarian meals not confirmed")}>Next Week’s Risks?</button>
        </div>
      </div>

      {/* Board PDF Export UI */}
      {showExport && (
        <div className="opswr-export-modal">
          <div className="opswr-export-box">
            <button className="opswr-export-close" onClick={() => setShowExport(false)}>×</button>
            <h3>PDF Export (UI Preview Only)</h3>
            <div style={{ color: "#FFD700", fontWeight: 700 }}>All operations, events, travel, KPIs, risks, and boardroom notes will be ready for PDF export in v2.</div>
            <div style={{ marginTop: 13, color: "#fff" }}>
              <div>Active Day: <b>{activeDay}</b></div>
              <div>Conflicts: <b>{conflicts.length ? conflicts.map(c => c.date).join(", ") : "None"}</b></div>
              <div style={{ marginTop: 13, fontSize: 15, color: "#1de682" }}>CourtEvo Vero branding, logos, and sign-off ready for print.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Utilities ---

function getMonthDays(start, num) {
  const arr = [];
  const base = new Date(start);
  for (let i = 0; i < num; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

// Sparkline (demo bar)
function ExpenseSparkline({ budget, actual }) {
  const pct = Math.min(100, Math.round((actual / budget) * 100));
  return (
    <span style={{
      display: "inline-block",
      marginLeft: 7,
      width: 42,
      height: 6,
      borderRadius: 6,
      background: "#232a2e",
      verticalAlign: "middle",
      position: "relative"
    }}>
      <span style={{
        display: "inline-block",
        width: `${pct}%`,
        height: 6,
        borderRadius: 6,
        background: pct > 100 ? "#e84855" : "#1de682",
        transition: "width 0.18s"
      }}></span>
    </span>
  );
}
