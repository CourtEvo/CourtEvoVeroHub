// src/components/TalentConcentrationEquityVisualizer.jsx
import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUndo, FaRedo, FaFileExport, FaChartPie, FaUsers, FaBalanceScale, FaSave, FaFolderOpen, FaExclamationTriangle, FaCrown, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid, LineChart, Line } from 'recharts';

const COLORS = ['#FFD700', '#1de682', '#232a2e', '#485563', '#c2b280'];
const brand = { bg: '#232a2e', gold: '#FFD700', green: '#1de682', accent: '#283E51' };

// Sample data + trend
const demoClubs = [
  { id: 1, name: "Zagreb Eagles", region: "Zagreb", players: 44 },
  { id: 2, name: "Dalmatia Sharks", region: "Split", players: 31 },
  { id: 3, name: "Istra Lions", region: "Pula", players: 17 },
  { id: 4, name: "Osijek Falcons", region: "Osijek", players: 5 },
  { id: 5, name: "Dubrovnik Kings", region: "Dubrovnik", players: 13 }
];

function giniIndex(values) {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  let sum = 0;
  for (let i = 0; i < n; ++i)
    for (let j = 0; j < n; ++j)
      sum += Math.abs(values[i] - values[j]);
  return mean === 0 ? 0 : sum / (2 * n * n * mean);
}

// Utility for advanced analytics
function getDominanceIndex(clubs) {
  // % held by largest club vs. the next two
  const sorted = [...clubs].sort((a, b) => b.players - a.players);
  return sorted[0].players / (sorted[1]?.players + sorted[2]?.players || 1);
}
function getTop33Percent(clubs) {
  const sorted = [...clubs].sort((a, b) => b.players - a.players);
  const topN = Math.ceil(clubs.length / 3);
  const total = clubs.reduce((s, c) => s + c.players, 0);
  const topTotal = sorted.slice(0, topN).reduce((s, c) => s + c.players, 0);
  return total === 0 ? 0 : (topTotal / total) * 100;
}

// Advanced tags
function getClubTag(club, clubs) {
  const max = Math.max(...clubs.map(c => c.players));
  if (club.players === max) return <span style={{ color: '#FFD700', fontWeight: 700 }}><FaCrown /> Dominant</span>;
  if (club.players < 8) return <span style={{ color: '#e04747', fontWeight: 700 }}><FaExclamationTriangle /> At Risk</span>;
  if (club.players > 0.7 * max) return <span style={{ color: '#1de682', fontWeight: 700 }}><FaStar /> Emerging</span>;
  return null;
}

const TalentConcentrationEquityVisualizer = () => {
  const [clubs, setClubs] = useState(demoClubs);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([demoClubs]);
  const [giniTrend, setGiniTrend] = useState([giniIndex(demoClubs)]);
  const [redoStack, setRedoStack] = useState([]);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Undo/Redo
  const undo = () => {
    if (history.length <= 1) return;
    setRedoStack([clubs, ...redoStack]);
    const prev = history[history.length - 2];
    setClubs(prev);
    setHistory(history.slice(0, -1));
    setGiniTrend(giniTrend.slice(0, -1));
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    setHistory([...history, redoStack[0]]);
    setClubs(redoStack[0]);
    setGiniTrend([...giniTrend, giniIndex(redoStack[0].map(c => c.players))]);
    setRedoStack(redoStack.slice(1));
  };

  // CRUD
  const addClub = (club) => {
    const next = [...clubs, { ...club, id: Date.now() }];
    setHistory([...history, next]);
    setClubs(next);
    setGiniTrend([...giniTrend, giniIndex(next.map(c => c.players))]);
    setRedoStack([]);
  };
  const updateClub = (club) => {
    const next = clubs.map(c => c.id === club.id ? club : c);
    setHistory([...history, next]);
    setClubs(next);
    setSelected(null);
    setGiniTrend([...giniTrend, giniIndex(next.map(c => c.players))]);
    setRedoStack([]);
  };
  const deleteClub = (id) => {
    const next = clubs.filter(c => c.id !== id);
    setHistory([...history, next]);
    setClubs(next);
    setSelected(null);
    setGiniTrend([...giniTrend, giniIndex(next.map(c => c.players))]);
    setRedoStack([]);
  };

  // Scenario engine
  const movePlayer = (fromId, toId) => {
    if (fromId === toId) return;
    const from = clubs.find(c => c.id === fromId);
    const to = clubs.find(c => c.id === toId);
    if (!from || !to || from.players < 1) return;
    const next = clubs.map(c =>
      c.id === fromId ? { ...c, players: c.players - 1 } :
        c.id === toId ? { ...c, players: c.players + 1 } : c
    );
    setHistory([...history, next]);
    setClubs(next);
    setGiniTrend([...giniTrend, giniIndex(next.map(c => c.players))]);
    setRedoStack([]);
  };

  // Scenario save/load
  const saveScenario = () => {
    setSavedScenarios([...savedScenarios, { clubs: JSON.parse(JSON.stringify(clubs)), name: `Scenario ${savedScenarios.length + 1}` }]);
  };
  const loadScenario = (idx) => {
    const scenario = savedScenarios[idx];
    if (!scenario) return;
    setClubs(scenario.clubs);
    setHistory([...history, scenario.clubs]);
    setGiniTrend([...giniTrend, giniIndex(scenario.clubs.map(c => c.players))]);
    setRedoStack([]);
  };

  // Export as CSV
  const exportCSV = () => {
    const csv = ["Club,Region,Players"].concat(
      clubs.map(c => `${c.name},${c.region},${c.players}`)
    ).join('\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "talent_concentration.csv";
    a.click(); URL.revokeObjectURL(url);
  };
  // Export as PDF (stub)
  const exportPDF = () => {
    alert("PDF export is handled by CourtEvo Vero's boardroom back-end engine. See your Boardroom Export tools.");
  };

  // Metrics
  const gini = giniIndex(clubs.map(c => c.players));
  const maxPlayers = Math.max(...clubs.map(c => c.players));
  const minPlayers = Math.min(...clubs.map(c => c.players));
  const top33 = getTop33Percent(clubs);
  const dominance = getDominanceIndex(clubs);
  const imbalanceClub = clubs.reduce((a, b) => a.players > b.players ? a : b);

  // Boardroom-grade insights
  const alerts = [];
  if (gini > 0.40) alerts.push("Critical imbalance: Top club controls too much talent. Consider redistribution, merger, or split.");
  if (dominance > 1.4) alerts.push("Dominance risk: 1 club more than 40% stronger than next 2 combined.");
  if (clubs.length < 5) alerts.push("Low club count: Consider supporting new clubs to boost competitive balance.");
  if (top33 > 66) alerts.push("Top third of clubs control over two-thirds of talent. Risk of drop-outs at weaker clubs.");
  if (alerts.length === 0) alerts.push("No major equity risks detected. System is healthy.");

  // Tabs for Dashboard / Advanced Analytics / Trend
  return (
    <div style={{
      background: brand.bg, borderRadius: 22, boxShadow: '0 8px 48px #232a2e44',
      padding: 28, fontFamily: 'Segoe UI, sans-serif', color: '#fff', maxWidth: 1320, margin: '0 auto'
    }}>
      {/* Boardroom Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 13, marginBottom: 10,
        borderBottom: '2px solid #FFD70033', paddingBottom: 6
      }}>
        <FaBalanceScale size={30} color={brand.gold} />
        <span style={{ fontWeight: 900, fontSize: 24, color: brand.gold, letterSpacing: 2 }}>
          Talent Concentration & Equity Visualizer
        </span>
        <span style={{
          background: '#FFD700', color: '#232a2e', fontWeight: 700, borderRadius: 8,
          padding: '2px 18px', fontSize: 14, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022'
        }}>
          Powered by CourtEvo Vero | Boardroom Scenario Mode
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 18, margin: '22px 0 10px 0' }}>
        {['dashboard', 'analytics', 'trend'].map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? brand.gold : brand.accent,
              color: activeTab === tab ? '#222' : '#fff',
              fontWeight: 700,
              border: 'none',
              borderRadius: 13,
              fontSize: 15,
              padding: '8px 28px',
              cursor: 'pointer',
              boxShadow: activeTab === tab ? '0 2px 14px #FFD70033' : 'none'
            }}>
            {tab === 'dashboard' && <FaChartPie style={{ marginRight: 7 }} />}
            {tab === 'analytics' && <FaUsers style={{ marginRight: 7 }} />}
            {tab === 'trend' && <FaArrowUp style={{ marginRight: 7 }} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      {activeTab === 'dashboard' && (
        <>
          <div style={{
            display: 'flex', flexDirection: 'row', gap: 34, marginBottom: 20, flexWrap: 'wrap'
          }}>
            {/* Charts */}
            <div style={{ flex: 1.5, minWidth: 330, background: '#283E51', borderRadius: 18, padding: 24, boxShadow: '0 4px 28px #FFD70022' }}>
              <h3 style={{ fontWeight: 700, fontSize: 19, margin: '0 0 16px 0', color: brand.gold }}>Distribution by Club</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={clubs}
                    dataKey="players"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={95}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {clubs.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <h4 style={{ fontWeight: 600, margin: '16px 0 7px 0', color: brand.green }}>Bar Distribution</h4>
              <ResponsiveContainer width="99%" height={110}>
                <BarChart data={clubs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#FFD700" />
                  <YAxis stroke="#1de682" />
                  <Bar dataKey="players">
                    {clubs.map((entry, idx) => (
                      <Cell key={`bar-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Alerts + Equity */}
            <div style={{ flex: 1, minWidth: 330, background: '#232a2e', borderRadius: 18, padding: 20, border: '2px solid #FFD70022' }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: brand.gold, marginBottom: 12, letterSpacing: 1 }}>Equity Snapshot</div>
              <div style={{ fontSize: 16, color: '#fff', marginBottom: 11 }}>
                <FaBalanceScale color={brand.green} style={{ marginRight: 9, fontSize: 20 }} />
                <span style={{ fontWeight: 600 }}>Gini Index: </span>
                <span style={{ color: gini > 0.40 ? '#ff4848' : gini > 0.25 ? '#FFD700' : '#1de682', fontWeight: 800, fontSize: 18 }}>
                  {gini.toFixed(3)}
                </span>
              </div>
              <div style={{ marginBottom: 6, fontSize: 15, color: '#FFD700' }}>
                Most Concentrated: <b style={{ color: brand.gold }}>{imbalanceClub.name}</b> ({imbalanceClub.players} players)
              </div>
              <div style={{ marginBottom: 8, fontSize: 15, color: '#1de682' }}>
                Max: <b>{maxPlayers}</b> | Min: <b>{minPlayers}</b>
              </div>
              <div style={{ color: brand.gold, fontWeight: 600 }}>Top Risks & Opportunities</div>
              <ul style={{ margin: 0, padding: 0, color: '#ff4848', fontSize: 15, listStyle: 'inside disc' }}>
                {alerts.map((txt, idx) => <li key={idx}>{txt}</li>)}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Advanced Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{ background: '#232a2e', borderRadius: 19, padding: 32, marginTop: 6 }}>
          <h3 style={{ color: brand.gold, fontWeight: 700, fontSize: 21, marginBottom: 15 }}>Advanced Equity & Distribution Analytics</h3>
          <table style={{ width: '100%', fontSize: 17, color: '#fff', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: brand.gold, borderBottom: '2px solid #FFD70077' }}>
                <th>Club</th>
                <th>Region</th>
                <th>Players</th>
                <th>Tag</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club, i) => (
                <tr key={club.id} style={{ borderBottom: '1px solid #FFD70022' }}>
                  <td>{club.name}</td>
                  <td>{club.region}</td>
                  <td>{club.players}</td>
                  <td>{getClubTag(club, clubs)}</td>
                  <td>{((club.players / clubs.reduce((s, c) => s + c.players, 0)) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 19, fontSize: 16, color: '#1de682', fontWeight: 600 }}>
            <FaStar style={{ color: brand.gold, marginRight: 7 }} />
            Dominance Index: <span style={{ color: '#FFD700', fontWeight: 700 }}>{dominance.toFixed(2)}</span>
            &nbsp;| Top 1/3 Clubs Hold: <span style={{ color: '#FFD700', fontWeight: 700 }}>{top33.toFixed(1)}%</span>
          </div>
          <div style={{ marginTop: 15, color: '#FFD700', fontWeight: 600 }}>
            Minimum Competitive Threshold: <span style={{ color: '#1de682' }}>8 players</span>
            &nbsp;| Number of At-Risk Clubs: <span style={{ color: '#ff4848', fontWeight: 700 }}>{clubs.filter(c => c.players < 8).length}</span>
          </div>
        </div>
      )}

      {/* Trend Tab */}
      {activeTab === 'trend' && (
        <div style={{ background: '#283E51', borderRadius: 18, padding: 30 }}>
          <h3 style={{ color: brand.gold, fontWeight: 700, fontSize: 21, marginBottom: 17 }}>Equity Trend (Gini Index Over Time/Scenarios)</h3>
          <ResponsiveContainer width="99%" height={200}>
            <LineChart data={giniTrend.map((g, i) => ({ step: i + 1, gini: g }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" label={{ value: "Scenario Step", position: "insideBottomRight", offset: 0 }} stroke="#FFD700" />
              <YAxis stroke="#1de682" domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gini" stroke="#FFD700" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 20, color: '#FFD700', fontWeight: 700, fontSize: 16 }}>
            Last 3 Scenario Steps:
            {giniTrend.slice(-3).map((g, idx) => (
              <span key={idx} style={{ marginLeft: 17, color: g > 0.40 ? '#ff4848' : g > 0.25 ? '#FFD700' : '#1de682' }}>
                {g.toFixed(3)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CRUD, Scenario, Export */}
      <div style={{
        display: 'flex', flexDirection: 'row', gap: 34, margin: '29px 0 15px 0', alignItems: 'flex-start', flexWrap: 'wrap'
      }}>
        {/* CRUD */}
        <div style={{ flex: 1, background: '#232a2e', borderRadius: 15, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: brand.gold, marginBottom: 7 }}>
            Manage Clubs & Players <FaPlus style={{ marginLeft: 7, fontSize: 16 }} />
          </div>
          <table style={{ width: '100%', color: '#fff', fontSize: 16, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: brand.gold }}>
                <th style={{ textAlign: 'left', padding: 4 }}>Club</th>
                <th>Region</th>
                <th>Players</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clubs.map(club => (
                <tr key={club.id} style={{ borderBottom: '1px solid #FFD70033' }}>
                  <td style={{ padding: 4 }}>{club.name}</td>
                  <td>{club.region}</td>
                  <td>{club.players}</td>
                  <td>
                    <button onClick={() => setSelected(club)} style={{
                      background: 'none', color: brand.green, border: 'none', cursor: 'pointer'
                    }}><FaEdit /></button>
                    <button onClick={() => deleteClub(club.id)} style={{
                      background: 'none', color: '#ff4848', border: 'none', cursor: 'pointer', marginLeft: 8
                    }}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Add/Edit form */}
          <div style={{ marginTop: 12 }}>
            <form onSubmit={e => {
              e.preventDefault();
              const form = e.target;
              const club = {
                name: form.name.value,
                region: form.region.value,
                players: Number(form.players.value),
                id: selected ? selected.id : undefined
              };
              if (selected) updateClub(club);
              else addClub(club);
              form.reset();
            }}>
              <input name="name" placeholder="Club Name" required defaultValue={selected?.name || ""} style={{
                marginRight: 7, padding: 5, borderRadius: 7, border: '1px solid #FFD70077', fontSize: 15
              }} />
              <input name="region" placeholder="Region" required defaultValue={selected?.region || ""} style={{
                marginRight: 7, padding: 5, borderRadius: 7, border: '1px solid #1de68277', fontSize: 15
              }} />
              <input name="players" placeholder="Players" type="number" min={1} required defaultValue={selected?.players || ""} style={{
                marginRight: 7, padding: 5, borderRadius: 7, border: '1px solid #FFD70077', width: 80, fontSize: 15
              }} />
              <button type="submit" style={{
                background: brand.gold, color: '#222', border: 'none', borderRadius: 6,
                padding: '6px 16px', fontWeight: 700, fontSize: 15, marginRight: 7
              }}>
                {selected ? "Update" : "Add"}
              </button>
              {selected &&
                <button type="button" onClick={() => setSelected(null)} style={{
                  background: '#ff4848', color: '#fff', border: 'none', borderRadius: 6,
                  padding: '6px 14px', fontWeight: 700, fontSize: 15
                }}>Cancel</button>
              }
            </form>
          </div>
        </div>
        {/* Scenario/Move Player & Scenario Save/Load */}
        <div style={{ flex: 1, background: '#232a2e', borderRadius: 15, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: brand.gold, marginBottom: 7 }}>
            Talent Mobility Scenario <FaArrowUp style={{ marginLeft: 7, fontSize: 16 }} />
          </div>
          <form onSubmit={e => {
            e.preventDefault();
            const fromId = Number(e.target.from.value);
            const toId = Number(e.target.to.value);
            movePlayer(fromId, toId);
          }}>
            <span style={{ color: '#fff', marginRight: 9 }}>Move 1 player from</span>
            <select name="from" required style={{
              marginRight: 7, padding: 6, borderRadius: 6, border: '1px solid #FFD70077', fontSize: 15
            }}>
              {clubs.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
            <span style={{ color: '#fff', marginRight: 7 }}>to</span>
            <select name="to" required style={{
              marginRight: 7, padding: 6, borderRadius: 6, border: '1px solid #1de68277', fontSize: 15
            }}>
              {clubs.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" style={{
              background: brand.green, color: '#222', border: 'none', borderRadius: 6,
              padding: '6px 15px', fontWeight: 700, fontSize: 15
            }}>Simulate</button>
          </form>
          <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
            <button onClick={undo} disabled={history.length <= 1} style={{
              background: '#FFD700', color: '#222', border: 'none', borderRadius: 6, padding: '6px 15px',
              fontWeight: 700, fontSize: 15, opacity: history.length <= 1 ? 0.6 : 1
            }}><FaUndo style={{ marginRight: 7 }} /> Undo</button>
            <button onClick={redo} disabled={redoStack.length === 0} style={{
              background: '#FFD700', color: '#222', border: 'none', borderRadius: 6, padding: '6px 15px',
              fontWeight: 700, fontSize: 15, opacity: redoStack.length === 0 ? 0.6 : 1
            }}><FaRedo style={{ marginRight: 7 }} /> Redo</button>
            <button onClick={exportCSV} style={{
              background: brand.green, color: '#222', border: 'none', borderRadius: 6, padding: '6px 15px',
              fontWeight: 700, fontSize: 15
            }}><FaFileExport style={{ marginRight: 7 }} /> Export CSV</button>
            <button onClick={exportPDF} style={{
              background: brand.gold, color: '#232a2e', border: 'none', borderRadius: 6, padding: '6px 15px',
              fontWeight: 700, fontSize: 15
            }}><FaFileExport style={{ marginRight: 7 }} /> Export PDF</button>
          </div>
          <div style={{ marginTop: 17 }}>
            <button onClick={saveScenario} style={{
              background: '#1de682', color: '#232a2e', border: 'none', borderRadius: 6,
              padding: '6px 14px', fontWeight: 700, fontSize: 15, marginRight: 7
            }}><FaSave style={{ marginRight: 7 }} /> Save Scenario</button>
            {savedScenarios.length > 0 && (
              <span style={{ color: brand.gold, fontWeight: 600, fontSize: 15 }}>
                Load:
                {savedScenarios.map((sc, idx) =>
                  <button key={idx} onClick={() => loadScenario(idx)} style={{
                    background: '#FFD700', color: '#232a2e', fontWeight: 700, border: 'none', borderRadius: 6, padding: '3px 10px', marginLeft: 8
                  }}><FaFolderOpen style={{ marginRight: 4 }} />{sc.name}</button>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 14, color: '#FFD70088', textAlign: 'right', fontWeight: 600 }}>
        Powered by CourtEvo Vero proprietary analytics. All rights reserved.
      </div>
    </div>
  );
};

export default TalentConcentrationEquityVisualizer;
