import React, { useState } from "react";
import {
  FaBolt, FaCheckCircle, FaCube, FaEdit, FaTrash, FaPlusCircle,
  FaCloudDownloadAlt, FaTrophy, FaFire, FaCubes, FaStar, FaUser, FaUsers, FaFilePdf, FaExclamationTriangle
} from "react-icons/fa";

// DEMO: Skill library
const initialSkills = [
  { id: 1, name: "Layup", parents: [], description: "Standard strong hand layup" },
  { id: 2, name: "Eurostep", parents: [1], description: "Layup with eurostep move" },
  { id: 3, name: "Floater", parents: [1], description: "One-hand floater in the lane" },
  { id: 4, name: "Catch & Shoot", parents: [], description: "Stationary jump shot off pass" },
  { id: 5, name: "Pull-Up Jumper", parents: [4], description: "Off-dribble pull-up shot" },
  { id: 6, name: "Closeout", parents: [], description: "Defensive sprint-and-stop to shooter" },
  { id: 7, name: "Help-Side Rotation", parents: [6], description: "Defensive team rotation" }
];

const squads = ["U10 Boys", "U12 Boys", "U14 Boys", "U16 Boys", "U18 Boys", "Seniors"];

// DEMO: Player list per squad
const initialPlayers = {
  "U10 Boys": ["Antonio Pavic", "Luka Vidovic", "Jure Kolar"],
  "U12 Boys": ["Ivan Juric", "Petar Simic", "Kristijan Matic", "Niko Topic"],
  "U14 Boys": ["Dino Markovic", "Filip Ilic"],
  "U16 Boys": ["Lovro Pavlovic"],
  "U18 Boys": ["Mislav Kralj", "Jakov Babic"],
  "Seniors": ["Mateo Peric"]
};

const progressionStages = [
  { key: "introduced", label: "Introduced", color: "#FFD700" },
  { key: "practiced", label: "Practiced", color: "#1de682" },
  { key: "mastered", label: "Mastered", color: "#ff6b6b" }
];

function randomStatus() {
  return progressionStages[Math.floor(Math.random() * progressionStages.length)].key;
}

// Each squad and each player gets progression for each skill
function generateInitialProgression() {
  const p = {};
  Object.entries(initialPlayers).forEach(([sq, players]) => {
    p[sq] = {};
    players.forEach(pl => {
      p[sq][pl] = {};
      initialSkills.forEach(skill => {
        p[sq][pl][skill.id] = {
          coach: randomStatus(),
          player: randomStatus()
        };
      });
    });
  });
  return p;
}

export default function SkillProgressionMasterMap() {
  const [skills, setSkills] = useState(initialSkills);
  const [players, setPlayers] = useState(initialPlayers);
  const [progression, setProgression] = useState(generateInitialProgression());
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState(squads[0]);
  const [selectedPlayer, setSelectedPlayer] = useState(initialPlayers[squads[0]][0]);
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // CRUD for skill library
  function handleEdit(skill) {
    setEditing(skill);
    setForm({ ...skill });
    setAdding(false);
  }
  function handleDelete(id) {
    setSkills(skills.filter(s => s.id !== id));
    // Remove from all progressions
    const np = { ...progression };
    squads.forEach(sq => {
      Object.keys(np[sq]).forEach(pl => { delete np[sq][pl][id]; });
    });
    setProgression(np);
    if (selectedSkill && selectedSkill.id === id) setSelectedSkill(skills[0]);
  }
  function handleSaveEdit() {
    setSkills(skills.map(s => s.id === editing.id ? { ...form, id: editing.id } : s));
    setEditing(null);
  }
  function handleAddNew() {
    const newSkill = { ...form, id: Date.now(), parents: form.parents || [] };
    setSkills([...skills, newSkill]);
    // Add to progression for all players
    const np = { ...progression };
    squads.forEach(sq => {
      Object.keys(np[sq]).forEach(pl => {
        np[sq][pl][newSkill.id] = { coach: "introduced", player: "introduced" };
      });
    });
    setProgression(np);
    setAdding(false);
  }

  // Set status for coach/player rating
  function setStatus(squad, player, skillId, status, who) {
    setProgression(p => ({
      ...p,
      [squad]: {
        ...p[squad],
        [player]: {
          ...p[squad][player],
          [skillId]: {
            ...p[squad][player][skillId],
            [who]: status
          }
        }
      }
    }));
  }

  // Add player to squad
  function addPlayerToSquad(squad, name) {
    setPlayers(ps => ({
      ...ps,
      [squad]: [...ps[squad], name]
    }));
    setProgression(prog => {
      const np = { ...prog };
      np[squad][name] = {};
      skills.forEach(skill => {
        np[squad][name][skill.id] = { coach: "introduced", player: "introduced" };
      });
      return np;
    });
  }

  // Export as CSV/PDF
  function exportCSV() {
    let header = "Squad,Player";
    skills.forEach(s => { header += "," + s.name + " (Coach)"; header += "," + s.name + " (Player)"; });
    let body = squads.flatMap(sq =>
      players[sq].map(pl =>
        [sq, pl, ...skills.flatMap(sk => [progression[sq][pl][sk.id].coach, progression[sq][pl][sk.id].player])].join(",")
      )
    ).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "skill_progression.csv";
    link.click();
  }

  // Generate PDF (dummy/simple for now)
  function exportPDF() {
    window.print();
  }

  // Heatmap for skills/squads/players
  function SkillGapLog() {
    // For each squad, what % of skills are mastered (coach) by >75% of players
    return squads.map(sq => {
      const plList = players[sq];
      if (!plList.length) return null;
      const mastered = skills.map(sk => {
        const num = plList.filter(pl => progression[sq][pl][sk.id].coach === "mastered").length;
        return { skill: sk.name, percent: Math.round(100 * num / plList.length) };
      });
      const gaps = mastered.filter(m => m.percent < 40);
      return (
        <div key={sq} style={{ marginBottom: 9 }}>
          <b style={{ color: "#FFD700" }}>{sq}:</b>
          {gaps.length === 0 ? <span style={{ color: "#1de682", fontWeight: 600 }}> No major gaps</span> :
            gaps.map(g => <span key={g.skill} style={{ color: "#ff6b6b", fontWeight: 600 }}> {g.skill} ({g.percent}%) </span>)}
        </div>
      );
    });
  }

  // Agreement gap for selected player/skill
  function agreementGap(squad, player, skillId) {
    const prog = progression[squad][player][skillId];
    if (prog.coach === prog.player) return null;
    return (
      <span style={{ color: "#FFD700", fontWeight: 700 }}>
        <FaExclamationTriangle /> Coach: {prog.coach}, Player: {prog.player}
      </span>
    );
  }

  // Skill timeline for player
  function SkillTimeline({ squad, player }) {
    return (
      <div style={{ padding: 4 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 6 }}>
          {player}'s Skill Journey
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {skills.map(sk =>
            <div key={sk.id} style={{
              background: progressionStages.find(p => p.key === progression[squad][player][sk.id].coach).color,
              color: "#232a2e", borderRadius: 12, fontWeight: 700,
              padding: "7px 11px", minWidth: 80, marginBottom: 5
            }}>
              {sk.name}
              <div style={{ fontWeight: 500, fontSize: 13, color: "#232a2e" }}>
                {progression[squad][player][sk.id].coach}
                {agreementGap(squad, player, sk.id) && <span style={{ fontSize: 10, color: "#FFD700" }}> (gap)</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#232a2e",
      color: "#fff",
      fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh",
      borderRadius: "24px",
      padding: "38px 28px 18px 28px",
      boxShadow: "0 6px 32px 0 #1a1d20"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <FaCubes size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            SKILL PROGRESSION MASTERMAP
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Visualize, gamify, and gap-analyze every skill journey. Per player & squad.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 10, fontWeight: 700,
            border: "none", padding: "10px 18px", marginRight: 10, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={exportCSV}
        >
          <FaCloudDownloadAlt style={{ marginRight: 7 }} /> Export CSV
        </button>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 10, fontWeight: 700,
            border: "none", padding: "10px 18px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={exportPDF}
        >
          <FaFilePdf style={{ marginRight: 7 }} /> PDF Report
        </button>
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 10, fontWeight: 700,
            border: "none", padding: "10px 18px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={() => setShowHeatmap(h => !h)}
        >
          {showHeatmap ? <FaStar style={{ marginRight: 7 }} /> : <FaBolt style={{ marginRight: 7 }} />}
          {showHeatmap ? "Skill Heatmap" : "Skill Tree"}
        </button>
      </div>
      {/* Layout */}
      <div style={{
        display: "flex",
        gap: 34,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}>
        {/* Skill Tree or Heatmap */}
        <div style={{
          minWidth: 320, maxWidth: 440, flex: "1 1 380px",
          background: "#283E51", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a",
          marginBottom: 18, overflowY: "auto", maxHeight: 410
        }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 18, marginBottom: 9 }}>
            {showHeatmap ? "Squad Skill Heatmap" : `Skill Tree: ${selectedSquad}`}
          </div>
          <div>
            <b>Squad:</b>
            <select value={selectedSquad} onChange={e => {
              setSelectedSquad(e.target.value);
              setSelectedPlayer(players[e.target.value][0]);
            }} style={{ marginLeft: 10, borderRadius: 7, padding: "4px 9px" }}>
              {squads.map(sq => <option key={sq} value={sq}>{sq}</option>)}
            </select>
            <b style={{ marginLeft: 15 }}>Player:</b>
            <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} style={{ marginLeft: 10, borderRadius: 7, padding: "4px 9px" }}>
              {players[selectedSquad].map(pl => <option key={pl} value={pl}>{pl}</option>)}
            </select>
            <button style={{
              background: "#1de682", color: "#232a2e", borderRadius: 7, fontWeight: 700, border: "none", marginLeft: 10, padding: "4px 9px", fontSize: 14, cursor: "pointer"
            }}
              onClick={() => {
                const newName = prompt("Enter new player name:");
                if (newName) addPlayerToSquad(selectedSquad, newName);
              }}>
              <FaPlusCircle style={{ marginRight: 5 }} />Add Player
            </button>
          </div>
          {showHeatmap
            ? (
              <div style={{ marginTop: 10 }}>
                <SkillGapLog />
                <SquadHeatmap progression={progression} skills={skills} players={players} squads={squads} stages={progressionStages} />
              </div>
            )
            : (
              <div style={{ marginTop: 10 }}>
                <SkillTree squad={selectedSquad} player={selectedPlayer} />
              </div>
            )
          }
        </div>

        {/* Skill Details, Progression & Timeline */}
        <div style={{
          minWidth: 280, maxWidth: 340, flex: "1 1 260px", background: "#232a2e",
          borderRadius: 14, padding: "17px 15px 10px 17px", boxShadow: "0 2px 12px 0 #15171a",
          marginBottom: 18
        }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 6 }}>
            Skill Details & Progression
          </div>
          {selectedSkill && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#FFD700" }}>{selectedSkill.name}</div>
              <div style={{ margin: "4px 0 10px 0", fontSize: 14 }}>{selectedSkill.description}</div>
              <div>
                <b>Set Progress for {selectedPlayer} ({selectedSquad}):</b>
                <div style={{ marginTop: 7 }}>
                  {progressionStages.map(stage =>
                    <button key={stage.key}
                      style={{
                        background: progression[selectedSquad][selectedPlayer][selectedSkill.id].coach === stage.key ? stage.color : "#283E51",
                        color: progression[selectedSquad][selectedPlayer][selectedSkill.id].coach === stage.key ? "#232a2e" : "#FFD700",
                        borderRadius: 6, fontWeight: 700, border: "none",
                        marginRight: 5, padding: "4px 13px", cursor: "pointer", fontSize: 14
                      }}
                      onClick={() => setStatus(selectedSquad, selectedPlayer, selectedSkill.id, stage.key, "coach")}
                    >
                      Coach: {stage.label}
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 5 }}>
                  {progressionStages.map(stage =>
                    <button key={stage.key}
                      style={{
                        background: progression[selectedSquad][selectedPlayer][selectedSkill.id].player === stage.key ? stage.color : "#283E51",
                        color: progression[selectedSquad][selectedPlayer][selectedSkill.id].player === stage.key ? "#232a2e" : "#FFD700",
                        borderRadius: 6, fontWeight: 700, border: "none",
                        marginRight: 5, padding: "3px 9px", cursor: "pointer", fontSize: 13
                      }}
                      onClick={() => setStatus(selectedSquad, selectedPlayer, selectedSkill.id, stage.key, "player")}
                    >
                      Player: {stage.label}
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  {agreementGap(selectedSquad, selectedPlayer, selectedSkill.id)}
                </div>
              </div>
              <div style={{ marginTop: 13 }}>
                <b>Parents:</b> {selectedSkill.parents.length === 0 ? <span style={{ color: "#1de682" }}>None (root skill)</span> : selectedSkill.parents.map(pid => skills.find(s => s.id === pid)?.name || "").join(", ")}
              </div>
              <div style={{ marginTop: 6 }}>
                <b>Status by Player ({selectedSquad}):</b>
                <ul style={{ margin: 0, fontSize: 13 }}>
                  {players[selectedSquad].map(pl =>
                    <li key={pl} style={{ color: progressionStages.find(p => p.key === progression[selectedSquad][pl][selectedSkill.id].coach).color }}>
                      {pl}: {progressionStages.find(p => p.key === progression[selectedSquad][pl][selectedSkill.id].coach).label}
                    </li>
                  )}
                </ul>
              </div>
              <div style={{ marginTop: 15 }}>
                <button
                  style={{
                    background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 700, border: "none", marginTop: 6, padding: "6px 13px", fontSize: 15, cursor: "pointer"
                  }}
                  onClick={() => setShowTimeline(t => !t)}
                >
                  <FaBolt style={{ marginRight: 6 }} />
                  {showTimeline ? "Hide" : "Show"} Skill Journey Timeline
                </button>
                {showTimeline && <SkillTimeline squad={selectedSquad} player={selectedPlayer} />}
              </div>
            </div>
          )}
        </div>

        {/* Skill Library CRUD */}
        <div style={{
          minWidth: 285, maxWidth: 350, flex: "1 1 250px", background: "#232a2e", borderRadius: 14,
          padding: "14px 13px 10px 13px", boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18,
          maxHeight: 410, overflowY: "auto"
        }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 6 }}>
            Skill Library & Builder
          </div>
          {(adding || editing) &&
            <div style={{
              background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "13px 11px", marginBottom: 13
            }}>
              <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 7 }}>{adding ? "Add New Skill" : "Edit Skill"}</div>
              <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
                <div>
                  <b>Name:</b>
                  <input type="text" value={form.name || ""} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 130 }} />
                </div>
                <div>
                  <b>Description:</b>
                  <input type="text" value={form.description || ""} required
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 130 }} />
                </div>
                <div>
                  <b>Parents:</b>
                  <select multiple value={form.parents || []}
                    onChange={e => setForm(f => ({
                      ...f,
                      parents: Array.from(e.target.selectedOptions).map(o => Number(o.value))
                    }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 140, height: 52 }}>
                    {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
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
          <button
            style={{
              background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 700, border: "none", marginBottom: 8, padding: "5px 14px", fontSize: 15, cursor: "pointer"
            }}
            onClick={() => { setAdding(true); setForm({ parents: [] }); setEditing(null); }}
          >
            <FaPlusCircle style={{ marginRight: 7 }} /> Add Skill
          </button>
          <ul style={{ listStyle: "none", padding: 0, maxHeight: 200, overflowY: "auto" }}>
            {skills.map(skill =>
              <li key={skill.id} style={{ marginBottom: 7, padding: "5px 0", borderBottom: "1px solid #283E51" }}>
                <span style={{
                  fontWeight: 700, fontSize: 14, color: "#FFD700", cursor: "pointer",
                  borderBottom: selectedSkill && selectedSkill.id === skill.id ? "2.5px solid #FFD700" : "none"
                }}
                  onClick={() => setSelectedSkill(skill)}
                >
                  {skill.name}
                </span>
                <button onClick={() => handleEdit(skill)}
                  style={{ background: "#FFD700", color: "#232a2e", borderRadius: 5, fontWeight: 700, border: "none", marginLeft: 8, padding: "2px 8px", cursor: "pointer" }}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(skill.id)}
                  style={{ background: "#ff6b6b", color: "#fff", borderRadius: 5, fontWeight: 700, border: "none", padding: "2px 8px", cursor: "pointer" }}>
                  <FaTrash />
                </button>
              </li>
            )}
          </ul>
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
        Proprietary to CourtEvo Vero. Skills move the world. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}

// Skill tree (recursively draw parent-child)
function SkillTree({ squad, player }) {
  // Use skillMap for easy access
  const skills = [
    { id: 1, name: "Layup", parents: [], description: "Standard strong hand layup" },
    { id: 2, name: "Eurostep", parents: [1], description: "Layup with eurostep move" },
    { id: 3, name: "Floater", parents: [1], description: "One-hand floater in the lane" },
    { id: 4, name: "Catch & Shoot", parents: [], description: "Stationary jump shot off pass" },
    { id: 5, name: "Pull-Up Jumper", parents: [4], description: "Off-dribble pull-up shot" },
    { id: 6, name: "Closeout", parents: [], description: "Defensive sprint-and-stop to shooter" },
    { id: 7, name: "Help-Side Rotation", parents: [6], description: "Defensive team rotation" }
  ];
  const progressionStages = [
    { key: "introduced", label: "Introduced", color: "#FFD700" },
    { key: "practiced", label: "Practiced", color: "#1de682" },
    { key: "mastered", label: "Mastered", color: "#ff6b6b" }
  ];
  const skillMap = {};
  skills.forEach(s => { skillMap[s.id] = s; });
  // Recursively draw root skills and children
  function renderSkill(skill, level = 0) {
    return (
      <div key={skill.id} style={{ marginLeft: level * 28, marginBottom: 8 }}>
        <span style={{
          fontWeight: 700,
          fontSize: 16,
          color: progressionStages.find(p => p.key === window.progression?.[squad]?.[player]?.[skill.id]?.coach || "introduced").color,
        }}>
          {skill.name}
        </span>
        {/* Children */}
        {skills.filter(s => s.parents.includes(skill.id)).map(child => renderSkill(child, level + 1))}
      </div>
    );
  }
  return (
    <div>
      {skills.filter(s => s.parents.length === 0).map(skill => renderSkill(skill, 0))}
    </div>
  );
}

// Squad skill heatmap table
function SquadHeatmap({ progression, skills, players, squads, stages }) {
  return (
    <div style={{ overflowX: "auto", maxHeight: 145 }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ color: "#FFD700", fontWeight: 700, background: "#232a2e", position: "sticky", left: 0, zIndex: 2 }}>Squad</th>
            {skills.map(sk =>
              <th key={sk.id} style={{ color: "#FFD700", fontWeight: 700, background: "#232a2e" }}>{sk.name}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {squads.map(sq =>
            <tr key={sq}>
              <td style={{ color: "#FFD700", background: "#283E51", position: "sticky", left: 0, zIndex: 1 }}>{sq}</td>
              {skills.map(sk => {
                // % mastered (coach)
                const plList = players[sq];
                const mastered = plList.filter(pl => progression[sq][pl][sk.id].coach === "mastered").length;
                const percent = plList.length ? Math.round(100 * mastered / plList.length) : 0;
                return (
                  <td key={sk.id} style={{
                    background: percent > 70 ? "#1de682" : percent > 40 ? "#FFD700" : "#ff6b6b",
                    color: "#232a2e", fontWeight: 700, border: "1px solid #283E51", minWidth: 62
                  }}>
                    {percent}%
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
