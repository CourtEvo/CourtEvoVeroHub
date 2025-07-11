import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaUserAlt, FaClipboardList, FaCalendarAlt, FaEdit, FaFileExport, FaCheckCircle, FaBullseye,
  FaMedal, FaPaperPlane, FaChartLine
} from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, LineChart, Legend
} from "recharts";

// DEMO DATA: Players and stats
const PLAYERS = [
  {
    id: "p1", name: "Marko Horvat", team: "U14",
    progress: { shooting: 77, defense: 64, fitness: 81, skill: 79 },
    lastFocus: "Defense", lastNote: "Focus on lateral movement."
  },
  {
    id: "p2", name: "Luka Petrović", team: "U16",
    progress: { shooting: 87, defense: 80, fitness: 75, skill: 84 },
    lastFocus: "Fitness", lastNote: "Stamina improved."
  }
];

// Plan template for demo
const PLAN_TEMPLATE = [
  { week: 1, focus: "Shooting", goal: "200 made shots", status: "Planned", note: "", athleteComment: "", coachComment: "", load: 3 },
  { week: 2, focus: "Defense", goal: "Lateral slides 3x/week", status: "Planned", note: "", athleteComment: "", coachComment: "", load: 2 },
  { week: 3, focus: "Fitness", goal: "Yo-Yo test, 3.2km/week", status: "Planned", note: "", athleteComment: "", coachComment: "", load: 2 }
];

// Auto-suggest logic
function suggestFocus(progress) {
  const minSkill = Object.entries(progress).sort((a, b) => a[1] - b[1])[0];
  return minSkill[0].charAt(0).toUpperCase() + minSkill[0].slice(1);
}

// Achievement badges
function getBadges(plan) {
  const allDone = plan.every(b => b.status === "Done");
  const tenBlocks = plan.length >= 10;
  const zeroMissed = plan.every(b => b.status !== "Missed");
  return [
    allDone ? { label: "Perfect Completion", icon: <FaMedal style={{ color: "#FFD700" }} /> } : null,
    tenBlocks ? { label: "10+ Blocks Created", icon: <FaMedal style={{ color: "#27ef7d" }} /> } : null,
    zeroMissed ? { label: "No Missed Weeks", icon: <FaMedal style={{ color: "#27ef7d" }} /> } : null
  ].filter(Boolean);
}

const fadeIn = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

const IndividualizedPlanGenerator = () => {
  const [playerId, setPlayerId] = useState(PLAYERS[0].id);
  const [plan, setPlan] = useState(PLAN_TEMPLATE.map(block => ({ ...block })));
  const [editIdx, setEditIdx] = useState(null);
  const [editBlock, setEditBlock] = useState({});
  const [newBlock, setNewBlock] = useState({ week: plan.length + 1, focus: "", goal: "", status: "Planned", note: "", athleteComment: "", coachComment: "", load: 2 });
  const [showAdd, setShowAdd] = useState(false);
  const [coachNote, setCoachNote] = useState("");
  const sectionRef = useRef();

  const player = PLAYERS.find(p => p.id === playerId);

  // Progress analytics
  const completed = plan.filter(b => b.status === "Done").length;
  const total = plan.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const badges = getBadges(plan);
  const stuck = plan.filter(b => b.status === "In Progress").length > 0 && plan.some(b => b.status === "In Progress" && !b.note);

  // Chart data for load
  const chartData = plan.map(b => ({
    name: `W${b.week}`,
    load: Number(b.load || 0),
    completed: b.status === "Done" ? Number(b.load || 0) : 0
  }));

  // Progress trend line
  const progressTrend = plan.map((b, i) => ({
    name: `W${b.week}`,
    progress: Math.round(100 * (i + 1) / plan.length)
  }));

  // Export to PDF
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `TrainingPlan_${player.name}_${new Date().toISOString().slice(0, 10)}`
  });

  // Edit/add handlers
  function handleEdit(idx) {
    setEditIdx(idx);
    setEditBlock({ ...plan[idx] });
  }
  function handleEditSave(idx) {
    setPlan(plan.map((b, i) => (i === idx ? editBlock : b)));
    setEditIdx(null);
    setEditBlock({});
  }
  function handleAddBlock() {
    setPlan([...plan, { ...newBlock, week: plan.length + 1 }]);
    setShowAdd(false);
    setNewBlock({ week: plan.length + 2, focus: "", goal: "", status: "Planned", note: "", athleteComment: "", coachComment: "", load: 2 });
  }
  function handleDelete(idx) {
    setPlan(plan.filter((_, i) => i !== idx));
  }

  function handlePlayerChange(pid) {
    setPlayerId(pid);
    setPlan(PLAN_TEMPLATE.map(block => ({ ...block })));
    setCoachNote("");
  }

  // Auto-suggest focus
  const suggested = suggestFocus(player.progress);

  // Progress bar style
  const progressBarStyle = {
    width: `${percent}%`,
    background: percent === 100 ? "#27ef7d" : "#FFD700",
    height: 16,
    borderRadius: 9,
    transition: "width 0.5s cubic-bezier(.9,.21,.46,.94)"
  };

  // Email/export helpers (for parent/coach email drafts)
  function getPlanEmail() {
    let text = `Subject: ${player.name} - Individual Training Plan\n\n`;
    text += `Recent Progress: Shooting ${player.progress.shooting}, Defense ${player.progress.defense}, Fitness ${player.progress.fitness}, Skill ${player.progress.skill}\n`;
    text += `Suggested Focus: ${suggested}\n\nPlan Blocks:\n`;
    plan.forEach(b => {
      text += `Week ${b.week}: ${b.focus} - Goal: ${b.goal} (${b.status})\n`;
    });
    text += `\nCoach Note: ${coachNote}\n`;
    return encodeURIComponent(text);
  }

  return (
    <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
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
        {/* ...all code as above... */}
        {/* Place the code for charts, progress, badges, table, etc. */}
        {/* Editable training plan */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
            <FaCalendarAlt /> Periodized Plan
            <button onClick={() => setShowAdd(true)} style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14, padding: "5px 14px", marginLeft: "auto" }}>
              + Add Week
            </button>
          </div>
          <table style={{ width: "100%", background: "#FFD70009", borderRadius: 7, fontSize: 16, borderCollapse: "collapse" }}>
            <thead style={{ background: "#222", color: "#FFD700" }}>
              <tr>
                <th>Week</th>
                <th>Focus</th>
                <th>Goal</th>
                <th>Status</th>
                <th>Note</th>
                <th>Athlete Comment</th>
                <th>Coach Comment</th>
                <th>Load (hrs)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((block, idx) => (
                <tr key={idx} style={{ color: "#fff", background: idx % 2 === 0 ? "#1a1d24" : "#fff1", fontWeight: 600 }}>
                  <td>{block.week}</td>
                  <td>
                    {editIdx === idx ? (
                      <input value={editBlock.focus} onChange={e => setEditBlock(b => ({ ...b, focus: e.target.value }))}
                        style={{ width: 90, borderRadius: 5 }} />
                    ) : (
                      block.focus
                    )}
                  </td>
                  <td>
                    {editIdx === idx ? (
                      <input value={editBlock.goal} onChange={e => setEditBlock(b => ({ ...b, goal: e.target.value }))}
                        style={{ width: 110, borderRadius: 5 }} />
                    ) : (
                      block.goal
                    )}
                  </td>
                  <td>
                    {editIdx === idx ? (
                      <select value={editBlock.status} onChange={e => setEditBlock(b => ({ ...b, status: e.target.value }))}
                        style={{ borderRadius: 5 }}>
                        <option>Planned</option>
                        <option>In Progress</option>
                        <option>Done</option>
                        <option>Missed</option>
                      </select>
                    ) : (
                      <span style={{
                        color: block.status === "Done" ? "#27ef7d" : block.status === "In Progress" ? "#FFD700" : "#fff",
                        fontWeight: 700
                      }}>{block.status}</span>
                    )}
                  </td>
                  <td>
                    {editIdx === idx ? (
                      <input value={editBlock.note} onChange={e => setEditBlock(b => ({ ...b, note: e.target.value }))}
                        style={{ width: 110, borderRadius: 5 }} />
                    ) : (
                      block.note
                    )}
                  </td>
                  <td>
                    {editIdx === idx ? (
                      <input value={editBlock.athleteComment} onChange={e => setEditBlock(b => ({ ...b, athleteComment: e.target.value }))}
                        style={{ width: 110, borderRadius: 5 }} />
                    ) : (
                      <span style={{ color: "#FFD700bb" }}>{block.athleteComment}</span>
                    )}
                  </td>
                  <td>
                    {editIdx === idx ? (
                      <input value={editBlock.coachComment} onChange={e => setEditBlock(b => ({ ...b, coachComment: e.target.value }))}
                        style={{ width: 110, borderRadius: 5 }} />
                    ) : (
                      <span style={{ color: "#27ef7d" }}>{block.coachComment}</span>
                    )}
                  </td>
                  <td>
                    {editIdx === idx ? (
                      <input type="number" value={editBlock.load} min={1} max={10}
                        onChange={e => setEditBlock(b => ({ ...b, load: e.target.value }))}
                        style={{ width: 40, borderRadius: 5 }} />
                    ) : (
                      block.load
                    )}
                  </td>
                  <td>
                    {editIdx === idx ? (
                      <>
                        <button onClick={() => handleEditSave(idx)} style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 5, fontWeight: 700, padding: "3px 11px" }}><FaCheckCircle /> Save</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(idx)} style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 5, fontWeight: 700, padding: "3px 11px", marginRight: 3 }}><FaEdit /> Edit</button>
                        <button onClick={() => handleDelete(idx)} style={{ background: "#e94057", color: "#fff", border: "none", borderRadius: 5, fontWeight: 700, padding: "3px 11px" }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Add week modal */}
        {showAdd && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "#0009", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
          }}>
            <div style={{
              background: "#222", padding: 30, borderRadius: 16, minWidth: 370, boxShadow: "0 4px 30px #FFD70066", color: "#FFD700"
            }}>
              <h3 style={{ marginBottom: 13 }}>Add Training Block</h3>
              <div style={{ marginBottom: 10 }}>
                <label>Focus: </label>
                <input value={newBlock.focus} onChange={e => setNewBlock(b => ({ ...b, focus: e.target.value }))}
                  style={{ width: 120, borderRadius: 6, marginBottom: 7 }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Goal: </label>
                <input value={newBlock.goal} onChange={e => setNewBlock(b => ({ ...b, goal: e.target.value }))}
                  style={{ width: 170, borderRadius: 6, marginBottom: 7 }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Load (hours): </label>
                <input type="number" value={newBlock.load} min={1} max={10}
                  onChange={e => setNewBlock(b => ({ ...b, load: e.target.value }))}
                  style={{ width: 70, borderRadius: 6, marginBottom: 7 }} />
              </div>
              <button onClick={handleAddBlock}
                style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "5px 17px", marginRight: 11 }}>Add</button>
              <button onClick={() => setShowAdd(false)}
                style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "5px 17px" }}>Cancel</button>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default IndividualizedPlanGenerator;
