import React, { useState } from "react";
import {
  FaBasketballBall, FaPlusCircle, FaTrash, FaEdit, FaTrophy, FaSearch, FaListAlt,
  FaCloudDownloadAlt, FaBolt, FaGamepad, FaUserCheck, FaFire, FaCommentAlt, FaQuestionCircle, FaVideo, FaClock, FaUsers, FaFilePdf, FaRedo, FaFlag, FaUserTimes
} from "react-icons/fa";

// Demo session activities library
const initialLibrary = [
  { id: 1, name: "3v3 Game", type: "Game", duration: 15, challenge: 8, description: "Live 3v3 half-court" },
  { id: 2, name: "Full Court SSG", type: "Game", duration: 10, challenge: 7, description: "Small-sided, rules constraint" },
  { id: 3, name: "Shell Drill", type: "Drill", duration: 8, challenge: 5, description: "Defensive rotation" },
  { id: 4, name: "Shooting Circuit", type: "Drill", duration: 10, challenge: 6, description: "Spot-up and on-the-move" },
  { id: 5, name: "Coach Q&A", type: "Discussion", duration: 5, challenge: 3, description: "Player-driven questions" },
  { id: 6, name: "1v1 Relays", type: "Game", duration: 7, challenge: 7, description: "Competitive, high intensity" },
];

const squads = ["U10 Boys", "U12 Boys", "U14 Boys", "U16 Boys", "U18 Boys", "Seniors"];
const themes = ["Shooting", "Defense", "Transition", "Decision Making", "Ball Handling"];
const squadPlayers = {
  "U10 Boys": ["Antonio Pavic", "Luka Vidovic", "Jure Kolar"],
  "U12 Boys": ["Ivan Juric", "Petar Simic", "Kristijan Matic", "Niko Topic"],
  "U14 Boys": ["Dino Markovic", "Filip Ilic"],
  "U16 Boys": ["Lovro Pavlovic"],
  "U18 Boys": ["Mislav Kralj", "Jakov Babic"],
  "Seniors": ["Mateo Peric"]
};

function nextSessionId(sessions) {
  return Math.max(0, ...sessions.map(s => s.id)) + 1;
}

export default function GameCentricSessionIntelligenceEngine() {
  const [library, setLibrary] = useState(initialLibrary);
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    name: "",
    squad: squads[0],
    date: "",
    activities: [],
    tags: [],
    feedback: [],
    attendance: {},
    videoLinks: [],
    afterAction: "",
    id: null,
    inProgress: false,
    liveActivity: 0,
    liveNotes: [],
    aars: [],
  });
  const [editingSession, setEditingSession] = useState(null);
  const [activitySearch, setActivitySearch] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [liveMode, setLiveMode] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("Highlight");

  // CRUD for activities in session
  function addActivityToSession(activity) {
    setNewSession(ns => ({
      ...ns,
      activities: [...ns.activities, { ...activity, uid: Date.now() + Math.random(), videoLinks: [], status: "normal" }]
    }));
  }
  function removeActivityFromSession(uid) {
    setNewSession(ns => ({
      ...ns,
      activities: ns.activities.filter(a => a.uid !== uid)
    }));
  }

  // Create/edit session
  function saveSession() {
    if (editingSession) {
      setSessions(ss => ss.map(s => s.id === editingSession.id ? { ...newSession, id: editingSession.id } : s));
      setEditingSession(null);
    } else {
      setSessions(ss => [...ss, { ...newSession, id: nextSessionId(ss) }]);
    }
    setNewSession({
      name: "", squad: squads[0], date: "", activities: [], tags: [], feedback: [],
      attendance: {}, videoLinks: [], afterAction: "", id: null, inProgress: false, liveActivity: 0, liveNotes: [], aars: [],
    });
  }
  function editSession(session) {
    setEditingSession(session);
    setNewSession({ ...session, activities: session.activities.map(a => ({ ...a })), tags: [...session.tags], feedback: [...session.feedback] });
  }
  function deleteSession(id) {
    setSessions(ss => ss.filter(s => s.id !== id));
    if (selectedSession && selectedSession.id === id) setSelectedSession(null);
  }

  // Feedback (post-session)
  function submitFeedback(sessionId, who, rating, notes) {
    setSessions(ss => ss.map(s =>
      s.id === sessionId
        ? { ...s, feedback: [...s.feedback, { who, rating, notes, time: new Date().toLocaleString() }] }
        : s
    ));
  }

  // Attendance
  function toggleAttendance(player) {
    setNewSession(ns => ({
      ...ns,
      attendance: {
        ...ns.attendance,
        [player]: ns.attendance[player] === "present" ? "absent" : "present"
      }
    }));
  }

  // Live session controls
  function startLiveSession() {
    setLiveMode(true);
    setNewSession(ns => ({ ...ns, inProgress: true, liveActivity: 0, liveNotes: [] }));
  }
  function nextActivity() {
    setNewSession(ns => ({ ...ns, liveActivity: ns.liveActivity + 1 }));
  }
  function logLiveNote(note) {
    setNewSession(ns => ({
      ...ns,
      liveNotes: [...ns.liveNotes, { note, activity: ns.activities[ns.liveActivity]?.name, time: new Date().toLocaleTimeString() }]
    }));
  }
  function endLiveSession() {
    setLiveMode(false);
    setNewSession(ns => ({ ...ns, inProgress: false, liveActivity: 0 }));
  }

  // Video link per activity
  function addVideoToActivity(actIdx) {
    const url = prompt("Paste video link (YouTube, Hudl, etc):");
    if (url) {
      setNewSession(ns => {
        const acts = [...ns.activities];
        acts[actIdx].videoLinks = acts[actIdx].videoLinks || [];
        acts[actIdx].videoLinks.push({ url, label: "Highlight" });
        return { ...ns, activities: acts };
      });
    }
  }

  // After-action review
  function addAAR(session, text) {
    setSessions(ss => ss.map(s =>
      s.id === session.id
        ? { ...s, aars: [...(s.aars || []), { text, time: new Date().toLocaleString() }] }
        : s
    ));
  }

  // Analytics
  function sessionAnalytics(acts) {
    const total = acts.reduce((a, b) => a + (b.duration || 0), 0);
    const drill = acts.filter(a => a.type === "Drill").reduce((a, b) => a + b.duration, 0);
    const game = acts.filter(a => a.type === "Game").reduce((a, b) => a + b.duration, 0);
    const discussion = acts.filter(a => a.type === "Discussion").reduce((a, b) => a + b.duration, 0);
    const challenge = acts.length ? Math.round(acts.reduce((a, b) => a + b.challenge, 0) / acts.length) : 0;
    return {
      total, drill, game, discussion, challenge,
      drillPercent: total ? Math.round(100 * drill / total) : 0,
      gamePercent: total ? Math.round(100 * game / total) : 0,
      discussionPercent: total ? Math.round(100 * discussion / total) : 0,
      implicitLearning: total ? Math.round(100 * game / total) : 0 // proxy for implicit
    };
  }

  // Club analytics: track themes, coach, squad, live play
  function clubAnalytics() {
    let totalSessions = sessions.length;
    let totalGames = 0, totalDrills = 0, totalLivePlay = 0, sessionMinutes = 0, challengeSum = 0;
    let themeCounter = {};
    sessions.forEach(sess => {
      const a = sessionAnalytics(sess.activities);
      totalGames += a.game;
      totalDrills += a.drill;
      totalLivePlay += a.implicitLearning;
      sessionMinutes += a.total;
      challengeSum += a.challenge;
      sess.tags.forEach(t => themeCounter[t] = (themeCounter[t] || 0) + 1);
    });
    return {
      totalSessions, avgLivePlay: totalSessions ? Math.round(totalLivePlay / totalSessions) : 0,
      avgChallenge: totalSessions ? Math.round(challengeSum / totalSessions) : 0,
      totalGames, totalDrills, sessionMinutes, themeCounter
    };
  }

  // AI suggestions: missing themes/overused activities
  function aiSuggestions() {
    let lastActivities = {};
    sessions.forEach(sess => {
      sess.activities.forEach(a => {
        lastActivities[a.name] = sess.date;
      });
    });
    // Suggest an activity not used in last 4 sessions
    const recentSessions = sessions.slice(-4);
    let usedRecently = new Set();
    recentSessions.forEach(sess => sess.activities.forEach(a => usedRecently.add(a.name)));
    let neglected = library.filter(a => !usedRecently.has(a.name));
    let themeGaps = themes.filter(t => !sessions.some(sess => sess.tags.includes(t)));
    return {
      neglected,
      themeGaps
    };
  }

  // Export session to CSV (simple, can expand to PDF)
  function exportSessionCSV(session) {
    const header = "Activity,Type,Duration,Challenge\n";
    const body = session.activities.map(a =>
      `${a.name},${a.type},${a.duration},${a.challenge}`
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `session_${session.id}_plan.csv`;
    link.click();
  }

  // Search/filter activities
  const visibleActs = library.filter(a =>
    a.name.toLowerCase().includes(activitySearch.toLowerCase())
    || a.description.toLowerCase().includes(activitySearch.toLowerCase())
    || a.type.toLowerCase().includes(activitySearch.toLowerCase())
  );

  // Live session activity
  const currentActivity = newSession.activities[newSession.liveActivity];

  return (
    <div style={{
      background: "#232a2e",
      color: "#fff",
      fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh",
      borderRadius: "24px",
      padding: "38px 28px 18px 28px",
      boxShadow: "0 6px 32px 0 #1a1d20"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <FaBasketballBall size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            GAME-CENTRIC SESSION INTELLIGENCE ENGINE
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Live, intelligent, and analytic session management. Boardroom-ready. Memory included.
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Club analytics and AI */}
      <div style={{
        marginBottom: 22, display: "flex", gap: 38, flexWrap: "wrap"
      }}>
        <div style={{ minWidth: 250, maxWidth: 340, flex: "1 1 250px", background: "#283E51", borderRadius: 15, padding: 13 }}>
          <b style={{ color: "#FFD700" }}>Club Session Analytics</b>
          <ul style={{ margin: 0, fontSize: 14 }}>
            <li>Total Sessions: {clubAnalytics().totalSessions}</li>
            <li>Avg. Live Play: {clubAnalytics().avgLivePlay}%</li>
            <li>Avg. Challenge: {clubAnalytics().avgChallenge}</li>
            <li>Total Game Minutes: {clubAnalytics().totalGames}</li>
            <li>Total Drill Minutes: {clubAnalytics().totalDrills}</li>
            <li>Session Minutes: {clubAnalytics().sessionMinutes}</li>
          </ul>
          <div>
            <b style={{ color: "#FFD700" }}>Themes:</b>
            {Object.entries(clubAnalytics().themeCounter).map(([t, n]) => (
              <span key={t} style={{ marginRight: 10 }}>{t}: {n}</span>
            ))}
          </div>
        </div>
        <div style={{ minWidth: 260, maxWidth: 340, flex: "1 1 240px", background: "#232a2e", borderRadius: 15, padding: 13 }}>
          <b style={{ color: "#FFD700" }}>AI Session Suggestions</b>
          <ul style={{ margin: 0, fontSize: 14 }}>
            <li>
              {aiSuggestions().neglected.length > 0
                ? <>Try neglected: <b style={{ color: "#1de682" }}>{aiSuggestions().neglected[0].name}</b></>
                : <span style={{ color: "#FFD700" }}>All content used recently!</span>}
            </li>
            <li>
              {aiSuggestions().themeGaps.length > 0
                ? <>Theme gap: <b style={{ color: "#ff6b6b" }}>{aiSuggestions().themeGaps.join(", ")}</b></>
                : <span style={{ color: "#1de682" }}>All themes hit</span>}
            </li>
          </ul>
        </div>
      </div>

      <div style={{ display: "flex", gap: 36, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Session Builder */}
        <div style={{
          minWidth: 335, maxWidth: 445, flex: "1 1 420px",
          background: "#283E51", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18
        }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 9 }}>
            Create/Edit Session
          </div>
          <form onSubmit={e => { e.preventDefault(); saveSession(); }}>
            <div><b>Name:</b>
              <input type="text" value={newSession.name}
                onChange={e => setNewSession(ns => ({ ...ns, name: e.target.value }))}
                required style={{ marginLeft: 8, borderRadius: 7, padding: "4px 7px" }} />
            </div>
            <div><b>Squad:</b>
              <select value={newSession.squad}
                onChange={e => setNewSession(ns => ({ ...ns, squad: e.target.value }))}
                style={{ marginLeft: 8, borderRadius: 7, padding: "4px 7px" }}>
                {squads.map(sq => <option key={sq} value={sq}>{sq}</option>)}
              </select>
            </div>
            <div><b>Date:</b>
              <input type="date" value={newSession.date}
                onChange={e => setNewSession(ns => ({ ...ns, date: e.target.value }))}
                style={{ marginLeft: 8, borderRadius: 7, padding: "4px 7px" }} />
            </div>
            <div>
              <b>Tags:</b>
              <select multiple value={newSession.tags}
                onChange={e => setNewSession(ns => ({
                  ...ns, tags: Array.from(e.target.selectedOptions).map(o => o.value)
                }))}
                style={{ marginLeft: 8, borderRadius: 7, padding: "4px 7px", width: 140, height: 52 }}>
                {themes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <b>Attendance:</b>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(squadPlayers[newSession.squad] || []).map(pl =>
                  <button type="button"
                    key={pl}
                    style={{
                      background: newSession.attendance[pl] === "present" ? "#1de682" : "#FFD70022",
                      color: "#232a2e", borderRadius: 7, border: "none", padding: "3px 9px", fontWeight: 700, fontSize: 13, cursor: "pointer"
                    }}
                    onClick={() => toggleAttendance(pl)}
                  >
                    {newSession.attendance[pl] === "present" ? <FaUserCheck /> : <FaUserTimes />} {pl}
                  </button>
                )}
              </div>
            </div>
            <div style={{ margin: "7px 0" }}>
              <b>Add Activities:</b>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
                <FaSearch color="#1de682" /> &nbsp;
                <input type="text" placeholder="Search activities..." value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  style={{ borderRadius: 6, padding: "3px 9px", width: 140, marginRight: 7 }} />
              </div>
              <div style={{ maxHeight: 65, overflowY: "auto", marginBottom: 5 }}>
                {visibleActs.map(act =>
                  <button key={act.id} type="button"
                    style={{
                      background: "#1de682", color: "#232a2e", borderRadius: 7, border: "none", marginRight: 8,
                      fontWeight: 700, padding: "3px 10px", fontSize: 13, cursor: "pointer"
                    }}
                    title={act.description}
                    onClick={() => addActivityToSession(act)}
                  >
                    {act.name}
                  </button>
                )}
              </div>
            </div>
            <div>
              <b>Session Activities:</b>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {newSession.activities.map((a, i) =>
                  <li key={a.uid}
                    style={{
                      background: "#232a2e", color: "#FFD700", fontWeight: 600,
                      borderRadius: 8, marginBottom: 4, padding: "7px 10px",
                      display: "flex", alignItems: "center", gap: 8
                    }}>
                    <span>{a.type === "Game"
                      ? <FaGamepad color="#1de682" />
                      : a.type === "Drill"
                        ? <FaBolt color="#FFD700" />
                        : <FaCommentAlt color="#FFD700" />}</span>
                    {a.name} &bull; {a.duration}min &bull; Ch:{a.challenge}
                    <button type="button"
                      style={{
                        background: "#ff6b6b", color: "#fff", borderRadius: 6, border: "none", fontWeight: 700,
                        marginLeft: "auto", padding: "2px 8px", cursor: "pointer"
                      }}
                      onClick={() => removeActivityFromSession(a.uid)}
                    ><FaTrash /></button>
                  </li>
                )}
              </ul>
            </div>
            <div style={{ marginTop: 8 }}>
              <button type="submit" style={{
                background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, padding: "6px 18px", marginRight: 8, cursor: "pointer"
              }}>{editingSession ? "Save" : "Create"} Session</button>
              <button type="button" style={{
                background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, padding: "6px 18px", cursor: "pointer"
              }}
                onClick={() => {
                  setNewSession({
                    name: "", squad: squads[0], date: "", activities: [], tags: [], feedback: [],
                    attendance: {}, videoLinks: [], afterAction: "", id: null, inProgress: false, liveActivity: 0, liveNotes: [], aars: [],
                  });
                  setEditingSession(null);
                }}>Cancel</button>
            </div>
            {/* Real-time session analytics */}
            {newSession.activities.length > 0 &&
              <div style={{ marginTop: 10, background: "#FFD70022", borderRadius: 7, padding: 7, color: "#232a2e", fontWeight: 700 }}>
                {(() => {
                  const a = sessionAnalytics(newSession.activities);
                  return <>
                    Drill: {a.drillPercent}% &bull; Game: {a.gamePercent}% &bull; Live Play: {a.implicitLearning}%<br />
                    Avg Challenge: {a.challenge} &bull; Total: {a.total}min
                  </>;
                })()}
              </div>
            }
            {newSession.activities.length > 0 && !liveMode &&
              <div style={{ marginTop: 14 }}>
                <button
                  style={{
                    background: "#1de682", color: "#232a2e", borderRadius: 10, fontWeight: 700,
                    border: "none", padding: "10px 22px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #2a2d31",
                  }}
                  onClick={startLiveSession}
                ><FaClock style={{ marginRight: 8 }} />Start Live Session</button>
              </div>
            }
            {/* Live session mode */}
            {liveMode &&
              <div style={{ marginTop: 17, background: "#FFD70022", borderRadius: 7, padding: 8, color: "#232a2e" }}>
                <div>
                  <b>Live Activity: </b>
                  {currentActivity
                    ? <>{currentActivity.name} <FaClock /> ({currentActivity.duration}min) <FaQuestionCircle title={currentActivity.description} /></>
                    : <b style={{ color: "#ff6b6b" }}>Session Complete</b>}
                </div>
                <div>
                  <input type="text" placeholder="Live note..." style={{ borderRadius: 5, padding: "2px 8px", width: 140, marginRight: 6 }}
                    onKeyDown={e => { if (e.key === "Enter") logLiveNote(e.target.value); }} />
                  <button type="button"
                    style={{
                      background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 700, border: "none", padding: "3px 11px", cursor: "pointer"
                    }}
                    onClick={() => logLiveNote(prompt("Enter live note:"))}
                  >Log Note</button>
                  <button type="button"
                    style={{
                      background: "#1de682", color: "#232a2e", borderRadius: 7, fontWeight: 700, border: "none", padding: "3px 11px", cursor: "pointer", marginLeft: 10
                    }}
                    onClick={nextActivity}
                    disabled={!currentActivity}
                  >Next Activity</button>
                  <button type="button"
                    style={{
                      background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 700, border: "none", padding: "3px 11px", cursor: "pointer", marginLeft: 10
                    }}
                    onClick={endLiveSession}
                  >End Session</button>
                </div>
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  <b>Live Notes:</b>
                  <ul style={{ maxHeight: 60, overflowY: "auto" }}>
                    {newSession.liveNotes.map((n, i) => (
                      <li key={i}>{n.note} <span style={{ fontSize: 10, color: "#232a2e" }}>({n.activity} - {n.time})</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            }
          </form>
        </div>

        {/* Session Library/Timeline/After-Action */}
        <div style={{
          minWidth: 320, maxWidth: 440, flex: "1 1 380px",
          background: "#232a2e", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18
        }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 7 }}>
            Session Library, Timeline & AAR
          </div>
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {sessions.map(sess =>
                <li key={sess.id}
                  style={{
                    background: selectedSession && selectedSession.id === sess.id ? "#FFD70022" : "#283E51",
                    color: "#FFD700", fontWeight: 700,
                    borderRadius: 7, marginBottom: 7, padding: "7px 10px", cursor: "pointer"
                  }}
                  onClick={() => setSelectedSession(sess)}
                >
                  {sess.name} &bull; {sess.squad} &bull; {sess.date}
                  <button style={{ marginLeft: 14, background: "#FFD700", color: "#232a2e", borderRadius: 5, border: "none", padding: "2px 9px", fontWeight: 700, cursor: "pointer" }}
                    onClick={e => { e.stopPropagation(); editSession(sess); }}><FaEdit /></button>
                  <button style={{ background: "#ff6b6b", color: "#fff", borderRadius: 5, border: "none", padding: "2px 9px", fontWeight: 700, cursor: "pointer" }}
                    onClick={e => { e.stopPropagation(); deleteSession(sess.id); }}><FaTrash /></button>
                  <button style={{ background: "#1de682", color: "#232a2e", borderRadius: 5, border: "none", padding: "2px 9px", fontWeight: 700, cursor: "pointer", marginLeft: 7 }}
                    title="Export CSV"
                    onClick={e => { e.stopPropagation(); exportSessionCSV(sess); }}><FaCloudDownloadAlt /></button>
                </li>
              )}
            </ul>
          </div>
          {/* Timeline and AAR */}
          {selectedSession &&
            <div style={{ marginTop: 13, background: "#FFD70022", borderRadius: 8, padding: 10 }}>
              <b style={{ color: "#232a2e" }}>Session Timeline</b>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {selectedSession.activities.map((a, i) =>
                  <li key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      fontWeight: 700, color: a.type === "Game" ? "#1de682" : a.type === "Drill" ? "#FFD700" : "#232a2e"
                    }}>
                    {a.type === "Game"
                      ? <FaGamepad />
                      : a.type === "Drill"
                        ? <FaBolt />
                        : <FaCommentAlt />}
                    {a.name}: {a.duration}min (Ch:{a.challenge})
                    <button style={{
                      background: "#FFD700", color: "#232a2e", borderRadius: 5, border: "none", padding: "2px 9px", fontWeight: 700, cursor: "pointer", marginLeft: 8
                    }}
                      title="Add Video Link"
                      onClick={() => addVideoToActivity(i)}
                    ><FaVideo /></button>
                  </li>
                )}
              </ul>
              {/* Video links */}
              <div style={{ marginTop: 7, fontSize: 14, color: "#232a2e" }}>
                <b>Session Video Moments:</b>
                <ul>
                  {selectedSession.activities.flatMap((a, i) =>
                    (a.videoLinks || []).map((v, j) => (
                      <li key={i + "-" + j}>{a.name}: <a href={v.url} style={{ color: "#FFD700" }} target="_blank" rel="noopener noreferrer">{v.label || "Video"}</a></li>
                    ))
                  )}
                </ul>
              </div>
              {/* Session analytics */}
              <div style={{ marginTop: 7, color: "#232a2e", fontWeight: 700 }}>
                {(() => {
                  const a = sessionAnalytics(selectedSession.activities);
                  return <>
                    Drill: {a.drillPercent}% &bull; Game: {a.gamePercent}% &bull; Live Play: {a.implicitLearning}%<br />
                    Avg Challenge: {a.challenge} &bull; Total: {a.total}min
                  </>;
                })()}
              </div>
              {/* Session feedback input */}
              <div style={{ marginTop: 10 }}>
                <b style={{ color: "#1de682" }}>Post-Session Feedback</b>
                <form onSubmit={e => {
                  e.preventDefault();
                  submitFeedback(selectedSession.id,
                    e.target.who.value, e.target.rating.value, e.target.notes.value);
                  e.target.reset();
                }}>
                  <select name="who" required style={{ borderRadius: 6, marginRight: 7 }}>
                    <option value="">Role</option>
                    <option value="Coach">Coach</option>
                    <option value="Player">Player</option>
                  </select>
                  <select name="rating" required style={{ borderRadius: 6, marginRight: 7 }}>
                    <option value="">Challenge</option>
                    <option value="Easy">Easy</option>
                    <option value="Optimal">Optimal</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <input name="notes" type="text" placeholder="Notes..." style={{ borderRadius: 6, padding: "2px 8px", width: 110, marginRight: 7 }} />
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 700, padding: "4px 12px", cursor: "pointer"
                  }}>Submit</button>
                </form>
                <ul style={{ marginTop: 6, fontSize: 13, maxHeight: 55, overflowY: "auto", color: "#232a2e" }}>
                  {selectedSession.feedback && selectedSession.feedback.length > 0
                    ? selectedSession.feedback.map((fb, i) =>
                      <li key={i}><b>{fb.who}:</b> {fb.rating} – {fb.notes} <span style={{ fontSize: 10 }}>({fb.time})</span></li>
                    )
                    : <li>No feedback yet.</li>
                  }
                </ul>
              </div>
              {/* After-Action Review */}
              <div style={{ marginTop: 10 }}>
                <b style={{ color: "#FFD700" }}>After-Action Review (AAR)</b>
                <form onSubmit={e => {
                  e.preventDefault();
                  addAAR(selectedSession, e.target.aar.value);
                  e.target.reset();
                }}>
                  <input name="aar" type="text" placeholder="What worked / What didn't / Next steps"
                    style={{ borderRadius: 6, padding: "2px 8px", width: 160, marginRight: 7 }} />
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 700, padding: "4px 12px", cursor: "pointer"
                  }}><FaRedo /> Add AAR</button>
                </form>
                <ul style={{ marginTop: 5, fontSize: 13, maxHeight: 65, overflowY: "auto" }}>
                  {selectedSession.aars && selectedSession.aars.length > 0
                    ? selectedSession.aars.map((aar, i) =>
                      <li key={i}><b>{aar.time}:</b> {aar.text}</li>
                    )
                    : <li>No AAR yet.</li>
                  }
                </ul>
              </div>
            </div>
          }
        </div>
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 36,
        fontSize: 14,
        opacity: 0.7,
        textAlign: "center",
      }}>
        Proprietary to CourtEvo Vero. Session intelligence = club intelligence. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
