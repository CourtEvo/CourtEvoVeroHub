import React, { useState } from "react";
import {
  FaRunning, FaUserGraduate, FaMedal, FaBullseye, FaCrown, FaFlagCheckered, FaClipboardList, FaBasketballBall, FaChartLine, FaInfoCircle, FaEdit, FaTrash, FaPlus, FaTimes
} from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { AnimatePresence, motion } from "framer-motion";
import moment from "moment";
import "./AthleteCompetitionPathwayDashboard.css";

// --- LTAD Pathway Stages (Basketball, Male) ---
const LTAD_STAGES = [
  { key: "FUND", label: "FUNdamentals", color: "#FFD700", age: "6–9", description: "Basketball basics, motor skills, fun and coordination." },
  { key: "L2T", label: "Learn to Train", color: "#27ef7d", age: "9–12", description: "Skill acquisition, 1v1 basics, intro to roles and passing." },
  { key: "T2T", label: "Train to Train", color: "#00B4D8", age: "12–15", description: "Advanced skills, reading the game, off-ball movement, team defense." },
  { key: "T2C", label: "Train to Compete", color: "#e94057", age: "15–18", description: "Performance, physical prep, advanced tactics, national comp." },
  { key: "T2W", label: "Train to Win", color: "#A3E635", age: "18+", description: "Elite/pro level, leadership, international, NBA/Euroleague pathway." }
];

// --- Demo Athlete Data
const INITIAL_ATHLETES = [
  { id: 1, name: "Luka Perić", stage: "FUND", progress: 88, competition: "U9 Regional Festival", next: "Move to U10", status: "Active", height: 137, position: "Guard", stats: [{ x: "2025-Q1", y: 11 }, { x: "2025-Q2", y: 13 }, { x: "2025-Q3", y: 15 }] },
  { id: 2, name: "Marko Horvat", stage: "L2T", progress: 62, competition: "U12 City League", next: "Skills Eval", status: "Active", height: 144, position: "Wing", stats: [{ x: "2025-Q1", y: 17 }, { x: "2025-Q2", y: 19 }, { x: "2025-Q3", y: 22 }] },
  { id: 3, name: "Ante Novak", stage: "T2T", progress: 74, competition: "U15 County Cup", next: "Strength Test", status: "Development", height: 161, position: "Forward", stats: [{ x: "2025-Q1", y: 13 }, { x: "2025-Q2", y: 16 }, { x: "2025-Q3", y: 19 }] },
  { id: 4, name: "Dario Grgić", stage: "T2C", progress: 54, competition: "U17 Euro Qualifiers", next: "Scouting", status: "Active", height: 189, position: "Guard", stats: [{ x: "2025-Q1", y: 22 }, { x: "2025-Q2", y: 24 }, { x: "2025-Q3", y: 28 }] },
  { id: 5, name: "Ivan Jurić", stage: "T2W", progress: 96, competition: "Senior Pro League", next: "Pro Contract", status: "Elite", height: 201, position: "Center", stats: [{ x: "2025-Q1", y: 26 }, { x: "2025-Q2", y: 29 }, { x: "2025-Q3", y: 33 }] }
];

// --- Competitions
const COMPETITIONS = [
  { event: "U9 Regional Festival", date: "2025-07-14", stage: "FUND", type: "festival" },
  { event: "U12 City League", date: "2025-08-01", stage: "L2T", type: "league" },
  { event: "U15 County Cup", date: "2025-09-10", stage: "T2T", type: "cup" },
  { event: "U17 Euro Qualifiers", date: "2025-10-18", stage: "T2C", type: "international" },
  { event: "Senior Pro League", date: "2025-12-20", stage: "T2W", type: "league" }
];

function positionBadge(pos) {
  if (pos === "Guard") return <span style={{ background: "#FFD70033", color: "#FFD700", borderRadius: 7, padding: "2px 9px", marginLeft: 7, fontWeight: 800 }}>Guard</span>;
  if (pos === "Wing") return <span style={{ background: "#27ef7d33", color: "#27ef7d", borderRadius: 7, padding: "2px 9px", marginLeft: 7, fontWeight: 800 }}>Wing</span>;
  if (pos === "Forward") return <span style={{ background: "#00B4D833", color: "#00B4D8", borderRadius: 7, padding: "2px 9px", marginLeft: 7, fontWeight: 800 }}>Forward</span>;
  if (pos === "Center") return <span style={{ background: "#A3E63533", color: "#A3E635", borderRadius: 7, padding: "2px 9px", marginLeft: 7, fontWeight: 800 }}>Center</span>;
  return null;
}
function getStageColor(key) {
  const st = LTAD_STAGES.find(s => s.key === key);
  return st ? st.color : "#fff";
}

export default function AthleteCompetitionPathwayDashboard() {
  const [athletes, setAthletes] = useState(INITIAL_ATHLETES);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState({
    name: "",
    stage: "FUND",
    progress: "",
    competition: "",
    next: "",
    status: "Active",
    height: "",
    position: "Guard"
  });
  const [formErrors, setFormErrors] = useState({});

  // --- Analytics ---
  const stageBar = LTAD_STAGES.map(s => ({
    stage: s.label,
    count: athletes.filter(a => a.stage === s.key).length
  }));
  const progressLine = [
    {
      id: "Avg Progress",
      data: LTAD_STAGES.map(s => ({
        x: s.label,
        y:
          athletes.filter(a => a.stage === s.key).length > 0
            ? (
                athletes.filter(a => a.stage === s.key)
                  .reduce((sum, a) => sum + a.progress, 0) /
                athletes.filter(a => a.stage === s.key).length
              ).toFixed(1)
            : 0
      }))
    }
  ];
  const positionBar = [
    { position: "Guard", count: athletes.filter(a => a.position === "Guard").length },
    { position: "Wing", count: athletes.filter(a => a.position === "Wing").length },
    { position: "Forward", count: athletes.filter(a => a.position === "Forward").length },
    { position: "Center", count: athletes.filter(a => a.position === "Center").length }
  ];

  // --- Form helpers
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function validate(formData) {
    const errors = {};
    if (!formData.name) errors.name = "Name required";
    if (!formData.progress || isNaN(formData.progress) || formData.progress < 0 || formData.progress > 100) errors.progress = "0–100 only";
    if (!formData.height || isNaN(formData.height) || formData.height < 110 || formData.height > 230) errors.height = "110–230cm";
    if (!formData.competition) errors.competition = "Competition required";
    if (!formData.position) errors.position = "Choose position";
    if (!formData.stage) errors.stage = "Select stage";
    if (!formData.status) errors.status = "Select status";
    return errors;
  }
  function handleAddAthlete(e) {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    setAthletes(a =>
      [...a, {
        ...form,
        id: Date.now(),
        progress: Number(form.progress),
        height: Number(form.height),
        stats: [{ x: "2025-Q1", y: 0 }, { x: "2025-Q2", y: 0 }, { x: "2025-Q3", y: 0 }]
      }]
    );
    setForm({
      name: "",
      stage: "FUND",
      progress: "",
      competition: "",
      next: "",
      status: "Active",
      height: "",
      position: "Guard"
    });
    setShowAdd(false);
  }
  function handleEditAthlete(e) {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    setAthletes(a =>
      a.map(x =>
        x.id === showEdit
          ? {
              ...x,
              ...form,
              progress: Number(form.progress),
              height: Number(form.height)
            }
          : x
      )
    );
    setShowEdit(null);
  }
  function startEdit(a) {
    setForm({ ...a });
    setShowEdit(a.id);
  }
  function handleDelete(id) {
    if (window.confirm("Delete athlete?")) setAthletes(a => a.filter(x => x.id !== id));
  }

  return (
    <div style={{
      padding: 32,
      background: "linear-gradient(130deg,#232a2e 0%,#222b3a 100%)",
      borderRadius: 18,
      boxShadow: "0 8px 40px #FFD70044",
      minHeight: 1150,
      maxWidth: 1250,
      margin: "0 auto",
      color: "#fff"
    }}>
      <h2 style={{
        fontSize: 38, fontWeight: 900, color: "#FFD700", marginBottom: 18, letterSpacing: 1.5
      }}>
        <FaBasketballBall style={{ marginBottom: -9, marginRight: 10 }} />
        MALE ATHLETE & COMPETITION PATHWAY COCKPIT
      </h2>
      <div style={{
        color: "#FFD700cc",
        fontWeight: 600,
        fontSize: 19,
        marginBottom: 16
      }}>
        Add, edit, analyze all-male basketball pathway—elite, error-proof, modern. CourtEvo Vero™.
      </div>

      {/* --- Add Button --- */}
      <div style={{ textAlign: "right", marginBottom: 7 }}>
        <button
          style={{
            background: "#27ef7d",
            color: "#232a2e",
            border: "none",
            borderRadius: 8,
            fontWeight: 900,
            fontSize: 18,
            padding: "10px 32px",
            boxShadow: "0 2px 18px #27ef7d44",
            cursor: "pointer"
          }}
          onClick={() => setShowAdd(true)}
        >
          <FaPlus style={{ marginBottom: -4, marginRight: 10 }} />
          Add Athlete
        </button>
      </div>

      {/* --- Stage Navigation (Microinteractions) --- */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {LTAD_STAGES.map(stage => (
          <button
            key={stage.key}
            onClick={() => setSelectedStage(stage.key)}
            style={{
              background: selectedStage === stage.key ? stage.color : "#232a2e",
              color: selectedStage === stage.key ? "#232a2e" : stage.color,
              border: "none",
              borderRadius: 10,
              fontWeight: 900,
              fontSize: 15,
              padding: "7px 18px",
              boxShadow: selectedStage === stage.key ? "0 2px 16px #FFD70066" : "none",
              transition: "all 0.16s",
              cursor: "pointer"
            }}>
            {stage.label}
          </button>
        ))}
        {selectedStage && (
          <button
            style={{
              background: "#222b3a",
              color: "#FFD700",
              border: "none",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 15,
              padding: "7px 18px",
              marginLeft: 14,
              cursor: "pointer"
            }}
            onClick={() => setSelectedStage(null)}
          >
            <FaTimes style={{ marginBottom: -2, marginRight: 5 }} />
            Show All
          </button>
        )}
      </div>

      {/* --- Athlete Pathway Table --- */}
      <div style={{ marginBottom: 37 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 23, marginBottom: 8 }}>
          Athlete Pathway Table
        </h3>
        <table style={{ width: "100%", background: "#232d38", borderRadius: 12, boxShadow: "0 2px 8px #FFD70033", fontWeight: 700, fontSize: 15 }}>
          <thead>
            <tr style={{ color: "#FFD700", fontWeight: 900 }}>
              <th>Name</th>
              <th>Stage</th>
              <th>Progress</th>
              <th>Competition</th>
              <th>Position</th>
              <th>Height (cm)</th>
              <th>Next Step</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {athletes.filter(a => !selectedStage || a.stage === selectedStage).map((a, i) => (
              <tr key={a.id} style={{
                background: i % 2 ? "#FFD70010" : "#fff1",
                color: getStageColor(a.stage),
                fontWeight: 800
              }}>
                <td style={{ color: "#fff", fontWeight: 800 }}>{a.name}</td>
                <td style={{ color: getStageColor(a.stage), fontWeight: 800 }}>{LTAD_STAGES.find(s => s.key === a.stage).label}</td>
                <td>
                  <div style={{ background: "#fff2", borderRadius: 6, width: 110, height: 17, display: "inline-block", position: "relative" }}>
                    <div style={{
                      width: `${a.progress}%`,
                      height: "100%",
                      background: getStageColor(a.stage),
                      borderRadius: 6,
                      transition: "width 0.4s"
                    }} />
                    <span style={{
                      position: "absolute",
                      left: "47%",
                      top: "-2px",
                      color: "#232a2e",
                      fontWeight: 900,
                      fontSize: 13
                    }}>{a.progress}%</span>
                  </div>
                </td>
                <td>{a.competition}</td>
                <td>{positionBadge(a.position)}</td>
                <td style={{ color: "#FFD700", fontWeight: 900 }}>{a.height}</td>
                <td>{a.next}</td>
                <td>
                  {a.status === "Elite" && <span style={{ color: "#FFD700" }}><FaCrown /> {a.status}</span>}
                  {a.status === "Development" && <span style={{ color: "#27ef7d" }}><FaBullseye /> {a.status}</span>}
                  {a.status === "Active" && <span style={{ color: "#A3E635" }}><FaUserGraduate /> {a.status}</span>}
                </td>
                <td>
                  <button
                    onClick={() => setSelectedAthlete(a)}
                    style={{
                      background: "#FFD700",
                      color: "#232a2e",
                      border: "none",
                      borderRadius: 7,
                      fontWeight: 900,
                      padding: "2px 12px",
                      fontSize: 15,
                      cursor: "pointer",
                      marginRight: 4
                    }}>
                    <FaInfoCircle />
                  </button>
                  <button
                    onClick={() => startEdit(a)}
                    style={{
                      background: "#27ef7d",
                      color: "#232a2e",
                      border: "none",
                      borderRadius: 7,
                      fontWeight: 900,
                      padding: "2px 12px",
                      fontSize: 15,
                      cursor: "pointer",
                      marginRight: 4
                    }}>
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{
                      background: "#e94057",
                      color: "#fff",
                      border: "none",
                      borderRadius: 7,
                      fontWeight: 900,
                      padding: "2px 12px",
                      fontSize: 15,
                      cursor: "pointer"
                    }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Analytics --- */}
      <div style={{ display: "flex", gap: 23, marginBottom: 32 }}>
        <div style={{ flex: 1, background: "#222d38", borderRadius: 13, padding: 18 }}>
          <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 19, marginBottom: 5 }}>
            Stage Distribution
          </h3>
          <div style={{ height: 170 }}>
            <ResponsiveBar
              data={stageBar}
              keys={["count"]}
              indexBy="stage"
              margin={{ top: 30, right: 50, bottom: 60, left: 50 }}
              padding={0.55}
              layout="vertical"
              colors={({ index }) => LTAD_STAGES[index].color}
              borderRadius={4}
              borderWidth={2}
              borderColor="#232d38"
              labelSkipWidth={18}
              labelSkipHeight={14}
              labelTextColor="#FFD700"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 8,
                tickPadding: 8,
                tickRotation: 0,
                legend: "Stage",
                legendOffset: 38,
                legendPosition: "middle",
                legendTextColor: "#fff",
                tickValues: null,
                tickTextColor: "#fff"
              }}
              axisLeft={{
                tickSize: 8,
                tickPadding: 8,
                tickRotation: 0,
                legend: "Athletes",
                legendOffset: -38,
                legendPosition: "middle",
                legendTextColor: "#fff",
                tickValues: null,
                tickTextColor: "#fff"
              }}
              theme={{
                axis: {
                  ticks: { text: { fill: "#fff", fontWeight: 700 } },
                  legend: { text: { fill: "#fff", fontWeight: 900, fontSize: 16 } }
                }
              }}
              animate={true}
              motionConfig="wobbly"
              tooltip={({ id, value, color, indexValue }) => (
                <div style={{ background: "#232a2e", color: "#FFD700", padding: "7px 15px", borderRadius: 7, fontWeight: 800, fontSize: 15, border: "1.5px solid #FFD700" }}>
                  <b>{indexValue}:</b> {value} athletes
                </div>
              )}
            />
          </div>
        </div>
        <div style={{ flex: 1, background: "#222d38", borderRadius: 13, padding: 18 }}>
          <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 19, marginBottom: 5 }}>
            Average Progress by Stage
          </h3>
          <div style={{ height: 170 }}>
            <ResponsiveLine
              data={progressLine}
              margin={{ top: 30, right: 50, bottom: 60, left: 50 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: 100, stacked: false, reverse: false }}
              axisLeft={{
                tickSize: 7, tickPadding: 7, tickRotation: 0,
                legend: "Progress (%)", legendOffset: -38, legendPosition: "middle",
                legendTextColor: "#fff", tickTextColor: "#fff"
              }}
              axisBottom={{
                tickSize: 7, tickPadding: 7, tickRotation: 0,
                legend: "Stage", legendOffset: 38, legendPosition: "middle",
                legendTextColor: "#fff", tickTextColor: "#fff"
              }}
              theme={{
                axis: {
                  ticks: { text: { fill: "#fff", fontWeight: 700 } },
                  legend: { text: { fill: "#fff", fontWeight: 900, fontSize: 16 } }
                }
              }}
              colors={["#FFD700"]}
              pointSize={10}
              pointBorderWidth={3}
              pointBorderColor={{ from: "serieColor" }}
              enableGridX={false}
              enableGridY={true}
              enablePoints={true}
              useMesh={true}
              tooltip={({ point }) => (
                <div style={{ background: "#232a2e", color: "#FFD700", padding: "7px 15px", borderRadius: 7, fontWeight: 800, fontSize: 15, border: "1.5px solid #FFD700" }}>
                  <b>{point.data.x}:</b> {point.data.y}%
                </div>
              )}
            />
          </div>
        </div>
        <div style={{ flex: 1, background: "#222d38", borderRadius: 13, padding: 18 }}>
          <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 19, marginBottom: 5 }}>
            Position Distribution
          </h3>
          <div style={{ height: 170 }}>
            <ResponsiveBar
              data={positionBar}
              keys={["count"]}
              indexBy="position"
              margin={{ top: 30, right: 30, bottom: 45, left: 50 }}
              padding={0.55}
              layout="vertical"
              colors={({ index }) => ["#FFD700", "#27ef7d", "#00B4D8", "#A3E635"][index]}
              borderRadius={4}
              borderWidth={2}
              borderColor="#232d38"
              labelSkipWidth={18}
              labelSkipHeight={14}
              labelTextColor="#FFD700"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 8,
                tickPadding: 8,
                tickRotation: 0,
                legend: "Position",
                legendOffset: 28,
                legendPosition: "middle",
                legendTextColor: "#fff",
                tickValues: null,
                tickTextColor: "#fff"
              }}
              axisLeft={{
                tickSize: 8,
                tickPadding: 8,
                tickRotation: 0,
                legend: "Athletes",
                legendOffset: -38,
                legendPosition: "middle",
                legendTextColor: "#fff",
                tickValues: null,
                tickTextColor: "#fff"
              }}
              theme={{
                axis: {
                  ticks: { text: { fill: "#fff", fontWeight: 700 } },
                  legend: { text: { fill: "#fff", fontWeight: 900, fontSize: 16 } }
                }
              }}
              animate={true}
              motionConfig="wobbly"
              tooltip={({ id, value, color, indexValue }) => (
                <div style={{ background: "#232a2e", color: "#FFD700", padding: "7px 15px", borderRadius: 7, fontWeight: 800, fontSize: 15, border: "1.5px solid #FFD700" }}>
                  <b>{indexValue}:</b> {value} athletes
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* --- Competition Calendar --- */}
      <div style={{ marginBottom: 30, background: "#222d38", borderRadius: 13, padding: 18 }}>
        <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 21, marginBottom: 7 }}>
          Competition Calendar (Basketball Only)
        </h3>
        <div>
          {COMPETITIONS.map((c, i) => (
            <div key={c.event} style={{
              display: "flex", alignItems: "center", marginBottom: 8, fontWeight: 800, color: LTAD_STAGES.find(s => s.key === c.stage).color
            }}>
              <FaFlagCheckered style={{ marginRight: 8, fontSize: 17 }} />
              <span style={{ color: "#FFD700", marginRight: 13 }}>{moment(c.date).format("YYYY-MM-DD")}</span>
              <span style={{ fontWeight: 900 }}>{c.event}</span>
              <span style={{ marginLeft: 18, color: "#fff", fontWeight: 600 }}>{LTAD_STAGES.find(s => s.key === c.stage).label}</span>
              <span style={{
                marginLeft: 22,
                background: "#FFD70022",
                color: "#FFD700",
                borderRadius: 7,
                padding: "2px 9px",
                fontSize: 14,
                fontWeight: 900
              }}>{c.type.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Athlete Drilldown Modal --- */}
      <AnimatePresence>
        {selectedAthlete && (
          <motion.div
            initial={{ opacity: 0, y: 90 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 90 }}
            style={{
              position: "fixed",
              left: 0, top: 0, right: 0, bottom: 0,
              zIndex: 99,
              background: "rgba(30,32,40,0.98)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <div style={{
              background: "#222d38",
              borderRadius: 16,
              padding: 36,
              minWidth: 400,
              boxShadow: "0 8px 32px #FFD70033",
              color: "#FFD700",
              maxWidth: 520
            }}>
              <h3 style={{ fontWeight: 900, fontSize: 26, marginBottom: 13 }}>
                <FaMedal style={{ marginRight: 8 }} />
                {selectedAthlete.name}
              </h3>
              <div style={{ fontWeight: 800, marginBottom: 7 }}>
                <FaClipboardList style={{ marginRight: 6 }} />
                Stage: <span style={{ color: getStageColor(selectedAthlete.stage) }}>{LTAD_STAGES.find(s => s.key === selectedAthlete.stage).label}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Progress:</b> {selectedAthlete.progress}%
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Competition:</b> {selectedAthlete.competition}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Next Step:</b> {selectedAthlete.next}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Status:</b> {selectedAthlete.status}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Position:</b> {positionBadge(selectedAthlete.position)}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Height:</b> {selectedAthlete.height} cm
              </div>
              {/* Individual Athlete Trendline */}
              <div style={{ marginTop: 25, background: "#232a2e", borderRadius: 12, padding: 13 }}>
                <h4 style={{ color: "#27ef7d", fontWeight: 900, fontSize: 16, marginBottom: 8 }}>
                  <FaChartLine style={{ marginRight: 6 }} /> Performance Trend (Points/Game)
                </h4>
                <div style={{ height: 110 }}>
                  <ResponsiveLine
                    data={[{ id: selectedAthlete.name, data: selectedAthlete.stats }]}
                    margin={{ top: 20, right: 35, bottom: 35, left: 40 }}
                    xScale={{ type: "point" }}
                    yScale={{ type: "linear", min: 0, max: 'auto', stacked: false, reverse: false }}
                    axisLeft={null}
                    axisBottom={{ tickSize: 6, tickPadding: 6, legend: "Quarter", legendOffset: 28, legendPosition: "middle", legendTextColor: "#fff", tickTextColor: "#fff" }}
                    theme={{
                      axis: {
                        ticks: { text: { fill: "#fff", fontWeight: 700 } },
                        legend: { text: { fill: "#fff", fontWeight: 900, fontSize: 15 } }
                      }
                    }}
                    colors={["#FFD700"]}
                    pointSize={10}
                    pointBorderWidth={3}
                    pointBorderColor={{ from: "serieColor" }}
                    enableGridX={false}
                    enableGridY={true}
                    enablePoints={true}
                    useMesh={true}
                  />
                </div>
              </div>
              <button
                onClick={() => setSelectedAthlete(null)}
                style={{
                  marginTop: 24,
                  background: "#FFD700",
                  color: "#222",
                  border: "none",
                  borderRadius: 7,
                  fontWeight: 800,
                  fontSize: 17,
                  padding: "8px 22px",
                  cursor: "pointer"
                }}>Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Add/Edit Modal --- */}
      <AnimatePresence>
        {(showAdd || showEdit) && (
          <motion.div
            initial={{ opacity: 0, y: 90 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 90 }}
            style={{
              position: "fixed",
              left: 0, top: 0, right: 0, bottom: 0,
              zIndex: 200,
              background: "rgba(30,32,40,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <form
              onSubmit={showAdd ? handleAddAthlete : handleEditAthlete}
              style={{
                background: "#222d38",
                borderRadius: 18,
                padding: 34,
                boxShadow: "0 8px 32px #FFD70033",
                color: "#FFD700",
                minWidth: 390,
                maxWidth: 470
              }}
            >
              <h3 style={{ fontWeight: 900, fontSize: 23, marginBottom: 15 }}>
                {showAdd ? "Add Athlete" : "Edit Athlete"}
              </h3>
              <div style={{ marginBottom: 10 }}>
                <label>Name<br />
                  <input name="name" value={form.name} onChange={handleFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }} />
                  {formErrors.name && <span style={{ color: "#e94057", fontWeight: 800 }}>{formErrors.name}</span>}
                </label>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Stage<br />
                  <select name="stage" value={form.stage} onChange={handleFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }}>
                    {LTAD_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Progress (%)<br />
                  <input name="progress" type="number" min="0" max="100" value={form.progress} onChange={handleFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }} />
                  {formErrors.progress && <span style={{ color: "#e94057", fontWeight: 800 }}>{formErrors.progress}</span>}
                </label>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Competition<br />
                  <input name="competition" value={form.competition} onChange={handleFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }} />
                  {formErrors.competition && <span style={{ color: "#e94057", fontWeight: 800 }}>{formErrors.competition}</span>}
                </label>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Next Step<br />
                  <input name="next" value={form.next} onChange={handleFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }} />
                </label>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Status<br />
                  <select name="status" value={form.status} onChange={handleFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }}>
                    <option value="Active">Active</option>
                    <option value="Development">Development</option>
                    <option value="Elite">Elite</option>
                  </select>
                  {formErrors.status && <span style={{ color: "#e94057", fontWeight: 800 }}>{formErrors.status}</span>}
                </label>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>Height (cm)<br />
                  <input name="height" type="number" min="110" max="230" value={form.height} onChange={handleFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }} />
                  {formErrors.height && <span style={{ color: "#e94057", fontWeight: 800 }}>{formErrors.height}</span>}
                </label>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label>Position<br />
                  <select name="position" value={form.position} onChange={handleFormChange} style={{ width: "100%", borderRadius: 7, padding: 7, fontSize: 16 }}>
                    <option value="Guard">Guard</option>
                    <option value="Wing">Wing</option>
                    <option value="Forward">Forward</option>
                    <option value="Center">Center</option>
                  </select>
                  {formErrors.position && <span style={{ color: "#e94057", fontWeight: 800 }}>{formErrors.position}</span>}
                </label>
              </div>
              <div style={{ display: "flex", gap: 15, marginTop: 5 }}>
                <button type="submit" style={{
                  background: "#FFD700",
                  color: "#232a2e",
                  fontWeight: 900,
                  fontSize: 17,
                  border: "none",
                  borderRadius: 7,
                  padding: "9px 22px",
                  cursor: "pointer"
                }}>{showAdd ? "Add Athlete" : "Save Changes"}</button>
                <button type="button" style={{
                  background: "#e94057",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 17,
                  border: "none",
                  borderRadius: 7,
                  padding: "9px 22px",
                  cursor: "pointer"
                }} onClick={() => { setShowAdd(false); setShowEdit(null); }}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ color: "#FFD70099", fontSize: 14, marginTop: 28, textAlign: "center" }}>
        CourtEvo Vero™ — Add, edit, analyze your elite male basketball athlete pathway cockpit.
      </div>
    </div>
  );
}
