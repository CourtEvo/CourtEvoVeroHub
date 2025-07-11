import React, { useState } from 'react';
import { FaHeartbeat, FaExclamationTriangle, FaUserInjured, FaRegClock, FaClipboardCheck, FaStethoscope, FaUserMd, FaRunning, FaCogs, FaRobot, FaHistory, FaFileDownload, FaUserTie, FaNotesMedical, FaCalendarCheck, FaBullseye, FaCheckCircle, FaBolt, FaBell, FaEnvelope, FaArrowDown, FaArrowUp, FaBed, FaTint, FaSmile, FaFrown } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

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

// --- DEMO DATA (Upgraded) ---
const ATHLETES = [
  { id:1, name:"Luka Vuković", pos:"PG", age:17, fatigue:[44,39,41,55,60,48,42,46,39,35,28,33], recovery:[72,77,73,62,58,66,74,78,79,82,87,91], risk:[14,11,16,23,29,18,10,13,11,7,6,5], compliance:[1,1,1,0,0,1,1,1,1,1,1,1], rtp:0, rtpSteps:[true,true,true,true], injuryHistory:["Hamstring strain (2023-11)", "Mild concussion (2024-02)"], notes:[], interventions:[], alerts:[], voice:[], wellness:{sleep:[8,8,8,7,7,8,8,9,9,8,8,8], hydration:[4,4,4,3,4,4,5,5,5,4,4,4], mood:[4,4,4,3,4,4,4,4,4,5,5,4]} },
  { id:2, name:"Ivan Horvat", pos:"C", age:18, fatigue:[60,62,65,70,72,69,65,62,59,60,62,64], recovery:[55,52,49,41,38,40,46,52,58,62,65,68], risk:[22,27,33,41,49,38,32,26,21,19,18,17], compliance:[1,1,0,0,0,0,1,1,1,1,1,1], rtp:3, rtpSteps:[true,false,false,false], injuryHistory:["Knee sprain (2022-12)"], notes:[], interventions:[], alerts:[], voice:[], wellness:{sleep:[6,7,7,6,6,6,6,7,7,7,7,6], hydration:[3,3,3,2,2,3,3,3,4,3,3,3], mood:[3,3,2,2,2,2,3,3,3,4,4,3]} },
  { id:3, name:"Marko Jurić", pos:"SG", age:17, fatigue:[28,27,29,31,33,30,29,27,25,22,18,16], recovery:[92,96,93,92,90,92,95,96,98,99,99,100], risk:[2,2,2,3,3,2,1,1,1,1,1,1], compliance:[1,1,1,1,1,1,1,1,1,1,1,1], rtp:0, rtpSteps:[true,true,true,true], injuryHistory:[], notes:[], interventions:[], alerts:[], voice:[], wellness:{sleep:[9,9,9,9,9,9,9,9,9,9,9,9], hydration:[5,5,5,5,5,5,5,5,5,5,5,5], mood:[5,5,5,5,5,5,5,5,5,5,5,5]} },
  { id:4, name:"Petar Božić", pos:"SF", age:16, fatigue:[80,82,83,84,83,81,79,76,75,77,78,79], recovery:[33,34,32,30,32,33,33,34,36,38,39,40], risk:[36,38,41,48,52,51,48,44,41,39,38,38], compliance:[1,0,0,0,1,1,1,1,1,1,1,1], rtp:2, rtpSteps:[true,true,false,false], injuryHistory:["Back spasm (2023-10)", "Ankle roll (2024-03)"], notes:[], interventions:[], alerts:[], voice:[], wellness:{sleep:[5,5,5,4,4,4,5,6,6,5,5,5], hydration:[2,2,2,2,2,2,2,2,2,2,2,2], mood:[2,2,2,2,2,2,2,2,2,2,2,2]} }
];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PRO_BENCHMARK = 14; // Risk % for elite clubs

function riskColor(val) {
  if(val>=35) return "#FF4848";
  if(val>=20) return "#FFD700";
  return "#1de682";
}
function statusBadge(val) {
  if(val<=10) return <span style={{color:"#1de682"}}><FaBolt/> Elite Recovery</span>;
  if(val<=20) return <span style={{color:"#FFD700"}}><FaRegClock/> Good</span>;
  if(val<=35) return <span style={{color:"#FFD700"}}><FaRegClock/> Watch</span>;
  return <span style={{color:"#FF4848"}}><FaExclamationTriangle/> At Risk</span>;
}
function injuryBadge(a) {
  if(a.risk[11]>=35) return <span style={{color:"#FF4848"}}><FaUserInjured/> Major Risk</span>;
  if(a.injuryHistory.length>1) return <span style={{color:"#FFD700"}}><FaHistory/> History</span>;
  if(a.rtp>0) return <span style={{color:"#FFD700"}}><FaClipboardCheck/> RTP: {a.rtp} steps</span>;
  return <span style={{color:"#1de682"}}><FaCheckCircle/> Clear</span>;
}
function cohortRisk(athletes) {
  return Math.round(athletes.reduce((a,b)=>a+b.risk[11],0)/athletes.length);
}
function cohortCompliance(athletes) {
  return Math.round(athletes.reduce((a,b)=>a+b.compliance.reduce((x,y)=>x+y,0)/b.compliance.length,0)/athletes.length*100);
}

const HolisticRecoveryInjuryPreventionSuite = () => {
  const [athletes, setAthletes] = useState(ATHLETES);
  const [view, setView] = useState(0);
  const [tab, setTab] = useState("dashboard");
  const [note, setNote] = useState('');
  const [interventions, setInterventions] = useState([]);
  const [voice, setVoice] = useState('');
  const [alerts, setAlerts] = useState([]);
  const athlete = athletes[view];

  // Add note, intervention, voice
  const addNote = () => {
    let arr = [...athletes];
    arr[view].notes = [...arr[view].notes, { text: note, date: new Date().toLocaleString() }];
    setAthletes(arr); setNote('');
  };
  const addVoice = () => {
    let arr = [...athletes];
    arr[view].voice = [...arr[view].voice, { text: voice, date: new Date().toLocaleString() }];
    setAthletes(arr); setVoice('');
  };
  const addIntervention = (desc, assign) => {
    setInterventions([...interventions, { desc, assign, athlete: athlete.name, status:"Open", date: new Date().toLocaleString() }]);
  };
  const setInterventionStatus = (i, status) => {
    let arr = [...interventions];
    arr[i].status = status;
    setInterventions(arr);
  };
  const addAlert = (type, detail) => {
    setAlerts([...alerts, { type, detail, athlete: athlete.name, date: new Date().toLocaleString() }]);
  };
  const handleExport = () => window.print();

  // Auto Alert: if risk threshold exceeded
  React.useEffect(()=>{
    if(athlete.risk[11]>=35) addAlert("Red Flag", "Injury/Fatigue Risk exceeds safe threshold.");
    if(athlete.rtp>0 && !athlete.rtpSteps.every(x=>x)) addAlert("RTP Alert", "Incomplete Return to Play steps.");
  },[view]); // Run on athlete change

  return (
    <div style={{ padding: 24 }}>
      {/* Topboard: Cohort Status */}
      <div style={{display:"flex",gap:26,marginBottom:8}}>
        <div style={{color:"#FFD700",fontWeight:900,fontSize:19}}>Cohort Avg Risk: <span style={{color:cohortRisk(athletes)>PRO_BENCHMARK?"#FF4848":"#1de682"}}>{cohortRisk(athletes)}%</span> <span style={{fontSize:16,color:"#FFD700aa"}}>(Pro Benchmark: {PRO_BENCHMARK}%)</span></div>
        <div style={{color:"#1de682",fontWeight:900,fontSize:19}}>Compliance: <span style={{color:"#FFD700"}}>{cohortCompliance(athletes)}%</span></div>
      </div>
      {/* Tabs */}
      <div style={{ display:"flex", gap:18, marginBottom:8 }}>
        <Button onClick={()=>setTab("dashboard")} style={{ background: tab==="dashboard"?"#FFD700":"#1de682", color:tab==="dashboard"?"#181e23":"#232", fontWeight:900 }}>Dashboard</Button>
        <Button onClick={()=>setTab("deepdive")} style={{ background: tab==="deepdive"?"#FFD700":"#1de682", color:tab==="deepdive"?"#181e23":"#232", fontWeight:900 }}>Athlete Deep Dive</Button>
        <Button onClick={()=>setTab("scenario")} style={{ background: tab==="scenario"?"#FFD700":"#1de682", color:tab==="scenario"?"#181e23":"#232", fontWeight:900 }}>Scenario Lab</Button>
        <Button onClick={()=>setTab("report")} style={{ background: tab==="report"?"#FFD700":"#1de682", color:tab==="report"?"#181e23":"#232", fontWeight:900 }}>Boardroom Report</Button>
        <Button onClick={()=>setTab("alerts")} style={{ background: tab==="alerts"?"#FFD700":"#1de682", color:tab==="alerts"?"#181e23":"#232", fontWeight:900 }}>Alerts</Button>
      </div>
      <AnimatePresence>
      {/* DASHBOARD TAB */}
      {tab==="dashboard" && (
        <motion.div key="dashboard" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaHeartbeat style={{ marginRight: 12, color: "#FFD700" }} />
            RECOVERY & INJURY PREVENTION DASHBOARD
          </h2>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
            {athletes.map((a,i)=>(
              <Card key={a.id} style={{minWidth:220,maxWidth:240,background:"#232b39",cursor:"pointer",border:view===i?"2.5px solid #FFD700":"none"}} onClick={()=>setView(i)}>
                <CardContent>
                  <div style={{fontWeight:700,color:"#FFD700",fontSize:16}}>{a.name} <span style={{color:"#FFD700cc",fontWeight:500}}>({a.pos})</span></div>
                  <div style={{margin:"5px 0"}}>Fatigue: <b style={{color:"#FFD700"}}>{a.fatigue[11]}</b> | Recovery: <b style={{color:"#1de682"}}>{a.recovery[11]}</b></div>
                  <div style={{margin:"5px 0"}}>Risk: <b style={{color:riskColor(a.risk[11])}}>{a.risk[11]}%</b> {statusBadge(a.risk[11])}</div>
                  <div>{injuryBadge(a)}</div>
                  <div style={{fontSize:13,marginTop:6}}>
                    RTP Steps: <b>{a.rtp}</b> | Compliance: <b>{a.compliance.reduce((a,b)=>a+b,0)}/{a.compliance.length}</b>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
      {/* DEEP DIVE TAB */}
      {tab==="deepdive" && (
        <motion.div key="deepdive" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaUserMd style={{ marginRight: 12, color: "#FFD700" }} />
            ATHLETE RECOVERY & RISK DEEP DIVE
          </h2>
          <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
            {/* Graphs */}
            <Card style={{minWidth:320,background:"#181e23"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:18,marginBottom:7}}>Fatigue, Recovery & Risk Timeline</div>
                <ResponsiveContainer width="100%" height={85}>
                  <LineChart>
                    <Line dataKey="Fatigue" data={athlete.fatigue.map((v,i)=>({month:MONTHS[i],Fatigue:v}))} stroke="#FFD700" strokeWidth={2} />
                    <Line dataKey="Recovery" data={athlete.recovery.map((v,i)=>({month:MONTHS[i],Recovery:v}))} stroke="#1de682" strokeWidth={2} />
                    <Line dataKey="Risk" data={athlete.risk.map((v,i)=>({month:MONTHS[i],Risk:v}))} stroke="#FF4848" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{marginTop:7,fontWeight:700,color:"#FFD700"}}>Status: {statusBadge(athlete.risk[11])}</div>
                <div style={{marginTop:7,fontWeight:700,color:"#FFD700"}}>Pro Benchmark: <b style={{color:"#1de682"}}>{PRO_BENCHMARK}%</b></div>
              </CardContent>
            </Card>
            {/* Notes & RTP */}
            <Card style={{minWidth:290,background:"#232b39"}}>
              <CardContent>
                <div style={{fontWeight:700,color:"#FFD700",fontSize:17,marginBottom:7}}>Medical/Coach Log</div>
                <textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add note..." style={{width:"100%",borderRadius:6,padding:8,border:"1.3px solid #FFD700"}} />
                <Button size="sm" onClick={addNote} style={{marginTop:4}}>Add Note</Button>
                <ul>
                  {athlete.notes.map((n,i)=>(
                    <li key={i} style={{color:"#1de682",marginBottom:3,fontSize:14}}><FaHistory style={{marginRight:6}}/>{n.text} <span style={{color:"#FFD700aa",fontSize:12,marginLeft:7}}>({n.date})</span></li>
                  ))}
                </ul>
                <div style={{marginTop:12,color:"#FFD700",fontWeight:700}}>Return to Play (RTP)</div>
                <div style={{color:"#FFD700",fontWeight:700,fontSize:15,marginTop:3}}>
                  Steps Remaining: <b>{athlete.rtp}</b>
                  <ul style={{marginTop:4}}>
                    <li style={{color:athlete.rtpSteps[0]?"#1de682":"#FF4848"}}>Medical Clearance {athlete.rtpSteps[0] ? <FaCheckCircle/>:<FaExclamationTriangle/>}</li>
                    <li style={{color:athlete.rtpSteps[1]?"#1de682":"#FF4848"}}>Fitness Test {athlete.rtpSteps[1] ? <FaCheckCircle/>:<FaExclamationTriangle/>}</li>
                    <li style={{color:athlete.rtpSteps[2]?"#1de682":"#FF4848"}}>Coach Sign-Off {athlete.rtpSteps[2] ? <FaCheckCircle/>:<FaExclamationTriangle/>}</li>
                    <li style={{color:athlete.rtpSteps[3]?"#1de682":"#FF4848"}}>Full Training {athlete.rtpSteps[3] ? <FaCheckCircle/>:<FaExclamationTriangle/>}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            {/* Athlete Voice & Wellness */}
            <Card style={{minWidth:230,background:"#222b37"}}>
              <CardContent>
                <div style={{fontWeight:700,color:"#FFD700",fontSize:17,marginBottom:7}}>Athlete Voice/Self-Report</div>
                <textarea rows={2} value={voice} onChange={e=>setVoice(e.target.value)} placeholder="Describe soreness, wellness..." style={{width:"100%",borderRadius:6,padding:8,border:"1.3px solid #FFD700"}} />
                <Button size="sm" onClick={addVoice} style={{marginTop:4}}>Add Voice Log</Button>
                <ul>
                  {athlete.voice.map((n,i)=>(
                    <li key={i} style={{color:"#FFD700",marginBottom:3,fontSize:14}}><FaNotesMedical style={{marginRight:6}}/>{n.text} <span style={{color:"#FFD700aa",fontSize:12,marginLeft:7}}>({n.date})</span></li>
                  ))}
                </ul>
                <div style={{marginTop:8, color:"#1de682",fontWeight:700}}>Wellness (Latest):</div>
                <div><FaBed/> Sleep: <b>{athlete.wellness.sleep[11]}h</b></div>
                <div><FaTint/> Hydration: <b>{athlete.wellness.hydration[11]}</b> / 5</div>
                <div>{athlete.wellness.mood[11]>=4 ? <span style={{color:"#1de682"}}><FaSmile/> Mood</span> : <span style={{color:"#FF4848"}}><FaFrown/> Mood</span>}</div>
              </CardContent>
            </Card>
            {/* Injury History */}
            <Card style={{minWidth:190,background:"#181e23"}}>
              <CardContent>
                <div style={{fontWeight:700,color:"#FFD700",fontSize:16,marginBottom:5}}>Injury History</div>
                <ul>
                  {athlete.injuryHistory.map((h,i)=>
                    <li key={i} style={{color:"#FFD700cc",fontWeight:600}}>{h}</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
      {/* SCENARIO LAB */}
      {tab==="scenario" && (
        <motion.div key="scenario" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaBolt style={{ marginRight: 12, color: "#FFD700" }} />
            WORKLOAD & RECOVERY DECISION LAB
          </h2>
          <Card>
            <CardContent>
              <div style={{fontWeight:800,color:"#FFD700",fontSize:17}}>Simulate:</div>
              <Button size="sm" style={{marginRight:8}} onClick={()=>{
                let arr = [...athletes];
                arr[view].fatigue = arr[view].fatigue.map((v,i)=>v+12);
                arr[view].risk = arr[view].risk.map((v,i)=>v+11);
                setAthletes(arr);
                addAlert("Red Flag","Simulated: Pushed with no rest (risk +11%)");
              }}>Push (No Rest)</Button>
              <Button size="sm" style={{marginRight:8}} onClick={()=>{
                let arr = [...athletes];
                arr[view].fatigue = arr[view].fatigue.map((v,i)=>Math.max(0,v-14));
                arr[view].recovery = arr[view].recovery.map((v,i)=>v+9);
                arr[view].risk = arr[view].risk.map((v,i)=>Math.max(0,v-9));
                setAthletes(arr);
                addAlert("Monitor","Simulated: Rest applied (risk -9%)");
              }}>Rest Now</Button>
              <Button size="sm" style={{marginRight:8}} onClick={()=>{
                let arr = [...athletes];
                arr[view].fatigue = arr[view].fatigue.map((v,i)=>v+6);
                arr[view].risk = arr[view].risk.map((v,i)=>v+5);
                setAthletes(arr);
                addAlert("Routine","Simulated: Tournament run (risk +5%)");
              }}>Tournament Run</Button>
              <div style={{marginTop:12, color:"#FFD700",fontWeight:700}}>
                AI Rec: {athlete.risk[11]>=35 ? "Immediate rest & medical action needed—assign to board & medical." : athlete.risk[11]>=20 ? "Monitor closely, review training, update recovery plan." : "Continue current protocol—review in 7 days."}
              </div>
            </CardContent>
          </Card>
          {/* Interventions/Workflow */}
          <Card style={{marginTop:10,background:"#1a2334"}}>
            <CardContent>
              <div style={{color:"#FFD700",fontWeight:700,fontSize:18}}>Action Workflow</div>
              <div style={{marginBottom:5}}>
                <input type="text" placeholder="Describe action..." style={{width:"60%",padding:6,borderRadius:6,border:"1.3px solid #FFD700",marginRight:6}} id="actioninput"/>
                <select id="assign" style={{padding:4,borderRadius:6,border:"1.3px solid #FFD700"}}>
                  <option value="Coach">Coach</option>
                  <option value="Athlete">Athlete</option>
                  <option value="Medical">Medical</option>
                  <option value="Board">Board</option>
                  <option value="Club">Club</option>
                </select>
                <Button size="sm" onClick={()=>{
                  const desc = document.getElementById('actioninput').value;
                  const assign = document.getElementById('assign').value;
                  if(desc.length) addIntervention(desc,assign);
                  document.getElementById('actioninput').value='';
                }}>Add</Button>
              </div>
              <ul>
                {interventions.filter(a=>a.athlete===athlete.name).map((a, idx) => (
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
      {/* BOARDROOM REPORT */}
      {tab==="report" && (
        <motion.div key="report" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaFileDownload style={{ marginRight: 12, color: "#FFD700" }} />
            BOARDROOM REPORT: INJURY, RISK, RECOVERY
          </h2>
          <Card>
            <CardContent>
              <Button style={{ background: "#FFD700", color: "#23292f", fontWeight: 700, fontSize: 15, borderRadius: 11 }} onClick={handleExport}>
                <FaFileDownload style={{ marginRight: 6 }} /> Export Boardroom Snapshot (PDF)
              </Button>
              <div style={{margin:"12px 0",fontWeight:700,fontSize:16,color:"#FFD700"}}>Cohort Risk: {cohortRisk(athletes)}% | Compliance: {cohortCompliance(athletes)}% | Pro Benchmark: {PRO_BENCHMARK}%</div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 18 }}>
                <thead>
                  <tr>
                    <th style={{color:"#FFD700",fontWeight:700}}>Athlete</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Fatigue</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Recovery</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Risk</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>RTP Steps</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Compliance</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, idx) => (
                    <tr key={a.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{a.name}</td>
                      <td style={{ color: "#FFD700", fontWeight:700 }}>{a.fatigue[11]}</td>
                      <td style={{ color: "#1de682", fontWeight:700 }}>{a.recovery[11]}</td>
                      <td style={{ color: riskColor(a.risk[11]), fontWeight:700 }}>{a.risk[11]}%</td>
                      <td style={{ color: "#FFD700", fontWeight:700 }}>{a.rtp}</td>
                      <td style={{ color: "#1de682", fontWeight:700 }}>{a.compliance.reduce((a,b)=>a+b,0)}/{a.compliance.length}</td>
                      <td>{injuryBadge(a)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{marginTop:20,fontWeight:700,fontSize:17,color:"#FFD700"}}>AI Boardroom Insights</div>
              <ul>
                <li>Most At Risk: <span style={{color:"#FF4848"}}>{athletes.reduce((a,b)=>a.risk[11]>b.risk[11]?a:b).name}</span></li>
                <li>Best Prevention Compliance: <span style={{color:"#1de682"}}>{athletes.reduce((a,b)=>a.compliance.reduce((x,y)=>x+y,0)>b.compliance.reduce((x,y)=>x+y,0)?a:b).name}</span></li>
                <li>RTP Compliance: <span style={{color:"#FFD700"}}>{athletes.filter(a=>a.rtp===0).length} fully cleared</span></li>
                <li>Red Flag Alerts: <span style={{color:"#FF4848"}}>{alerts.filter(a=>a.type==="Red Flag").length}</span> | Monitor: <span style={{color:"#FFD700"}}>{alerts.filter(a=>a.type==="Monitor").length}</span></li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
      {/* ALERTS TAB */}
      {tab==="alerts" && (
        <motion.div key="alerts" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaBell style={{ marginRight: 12, color: "#FFD700" }} />
            REAL-TIME ALERTS & BOARD LOG
          </h2>
          <Card>
            <CardContent>
              <ul>
                {alerts.slice(-15).reverse().map((a,i)=>(
                  <li key={i} style={{fontWeight:700,color:a.type==="Red Flag"?"#FF4848":a.type==="Monitor"?"#FFD700":"#1de682",fontSize:15}}>
                    <FaEnvelope style={{marginRight:5}}/>
                    [{a.type}] <b>{a.athlete}</b> — {a.detail} <span style={{color:"#FFD700aa",fontSize:13,marginLeft:7}}>({a.date})</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default HolisticRecoveryInjuryPreventionSuite;
