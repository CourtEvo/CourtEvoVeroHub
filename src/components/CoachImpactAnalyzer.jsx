import React, { useState } from "react";
import { FaUserTie, FaStar, FaArrowUp, FaArrowDown, FaCheckCircle, FaExclamationTriangle, FaEdit } from "react-icons/fa";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";

const GOLD = "#FFD700";
const GREEN = "#1de682";
const BLACK = "#181A1B";

// ---- Editable Role Benchmarks (by role/stage, can expand with more roles)
const defaultBenchmarks = {
  U12: { Technical: 65, Tactical: 60, Relational: 68, Development: 65, Leadership: 64 },
  U15: { Technical: 80, Tactical: 78, Relational: 74, Development: 80, Leadership: 76 },
  U18: { Technical: 88, Tactical: 84, Relational: 80, Development: 88, Leadership: 82 },
  Senior: { Technical: 92, Tactical: 88, Relational: 85, Development: 91, Leadership: 89 },
};

// --- DEMO ATHLETES (would ideally be global/app-level or imported from dashboard)
const demoAthletes = [
  { name: "Luka Vuković", coach: "Ivan Krstović", Technical: 82, Physical: 80, Cognitive: 78, Tactical: 75, Emotional: 72, riskFlags: [] },
  { name: "Mateo Ivanković", coach: "Ivan Krstović", Technical: 77, Physical: 79, Cognitive: 80, Tactical: 81, Emotional: 76, riskFlags: [] },
  { name: "Domagoj Sertić", coach: "Marko Budiša", Technical: 58, Physical: 60, Cognitive: 65, Tactical: 60, Emotional: 57, riskFlags: ["Underperforming"] },
  { name: "Ivan Kovačević", coach: "Ante Šimić", Technical: 90, Physical: 91, Cognitive: 85, Tactical: 90, Emotional: 88, riskFlags: [] },
];

// --- DEMO COACHES
const defaultCoaches = [
  {
    name: "Ivan Krstović",
    role: "U15",
    yearsWithClub: 7,
    certifications: ["FIBA Youth License", "First Aid"],
    impactKPI: { Technical: 84, Tactical: 81, Relational: 78, Development: 89, Leadership: 80 },
    feedback: { athlete: { avg: 4.8, trend: "up" }, parent: { avg: 4.6, trend: "up" }, board: { avg: 4.5, trend: "same" } },
    elite: true,
    notes: "Consistent positive feedback, elite development outcomes.",
    boardGoals: ["Mentor new coaches", "Pilot new skills framework"],
    riskFlags: [],
  },
  {
    name: "Marko Budiša",
    role: "U12",
    yearsWithClub: 3,
    certifications: ["FIBA Youth License"],
    impactKPI: { Technical: 72, Tactical: 70, Relational: 68, Development: 77, Leadership: 70 },
    feedback: { athlete: { avg: 4.0, trend: "down" }, parent: { avg: 3.7, trend: "down" }, board: { avg: 3.9, trend: "down" } },
    elite: false,
    notes: "Needs upskilling in tactical delivery. Feedback down this term.",
    boardGoals: ["Complete advanced tactical module", "Increase parent engagement"],
    riskFlags: ["Feedback drop"],
  },
  {
    name: "Ante Šimić",
    role: "U18",
    yearsWithClub: 12,
    certifications: ["FIBA Senior License", "Master Coach"],
    impactKPI: { Technical: 88, Tactical: 85, Relational: 82, Development: 92, Leadership: 86 },
    feedback: { athlete: { avg: 4.9, trend: "up" }, parent: { avg: 4.7, trend: "up" }, board: { avg: 4.8, trend: "up" } },
    elite: true,
    notes: "Senior mentor, board level leadership.",
    boardGoals: ["Lead club-wide coach workshops"],
    riskFlags: [],
  },
];

function FeedbackTrend({ trend }) {
  if (trend === "up") return <FaArrowUp color={GREEN} style={{ marginLeft: 4 }} />;
  if (trend === "down") return <FaArrowDown color="#ff5252" style={{ marginLeft: 4 }} />;
  return null;
}

export default function CoachImpactAnalyzer() {
  // State: editable
  const [coaches, setCoaches] = useState(defaultCoaches);
  const [selected, setSelected] = useState(0);
  const [benchmarks, setBenchmarks] = useState(defaultBenchmarks);
  const [athletes, setAthletes] = useState(demoAthletes);

  // Edit KPI
  const handleKPIEdit = (coachIdx, kpiKey, value) => {
    setCoaches(prev =>
      prev.map((c, idx) =>
        idx === coachIdx
          ? { ...c, impactKPI: { ...c.impactKPI, [kpiKey]: Number(value) } }
          : c
      )
    );
  };

  // Edit coach notes
  const handleNoteEdit = (coachIdx, value) => {
    setCoaches(prev =>
      prev.map((c, idx) =>
        idx === coachIdx ? { ...c, notes: value } : c
      )
    );
  };

  // Edit coach goals
  const handleGoalEdit = (coachIdx, goalIdx, value) => {
    setCoaches(prev =>
      prev.map((c, idx) =>
        idx === coachIdx
          ? {
              ...c,
              boardGoals: c.boardGoals.map((g, gi) => (gi === goalIdx ? value : g)),
            }
          : c
      )
    );
  };

  // Edit role benchmarks
  const handleBenchmarkEdit = (role, kpiKey, value) => {
    setBenchmarks(prev => ({
      ...prev,
      [role]: { ...prev[role], [kpiKey]: Number(value) },
    }));
  };

  // Assign athletes (bi-directional: edit coach for athlete)
  const handleAssignCoach = (athleteIdx, coachName) => {
    setAthletes(prev =>
      prev.map((a, idx) => (idx === athleteIdx ? { ...a, coach: coachName } : a))
    );
  };

  // For the selected coach
  const coach = coaches[selected];
  const cohortAthletes = athletes.filter(a => a.coach === coach.name);
  const cohortKpiAvg = {
    Technical: cohortAthletes.length
      ? Math.round(cohortAthletes.reduce((s, a) => s + a.Technical, 0) / cohortAthletes.length)
      : 0,
    Tactical: cohortAthletes.length
      ? Math.round(cohortAthletes.reduce((s, a) => s + a.Tactical, 0) / cohortAthletes.length)
      : 0,
    Relational: cohortAthletes.length
      ? Math.round(
          cohortAthletes.reduce((s, a) => s + (a.Cognitive || a.Relational || 0), 0) / cohortAthletes.length
        )
      : 0,
    Development: cohortAthletes.length
      ? Math.round(
          cohortAthletes.reduce((s, a) => s + (a.Physical || a.Development || 0), 0) / cohortAthletes.length
        )
      : 0,
    Leadership: cohortAthletes.length
      ? Math.round(
          cohortAthletes.reduce((s, a) => s + (a.Emotional || a.Leadership || 0), 0) / cohortAthletes.length
        )
      : 0,
  };

  // Risk summary from cohort
  const cohortRisks = cohortAthletes.filter(a => a.riskFlags && a.riskFlags.length > 0);

  // Export (placeholder)
  const handleExport = () =>
    alert("Boardroom PDF export is available in full CourtEvo Vero build.");

  return (
    <div
      style={{
        background: `linear-gradient(120deg, ${BLACK} 62%, #283E51 100%)`,
        borderRadius: 32,
        padding: 38,
        boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
        margin: "32px auto",
        maxWidth: 1200,
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <FaUserTie color={GOLD} size={38} />
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
            COACH IMPACT ANALYZER
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
            Editable, Linked Coach ↔ Athlete Analytics — CourtEvo Vero
          </div>
        </div>
      </div>
      <hr style={{ border: "none", height: 2, background: GOLD, margin: "22px 0" }} />

      {/* COACH TABLE */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 10 }}>
          Coach Portfolio (Edit KPIs, click to select)
        </div>
        <table
          style={{
            width: "100%",
            background: "#181A1B",
            borderRadius: 14,
            overflow: "hidden",
            color: "#fff",
            fontSize: 15,
            marginBottom: 12,
          }}
        >
          <thead>
            <tr style={{ background: "#232b31", color: GOLD }}>
              <th>Name</th>
              <th>Role</th>
              <th>Years</th>
              <th>Certifications</th>
              <th>Technical</th>
              <th>Tactical</th>
              <th>Development</th>
              <th>Relational</th>
              <th>Leadership</th>
              <th>Feedback</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((c, idx) => (
              <tr
                key={idx}
                style={{
                  background: idx === selected ? "#273140" : idx % 2 === 0 ? "#222" : "#181A1B",
                  cursor: "pointer",
                  fontWeight: idx === selected ? 700 : 400,
                  borderLeft: c.elite ? `6px solid ${GOLD}` : undefined,
                }}
                onClick={() => setSelected(idx)}
              >
                <td>{c.name}</td>
                <td>{c.role}</td>
                <td style={{ textAlign: "center" }}>{c.yearsWithClub}</td>
                <td>{c.certifications.join(", ")}</td>
                <td>
                  <input
                    type="number"
                    value={c.impactKPI.Technical}
                    min={0}
                    max={100}
                    style={{ width: 44, borderRadius: 7, border: "1px solid #bbb", padding: 3 }}
                    onChange={e => handleKPIEdit(idx, "Technical", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={c.impactKPI.Tactical}
                    min={0}
                    max={100}
                    style={{ width: 44, borderRadius: 7, border: "1px solid #bbb", padding: 3 }}
                    onChange={e => handleKPIEdit(idx, "Tactical", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={c.impactKPI.Development}
                    min={0}
                    max={100}
                    style={{ width: 44, borderRadius: 7, border: "1px solid #bbb", padding: 3 }}
                    onChange={e => handleKPIEdit(idx, "Development", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={c.impactKPI.Relational}
                    min={0}
                    max={100}
                    style={{ width: 44, borderRadius: 7, border: "1px solid #bbb", padding: 3 }}
                    onChange={e => handleKPIEdit(idx, "Relational", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={c.impactKPI.Leadership}
                    min={0}
                    max={100}
                    style={{ width: 44, borderRadius: 7, border: "1px solid #bbb", padding: 3 }}
                    onChange={e => handleKPIEdit(idx, "Leadership", e.target.value)}
                  />
                </td>
                <td>
                  <FaStar color={GOLD} style={{ marginRight: 2 }} />
                  {(
                    (c.feedback.athlete.avg +
                      c.feedback.parent.avg +
                      c.feedback.board.avg) /
                    3
                  ).toFixed(1)}
                </td>
                <td>
                  {c.elite ? (
                    <span style={{ color: GOLD, fontWeight: 800 }}>
                      <FaCheckCircle style={{ marginRight: 3 }} />
                      Elite
                    </span>
                  ) : c.riskFlags.length > 0 ? (
                    <span style={{ color: "#ff2626", fontWeight: 800 }}>
                      <FaExclamationTriangle style={{ marginRight: 3 }} />
                      Upskill
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COACH ROLE BENCHMARKS (EDITABLE) */}
      <div style={{ margin: "0 0 22px 0" }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 5 }}>
          Editable Benchmarks per Role/Stage
        </div>
        <table
          style={{
            width: "100%",
            background: "#232b31",
            borderRadius: 11,
            color: "#fff",
            fontSize: 14,
            marginBottom: 6,
          }}
        >
          <thead>
            <tr style={{ color: GOLD }}>
              <th>Role</th>
              <th>Technical</th>
              <th>Tactical</th>
              <th>Development</th>
              <th>Relational</th>
              <th>Leadership</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(benchmarks).map((role, idx) => (
              <tr key={role}>
                <td>{role}</td>
                {["Technical", "Tactical", "Development", "Relational", "Leadership"].map((k) => (
                  <td key={k}>
                    <input
                      type="number"
                      value={benchmarks[role][k]}
                      min={0}
                      max={100}
                      style={{ width: 44, borderRadius: 7, border: "1px solid #bbb", padding: 3 }}
                      onChange={e => handleBenchmarkEdit(role, k, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ color: "#bdbdbd", fontSize: 13 }}>
          Benchmarks update radar comparisons instantly.
        </div>
      </div>

      {/* SELECTED COACH DRILLDOWN + ANALYTICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 32,
          alignItems: "start",
          marginBottom: 22,
        }}
      >
        {/* Left: Coach Profile + Edit */}
        <div style={{ background: "#232b31", borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <FaUserTie color={GOLD} size={34} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 22, color: GOLD }}>
                {coach.name}
              </div>
              <div style={{ fontWeight: 700, color: "#aaa" }}>
                {coach.role} | {coach.yearsWithClub} years
              </div>
            </div>
          </div>
          <div style={{ margin: "10px 0 2px 0", color: "#bbb" }}>
            <b>Certifications:</b> {coach.certifications.join(", ")}
          </div>
          <div style={{ marginBottom: 8, color: "#bbb" }}>
            <b>Notes:</b>{" "}
            <textarea
              value={coach.notes}
              onChange={e => handleNoteEdit(selected, e.target.value)}
              style={{ width: "100%", height: 46, borderRadius: 7, border: "1px solid #bbb", background: "#1a2229", color: "#fff", padding: 7, fontSize: 15 }}
            />
          </div>
          <div>
            <b>Board/Club Goals:</b>
            <ul>
              {coach.boardGoals.map((g, i) => (
                <li key={i} style={{ color: GREEN }}>
                  <input
                    type="text"
                    value={g}
                    onChange={e => handleGoalEdit(selected, i, e.target.value)}
                    style={{ borderRadius: 6, border: "1px solid #bbb", background: "#1a2229", color: "#fff", padding: 3, marginLeft: 0, fontSize: 15, width: "90%" }}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 7 }}>
            <b>Risk/Alert:</b>{" "}
            {coach.riskFlags.length > 0 ? (
              <span style={{ color: "#ff2626", fontWeight: 700 }}>
                <FaExclamationTriangle style={{ marginRight: 3 }} />
                {coach.riskFlags.join(", ")}
              </span>
            ) : (
              <span style={{ color: GREEN, fontWeight: 700 }}>
                <FaCheckCircle style={{ marginRight: 3 }} />
                No major risks
              </span>
            )}
          </div>
        </div>

        {/* Right: Radar & Feedback */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 7 }}>
            Impact Radar (Coach, Cohort, Benchmark)
          </div>
          <RadarChart
            cx={120}
            cy={100}
            outerRadius={70}
            width={250}
            height={200}
            data={["Technical", "Tactical", "Development", "Relational", "Leadership"].map((k) => ({
              kpi: k,
              Coach: coach.impactKPI[k],
              Cohort: cohortKpiAvg[k],
              Benchmark: benchmarks[coach.role]?.[k] || 80,
            }))}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="kpi" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Coach"
              dataKey="Coach"
              stroke={GOLD}
              fill={GOLD}
              fillOpacity={0.26}
            />
            <Radar
              name="Cohort"
              dataKey="Cohort"
              stroke={GREEN}
              fill={GREEN}
              fillOpacity={0.13}
            />
            <Radar
              name="Benchmark"
              dataKey="Benchmark"
              stroke="#aaa"
              fill="#aaa"
              fillOpacity={0.11}
            />
            <Tooltip />
          </RadarChart>

          {/* Feedback Card */}
          <div
            style={{
              marginTop: 18,
              background: "#181A1B",
              borderRadius: 12,
              padding: "10px 18px",
              color: "#fff",
              boxShadow: "0 1px 7px rgba(0,0,0,0.07)",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            <div style={{ marginBottom: 6, color: GOLD }}>Anonymous Feedback</div>
            <div>
              Athlete: {coach.feedback.athlete.avg.toFixed(1)} / 5
              <FeedbackTrend trend={coach.feedback.athlete.trend} />
            </div>
            <div>
              Parent: {coach.feedback.parent.avg.toFixed(1)} / 5
              <FeedbackTrend trend={coach.feedback.parent.trend} />
            </div>
            <div>
              Board: {coach.feedback.board.avg.toFixed(1)} / 5
              <FeedbackTrend trend={coach.feedback.board.trend} />
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Athlete Cohort Table */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 7 }}>
          Assigned Athlete Cohort (edit coach in table)
        </div>
        <table
          style={{
            width: "100%",
            background: "#232b31",
            borderRadius: 10,
            color: "#fff",
            fontSize: 15,
          }}
        >
          <thead>
            <tr style={{ color: GOLD }}>
              <th>Name</th>
              <th>Technical</th>
              <th>Tactical</th>
              <th>Physical</th>
              <th>Emotional</th>
              <th>Risk Flags</th>
              <th>Coach</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((a, idx) => (
              <tr key={idx}>
                <td>{a.name}</td>
                <td>{a.Technical}</td>
                <td>{a.Tactical}</td>
                <td>{a.Physical}</td>
                <td>{a.Emotional}</td>
                <td>
                  {a.riskFlags && a.riskFlags.length > 0
                    ? a.riskFlags.map((f, i) => (
                        <span key={i} style={{ color: "#ff2626", marginRight: 6 }}>
                          <FaExclamationTriangle /> {f}
                        </span>
                      ))
                    : "-"}
                </td>
                <td>
                  <select
                    value={a.coach}
                    onChange={e => handleAssignCoach(idx, e.target.value)}
                    style={{ borderRadius: 7, border: "1px solid #bbb", background: "#181A1B", color: "#fff" }}
                  >
                    {coaches.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cohortRisks.length > 0 && (
          <div style={{ marginTop: 12, color: "#ff2626", fontWeight: 700 }}>
            {cohortRisks.length} athletes in this coach’s group have risk flags.
          </div>
        )}
      </div>

      <button
        onClick={handleExport}
        style={{
          background: BLACK,
          color: GOLD,
          border: `2px solid ${GOLD}`,
          fontWeight: 700,
          padding: "10px 32px",
          borderRadius: 12,
          marginLeft: "auto",
          float: "right",
          marginTop: 14,
          fontSize: 17,
          cursor: "pointer",
        }}
      >
        Export Board PDF
      </button>

      {/* FOOTER */}
      <div
        style={{
          borderTop: `2px solid ${GOLD}`,
          paddingTop: 18,
          marginTop: 36,
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
