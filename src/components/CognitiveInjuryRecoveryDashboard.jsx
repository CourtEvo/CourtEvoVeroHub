import React, { useState } from "react";
import { FaUserAlt, FaHeartbeat, FaBrain, FaCalendarAlt, FaChartLine, FaRobot, FaComments, FaExclamationTriangle, FaCheckCircle, FaArrowRight, FaPlus, FaSmile, FaFrown, FaHandHoldingHeart, FaSadCry, FaRegLaugh, FaRegMeh, FaRegTired, FaHistory, FaFileExport, FaUserFriends, FaUserMd } from "react-icons/fa";

// --- Button helper
const Button = ({ children, onClick, style = {}, size, ...props }) => (
  <button
    onClick={onClick}
    style={{
      border: 'none',
      borderRadius: 8,
      padding: size === 'sm' ? '6px 12px' : '13px 18px',
      background: '#FFD700',
      color: '#181e23',
      fontWeight: 700,
      fontSize: size === 'sm' ? 15 : 17,
      cursor: 'pointer',
      ...style
    }}
    {...props}
  >{children}</button>
);

// --- Demo Data
const demoCases = [
  {
    id: 1,
    name: "Luka Vuković",
    injury: "ACL Partial Tear",
    position: "Guard",
    dayZero: "2025-04-12",
    expectedReturn: "2025-09-15",
    events: [
      { date: "2025-04-12", type: "Injury", label: "ACL Partial Tear", icon: <FaExclamationTriangle color="#FF4848"/> },
      { date: "2025-04-22", type: "Surgery", label: "Successful surgery", icon: <FaCheckCircle color="#1de682"/> },
      { date: "2025-05-18", type: "Milestone", label: "Weight-bearing phase", icon: <FaSmile color="#FFD700"/> },
      { date: "2025-06-10", type: "Setback", label: "Pain/swelling after session", icon: <FaSadCry color="#FF4848"/> },
      { date: "2025-06-25", type: "Progress", label: "Full range of motion", icon: <FaCheckCircle color="#1de682"/> },
      { date: "2025-07-07", type: "Feedback", label: "Reports fear of re-injury", icon: <FaFrown color="#FF4848"/> },
      { date: "2025-07-20", type: "Peer", label: "Team captain invites Luka to team events", icon: <FaHandHoldingHeart color="#FFD700"/> },
      { date: "2025-08-01", type: "Coach", label: "Mentor check-in scheduled", icon: <FaComments color="#1de682"/> },
    ],
    timeline: [
      { date: "2025-04-12", confidence: 6, anxiety: 8, readiness: 2, net: 3, rtp: 41 },
      { date: "2025-04-22", confidence: 7, anxiety: 7, readiness: 2, net: 4, rtp: 45 },
      { date: "2025-05-18", confidence: 7, anxiety: 5, readiness: 3, net: 5, rtp: 53 },
      { date: "2025-06-10", confidence: 5, anxiety: 9, readiness: 2, net: 2, rtp: 37 },
      { date: "2025-06-25", confidence: 8, anxiety: 4, readiness: 5, net: 6, rtp: 62 },
      { date: "2025-07-07", confidence: 5, anxiety: 7, readiness: 3, net: 3, rtp: 49 },
      { date: "2025-07-20", confidence: 7, anxiety: 4, readiness: 5, net: 6, rtp: 66 },
      { date: "2025-08-01", confidence: 8, anxiety: 3, readiness: 7, net: 7, rtp: 80 },
    ],
    feedback: [
      { role: "Athlete", entry: "Feeling frustrated, not sure if I’m progressing fast enough.", date: "2025-05-01" },
      { role: "Parent", entry: "Worried about Luka being withdrawn at home.", date: "2025-05-10" },
      { role: "Coach", entry: "Energy is low but wants to be included in team meetings.", date: "2025-05-12" },
      { role: "Medical", entry: "Physical healing on track, some mental hurdles remain.", date: "2025-07-07" },
      { role: "Peer", entry: "Team misses Luka at practice, sending messages to keep up spirits.", date: "2025-07-15" }
    ],
    interventions: [
      { label: "Mentor assigned", date: "2025-08-01" },
      { label: "Board check-in", date: "2025-07-25" }
    ],
    aiSummary: "Psychosocial Readiness: High vigilance required. Fear of re-injury detected, recommend peer support and gradual return scenarios.",
    aiProjection: "If trend continues, athlete should reach full RTP by September, but risk of social isolation if not actively supported in August.",
    flags: ["Fear of re-injury", "Emotional volatility"],
    networkTouches: [
      { date: "2025-06-01", coach: 1, peer: 0, family: 1, medical: 1 },
      { date: "2025-07-01", coach: 2, peer: 2, family: 1, medical: 1 },
      { date: "2025-08-01", coach: 2, peer: 3, family: 1, medical: 1 }
    ]
  },
  {
    id: 2,
    name: "Marko Jurić",
    injury: "Ankle Fracture",
    position: "Forward",
    dayZero: "2025-06-18",
    expectedReturn: "2025-09-01",
    events: [
      { date: "2025-06-18", type: "Injury", label: "Left ankle fracture", icon: <FaExclamationTriangle color="#FF4848"/> },
      { date: "2025-07-01", type: "Progress", label: "First light jog", icon: <FaCheckCircle color="#1de682"/> },
      { date: "2025-07-14", type: "Milestone", label: "Return to shooting drills", icon: <FaSmile color="#FFD700"/> },
      { date: "2025-07-20", type: "Setback", label: "Self-reported anxiety, skipping team chat", icon: <FaFrown color="#FF4848"/> },
      { date: "2025-07-28", type: "Feedback", label: "Coach: Resisting video review", icon: <FaComments color="#FF4848"/> },
      { date: "2025-08-10", type: "Peer", label: "Peer group organizes gaming night", icon: <FaHandHoldingHeart color="#FFD700"/> },
    ],
    timeline: [
      { date: "2025-06-18", confidence: 6, anxiety: 7, readiness: 1, net: 2, rtp: 36 },
      { date: "2025-07-01", confidence: 7, anxiety: 6, readiness: 2, net: 3, rtp: 44 },
      { date: "2025-07-14", confidence: 7, anxiety: 5, readiness: 4, net: 5, rtp: 59 },
      { date: "2025-07-20", confidence: 5, anxiety: 8, readiness: 2, net: 2, rtp: 32 },
      { date: "2025-07-28", confidence: 5, anxiety: 7, readiness: 3, net: 3, rtp: 39 },
      { date: "2025-08-10", confidence: 7, anxiety: 4, readiness: 5, net: 6, rtp: 67 },
    ],
    feedback: [
      { role: "Athlete", entry: "Getting bored and isolated at home.", date: "2025-07-10" },
      { role: "Coach", entry: "Marko not replying to texts, mood lower than normal.", date: "2025-07-20" },
      { role: "Peer", entry: "Trying to involve him in group calls.", date: "2025-07-29" }
    ],
    interventions: [
      { label: "Peer group action", date: "2025-08-10" }
    ],
    aiSummary: "Withdrawal risk detected. Board/family should boost engagement and monitor anxiety before clearance for return.",
    aiProjection: "Peer group engagement should be expanded; trend shows readiness possible by September with active support.",
    flags: ["Withdrawal risk", "Peer support"],
    networkTouches: [
      { date: "2025-07-01", coach: 1, peer: 0, family: 1, medical: 1 },
      { date: "2025-08-01", coach: 1, peer: 2, family: 1, medical: 1 }
    ]
  }
];

// --- Helper for emotional barometer
const emojiMeter = (value, type) => {
  if (type === "confidence") {
    if (value >= 8) return <FaRegLaugh style={{color:"#1de682"}}/>;
    if (value >= 6) return <FaSmile style={{color:"#FFD700"}}/>;
    if (value >= 4) return <FaRegMeh style={{color:"#FFD700"}}/>;
    return <FaRegTired style={{color:"#FF4848"}}/>;
  }
  if (type === "anxiety") {
    if (value >= 8) return <FaSadCry style={{color:"#FF4848"}}/>;
    if (value >= 6) return <FaFrown style={{color:"#FFD700"}}/>;
    if (value >= 4) return <FaSmile style={{color:"#1de682"}}/>;
    return <FaRegLaugh style={{color:"#FFD700"}}/>;
  }
  if (type === "readiness") {
    if (value >= 7) return <FaCheckCircle style={{color:"#1de682"}}/>;
    if (value >= 4) return <FaChartLine style={{color:"#FFD700"}}/>;
    return <FaExclamationTriangle style={{color:"#FF4848"}}/>;
  }
  return null;
};

const palette = ["#1de682", "#FFD700", "#FF4848", "#F09E00"];

// --- SVG Graph for Recovery Data
function DataSVG({ data }) {
  const w = 360, h = 90, pad = 28;
  if (!data.length) return null;
  // normalize
  const maxY = 10, minY = 0, step = (w-2*pad)/(data.length-1);
  // Graph for confidence (green), anxiety (red), readiness (gold)
  function linePoints(field) {
    return data.map((d,i)=>[
      pad + i*step,
      h-pad - ((d[field]-minY)/(maxY-minY))*(h-2*pad)
    ]);
  }
  const fields = [
    { field:"confidence", color:"#1de682", label:"Confidence" },
    { field:"anxiety", color:"#FF4848", label:"Anxiety" },
    { field:"readiness", color:"#FFD700", label:"Readiness" }
  ];
  return (
    <svg width={w} height={h} style={{background:"#222b37",borderRadius:10}}>
      {fields.map((f,fi)=>(
        <polyline key={fi}
          fill="none"
          stroke={f.color}
          strokeWidth={3}
          points={linePoints(f.field).map(pt=>pt.join(",")).join(" ")}
        />
      ))}
      {/* Dots */}
      {fields.map((f,fi)=>
        linePoints(f.field).map((pt,i)=>(
          <circle key={fi+"-"+i} cx={pt[0]} cy={pt[1]} r={4} fill={f.color} />
        ))
      )}
      {/* Axis */}
      <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#fff" strokeWidth={1.3}/>
      {/* Labels */}
      <text x={pad-19} y={h-pad+3} fill="#FFD700" fontSize={13}>0</text>
      <text x={pad-25} y={pad+4} fill="#FFD700" fontSize={13}>10</text>
      <text x={pad-4} y={pad-2} fill="#FFD700cc" fontSize={12}>↑</text>
      {/* Legend */}
      {fields.map((f,fi)=>
        <g key={f.field}>
          <rect x={pad+fi*80} y={8} width={16} height={7} fill={f.color}/>
          <text x={pad+fi*80+22} y={15} fill={f.color} fontSize={13}>{f.label}</text>
        </g>
      )}
    </svg>
  );
}

// --- Support Network Touch Map
function TouchMap({ touches }) {
  // Each touch: {date, coach, peer, family, medical}
  return (
    <div style={{display:"flex",gap:9,alignItems:"flex-end",marginBottom:7}}>
      {touches.map((t,i)=>
        <div key={i} title={t.date}
          style={{padding:6,background:"#283e51",borderRadius:8,minWidth:55,boxShadow:"0 2px 10px #FFD70022",textAlign:"center"}}>
          <div style={{fontWeight:700,color:"#FFD700",fontSize:14}}>{t.date.slice(5)}</div>
          <div>
            <span title="Coach" style={{marginRight:3,color:t.coach>1?"#FFD700":"#FFD70066"}}><FaUserFriends/></span>
            <span title="Peer" style={{marginRight:3,color:t.peer>1?"#1de682":"#FFD70066"}}><FaSmile/></span>
            <span title="Family" style={{marginRight:3,color:t.family>0?"#FFD700":"#FFD70044"}}><FaHandHoldingHeart/></span>
            <span title="Medical" style={{marginRight:3,color:t.medical>0?"#1de682":"#FFD70044"}}><FaUserMd/></span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- RTP Score Bar
function RTPBar({ score }) {
  return (
    <div style={{
      width: "100%", height: 15, background: "#232b39", borderRadius: 8,
      margin: "8px 0", position: "relative"
    }}>
      <div style={{
        width: `${score}%`, height: 15, background: score>=75 ? "#1de682" : score>=50 ? "#FFD700" : "#FF4848",
        borderRadius: 8, boxShadow: "0 2px 12px #FFD70033"
      }}/>
      <span style={{
        position: "absolute", left: score>=90?"92%":score+"%", top: -2, fontWeight: 900, color: "#FFD700"
      }}>{score}% RTP</span>
    </div>
  );
}

const CognitiveInjuryRecoveryDashboard = () => {
  const [cases, setCases] = useState(demoCases);
  const [currentId, setCurrentId] = useState(cases[0].id);
  const [modal, setModal] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [simResult, setSimResult] = useState(null);
  const [viewCaseId, setViewCaseId] = useState(cases[0].id);

  const selected = cases.find(a=>a.id===currentId);

  // Scenario simulation (AI)
  const simulate = (action) => {
    let msg = "";
    if (action==="Peer Support") msg = "AI: Peer support increases confidence +2, reduces anxiety -2, improves RTP +7%. Boost social engagement.";
    if (action==="Gradual Return") msg = "AI: Gradual return reduces re-injury fear, increases readiness +2, RTP +6%.";
    if (action==="Board Review") msg = "AI: Board review may uncover unseen emotional barriers and reveal setbacks early.";
    if (action==="Add Mentor") msg = "AI: Mentor adds consistency, increases confidence +1, network +2, RTP +4%.";
    if (action==="Early Return") msg = "AI WARNING: Early return increases anxiety +2, readiness -1, risk of relapse, RTP drops -10%.";
    if (action==="No Intervention") msg = "AI: No intervention risks plateau or dropout. RTP unchanged, confidence/anxiety may worsen.";
    setSimResult(msg);
  };

  // Add new timeline/feedback entries (demo only)
  const addNote = () => {
    setCases(cases.map(a => a.id === selected.id ? {
      ...a,
      feedback: [...a.feedback, { role: "Board", entry: noteInput, date: new Date().toLocaleDateString() }]
    } : a));
    setNoteInput("");
  };

  // Export PDF (stub for now)
  const exportPDF = () => {
    alert("Export to PDF coming soon. Will include full timeline, events, feedback, AI summary, and interventions for board/family/medical review.");
  };

  // Board can open past cases (for audit/benchmark)
  const handleCaseChange = e => {
    setCurrentId(Number(e.target.value));
    setViewCaseId(Number(e.target.value));
    setModal(false);
    setSimResult(null);
  };

  // Recent setback? (last event is "Setback" or recent drop in confidence/readiness)
  const recentSetback = () => {
    const lastEvent = selected.events[selected.events.length-1];
    const t = selected.timeline;
    if (!t.length) return false;
    return lastEvent.type==="Setback" || (t.length>=2 && (t[t.length-1].confidence<t[t.length-2].confidence-2));
  };

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(135deg,#283E51 0%,#485563 100%)", color:"#fff",
      fontFamily:"Segoe UI,sans-serif", padding:28, overflow:"hidden"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:20}}>
        <FaHeartbeat style={{fontSize:34, color:"#FFD700"}}/>
        <span style={{fontSize:28, fontWeight:900}}>Cognitive & Social Injury Recovery Casefiles</span>
        <span style={{color:"#FFD700", fontWeight:700, marginLeft:16}}><FaRobot style={{marginRight:8}}/>AI-Readiness Index, Timeline & 360 Feedback</span>
        <select value={viewCaseId} onChange={handleCaseChange} style={{marginLeft:20,padding:7,borderRadius:7,fontWeight:700,fontSize:16}}>
          {cases.map(a=>
            <option key={a.id} value={a.id}>{a.name} ({a.injury})</option>
          )}
        </select>
        <Button size="sm" style={{background:"#FFD70022",marginLeft:9}} onClick={exportPDF}><FaFileExport style={{marginRight:4}}/>Export PDF</Button>
      </div>

      {/* Horizontal timeline explorer */}
      <div style={{
        background:"#232b39", borderRadius:20, boxShadow:"0 3px 28px #181e2330", padding:24, marginBottom:28,
        display:"flex", alignItems:"flex-end", overflowX:"auto", gap:38
      }}>
        {cases.map((a,i) =>
          <div key={a.id} style={{
            background: a.id === currentId ? "#FFD70022" : "#222b37",
            borderRadius:16, padding:"17px 19px", minWidth:260, cursor:"pointer",
            boxShadow: a.id === currentId ? "0 2px 24px #FFD70055":"0 1px 7px #181e2311",
            border: a.id === currentId ? "3px solid #FFD700" : "2.5px solid #283E51"
          }} onClick={()=>setCurrentId(a.id)}>
            <div style={{fontWeight:900, fontSize:19, color:"#FFD700"}}>{a.name}</div>
            <div style={{fontSize:16, margin:"7px 0"}}><FaBrain/> {a.injury}</div>
            <div style={{fontSize:14, color:"#FFD700bb"}}>Position: {a.position}</div>
            <div style={{margin:"10px 0 0 0",display:"flex",gap:10,alignItems:"center"}}>
              <FaCalendarAlt/> <b>From:</b> {a.dayZero}
            </div>
            <div style={{fontSize:13, marginTop:6}}>Expected Return: <span style={{color:"#1de682",fontWeight:700}}>{a.expectedReturn}</span></div>
            <div style={{marginTop:12,display:"flex",gap:8,alignItems:"center"}}>
              <span title="Confidence">{emojiMeter(a.timeline[a.timeline.length-1]?.confidence,"confidence")}</span>
              <span title="Anxiety">{emojiMeter(a.timeline[a.timeline.length-1]?.anxiety,"anxiety")}</span>
              <span title="Readiness">{emojiMeter(a.timeline[a.timeline.length-1]?.readiness,"readiness")}</span>
            </div>
            <RTPBar score={a.timeline[a.timeline.length-1]?.rtp||0}/>
            <Button size="sm" style={{marginTop:15}} onClick={()=>setModal(true)}><FaPlus style={{marginRight:5}}/>Open Casefile</Button>
          </div>
        )}
      </div>

      {/* Modern Risk-Over-Time SVG */}
      <div style={{background:"#232b39",borderRadius:16,padding:"22px 26px",marginBottom:22,boxShadow:"0 2px 16px #181e2330"}}>
        <div style={{fontWeight:900, fontSize:18, color:"#FFD700", marginBottom:6}}><FaChartLine style={{marginRight:6}}/>Risk, Resilience & RTP Progress ({selected.name})</div>
        <DataSVG data={selected.timeline}/>
        <div style={{margin:"15px 0 2px 0"}}>
          <span style={{fontWeight:700,color:"#FFD700"}}><FaHistory style={{marginRight:7}}/>RTP Score History:</span>
          {selected.timeline.map((pt,i)=>
            <span key={i} style={{marginLeft:13,fontWeight:700,color:pt.rtp>=75?"#1de682":pt.rtp>=50?"#FFD700":"#FF4848"}}>
              {pt.date}: {pt.rtp}%
            </span>
          )}
        </div>
      </div>

      {/* Peer/Family/Medical Touch Map */}
      <div style={{background:"#222b37",borderRadius:16,padding:"20px 18px",marginBottom:23,boxShadow:"0 2px 13px #FFD70011"}}>
        <div style={{fontWeight:800,fontSize:17,color:"#FFD700",marginBottom:8}}><FaUserFriends style={{marginRight:6}}/>Support Network Touch Map</div>
        <TouchMap touches={selected.networkTouches}/>
      </div>

      {/* Visual Timeline/Events */}
      <div style={{
        background:"#232b39", borderRadius:18, padding:24, marginBottom:23, minHeight:170,
        boxShadow:"0 2px 18px #181e2330"
      }}>
        <div style={{fontWeight:900, fontSize:19, color:"#FFD700", marginBottom:7}}><FaChartLine style={{marginRight:6}}/>Key Events Timeline ({selected.name})</div>
        <div style={{display:"flex",alignItems:"center",gap:19,overflowX:"auto"}}>
          {selected.events.map((e,i)=>
            <div key={i} style={{
              background:"#FFD70022",borderRadius:9,padding:"7px 14px",fontWeight:700,
              color: e.type==="Setback"?"#FF4848":e.type==="Progress"?"#1de682":"#FFD700",display:"flex",alignItems:"center"
            }}>
              {e.icon} <span style={{marginLeft:6}}>{e.date}: {e.label}</span>
            </div>
          )}
        </div>
        {/* Setback/resilience alert */}
        {recentSetback() && (
          <div style={{marginTop:14,fontWeight:900,color:"#FF4848",fontSize:16,animation:"flash .9s infinite alternate"}}>
            <FaSadCry style={{marginRight:7}}/>Recent Setback/Confidence Drop Detected! Board/Coach Action Recommended.
            <Button size="sm" style={{marginLeft:13,background:"#1de682"}} onClick={()=>simulate("Peer Support")}>Bounce Back: Peer Support</Button>
            <Button size="sm" style={{marginLeft:8,background:"#FFD700"}} onClick={()=>simulate("Gradual Return")}>Bounce Back: Gradual Return</Button>
          </div>
        )}
      </div>

      {/* Modal - Casefile */}
      {modal && (
        <div style={{
          position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(32,32,48,0.96)",zIndex:98,
          display:"flex",alignItems:"center",justifyContent:"center"
        }}>
          <div style={{
            background:"#283e51",borderRadius:23,padding:35,minWidth:460,
            color:"#FFD700",boxShadow:"0 4px 32px #FFD70033",maxWidth:560
          }}>
            <h2 style={{fontWeight:900,fontSize:25,marginBottom:13,letterSpacing:1}}>{selected.name} — Casefile</h2>
            <div style={{marginBottom:11}}><FaBrain style={{marginRight:6}}/>Injury: <b>{selected.injury}</b></div>
            <div style={{fontSize:15,color:"#FFD70099",marginBottom:9}}>Recovery period: <b>{selected.dayZero} → {selected.expectedReturn}</b></div>
            <div style={{margin:"8px 0 13px 0"}}>
              <span style={{fontWeight:700}}>AI Summary:</span>
              <span style={{color:"#FFD700",marginLeft:5}}><FaRobot/> {selected.aiSummary}</span>
              {selected.flags.map((f,i)=>
                <span key={i} style={{marginLeft:7,color:"#FF4848",fontWeight:700}}><FaExclamationTriangle style={{marginRight:3}}/>{f}</span>
              )}
            </div>
            <div style={{margin:"8px 0 11px 0",color:"#FFD700bb",fontWeight:800}}><FaRobot/> AI Projection: {selected.aiProjection}</div>
            <div>
              <b style={{fontSize:15}}>Feedback/Journal:</b>
              <ul style={{fontSize:15,maxHeight:90,overflowY:"auto",margin:"8px 0 8px 0"}}>
                {selected.feedback.map((fb,i)=>
                  <li key={i} style={{color:fb.role==="Medical"?"#1de682":fb.role==="Coach"?"#FFD700":fb.role==="Parent"?"#FFD700bb":"#FFD700"}}><b>{fb.role}:</b> {fb.entry} <span style={{color:"#FFD70088",fontSize:12,marginLeft:6}}>({fb.date})</span></li>
                )}
              </ul>
              <div style={{display:"flex",gap:8}}>
                <input type="text" value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Log a note/feedback..." style={{width:"74%",borderRadius:8,border:"1.5px solid #FFD700",padding:7}}/>
                <Button size="sm" onClick={addNote}><FaPlus/> Log</Button>
              </div>
            </div>
            <div style={{marginTop:15,marginBottom:5}}>
              <b style={{fontSize:15}}>Board/Coach/Family Interventions:</b>
              <ul style={{fontSize:15,margin:"7px 0 7px 0"}}>
                {selected.interventions.map((iv,i)=>
                  <li key={i} style={{color:"#1de682"}}>{iv.label} <span style={{color:"#FFD70099",fontSize:12,marginLeft:7}}>({iv.date})</span></li>
                )}
              </ul>
            </div>
            {/* Scenario simulation */}
            <div style={{marginTop:15}}>
              <b style={{fontSize:15}}><FaRobot/> Scenario Simulation:</b>
              <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                <Button size="sm" onClick={()=>simulate("Peer Support")}>Peer Support</Button>
                <Button size="sm" onClick={()=>simulate("Gradual Return")}>Gradual Return</Button>
                <Button size="sm" onClick={()=>simulate("Board Review")}>Board Review</Button>
                <Button size="sm" onClick={()=>simulate("Add Mentor")}>Add Mentor</Button>
                <Button size="sm" style={{background:"#FFD70066"}} onClick={()=>simulate("Early Return")}>Early Return (AI Warn)</Button>
                <Button size="sm" style={{background:"#FFD70044"}} onClick={()=>simulate("No Intervention")}>No Intervention</Button>
              </div>
              {simResult && <div style={{color:simResult.includes("WARNING")?"#FF4848":"#1de682",fontWeight:700,marginTop:10}}>{simResult}</div>}
            </div>
            {/* RTP/Resilience */}
            <div style={{marginTop:13}}>
              <RTPBar score={selected.timeline[selected.timeline.length-1]?.rtp||0}/>
            </div>
            <Button size="sm" style={{background:"#FF4848",marginTop:20}} onClick={()=>{setSimResult(null); setModal(false);}}>Close Casefile</Button>
          </div>
        </div>
      )}

      {/* CSS Animation for setback flash */}
      <style>{`
        @keyframes flash {
          0% { box-shadow: 0 0 0 #FFD700; }
          100% { box-shadow: 0 0 18px #FFD70099; }
        }
      `}</style>
    </div>
  );
};

export default CognitiveInjuryRecoveryDashboard;
