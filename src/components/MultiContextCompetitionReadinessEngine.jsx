// MultiContextCompetitionReadinessEngine.jsx (ELITE ENRICHED)
import React, { useState } from 'react';
import { FaBolt, FaPlaneDeparture, FaUsers, FaChartPie, FaExclamationTriangle, FaDownload, FaRobot, FaSync, FaHandHoldingHeart, FaArrowUp, FaArrowDown, FaTrophy, FaHistory, FaClipboardList } from 'react-icons/fa';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Fallback Card/Button ---
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

// --- Demo Data ---
const CONTEXTS = ["Home", "Away", "Tournament", "International", "Pressure", "Friendly"];
const RISK_TYPES = ["Injury", "Burnout", "Travel", "Emotional", "Matchup"];
const OPPONENTS = [
  { name: "Dinamo", power: [85, 83, 88, 82, 87, 86], crowd: 90, travel: 0 },
  { name: "Split", power: [81, 78, 81, 77, 85, 80], crowd: 80, travel: 15 },
  { name: "Cedevita", power: [90, 89, 91, 93, 94, 90], crowd: 95, travel: 20 }
];
const ATHLETES = [
  {
    id: 1, name: "Luka Vuković", readiness: [85, 78, 77, 72, 69, 90],
    risk: [0.13, 0.07, 0.04, 0.08, 0.12], timeline: Array.from({length:12},(_,m)=>85-3*m+Math.round(Math.random()*5)), notes: [],
    contextHistory: CONTEXTS.map((_,i)=>Array.from({length:12},()=>80+Math.round(Math.random()*12-6))),
    scenarioLogs: [], matchLogs: []
  },
  {
    id: 2, name: "Ivan Horvat", readiness: [77, 68, 62, 54, 51, 80],
    risk: [0.19, 0.16, 0.12, 0.21, 0.13], timeline: Array.from({length:12},(_,m)=>77-4*m+Math.round(Math.random()*6)), notes: [],
    contextHistory: CONTEXTS.map((_,i)=>Array.from({length:12},()=>70+Math.round(Math.random()*13-6))),
    scenarioLogs: [], matchLogs: []
  },
  {
    id: 3, name: "Marko Jurić", readiness: [93, 91, 87, 89, 85, 96],
    risk: [0.07, 0.09, 0.08, 0.11, 0.06], timeline: Array.from({length:12},(_,m)=>93-1.5*m+Math.round(Math.random()*4)), notes: [],
    contextHistory: CONTEXTS.map((_,i)=>Array.from({length:12},()=>89+Math.round(Math.random()*9-4))),
    scenarioLogs: [], matchLogs: []
  },
  {
    id: 4, name: "Petar Božić", readiness: [59, 55, 53, 48, 50, 61],
    risk: [0.31, 0.18, 0.12, 0.29, 0.19], timeline: Array.from({length:12},(_,m)=>59-4*m+Math.round(Math.random()*6)), notes: [],
    contextHistory: CONTEXTS.map((_,i)=>Array.from({length:12},()=>53+Math.round(Math.random()*13-7))),
    scenarioLogs: [], matchLogs: []
  },
  {
    id: 5, name: "Kristijan Pavlović", readiness: [89, 84, 80, 81, 80, 92],
    risk: [0.10, 0.08, 0.06, 0.11, 0.09], timeline: Array.from({length:12},(_,m)=>89-2*m+Math.round(Math.random()*6)), notes: [],
    contextHistory: CONTEXTS.map((_,i)=>Array.from({length:12},()=>84+Math.round(Math.random()*11-6))),
    scenarioLogs: [], matchLogs: []
  }
];
const EVENTS = [
  { id: 1, label: "Home vs. Dinamo", context: 0, opponent: 0, date: "2025-07-18" },
  { id: 2, label: "Away @ Split", context: 1, opponent: 1, date: "2025-07-21" },
  { id: 3, label: "Tournament Final vs. Cedevita", context: 2, opponent: 2, date: "2025-07-28" },
  { id: 4, label: "Intl Friendly", context: 3, opponent: 2, date: "2025-08-04" },
  { id: 5, label: "High Pressure Playoff", context: 4, opponent: 0, date: "2025-08-11" }
];

// --- Utility ---
function getRiskLabel(val) {
  if (val > 0.25) return { label: "Critical", color: "#FF4848" };
  if (val > 0.12) return { label: "Elevated", color: "#FFD700" };
  return { label: "Low", color: "#1de682" };
}
function getReadinessStatus(val) {
  if (val >= 90) return { label: "Peak", color: "#1de682" };
  if (val >= 80) return { label: "Ready", color: "#FFD700" };
  if (val >= 70) return { label: "Fair", color: "#22df82" };
  return { label: "At Risk", color: "#FF4848" };
}
function getPercentile(val, arr) {
  let sorted = [...arr].sort((a,b)=>a-b);
  let idx = sorted.findIndex(x => val <= x);
  return Math.round(100*(1-idx/(arr.length-1)));
}
function contextRec(idx, arr) {
  // Dynamic recs per context weakness
  if(arr[idx]>=90) return "No adjustment—full readiness.";
  if(arr[idx]>=80) return "Maintain intensity, small stress block.";
  if(arr[idx]>=70) return "Add scenario training, emotional prep.";
  if(arr[idx]>=60) return "Recovery+; simulate crowd/travel, tactical session.";
  return "High risk—adjust lineup, additional support and focus.";
}
function AIrecommendations(event, contextReadiness) {
  // Three actions for context
  const idx = event.context;
  if(contextReadiness[idx]<70) return [
    "Increase scenario-based drills in next 2 sessions.",
    "Schedule recovery block 24h pre-event.",
    "Provide leadership role for most stable athlete."
  ];
  if(contextReadiness[idx]<80) return [
    "Add quick response exercises.",
    "Simulate pressure—practice with crowd noise.",
    "Extra nutrition and sleep checks."
  ];
  return [
    "Keep current routine.",
    "Pre-event team meeting: reinforce confidence.",
    "Monitor for overconfidence; avoid unnecessary changes."
  ];
}

// --- Main Component ---
const MultiContextCompetitionReadinessEngine = () => {
  const [athletes, setAthletes] = useState(ATHLETES);
  const [selected, setSelected] = useState(athletes[0]);
  const [tab, setTab] = useState('athlete');
  const [eventIdx, setEventIdx] = useState(0);
  const [scenario, setScenario] = useState({ key: null, changes: [0,0,0,0,0,0], label:"", logs: [] });
  const [removed, setRemoved] = useState([]); // Lineup simulation

  // --- Scenario Simulation ---
  const handleScenario = (key, label) => {
    let changes = [0,0,0,0,0,0];
    if (key === 'stress') changes = [-7,-7,-10,-10,-12,-4];
    if (key === 'travel') changes = [0,-10,-10,-12,-8,0];
    if (key === 'keyout') changes = [-14,-9,-16,-10,-13,-7];
    if (key === 'allgood') changes = [0,0,0,0,0,0];
    setScenario({ key, changes, label, logs: [...scenario.logs, { key, label, date: new Date().toLocaleString() }] });
  };
  // Save scenario with AI recs
  const handleSaveScenario = () => {
    const label = prompt("Scenario name/description:");
    if (!label) return;
    handleScenario(scenario.key, label);
  };
  // Reset scenario
  const resetScenario = () => setScenario({ key: null, changes: [0,0,0,0,0,0], label:"", logs: [] });

  // --- Lineup simulation ---
  const toggleRemove = id => setRemoved(
    removed.includes(id) ? removed.filter(r=>r!==id) : [...removed, id]
  );

  // --- Team for event
  const event = EVENTS[eventIdx];
  const context = event.context;
  const team = athletes.filter(a => !removed.includes(a.id));
  const teamContextReadiness = team.map(a=>a.readiness[context] + scenario.changes[context]);
  const avgTeamReadiness = Math.round(teamContextReadiness.reduce((x,y)=>x+y,0)/teamContextReadiness.length);

  // --- Club-level analytics
  const clubHeatmap = CONTEXTS.map((ctx,ci)=>({
    context: ctx,
    avg: Math.round(athletes.map(a=>a.readiness[ci]).reduce((x,y)=>x+y,0)/athletes.length)
  }));

  // --- Export (PDF/print)
  const handleExport = () => { window.print(); };

  // --- Visuals/Best/Worst
  const best = athletes.reduce((a,b)=> a.readiness[context]>b.readiness[context]?a:b);
  const worst = athletes.reduce((a,b)=> a.readiness[context]<b.readiness[context]?a:b);

  return (
    <div style={{ padding: 24 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 8 }}>
        <Button onClick={() => setTab('athlete')} style={{ background: tab==='athlete'?'#FFD700':'#1de682', color: tab==='athlete'?'#181e23':'#232', fontWeight:900 }}>Athlete</Button>
        <Button onClick={() => setTab('team')} style={{ background: tab==='team'?'#FFD700':'#1de682', color: tab==='team'?'#181e23':'#232', fontWeight:900 }}>Team/Matchup</Button>
        <Button onClick={() => setTab('scenario')} style={{ background: tab==='scenario'?'#FFD700':'#1de682', color: tab==='scenario'?'#181e23':'#232', fontWeight:900 }}>Scenario Lab</Button>
        <Button onClick={() => setTab('report')} style={{ background: tab==='report'?'#FFD700':'#1de682', color: tab==='report'?'#181e23':'#232', fontWeight:900 }}>Club Report</Button>
      </div>
      <AnimatePresence>
      {/* ATHLETE TAB */}
      {tab==='athlete' && selected && (
        <motion.div key="athlete" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaBolt style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            COMPETITION READINESS: ATHLETE PROFILE
          </h2>
          <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
            {/* Athlete List */}
            <Card style={{ minWidth: 210, background: "#202a38" }}>
              <CardContent>
                <div style={{ fontWeight: 700, marginBottom: 12, color: "#FFD700", fontSize: 18 }}>Athletes</div>
                <div>
                  {athletes.map(a => (
                    <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div onClick={() => setSelected(a)} style={{
                        background: selected.id === a.id ? "#FFD70033" : "none",
                        color: selected.id === a.id ? "#FFD700" : "#fff",
                        padding: "8px 10px",
                        fontWeight: 600,
                        borderRadius: 10,
                        marginBottom: 4,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: selected.id === a.id ? "2px solid #FFD700" : "1px solid #293949"
                      }}>
                        <span>
                          <FaPlaneDeparture style={{ marginRight: 6, fontSize: 16, verticalAlign: "middle" }} />
                          {a.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Radar/Context */}
            <Card style={{ minWidth: 370, background: "#182433", color: "#fff", flex: 1 }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 6 }}>Readiness by Context</div>
                <ResponsiveContainer width="100%" height={190}>
                  <RadarChart cx="50%" cy="50%" outerRadius={85} data={CONTEXTS.map((ctx, i) => ({
                    context: ctx,
                    readiness: selected.readiness[i],
                  }))}>
                    <PolarGrid stroke="#FFD70033" />
                    <PolarAngleAxis dataKey="context" tick={{ fill: "#FFD700", fontWeight: 700, fontSize: 14 }} />
                    <PolarRadiusAxis angle={30} domain={[40,100]} tick={{ fill: "#1de682", fontWeight: 700 }} />
                    <Radar name="Readiness" dataKey="readiness" stroke="#1de682" fill="#1de682" fillOpacity={0.17} />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginTop: 10 }}>
                  Readiness Status: <span style={{ color: getReadinessStatus(selected.readiness[context]).color, fontWeight:900 }}>
                    {getReadinessStatus(selected.readiness[context]).label}
                  </span>
                </div>
                <div style={{ marginTop: 9, color: "#FFD700", fontWeight:700 }}>
                  Percentile (context): <span style={{ color:"#1de682" }}>
                    {getPercentile(selected.readiness[context], athletes.map(a=>a.readiness[context]))}%
                  </span>
                </div>
                <div style={{ marginTop: 7, color: "#FFD700", fontWeight:600 }}>
                  Recommendation: <span style={{ color:"#1de682", fontWeight:700 }}>{contextRec(context, selected.readiness)}</span>
                </div>
              </CardContent>
            </Card>
            {/* Risk overlays */}
            <Card style={{ minWidth: 260, background: "#181e23", color: "#fff" }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 10 }}>Risk Overlays</div>
                <ul style={{ fontWeight:700, fontSize:15 }}>
                  {RISK_TYPES.map((r, idx) => (
                    <li key={r} style={{ color: getRiskLabel(selected.risk[idx]).color }}>
                      {r}: {getRiskLabel(selected.risk[idx]).label}
                      {selected.risk[idx]>0.25 && <FaExclamationTriangle style={{ color:"#FF4848", marginLeft:6 }}/>}
                      {selected.risk[idx]<0.09 && <FaArrowUp style={{ color:"#1de682", marginLeft:6 }}/>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {/* Athlete Timeline */}
            <Card style={{ minWidth: 260, background: "#181e23", color: "#fff" }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 7 }}>Readiness Timeline</div>
                <ResponsiveContainer width="100%" height={72}>
                  <LineChart data={selected.timeline.map((val,i)=>({month:i+1,Readiness:val}))}>
                    <Line type="monotone" dataKey="Readiness" stroke="#1de682" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 9, color:"#FFD700", fontWeight:600 }}>
                  {selected.timeline[11]>selected.timeline[0] ? <FaArrowUp style={{ color:"#1de682" }}/> : <FaArrowDown style={{ color:"#FF4848" }}/>} 
                  {selected.timeline[11]>selected.timeline[0] ? "Improving" : "Declining"}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* TEAM/MATCHUP TAB */}
      {tab==='team' && (
        <motion.div key="team" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaChartPie style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            TEAM & MATCHUP READINESS
          </h2>
          <Card style={{ background: "#232b39", minWidth:700 }}>
            <CardContent>
              <div style={{ fontWeight:800, color:"#FFD700", fontSize:20, marginBottom:12 }}>
                Event: 
                <select value={eventIdx} onChange={e=>setEventIdx(Number(e.target.value))} style={{
                  marginLeft:10, fontSize:16, borderRadius:6, border:'1.3px solid #FFD700', padding:'2px 8px'
                }}>
                  {EVENTS.map((ev,i)=> <option value={i} key={ev.id}>{ev.label}</option>)}
                </select>
                <span style={{ marginLeft:18, color:"#FFD700", fontWeight:700 }}>{event.date}</span>
              </div>
              {/* Opponent Info */}
              <div style={{ color:"#FFD700", fontWeight:700, marginBottom:8 }}>
                Opponent: <span style={{ color:"#FFD700", fontWeight:700 }}>{OPPONENTS[event.opponent].name}</span>
                | Crowd Risk: <span style={{ color: OPPONENTS[event.opponent].crowd>90 ? "#FF4848" : "#FFD700" }}>{OPPONENTS[event.opponent].crowd}</span>
                | Travel: <span style={{ color: OPPONENTS[event.opponent].travel>15 ? "#FF4848" : "#1de682" }}>{OPPONENTS[event.opponent].travel}km</span>
              </div>
              {/* Lineup Simulation */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ color:"#FFD700", fontWeight:700 }}>Lineup: </span>
                {athletes.map(a=>(
                  <span
                    key={a.id}
                    style={{
                      textDecoration: removed.includes(a.id) ? "line-through" : "none",
                      color: removed.includes(a.id) ? "#FF4848" : "#1de682",
                      marginRight: 10,
                      cursor: "pointer"
                    }}
                    onClick={()=>toggleRemove(a.id)}
                    title={removed.includes(a.id) ? "Add back to lineup" : "Remove from lineup"}
                  >
                    {a.name}
                  </span>
                ))}
              </div>
              {/* Matchup matrix */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop:6 }}>
                <thead>
                  <tr>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Athlete</th>
                    <th style={{ color: "#1de682", fontWeight: 700 }}>Readiness</th>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((a, idx) => (
                    <tr key={a.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{a.name}</td>
                      <td style={{ color: getReadinessStatus(a.readiness[context] + scenario.changes[context]).color }}>
                        {a.readiness[context] + scenario.changes[context]}
                      </td>
                      <td style={{ color: getReadinessStatus(a.readiness[context] + scenario.changes[context]).color, fontWeight: 700 }}>
                        {getReadinessStatus(a.readiness[context] + scenario.changes[context]).label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ color:"#FFD700", marginTop: 9 }}>
                Avg Team Readiness: <span style={{ color: getReadinessStatus(avgTeamReadiness).color, fontWeight:800 }}>{avgTeamReadiness}</span>
              </div>
              <div style={{ color:"#FFD700", marginTop:6 }}>
                {avgTeamReadiness<75
                  ? <span>Risk: Team readiness low—AI Rec: increase pre-event tactical, recovery, team confidence.</span>
                  : avgTeamReadiness>90
                  ? <span>AI Rec: Maintain, but avoid overconfidence—no last minute changes.</span>
                  : <span>AI Rec: Focus on scenario training for identified weaknesses.</span>
                }
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* SCENARIO LAB TAB */}
      {tab==='scenario' && (
        <motion.div key="scenario" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaRobot style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            SCENARIO LAB: READINESS SIMULATION
          </h2>
          <Card style={{ background: "#232b39", minWidth:710 }}>
            <CardContent>
              <div style={{ fontWeight:800, color:"#FFD700", fontSize:20, marginBottom:12 }}>
                Simulate: 
                <Button size="sm" style={{ background: "#FF4848", marginLeft: 16 }} onClick={()=>handleScenario('stress','Stress: High travel/pressure')}>+ Stress</Button>
                <Button size="sm" style={{ background: "#1de682", marginLeft: 8 }} onClick={()=>handleScenario('travel','Travel/Jetlag Increase')}>+ Travel</Button>
                <Button size="sm" style={{ background: "#FFD700", marginLeft: 8 }} onClick={()=>handleScenario('keyout','Key Player Out')}>Key Out</Button>
                <Button size="sm" style={{ background: "#FFD700", color:"#222b37", border:'1.3px solid #FFD700', marginLeft: 12 }} onClick={()=>handleScenario('allgood','Full Readiness')}>Reset All Good</Button>
                <Button size="sm" style={{ background: "#232b39", color:"#FFD700", border:'1.3px solid #FFD700', marginLeft: 8 }} onClick={handleSaveScenario}><FaClipboardList/> Save Scenario</Button>
              </div>
              {/* Team radar */}
              <ResponsiveContainer width="100%" height={170}>
                <RadarChart cx="50%" cy="50%" outerRadius={85} data={CONTEXTS.map((ctx, i) => ({
                  context: ctx,
                  readiness: avgTeamReadiness + scenario.changes[i],
                }))}>
                  <PolarGrid stroke="#FFD70033" />
                  <PolarAngleAxis dataKey="context" tick={{ fill: "#FFD700", fontWeight: 700, fontSize: 14 }} />
                  <PolarRadiusAxis angle={30} domain={[40,100]} tick={{ fill: "#1de682", fontWeight: 700 }} />
                  <Radar name="Team Readiness" dataKey="readiness" stroke="#1de682" fill="#1de682" fillOpacity={0.17} />
                </RadarChart>
              </ResponsiveContainer>
              {/* AI recs */}
              <div style={{ color:"#FFD700", fontWeight:700, marginTop:8 }}>
                <FaRobot style={{ color:"#FFD700" }}/> AI Recommendations:
                <ul>
                  {AIrecommendations(event, teamContextReadiness).map((r,i)=><li key={i} style={{color:"#1de682",fontWeight:600}}>{r}</li>)}
                </ul>
              </div>
              {/* Scenario Log */}
              <div style={{ color:"#FFD700", fontWeight:700, marginTop:10 }}>
                Scenario Log:
                <ul>
                  {scenario.logs.map((s, i) => (
                    <li key={i}><FaHistory style={{ marginRight:5 }}/> [{s.date}] {s.label}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* CLUB REPORT TAB */}
      {tab==='report' && (
        <motion.div key="report" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaHandHoldingHeart style={{ marginRight: 12, fontSize: 30, color: "#1de682", verticalAlign: 'middle' }} />
            BOARDROOM READINESS REPORT
          </h2>
          <Card style={{ background: "#232b39", minWidth:970 }}>
            <CardContent>
              <div style={{ fontWeight:800, color:"#FFD700", fontSize:20, marginBottom:12 }}>Full Export (PDF/CSV ready)</div>
              <Button style={{ background: "#FFD700", color: "#23292f", fontWeight: 700, fontSize: 15, borderRadius: 11 }} onClick={handleExport}>
                <FaDownload style={{ marginRight: 6 }} /> Export Boardroom Snapshot (PDF)
              </Button>
              {/* Club heatmap */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18 }}>
                <thead>
                  <tr>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Athlete</th>
                    {CONTEXTS.map(ctx => (
                      <th key={ctx} style={{ color: "#1de682", fontWeight: 700 }}>{ctx}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, idx) => (
                    <tr key={a.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{a.name}</td>
                      {a.readiness.map((val, i) => (
                        <td key={i} style={{
                          color: getReadinessStatus(val).color,
                          fontWeight: val>=90?800:600
                        }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Club context analytics */}
              <div style={{ display:"flex", gap:16, marginTop:18 }}>
                {clubHeatmap.map((ctx, i) => (
                  <Card key={i} style={{ background:"#FFD70022", minWidth:120, textAlign:"center" }}>
                    <div style={{ fontWeight:800, color:"#FFD700" }}>{ctx.context}</div>
                    <div style={{ color:getReadinessStatus(ctx.avg).color, fontWeight:700, fontSize:20 }}>{ctx.avg}</div>
                  </Card>
                ))}
              </div>
              {/* Club summary */}
              <div style={{ marginTop: 18, fontWeight: 700, color: "#FFD700", fontSize: 16 }}>Club Summary</div>
              <div style={{ color: "#1de682", fontWeight: 700 }}>
                Best Readiness: {best.name} ({best.readiness[context]}) | 
                Lowest: {worst.name} ({worst.readiness[context]}) | 
                Matchup: {EVENTS[eventIdx].label} ({EVENTS[eventIdx].date})
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default MultiContextCompetitionReadinessEngine;
