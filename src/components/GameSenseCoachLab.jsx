import React, { useState, useRef } from "react";
import { FaLightbulb, FaChalkboardTeacher, FaRobot, FaClipboardList, FaPlayCircle, FaSave, FaUserTie, FaUsers, FaFileExport, FaExchangeAlt, FaEye, FaChevronLeft, FaChevronRight, FaRunning, FaQuestionCircle, FaBullseye, FaCamera, FaMicrophone, FaBolt, FaArrowsAltH, FaUsersCog, FaTrophy, FaSync, FaUserPlus, FaUserEdit, FaStar, FaChartRadar, FaCommentAlt, FaUserCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Demo Data
const defaultConstraints = [
  { id: 1, label: "3-dribble max", effect: "+Touches, +Speed", skill: "Decision Speed" },
  { id: 2, label: "No dribble", effect: "+Off-ball", skill: "Off-ball Movement" },
  { id: 3, label: "Score only in paint", effect: "+Spacing", skill: "Spatial Awareness" },
  { id: 4, label: "Defense starts with deflection", effect: "+Awareness", skill: "Disruption" }
];
const sessionTemplates = [
  { id: 1, name: "Quick-Decision SSG", setup: "4v4 Halfcourt", constraints: [1, 3], phases: [{ label: "Warmup", constraint: [1] }, { label: "SSG", constraint: [1, 3] }], coaches: ["Marko"], review: "" },
  { id: 2, name: "No-Dribble Scramble", setup: "5v5 Fullcourt", constraints: [2], phases: [{ label: "Scramble", constraint: [2] }], coaches: ["Ivan"], review: "" }
];
const demoPlayers = Array.from({ length: 8 }, (_, i) => `Player ${i + 1}`);
const courtZones = ["Top", "Left Wing", "Right Wing", "Corner Left", "Corner Right", "Paint", "Perimeter"];
const skillsList = ["Decision Speed", "Off-ball Movement", "Spatial Awareness", "Disruption"];

// Engagement calculation
function getEngagementScore(constraints, setup, touchLog) {
  let base = 66 + constraints.length * 9;
  if (setup.includes("3v3")) base += 9;
  if (constraints.find(c => c.label === "No dribble")) base += 8;
  if (touchLog && Object.values(touchLog).some(n => n === 0)) base -= 10;
  if (base > 99) base = 99;
  return Math.max(base, 55);
}
function getSkillDistribution(constraints) {
  // Returns radar chart data by skill label
  const dist = {};
  skillsList.forEach(s => dist[s] = 0);
  constraints.forEach(c => { if (c.skill) dist[c.skill] += 1; });
  return dist;
}
function getBallInvolvement(setup) {
  if (setup.includes("3v3")) return 93;
  if (setup.includes("4v4")) return 84;
  if (setup.includes("5v5")) return 77;
  return 81;
}
function AIcoachFeedback(score, skillDist, touchLog) {
  const lowZones = Object.entries(touchLog || {}).filter(([_, n]) => n < 2).map(([z]) => z);
  if (score > 93 && !lowZones.length) return { msg: "Session is elite. All zones/skills targeted.", color: "#1de682" };
  if (score > 85) return { msg: "Strong session. Try more spatial or disruption skills.", color: "#FFD700" };
  return { msg: `Some court zones underused: ${lowZones.join(", ")}`, color: "#FF4848" };
}
function makeRadarPath(data, r = 50, cx = 66, cy = 66) {
  // Radar chart SVG path for skill distribution
  const pts = skillsList.map((s, i) => {
    const val = 16 + data[s] * 25;
    const angle = (Math.PI * 2 * i) / skillsList.length - Math.PI / 2;
    return [cx + Math.cos(angle) * val, cy + Math.sin(angle) * val];
  });
  return pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ") + "Z";
}

// UI Components
function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg,#FFD700 80%,#1de682 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "12px 20px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #FFD70044"
    }} {...props}>{children}</button>
  );
}

// Live Court, no faces
function DragCourt({ playerZones, setPlayerZone, zoneLog }) {
  const courtW = 390, courtH = 220;
  return (
    <svg width={courtW} height={courtH} style={{ background: "#1e2737", borderRadius: 18, boxShadow: "0 2px 18px #FFD70033", marginBottom: 10, position: "relative" }}>
      {/* Court zones */}
      {courtZones.map((z, i) => (
        <rect
          key={z}
          x={25 + (i % 2) * 160 + (z === "Paint" ? 80 : 0)}
          y={30 + Math.floor(i / 2) * 60}
          width={z === "Paint" ? 60 : 70}
          height={z === "Paint" ? 80 : 55}
          fill={zoneLog[z] > 4 ? "#1de682" : zoneLog[z] > 2 ? "#FFD700" : "#FF4848"}
          fillOpacity={0.24}
          stroke="#FFD700"
          strokeDasharray={z === "Paint" ? "7 3" : "3 2"}
          rx={9}
        />
      ))}
      {/* Drag “tokens” for players */}
      {Object.entries(playerZones).map(([p, z], idx) => {
        const coords = {
          "Top": [190, 45], "Left Wing": [70, 80], "Right Wing": [320, 80],
          "Corner Left": [50, 175], "Corner Right": [340, 175], "Paint": [190, 100], "Perimeter": [190, 170]
        };
        return (
          <g key={p} transform={`translate(${coords[z][0]},${coords[z][1]})`} cursor="pointer"
            onClick={() => {
              // Cycle zone
              const zi = courtZones.indexOf(z);
              setPlayerZone(prev => ({ ...prev, [p]: courtZones[(zi + 1) % courtZones.length] }));
            }}>
            <circle r={18} fill="#FFD700" stroke="#1de682" strokeWidth={2.3} />
            <text y={7} textAnchor="middle" fontWeight="bold" fontSize={14} fill="#181e23">{p.split(" ")[1]}</text>
          </g>
        );
      })}
      {/* Hoop */}
      <circle cx={190} cy={32} r={10} fill="#FFD700" />
    </svg>
  );
}

// Skill/Session “DNA” Radar
function SessionDNARadar({ skillDist }) {
  const path = makeRadarPath(skillDist);
  return (
    <svg width={132} height={132}>
      <circle cx={66} cy={66} r={50} fill="#283E51" stroke="#FFD70077" strokeWidth={2} />
      {/* Axes */}
      {skillsList.map((s, i) => {
        const angle = (Math.PI * 2 * i) / skillsList.length - Math.PI / 2;
        return <line key={s} x1={66} y1={66} x2={66 + Math.cos(angle) * 50} y2={66 + Math.sin(angle) * 50} stroke="#FFD70044" />;
      })}
      {/* Skill path */}
      <path d={path} fill="#FFD70055" stroke="#FFD700" strokeWidth={2} />
      {skillsList.map((s, i) => {
        const angle = (Math.PI * 2 * i) / skillsList.length - Math.PI / 2;
        return <text key={s} x={66 + Math.cos(angle) * 57} y={66 + Math.sin(angle) * 57 + 4} fill="#FFD700" fontWeight="bold" fontSize={12} textAnchor="middle">{s.split(" ")[0]}</text>;
      })}
    </svg>
  );
}

// AI Coach Bubble, for tips & feedback
function AICoachBubble({ feedback, onClose, tip }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      style={{
        position: "absolute", top: 16, right: 30, zIndex: 50,
        background: "#232b39", borderRadius: 14, boxShadow: "0 3px 19px #FFD70077", color: feedback.color, fontWeight: 900, padding: 22, maxWidth: 370
      }}>
      <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 21, display: "flex", alignItems: "center" }}><FaRobot style={{ marginRight: 10 }} /> AI Coach</div>
      <div style={{ fontWeight: 900, margin: "12px 0 3px 0" }}>{feedback.msg}</div>
      {tip && <div style={{ color: "#1de682", marginTop: 6, fontWeight: 800 }}>{tip}</div>}
      <div style={{ textAlign: "right", marginTop: 9 }}><Button size="sm" style={{ background: "#FFD700", color: "#181e23" }} onClick={onClose}>Close</Button></div>
    </motion.div>
  );
}

// Voice Input (as above)
function VoiceInput({ onResult }) {
  const recognitionRef = useRef(null);
  function startVoice() {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported.");
      return;
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = event => {
        const text = event.results[0][0].transcript;
        onResult(text);
      };
    }
    recognitionRef.current.start();
  }
  return (
    <Button style={{ background: "#FFD700", color: "#181e23", fontSize: 17 }} onClick={startVoice}><FaMicrophone /> Voice</Button>
  );
}

// Main
export default function GameSenseCoachLab() {
  // State
  const [setup, setSetup] = useState("4v4 Halfcourt");
  const [constraints, setConstraints] = useState([defaultConstraints[0]]);
  const [sessionName, setSessionName] = useState("");
  const [phases, setPhases] = useState([{ name: "Main", constraints: [defaultConstraints[0]] }]);
  const [playerZones, setPlayerZone] = useState(Object.fromEntries(demoPlayers.map((p, i) => [p, courtZones[i % courtZones.length]])));
  const [zoneLog, setZoneLog] = useState(Object.fromEntries(courtZones.map(z => [z, 0])));
  const [savedSessions, setSavedSessions] = useState([...sessionTemplates]);
  const [showBot, setShowBot] = useState(false);
  const [tip, setTip] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [voiceConstraint, setVoiceConstraint] = useState("");
  const [review, setReview] = useState("");
  const [coachCollab, setCoachCollab] = useState(["Marko"]);
  const [showScenario, setShowScenario] = useState(false);
  const [scenarioSkill, setScenarioSkill] = useState("All");
  const [playerRadar, setPlayerRadar] = useState([]);
  const [pulseFeedback, setPulseFeedback] = useState([]);
  // Skill distribution
  const skillDist = getSkillDistribution(constraints);
  // Live engagement, involvement
  const engagement = getEngagementScore(constraints, setup, zoneLog);
  const ballInvolve = getBallInvolvement(setup);
  const aiCoach = AIcoachFeedback(engagement, skillDist, zoneLog);

  // Handlers
  function addConstraint(c) {
    if (!constraints.find(x => x.id === c.id)) setConstraints([...constraints, c]);
  }
  function removeConstraint(id) {
    setConstraints(constraints.filter(c => c.id !== id));
  }
  function saveSession() {
    if (!sessionName.trim()) return;
    setSavedSessions([...savedSessions, { id: Date.now(), name: sessionName, setup, constraints: constraints.map(c => c.id), phases, coaches: coachCollab, review }]);
    setSessionName("");
  }
  function loadSession(id) {
    const s = savedSessions.find(x => x.id === id);
    if (!s) return;
    setSetup(s.setup);
    setConstraints(s.constraints.map(cid => defaultConstraints.find(dc => dc.id === cid)));
    setPhases(s.phases || [{ name: "Main", constraints: constraints }]);
    setCoachCollab(s.coaches || []);
    setReview(s.review || "");
  }
  function runScenario() {
    setShowScenario(true);
  }
  function submitPulse(fb) {
    setPulseFeedback([...pulseFeedback, { time: new Date().toLocaleTimeString(), ...fb }]);
  }
  // Court click: simulate touches
  function logTouch(zone) {
    setZoneLog(prev => ({ ...prev, [zone]: (prev[zone] || 0) + 1 }));
    setPlayerRadar(radar => [...radar, { zone, time: new Date().toLocaleTimeString() }]);
  }
  // Reflection save
  function saveReview() {
    setReview(review.trim());
    setShowExport(true);
  }
  // Multi-coach
  function addCoach() {
    const newCoach = prompt("Enter coach name:");
    if (newCoach && !coachCollab.includes(newCoach)) setCoachCollab([...coachCollab, newCoach]);
  }
  function removeCoach(name) {
    setCoachCollab(coachCollab.filter(c => c !== name));
  }

  // Main
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#283E51 0%,#1e222a 100%)", color: "#fff", fontFamily: "Segoe UI,sans-serif", position: "relative" }}>
      {/* Pulse Banner & Quick Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "19px 28px 10px 28px", background: "#181e23", boxShadow: "0 1px 18px #FFD70033" }}>
        <FaLightbulb style={{ fontSize: 32, color: "#FFD700" }} />
        <span style={{ fontSize: 23, fontWeight: 900, color: "#FFD700", letterSpacing: 1 }}>Game Sense Coach Lab</span>
        <span style={{ background: aiCoach.color, color: "#181e23", fontWeight: 900, borderRadius: 7, padding: "7px 16px" }}>
          {aiCoach.msg}
        </span>
        <span style={{ color: "#FFD700", fontWeight: 900, marginLeft: 12 }}><FaTrophy /> {savedSessions.length} Sessions</span>
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={() => setShowExport(true)}><FaFileExport style={{ marginRight: 7 }} />Export</Button>
        <Button style={{ background: "#1de682", color: "#181e23" }} onClick={runScenario}><FaRobot /> AI Scenario</Button>
        <Button style={{ background: "#1de682", color: "#181e23" }} onClick={addCoach}><FaUserPlus /> Add Coach</Button>
      </div>
      {/* AI Coach Tips */}
      <AnimatePresence>
        {showBot && (
          <AICoachBubble feedback={aiCoach} onClose={() => { setShowBot(false); setTip(""); }} tip={tip} />
        )}
      </AnimatePresence>
      {/* Session Builder */}
      <div style={{ display: "flex", gap: 30, padding: "24px 34px 0 34px", alignItems: "flex-start" }}>
        <div style={{ background: "#232b39", borderRadius: 18, padding: "22px 20px", minWidth: 420, flex: 1.3 }}>
          <b style={{ color: "#FFD700", fontSize: 19, letterSpacing: 1 }}><FaChalkboardTeacher style={{ marginRight: 7 }} /> Scenario Designer</b>
          <div style={{ margin: "14px 0 8px 0" }}>
            <span style={{ color: "#FFD700", fontWeight: 900 }}>Setup:</span>
            <select value={setup} onChange={e => setSetup(e.target.value)} style={{ fontWeight: 900, padding: "8px 12px", borderRadius: 10, marginLeft: 13 }}>
              {["3v3", "4v4 Halfcourt", "5v5 Fullcourt", "2v2", "4v4 Fullcourt"].map((s, i) => <option key={i}>{s}</option>)}
            </select>
          </div>
          <div>
            <b style={{ color: "#FFD700" }}>Add Constraints:</b>
            <div style={{ display: "flex", gap: 11, flexWrap: "wrap", marginTop: 6 }}>
              {defaultConstraints.map(c =>
                <Button key={c.id} size="sm" style={{
                  background: constraints.find(x => x.id === c.id) ? "#1de682" : "#FFD700",
                  color: "#181e23", fontSize: 14, padding: "7px 12px"
                }} onClick={() => constraints.find(x => x.id === c.id) ? removeConstraint(c.id) : addConstraint(c)}>{c.label}</Button>
              )}
              <VoiceInput onResult={txt => {
                addConstraint({ id: Date.now(), label: txt, effect: "+Custom" });
                setVoiceConstraint(txt);
                setTip("Voice constraint added.");
                setShowBot(true);
              }} />
            </div>
          </div>
          {/* Session Name */}
          <div style={{ marginTop: 14 }}>
            <b style={{ color: "#FFD700" }}>Session Name:</b>
            <input value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Name this session..." style={{ fontWeight: 900, borderRadius: 7, padding: "8px 13px", marginLeft: 7 }} />
            <Button style={{ background: "#FFD700", color: "#181e23", marginLeft: 8, fontSize: 14 }} onClick={saveSession}><FaSave /> Save</Button>
          </div>
          {/* Multi-coach collab */}
          <div style={{ marginTop: 11 }}>
            <b style={{ color: "#FFD700" }}>Coaches:</b>
            <span style={{ marginLeft: 7 }}>
              {coachCollab.map((c, i) => (
                <span key={c} style={{ background: "#1de682", color: "#232b39", borderRadius: 8, padding: "2px 11px", fontWeight: 900, marginRight: 5 }}>
                  {c} <FaUserCheck style={{ marginLeft: 3 }} onClick={() => removeCoach(c)} />
                </span>
              ))}
            </span>
          </div>
          {/* Drag Court */}
          <div style={{ marginTop: 13 }}>
            <b style={{ color: "#FFD700" }}>Drag & Assign Players to Court Zones</b>
            <DragCourt playerZones={playerZones} setPlayerZone={setPlayerZone} zoneLog={zoneLog} />
            <div style={{ color: "#FFD700", fontWeight: 800, marginTop: 5 }}>Click player to cycle zones. Click on zone to log touch.</div>
            <div style={{ marginTop: 8 }}>
              {courtZones.map(z => (
                <span key={z} onClick={() => logTouch(z)}
                  style={{
                    background: "#FFD700", color: "#232b39", borderRadius: 9, padding: "3px 10px", margin: "0 7px 0 0", cursor: "pointer", fontWeight: 900, fontSize: 13,
                    opacity: zoneLog[z] > 0 ? 1 : 0.5
                  }}>{z}: {zoneLog[z]}</span>
              ))}
            </div>
          </div>
          {/* Session Phases */}
          <div style={{ marginTop: 14 }}>
            <b style={{ color: "#FFD700" }}>Session Phases:</b>
            <ol>
              {phases.map((ph, i) =>
                <li key={i} style={{ marginBottom: 6 }}>
                  <span style={{ color: "#FFD700", fontWeight: 900 }}>{ph.name}</span>
                  <Button size="sm" style={{ background: "#1de682", color: "#181e23", fontSize: 12, marginLeft: 7, padding: "2px 8px" }} onClick={() => {}} >Go</Button>
                  <div>
                    {ph.constraints.map((c, ci) =>
                      <span key={ci} style={{ background: "#FFD700", color: "#232b39", borderRadius: 6, padding: "2px 7px", marginRight: 7, fontWeight: 900 }}>
                        {c.label}
                        <Button size="sm" style={{ background: "#FFD700", color: "#181e23", fontSize: 10, padding: "1px 4px" }} onClick={() => { setTip("No video in ULTIMATE version."); setShowBot(true); }}><FaQuestionCircle /></Button>
                        <Button size="sm" style={{ background: "#FF4848", color: "#fff", fontSize: 10, padding: "1px 4px", marginLeft: 3 }} onClick={() => {}}>X</Button>
                      </span>
                    )}
                  </div>
                  <Button size="sm" style={{ background: "#FFD700", color: "#181e23", fontSize: 10, marginTop: 2 }} onClick={() => {}}>+ Constraint</Button>
                </li>
              )}
            </ol>
            <Button style={{ background: "#FFD700", color: "#181e23", fontSize: 13, marginTop: 4 }} onClick={() => setPhases([...phases, { name: "Phase " + (phases.length + 1), constraints: [] }])}>+ Add Phase</Button>
          </div>
        </div>
        {/* Analytics / Session DNA */}
        <div style={{ flex: 1, minWidth: 350 }}>
          <div style={{ background: "#232b39", borderRadius: 14, padding: "17px 22px", marginBottom: 10 }}>
            <b style={{ color: "#FFD700", fontSize: 18 }}><FaStar style={{ marginRight: 7 }} /> Session DNA</b>
            <SessionDNARadar skillDist={skillDist} />
            <div style={{ marginTop: 9, color: "#FFD700", fontWeight: 900 }}>Skills Targeted: {skillsList.filter(s => skillDist[s]).join(", ")}</div>
            <div style={{ color: "#1de682", fontWeight: 900 }}>Engagement: {engagement} · Ball Involvement: {ballInvolve}</div>
          </div>
          {/* Player Radar */}
          <div style={{ background: "#232b39", borderRadius: 14, padding: "13px 19px", marginBottom: 9 }}>
            <b style={{ color: "#FFD700", fontSize: 16 }}><FaBullseye style={{ marginRight: 5 }} /> Player Zone Radar</b>
            <div>
              {playerRadar.slice(-5).map((r, i) => (
                <span key={i} style={{ background: "#FFD700", color: "#232b39", borderRadius: 7, padding: "3px 7px", marginRight: 7, fontWeight: 900 }}>{r.zone} @ {r.time}</span>
              ))}
            </div>
          </div>
          {/* Session Reflection / Review */}
          <div style={{ background: "#232b39", borderRadius: 14, padding: "12px 14px", marginBottom: 7 }}>
            <b style={{ color: "#FFD700", fontSize: 15 }}><FaCommentAlt style={{ marginRight: 6 }} /> Coach Reflection</b>
            <textarea rows={3} value={review} onChange={e => setReview(e.target.value)} placeholder="What went well? What to adjust?" style={{ width: "100%", borderRadius: 8, marginTop: 7, fontWeight: 800, fontSize: 15 }} />
            <Button style={{ background: "#1de682", color: "#181e23", marginTop: 6, fontSize: 13 }} onClick={saveReview}>Save Review</Button>
          </div>
          {/* Pulse Feedback (players/coaches, demo) */}
          <div style={{ background: "#232b39", borderRadius: 14, padding: "10px 14px" }}>
            <b style={{ color: "#FFD700", fontSize: 15 }}><FaClipboardList style={{ marginRight: 6 }} /> Pulse Review</b>
            <Button style={{ background: "#FFD700", color: "#181e23", fontSize: 13, marginLeft: 5 }} onClick={() => submitPulse({ note: "Session great", emoji: "🔥" })}>Add "Great"</Button>
            <Button style={{ background: "#FFD700", color: "#181e23", fontSize: 13, marginLeft: 5 }} onClick={() => submitPulse({ note: "Too slow", emoji: "🐢" })}>Add "Too Slow"</Button>
            <div style={{ marginTop: 7 }}>
              {pulseFeedback.slice(-4).map((p, i) => (
                <span key={i} style={{ background: "#FFD700", color: "#232b39", borderRadius: 7, padding: "3px 7px", marginRight: 7, fontWeight: 900 }}>{p.emoji} {p.note} ({p.time})</span>
              ))}
            </div>
          </div>
          {/* Saved Sessions */}
          <div style={{ background: "#232b39", borderRadius: 14, padding: "12px 12px", marginTop: 8 }}>
            <b style={{ color: "#FFD700", fontSize: 15 }}><FaClipboardList style={{ marginRight: 6 }} /> Saved Sessions</b>
            <ul>
              {savedSessions.map((s, i) =>
                <li key={s.id} style={{ color: "#FFD700", fontWeight: 900 }}>
                  <span style={{ marginRight: 6 }}>{s.name}</span>
                  <Button size="sm" style={{ background: "#1de682", color: "#181e23", fontSize: 13, padding: "4px 9px" }} onClick={() => loadSession(s.id)}>Load</Button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {/* AI Scenario Mode */}
      <AnimatePresence>
        {showScenario && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            style={{
              position: "fixed", top: 100, left: 0, right: 0, margin: "auto", width: 500, zIndex: 250,
              background: "#232b39", color: "#FFD700", borderRadius: 18, boxShadow: "0 4px 44px #FFD70044", padding: 37
            }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#FFD700", marginBottom: 10 }}>AI Scenario Mode</div>
            <div style={{ color: "#FFD700", fontWeight: 900 }}>Simulate engagement and skill focus for...</div>
            <select value={scenarioSkill} onChange={e => setScenarioSkill(e.target.value)} style={{ fontWeight: 900, margin: "14px 0", padding: "7px 18px", borderRadius: 9 }}>
              <option value="All">All</option>
              {skillsList.map(s => <option key={s}>{s}</option>)}
            </select>
            <div style={{ marginTop: 11, color: "#1de682", fontWeight: 900 }}>
              {scenarioSkill === "All"
                ? "Full skill radar simulated. Engagement: 95. Add constraints to maximize Off-ball and Disruption."
                : `Best constraints for ${scenarioSkill}: ${defaultConstraints.filter(c => c.skill === scenarioSkill).map(c => c.label).join(", ")}`
              }
            </div>
            <Button style={{ background: "#FFD700", color: "#181e23", marginTop: 19 }} onClick={() => setShowScenario(false)}>Close</Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Export Notification */}
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
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (Session DNA, radar, review, pulse, all included)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
