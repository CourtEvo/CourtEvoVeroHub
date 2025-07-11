import React, { useState } from "react";
import { FaBasketballBall, FaClock, FaTrash, FaDownload, FaRobot } from "react-icons/fa";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import jsPDF from "jspdf";
import "./GameBasedSessionPlanner.css";

const DRILL_LIBRARY = [
  { id: 1, name: "3v3 SSG", duration: 12, intensity: 8, type: "game", constraints: ["Shot clock", "Spacing"], desc: "Small-sided game focusing on decision making in limited space." },
  { id: 2, name: "Shell Defense", duration: 10, intensity: 6, type: "defense", constraints: ["Help/Recovery"], desc: "Defensive rotations and closeout teaching in shell format." },
  { id: 3, name: "Transition Wave", duration: 8, intensity: 9, type: "game", constraints: ["Fast break"], desc: "High-paced drill emphasizing transition offense and defense." },
  { id: 4, name: "Closeout 1v1", duration: 7, intensity: 7, type: "defense", constraints: ["Limited dribble"], desc: "Closeout to 1v1, with 2-dribble rule for offensive player." },
  { id: 5, name: "Pick & Roll Reads", duration: 9, intensity: 5, type: "offense", constraints: ["Decision"], desc: "Game situations to train various P&R coverages and reads." },
  { id: 6, name: "Free Throws (Pressure)", duration: 6, intensity: 3, type: "special", constraints: ["Consequence"], desc: "FTs with consequences, simulating end-of-game pressure." },
  { id: 7, name: "Full Court 5v5", duration: 16, intensity: 10, type: "game", constraints: ["Transition"], desc: "Full-court 5v5 with on-the-fly subs and shot clock." },
  { id: 8, name: "Circle Passing", duration: 5, intensity: 4, type: "tech", constraints: ["1-touch"], desc: "Warm-up passing drill for speed and accuracy." }
];
function intensityColor(intensity) {
  if (intensity >= 9) return "#f35650";
  if (intensity >= 7) return "#FFD700";
  if (intensity >= 5) return "#1de682";
  return "#b7bec9";
}
const PLAYER_GROUPS = ["Starters", "Bench", "Bigs", "Guards"];

export default function GameBasedSessionPlanner() {
  const [session, setSession] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [sessionObjective, setSessionObjective] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [drawerDrill, setDrawerDrill] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [playerGroups] = useState(PLAYER_GROUPS);
  const [liveMode, setLiveMode] = useState(false);
  const [liveStatus, setLiveStatus] = useState({});
  const [sessionHistory, setSessionHistory] = useState([]);

  // Timeline logic
  function onDragStart(id) { setDragId(id); }
  function onDropTimeline() {
    if (dragId !== null) {
      const drill = DRILL_LIBRARY.find(d=>d.id===dragId);
      setSession([...session, {...drill, instanceId: Date.now()+Math.random(), group: playerGroups[0]}]);
      setDragId(null);
    }
  }
  function removeDrill(instanceId) {
    setSession(session.filter(s=>s.instanceId !== instanceId));
    const nextLive = {...liveStatus}; delete nextLive[instanceId]; setLiveStatus(nextLive);
  }

  // Analytics
  const totalTime = session.reduce((a,s)=>a+s.duration,0);
  const avgIntensity = session.length ? Math.round(session.reduce((a,s)=>a+s.intensity,0)/session.length*10)/10 : 0;
  const gameTime = session.filter(s=>s.type==="game").reduce((a,s)=>a+s.duration,0);
  const constraintCounts = {};
  session.forEach(s=>{
    (s.constraints||[]).forEach(c=>{ constraintCounts[c]=1+(constraintCounts[c]||0); });
  });
  const constraintPie = Object.entries(constraintCounts).map(([label,v])=>({
    id: label, label, value: v, color: "#FFD700"
  }));
  const gameRatio = totalTime ? Math.round(100*gameTime/totalTime) : 0;
  const repeatDrills = session.reduce((map, d) => {
    map[d.name] = 1 + (map[d.name]||0); return map;
  }, {});
  const repeated = Object.values(repeatDrills).some(v=>v>2);

  // Quality score
  const quality = Math.round(
    Math.min(100,
      0.4*gameRatio + 0.2*avgIntensity*10 + 0.2*(constraintPie.length*12) + 0.2*(new Set(session.map(s=>s.group)).size*12)
    )
  );

  // LIVE evaluation analytics
  const completed = Object.values(liveStatus).filter(d=>d.status==="completed").length;
  const outstanding = Object.values(liveStatus).filter(d=>d.status==="outstanding").length;
  const skipped = Object.values(liveStatus).filter(d=>d.status==="skipped").length;
  const avgRating = Object.values(liveStatus).reduce((a,d)=>a+(d.rating||0),0) / (session.length || 1);

  // AI Copilot
  function copilotMsg() {
    let msg = [];
    if (totalTime > 90) msg.push("Warning: Session exceeds 90 min.");
    if (repeated) msg.push("Some drills are repeated too many times.");
    if (gameRatio < 60) msg.push("Less than 60% game-based: add SSGs or 5v5.");
    if (avgIntensity < 6) msg.push("Intensity below elite target. Add high-tempo drill.");
    if (session.length>0 && session[session.length-1].type==="tech") msg.push("Finish with game action for realism.");
    if (!msg.length) msg.push("Session is balanced and elite-standard.");
    return msg;
  }

  // PDF Export (export last live status if in live mode)
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,18,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CourtEvo Vero Game-Based Session", 13, 13);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 150, 13);
    doc.setTextColor(35,42,46);
    doc.setFontSize(11);
    let y = 26;
    doc.text(`Objective: ${sessionObjective}`, 13, y); y+=8;
    doc.setFontSize(10);
    doc.text(`Notes: ${sessionNotes}`, 13, y); y+=8;
    doc.setFontSize(11);
    doc.text(`Quality Gauge: ${quality}/100`, 13, y); y+=7;
    doc.text(`Total Time: ${totalTime} min  |  Avg. Intensity: ${avgIntensity}  |  Game Ratio: ${gameRatio}%`, 13, y);
    y += 7;
    if (liveMode && session.length) {
      doc.text("Drill Timeline (Live Evaluation):", 13, y); y+=5;
      session.forEach((s,i)=>{
        const stat = liveStatus[s.instanceId] || {};
        doc.setFontSize(10);
        doc.setFillColor(intensityColor(s.intensity));
        doc.rect(13, y-4, 3, 9, "F");
        doc.text(`${i+1}. ${s.name} (${s.duration} min, Int: ${s.intensity}, Group: ${s.group})`, 18, y+2);
        doc.text(`Status: ${stat.status||"planned"}   Rating: ${stat.rating||"-"}   Note: ${stat.note||""}`, 18, y+7);
        y+=13;
        if (y>270) { y=18; doc.addPage(); }
      });
    } else {
      doc.text("Drill Timeline:", 13, y); y+=5;
      session.forEach((s,i)=>{
        doc.setFontSize(10);
        doc.setFillColor(intensityColor(s.intensity));
        doc.rect(13, y-4, 3, 9, "F");
        doc.text(`${i+1}. ${s.name} (${s.duration} min, Int: ${s.intensity}) – [${s.constraints.join(", ")}] Group: ${s.group}`, 18, y+2);
        y+=9;
        if (y>270) { y=18; doc.addPage(); }
      });
    }
    y+=7;
    doc.setTextColor(120,120,120);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 13, 285);
    doc.save("Session_Plan.pdf");
  }

  // For longitudinal/trend: collect session history when saving a live eval
  function saveLiveSession() {
    setSessionHistory([
      ...sessionHistory,
      {
        session: JSON.parse(JSON.stringify(session)),
        liveStatus: JSON.parse(JSON.stringify(liveStatus)),
        sessionObjective,
        sessionNotes,
        date: new Date().toISOString().slice(0,10),
        quality,
        avgRating
      }
    ]);
    setLiveStatus({});
    setLiveMode(false);
  }

  // For trendline analytics
  const trendData = [
    {
      id: "Quality",
      data: sessionHistory.map((h,i)=>({x: h.date || ("S"+(i+1)), y: h.quality}))
    },
    {
      id: "Avg Rating",
      data: sessionHistory.map((h,i)=>({x: h.date || ("S"+(i+1)), y: h.avgRating || 0}))
    }
  ];

  return (
    <div className="gsp-root">
      <div className="gsp-header-row">
        <div className="gsp-title">
          <FaBasketballBall style={{color:"#FFD700",marginRight:12}}/>Game-Based Session Planner
        </div>
        <div className="gsp-header-actions">
          <button className="gsp-btn" onClick={exportPDF}><FaDownload/> PDF</button>
          <button className="gsp-btn" onClick={()=>setLiveMode(v=>!v)}>
            {liveMode ? "Exit Live Mode" : "Enter Live Practice Evaluation"}
          </button>
        </div>
      </div>
      {/* Session meta panel */}
      <div className="gsp-session-meta">
        <div>
          <label>Session Objective:</label>
          <input
            className="gsp-session-obj"
            value={sessionObjective}
            onChange={e=>setSessionObjective(e.target.value)}
            placeholder="E.g. Build transition habits, 70% game ratio..."
          />
        </div>
        <div>
          <label>Session Notes:</label>
          <textarea
            className="gsp-session-notes"
            value={sessionNotes}
            onChange={e=>setSessionNotes(e.target.value)}
            placeholder="Key reminders, player-specific notes..."
          />
        </div>
        <button
          className="gsp-btn"
          onClick={()=>{
            setTemplates([
              ...templates,
              {
                name: prompt("Template name?")||"Untitled",
                session,
                sessionObjective,
                sessionNotes
              }
            ]);
          }}
        >Save Template</button>
        {templates.length > 0 && (
          <select
            className="gsp-load-template"
            onChange={e=>{
              const t = templates.find(tmp=>tmp.name===e.target.value);
              if (t) {
                setSession(t.session);
                setSessionObjective(t.sessionObjective);
                setSessionNotes(t.sessionNotes);
              }
            }}
          >
            <option value="">Load template...</option>
            {templates.map(t=><option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        )}
      </div>
      {/* Session Quality Gauge */}
      <div className="gsp-quality-gauge">
        <div className="gsp-qual-label">Session Quality: {quality}/100</div>
        <div className="gsp-qual-bar">
          <div className="gsp-qual-bar-inner" style={{
            width: quality+"%",
            background: quality>85?"#35b378":quality>65?"#FFD700":"#f35650"
          }}></div>
        </div>
      </div>
      {/* Library & Timeline */}
      <div className="gsp-body-row">
        {/* Drill Library */}
        <div className="gsp-lib-col">
          <div className="gsp-lib-title">Basketball Drill Library</div>
          <div className="gsp-drill-list">
            {DRILL_LIBRARY.map(d=>
              <div
                key={d.id}
                className="gsp-drill"
                draggable
                onDragStart={()=>onDragStart(d.id)}
                title="Drag to timeline"
                onClick={()=>setDrawerDrill(d)}
              >
                <span className="gsp-drill-name">{d.name}</span>
                <span className="gsp-drill-dur">{d.duration} min</span>
                <span className="gsp-drill-int" style={{background:intensityColor(d.intensity)}}>Int: {d.intensity}</span>
                <div className="gsp-drill-cons">
                  {d.constraints.map((c,i)=>
                    <span className="gsp-drill-con" key={i}>{c}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Timeline */}
        <div className="gsp-timeline-col"
          onDragOver={e=>e.preventDefault()}
          onDrop={onDropTimeline}
        >
          <div className="gsp-timeline-title">Session Timeline {liveMode && "(Live Evaluation Mode)"}</div>
          <div className="gsp-timeline-list">
            {session.length === 0 && <div className="gsp-empty">Drag drills here to build your session.</div>}
            {session.map((s,i)=>{
              const stat = liveStatus[s.instanceId] || {};
              return (
                <div className={`gsp-timeline-drill gsp-live-${stat.status||"planned"}`} key={s.instanceId} onClick={()=>setDrawerDrill(s)}>
                  <span className="gsp-timeline-idx">{i+1}</span>
                  <span className="gsp-timeline-name">{s.name}</span>
                  <span className="gsp-timeline-dur">{s.duration} min</span>
                  <span className="gsp-timeline-int" style={{background:intensityColor(s.intensity)}}>Int: {s.intensity}</span>
                  <span className="gsp-timeline-type">{s.type.toUpperCase()}</span>
                  <span className="gsp-timeline-group">
                    <select
                      className="gsp-group-select"
                      value={s.group}
                      onChange={e=>{
                        setSession(session.map(dr=>
                          dr.instanceId===s.instanceId
                            ? {...dr, group: e.target.value}
                            : dr
                        ))
                      }}
                    >
                      {playerGroups.map(g=><option key={g}>{g}</option>)}
                    </select>
                  </span>
                  <div className="gsp-timeline-cons">
                    {s.constraints.map((c,i)=>
                      <span className="gsp-timeline-con" key={i}>{c}</span>
                    )}
                  </div>
                  <button className="gsp-timeline-remove" onClick={e=>{e.stopPropagation();removeDrill(s.instanceId)}} title="Remove from session">
                    <FaTrash/>
                  </button>
                  {/* Live practice evaluation controls */}
                  {liveMode && (
                    <div className="gsp-live-controls" onClick={e=>e.stopPropagation()}>
                      <select
                        value={stat.status||"planned"}
                        onChange={e=>{
                          setLiveStatus(prev => ({
                            ...prev,
                            [s.instanceId]: {...stat, status: e.target.value}
                          }));
                        }}
                      >
                        <option value="planned">Planned</option>
                        <option value="completed">Completed</option>
                        <option value="modified">Modified</option>
                        <option value="skipped">Skipped</option>
                        <option value="outstanding">Outstanding</option>
                      </select>
                      <span>
                        <b>Rating:</b>
                        {[1,2,3,4,5].map(n=>
                          <span
                            key={n}
                            className={`gsp-live-star${(stat.rating||0)>=n ? " gsp-live-star-on" : ""}`}
                            onClick={()=>setLiveStatus(prev=>({...prev,[s.instanceId]:{...stat, rating:n}}))}
                            title={n+" stars"}
                          >★</span>
                        )}
                      </span>
                      <input
                        className="gsp-live-note"
                        placeholder="Note"
                        value={stat.note||""}
                        onChange={e=>setLiveStatus(prev=>({...prev,[s.instanceId]:{...stat, note:e.target.value}}))}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Timeline analytics */}
          <div className="gsp-timeline-analytics">
            <span><FaClock/> Total: <b>{totalTime} min</b></span>
            <span>Avg. Intensity: <b>{avgIntensity}</b></span>
            <span>Game-Based: <b>{gameRatio}%</b></span>
          </div>
          {/* AI Copilot */}
          <div className="gsp-copilot-row" onClick={()=>setAiOpen(v=>!v)}>
            <FaRobot style={{color:"#FFD700",marginRight:7}}/>
            <span>
              {copilotMsg().join(" ")}
            </span>
            {aiOpen && (
              <div className="gsp-copilot-modal">
                <b>AI Copilot Suggestions:</b>
                <ul>
                  <li>Use 5v5 or 3v3 SSG to close the session for maximal realism.</li>
                  <li>Monitor intensity: aim for average 8+ for elite athletes.</li>
                  <li>Game-based ratio should be at least 65% for U18/U19.</li>
                  <li>Tag at least one "Decision" and one "Consequence" constraint per session.</li>
                  <li>Include a competitive free throw segment under pressure.</li>
                </ul>
              </div>
            )}
          </div>
          {/* Constraint Pie */}
          <div className="gsp-pie-analytics">
            <div className="gsp-pie-title">Constraint Time Allocation</div>
            <div style={{height: 180, width: 260, margin: "0 auto"}}>
              <ResponsivePie
                data={constraintPie.length?constraintPie:[{id:"None",label:"None",value:1}]}
                margin={{top:13,right:17,bottom:22,left:13}}
                innerRadius={0.54}
                padAngle={1.2}
                cornerRadius={4}
                colors={{ datum: "data.color" }}
                borderWidth={2}
                borderColor={{ from: "color", modifiers: [["darker", 1.1]] }}
                enableRadialLabels={false}
                animate={true}
                theme={{
                  labels: { text: { fill: "#FFD700", fontWeight: 800 } },
                  legends: { text: { fill: "#FFD700" } }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Live Practice Analytics & Reflection */}
      {liveMode && session.length > 0 && (
        <div className="gsp-live-eval">
          <div className="gsp-live-summary">
            <div>Completed: <b>{completed}/{session.length}</b></div>
            <div>Outstanding: <b>{outstanding}</b></div>
            <div>Skipped: <b>{skipped}</b></div>
            <div>Avg. Drill Rating: <b>{Math.round(avgRating*10)/10 || "–"}/5</b></div>
            <button className="gsp-btn" onClick={saveLiveSession}>Save Practice to History</button>
          </div>
          <table className="gsp-live-table">
            <thead>
              <tr>
                <th>#</th><th>Drill</th><th>Group</th><th>Planned</th><th>Status</th><th>Rating</th><th>Note</th>
              </tr>
            </thead>
            <tbody>
              {session.map((s,i)=>{
                const stat = liveStatus[s.instanceId] || {};
                return (
                  <tr key={s.instanceId}>
                    <td>{i+1}</td>
                    <td>{s.name}</td>
                    <td>{s.group}</td>
                    <td>{s.duration}min/{s.intensity}</td>
                    <td>{stat.status||"planned"}</td>
                    <td>
                      {stat.rating ? [...Array(stat.rating)].map((_,j)=><span key={j} style={{color:"#FFD700"}}>★</span>) : "–"}
                    </td>
                    <td>{stat.note||""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Session History Trend */}
      {sessionHistory.length > 0 && (
        <div className="gsp-history-trend">
          <div className="gsp-history-title">Session Quality & Avg. Drill Rating Over Time</div>
          <div style={{height:140, width:410, margin:"0 auto"}}>
            <ResponsiveLine
              data={trendData}
              margin={{top:24,right:12,bottom:42,left:42}}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: 100 }}
              axisBottom={{tickRotation: -20, legend:"Date", legendOffset:28}}
              axisLeft={{tickSize:6,legend:"Score",legendOffset:-22}}
              colors={["#FFD700", "#1de682"]}
              pointSize={7}
              theme={{
                axis:{ticks:{text:{fill:"#FFD700"}}},
                grid:{line:{stroke:"#5c636e",strokeDasharray:"2 2"}},
                legends:{text:{fill:"#FFD700"}}
              }}
              enableArea={false}
              legends={[{anchor:"top-right",direction:"column",translateY:-13,translateX:18,itemWidth:65,itemHeight:19,symbolSize:15,symbolShape:"circle"}]}
              height={140}
            />
          </div>
        </div>
      )}
      <div className="gsp-tagline">BE REAL. BE VERO.</div>
      {/* Drill Detail Drawer */}
      {drawerDrill && (
        <div className="gsp-drawer-overlay" onClick={()=>setDrawerDrill(null)}>
          <div className="gsp-drawer" onClick={e=>e.stopPropagation()}>
            <div className="gsp-drawer-title">{drawerDrill.name}</div>
            <div className="gsp-drawer-meta">
              <b>Type:</b> {drawerDrill.type.toUpperCase()} &nbsp; | &nbsp; <b>Duration:</b> {drawerDrill.duration} min
            </div>
            <div className="gsp-drawer-int">Intensity: <span style={{background:intensityColor(drawerDrill.intensity),color:"#232a2e",borderRadius:6,padding:"1px 7px"}}>{drawerDrill.intensity}</span></div>
            <div><b>Constraints:</b> {drawerDrill.constraints.join(", ")}</div>
            <div className="gsp-drawer-desc">{drawerDrill.desc || "[Drill description here]"}</div>
            <div><a href="#" className="gsp-drawer-video">(Demo) Watch Video</a></div>
            <button className="gsp-btn" onClick={()=>{
              setSession([...session, {...drawerDrill, instanceId: Date.now()+Math.random(), group: playerGroups[0]}]);
              setDrawerDrill(null);
            }}>Add to Session</button>
          </div>
        </div>
      )}
    </div>
  );
}
