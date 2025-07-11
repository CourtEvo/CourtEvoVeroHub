import React, { useState } from "react";
import { FaBolt, FaPlaneDeparture, FaCloudSun, FaBed, FaFlag, FaUsers, FaRobot, FaClipboardCheck, FaArrowDown, FaArrowUp,
     FaHistory, FaBullhorn, FaSync, FaUserCheck, FaFileExport, FaExclamationTriangle, FaStar, FaPlus,
      FaBrain, FaLeaf, FaComment, FaChartBar, FaChartLine, FaCheckCircle, FaFire, FaTrash, FaEdit, FaSave,
       FaFolderOpen, FaRegFolder, FaRegSave, FaUndo, FaLightbulb } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// DEMO DATA
const demoPlayers = [
  { id: 1, name: "Luka Vuković", resilience: 92, adaptability: 88, stress: 18, color: "#1de682", pos: "PG" },
  { id: 2, name: "Ivan Horvat", resilience: 80, adaptability: 75, stress: 36, color: "#FFD700", pos: "SG" },
  { id: 3, name: "Tomislav Šarić", resilience: 69, adaptability: 60, stress: 55, color: "#17a861", pos: "C" },
  { id: 4, name: "Marko Jurić", resilience: 60, adaptability: 54, stress: 73, color: "#3f8cfa", pos: "SF" },
];

// DEFAULT STRESSORS (user can add more)
const baseStressors = [
  { key: "travel", label: "Travel", icon: <FaPlaneDeparture />, impact: 11 },
  { key: "altitude", label: "Altitude", icon: <FaCloudSun />, impact: 13 },
  { key: "timezone", label: "Timezone", icon: <FaSync />, impact: 7 },
  { key: "crowd", label: "Hostile Crowd", icon: <FaBullhorn />, impact: 14 },
  { key: "sleep", label: "Sleep Loss", icon: <FaBed />, impact: 12 },
  { key: "jetlag", label: "Jet Lag", icon: <FaPlaneDeparture />, impact: 15 },
  { key: "food", label: "Food Change", icon: <FaClipboardCheck />, impact: 6 },
  { key: "ref", label: "Ref Bias", icon: <FaFlag />, impact: 9 },
  { key: "pressure", label: "Pressure Game", icon: <FaBolt />, impact: 10 },
];

// Built-in scenario templates
const scenarioTemplates = [
  { name: "EuroAway Double Header", factors: ["travel", "jetlag", "altitude", "crowd"], notes: "Two games, long travel, crowd noise" },
  { name: "Derby Hostility + Jetlag", factors: ["jetlag", "crowd", "ref", "pressure"], notes: "Hostile local derby, jet lag, ref risk" },
  { name: "Long-Haul Playoff Crunch", factors: ["travel", "pressure", "sleep", "food"], notes: "Playoff on road, food and sleep disrupted" },
];

const Button = ({ children, ...props }) => (
  <button
    style={{
      background: "linear-gradient(90deg,#FFD700 80%,#1de682 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "12px 20px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #FFD70044"
    }}
    {...props}
  >{children}</button>
);

const EnvironmentalAdaptabilityLab = () => {
  const [players, setPlayers] = useState(demoPlayers);
  const [selected, setSelected] = useState([1,2,3,4]);
  const [stressors, setStressors] = useState(baseStressors);
  const [customStress, setCustomStress] = useState({label:"",impact:8});
  const [currentStressors, setCurrentStressors] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [scenarioLib, setScenarioLib] = useState(scenarioTemplates);
  const [saveScenario, setSaveScenario] = useState("");
  const [fav, setFav] = useState([]);
  const [showGraph, setShowGraph] = useState(false);

  // Add custom stressor
  const addCustomStressor = () => {
    if(!customStress.label) return;
    const key = customStress.label.toLowerCase().replace(/[^a-z0-9]/g,"") + (Math.random()+"").slice(2,5);
    setStressors([...stressors, { key, label: customStress.label, icon: <FaStar />, impact: Number(customStress.impact) }]);
    setCustomStress({label:"",impact:8});
  };

  // Add stressor
  const toggleStress = key => {
    setCurrentStressors(currentStressors.includes(key)
      ? currentStressors.filter(s => s !== key)
      : [...currentStressors, key]
    );
    setAiResult(null);
  };

  // Select athletes (squad or individuals)
  const toggleSelected = id => {
    setSelected(selected.includes(id)
      ? selected.filter(i=>i!==id)
      : [...selected, id]
    );
    setAiResult(null);
  };

  // Save/load scenarios
  const saveToLib = () => {
    if (!saveScenario) return;
    setScenarioLib([{name:saveScenario,factors:[...currentStressors],notes:"Custom scenario"}, ...scenarioLib]);
    setSaveScenario("");
  };
  const loadScenario = factors => {
    setCurrentStressors([...factors]);
    setAiResult(null);
  };
  const deleteScenario = name => {
    setScenarioLib(scenarioLib.filter(s=>s.name!==name));
  };

  // Simulate AI: calculate new player stats and risk
  const simulate = () => {
    let impact = currentStressors.reduce((sum,k) => sum + (stressors.find(s=>s.key===k)?.impact||0), 0);
    let squadResilience = 0;
    let results = players.map(p => {
      if (!selected.includes(p.id)) return p;
      let stress = Math.min(100, p.stress + impact + Math.floor(Math.random()*7-3));
      let adaptability = Math.max(0, p.adaptability - Math.round(impact/2) + Math.floor(Math.random()*3-2));
      let resilience = Math.max(0, p.resilience - Math.round(impact/2) + Math.floor(Math.random()*3-2));
      squadResilience += resilience;
      return {...p, stress, adaptability, resilience};
    });
    squadResilience = Math.round(squadResilience/(selected.length||1));
    setPlayers(results);
    // Risk overlays
    let highRisk = results.filter(p=>selected.includes(p.id) && (p.stress>80 || p.resilience<55));
    let burnout = results.filter(p=>selected.includes(p.id) && (p.stress>85));
    setAiResult({
      squadResilience,
      riskMsg: burnout.length>0 ? (
        <span style={{color:"#FF4848",fontWeight:900}}><FaFire/> Burnout Alert! {burnout.map(b=>b.name).join(", ")} at extreme risk. Assign full recovery and mental support.</span>
      ) : highRisk.length>0 ? (
        <span style={{color:"#FFD700",fontWeight:900}}><FaExclamationTriangle/> Watch: {highRisk.map(h=>h.name).join(", ")} at high stress/risk. Schedule rest and monitor.</span>
      ) : (
        <span style={{color:"#1de682",fontWeight:900}}><FaCheckCircle/> All selected players above safe threshold. Continue as planned.</span>
      ),
      action: burnout.length>0 ? "Assign All Recovery" : highRisk.length>0 ? "Assign Recovery/Mental" : "Export as Report"
    });
    setHistory([{date:new Date().toLocaleTimeString(), scenario:[...currentStressors], squadResilience},...history]);
    setShowExport(false);
  };

  // Assign protocol actions
  const assignRecovery = () => {
    setPlayers(players.map(p => selected.includes(p.id) ? {
      ...p,
      stress: Math.max(0, p.stress-18),
      adaptability: Math.min(100, p.adaptability+9),
      resilience: Math.min(100, p.resilience+12)
    }:p));
    setAiResult({...aiResult, action: "Recovery assigned: Risk reduced"});
    setHistory([{date:new Date().toLocaleTimeString(), scenario:[...currentStressors,"recovery"], squadResilience:aiResult?.squadResilience+11},...history]);
  };
  const assignNutrition = () => {
    setPlayers(players.map(p => selected.includes(p.id) ? {
      ...p,
      adaptability: Math.min(100, p.adaptability+11)
    }:p));
    setAiResult({...aiResult, action: "Nutrition boost assigned"});
  };
  const assignTeamTalk = () => {
    setPlayers(players.map(p => selected.includes(p.id) ? {
      ...p,
      resilience: Math.min(100, p.resilience+8)
    }:p));
    setAiResult({...aiResult, action: "Team talk assigned"});
  };
  const assignMental = () => {
    setPlayers(players.map(p => selected.includes(p.id) ? {
      ...p,
      stress: Math.max(0, p.stress-12),
      resilience: Math.min(100, p.resilience+7)
    }:p));
    setAiResult({...aiResult, action: "Mental prep assigned"});
  };

  // AI Playcall
  const aiPlaycall = () => {
    let msg = "";
    if(aiResult && aiResult.squadResilience<55)
      msg = "Scenario is a high-risk trap. Recommend: Rotate lineup, add sleep day, split travel if possible. Board should discuss emergency plan.";
    else if(aiResult && aiResult.squadResilience<75)
      msg = "Squad can survive, but risk is significant. Recommend: Add team talk, boost nutrition, and brief coaches for lineup flexibility.";
    else
      msg = "Scenario within optimal range. Consider training adaptation under noise/travel for next squad improvement.";
    setAiResult({...aiResult, playcall:msg});
  };

  // Export (mock)
  const exportReport = () => {
    setShowExport(true);
    setTimeout(()=>setShowExport(false),1600);
  };

  // Impact graph demo (squad trend)
  function ImpactGraph() {
    // History: last 6 squadResilience
    let data = history.slice(0,6).reverse();
    let max = Math.max(100, ...data.map(d=>d.squadResilience));
    return (
      <div style={{background:"#232b39",borderRadius:13,padding:"14px 18px",marginBottom:15}}>
        <b style={{color:"#FFD700"}}><FaChartBar/> Squad Resilience Trend</b>
        <div style={{display:"flex",alignItems:"flex-end",height:90,gap:12,marginTop:10}}>
          {data.map((d,i)=>
            <div key={i} style={{width:30,background:"#FFD70055",borderRadius:8,position:"relative",marginLeft:4}}>
              <motion.div
                style={{
                  width:30,
                  borderRadius:8,
                  background:d.squadResilience>80?"#1de682":d.squadResilience>60?"#FFD700":"#FF4848",
                  position:"absolute",bottom:0
                }}
                initial={{height:0}}
                animate={{height:`${Math.round(80*d.squadResilience/max)}px`}}
                transition={{duration:0.8,delay:i*0.14}}
              />
              <div style={{position:"absolute",top:-22,left:-7,color:"#fff",fontWeight:700}}>{d.squadResilience}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Recovery window chart (mock visual)
  function RecoveryWindow() {
    let risk = aiResult?.squadResilience || 100;
    let best = risk>85 ? "Compete" : risk>68 ? "Train" : "Rest";
    return (
      <div style={{background:"#232b39",borderRadius:13,padding:"13px 19px",marginBottom:13,display:"flex",alignItems:"center",gap:15}}>
        <FaChartLine color="#FFD700" style={{fontSize:23}}/>
        <div style={{fontWeight:900,fontSize:17,color:"#FFD700"}}>Optimal Recovery Window:</div>
        <div style={{
          background:best==="Compete"?"#1de682":best==="Train"?"#FFD700":"#FF4848",
          color:best==="Rest"?"#fff":"#181e23",fontWeight:900,fontSize:16,padding:"7px 23px",borderRadius:11
        }}>{best}</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(135deg,#283E51 0%,#0b3326 100%)", color:"#fff",
      fontFamily:"Segoe UI,sans-serif", padding:32, overflow:"hidden"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:24,flexWrap:"wrap"}}>
        <FaBolt style={{fontSize:33,color:"#FFD700"}}/>
        <span style={{fontSize:27,fontWeight:900,letterSpacing:1}}>Environmental Adaptability Stress Test Lab</span>
        <span style={{color:"#1de682",fontWeight:900,marginLeft:13}}><FaRobot style={{marginRight:8}}/>Scenario Arena & Resilience AI</span>
        <Button style={{marginLeft:13,background:"#FFD700",color:"#181e23"}} onClick={exportReport}><FaFileExport style={{marginRight:7}}/>Export Report</Button>
      </div>
      {/* SCENARIO LIBRARY */}
      <div style={{background:"#232b39",borderRadius:13,padding:"10px 16px",marginBottom:13}}>
        <b style={{color:"#FFD700"}}><FaRegFolder/> Scenario Library</b>
        <div style={{display:"flex",alignItems:"center",gap:9,marginTop:7,flexWrap:"wrap"}}>
          {scenarioLib.map((s,i)=>
            <motion.div key={i}
              style={{
                background:"#FFD70022",color:"#FFD700",fontWeight:900,padding:"8px 20px",borderRadius:10,cursor:"pointer",marginRight:6,marginBottom:5,display:"flex",alignItems:"center"
              }}
              whileHover={{scale:1.07}}
              onClick={()=>loadScenario(s.factors)}
            >
              <FaFolderOpen style={{marginRight:7}}/>{s.name}
              <span style={{marginLeft:11,fontWeight:600,color:"#fff",fontSize:13}}>{s.notes}</span>
              <FaTrash style={{marginLeft:14,cursor:"pointer"}} onClick={e=>{e.stopPropagation();deleteScenario(s.name);}}/>
            </motion.div>
          )}
        </div>
        <input value={saveScenario} onChange={e=>setSaveScenario(e.target.value)} placeholder="Save current as..." style={{marginTop:7,padding:7,borderRadius:8,fontWeight:700}}/>
        <Button size="sm" style={{marginLeft:8,background:"#1de682"}} onClick={saveToLib}><FaRegSave/> Save</Button>
      </div>
      {/* CUSTOM STRESSORS */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:11}}>
        <b style={{color:"#FFD700"}}><FaPlus/> Add Stressor:</b>
        <input value={customStress.label} onChange={e=>setCustomStress({...customStress,label:e.target.value})} placeholder="Custom (e.g. Sponsor Dinner)" style={{padding:7,borderRadius:8,fontWeight:700}}/>
        <input type="number" value={customStress.impact} onChange={e=>setCustomStress({...customStress,impact:e.target.value})} style={{width:55,padding:7,borderRadius:8,marginLeft:6}}/>
        <Button size="sm" onClick={addCustomStressor}><FaSave/> Add</Button>
      </div>
      {/* SELECT ATHLETES */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
        <b style={{color:"#FFD700"}}><FaUsers/> Squad/Individual:</b>
        {players.map(p=>
          <span key={p.id} onClick={()=>toggleSelected(p.id)}
            style={{
              background:selected.includes(p.id)?"#1de682":"#232b39",
              color:selected.includes(p.id)?"#181e23":"#FFD700",
              fontWeight:900,padding:"8px 17px",borderRadius:12,cursor:"pointer",marginRight:6
            }}
          >{p.name} <span style={{color:"#fff",fontWeight:700,fontSize:13}}>({p.pos})</span></span>
        )}
        <Button size="sm" style={{background:"#FFD700",color:"#181e23",marginLeft:8}} onClick={()=>setSelected(players.map(p=>p.id))}><FaUsers/> Squad</Button>
      </div>
      {/* STRESSOR SELECTION */}
      <div style={{display:"flex",alignItems:"center",gap:15,marginBottom:20,flexWrap:"wrap"}}>
        {stressors.map(s=>
          <motion.div key={s.key}
            initial={{scale:0.9,opacity:0.5}}
            animate={{
              scale:currentStressors.includes(s.key)?1.13:1,
              opacity:currentStressors.includes(s.key)?1:0.6
            }}
            transition={{duration:0.25}}
            onClick={()=>toggleStress(s.key)}
            style={{
              background:currentStressors.includes(s.key)?"#FFD700":"#232b39",
              color:currentStressors.includes(s.key)?"#181e23":"#FFD700",
              fontWeight:900,fontSize:17, borderRadius:16, cursor:"pointer", padding:"16px 28px", boxShadow:"0 2px 12px #FFD70033", border:"2px solid #FFD700"
            }}
            title={s.label}
          >
            <span style={{fontSize:21,marginRight:7}}>{s.icon}</span>
            {s.label}
          </motion.div>
        )}
        <Button style={{background:"#1de682"}} onClick={()=>setCurrentStressors([])}><FaUndo/> Reset</Button>
      </div>
      {/* Scenario Arena (Avatars & Rings) */}
      <div style={{background:"#232b39",borderRadius:17,padding:"20px 22px",marginBottom:28,boxShadow:"0 3px 24px #FFD70022"}}>
        <div style={{fontWeight:900,color:"#FFD700",fontSize:19,marginBottom:13}}><FaUsers style={{marginRight:8}}/>Squad Resilience Arena</div>
        <div style={{display:"flex",gap:28,alignItems:"flex-end",justifyContent:"center",flexWrap:"wrap"}}>
          {players.filter(p=>selected.includes(p.id)).map((p,i)=>
            <motion.div
              key={p.id}
              initial={{y:16,scale:0.9,opacity:0.7}}
              animate={{
                scale:1+(p.stress>80?0.15:p.stress>60?0.09:0),
                y:-Math.round((100-p.resilience)/3),
                opacity:1
              }}
              transition={{duration:0.6,delay:i*0.13}}
              style={{
                display:"flex",flexDirection:"column",alignItems:"center",
                marginRight:14,background:"#181e23",borderRadius:23,padding:"19px 13px",
                boxShadow:"0 1px 17px #FFD70044"
              }}>
              <div style={{
                width:90,height:90,borderRadius:45,background:p.color,position:"relative",
                display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,boxShadow:"0 3px 15px #FFD70055"
              }}>
                <motion.div
                  style={{
                    width:85,height:85,borderRadius:43,background:"#232b39",position:"absolute",top:2.5,left:2.5,
                    boxShadow:"0 2px 12px #FFD70044"
                  }}
                  animate={{
                    boxShadow:p.stress>70?"0 0 19px #FF4848":p.stress>45?"0 0 19px #FFD700":"0 0 19px #1de682"
                  }}
                  transition={{duration:0.7}}
                />
                <span style={{fontSize:31,fontWeight:900,color:"#fff",position:"relative",zIndex:1}}>{p.name.split(" ")[0]}</span>
                {/* Animated stress ring */}
                <svg width="90" height="90" style={{position:"absolute",top:0,left:0}}>
                  <circle cx={45} cy={45} r={38} fill="none" stroke="#222" strokeWidth={5}/>
                  <motion.circle
                    cx={45} cy={45} r={38} fill="none"
                    stroke={p.stress>70?"#FF4848":p.stress>45?"#FFD700":"#1de682"}
                    strokeWidth={8}
                    strokeDasharray={238}
                    strokeDashoffset={Math.round(238*(1-p.stress/100))}
                    initial={false}
                    animate={{strokeDashoffset:Math.round(238*(1-p.stress/100))}}
                    transition={{duration:0.7}}
                  />
                </svg>
              </div>
              <div style={{fontWeight:900,fontSize:17,color:"#FFD700"}}>Resilience: {p.resilience}</div>
              <div style={{fontWeight:900,fontSize:14,color:"#1de682",marginTop:3}}>Adaptability: {p.adaptability}</div>
              <div style={{fontWeight:700,fontSize:14,color:p.stress>70?"#FF4848":p.stress>45?"#FFD700":"#1de682",marginTop:3}}>Stress: {p.stress}</div>
            </motion.div>
          )}
        </div>
      </div>
      {/* Boardroom Impact Graphs + Recovery Window */}
      <div style={{display:"flex",gap:27,flexWrap:"wrap",marginBottom:14}}>
        <ImpactGraph/>
        <RecoveryWindow/>
      </div>
      {/* Simulate/AI/Actions */}
      <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:12,flexWrap:"wrap"}}>
        <Button style={{background:"#FFD700",color:"#181e23"}} onClick={simulate}><FaRobot style={{marginRight:7}}/>Simulate Scenario</Button>
        {aiResult && aiResult.action==="Assign All Recovery" && <Button style={{background:"#1de682"}} onClick={assignRecovery}><FaLeaf/> All Recovery</Button>}
        {aiResult && aiResult.action==="Assign Recovery/Mental" && (
          <>
            <Button style={{background:"#FFD700",color:"#181e23"}} onClick={assignRecovery}><FaLeaf/> Recovery</Button>
            <Button style={{background:"#FFD700",color:"#181e23"}} onClick={assignMental}><FaBrain/> Mental Prep</Button>
            <Button style={{background:"#FFD700",color:"#181e23"}} onClick={assignTeamTalk}><FaComment/> Team Talk</Button>
            <Button style={{background:"#FFD700",color:"#181e23"}} onClick={assignNutrition}><FaClipboardCheck/> Nutrition</Button>
          </>
        )}
        {aiResult && aiResult.action==="Export as Report" && <Button style={{background:"#FFD700",color:"#181e23"}} onClick={exportReport}><FaFileExport/> Export Report</Button>}
        <Button style={{background:"#232b39",color:"#FFD700"}} onClick={()=>setPlayers(demoPlayers)}><FaUndo/> Reset Players</Button>
        <Button style={{background:"#1de682",color:"#181e23"}} onClick={aiPlaycall}><FaLightbulb/> AI Playcall</Button>
      </div>
      {/* AI result & Playcall */}
      {aiResult && (
        <div style={{background:"#232b39",borderRadius:11,padding:"13px 17px",fontWeight:900,fontSize:17,marginBottom:19,boxShadow:"0 2px 9px #FFD70033"}}>
          {aiResult.riskMsg}
          {aiResult.playcall && <div style={{marginTop:9,color:"#FFD700"}}><FaRobot style={{marginRight:6}}/>{aiResult.playcall}</div>}
        </div>
      )}
      {/* Scenario history */}
      <div style={{background:"#232b39",borderRadius:13,padding:"10px 17px",marginBottom:19}}>
        <b style={{color:"#FFD700"}}><FaHistory/> Scenario History</b>
        <ul>
          {history.length===0?<li style={{color:"#FFD70077"}}>No scenarios yet.</li>:
            history.map((h,i)=>
              <li key={i} style={{color:"#1de682",fontWeight:800}}>{h.date}: {h.scenario.join(", ")} — Squad Resilience: {h.squadResilience}</li>
            )}
        </ul>
      </div>
      {/* Export notification */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed", top: 50, right: 50, zIndex: 120, background: "#232b39", color: "#FFD700", padding: 19, borderRadius: 12, boxShadow: "0 3px 18px #FFD70088", fontWeight: 900
            }}>
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (PDF/PNG available soon)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnvironmentalAdaptabilityLab;
