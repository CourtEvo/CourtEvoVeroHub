import React, { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveRadar } from "@nivo/radar";
import { 
  FaUser, FaStar, FaExclamationTriangle, FaCheckCircle, FaCrown, FaRobot, FaArrowUp, FaArrowDown, FaClipboardList, FaDownload, FaFileCsv, FaChartPie, FaBolt, FaBasketballBall, FaPlus, FaTimes, FaArrowRight, FaFilter, FaListUl, FaHandPointer, FaArrowLeft, FaSortAmountDown, FaSync, FaForward, FaFlag, FaTrophy, FaUsers, FaLayerGroup
} from "react-icons/fa";
import jsPDF from "jspdf";
import "./PlayerScoutingTracker.css";

// --- Demo Data ---
const INIT_PLAYERS = [
  {
    id: "P001", name: "Luka Nović", position: "PG", age: 17, team: "U18", status: "Emerging",
    physical: 4, skills: 5, attitude: 5, potential: 5, risk: "low",
    tags: ["High Motor", "Vocal Leader"], flags: [],
    ratings: { speed: 5, shooting: 4, passing: 5, vision: 5, defense: 3, size: 3 },
    notes: [{ date: "2024-04-15", by: "Coach A", text: "Dominates in transition." }],
    shortlist: true,
    events: [
      { date: "2024-03-01", type: "milestone", label: "Promoted to U18", color: "#FFD700" },
      { date: "2024-04-14", type: "highlight", label: "Career-high 26 pts", color: "#35b378" }
    ]
  },
  {
    id: "P002", name: "Ivan Radić", position: "F", age: 18, team: "U19", status: "At Risk",
    physical: 3, skills: 3, attitude: 3, potential: 3, risk: "high",
    tags: ["Streaky", "Needs Consistency"], flags: [{ color: "#FFD700", label: "Attendance Concern" }],
    ratings: { speed: 3, shooting: 3, passing: 3, vision: 3, defense: 2, size: 4 },
    notes: [{ date: "2024-03-14", by: "Coach B", text: "Effort drops when off the ball." }],
    shortlist: false,
    events: [
      { date: "2024-03-07", type: "disciplinary", label: "Missed training", color: "#f35650" }
    ]
  },
  {
    id: "P003", name: "Josip Perić", position: "C", age: 17, team: "U18", status: "Potential",
    physical: 5, skills: 3, attitude: 4, potential: 5, risk: "medium",
    tags: ["Elite Size", "Late Bloomer"], flags: [],
    ratings: { speed: 2, shooting: 2, passing: 3, vision: 2, defense: 5, size: 5 },
    notes: [{ date: "2024-02-28", by: "Coach A", text: "Huge improvement, conditioning plan." }],
    shortlist: true,
    events: []
  }
];
const POS_LABELS = { "PG": "Point", "SG": "Shooting", "F": "Forward", "C": "Center" };
const RISK_COLORS = { low: "#35b378", medium: "#FFD700", high: "#f35650" };
const EVENT_ICONS = { milestone: <FaTrophy />, disciplinary: <FaFlag />, highlight: <FaStar /> };

// --- PDF Export (Player Card or Grid) ---
function exportPDF(players, mode="grid") {
  const doc = new jsPDF("p", "mm", "a4");
  (Array.isArray(players)?players:[players]).forEach((p, i) => {
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Player Scouting Card", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 12;
    doc.setTextColor(35,42,46);
    doc.setFontSize(13);
    doc.text(`${p.name} (${p.position}, ${p.team}) • Age ${p.age}`, 12, y); y+=8;
    doc.text(`Potential: ${p.potential} | Physical: ${p.physical} | Skills: ${p.skills} | Attitude: ${p.attitude}`, 12, y); y+=8;
    doc.text(`Status: ${p.status}`, 12, y); y+=7;
    if (p.tags && p.tags.length) { doc.setFontSize(10); doc.text(`Tags: ${p.tags.join(", ")}`, 12, y); y+=6;}
    if (p.flags && p.flags.length) {
      doc.text("Flags:", 12, y); y+=5;
      p.flags.forEach(f => { doc.setFillColor(f.color); doc.rect(12, y, 5, 5, "F"); doc.setTextColor(35,42,46); doc.text(f.label, 20, y+4); y+=6; });
    }
    if (p.events && p.events.length) {
      doc.setFontSize(12); doc.text("Timeline/Events:", 12, y); y+=6;
      p.events.forEach(e=>{ doc.text(`${e.date}: ${e.label}`, 14, y); y+=5; });
    }
    y+=3; doc.setFontSize(12); doc.text("Ratings:", 12, y); y+=6;
    Object.entries(p.ratings).forEach(([k,v])=>{
      doc.text(`${k[0].toUpperCase()+k.slice(1)}: ${v}/5`, 12, y); y+=5;
    });
    y+=2; doc.setFontSize(12); doc.text("Notes:", 12, y); y+=6;
    (p.notes||[]).forEach(n=>{ doc.setFontSize(10); doc.text(`${n.date} (${n.by}): ${n.text}`, 12, y); y+=5; });
    y+=4;
    doc.setTextColor(120,120,120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    if (mode==="grid" && i<players.length-1) doc.addPage();
  });
  doc.save(mode==="grid" ? "Player_Scouting_Grid.pdf" : `Player_${players.name}_Card.pdf`);
}
// CSV Export (as before)
function exportCSV(players) {
  const rows = [
    ["ID","Name","Position","Age","Team","Status","Physical","Skills","Attitude","Potential","Risk","Tags","Flags","Notes"]
  ];
  (Array.isArray(players)?players:[players]).forEach(p=>{
    rows.push([
      p.id, p.name, p.position, p.age, p.team, p.status,
      p.physical, p.skills, p.attitude, p.potential, p.risk,
      (p.tags||[]).join("|"),
      (p.flags||[]).map(f=>f.label).join("|"),
      (p.notes||[]).map(n=>`${n.date}: ${n.text} (${n.by})`).join(" || ")
    ]);
  });
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "PlayerScoutingGrid.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// --- Analytics ---
function positionAnalytics(players) {
  const counts = {};
  players.forEach(p=>{counts[p.position]=1+(counts[p.position]||0);});
  return Object.keys(counts).map(pos=>({position:pos,count:counts[pos]}));
}
function potentialAnalytics(players) {
  const bins = [0,0,0,0,0,0];
  players.forEach(p=>{bins[p.potential]++;});
  return bins.map((c,i)=>({potential:i,count:c}));
}
function riskByTeam(players) {
  const teams = {};
  players.forEach(p=>{
    if (!teams[p.team]) teams[p.team]={low:0,medium:0,high:0};
    teams[p.team][p.risk]++;
  });
  return Object.keys(teams).map(team=>({team,...teams[team]}));
}
function top5(players) {
  return [...players].sort((a,b)=>b.potential-a.potential).slice(0,5);
}

// --- Rating Stars ---
function Stars({ val }) {
  return (
    <span className="scout-stars">
      {[...Array(5)].map((_,i)=>
        <FaStar key={i} style={{color:i<val?"#FFD700":"#b7bec9"}}/>
      )}
    </span>
  );
}

// --- AI Copilot ---
function aiCopilot(players, view="all", filter="") {
  const highRisk = players.filter(p=>p.risk==="high");
  const gems = players.filter(p=>p.potential>=5 && p.risk!=="high");
  const weak = (() => {
    // "Which position is weakest pipeline?"
    const pos = {};
    players.forEach(p=>{pos[p.position]=(pos[p.position]||0)+(p.potential);});
    return Object.keys(pos).reduce((a,b)=>pos[a]<pos[b]?a:b,"PG");
  })();
  let notes = [];
  if (view==="all") {
    if (highRisk.length) notes.push(`${highRisk.length} at risk of drop-out.`);
    if (gems.length) notes.push(`${gems.length} “hidden gem”${gems.length>1?"s":""} (Potential 5).`);
    if (!notes.length) notes.push("No major risks flagged.");
    notes.push("Weakest pipeline: " + (POS_LABELS[weak]||weak));
  }
  if (view==="risk") {
    notes.push(`${highRisk.length} at risk of drop-out. Top: ${highRisk.map(p=>p.name).join(", ")}`);
  }
  if (view==="potential") {
    notes.push(`${gems.length} “hidden gems”: ${gems.map(p=>p.name).join(", ")}`);
  }
  return (
    <div className="scout-copilot">
      <FaRobot style={{color:"#FFD700",marginRight:7}}/>
      {notes.join(" | ")}
    </div>
  );
}

// --- Boardroom Draft Board (Drag/Drop) ---
function moveItem(arr, from, to) {
  const next = [...arr];
  const [item] = next.splice(from,1);
  next.splice(to,0,item);
  return next;
}
function BoardDraftBoard({ shortlist, setShortlist }) {
  const [dragIdx, setDragIdx] = useState(null);
  function onDragStart(idx) { setDragIdx(idx);}
  function onDrop(idx) {
    setShortlist(list=>moveItem(list,dragIdx,idx));
    setDragIdx(null);
  }
  return (
    <div className="scout-boardroom">
      <div className="scout-boardroom-header"><FaCrown/> Boardroom Draft Board</div>
      <ul className="scout-board-list">
        {shortlist.map((p,i)=>
          <li
            key={p.id}
            className="scout-board-row"
            draggable
            onDragStart={()=>onDragStart(i)}
            onDragOver={e=>e.preventDefault()}
            onDrop={()=>onDrop(i)}
            style={{borderLeft: `7px solid ${RISK_COLORS[p.risk]}`}}
          >
            <span className="scout-board-rank">{i+1}</span>
            <span className="scout-board-name">{p.name} ({p.position}, {p.team})</span>
            <span className="scout-board-pot"><FaStar style={{color:"#FFD700"}}/> {p.potential}</span>
            <span className="scout-board-risk" style={{color:RISK_COLORS[p.risk]}}>{p.risk.toUpperCase()}</span>
          </li>
        )}
      </ul>
      <button className="scout-pdf-btn" style={{marginTop:8}} onClick={()=>exportPDF(shortlist,"grid")}>
        <FaDownload/> Export Draft Board PDF
      </button>
    </div>
  );
}

// --- Timeline/Events Thread ---
function Timeline({ events }) {
  if (!events || !events.length) return <div className="scout-empty-timeline">No events/milestones yet.</div>;
  return (
    <ul className="scout-timeline">
      {events.map((e,i)=>
        <li key={i} style={{borderLeft:`6px solid ${e.color}`}}>
          <span className="scout-timeline-date">{e.date}</span>
          <span className="scout-timeline-ic">{EVENT_ICONS[e.type]||<FaBolt/>}</span>
          <span className="scout-timeline-label">{e.label}</span>
        </li>
      )}
    </ul>
  );
}

// --- Main Component ---
export default function PlayerScoutingTracker() {
  const [players, setPlayers] = useState(INIT_PLAYERS);
  const [drill, setDrill] = useState(null);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [showBoard, setShowBoard] = useState(false);
  const [multi, setMulti] = useState([]);
  // Boardroom Draft Board list
  const shortlist = players.filter(p=>p.shortlist).sort((a,b)=>b.potential-a.potential);
  const [boardList, setBoardList] = useState(shortlist);

  // --- Grid + Filtering ---
  let filtered = players;
  if (filter) filtered = filtered.filter(p=>p.position===filter||p.team===filter);
  if (riskFilter) filtered = filtered.filter(p=>p.risk===riskFilter);

  // --- Grid ---
  return (
    <div className="scout-main">
      <div className="scout-header">
        <h2><FaClipboardList style={{color:"#FFD700",marginRight:13}}/>Player Scouting & ID Tracker</h2>
        <div>
          <button className="scout-pdf-btn" onClick={()=>exportPDF(filtered)}><FaDownload/> Export PDF</button>
          <button className="scout-csv-btn" onClick={()=>exportCSV(filtered)}><FaFileCsv/> Export CSV</button>
          <button className="scout-pdf-btn" onClick={()=>setShowBoard(s=>!s)}><FaCrown/> Board Draft</button>
        </div>
      </div>

      {/* Analytics */}
      <div className="scout-analytics-row">
        <div className="scout-analytics-card">
          <div className="scout-analytics-title"><FaChartPie/> By Position</div>
          <div style={{height:110, width:220}}>
            <ResponsiveBar
              data={positionAnalytics(players)}
              keys={["count"]}
              indexBy="position"
              margin={{top:16, right:15, bottom:32, left:36}}
              padding={0.33}
              colors={["#FFD700"]}
              axisBottom={{
                tickSize: 6,
                legend: "Position",
                legendOffset: 16,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Players",
                legendOffset: -20,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={80}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="scout-analytics-card">
          <div className="scout-analytics-title"><FaStar/> By Potential</div>
          <div style={{height:110, width:220}}>
            <ResponsiveBar
              data={potentialAnalytics(players)}
              keys={["count"]}
              indexBy="potential"
              margin={{top:16, right:15, bottom:32, left:36}}
              padding={0.33}
              colors={["#FFD700"]}
              axisBottom={{
                tickSize: 6,
                legend: "Potential",
                legendOffset: 16,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Players",
                legendOffset: -20,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={80}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="scout-analytics-card">
          <div className="scout-analytics-title"><FaExclamationTriangle/> Risk by Team</div>
          <div style={{height:110, width:220}}>
            <ResponsiveBar
              data={riskByTeam(players)}
              keys={["low","medium","high"]}
              indexBy="team"
              margin={{top:16, right:15, bottom:32, left:36}}
              padding={0.33}
              colors={["#35b378","#FFD700","#f35650"]}
              axisBottom={{
                tickSize: 6,
                legend: "Team",
                legendOffset: 16,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Players",
                legendOffset: -20,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={80}
              isInteractive={false}
              groupMode="stacked"
            />
          </div>
        </div>
        {aiCopilot(players)}
      </div>

      {/* Filters/Selectors */}
      <div className="scout-filter-row">
        <label><FaFilter/> Filter: </label>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">All</option>
          {Array.from(new Set(players.map(p=>p.position))).map(pos=>
            <option value={pos} key={pos}>{POS_LABELS[pos]||pos}</option>
          )}
          {Array.from(new Set(players.map(p=>p.team))).map(team=>
            <option value={team} key={team}>{team}</option>
          )}
        </select>
        <label>Risk: </label>
        <select value={riskFilter} onChange={e=>setRiskFilter(e.target.value)}>
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label>Multi-select: </label>
        <button className="scout-multibtn" onClick={()=>setMulti(players.map(p=>p.id))}><FaLayerGroup/> Select All</button>
        <button className="scout-multibtn" onClick={()=>setMulti([])}><FaTimes/> Clear</button>
        {multi.length>0 && (
          <>
            <button className="scout-pdf-btn" onClick={()=>exportPDF(players.filter(p=>multi.includes(p.id)))}><FaDownload/> Export Sel.</button>
            <button className="scout-csv-btn" onClick={()=>exportCSV(players.filter(p=>multi.includes(p.id)))}><FaFileCsv/> CSV Sel.</button>
          </>
        )}
      </div>

      {/* --- Boardroom Draft Board --- */}
      {showBoard && (
        <div className="scout-boardroom-modal">
          <button className="scout-modal-close" onClick={()=>setShowBoard(false)}>×</button>
          <BoardDraftBoard shortlist={boardList} setShortlist={setBoardList} />
        </div>
      )}

      {/* --- Scouting Grid --- */}
      <div className="scout-grid">
        <div className="scout-grid-row scout-grid-header">
          <div>Name</div>
          <div>Position</div>
          <div>Age</div>
          <div>Team</div>
          <div>Status</div>
          <div>Physical</div>
          <div>Skills</div>
          <div>Attitude</div>
          <div>Potential</div>
          <div>Risk</div>
          <div>Shortlist</div>
          <div>Actions</div>
        </div>
        {filtered.length === 0 && (
          <div className="scout-grid-row scout-empty">
            <FaExclamationTriangle /> No players found.
          </div>
        )}
        {filtered.map((p,idx) => (
          <div
            className={`scout-grid-row${top5(players).map(x=>x.id).includes(p.id)?" scout-row-top5":""}`}
            key={p.id}
            style={{borderTop:top5(players).map(x=>x.id).includes(p.id)?"3px solid #FFD700":"none"}}
          >
            <div>
              <span className="scout-player-icon"><FaUser/></span>
              {p.name}
              <input
                type="checkbox"
                checked={multi.includes(p.id)}
                onChange={e=>{
                  setMulti(list=>
                    e.target.checked
                      ? [...list,p.id]
                      : list.filter(id=>id!==p.id)
                  );
                }}
                className="scout-multicheck"
                title="Multi-select"
              />
            </div>
            <div>{p.position}</div>
            <div>{p.age}</div>
            <div>{p.team}</div>
            <div>{p.status}</div>
            <div><Stars val={p.physical}/></div>
            <div><Stars val={p.skills}/></div>
            <div><Stars val={p.attitude}/></div>
            <div><Stars val={p.potential}/></div>
            <div>
              <span className="scout-risk-badge" style={{background:RISK_COLORS[p.risk]+"33",color:RISK_COLORS[p.risk]}}>
                {p.risk==="high"?<FaExclamationTriangle/>:p.risk==="low"?<FaCheckCircle/>:<FaArrowUp/>}
              </span>
            </div>
            <div>
              {p.shortlist && <FaStar style={{color:"#FFD700"}}/>}
            </div>
            <div>
              <button className="scout-detail-btn" onClick={()=>setDrill({p,idx})}><FaClipboardList/> Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Drilldown Modal --- */}
      {drill && (
        <div className="scout-modal-overlay">
          <div className="scout-modal">
            <div className="scout-modal-header">
              <FaUser/> {drill.p.name} ({drill.p.position}, {drill.p.team})
              <button className="scout-modal-close" onClick={()=>setDrill(null)}>×</button>
            </div>
            <div className="scout-modal-status">
              <span className="scout-risk-badge" style={{background:RISK_COLORS[drill.p.risk]+"33",color:RISK_COLORS[drill.p.risk]}}>
                {drill.p.risk==="high"?<FaExclamationTriangle/>:drill.p.risk==="low"?<FaCheckCircle/>:<FaArrowUp/>}
                {drill.p.risk.toUpperCase()}
              </span>
              <span style={{marginLeft:14}}><FaStar style={{color:"#FFD700"}}/> Potential: {drill.p.potential}</span>
              <button className="scout-pdf-btn" onClick={()=>exportPDF(drill.p,"player")}><FaDownload/> PDF</button>
            </div>
            {/* Ratings Radar */}
            <div className="scout-modal-ratings-title"><FaBasketballBall/> Core Ratings</div>
            <div style={{height:180, width:320, margin:"14px 0"}}>
              <ResponsiveRadar
                data={Object.keys(drill.p.ratings).map(k=>({stat:k,value:drill.p.ratings[k]}))}
                keys={["value"]}
                indexBy="stat"
                maxValue={5}
                margin={{top:28,right:42,bottom:32,left:42}}
                curve="linearClosed"
                borderWidth={2.5}
                borderColor="#FFD700"
                gridLevels={5}
                gridShape="circular"
                enableDots={true}
                dotSize={11}
                colors={["#FFD700"]}
                fillOpacity={0.18}
                theme={{
                  axis: { ticks: { text: { fill: "#FFD700", fontWeight:900 } } },
                  grid: { line: { stroke: "#b7bec9", strokeDasharray:"3 2" } },
                  dots: { text: { fill: "#fff" } }
                }}
                legends={[]}
                isInteractive={false}
                animate={false}
              />
            </div>
            {/* Timeline */}
            <div className="scout-modal-ratings-title"><FaListUl/> Timeline & Events</div>
            <Timeline events={drill.p.events}/>
            {/* Tags, Flags */}
            <div className="scout-modal-tags-row">
              {(drill.p.tags||[]).map((tag,i)=>
                <span className="scout-tag">{tag}</span>
              )}
              {(drill.p.flags||[]).map((f,i)=>
                <span className="scout-flag" style={{background:f.color}}>{f.label}</span>
              )}
            </div>
            {/* Notes/Feedback */}
            <div className="scout-modal-notes-title"><FaClipboardList/> Coach/Scout Feedback</div>
            <div className="scout-modal-notes-list">
              {(drill.p.notes||[]).map((n,i)=>
                <div className="scout-modal-note" key={i}>
                  <span className="scout-modal-note-date">{n.date}</span>
                  <span className="scout-modal-note-user">{n.by}</span>
                  <span className="scout-modal-note-text">{n.text}</span>
                </div>
              )}
            </div>
            <div style={{marginTop:8, display:'flex', alignItems:'center', gap:10}}>
              <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add feedback..."/>
              <button className="scout-addnote-btn" onClick={()=>{
                if (!note.trim()) return;
                setPlayers(list=>{
                  const next = [...list];
                  next[drill.idx].notes.push({
                    date: new Date().toISOString().slice(0,10),
                    by: "Board/Coach",
                    text: note
                  });
                  return next;
                });
                setNote("");
              }}><FaPlus/> Add</button>
            </div>
            {/* Add Event */}
            <div className="scout-add-event-row">
              <AddEventModal player={drill.p} setPlayers={setPlayers} idx={drill.idx}/>
            </div>
            {/* AI Copilot */}
            <div className="scout-modal-copilot">
              <FaRobot style={{color:"#FFD700",marginRight:8}}/>
              {drill.p.potential>=5 && drill.p.risk!=="high"
                ? "High Potential—Shortlist for elite group!"
                : drill.p.risk==="high"
                  ? "At Risk—monitor closely, consider intervention."
                  : "Player stable."}
            </div>
            <div className="scout-tagline scout-tagline-sticky">BE REAL. BE VERO.</div>
          </div>
        </div>
      )}
      <div className="scout-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}

// --- Add Event Modal ---
function AddEventModal({ player, setPlayers, idx }) {
  const [show, setShow] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState("milestone");
  function addEvent() {
    if (!label.trim()) return;
    setPlayers(list=>{
      const next = [...list];
      next[idx].events = next[idx].events || [];
      next[idx].events.push({
        date: new Date().toISOString().slice(0,10),
        type,
        label,
        color: type==="milestone"?"#FFD700":type==="disciplinary"?"#f35650":"#35b378"
      });
      return next;
    });
    setShow(false); setLabel("");
  }
  return (
    <>
      <button className="scout-addnote-btn" style={{marginTop:7,marginBottom:5}} onClick={()=>setShow(s=>!s)}>
        <FaPlus/> {show?"Cancel":"Add Event"}
      </button>
      {show && (
        <div style={{display:"flex",gap:8,marginTop:3,alignItems:"center"}}>
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option value="milestone">Milestone</option>
            <option value="disciplinary">Disciplinary</option>
            <option value="highlight">Highlight</option>
          </select>
          <input
            value={label}
            onChange={e=>setLabel(e.target.value)}
            placeholder="Event description"
            style={{width:140}}
          />
          <button className="scout-addnote-btn" onClick={addEvent}><FaArrowRight/> Save</button>
        </div>
      )}
    </>
  );
}
