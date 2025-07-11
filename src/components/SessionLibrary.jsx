import React, { useState } from "react";
import {
  FaBookOpen, FaSearch, FaStar, FaClipboardCheck, FaUser, FaHeart, FaList, FaFilePdf, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";

// Sessions (all-male coaches)
const sessions = [
  {
    title: "U14 Ball Handling Circuit",
    age: "U14",
    type: "Technical",
    skills: ["Dribbling", "Change of Direction"],
    difficulty: "Intermediate",
    ltad: "Skill Acceleration",
    coach: "Coach Marko",
    duration: 22,
    favorited: false,
    notes: "Include eyes-up progression",
    verified: true,
    lastActivity: "2025-06-05 by Coach Petar"
  },
  {
    title: "Advanced Pick & Roll Reads",
    age: "U16+",
    type: "Tactical",
    skills: ["Decision-Making", "Passing"],
    difficulty: "Advanced",
    ltad: "Tactical Refinement",
    coach: "Coach Petar",
    duration: 28,
    favorited: true,
    notes: "Coach demo before live",
    verified: true,
    lastActivity: "2025-06-06 favorited by Coach Luka"
  },
  {
    title: "Closeout & Recovery Drill",
    age: "U15",
    type: "Technical",
    skills: ["Defense", "Movement"],
    difficulty: "Basic",
    ltad: "Defensive Fundamentals",
    coach: "Coach Luka",
    duration: 18,
    favorited: false,
    notes: "",
    verified: false,
    lastActivity: "2025-06-07 added by Coach Luka"
  },
  {
    title: "1-on-1 Finish Variations",
    age: "U14+",
    type: "Technical",
    skills: ["Finishing", "Creativity"],
    difficulty: "Intermediate",
    ltad: "Offensive Expansion",
    coach: "Coach Marko",
    duration: 19,
    favorited: false,
    notes: "",
    verified: true,
    lastActivity: "2025-06-07 by Coach Marko"
  },
  {
    title: "Recovery & Regeneration Flow",
    age: "U16",
    type: "Recovery",
    skills: ["Mobility", "Flexibility"],
    difficulty: "Basic",
    ltad: "Active Recovery",
    coach: "Coach Petar",
    duration: 30,
    favorited: false,
    notes: "Use after tournament weekends",
    verified: true,
    lastActivity: "2025-06-08 by Coach Petar"
  }
];

const unique = arr => Array.from(new Set(arr));
const ages = unique(sessions.map(s => s.age));
const skills = unique(sessions.flatMap(s => s.skills));
const types = unique(sessions.map(s => s.type));
const difficulties = unique(sessions.map(s => s.difficulty));
const coaches = unique(sessions.map(s => s.coach));

export default function SessionLibrary() {
  const [filter, setFilter] = useState({ age: "", skill: "", type: "", difficulty: "", coach: "", search: "" });
  const [fav, setFav] = useState(() => sessions.map(s => !!s.favorited));
  const [activityLog, setActivityLog] = useState([
    { date: "2025-06-08", activity: "Session added: Recovery & Regeneration Flow", by: "Coach Petar" },
    { date: "2025-06-07", activity: "Session added: 1-on-1 Finish Variations", by: "Coach Marko" },
    { date: "2025-06-06", activity: "Session favorited: Advanced Pick & Roll Reads", by: "Coach Luka" }
  ]);

  function toggleFav(idx) {
    setFav(f => {
      const copy = [...f];
      copy[idx] = !copy[idx];
      setActivityLog([
        { date: new Date().toISOString().slice(0, 10), activity: `${copy[idx] ? "Session favorited" : "Session unfavorited"}: ${sessions[idx].title}`, by: "Coach Marko" },
        ...activityLog
      ]);
      return copy;
    });
  }

  // Filtering
  const filtered = sessions.filter((s, idx) =>
    (!filter.age || s.age === filter.age) &&
    (!filter.skill || s.skills.includes(filter.skill)) &&
    (!filter.type || s.type === filter.type) &&
    (!filter.difficulty || s.difficulty === filter.difficulty) &&
    (!filter.coach || s.coach === filter.coach) &&
    (!filter.search || s.title.toLowerCase().includes(filter.search.toLowerCase()))
  );

  // Session stats
  const totalSessions = sessions.length;
  const totalTechnical = sessions.filter(s => s.type === "Technical").length;
  const coachCount = sessions.reduce((acc, s) => { acc[s.coach] = (acc[s.coach] || 0) + 1; return acc; }, {});
  const topCoach = Object.entries(coachCount).sort((a, b) => b[1] - a[1])[0][0];

  // Dummy PDF export
  const handleExport = () => {
    alert("Export coming soon! (Wire to backend/print for production)");
  };

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>
        Session Library & Drill Bank <FaBookOpen style={{ marginLeft: 10, color: "#1de682", fontSize: 24, verticalAlign: -2 }} />
        <button
          onClick={handleExport}
          style={{
            float: "right",
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontWeight: 800,
            fontSize: 15,
            boxShadow: "0 2px 8px #FFD70044",
            marginTop: 3,
            cursor: "pointer",
            transition: "background 0.18s"
          }}
        >
          <FaFilePdf style={{ marginRight: 8 }} /> Export PDF
        </button>
      </h2>
      {/* Boardroom dashboard */}
      <div style={{
        display: "flex",
        gap: 34,
        marginBottom: 22,
        flexWrap: "wrap"
      }}>
        <StatCard icon={<FaList color="#FFD700" size={21} />} label="Total Sessions" value={totalSessions} />
        <StatCard icon={<FaClipboardCheck color="#1de682" size={21} />} label="Technical Sessions" value={totalTechnical} />
        <StatCard icon={<FaUser color="#FFD700" size={21} />} label="Most Active Coach" value={topCoach} />
      </div>
      {/* Filters */}
      <div style={{
        display: "flex",
        gap: 18,
        alignItems: "center",
        marginBottom: 18,
        flexWrap: "wrap"
      }}>
        <input
          type="text"
          placeholder="Search session title..."
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          style={dropdownStyle}
        />
        <select value={filter.age} onChange={e => setFilter({ ...filter, age: e.target.value })} style={dropdownStyle}>
          <option value="">All Ages</option>
          {ages.map(a => <option value={a} key={a}>{a}</option>)}
        </select>
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} style={dropdownStyle}>
          <option value="">All Types</option>
          {types.map(s => <option value={s} key={s}>{s}</option>)}
        </select>
        <select value={filter.skill} onChange={e => setFilter({ ...filter, skill: e.target.value })} style={dropdownStyle}>
          <option value="">All Skills</option>
          {skills.map(s => <option value={s} key={s}>{s}</option>)}
        </select>
        <select value={filter.difficulty} onChange={e => setFilter({ ...filter, difficulty: e.target.value })} style={dropdownStyle}>
          <option value="">All Levels</option>
          {difficulties.map(d => <option value={d} key={d}>{d}</option>)}
        </select>
        <select value={filter.coach} onChange={e => setFilter({ ...filter, coach: e.target.value })} style={dropdownStyle}>
          <option value="">All Coaches</option>
          {coaches.map(c => <option value={c} key={c}>{c}</option>)}
        </select>
      </div>
      {/* Main Table */}
      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "24px 36px",
        boxShadow: "0 2px 18px #FFD70015",
        marginBottom: 10
      }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Favorite</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Title</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Age</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Skill(s)</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Level</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>LTAD</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Coach</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Duration</th>
              <th style={{ padding: "8px 6px", textAlign: "center" }}>Compliance</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Last Activity</th>
              <th style={{ padding: "8px 6px", textAlign: "left" }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} style={{ color: "#e82e2e", fontWeight: 900, textAlign: "center", padding: 24 }}>
                  No sessions found.
                </td>
              </tr>
            )}
            {filtered.map((s, idx) => (
              <tr key={s.title} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff"
              }}>
                <td style={{ padding: "7px 6px" }}>
                  <span style={{ cursor: "pointer" }} onClick={() => toggleFav(idx)}>
                    {fav[idx] ? <FaHeart color="#e82e2e" /> : <FaHeart color="#444" />}
                  </span>
                </td>
                <td style={{ padding: "7px 6px", color: "#FFD700", fontWeight: 700 }}>{s.title}</td>
                <td style={{ padding: "7px 6px" }}>{s.type}</td>
                <td style={{ padding: "7px 6px" }}>{s.age}</td>
                <td style={{ padding: "7px 6px" }}>{s.skills.join(", ")}</td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>
                  <span style={{
                    color: "#222",
                    background: s.difficulty === "Advanced" ? "#e82e2e" : s.difficulty === "Intermediate" ? "#FFD700" : "#1de682",
                    fontWeight: 800,
                    borderRadius: 7,
                    padding: "3px 10px"
                  }}>{s.difficulty}</span>
                </td>
                <td style={{ padding: "7px 6px" }}>{s.ltad}</td>
                <td style={{ padding: "7px 6px" }}>{s.coach}</td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>{s.duration} min</td>
                <td style={{ padding: "7px 6px", textAlign: "center" }}>
                  {s.verified
                    ? <FaCheckCircle color="#1de682" title="LTAD Verified" />
                    : <FaExclamationTriangle color="#FFD700" title="Needs Review" />}
                </td>
                <td style={{ padding: "7px 6px", color: "#FFD700", fontSize: 13 }}>{s.lastActivity}</td>
                <td style={{ padding: "7px 6px" }}>{s.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Recent Activity Log */}
      <div style={{
        background: "#232a2e",
        borderRadius: 10,
        color: "#FFD700",
        fontWeight: 700,
        fontSize: 14,
        padding: "10px 18px",
        marginTop: 18,
        marginBottom: 6,
        boxShadow: "0 1px 10px #FFD70022"
      }}>
        <FaList style={{ marginRight: 7, verticalAlign: -2 }} />
        Recent Activity
        <ul style={{ marginLeft: 30, color: "#fff", marginTop: 3 }}>
          {activityLog.slice(0, 4).map((a, i) =>
            <li key={i} style={{ marginBottom: 2 }}>
              <span style={{ color: "#FFD700" }}>{a.date}</span>: {a.activity} <span style={{ color: "#1de682" }}>({a.by})</span>
            </li>
          )}
        </ul>
      </div>
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "13px 21px",
        fontWeight: 600,
        fontSize: 15
      }}>
        <FaClipboardCheck style={{ marginRight: 7, verticalAlign: -2 }} />
        All sessions align with CourtEvo Vero’s structured athlete pathway. Audit-ready, living system for world-class basketball education.
      </div>
    </div>
  );
}

// StatCard helper
function StatCard({ icon, label, value }) {
  return (
    <div style={{
      background: "#232a2e",
      borderRadius: 14,
      boxShadow: `0 3px 12px #FFD70024`,
      padding: "17px 22px",
      minWidth: 170,
      display: "flex",
      alignItems: "center",
      gap: 12
    }}>
      {icon}
      <div>
        <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
      </div>
    </div>
  );
}

const dropdownStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 15,
  padding: "6px 14px"
};
