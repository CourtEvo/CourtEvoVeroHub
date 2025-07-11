// LongTermAthleteProjectionSimulator.jsx (MAXIMUM, MULTI-LAYER, SCENARIO-BRANCHED)
import React, { useState } from 'react';
import { FaChartLine, FaRobot, FaExclamationTriangle, FaUserGraduate, FaUserTie, FaDownload, FaLightbulb, FaHistory, FaAward, FaArrowUp, FaArrowDown, FaCheckCircle, FaHeartbeat, FaBrain, FaBook, FaMedal, FaHandHoldingHeart } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- UI Helpers ---
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

// --- Demo Data (4 athletes, 6-year forecast, 5 pathways, multi-factor) ---
const ATHLETES = [
  {
    id: 1,
    name: "Luka Vuković",
    age: 16,
    forecast: [75, 78, 82, 85, 88, 90], // performance index 0–100
    health: [88, 86, 84, 88, 89, 91],
    academic: [3.8, 3.7, 3.7, 3.8, 3.9, 4.0],
    engagement: [78, 81, 82, 85, 87, 89],
    percentiles: [60, 68, 75, 81, 86, 89],
    futureValue: [72, 75, 79, 82, 85, 88], // composite
    scenarioDelta: [0, 0, 0, 0, 0, 0],
    paths: [
      { label: "Pro", prob: [10, 18, 32, 46, 61, 70] },
      { label: "College", prob: [38, 42, 45, 42, 33, 24] },
      { label: "Dropout", prob: [5, 7, 9, 11, 8, 7] },
      { label: "Plateau", prob: [8, 9, 12, 14, 9, 6] },
      { label: "International", prob: [3, 5, 8, 15, 21, 26] }
    ],
    risk: [9, 11, 8, 5, 4, 4],
    milestone: [false, true, false, false, false, false],
    notes: [],
    interventions: [],
    scenarios: []
  },
  {
    id: 2,
    name: "Ivan Horvat",
    age: 17,
    forecast: [65, 66, 68, 68, 69, 68],
    health: [82, 81, 80, 79, 78, 76],
    academic: [3.1, 3.2, 3.0, 2.8, 2.7, 2.6],
    engagement: [68, 65, 62, 60, 57, 55],
    percentiles: [41, 42, 43, 43, 41, 39],
    futureValue: [64, 64, 66, 65, 63, 62],
    scenarioDelta: [0, 0, 0, 0, 0, 0],
    paths: [
      { label: "Pro", prob: [2, 4, 6, 9, 13, 16] },
      { label: "College", prob: [25, 29, 34, 41, 42, 37] },
      { label: "Dropout", prob: [12, 17, 21, 27, 24, 22] },
      { label: "Plateau", prob: [29, 28, 30, 29, 28, 27] },
      { label: "International", prob: [1, 2, 3, 5, 7, 8] }
    ],
    risk: [19, 22, 26, 29, 32, 34],
    milestone: [false, false, false, false, true, false],
    notes: [],
    interventions: [],
    scenarios: []
  },
  {
    id: 3,
    name: "Marko Jurić",
    age: 16,
    forecast: [91, 93, 96, 97, 98, 99],
    health: [95, 94, 93, 93, 94, 94],
    academic: [4.5, 4.6, 4.4, 4.4, 4.6, 4.7],
    engagement: [95, 96, 96, 97, 98, 98],
    percentiles: [98, 99, 99, 99, 99, 99],
    futureValue: [92, 94, 97, 98, 99, 100],
    scenarioDelta: [0, 0, 0, 0, 0, 0],
    paths: [
      { label: "Pro", prob: [67, 73, 81, 91, 96, 97] },
      { label: "College", prob: [13, 12, 11, 7, 3, 1] },
      { label: "Dropout", prob: [2, 1, 1, 0, 0, 0] },
      { label: "Plateau", prob: [4, 2, 2, 0, 0, 0] },
      { label: "International", prob: [27, 33, 45, 57, 73, 83] }
    ],
    risk: [2, 2, 2, 2, 2, 2],
    milestone: [true, true, true, false, false, false],
    notes: [],
    interventions: [],
    scenarios: []
  },
  {
    id: 4,
    name: "Petar Božić",
    age: 15,
    forecast: [56, 56, 55, 53, 53, 52],
    health: [66, 64, 62, 60, 58, 56],
    academic: [2.7, 2.6, 2.5, 2.3, 2.2, 2.0],
    engagement: [57, 53, 50, 47, 44, 41],
    percentiles: [17, 17, 16, 13, 13, 11],
    futureValue: [55, 54, 52, 50, 48, 47],
    scenarioDelta: [0, 0, 0, 0, 0, 0],
    paths: [
      { label: "Pro", prob: [0, 0, 2, 2, 2, 2] },
      { label: "College", prob: [10, 8, 6, 3, 2, 1] },
      { label: "Dropout", prob: [17, 22, 31, 41, 53, 66] },
      { label: "Plateau", prob: [31, 36, 41, 47, 49, 51] },
      { label: "International", prob: [0, 0, 1, 2, 2, 2] }
    ],
    risk: [22, 27, 33, 41, 49, 58],
    milestone: [false, false, false, false, false, false],
    notes: [],
    interventions: [],
    scenarios: []
  }
];
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

// Helper logic
function riskColor(val) {
  if (val >= 30) return "#FF4848";
  if (val >= 15) return "#FFD700";
  return "#1de682";
}
function statusLabel(val) {
  if (val >= 90) return "HighFlyer";
  if (val >= 70) return "On Track";
  if (val >= 60) return "Monitor";
  return "At Risk";
}
function percentile(val) {
  if (val >= 90) return 99;
  if (val >= 80) return 90;
  if (val >= 70) return 80;
  if (val >= 60) return 70;
  if (val >= 50) return 55;
  if (val >= 40) return 40;
  return 25;
}
function pathBadge(p) {
  if (p.prob[5]>=70) return <span style={{color:"#FFD700"}}>Likely Pro</span>;
  if (p.prob[5]>=50) return <span style={{color:"#FFD700"}}>Potential Pro</span>;
  if (p.label==="Dropout" && p.prob[5]>=40) return <span style={{color:"#FF4848"}}>Dropout Risk</span>;
  if (p.label==="Plateau" && p.prob[5]>=40) return <span style={{color:"#FFD700"}}>Plateau Risk</span>;
  if (p.label==="International" && p.prob[5]>=70) return <span style={{color:"#1de682"}}>Intl Highflyer</span>;
  return null;
}
function getScenarioDelta(type) {
  // Each scenario affects: performance, health, academic, engagement, risk, value, etc.
  // [performance, health, academic, engagement, risk, value]
  if(type==="injury") return {
    perf:[-10,-8,-7,-7,-8,-8],
    health:[-20,-10,-8,-4,-2,-1],
    academic:[0,-.1,-.2,0,.1,0],
    engagement:[-10,-5,-4,-3,-3,-2],
    risk:[12,10,7,3,2,1],
    value:[-12,-7,-6,-5,-4,-3]
  };
  if(type==="clubchange") return {
    perf:[2,3,3,3,3,4],
    health:[1,1,2,3,2,2],
    academic:[0,0,0.1,0,0,0],
    engagement:[5,7,8,9,8,7],
    risk:[-3,-2,-1,-1,-2,-3],
    value:[4,6,7,8,8,8]
  };
  if(type==="coach") return {
    perf:[5,6,6,7,7,8],
    health:[2,3,4,5,5,5],
    academic:[.2,.2,.1,0,0,0],
    engagement:[10,9,8,7,6,5],
    risk:[-5,-6,-6,-7,-7,-8],
    value:[8,9,9,9,10,10]
  };
  if(type==="burnout") return {
    perf:[-8,-8,-12,-15,-17,-20],
    health:[-10,-14,-18,-20,-20,-18],
    academic:[-.3,-.3,-.4,-.6,-.8,-1.2],
    engagement:[-10,-12,-15,-18,-22,-25],
    risk:[12,18,21,23,27,29],
    value:[-10,-12,-16,-20,-22,-24]
  };
  if(type==="family") return {
    perf:[-4,-2,-1,0,0,1],
    health:[-3,-2,-1,0,0,1],
    academic:[-.2,-.2,-.2,0,.2,.2],
    engagement:[-5,-2,0,2,2,2],
    risk:[4,2,0,-2,-2,-2],
    value:[-5,-2,0,0,1,1]
  };
  if(type==="surge") return {
    perf:[7,9,12,13,14,14],
    health:[2,2,3,3,2,2],
    academic:[.2,.2,.2,0,0,0],
    engagement:[12,11,9,8,7,6],
    risk:[-6,-7,-9,-10,-11,-12],
    value:[13,15,16,17,18,18]
  };
  if(type==="bench") return {
    perf:[-2,-6,-10,-12,-15,-18],
    health:[-2,-5,-7,-8,-9,-10],
    academic:[.1,0,-.1,-.2,-.1,0],
    engagement:[-3,-8,-14,-15,-17,-18],
    risk:[8,11,13,15,18,21],
    value:[-3,-7,-12,-15,-17,-17]
  };
  if(type==="academicblock") return {
    perf:[-4,-3,-2,-2,-1,-1],
    health:[-1,-1,-1,-2,-2,-2],
    academic:[-.5,-.7,-.9,-.9,-.8,-.6],
    engagement:[-3,-2,-2,-1,0,0],
    risk:[6,7,8,9,10,12],
    value:[-5,-6,-6,-6,-5,-4]
  };
  if(type==="breakthrough") return {
    perf:[12,16,18,19,19,20],
    health:[5,6,8,9,8,7],
    academic:[.3,.2,.2,.1,0,0],
    engagement:[16,15,13,12,11,10],
    risk:[-11,-15,-17,-17,-17,-18],
    value:[18,22,24,25,26,26]
  };
  if(type==="dnp") return {
    perf:[-6,-8,-11,-13,-12,-11],
    health:[-4,-7,-9,-10,-9,-8],
    academic:[.1,.2,0,-.2,-.3,-.2],
    engagement:[-8,-11,-13,-13,-12,-10],
    risk:[10,14,15,16,16,15],
    value:[-8,-13,-15,-15,-14,-13]
  };
  return {
    perf:[0,0,0,0,0,0],
    health:[0,0,0,0,0,0],
    academic:[0,0,0,0,0,0],
    engagement:[0,0,0,0,0,0],
    risk:[0,0,0,0,0,0],
    value:[0,0,0,0,0,0]
  };
}

// --- MAIN MODULE ---
const LongTermAthleteProjectionSimulator = () => {
  const [athletes, setAthletes] = useState(ATHLETES);
  const [view, setView] = useState(0);
  const [tab, setTab] = useState("profile");
  const [scenario, setScenario] = useState({ runs: [], compare: [] });
  const [note, setNote] = useState('');
  const [interventions, setInterventions] = useState([]);

  // Scenario simulation/compare
  const runScenario = (type, label) => {
    let d = getScenarioDelta(type);
    setScenario(s => ({
      runs: [...s.runs, { type, label, delta: d, date: new Date().toLocaleString() }],
      compare: [...s.compare.slice(-2), { type, label, delta: d }]
    }));
  };
  const resetCompare = () => setScenario({ runs: [], compare: [] });

  // Add note/intervention
  const athlete = athletes[view];
  const addNote = () => {
    let arr = [...athletes];
    arr[view].notes = [...arr[view].notes, { text: note, date: new Date().toLocaleString() }];
    setAthletes(arr); setNote('');
  };
  const addIntervention = (desc, assign, deadline) => {
    setInterventions([
      ...interventions,
      {
        desc, assign, deadline, status: "Open", athlete: athlete.name, date: new Date().toLocaleString()
      }
    ]);
  };
  const setInterventionStatus = (i, status) => {
    let arr = [...interventions];
    arr[i].status = status;
    setInterventions(arr);
  };

  // Export
  const handleExport = () => window.print();

  return (
    <div style={{ padding: 24 }}>
      {/* Tabs */}
      <div style={{ display:"flex", gap:18, marginBottom:8 }}>
        <Button onClick={()=>setTab("profile")} style={{ background: tab==="profile"?"#FFD700":"#1de682", color:tab==="profile"?"#181e23":"#232", fontWeight:900 }}>Athlete</Button>
        <Button onClick={()=>setTab("projection")} style={{ background: tab==="projection"?"#FFD700":"#1de682", color:tab==="projection"?"#181e23":"#232", fontWeight:900 }}>Projection</Button>
        <Button onClick={()=>setTab("scenario")} style={{ background: tab==="scenario"?"#FFD700":"#1de682", color:tab==="scenario"?"#181e23":"#232", fontWeight:900 }}>Scenario Lab</Button>
        <Button onClick={()=>setTab("report")} style={{ background: tab==="report"?"#FFD700":"#1de682", color:tab==="report"?"#181e23":"#232", fontWeight:900 }}>Boardroom Report</Button>
      </div>
      <AnimatePresence>
      {/* ATHLETE PROFILE */}
      {tab==="profile" && (
        <motion.div key="profile" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, letterSpacing:1, marginBottom: 8 }}>
            <FaUserTie style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            LONG-TERM ATHLETE PROJECTION PROFILE
          </h2>
          <div style={{display:"flex",gap:34}}>
            <Card style={{minWidth:200,background:"#202a38"}}>
              <CardContent>
                <div style={{fontWeight:700,color:"#FFD700",fontSize:17,marginBottom:8}}>Athletes</div>
                {athletes.map((a,i)=>(
                  <div key={a.id} onClick={()=>setView(i)} style={{
                    background: view===i?"#FFD70033":"none",
                    color: view===i?"#FFD700":"#fff",
                    padding: "8px 10px",
                    fontWeight: 600,
                    borderRadius: 10,
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    border: view===i?"2px solid #FFD700":"1px solid #293949"
                  }}>
                    {a.name} {statusLabel(a.forecast[5])==="HighFlyer"&&<FaArrowUp style={{color:"#1de682",marginLeft:5}}/>} {statusLabel(a.forecast[5])==="At Risk"&&<FaExclamationTriangle style={{color:"#FF4848",marginLeft:5}}/>}
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Full Factor Radar */}
            <Card style={{minWidth:350,background:"#232b39"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:20,marginBottom:8}}>6-Year Radar: All Factors</div>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart outerRadius={88} data={YEARS.map((y,i)=>({
                    year: y,
                    Performance: athlete.forecast[i],
                    Health: athlete.health[i],
                    Academic: athlete.academic[i]*20,
                    Engagement: athlete.engagement[i],
                  }))}>
                    <PolarGrid stroke="#FFD70033" />
                    <PolarAngleAxis dataKey="year" tick={{ fill: "#FFD700", fontWeight: 700, fontSize: 15 }}/>
                    <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill: "#1de682", fontWeight: 700 }}/>
                    <Radar name="Performance" dataKey="Performance" stroke="#FFD700" fill="#FFD700" fillOpacity={0.10} />
                    <Radar name="Health" dataKey="Health" stroke="#1de682" fill="#1de682" fillOpacity={0.10} />
                    <Radar name="Academic" dataKey="Academic" stroke="#1de6d1" fill="#1de6d1" fillOpacity={0.10} />
                    <Radar name="Engagement" dataKey="Engagement" stroke="#FF4848" fill="#FF4848" fillOpacity={0.09} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{color:"#FFD700",fontWeight:700,marginTop:5}}>
                  <FaMedal style={{marginRight:5}}/>Composite Future Value: <span style={{color:"#1de682",fontWeight:800}}>{athlete.futureValue[5]}</span>
                </div>
              </CardContent>
            </Card>
            {/* Milestone Timeline */}
            <Card style={{minWidth:230,background:"#181e23"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:19,marginBottom:8}}>Milestone Timeline</div>
                <ul style={{fontWeight:700,fontSize:15}}>
                  {YEARS.map((y,i)=>
                    athlete.milestone[i]
                      ? <li key={i} style={{color:"#1de682"}}><FaAward style={{marginRight:7}}/>{y}: Met</li>
                      : <li key={i} style={{color:"#FFD700"}}><FaAward style={{marginRight:7}}/>{y}: Pending</li>
                  )}
                </ul>
              </CardContent>
            </Card>
            {/* Notes */}
            <Card style={{minWidth:270,background:"#222b37"}}>
              <CardContent>
                <div style={{color:"#FFD700",fontWeight:700,fontSize:18}}>Notes</div>
                <textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add note..." style={{width:"100%",borderRadius:6,padding:8,border:"1.3px solid #FFD700"}} />
                <Button size="sm" onClick={addNote} style={{marginTop:4}}>Add Note</Button>
                <ul>
                  {athlete.notes.map((n,i)=>(
                    <li key={i} style={{color:"#1de682",marginBottom:3,fontSize:15}}><FaHistory style={{marginRight:6}}/>{n.text} <span style={{color:"#FFD700aa",fontSize:13,marginLeft:7}}>({n.date})</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* PROJECTION TAB */}
      {tab==="projection" && (
        <motion.div key="projection" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, letterSpacing:1, marginBottom: 8 }}>
            <FaChartLine style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            MULTI-YEAR FORECAST, RISK, VALUE & PATHWAY MAP
          </h2>
          <div style={{display:"flex",gap:36}}>
            {/* Multi-Layer Projections */}
            <Card style={{minWidth:420,background:"#232b39"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:19,marginBottom:8}}>Projection & Scenario Compare</div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart>
                    <Line dataKey="Performance" data={athlete.forecast.map((p,i)=>({year:YEARS[i],Performance:p}))} stroke="#FFD700" strokeWidth={2} />
                    <Line dataKey="Health" data={athlete.health.map((p,i)=>({year:YEARS[i],Health:p}))} stroke="#1de682" strokeWidth={2} />
                    <Line dataKey="Academic" data={athlete.academic.map((p,i)=>({year:YEARS[i],Academic:p*20}))} stroke="#1de6d1" strokeWidth={2} />
                    <Line dataKey="Engagement" data={athlete.engagement.map((p,i)=>({year:YEARS[i],Engagement:p}))} stroke="#FF4848" strokeWidth={2} />
                    {scenario.compare.map((s,idx)=>(
                      <Line key={idx} dataKey={`Future${idx+1}`} data={athlete.futureValue.map((p,i)=>({year:YEARS[i],[`Future${idx+1}`]:p+(s.delta.value[i]||0)}))} stroke={["#FFD700","#FF4848","#1de682"][idx%3]} strokeDasharray="3 3"/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{marginTop:5, fontWeight:700, color:"#FFD700"}}>
                  Value Index: <span style={{color:"#1de682"}}>{athlete.futureValue[5]}</span> | Percentile: <span style={{color:"#FFD700"}}>{athlete.percentiles[5]}%</span>
                </div>
              </CardContent>
            </Card>
            {/* Pathways/Risk/Percentile */}
            <Card style={{minWidth:300,background:"#181e23"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:19,marginBottom:8}}>Pathways, Risk, Percentile</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:15}}>
                  <thead>
                    <tr>
                      <th style={{color:"#FFD700",fontWeight:700}}>Path</th>
                      {YEARS.map(y=><th key={y} style={{color:"#1de682",fontWeight:700}}>{y}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {athlete.paths.map(p=>(
                      <tr key={p.label}>
                        <td style={{fontWeight:700,color:"#FFD700"}}>{p.label}</td>
                        {p.prob.map((pr,i)=><td key={i} style={{background:pr>=50?"#FFD70044":pr>=30?"#FFD70022":"#1de68222",color:pr>=50?"#FFD700":pr>=30?"#FFD700cc":"#1de682",fontWeight:pr>=50?900:pr>=30?700:600}}>{pr}%</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{marginTop:5,fontWeight:700,color:"#FFD700"}}>
                  {athlete.paths.map(p=>(<span key={p.label}>{pathBadge(p)} </span>))}
                </div>
              </CardContent>
            </Card>
            {/* Percentile Evolution */}
            <Card style={{minWidth:180,background:"#232b39"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:17,marginBottom:8}}>Percentile Evolution</div>
                <ResponsiveContainer width="100%" height={52}>
                  <LineChart>
                    <Line dataKey="Percentile" data={athlete.percentiles.map((p,i)=>({year:YEARS[i],Percentile:p}))} stroke="#1de682" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Risk Timeline */}
            <Card style={{minWidth:180,background:"#222b37"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:17,marginBottom:8}}>Risk Timeline</div>
                <ResponsiveContainer width="100%" height={52}>
                  <BarChart data={athlete.risk.map((r,i)=>({year:YEARS[i],Risk:r}))}>
                    <Bar dataKey="Risk" fill="#FF4848"/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{fontWeight:700,color:"#FFD700",marginTop:4}}>
                  {Math.max(...athlete.risk)>=30 ? <span style={{color:"#FF4848"}}>At-Risk Years Present</span> : <span style={{color:"#1de682"}}>No Major Risk</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* SCENARIO TAB */}
      {tab==="scenario" && (
        <motion.div key="scenario" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, letterSpacing:1, marginBottom: 8 }}>
            <FaLightbulb style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            SCENARIO LAB: FORK, RISK & ACTION PLANNER
          </h2>
          <Card>
            <CardContent>
              <div style={{fontWeight:800,color:"#FFD700",fontSize:18,marginBottom:10}}>
                Simulate:&nbsp;
                <Button size="sm" style={{ background: "#FFD700", marginLeft: 4 }} onClick={()=>runScenario('clubchange','Club Change')}>Club Change</Button>
                <Button size="sm" style={{ background: "#1de682", marginLeft: 4 }} onClick={()=>runScenario('coach','New Coach')}>New Coach</Button>
                <Button size="sm" style={{ background: "#FF4848", marginLeft: 4 }} onClick={()=>runScenario('injury','Injury/Long Absence')}>Injury</Button>
                <Button size="sm" style={{ background: "#1de6d1", marginLeft: 4 }} onClick={()=>runScenario('burnout','Burnout')}>Burnout</Button>
                <Button size="sm" style={{ background: "#232b39", color:"#FFD700", border:'1.3px solid #FFD700', marginLeft: 4 }} onClick={()=>runScenario('family','Family Relocation')}>Family Relocation</Button>
                <Button size="sm" style={{ background: "#FFD70044", marginLeft: 4 }} onClick={()=>runScenario('surge','Performance Surge')}>Breakthrough</Button>
                <Button size="sm" style={{ background: "#FF4848", marginLeft: 4 }} onClick={()=>runScenario('bench','DNP/Bench')}>DNP/Bench</Button>
                <Button size="sm" style={{ background: "#1a2334", color:"#FFD700", border:'1.3px solid #FFD700', marginLeft: 4 }} onClick={()=>runScenario('academicblock','Academic Block')}>Academic Block</Button>
                <Button size="sm" style={{ background: "#FFD70011", color:"#FFD700", border:'1.3px solid #FFD700', marginLeft: 4 }} onClick={resetCompare}>Reset Compare</Button>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart>
                  <Line dataKey="Performance" data={athlete.forecast.map((p,i)=>({year:YEARS[i],Performance:p}))} stroke="#FFD700" strokeWidth={2} />
                  {scenario.compare.map((s,idx)=>(
                    <Line key={idx} dataKey={`Future${idx+1}`} data={athlete.futureValue.map((p,i)=>({year:YEARS[i],[`Future${idx+1}`]:p+(s.delta.value[i]||0)}))} stroke={["#FFD700","#FF4848","#1de682","#1de6d1"][idx%4]} strokeDasharray="3 3"/>
                  ))}
                </LineChart>
              </ResponsiveContainer>
              {/* Scenario Timeline */}
              <div style={{marginTop:10}}>
                <b style={{color:"#FFD700"}}>Scenario Log:</b>
                <ul style={{marginTop:3}}>
                  {scenario.runs.map((s, i) => (
                    <li key={i}><FaHistory style={{ marginRight:5 }}/> [{s.date}] <b style={{color:"#FFD700"}}>{s.label}</b> — <span style={{color:"#1de682"}}>AI Most Likely Outcome: {s.type==="injury"?"Value drop, high risk":"Improvement/Branch"}</span></li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          {/* Interventions/Action Planner */}
          <Card style={{marginTop:10,background:"#1a2334"}}>
            <CardContent>
              <div style={{color:"#FFD700",fontWeight:700,fontSize:18}}>Intervention/Workflow</div>
              <div style={{marginBottom:5}}>
                <input type="text" placeholder="Describe action..." style={{width:"58%",padding:6,borderRadius:6,border:"1.3px solid #FFD700",marginRight:6}} id="actioninput"/>
                <select id="assign" style={{padding:4,borderRadius:6,border:"1.3px solid #FFD700"}}>
                  <option value="Coach">Coach</option>
                  <option value="Athlete">Athlete</option>
                  <option value="Parent">Parent</option>
                  <option value="Medical">Medical</option>
                  <option value="Staff">Staff</option>
                </select>
                <input type="date" id="deadline" style={{marginLeft:5,padding:4,borderRadius:6,border:"1.3px solid #FFD700"}} />
                <Button size="sm" onClick={()=>{
                  const desc = document.getElementById('actioninput').value;
                  const assign = document.getElementById('assign').value;
                  const deadline = document.getElementById('deadline').value;
                  if(desc.length) addIntervention(desc,assign,deadline);
                  document.getElementById('actioninput').value='';
                }}>Add</Button>
              </div>
              <ul>
                {interventions.filter(i=>i.athlete===athlete.name).map((a, idx) => (
                  <li key={idx} style={{ color: a.status==="Resolved"?"#1de682":a.status==="Open"?"#FFD700":"#FF4848", marginBottom: 3, fontSize: 15 }}>
                    <FaCheckCircle style={{ marginRight: 6 }} />[{a.assign}] {a.desc} — <b>{a.status}</b> <span style={{ color:"#FFD700aa",fontSize:13,marginLeft:6 }}>({a.date}) {a.deadline && <b>Due: {a.deadline}</b>}</span>
                    {a.status!=="Resolved" && <Button size="sm" style={{marginLeft:6}} onClick={()=>setInterventionStatus(idx,"Resolved")}>Resolve</Button>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* BOARDROOM REPORT TAB */}
      {tab==="report" && (
        <motion.div key="report" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, letterSpacing:1, marginBottom: 8 }}>
            <FaDownload style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            BOARDROOM REPORT: LONG-TERM ATHLETE PROJECTION
          </h2>
          <Card>
            <CardContent>
              <Button style={{ background: "#FFD700", color: "#23292f", fontWeight: 700, fontSize: 15, borderRadius: 11 }} onClick={handleExport}>
                <FaDownload style={{ marginRight: 6 }} /> Export Boardroom Snapshot (PDF)
              </Button>
              {/* Boardroom Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18 }}>
                <thead>
                  <tr>
                    <th style={{color:"#FFD700",fontWeight:700}}>Athlete</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Performance</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Health</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Academic</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Engagement</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Value</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Risk</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>HighFlyer?</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, idx) => (
                    <tr key={a.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{a.name}</td>
                      <td style={{ color: "#FFD700", fontWeight:700 }}>{a.forecast[5]}</td>
                      <td style={{ color: "#1de682", fontWeight:700 }}>{a.health[5]}</td>
                      <td style={{ color: "#1de6d1", fontWeight:700 }}>{a.academic[5]}</td>
                      <td style={{ color: "#FF4848", fontWeight:700 }}>{a.engagement[5]}</td>
                      <td style={{ color: "#FFD700", fontWeight:700 }}>{a.futureValue[5]}</td>
                      <td style={{ color: riskColor(a.risk[5]), fontWeight:700 }}>{a.risk[5]}</td>
                      <td style={{ color: statusLabel(a.forecast[5])==="HighFlyer"?"#1de682":"#FFD700", fontWeight:700 }}>{statusLabel(a.forecast[5])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Risk/Highflyer Timeline */}
              <div style={{marginTop:18,fontWeight:700,color:"#FFD700",fontSize:18}}>At-Risk / Highflyer Timeline</div>
              <table style={{width:"100%",borderCollapse:"collapse",marginTop:4}}>
                <thead>
                  <tr>
                    <th style={{color:"#FFD700",fontWeight:700}}>Athlete</th>
                    {YEARS.map((y,i)=><th key={i} style={{color:"#1de682",fontWeight:700}}>{y}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {athletes.map(a=>(
                    <tr key={a.id}>
                      <td style={{fontWeight:700,color:"#FFD700"}}>{a.name}</td>
                      {a.forecast.map((f,i)=>
                        a.risk[i]>=30
                          ? <td key={i} style={{background:"#FF4848",color:"#fff",fontWeight:900}}>At Risk</td>
                          : statusLabel(f)==="HighFlyer"
                            ? <td key={i} style={{background:"#1de682",color:"#232",fontWeight:900}}>Highflyer</td>
                            : <td key={i} style={{background:"#FFD70022",color:"#FFD700",fontWeight:700}}>Normal</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default LongTermAthleteProjectionSimulator;
