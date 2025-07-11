// /components/AthleteDashboard.jsx

import React, { useState } from "react";
import { FaChartLine, FaUserPlus, FaExclamationTriangle } from "react-icons/fa";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";
import { kpiBenchmarksByStage } from "./kpiBenchmarksByStage"; // Paste in or import as utility

const GOLD = "#FFD700";
const GREEN = "#1de682";
const BLACK = "#181A1B";
const STAGE_ORDER = [
  "activeStart",
  "fundamentals",
  "learnToTrain",
  "trainToTrain",
  "trainToCompete",
  "learnToWin",
  "trainToWin",
  "activeForLife",
];

const stages = [
  { key: "activeStart", label: "ACTIVE START" },
  { key: "fundamentals", label: "FUNdAMENTALS" },
  { key: "learnToTrain", label: "LEARN TO TRAIN" },
  { key: "trainToTrain", label: "TRAIN TO TRAIN" },
  { key: "trainToCompete", label: "TRAIN TO COMPETE" },
  { key: "learnToWin", label: "LEARN TO WIN" },
  { key: "trainToWin", label: "TRAIN TO WIN" },
  { key: "activeForLife", label: "ACTIVE FOR LIFE" },
];

// Helper: Detect LTAD stage by age
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

// DEMO DATA for a club cohort (auto-generating a few athletes across stages)
const defaultAthletes = [
  {
    name: "Marko Testović",
    yob: 2009,
    club: "Demo Club",
    role: "Combo Forward",
    kpi: { Technical: 76, Physical: 79, Cognitive: 64, Tactical: 57, Emotional: 60 },
    notes: "Growth spurt, skill learning excellent.",
    riskFlags: ["Sensitive period - PHV"],
  },
  {
    name: "Ivan Next",
    yob: 2012,
    club: "Demo Club",
    role: "Guard",
    kpi: { Technical: 54, Physical: 60, Cognitive: 42, Tactical: 28, Emotional: 51 },
    notes: "Needs more game play.",
    riskFlags: [],
  },
  {
    name: "Stjepan Talent",
    yob: 2006,
    club: "Demo Club",
    role: "Wing",
    kpi: { Technical: 83, Physical: 87, Cognitive: 72, Tactical: 74, Emotional: 79 },
    notes: "",
    riskFlags: [],
  },
  {
    name: "Ante Veteran",
    yob: 1998,
    club: "Demo Club",
    role: "Center",
    kpi: { Technical: 92, Physical: 93, Cognitive: 89, Tactical: 90, Emotional: 94 },
    notes: "Key leadership.",
    riskFlags: [],
  },
];

export default function AthleteDashboard({ onSelectAthlete }) {
  const [athletes, setAthletes] = useState(defaultAthletes);

  // Auto-fill for new athlete, with KPIs set by detected stage
  const handleAdd = () => {
    const yob = 2010; // Default, can be replaced with modal
    const stage = getStageByAge(yob);
    const kpiDefault = {};
    kpiBenchmarksByStage[stage].forEach((item) => (kpiDefault[item.kpi] = item.Benchmark));
    setAthletes([
      ...athletes,
      {
        name: "",
        yob,
        club: "",
        role: "",
        kpi: kpiDefault,
        notes: "",
        riskFlags: [],
      },
    ]);
  };

  // Cohort KPI averages
  const allKpis = ["Technical", "Physical", "Cognitive", "Tactical", "Emotional"];
  const kpiClubAvg = allKpis.map((k) => ({
    kpi: k,
    Club: (
      athletes.reduce((sum, a) => sum + (a.kpi[k] || 0), 0) / athletes.length
    ).toFixed(1),
    Benchmark: (
      athletes.reduce(
        (sum, a) =>
          sum +
          (kpiBenchmarksByStage[getStageByAge(a.yob)].find((x) => x.kpi === k)
            ?.Benchmark || 0),
        0
      ) / athletes.length
    ).toFixed(1),
  }));

  // Distribution: count by stage
  const stageDist = {};
  stages.forEach((s) => (stageDist[s.key] = 0));
  athletes.forEach((a) => {
    const s = getStageByAge(a.yob);
    stageDist[s]++;
  });

  // Risks
  const riskFeed = athletes
    .map((a, i) =>
      a.riskFlags.length > 0
        ? {
            name: a.name || `New Athlete ${i + 1}`,
            riskFlags: a.riskFlags,
            stage: getStageByAge(a.yob),
          }
        : null
    )
    .filter(Boolean);

  // UI
  return (
    <div
      style={{
        background: `linear-gradient(120deg, ${BLACK} 65%, #283E51 100%)`,
        borderRadius: 32,
        padding: 34,
        boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
        margin: "32px auto",
        maxWidth: 1200,
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <FaChartLine color={GOLD} size={34} />
        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 29,
              letterSpacing: 2,
              color: GOLD,
              lineHeight: 1,
            }}
          >
            ATHLETE DEVELOPMENT DASHBOARD
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#eee",
              marginTop: 6,
              fontStyle: "italic",
              letterSpacing: 1,
            }}
          >
            Full Club Cohort View — CourtEvo Vero
          </div>
        </div>
      </div>
      <hr style={{ border: "none", height: 2, background: GOLD, margin: "20px 0" }} />

      {/* STAGE DISTRIBUTION CHART */}
      <div style={{ display: "flex", gap: 24, alignItems: "start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>
            Stage Distribution
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {stages.map((s) => (
              <div
                key={s.key}
                style={{
                  flex: 1,
                  background: GOLD,
                  color: BLACK,
                  marginRight: 6,
                  borderRadius: 10,
                  textAlign: "center",
                  padding: 5,
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: stageDist[s.key] > 0 ? 1 : 0.32,
                }}
              >
                {s.label} <br />
                <span style={{ fontSize: 17 }}>{stageDist[s.key]}</span>
              </div>
            ))}
          </div>
        </div>
        {/* CLUB KPI RADAR */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 7 }}>
            Club KPI Benchmark
          </div>
          <RadarChart
            cx={110}
            cy={100}
            outerRadius={70}
            width={230}
            height={190}
            data={kpiClubAvg}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="kpi" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Club"
              dataKey="Club"
              stroke={GOLD}
              fill={GOLD}
              fillOpacity={0.3}
            />
            <Radar
              name="Benchmark"
              dataKey="Benchmark"
              stroke={GREEN}
              fill={GREEN}
              fillOpacity={0.19}
            />
            <Tooltip />
          </RadarChart>
        </div>
      </div>

      {/* RISK FEED */}
      {riskFeed.length > 0 && (
        <div style={{ margin: "22px 0 0 0" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: "#fff",
              marginBottom: 7,
            }}
          >
            Attention Required
          </div>
          {riskFeed.map((r, i) => (
            <div
              key={i}
              style={{
                background: "#ff2626",
                color: "#fff",
                borderRadius: 8,
                padding: "7px 16px",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                fontWeight: 700,
              }}
            >
              <FaExclamationTriangle style={{ marginRight: 7 }} />
              {r.name} — {stages.find((s) => s.key === r.stage)?.label}:{" "}
              <span style={{ marginLeft: 10 }}>{r.riskFlags.join(", ")}</span>
            </div>
          ))}
        </div>
      )}

      {/* COHORT TABLE */}
      <div style={{ marginTop: 30 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 17,
            color: "#fff",
            marginBottom: 9,
          }}
        >
          Athlete Cohort Overview
        </div>
        <table
          style={{
            width: "100%",
            background: "#181A1B",
            borderRadius: 14,
            overflow: "hidden",
            color: "#fff",
            fontSize: 15,
          }}
        >
          <thead>
            <tr style={{ background: "#222", color: GOLD }}>
              <th>Name</th>
              <th>Age</th>
              <th>Stage</th>
              <th>Role</th>
              <th>Technical</th>
              <th>Physical</th>
              <th>Cognitive</th>
              <th>Tactical</th>
              <th>Emotional</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((a, idx) => (
              <tr
                key={idx}
                style={{
                  background: idx % 2 === 0 ? "#232b31" : "#181A1B",
                  cursor: "pointer",
                }}
                onClick={() =>
                  onSelectAthlete && onSelectAthlete(idx)
                }
              >
                <td>{a.name || <i>New Athlete</i>}</td>
                <td>{new Date().getFullYear() - a.yob}</td>
                <td>
                  {stages.find((s) => s.key === getStageByAge(a.yob))?.label}
                </td>
                <td>{a.role}</td>
                <td>{a.kpi.Technical}</td>
                <td>{a.kpi.Physical}</td>
                <td>{a.kpi.Cognitive}</td>
                <td>{a.kpi.Tactical}</td>
                <td>{a.kpi.Emotional}</td>
                <td>
                  {a.riskFlags.length > 0 ? (
                    <FaExclamationTriangle color="#ff2626" />
                  ) : (
                    <span style={{ color: GREEN }}>✔</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={handleAdd}
          style={{
            marginTop: 18,
            background: GOLD,
            color: BLACK,
            fontWeight: 700,
            fontSize: 16,
            padding: "8px 30px",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            float: "right",
          }}
        >
          <FaUserPlus style={{ marginRight: 6 }} />
          Add Athlete (auto-stage)
        </button>
      </div>

      {/* FOOTER */}
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
