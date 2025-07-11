// src/components/PhysicalLiteracyProgressionEngine.jsx

import React, { useState } from "react";
import {
  FaRunning,
  FaChild,
  FaChartLine,
  FaClipboardCheck,
  FaDownload,
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlayCircle,
  FaUser,
} from "react-icons/fa";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";

// Demo athlete data
const athletes = [
  {
    id: "ath-001",
    name: "Luka Vero",
    age: 10,
    cohort: "U10 Gold",
    scores: {
      coordination: 72,
      balance: 70,
      agility: 78,
      objectControl: 66,
      locomotor: 82,
      fitness: 65,
    },
    sparkline: [60, 62, 68, 72, 74, 77],
    nextSkill: "objectControl",
    coach: "Ivan Pro",
    atRisk: false,
  },
  {
    id: "ath-002",
    name: "Ivana Elite",
    age: 9,
    cohort: "U10 Gold",
    scores: {
      coordination: 64,
      balance: 60,
      agility: 61,
      objectControl: 55,
      locomotor: 68,
      fitness: 59,
    },
    sparkline: [54, 56, 59, 62, 63, 59],
    nextSkill: "fitness",
    coach: "Ivan Pro",
    atRisk: true,
  },
  // More demo athletes...
];

const domainLabels = {
  coordination: "Coordination",
  balance: "Balance",
  agility: "Agility",
  objectControl: "Object Ctrl",
  locomotor: "Locomotor",
  fitness: "Fitness",
};

const domainColors = {
  coordination: "#FFD700",
  balance: "#1de682",
  agility: "#63c2d1",
  objectControl: "#f77f00",
  locomotor: "#a37fc9",
  fitness: "#ff6b6b",
};

const skillsLibrary = {
  objectControl: {
    title: "Object Control",
    description: "Ball handling, dribbling, catching, passing.",
    videoUrl: "https://www.youtube.com/watch?v=8qPJ3uDo4b8", // Demo
    drills: ["Two-ball dribbling", "Catch on the move", "Passing relay"],
  },
  fitness: {
    title: "Fitness",
    description: "General endurance, basketball conditioning, core strength.",
    videoUrl: "https://www.youtube.com/watch?v=zrPZznE7jzo", // Demo
    drills: ["Cone shuttle runs", "Jump squats", "Core circuit"],
  },
  agility: {
    title: "Agility",
    description: "Quick feet, change of direction, acceleration.",
    videoUrl: "https://www.youtube.com/watch?v=5wU_gs9Jk9o", // Demo
    drills: ["Ladder runs", "Zig-zag cone sprints", "Mirror tag"],
  },
  // ...add more domains as needed
};

export default function PhysicalLiteracyProgressionEngine() {
  const [selectedAthlete, setSelectedAthlete] = useState(athletes[0]);
  const cohort = selectedAthlete?.cohort;
  const cohortAthletes = athletes.filter((a) => a.cohort === cohort);

  // Prepare data for RadarChart
  const radarData =
    selectedAthlete &&
    Object.entries(selectedAthlete.scores).map(([key, val]) => ({
      domain: domainLabels[key],
      value: val,
      fill: domainColors[key],
    }));

  // Skill prescription
  const nextSkill = selectedAthlete?.nextSkill;
  const skillBlock = nextSkill ? skillsLibrary[nextSkill] : null;

  // Cohort benchmark
  function cohortAvg(domain) {
    const vals = cohortAthletes.map((a) => a.scores[domain]);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  // Print/Export
  function handlePrint() {
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <FaRunning size={38} color="#FFD700" style={{ marginRight: 12 }} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: 1,
              marginBottom: 3,
              color: "#FFD700",
            }}
          >
            PHYSICAL LITERACY PROGRESSION ENGINE
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Holistic youth basketball development. Visible. Measurable. Elite.
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
          onClick={handlePrint}
        >
          <FaDownload style={{ marginRight: 7 }} />
          Export Board Report
        </button>
      </div>

      {/* Athlete/Cohort Selection */}
      <div style={{ display: "flex", gap: 26, marginBottom: 15 }}>
        <div>
          <label style={{ fontWeight: 700, color: "#FFD700" }}>Athlete:</label>
          <select
            value={selectedAthlete.id}
            onChange={(e) =>
              setSelectedAthlete(
                athletes.find((a) => a.id === e.target.value) || athletes[0]
              )
            }
            style={{
              borderRadius: 7,
              padding: "7px 12px",
              marginLeft: 10,
              fontSize: 16,
              fontFamily: "Segoe UI",
            }}
          >
            {athletes.map((ath) => (
              <option key={ath.id} value={ath.id}>
                {ath.name} ({ath.cohort})
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            fontWeight: 600,
            color: "#FFD700",
            fontSize: 17,
            marginTop: 3,
          }}
        >
          <FaUser style={{ marginRight: 7 }} />
          {selectedAthlete.name} • Age {selectedAthlete.age}
        </div>
        <div
          style={{
            color: "#1de682",
            fontWeight: 700,
            fontSize: 16,
            marginTop: 3,
          }}
        >
          <FaClipboardCheck style={{ marginRight: 7 }} />
          Coach: {selectedAthlete.coach}
        </div>
        {selectedAthlete.atRisk && (
          <div
            style={{
              marginLeft: 10,
              background: "#ff6b6b",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 14px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaExclamationTriangle style={{ marginRight: 7 }} />
            ALERT: At Risk
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Radar Chart Card */}
        <div
          style={{
            background: "#283E51",
            borderRadius: 24,
            padding: 18,
            minWidth: 380,
            maxWidth: 420,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#FFD700",
              fontSize: 17,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Physical Literacy Radar
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius={95}
              data={radarData}
              style={{ fontFamily: "Segoe UI" }}
            >
              <PolarGrid />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fill: "#FFD700", fontWeight: 600, fontSize: 15 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#fff", fontSize: 12 }}
              />
              <Radar
                name={selectedAthlete.name}
                dataKey="value"
                stroke="#FFD700"
                fill="#FFD700"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          {/* Sparkline Progress */}
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <FaChartLine color="#1de682" size={20} />
            <span
              style={{
                color: "#1de682",
                fontWeight: 700,
                fontSize: 15,
                marginRight: 7,
              }}
            >
              Progress:
            </span>
            <LineChart width={88} height={28} data={selectedAthlete.sparkline.map((y, i) => ({ x: i, y }))}>
              <Line
                type="monotone"
                dataKey="y"
                stroke="#FFD700"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
            <span style={{ color: "#FFD700", fontWeight: 700, marginLeft: 6 }}>
              {selectedAthlete.sparkline[selectedAthlete.sparkline.length - 1]}
            </span>
          </div>
        </div>

        {/* Skill Prescription & Assessment */}
        <div
          style={{
            background: "#1a1d20",
            borderRadius: 22,
            minWidth: 330,
            maxWidth: 410,
            padding: 28,
            boxShadow: "0 2px 12px 0 #121416",
          }}
        >
          <div
            style={{
              color: "#FFD700",
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 11,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaCheckCircle style={{ marginRight: 8 }} />
            Next Skill Prescription
          </div>
          {skillBlock ? (
            <>
              <div style={{ color: "#1de682", fontWeight: 600, fontSize: 15 }}>
                <FaStar style={{ marginRight: 7 }} />
                Focus: {skillBlock.title}
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: 15,
                  margin: "10px 0",
                  opacity: 0.82,
                }}
              >
                {skillBlock.description}
              </div>
              <div
                style={{
                  margin: "6px 0 10px 0",
                  color: "#FFD700",
                  fontWeight: 700,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaPlayCircle style={{ marginRight: 7 }} />
                <a
                  href={skillBlock.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#FFD700", textDecoration: "underline" }}
                >
                  Watch Demo Drill
                </a>
              </div>
              <div style={{ margin: "10px 0 6px 0", color: "#FFD700", fontWeight: 700 }}>
                Recommended Drills:
              </div>
              <ul style={{ color: "#fff", fontSize: 15, paddingLeft: 16 }}>
                {skillBlock.drills.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </>
          ) : (
            <div style={{ color: "#fff" }}>No skill prescription available.</div>
          )}
        </div>

        {/* Cohort Benchmark Table */}
        <div
          style={{
            background: "#232a2e",
            borderRadius: 18,
            padding: "22px 12px 8px 12px",
            minWidth: 260,
            maxWidth: 320,
            boxShadow: "0 2px 12px 0 #15171a",
          }}
        >
          <div
            style={{
              color: "#FFD700",
              fontWeight: 700,
              fontSize: 17,
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Cohort Benchmark ({cohort})
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#fff",
              fontSize: 14,
              fontFamily: "Segoe UI",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #485563" }}>
                <th style={{ textAlign: "left", padding: 4 }}>Domain</th>
                <th style={{ textAlign: "right", padding: 4 }}>Avg</th>
                <th style={{ textAlign: "right", padding: 4 }}>You</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(domainLabels).map((domain) => (
                <tr key={domain}>
                  <td style={{ color: domainColors[domain], fontWeight: 700 }}>
                    {domainLabels[domain]}
                  </td>
                  <td
                    style={{
                      color: "#FFD700",
                      fontWeight: 700,
                      textAlign: "right",
                    }}
                  >
                    {cohortAvg(domain)}
                  </td>
                  <td
                    style={{
                      color:
                        selectedAthlete.scores[domain] > cohortAvg(domain)
                          ? "#FFD700"
                          : selectedAthlete.scores[domain] === cohortAvg(domain)
                          ? "#1de682"
                          : "#ff6b6b",
                      fontWeight: 700,
                      textAlign: "right",
                    }}
                  >
                    {selectedAthlete.scores[domain]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        All visualizations, coach feedback, and skill recommendations are proprietary to CourtEvo Vero.
        Be Real. Be Vero.
      </div>
    </div>
  );
}
