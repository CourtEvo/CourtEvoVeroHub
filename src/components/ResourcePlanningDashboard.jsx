import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUserTie, FaBasketballBall, FaExclamationTriangle, FaFileExport } from 'react-icons/fa';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const initialSchedule = [
  { id: 1, day: "Monday", court: "Court 1", time: "18:00-20:00", team: "U12", coach: "Luka", type: "Practice" },
  { id: 2, day: "Monday", court: "Court 2", time: "20:00-22:00", team: "Seniors", coach: "Marko", type: "Game" },
  { id: 3, day: "Tuesday", court: "Court 3", time: "17:00-18:30", team: "U14", coach: "Ivan", type: "Practice" },
];

const COURTS = ["Court 1", "Court 2", "Court 3"];
const COACHES = ["Jakov", "Marko", "Ivan", "Petar"];
const TEAMS = ["U12", "U14", "U16", "Seniors"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// Helpers for time parsing
function parseTimeRange(timeStr) {
  // "18:00-20:00" => [1080, 1200]
  const [start, end] = timeStr.split('-');
  const toMinutes = t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return [toMinutes(start), toMinutes(end)];
}

function hasClash(event, schedule) {
  return schedule.some(e =>
    e.id !== event.id &&
    e.day === event.day &&
    e.court === event.court &&
    (
      (() => {
        try {
          const [startA, endA] = parseTimeRange(event.time);
          const [startB, endB] = parseTimeRange(e.time);
          return (startA < endB && endA > startB); // overlap
        } catch {
          return false;
        }
      })()
    )
  );
}

const ResourceDashboard = () => {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [newEvent, setNewEvent] = useState({
    day: "Monday", court: "Court 1", time: "", team: "U12", coach: "Ana", type: "Practice"
  });
  const [filter, setFilter] = useState({ day: "All", court: "All", coach: "All", team: "All" });
  const dashboardRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => dashboardRef.current,
    documentTitle: `CourtEvoVero_ResourceDashboard_${new Date().toISOString().slice(0,10)}`
  });

  // Coach load summary
  const coachLoads = COACHES.map(coach => {
    const events = schedule.filter(e => e.coach === coach);
    // Estimate hours: sum (end-start)/60 for all events with valid time
    let totalHours = 0;
    for (let e of events) {
      try {
        const [start, end] = parseTimeRange(e.time);
        totalHours += (end - start) / 60;
      } catch { /* ignore bad time format */ }
    }
    return { coach, sessions: events.length, totalHours: totalHours.toFixed(1), overload: totalHours > 10 };
  });

  // Filter schedule
  let filteredSchedule = schedule;
  Object.entries(filter).forEach(([key, val]) => {
    if (val !== "All") filteredSchedule = filteredSchedule.filter(e => e[key] === val);
  });

  // Group events by day
  const eventsByDay = daysOfWeek.map(day => ({
    day,
    events: filteredSchedule.filter(e => e.day === day)
  }));

  // CSV Export
  const handleExportCSV = () => {
    const csv = Papa.unparse(schedule);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `CourtEvoVero_ResourceDashboard_${new Date().toISOString().slice(0,10)}.csv`);
  };

  // Add event handler
  const addEvent = e => {
    e.preventDefault();
    if (!newEvent.time) return;
    setSchedule([...schedule, { ...newEvent, id: Date.now() }]);
    setNewEvent({
      day: "Monday", court: "Court 1", time: "", team: "U12", coach: "Ana", type: "Practice"
    });
  };

  // Delete event handler
  const deleteEvent = id => setSchedule(schedule.filter(e => e.id !== id));

  return (
    <div style={{ width: '100%', maxWidth: 1150, margin: '0 auto', padding: 0 }}>
      <motion.section
        ref={dashboardRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <h2 style={{ color: "#FFD700", fontSize: 29, fontWeight: 700, marginBottom: 12 }}>
          Resource Planning Dashboard
        </h2>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 11, marginBottom: 13, flexWrap: 'wrap' }}>
          <span style={{ color: '#FFD700', fontWeight: 600 }}>Filter by:</span>
          <select value={filter.day} onChange={e => setFilter(f => ({ ...f, day: e.target.value }))}>
            <option>All</option>{daysOfWeek.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={filter.court} onChange={e => setFilter(f => ({ ...f, court: e.target.value }))}>
            <option>All</option>{COURTS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filter.coach} onChange={e => setFilter(f => ({ ...f, coach: e.target.value }))}>
            <option>All</option>{COACHES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filter.team} onChange={e => setFilter(f => ({ ...f, team: e.target.value }))}>
            <option>All</option>{TEAMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        {/* Event add */}
        <form onSubmit={addEvent} style={{ display: 'flex', gap: 9, marginBottom: 18, flexWrap: 'wrap' }}>
          <select
            value={newEvent.day}
            onChange={e => setNewEvent({ ...newEvent, day: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none' }}
          >
            {daysOfWeek.map(day => <option key={day}>{day}</option>)}
          </select>
          <select
            value={newEvent.court}
            onChange={e => setNewEvent({ ...newEvent, court: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none' }}
          >
            {COURTS.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            type="text"
            placeholder="Time (e.g. 18:00-20:00)"
            value={newEvent.time}
            onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none', width: 130 }}
            required
          />
          <select
            value={newEvent.team}
            onChange={e => setNewEvent({ ...newEvent, team: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none' }}
          >
            {TEAMS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select
            value={newEvent.coach}
            onChange={e => setNewEvent({ ...newEvent, coach: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none' }}
          >
            {COACHES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            value={newEvent.type}
            onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: 'none' }}
          >
            <option>Practice</option>
            <option>Game</option>
            <option>Event</option>
            <option>Conditioning</option>
          </select>
          <button
            type="submit"
            style={{
              background: "#FFD700",
              color: "#222",
              fontWeight: 700,
              border: "none",
              borderRadius: 7,
              padding: "8px 18px",
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #FFD70033"
            }}>
            + Add Event
          </button>
        </form>
        {/* Coach load summary */}
        <div style={{ marginBottom: 19, marginTop: 7 }}>
          <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 3 }}>Coach Load Summary:</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {coachLoads.map(load => (
              <div key={load.coach}
                style={{
                  background: load.overload ? "#FFD70033" : "#27ef7d22",
                  color: load.overload ? "#e94057" : "#27ef7d",
                  borderRadius: 8,
                  padding: "7px 20px",
                  fontWeight: 700,
                  boxShadow: "0 1px 7px #FFD70022"
                }}>
                {load.coach}: {load.sessions} sessions / {load.totalHours} h
                {load.overload && (
                  <span style={{ marginLeft: 9 }} title="Risk: >10h">
                    <FaExclamationTriangle color="#e94057" style={{ marginBottom: -2 }} /> overload
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Main schedule grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 28,
          marginTop: 18
        }}>
          {eventsByDay.map(({ day, events }) => (
            <div key={day} style={{
              background: "rgba(40,62,81,0.8)",
              borderRadius: 14,
              padding: 17,
              minHeight: 105,
              boxShadow: "0 2px 12px #FFD70011"
            }}>
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, marginBottom: 5 }}>
                <FaCalendarAlt style={{ marginRight: 7, fontSize: 17 }} />
                {day}
              </div>
              {events.length === 0 ? (
                <div style={{ color: "#FFD70099", fontSize: 14 }}>No events scheduled.</div>
              ) : (
                events.map(ev => {
                  const isClash = hasClash(ev, schedule);
                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        background: ev.type === "Game" ? "#FFD70033" :
                          ev.type === "Practice" ? "#27ef7d22" :
                            ev.type === "Conditioning" ? "#48b5ff22" : "#a064fe22",
                        borderRadius: 8,
                        marginBottom: 7,
                        padding: "10px 12px",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: isClash ? "2px solid #e94057" : undefined
                      }}
                    >
                      <span>
                        <FaBasketballBall style={{ marginRight: 5, fontSize: 15 }} />
                        <b style={{ color: "#fff" }}>{ev.team}</b>
                        &nbsp;|&nbsp;{ev.time}&nbsp;|&nbsp;<FaUserTie style={{ marginRight: 2, fontSize: 14 }} />
                        {ev.coach}&nbsp;|&nbsp;
                        <span style={{ fontWeight: 600, color: ev.type === "Game" ? "#FFD700" : "#27ef7d" }}>{ev.type}</span>
                        {isClash && <span style={{ color: "#e94057", marginLeft: 12, fontWeight: 800 }}>
                          <FaExclamationTriangle title="Time/court clash" style={{ marginRight: 2, fontSize: 16 }} /> CLASH
                        </span>}
                      </span>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        style={{
                          background: "transparent",
                          color: "#FFD700",
                          fontWeight: 700,
                          border: 'none',
                          fontSize: 19,
                          marginLeft: 8,
                          cursor: 'pointer'
                        }}
                        title="Delete Event"
                      >×</button>
                    </motion.div>
                  );
                })
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, color: "#FFD700cc", fontWeight: 500, textAlign: 'center' }}>
          Plan and visualize all club resources by day, court, coach, and team. Export to PDF or CSV for directors or club ops.
        </div>
      </motion.section>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <button
          onClick={handlePrint}
          style={{
            background: "#FFD700",
            color: "#222",
            fontWeight: 700,
            border: "none",
            borderRadius: 7,
            padding: "8px 18px",
            fontSize: 17,
            cursor: "pointer",
            boxShadow: "0 2px 8px #FFD70033",
            marginRight: 16,
            marginBottom: 12
          }}>
          Export Resource Dashboard (PDF)
        </button>
        <button
          onClick={handleExportCSV}
          style={{
            background: "#27ef7d",
            color: "#222",
            fontWeight: 700,
            border: "none",
            borderRadius: 7,
            padding: "8px 18px",
            fontSize: 17,
            cursor: "pointer",
            boxShadow: "0 2px 8px #27ef7d33",
            marginBottom: 12
          }}>
          <FaFileExport style={{ marginRight: 7, marginBottom: -2 }} />
          Export as CSV
        </button>
      </div>
    </div>
  );
};

export default ResourceDashboard;
