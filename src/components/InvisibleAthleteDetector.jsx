import React, { useState } from "react";
import { FaUserAlt, FaExclamationTriangle, FaStar, FaFire, FaSmile, FaFrown, FaChartLine, FaRobot, FaRegClock, FaClipboardCheck, FaCheck, FaUserFriends, FaUsers, FaArrowUp, FaHandHoldingHeart, FaHistory, FaUserShield, FaUserTie, FaGlobeEurope, FaChevronRight, FaBrain, FaCommentDots, FaLayerGroup, FaUserCircle, FaBolt } from "react-icons/fa";
import { motion } from "framer-motion";

// --- Button component (fixes error!)
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

// --- Demo athletes data
const demoAthletes = [
  { id: 1, name: "Luka Vuković", photo: null, engagement: 89, attendance: 92, feedback: 4.8, perf: 7, volatility: 7, social: 6, network: ["Coach", "Parent", "Peer"], risk: "Low", riskFactors: [], cohort: "U18", coach: "Božić", parent: "Active", lastSeen: "2025-06-30", status: "OK", timeline: [85, 88, 89, 90, 89], peerFeedback: [4,5,4,5], coachFeedback: [5,4], parentFeedback: [5], comments: [], flagged: false, interventions: [], aiHistory: [] },
  { id: 2, name: "Ivan Horvat", photo: null, engagement: 62, attendance: 71, feedback: 3.2, perf: 4, volatility: 4, social: 2, network: ["Coach"], risk: "Invisible Risk", riskFactors: ["Low Feedback", "Falling Attendance", "Weak Social Network"], cohort: "U18", coach: "Božić", parent: "Silent", lastSeen: "2025-07-02", status: "At Risk", timeline: [70, 67, 65, 63, 62], peerFeedback: [2,3,2], coachFeedback: [3], parentFeedback: [2], comments: ["Coach: Looks tired, less social"], flagged: false, interventions: [], aiHistory: [] },
  { id: 3, name: "Marko Jurić", photo: null, engagement: 95, attendance: 99, feedback: 5, perf: 9, volatility: 3, social: 8, network: ["Coach", "Parent", "Peer", "Admin"], risk: "High Flyer", riskFactors: ["Not Recognized"], cohort: "U18", coach: "Božić", parent: "Active", lastSeen: "2025-07-01", status: "Ready for Challenge", timeline: [92, 93, 94, 95, 95], peerFeedback: [5,5,5,4], coachFeedback: [5,5], parentFeedback: [5], comments: ["Parent: Wants more responsibility"], flagged: false, interventions: [], aiHistory: [] },
  { id: 4, name: "Petar Božić", photo: null, engagement: 72, attendance: 78, feedback: 2.9, perf: 6, volatility: 6, social: 2, network: ["Coach", "Peer"], risk: "Invisible Risk", riskFactors: ["Poor Feedback", "Low Social Connection"], cohort: "U18", coach: "Simec", parent: "Passive", lastSeen: "2025-06-29", status: "Quiet At Risk", timeline: [80, 79, 76, 73, 72], peerFeedback: [2,3,3], coachFeedback: [3,3], parentFeedback: [2], comments: [], flagged: false, interventions: [], aiHistory: [] },
  { id: 5, name: "Nikola Dukić", photo: null, engagement: 45, attendance: 55, feedback: 2.2, perf: 3, volatility: 8, social: 1, network: [], risk: "Silent Dropout", riskFactors: ["Attendance", "No Feedback", "No Network"], cohort: "U18", coach: "Simec", parent: "No Show", lastSeen: "2025-06-28", status: "At High Risk", timeline: [58, 54, 52, 48, 45], peerFeedback: [], coachFeedback: [2], parentFeedback: [], comments: ["Admin: Not responding to calls"], flagged: false, interventions: [], aiHistory: [] },
  { id: 6, name: "Tomislav Šarić", photo: null, engagement: 88, attendance: 85, feedback: 4.6, perf: 8, volatility: 5, social: 7, network: ["Coach", "Peer", "Parent"], risk: "Low", riskFactors: [], cohort: "U18", coach: "García", parent: "Active", lastSeen: "2025-07-02", status: "OK", timeline: [85, 87, 86, 87, 88], peerFeedback: [4,4,4,5], coachFeedback: [5,4], parentFeedback: [5], comments: [], flagged: false, interventions: [], aiHistory: [] },
];

const views = ["Board", "Coach", "Parent", "Federation"];

const riskColor = r => r==="High Flyer"?"#1de682":r==="Low"?"#FFD700":r==="Invisible Risk"?"#FF4848":r==="Silent Dropout"?"#B22222":"#FFD700";
const statusIcon = r => r==="High Flyer"?<FaStar/>:r==="Invisible Risk"?<FaExclamationTriangle/>:r==="Silent Dropout"?<FaFrown/>:<FaSmile/>;
const volatilityColor = v => v>=7 ? "#FF4848" : v>=5 ? "#FFD700" : "#1de682";
const socialColor = s => s>=7 ? "#1de682" : s>=4 ? "#FFD700" : "#FF4848";

function networkWeb(network) {
  // Shows which connections athlete has
  return (
    <div style={{display:"flex",gap:5}}>
      <span style={{color:network.includes("Coach")?"#FFD700":"#232b39"}}><FaUserTie/></span>
      <span style={{color:network.includes("Parent")?"#FFD700":"#232b39"}}><FaUserFriends/></span>
      <span style={{color:network.includes("Peer")?"#FFD700":"#232b39"}}><FaUsers/></span>
      <span style={{color:network.includes("Admin")?"#FFD700":"#232b39"}}><FaUserShield/></span>
    </div>
  );
}

const Detector = () => {
  const [athletes, setAthletes] = useState(demoAthletes);
  const [view, setView] = useState("Board");
  const [modal, setModal] = useState(null);
  const [comment, setComment] = useState("");
  const [simResult, setSimResult] = useState(null);
  const [showCohort, setShowCohort] = useState(false);

  // Risk summary
  const highFlyers = athletes.filter(a=>a.risk==="High Flyer");
  const invisibleRisks = athletes.filter(a=>a.risk==="Invisible Risk"||a.risk==="Silent Dropout");
  const flagged = athletes.filter(a=>a.flagged);

  // Role filter: Board sees all, Coach sees by squad, Parent only their child, Fed all (hide names)
  const filtered = view==="Parent"?athletes.slice(1,2):athletes;

  // Drilldown: show risk/opportunity per cohort/coach
  const cohorts = [...new Set(athletes.map(a=>a.cohort))];
  const cohortStats = cohorts.map(coh=>{
    const group = athletes.filter(a=>a.cohort===coh);
    return {
      cohort: coh,
      total: group.length,
      invisible: group.filter(a=>a.risk==="Invisible Risk"||a.risk==="Silent Dropout").length,
      highFlyer: group.filter(a=>a.risk==="High Flyer").length,
      avgEngagement: (group.reduce((s,a)=>s+a.engagement,0)/group.length).toFixed(1),
      flagged: group.filter(a=>a.flagged).length
    }
  });

  // Action: flag athlete, assign intervention
  const flagAthlete = id => setAthletes(athletes.map(a=>a.id===id?{...a, flagged:true, interventions:[...(a.interventions||[]),{by:view,ts:new Date().toLocaleString(),action:"Flagged"}]}:a));
  const addComment = (id, text) => setAthletes(athletes.map(a=>a.id===id?{...a,comments:[...(a.comments||[]),text]}:a));
  const assignIntervention = (id, action) => setAthletes(athletes.map(a=>a.id===id?{...a, interventions:[...(a.interventions||[]),{by:view,ts:new Date().toLocaleString(),action}], aiHistory:[...(a.aiHistory||[]),`AI: Simulated ${action}`]}:a));

  // Scenario sim: test effect of intervention on engagement/risk
  function runSimulation(a, action) {
    let newEng = a.engagement, newRisk = a.risk;
    if(action==="Assign Mentor") { newEng+=12; newRisk="Low"; }
    if(action==="Rest Period") { newEng+=4; newRisk=a.risk==="Invisible Risk"?"Low":a.risk; }
    if(action==="Promotion") { newEng+=9; newRisk="High Flyer"; }
    if(action==="Switch Coach") { newEng+=2; newRisk="Low"; }
    if(action==="Board Meeting") { newEng+=3; }
    setSimResult({
      newEng: Math.min(newEng,100), newRisk, effect: `AI: ${action} would project engagement to ${Math.min(newEng,100)}, risk to "${newRisk}".`
    });
  }

  // Volatility/engagement/sudden change alerts
  function suddenDrop(a) {
    // If last two timeline values have dropped by 7+ each
    const t = a.timeline;
    return t.length>=3 && (t[t.length-1]<t[t.length-2]-7 && t[t.length-2]<t[t.length-3]-7);
  }

  return (
    <div style={{
      minHeight:"100vh",background:"linear-gradient(135deg,#283E51 0%,#485563 100%)",color:"#fff",
      fontFamily:"Segoe UI,sans-serif",padding:28
    }}>
      <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:18}}>
        <FaRobot style={{color:"#FFD700",fontSize:32}}/>
        <span style={{fontSize:32,fontWeight:800,letterSpacing:2}}>Invisible Athlete Detector</span>
        <span style={{marginLeft:22}}>View:</span>
        <select value={view} onChange={e=>setView(e.target.value)} style={{borderRadius:8,padding:5,fontWeight:800}}>
          {views.map(v=><option key={v}>{v}</option>)}
        </select>
        <span style={{color:"#FFD700",fontWeight:700,marginLeft:18}}><FaChartLine/> AI: {invisibleRisks.length} at risk, {highFlyers.length} high-flyers</span>
        <Button size="sm" onClick={()=>setShowCohort(c=>!c)} style={{background:"#FFD700",marginLeft:16}}><FaLayerGroup style={{marginRight:6}}/>{showCohort?"Hide":"Show"} Cohort View</Button>
      </div>
      {/* RISK RADAR */}
      <div style={{display:"flex",gap:18,marginBottom:24,alignItems:"flex-start"}}>
        {/* HEATMAP */}
        <div style={{background:"#222b37",borderRadius:14,padding:16,flex:1,boxShadow:"0 2px 18px #181e2312"}}>
          <div style={{fontWeight:800,fontSize:19,marginBottom:11,color:"#FFD700"}}><FaFire style={{marginRight:7}}/>Live Risk/Opportunity Radar</div>
          {/* Cohort drilldown */}
          {showCohort &&
            <div style={{marginBottom:12}}>
              <b style={{color:"#FFD700"}}><FaLayerGroup style={{marginRight:6}}/>Cohort Summary:</b>
              {cohortStats.map(cs=>
                <div key={cs.cohort} style={{marginBottom:4}}>
                  <span style={{color:"#FFD700"}}>{cs.cohort}: </span>
                  <span>Total: <b>{cs.total}</b></span>, 
                  <span style={{color:"#FF4848",marginLeft:6}}>Invisible: <b>{cs.invisible}</b></span>, 
                  <span style={{color:"#1de682",marginLeft:6}}>High Flyers: <b>{cs.highFlyer}</b></span>, 
                  <span style={{marginLeft:6}}>Avg. Engagement: <b>{cs.avgEngagement}</b></span>,
                  <span style={{color:"#FFD700",marginLeft:6}}>Flagged: <b>{cs.flagged}</b></span>
                </div>
              )}
            </div>
          }
          {filtered.map(a=>
            <motion.div key={a.id} whileHover={{scale:1.03,boxShadow:"0 4px 22px #FFD70077"}} style={{
              marginBottom:11,background:"#283e51",borderRadius:10,padding:13,
              border:`2.2px solid ${riskColor(a.risk)}`,position:"relative"
            }}>
              <div style={{fontWeight:700,fontSize:17,letterSpacing:1,color: riskColor(a.risk)}}>
                {statusIcon(a.risk)} {a.name} {a.flagged&&<FaCheck style={{marginLeft:8,color:"#1de682"}}/>}
              </div>
              <div style={{marginTop:2,fontWeight:700,fontSize:15}}>Cohort: {a.cohort}, Coach: {a.coach}</div>
              <div style={{marginTop:3}}>Engagement: <b>{a.engagement}</b> | Attendance: <b>{a.attendance}%</b> | Feedback: <b>{a.feedback}/5</b> | Perf: <b>{a.perf}/10</b></div>
              <div style={{marginTop:3}}>
                Risk: <span style={{fontWeight:700,color:riskColor(a.risk)}}>{a.risk}</span> {a.riskFactors?.length>0 && (<span style={{marginLeft:7,color:"#FFD700"}}><FaExclamationTriangle/> {a.riskFactors.join(", ")}</span>)}
              </div>
              <div style={{marginTop:3}}>Status: {a.status} | Last Seen: {a.lastSeen}</div>
              <div style={{marginTop:3,display:"flex",alignItems:"center",fontSize:14}}>
                <span>Volatility: <b style={{color:volatilityColor(a.volatility)}}>{a.volatility}</b></span>
                <span style={{marginLeft:12}}>Social: <b style={{color:socialColor(a.social)}}>{a.social}</b></span>
                <span style={{marginLeft:12}}>Network: {networkWeb(a.network)}</span>
                {suddenDrop(a) && <span style={{marginLeft:11,color:"#FF4848",fontWeight:700}}><FaBolt/> Sudden Drop!</span>}
              </div>
              <div style={{marginTop:2,fontSize:14}}>
                Peer Feedback: {a.peerFeedback.length? a.peerFeedback.map((f,i)=><span key={i} style={{color:f>3?"#1de682":"#FFD700"}}>{f} </span>):<span style={{color:"#FFD70077"}}>None</span>}
                | Coach: {a.coachFeedback.map((f,i)=><span key={i} style={{color:f>3?"#1de682":"#FFD700"}}>{f} </span>)}
                | Parent: {a.parentFeedback.map((f,i)=><span key={i} style={{color:f>3?"#1de682":"#FFD700"}}>{f} </span>)}
              </div>
              <div style={{marginTop:3,fontSize:14}}>
                Comments: {a.comments.length ? a.comments.slice(-2).map((c,i)=><span key={i} style={{color:"#FFD700cc"}}>{c}; </span>):<span style={{color:"#FFD70077"}}>None</span>}
              </div>
              {/* Timeline mini-heat (past 5 entries) */}
              <div style={{marginTop:7,display:"flex",gap:3,alignItems:"center"}}>
                {a.timeline.map((v,i)=>
                  <div key={i} style={{
                    width:25,height:10,borderRadius:5,
                    background:v>=90?"#1de682":v>=75?"#FFD700":v>=60?"#FF4848":"#B22222",opacity:.9
                  }}/>
                )}
                <span style={{marginLeft:6,fontSize:13,color:"#FFD700cc"}}>Last 5</span>
              </div>
              {/* ACTION BUTTONS */}
              <div style={{position:"absolute",right:12,top:10,display:"flex",gap:5}}>
                {a.risk!=="Low" && !a.flagged && <Button size="sm" style={{background:"#FF4848",fontWeight:800}} onClick={()=>flagAthlete(a.id)}><FaClipboardCheck/> Flag</Button>}
                <Button size="sm" style={{background:"#FFD700",fontWeight:700}} onClick={()=>{setSimResult(null); setModal(a);}}>Scenario</Button>
              </div>
            </motion.div>
          )}
        </div>
        {/* SUMMARY */}
        <div style={{background:"#232b39",borderRadius:14,padding:16,width:320,boxShadow:"0 2px 12px #FFD70022"}}>
          <div style={{fontWeight:800,fontSize:19,color:"#FFD700",marginBottom:10}}><FaRobot style={{marginRight:7}}/>AI Threat & Opportunity Map</div>
          <div style={{marginBottom:12}}><FaArrowUp/> <b>{highFlyers.length}</b> high-flyers not yet recognized!</div>
          <div style={{marginBottom:12}}><FaFrown/> <b>{invisibleRisks.length}</b> invisible or silent risk athletes!</div>
          <div style={{fontSize:15,color:"#FFD700bb"}}>Use filters, feedback, and scenario sim to uncover risk & untapped talent.</div>
          <div style={{marginTop:13,fontSize:15,color:"#FFD70099"}}>
            <FaRegClock/> Last update: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
      {/* AUDIT TRAIL */}
      <div style={{background:"#222b37",borderRadius:14,padding:12,marginTop:15}}>
        <div style={{fontWeight:700,color:"#FFD700",marginBottom:7}}><FaHistory style={{marginRight:7}}/>Audit Trail</div>
        <ul style={{fontSize:15}}>
          {flagged.map((a,i)=>
            <li key={i} style={{color:"#1de682"}}><FaCheck/> {a.name} flagged as at risk on {a.interventions.find(x=>x.action==="Flagged")?.ts}</li>
          )}
        </ul>
        {flagged.length===0 && <div style={{color:"#FFD70077",fontSize:14}}>No flagged athletes this week.</div>}
      </div>
      {/* MODAL: Action/Scenario/Feedback */}
      {modal && (
        <div style={{
          position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(32,32,48,0.90)",zIndex:99,
          display:"flex",alignItems:"center",justifyContent:"center"
        }}>
          <div style={{
            background:"#283e51",borderRadius:18,padding:30,minWidth:420,color:"#FFD700",boxShadow:"0 4px 32px #FFD70033"
          }}>
            <h3 style={{fontWeight:900,fontSize:22,marginBottom:8}}>{modal.name} — Deep Risk Analytics</h3>
            <div>Status: <span style={{fontWeight:700,color:riskColor(modal.risk)}}>{modal.status} ({modal.risk})</span></div>
            <div style={{margin:"10px 0"}}>Engagement: <b>{modal.engagement}</b> | Attendance: <b>{modal.attendance}%</b> | Feedback: <b>{modal.feedback}/5</b></div>
            <div style={{margin:"10px 0",display:"flex",gap:16,alignItems:"center"}}>
              <span>Volatility: <b style={{color:volatilityColor(modal.volatility)}}>{modal.volatility}</b></span>
              <span>Social: <b style={{color:socialColor(modal.social)}}>{modal.social}</b></span>
              <span>Network: {networkWeb(modal.network)}</span>
            </div>
            <div style={{marginBottom:7}}>AI: <FaRobot style={{color:"#1de682",marginRight:4}}/>{modal.risk==="Invisible Risk"?"Suggest meeting and parental check-in":modal.risk==="High Flyer"?"Propose promotion or special role":"Standard monitoring"}</div>
            {/* Timeline */}
            <div>
              <b>History (Last 5 Weeks):</b>
              <div style={{display:"flex",gap:7,marginTop:2}}>
                {modal.timeline.map((v,i)=>
                  <div key={i} style={{
                    width:32,height:15,borderRadius:5,
                    background:v>=90?"#1de682":v>=75?"#FFD700":v>=60?"#FF4848":"#B22222",opacity:.93,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#222"
                  }}>{v}</div>
                )}
              </div>
            </div>
            {/* Feedback */}
            <div style={{margin:"12px 0"}}>
              <b>Peer Feedback:</b> {modal.peerFeedback.length ? modal.peerFeedback.join(", ") : "None"}
              <br/><b>Coach:</b> {modal.coachFeedback.length ? modal.coachFeedback.join(", ") : "None"}
              <br/><b>Parent:</b> {modal.parentFeedback.length ? modal.parentFeedback.join(", ") : "None"}
            </div>
            {/* Comments */}
            <div>
              <div style={{fontWeight:700,marginBottom:6}}>Action Log:</div>
              <ul style={{fontSize:15,maxHeight:70,overflowY:"auto"}}>
                {modal.comments?.map((c,i)=>
                  <li key={i} style={{color:"#FFD700cc"}}>{c}</li>
                )}
              </ul>
              <input type="text" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add feedback or log action..." style={{width:"85%",borderRadius:8,border:"1px solid #FFD700",padding:5,marginRight:7}}/>
              <Button size="sm" onClick={()=>{ addComment(modal.id,comment); setComment(""); }}>Add Log</Button>
            </div>
            {/* INTERVENTION & SIM */}
            <div style={{margin:"10px 0"}}>
              <div><b>Board/Coach Interventions:</b></div>
              <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                <Button size="sm" style={{background:"#1de682"}} onClick={()=>{assignIntervention(modal.id,"Assign Mentor");runSimulation(modal,"Assign Mentor");}}>Assign Mentor</Button>
                <Button size="sm" style={{background:"#FFD700"}} onClick={()=>{assignIntervention(modal.id,"Rest Period");runSimulation(modal,"Rest Period");}}>Rest Period</Button>
                <Button size="sm" style={{background:"#FFD700"}} onClick={()=>{assignIntervention(modal.id,"Promotion");runSimulation(modal,"Promotion");}}>Promotion</Button>
                <Button size="sm" style={{background:"#FFD700"}} onClick={()=>{assignIntervention(modal.id,"Switch Coach");runSimulation(modal,"Switch Coach");}}>Switch Coach</Button>
                <Button size="sm" style={{background:"#FFD700"}} onClick={()=>{assignIntervention(modal.id,"Board Meeting");runSimulation(modal,"Board Meeting");}}>Board Meeting</Button>
              </div>
              {simResult && <div style={{color:"#1de682",fontWeight:700,marginTop:9}}>{simResult.effect}</div>}
              <div style={{marginTop:8}}>
                <b>Intervention Log:</b>
                <ul>
                  {modal.interventions?.map((iv,i)=>
                    <li key={i} style={{color:"#FFD700bb"}}>{iv.action} ({iv.by}, {iv.ts})</li>
                  )}
                </ul>
              </div>
            </div>
            <Button size="sm" onClick={()=>setModal(null)} style={{background:"#FF4848",marginTop:12}}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detector;
