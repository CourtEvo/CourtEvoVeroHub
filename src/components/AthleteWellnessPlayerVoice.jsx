import React, { useState } from "react";
import { FaBrain, FaSmile, FaFrown, FaMeh, FaInfoCircle } from "react-icons/fa";

function Tooltip({ children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 8 }}>
      <FaInfoCircle
        color="#FFD700"
        style={{ cursor: "pointer", fontSize: 18, verticalAlign: "middle" }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div style={{
          position: "absolute",
          top: 24,
          left: -50,
          background: "#232a2e",
          color: "#fff",
          borderRadius: 8,
          padding: "16px 22px",
          width: 320,
          boxShadow: "0 4px 24px #FFD70044",
          fontSize: 15,
          zIndex: 99,
          pointerEvents: "none"
        }}>
          <strong>Why Player Voice?</strong><br />
          Empowering athletes to regularly share their feelings, ideas, and challenges leads to higher motivation, improved mental health, and better performance. This module enables structured, confidential check-ins and gives each player an active role in their own development.
        </div>
      )}
    </span>
  );
}

const moods = [
  { icon: <FaSmile color="#1de682" />, label: "Positive", value: "positive" },
  { icon: <FaMeh color="#FFD700" />, label: "Neutral", value: "neutral" },
  { icon: <FaFrown color="#e82e2e" />, label: "Negative", value: "negative" }
];

const sampleReports = [
  { date: "2025-06-10", mood: "positive", note: "Felt great at practice." },
  { date: "2025-06-11", mood: "neutral", note: "A bit tired, but ok." },
  { date: "2025-06-12", mood: "negative", note: "Struggling with school workload." }
];

export default function AthleteWellnessPlayerVoice() {
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [reports, setReports] = useState(sampleReports);

  const submitReport = () => {
    if (!selected) return;
    setReports([
      { date: new Date().toISOString().split("T")[0], mood: selected, note },
      ...reports
    ]);
    setSelected("");
    setNote("");
  };

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 12 }}>
        Athlete Wellness & Player Voice <Tooltip />
      </h2>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>
        How are you feeling today?
      </div>
      <div style={{ display: "flex", gap: 22, marginBottom: 10 }}>
        {moods.map(mood => (
          <button
            key={mood.value}
            onClick={() => setSelected(mood.value)}
            style={{
              background: selected === mood.value ? "#1de682" : "#232a2e",
              color: selected === mood.value ? "#222" : "#fff",
              border: selected === mood.value ? "2px solid #FFD700" : "2px solid #232a2e",
              borderRadius: 16,
              padding: "12px 26px",
              fontSize: 22,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {mood.icon}
            {mood.label}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={2}
        placeholder="Add a note (optional)..."
        style={{
          width: "100%",
          borderRadius: 8,
          border: "1.5px solid #444",
          fontSize: 15,
          padding: 8,
          background: "#232a2e",
          color: "#fff",
          marginBottom: 8
        }}
      />
      <br />
      <button
        onClick={submitReport}
        style={{
          marginTop: 6,
          background: "#FFD700",
          color: "#232a2e",
          fontWeight: 900,
          border: "none",
          borderRadius: 10,
          fontSize: 16,
          padding: "10px 28px",
          cursor: selected ? "pointer" : "not-allowed",
          opacity: selected ? 1 : 0.5
        }}
        disabled={!selected}
      >
        Submit
      </button>

      <div style={{ marginTop: 30 }}>
        <h3 style={{ color: "#1de682", marginBottom: 8 }}>Recent Check-Ins</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {reports.map((r, idx) => (
            <li key={idx} style={{
              background: "#21282c",
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 2px 10px #FFD70015"
            }}>
              <span>
                {moods.find(m => m.value === r.mood)?.icon}
              </span>
              <span style={{ fontWeight: 700, minWidth: 90 }}>{r.date}</span>
              <span style={{ fontStyle: "italic", color: "#FFD700" }}>
                {moods.find(m => m.value === r.mood)?.label}
              </span>
              <span style={{ color: "#fff" }}>{r.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
