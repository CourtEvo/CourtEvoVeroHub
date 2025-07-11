import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { format, addWeeks, startOfISOWeek } from "date-fns";
import { FaPlus, FaTrash, FaFileExport, FaCalendarAlt, FaUser } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

// Example planners for coaches/athletes
const COACHES = [
  { id: "marko", name: "Coach Marko", role: "Coach" },
  { id: "luka", name: "Coach Luka", role: "Coach" },
  { id: "ivan", name: "Ivan Petrović", role: "Athlete" },
  { id: "luka_i", name: "Luka Ivic", role: "Athlete" }
];

const PHASES = [
  { key: "Prep", color: "#48b5ff", label: "Preparation" },
  { key: "Comp", color: "#FFD700", label: "Competition" },
  { key: "Peak", color: "#e94057", label: "Peak/Taper" },
  { key: "Rest", color: "#27ef7d", label: "Rest/Recovery" },
  { key: "Tournament", color: "#a064fe", label: "Tournament" },
  { key: "Custom", color: "#fff", label: "Custom" }
];

// Default initial 10-week block
const defaultWeeks = () =>
  Array.from({ length: 10 }, (_, i) => ({
    id: `w${i + 1}`,
    week: i + 1,
    phase: PHASES[i % PHASES.length].key,
    notes: "",
    // athleteCheckin: { mood: null, energy: null, comment: "" }
    athleteCheckin: {}
  }));

// Utility for analytics
function phaseDist(weeks) {
  return weeks.reduce((acc, w) => {
    acc[w.phase] = (acc[w.phase] || 0) + 1;
    return acc;
  }, {});
}

const fadeIn = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };

const MOODS = [
  { key: "😄", val: 3, color: "#27ef7d" },
  { key: "😐", val: 2, color: "#FFD700" },
  { key: "😞", val: 1, color: "#e94057" }
];
const ENERGIES = [
  { key: "⚡", val: 3, color: "#27ef7d" },
  { key: "😌", val: 2, color: "#FFD700" },
  { key: "😴", val: 1, color: "#e94057" }
];

const PeriodizationPlanner = () => {
  const today = new Date();
  const seasonStart = startOfISOWeek(today);
  // Store planners per coach/athlete
  const [plannerId, setPlannerId] = useState(COACHES[0].id);
  const [planners, setPlanners] = useState(
    Object.fromEntries(COACHES.map(u => [u.id, defaultWeeks()]))
  );
  const [newPhase, setNewPhase] = useState(PHASES[0].key);
  const [showAdd, setShowAdd] = useState(false);
  const [addWeeksNum, setAddWeeksNum] = useState(1);
  const [noteIdx, setNoteIdx] = useState(null);
  const [noteVal, setNoteVal] = useState("");
  const [checkinIdx, setCheckinIdx] = useState(null);
  const [checkinVal, setCheckinVal] = useState({ mood: null, energy: null, comment: "" });
  const sectionRef = useRef();

  // Active weeks for current planner
  const weeks = planners[plannerId] || [];

  // Drag and drop
  function onDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(weeks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setPlanners(ps => ({ ...ps, [plannerId]: reordered }));
  }

  // Add weeks
  function handleAddWeeks() {
    const start = weeks.length + 1;
    setPlanners(ps => ({
      ...ps,
      [plannerId]: ps[plannerId].concat(
        Array.from({ length: addWeeksNum }, (_, i) => ({
          id: `w${start + i}`,
          week: start + i,
          phase: newPhase,
          notes: "",
          athleteCheckin: {}
        }))
      )
    }));
    setShowAdd(false);
  }

  // Delete week
  function deleteWeek(idx) {
    setPlanners(ps => ({
      ...ps,
      [plannerId]: ps[plannerId].filter((_, i) => i !== idx)
    }));
  }

  // Edit note
  function handleSaveNote(idx) {
    setPlanners(ps => ({
      ...ps,
      [plannerId]: ps[plannerId].map((wk, i) =>
        i === idx ? { ...wk, notes: noteVal } : wk
      )
    }));
    setNoteIdx(null);
    setNoteVal("");
  }

  // Athlete check-in
  function openCheckin(idx) {
    setCheckinIdx(idx);
    setCheckinVal(weeks[idx].athleteCheckin || { mood: null, energy: null, comment: "" });
  }
  function saveCheckin(idx) {
    setPlanners(ps => ({
      ...ps,
      [plannerId]: ps[plannerId].map((wk, i) =>
        i === idx ? { ...wk, athleteCheckin: { ...checkinVal } } : wk
      )
    }));
    setCheckinIdx(null);
    setCheckinVal({ mood: null, energy: null, comment: "" });
  }

  // PDF export
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `PeriodizationPlan_${plannerId}_${new Date().toISOString().slice(0, 10)}`
  });

  // Analytics
  const dist = phaseDist(weeks);
  const totalWeeks = weeks.length;

  // Advanced analytics/advice
  let analyticsMsg = "";
  let advice = [];
  if (dist.Competition > totalWeeks * 0.5) {
    analyticsMsg = "Warning: Too much competition phase, risk of burnout!";
    advice.push("Add more rest/recovery or preparation blocks.");
  }
  if ((dist.Rest || 0) < Math.max(1, totalWeeks * 0.1)) {
    advice.push("Add more rest to promote adaptation.");
  }
  if ((dist.Peak || 0) > 2 && dist.Peak === Math.max(...Object.values(dist))) {
    advice.push("Peak/taper should be short and strategic—avoid overload.");
  }
  if ((dist.Prep || 0) < 2) {
    advice.push("Low preparation phase: add technical/tactical build-up for foundation.");
  }
  if (!analyticsMsg) analyticsMsg = "Periodization is balanced. Review each week for training quality and individualization.";

  // Check-in display logic
  function checkinDisplay(checkin) {
    if (!checkin) return null;
    return (
      <div style={{ fontSize: 19, marginTop: 4 }}>
        <span title="Mood" style={{ marginRight: 2 }}>
          {MOODS.find(m => m.val === checkin.mood)?.key || "—"}
        </span>
        <span title="Energy" style={{ marginRight: 2 }}>
          {ENERGIES.find(e => e.val === checkin.energy)?.key || "—"}
        </span>
        <span title="Comment" style={{ fontSize: 13, color: "#FFD700cc", marginLeft: 2 }}>
          {checkin.comment}
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        <div style={{ fontSize: 29, color: "#FFD700", fontWeight: 700, marginBottom: 12 }}>
          Periodization Planner & Calendar
        </div>
        {/* Planner selection */}
        <div style={{ display: "flex", gap: 17, alignItems: "center", marginBottom: 17, flexWrap: "wrap" }}>
          <label style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>
            <FaCalendarAlt style={{ marginBottom: -3, marginRight: 6 }} />
            Plan for:
            <select
              value={plannerId}
              onChange={e => setPlannerId(e.target.value)}
              style={{ marginLeft: 8, fontSize: 17, fontWeight: 600, borderRadius: 5, padding: "5px 10px" }}>
              {COACHES.map(u => (
                <option value={u.id} key={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{
              background: "#27ef7d", color: "#222", fontWeight: 700, border: "none", borderRadius: 7,
              padding: "7px 18px", fontSize: 17, cursor: "pointer"
            }}
          >
            <FaPlus style={{ marginBottom: -2, marginRight: 6 }} />
            Add Weeks
          </button>
          <button
            onClick={handlePrint}
            style={{
              background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7,
              padding: "7px 18px", fontSize: 17, cursor: "pointer"
            }}
          >
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} />
            Export PDF
          </button>
        </div>
        {showAdd && (
          <div style={{
            background: "#222d", padding: 12, borderRadius: 10, marginBottom: 19,
            display: "flex", alignItems: "center", gap: 13, width: "fit-content"
          }}>
            <span>Add</span>
            <input
              type="number"
              value={addWeeksNum}
              min={1}
              max={52}
              onChange={e => setAddWeeksNum(Number(e.target.value))}
              style={{ width: 50, fontSize: 15, borderRadius: 4 }}
            />
            <span>week(s) as</span>
            <select value={newPhase} onChange={e => setNewPhase(e.target.value)}
              style={{ fontSize: 15, borderRadius: 5 }}>
              {PHASES.map(p => <option value={p.key} key={p.key}>{p.label}</option>)}
            </select>
            <button
              onClick={handleAddWeeks}
              style={{ background: "#27ef7d", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 15, marginLeft: 7 }}
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{ background: "#e94057", color: "#fff", fontWeight: 700, border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 15, marginLeft: 7 }}
            >
              Cancel
            </button>
          </div>
        )}
        {/* Phase Distribution Analytics */}
        <div style={{ marginBottom: 18, color: "#FFD700bb", fontSize: 17, fontWeight: 700 }}>
          <span>Phase Balance:&nbsp;</span>
          {PHASES.map(p => (
            <span key={p.key} style={{ color: p.color, marginRight: 18 }}>
              {p.label}: {dist[p.key] || 0}
            </span>
          ))}
        </div>
        {/* Analytics/advice */}
        <div style={{ color: "#FFD700bb", fontSize: 16, marginBottom: 14 }}>
          <b>Analytics:</b> {analyticsMsg}
          {advice.length > 0 && (
            <ul style={{ margin: "3px 0 0 20px", color: "#e94057", fontSize: 15 }}>
              {advice.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </div>
        {/* Draggable weeks calendar */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="weeks" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  display: "flex",
                  gap: 9,
                  overflowX: "auto",
                  marginBottom: 29,
                  minHeight: 140,
                  paddingBottom: 8
                }}
              >
                {weeks.map((w, idx) => {
                  const phase = PHASES.find(p => p.key === w.phase) || PHASES[0];
                  const weekStart = addWeeks(seasonStart, idx);
                  return (
                    <Draggable draggableId={w.id} index={idx} key={w.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            minWidth: 120,
                            maxWidth: 150,
                            background: phase.color,
                            borderRadius: 12,
                            boxShadow: snapshot.isDragging ? "0 0 16px #FFD70055" : "0 2px 10px #0002",
                            opacity: snapshot.isDragging ? 0.89 : 1,
                            transition: "box-shadow 0.2s, opacity 0.2s",
                            marginRight: 6,
                            padding: "11px 12px",
                            ...provided.draggableProps.style
                          }}
                        >
                          <div style={{ fontWeight: 700, color: "#222", fontSize: 16 }}>
                            Week {w.week}
                          </div>
                          <div style={{ color: "#444", fontSize: 13 }}>
                            {format(weekStart, "MMM d")}
                          </div>
                          <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
                            {phase.label}
                          </div>
                          <div style={{ margin: "6px 0", color: "#222", fontSize: 13, minHeight: 19 }}>
                            {w.notes && (
                              <>
                                <span style={{ color: "#e94057" }}>Note: </span>
                                {noteIdx === idx ? (
                                  <form style={{ display: "inline" }} onSubmit={e => { e.preventDefault(); handleSaveNote(idx); }}>
                                    <input
                                      value={noteVal}
                                      onChange={e => setNoteVal(e.target.value)}
                                      style={{ width: 58, fontSize: 13, borderRadius: 5 }}
                                    />
                                    <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 5, marginLeft: 4, fontSize: 13 }}>Save</button>
                                    <button type="button" onClick={() => setNoteIdx(null)} style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 5, marginLeft: 3, fontSize: 13 }}>Cancel</button>
                                  </form>
                                ) : (
                                  <>
                                    {w.notes}
                                    <button onClick={() => { setNoteIdx(idx); setNoteVal(w.notes); }} style={{ background: "#FFD70033", color: "#222", border: "none", borderRadius: 5, fontWeight: 600, fontSize: 13, marginLeft: 7, cursor: "pointer" }}>Edit</button>
                                  </>
                                )}
                              </>
                            )}
                            {!w.notes && noteIdx === idx && (
                              <form style={{ display: "inline" }} onSubmit={e => { e.preventDefault(); handleSaveNote(idx); }}>
                                <input
                                  value={noteVal}
                                  onChange={e => setNoteVal(e.target.value)}
                                  style={{ width: 58, fontSize: 13, borderRadius: 5 }}
                                />
                                <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 5, marginLeft: 4, fontSize: 13 }}>Save</button>
                                <button type="button" onClick={() => setNoteIdx(null)} style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 5, marginLeft: 3, fontSize: 13 }}>Cancel</button>
                              </form>
                            )}
                            {!w.notes && noteIdx !== idx && (
                              <button onClick={() => { setNoteIdx(idx); setNoteVal(""); }} style={{ background: "#FFD70033", color: "#222", border: "none", borderRadius: 5, fontWeight: 600, fontSize: 13, marginLeft: 7, cursor: "pointer" }}>Add Note</button>
                            )}
                          </div>
                          {/* Athlete check-in/feedback */}
                          {COACHES.find(u => u.id === plannerId).role === "Athlete" && (
                            <div style={{ marginTop: 6 }}>
                              {checkinIdx === idx ? (
                                <form onSubmit={e => { e.preventDefault(); saveCheckin(idx); }}>
                                  <div>
                                    <span style={{ fontSize: 15, color: "#222" }}>Mood:</span>
                                    {MOODS.map(m => (
                                      <button key={m.key} type="button"
                                        style={{
                                          background: checkinVal.mood === m.val ? m.color : "#fff2",
                                          border: "none",
                                          fontSize: 21, borderRadius: 7,
                                          marginLeft: 5, cursor: "pointer"
                                        }}
                                        onClick={() => setCheckinVal(c => ({ ...c, mood: m.val }))}
                                      >{m.key}</button>
                                    ))}
                                  </div>
                                  <div style={{ marginTop: 3 }}>
                                    <span style={{ fontSize: 15, color: "#222" }}>Energy:</span>
                                    {ENERGIES.map(e => (
                                      <button key={e.key} type="button"
                                        style={{
                                          background: checkinVal.energy === e.val ? e.color : "#fff2",
                                          border: "none",
                                          fontSize: 21, borderRadius: 7,
                                          marginLeft: 5, cursor: "pointer"
                                        }}
                                        onClick={() => setCheckinVal(c => ({ ...c, energy: e.val }))}
                                      >{e.key}</button>
                                    ))}
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Comment"
                                    value={checkinVal.comment}
                                    onChange={e => setCheckinVal(c => ({ ...c, comment: e.target.value }))}
                                    style={{ width: "90%", fontSize: 13, borderRadius: 5, marginTop: 5 }}
                                  />
                                  <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 5, marginLeft: 4, fontSize: 13, padding: "1px 9px" }}>Save</button>
                                  <button type="button" onClick={() => setCheckinIdx(null)} style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 5, marginLeft: 3, fontSize: 13, padding: "1px 9px" }}>Cancel</button>
                                </form>
                              ) : (
                                <>
                                  {checkinDisplay(w.athleteCheckin)}
                                  <button onClick={() => openCheckin(idx)}
                                    style={{ background: "#FFD70033", color: "#222", border: "none", borderRadius: 5, fontWeight: 600, fontSize: 13, marginLeft: 3, cursor: "pointer" }}>
                                    Check-in
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                          {COACHES.find(u => u.id === plannerId).role === "Coach" && w.athleteCheckin && (w.athleteCheckin.mood || w.athleteCheckin.energy) && (
                            <div style={{ marginTop: 7, background: "#FFD70018", borderRadius: 7, padding: "3px 8px" }}>
                              <span style={{ fontSize: 13, color: "#222" }}><FaUser style={{ marginBottom: -2, marginRight: 3 }} />Athlete Check-in: </span>
                              {checkinDisplay(w.athleteCheckin)}
                            </div>
                          )}
                          <button
                            onClick={() => deleteWeek(idx)}
                            title="Delete week"
                            style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 7, fontWeight: 600, fontSize: 13, padding: "2px 8px", marginTop: 2, cursor: "pointer" }}>
                            <FaTrash style={{ marginBottom: -2, marginRight: 3 }} /> Delete
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {/* Legend */}
        <div style={{ marginTop: 13, marginBottom: 18, color: "#FFD700", fontSize: 16, fontWeight: 700 }}>
          {PHASES.map(p => (
            <span key={p.key} style={{
              background: p.color,
              color: "#222",
              borderRadius: 6,
              padding: "2px 10px",
              fontSize: 15,
              marginRight: 14
            }}>{p.label}</span>
          ))}
        </div>
        {/* Coach/Athlete-specific advice */}
        <div style={{ color: "#27ef7d", fontWeight: 600, fontSize: 16 }}>
          {(() => {
            const coach = COACHES.find(u => u.id === plannerId);
            if (coach.role === "Coach") {
              if (dist.Competition > totalWeeks * 0.5)
                return <>Coach Tip: Too much competition! Schedule de-load or team-building blocks.</>;
              if ((dist.Prep || 0) < 2)
                return <>Coach Tip: Add more technical/tactical sessions for fundamentals.</>;
              if ((dist.Rest || 0) < Math.max(1, totalWeeks * 0.1))
                return <>Coach Tip: Plan active recovery (mobility, or fun games).</>;
              return <>Coach Tip: Good periodization! Review weekly player wellness.</>;
            } else {
              // Athlete
              if ((dist.Rest || 0) < Math.max(1, totalWeeks * 0.1))
                return <>Athlete Tip: Be vocal if tired—recovery is elite too!</>;
              if ((dist.Peak || 0) > 2)
                return <>Athlete Tip: Focus extra on sleep and nutrition in peak phases.</>;
              return <>Athlete Tip: Consistency beats intensity—track your mood and energy!</>;
            }
          })()}
        </div>
      </motion.section>
    </div>
  );
};

export default PeriodizationPlanner;
