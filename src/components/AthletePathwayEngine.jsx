import React, { useState } from "react";
import { FaChartLine, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";
import { kpiBenchmarksByStage } from "./kpiBenchmarksByStage"; // Make sure this is in same folder or adjust path

const GOLD = "#FFD700";
const GREEN = "#1de682";
const BLACK = "#181A1B";

const stages = [
  {
    key: "activeStart",
    label: "ACTIVE START",
    age: "0–6",
    focus: "Movement Foundation",
    color: GOLD,
    defaultGoals: ["Basic motor skills", "Coordination", "Fun & exploration"],
    defaultNotes: "Emphasis on play, creativity, and body awareness.",
    riskFlags: [],
  },
  {
    key: "fundamentals",
    label: "FUNdAMENTALS",
    age: "6–9",
    focus: "Physical Literacy, Joy",
    color: GREEN,
    defaultGoals: ["Develop ABCs", "Play-based games", "Social inclusion"],
    defaultNotes: "Build physical literacy through diverse games.",
    riskFlags: [],
  },
  {
    key: "learnToTrain",
    label: "LEARN TO TRAIN",
    age: "9–12",
    focus: "Skill Acquisition",
    color: GOLD,
    defaultGoals: [
      "Acquire basketball and multi-sport skills",
      "Early tactical awareness",
      "Intro to goal setting",
    ],
    defaultNotes: "Golden age of learning; broaden skill set.",
    riskFlags: [],
  },
  {
    key: "trainToTrain",
    label: "TRAIN TO TRAIN",
    age: "12–16",
    focus: "Skill Deepening, Adaptation",
    color: GREEN,
    defaultGoals: [
      "Refine technical skills",
      "Tactical growth",
      "Monitor growth spurts",
    ],
    defaultNotes: "Ensure practice > competition. Avoid burnout.",
    riskFlags: ["Sensitive period - PHV"],
  },
  {
    key: "trainToCompete",
    label: "TRAIN TO COMPETE",
    age: "16–18+",
    focus: "High Performance, Competition",
    color: GOLD,
    defaultGoals: [
      "Specialize roles",
      "Elite tactical/mental development",
      "Monitor workload",
    ],
    defaultNotes: "Individualize programs, monitor recovery, elevate standards.",
    riskFlags: ["High intensity - Monitor for overload"],
  },
  {
    key: "learnToWin",
    label: "LEARN TO WIN",
    age: "18–25",
    focus: "Performance Excellence",
    color: GREEN,
    defaultGoals: [
      "Elite performance integration",
      "Leadership/decision making",
      "Health management",
    ],
    defaultNotes: "Elite environment; high autonomy and responsibility.",
    riskFlags: [],
  },
  {
    key: "trainToWin",
    label: "TRAIN TO WIN",
    age: "25+",
    focus: "Mastery/Pro Transition",
    color: GOLD,
    defaultGoals: [
      "Peak performance",
      "Longevity",
      "Mentoring younger athletes",
    ],
    defaultNotes: "Continuous refinement; career management focus.",
    riskFlags: [],
  },
  {
    key: "activeForLife",
    label: "ACTIVE FOR LIFE",
    age: "Any",
    focus: "Lifelong Engagement",
    color: GREEN,
    defaultGoals: [
      "Stay active",
      "Community involvement",
      "Mentoring/coaching",
    ],
    defaultNotes: "Sustain well-being; contribute back to sport.",
    riskFlags: [],
  },
];

// Get correct stage key based on year of birth (demo logic)
const getStageByAge = (yearOfBirth) => {
  const age = new Date().getFullYear() - yearOfBirth;
  if (age <= 6) return "activeStart";
  if (age <= 9) return "fundamentals";
  if (age <= 12) return "learnToTrain";
  if (age <= 16) return "trainToTrain";
  if (age <= 18) return "trainToCompete";
  if (age <= 25) return "learnToWin";
  if (age > 25) return "trainToWin";
  return "activeForLife";
};

const defaultAthlete = {
  name: "Marko Testović",
  yob: 2009,
  club: "Demo Club",
  role: "Combo Forward",
};

const getStageConfig = (stageKey) => stages.find((s) => s.key === stageKey);

const getFilledKpiData = (stageKey) =>
  kpiBenchmarksByStage[stageKey].map((item) => ({
    ...item,
    Athlete: item.Benchmark,
  }));

export default function AthletePathwayEngine() {
  const [athletes, setAthletes] = useState([
    {
      ...defaultAthlete,
      currentStage: getStageByAge(defaultAthlete.yob),
      notes: getStageConfig(getStageByAge(defaultAthlete.yob)).defaultNotes,
      role: "Combo Forward",
      kpiData: getFilledKpiData(getStageByAge(defaultAthlete.yob)),
      riskFlags: getStageConfig(getStageByAge(defaultAthlete.yob)).riskFlags,
      goals: getStageConfig(getStageByAge(defaultAthlete.yob)).defaultGoals,
    },
  ]);
  const [selected, setSelected] = useState(0);

  // Add new athlete - always pre-fill with correct stage, KPIs, notes, flags, goals
  const handleAddAthlete = () => {
    const yob = 2010; // You can prompt the user for YOB, this is just demo
    const stageKey = getStageByAge(yob);
    setAthletes([
      ...athletes,
      {
        name: "",
        yob,
        club: "",
        role: "",
        currentStage: stageKey,
        notes: getStageConfig(stageKey).defaultNotes,
        kpiData: getFilledKpiData(stageKey),
        riskFlags: getStageConfig(stageKey).riskFlags,
        goals: getStageConfig(stageKey).defaultGoals,
      },
    ]);
    setSelected(athletes.length);
  };

  // Export to PDF/Print — placeholder
  const handleExport = () =>
    alert(
      "PDF/Print export is available in full CourtEvo Vero production build."
    );

  return (
    <div
      style={{
        background: `linear-gradient(120deg, ${BLACK} 60%, #283E51 100%)`,
        borderRadius: 32,
        padding: 38,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        margin: "32px auto",
        maxWidth: 1100,
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <FaChartLine color={GOLD} size={38} />
        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 32,
              letterSpacing: 2,
              color: GOLD,
              lineHeight: 1,
            }}
          >
            ATHLETE PATHWAY ENGINE
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#eee",
              marginTop: 6,
              fontStyle: "italic",
              letterSpacing: 1,
            }}
          >
            Elite CourtEvo Vero Development Model — BE REAL. BE VERO.
          </div>
        </div>
      </div>
      <hr style={{ border: "none", height: 2, background: GOLD, margin: "22px 0" }} />

      {/* ATHLETE SELECTOR */}
      <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
        <select
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          style={{
            fontWeight: 700,
            fontSize: 17,
            padding: "7px 16px",
            borderRadius: 10,
            border: `2px solid ${GOLD}`,
            color: BLACK,
          }}
        >
          {athletes.map((a, idx) => (
            <option value={idx} key={idx}>
              {a.name || "New Athlete"} ({a.yob})
            </option>
          ))}
        </select>
        <button
          onClick={handleAddAthlete}
          style={{
            background: GOLD,
            color: BLACK,
            fontWeight: 700,
            padding: "7px 20px",
            border: "none",
            borderRadius: 10,
            boxShadow: "0 1px 5px rgba(0,0,0,0.07)",
            cursor: "pointer",
          }}
        >
          + Add Athlete
        </button>
        <button
          onClick={handleExport}
          style={{
            background: BLACK,
            color: GOLD,
            border: `2px solid ${GOLD}`,
            fontWeight: 700,
            padding: "7px 20px",
            borderRadius: 10,
            marginLeft: "auto",
            cursor: "pointer",
          }}
        >
          Export to PDF/Print
        </button>
      </div>

      {/* MAIN VIEW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          alignItems: "start",
          marginTop: 18,
        }}
      >
        {/* Left: Pathway & Details */}
        <div>
          {/* Pathway Stages */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 6 }}>
              Pathway Stages
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {stages.map((stage) => (
                <div
                  key={stage.key}
                  style={{
                    background: stage.color,
                    color: BLACK,
                    fontWeight:
                      athletes[selected].currentStage === stage.key ? 900 : 700,
                    fontSize: 16,
                    padding: "10px 18px",
                    borderRadius: 14,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                    opacity:
                      athletes[selected].currentStage === stage.key ? 1 : 0.7,
                  }}
                >
                  {stage.label}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 4, fontSize: 15, color: "#bdbdbd" }}>
              Current Stage:{" "}
              <b style={{ color: GOLD }}>
                {
                  getStageConfig(athletes[selected].currentStage)
                    .label
                }
              </b>
            </div>
          </div>

          {/* Goals & Risk Flags */}
          <div style={{ margin: "22px 0" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#fff",
                marginBottom: 6,
              }}
            >
              Goals & Development Priorities
            </div>
            <ul>
              {athletes[selected].goals.map((g, idx) => (
                <li key={idx} style={{ color: GREEN, fontWeight: 600, fontSize: 15 }}>
                  {g}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 10 }}>
              <span
                style={{
                  color: "#ff4a4a",
                  fontWeight: 700,
                  fontSize: 15,
                  marginRight: 7,
                }}
              >
                {athletes[selected].riskFlags.length > 0 ? (
                  <FaExclamationTriangle style={{ marginRight: 5 }} />
                ) : (
                  <FaCheckCircle style={{ color: GREEN, marginRight: 5 }} />
                )}
                {athletes[selected].riskFlags.join(", ") || "No critical risks."}
              </span>
            </div>
          </div>

          {/* Progress Notes */}
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#fff",
                marginBottom: 6,
              }}
            >
              Progress Notes
            </div>
            <textarea
              value={athletes[selected].notes}
              onChange={(e) => {
                const nAthletes = [...athletes];
                nAthletes[selected].notes = e.target.value;
                setAthletes(nAthletes);
              }}
              style={{
                width: "100%",
                height: 80,
                padding: 12,
                fontSize: 15,
                borderRadius: 8,
                border: "2px solid #bbb",
                background: "#232b31",
                color: "#fff",
                marginBottom: 12,
              }}
            />
          </div>
        </div>

        {/* Right: KPI Radar & Role */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 6 }}>
            KPI Radar — Development Benchmark
          </div>
          <RadarChart
            cx={150}
            cy={120}
            outerRadius={100}
            width={320}
            height={240}
            data={athletes[selected].kpiData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="kpi" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Athlete"
              dataKey="Athlete"
              stroke={GOLD}
              fill={GOLD}
              fillOpacity={0.3}
            />
            <Radar
              name="Benchmark"
              dataKey="Benchmark"
              stroke={GREEN}
              fill={GREEN}
              fillOpacity={0.2}
            />
            <Tooltip />
          </RadarChart>

          <div style={{ margin: "16px 0", color: "#bbb" }}>
            <b style={{ color: GOLD }}>Role:</b> {athletes[selected].role}
          </div>
          <div style={{ color: "#bbb" }}>
            <b style={{ color: GOLD }}>Club:</b> {athletes[selected].club}
          </div>
          <div style={{ color: "#bbb" }}>
            <b style={{ color: GOLD }}>Year of Birth:</b> {athletes[selected].yob}
          </div>
        </div>
      </div>

      {/* BRANDED FOOTER */}
      <div
        style={{
          borderTop: `2px solid ${GOLD}`,
          paddingTop: 18,
          marginTop: 32,
          textAlign: "right",
          fontSize: 15,
          color: "#bdbdbd",
          letterSpacing: 1,
        }}
      >
        © {new Date().getFullYear()} CourtEvo Vero. BE REAL. BE VERO.
      </div>
    </div>
  );
}
