// CommunityFamilyEngagementImpactLab.jsx (MAXIMUM ENRICHMENT)
import React, { useState } from 'react';
import { FaUsers, FaSmile, FaExclamationTriangle, FaHeartbeat, FaRobot, FaDownload, FaLightbulb, FaHandHoldingHeart,
     FaBullhorn, FaArrowUp, FaArrowDown, FaUserFriends, FaComments, FaMedal, FaStar, FaMoneyBillWave, FaChartBar,
      FaChartLine, FaGlobe, FaCertificate, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
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

// --- DEMO DATA ---
const ATHLETES = [
  { id:1, name:"Luka Vuković", team:"U16", engagement:[82,85,88,91,89,93,95,94,97,98,97,99], pulse:[4,4,4,5,4,5,5,5,5,5,5,5], feedback:[5,5,5,4,4,5,5,5,5,5,5,5], events:[2,-1,1,2,2,3,1,0,2,1,1,2], familyPulse:[5,5,4,5,5,5,5,5,5,5,5,5], notes:[], familyNotes:[], badges:[], trust:94 },
  { id:2, name:"Ivan Horvat", team:"U16", engagement:[60,62,61,59,58,56,57,55,54,52,50,51], pulse:[3,3,2,3,2,2,2,2,2,1,2,1], feedback:[3,3,2,3,2,3,2,3,2,2,2,2], events:[-2,1,0,-1,-2,0,1,-1,0,-2,-2,-1], familyPulse:[2,3,3,2,2,2,2,1,1,1,1,1], notes:[], familyNotes:[], badges:[], trust:62 },
  { id:3, name:"Marko Jurić", team:"U18", engagement:[94,97,99,98,99,99,100,100,100,100,100,100], pulse:[5,5,5,5,5,5,5,5,5,5,5,5], feedback:[5,5,5,5,5,5,5,5,5,5,5,5], events:[3,3,3,2,2,4,4,3,3,4,4,4], familyPulse:[5,5,5,5,5,5,5,5,5,5,5,5], notes:[], familyNotes:[], badges:["Club Builder"], trust:100 },
  { id:4, name:"Petar Božić", team:"U18", engagement:[48,45,46,44,42,40,39,37,38,36,35,34], pulse:[2,2,2,2,2,2,1,1,1,1,1,1], feedback:[2,2,2,2,1,1,1,1,1,1,1,1], events:[-3,-3,-2,-4,-4,-3,-2,-3,-3,-4,-4,-3], familyPulse:[1,2,2,2,2,2,1,1,1,1,1,1], notes:[], familyNotes:[], badges:[], trust:41 }
];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EVENTS = [
  { label: "Coach Change", impact: -4, type: "negative" },
  { label: "Big Win", impact: 3, type: "positive" },
  { label: "Scandal", impact: -8, type: "negative" },
  { label: "Injury", impact: -3, type: "negative" },
  { label: "New Sponsor", impact: 5, type: "positive" },
  { label: "Bullying Incident", impact: -7, type: "negative" },
  { label: "Community Day", impact: 4, type: "positive" },
  { label: "Family Moves", impact: -3, type: "negative" },
  { label: "Scholarship Grant", impact: 7, type: "positive" },
  { label: "Media Feature", impact: 8, type: "positive" },
  { label: "Parent Complaint", impact: -5, type: "negative" }
];

function engagementColor(val) {
  if (val >= 90) return "#1de682";
  if (val >= 80) return "#FFD700";
  if (val >= 60) return "#FFD700cc";
  return "#FF4848";
}
function familyColor(val) {
  if (val >= 4) return "#1de682";
  if (val >= 3) return "#FFD700";
  return "#FF4848";
}
function trustBadge(trust) {
  if(trust>=95) return <span style={{color:"#FFD700",marginLeft:6}}><FaCertificate/> Most Trusted</span>
  if(trust<=40) return <span style={{color:"#FF4848",marginLeft:6}}><FaExclamationTriangle/> Trust Risk</span>
  return null;
}
function pulseBadge(pulse, feedback, trust) {
  if (pulse>=4.8 && feedback>=4.8) return <span style={{color:"#1de682"}}><FaStar/> Community Hero</span>;
  if (pulse<2.2 && feedback<2.2) return <span style={{color:"#FF4848"}}><FaExclamationTriangle/> Invisible Risk</span>;
  if (trust>=95) return <span style={{color:"#FFD700"}}><FaMedal/> Club Builder</span>;
  if (pulse>=4 && feedback>=4) return <span style={{color:"#FFD700"}}><FaSmile/> Highly Engaged</span>;
  return null;
}
function invisibleRisk(athlete) {
  return (athlete.engagement[11]<55 && athlete.familyPulse[11]<2.2 && athlete.events.slice(-4).filter(e=>e<0).length>=2);
}
function clubReputation(athletes) {
  // Simple: mean engagement + trust + event score, minus invisible risks
  const mean = athletes.reduce((a,b)=>a+b.engagement[11],0)/athletes.length;
  const trust = athletes.reduce((a,b)=>a+b.trust,0)/athletes.length;
  const negEvents = athletes.reduce((a,b)=>a+b.events.slice(-4).filter(e=>e<0).length,0);
  return Math.round((mean*0.6 + trust*0.35 - negEvents*3));
}
function retentionForecast(athletes) {
  // Predict attrition if engagement <60 or familyPulse <2.5
  return athletes.filter(a=>a.engagement[11]<60||a.familyPulse[11]<2.5).length/athletes.length;
}

// Main
const CommunityFamilyEngagementImpactLab = () => {
  const [athletes, setAthletes] = useState(ATHLETES);
  const [view, setView] = useState(0);
  const [tab, setTab] = useState("engagement");
  const [eventLog, setEventLog] = useState([]);
  const [note, setNote] = useState('');
  const [familyNote, setFamilyNote] = useState('');
  const [actions, setActions] = useState([]);
  const athlete = athletes[view];
  const [networkOpen, setNetworkOpen] = useState(false);

  // Event impact simulator (UPGRADE: bulk and PR/funding sim)
  const runEvent = (label, impact) => {
    let arr = [...athletes];
    // If "bulk" event, e.g. positive/negative for all:
    if(label==="Community Day"||label==="Coach Change"||label==="Scandal") {
      arr = arr.map(a=>{
        a.engagement = a.engagement.map((v,i)=>Math.max(0,Math.min(100,v+impact)));
        a.events = a.events.map((v,i)=>v+impact/2);
        return a;
      });
      setEventLog([...eventLog, ...arr.map(a=>({ athlete: a.name, event: label, impact, date: new Date().toLocaleString() }))]);
    } else {
      arr[view].engagement = arr[view].engagement.map((v,i)=>Math.max(0,Math.min(100,v+impact)));
      arr[view].events = arr[view].events.map((v,i)=>v+impact/2);
      setEventLog([...eventLog, { athlete: athlete.name, event: label, impact, date: new Date().toLocaleString() }]);
    }
    setAthletes(arr);
  };

  // Notes/log
  const addNote = () => {
    let arr = [...athletes];
    arr[view].notes = [...arr[view].notes, { text: note, date: new Date().toLocaleString() }];
    setAthletes(arr); setNote('');
  };
  const addFamilyNote = () => {
    let arr = [...athletes];
    arr[view].familyNotes = [...arr[view].familyNotes, { text: familyNote, date: new Date().toLocaleString() }];
    setAthletes(arr); setFamilyNote('');
  };

  // Workflow/action
  const addAction = (desc, assign) => {
    setActions([...actions, { desc, assign, athlete: athlete.name, status:"Open", date: new Date().toLocaleString() }]);
  };
  const setActionStatus = (i, status) => {
    let arr = [...actions];
    arr[i].status = status;
    setActions(arr);
  };

  // Export
  const handleExport = () => window.print();

  // Network Map (mini-dummy)
  const CommunityNetworkMap = () => (
    <div style={{background:"#232b39",borderRadius:18,padding:20}}>
      <div style={{color:"#FFD700",fontWeight:800,fontSize:18,marginBottom:8}}>
        COMMUNITY NETWORK MAP
      </div>
      <div style={{display:"flex",gap:30,justifyContent:"center",alignItems:"center"}}>
        <div>
          <FaUsers style={{fontSize:34,color:"#FFD700"}}/>
          <div style={{color:"#FFD700",fontWeight:700}}>Club</div>
        </div>
        {athletes.map(a=>(
          <div key={a.id} style={{textAlign:"center"}}>
            <FaSmile style={{fontSize:26,color:engagementColor(a.engagement[11])}}/>
            <div style={{color:engagementColor(a.engagement[11]),fontWeight:600}}>{a.name}</div>
            {invisibleRisk(a) && <FaExclamationTriangle style={{color:"#FF4848",fontSize:18}}/>}
            {a.badges.map((b,i)=><FaMedal key={i} style={{color:"#FFD700",marginLeft:3}}/>)}
          </div>
        ))}
        <div>
          <FaHandHoldingHeart style={{fontSize:32,color:"#1de682"}}/>
          <div style={{color:"#1de682",fontWeight:700}}>Families</div>
        </div>
      </div>
      <div style={{fontSize:13,color:"#FFD700cc",marginTop:10}}>Network lines: Engagement, Pulse, Events, Family</div>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Tabs */}
      <div style={{ display:"flex", gap:18, marginBottom:8 }}>
        <Button onClick={()=>setTab("engagement")} style={{ background: tab==="engagement"?"#FFD700":"#1de682", color:tab==="engagement"?"#181e23":"#232", fontWeight:900 }}>Engagement</Button>
        <Button onClick={()=>setTab("pulse")} style={{ background: tab==="pulse"?"#FFD700":"#1de682", color:tab==="pulse"?"#181e23":"#232", fontWeight:900 }}>Family Pulse</Button>
        <Button onClick={()=>setTab("scenario")} style={{ background: tab==="scenario"?"#FFD700":"#1de682", color:tab==="scenario"?"#181e23":"#232", fontWeight:900 }}>Scenario Lab</Button>
        <Button onClick={()=>setTab("report")} style={{ background: tab==="report"?"#FFD700":"#1de682", color:tab==="report"?"#181e23":"#232", fontWeight:900 }}>Boardroom Report</Button>
      </div>
      <AnimatePresence>
      {/* Engagement Dashboard */}
      {tab==="engagement" && (
        <motion.div key="engagement" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaUsers style={{ marginRight: 10, color: "#FFD700", fontSize: 34 }} />
            COMMUNITY & FAMILY ENGAGEMENT INDEX
            <span style={{fontSize:18,color:"#1de682",marginLeft:18}}>Social Capital: <b>{clubReputation(athletes)}</b> / 100</span>
            <span style={{fontSize:18,color:"#FFD700",marginLeft:18}}>Retention Forecast: <b>{Math.round((1-retentionForecast(athletes))*100)}%</b> next season</span>
          </h2>
          <div style={{display:"flex",gap:24}}>
            {/* Athlete List */}
            <Card style={{minWidth:210,background:"#232b39"}}>
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
                    {a.name}
                    {trustBadge(a.trust)}
                    {pulseBadge(a.pulse[11], a.feedback[11], a.trust)}
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Engagement Trend/Heatmap */}
            <Card style={{minWidth:320,background:"#181e23"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:19,marginBottom:8}}>Engagement Trend</div>
                <ResponsiveContainer width="100%" height={70}>
                  <LineChart>
                    <Line dataKey="Engagement" data={athlete.engagement.map((v,i)=>({month:MONTHS[i],Engagement:v}))} stroke="#FFD700" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{color:engagementColor(athlete.engagement[11]),fontWeight:800,marginTop:5}}>
                  Index: {athlete.engagement[11]} | Trust: {athlete.trust}
                  {invisibleRisk(athlete) && <span style={{color:"#FF4848",marginLeft:7}}><FaExclamationTriangle/> Invisible Risk</span>}
                </div>
              </CardContent>
            </Card>
            {/* PR/Funding Meter */}
            <Card style={{minWidth:230,background:"#222b37"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:17,marginBottom:8}}>PR & Funding Radar</div>
                <ResponsiveContainer width="100%" height={50}>
                  <BarChart>
                    <Bar dataKey="Events" data={athlete.events.map((v,i)=>({month:MONTHS[i],Events:v}))} fill="#1de682" />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{color:"#1de682",fontWeight:700,marginTop:5}}>
                  Funding Potential: <b>{Math.round(athlete.engagement[11]*athlete.trust/1000)}</b> units
                </div>
              </CardContent>
            </Card>
            {/* Community Network Map */}
            <Card style={{minWidth:260,background:"#181e23",cursor:"pointer"}} onClick={()=>setNetworkOpen(o=>!o)}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:17,marginBottom:8}}>Community Network Map</div>
                <div style={{textAlign:"center",paddingTop:16}}><FaGlobe style={{fontSize:33,color:"#FFD700"}}/></div>
                <div style={{fontSize:13,color:"#FFD700cc",marginTop:12}}>Click to {networkOpen?"hide":"view"} network map</div>
                {networkOpen && <CommunityNetworkMap />}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
      {/* FAMILY PULSE TAB */}
      {tab==="pulse" && (
        <motion.div key="pulse" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaUserFriends style={{ marginRight: 10, color: "#FFD700", fontSize: 34 }} />
            FAMILY VOICE & ENGAGEMENT DASHBOARD
          </h2>
          <div style={{display:"flex",gap:24}}>
            <Card style={{minWidth:240,background:"#232b39"}}>
              <CardContent>
                <div style={{fontWeight:700,color:"#FFD700",fontSize:17,marginBottom:8}}>Family Pulse</div>
                <ResponsiveContainer width="100%" height={52}>
                  <LineChart>
                    <Line dataKey="Pulse" data={athlete.familyPulse.map((v,i)=>({month:MONTHS[i],Pulse:v}))} stroke="#1de682" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{marginTop:6,fontWeight:700,color:familyColor(athlete.familyPulse[11])}}>
                  {athlete.familyPulse[11]>=4 ? "Family Support Stable" : athlete.familyPulse[11]<2.5 ? "At-Risk/Disengaged Family" : "Mixed Pulse"}
                </div>
                <div style={{marginTop:7}}>
                  <textarea rows={2} value={familyNote} onChange={e=>setFamilyNote(e.target.value)} placeholder="Family message..." style={{width:"100%",borderRadius:6,padding:8,border:"1.3px solid #FFD700"}} />
                  <Button size="sm" onClick={addFamilyNote} style={{marginTop:4}}>Send to Club</Button>
                  <div style={{fontWeight:700,color:"#FFD700",marginTop:5}}>Live Chat Log:</div>
                  <ul>
                    {athlete.familyNotes.map((n,i)=>(
                      <li key={i} style={{color:"#1de682",marginBottom:3,fontSize:14}}><FaComments style={{marginRight:6}}/>{n.text} <span style={{color:"#FFD700aa",fontSize:12,marginLeft:7}}>({n.date})</span></li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            {/* Feedback/Support */}
            <Card style={{minWidth:260,background:"#222b37"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:17,marginBottom:8}}>Athlete Feedback Timeline</div>
                <ResponsiveContainer width="100%" height={58}>
                  <BarChart>
                    <Bar dataKey="Feedback" data={athlete.feedback.map((v,i)=>({month:MONTHS[i],Feedback:v}))} fill="#FFD700" />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{color:"#FFD700",fontWeight:700,marginTop:5}}>
                  Latest Feedback: {athlete.feedback[11]}
                </div>
              </CardContent>
            </Card>
            {/* Social Capital Heatmap */}
            <Card style={{minWidth:220,background:"#181e23"}}>
              <CardContent>
                <div style={{fontWeight:800,color:"#FFD700",fontSize:17,marginBottom:8}}>Social Value Heatmap</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr>
                      <th style={{color:"#FFD700"}}>Athlete</th>
                      <th style={{color:"#FFD700"}}>Engagement</th>
                      <th style={{color:"#FFD700"}}>Family</th>
                      <th style={{color:"#FFD700"}}>Trust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athletes.map(a=>(
                      <tr key={a.id}>
                        <td style={{fontWeight:700,color:"#FFD700"}}>{a.name}</td>
                        <td style={{background:engagementColor(a.engagement[11]),color:"#222b37",fontWeight:800}}>{a.engagement[11]}</td>
                        <td style={{background:familyColor(a.familyPulse[11]),color:"#222b37",fontWeight:800}}>{a.familyPulse[11]}</td>
                        <td style={{color:"#FFD700",fontWeight:800}}>{a.trust}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* SCENARIO TAB */}
      {tab==="scenario" && (
        <motion.div key="scenario" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaLightbulb style={{ marginRight: 10, color: "#FFD700", fontSize: 34 }} />
            COMMUNITY SCENARIO & ACTIVATION LAB
          </h2>
          <Card>
            <CardContent>
              <div style={{fontWeight:800,color:"#FFD700",fontSize:18,marginBottom:10}}>
                Simulate Impact:&nbsp;
                {EVENTS.map((e,i)=>(
                  <Button key={i} size="sm" style={{background:e.type==="positive"?"#1de682":"#FF4848",marginLeft:7}} onClick={()=>runEvent(e.label, e.impact)}>{e.label}</Button>
                ))}
                <Button size="sm" style={{background:"#FFD700",marginLeft:7}} onClick={()=>runEvent("Community Day",4)}>Bulk Community Day</Button>
                <Button size="sm" style={{background:"#FF4848",marginLeft:7}} onClick={()=>runEvent("Coach Change",-4)}>Bulk Coach Change</Button>
              </div>
              <div style={{fontWeight:800,color:"#FFD700",fontSize:17}}>Event Log / Momentum Tracker:</div>
              <ul style={{marginTop:3}}>
                {eventLog.slice(-10).map((e,i)=>(
                  <li key={i}><FaBullhorn style={{marginRight:5}}/>{e.event} [{e.athlete}] <b style={{color:e.impact>0?"#1de682":"#FF4848"}}>{e.impact>0?`+${e.impact}`:e.impact}</b> <span style={{color:"#FFD700aa",fontSize:13,marginLeft:6}}>({e.date})</span></li>
                ))}
              </ul>
              <div style={{marginTop:9, color:"#FFD700",fontWeight:700}}>AI Rec: {athlete.engagement[11]<50 || athlete.familyPulse[11]<2.5 ? "Trigger early intervention. Assign club support, monitor closely." : athlete.engagement[11]>90 ? "Showcase engagement for PR, funding, and community." : "Maintain proactive outreach and open family feedback."}</div>
            </CardContent>
          </Card>
          {/* Actions/Workflow */}
          <Card style={{marginTop:10,background:"#1a2334"}}>
            <CardContent>
              <div style={{color:"#FFD700",fontWeight:700,fontSize:18}}>Action Workflow</div>
              <div style={{marginBottom:5}}>
                <input type="text" placeholder="Describe action..." style={{width:"60%",padding:6,borderRadius:6,border:"1.3px solid #FFD700",marginRight:6}} id="actioninput"/>
                <select id="assign" style={{padding:4,borderRadius:6,border:"1.3px solid #FFD700"}}>
                  <option value="Coach">Coach</option>
                  <option value="Athlete">Athlete</option>
                  <option value="Parent">Parent</option>
                  <option value="Community">Community</option>
                  <option value="Club">Club</option>
                </select>
                <Button size="sm" onClick={()=>{
                  const desc = document.getElementById('actioninput').value;
                  const assign = document.getElementById('assign').value;
                  if(desc.length) addAction(desc,assign);
                  document.getElementById('actioninput').value='';
                }}>Add</Button>
              </div>
              <ul>
                {actions.filter(a=>a.athlete===athlete.name).map((a, idx) => (
                  <li key={idx} style={{ color: a.status==="Resolved"?"#1de682":a.status==="Open"?"#FFD700":"#FF4848", marginBottom: 3, fontSize: 15 }}>
                    <FaCheckCircle style={{ marginRight: 6 }} />[{a.assign}] {a.desc} — <b>{a.status}</b> <span style={{ color:"#FFD700aa",fontSize:13,marginLeft:6 }}>({a.date})</span>
                    {a.status!=="Resolved" && <Button size="sm" style={{marginLeft:6}} onClick={()=>setActionStatus(idx,"Resolved")}>Resolve</Button>}
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
          <h2 style={{ fontSize: 30, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
            <FaDownload style={{ marginRight: 12, fontSize: 30, color: "#FFD700", verticalAlign: 'middle' }} />
            BOARDROOM REPORT: ENGAGEMENT, SOCIAL VALUE & RISK
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
                    <th style={{color:"#FFD700",fontWeight:700}}>Engagement</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Family Pulse</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Trust</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Badges</th>
                    <th style={{color:"#FFD700",fontWeight:700}}>Invisible Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, idx) => (
                    <tr key={a.id} style={{ background: idx%2 ? "#222b37" : "#232b39" }}>
                      <td style={{ fontWeight: 700, color: "#FFD700" }}>{a.name}</td>
                      <td style={{ color: engagementColor(a.engagement[11]), fontWeight:700 }}>{a.engagement[11]}</td>
                      <td style={{ color: familyColor(a.familyPulse[11]), fontWeight:700 }}>{a.familyPulse[11]}</td>
                      <td style={{ color: "#FFD700", fontWeight:700 }}>{a.trust}</td>
                      <td>{pulseBadge(a.pulse[11],a.feedback[11],a.trust)}</td>
                      <td style={{ color: invisibleRisk(a)?"#FF4848":"#1de682", fontWeight:700 }}>{invisibleRisk(a)?"Yes":"No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Talking Points/AI Insights */}
              <div style={{marginTop:18,fontWeight:700,color:"#FFD700",fontSize:18}}>AI Boardroom Insights</div>
              <ul>
                <li>Current Club Social Capital: <b style={{color:"#FFD700"}}>{clubReputation(athletes)}</b> / 100</li>
                <li>Projected Retention Rate: <b style={{color:"#FFD700"}}>{Math.round((1-retentionForecast(athletes))*100)}%</b></li>
                <li>{athletes.filter(invisibleRisk).length} athletes/families with invisible engagement/social risk—review workflow.</li>
                <li>Top opportunity: {athletes.reduce((a,b)=>a.engagement[11]>b.engagement[11]?a:b).name} (showcase for PR/funding/partnerships)</li>
                <li>{athletes.filter(a=>a.trust>=95).map(a=>a.name).join(", ")} rated “Most Trusted” by families/community.</li>
              </ul>
              <div style={{marginTop:18,fontWeight:700,color:"#FFD700",fontSize:18}}>Event Timeline</div>
              <ul>
                {eventLog.slice(-12).map((e,i)=>(
                  <li key={i}><FaBullhorn style={{marginRight:5}}/>{e.event} [{e.athlete}] <b style={{color:e.impact>0?"#1de682":"#FF4848"}}>{e.impact>0?`+${e.impact}`:e.impact}</b> <span style={{color:"#FFD700aa",fontSize:13,marginLeft:6}}>({e.date})</span></li>
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

export default CommunityFamilyEngagementImpactLab;
