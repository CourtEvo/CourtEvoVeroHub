// src/components/EliteTransitionCockpit.jsx

import React, { useState } from "react";
import {
  FaPlaneDeparture,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserTie,
  FaDownload,
  FaShareAlt,
  FaUserCheck,
  FaArrowRight,
  FaClipboardCheck,
  FaBullseye,
  FaCircle,
  FaBook,
  FaDumbbell,
  FaUserGraduate,
  FaHandshake,
  FaHeart,
} from "react-icons/fa";

// Data
const flights = [
  {
    id: "A001",
    name: "Ivan Markovic",
    current: "U18 Boys",
    target: "Seniors",
    status: "Boarding",
    markers: {
      academic: "ok",
    physical: "warn",
    lifestyle: "ok",
    professional: "fail",
    loyalty: "ok"
    },
    support: "",
    log: [],
    outcome: "",
  },
  {
    id: "A002",
    name: "Dino Ilic",
    current: "U16 Boys",
    target: "U18 Boys",
    status: "Ready",
    markers: {
      academic: "ok",
      physical: "ok",
      lifestyle: "ok",
      professional: "ok",
      loyalty: "ok"
    },
    support: "",
    log: [],
    outcome: "",
  },
  {
    id: "A003",
    name: "Luka Juric",
    current: "U18 Boys",
    target: "Seniors",
    status: "Delayed",
    markers: {
      academic: "fail",
      physical: "warn",
      lifestyle: "fail",
      professional: "warn",
      loyalty: "ok"
    },
    support: "",
    log: [],
    outcome: "",
  },
];

const markerLabels = {
  academic: "Education",
  physical: "Physical Readiness",
  lifestyle: "Lifestyle/Independence",
  professional: "Pro Orientation",
  loyalty: "Club Loyalty"
};

const markerIcons = {
  academic: <FaBook />,
  physical: <FaDumbbell />,
  lifestyle: <FaUserGraduate />,
  professional: <FaHandshake />,
  loyalty: <FaHeart />,
};

const directors = [
  "Technical Director",
  "Squad Coach",
  "Transition Coordinator",
  "Mentor Coach",
  "President",
];

// Utility
function markerColor(status) {
  switch (status) {
    case "ok": return "#1de682";
    case "warn": return "#FFD700";
    case "fail": return "#ff6b6b";
    default: return "#485563";
  }
}

function markerText(status) {
  switch (status) {
    case "ok": return "Complete";
    case "warn": return "Attention";
    case "fail": return "Incomplete";
    default: return "";
  }
}

function statusColor(status) {
  switch (status) {
    case "Ready": return "#1de682";
    case "Boarding": return "#FFD700";
    case "Delayed": return "#ff6b6b";
    default: return "#485563";
  }
}

function statusIcon(status) {
  switch (status) {
    case "Ready": return <FaPlaneDeparture />;
    case "Boarding": return <FaBullseye />;
    case "Delayed": return <FaExclamationTriangle />;
    default: return <FaCircle />;
  }
}

// AI suggestion
function aiSuggest(flight) {
  let missing = [];
  Object.entries(flight.markers).forEach(([k, v]) => {
    if (v === "fail") missing.push(markerLabels[k]);
    if (v === "warn") missing.push(markerLabels[k] + " (Needs Attention)");
  });
  if (!missing.length) return "All transition markers achieved.";
  return `Needs: ${missing.join(", ")}. Assign a support coach or director for immediate action.`;
}

export default function EliteTransitionCockpit() {
  const [selected, setSelected] = useState(flights[0]);
  const [assignments, setAssignments] = useState({});
  const [log, setLog] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  function assignSupport(flight, director) {
    setAssignments(a => ({ ...a, [flight.id]: director }));
    setLog(l => [
      ...l,
      {
        name: flight.name,
        director,
        date: new Date().toISOString().split("T")[0],
        action: "Support Assigned",
        status: flight.status,
      },
    ]);
    flight.support = director;
  }

  function markOutcome(flight, outcome) {
    setLog(l => [
      ...l,
      {
        name: flight.name,
        director: assignments[flight.id] || "-",
        date: new Date().toISOString().split("T")[0],
        action: outcome,
        status: flight.status,
      },
    ]);
    flight.outcome = outcome;
    setSelected(flight);
  }

  function exportReport() {
    window.print();
  }

  return (
    <div
      style={{
        background: "#232a2e",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
        borderRadius: "24px",
        padding: "38px 28px 18px 28px",
        boxShadow: "0 6px 32px 0 #1a1d20",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <FaPlaneDeparture size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            ELITE TRANSITION COCKPIT
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Boardroom flight deck for youth-to-senior success. Boys only.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={{
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            padding: "10px 18px",
            marginRight: 10,
            fontFamily: "Segoe UI",
            cursor: "pointer",
            boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={exportReport}
        >
          <FaDownload style={{ marginRight: 7 }} />
          Export Report
        </button>
        <button
          style={{
            background: "#1de682",
            color: "#232a2e",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            padding: "10px 18px",
            fontFamily: "Segoe UI",
            cursor: "pointer",
            boxShadow: "0 2px 12px 0 #2a2d31",
          }}
        >
          <FaShareAlt style={{ marginRight: 7 }} />
          Share
        </button>
      </div>

      <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        {/* Flight Deck */}
        <div style={{ minWidth: 360, maxWidth: 480, background: "#283E51", borderRadius: 24, padding: 26, boxShadow: "0 2px 12px 0 #15171a" }}>
          <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 9, fontSize: 18 }}>Transition Flight Deck</div>
          <table style={{ width: "100%", color: "#fff", fontSize: 15 }}>
            <thead>
              <tr>
                <th>Player</th>
                <th>Current</th>
                <th>Target</th>
                <th>Status</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              {flights.map(f =>
                <tr
                  key={f.id}
                  style={{ background: selected.id === f.id ? "#232a2e" : "transparent", cursor: "pointer" }}
                  onClick={() => setSelected(f)}
                >
                  <td style={{ color: "#FFD700", fontWeight: 700 }}>{f.name}</td>
                  <td>{f.current}</td>
                  <td>{f.target}</td>
                  <td style={{ color: statusColor(f.status), fontWeight: 700 }}>{statusIcon(f.status)} {f.status}</td>
                  <td style={{ color: "#1de682" }}>{assignments[f.id] || <span style={{ opacity: 0.6 }}>–</span>}</td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            style={{
              marginTop: 18, background: "#FFD700", color: "#232a2e",
              border: "none", borderRadius: 7, fontWeight: 700, padding: "6px 14px", fontSize: 15, cursor: "pointer"
            }}
            onClick={() => setShowHistory(h => !h)}
          >
            {showHistory ? "Hide" : "Show"} Outcomes & Departed
          </button>
          {showHistory &&
            <table style={{ width: "100%", marginTop: 8, background: "#232a2e", borderRadius: 7 }}>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Outcome</th>
                  <th>Director</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {log.filter(l => l.action === "Departed" || l.action === "Completed").map((l, i) => (
                  <tr key={i}>
                    <td style={{ color: "#FFD700" }}>{l.name}</td>
                    <td style={{ color: "#FFD700" }}>{l.action}</td>
                    <td>{l.director}</td>
                    <td>{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
        {/* Profile/Runway */}
        <div style={{ minWidth: 320, maxWidth: 420 }}>
          <div style={{ background: "#232a2e", borderRadius: 14, padding: "18px 20px 10px 18px", boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18 }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 7, fontSize: 17 }}>Flight Profile & Runway</div>
            <div style={{ marginBottom: 7 }}>
              <b style={{ color: "#FFD700" }}>{selected.name}</b> <br />
              <span style={{ fontSize: 14 }}>From <b>{selected.current}</b> to <b>{selected.target}</b></span>
            </div>
            {/* Visual Runway */}
            <div style={{ display: "flex", alignItems: "center", margin: "17px 0 16px 0" }}>
              <FaPlaneDeparture color={statusColor(selected.status)} size={22} style={{ marginRight: 10 }} />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {Object.entries(selected.markers).map(([k, v], idx) => (
                  <React.Fragment key={k}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        width: 34, height: 34,
                        borderRadius: 17,
                        background: markerColor(v),
                        color: "#232a2e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        fontSize: 17,
                        fontWeight: 700,
                        border: selected.status === "Delayed" && v === "fail" ? "2.5px solid #FFD700" : "2px solid #232a2e"
                      }}>
                        {markerIcons[k]}
                      </div>
                      <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 700 }}>{markerLabels[k]}</div>
                      <div style={{ fontSize: 11, color: markerColor(v), fontWeight: 700 }}>{markerText(v)}</div>
                    </div>
                    {idx < Object.keys(selected.markers).length - 1 && <FaArrowRight color="#FFD700" size={18} />}
                  </React.Fragment>
                ))}
              </div>
              <FaBullseye color={statusColor(selected.status)} size={22} style={{ marginLeft: 10 }} />
            </div>
            <div style={{ marginTop: 10, fontWeight: 700, color: statusColor(selected.status) }}>
              {statusIcon(selected.status)} {selected.status}
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: "#FFD700" }}>
              <b>AI Suggestion:</b> <span style={{ color: "#fff", fontWeight: 500 }}>{aiSuggest(selected)}</span>
            </div>
            {/* Support assignment */}
            <div style={{ marginTop: 13, fontWeight: 700, color: "#FFD700" }}>
              Assign Support Director/Coach
            </div>
            <select
              value={assignments[selected.id] || ""}
              onChange={e => assignSupport(selected, e.target.value)}
              style={{ borderRadius: 7, padding: "7px 12px", fontFamily: "Segoe UI", marginTop: 5, width: "97%" }}
            >
              <option value="">Select...</option>
              {directors.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {/* Outcome action */}
            <div style={{ marginTop: 11, fontWeight: 700, color: "#FFD700" }}>Mark Outcome:</div>
            <div>
              <button
                style={{
                  background: "#1de682", color: "#232a2e", borderRadius: 7,
                  padding: "6px 12px", fontWeight: 700, border: "none", marginTop: 8, marginRight: 7, cursor: "pointer"
                }}
                onClick={() => markOutcome(selected, "Completed")}
              >
                <FaCheckCircle style={{ marginRight: 6 }} />
                Cleared for Takeoff
              </button>
              <button
                style={{
                  background: "#ff6b6b", color: "#fff", borderRadius: 7,
                  padding: "6px 12px", fontWeight: 700, border: "none", marginTop: 8, cursor: "pointer"
                }}
                onClick={() => markOutcome(selected, "Departed")}
              >
                <FaExclamationTriangle style={{ marginRight: 6 }} />
                Departed / Not Progressed
              </button>
            </div>
          </div>
          {/* Log for selected */}
          <div style={{ background: "#283E51", borderRadius: 14, padding: "13px 16px 7px 16px", boxShadow: "0 2px 12px 0 #121416" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 5 }}>Support & Outcome Log</div>
            <table style={{ width: "100%", fontSize: 13, color: "#fff", marginBottom: 4 }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Director</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {log.filter(l => l.name === selected.name).map((l, i) => (
                  <tr key={i}>
                    <td>{l.date}</td>
                    <td>{l.action}</td>
                    <td>{l.director}</td>
                    <td>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 36,
          fontSize: 14,
          opacity: 0.7,
          textAlign: "center",
        }}
      >
        Proprietary to CourtEvo Vero. Elite transition tracking, real outcomes, boardroom accountability. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
