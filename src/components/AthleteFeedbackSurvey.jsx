import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaSmile, FaFrown, FaUser, FaFileExport, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

// Demo: athlete roster
const ATHLETES = [
  { id: "a1", name: "Marko Horvat" },
  { id: "a2", name: "Luka Petrović" },
];

// Demo: initial survey results
const INIT_SURVEYS = [
  // { date, athlete, wellness, engagement, nps, feedback }
  { date: "2025-06-10", athlete: "Marko Horvat", wellness: 8, engagement: 9, nps: 9, feedback: "Enjoying training, but more shooting drills please." },
  { date: "2025-06-10", athlete: "Luka Petrović", wellness: 6, engagement: 7, nps: 7, feedback: "Great team, but too many double sessions." }
];

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const AthleteFeedbackSurvey = () => {
  const [athleteId, setAthleteId] = useState(ATHLETES[0].id);
  const [anonymous, setAnonymous] = useState(true);
  const [surveys, setSurveys] = useState(INIT_SURVEYS);
  const [form, setForm] = useState({ wellness: 8, engagement: 8, nps: 8, feedback: "" });
  const [sent, setSent] = useState(false);
  const sectionRef = useRef();

  // Export to PDF
  const handlePrint = useReactToPrint({
    content: () => sectionRef.current,
    documentTitle: `AthleteFeedback_${new Date().toISOString().slice(0, 10)}`
  });

  // Submit
  function handleSubmit(e) {
    e.preventDefault();
    const athleteName = anonymous ? "Anonymous" : ATHLETES.find(a => a.id === athleteId).name;
    setSurveys([
      ...surveys,
      {
        date: new Date().toISOString().slice(0, 10),
        athlete: athleteName,
        wellness: Number(form.wellness),
        engagement: Number(form.engagement),
        nps: Number(form.nps),
        feedback: form.feedback
      }
    ]);
    setSent(true);
    setTimeout(() => setSent(false), 2200);
    setForm({ wellness: 8, engagement: 8, nps: 8, feedback: "" });
  }

  // Analytics
  const avg = k =>
    surveys.length
      ? (surveys.reduce((s, a) => s + Number(a[k]), 0) / surveys.length).toFixed(1)
      : "-";
  const recent = surveys.slice(-5);
  const lowWellness = surveys.filter(s => s.wellness < 6).length;
  const lowEngagement = surveys.filter(s => s.engagement < 6).length;
  const lowNPS = surveys.filter(s => s.nps < 6).length;

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto" }}>
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
        <div style={{ fontSize: 25, color: "#FFD700", fontWeight: 700, marginBottom: 13, display: "flex", alignItems: "center", gap: 9 }}>
          <FaSmile /> Athlete Feedback & Survey
          <button onClick={handlePrint}
            style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: "none", borderRadius: 7, fontSize: 14, padding: "6px 15px", marginLeft: "auto" }}>
            <FaFileExport style={{ marginBottom: -2, marginRight: 6 }} /> Export PDF
          </button>
        </div>
        {/* Survey Form */}
        <form onSubmit={handleSubmit} style={{ background: "#232344", borderRadius: 15, padding: 18, marginBottom: 23 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 7 }}>
            <FaUser />
            <span style={{ fontWeight: 600, color: "#FFD700" }}>Athlete:</span>
            <select value={athleteId} onChange={e => setAthleteId(e.target.value)} disabled={anonymous}
              style={{ fontSize: 16, borderRadius: 5, padding: "3px 10px", fontWeight: 600 }}>
              {ATHLETES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <label style={{ marginLeft: 14, color: "#FFD700" }}>
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
                style={{ marginRight: 5 }} /> Submit as Anonymous
            </label>
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 7 }}>
            <label>Wellness (1-10): <input type="number" min={1} max={10} required value={form.wellness}
              onChange={e => setForm(f => ({ ...f, wellness: e.target.value }))} style={{ width: 45, borderRadius: 5 }} /></label>
            <label>Engagement (1-10): <input type="number" min={1} max={10} required value={form.engagement}
              onChange={e => setForm(f => ({ ...f, engagement: e.target.value }))} style={{ width: 45, borderRadius: 5 }} /></label>
            <label>NPS (0-10): <input type="number" min={0} max={10} required value={form.nps}
              onChange={e => setForm(f => ({ ...f, nps: e.target.value }))} style={{ width: 45, borderRadius: 5 }} /></label>
          </div>
          <div style={{ marginBottom: 7 }}>
            <textarea required rows={2} placeholder="Feedback..." value={form.feedback}
              onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))}
              style={{ width: "100%", borderRadius: 5, fontSize: 15, padding: 6 }} />
          </div>
          <button type="submit"
            style={{ background: "#27ef7d", color: "#222", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "6px 15px" }}>
            Send Feedback
          </button>
          {sent && (
            <span style={{ marginLeft: 19, color: "#27ef7d", fontWeight: 700, fontSize: 17, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <FaCheckCircle /> Sent!
            </span>
          )}
        </form>
        {/* Live Analytics */}
        <div style={{ background: "#232344", borderRadius: 15, padding: 18, marginBottom: 19 }}>
          <div style={{ fontWeight: 700, fontSize: 19, color: "#FFD700", marginBottom: 10 }}>Live Analytics & Alerts</div>
          <div style={{ display: "flex", gap: 30, marginBottom: 8 }}>
            <span>Avg Wellness: <b style={{ color: "#27ef7d" }}>{avg("wellness")}</b></span>
            <span>Avg Engagement: <b style={{ color: "#FFD700" }}>{avg("engagement")}</b></span>
            <span>Avg NPS: <b style={{ color: "#27ef7d" }}>{avg("nps")}</b></span>
          </div>
          <div style={{ fontWeight: 600, marginBottom: 9 }}>
            {lowWellness > 0 && (
              <span style={{ color: "#e94057", marginRight: 14 }}><FaExclamationTriangle /> {lowWellness} red flag(s) for wellness!</span>
            )}
            {lowEngagement > 0 && (
              <span style={{ color: "#FFD700", marginRight: 14 }}><FaExclamationTriangle /> {lowEngagement} yellow flag(s) for engagement!</span>
            )}
            {lowNPS > 0 && (
              <span style={{ color: "#e94057", marginRight: 14 }}><FaExclamationTriangle /> {lowNPS} red flag(s) for NPS!</span>
            )}
            {lowWellness === 0 && lowEngagement === 0 && lowNPS === 0 && (
              <span style={{ color: "#27ef7d" }}><FaCheckCircle /> All good. No risk trends!</span>
            )}
          </div>
          <div>
            <b>Recent Feedback:</b>
            <ul style={{ paddingLeft: 22 }}>
              {recent.slice().reverse().map((s, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  <span style={{ color: "#FFD700", fontWeight: 600 }}>{s.athlete}</span> ({s.date}):<br />
                  <span style={{ color: "#fff" }}>"{s.feedback}"</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AthleteFeedbackSurvey;
