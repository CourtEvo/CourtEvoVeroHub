// src/components/StrategicAlignmentScenarioBoard.jsx
import React, { useState } from 'react';
import {
  FaBullseye, FaExchangeAlt, FaUndo, FaRedo, FaFileExport, FaLink, FaExclamationTriangle,
  FaCheckCircle, FaChartLine, FaProjectDiagram, FaCogs, FaUserTie, FaHistory, FaSave, FaFolderOpen, FaChevronRight
} from 'react-icons/fa';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip as ReTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend
} from 'recharts';

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };

// --- DEMO DATA ---
const demoData = [
  { id: 1, area: "Player Pathway", board: 9, ops: 8, coach: 7, player: 6 },
  { id: 2, area: "Coach Development", board: 10, ops: 7, coach: 8, player: 7 },
  { id: 3, area: "Club Culture", board: 8, ops: 6, coach: 5, player: 6 },
  { id: 4, area: "Performance KPIs", board: 9, ops: 8, coach: 6, player: 5 },
  { id: 5, area: "Facilities", board: 7, ops: 5, coach: 7, player: 7 },
];

// --- ANALYTICS ---
function calcAlignment(row) {
  const vals = [row.board, row.ops, row.coach, row.player];
  return 10 - (Math.max(...vals) - Math.min(...vals));
}
function overallAlignment(matrix) {
  const scores = matrix.map(calcAlignment);
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
function colorAlignment(score) {
  return score < 6 ? "#ff4848" : score < 7.5 ? "#FFD700" : "#1de682";
}
function analyzeMisalignment(row) {
  // Consulting "root causes" and recommendations
  const vals = [row.board, row.ops, row.coach, row.player];
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const keys = ["board", "ops", "coach", "player"];
  const outliers = keys.filter((k, i) => row[k] === max || row[k] === min);
  let recs = [];
  if (row.board - row.coach >= 3) recs.push("Board priorities diverge from coach implementation. Facilitate alignment meeting and align KPIs.");
  if (row.player < 6 && row.board > 8) recs.push("Players disengaged vs. board vision. Recommend player feedback forum and bottom-up pathway mapping.");
  if (row.ops < 6) recs.push("Operational execution weak: audit process and clarify accountability.");
  if (row.coach < 6 && row.ops > 8) recs.push("Coach buy-in low. Invest in coach upskilling and engage in scenario co-design.");
  if (recs.length === 0) recs.push("Review strategic area in detail for hidden frictions.");
  return { outliers, recs };
}

function alignmentDelta(base, compare) {
  // Compare two scenario matrices by area
  return base.map((row, idx) => ({
    area: row.area,
    base: calcAlignment(row),
    compare: calcAlignment(compare[idx] || {}),
    diff: (calcAlignment(compare[idx] || {}) - calcAlignment(row))
  }));
}

// --- MAIN COMPONENT ---
const StrategicAlignmentScenarioBoard = () => {
  const [matrix, setMatrix] = useState(demoData);
  const [history, setHistory] = useState([demoData]);
  const [redoStack, setRedoStack] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [trend, setTrend] = useState([overallAlignment(demoData)]);
  const [activeTab, setActiveTab] = useState('board');
  const [showDrilldown, setShowDrilldown] = useState(null);
  const [compareIdx, setCompareIdx] = useState(null);

  // --- CRUD/SCENARIO LOGIC ---
  const updateCell = (id, key, val) => {
    if (val > 10 || val < 1) return;
    const next = matrix.map(row => row.id === id ? { ...row, [key]: val } : row);
    setHistory([...history, next]);
    setMatrix(next);
    setRedoStack([]);
    setTrend([...trend, overallAlignment(next)]);
  };
  const undo = () => {
    if (history.length <= 1) return;
    setRedoStack([matrix, ...redoStack]);
    const prev = history[history.length - 2];
    setMatrix(prev);
    setHistory(history.slice(0, -1));
    setTrend(trend.slice(0, -1));
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    setHistory([...history, redoStack[0]]);
    setMatrix(redoStack[0]);
    setRedoStack(redoStack.slice(1));
    setTrend([...trend, overallAlignment(redoStack[0])]);
  };
  // --- SCENARIO SAVE/LOAD ---
  const saveScenario = () => {
    if (!scenarioName) return;
    setSavedScenarios([...savedScenarios, {
      name: scenarioName,
      matrix: JSON.parse(JSON.stringify(matrix)),
      trend: [...trend]
    }]);
    setScenarioName('');
  };
  const loadScenario = idx => {
    setMatrix(savedScenarios[idx].matrix);
    setHistory([...history, savedScenarios[idx].matrix]);
    setRedoStack([]);
    setTrend(savedScenarios[idx].trend);
    setCompareIdx(null);
  };
  // --- EXPORT CSV (PDF via back-end) ---
  const exportCSV = () => {
    const csv = [
      "Area,Board,Ops,Coach,Player,AlignmentScore"
    ].concat(matrix.map(row =>
      `${row.area},${row.board},${row.ops},${row.coach},${row.player},${calcAlignment(row).toFixed(2)}`
    )).join('\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "strategic_alignment.csv";
    a.click(); URL.revokeObjectURL(url);
  };
  // --- ALIGNMENT/ANALYTICS ---
  const alignmentScores = matrix.map(calcAlignment);
  const meanAlignment = overallAlignment(matrix);
  const misaligned = matrix.filter(row => calcAlignment(row) < 6);

  // --- HEATMAP COLOR ---
  const colorCell = (val, base) => ({
    background: val === Math.max(...base) ? '#FFD70055'
      : val === Math.min(...base) ? '#ff484855'
      : '#232a2e', color: "#fff", fontWeight: 700, borderRadius: 7
  });

  // --- BOARDROOM COPY ---
  const boardroomRec = () => {
    if (meanAlignment < 6.5) return "Warning: Your organizational objectives are misaligned. Immediate cross-functional strategic sessions recommended.";
    if (meanAlignment < 7.5) return "Caution: Alignment could be improved. Focus on areas with the lowest scores.";
    return "All key areas are strongly aligned. Continue scenario-testing for resilience.";
  };

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1320, margin: "0 auto"
    }}>
      {/* Boardroom Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <FaProjectDiagram size={30} color={brand.gold} />
        <span style={{ fontWeight: 900, fontSize: 27, color: brand.gold, letterSpacing: 2 }}>Strategic Alignment Scenario Board</span>
        <span style={{
          background: '#FFD700', color: '#232a2e', fontWeight: 700, borderRadius: 8,
          padding: '2px 15px', fontSize: 14, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022'
        }}>
          Boardroom Alignment Engine | CourtEvo Vero
        </span>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 18, margin: '22px 0 10px 0' }}>
        {[
          { key: "board", label: <><FaChartLine style={{ marginRight: 7 }} /> Alignment Matrix</> },
          { key: "trend", label: <><FaHistory style={{ marginRight: 7 }} /> Alignment Trend</> },
          { key: "compare", label: <><FaExchangeAlt style={{ marginRight: 7 }} /> Scenario Compare</> }
        ].map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? brand.gold : brand.accent,
              color: activeTab === tab.key ? '#222' : '#fff',
              fontWeight: 700, border: 'none', borderRadius: 13,
              fontSize: 15, padding: '8px 28px', cursor: 'pointer',
              boxShadow: activeTab === tab.key ? '0 2px 14px #FFD70033' : 'none'
            }}>
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab: Alignment Matrix/Heatmap */}
      {activeTab === 'board' && (
        <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
          {/* Left: Matrix Table + Heatmap */}
          <div style={{ flex: 1.7, minWidth: 410, background: "#283E51", borderRadius: 18, padding: 18 }}>
            <h3 style={{ color: brand.gold, fontWeight: 700, fontSize: 18 }}>Alignment Heatmap</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 16, textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ color: brand.gold }}>Area</th>
                  <th>Board</th>
                  <th>Ops</th>
                  <th>Coach</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Drilldown</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map(row => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #FFD70022" }}>
                    <td style={{ fontWeight: 700, color: brand.gold }}>{row.area}</td>
                    {["board", "ops", "coach", "player"].map(key => (
                      <td key={key} style={colorCell(row[key], [row.board, row.ops, row.coach, row.player])}>
                        <input type="number" min={1} max={10} value={row[key]} style={{
                          width: 40, border: "1px solid #FFD70077", borderRadius: 6, padding: 4, background: "transparent", color: "#fff", fontWeight: 700, textAlign: 'center'
                        }}
                          onChange={e => updateCell(row.id, key, Number(e.target.value))}
                        />
                      </td>
                    ))}
                    <td style={{ color: colorAlignment(calcAlignment(row)), fontWeight: 800 }}>
                      {calcAlignment(row).toFixed(2)}
                    </td>
                    <td>
                      <button onClick={() => setShowDrilldown(showDrilldown === row.id ? null : row.id)} style={{
                        background: "#FFD700", border: "none", borderRadius: 6, color: "#232a2e", fontWeight: 700, padding: "3px 9px", cursor: "pointer"
                      }}>
                        <FaChevronRight /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Drilldown Panels */}
            {showDrilldown && (() => {
              const row = matrix.find(r => r.id === showDrilldown);
              const drill = analyzeMisalignment(row);
              return (
                <div style={{
                  marginTop: 17, background: "#232a2e", borderRadius: 13, padding: 17, color: "#FFD700", fontWeight: 700, fontSize: 16
                }}>
                  <div>
                    <FaExclamationTriangle color="#ff4848" style={{ marginRight: 5 }} />
                    <span>Root Cause Analysis for <b>{row.area}</b>:</span>
                  </div>
                  <div style={{ color: "#1de682", fontWeight: 700, margin: "7px 0" }}>
                    Outlier Stakeholders: {drill.outliers.join(", ").toUpperCase()}
                  </div>
                  <div style={{ color: "#FFD700", marginTop: 9, marginBottom: 8 }}>
                    Recommendations:
                    <ul style={{ color: "#FFD700", fontWeight: 600 }}>
                      {drill.recs.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
          {/* Right: Analytics + Actions */}
          <div style={{ flex: 1, minWidth: 330, background: "#232a2e", borderRadius: 16, padding: 15 }}>
            <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 8 }}>Alignment Analytics</h4>
            <div style={{ marginBottom: 8, color: "#FFD700", fontWeight: 700 }}>
              Mean Alignment Score: <span style={{ color: colorAlignment(meanAlignment) }}>{meanAlignment.toFixed(2)}</span>
            </div>
            <ResponsiveContainer width="100%" height={135}>
              <RadarChart cx="50%" cy="50%" outerRadius={55} data={matrix}>
                <PolarGrid />
                <PolarAngleAxis dataKey="area" stroke="#FFD700" />
                <PolarRadiusAxis angle={30} domain={[1, 10]} />
                <Radar name="Board" dataKey="board" stroke="#FFD700" fill="#FFD700" fillOpacity={0.19} />
                <Radar name="Ops" dataKey="ops" stroke="#1de682" fill="#1de682" fillOpacity={0.13} />
                <Radar name="Coach" dataKey="coach" stroke="#c2b280" fill="#c2b280" fillOpacity={0.11} />
                <Radar name="Player" dataKey="player" stroke="#485563" fill="#485563" fillOpacity={0.11} />
                <Legend />
                <ReTooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ margin: "18px 0 0 0", color: "#FFD700", fontWeight: 600 }}>Scenario Tools:</div>
            <div style={{ display: "flex", gap: 8, margin: "11px 0" }}>
              <button onClick={undo} style={btnStyle}><FaUndo /> Undo</button>
              <button onClick={redo} style={btnStyle}><FaRedo /> Redo</button>
              <button onClick={exportCSV} style={{ ...btnStyle, background: brand.green, color: "#232a2e" }}><FaFileExport /> Export CSV</button>
            </div>
            <div style={{ margin: "10px 0" }}>
              <input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Scenario Name"
                style={{ borderRadius: 6, padding: 5, border: "1px solid #FFD70077", fontWeight: 700, marginRight: 7, background: "#181e23", color: "#fff" }} />
              <button onClick={saveScenario} style={{ ...btnStyle, background: brand.gold, color: "#232a2e" }}><FaSave /> Save</button>
              {savedScenarios.length > 0 && (
                <span style={{ color: brand.gold, fontWeight: 600, fontSize: 14, marginLeft: 6 }}>
                  Load:
                  {savedScenarios.map((sc, idx) =>
                    <button key={idx} onClick={() => loadScenario(idx)} style={{
                      background: '#FFD700', color: '#232a2e', fontWeight: 700, border: 'none', borderRadius: 6, padding: '3px 8px', marginLeft: 5
                    }}><FaFolderOpen style={{ marginRight: 4 }} />{sc.name}</button>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Tab: Alignment Trend */}
      {activeTab === "trend" && (
        <div style={{ background: "#283E51", borderRadius: 18, padding: 30 }}>
          <h3 style={{ color: brand.gold, fontWeight: 700, fontSize: 21, marginBottom: 17 }}>Alignment Evolution (Scenario Steps)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend.map((score, i) => ({ step: i + 1, score }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" label={{ value: "Scenario Step", position: "insideBottomRight", offset: 0 }} stroke="#FFD700" />
              <YAxis stroke="#1de682" domain={[1, 10]} />
              <ReTooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#FFD700" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 20, color: '#FFD700', fontWeight: 700, fontSize: 16 }}>
            Last 3 Steps: {trend.slice(-3).map((g, idx) =>
              <span key={idx} style={{ marginLeft: 17, color: colorAlignment(g) }}>{g.toFixed(2)}</span>
            )}
          </div>
        </div>
      )}
      {/* Tab: Scenario Compare */}
      {activeTab === "compare" && savedScenarios.length > 1 && (
        <div style={{ background: "#232a2e", borderRadius: 18, padding: 30 }}>
          <h3 style={{ color: brand.gold, fontWeight: 700, fontSize: 21, marginBottom: 17 }}>Scenario Comparison</h3>
          <div>
            <span style={{ color: "#FFD700", fontWeight: 600, marginRight: 9 }}>Base:</span>
            <select onChange={e => setCompareIdx(Number(e.target.value))} style={{
              background: "#FFD700", color: "#232a2e", fontWeight: 700, borderRadius: 6, padding: "4px 12px", fontSize: 15, marginRight: 14
            }}>
              <option value={-1}>-- Choose scenario --</option>
              {savedScenarios.map((sc, idx) =>
                <option key={idx} value={idx}>{sc.name}</option>
              )}
            </select>
            {compareIdx !== null && compareIdx > -1 &&
              <table style={{ width: "99%", fontSize: 16, color: "#fff", borderCollapse: "collapse", marginTop: 18 }}>
                <thead>
                  <tr style={{ color: brand.gold, borderBottom: '2px solid #FFD70077' }}>
                    <th>Area</th>
                    <th>Previous</th>
                    <th>Compare</th>
                    <th>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {alignmentDelta(savedScenarios[0].matrix, savedScenarios[compareIdx].matrix).map((row, i) => (
                    <tr key={row.area} style={{ borderBottom: '1px solid #FFD70022' }}>
                      <td>{row.area}</td>
                      <td>{row.base.toFixed(2)}</td>
                      <td>{row.compare.toFixed(2)}</td>
                      <td style={{
                        color: row.diff < 0 ? "#ff4848" : row.diff > 0 ? "#1de682" : "#FFD700",
                        fontWeight: 700
                      }}>{row.diff > 0 ? "+" : ""}{row.diff.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </div>
      )}
      {/* Boardroom Recommendations */}
      <div style={{
        marginTop: 18, background: "#283E51", borderRadius: 14, padding: 16, color: "#FFD700", fontWeight: 700, fontSize: 15
      }}>
        {misaligned.length === 0
          ? <div><FaCheckCircle color="#1de682" style={{ marginRight: 5 }} /> All strategic areas show healthy alignment. No urgent action needed.</div>
          : (
            <>
              <FaExclamationTriangle color="#ff4848" style={{ marginRight: 8 }} />
              <span>Misalignment Detected in: </span>
              {misaligned.map(row => (
                <span key={row.area} style={{ color: "#ff4848", marginLeft: 6 }}>{row.area} (Score: {calcAlignment(row).toFixed(2)})</span>
              ))}
              <div style={{ color: "#ff4848", fontWeight: 600, marginTop: 8 }}>
                {boardroomRec()}
              </div>
            </>
          )
        }
      </div>
      <div style={{ marginTop: 15, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero boardroom scenario analytics.
      </div>
    </div>
  );
};

const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "6px 13px", marginRight: 6, cursor: "pointer"
};

export default StrategicAlignmentScenarioBoard;
