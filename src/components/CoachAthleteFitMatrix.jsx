// CoachAthleteFitMatrix.jsx (ULTRA ENRICHED)
import React, { useState } from 'react';
import { FaUserTie, FaUserGraduate, FaUsers, FaHandshake, FaComments, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaLightbulb, FaClipboardList, FaTrophy, FaRobot, FaDownload, FaHistory, FaCheckCircle, FaChartLine, FaTimes, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Fallback Card/Button Components ---
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
const FIT_FACTORS = [
  "Trust",
  "Communication",
  "Style Alignment",
  "Motivation Match",
  "Feedback Quality",
  "Conflict Frequency",
  "Value Congruence"
];
const ATHLETES = [
  { id: 1, name: "Luka Vuković" },
  { id: 2, name: "Ivan Horvat" },
  { id: 3, name: "Marko Jurić" },
  { id: 4, name: "Petar Božić" },
  { id: 5, name: "Kristijan Pavlović" }
];
const COACHES = [
  { id: 1, name: "Coach S. Petrović" },
  { id: 2, name: "Coach T. Ivanković" }
];
const PARENTS = [
  { id: 1, name: "M. Vuković" },
  { id: 2, name: "B. Horvat" },
  { id: 3, name: "D. Jurić" },
  { id: 4, name: "I. Božić" },
  { id: 5, name: "K. Pavlović" }
];
// Generate a history for each relationship, simulate trend
const RELATIONSHIPS = [
  {
    id: 1, athlete: 1, coach: 1, parent: 1,
    fit: [82,85,81,83,80,79,77],
    factors: [4,4,4,5,4,1,3],
    history: Array.from({length:12}, (_,i)=>82-2*i+Math.round(Math.random()*3)),
    surveys: [], actions: [], notes: [], log: [], scenarios: []
  },
  {
    id: 2, athlete: 2, coach: 1, parent: 2,
    fit: [69,70,68,67,69,65,63],
    factors: [3,2,2,4,3,3,2],
    history: Array.from({length:12}, (_,i)=>69-3*i+Math.round(Math.random()*4)),
    surveys: [], actions: [], notes: [], log: [], scenarios: []
  },
  {
    id: 3, athlete: 3, coach: 2, parent: 3,
    fit: [93,91,92,94,93,92,95],
    factors: [5,5,4,5,5,1,5],
    history: Array.from({length:12}, (_,i)=>93-Math.round(Math.random()*2)),
    surveys: [], actions: [], notes: [], log: [], scenarios: []
  },
  {
    id: 4, athlete: 4, coach: 2, parent: 4,
    fit: [62,64,61,60,62,63,61],
    factors: [2,2,3,3,2,4,2],
    history: Array.from({length:12}, (_,i)=>62-3*i+Math.round(Math.random()*5)),
    surveys: [], actions: [], notes: [], log: [], scenarios: []
  },
  {
    id: 5, athlete: 5, coach: 1, parent: 5,
    fit: [85,86,87,87,86,88,89],
    factors: [5,4,4,4,4,2,4],
    history: Array.from({length:12}, (_,i)=>85+Math.round(Math.random()*2)),
    surveys: [], actions: [], notes: [], log: [], scenarios: []
  }
];

// --- Helper/Analytics ---
function getStatus(val) {
  if (val >= 90) return { label: "Breakthrough", color: "#1de682" };
  if (val >= 80) return { label: "Stable", color: "#FFD700" };
  if (val >= 70) return { label: "Monitor", color: "#FFD700cc" };
  return { label: "Risk", color: "#FF4848" };
}
function fitRiskLabel(factors) {
  if (factors[5] >= 4 || factors[0] <= 2 || factors[1] <= 2) return <FaExclamationTriangle style={{ color: "#FF4848", marginLeft: 5 }} />;
  if (factors[0] >= 4 && factors[5] <= 2) return <FaTrophy style={{ color: "#1de682", marginLeft: 5 }} />;
  return null;
}
function fitAIrecommend(factors) {
  let out = [];
  if (factors[5] >= 4) out.push("Urgent: Conflict mediation—neutral session recommended.");
  if (factors[1] <= 2) out.push("Increase structured communication (check-ins, post-game).");
  if (factors[0] <= 2) out.push("Build trust: start low-pressure 1:1 sessions.");
  if (factors[3] <= 2) out.push("Motivation misfit: review athlete/coach goals.");
  if (!out.length) out.push("Relationship healthy. Maintain check-ins & feedback loops.");
  return out;
}
function getPercentile(val, arr) {
  let sorted = [...arr].sort((a,b)=>a-b);
  let idx = sorted.findIndex(x => val <= x);
  return Math.round(100*(1-idx/(arr.length-1)));
}
function scenarioImpact(factors, change) {
  return factors.map((v, i) => Math.max(1, Math.min(5, v + (change[i] || 0))));
}
function fitFromFactors(factors) {
  return Math.round(factors.reduce((a, b) => a + b * 20, 0) / factors.length);
}

// --- Components ---
const SurveyBar = ({ value, setValue, disabled }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} onClick={() => !disabled && setValue(n)}
        style={{
          display: "inline-block",
          width: 22,
          height: 22,
          borderRadius: 11,
          marginRight: 4,
          background: value === n ? "#FFD700" : "#1a263a",
          border: value === n ? "2.5px solid #1de682" : "1.5px solid #FFD70077",
          color: value === n ? "#181e23" : "#FFD700",
          fontWeight: 900,
          fontSize: 13,
          textAlign: "center",
          lineHeight: "22px",
          cursor: disabled ? "default" : "pointer"
        }}
      >{n}</span>
    ))}
  </div>
);

// --- Main Component ---
const CoachAthleteFitMatrix = () => {
  const [relationships, setRelationships] = useState(RELATIONSHIPS);
  const [viewIdx, setViewIdx] = useState(0);
  const [perspective, setPerspective] = useState('coach'); // 'coach', 'athlete', 'parent'
  const [note, setNote] = useState('');
  const [log, setLog] = useState('');
  const [scenario, setScenario] = useState({ type: null, label: '', changes: [0,0,0,0,0,0,0], logs: [], compare: [] });
  const [survey, setSurvey] = useState(Array(7).fill(3));
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // -- Survey submit
  const submitSurvey = () => {
    let rel = { ...relationships[viewIdx] };
    rel.surveys = [...rel.surveys, { by: perspective, values: survey, date: new Date().toLocaleString() }];
    rel.factors = survey;
    rel.fit[6] = fitFromFactors(survey);
    rel.history = [...rel.history.slice(1), fitFromFactors(survey)];
    let arr = [...relationships];
    arr[viewIdx] = rel;
    setRelationships(arr);
    setSurveySubmitted(true);
    setTimeout(()=>setSurveySubmitted(false),1800);
  };

  // -- Scenario engine
  const handleScenario = (type, label) => {
    let changes = [0,0,0,0,0,0,0];
    if (type==='conflict') changes = [-8,-6,-6,-4,-7,3,-7];
    if (type==='motivation') changes = [-2,-2,-3,-8,-3,1,-3];
    if (type==='style') changes = [-4,-2,-8,-4,-4,1,-8];
    if (type==='recover') changes = [5,4,2,3,5,-2,3];
    setScenario({ ...scenario, type, label, changes, logs: [...scenario.logs, {type,label,date:new Date().toLocaleString()}], compare: [...scenario.compare, {type, label, changes}] });
  };
  const handleSaveScenario = () => {
    const label = prompt("Scenario description?");
    if (!label) return;
    handleScenario(scenario.type, label);
  };
  const resetCompare = () => setScenario({ ...scenario, compare: [] });

  // -- Interventions/actions
  const addAction = (desc, assign) => {
    let rel = { ...relationships[viewIdx] };
    rel.actions = [...rel.actions, {
      desc, assign, status: "Open", date: new Date().toLocaleString()
    }];
    let arr = [...relationships];
    arr[viewIdx] = rel;
    setRelationships(arr);
  };
  const setActionStatus = (i, status) => {
    let rel = { ...relationships[viewIdx] };
    rel.actions[i].status = status;
    let arr = [...relationships];
    arr[viewIdx] = rel;
    setRelationships(arr);
  };

  // -- Notes/Log
  const addNote = () => {
    let rel = { ...relationships[viewIdx] };
    rel.notes = [...rel.notes, { text: note, date: new Date().toLocaleString(), role: perspective }];
    let arr = [...relationships];
    arr[viewIdx] = rel;
    setRelationships(arr);
    setNote('');
  };
  const addLog = () => {
    let rel = { ...relationships[viewIdx] };
    rel.log = [...rel.log, { text: log, date: new Date().toLocaleString(), role: perspective }];
    let arr = [...relationships];
    arr[viewIdx] = rel;
    setRelationships(arr);
    setLog('');
  };

  // -- Boardroom Export
  const handleExport = () => { window.print(); };

  // -- Navigation for large heatmap
  const [heatmapPage, setHeatmapPage] = useState(0);

  // -- Analytics
  const allFit = relationships.map(r=>r.fit[6]);
  const topFit = relationships.reduce((a,b)=>a.fit[6]>b.fit[6]?a:b);
  const lowFit = relationships.reduce((a,b)=>a.fit[6]<b.fit[6]?a:b);
  const improved = relationships.reduce((a,b)=>b.history[11]-b.history[0] > a.history[11]-a.history[0] ? b : a, relationships[0]);

  // -- AI badge (rationale)
  const badge = fit => {
    if (fit>=90) return "Breakthrough: Relational alignment, strong trust.";
    if (fit<=65) return "Critical: Mismatch or active conflict.";
    return "Stable or monitor.";
  };

  const active = relationships[viewIdx];

  // -- Render
  return (
    <div style={{ padding: 24 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 8 }}>
        <Button onClick={() => setPerspective('coach')} style={{ background: perspective==='coach'?'#FFD700':'#1de682', color: perspective==='coach'?'#181e23':'#232', fontWeight:900 }}>Coach View</Button>
        <Button onClick={() => setPerspective('athlete')} style={{ background: perspective==='athlete'?'#FFD700':'#1de682', color: perspective==='athlete'?'#181e23':'#232', fontWeight:900 }}>Athlete View</Button>
        <Button onClick={() => setPerspective('parent')} style={{ background: perspective==='parent'?'#FFD700':'#1de682', color: perspective==='parent'?'#181e23':'#232', fontWeight:900 }}>Parent View</Button>
        <Button onClick={handleExport} style={{ marginLeft: 'auto', background: "#FFD700" }}><FaDownload style={{ marginRight:6 }}/> Export PDF</Button>
      </div>
      <AnimatePresence>
      {/* Main Relationship Section */}
      <motion.div key="main" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <h2 style={{ fontSize: 30, color: '#FFD700', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>
          <FaHandshake style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
          COACH-ATHLETE FIT & RELATIONSHIP MATRIX
        </h2>
        <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
          {/* Relationship List */}
          <Card style={{ minWidth: 225, background: "#202a38" }}>
            <CardContent>
              <div style={{ fontWeight: 700, marginBottom: 12, color: "#FFD700", fontSize: 18 }}>Relationships</div>
              <div>
                {relationships.slice(heatmapPage*5,heatmapPage*5+5).map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div onClick={() => setViewIdx(i+heatmapPage*5)} style={{
                      background: viewIdx === i+heatmapPage*5 ? "#FFD70033" : "none",
                      color: viewIdx === i+heatmapPage*5 ? "#FFD700" : "#fff",
                      padding: "8px 10px",
                      fontWeight: 600,
                      borderRadius: 10,
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: viewIdx === i+heatmapPage*5 ? "2px solid #FFD700" : "1px solid #293949"
                    }}>
                      <span>
                        <FaUserGraduate style={{ marginRight: 6, fontSize: 16, verticalAlign: "middle" }} />
                        {ATHLETES.find(a => a.id === r.athlete).name} & <FaUserTie style={{ margin: "0 6px", fontSize: 15, verticalAlign: "middle" }} />{COACHES.find(c => c.id === r.coach).name}
                        {fitRiskLabel(r.factors)}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {relationships.length>5 && (
                  <div style={{marginTop:10,display:"flex",gap:8}}>
                    <Button size="sm" onClick={()=>setHeatmapPage(Math.max(0,heatmapPage-1))} disabled={heatmapPage===0}><FaChevronLeft/></Button>
                    <Button size="sm" onClick={()=>setHeatmapPage(Math.min(Math.floor(relationships.length/5),heatmapPage+1))} disabled={heatmapPage===Math.floor(relationships.length/5)}><FaChevronRight/></Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Matrix, Survey, Scenario */}
          <Card style={{ minWidth: 380, background: "#182433", color: "#fff", flex: 1 }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 8 }}>Fit Matrix ({perspective} perspective)</div>
              <ResponsiveContainer width="100%" height={170}>
                <RadarChart cx="50%" cy="50%" outerRadius={74} data={FIT_FACTORS.map((f, i) => ({
                  factor: f,
                  score: active.factors[i]+(scenario.changes[i]||0)
                }))}>
                  <PolarGrid stroke="#FFD70033" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: "#FFD700", fontWeight: 700, fontSize: 14 }} />
                  <PolarRadiusAxis angle={30} domain={[1,5]} tick={{ fill: "#1de682", fontWeight: 700 }} />
                  <Radar name="Fit" dataKey="score" stroke="#1de682" fill="#1de682" fillOpacity={0.18} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 7, color: "#FFD700", fontWeight:700 }}>
                Current Fit: <span style={{ color:getStatus(active.fit[6]).color,fontWeight:900 }}>{active.fit[6]}</span> – {getStatus(active.fit[6]).label}
                <span style={{ color:"#1de682", marginLeft:16 }}>Percentile: {getPercentile(active.fit[6], allFit)}%</span>
              </div>
              <div style={{ marginTop: 6, color: "#FFD700", fontWeight:700 }}>
                AI Recommendation:
                <ul>{fitAIrecommend(active.factors).map((r,i)=><li key={i} style={{color:"#1de682",fontWeight:600}}>{r}</li>)}</ul>
              </div>
            </CardContent>
          </Card>
          {/* Fit Trend/Sparkline */}
          <Card style={{ minWidth: 185, background: "#181e23", color: "#fff" }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 18, marginBottom: 5 }}>Fit Trend</div>
              <ResponsiveContainer width="100%" height={52}>
                <LineChart data={active.history.map((val,i)=>({month:i+1,Fit:val}))}>
                  <Line type="monotone" dataKey="Fit" stroke="#1de682" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ fontWeight:600, color:"#FFD700" }}>
                {active.history[11]>active.history[0] ? <FaArrowUp style={{ color:"#1de682" }}/> : <FaArrowDown style={{ color:"#FF4848" }}/>} 
                {active.history[11]>active.history[0] ? "Improving" : "Declining"}
              </div>
            </CardContent>
          </Card>
          {/* Survey Engine */}
          <Card style={{ minWidth: 320, background: "#232b39", color: "#fff" }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 18, marginBottom: 5 }}>Quick Pulse Survey</div>
              {FIT_FACTORS.map((f,i)=>
                <div key={f} style={{marginBottom:3}}>
                  <span style={{color:"#FFD700",fontWeight:700}}>{f}</span>
                  <SurveyBar value={survey[i]} setValue={v=>{let x=[...survey];x[i]=v;setSurvey(x);}} disabled={surveySubmitted}/>
                </div>
              )}
              <Button size="sm" onClick={submitSurvey} disabled={surveySubmitted} style={{marginTop:4}}>
                {surveySubmitted ? <FaCheckCircle style={{marginRight:5}}/> : null}
                {surveySubmitted ? "Submitted" : "Submit Survey"}
              </Button>
              <div style={{marginTop:3, color:"#1de682", fontWeight:600}}>
                {surveySubmitted && "Survey received. Matrix and trend updated."}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Scenario & Compare */}
        <div style={{display:"flex",gap:16,marginTop:8}}>
          <Card style={{ minWidth: 320, background: "#232b39", color: "#fff" }}>
            <CardContent>
              <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 18, marginBottom: 5 }}>Scenario Lab</div>
              <div>
                <Button size="sm" style={{ background: "#FF4848", marginBottom:3 }} onClick={()=>handleScenario('conflict','Conflict Increase')}>+ Conflict</Button>
                <Button size="sm" style={{ background: "#FFD700", marginBottom:3 }} onClick={()=>handleScenario('motivation','Motivation Drop')}>Motivation ↓</Button>
                <Button size="sm" style={{ background: "#1de682", marginBottom:3 }} onClick={()=>handleScenario('style','Style Mismatch')}>Style Mismatch</Button>
                <Button size="sm" style={{ background: "#232b39", color:"#FFD700", border:'1.3px solid #FFD700', marginBottom:3 }} onClick={()=>handleScenario('recover','Recovery')}>Recover</Button>
                <Button size="sm" style={{ background: "#232b39", color:"#FFD700", border:'1.3px solid #FFD700', marginBottom:3 }} onClick={handleSaveScenario}><FaClipboardList/> Save Scenario</Button>
                <Button size="sm" style={{ background: "#FFD70011", color:"#FFD700", border:'1.3px solid #FFD700', marginBottom:3 }} onClick={resetCompare}><FaTimes/> Reset Compare</Button>
              </div>
              <div style={{color:"#FFD700",fontWeight:600,marginTop:8}}>Compare Scenarios (up to 3):</div>
              <ResponsiveContainer width="100%" height={64}>
                <LineChart>
                  <Line dataKey="Fit" data={active.history.map((v,i)=>({month:i+1,Fit:v}))} stroke="#1de682" strokeWidth={2} name="Current"/>
                  {scenario.compare.map((s, idx) => (
                    <Line key={idx}
                      data={active.history.map((_,i)=>({month:i+1,Fit:fitFromFactors(scenarioImpact(active.factors, s.changes))}))}
                      stroke={["#FFD700","#FF4848","#1de682"][idx%3]}
                      strokeDasharray="3 3"
                      name={s.label}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <div style={{ color:"#FFD700", fontWeight:600,marginTop:6 }}>Scenario Log:
                <ul>
                  {scenario.logs.map((s, i) => (
                    <li key={i}><FaHistory style={{ marginRight:5 }}/> [{s.date}] {s.label}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          {/* Actions/Workflow */}
          <Card style={{ minWidth: 340, background: "#222b37" }}>
            <CardContent>
              <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Action Plan/Workflow</div>
              <div style={{marginBottom:5}}>
                <input type="text" placeholder="Describe next step..." style={{width:"68%",padding:6,borderRadius:6,border:"1.3px solid #FFD700",marginRight:6}}
                  id="actioninput"
                />
                <select id="assign" style={{padding:4,borderRadius:6,border:"1.3px solid #FFD700"}}>
                  <option value="Coach">Coach</option>
                  <option value="Athlete">Athlete</option>
                  <option value="Parent">Parent</option>
                </select>
                <Button size="sm" onClick={()=>{
                  const desc = document.getElementById('actioninput').value;
                  const assign = document.getElementById('assign').value;
                  if(desc.length) addAction(desc,assign);
                  document.getElementById('actioninput').value='';
                }}>Add</Button>
              </div>
              <ul>
                {active.actions.map((a, idx) => (
                  <li key={idx} style={{ color: a.status==="Resolved"?"#1de682":a.status==="Open"?"#FFD700":"#FF4848", marginBottom: 3, fontSize: 15 }}>
                    <FaLightbulb style={{ marginRight: 6 }} />[{a.assign}] {a.desc} — <b>{a.status}</b> <span style={{ color:"#FFD700aa",fontSize:13,marginLeft:6 }}>({a.date})</span>
                    {a.status!=="Resolved" && <Button size="sm" style={{marginLeft:6}} onClick={()=>setActionStatus(idx,"Resolved")}>Resolve</Button>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        {/* Notes & Log */}
        <div style={{ display: 'flex', gap: 18, marginTop:8 }}>
          <Card style={{ minWidth: 340, background: "#222b37" }}>
            <CardContent>
              <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Notes</div>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add note..."
                style={{ width: "100%", borderRadius: 6, padding: 8, border: "1.3px solid #FFD700" }}
              />
              <Button size="sm" onClick={addNote} style={{ marginTop: 4 }}>Add Note ({perspective})</Button>
              <ul>
                {active.notes.map((note, idx) => (
                  <li key={idx} style={{ color: note.role==='coach'?"#FFD700":note.role==='athlete'?"#1de682":"#22df82", marginBottom: 3, fontSize: 15 }}>
                    <FaComments style={{ marginRight: 6 }} /> [{note.role}] {note.text}
                    <span style={{ color: "#FFD700aa", fontSize: 13, marginLeft: 7 }}>({note.date})</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card style={{ minWidth: 320, background: "#232b39" }}>
            <CardContent>
              <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 18 }}>Intervention Log</div>
              <textarea
                rows={2}
                value={log}
                onChange={e => setLog(e.target.value)}
                placeholder="Action taken..."
                style={{ width: "100%", borderRadius: 6, padding: 8, border: "1.3px solid #FFD700" }}
              />
              <Button size="sm" onClick={addLog} style={{ marginTop: 4 }}>Add Log ({perspective})</Button>
              <ul>
                {active.log.map((l, idx) => (
                  <li key={idx} style={{ color: l.role==='coach'?"#FFD700":l.role==='athlete'?"#1de682":"#22df82", marginBottom: 3, fontSize: 15 }}>
                    <FaLightbulb style={{ marginRight: 6 }} /> [{l.role}] {l.text}
                    <span style={{ color: "#FFD700aa", fontSize: 13, marginLeft: 7 }}>({l.date})</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        {/* Heatmap/Analytics */}
        <Card style={{ background: "#181e23", marginTop:18 }}>
          <CardContent>
            <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 20, marginBottom: 12 }}>Team Relationship Heatmap (Latest Fit)</div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom:14 }}>
              <thead>
                <tr>
                  <th style={{ color: "#FFD700", fontWeight: 700 }}>Athlete</th>
                  <th style={{ color: "#1de682", fontWeight: 700 }}>Coach</th>
                  <th style={{ color: "#FFD700", fontWeight: 700 }}>Fit</th>
                  <th style={{ color: "#FFD700", fontWeight: 700 }}>Status</th>
                  <th style={{ color: "#FFD700", fontWeight: 700 }}>AI Badge</th>
                </tr>
              </thead>
              <tbody>
                {relationships.slice(heatmapPage*5,heatmapPage*5+5).map((r, idx) => (
                  <tr key={r.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                    <td style={{ fontWeight: 700, color: "#FFD700" }}>{ATHLETES.find(a=>a.id===r.athlete).name}</td>
                    <td style={{ fontWeight: 700, color: "#FFD700" }}>{COACHES.find(c=>c.id===r.coach).name}</td>
                    <td style={{ color: getStatus(r.fit[6]).color, fontWeight:700 }}>{r.fit[6]}</td>
                    <td style={{ color: getStatus(r.fit[6]).color, fontWeight: 700 }}>{getStatus(r.fit[6]).label}</td>
                    <td style={{ color: getStatus(r.fit[6]).color, fontWeight: 700 }}>
                      {r.fit[6]>=90 ? "Breakthrough" : r.fit[6]<=65 ? "At-Risk" : "Stable"} <span style={{color:"#FFD70099",marginLeft:5}}>{badge(r.fit[6])}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:"flex", gap:22 }}>
              <Card style={{ background:"#FFD70022", minWidth:160, textAlign:"center" }}>
                <div style={{ fontWeight:800, color:"#FFD700" }}>Top Fit</div>
                <div style={{ color:"#1de682", fontWeight:700, fontSize:20 }}>{ATHLETES.find(a=>a.id===topFit.athlete).name} & {COACHES.find(c=>c.id===topFit.coach).name} ({topFit.fit[6]})</div>
              </Card>
              <Card style={{ background:"#FF484822", minWidth:160, textAlign:"center" }}>
                <div style={{ fontWeight:800, color:"#FFD700" }}>Lowest Fit</div>
                <div style={{ color:"#FF4848", fontWeight:700, fontSize:20 }}>{ATHLETES.find(a=>a.id===lowFit.athlete).name} & {COACHES.find(c=>c.id===lowFit.coach).name} ({lowFit.fit[6]})</div>
              </Card>
              <Card style={{ background:"#1de68222", minWidth:160, textAlign:"center" }}>
                <div style={{ fontWeight:800, color:"#FFD700" }}>Most Improved</div>
                <div style={{ color:"#1de682", fontWeight:700, fontSize:20 }}>{ATHLETES.find(a=>a.id===improved.athlete).name} & {COACHES.find(c=>c.id===improved.coach).name}</div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CoachAthleteFitMatrix;
