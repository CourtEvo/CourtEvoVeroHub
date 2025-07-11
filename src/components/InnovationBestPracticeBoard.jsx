import React, { useState } from "react";
import {
  FaRocket, FaLightbulb, FaProjectDiagram, FaUserTie, FaCheckCircle,
   FaTimes, FaSync, FaArrowRight, FaFileExport, FaComments, FaExclamationTriangle, FaStar,
    FaMapMarkerAlt, FaEuroSign, FaBolt, FaExternalLinkAlt, FaGlobeEurope, FaPlus
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const DEFAULT_INNOVATIONS = [
  {
    id: 1, name: "Mobile Skill Tracking App", domain: "Player Development", region: "USA", story: "Boosted skill retention by 17% for U16s.", storyUrl: "https://example.com/story1",
    stage: "Piloting", owner: "U16 Coach", avatar: "", impact: 8, risk: 4, roi: 8, heat: 65, sponsor: "Nike", status: "On Track", urgency: "High", dependency: [], notes: "Youth engagement, data privacy in review", boardPriority: "High"
  },
  {
    id: 2, name: "Wearable Load Monitors", domain: "Performance", region: "Germany", story: "Lowered injury rates by 11% in Bundesliga.", storyUrl: "https://example.com/story2",
    stage: "Evaluating", owner: "Performance Dir", avatar: "", impact: 9, risk: 6, roi: 7, heat: 79, sponsor: "Erste Bank", status: "Blocked", urgency: "Medium", dependency: [1], notes: "Privacy concern", boardPriority: "Medium"
  },
  {
    id: 3, name: "Coach Peer Review Circles", domain: "Coaching", region: "Spain", story: "Doubled internal knowledge transfer, top ACB clubs.", storyUrl: "https://example.com/story3",
    stage: "Adopted", owner: "Head Coach", avatar: "", impact: 6, risk: 2, roi: 9, heat: 60, sponsor: "Internal", status: "Live", urgency: "Low", dependency: [], notes: "Trust improved", boardPriority: "Medium"
  },
  {
    id: 4, name: "Community Mini-Camps", domain: "Outreach", region: "Croatia", story: "5x increase in new player sign-ups.", storyUrl: "https://example.com/story4",
    stage: "Adopted", owner: "Community Mgr", avatar: "", impact: 7, risk: 3, roi: 10, heat: 44, sponsor: "City", status: "Live", urgency: "High", dependency: [], notes: "Sponsor visibility up", boardPriority: "High"
  }
];

const STAGES = ["Scanning", "Evaluating", "Piloting", "Adopted", "Blocked"];
const URGENCY_COLORS = { "Low": "#1de682", "Medium": "#FFD700", "High": "#ff4848" };

function colorByStage(stage) {
  if (stage === "Adopted") return "#1de682";
  if (stage === "Piloting") return "#FFD700";
  if (stage === "Blocked") return "#ff4848";
  if (stage === "Evaluating") return "#FFD70088";
  return "#62d6ff";
}
function colorByUrgency(u) { return URGENCY_COLORS[u] || "#FFD700"; }

function aiNextBets(innovations) {
  let bets = [];
  let sleepers = innovations.filter(i => i.stage === "Piloting" && i.heat > 60 && i.impact >= 7);
  if (sleepers.length) bets.push(`"Sleeping bet": "${sleepers[0].name}" is trending in global clubs—move to board for adoption.`);
  let threats = innovations.filter(i => i.stage === "Scanning" && i.heat > 70);
  if (threats.length) bets.push(`Threat: "${threats[0].name}" is rapidly gaining traction in Euro. Risk of falling behind.`);
  if (!bets.length) bets.push("No urgent bets, focus on privacy & sponsor risk for tech pilots.");
  return bets;
}

function InnovationMap({ innovations }) {
  // Minimal interactive SVG map (mockup) with markers per innovation region
  const regions = { "USA": [120, 170], "Germany": [310, 110], "Spain": [245, 165], "Croatia": [300, 160] };
  return (
    <svg width={460} height={270} style={{ background: "#283E51", borderRadius: 19 }}>
      <text x={230} y={36} fill="#FFD700" fontWeight={800} fontSize={21} textAnchor="middle"><FaGlobeEurope /> Global Innovation Map</text>
      <rect x={60} y={70} width={340} height={150} rx={44} fill="#232a2e" />
      {innovations.map((i, idx) =>
        <g key={i.id}>
          <FaMapMarkerAlt x={regions[i.region][0]} y={regions[i.region][1]} />
          <circle cx={regions[i.region][0]} cy={regions[i.region][1]} r={15} fill={colorByStage(i.stage)} stroke="#FFD700" strokeWidth={3} />
          <text x={regions[i.region][0]} y={regions[i.region][1] + 6} fill="#fff" fontWeight={800} fontSize={12} textAnchor="middle">{i.name[0]}</text>
        </g>
      )}
      {/* Inspiration lines */}
      {innovations.filter(i => i.dependency.length).map(i =>
        i.dependency.map(did => {
          const dep = innovations.find(x => x.id === did);
          if (!dep) return null;
          return (
            <line key={dep.id} x1={regions[dep.region][0]} y1={regions[dep.region][1]} x2={regions[i.region][0]} y2={regions[i.region][1]} stroke="#FFD700" strokeWidth={2} markerEnd="url(#arrowhead)" />
          );
        })
      )}
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="#FFD700" />
        </marker>
      </defs>
    </svg>
  );
}

const InnovationBestPracticeBoard = () => {
  const [innovations, setInnovations] = useState([...DEFAULT_INNOVATIONS]);
  const [newInnovation, setNewInnovation] = useState({
    name: "", domain: "Player Development", region: "USA", stage: "Scanning", owner: "", avatar: "", impact: 5, risk: 5, roi: 5, heat: 40, sponsor: "", status: "Scanning", urgency: "Medium", dependency: [], notes: "", boardPriority: "Medium", story: "", storyUrl: ""
  });
  const [addMode, setAddMode] = useState(false);
  const [log, setLog] = useState([{ by: "Board", txt: "Moved Coach Peer Review Circles to Adopted", date: "2024-06-13" }]);
  const [logText, setLogText] = useState("");
  const [view, setView] = useState("map");
  const [exporting, setExporting] = useState(false);

  // CRUD
  const addInnovation = () => {
    setInnovations([
      ...innovations,
      { ...newInnovation, id: innovations.length ? Math.max(...innovations.map(a => a.id)) + 1 : 1 }
    ]);
    setAddMode(false);
    setNewInnovation({ name: "", domain: "Player Development", region: "USA", stage: "Scanning", owner: "", avatar: "", impact: 5, risk: 5, roi: 5, heat: 40, sponsor: "", status: "Scanning", urgency: "Medium", dependency: [], notes: "", boardPriority: "Medium", story: "", storyUrl: "" });
  };
  const setStage = (id, stage) => setInnovations(innovations.map(i => i.id === id ? { ...i, stage } : i));
  const setUrgency = (id, urgency) => setInnovations(innovations.map(i => i.id === id ? { ...i, urgency } : i));
  const addDependency = (id, depId) => setInnovations(innovations.map(i => i.id === id ? { ...i, dependency: [...new Set([...(i.dependency || []), depId])] } : i));

  // Export
  const exportBoard = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 2400);
  };

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 30,
      padding: 33, boxShadow: "0 8px 64px #1de68244", maxWidth: 2000, margin: "0 auto"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 17 }}>
        <FaRocket size={38} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 33, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Innovation & Best Practice Board
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 800, borderRadius: 17,
          padding: '8px 28px', fontSize: 17, marginLeft: 18, boxShadow: '0 2px 10px #FFD70044'
        }}>
          CourtEvo Vero | Global Edge
        </span>
        <button onClick={exportBoard} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10,
          fontWeight: 900, fontSize: 17, padding: "11px 26px", marginLeft: 13
        }}>
          <FaFileExport style={{ marginRight: 8 }} /> Export PDF/CSV
        </button>
      </div>
      {exporting &&
        <div style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 15,
          padding: 15, marginBottom: 13, fontSize: 18, textAlign: "center"
        }}>
          Export in progress... All visuals, global map, heatmaps, and board stories included.
        </div>
      }
      {/* View tabs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
        <button onClick={() => setView("map")} style={{
          background: view === "map" ? "#FFD700" : "#232a2e", color: view === "map" ? "#232a2e" : "#FFD700",
          fontWeight: 800, border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 18
        }}>Innovation Map</button>
        <button onClick={() => setView("swimlane")} style={{
          background: view === "swimlane" ? "#FFD700" : "#232a2e", color: view === "swimlane" ? "#232a2e" : "#FFD700",
          fontWeight: 800, border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 18
        }}>Implementation Swimlanes</button>
        <button onClick={() => setView("matrix")} style={{
          background: view === "matrix" ? "#FFD700" : "#232a2e", color: view === "matrix" ? "#232a2e" : "#FFD700",
          fontWeight: 800, border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 18
        }}>ROI/Adoption Heatmap</button>
      </div>
      {/* Innovation map */}
      {view === "map" &&
        <div style={{ display: "flex", gap: 33 }}>
          <InnovationMap innovations={innovations} />
          <div style={{ flex: 1.3, background: "#232a2e", borderRadius: 17, boxShadow: "0 2px 18px #FFD70044", padding: 24, marginLeft: 15 }}>
            <b style={{ color: "#FFD700", fontSize: 20 }}><FaBolt style={{ marginRight: 9 }} /> AI Bets & Threats</b>
            <ul style={{ fontSize: 17, fontWeight: 700, margin: "17px 0 12px 0" }}>
              {aiNextBets(innovations).map((t, i) =>
                <li key={i} style={{ color: t.includes("Threat") ? "#ff4848" : "#1de682" }}>{t}</li>
              )}
            </ul>
            <b style={{ color: "#FFD700", fontSize: 17 }}>Sponsor/Partner Opportunity:</b>
            <ul>
              {innovations.filter(i => i.sponsor && i.stage !== "Blocked").map((i, j) =>
                <li key={j} style={{ color: "#FFD700" }}>{i.sponsor}: <span style={{ color: "#1de682", fontWeight: 700 }}>Activate for board pitch</span></li>
              )}
            </ul>
          </div>
        </div>
      }
      {/* Swimlanes with avatars, urgency, dependency */}
      {view === "swimlane" &&
        <div style={{ display: "flex", gap: 27, marginBottom: 22 }}>
          {STAGES.map(stage =>
            <div key={stage} style={{
              background: colorByStage(stage) + "22", borderRadius: 18, minWidth: 290, padding: "17px 15px"
            }}>
              <b style={{ color: colorByStage(stage), fontSize: 21 }}>{stage}</b>
              {innovations.filter(i => i.stage === stage).map(i =>
                <div key={i.id} style={{
                  margin: "15px 0 9px 0", background: "#232a2e", borderRadius: 13, padding: 13, boxShadow: "0 2px 18px #FFD70022"
                }}>
                  <b style={{ color: colorByUrgency(i.urgency) }}><FaLightbulb /> {i.name}</b>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#FFD700" }}>{i.domain} <FaMapMarkerAlt style={{ color: "#FFD700", fontSize: 14, marginLeft: 6 }} /> {i.region}</div>
                  <div style={{ color: "#1de682" }}><FaUserTie /> Owner: {i.owner} <span style={{
                    background: "#FFD70022", color: "#FFD700", borderRadius: "50%", marginLeft: 9, fontWeight: 900, padding: "2px 10px", fontSize: 15
                  }}>{i.owner ? i.owner.split(" ").map(w => w[0]).join("") : ""}</span></div>
                  <div style={{ color: "#FFD700" }}>Sponsor: {i.sponsor}</div>
                  <div style={{ color: "#FFD70088" }}>Invest: {i.roi}/10 ROI, Risk: {i.risk}/10, Impact: {i.impact}/10, Heat: {i.heat}/100</div>
                  <div>
                    Urgency: <select value={i.urgency} onChange={e => setUrgency(i.id, e.target.value)} style={{
                      background: colorByUrgency(i.urgency), color: "#232a2e", border: "none", fontWeight: 800, borderRadius: 8, marginLeft: 8, padding: "2px 11px"
                    }}>
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </div>
                  <div style={{ fontSize: 14, color: "#FFD70099", margin: "5px 0" }}>{i.notes}</div>
                  {i.dependency.length > 0 &&
                    <div style={{ color: "#FFD700", fontWeight: 700 }}>
                      Depends on: {i.dependency.map(depId => {
                        const dep = innovations.find(x => x.id === depId);
                        return dep ? <span key={depId}>{dep.name}, </span> : null;
                      })}
                    </div>
                  }
                  <div style={{ marginTop: 7, display: "flex", gap: 7 }}>
                    <button onClick={() => setStage(i.id, "Blocked")} style={{
                      ...btnStyle, background: "#ff4848", color: "#fff"
                    }}><FaTimes /> Block</button>
                    <button onClick={() => setStage(i.id, "Adopted")} style={{
                      ...btnStyle, background: "#1de682", color: "#232a2e"
                    }}><FaCheckCircle /> Adopt</button>
                    <button onClick={() => setStage(i.id, "Piloting")} style={{
                      ...btnStyle, background: "#FFD700", color: "#232a2e"
                    }}><FaSync /> Pilot</button>
                  </div>
                  {i.story &&
                    <div style={{ marginTop: 9 }}>
                      <b style={{ color: "#FFD700" }}>Impact Story:</b> <span style={{ color: "#fff" }}>{i.story}</span>{" "}
                      {i.storyUrl && <a href={i.storyUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1de682", fontWeight: 700 }}><FaExternalLinkAlt /> Link</a>}
                    </div>
                  }
                </div>
              )}
            </div>
          )}
        </div>
      }
      {/* ROI/Adoption Heatmap */}
      {view === "matrix" &&
        <div style={{ marginTop: 15 }}>
          <b style={{ color: "#FFD700", fontSize: 20 }}><FaProjectDiagram style={{ marginRight: 8 }} /> ROI/Adoption Heatmap</b>
          <table style={{ width: "90%", margin: "24px auto", borderCollapse: "collapse", fontSize: 18, boxShadow: "0 2px 18px #FFD70022" }}>
            <thead>
              <tr style={{ color: "#FFD700", fontWeight: 900, fontSize: 19 }}>
                <th>Innovation</th>
                <th>Region</th>
                <th>Domain</th>
                <th>Impact</th>
                <th>Risk</th>
                <th>ROI</th>
                <th>Adoption Heat</th>
                <th>Urgency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {innovations.map((i, idx) =>
                <tr key={i.id} style={{ background: "#232a2e" }}>
                  <td style={{ fontWeight: 900 }}>{i.name}</td>
                  <td>{i.region}</td>
                  <td>{i.domain}</td>
                  <td style={{ color: i.impact >= 8 ? "#1de682" : "#FFD700", fontWeight: 900 }}>{i.impact}</td>
                  <td style={{ color: i.risk >= 7 ? "#ff4848" : "#FFD700", fontWeight: 900 }}>{i.risk}</td>
                  <td style={{ color: i.roi >= 7 ? "#1de682" : "#FFD700", fontWeight: 900 }}>{i.roi}</td>
                  <td style={{ color: i.heat >= 65 ? "#1de682" : "#FFD700", fontWeight: 900 }}>{i.heat}</td>
                  <td style={{ color: colorByUrgency(i.urgency), fontWeight: 900 }}>{i.urgency}</td>
                  <td style={{ color: i.boardPriority === "High" ? "#FFD700" : "#fff", fontWeight: 900 }}>{i.boardPriority}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      }
      {/* Add innovation */}
      <button onClick={() => setAddMode(a => !a)} style={{
        background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 13, fontWeight: 900, fontSize: 19,
        padding: "10px 26px", margin: "18px 0", boxShadow: "0 2px 18px #FFD70033"
      }}>
        <FaPlus style={{ marginRight: 8 }} /> {addMode ? "Cancel" : "Add Innovation"}
      </button>
      {addMode &&
        <div style={{
          background: "#232a2e", borderRadius: 17, boxShadow: "0 8px 36px #FFD70044", padding: 24, margin: "15px 0"
        }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <input value={newInnovation.name} placeholder="Innovation Name" onChange={e => setNewInnovation({ ...newInnovation, name: e.target.value })} style={inputStyle} />
            <select value={newInnovation.domain} onChange={e => setNewInnovation({ ...newInnovation, domain: e.target.value })} style={inputStyleMini}>
              <option>Player Development</option>
              <option>Performance</option>
              <option>Coaching</option>
              <option>Outreach</option>
              <option>Commercial</option>
              <option>Analytics</option>
            </select>
            <select value={newInnovation.region} onChange={e => setNewInnovation({ ...newInnovation, region: e.target.value })} style={inputStyleMini}>
              <option>USA</option><option>Germany</option><option>Spain</option><option>Croatia</option>
            </select>
            <select value={newInnovation.stage} onChange={e => setNewInnovation({ ...newInnovation, stage: e.target.value })} style={inputStyleMini}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            <input value={newInnovation.owner} placeholder="Owner" onChange={e => setNewInnovation({ ...newInnovation, owner: e.target.value })} style={inputStyleMini} />
            <input value={newInnovation.impact} type="number" min={1} max={10} placeholder="Impact" onChange={e => setNewInnovation({ ...newInnovation, impact: Number(e.target.value) })} style={inputStyleMini} />
            <input value={newInnovation.risk} type="number" min={1} max={10} placeholder="Risk" onChange={e => setNewInnovation({ ...newInnovation, risk: Number(e.target.value) })} style={inputStyleMini} />
            <input value={newInnovation.roi} type="number" min={1} max={10} placeholder="ROI" onChange={e => setNewInnovation({ ...newInnovation, roi: Number(e.target.value) })} style={inputStyleMini} />
            <input value={newInnovation.heat} type="number" min={0} max={100} placeholder="Heat" onChange={e => setNewInnovation({ ...newInnovation, heat: Number(e.target.value) })} style={inputStyleMini} />
            <input value={newInnovation.sponsor} placeholder="Sponsor" onChange={e => setNewInnovation({ ...newInnovation, sponsor: e.target.value })} style={inputStyleMini} />
            <select value={newInnovation.urgency} onChange={e => setNewInnovation({ ...newInnovation, urgency: e.target.value })} style={inputStyleMini}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <input value={newInnovation.notes} placeholder="Notes" onChange={e => setNewInnovation({ ...newInnovation, notes: e.target.value })} style={inputStyle} />
            <input value={newInnovation.story} placeholder="Impact Story" onChange={e => setNewInnovation({ ...newInnovation, story: e.target.value })} style={inputStyle} />
            <input value={newInnovation.storyUrl} placeholder="Story Link" onChange={e => setNewInnovation({ ...newInnovation, storyUrl: e.target.value })} style={inputStyleMini} />
          </div>
          <button onClick={addInnovation} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginTop: 13 }}>
            <FaCheckCircle /> Add
          </button>
        </div>
      }
      {/* Boardroom log & AI summary */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: 13, margin: "24px 0 0 0"
      }}>
        <b style={{ color: "#FFD700", fontSize: 19 }}><FaLightbulb style={{ marginRight: 8 }} /> Boardroom Log & AI Bets</b>
        <div style={{ color: "#1de682", fontWeight: 900, fontSize: 17, marginBottom: 10 }}>{aiNextBets(innovations).join(" | ")}</div>
        <div style={{ maxHeight: 110, overflowY: "auto", fontSize: 15, marginBottom: 8 }}>
          {log.map((c, i) =>
            <div key={i}><span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt} <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span></div>
          )}
        </div>
        <input value={logText} placeholder="Log board action..." onChange={e => setLogText(e.target.value)} style={inputStyle} />
        <button onClick={() => {
          setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10) }]); setLogText("");
        }} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginLeft: 7 }}>Send</button>
      </div>
      <div style={{ marginTop: 15, fontSize: 14, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 16, width: 140
};
const inputStyleMini = {
  ...inputStyle, width: 108, fontSize: 15
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "8px 18px", marginRight: 6, cursor: "pointer"
};

export default InnovationBestPracticeBoard;
