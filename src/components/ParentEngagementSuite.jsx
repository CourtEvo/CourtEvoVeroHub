import React, { useState } from "react";
import {
  FaUsers, FaHeartbeat, FaCommentDots, FaFileExport, FaRobot, FaLightbulb, FaCalendarAlt, 
  FaClipboardCheck, FaExclamationTriangle, FaTrophy, FaBookOpen, FaCheckCircle
} from "react-icons/fa";

// Demo Data
const squads = ["U14", "U16", "U18", "Senior"];
const parentsInit = [
  { name: "Kovac", squad: "U14", engagement: 91, history: [88, 89, 91], feedback: "Very satisfied. Requests more nutrition guidance.", sentiment: 1, lastTouch: "2024-05-04", actions: ["Attended April workshop"], super: true },
  { name: "Horvat", squad: "U16", engagement: 67, history: [73, 70, 67], feedback: "Not happy with comms frequency.", sentiment: -1, lastTouch: "2024-04-24", actions: ["Submitted feedback"], super: false },
  { name: "Radic", squad: "U18", engagement: 77, history: [80, 78, 77], feedback: "Would like more regular check-ins.", sentiment: 0, lastTouch: "2024-05-02", actions: ["1:1 with DoC"], super: false }
];
const surveyTemplates = [
  { name: "Monthly Pulse", questions: ["Rate satisfaction (1-5)", "Any concerns?", "Suggested improvements"] },
  { name: "Season Start", questions: ["Understanding of season goals?", "Does athlete enjoy club?", "Any logistics issues?"] }
];
const resources = [
  { title: "Nutrition Guide", url: "#", type: "PDF" },
  { title: "Club Policy 2025", url: "#", type: "PDF" },
  { title: "Spring Event Recap", url: "#", type: "Article" }
];

// Helpers
function engagementColor(val) {
  if (val >= 80) return "#1de682";
  if (val >= 70) return "#FFD700";
  return "#ff4848";
}
function trendIcon(history) {
  if (history[2] > history[1]) return <span style={{ color: "#1de682" }}>▲</span>;
  if (history[2] < history[1]) return <span style={{ color: "#ff4848" }}>▼</span>;
  return <span style={{ color: "#FFD700" }}>•</span>;
}
function sentimentLabel(sent) {
  if (sent > 0) return <span style={{ color: "#1de682" }}>Positive</span>;
  if (sent < 0) return <span style={{ color: "#ff4848" }}>Negative</span>;
  return <span style={{ color: "#FFD700" }}>Neutral</span>;
}
function riskAlert(p) {
  if (p.engagement < 70 || p.sentiment < 0) return <span style={{ color: "#ff4848" }}><FaExclamationTriangle /> At-Risk</span>;
  return <span style={{ color: "#1de682" }}><FaCheckCircle /> OK</span>;
}
function aiEngagementAdvice(p) {
  if (p.engagement < 70) return "Increase check-ins, assign mentor parent, offer 1:1 coach/parent meeting.";
  if (p.history[2] < p.history[1]) return "Slight drop—schedule group feedback or share new club resource.";
  if (p.super) return "Leverage as parent advocate; invite to club committee.";
  return "Maintain current engagement, monitor feedback.";
}

const ParentEngagementSuite = () => {
  const [parents, setParents] = useState(parentsInit);
  const [selected, setSelected] = useState(0);
  const [survey, setSurvey] = useState(surveyTemplates[0]);
  const [newQ, setNewQ] = useState("");
  const [touchpoints, setTouchpoints] = useState([
    { date: "2024-04-21", squad: "U14", type: "Workshop", by: "DoC", note: "Nutrition" },
    { date: "2024-05-02", squad: "U18", type: "1:1", by: "Coach", note: "Season goals" }
  ]);
  const [log, setLog] = useState([
    { date: "2024-05-02", parent: "Kovac", action: "Submitted feedback: nutrition" },
    { date: "2024-05-04", parent: "Horvat", action: "Raised issue with comms" }
  ]);
  const [resourceSearch, setResourceSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [addingQ, setAddingQ] = useState(false);

  // Add new survey question
  function addQuestion() {
    if (!newQ.trim()) return;
    setSurvey({ ...survey, questions: [...survey.questions, newQ.trim()] });
    setNewQ(""); setAddingQ(false);
  }
  // Export
  function exportBoard() {
    setExporting(true);
    setTimeout(() => {
      alert("PDF/CSV: Parent dashboard, risk map, timeline, feedback, touchpoints, leaderboard, resource log, AI interventions.");
      setExporting(false);
    }, 1200);
  }
  // Search resources
  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(resourceSearch.toLowerCase()));

  const parent = parents[selected];

  // Touchpoint Heatmap builder (squad by month, color by # events)
  const months = ["Mar", "Apr", "May"];
  function buildHeatmap() {
    // Demo: U14 = 3, U16 = 1, U18 = 2, Senior = 0
    return squads.map((sq, i) =>
      months.map((m, j) => ({
        count: (touchpoints.filter(t => t.squad === sq && t.date.slice(5, 7) === ("0" + (j + 3))).length)
      }))
    );
  }
  const heatmap = buildHeatmap();

  // Parent leaderboard
  const leaderboard = [...parents].sort((a, b) => b.engagement - a.engagement);

  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 36, maxWidth: 1640, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
        <FaUsers size={32} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>Parent Engagement Suite <span style={{ color: "#FFD70088", fontWeight: 600, fontSize: 17 }}>ELITE EDITION</span></h2>
        <span style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 10, padding: '8px 25px',
          fontSize: 17, marginLeft: 17
        }}>CourtEvo Vero</span>
        <button onClick={exportBoard} disabled={exporting} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900,
          fontSize: 17, padding: "9px 23px", marginLeft: 20
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> {exporting ? "Exporting..." : "Export PDF/CSV"}
        </button>
      </div>
      {/* Engagement dashboard */}
      <div style={{ margin: "20px 0 22px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}>Select Parent: </b>
        {parents.map((p, idx) =>
          <button key={p.name} onClick={() => setSelected(idx)}
            style={{
              background: selected === idx ? "#FFD700" : "#232a2e",
              color: selected === idx ? "#232a2e" : "#FFD700",
              fontWeight: 800, border: "none", borderRadius: 8, padding: "7px 13px", margin: 2, cursor: "pointer"
            }}>{p.name}</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 34, alignItems: "flex-start" }}>
        <div style={{
          background: "#FFD70022", borderRadius: 13, padding: "19px 15px", minWidth: 320, color: "#FFD700", fontWeight: 900, boxShadow: "0 2px 18px #FFD70033"
        }}>
          <div style={{ fontSize: 18 }}>{parent.name} ({parent.squad})</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Engagement:</b> <span style={{ color: engagementColor(parent.engagement), fontWeight: 800 }}>{parent.engagement}</span> {trendIcon(parent.history)}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Last Touchpoint:</b> {parent.lastTouch}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Feedback:</b> <i>{parent.feedback}</i></div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Sentiment:</b> {sentimentLabel(parent.sentiment)}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Risk:</b> {riskAlert(parent)}</div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}><b>Actions:</b>
            <ul style={{ color: "#FFD700" }}>{parent.actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>
          <div style={{ marginTop: 7, color: "#FFD70099" }}>
            <FaRobot style={{ marginRight: 5 }} /> <b>AI Engagement Advice:</b> {aiEngagementAdvice(parent)}
          </div>
          {parent.super && <div style={{ marginTop: 7, color: "#1de682" }}><FaTrophy /> Super-Engaged Parent (Potential Club Advocate)</div>}
        </div>
        {/* Timeline & touchpoint heatmap */}
        <div>
          <b style={{ color: "#FFD700", fontSize: 17 }}><FaCalendarAlt style={{ marginRight: 7 }} /> Engagement Timeline & Heatmap</b>
          <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
            <thead>
              <tr>
                <th>Squad</th>
                {months.map(m => <th key={m}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {squads.map((sq, i) => (
                <tr key={sq}>
                  <td>{sq}</td>
                  {months.map((m, j) => (
                    <td key={m} style={{
                      background: heatmap[i][j].count > 1 ? "#1de682" : heatmap[i][j].count === 1 ? "#FFD700" : "#ff4848",
                      color: "#232a2e", fontWeight: 900, borderRadius: 5
                    }}>{heatmap[i][j].count}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8, color: "#FFD70088" }}>
            Green = high touch, Yellow = some, Red = at-risk (no touch). Click for details.
          </div>
          <div style={{ marginTop: 15 }}>
            <b style={{ color: "#FFD700", fontSize: 16 }}>Touchpoint Log:</b>
            <ul style={{ color: "#FFD700", fontSize: 15 }}>
              {touchpoints.filter(tp => tp.squad === parent.squad).map((tp, i) =>
                <li key={i}>[{tp.date}] {tp.by} ({tp.type}) – {tp.note}</li>
              )}
            </ul>
          </div>
        </div>
        {/* Feedback/survey */}
        <div style={{
          minWidth: 330, background: "#232a2e", borderRadius: 12, padding: "13px 20px", color: "#FFD700", fontWeight: 900
        }}>
          <b><FaClipboardCheck style={{ marginRight: 6 }} /> Feedback Survey</b>
          <div style={{ marginTop: 8, color: "#FFD700", fontWeight: 800 }}>{survey.name}</div>
          <ul style={{ color: "#FFD700", fontSize: 15 }}>
            {survey.questions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
          {addingQ ? (
            <div>
              <input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Add question" style={{
                borderRadius: 6, border: "1.2px solid #FFD70077", fontSize: 13, padding: 2,
                background: "#fff", color: "#232a2e", width: 120, marginTop: 5
              }} />
              <button onClick={addQuestion} style={{
                background: "#1de682", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "3px 11px", marginLeft: 5
              }}>Add</button>
            </div>
          ) : (
            <button onClick={() => setAddingQ(true)} style={{
              background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "4px 13px", marginTop: 9
            }}>Add Question</button>
          )}
          <button onClick={() => alert("Survey sent to parents.")} style={{
            background: "#1de682", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "4px 13px", marginLeft: 8, marginTop: 9
          }}>Send Survey</button>
          <div style={{ marginTop: 14, color: "#FFD700", fontWeight: 800 }}>
            <FaRobot style={{ marginRight: 6 }} /> AI: Engagement impact if you run survey/workshop now = +14% retention (simulated).
          </div>
        </div>
        {/* Resource library */}
        <div style={{
          minWidth: 260, background: "#FFD70022", borderRadius: 12, padding: "13px 20px", color: "#FFD700", fontWeight: 900
        }}>
          <b><FaBookOpen style={{ marginRight: 7 }} /> Parent Resource Library</b>
          <input value={resourceSearch} onChange={e => setResourceSearch(e.target.value)} placeholder="Search resources" style={{
            borderRadius: 6, border: "1.2px solid #FFD70077", fontSize: 13, padding: 2,
            background: "#fff", color: "#232a2e", width: 120, marginTop: 5, marginBottom: 6
          }} />
          <ul style={{ color: "#FFD700", fontSize: 15 }}>
            {filteredResources.map((r, i) =>
              <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1de682", textDecoration: "underline" }}>{r.title}</a> <span style={{ fontSize: 13, color: "#FFD70099" }}>({r.type})</span></li>
            )}
          </ul>
        </div>
      </div>
      {/* Leaderboard */}
      <div style={{ marginTop: 24 }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}><FaTrophy style={{ marginRight: 7 }} /> Parent Engagement Leaderboard</b>
        <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 15, marginTop: 8 }}>
          <thead>
            <tr>
              <th>Parent</th><th>Squad</th><th>Engagement</th><th>Super</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((p, i) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.squad}</td>
                <td style={{ color: engagementColor(p.engagement) }}>{p.engagement}</td>
                <td>{p.super ? <FaTrophy style={{ color: "#FFD700" }} /> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 8, color: "#FFD70088" }}>Recognize, reward, and recruit super-engaged parents for club advocacy.</div>
      </div>
      {/* Boardroom action log */}
      <div style={{ marginTop: 21 }}>
        <b style={{ color: "#FFD700", fontSize: 16 }}><FaClipboardCheck style={{ marginRight: 6 }} /> Action/Alert Log (Boardroom/Federation Export)</b>
        <ul style={{ color: "#FFD700", fontSize: 15 }}>
          {log.map((l, i) =>
            <li key={i}>[{l.date}] {l.parent}: {l.action}</li>
          )}
        </ul>
      </div>
      <div style={{ marginTop: 19, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | Parent Engagement Suite – Elite Edition
      </div>
    </div>
  );
};

export default ParentEngagementSuite;
