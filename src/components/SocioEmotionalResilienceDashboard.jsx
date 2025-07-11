// SocioEmotionalResilienceDashboard.jsx (ENRICHED VERSION)
import React, { useState } from 'react';
import { FaHeartbeat, FaSmile, FaBurn, FaExclamationTriangle, FaCommentDots, FaUsers, FaChartBar, FaBolt, FaArrowUp, FaDownload, FaClipboardList, FaFire, FaTrophy, FaRobot } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// UI fallback
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
// Monthly engagement, pulse, burnout, incidents over 12 months
const randomArr = (base, range) => Array.from({length: 12}, (_, i) => Math.max(40, Math.min(100, Math.round(base + (Math.random()-0.5)*range))));
const randomBurn = (base) => Array.from({length: 12}, (_, i) => Math.max(0, Math.min(1, Number((base + (Math.random()-0.5)*0.22).toFixed(2)))));

const ATHLETES = [
  {
    id: 1, name: "Luka Vuković", invisible: false,
    engagement: randomArr(90, 10), pulse: randomArr(78, 10), burnout: randomBurn(0.18),
    incidents: [0,0,0,1,1,1,0,0,0,0,0,0], bounceBack: [3,3,3,4,3,4,3,3,4,3,3,3],
    resilience: 0, notes: [], feedback: [], actionLog: []
  },
  {
    id: 2, name: "Ivan Horvat", invisible: true,
    engagement: randomArr(70, 15), pulse: randomArr(66, 15), burnout: randomBurn(0.41),
    incidents: [0,1,2,2,1,2,1,2,1,2,2,1], bounceBack: [10,11,9,8,7,11,10,10,9,8,9,10],
    resilience: 0, notes: [], feedback: [], actionLog: []
  },
  {
    id: 3, name: "Marko Jurić", invisible: false,
    engagement: randomArr(95, 7), pulse: randomArr(88, 8), burnout: randomBurn(0.07),
    incidents: [0,0,0,0,0,0,0,0,0,0,0,0], bounceBack: [2,2,2,2,2,2,2,2,2,2,2,2],
    resilience: 0, notes: [], feedback: [], actionLog: []
  },
  {
    id: 4, name: "Petar Božić", invisible: true,
    engagement: randomArr(56, 10), pulse: randomArr(61, 13), burnout: randomBurn(0.65),
    incidents: [1,1,2,1,2,3,2,1,2,3,2,2], bounceBack: [15,16,14,13,15,13,14,13,14,15,14,13],
    resilience: 0, notes: [], feedback: [], actionLog: []
  },
  {
    id: 5, name: "Kristijan Pavlović", invisible: false,
    engagement: randomArr(92, 8), pulse: randomArr(81, 9), burnout: randomBurn(0.16),
    incidents: [0,0,1,0,0,1,0,0,1,0,0,1], bounceBack: [3,4,3,4,3,3,4,3,4,3,3,4],
    resilience: 0, notes: [], feedback: [], actionLog: []
  }
];

function burnoutStatus(risk) {
  if (risk > 0.6) return { label: "Critical", color: "#FF4848" };
  if (risk > 0.3) return { label: "Watch", color: "#FFD700" };
  return { label: "Low", color: "#1de682" };
}
function bounceBackStatus(days) {
  if (days > 10) return { label: "Delayed", color: "#FF4848" };
  if (days > 5) return { label: "Slow", color: "#FFD700" };
  return { label: "Resilient", color: "#1de682" };
}

// Resilience index (weighted: pulse high, burnout low, engagement high, bounce-back low, incidents low)
function computeResilience(a) {
  let avgPulse = a.pulse.reduce((x,y)=>x+y,0)/a.pulse.length;
  let avgBurn = a.burnout.reduce((x,y)=>x+y,0)/a.burnout.length;
  let avgEng = a.engagement.reduce((x,y)=>x+y,0)/a.engagement.length;
  let avgBounce = a.bounceBack.reduce((x,y)=>x+y,0)/a.bounceBack.length;
  let totalIncidents = a.incidents.reduce((x,y)=>x+y,0);
  let index = avgPulse*0.23 + (100-avgBurn*100)*0.19 + avgEng*0.22 + (14-avgBounce)*0.19 + (6-totalIncidents)*0.17;
  return Math.max(1, Math.round(index));
}
function getPercentile(val, arr) {
  let sorted = [...arr].sort((a,b)=>a-b);
  let idx = sorted.findIndex(x => val <= x);
  return Math.round(100*(1-idx/(arr.length-1)));
}

// --- Main Component ---
const SocioEmotionalResilienceDashboard = () => {
  const [athletes, setAthletes] = useState(ATHLETES.map(a=>({...a,resilience:computeResilience(a)})));
  const [selected, setSelected] = useState(ATHLETES.map(a=>({...a,resilience:computeResilience(a)}))[0]);
  const [tab, setTab] = useState('athlete');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');
  const [scenario, setScenario] = useState({ type: null, data: [] });

  // Add note
  const handleAddNote = () => {
    if (!note.trim()) return;
    const player = { ...selected };
    player.notes = [...player.notes, { text: note, date: new Date().toLocaleString() }];
    setAthletes(athletes.map(a => a.id === player.id ? player : a));
    setSelected(player);
    setNote('');
  };
  // Add feedback
  const handleAddFeedback = (role) => {
    if (!feedback.trim()) return;
    const player = { ...selected };
    player.feedback = [...player.feedback, { text: feedback, date: new Date().toLocaleString(), role }];
    setAthletes(athletes.map(a => a.id === player.id ? player : a));
    setSelected(player);
    setFeedback('');
  };
  // Add action log
  const handleAddAction = () => {
    const desc = prompt('Describe intervention or action:');
    if (!desc) return;
    const player = { ...selected };
    player.actionLog = [...player.actionLog, { text: desc, date: new Date().toLocaleString() }];
    setAthletes(athletes.map(a => a.id === player.id ? player : a));
    setSelected(player);
  };

  // Scenario simulation: Stress, Support, Coach
  const handleScenario = (type) => {
    let newData;
    if (type === 'stress') {
      newData = selected.burnout.map(x => Math.min(1, x+0.12));
    } else if (type === 'support') {
      newData = selected.burnout.map(x => Math.max(0, x-0.18));
    } else if (type === 'coach') {
      newData = selected.burnout.map((x,i) => Math.max(0, x-((i>6)?0.14:0.05)));
    }
    setScenario({ type, data: newData });
  };

  // Export (PDF/print)
  const handleExport = () => { window.print(); };

  // Ranks, best, at risk
  const resilienceArr = athletes.map(a=>a.resilience);
  const best = athletes.reduce((a,b)=> a.resilience>b.resilience?a:b);
  const riskiest = athletes.reduce((a,b)=> a.burnout[11]>b.burnout[11]?a:b);

  // Team wellness trend (last 4 months vs prev 4)
  const teamMomentum = () => {
    let cur = athletes.reduce((a,b)=>a+b.engagement.slice(8,12).reduce((x,y)=>x+y,0)/4,0)/athletes.length;
    let prev = athletes.reduce((a,b)=>a+b.engagement.slice(4,8).reduce((x,y)=>x+y,0)/4,0)/athletes.length;
    return Math.round(cur-prev);
  };

  // Positive/negative incident graph (per month)
  const posNeg = Array.from({length:12}, (_,m) => ({
    month: m+1,
    Positive: athletes.filter(a=>a.incidents[m]<2).length,
    Negative: athletes.filter(a=>a.incidents[m]>=2).length
  }));

  // Invisible risk: engagement <65 any month OR high burnout
  const invisibleRisk = athletes.map(a =>
    a.engagement.some(x=>x<65)||a.burnout[11]>0.7
  ).filter(x=>x).length;

  // Burnout forecast scenarios
  const burnoutGraph = [
    { name:"Baseline", data: selected.burnout },
    scenario.type==="stress" && { name:"Stress", data: scenario.data },
    scenario.type==="support" && { name:"Support", data: scenario.data },
    scenario.type==="coach" && { name:"Coach", data: scenario.data }
  ].filter(Boolean);

  // --- UI ---
  return (
    <div style={{ padding: 24 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 8 }}>
        <Button onClick={() => setTab('athlete')} style={{ background: tab==='athlete'?'#FFD700':'#1de682', color: tab==='athlete'?'#181e23':'#232', fontWeight:900 }}>Athlete</Button>
        <Button onClick={() => setTab('analytics')} style={{ background: tab==='analytics'?'#FFD700':'#1de682', color: tab==='analytics'?'#181e23':'#232', fontWeight:900 }}>Analytics</Button>
        <Button onClick={() => setTab('club')} style={{ background: tab==='club'?'#FFD700':'#1de682', color: tab==='club'?'#181e23':'#232', fontWeight:900 }}>Club Trends</Button>
        <Button onClick={() => setTab('report')} style={{ background: tab==='report'?'#FFD700':'#1de682', color: tab==='report'?'#181e23':'#232', fontWeight:900 }}>Boardroom Report</Button>
      </div>
      <AnimatePresence>
      {/* ATHLETE TAB */}
      {tab === 'athlete' && selected && (
        <motion.div key="athlete" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaHeartbeat style={{ marginRight: 12, fontSize: 30, color: "#1de682", verticalAlign: 'middle' }} />
            SOCIO-EMOTIONAL RESILIENCE: ATHLETE PROFILE
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
                          <FaSmile style={{ marginRight: 6, fontSize: 16, verticalAlign: "middle" }} />
                          {a.name} {a.invisible && <FaExclamationTriangle style={{ color: "#FF4848", marginLeft: 4 }} title="Invisible Athlete Alert" />}
                          <span style={{ color: "#FFD700", marginLeft: 6, fontWeight:700, fontSize:13 }}>Resilience: {a.resilience}</span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Pulse/Burnout/Resilience */}
            <Card style={{ minWidth: 340, background: "#182433", color: "#fff", flex: 1 }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 6 }}>Vitals</div>
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 9 }}>
                  Pulse: <span style={{ color: "#1de682" }}>{selected.pulse[11]}</span> bpm
                  <FaHeartbeat style={{ color: "#1de682", marginLeft: 8, verticalAlign: "middle" }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  Burnout: <span style={{ color: burnoutStatus(selected.burnout[11]).color }}>{burnoutStatus(selected.burnout[11]).label}</span>
                  <FaBurn style={{ color: burnoutStatus(selected.burnout[11]).color, marginLeft: 7, verticalAlign: "middle" }} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  Bounce-back: <span style={{ color: bounceBackStatus(selected.bounceBack[11]).color }}>{bounceBackStatus(selected.bounceBack[11]).label}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  Incidents (year): <span style={{ color: "#FFD700", fontWeight: 700 }}>{selected.incidents.reduce((x,y)=>x+y,0)}</span>
                </div>
                <div style={{ color: selected.invisible ? "#FF4848" : "#FFD700", fontWeight: 700 }}>
                  {selected.invisible ? <span><FaExclamationTriangle style={{ color: "#FF4848", marginRight: 4 }} /> Invisible Athlete Alert</span> : "Visible/Engaged"}
                </div>
                <div style={{ color: "#FFD700", fontWeight: 700, marginTop: 9 }}>
                  Resilience Index: <span style={{ color: "#1de682", fontWeight: 900 }}>{selected.resilience}</span> | Percentile: <span style={{ color: "#FFD700", fontWeight: 700 }}>{getPercentile(selected.resilience, resilienceArr)}%</span>
                </div>
              </CardContent>
            </Card>
            {/* Pulse/Burnout Trendline & Scenario */}
            <Card style={{ minWidth: 340, background: "#181e23", color: "#fff" }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 10 }}>Pulse & Burnout Trajectory</div>
                <ResponsiveContainer width="100%" height={68}>
                  <LineChart data={selected.pulse.map((p, i) => ({ month: i+1, Pulse: p }))}>
                    <Line type="monotone" dataKey="Pulse" stroke="#1de682" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={68}>
                  <LineChart>
                    {burnoutGraph.map((bg, idx) => (
                      <Line key={bg.name} type="monotone" data={bg.data.map((b, i) => ({ month: i+1, Burnout: b }))} dataKey="Burnout"
                        stroke={idx===0 ? "#FFD700" : idx===1 ? "#FF4848" : idx===2 ? "#1de682" : "#22df82"} strokeDasharray={idx===0?"":"4 2"} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ fontWeight: 600, color: "#FFD700", marginTop: 9 }}>Scenario Lab:</div>
                <div style={{ margin: "4px 0 8px 0" }}>
                  <Button size="sm" style={{ background: "#FF4848", marginRight: 4 }} onClick={()=>handleScenario('stress')}><FaBolt/> +Stress</Button>
                  <Button size="sm" style={{ background: "#1de682", marginRight: 4 }} onClick={()=>handleScenario('support')}><FaRobot/> +Support</Button>
                  <Button size="sm" style={{ background: "#FFD700" }} onClick={()=>handleScenario('coach')}><FaClipboardList/> +Coach Feedback</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Notes/Feedback/Action */}
          <div style={{ display: 'flex', gap: 18 }}>
            <Card style={{ minWidth: 280, background: "#222b37" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Coach/Action Log</div>
                <Button size="sm" style={{ background: "#1de682", marginBottom: 4 }} onClick={handleAddAction}>+ Add Intervention</Button>
                <ul>
                  {selected.actionLog.map((note, idx) => (
                    <li key={idx} style={{ color: "#1de682", marginBottom: 3, fontSize: 15 }}>
                      <FaClipboardList style={{ marginRight: 6 }} /> {note.text}
                      <span style={{ color: "#FFD700aa", fontSize: 13, marginLeft: 7 }}>({note.date})</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card style={{ minWidth: 280, background: "#181e23" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Parent/Athlete Feedback</div>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Add feedback..."
                  style={{ width: "100%", borderRadius: 6, padding: 8, border: "1.3px solid #FFD700" }}
                />
                <div>
                  <Button size="sm" style={{ marginRight: 4 }} onClick={()=>handleAddFeedback('Parent')}>Add Parent</Button>
                  <Button size="sm" style={{ background:"#1de682" }} onClick={()=>handleAddFeedback('Athlete')}>Add Athlete</Button>
                </div>
                <ul>
                  {selected.feedback.map((fb, idx) => (
                    <li key={idx} style={{ color: fb.role==='Parent'?"#FFD700":"#1de682", marginBottom: 3, fontSize: 15 }}>
                      <FaCommentDots style={{ marginRight: 6 }} /> [{fb.role}] {fb.text}
                      <span style={{ color: "#FFD700aa", fontSize: 13, marginLeft: 7 }}>({fb.date})</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card style={{ minWidth: 250, background: "#232b39" }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Coach Notes</div>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add note..."
                  style={{ width: "100%", borderRadius: 6, padding: 8, border: "1.3px solid #FFD700" }}
                />
                <Button size="sm" onClick={handleAddNote} style={{ marginTop: 4 }}>Add Note</Button>
                <ul>
                  {selected.notes.map((note, idx) => (
                    <li key={idx} style={{ color: "#1de682", marginBottom: 3, fontSize: 15 }}>
                      <FaCommentDots style={{ marginRight: 6 }} /> {note.text}
                      <span style={{ color: "#FFD700aa", fontSize: 13, marginLeft: 7 }}>({note.date})</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'analytics' && selected && (
        <motion.div key="analytics" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaChartBar style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            Emotional & Resilience Analytics
          </h2>
          <div style={{ display: 'flex', gap: 30 }}>
            <Card style={{ background: "#232b39", minWidth:320 }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 10 }}>Resilience Trajectory</div>
                <ResponsiveContainer width="100%" height={125}>
                  <LineChart data={selected.resilience && Array.from({length:12}, (_,i)=>({month:i+1,Resilience:selected.resilience}))}>
                    <Line type="monotone" dataKey="Resilience" stroke="#1de682" strokeWidth={2}/>
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ fontWeight:600, color:"#FFD700" }}>Current: {selected.resilience} | Percentile: {getPercentile(selected.resilience, resilienceArr)}%</div>
              </CardContent>
            </Card>
            <Card style={{ background: "#232b39", minWidth:340 }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 10 }}>Engagement Radar</div>
                <ResponsiveContainer width="100%" height={140}>
                  <RadarChart cx="50%" cy="50%" outerRadius={55} data={selected.engagement.map((e,i)=>({month:i+1,val:e}))}>
                    <PolarGrid stroke="#FFD70033" />
                    <PolarAngleAxis dataKey="month" tick={{ fill: "#FFD700", fontWeight: 700, fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[40,100]} tick={{ fill: "#1de682", fontWeight: 700 }} />
                    <Radar name="Engagement" dataKey="val" stroke="#1de682" fill="#1de682" fillOpacity={0.17} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card style={{ background: "#181e23", minWidth:340 }}>
              <CardContent>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 10 }}>Incidents (Pos/Neg)</div>
                <ResponsiveContainer width="100%" height={115}>
                  <BarChart data={posNeg}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Positive" stackId="a" fill="#1de682" />
                    <Bar dataKey="Negative" stackId="a" fill="#FF4848" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* CLUB TAB */}
      {tab === 'club' && (
        <motion.div key="club" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaUsers style={{ marginRight: 12, fontSize: 30, color: "#1de682", verticalAlign: 'middle' }} />
            Club Emotional Climate & Wellness Momentum
          </h2>
          <Card style={{ minWidth: 660, background: "#182433", color: "#fff" }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 10 }}>Wellness & Invisible Athlete Risk Heatmap</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Athlete</th>
                    <th style={{ color: "#1de682", fontWeight: 700 }}>Engagement</th>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Burnout</th>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Resilience</th>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Invisible?</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, idx) => (
                    <tr key={a.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{a.name}</td>
                      <td style={{ color: Math.min(...a.engagement)<70 ? "#FF4848" : "#1de682" }}>{Math.round(a.engagement.reduce((x,y)=>x+y,0)/12)}%</td>
                      <td style={{ color: burnoutStatus(a.burnout[11]).color }}>{burnoutStatus(a.burnout[11]).label}</td>
                      <td style={{ color: "#1de682", fontWeight: 700 }}>{a.resilience}</td>
                      <td style={{ color: a.invisible ? "#FF4848" : "#1de682" }}>{a.invisible ? "YES" : "NO"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div style={{ display:'flex', gap:18 }}>
            <Card style={{ background: "#232b39", minWidth:180 }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>Top Resilient <FaTrophy style={{ color: "#1de682" }} /></div>
                <div style={{ color: "#1de682", fontWeight: 700 }}>{best.name}</div>
              </CardContent>
            </Card>
            <Card style={{ background: "#181e23", minWidth:180 }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>At Risk <FaExclamationTriangle style={{ color: "#FF4848" }} /></div>
                <div style={{ color: "#FF4848", fontWeight: 700 }}>{riskiest.name}</div>
              </CardContent>
            </Card>
            <Card style={{ background: "#FFD70022", minWidth:190 }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>Invisible Risk <FaFire style={{ color: "#FFD700" }} /></div>
                <div style={{ color: "#FF4848", fontWeight: 700 }}>{invisibleRisk} athlete(s)</div>
              </CardContent>
            </Card>
            <Card style={{ background: "#1de68222", minWidth:200 }}>
              <CardContent>
                <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>Wellness Momentum</div>
                <div style={{ color: teamMomentum()>0?"#1de682":"#FF4848", fontWeight: 700 }}>
                  {teamMomentum()>0 ? "+" : ""}{teamMomentum()}% vs last quarter
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* REPORT TAB */}
      {tab === 'report' && (
        <motion.div key="report" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
            <FaChartBar style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            Boardroom Wellness Report
          </h2>
          <Card style={{ minWidth: 930, background: "#232b39", color: "#fff" }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 12 }}>Full Export (PDF/CSV ready)</div>
              <Button style={{ background: "#FFD700", color: "#23292f", fontWeight: 700, fontSize: 15, borderRadius: 11 }} onClick={handleExport}>
                <FaDownload style={{ marginRight: 6 }} /> Export Boardroom Snapshot (PDF)
              </Button>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18 }}>
                <thead>
                  <tr>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Athlete</th>
                    <th style={{ color: "#1de682", fontWeight: 700 }}>Engagement</th>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Burnout</th>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Resilience</th>
                    <th style={{ color: "#FFD700", fontWeight: 700 }}>Invisible?</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, idx) => (
                    <tr key={a.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{a.name}</td>
                      <td style={{ color: Math.min(...a.engagement)<70 ? "#FF4848" : "#1de682" }}>{Math.round(a.engagement.reduce((x,y)=>x+y,0)/12)}%</td>
                      <td style={{ color: burnoutStatus(a.burnout[11]).color }}>{burnoutStatus(a.burnout[11]).label}</td>
                      <td style={{ color: "#1de682", fontWeight: 700 }}>{a.resilience}</td>
                      <td style={{ color: a.invisible ? "#FF4848" : "#1de682" }}>{a.invisible ? "YES" : "NO"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 18, fontWeight: 700, color: "#FFD700", fontSize: 16 }}>Club Summary</div>
              <div style={{ color: "#1de682", fontWeight: 700 }}>
                Avg Engagement: {Math.round(athletes.reduce((a,b)=>a+b.engagement.reduce((x,y)=>x+y,0)/12,0)/athletes.length)}% | 
                Top Resilience: {best.name} | Invisible Risk: {invisibleRisk}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default SocioEmotionalResilienceDashboard;
