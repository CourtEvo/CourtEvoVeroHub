// CognitiveSkillsProgressionMatrix.jsx (ALL IN, ENRICHED VERSION)
import React, { useState } from 'react';
import { FaUserGraduate, FaBrain, FaDownload, FaTrophy, FaArrowUp, FaExclamationTriangle, FaLightbulb, FaBook, FaClipboardList, FaChartBar, FaHistory, FaUsers, FaCommentDots, FaFire, FaChartLine, FaAward } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, HeatMapChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Fallback Components (styled Card, Button, etc.)
const Card = ({ children, style }) => (
  <div style={{
    borderRadius: 18,
    background: '#222b37',
    boxShadow: '0 2px 16px #181e2338',
    padding: 20,
    marginBottom: 18,
    ...style
  }}>{children}</div>
);
const CardContent = ({ children }) => <div>{children}</div>;
const Button = ({ children, onClick, style = {}, size, ...props }) => (
  <button
    onClick={onClick}
    style={{
      border: 'none',
      borderRadius: 9,
      padding: size === 'sm' ? '5px 10px' : '12px 18px',
      background: '#FFD700',
      color: '#181e23',
      fontWeight: 700,
      fontSize: size === 'sm' ? 14 : 16,
      cursor: 'pointer',
      margin: '2px 0',
      ...style
    }}
    {...props}
  >{children}</button>
);

// --- Demo Data & Benchmarks ---
const AGE_BANDS = ['U12', 'U14', 'U16', 'U18', 'Senior'];
const SKILLS = ['Attention', 'Adaptability', 'Decision Speed', 'Retention', 'Cognitive Resilience'];

const randomHistory = (val) => {
  // Return 8 session values near val
  return Array.from({ length: 8 }, (_, i) => Math.max(1, Math.min(5, Math.round(val + Math.random() * 1.2 - 0.6))));
};

const DEMO_PLAYERS = [
  { id: 1, name: 'Luka Vuković', ageBand: 'U14', skills: [3, 2, 4, 3, 2], skillHistory: SKILLS.map((s, i) => randomHistory(3 + i%2)), notes: [], sessions: [] },
  { id: 2, name: 'Ivan Horvat', ageBand: 'U16', skills: [4, 4, 4, 3, 3], skillHistory: SKILLS.map((s, i) => randomHistory(4)), notes: [], sessions: [] },
  { id: 3, name: 'Marko Jurić', ageBand: 'U12', skills: [2, 3, 3, 2, 1], skillHistory: SKILLS.map((s, i) => randomHistory(2+i%3)), notes: [], sessions: [] },
  { id: 4, name: 'Petar Božić', ageBand: 'U18', skills: [5, 4, 5, 5, 4], skillHistory: SKILLS.map((s, i) => randomHistory(5)), notes: [], sessions: [] },
  { id: 5, name: 'Kristijan Pavlović', ageBand: 'U18', skills: [4, 5, 3, 4, 5], skillHistory: SKILLS.map((s, i) => randomHistory(4+i%2)), notes: [], sessions: [] },
  { id: 6, name: 'Tin Grgić', ageBand: 'U16', skills: [2, 2, 2, 2, 2], skillHistory: SKILLS.map((s, i) => randomHistory(2)), notes: [], sessions: [] },
  { id: 7, name: 'Juraj Košutić', ageBand: 'Senior', skills: [4, 4, 5, 4, 4], skillHistory: SKILLS.map((s, i) => randomHistory(4)), notes: [], sessions: [] },
  { id: 8, name: 'Lovro Petrić', ageBand: 'U14', skills: [3, 3, 2, 2, 2], skillHistory: SKILLS.map((s, i) => randomHistory(3)), notes: [], sessions: [] },
  { id: 9, name: 'Mateo Bašić', ageBand: 'U16', skills: [5, 5, 5, 4, 5], skillHistory: SKILLS.map((s, i) => randomHistory(5)), notes: [], sessions: [] },
  { id: 10, name: 'Ante Knežević', ageBand: 'U12', skills: [2, 1, 2, 1, 2], skillHistory: SKILLS.map((s, i) => randomHistory(2)), notes: [], sessions: [] }
];

// Skill benchmarks (out of 5) per age band for “boardroom” comparison
const BENCHMARKS = {
  U12:   [2, 2, 2, 2, 2],
  U14:   [3, 2, 3, 2, 2],
  U16:   [3, 3, 3, 3, 3],
  U18:   [4, 3, 4, 3, 4],
  Senior:[4, 4, 4, 4, 4]
};

const COACH_TIPS = [
  "Recommended: Mindfulness Training (for Attention lapses)",
  "Add Reaction Time Drills (Decision Speed)",
  "Scenario Sprints: rapid play recognition",
  "Increase Cognitive Rest breaks",
  "Simulated chaos (for Adaptability)",
  "Memory recall games (Retention)",
  "Journaling after games (Resilience)"
];

// --- Analytics ---
function getPlayerSkillRadar(player) {
  return SKILLS.map((s, i) => ({ skill: s, value: player.skills[i], benchmark: BENCHMARKS[player.ageBand][i] }));
}
function getSkillHistoryChart(player) {
  // Transform skillHistory to { session, Attention, Adaptability, ... }
  const N = player.skillHistory[0].length;
  let rows = [];
  for(let i=0;i<N;i++) {
    let row = { session: i+1 };
    SKILLS.forEach((s, idx) => { row[s] = player.skillHistory[idx][i] });
    rows.push(row);
  }
  return rows;
}
function isHighFlyer(player) {
  const avg = player.skills.reduce((a, b) => a + b, 0) / player.skills.length;
  return avg >= 4.5;
}
function isLaggard(player) {
  const avg = player.skills.reduce((a, b) => a + b, 0) / player.skills.length;
  return avg <= 2.2;
}
function getPercentile(player, players) {
  // Simple: compare avg to cohort
  const avg = player.skills.reduce((a, b) => a + b, 0) / player.skills.length;
  const avgs = players.map(p => p.skills.reduce((a, b) => a + b, 0) / p.skills.length);
  avgs.sort((a,b) => a-b);
  let rank = avgs.findIndex(a => avg <= a);
  return Math.round(100*(1-rank/(players.length-1)));
}

// --- Main Component ---
const CognitiveSkillsProgressionMatrix = () => {
  const [players, setPlayers] = useState(DEMO_PLAYERS);
  const [selectedPlayer, setSelectedPlayer] = useState(DEMO_PLAYERS[0]);
  const [scenario, setScenario] = useState({ skill: 0, boost: 0, name: '', saved: [] }); // [{name, skills}]
  const [tab, setTab] = useState('player'); // 'player', 'analytics', 'club', 'report'
  const [noteInput, setNoteInput] = useState('');

  // --- CRUD Handlers (Demo Only) ---
  const handleAddPlayer = () => {
    const name = prompt('Enter player name:');
    const ageBand = prompt('Enter age band (U12/U14/U16/U18/Senior):');
    if (!name || !AGE_BANDS.includes(ageBand)) return;
    setPlayers([
      ...players,
      { id: Date.now(), name, ageBand, skills: [2,2,2,2,2], skillHistory: SKILLS.map(() => randomHistory(2)), notes: [], sessions: [] }
    ]);
  };

  const handleDeletePlayer = (id) => {
    if (window.confirm('Delete this player?')) {
      setPlayers(players.filter(p => p.id !== id));
      setSelectedPlayer(players[0] || null);
    }
  };

  const handleSkillChange = (skillIdx, val) => {
    setPlayers(players.map(p =>
      p.id === selectedPlayer.id
        ? { ...p, skills: p.skills.map((s, i) => (i === skillIdx ? Number(val) : s)) }
        : p
    ));
    setSelectedPlayer({
      ...selectedPlayer,
      skills: selectedPlayer.skills.map((s, i) => (i === skillIdx ? Number(val) : s))
    });
  };

  // --- Scenario Lab ---
  const handleScenarioBoost = (skillIdx, boost) => {
    setScenario({ ...scenario, skill: skillIdx, boost });
  };

  const getScenarioSkills = () => {
    if (scenario.boost === 0) return selectedPlayer.skills;
    return selectedPlayer.skills.map((val, i) => i === scenario.skill ? Math.min(val + scenario.boost, 5) : val);
  };

  const handleSaveScenario = () => {
    const name = prompt('Scenario name (e.g. "Extra focus training")?');
    if (!name) return;
    setScenario({
      ...scenario,
      saved: [...scenario.saved, { name, skills: getScenarioSkills() }]
    });
  };

  // --- Notes/Action Items ---
  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const player = { ...selectedPlayer };
    player.notes = [...player.notes, { text: noteInput, date: new Date().toLocaleString() }];
    setPlayers(players.map(p => p.id === player.id ? player : p));
    setSelectedPlayer(player);
    setNoteInput('');
  };

  // --- Session Log ---
  const handleAddSession = () => {
    const coach = prompt('Coach initials:');
    if (!coach) return;
    const newSession = {
      date: new Date().toLocaleDateString(),
      skills: [...selectedPlayer.skills],
      coach
    };
    const player = { ...selectedPlayer };
    player.sessions = [...player.sessions, newSession];
    setPlayers(players.map(p => p.id === player.id ? player : p));
    setSelectedPlayer(player);
  };

  // --- Export (Boardroom Snapshot) ---
  const handleExport = () => {
    window.print(); // Easiest: browser print/export for demo. For real PDF use html2pdf or similar.
  };

  // --- CLUB TRENDS (Heatmap, Top/Bottom, etc.) ---
  const skillAverages = () => SKILLS.map((skill, i) =>
    players.reduce((sum, p) => sum + (p.skills[i] || 0), 0) / players.length
  );

  const cohortHeatmap = () => {
    // Array: [{ player, skill, value }]
    let arr = [];
    players.forEach(p => {
      SKILLS.forEach((s, i) => {
        arr.push({ player: p.name, skill: s, value: p.skills[i] });
      });
    });
    return arr;
  };

  // Top performers, fastest improver (simulate), laggards
  const highFlyers = players.filter(isHighFlyer);
  const laggards = players.filter(isLaggard);
  const fastestImprover = players
    .map(p => ({
      ...p,
      trend: p.skillHistory
        .map(his => his[his.length-1] - his[0])
        .reduce((a,b) => a+b, 0)
    }))
    .sort((a, b) => b.trend - a.trend)[0];

  // --- Skill Tree Data (simple) ---
  function skillTreeData(skills) {
    return [
      { name: 'Core', children: SKILLS.map((s, i) => ({
        name: s, value: skills[i]
      })) }
    ];
  }

  // --- Main UI ---
  return (
    <div style={{ padding: 24 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 22, marginBottom: 8 }}>
        <Button onClick={() => setTab('player')} style={{ background: tab==='player'?'#FFD700':'#1de682', color: tab==='player'?'#181e23':'#232', fontWeight:900 }}>Player View</Button>
        <Button onClick={() => setTab('analytics')} style={{ background: tab==='analytics'?'#FFD700':'#1de682', color: tab==='analytics'?'#181e23':'#232', fontWeight:900 }}>Analytics</Button>
        <Button onClick={() => setTab('club')} style={{ background: tab==='club'?'#FFD700':'#1de682', color: tab==='club'?'#181e23':'#232', fontWeight:900 }}>Club Trends</Button>
        <Button onClick={() => setTab('report')} style={{ background: tab==='report'?'#FFD700':'#1de682', color: tab==='report'?'#181e23':'#232', fontWeight:900 }}>Boardroom Report</Button>
      </div>
      <AnimatePresence>
      {tab === 'player' && selectedPlayer && (
        <motion.div key="player" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaBrain style={{ marginRight: 12, fontSize: 30, color: "#1de682", verticalAlign: 'middle' }} />
            COGNITIVE & LEARNING: PLAYER PROFILE
          </h2>
          <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
            {/* Player List */}
            <Card style={{ minWidth: 230, background: "#202a38" }}>
              <CardContent>
                <div style={{ fontWeight: 700, marginBottom: 12, color: "#FFD700", fontSize: 18 }}>Players</div>
                <Button style={{ background: "#1de682", color: "#181e23", fontWeight: 700, width: "100%", marginBottom: 10 }} onClick={handleAddPlayer}>+ Add</Button>
                <div>
                  {players.map(p => (
                    <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div onClick={() => setSelectedPlayer(p)} style={{
                        background: selectedPlayer.id === p.id ? "#FFD70033" : "none",
                        color: selectedPlayer.id === p.id ? "#FFD700" : "#fff",
                        padding: "8px 10px",
                        fontWeight: 600,
                        borderRadius: 10,
                        marginBottom: 4,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: selectedPlayer.id === p.id ? "2px solid #FFD700" : "1px solid #293949"
                      }}>
                        <span>
                          <FaUserGraduate style={{ marginRight: 6, fontSize: 16, verticalAlign: "middle" }} />
                          {p.name} <span style={{ fontSize: 14, color: "#1de682", marginLeft: 6 }}>{p.ageBand}</span>
                          {isHighFlyer(p) && <FaTrophy style={{ color: "#1de682", marginLeft: 4, verticalAlign: "middle" }} title="High Flyer" />}
                          {isLaggard(p) && <FaExclamationTriangle style={{ color: "#FF4848", marginLeft: 4, verticalAlign: "middle" }} title="Laggard" />}
                        </span>
                        <Button size="sm" style={{ background: "#ff4848", color: "#fff", padding: "2px 6px" }} onClick={e => { e.stopPropagation(); handleDeletePlayer(p.id); }}>x</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Player Skill/Matrix */}
            <Card style={{ minWidth: 430, background: "#182433", color: "#fff", flex: 1 }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 6 }}>Progression Matrix</div>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ color: "#FFD700", fontWeight: 700, padding: "6px 12px" }}>Skill</th>
                      <th style={{ color: "#1de682", fontWeight: 700 }}>Current</th>
                      <th style={{ color: "#FFD700", fontWeight: 700 }}>Benchmark</th>
                      <th style={{ color: "#FFD700", fontWeight: 700 }}>Scenario Sim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SKILLS.map((skill, i) => (
                      <tr key={skill}>
                        <td style={{ padding: "7px 10px", fontWeight: 600 }}>{skill}</td>
                        <td>
                          <input
                            type="number"
                            value={selectedPlayer.skills[i]}
                            min={1}
                            max={5}
                            style={{
                              width: 42,
                              fontWeight: 600,
                              border: "1.5px solid #FFD700",
                              borderRadius: 7,
                              background: "#181e23",
                              color: "#FFD700",
                              textAlign: "center",
                              fontSize: 17
                            }}
                            onChange={e => handleSkillChange(i, e.target.value)}
                          />
                        </td>
                        <td>
                          <span style={{ color: "#1de682", fontWeight: 700 }}>{BENCHMARKS[selectedPlayer.ageBand][i]}</span>
                        </td>
                        <td>
                          <input
                            type="range"
                            min={0}
                            max={2}
                            value={scenario.skill === i ? scenario.boost : 0}
                            onChange={e => handleScenarioBoost(i, Number(e.target.value))}
                            style={{ width: 70, verticalAlign: "middle" }}
                          />
                          {scenario.skill === i && scenario.boost > 0 &&
                            <FaArrowUp style={{ color: "#FFD700", marginLeft: 4, verticalAlign: "middle" }} />
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: 14, color: "#FFD700cc", marginTop: 4 }}>
                  <FaTrophy style={{ color: "#1de682", marginRight: 3, verticalAlign: "middle" }} />
                  High-flyers: avg ≥ 4.5 | <FaExclamationTriangle style={{ color: "#FF4848", marginRight: 3, verticalAlign: "middle" }} />
                  Laggards: avg ≤ 2.2
                </div>
                <div style={{ marginTop: 12 }}>
                  <Button size="sm" style={{ background: "#1de682" }} onClick={handleSaveScenario}>Save Scenario</Button>
                </div>
                <div style={{ marginTop: 6, color: "#FFD700", fontWeight: 600 }}>
                  Scenario Lab Tip: <FaLightbulb style={{ color: "#FFD700", margin: "0 5px", verticalAlign: "middle" }} />
                  {COACH_TIPS[scenario.skill]}
                </div>
              </CardContent>
            </Card>

            {/* Skill Tree & Analytics */}
            <Card style={{ minWidth: 340, background: "#181e23", color: "#fff" }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 10 }}>Skill Analytics</div>
                <div style={{ fontWeight: 600, color: "#FFD700", fontSize: 17, marginBottom: 8 }}>
                  Percentile: <span style={{ color: "#1de682" }}>{getPercentile(selectedPlayer, players)}%</span>
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <RadarChart cx="50%" cy="50%" outerRadius={55}
                    data={getPlayerSkillRadar({ ...selectedPlayer, skills: getScenarioSkills() })}>
                    <PolarGrid stroke="#FFD70033" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "#FFD700", fontWeight: 700, fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[1, 5]} tick={{ fill: "#22df82", fontWeight: 700 }} />
                    <Radar name="Player" dataKey="value" stroke="#1de682" fill="#1de682" fillOpacity={0.25} />
                    <Radar name="Benchmark" dataKey="benchmark" stroke="#FFD700" fill="#FFD700" fillOpacity={0.12} />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 10, fontWeight: 600, color: "#1de682" }}>
                  Skill Tree Map:
                  <ul>
                    {skillTreeData(selectedPlayer.skills)[0].children.map(child => (
                      <li key={child.name} style={{
                        color: child.value >= 4 ? "#1de682" : child.value <= 2 ? "#FF4848" : "#FFD700",
                        fontWeight: child.value >= 4 ? 800 : 600
                      }}>
                        {child.name}: {child.value} {child.value >= 4 && <FaArrowUp />}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Saved Scenarios */}
          {scenario.saved.length > 0 && (
            <Card style={{ background: "#181e23" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Saved Scenarios</div>
                <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 10 }}>
                  {scenario.saved.map((s, idx) => (
                    <div key={idx} style={{ background: "#232b39", borderRadius: 9, padding: "9px 14px", color: "#1de682", fontWeight: 600, minWidth: 120 }}>
                      <FaClipboardList style={{ marginRight: 5, color: "#FFD700" }} />
                      {s.name} <br />
                      <span style={{ fontSize: 13 }}>
                        {s.skills.map((v, i) => `${SKILLS[i][0]}:${v}`).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Player Notes and Session Log */}
          <div style={{ display: 'flex', gap: 28 }}>
            <Card style={{ minWidth: 330, background: "#222b37" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Coach Notes & Action Items</div>
                <div style={{ margin: "8px 0" }}>
                  <textarea
                    rows={2}
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Add note or intervention..."
                    style={{ width: "100%", borderRadius: 6, padding: 8, border: "1.3px solid #FFD700" }}
                  />
                  <Button size="sm" onClick={handleAddNote} style={{ marginTop: 4 }}>Add Note</Button>
                </div>
                <ul>
                  {selectedPlayer.notes.map((note, idx) => (
                    <li key={idx} style={{ color: "#1de682", marginBottom: 3, fontSize: 15 }}>
                      <FaCommentDots style={{ marginRight: 6 }} /> {note.text}
                      <span style={{ color: "#FFD700aa", fontSize: 13, marginLeft: 7 }}>({note.date})</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card style={{ minWidth: 320, background: "#181e23" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Session Log</div>
                <Button size="sm" style={{ background: "#1de682", marginBottom: 6 }} onClick={handleAddSession}>+ Add Session</Button>
                <ul>
                  {selectedPlayer.sessions.map((sess, idx) => (
                    <li key={idx} style={{ color: "#FFD700", marginBottom: 3, fontSize: 14 }}>
                      <FaHistory style={{ marginRight: 6 }} /> {sess.date} ({sess.coach}) – [{sess.skills.join(', ')}]
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* --- Analytics Tab --- */}
      {tab === 'analytics' && selectedPlayer && (
        <motion.div key="analytics" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaChartLine style={{ marginRight: 12, fontSize: 30, color: "#1de682", verticalAlign: 'middle' }} />
            Player Skill Trends
          </h2>
          <Card style={{ minWidth: 730, background: "#182433", color: "#fff" }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 12 }}>Skill Trend Over Time</div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={getSkillHistoryChart(selectedPlayer)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis domain={[1,5]} />
                  <Tooltip />
                  <Legend />
                  {SKILLS.map(skill => (
                    <Bar key={skill} dataKey={skill} fill="#FFD700" stackId="a" />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div style={{ color: "#FFD700", fontWeight: 700, marginTop: 18 }}>Cognitive Risk Alerts</div>
          <div style={{ color: "#1de682", fontWeight: 600, fontSize: 16 }}>
            {selectedPlayer.skillHistory.some(arr => arr.some((v, i, a) => i>0 && v < a[i-1])) ? 
              <span><FaExclamationTriangle style={{ color: "#FF4848", marginRight: 4 }} /> Stalling or Regression Detected</span>
              : <span><FaArrowUp style={{ color: "#1de682", marginRight: 4 }} /> Progressing Well</span>
            }
          </div>
        </motion.div>
      )}

      {/* --- Club Trends Tab --- */}
      {tab === 'club' && (
        <motion.div key="club" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaUsers style={{ marginRight: 12, fontSize: 30, color: "#1de682", verticalAlign: 'middle' }} />
            Club Cohort Trends & Heatmap
          </h2>
          <Card style={{ minWidth: 630, background: "#182433", color: "#fff" }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 10 }}>Cohort Cognitive Heatmap</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ color: "#FFD700", fontWeight: 700, padding: "6px 12px" }}>Player</th>
                    {SKILLS.map(skill => (
                      <th key={skill} style={{ color: "#1de682", fontWeight: 700 }}>{skill}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, idx) => (
                    <tr key={p.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{p.name}</td>
                      {p.skills.map((val, i) => (
                        <td key={i} style={{
                          color: val>=4?"#1de682":val<=2?"#FF4848":"#FFD700",
                          fontWeight: val>=4?800:600,
                          background: val>=4?"#1de68233":val<=2?"#FF484833":""
                        }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div style={{ marginTop: 20, display: 'flex', gap: 38 }}>
            <Card style={{ background: "#181e23" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>High Flyers <FaTrophy style={{ color: "#1de682" }} /></div>
                <ul>
                  {highFlyers.map(p => (
                    <li key={p.id} style={{ color: "#1de682", fontWeight: 700 }}>{p.name}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card style={{ background: "#181e23" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>Laggards <FaExclamationTriangle style={{ color: "#FF4848" }} /></div>
                <ul>
                  {laggards.map(p => (
                    <li key={p.id} style={{ color: "#FF4848", fontWeight: 700 }}>{p.name}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card style={{ background: "#181e23" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>Fastest Improver <FaFire style={{ color: "#FFD700" }} /></div>
                <ul>
                  <li style={{ color: "#FFD700", fontWeight: 700 }}>{fastestImprover?.name || '-'}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* --- Boardroom Report Tab --- */}
      {tab === 'report' && (
        <motion.div key="report" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaAward style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            Boardroom Report
          </h2>
          <Card style={{ minWidth: 930, background: "#232b39", color: "#fff" }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 12 }}>Full Matrix Export</div>
              <Button style={{ background: "#FFD700", color: "#23292f", fontWeight: 700, fontSize: 15, borderRadius: 11 }} onClick={handleExport}>
                <FaDownload style={{ marginRight: 6 }} /> Export Boardroom Snapshot (PDF)
              </Button>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18 }}>
                <thead>
                  <tr>
                    <th style={{ color: "#FFD700", fontWeight: 700, padding: "6px 12px" }}>Player</th>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>AgeBand</th>
                    {SKILLS.map(skill => (
                      <th key={skill} style={{ color: "#1de682", fontWeight: 700 }}>{skill}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, idx) => (
                    <tr key={p.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{p.name}</td>
                      <td style={{ color: "#FFD700" }}>{p.ageBand}</td>
                      {p.skills.map((val, i) => (
                        <td key={i} style={{
                          color: val>=4?"#1de682":val<=2?"#FF4848":"#FFD700",
                          fontWeight: val>=4?800:600
                        }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 18, fontWeight: 700, color: "#FFD700", fontSize: 16 }}>Club Summary</div>
              <div style={{ color: "#1de682", fontWeight: 700 }}>
                Skill Averages: {skillAverages().map((v, i) => <span key={i}>{SKILLS[i]}: {v.toFixed(2)}  </span>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default CognitiveSkillsProgressionMatrix;
