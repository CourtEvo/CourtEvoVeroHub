import React, { useState } from "react";
import { FaChalkboardTeacher, FaPen, FaBook, FaUserFriends, FaInfoCircle } from "react-icons/fa";

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
          left: -60,
          background: "#232a2e",
          color: "#fff",
          borderRadius: 8,
          padding: "16px 22px",
          width: 340,
          boxShadow: "0 4px 24px #FFD70044",
          fontSize: 15,
          zIndex: 99,
          pointerEvents: "none"
        }}>
          <strong>Why a Coach Reflection Diary?</strong><br />
          Modern standards require continuous coach learning, reflection, and feedback. This module enables coaches to self-reflect after each session, log new learning, and request or give peer feedback—creating a culture of growth and quality coaching.
        </div>
      )}
    </span>
  );
}

const demoReflections = [
  {
    date: "2025-06-13",
    reflection: "Session went well. U14s engaged in new 1-on-1 drill.",
    lesson: "Next time, introduce constraint earlier.",
    peerFeedback: "Coach Ana: 'Loved the energy! Consider more recovery breaks.'"
  },
  {
    date: "2025-06-10",
    reflection: "Struggled to get full focus during transition drill.",
    lesson: "Use visual cues for transitions.",
    peerFeedback: "Coach Mark: 'Maybe split groups smaller?'"
  }
];

export default function CoachReflectionDiary() {
  const [reflection, setReflection] = useState("");
  const [lesson, setLesson] = useState("");
  const [peerFeedback, setPeerFeedback] = useState("");
  const [entries, setEntries] = useState(demoReflections);

  const submit = () => {
    if (!reflection) return;
    setEntries([
      {
        date: new Date().toISOString().split("T")[0],
        reflection,
        lesson,
        peerFeedback
      },
      ...entries
    ]);
    setReflection("");
    setLesson("");
    setPeerFeedback("");
  };

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 12 }}>
        Coach Reflection Diary & Peer Review <Tooltip />
      </h2>
      <div style={{
        background: "#232a2e",
        borderRadius: 18,
        padding: "24px 24px 14px 24px",
        boxShadow: "0 2px 22px #FFD70015",
        marginBottom: 24
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>
          Log Today’s Session Reflection
        </div>
        <textarea
          placeholder="What went well? What challenged you?"
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          rows={2}
          style={{
            width: "100%",
            borderRadius: 8,
            border: "1.5px solid #444",
            fontSize: 15,
            padding: 8,
            background: "#21282c",
            color: "#fff",
            marginBottom: 10
          }}
        />
        <textarea
          placeholder="What will you do differently next time?"
          value={lesson}
          onChange={e => setLesson(e.target.value)}
          rows={2}
          style={{
            width: "100%",
            borderRadius: 8,
            border: "1.5px solid #444",
            fontSize: 15,
            padding: 8,
            background: "#21282c",
            color: "#fff",
            marginBottom: 10
          }}
        />
        <textarea
          placeholder="(Optional) Peer feedback: Enter comment or request feedback from another coach"
          value={peerFeedback}
          onChange={e => setPeerFeedback(e.target.value)}
          rows={2}
          style={{
            width: "100%",
            borderRadius: 8,
            border: "1.5px solid #444",
            fontSize: 15,
            padding: 8,
            background: "#21282c",
            color: "#fff",
            marginBottom: 10
          }}
        />
        <button
          onClick={submit}
          style={{
            background: "#FFD700",
            color: "#232a2e",
            fontWeight: 900,
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            padding: "10px 28px",
            cursor: reflection ? "pointer" : "not-allowed",
            opacity: reflection ? 1 : 0.5
          }}
          disabled={!reflection}
        >
          Submit
        </button>
      </div>
      <h3 style={{ color: "#1de682", marginBottom: 10, marginTop: 18 }}>Recent Reflections & Peer Feedback</h3>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {entries.map((entry, idx) => (
          <li key={idx} style={{
            background: "#21282c",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            boxShadow: "0 2px 10px #FFD70013"
          }}>
            <div style={{ fontWeight: 700, color: "#FFD700" }}>
              <FaBook style={{ marginRight: 7, fontSize: 17, verticalAlign: -3 }} />
              {entry.date}
            </div>
            <div><FaPen style={{ marginRight: 6 }} /> <b>Reflection:</b> {entry.reflection}</div>
            {entry.lesson && <div><b>Lesson:</b> {entry.lesson}</div>}
            {entry.peerFeedback && (
              <div style={{ color: "#1de682" }}>
                <FaUserFriends style={{ marginRight: 6 }} />
                <b>Peer Feedback:</b> {entry.peerFeedback}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
