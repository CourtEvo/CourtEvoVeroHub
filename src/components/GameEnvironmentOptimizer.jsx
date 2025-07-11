import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaFutbol,
  FaStar,
  FaTrophy,
  FaUserCheck,
  FaChartLine,
  FaTrash,
  FaEdit,
  FaPlusCircle,
  FaExclamationTriangle,
  FaBalanceScale,
  FaBullhorn,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaRegClock,
} from "react-icons/fa";

// DEMO: Initial game/event data
const initGames = [
  {
    id: 1,
    type: "League",
    date: "2025-06-29",
    time: "16:00",
    opponent: "KK Dinamo",
    challenge: 7,
    safety: "Clean",
    notes: "Played FIBA rules",
    squad: "U14 Boys"
  },
  {
    id: 2,
    type: "Tournament",
    date: "2025-07-04",
    time: "10:00",
    opponent: "Zadar U14",
    challenge: 9,
    safety: "Minor ankle injury",
    notes: "Shortened halves",
    squad: "U14 Boys"
  },
  {
    id: 3,
    type: "Friendly",
    date: "2025-07-10",
    time: "18:00",
    opponent: "KK Cedevita",
    challenge: 4,
    safety: "Clean",
    notes: "Bench all played equal time",
    squad: "U14 Boys"
  },
  {
    id: 4,
    type: "Modified",
    date: "2025-07-18",
    time: "14:00",
    opponent: "Intra-club",
    challenge: 5,
    safety: "Clean",
    notes: "Lowered basket, 3x3 half-court",
    squad: "U12 Boys"
  },
];

const gameTypes = ["League", "Tournament", "Friendly", "Modified"];
const squads = ["U10 Boys", "U12 Boys", "U14 Boys", "U16 Boys", "U18 Boys", "Seniors"];

function typeIcon(type) {
  switch (type) {
    case "League": return <FaTrophy />;
    case "Tournament": return <FaStar />;
    case "Friendly": return <FaUserCheck />;
    case "Modified": return <FaBullhorn />;
    default: return <FaFutbol />;
  }
}
function challengeColor(val) {
  if (val >= 8) return "#ff6b6b";
  if (val >= 6) return "#FFD700";
  if (val >= 4) return "#1de682";
  return "#FFD700";
}

export default function GameEnvironmentOptimizer() {
  const [games, setGames] = useState(initGames);
  const [editing, setEditing] = useState(null); // game object being edited
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // yyyy-mm

  // CRUD Handlers
  function handleEdit(game) {
    setEditing(game);
    setForm({ ...game });
    setAdding(false);
  }
  function handleDelete(id) {
    setGames(gs => gs.filter(g => g.id !== id));
    if (editing && editing.id === id) setEditing(null);
  }
  function handleSaveEdit() {
    setGames(gs => gs.map(g => g.id === editing.id ? { ...form, id: editing.id } : g));
    setEditing(null);
  }
  function handleAddNew() {
    setGames(gs => [
      ...gs,
      { ...form, id: Date.now() }
    ]);
    setAdding(false);
  }

  // Filtering by month
  const visibleGames = games.filter(g => g.date.slice(0, 7) === selectedMonth);

  // Analytics
  const challengeSum = games.reduce((a, g) => a + Number(g.challenge), 0);
  const avgChallenge = games.length ? (challengeSum / games.length).toFixed(2) : 0;
  const challengeCounts = [0, 0, 0]; // [Too easy, Optimal, Too hard]
  games.forEach(g => {
    if (g.challenge <= 4) challengeCounts[0]++;
    else if (g.challenge <= 7) challengeCounts[1]++;
    else challengeCounts[2]++;
  });
  const typeCounts = {};
  gameTypes.forEach(type => typeCounts[type] = games.filter(g => g.type === type).length);

  // Calendar navigation
  function addMonth(inc) {
    const dt = new Date(selectedMonth + "-01");
    dt.setMonth(dt.getMonth() + inc);
    setSelectedMonth(dt.toISOString().slice(0, 7));
  }

  // Heatmap by squad
  const heatmap = squads.map(sq => ({
    squad: sq,
    avg: (() => {
      const arr = games.filter(g => g.squad === sq);
      return arr.length ? (arr.reduce((a, g) => a + Number(g.challenge), 0) / arr.length).toFixed(2) : "-";
    })()
  }));

  return (
    <div
      style={{
        background: "#232a2e",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
        borderRadius: "24px",
        padding: "38px 28px 18px 28px",
        boxShadow: "0 6px 32px 0 #1a1d20",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <FaCalendarAlt size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            GAME ENVIRONMENT OPTIMIZER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Build, edit and optimize every match for elite male athlete development.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          fontWeight: 700,
          background: "#FFD700",
          color: "#232a2e",
          borderRadius: 12,
          padding: "10px 22px",
          fontSize: 17,
          boxShadow: "0 2px 12px 0 #2a2d31",
          minWidth: 195,
          textAlign: "center"
        }}>
          Balance Meter: <span style={{ color: avgChallenge >= 8 ? "#ff6b6b" : avgChallenge >= 6 ? "#FFD700" : "#1de682" }}>{avgChallenge}</span>
        </div>
      </div>

      {/* Timeline + Calendar Nav */}
      <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        {/* Timeline/CRUD */}
        <div style={{ minWidth: 400, maxWidth: 540, background: "#283E51", borderRadius: 24, padding: 22, boxShadow: "0 2px 12px 0 #15171a" }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, marginBottom: 8 }}>Game Timeline (Month)</div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <button style={{
              background: "#FFD700", border: "none", borderRadius: 7, color: "#232a2e",
              fontWeight: 700, padding: "4px 13px", fontSize: 15, cursor: "pointer", marginRight: 6
            }} onClick={() => addMonth(-1)}><FaChevronLeft /></button>
            <span style={{ fontWeight: 700, color: "#1de682", fontSize: 16 }}>
              {selectedMonth}
            </span>
            <button style={{
              background: "#FFD700", border: "none", borderRadius: 7, color: "#232a2e",
              fontWeight: 700, padding: "4px 13px", fontSize: 15, cursor: "pointer", marginLeft: 6
            }} onClick={() => addMonth(1)}><FaChevronRight /></button>
            <button style={{
              background: "#1de682", border: "none", borderRadius: 7, color: "#232a2e",
              fontWeight: 700, padding: "4px 15px", fontSize: 15, cursor: "pointer", marginLeft: 18
            }} onClick={() => { setAdding(true); setForm({}); setEditing(null); }}>
              <FaPlusCircle style={{ marginRight: 7 }} />Add Game
            </button>
          </div>
          {/* Add/Edit Form */}
          {(adding || editing) &&
            <div style={{
              background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "13px 11px", marginBottom: 13
            }}>
              <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 7 }}>{adding ? "Add New Game" : "Edit Game"}</div>
              <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
                <div>
                  <b>Type:</b>
                  <select value={form.type || ""} required
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }}>
                    <option value="">Select...</option>
                    {gameTypes.map(gt => <option key={gt} value={gt}>{gt}</option>)}
                  </select>
                </div>
                <div>
                  <b>Date:</b>
                  <input type="date" value={form.date || ""} required
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Time:</b>
                  <input type="time" value={form.time || ""} required
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Squad:</b>
                  <select value={form.squad || ""} required
                    onChange={e => setForm(f => ({ ...f, squad: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }}>
                    <option value="">Select...</option>
                    {squads.map(sq => <option key={sq} value={sq}>{sq}</option>)}
                  </select>
                </div>
                <div>
                  <b>Opponent:</b>
                  <input type="text" value={form.opponent || ""} required
                    onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Challenge Level:</b>
                  <input type="range" min="1" max="10" value={form.challenge || 5}
                    onChange={e => setForm(f => ({ ...f, challenge: e.target.value }))}
                    style={{ marginLeft: 8, width: 120 }} />
                  <span style={{ marginLeft: 7, color: challengeColor(Number(form.challenge || 5)), fontWeight: 700 }}>{form.challenge || 5}</span>
                </div>
                <div>
                  <b>Safety:</b>
                  <input type="text" value={form.safety || ""} required
                    onChange={e => setForm(f => ({ ...f, safety: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Notes:</b>
                  <input type="text" value={form.notes || ""} required
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div style={{ marginTop: 9 }}>
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", marginRight: 8, cursor: "pointer"
                  }}>{adding ? "Add" : "Save"}</button>
                  <button type="button" style={{
                    background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", cursor: "pointer"
                  }} onClick={() => { setAdding(false); setEditing(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          }
          {/* Game List */}
          {visibleGames.length === 0 &&
            <div style={{ color: "#FFD700", marginTop: 9, fontWeight: 700 }}>No games this month.</div>
          }
          {visibleGames.map(game =>
            <div key={game.id}
              style={{
                background: "#232a2e",
                borderRadius: 13,
                marginBottom: 14,
                padding: "10px 12px",
                boxShadow: "0 2px 10px 0 #121416",
                borderLeft: `7px solid ${challengeColor(game.challenge)}`,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", fontSize: 17, marginBottom: 4 }}>
                {typeIcon(game.type)} &nbsp;{game.type}
                <span style={{ marginLeft: 13, color: "#1de682", fontWeight: 700 }}>{game.squad}</span>
                <span style={{ marginLeft: "auto", color: "#FFD700" }}><FaRegClock /> {game.date} {game.time}</span>
              </div>
              <div>Opponent: <b>{game.opponent}</b></div>
              <div>Challenge Level: <span style={{ color: challengeColor(game.challenge), fontWeight: 700 }}>{game.challenge}</span></div>
              <div>Safety: <span style={{ color: game.safety !== "Clean" ? "#ff6b6b" : "#1de682", fontWeight: 700 }}>{game.safety}</span></div>
              <div>Notes: {game.notes}</div>
              <div style={{ marginTop: 5 }}>
                <button onClick={() => handleEdit(game)} style={{
                  background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 700, border: "none", marginRight: 7, padding: "4px 12px", cursor: "pointer"
                }}><FaEdit /> Edit</button>
                <button onClick={() => handleDelete(game.id)} style={{
                  background: "#ff6b6b", color: "#fff", borderRadius: 6, fontWeight: 700, border: "none", padding: "4px 12px", cursor: "pointer"
                }}><FaTrash /> Delete</button>
              </div>
            </div>
          )}
        </div>

        {/* Challenge Analytics */}
        <div style={{ minWidth: 295, maxWidth: 380 }}>
          <div style={{ background: "#232a2e", borderRadius: 14, padding: "16px 18px 10px 18px", boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 7, fontSize: 16 }}>
              Challenge Heatmap (by Squad)
            </div>
            <table style={{ width: "100%", fontSize: 14, color: "#fff" }}>
              <thead>
                <tr>
                  <th>Squad</th>
                  <th>Avg. Challenge</th>
                </tr>
              </thead>
              <tbody>
                {heatmap.map(h => (
                  <tr key={h.squad}>
                    <td style={{ color: "#FFD700", fontWeight: 700 }}>{h.squad}</td>
                    <td style={{ color: h.avg === "-" ? "#fff" : challengeColor(Number(h.avg)), fontWeight: 700 }}>{h.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 11, color: "#FFD700", fontWeight: 700 }}>Challenge Distribution</div>
            <ul style={{ fontSize: 14, marginLeft: 0, marginTop: 3 }}>
              <li><span style={{ color: "#ff6b6b" }}>Too Hard:</span> {challengeCounts[2]}</li>
              <li><span style={{ color: "#FFD700" }}>Optimal:</span> {challengeCounts[1]}</li>
              <li><span style={{ color: "#1de682" }}>Too Easy:</span> {challengeCounts[0]}</li>
            </ul>
            <div style={{ marginTop: 10, color: "#FFD700", fontWeight: 700 }}>Game Type Breakdown</div>
            <ul style={{ fontSize: 14, marginLeft: 0 }}>
              {gameTypes.map(type => (
                <li key={type} style={{ color: type === "League" ? "#FFD700" : type === "Tournament" ? "#ff6b6b" : type === "Friendly" ? "#1de682" : "#FFD700" }}>
                  {type}: {typeCounts[type]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 36,
          fontSize: 14,
          opacity: 0.7,
          textAlign: "center",
        }}
      >
        Proprietary to CourtEvo Vero. Game environment optimization, full CRUD, real analytics. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
