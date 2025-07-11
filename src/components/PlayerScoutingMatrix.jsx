import React, { useState } from "react";
import { ResponsiveRadar } from "@nivo/radar";
import { FaDownload, FaCheckCircle, FaExclamationTriangle, FaStar, FaSearch, FaFilter, FaUserPlus, FaUserCheck, FaUsers, FaRegListAlt, FaPlus, FaPen, FaRobot, FaArrowUp, FaArrowDown, FaEquals, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import "./PlayerScoutingMatrix.css";

// --- MOCK PLAYER DATA (add/edit enabled, real: plug Excel loader here) ---
const INIT_PLAYERS = [
  {
    id: "P001",
    name: "Luka Nović",
    position: "PG",
    year: 2006,
    height: 188,
    club: "Demo Club",
    scouting: {
      shooting: 9, defense: 8, passing: 9, iq: 10, athleticism: 8, potential: 10
    },
    perf: [16, 21, 18], // Last 3 games/points
    status: "elite",
    notes: "Top U18 PG, Euro potential, high IQ, leadership",
    shortlist: true,
    agentWatch: true,
    coachPriority: false,
    medicalCleared: true
  },
  {
    id: "P002",
    name: "Ivan Radić",
    position: "F",
    year: 2005,
    height: 198,
    club: "Demo Academy",
    scouting: {
      shooting: 8, defense: 8, passing: 7, iq: 7, athleticism: 7, potential: 8
    },
    perf: [13, 11, 14],
    status: "potential",
    notes: "Strong two-way, must improve playmaking.",
    shortlist: false,
    agentWatch: false,
    coachPriority: true,
    medicalCleared: true
  },
  {
    id: "P003",
    name: "Marko Babić",
    position: "C",
    year: 2004,
    height: 206,
    club: "Demo Federation",
    scouting: {
      shooting: 5, defense: 7, passing: 6, iq: 8, athleticism: 7, potential: 7
    },
    perf: [7, 6, 8],
    status: "risk",
    notes: "Injury history; inconsistent production.",
    shortlist: false,
    agentWatch: false,
    coachPriority: false,
    medicalCleared: false
  },
];
const KPI_LABELS = ["shooting", "defense", "passing", "iq", "athleticism", "potential"];
const STATUS_BADGE = {
  elite: { label: "ELITE", color: "#35b378", icon: <FaStar/> },
  potential: { label: "Potential", color: "#FFD700", icon: <FaCheckCircle/> },
  risk: { label: "Risk", color: "#f35650", icon: <FaExclamationTriangle/> },
  missing: { label: "Missing", color: "#b7bec9", icon: <FaExclamationTriangle/> }
};
const COMP_COLORS = ["#FFD700", "#35b378", "#b7bec9"];

function badge(status) {
  const b = STATUS_BADGE[status] || STATUS_BADGE["missing"];
  return <span className="psm-badge" style={{background:b.color+"22", color:b.color}}>{b.icon} {b.label}</span>;
}

function kpiTrend(arr) {
  if (arr.length < 2) return null;
  if (arr[arr.length-1] > arr[arr.length-2]) return <FaArrowUp className="psm-trend-up" title="Up"/>;
  if (arr[arr.length-1] < arr[arr.length-2]) return <FaArrowDown className="psm-trend-down" title="Down"/>;
  return <FaEquals className="psm-trend-steady" title="No change"/>;
}

function completenessScore(p) {
  // R/Y/G: green if all KPIs, notes, clearance; yellow if missing note or 1 KPI, red otherwise
  const grades = KPI_LABELS.map(k=>p.scouting[k]);
  const missing = grades.filter(x=>x==null).length;
  if (missing === 0 && p.notes && p.medicalCleared) return { color:"#35b378", level:"Complete" };
  if (missing <= 1 && p.notes) return { color:"#FFD700", level:"Partial" };
  return { color:"#f35650", level:"Missing" };
}

function aiCopilot(p) {
  const now = new Date();
  let notes = [];
  if ((p.scouting.potential??0) >= 9 && p.year >= now.getFullYear()-18) notes.push("NBA Watch");
  if (p.status==="elite" && p.scouting.potential >= 9) notes.push("Ready for top-level exposure");
  if (!p.medicalCleared) notes.push("Medical review needed");
  if (p.status==="risk") notes.push("Coach: monitor, possible transfer out");
  if (p.shortlist) notes.push("High-priority for board review");
  if (p.coachPriority) notes.push("Coach priority");
  if (p.agentWatch) notes.push("Agent watching");
  if (p.scouting.potential<=6) notes.push("Flag for development");
  return notes.length ? notes.join(" • ") : "All metrics stable";
}

function PlayerRadarCompare({ players }) {
  // Overlaid radar for up to 3 players
  const data = KPI_LABELS.map(k => {
    const row = {kpi: k.charAt(0).toUpperCase()+k.slice(1)};
    players.forEach(p => row[p.name] = p.scouting[k]??0);
    return row;
  });
  return (
    <div className="psm-radar psm-compare-radar">
      <ResponsiveRadar
        data={data}
        keys={players.map(p=>p.name)}
        indexBy="kpi"
        maxValue={10}
        curve="linearClosed"
        margin={{ top: 28, right: 38, bottom: 30, left: 38 }}
        borderWidth={3}
        borderColor="#FFD700"
        gridLevels={5}
        gridShape="linear"
        enableDots={true}
        dotSize={7}
        dotColor="#35b378"
        colors={COMP_COLORS}
        blendMode="multiply"
        fillOpacity={0.13}
        isInteractive={true}
        theme={{
          axis: { ticks: { text: { fill: "#FFD700", fontWeight: 800 } } },
          grid: { line: { stroke: "#FFD70033", strokeDasharray: "2 2" } },
          legends: { text: { fill: "#FFD700", fontWeight: 800 } }
        }}
        legends={[
          {
            anchor: "top-left",
            direction: "column",
            translateX: 12,
            itemWidth: 80,
            itemHeight: 22,
            symbolSize: 14,
            symbolShape: "circle",
          }
        ]}
      />
    </div>
  );
}

function PlayerRadar({ player }) {
  // Single player radar for card
  const data = KPI_LABELS.map(k=>({
    kpi: k.charAt(0).toUpperCase()+k.slice(1),
    [player.name]: player.scouting[k] ?? 0,
    full: 10
  }));
  return (
    <div className="psm-radar">
      <ResponsiveRadar
        data={data}
        keys={[player.name]}
        indexBy="kpi"
        maxValue={10}
        curve="linearClosed"
        margin={{ top: 22, right: 22, bottom: 22, left: 22 }}
        borderWidth={3}
        borderColor="#FFD700"
        gridLevels={5}
        gridShape="linear"
        enableDots={true}
        dotSize={7}
        dotColor="#35b378"
        colors={["#FFD700"]}
        blendMode="multiply"
        fillOpacity={0.12}
        isInteractive={false}
        theme={{
          axis: { ticks: { text: { fill: "#FFD700", fontWeight: 800 } } },
          grid: { line: { stroke: "#FFD70033", strokeDasharray: "2 2" } }
        }}
      />
    </div>
  );
}

export default function PlayerScoutingMatrix() {
  const [players, setPlayers] = useState(INIT_PLAYERS);
  const [filters, setFilters] = useState({ position: "", club: "", minYear: "", minGrade: "", shortlist: false, search: "", metric: "", metricMin: "" });
  const [compare, setCompare] = useState([]);
  const [showShortlist, setShowShortlist] = useState(false);
  const [modal, setModal] = useState(null);

  // --- Filter & search logic ---
  let filtered = players.filter(p => {
    if (filters.position && p.position !== filters.position) return false;
    if (filters.club && p.club !== filters.club) return false;
    if (filters.minYear && p.year < Number(filters.minYear)) return false;
    if (filters.minGrade && Math.min(...Object.values(p.scouting)) < Number(filters.minGrade)) return false;
    if (filters.shortlist && !p.shortlist) return false;
    if (filters.metric && p.scouting[filters.metric] < Number(filters.metricMin)) return false;
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // --- PDF Export for shortlist, comparison, or single report
  function exportPDF(playersExport, mode="shortlist") {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`CourtEvo Vero: ${mode==="shortlist"?"Shortlist":mode==="single"?"Scouting Report":"Comparison"}`, 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 10;
    doc.setTextColor(255,255,255);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 12, y);
    y += 10;
    playersExport.forEach((p,pi)=>{
      doc.setTextColor(35,42,46);
      doc.setFontSize(13);
      doc.text(`${p.name} (${p.position}, ${p.club})`, 12, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`ID: ${p.id}  |  Year: ${p.year}  |  Height: ${p.height}cm`, 12, y);
      y += 5;
      doc.text(`Status: ${p.status.toUpperCase()}  |  Completeness: ${completenessScore(p).level}`, 12, y);
      y += 6;
      doc.setFontSize(10);
      KPI_LABELS.forEach((k,i) => {
        doc.text(`${k.charAt(0).toUpperCase()+k.slice(1)}: ${p.scouting[k]??'-'}`, 16, y + i*5);
      });
      y += 32;
      doc.setFontSize(10);
      doc.text(`Last 3 perf: ${p.perf ? p.perf.join(', ') : "-"}`, 12, y);
      y += 6;
      doc.text(`Notes: ${p.notes??'-'}`, 12, y);
      y += 6;
      doc.text(`AI Copilot: ${aiCopilot(p)}`, 12, y);
      y += 7;
      if (y > 250) { doc.addPage(); y = 16; }
    });
    doc.setTextColor(120,120,120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    doc.save(`${mode}_CourtEvoVero.pdf`);
  }

  // --- CSV Export for shortlist
  function exportCSV(playersExport) {
    let out = "ID,Name,Pos,Year,Height,Club," + KPI_LABELS.map(k=>k.charAt(0).toUpperCase()+k.slice(1)).join(",") + ",Status,Notes,Completeness\n";
    playersExport.forEach(p => {
      out += `${p.id},"${p.name}",${p.position},${p.year},${p.height},${p.club},` +
        KPI_LABELS.map(k=>p.scouting[k]??'-').join(",") +
        `,${p.status},"${p.notes??''}",${completenessScore(p).level}\n`;
    });
    const blob = new Blob([out], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Shortlist_CourtEvoVero.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Add/remove compare
  function toggleCompare(id) {
    setCompare(c =>
      c.includes(id) ? c.filter(x => x !== id) : c.length < 3 ? [...c, id] : c
    );
  }

  // --- Add/Edit Player Modal Logic
  function savePlayerModal(playerObj) {
    setPlayers(ps => {
      if (playerObj.id && ps.some(p => p.id === playerObj.id)) {
        return ps.map(p => p.id === playerObj.id ? playerObj : p);
      }
      return [...ps, {...playerObj, id: "P" + String(ps.length + 1).padStart(3,"0")}];
    });
    setModal(null);
  }

  // --- UI ---
  return (
    <div className="psm-main">
      <div className="psm-header">
        <h2><FaRegListAlt style={{color:"#FFD700",marginRight:13}}/>Scouting Matrix & Player Radar</h2>
        <div>
          <button className="psm-shortlist-btn" onClick={()=>setShowShortlist(s=>!s)}>
            <FaFilter/> {showShortlist ? "Show All" : "Show Shortlist"}
          </button>
          <button className="psm-csv-btn" onClick={()=>exportCSV(filtered)}><FaDownload/> CSV</button>
          <button className="psm-pdf-btn" onClick={()=>exportPDF(filtered)}><FaDownload/> PDF</button>
          <button className="psm-add-btn" onClick={()=>setModal({})}><FaUserPlus/> Add Player</button>
        </div>
      </div>
      <div className="psm-filter-row">
        <FaSearch/>
        <input
          placeholder="Search by name"
          value={filters.search}
          onChange={e=>setFilters(f=>({...f, search: e.target.value}))}
        />
        <select
          value={filters.position}
          onChange={e=>setFilters(f=>({...f, position: e.target.value}))}
        >
          <option value="">Position</option>
          <option value="PG">PG</option>
          <option value="F">F</option>
          <option value="C">C</option>
        </select>
        <select
          value={filters.club}
          onChange={e=>setFilters(f=>({...f, club: e.target.value}))}
        >
          <option value="">Club</option>
          {[...new Set(players.map(p=>p.club))].map(c=>
            <option value={c} key={c}>{c}</option>
          )}
        </select>
        <input
          placeholder="Min Year"
          type="number"
          value={filters.minYear}
          onChange={e=>setFilters(f=>({...f, minYear: e.target.value}))}
          min={2000}
          style={{width:72}}
        />
        <input
          placeholder="Min Grade"
          type="number"
          value={filters.minGrade}
          onChange={e=>setFilters(f=>({...f, minGrade: e.target.value}))}
          min={1} max={10}
          style={{width:82}}
        />
        {/* Advanced filter: by metric */}
        <select
          value={filters.metric}
          onChange={e=>setFilters(f=>({...f, metric: e.target.value}))}
        >
          <option value="">Any Metric</option>
          {KPI_LABELS.map(k=>
            <option value={k} key={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>
          )}
        </select>
        <input
          placeholder="Min Value"
          type="number"
          value={filters.metricMin}
          onChange={e=>setFilters(f=>({...f, metricMin: e.target.value}))}
          min={1} max={10}
          style={{width:76}}
        />
        <button className="psm-filter-btn" onClick={()=>setFilters(f=>({...f, shortlist: !f.shortlist}))}>
          <FaUserCheck/> {filters.shortlist ? "Shortlist Only" : "All"}
        </button>
      </div>

      {/* --- Player Grid --- */}
      <div className="psm-player-grid">
        {filtered.length === 0 && (
          <div className="psm-empty">
            <FaExclamationTriangle/> No players found. Adjust filters.
          </div>
        )}
        {filtered.map(player => {
          const comp = completenessScore(player);
          const showNBA = (player.scouting.potential ?? 0) >= 9 && player.year >= (new Date().getFullYear() - 18);
          return (
            <div className={`psm-card psm-${player.status}`} key={player.id}>
              <div className="psm-card-header">
                <span className="psm-card-name">{player.name}</span>
                {badge(player.status)}
                <span className="psm-complete-badge" style={{background: comp.color + "22", color: comp.color}}>{comp.level}</span>
                {showNBA && <span className="psm-nba-badge"><FaStar/> NBA Watch</span>}
              </div>
              <div className="psm-card-row">
                <b>{player.position}</b> | {player.year} | {player.height}cm
              </div>
              <div className="psm-card-row">
                <b>{player.club}</b>
              </div>
              <PlayerRadar player={player}/>
              <div className="psm-kpi-row">
                {KPI_LABELS.map(k =>
                  <span className="psm-kpi-val" key={k}>
                    <b>{k.charAt(0).toUpperCase()+k.slice(1)}:</b> {player.scouting[k]??"-"}
                    <span className="psm-kpi-trend">{kpiTrend([...(player.perf ?? []), player.scouting[k]])}</span>
                  </span>
                )}
              </div>
              <div className="psm-badge-row">
                {player.agentWatch && <span className="psm-tag-badge psm-badge-agent">Agent Watch</span>}
                {player.coachPriority && <span className="psm-tag-badge psm-badge-coach">Coach Priority</span>}
                {player.medicalCleared ? <span className="psm-tag-badge psm-badge-med">Medical ✓</span> : <span className="psm-tag-badge psm-badge-med psm-badge-risk">Medical ✗</span>}
                {player.shortlist && <span className="psm-tag-badge psm-badge-shortlist">Shortlist</span>}
              </div>
              <div className="psm-notes">
                <FaRobot style={{color:"#FFD700",fontSize:14}}/> {aiCopilot(player)}
              </div>
              <div className="psm-notes">
                <FaPen style={{color:"#FFD700",fontSize:14}}/> {player.notes}
              </div>
              <div className="psm-card-actions">
                <button className={`psm-compare-btn${compare.includes(player.id)?" psm-btn-active":""}`}
                  onClick={()=>toggleCompare(player.id)}
                >
                  <FaUsers/> {compare.includes(player.id) ? "Remove Compare" : "Compare"}
                </button>
                <button className="psm-edit-btn" onClick={()=>setModal(player)}>
                  <FaPen/> Edit
                </button>
                <button className="psm-report-btn" onClick={()=>exportPDF([player],"single")}>
                  <FaDownload/> Scouting Report
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Comparison Overlay --- */}
      {compare.length >= 2 && (
        <div className="psm-compare-modal">
          <div className="psm-compare-header">
            <FaUsers/> Compare Players
            <button className="psm-compare-close" onClick={()=>setCompare([])}>×</button>
          </div>
          <PlayerRadarCompare players={compare.map(id=>players.find(x=>x.id===id)).filter(Boolean)}/>
          <div className="psm-compare-grid">
            {compare.map(id => {
              const p = players.find(x=>x.id===id);
              if (!p) return null;
              const comp = completenessScore(p);
              const showNBA = (p.scouting.potential ?? 0) >= 9 && p.year >= (new Date().getFullYear() - 18);
              return (
                <div className="psm-card psm-compare" key={p.id}>
                  <div className="psm-card-header">
                    <span className="psm-card-name">{p.name}</span>
                    {badge(p.status)}
                    <span className="psm-complete-badge" style={{background: comp.color + "22", color: comp.color}}>{comp.level}</span>
                    {showNBA && <span className="psm-nba-badge"><FaStar/> NBA Watch</span>}
                  </div>
                  <div className="psm-kpi-row">
                    {KPI_LABELS.map(k =>
                      <span className="psm-kpi-val" key={k}>
                        <b>{k.charAt(0).toUpperCase()+k.slice(1)}:</b> {p.scouting[k]??"-"}
                        <span className="psm-kpi-trend">{kpiTrend([...(p.perf ?? []), p.scouting[k]])}</span>
                      </span>
                    )}
                  </div>
                  <div className="psm-badge-row">
                    {p.agentWatch && <span className="psm-tag-badge psm-badge-agent">Agent Watch</span>}
                    {p.coachPriority && <span className="psm-tag-badge psm-badge-coach">Coach Priority</span>}
                    {p.medicalCleared ? <span className="psm-tag-badge psm-badge-med">Medical ✓</span> : <span className="psm-tag-badge psm-badge-med psm-badge-risk">Medical ✗</span>}
                    {p.shortlist && <span className="psm-tag-badge psm-badge-shortlist">Shortlist</span>}
                  </div>
                  <div className="psm-notes">
                    <FaRobot style={{color:"#FFD700",fontSize:14}}/> {aiCopilot(p)}
                  </div>
                  <div className="psm-notes">
                    <FaPen style={{color:"#FFD700",fontSize:14}}/> {p.notes}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="psm-compare-actions">
            <button className="psm-pdf-btn" onClick={()=>exportPDF(compare.map(id=>players.find(x=>x.id===id)).filter(Boolean), "comparison")}>
              <FaDownload/> Export Comparison PDF
            </button>
          </div>
        </div>
      )}

      {/* --- Add/Edit Modal --- */}
      {modal && (
        <PlayerEditModal
          player={modal}
          onSave={savePlayerModal}
          onClose={()=>setModal(null)}
        />
      )}

      <div className="psm-tagline">
        BE REAL. BE VERO.
      </div>
    </div>
  );
}

// --- Add/Edit Modal Component ---
function PlayerEditModal({ player, onSave, onClose }) {
  const [state, setState] = useState({
    ...player,
    scouting: {...(player.scouting || {})},
    perf: player.perf || [0,0,0]
  });
  function updateField(field, val) {
    setState(s=>({...s, [field]: val}));
  }
  function updateScouting(field, val) {
    setState(s=>({...s, scouting: {...s.scouting, [field]: val}}));
  }
  function updatePerf(idx, val) {
    const arr = [...state.perf];
    arr[idx] = Number(val);
    setState(s=>({...s, perf: arr}));
  }
  function submit() {
    onSave(state);
  }
  return (
    <div className="psm-modal-overlay">
      <div className="psm-modal">
        <div className="psm-modal-header">
          <FaPen/> {player.id ? "Edit Player" : "Add Player"}
          <button className="psm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="psm-modal-row">
          <label>Name:</label>
          <input value={state.name} onChange={e=>updateField("name", e.target.value)}/>
        </div>
        <div className="psm-modal-row">
          <label>Position:</label>
          <select value={state.position} onChange={e=>updateField("position", e.target.value)}>
            <option value="PG">PG</option>
            <option value="F">F</option>
            <option value="C">C</option>
          </select>
          <label>Year:</label>
          <input type="number" value={state.year} onChange={e=>updateField("year", e.target.value)} style={{width:72}}/>
        </div>
        <div className="psm-modal-row">
          <label>Height (cm):</label>
          <input type="number" value={state.height} onChange={e=>updateField("height", e.target.value)} style={{width:82}}/>
          <label>Club:</label>
          <input value={state.club} onChange={e=>updateField("club", e.target.value)}/>
        </div>
        <div className="psm-modal-row">
          {KPI_LABELS.map(k=>
            <React.Fragment key={k}>
              <label>{k.charAt(0).toUpperCase()+k.slice(1)}:</label>
              <input
                type="number"
                min={1}
                max={10}
                value={state.scouting[k]??""}
                onChange={e=>updateScouting(k, Number(e.target.value))}
                style={{width:53}}
              />
            </React.Fragment>
          )}
        </div>
        <div className="psm-modal-row">
          <label>Last 3 Perf (comma):</label>
          <input value={state.perf.join(",")} onChange={e=>updateField("perf", e.target.value.split(",").map(Number))}/>
        </div>
        <div className="psm-modal-row">
          <label>Notes:</label>
          <input value={state.notes} onChange={e=>updateField("notes", e.target.value)}/>
        </div>
        <div className="psm-modal-row">
          <label>Status:</label>
          <select value={state.status} onChange={e=>updateField("status", e.target.value)}>
            <option value="elite">Elite</option>
            <option value="potential">Potential</option>
            <option value="risk">Risk</option>
          </select>
          <label>Shortlist:</label>
          <input type="checkbox" checked={state.shortlist} onChange={e=>updateField("shortlist", e.target.checked)}/>
        </div>
        <div className="psm-modal-row">
          <label>Agent Watch:</label>
          <input type="checkbox" checked={state.agentWatch} onChange={e=>updateField("agentWatch", e.target.checked)}/>
          <label>Coach Priority:</label>
          <input type="checkbox" checked={state.coachPriority} onChange={e=>updateField("coachPriority", e.target.checked)}/>
          <label>Medical Cleared:</label>
          <input type="checkbox" checked={state.medicalCleared} onChange={e=>updateField("medicalCleared", e.target.checked)}/>
        </div>
        <div className="psm-modal-actions">
          <button className="psm-pdf-btn" onClick={submit}>
            <FaCheckCircle/> Save
          </button>
        </div>
      </div>
    </div>
  );
}
