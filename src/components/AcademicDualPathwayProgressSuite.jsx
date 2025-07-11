// AcademicDualPathwayProgressSuite.jsx (MAXIMUM ENRICHMENT)
import React, { useState } from 'react';
import { FaUserGraduate, FaBook, FaChartLine, FaExclamationTriangle, FaRobot, FaDownload, FaAward, FaHistory, FaUserTie, FaUserAlt, FaLightbulb, FaBolt, FaCheckCircle, FaArrowUp, FaArrowDown, FaCalendarAlt } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- UI Components ---
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
const ATHLETES = [
  {
    id: 1, name: "Luka Vuković", gpa: [3.8, 3.7, 3.5, 3.6, 3.3, 3.7, 3.4, 3.6, 3.8, 3.9, 3.7, 3.5],
    subjects: [
      { name: "Math", grades: [4,4,3,4,3,4,4,3,4,4,3,4] },
      { name: "English", grades: [5,4,4,5,4,5,5,4,5,5,4,5] },
      { name: "Science", grades: [4,4,3,4,3,3,4,4,4,4,4,4] }
    ],
    pathway: "University", sport: "Pro", atRisk: false,
    absences: [0,1,2,0,1,0,0,1,0,0,1,2], lateness: [0,0,1,0,0,1,0,0,1,0,0,0],
    milestones: [
      { date: "2025-04-10", event: "Basketball Finals" },
      { date: "2025-06-21", event: "University Entrance Exam" },
    ],
    pulse: [4,3,4,5,3,4,4,3,5,5,4,4], // academic confidence (1-5)
    stress: [2,3,2,2,3,2,2,3,2,2,2,2], // stress (1-5)
    goal: [4,4,4,5,4,4,5,4,4,5,5,4],   // clarity (1-5)
    notes: [], log: [], scenarios: []
  },
  {
    id: 2, name: "Ivan Horvat", gpa: [3.1, 3.2, 3.0, 2.8, 2.7, 2.6, 2.9, 3.0, 2.5, 2.6, 2.4, 2.3],
    subjects: [
      { name: "Math", grades: [3,3,2,3,2,3,3,2,3,3,2,2] },
      { name: "English", grades: [4,4,3,4,3,3,4,3,3,3,2,3] },
      { name: "Science", grades: [3,3,2,2,2,2,3,2,2,2,2,2] }
    ],
    pathway: "Unknown", sport: "College", atRisk: true,
    absences: [1,2,3,2,1,3,2,2,3,3,3,2], lateness: [0,1,1,1,2,1,1,2,1,1,2,1],
    milestones: [
      { date: "2025-03-30", event: "Midterms" },
      { date: "2025-05-20", event: "National Basketball Camp" },
    ],
    pulse: [2,3,2,2,3,2,2,2,1,2,1,1],
    stress: [3,4,4,5,4,5,4,4,5,5,4,5],
    goal: [3,3,2,2,2,2,3,2,2,2,2,2],
    notes: [], log: [], scenarios: []
  },
  {
    id: 3, name: "Marko Jurić", gpa: [4.5, 4.6, 4.4, 4.4, 4.6, 4.7, 4.8, 4.9, 4.8, 4.8, 4.7, 4.8],
    subjects: [
      { name: "Math", grades: [5,5,4,5,5,5,5,5,5,5,5,5] },
      { name: "English", grades: [5,5,5,5,5,5,5,5,5,5,5,5] },
      { name: "Science", grades: [5,5,5,4,5,5,5,5,5,5,5,5] }
    ],
    pathway: "University", sport: "Pro", atRisk: false,
    absences: [0,0,0,0,0,0,0,0,0,0,0,0], lateness: [0,0,0,0,0,0,0,0,0,0,0,0],
    milestones: [
      { date: "2025-02-15", event: "Basketball Draft Camp" },
      { date: "2025-07-02", event: "National Exam" },
    ],
    pulse: [5,5,5,5,5,5,5,5,5,5,5,5],
    stress: [1,1,1,1,1,1,1,1,1,1,1,1],
    goal: [5,5,5,5,5,5,5,5,5,5,5,5],
    notes: [], log: [], scenarios: []
  },
  {
    id: 4, name: "Petar Božić", gpa: [2.7, 2.6, 2.5, 2.3, 2.2, 2.0, 2.3, 2.5, 2.4, 2.2, 2.0, 1.9],
    subjects: [
      { name: "Math", grades: [2,2,2,2,2,2,2,2,2,2,2,1] },
      { name: "English", grades: [3,3,2,2,2,2,2,2,2,2,2,2] },
      { name: "Science", grades: [2,2,2,2,2,2,2,2,2,2,2,2] }
    ],
    pathway: "Unknown", sport: "College", atRisk: true,
    absences: [2,2,3,3,3,2,3,2,3,3,3,3], lateness: [2,1,2,2,2,2,2,2,2,2,2,2],
    milestones: [
      { date: "2025-03-18", event: "Disciplinary Hearing" },
      { date: "2025-06-01", event: "School Transfer Decision" },
    ],
    pulse: [1,2,1,1,1,1,2,1,1,1,1,1],
    stress: [5,5,4,5,5,5,5,5,5,5,5,5],
    goal: [2,2,2,2,2,2,2,2,2,2,2,2],
    notes: [], log: [], scenarios: []
  }
];

// Analytics helpers
function atRiskColor(gpa, abs, late) {
  const lastGPA = gpa[gpa.length-1];
  if(lastGPA<2.5||abs.slice(-3).reduce((a,b)=>a+b,0)>6||late.slice(-3).reduce((a,b)=>a+b,0)>3) return "#FF4848";
  if(lastGPA<3.2) return "#FFD700";
  return "#1de682";
}
function mostImproved(arr) {
  return arr.reduce((a,b)=>b.gpa[11]-b.gpa[0]>a.gpa[11]-a.gpa[0]?b:a,arr[0]);
}
function topGPA(arr) {
  return arr.reduce((a,b)=>b.gpa[11]>a.gpa[11]?b:a,arr[0]);
}
function invisibleAcademic(a) {
  // invisible if bad gpa last 3 + >6 abs last 3 OR missed last 3 pulse
  return (a.gpa.slice(-3).every(g=>g<2.5)&&a.absences.slice(-3).reduce((x,y)=>x+y,0)>6)
    || a.pulse.slice(-3).filter(v=>v<=2).length>=2;
}
function subjectRisk(a) {
  return a.subjects.map(sub=>({
    name:sub.name,
    risk:sub.grades.slice(-3).filter(g=>g<3).length>=2 ? "#FF4848" : sub.grades.slice(-3).filter(g=>g<4).length>=2 ? "#FFD700" : "#1de682"
  }));
}
function percentile(val, arr) {
  let sorted = [...arr].sort((a,b)=>a-b);
  let idx = sorted.findIndex(x => val <= x);
  return Math.round(100*(1-idx/(arr.length-1)));
}

const scenarioDelta = (type) => {
  if(type==="grades") return -0.5;
  if(type==="absences") return -1;
  if(type==="improve") return 0.5;
  if(type==="pro") return -1.5;
  if(type==="injury") return -1;
  if(type==="examoverlap") return -0.8;
  return 0;
};

// Main
const AcademicDualPathwayProgressSuite = () => {
  const [athletes, setAthletes] = useState(ATHLETES);
  const [view, setView] = useState(0);
  const [tab, setTab] = useState("profile");
  const [scenario, setScenario] = useState({ runs: [], compare: [] });
  const [note, setNote] = useState('');
  const [log, setLog] = useState('');
  const [interventions, setInterventions] = useState([]);

  // Scenario sim & compare
  const runScenario = (type, label) => {
    let delta = scenarioDelta(type);
    setScenario(s => ({
      runs: [...s.runs, { type, label, delta, date: new Date().toLocaleString() }],
      compare: [...s.compare.slice(-2), { type, label, delta }]
    }));
  };
  const resetCompare = () => setScenario({ runs: [], compare: [] });

  // Export
  const handleExport = () => window.print();

  // Add note/log/intervention
  const athlete = athletes[view];
  const atRisk = atRiskColor(athlete.gpa, athlete.absences, athlete.lateness);

  const addNote = () => {
    let arr = [...athletes];
    arr[view].notes = [...arr[view].notes, { text: note, date: new Date().toLocaleString() }];
    setAthletes(arr); setNote('');
  };
  const addLog = () => {
    let arr = [...athletes];
    arr[view].log = [...arr[view].log, { text: log, date: new Date().toLocaleString() }];
    setAthletes(arr); setLog('');
  };
  const addIntervention = (desc, assign) => {
    setInterventions([
      ...interventions,
      {
        desc, assign, status: "Open", athlete: athlete.name, date: new Date().toLocaleString()
      }
    ]);
  };
  const setInterventionStatus = (i, status) => {
    let arr = [...interventions];
    arr[i].status = status;
    setInterventions(arr);
  };

  // Cohort subject/heatmap
  const cohortHeatmap = ["Math", "English", "Science"].map(subject=>{
    return athletes.map(a=>{
      const idx = a.subjects.findIndex(s=>s.name===subject);
      return a.subjects[idx].grades[11];
    });
  });

  // Visuals
  return (
    <div style={{ padding: 24 }}>
      {/* Tabs */}
      <div style={{ display:"flex", gap:18, marginBottom:8 }}>
        <Button onClick={()=>setTab("profile")} style={{ background: tab==="profile"?"#FFD700":"#1de682", color:tab==="profile"?"#181e23":"#232", fontWeight:900 }}>Athlete</Button>
        <Button onClick={()=>setTab("analytics")} style={{ background: tab==="analytics"?"#FFD700":"#1de682", color:tab==="analytics"?"#181e23":"#232", fontWeight:900 }}>Analytics</Button>
        <Button onClick={()=>setTab("scenario")} style={{ background: tab==="scenario"?"#FFD700":"#1de682", color:tab==="scenario"?"#181e23":"#232", fontWeight:900 }}>Scenario Lab</Button>
        <Button onClick={()=>setTab("report")} style={{ background: tab==="report"?"#FFD700":"#1de682", color:tab==="report"?"#181e23":"#232", fontWeight:900 }}>Boardroom Report</Button>
      </div>
      <AnimatePresence>
      {/* ATHLETE PROFILE */}
      {tab==="profile" && (
        <motion.div key="profile" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, letterSpacing:1, marginBottom: 8 }}>
            <FaUserGraduate style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            ATHLETE ACADEMIC/DUAL-PATHWAY PROFILE
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
                    <FaUserAlt style={{marginRight:7}} />{a.name}
                    {atRiskColor(a.gpa,a.absences,a.lateness)==="#FF4848"&&<FaExclamationTriangle style={{color:"#FF4848",marginLeft:5}}/>}
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* GPA Trend */}
            <Card style={{minWidth:380,background:"#182433"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:20,marginBottom:8}}>GPA Trend & Projection</div>
                <ResponsiveContainer width="100%" height={105}>
                  <LineChart>
                    <Line dataKey="GPA" data={athlete.gpa.map((g,i)=>({term:i+1,GPA:g}))} stroke="#1de682" strokeWidth={2} />
                    {scenario.compare.map((s,idx)=>(
                      <Line key={idx} dataKey={`GPA${idx+1}`} data={athlete.gpa.map((g,i)=>({term:i+1,[`GPA${idx+1}`]:g+(s.delta||0)}))} stroke={["#FFD700","#FF4848","#1de682"][idx%3]} strokeDasharray="3 3"/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{marginTop:5, fontWeight:700, color:"#FFD700"}}>
                  Latest: <span style={{color:atRisk}}>{athlete.gpa[11]}</span> | Projected: <span style={{color:"#FFD700"}}>{(athlete.gpa[11]+(scenario.compare.slice(-1)[0]?.delta||0)).toFixed(2)}</span>
                  | Percentile: <span style={{color:"#1de682"}}>{percentile(athlete.gpa[11],athletes.map(a=>a.gpa[11]))}%</span>
                  | Pathway: <span style={{color:"#FFD700"}}>{athlete.pathway}</span> | Sport: <span style={{color:"#FFD700"}}>{athlete.sport}</span>
                  {invisibleAcademic(athlete)&&<span style={{color:"#FF4848",marginLeft:8}}><FaExclamationTriangle/> Invisible Academic Risk</span>}
                </div>
              </CardContent>
            </Card>
            {/* Absence/Lateness */}
            <Card style={{minWidth:230,background:"#181e23"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:20,marginBottom:8}}>Absence/Lateness Trend</div>
                <ResponsiveContainer width="100%" height={72}>
                  <BarChart data={athlete.absences.map((a,i)=>({term:i+1,Absence:a,Late:athlete.lateness[i]}))}>
                    <Bar dataKey="Absence" stackId="a" fill="#FF4848"/>
                    <Bar dataKey="Late" stackId="a" fill="#FFD700"/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{color:"#FFD700",fontWeight:600}}>Total absences (last 3): {athlete.absences.slice(-3).reduce((x,y)=>x+y,0)}</div>
              </CardContent>
            </Card>
            {/* Milestones */}
            <Card style={{minWidth:220,background:"#232b39"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:18,marginBottom:8}}>Milestones</div>
                <ul style={{fontWeight:700,fontSize:15}}>
                  {athlete.milestones.map((m,i)=>(
                    <li key={i}><FaAward style={{marginRight:6}}/>{m.event} <span style={{color:"#FFD700aa",fontSize:13,marginLeft:7}}>({m.date})</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {/* Pulse/Stress/Goal */}
            <Card style={{minWidth:220,background:"#202a38"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:18,marginBottom:8}}>Academic Pulse</div>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart>
                    <Line dataKey="Confidence" data={athlete.pulse.map((v,i)=>({term:i+1,Confidence:v}))} stroke="#1de682" strokeWidth={2} />
                    <Line dataKey="Stress" data={athlete.stress.map((v,i)=>({term:i+1,Stress:v}))} stroke="#FF4848" strokeWidth={2} />
                    <Line dataKey="Clarity" data={athlete.goal.map((v,i)=>({term:i+1,Clarity:v}))} stroke="#FFD700" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{color:"#FFD700",fontWeight:600}}>
                  Confidence: <span style={{color:"#1de682"}}>{athlete.pulse[11]}</span> | Stress: <span style={{color:"#FF4848"}}>{athlete.stress[11]}</span> | Clarity: <span style={{color:"#FFD700"}}>{athlete.goal[11]}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Subject Grades Heatmap */}
          <Card style={{marginTop:8}}>
            <CardContent>
              <div style={{fontWeight:800,color:"#FFD700",fontSize:18,marginBottom:6}}>Subject Grades (last 12 terms)</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr>
                    <th style={{color:"#FFD700",fontWeight:700}}>Subject</th>
                    {athlete.gpa.map((_,i)=><th key={i} style={{color:"#1de682",fontWeight:700}}>{i+1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {athlete.subjects.map(sub=>(
                    <tr key={sub.name}>
                      <td style={{fontWeight:700,color:"#FFD700"}}>{sub.name}</td>
                      {sub.grades.map((g,i)=>(
                        <td key={i} style={{color:g<3?"#FF4848":g<4?"#FFD700":"#1de682",fontWeight:g>=4?800:600}}>{g}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ANALYTICS TAB */}
      {tab==="analytics" && (
        <motion.div key="analytics" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, letterSpacing:1, marginBottom: 8 }}>
            <FaChartLine style={{ marginRight: 12, fontSize: 30, color: "#1de682", verticalAlign: 'middle' }} />
            CLUB ACADEMIC & DUAL-PATHWAY ANALYTICS
          </h2>
          <Card>
            <CardContent>
              <div style={{fontWeight:800,color:"#FFD700",fontSize:20,marginBottom:8}}>Cohort GPA Trend</div>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart>
                  {athletes.map((a,i)=>(
                    <Line key={a.id} type="monotone" dataKey={`GPA${i}`} data={a.gpa.map((g,j)=>({term:j+1,[`GPA${i}`]:g}))} stroke={["#1de682","#FFD700","#FF4848","#1de6d1"][i%4]} strokeWidth={2} name={a.name}/>
                  ))}
                </LineChart>
              </ResponsiveContainer>
              {/* Cohort Subject Heatmap */}
              <div style={{marginTop:14, fontWeight:700, color:"#FFD700", fontSize:17}}>Subject Risk Heatmap (last term):</div>
              <table style={{width:"100%",borderCollapse:"collapse",marginTop:4}}>
                <thead>
                  <tr>
                    <th style={{color:"#FFD700",fontWeight:700}}>Subject</th>
                    {athletes.map(a=><th key={a.id} style={{color:"#1de682",fontWeight:700}}>{a.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {["Math","English","Science"].map(subject=>(
                    <tr key={subject}>
                      <td style={{fontWeight:700,color:"#FFD700"}}>{subject}</td>
                      {athletes.map((a,i)=>{
                        const idx = a.subjects.findIndex(s=>s.name===subject);
                        const risk = a.subjects[idx].grades.slice(-3).filter(g=>g<3).length>=2 ? "#FF4848" : a.subjects[idx].grades.slice(-3).filter(g=>g<4).length>=2 ? "#FFD700" : "#1de682";
                        return <td key={i} style={{background:risk,color:"#222b37",fontWeight:800,fontSize:16}}>{a.subjects[idx].grades[11]}</td>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Analytics Badges */}
              <div style={{display:"flex",gap:18,marginTop:8}}>
                <Card style={{background:"#FFD70022",minWidth:160}}>
                  <div style={{fontWeight:800,color:"#FFD700"}}>Top GPA</div>
                  <div style={{color:"#1de682",fontWeight:700,fontSize:18}}>{topGPA(athletes).name} ({topGPA(athletes).gpa[11]})</div>
                </Card>
                <Card style={{background:"#1de68222",minWidth:160}}>
                  <div style={{fontWeight:800,color:"#FFD700"}}>Most Improved</div>
                  <div style={{color:"#1de682",fontWeight:700,fontSize:18}}>{mostImproved(athletes).name}</div>
                </Card>
                <Card style={{background:"#FF484822",minWidth:160}}>
                  <div style={{fontWeight:800,color:"#FFD700"}}>Most At Risk</div>
                  <div style={{color:"#FF4848",fontWeight:700,fontSize:18}}>{athletes.filter(a=>a.atRisk)[0]?.name}</div>
                </Card>
                <Card style={{background:"#FFD70033",minWidth:160}}>
                  <div style={{fontWeight:800,color:"#FFD700"}}>Invisible Academic</div>
                  <div style={{color:"#FF4848",fontWeight:700,fontSize:18}}>{athletes.find(a=>invisibleAcademic(a))?.name||"--"}</div>
                </Card>
              </div>
              <div style={{marginTop:10,fontWeight:700,color:"#FFD700",fontSize:17}}>
                Dual Pathway Breakdown:
                <ul>
                  {athletes.map(a=>
                    <li key={a.id} style={{color:a.sport==="Pro"?"#FFD700":"#1de682"}}>
                      {a.name}: <FaUserGraduate/> {a.pathway} <FaUserTie/> {a.sport}
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* SCENARIO TAB */}
      {tab==="scenario" && (
        <motion.div key="scenario" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, letterSpacing:1, marginBottom: 8 }}>
            <FaLightbulb style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            SCENARIO LAB: DUAL-PATHWAY SIMULATION
          </h2>
          <Card>
            <CardContent>
              <div style={{fontWeight:800,color:"#FFD700",fontSize:18,marginBottom:10}}>
                Simulate: 
                <Button size="sm" style={{ background: "#FF4848", marginLeft: 10 }} onClick={()=>runScenario('grades','Grades Drop')}>Grades Drop</Button>
                <Button size="sm" style={{ background: "#FFD700", marginLeft: 8 }} onClick={()=>runScenario('absences','Absence Spike')}>Absence Spike</Button>
                <Button size="sm" style={{ background: "#1de682", marginLeft: 8 }} onClick={()=>runScenario('improve','Breakthrough')}>Breakthrough</Button>
                <Button size="sm" style={{ background: "#1de6d1", marginLeft: 8 }} onClick={()=>runScenario('examoverlap','Exam Overlap')}>Exam Overlap</Button>
                <Button size="sm" style={{ background: "#232b39", color:"#FFD700", border:'1.3px solid #FFD700', marginLeft: 8 }} onClick={()=>runScenario('pro','Pro Offer')}>Pro Offer</Button>
                <Button size="sm" style={{ background: "#232b39", color:"#FFD700", border:'1.3px solid #FFD700', marginLeft: 8 }} onClick={()=>runScenario('injury','Injury')}>Injury</Button>
                <Button size="sm" style={{ background: "#FFD70011", color:"#FFD700", border:'1.3px solid #FFD700', marginLeft: 8 }} onClick={resetCompare}>Reset Compare</Button>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <LineChart>
                  <Line dataKey="GPA" data={athlete.gpa.map((g,i)=>({term:i+1,GPA:g}))} stroke="#1de682" strokeWidth={2}/>
                  {scenario.compare.map((s,idx)=>(
                    <Line key={idx} dataKey={`GPA${idx+1}`} data={athlete.gpa.map((g,i)=>({term:i+1,[`GPA${idx+1}`]:g+(s.delta||0)}))} stroke={["#FFD700","#FF4848","#1de682","#1de6d1"][idx%4]} strokeDasharray="3 3"/>
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <div style={{color:"#FFD700",marginTop:8,fontWeight:700}}>
                {scenario.compare.slice(-1)[0]?.type==="grades"&&"AI Rec: Trigger parent meeting, add study support, reduce game load temporarily."}
                {scenario.compare.slice(-1)[0]?.type==="absences"&&"AI Rec: Immediate check-in, review root cause, involve mentor."}
                {scenario.compare.slice(-1)[0]?.type==="improve"&&"AI Rec: Offer advanced class, reward, maintain routines."}
                {scenario.compare.slice(-1)[0]?.type==="examoverlap"&&"AI Rec: Schedule flexibility, communicate with teachers, rest for games."}
                {scenario.compare.slice(-1)[0]?.type==="pro"&&"AI Rec: University/club/pro decision session, mental coach check-in, ensure backup plan."}
                {scenario.compare.slice(-1)[0]?.type==="injury"&&"AI Rec: Activate tutoring support, flexible deadlines, psychological check-in."}
              </div>
              <div style={{color:"#FFD700",fontWeight:600,marginTop:10}}>
                Scenario Log:
                <ul>
                  {scenario.runs.map((s, i) => (
                    <li key={i}><FaHistory style={{ marginRight:5 }}/> [{s.date}] {s.label}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          {/* Intervention/Workflow */}
          <Card style={{marginTop:10,background:"#1a2334"}}>
            <CardContent>
              <div style={{color:"#FFD700",fontWeight:700,fontSize:18}}>Intervention/Workflow</div>
              <div style={{marginBottom:5}}>
                <input type="text" placeholder="Describe action..." style={{width:"58%",padding:6,borderRadius:6,border:"1.3px solid #FFD700",marginRight:6}} id="actioninput"/>
                <select id="assign" style={{padding:4,borderRadius:6,border:"1.3px solid #FFD700"}}>
                  <option value="Coach">Coach</option>
                  <option value="Athlete">Athlete</option>
                  <option value="Parent">Parent</option>
                  <option value="Tutor">Tutor</option>
                </select>
                <Button size="sm" onClick={()=>{
                  const desc = document.getElementById('actioninput').value;
                  const assign = document.getElementById('assign').value;
                  if(desc.length) addIntervention(desc,assign);
                  document.getElementById('actioninput').value='';
                }}>Add</Button>
              </div>
              <ul>
                {interventions.filter(i=>i.athlete===athlete.name).map((a, idx) => (
                  <li key={idx} style={{ color: a.status==="Resolved"?"#1de682":a.status==="Open"?"#FFD700":"#FF4848", marginBottom: 3, fontSize: 15 }}>
                    <FaCheckCircle style={{ marginRight: 6 }} />[{a.assign}] {a.desc} — <b>{a.status}</b> <span style={{ color:"#FFD700aa",fontSize:13,marginLeft:6 }}>({a.date})</span>
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
            BOARDROOM REPORT: ACADEMIC & DUAL PATHWAY
          </h2>
          <Card>
            <CardContent>
              <Button style={{ background: "#FFD700", color: "#23292f", fontWeight: 700, fontSize: 15, borderRadius: 11 }} onClick={handleExport}>
                <FaDownload style={{ marginRight: 6 }} /> Export Boardroom Snapshot (PDF)
              </Button>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18 }}>
                <thead>
                  <tr>
                    <th style={{color:"#FFD700",fontWeight:700}}>Athlete</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Latest GPA</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Pathway</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Sport</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>At Risk?</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, idx) => (
                    <tr key={a.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{a.name}</td>
                      <td style={{ color: atRiskColor(a.gpa,a.absences,a.lateness), fontWeight:700 }}>{a.gpa[11]}</td>
                      <td style={{ color:"#FFD700", fontWeight: 700 }}>{a.pathway}</td>
                      <td style={{ color:"#1de682", fontWeight: 700 }}>{a.sport}</td>
                      <td style={{ color: atRiskColor(a.gpa,a.absences,a.lateness), fontWeight: 700 }}>
                        {atRiskColor(a.gpa,a.absences,a.lateness)==="#FF4848"?"YES":"NO"}
                        {invisibleAcademic(a)&&<span style={{color:"#FF4848",marginLeft:7}}><FaExclamationTriangle/> Invisible Academic</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Boardroom Cohort Map */}
              <div style={{marginTop:18,fontWeight:700,color:"#FFD700",fontSize:18}}>Cohort Map</div>
              <table style={{width:"100%",borderCollapse:"collapse",marginTop:4}}>
                <thead>
                  <tr>
                    <th style={{color:"#FFD700",fontWeight:700}}>Athlete</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Milestones</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map(a=>(
                    <tr key={a.id}>
                      <td style={{fontWeight:700,color:"#FFD700"}}>{a.name}</td>
                      <td>
                        {a.milestones.map((m,i)=>(
                          <span key={i} style={{marginRight:8}}><FaCalendarAlt/> {m.event} ({m.date})</span>
                        ))}
                      </td>
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

export default AcademicDualPathwayProgressSuite;
