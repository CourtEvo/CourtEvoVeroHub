
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaUserAlt, FaCalendarAlt, FaFileExport, FaFileDownload, FaComments, FaBullhorn, FaFilePdf, FaCheckCircle } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

// DEMO DATA
const PLAYERS = [
  { id: "p1", name: "Marko Horvat", team: "U14", progress: { games: 17, points: 182, attendance: "96%", skill: 85, coachNote: "Excellent season, needs more defense focus." } },
  { id: "p2", name: "Luka Petrović", team: "U16", progress: { games: 14, points: 145, attendance: "92%", skill: 78, coachNote: "Big improvement in leadership." } }
];

const CLUB_MESSAGES = [
  { date: "2025-06-10", title: "Season Awards", content: "Join us for the club awards this Friday at 18:00 in the main hall.", board: true },
  { date: "2025-06-04", title: "New Code of Conduct", content: "All parents and players: please review the updated club Code of Conduct.", board: false }
];

const CALENDAR = [
  { date: "2025-06-15", title: "U14 League Final", type: "Game" },
  { date: "2025-06-20", title: "Parent Meeting", type: "Meeting" },
  { date: "2025-06-25", title: "Summer Camp Start", type: "Event" }
];

const DOCS = [
  { id: 1, name: "Code of Conduct PDF", url: "#", type: "Document" },
  { id: 2, name: "Medical Form", url: "#", type: "Form" }
];

const fadeIn = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

const ParentPortal = () => {
  const [playerId, setPlayerId] = useState(PLAYERS[0].id);
  const [survey, setSurvey] = useState({ nps: 10, comment: "" });
  const [surveySent, setSurveySent] = useState(false);
  const [showMsg, setShowMsg] = useState(null);
  const [showEvent, setShowEvent] = useState(null);
  const sectionRef = useRef();

  const player = PLAYERS.find(p => p.id === playerId);

  // PDF export for player progress
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `ProgressReport_${player.name}_${new Date().toISOString().slice(0, 10)}`
  });

  // Survey handler
  function submitSurvey(e) {
    e.preventDefault();
    setSurveySent(true);
    setTimeout(() => setSurveySent(false), 2500);
    setSurvey({ nps: 10, comment: "" });
  }

  return (
    <div style={{ width: "100%", maxWidth: 850, margin: "0 auto" }}>
      <motion.section
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          marginTop: 36,
          marginBottom: 36,
          boxShadow: "0 2px 16px #FFD70044"
        }}
      >
        {/* Player selector & export */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12 }}>
          <FaUserAlt style={{ color: "#FFD700", fontSize: 20 }} />
          <select value={playerId} onChange={e => setPlayerId(e.target.value)}
            style={{ fontSize: 17, borderRadius: 7, padding: "7px 10px", fontWeight: 600 }}>
            {PLAYERS.map(p => (
              <option value={p.id} key={p.id}>{p.name} ({p.team})</option>
            ))}
          </select>
          <button onClick={handlePrint}
            style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, padding: "7px 18px", fontSize: 16, marginLeft: "auto" }}>
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} /> Export Progress PDF
          </button>
        </div>
        {/* Player Progress Report */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 27 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 6 }}>Player Progress</div>
          <table style={{ width: "100%", fontSize: 16 }}>
            <tbody>
              <tr><td style={{ color: "#FFD700bb" }}>Games:</td><td>{player.progress.games}</td></tr>
              <tr><td style={{ color: "#FFD700bb" }}>Points:</td><td>{player.progress.points}</td></tr>
              <tr><td style={{ color: "#FFD700bb" }}>Attendance:</td><td>{player.progress.attendance}</td></tr>
              <tr><td style={{ color: "#FFD700bb" }}>Skill Index:</td><td>{player.progress.skill}/100</td></tr>
              <tr><td style={{ color: "#FFD700bb" }}>Coach Note:</td><td>{player.progress.coachNote}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Club/Board Messages */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 25 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <FaBullhorn /> Club & Board Messages
          </div>
          <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
            {CLUB_MESSAGES.map((msg, idx) => (
              <li key={idx} style={{ marginBottom: 9, background: msg.board ? "#FFD70022" : "#222", borderRadius: 8, padding: "10px 18px", color: msg.board ? "#FFD700" : "#fff", cursor: "pointer" }}
                onClick={() => setShowMsg(msg)}>
                <b>{msg.title}</b> <span style={{ fontSize: 13, color: "#27ef7d", marginLeft: 12 }}>{msg.date}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Club/Board Message Modal */}
        {showMsg && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
          }}>
            <div style={{ background: "#232344", borderRadius: 15, padding: 35, minWidth: 320, color: "#FFD700", boxShadow: "0 0 30px #0007" }}>
              <h3 style={{ marginBottom: 12 }}>{showMsg.title}</h3>
              <div style={{ marginBottom: 12, color: "#FFD700bb" }}>{showMsg.date}</div>
              <div style={{ color: "#fff", marginBottom: 16 }}>{showMsg.content}</div>
              <button onClick={() => setShowMsg(null)} style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 17px" }}>Close</button>
            </div>
          </div>
        )}

        {/* Events Calendar */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 25 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <FaCalendarAlt /> Events Calendar
          </div>
          <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
            {CALENDAR.map((event, idx) => (
              <li key={idx} style={{ marginBottom: 9, background: "#FFD70022", borderRadius: 8, padding: "10px 18px", color: "#FFD700", cursor: "pointer" }}
                onClick={() => setShowEvent(event)}>
                <b>{event.title}</b> <span style={{ fontSize: 13, color: "#27ef7d", marginLeft: 14 }}>{event.date}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Event Modal */}
        {showEvent && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
          }}>
            <div style={{ background: "#232344", borderRadius: 15, padding: 35, minWidth: 320, color: "#FFD700", boxShadow: "0 0 30px #0007" }}>
              <h3 style={{ marginBottom: 12 }}>{showEvent.title}</h3>
              <div style={{ marginBottom: 12, color: "#FFD700bb" }}>{showEvent.date}</div>
              <div style={{ color: "#fff", marginBottom: 16 }}>Type: {showEvent.type}</div>
              <button onClick={() => setShowEvent(null)} style={{ background: "#FFD700", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 17px" }}>Close</button>
            </div>
          </div>
        )}

        {/* Surveys & Feedback */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 25 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <FaComments /> Parent Survey / Feedback
          </div>
          {surveySent ? (
            <div style={{ color: "#27ef7d", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", gap: 10 }}>
              <FaCheckCircle /> Thank you for your feedback!
            </div>
          ) : (
            <form onSubmit={submitSurvey} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label>
                NPS (0-10):{" "}
                <input type="number" min={0} max={10} value={survey.nps}
                  onChange={e => setSurvey(s => ({ ...s, nps: e.target.value }))}
                  style={{ width: 40, fontSize: 15, borderRadius: 5, marginRight: 8 }}
                />
              </label>
              <input type="text" placeholder="Comments (optional)" value={survey.comment}
                onChange={e => setSurvey(s => ({ ...s, comment: e.target.value }))}
                style={{ width: 160, fontSize: 15, borderRadius: 5 }}
              />
              <button type="submit" style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 17px" }}>Send</button>
            </form>
          )}
        </div>

        {/* Document Downloads */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 19, marginBottom: 5 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <FaFilePdf /> Club Documents
          </div>
          <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
            {DOCS.map(doc => (
              <li key={doc.id} style={{ marginBottom: 9, background: "#FFD70022", borderRadius: 8, padding: "10px 18px", color: "#FFD700" }}>
                <b>{doc.name}</b>{" "}
                <a href={doc.url} target="_blank" rel="noreferrer"
                  style={{ color: "#27ef7d", fontWeight: 700, marginLeft: 18 }}>
                  <FaFileDownload /> Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>
    </div>
  );
};

export default ParentPortal;
